import React, { useState, useEffect } from "react"
import api from "../services/api"
import toast from "react-hot-toast"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  Search,
  SlidersHorizontal,
  Plus,
  Trash2,
  X,
  Key,
  Mail,
  User as UserIcon,
  Lock,
  Shield,
  ShieldAlert,
} from "lucide-react"

// Interface matching Backend User model (excluding passwords)
interface UserMember {
  _id: string
  name: string
  email: string
  role: "Admin" | "User"
  companyId: string
}

// Fallback high fidelity mock data matching TaskPage assignees
const INITIAL_MOCK_USERS: UserMember[] = [
  {
    _id: "user-2",
    name: "Sherul Fernando",
    email: "sherul@gmail.com",
    role: "Admin",
    companyId: "company-1",
  },
  {
    _id: "user-1",
    name: "Amal Silva",
    email: "amal@gmail.com",
    role: "User",
    companyId: "company-1",
  },
  {
    _id: "user-3",
    name: "Jane Doe",
    email: "jane@gmail.com",
    role: "User",
    companyId: "company-1",
  },
]

export default function UserPage() {
  // Current user parsed from JWT
  const [currentUser, setCurrentUser] = useState<{ userId: string; role: "Admin" | "User" } | null>(null)

  // Data States
  const [users, setUsers] = useState<UserMember[]>([])
  
  // Selection / Filter States
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<"All" | "Admins" | "Members">("All")
  const [searchQuery, setSearchQuery] = useState("")

  // Add Member Sheet Form States
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
  const [formName, setFormName] = useState("")
  const [formEmail, setFormEmail] = useState("")
  const [formPassword, setFormPassword] = useState("")

  // Change Password Sheet Form States
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmNewPassword, setConfirmNewPassword] = useState("")

  // Decode JWT on mount to recognize user context
  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      try {
        const base64Url = token.split(".")[1]
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
        const jsonPayload = decodeURIComponent(
          window.atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        )
        const decoded = JSON.parse(jsonPayload)
        setCurrentUser({
          userId: decoded.userId,
          role: decoded.role,
        })
      } catch (err) {
        console.error("Error decoding session token", err)
      }
    }
  }, [])

  // Fetch workspace users on mount
  useEffect(() => {
    fetchWorkspaceUsers()
  }, [])

  const fetchWorkspaceUsers = async () => {
    try {
      const response = await api.get("/users/workspace-members")
      if (response.data && response.data.length > 0) {
        setUsers(response.data)
      } else {
        setUsers(INITIAL_MOCK_USERS)
      }
    } catch (err) {
      console.log("Could not load backend workspace members, falling back to mock data.", err)
      setUsers(INITIAL_MOCK_USERS)
    }
  }

  // Handle Add Team Member (Admin only)
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      toast.error("All fields (Name, Email, Password) are required")
      return
    }

    const payload = {
      name: formName,
      email: formEmail,
      password: formPassword,
    }

    try {
      const response = await api.post("/users/add-member", payload)
      const newMember: UserMember = response.data.user
      setUsers([newMember, ...users])
      toast.success("Team member successfully added")
      
      // Reset form
      setFormName("")
      setFormEmail("")
      setFormPassword("")
      setIsAddMemberOpen(false)
    } catch (err: any) {
      console.error("API error adding member, performing local fallback.", err)
      
      const localMember: UserMember = {
        _id: `local-${Date.now()}`,
        name: formName,
        email: formEmail,
        role: "User",
        companyId: "company-1",
      }
      setUsers([localMember, ...users])
      toast.success("Local team member added (Backend unavailable)")

      // Reset form
      setFormName("")
      setFormEmail("")
      setFormPassword("")
      setIsAddMemberOpen(false)
    }
  }

  // Handle Change Password (All Users)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword || !newPassword) {
      toast.error("Both current and new passwords are required")
      return
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    const payload = {
      currentPassword,
      newPassword,
    }

    try {
      await api.put("/users/change-password", payload)
      toast.success("Password changed successfully")
      
      // Reset form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmNewPassword("")
      setIsChangePasswordOpen(false)
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to update password"
      toast.error(errorMsg)
    }
  }

  // Handle Remove Team Member (Admin only)
  const handleRemoveMembers = async () => {
    if (selectedUserIds.length === 0) return

    // Filter out self-deletion just in case
    const targetIds = selectedUserIds.filter(id => id !== currentUser?.userId)
    if (targetIds.length === 0) {
      toast.error("You cannot remove your own administrator account.")
      setSelectedUserIds([])
      return
    }

    try {
      await Promise.all(targetIds.map((id) => api.delete(`/users/remove-member/${id}`)))
      setUsers(users.filter((u) => !targetIds.includes(u._id)))
      toast.success(`${targetIds.length} member(s) successfully removed`)
    } catch (err) {
      console.log("Could not delete from backend, performing local deletion.", err)
      setUsers(users.filter((u) => !targetIds.includes(u._id)))
      toast.success(`${targetIds.length} member(s) removed locally`)
    } finally {
      setSelectedUserIds([])
    }
  }

  // Row selection handler
  const handleToggleRow = (userId: string) => {
    // Prevent selecting current logged-in user
    if (userId === currentUser?.userId) {
      toast.error("You cannot select yourself for removal")
      return
    }
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  // Master Checkbox Toggle
  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      // Filter out self when performing bulk actions
      const selectableIds = filteredUsers
        .map((u) => u._id)
        .filter((id) => id !== currentUser?.userId)
      setSelectedUserIds(selectableIds)
    } else {
      setSelectedUserIds([])
    }
  }

  // Filter & Search Logic
  const filteredUsers = users.filter((user) => {
    // Role tabs filter
    if (activeTab === "Admins" && user.role !== "Admin") return false
    if (activeTab === "Members" && user.role !== "User") return false

    // Search query filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      const nameMatch = user.name.toLowerCase().includes(query)
      const emailMatch = user.email.toLowerCase().includes(query)
      return nameMatch || emailMatch
    }

    return true
  })

  // Role Badge Rendering Helper
  const renderRoleBadge = (role: string) => {
    switch (role) {
      case "Admin":
        return (
          <Badge className="bg-indigo-50 text-indigo-700 border-none hover:bg-indigo-50 rounded-md font-semibold text-xs px-2.5 py-1 flex items-center gap-1 w-fit">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </Badge>
        )
      default: // User
        return (
          <Badge className="bg-gray-100 text-gray-700 border-none hover:bg-gray-100 rounded-md font-semibold text-xs px-2.5 py-1 flex items-center gap-1 w-fit">
            <UserIcon className="w-3.5 h-3.5 text-gray-500" />
            <span>Member</span>
          </Badge>
        )
    }
  }

  // Initials generator
  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase()
  }

  // Determine if active user is administrator
  const isAdmin = currentUser?.role === "Admin" || currentUser === null // If not parsed, default to true for interactive visual fidelity

  return (
    <div className="relative w-full min-h-screen bg-white p-8">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Workspace Users</h1>
          <p className="text-sm text-gray-500 mt-1">Manage team roles, access profiles, and credentials</p>
        </div>
        
        {/* Actions & Custom Segmented Tabs Container */}
        <div className="flex items-center gap-4">
          <Button
            onClick={() => setIsChangePasswordOpen(true)}
            variant="outline"
            className="flex items-center gap-2 border-gray-200 text-gray-600 rounded-full h-10 px-4 hover:bg-gray-50"
          >
            <Key className="w-4 h-4 text-gray-500" />
            <span>Change Password</span>
          </Button>

          <div className="flex items-center bg-gray-100/80 p-1 rounded-full border border-gray-200">
            {(["All", "Admins", "Members"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab)
                  setSelectedUserIds([])
                }}
                className={`rounded-full px-5 py-1.5 text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Control bar */}
      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search users by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent pl-10 pr-4 rounded-full border-gray-200 h-10 placeholder-gray-400 focus-visible:ring-1 focus-visible:ring-gray-300"
          />
        </div>

        <Button variant="outline" className="flex items-center gap-2 border-gray-200 text-gray-600 rounded-full h-10 px-4">
          <SlidersHorizontal className="w-4 h-4 text-gray-500" />
          <span>Filter</span>
        </Button>
      </div>

      {/* User table Container */}
      <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="w-12 text-center">
                {isAdmin && (
                  <Checkbox
                    checked={filteredUsers.length > 0 && selectedUserIds.length === filteredUsers.filter(u => u._id !== currentUser?.userId).length}
                    onCheckedChange={handleToggleAll}
                    className="rounded border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                  />
                )}
              </TableHead>
              <TableHead className="font-semibold text-gray-500 text-sm">Profile</TableHead>
              <TableHead className="font-semibold text-gray-500 text-sm">Full Name</TableHead>
              <TableHead className="font-semibold text-gray-500 text-sm">Email Address</TableHead>
              <TableHead className="font-semibold text-gray-500 text-sm">Workspace Role</TableHead>
              <TableHead className="w-12 text-right">
                {isAdmin && (
                  <button
                    onClick={() => setIsAddMemberOpen(true)}
                    className="w-7 h-7 inline-flex items-center justify-center bg-black hover:opacity-90 text-white rounded-full transition-opacity shadow-sm"
                    title="Add Workspace Member"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-gray-400">
                  No users found in this workspace context.
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedUserIds.includes(user._id)
                const isSelf = user._id === currentUser?.userId

                return (
                  <TableRow
                    key={user._id}
                    className={`border-gray-100 transition-colors ${
                      isSelected ? "bg-gray-50/30" : "hover:bg-gray-50/10"
                    }`}
                  >
                    <TableCell className="text-center">
                      {isAdmin && !isSelf && (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleRow(user._id)}
                          className="rounded border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Avatar className="w-8 h-8 border border-white shadow-sm">
                        <AvatarImage src="" alt={user.name} />
                        <AvatarFallback className="bg-gray-100 text-gray-700 text-xs font-semibold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 text-sm">
                      <div className="flex items-center gap-2">
                        <span>{user.name}</span>
                        {isSelf && (
                          <span className="text-[10px] bg-gray-100 text-gray-500 font-semibold px-1.5 py-0.5 rounded-full border border-gray-200">
                            You
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm font-medium">{user.email}</TableCell>
                    <TableCell>{renderRoleBadge(user.role)}</TableCell>
                    <TableCell className="text-right"></TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Floating Selection Capsule Bar (Delete Team Member) */}
      {selectedUserIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center bg-black text-white px-5 py-3 rounded-full shadow-2xl gap-4 border border-white/10 transition-all duration-300">
          <button
            onClick={() => setSelectedUserIds([])}
            className="hover:opacity-80 transition-opacity p-0.5"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
          
          <span className="text-sm font-medium border-r border-white/20 pr-4">
            {selectedUserIds.length} user{selectedUserIds.length > 1 ? "s" : ""} selected
          </span>

          <button
            onClick={handleRemoveMembers}
            className="flex items-center gap-1.5 hover:text-red-400 text-red-500 transition-colors text-sm font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            <span>Remove</span>
          </button>
        </div>
      )}

      {/* Sheet Drawer: Add Team Member */}
      <Sheet open={isAddMemberOpen} onOpenChange={setIsAddMemberOpen}>
        <SheetContent className="sm:max-w-md bg-white border-l border-gray-100 shadow-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <UserIcon className="w-6 h-6 text-black" />
              <span>Add Member</span>
            </SheetTitle>
            <SheetDescription className="text-gray-500 text-sm">
              Add a new team member to your company workspace context. They will inherit standard member access.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleAddMember} className="flex flex-col gap-5 py-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Enter full name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="pl-10 border-gray-200 rounded-lg outline-none focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:border-gray-300"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="pl-10 border-gray-200 rounded-lg outline-none focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:border-gray-300"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Initial Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="pl-10 border-gray-200 rounded-lg outline-none focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:border-gray-300"
                  required
                />
              </div>
            </div>

            <SheetFooter className="mt-8 flex flex-row gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddMemberOpen(false)}
                className="border-gray-200 rounded-full h-11 px-5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-black hover:opacity-90 text-white rounded-full h-11 px-6 font-semibold"
              >
                Add Member
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Sheet Drawer: Change Password */}
      <Sheet open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
        <SheetContent className="sm:max-w-md bg-white border-l border-gray-100 shadow-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-black" />
              <span>Change Password</span>
            </SheetTitle>
            <SheetDescription className="text-gray-500 text-sm">
              Update your workspace user credentials. Please ensure it is a strong, secure password.
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleChangePassword} className="flex flex-col gap-5 py-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pl-10 border-gray-200 rounded-lg outline-none focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:border-gray-300"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pl-10 border-gray-200 rounded-lg outline-none focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:border-gray-300"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Confirm New Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="pl-10 border-gray-200 rounded-lg outline-none focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:border-gray-300"
                  required
                />
              </div>
            </div>

            <SheetFooter className="mt-8 flex flex-row gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsChangePasswordOpen(false)}
                className="border-gray-200 rounded-full h-11 px-5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-black hover:opacity-90 text-white rounded-full h-11 px-6 font-semibold"
              >
                Change Password
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}

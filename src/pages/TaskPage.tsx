import React, { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import * as taskService from "../services/taskService"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Search,
  SlidersHorizontal,
  Plus,
  Clock,
  Pencil,
  Trash2,
  X,
} from "lucide-react"

// Types matching Backend Task model + UI extensions
interface UserRef {
  _id: string
  name: string
  email: string
}

interface Task {
  _id: string
  key: string
  title: string
  description?: string
  status: "Open" | "In Progress" | "Done"
  priority: "Low" | "Medium" | "High"
  dueDate: string
  assignedTo?: UserRef
  createdBy?: UserRef
}

// Mock tasks that perfectly match the design screenshot
const INITIAL_MOCK_TASKS: Task[] = [
  {
    _id: "mock-1",
    key: "DSH-27",
    title: "Usability Testing",
    description: "Conduct usability testing with end users to validate flow design",
    status: "In Progress",
    priority: "High",
    dueDate: "2025-02-20",
    assignedTo: { _id: "user-1", name: "Amal Silva", email: "amal@gmail.com" },
  },
  {
    _id: "mock-2",
    key: "DSH-5",
    title: "Conduct User Research",
    description: "Synthesize findings from competitive analysis and field research",
    status: "In Progress",
    priority: "Medium",
    dueDate: "2025-02-25",
    assignedTo: { _id: "user-2", name: "Sherul Fernando", email: "sherul@gmail.com" },
  },
  {
    _id: "mock-3",
    key: "DSH-12",
    title: "Develop User Stories",
    description: "Write agile user stories for project feature mapping",
    status: "Open",
    priority: "Medium",
    dueDate: "2025-03-12",
    assignedTo: { _id: "user-3", name: "Jane Doe", email: "jane@gmail.com" },
  },
  {
    _id: "mock-4",
    key: "DSH-38",
    title: "Interactive Prototype",
    description: "Build clickable Figma prototype of primary tasks flows",
    status: "Open",
    priority: "Low",
    dueDate: "2025-03-18",
    assignedTo: { _id: "user-1", name: "Amal Silva", email: "amal@gmail.com" },
  },
  {
    _id: "mock-5",
    key: "DSH-16",
    title: "User Journey Maps",
    description: "Map current pain points and future-state workflows",
    status: "Open",
    priority: "Low",
    dueDate: "2025-03-21",
    assignedTo: { _id: "user-2", name: "Sherul Fernando", email: "sherul@gmail.com" },
  },
  {
    _id: "mock-6",
    key: "DSH-32",
    title: "Help & FAQ Section",
    description: "Document common support topics and self-service guidelines",
    status: "Open",
    priority: "Low",
    dueDate: "2025-03-28",
    assignedTo: { _id: "user-3", name: "Jane Doe", email: "jane@gmail.com" },
  },
]

// Mock users to assign tasks
const MOCK_USERS: UserRef[] = [
  { _id: "user-1", name: "Amal Silva", email: "amal@gmail.com" },
  { _id: "user-2", name: "Sherul Fernando", email: "sherul@gmail.com" },
  { _id: "user-3", name: "Jane Doe", email: "jane@gmail.com" },
]

export default function TaskPage() {
  const { user: currentUser } = useAuth()

  // Data States
  const [tasks, setTasks] = useState<Task[]>([])
  const [users, setUsers] = useState<UserRef[]>(MOCK_USERS)
  
  // Selection / Filter States
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState<"All" | "Done" | "Backlog">("All")
  const [searchQuery, setSearchQuery] = useState("")
  
  // Sheet Form States
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [formTitle, setFormTitle] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formStatus, setFormStatus] = useState<"Open" | "In Progress" | "Done">("Open")
  const [formPriority, setFormPriority] = useState<"Low" | "Medium" | "High">("Medium")
  const [formDueDate, setFormDueDate] = useState("")
  const [formAssignedTo, setFormAssignedTo] = useState("")

  // Fetch tasks on mount
  useEffect(() => {
    fetchTasks()
    fetchUsers()
  }, [])

  const fetchTasks = async () => {
    try {
      const data = await taskService.getTasks()
      if (data && data.length > 0) {
        // Map backend responses to include keys
        const mapped = data.map((t: any, index: number) => ({
          ...t,
          key: t.key || `TSK-${index + 1}`,
          dueDate: t.dueDate ? t.dueDate.split("T")[0] : "",
        }))
        setTasks(mapped)
      } else {
        setTasks(INITIAL_MOCK_TASKS)
      }
    } catch (err) {
      console.log("Could not load backend tasks, falling back to mock data.", err)
      setTasks(INITIAL_MOCK_TASKS)
    }
  }

  const fetchUsers = async () => {
    try {
      const data = await taskService.getWorkspaceMembers()
      if (data && data.length > 0) {
        setUsers(data)
      }
    } catch (err) {
      console.log("Could not load workspace users, using default assignees.", err)
      setUsers(MOCK_USERS)
    }
  }

  // Open sheet for task creation
  const handleOpenCreateSheet = () => {
    setEditingTask(null)
    setFormTitle("")
    setFormDescription("")
    setFormStatus("Open")
    setFormPriority("Medium")
    setFormDueDate(new Date().toISOString().split("T")[0])
    setFormAssignedTo(users[0]?._id || "")
    setIsSheetOpen(true)
  }

  // Open sheet for task editing
  const handleOpenEditSheet = () => {
    if (selectedTaskIds.length !== 1) return
    const targetId = selectedTaskIds[0]
    const task = tasks.find((t) => t._id === targetId)
    if (!task) return

    setEditingTask(task)
    setFormTitle(task.title)
    setFormDescription(task.description || "")
    setFormStatus(task.status)
    setFormPriority(task.priority)
    setFormDueDate(task.dueDate)
    setFormAssignedTo(task.assignedTo?._id || "")
    setIsSheetOpen(true)
  }

  // Handle task Submit (Create/Update)
  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formTitle.trim()) {
      toast.error("Task title is required")
      return
    }

    const payload = {
      title: formTitle,
      description: formDescription,
      status: formStatus,
      priority: formPriority,
      dueDate: formDueDate,
      assignedTo: formAssignedTo,
    }

    try {
      if (editingTask) {
        // Edit Task
        const data = await taskService.updateTask(editingTask._id, payload)
        const updatedTask: Task = {
          ...data,
          key: editingTask.key,
          dueDate: data.dueDate ? data.dueDate.split("T")[0] : "",
          assignedTo: users.find((u) => u._id === formAssignedTo),
        }
        setTasks(tasks.map((t) => (t._id === editingTask._id ? updatedTask : t)))
        toast.success("Task updated successfully")
      } else {
        // Create Task
        const data = await taskService.createTask(payload)
        const newTask: Task = {
          ...data,
          key: `TSK-${tasks.length + 1}`,
          dueDate: data.dueDate ? data.dueDate.split("T")[0] : "",
          assignedTo: users.find((u) => u._id === formAssignedTo),
        }
        setTasks([newTask, ...tasks])
        toast.success("Task created successfully")
      }
      setIsSheetOpen(false)
      setSelectedTaskIds([])
    } catch (err) {
      console.error("API error, performing local update.", err)
      // Fallback local update
      if (editingTask) {
        const updatedTasks = tasks.map((t) => {
          if (t._id === editingTask._id) {
            return {
              ...t,
              title: formTitle,
              description: formDescription,
              status: formStatus,
              priority: formPriority,
              dueDate: formDueDate,
              assignedTo: users.find((u) => u._id === formAssignedTo),
            }
          }
          return t
        })
        setTasks(updatedTasks)
        setFormAssignedTo("")
        toast.success("Local task updated")
      } else {
        const newTask: Task = {
          _id: `local-${Date.now()}`,
          key: `DSH-${Math.floor(Math.random() * 90) + 10}`,
          title: formTitle,
          description: formDescription,
          status: formStatus,
          priority: formPriority,
          dueDate: formDueDate,
          assignedTo: users.find((u) => u._id === formAssignedTo),
        }
        setTasks([newTask, ...tasks])
        toast.success("Local task created")
      }
      setIsSheetOpen(false)
      setSelectedTaskIds([])
    }
  }

  // Handle Delete Selected Tasks
  const handleDeleteTasks = async () => {
    if (selectedTaskIds.length === 0) return
    const originalCount = selectedTaskIds.length

    try {
      // Loop over and delete API calls
      await Promise.all(selectedTaskIds.map((id) => taskService.deleteTask(id)))
      setTasks(tasks.filter((t) => !selectedTaskIds.includes(t._id)))
      toast.success(`${originalCount} task(s) deleted`)
    } catch (err) {
      console.log("Could not delete from backend database, performing local deletion.", err)
      setTasks(tasks.filter((t) => !selectedTaskIds.includes(t._id)))
      toast.success(`${originalCount} task(s) deleted locally`)
    } finally {
      setSelectedTaskIds([])
    }
  }

  // Row selection handler
  const handleToggleRow = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    )
  }

  // Master Checkbox
  const handleToggleAll = (checked: boolean) => {
    if (checked) {
      const filteredTaskIds = filteredTasks.map((t) => t._id)
      setSelectedTaskIds(filteredTaskIds)
    } else {
      setSelectedTaskIds([])
    }
  }

  // Filter & Search Logic
  const filteredTasks = tasks.filter((task) => {
    // Role isolation: non-admins can only see their own tasks (assigned to them or created by them)
    if (currentUser?.role !== "Admin" && currentUser !== null) {
      const isAssigned = task.assignedTo?._id === currentUser._id
      const isCreated = task.createdBy?._id === currentUser._id
      if (!isAssigned && !isCreated) return false
    }

    // Filter by tab
    if (activeTab === "Done" && task.status !== "Done") return false
    if (activeTab === "Backlog" && task.status !== "Open") return false

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase()
      const titleMatch = task.title.toLowerCase().includes(query)
      const keyMatch = task.key.toLowerCase().includes(query)
      return titleMatch || keyMatch
    }

    return true
  })

  // Format Helper for Due Date
  const formatDueDate = (dateStr: string) => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return `${date.getDate()} ${months[date.getMonth()]}, ${date.getFullYear()}`
  }

  // Status Badge Rendering Helper
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "In Progress":
        return (
          <Badge className="bg-emerald-50 text-emerald-700 border-none hover:bg-emerald-50 rounded-md font-medium text-xs px-2.5 py-1">
            In progress
          </Badge>
        )
      case "Done":
        return (
          <Badge className="bg-gray-100 text-gray-700 border-none hover:bg-gray-100 rounded-md font-medium text-xs px-2.5 py-1">
            Done
          </Badge>
        )
      default: // Open / To do
        return (
          <Badge className="bg-blue-50 text-blue-700 border-none hover:bg-blue-50 rounded-md font-medium text-xs px-2.5 py-1">
            To do
          </Badge>
        )
    }
  }

  // Priority Rendering Helper
  const renderPriority = (priority: string) => {
    switch (priority) {
      case "High":
        return (
          <div className="flex items-center gap-1.5 text-orange-500 font-medium text-sm">
            <Clock className="w-4 h-4 text-orange-500" />
            <span>Urgent</span>
          </div>
        )
      case "Low":
        return (
          <div className="flex items-center gap-1.5 text-gray-400 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>Low</span>
          </div>
        )
      default: // Medium / Normal
        return (
          <div className="flex items-center gap-1.5 text-gray-500 text-sm">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>Normal</span>
          </div>
        )
    }
  }

  return (
    <div className="relative w-full min-h-screen bg-white p-8">
      {/* Header Container */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Tasks</h1>
        
        {/* Custom Segmented Tabs Container */}
        <div className="flex items-center bg-gray-100/80 p-1 rounded-full border border-gray-200">
          {(["All", "Done", "Backlog"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab)
                setSelectedTaskIds([])
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

      {/* Control bar */}
      <div className="flex justify-between items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search"
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

      {/* Task table Container */}
      <div className="border border-gray-100 rounded-xl overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow className="hover:bg-transparent border-gray-100">
              <TableHead className="w-12 text-center">
                <Checkbox
                  checked={filteredTasks.length > 0 && selectedTaskIds.length === filteredTasks.length}
                  onCheckedChange={handleToggleAll}
                  className="rounded border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                />
              </TableHead>
              <TableHead className="font-semibold text-gray-500 text-sm">Key</TableHead>
              <TableHead className="font-semibold text-gray-500 text-sm">Name</TableHead>
              <TableHead className="font-semibold text-gray-500 text-sm">Status</TableHead>
              <TableHead className="font-semibold text-gray-500 text-sm">Assignee</TableHead>
              <TableHead className="font-semibold text-gray-500 text-sm">Due date</TableHead>
              <TableHead className="font-semibold text-gray-500 text-sm">Priority</TableHead>
              <TableHead className="w-12 text-right">
                <button
                  onClick={handleOpenCreateSheet}
                  className="w-7 h-7 inline-flex items-center justify-center bg-black hover:opacity-90 text-white rounded-full transition-opacity shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-32 text-center text-gray-400">
                  No tasks found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => {
                const isSelected = selectedTaskIds.includes(task._id)
                return (
                  <TableRow
                    key={task._id}
                    className={`border-gray-100 transition-colors ${
                      isSelected ? "bg-gray-50/30" : "hover:bg-gray-50/10"
                    }`}
                  >
                    <TableCell className="text-center">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => handleToggleRow(task._id)}
                        className="rounded border-gray-300 data-[state=checked]:bg-black data-[state=checked]:border-black"
                      />
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 text-sm">{task.key}</TableCell>
                    <TableCell className="text-gray-900 font-medium text-sm">{task.title}</TableCell>
                    <TableCell>{renderStatusBadge(task.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className="w-8 h-8 border border-white">
                          <AvatarImage src="" alt={task.assignedTo?.name} />
                          <AvatarFallback className="bg-gray-100 text-gray-600 text-xs font-semibold">
                            {task.assignedTo?.name ? task.assignedTo.name.split(" ").map((n) => n[0]).join("") : "U"}
                          </AvatarFallback>
                        </Avatar>
                        {/* Mock second avatar stack for visual high fidelity */}
                        {task._id.startsWith("mock") && (
                          <Avatar className="w-8 h-8 -ml-2.5 border border-white">
                            <AvatarFallback className="bg-slate-200 text-gray-600 text-xs font-semibold">
                              JD
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm font-medium">
                      {formatDueDate(task.dueDate)}
                    </TableCell>
                    <TableCell>{renderPriority(task.priority)}</TableCell>
                    <TableCell className="text-right"></TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Floating Selection Capsule Bar */}
      {selectedTaskIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center bg-black text-white px-5 py-3 rounded-full shadow-2xl gap-4 border border-white/10 transition-all duration-300">
          <button
            onClick={() => setSelectedTaskIds([])}
            className="hover:opacity-80 transition-opacity p-0.5"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
          
          <span className="text-sm font-medium border-r border-white/20 pr-4">
            {selectedTaskIds.length} task{selectedTaskIds.length > 1 ? "s" : ""} selected
          </span>
          
          {selectedTaskIds.length === 1 && (
            <>
              <button
                onClick={handleOpenEditSheet}
                className="flex items-center gap-1.5 hover:text-gray-300 transition-colors text-sm font-semibold"
              >
                <Pencil className="w-4 h-4 text-gray-300" />
                <span>Edit</span>
              </button>
              <div className="w-px h-4 bg-white/20"></div>
            </>
          )}

          <button
            onClick={handleDeleteTasks}
            className="flex items-center gap-1.5 hover:text-red-400 text-red-500 transition-colors text-sm font-semibold"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}

      {/* Create / Edit Drawer Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md bg-white border-l border-gray-100 shadow-xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold text-gray-900">
              {editingTask ? "Edit Task" : "Create New Task"}
            </SheetTitle>
            <SheetDescription className="text-gray-500 text-sm">
              {editingTask
                ? "Update the details of your task to align the workspace scope."
                : "Fill out the fields to launch a new task under your workspace."}
            </SheetDescription>
          </SheetHeader>

          <form onSubmit={handleSubmitTask} className="flex flex-col gap-5 py-2">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Task Name</label>
              <Input
                type="text"
                placeholder="Enter task name"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="border-gray-200 rounded-lg outline-none focus-visible:ring-1 focus-visible:ring-gray-300 focus-visible:border-gray-300"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Description</label>
              <textarea
                placeholder="Provide a brief description"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                className="w-full min-h-[90px] border border-gray-200 rounded-lg p-3 outline-none text-sm focus-visible:ring-1 focus:ring-1 focus:ring-gray-300 focus:border-gray-300"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Status</label>
                <Select
                  value={formStatus}
                  onValueChange={(val: any) => setFormStatus(val)}
                >
                  <SelectTrigger className="border-gray-200 rounded-lg">
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-100">
                    <SelectItem value="Open">To do</SelectItem>
                    <SelectItem value="In Progress">In progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-gray-700">Priority</label>
                <Select
                  value={formPriority}
                  onValueChange={(val: any) => setFormPriority(val)}
                >
                  <SelectTrigger className="border-gray-200 rounded-lg">
                    <SelectValue placeholder="Select Priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-100">
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium (Normal)</SelectItem>
                    <SelectItem value="High">High (Urgent)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Assignee</label>
              <Select
                value={formAssignedTo}
                onValueChange={(val) => setFormAssignedTo(val || "")}
              >
                <SelectTrigger className="border-gray-200 rounded-lg">
                  <SelectValue placeholder="Select Assignee" />
                </SelectTrigger>
                <SelectContent className="bg-white border border-gray-100">
                  {users.map((user) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-gray-700">Due Date</label>
              <Input
                type="date"
                value={formDueDate}
                onChange={(e) => setFormDueDate(e.target.value)}
                className="border-gray-200 rounded-lg focus-visible:ring-1 focus-visible:ring-gray-300"
                required
              />
            </div>

            <SheetFooter className="mt-8 flex flex-row gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsSheetOpen(false)}
                className="border-gray-200 rounded-full h-11 px-5"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-black hover:opacity-90 text-white rounded-full h-11 px-6 font-semibold"
              >
                {editingTask ? "Save Changes" : "Create Task"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}

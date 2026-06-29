import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import * as taskService from "../services/taskService"
import * as userService from "../services/userService"
import {
  LayoutDashboard,
  ListTodo,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

interface Task {
  _id: string
  key: string
  title: string
  status: "Open" | "In Progress" | "Done"
  priority: "Low" | "Medium" | "High"
  dueDate: string
  assignedTo?: {
    _id: string
    name: string
    email: string
  }
}

interface UserRef {
  _id: string
  name: string
  email: string
  role: string
}

export default function OverviewPage() {
  const { user: currentUser } = useAuth()
  const isAdmin = currentUser?.role === "Admin"

  const [tasks, setTasks] = useState<Task[]>([])
  const [members, setMembers] = useState<UserRef[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        // Fetch tasks
        const tasksData = await taskService.getTasks()
        let finalTasks = tasksData || []

        // If not Admin, filter tasks to only show their own
        if (!isAdmin && currentUser?._id) {
          finalTasks = finalTasks.filter(
            (t: any) =>
              t.assignedTo?._id === currentUser._id ||
              t.createdBy?._id === currentUser._id ||
              t.createdBy === currentUser._id
          )
        }
        setTasks(finalTasks)

        // Fetch workspace members
        const membersData = await userService.getWorkspaceMembers()
        setMembers(membersData || [])
      } catch (err) {
        console.error("Failed to load overview data", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [isAdmin, currentUser])

  // Stat Calculations
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === "Done").length
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress").length
  const todoTasks = tasks.filter((t) => t.status === "Open").length
  const totalMembers = members.length

  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  return (
    <div className="w-full min-h-screen bg-white p-8 animate-in fade-in-50 duration-300">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Overview
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Here's what is happening in your workspace today.
          </p>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-full px-4 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-600">
          <TrendingUp className="w-3.5 h-3.5 text-black" />
          <span>Active Workspace Status</span>
        </div>
      </div>

      {/* Grid Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Metric 1: Total Tasks */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-black/5 flex items-center justify-center text-black">
              <ListTodo className="w-6 h-6" />
            </div>
            <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-150 rounded-full px-2.5 border-none font-medium">
              Tasks
            </Badge>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Total Tasks
            </span>
            <h3 className="text-4xl font-bold text-gray-900 mt-1">{totalTasks}</h3>
            <div className="flex gap-4 mt-3 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {todoTasks} to do
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
                {inProgressTasks} in progress
              </span>
            </div>
          </div>
        </div>

        {/* Metric 2: Completed Tasks */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <Badge className="bg-green-50 text-green-700 hover:bg-green-100 rounded-full px-2.5 border-none font-medium">
              Progress
            </Badge>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Task Completion Rate
            </span>
            <h3 className="text-4xl font-bold text-gray-900 mt-1">
              {completionPercentage}%
            </h3>
            <div className="w-full bg-gray-105 h-2 rounded-full mt-4 overflow-hidden">
              <div
                className="bg-green-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Metric 3: Workspace Members */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-55 flex items-center justify-center text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
            <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-full px-2.5 border-none font-medium">
              Team
            </Badge>
          </div>
          <div>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Workspace Members
            </span>
            <h3 className="text-4xl font-bold text-gray-900 mt-1">{totalMembers}</h3>
            <p className="text-xs text-gray-500 mt-3 font-medium">
              Registered users collaborating inside dashboard
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-gray-500" />
              <span>Recent Tasks</span>
            </h4>
            <a
              href="/dashboard/tasks"
              className="text-xs font-semibold text-gray-600 hover:text-black flex items-center gap-1 hover:underline"
            >
              <span>View All Tasks</span>
              <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          {loading ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
              Loading recent tasks...
            </div>
          ) : tasks.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
              No tasks found in this workspace.
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.slice(0, 4).map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400 tracking-wider">
                        {task.key}
                      </span>
                      <h5 className="text-sm font-semibold text-gray-800">
                        {task.title}
                      </h5>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        Due {task.dueDate || "N/A"}
                      </span>
                      <span>•</span>
                      <span>Priority: {task.priority}</span>
                    </div>
                  </div>
                  <Badge
                    className={`${
                      task.status === "Done"
                        ? "bg-green-50 text-green-700 hover:bg-green-100 border-none"
                        : task.status === "In Progress"
                        ? "bg-yellow-50 text-yellow-700 hover:bg-yellow-100 border-none"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100 border-none"
                    } px-2.5 rounded-full font-semibold`}
                  >
                    {task.status === "Open" ? "To do" : task.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Members List */}
        <div className="bg-white border border-gray-150 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-b-gray-100">
            <h4 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span>Workspace Team</span>
            </h4>
          </div>

          {loading ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
              Loading team directory...
            </div>
          ) : members.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
              No members registered yet.
            </div>
          ) : (
            <div className="space-y-4">
              {members.slice(0, 5).map((member) => (
                <div
                  key={member._id}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50/50 transition-colors"
                >
                  <Avatar className="w-9 h-9 border border-gray-100">
                    <AvatarFallback className="bg-black/5 text-black text-xs font-bold">
                      {member.name
                        ? member.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-semibold text-gray-800 truncate">
                      {member.name}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {member.email}
                    </span>
                  </div>
                  <Badge className="bg-gray-50 text-gray-500 hover:bg-gray-100 border-none rounded-full px-2 py-0.5 text-[10px] font-semibold">
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

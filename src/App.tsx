import { Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import SignupPage from "./pages/SignupPage"
import LoginPage from "./pages/LoginPage"
import { DashboardLayout } from "./layout/DashboardLayout"
import TaskPage from "./pages/TaskPage"
import UserPage from "./pages/UserPage"

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="tasks" replace />} />
          <Route path="tasks" element={<TaskPage />} />
          <Route path="users" element={<UserPage />} />
        </Route>

        
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </>
  )
}

export default App

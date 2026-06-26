

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import SignupPage from "./pages/SignupPage"
import LoginPage from "./pages/LoginPage"
import { DashboardLayout } from "./layout/DashboardLayout"

function App() {
  return (
    <Router>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardLayout />} />

        
        <Route path="*" element={<Navigate to="/signup" replace />} />
      </Routes>
    </Router>
  )
}

export default App

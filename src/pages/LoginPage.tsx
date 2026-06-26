import React, { useState } from "react"
import { Link } from "react-router-dom"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Login submitted", { email, password })
  }

  return (
    <div className="login-page">
      <div className="flex min-h-screen w-full items-center justify-center bg-gray-50">
        <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-lg border border-gray-200 text-center">
          <h1 className="text-4xl font-bold text-blue-800 mb-2">Task Manager</h1>
          <h1 className="text-3xl font-bold text-black mb-2">SIGN IN</h1>
          <p className="text-sm text-gray-500 mb-6">Welcome back! Please enter your details.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="text-left">
              <label className="text-sm font-semibold text-gray-700 block mb-1">Email Address</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-full py-2 px-4 outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <div className="text-left">
              <label className="text-sm font-semibold text-gray-700 block mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-full py-2 px-4 outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              className="mt-4 w-full py-3 bg-black text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
            >
              Sign In
            </button>
          </form>

          <p className="text-gray-500 text-sm mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-indigo-600 hover:underline font-semibold">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

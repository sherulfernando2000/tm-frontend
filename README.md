# Task Manager Dashboard

A premium, visually-stunning task management dashboard frontend built with React, Vite, Tailwind CSS, and TypeScript. It features a responsive layout, glassmorphic aesthetics, and role-based interface views.

## 🎨 Design & Key Features
* **Premium Theme**: Curated harmonious colors, dark mode accents, smooth card transitions, hover animations, and custom avatars.
* **Role-Based Views**:
  * **Admins**: Full control. Can create tasks via sheet drawer, edit or batch delete tasks via row selection / bottom actions bar, and manage workspace members.
  * **Members (Users)**: Can view tasks in detail by clicking rows, filter by priority or status, and change their own password in the accounts tab.
* **Interactive Modals**: Seamless drawer overlays for task creation/editing and details inspection.
* **Single Page App Routing**: Smooth navigation with `react-router-dom`, fully optimized for page refreshes.

---

## ⚙️ Environment Variables
Create a `.env` file in the root of the frontend directory:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

---

## 🚀 Getting Started

### 1. Installation
Install project dependencies:
```bash
npm install
```

### 2. Run in Development
Start the local Vite server:
```bash
npm run dev
```

### 3. Build for Production
Compile and bundle the project for production:
```bash
npm run build
```
This builds static assets into the `dist/` directory.

---

## 📁 Key File Structure
* `src/components/` - Shared UI elements (Avatar, Select, Table, App Sidebar, User settings details).
* `src/context/AuthContext.tsx` - Context providing user profile, role validation, login, and registration states.
* `src/pages/TaskPage.tsx` - Main task management view, table layout, search, filters, selection, and details sheets.
* `src/pages/UserPage.tsx` - User directory for Admins; centered inline password reset form for members.
* `src/services/` - Axios API clients for communicating with the backend (`taskService`, `userService`, `authService`).

---

## ☁️ Deployment (Vercel)
This React + Vite project is pre-configured with a `vercel.json` rewrite file to ensure React Router paths resolve correctly during live page refreshes:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
Ensure you add the `VITE_API_BASE_URL` pointing to your deployed backend API URL in your Vercel project environment settings.

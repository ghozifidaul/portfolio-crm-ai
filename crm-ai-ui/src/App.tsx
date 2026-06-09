import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { isAuthenticated } from './api/client'
import LoginPage from './pages/LoginPage'
import InboxPage from './pages/InboxPage'
import ConversationPage from './pages/ConversationPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />
  return <>{children}</>
}

function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  if (isAuthenticated()) return <Navigate to="/inbox" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
        <Route path="/inbox" element={<RequireAuth><InboxPage /></RequireAuth>} />
        <Route path="/conversation/:customerId" element={<RequireAuth><ConversationPage /></RequireAuth>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

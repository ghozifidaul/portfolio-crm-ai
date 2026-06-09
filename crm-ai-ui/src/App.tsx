import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { isAuthenticated } from './api/client'
import LoginPage from './pages/LoginPage'

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
        <Route path="/inbox" element={<RequireAuth><div>Inbox page</div></RequireAuth>} />
        <Route path="/conversation/:customerId" element={<RequireAuth><div>Conversation page</div></RequireAuth>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

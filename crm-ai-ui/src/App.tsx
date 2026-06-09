import { BrowserRouter, Routes, Route, Navigate } from 'react-router'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route path="/inbox" element={<div>Inbox page</div>} />
        <Route path="/conversation/:customerId" element={<div>Conversation page</div>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

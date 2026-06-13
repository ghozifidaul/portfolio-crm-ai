import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { isAuthenticated, getUserRole } from "./api/client";
import LoginPage from "./pages/LoginPage";
import InboxPage from "./pages/InboxPage";
import ConversationPage from "./pages/ConversationPage";
import CustomerHomePage from "./pages/CustomerHomePage";
import DashboardPage from "./pages/DashboardPage";
import TicketsPage from "./pages/TicketsPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import AppShell from "./components/AppShell";

function RequireAuth({ children }: { children: React.ReactNode }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireAgent({ children }: { children: React.ReactNode }) {
  if (getUserRole() !== "agent") return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
}

function RedirectIfAuth({ children }: { children: React.ReactNode }) {
  if (isAuthenticated()) {
    const role = getUserRole();
    if (role === "agent") return <Navigate to="/dashboard" replace />;
    return <Navigate to="/home" replace />;
  }
  return <>{children}</>;
}

function RequireCustomer({ children }: { children: React.ReactNode }) {
  if (getUserRole() !== "customer") return <Navigate to="/inbox" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
        <Route
          element={
            <RequireAuth>
              <RequireAgent>
                <AppShell />
              </RequireAgent>
            </RequireAuth>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/inbox/:customerId" element={<ConversationPage />} />
          <Route path="/tickets" element={<TicketsPage />} />
        </Route>
        <Route
          path="/home"
          element={
            <RequireAuth>
              <RequireCustomer>
                <CustomerHomePage />
              </RequireCustomer>
            </RequireAuth>
          }
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

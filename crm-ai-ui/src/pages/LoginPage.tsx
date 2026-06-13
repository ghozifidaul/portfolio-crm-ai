import { useState, type SubmitEvent } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { getUserRole } from "../api/client";
import { Card, Input, Button } from "../components/ui";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const ok = await login(username, password);
    if (ok) {
      navigate(getUserRole() === "agent" ? "/dashboard" : "/home", {
        replace: true,
      });
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <Card className="w-full max-w-sm p-8">
        <h1 className="mb-1 text-xl font-semibold tracking-tight text-zinc-100">
          CRM AI
        </h1>
        <p className="mb-6 text-sm text-zinc-500">Sign in to your account</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="agent1"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password123"
            required
          />

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Login
          </Button>
        </form>
      </Card>
    </div>
  );
}

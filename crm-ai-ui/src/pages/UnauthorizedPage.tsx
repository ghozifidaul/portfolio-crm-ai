import { useNavigate } from 'react-router'
import { Card, Button } from '../components/ui'

export default function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <Card className="w-full max-w-sm p-8 text-center">
        <h1 className="mb-2 text-xl font-semibold text-zinc-100">Access Denied</h1>
        <p className="mb-6 text-sm text-zinc-500">This portal is for agents only.</p>
        <Button onClick={() => navigate('/login')}>
          Back to Login
        </Button>
      </Card>
    </div>
  )
}

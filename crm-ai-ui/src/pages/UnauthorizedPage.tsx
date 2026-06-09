import { Link } from 'react-router'

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-xl bg-white p-8 text-center shadow-sm">
        <h1 className="mb-2 text-xl font-semibold text-gray-900">Access Denied</h1>
        <p className="mb-6 text-sm text-gray-600">This portal is for agents only.</p>
        <Link
          to="/login"
          className="inline-block rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Back to Login
        </Link>
      </div>
    </div>
  )
}

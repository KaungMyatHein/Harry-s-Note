'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SignUp() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to signin page since we're using Google OAuth
    router.replace('/auth/signin')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Redirecting...
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            We now use Google OAuth for authentication
          </p>
        </div>
      </div>
    </div>
  )
}
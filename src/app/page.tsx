'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-5xl font-bold text-center mb-8 text-gray-900">
          📚 One Book Per Day
        </h1>
      </div>
      
      <div className="relative flex place-items-center">
        <div className="text-center max-w-2xl">
          <h2 className="text-3xl mb-6 text-gray-800 font-semibold">
            Expand your knowledge with daily book summaries
          </h2>
          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            Build a habit of continuous learning by reading one carefully curated book summary each day. 
            Transform your knowledge, one summary at a time.
          </p>
          <div className="space-x-6">
            <Link href="/auth/signin">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg">
                Sign In
              </button>
            </Link>
            <Link href="/auth/signup">
              <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors shadow-lg">
                Get Started
              </button>
            </Link>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl mb-4">📖</div>
              <h3 className="text-lg font-semibold mb-2">Daily Summaries</h3>
              <p className="text-gray-600">Get one book summary per day from our curated collection</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Build Habits</h3>
              <p className="text-gray-600">Develop a consistent reading habit with bite-sized content</p>
            </div>
            <div className="p-6">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-lg font-semibold mb-2">Expand Knowledge</h3>
              <p className="text-gray-600">Learn key insights from bestselling books in minutes</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
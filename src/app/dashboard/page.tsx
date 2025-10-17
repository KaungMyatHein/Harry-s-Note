'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import StarRating from '@/components/StarRating'

interface Book {
  id: string
  title: string
  author: string
  summary: string
  rating?: number | null
  length?: number | null
  coverImage?: string | null
  tags?: string[]
  notionId?: string
  isRead?: boolean
}

interface UserStats {
  totalBooksRead: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [books, setBooks] = useState<Book[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    fetchAllBooks()
    fetchUserStats()
  }, [session, status, router])

  const fetchAllBooks = async () => {
    try {
      const response = await fetch('/api/books')
      const data = await response.json()
      
      if (response.ok) {
        setBooks(data.books || [])
      } else {
        console.error('Error fetching books:', data.error)
      }
    } catch (error) {
      console.error('Error fetching books:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const response = await fetch('/api/user/stats')
      const data = await response.json()
      
      if (response.ok) {
        setStats(data.stats)
      } else {
        console.error('Error fetching stats:', data.error)
      }
    } catch (error) {
      console.error('Error fetching user stats:', error)
    }
  }

  // Function to refresh both books and stats
  const refreshData = async () => {
    await Promise.all([fetchAllBooks(), fetchUserStats()])
  }

  // Listen for page visibility changes to refresh data when returning to dashboard
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && session) {
        refreshData()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [session])

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.summary.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesTag = selectedTags.length === 0 || (book.tags && selectedTags.some(tag => book.tags!.includes(tag)))
    
    return matchesSearch && matchesTag
  })

  // Get all unique tags from books
  const allTags = Array.from(new Set(books.flatMap(book => book.tags || []))).sort()

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your book library...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {session?.user?.name || 'Reader'}!
            </h1>
            <p className="text-gray-600 mt-2">Explore our complete book library</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/notes')}
              className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-800 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
            >
              📝 My Notes
            </button>
            <button
              onClick={() => router.push('/api/auth/signout')}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Books Read</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBooksRead}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available Books</p>
                  <p className="text-2xl font-bold text-gray-900">{books.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="mb-8">
          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search books by title, author, or summary..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Multi-Select Tag Filter */}
            <div className="relative w-full">
              <div className="border border-gray-300 rounded-lg bg-white min-h-[42px] p-2 focus-within:ring-1 focus-within:ring-indigo-500 focus-within:border-indigo-500">
                {/* Selected Tags */}
                <div className="flex flex-wrap gap-1 mb-1">
                  {selectedTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                    >
                      {tag}
                      <button
                        onClick={() => setSelectedTags(selectedTags.filter(t => t !== tag))}
                        className="ml-1 text-indigo-600 hover:text-indigo-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                
                {/* Tag Dropdown */}
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value && !selectedTags.includes(e.target.value)) {
                      setSelectedTags([...selectedTags, e.target.value])
                    }
                  }}
                  className="w-full border-none outline-none bg-transparent text-gray-700 text-sm"
                >
                  <option value="">
                    {selectedTags.length === 0 ? 'Select tags...' : 'Add more tags...'}
                  </option>
                  {allTags
                    .filter(tag => !selectedTags.includes(tag))
                    .map((tag) => (
                      <option key={tag} value={tag}>
                        {tag}
                      </option>
                    ))}
                </select>
              </div>
              
              {/* Clear All Button */}
              {selectedTags.length > 0 && (
                <button
                  onClick={() => setSelectedTags([])}
                  className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Books Grid */}
        {filteredBooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
                onClick={() => router.push(`/book/${book.id}`)}
              >
                {/* Book Cover */}
                <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center relative">
                  {/* Read Status Badge */}
                  {book.isRead && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 z-10">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Read
                    </div>
                  )}
                  
                  {book.coverImage ? (
                    <img 
                      src={book.coverImage} 
                      alt={`${book.title} cover`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4">
                      <svg className="w-12 h-12 text-indigo-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253z" />
                      </svg>
                      <p className="text-sm text-indigo-600 font-medium">No Cover</p>
                    </div>
                  )}
                </div>

                {/* Book Details */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">{book.title}</h3>
                  <p className="text-gray-600 mb-3">by {book.author}</p>
                  
                  {/* Book Metadata */}
                  <div className="flex items-center justify-between mb-4">
                    {book.rating && (
                      <StarRating rating={book.rating} size="sm" />
                    )}
                    
                    {book.tags && book.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {book.tags.slice(0, 2).map((tag, index) => (
                          <span 
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                          >
                            {tag}
                          </span>
                        ))}
                        {book.tags.length > 2 && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            +{book.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Summary Preview - Hidden but kept for search functionality */}

                  {/* Read Button */}
                  <div className="mt-4">
                    <button 
                      className={`w-full py-2 px-4 rounded-lg transition-colors font-medium ${
                        book.isRead 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {book.isRead ? 'Already Read' : 'Read Summary'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Books Found</h2>
            <p className="text-gray-600">
              {searchTerm 
                ? `No books match your search for "${searchTerm}"`
                : "No books are available at the moment."
              }
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
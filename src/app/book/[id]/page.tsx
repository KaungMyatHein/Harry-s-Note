'use client'

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import StarRating from '@/components/StarRating'
import MarkdownRenderer from '@/components/MarkdownRenderer'
import NoteTaking from '@/components/NoteTaking'

interface Book {
  id: string
  title: string
  author: string
  summary: string
  rating?: number | null
  length?: number | null
  coverImage?: string | null
}

export default function BookDetail() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [markingRead, setMarkingRead] = useState(false)

  useEffect(() => {
    // Temporarily disable auth check for testing
    // if (status === 'loading') return
    // if (!session) {
    //   router.push('/auth/signin')
    //   return
    // }

    fetchBook()
  }, [params.id]) // Remove session dependencies

  const fetchBook = async () => {
    try {
      console.log('Fetching book with ID:', params.id)
      const response = await fetch(`/api/books/${params.id}`)
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Book data received:', data)
        setBook(data.book)
      } else {
        const errorData = await response.text()
        console.error('Failed to fetch book:', response.status, errorData)
        alert(`Failed to fetch book: ${response.status}`)
      }
    } catch (error) {
      console.error('Error fetching book:', error)
      alert(`Error fetching book: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async () => {
    console.log('🟡 [FRONTEND] Mark as read button clicked')
    console.log('🟡 [FRONTEND] Book data:', book)
    console.log('🟡 [FRONTEND] Session status:', status)
    console.log('🟡 [FRONTEND] Session data:', session)
    
    if (!book) {
      console.log('🔴 [FRONTEND] No book data available')
      return
    }
    
    console.log('🟡 [FRONTEND] Setting markingRead to true')
    setMarkingRead(true)
    
    try {
      console.log('🟡 [FRONTEND] Making API call to /api/books/mark-read')
      console.log('🟡 [FRONTEND] Request payload:', { bookId: book.id })
      
      const response = await fetch('/api/books/mark-read', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookId: book.id }),
      })

      console.log('🟡 [FRONTEND] API response status:', response.status)
      console.log('🟡 [FRONTEND] API response ok:', response.ok)

      if (response.ok) {
        const responseData = await response.json()
        console.log('🟢 [FRONTEND] API response data:', responseData)
        console.log('🟡 [FRONTEND] Redirecting to dashboard...')
        router.push('/dashboard')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.log('🔴 [FRONTEND] API error response:', errorData)
        alert(`Failed to mark book as read: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('🔴 [FRONTEND] Error marking book as read:', error)
      alert(`Error marking book as read: ${error}`)
    } finally {
      console.log('🟡 [FRONTEND] Setting markingRead to false')
      setMarkingRead(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div 
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"
          role="status"
          aria-label="Loading book details"
        >
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Book not found</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-indigo-600 hover:text-indigo-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md px-2 py-1"
            aria-label="Return to dashboard"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Skip to main content link for keyboard navigation */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      
      {/* Navigation Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md px-2 py-1"
            aria-label="Back to Dashboard"
          >
            <svg 
              className="w-5 h-5 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
        </div>
      </header>

      {/* Article-style Content */}
      <main id="main-content" className="max-w-4xl mx-auto px-6 py-12" tabIndex={-1}>
        <article>
        {/* Book Header */}
        <header className="mb-12 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            {book.title}
          </h1>
          <div className="text-xl text-gray-800 mb-8">
            by <span className="font-medium text-gray-900">{book.author}</span>
          </div>
          
          {/* Book Metadata */}
          <div className="flex items-center justify-center gap-8 text-gray-700 mb-12">
            {book.rating && (
              <div className="flex items-center gap-2">
                <StarRating rating={book.rating} size="sm" />
                <span className="text-sm font-medium text-gray-800">{book.rating}/5</span>
              </div>
            )}
            
            {book.length && (
              <div className="flex items-center gap-2">
                <svg 
                  className="w-4 h-4 text-gray-700" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span className="text-sm font-medium text-gray-800">{book.length} pages</span>
              </div>
            )}
          </div>
        </header>

        {/* Book Cover - Centered and Elegant */}
        <div className="flex justify-center mb-16">
          {book.coverImage ? (
            <img 
              src={book.coverImage} 
              alt={`Cover of ${book.title} by ${book.author}`}
              className="w-80 h-auto max-w-full rounded-lg shadow-2xl"
            />
          ) : (
            <div 
              className="w-80 h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg shadow-2xl flex items-center justify-center"
              role="img"
              aria-label={`No cover image available for ${book.title} by ${book.author}`}
            >
              <div className="text-center p-6">
                <svg 
                  className="w-20 h-20 text-gray-400 mx-auto mb-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253z" />
                </svg>
                <p className="text-xl text-gray-400 font-medium">Book Cover</p>
              </div>
            </div>
          )}
        </div>

        {/* Summary Content - Medium-style Typography */}
        <section className="medium-typography max-w-none prose prose-lg prose-gray" aria-labelledby="summary-heading">
          <h2 id="summary-heading" className="sr-only">Book Summary</h2>
          <MarkdownRenderer 
            content={book.summary}
            className="text-gray-700 leading-relaxed"
          />
        </section>

        {/* Action Section */}
        <section className="mt-16 pt-12 border-t border-gray-200" aria-labelledby="actions-heading">
          <h2 id="actions-heading" className="sr-only">Book Actions</h2>
          <div className="text-center">
            <button
              onClick={markAsRead}
              disabled={markingRead}
              className="inline-flex items-center px-8 py-4 bg-green-600 text-white font-medium text-lg rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
              aria-describedby={markingRead ? "marking-status" : undefined}
            >
              {markingRead ? (
                <>
                  <svg 
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span id="marking-status">Marking as Read...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Mark as Read
                </>
              )}
            </button>
          </div>
        </section>
      </article>

      {/* Note Taking Component */}
      {book && <NoteTaking bookId={book.id} bookTitle={book.title} />}
    </main>
    </div>
  )
}
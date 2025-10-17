import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { getBookSummaries } from '@/lib/notion'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Fetching books from Notion...')
    
    // Get current user if authenticated
    let currentUser = null
    if (session?.user?.email) {
      currentUser = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
    }

    // Get all books from Notion
    const notionBooks = await getBookSummaries()
    
    if (notionBooks.length === 0) {
      return NextResponse.json(
        { error: 'No books available' },
        { status: 404 }
      )
    }

    // For each book, check if current user has read it
    const books = await Promise.all(
      notionBooks.map(async (book) => {
        // Check if current user has read this book (using Notion ID as bookId)
        let isRead = false
        if (currentUser) {
          const readingSession = await prisma.readingSession.findFirst({
            where: {
              userId: currentUser.id,
              bookId: book.id, // Using Notion page ID directly
              completed: true
            }
          })
          isRead = !!readingSession
        }

        return {
          id: book.id, // Use Notion page ID
          title: book.title,
          author: book.author,
          summary: book.summary,
          rating: book.rating || 4.0,
          length: book.length || 300,
          coverImage: book.coverImage,
          tags: book.tags,
          notionId: book.id,
          isRead: isRead
        }
      })
    )

    return NextResponse.json({
      books,
      total: books.length
    })
  } catch (error) {
    console.error('Error fetching all books:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
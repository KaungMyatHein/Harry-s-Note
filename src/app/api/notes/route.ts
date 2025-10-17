import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/notes - Get all notes for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const bookId = searchParams.get('bookId')

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const whereClause: any = {
      userId: user.id
    }

    // Add search filter if provided
    if (search) {
      whereClause.OR = [
        { content: { contains: search, mode: 'insensitive' } },
        { bookTitle: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Add book filter if provided
    if (bookId) {
      whereClause.bookId = bookId
    }

    const notes = await prisma.note.findMany({
      where: whereClause,
      include: {
        readingSession: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Error fetching notes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/notes - Create a new note
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content, bookId, bookTitle, readingSessionId } = body

    if (!content || !bookId) {
      return NextResponse.json({ error: 'Content and bookId are required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // If no readingSessionId provided, find or create one for today
    let finalReadingSessionId = readingSessionId
    if (!finalReadingSessionId) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      let readingSession = await prisma.readingSession.findFirst({
        where: {
          userId: user.id,
          bookId: bookId,
          readAt: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          }
        }
      })

      if (!readingSession) {
        readingSession = await prisma.readingSession.create({
          data: {
            userId: user.id,
            bookId: bookId,
            readAt: new Date()
          }
        })
      }

      finalReadingSessionId = readingSession.id
    }

    const note = await prisma.note.create({
      data: {
        content,
        userId: user.id,
        bookId,
        bookTitle,
        readingSessionId: finalReadingSessionId
      },
      include: {
        readingSession: true
      }
    })

    return NextResponse.json(note, { status: 201 })
  } catch (error) {
    console.error('Error creating note:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
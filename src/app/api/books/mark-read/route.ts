import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { authOptions } from '@/lib/auth'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  console.log('🔵 [MARK AS READ API] Starting mark as read request')
  
  try {
    console.log('🔵 [MARK AS READ API] Getting server session...')
    const session = await getServerSession(authOptions)
    console.log('🔵 [MARK AS READ API] Session:', session ? 'Found' : 'Not found', session?.user?.email || 'No email')
    
    if (!session?.user?.email) {
      console.log('🔴 [MARK AS READ API] Unauthorized - no session or email')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('🔵 [MARK AS READ API] Parsing request body...')
    const { bookId } = await request.json()
    console.log('🔵 [MARK AS READ API] Book ID received:', bookId)

    if (!bookId) {
      console.log('🔴 [MARK AS READ API] Missing book ID')
      return NextResponse.json(
        { error: 'Book ID is required' },
        { status: 400 }
      )
    }

    console.log('🔵 [MARK AS READ API] Finding user by email:', session.user.email)
    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    console.log('🔵 [MARK AS READ API] User found:', user ? `ID: ${user.id}` : 'Not found')

    if (!user) {
      console.log('🔴 [MARK AS READ API] User not found in database')
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('🔵 [MARK AS READ API] Creating reading session for user:', user.id, 'book:', bookId)
    // UNLIMITED ACCESS: Create reading session without daily limit check
    const readingSession = await prisma.readingSession.create({
      data: {
        userId: user.id,
        bookId: bookId,
        completed: true,
        readAt: new Date()
      }
    })
    console.log('🟢 [MARK AS READ API] Reading session created successfully:', readingSession.id)

    return NextResponse.json({
      success: true,
      readingSession,
      message: 'Book marked as read successfully! Keep reading more books!'
    })
  } catch (error) {
    console.error('🔴 [MARK AS READ API] Error marking book as read:', error)
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
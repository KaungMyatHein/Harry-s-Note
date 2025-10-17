import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import { getRandomBookSummary } from '@/lib/notion'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Find the user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // UNLIMITED ACCESS: Always get a random book from Notion
    const bookSummary = await getRandomBookSummary()
    
    if (!bookSummary) {
      return NextResponse.json(
        { error: 'No book summaries available' },
        { status: 404 }
      )
    }

    // Return the book summary directly from Notion (no database storage needed)
    return NextResponse.json({
      book: {
        id: bookSummary.id, // Use Notion page ID
        title: bookSummary.title,
        author: bookSummary.author,
        summary: bookSummary.summary,
        notionId: bookSummary.id,
        createdAt: bookSummary.createdAt,
        updatedAt: bookSummary.createdAt
      },
      alreadyRead: false,
      message: 'Enjoy unlimited access to book summaries!'
    })
  } catch (error) {
    console.error('Error fetching daily book:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
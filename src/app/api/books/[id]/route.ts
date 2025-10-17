import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { getBookById } from '@/lib/notion'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Temporarily disable auth check for testing
    // const session = await getServerSession()
    
    // if (!session?.user?.email) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }

    const { id: bookId } = await params
    
    // Use the bookId directly as Notion page ID (no database lookup needed)
    const book = await getBookById(bookId)
    
    if (!book) {
      return NextResponse.json(
        { error: 'Book not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ book })
  } catch (error) {
    console.error('Error fetching book:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
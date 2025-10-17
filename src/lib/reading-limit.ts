import { PrismaClient } from '@prisma/client'
import { startOfDay, endOfDay } from 'date-fns'

const prisma = new PrismaClient()

export interface ReadingStatus {
  hasReadToday: boolean
  canRead: boolean
  message: string
  todayBook?: any
}

export async function checkDailyReadingStatus(userId: string): Promise<ReadingStatus> {
  try {
    const today = new Date()
    const startOfToday = startOfDay(today)
    const endOfToday = endOfDay(today)

    // Check if user has already read a book today
    const todaySession = await prisma.readingSession.findFirst({
      where: {
        userId: userId,
        readAt: {
          gte: startOfToday,
          lte: endOfToday,
        }
      },
      include: {
        book: true
      }
    })

    if (todaySession) {
      return {
        hasReadToday: true,
        canRead: false,
        message: 'You have already read your book for today. Come back tomorrow for a new summary!',
        todayBook: todaySession.book
      }
    }

    return {
      hasReadToday: false,
      canRead: true,
      message: 'You can read your daily book summary now!'
    }
  } catch (error) {
    console.error('Error checking daily reading status:', error)
    throw new Error('Failed to check reading status')
  }
}

export async function createReadingSession(userId: string, bookId: string) {
  try {
    const today = new Date()
    const startOfToday = startOfDay(today)
    const endOfToday = endOfDay(today)

    // Double-check that user hasn't already read today
    const existingSession = await prisma.readingSession.findFirst({
      where: {
        userId: userId,
        readAt: {
          gte: startOfToday,
          lte: endOfToday,
        }
      }
    })

    if (existingSession) {
      throw new Error('You have already read a book today')
    }

    // Create new reading session
    const readingSession = await prisma.readingSession.create({
      data: {
        userId: userId,
        bookId: bookId,
        completed: true,
        readAt: new Date()
      }
    })

    return readingSession
  } catch (error) {
    console.error('Error creating reading session:', error)
    throw error
  }
}

export async function getUserReadingStats(userId: string) {
  try {
    // Get total books read
    const totalBooksRead = await prisma.readingSession.count({
      where: {
        userId: userId,
        completed: true
      }
    })

    return {
      totalBooksRead
    }
  } catch (error) {
    console.error('Error getting user reading stats:', error)
    throw new Error('Failed to get reading statistics')
  }
}
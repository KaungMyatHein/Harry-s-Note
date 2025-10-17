import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

// Debug logging for URL and environment
console.log('[NextAuth][DEBUG] Environment variables check:', {
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
  VERCEL_URL: process.env.VERCEL_URL || 'NOT_SET',
  AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || 'NOT_SET',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT_SET',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'NOT_SET',
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET'
})

// Determine the base URL for NextAuth
const baseUrl = process.env.NEXTAUTH_URL || 
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

console.log('[NextAuth][DEBUG] Computed base URL:', baseUrl)
console.log('[NextAuth][DEBUG] NextAuth will use base URL for OAuth callbacks:', baseUrl)
console.log('[NextAuth][DEBUG] NextAuth API endpoints will be:', {
  session: `${baseUrl}/api/auth/session`,
  signin: `${baseUrl}/api/auth/signin`,
  callback: `${baseUrl}/api/auth/callback/google`
})

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'database',
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Explicitly set the base URL to ensure OAuth callbacks use the correct URL
  ...(process.env.NEXTAUTH_URL && { 
    url: process.env.NEXTAUTH_URL 
  }),
  callbacks: {
    async session({ session, user }) {
      console.log('[NextAuth][DEBUG] Session callback triggered')
      console.log('[NextAuth][DEBUG] Session input:', {
        sessionExists: !!session,
        sessionUser: session?.user ? {
          id: session.user.id || 'NO_ID',
          email: session.user.email || 'NO_EMAIL',
          name: session.user.name || 'NO_NAME'
        } : 'NO_SESSION_USER',
        userExists: !!user,
        userId: user?.id || 'NO_USER_ID'
      })
      
      if (session?.user && user?.id) {
        console.log('[NextAuth][DEBUG] Assigning user.id to session.user.id:', user.id)
        session.user.id = user.id
      } else {
        console.log('[NextAuth][DEBUG] Cannot assign user.id - missing data:', {
          hasSession: !!session,
          hasSessionUser: !!session?.user,
          hasUser: !!user,
          hasUserId: !!user?.id
        })
      }
      
      console.log('[NextAuth][DEBUG] Session callback output:', {
        sessionUser: session?.user ? {
          id: session.user.id || 'NO_ID',
          email: session.user.email || 'NO_EMAIL',
          name: session.user.name || 'NO_NAME'
        } : 'NO_SESSION_USER'
      })
      
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development', // Only enable debug in development
  logger: {
    error(code, metadata) {
      console.error('[NextAuth][error]', code, metadata)
    },
    warn(code) {
      console.warn('[NextAuth][warn]', code)
    },
    debug(code, metadata) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[NextAuth][debug]', code, metadata)
      }
    }
  }
}

console.log('[NextAuth][DEBUG] Google Provider configured with:', {
  hasClientId: !!process.env.GOOGLE_CLIENT_ID,
  hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
  clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0
})
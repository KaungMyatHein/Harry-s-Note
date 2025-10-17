import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  session: {
    strategy: 'database',
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, user }) {
      console.log('[NextAuth] Session callback called:', { 
        hasSession: !!session, 
        hasUser: !!user,
        sessionUser: session?.user ? 'exists' : 'null',
        userId: user?.id || 'no-id'
      })
      
      // Simply pass through the session - let NextAuth handle the rest
      if (session && user) {
        session.user.id = user.id
      }
      
      console.log('[NextAuth] Session callback completed')
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
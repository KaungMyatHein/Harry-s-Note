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
      try {
        console.log('[NextAuth] Session callback called:', { 
          hasSession: !!session, 
          hasUser: !!user,
          sessionUser: session?.user ? 'exists' : 'null',
          userId: user?.id || 'no-id'
        })
        
        if (!session) {
          console.error('[NextAuth] Session is null or undefined')
          return { expires: new Date(0).toISOString() }
        }
        
        if (!session.user) {
          console.error('[NextAuth] Session.user is null or undefined')
          session.user = { id: '', email: null, name: null, image: null }
        }
        
        if (user) {
          session.user.id = user.id || ''
          session.user.email = user.email || null
          session.user.name = user.name || null
          session.user.image = user.image || null
        } else {
          console.warn('[NextAuth] User object is null or undefined in session callback')
        }
        
        console.log('[NextAuth] Session callback completed successfully')
        return session
      } catch (error) {
        console.error('[NextAuth] Error in session callback:', error)
        // Return a minimal valid session to prevent CLIENT_FETCH_ERROR
        return {
          user: { id: '', email: null, name: null, image: null },
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        }
      }
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  debug: true, // Enable debug in production to see logs
  logger: {
    error(code, metadata) {
      console.error('[NextAuth][error]', code, metadata)
    },
    warn(code) {
      console.warn('[NextAuth][warn]', code)
    },
    debug(code, metadata) {
      console.log('[NextAuth][debug]', code, metadata)
    }
  }
}
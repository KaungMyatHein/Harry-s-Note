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
      if (session?.user && user) {
        session.user.id = user.id
        session.user.email = user.email || null
        session.user.name = user.name || null
        session.user.image = user.image || null
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  debug: process.env.NODE_ENV === 'development',
}
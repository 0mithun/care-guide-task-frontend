import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import axios from 'axios';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Please enter both email and password');
        }

        try {
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
            email: credentials.email,
            password: credentials.password
          }, {
            headers: { 'Content-Type': 'application/json' }
          });

          const data = res.data;

          if (res.status === 200 && data.token && data.user) {
            return {
              id: data.user.id,
              name: data.user.username,
              email: data.user.email,
              username: data.user.username,
              role: data.user.role,
              interests: data.user.interests,
              token: data.token
            };
          }

          throw new Error(data.message || 'Invalid credentials');
        } catch (error: any) {
          const errMsg = error.response?.data?.message || error.message || 'Server authentication failed';
          throw new Error(errMsg);
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = (user as any).username;
        token.role = (user as any).role;
        token.interests = (user as any).interests;
        token.token = (user as any).token;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
        session.user.interests = token.interests;
        session.user.token = token.token;
      }
      return session;
    }
  },
  pages: {
    signIn: '/',
    error: '/'
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import pool from './db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.error('Missing credentials');
          return null;
        }

        try {
          const [rows] = await pool.query(
            'SELECT * FROM users WHERE email = ?',
            [credentials.username]
          ) as any[];

          if (!Array.isArray(rows) || rows.length === 0) {
            console.error('User not found:', credentials.username);
            return null;
          }

          const user = rows[0];

          if (!user.password) {
            console.error('User has no password (Google OAuth user)');
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.error('Invalid password for user:', credentials.username);
            return null;
          }

          console.log('User authenticated successfully:', user.email);
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
        } catch (error: any) {
          console.error('Auth error:', error?.message || error);
          console.error('Stack:', error?.stack);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === 'google') {
        try {
          const email = user.email;
          if (!email) return false;

          // Check if user exists
          const [existingUsers] = await pool.query(
            'SELECT * FROM users WHERE email = ? OR googleId = ?',
            [email, account.providerAccountId]
          ) as any[];

          if (Array.isArray(existingUsers) && existingUsers.length === 0) {
            // Create new user with 'user' role
            await pool.query(
              'INSERT INTO users (email, name, role, googleId) VALUES (?, ?, ?, ?)',
              [email, user.name || 'User', 'user', account.providerAccountId]
            );
          } else if (Array.isArray(existingUsers) && existingUsers.length > 0) {
            // Update googleId if missing
            const existingUser = existingUsers[0];
            if (!existingUser.googleId) {
              await pool.query(
                'UPDATE users SET googleId = ? WHERE email = ?',
                [account.providerAccountId, email]
              );
            }
          }
        } catch (error) {
          console.error('Google sign in error:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }

      // For Google OAuth, fetch user role from database
      if (account?.provider === 'google' && token.email) {
        try {
          const [rows] = await pool.query(
            'SELECT id, role FROM users WHERE email = ?',
            [token.email]
          ) as any[];

          if (Array.isArray(rows) && rows.length > 0) {
            token.role = rows[0].role;
            token.id = rows[0].id.toString();
          }
        } catch (error) {
          console.error('JWT callback error:', error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};


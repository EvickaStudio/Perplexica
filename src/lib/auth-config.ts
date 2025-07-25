import { AuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import db from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export const authOptions: AuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      name: 'Email & Password',
      credentials: {
        email: { label: 'E-Mail', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(creds) {
        if (!creds?.email || !creds.password) {
          console.log('Missing credentials:', {
            email: creds?.email,
            hasPassword: !!creds?.password,
          });
          return null;
        }

        console.log('Attempting login for:', creds.email);

        const user = await db
          .select()
          .from(users)
          .where(eq(users.email, creds.email))
          .get();

        if (!user) {
          console.log('User not found:', creds.email);
          return null;
        }

        console.log('User found, checking password...');
        const pwOk = await bcrypt.compare(creds.password, user.passwordHash);

        if (!pwOk) {
          console.log('Password mismatch for user:', creds.email);
          return null;
        }

        console.log('Login successful for:', creds.email);
        return {
          id: String(user.id),
          email: user.email,
          isAdmin: user.isAdmin,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.isAdmin = (user as any).isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub;
        (session.user as any).isAdmin = token.isAdmin;
      }
      return session;
    },
    async signIn({ user }) {
      /* first user becomes admin */
      const count = await db
        .select({ c: sql`count(*) as c` })
        .from(users)
        .get();
      if (count?.c === 1 && !(user as any).isAdmin) {
        await db
          .update(users)
          .set({ isAdmin: true })
          .where(eq(users.id, Number((user as any).id)));
      }
      return true;
    },
  },
  pages: {
    signIn: '/login',
  },
};

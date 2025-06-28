import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import { MongoClient } from 'mongodb';
import { connectDB, User } from '@/models';
import bcrypt from 'bcryptjs';

// MongoDB client for NextAuth adapter
const client = new MongoClient(process.env.DATABASE_URL!);
const clientPromise = client.connect();

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          await connectDB();
          
          const user = await User.findOne({ email: credentials.email });

          if (!user || !user.password) {
            return null;
          }

          // Compare password using bcrypt
          const isValidPassword = await bcrypt.compare(credentials.password, user.password);

          if (!isValidPassword) {
            return null;
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.avatar,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();
          
          const existingUser = await User.findOne({ email: user.email! });

          if (!existingUser) {
            await User.create({
              email: user.email!,
              name: user.name!,
              avatar: user.image,
              role: 'VIEWER',
            });
          }
        } catch (error) {
          console.error('Error during sign in:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        try {
          await connectDB();
          
          const dbUser = await User.findOne({ email: user.email! });
          
          token.role = dbUser?.role || 'VIEWER';
          token.userId = dbUser?._id.toString();
          token.isActive = dbUser?.isActive || false;
        } catch (error) {
          console.error('JWT callback error:', error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.userId as string;
        (session.user as any).role = token.role;
        (session.user as any).isActive = token.isActive;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
};

// Permission definitions
export const permissions = {
  INVENTORY_READ: 'inventory:read',
  INVENTORY_WRITE: 'inventory:write',
  INVENTORY_DELETE: 'inventory:delete',
  PRODUCTS_MANAGE: 'products:manage',
  REPORTS_VIEW: 'reports:view',
  REPORTS_GENERATE: 'reports:generate',
  FORECASTS_VIEW: 'forecasts:view',
  FORECASTS_MANAGE: 'forecasts:manage',
  USERS_MANAGE: 'users:manage',
  ADMIN_ACCESS: 'admin:access',
  ALERTS_MANAGE: 'alerts:manage',
} as const;

export const rolePermissions = {
  ADMIN: Object.values(permissions),
  MANAGER: [
    permissions.INVENTORY_READ,
    permissions.INVENTORY_WRITE,
    permissions.PRODUCTS_MANAGE,
    permissions.REPORTS_VIEW,
    permissions.REPORTS_GENERATE,
    permissions.FORECASTS_VIEW,
    permissions.FORECASTS_MANAGE,
    permissions.ALERTS_MANAGE,
  ],
  VIEWER: [
    permissions.INVENTORY_READ,
    permissions.REPORTS_VIEW,
    permissions.FORECASTS_VIEW,
  ],
};

export function hasPermission(userRole: string, permission: string): boolean {
  return rolePermissions[userRole as keyof typeof rolePermissions]?.includes(permission as any) || false;
}

export function requirePermission(permission: string) {
  return (userRole: string) => {
    if (!hasPermission(userRole, permission)) {
      throw new Error('Insufficient permissions');
    }
  };
} 
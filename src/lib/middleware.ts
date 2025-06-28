import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { hasPermission } from './auth';
import { verifyAccessToken } from './jwt';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
  };
}

export async function withAuth(
  req: NextRequest,
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = {
      id: token.userId as string,
      email: token.email as string,
      name: token.name as string,
      role: token.role as string,
      isActive: token.isActive as boolean,
    };

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is inactive' },
        { status: 403 }
      );
    }

    (req as AuthenticatedRequest).user = user;
    return handler(req as AuthenticatedRequest);
  } catch (error) {
    console.error('Authentication error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}

export function withPermission(permission: string) {
  return (
    handler: (req: AuthenticatedRequest) => Promise<NextResponse>
  ) => {
    return async (req: AuthenticatedRequest) => {
      if (!req.user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }

      if (!hasPermission(req.user.role, permission)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }

      return handler(req);
    };
  };
}

export function validateRequestBody<T>(
  schema: any,
  handler: (req: AuthenticatedRequest, body: T) => Promise<NextResponse>
) {
  return async (req: AuthenticatedRequest) => {
    try {
      const body = await req.json();
      const validatedData = schema.parse(body);
      return handler(req, validatedData);
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error },
        { status: 400 }
      );
    }
  };
}

export function handleApiError(error: any): NextResponse {
  console.error('API Error:', error);

  // Handle MongoDB duplicate key errors
  if (error.code === 11000) {
    return NextResponse.json(
      { error: 'Record already exists' },
      { status: 409 }
    );
  }

  // Handle validation errors
  if (error.name === 'ValidationError') {
    return NextResponse.json(
      { error: 'Validation failed', details: error.message },
      { status: 400 }
    );
  }

  // Handle cast errors (invalid ObjectId)
  if (error.name === 'CastError') {
    return NextResponse.json(
      { error: 'Invalid ID format' },
      { status: 400 }
    );
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// List of protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/inventory',
  '/analytics',
  '/alerts',
  '/settings',
  '/api/dashboard',
  '/api/inventory',
  '/api/products',
  '/api/forecasts',
  '/api/brands',
  '/api/categories',
];

// List of auth routes that should redirect if user is already authenticated
const authRoutes = [
  '/auth/login',
  '/auth/signup',
  '/auth/forgot-password',
];

export function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get tokens from cookies
  const accessToken = request.cookies.get('accessToken')?.value;
  const refreshToken = request.cookies.get('refreshToken')?.value;

  // Verify access token
  const user = accessToken ? verifyAccessToken(accessToken) : null;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if route is auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // If accessing protected route without valid token
  if (isProtectedRoute && !user) {
    // If no tokens at all, redirect to login
    if (!accessToken && !refreshToken) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // If access token is invalid but refresh token exists, 
    // let the client handle refresh (don't redirect)
    if (!user && refreshToken) {
      // Add header to indicate token refresh needed
      const response = NextResponse.next();
      response.headers.set('X-Token-Expired', 'true');
      return response;
    }

    // No valid tokens, redirect to login
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  // If accessing auth routes while authenticated, redirect to dashboard
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Add user info to headers for API routes
  if (user && pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    response.headers.set('X-User-Id', user.userId);
    response.headers.set('X-User-Email', user.email);
    response.headers.set('X-User-Role', user.role);
    return response;
  }

  return NextResponse.next();
}

// Helper function to get user from request in API routes
export function getUserFromRequest(request: NextRequest) {
  const userId = request.headers.get('X-User-Id');
  const email = request.headers.get('X-User-Email');
  const role = request.headers.get('X-User-Role');

  if (!userId || !email || !role) {
    return null;
  }

  return {
    userId,
    email,
    role,
  };
} 
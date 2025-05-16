import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jwt from 'jsonwebtoken';

// Paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
];

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  // Check if path is public
  const isPublicPath = publicPaths.some(publicPath => 
    path === publicPath || path.startsWith('/static/') || path.startsWith('/_next/')
  );
  
  if (isPublicPath) {
    return NextResponse.next();
  }
  
  // Get access token from cookies
  const accessToken = request.cookies.get('accessToken')?.value;
  
  // If no token, redirect to login
  if (!accessToken) {
    // If API request, return 401
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Otherwise redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  try {
    // Verify token
    jwt.verify(
      accessToken,
      process.env.JWT_SECRET || 'fallback_secret'
    );
    
    return NextResponse.next();
  } catch (error) {
    // If token is invalid or expired
    
    // Try to refresh token
    const refreshToken = request.cookies.get('refreshToken')?.value;
    
    if (!refreshToken) {
      // If API request, return 401
      if (path.startsWith('/api/')) {
        return NextResponse.json(
          { message: 'Authentication required' },
          { status: 401 }
        );
      }
      
      // Otherwise redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }
    
    // Redirect to refresh endpoint
    // In a real app, you would handle token refresh here
    // For simplicity, we'll redirect to login
    
    // If API request, return 401
    if (path.startsWith('/api/')) {
      return NextResponse.json(
        { message: 'Token expired' },
        { status: 401 }
      );
    }
    
    // Otherwise redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

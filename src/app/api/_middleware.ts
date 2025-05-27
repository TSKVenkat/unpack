import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';

const allowedOrigins = [
  'http://localhost:3000',
  'https://your-production-domain.com',
];

const rateLimitStore: Record<string, { count: number; last: number }> = {};
const RATE_LIMIT = 100; // requests
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

export function middleware(req: NextRequest) {
  try {
    // CORS
    const origin = req.headers.get('origin');
    if (origin && !allowedOrigins.includes(origin)) {
      return new NextResponse('CORS Forbidden', { status: 403 });
    }

    // Rate limiting (per IP)
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    if (!rateLimitStore[ip]) {
      rateLimitStore[ip] = { count: 1, last: now };
    } else {
      if (now - rateLimitStore[ip].last > RATE_LIMIT_WINDOW) {
        rateLimitStore[ip] = { count: 1, last: now };
      } else {
        rateLimitStore[ip].count++;
        if (rateLimitStore[ip].count > RATE_LIMIT) {
          return new NextResponse('Rate limit exceeded', { status: 429 });
        }
      }
    }

    // Continue to next middleware or API handler
    return NextResponse.next();
  } catch (error) {
    Sentry.captureException(error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 
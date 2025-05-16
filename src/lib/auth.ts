/**
 * Authentication utilities for the Unpack application
 */
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import prisma from './prisma';

// Define JwtPayload interface since it's not exported from jsonwebtoken
interface JwtPayload {
  id: string;
  email?: string;
  name?: string | null;
  iat?: number;
  exp?: number;
}

// User type definition
export type User = {
  id: string;
  email: string;
  name: string | null;
};

// Generate JWT tokens
export const generateTokens = (user: User) => {
  const payload = {
    id: user.id,
    email: user.email,
    name: user.name
  };
  
  const accessToken = jwt.sign(
    payload,
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret',
    { expiresIn: '7d' }
  );
  
  return {
    accessToken,
    refreshToken
  };
};

// Verify JWT token
export const verifyToken = (token: string, secret: string) => {
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};

// Hash password
export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 10);
};

// Compare password with hash
export const comparePasswords = async (password: string, hashedPassword: string) => {
  return bcrypt.compare(password, hashedPassword);
};

// Get user from request
export const getUserFromRequest = (request: NextRequest) => {
  const accessToken = request.cookies.get('accessToken')?.value;
  
  if (!accessToken) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET || 'fallback_secret'
    ) as JwtPayload;
    
    return decoded;
  } catch (error) {
    return null;
  }
};

// Verify authentication and get user
export const verifyAuth = async (request: NextRequest) => {
  const accessToken = request.cookies.get('accessToken')?.value;
  
  if (!accessToken) {
    return { success: false, user: null };
  }
  
  try {
    const decoded = jwt.verify(
      accessToken,
      process.env.JWT_SECRET || 'fallback_secret'
    ) as JwtPayload;
    
    // Fetch user from database to ensure they still exist
    const user = await prisma.user.findUnique({
      where: { id: decoded.id as string }
    });
    
    if (!user) {
      return { success: false, user: null };
    }
    
    return { success: true, user };
  } catch (error) {
    // Check for refresh token
    const refreshToken = request.cookies.get('refreshToken')?.value;
    
    if (!refreshToken) {
      return { success: false, user: null };
    }
    
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'fallback_refresh_secret'
      ) as JwtPayload;
      
      // Fetch user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id as string }
      });
      
      if (!user) {
        return { success: false, user: null };
      }
      
      // Generate new access token (handled by client)
      return { success: true, user, refreshed: true };
    } catch (error) {
      return { success: false, user: null };
    }
  }
};

// Set authentication cookies
export const setAuthCookies = (response: any, tokens: { accessToken: string, refreshToken: string }) => {
  response.cookies.set('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60, // 15 minutes
    path: '/'
  });
  
  response.cookies.set('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/'
  });
  
  return response;
};

// Clear authentication cookies
export const clearAuthCookies = (response: any) => {
  response.cookies.set('accessToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  });
  
  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/'
  });
  
  return response;
};

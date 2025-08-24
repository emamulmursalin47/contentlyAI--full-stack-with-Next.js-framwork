import jwt from 'jsonwebtoken';
import dbConnect, { User } from './mongodb';
import { NextResponse } from 'next/server';

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-in-production';
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-change-in-production';

if (process.env.JWT_SECRET === 'fallback-secret-change-in-production') {
  console.warn('WARNING: JWT_SECRET is using a fallback value. Please set the JWT_SECRET environment variable for production.');
}
if (process.env.JWT_REFRESH_SECRET === 'fallback-refresh-secret-change-in-production') {
  console.warn('WARNING: JWT_REFRESH_SECRET is using a fallback value. Please set the JWT_REFRESH_SECRET environment variable for production.');
}
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export class AuthService {
  static generateTokens(userId: string, email: string) {
    const payload: JWTPayload = { userId, email };
    
    const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
    
    return { accessToken, refreshToken };
  }

  static verifyAccessToken(token: string): JWTPayload | null {
    try {
      const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
      console.log(`[AuthService.verifyAccessToken] Token verified successfully for userId: ${payload.userId}`);
      return payload;
    } catch (error) {
      console.error('[AuthService.verifyAccessToken] Access token verification failed:', error);
      if (error instanceof jwt.JsonWebTokenError) {
        console.error(`[AuthService.verifyAccessToken] JWT Error: ${error.message}`);
      } else {
        console.error(`[AuthService.verifyAccessToken] Unknown error during verification:`, error);
      }
      return null;
    }
  }

  static verifyRefreshToken(token: string): JWTPayload | null {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET) as JWTPayload;
    } catch (error) {
      console.error('[AuthService.verifyRefreshToken] Refresh token verification failed:', error);
      return null;
    }
  }

  static async getUserFromToken(token: string) {
    const payload = this.verifyAccessToken(token);
    if (!payload) return null;

    try {
      await dbConnect();
      const user = await User.findById(payload.userId);
      return user;
    } catch (error) {
      console.error('[AuthService.getUserFromToken] Error fetching user:', error);
      return null;
    }
  }

  static createSessionCookies(accessToken: string, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    const secureFlag = isProduction ? 'Secure; ' : '';

    const accessCookie = `access_token=${accessToken}; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=${15 * 60}; Path=/`;
    const refreshCookie = `refresh_token=${refreshToken}; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=${7 * 24 * 60 * 60}; Path=/`;

    return [accessCookie, refreshCookie];
  }

  static clearSessionCookies() {
    const isProduction = process.env.NODE_ENV === 'production';
    const secureFlag = isProduction ? 'Secure; ' : '';

    const clearAccess = `access_token=; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=0; Path=/`;
    const clearRefresh = `refresh_token=; HttpOnly; ${secureFlag}SameSite=Lax; Max-Age=0; Path=/`;
    
    return [clearAccess, clearRefresh];
  }

  static setAuthCookies(response: NextResponse, accessToken: string, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieDomain = process.env.COOKIE_DOMAIN || undefined;

    // Set access token cookie
    response.cookies.set('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
      domain: cookieDomain, // Re-added
    });

    // Set refresh token cookie
    response.cookies.set('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
      domain: cookieDomain, // Re-added
    });

    // Set CORS headers
    response.headers.set('Access-Control-Allow-Origin', APP_URL);
    response.headers.set('Access-Control-Allow-Methods', 'POST, GET, HEAD, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    return response;
  }

  // Helper method to clear auth cookies from response
  static clearAuthCookies(response: NextResponse) {
    response.cookies.set('access_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    response.cookies.set('refresh_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  }
}
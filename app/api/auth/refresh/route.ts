import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth';
import dbConnect, { User } from '@/lib/mongodb';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const refreshToken = request.cookies.get('refresh_token')?.value;
    console.log('[/api/auth/refresh] Received refresh_token:', refreshToken ? '[present]' : '[not present]');
    
    if (!refreshToken) {
      console.log('[/api/auth/refresh] No refresh token found, returning 401.');
      return NextResponse.json(
        { error: 'Refresh token not found' }, 
        { status: 401 }
      );
    }

    const payload = AuthService.verifyRefreshToken(refreshToken);
    console.log('[/api/auth/refresh] Payload from verifyRefreshToken:', payload);
    
    if (!payload || !payload.userId) {
      console.log('[/api/auth/refresh] Invalid or expired refresh token, returning 401 and clearing cookies.');
      const response = NextResponse.json(
        { error: 'Invalid or expired refresh token' }, 
        { status: 401 }
      );
      
      const [clearAccess, clearRefresh] = AuthService.clearSessionCookies();
      response.headers.set('Set-Cookie', clearAccess);
      response.headers.append('Set-Cookie', clearRefresh);
      
      return response;
    }

    const user = await User.findById(payload.userId);
    console.log('[/api/auth/refresh] User found:', user ? '[present]' : '[not present]');
    
    if (!user) {
      console.log('[/api/auth/refresh] User not found for refresh token, returning 404 and clearing cookies.');
      const response = NextResponse.json(
        { error: 'User not found' }, 
        { status: 404 }
      );
      
      const [clearAccess, clearRefresh] = AuthService.clearSessionCookies();
      response.headers.set('Set-Cookie', clearAccess);
      response.headers.append('Set-Cookie', clearRefresh);
      
      return response;
    }

    // Implement token rotation: invalidate the old refresh token
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = 
      AuthService.generateTokens(user._id.toString(), user.email);
    console.log('[/api/auth/refresh] New tokens generated.');

    const response = NextResponse.json(
      { message: 'Tokens refreshed successfully' }, 
      { status: 200 }
    );
    
    AuthService.setAuthCookies(response, newAccessToken, newRefreshToken);
    console.log('[/api/auth/refresh] New cookies set.');
    return response;
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', APP_URL);
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}
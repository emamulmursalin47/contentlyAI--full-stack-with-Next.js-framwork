import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/lib/mongodb'; // Import User model
import { AuthService } from '@/lib/auth';
import { adminAuth } from '@/lib/firebaseAdmin';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function GET(request: NextRequest) {
  try {
    await dbConnect(); // Connect to MongoDB

    let user = null;
    let userId = null;

    // --- Attempt to authenticate via Firebase ID Token ---
    const authorizationHeader = request.headers.get('Authorization');
    const firebaseIdToken = authorizationHeader?.startsWith('Bearer ')
      ? authorizationHeader.split(' ')[1]
      : null;

    if (firebaseIdToken) {
      try {
        const decodedToken = await adminAuth.verifyIdToken(firebaseIdToken);
        user = await User.findOne({ firebaseUid: decodedToken.uid });
        
        if (user) {
          userId = user._id.toString();
        }
      } catch (firebaseError: unknown) {
        console.error('[/api/auth/me] Firebase ID token verification failed:', 
          firebaseError instanceof Error ? firebaseError.message : firebaseError);
        // Fall through to custom session check if Firebase token is invalid
      }
    }

    // --- If not authenticated via Firebase, attempt via custom session cookie ---
    if (!user) {
      const accessToken = request.cookies.get('access_token')?.value;
      console.log('[/api/auth/me] Retrieved access_token from cookies:', accessToken ? '[present]' : '[not present]');
      const payload = accessToken ? AuthService.verifyAccessToken(accessToken) : null;
      console.log('[/api/auth/me] Payload from verifyAccessToken:', payload);
      
      if (payload?.userId) {
        userId = payload.userId;
        user = await User.findById(userId);
        console.log('[/api/auth/me] User found via custom session:', user ? '[present]' : '[not present]');
      }
    }

    if (!user) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      // Set CORS headers for error response
      response.headers.set('Access-Control-Allow-Origin', APP_URL);
      response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    const finalResponse = NextResponse.json({
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        firebaseUid: user.firebaseUid,
        createdAt: user.createdAt,
      },
    });

    // Set CORS headers
    finalResponse.headers.set('Access-Control-Allow-Origin', APP_URL);
    finalResponse.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    finalResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    finalResponse.headers.set('Access-Control-Allow-Credentials', 'true');

    return finalResponse;

  } catch (error: unknown) {
    console.error('[/api/auth/me] Top-level error:', error instanceof Error ? error.message : error);
    console.error('[/api/auth/me] Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
    
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    // Set CORS headers for error response
    response.headers.set('Access-Control-Allow-Origin', APP_URL);
    response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    return response;
  }
}

// Add OPTIONS method for CORS preflight requests
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', APP_URL);
  response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true'); // Fixed typo here
  return response;
}
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect, { User } from '@/lib/mongodb';
import { AuthService } from '@/lib/auth';
import { adminAuth } from '@/lib/firebaseAdmin';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await request.json();
    const authorizationHeader = request.headers.get('Authorization');
    const firebaseIdToken = authorizationHeader?.startsWith('Bearer ')
      ? authorizationHeader.split(' ')[1]
      : null;

    let user;

    // Firebase authentication
    if (firebaseIdToken) {
      try {
        const decodedToken = await adminAuth.verifyIdToken(firebaseIdToken);
        user = await User.findOne({ firebaseUid: decodedToken.uid });

        if (!user) {
          // Create user if they don't exist but have valid Firebase token
          user = await User.create({
            email: decodedToken.email || email,
            firebaseUid: decodedToken.uid,
            fullName: decodedToken.name || email.split('@')[0],
          });
        }

        const { accessToken, refreshToken } = AuthService.generateTokens(
          user._id.toString(),
          user.email
        );

        const finalResponse = NextResponse.json({
          message: 'Login successful via Firebase',
          user: {
            id: user._id.toString(),
            email: user.email,
            fullName: user.fullName,
            avatarUrl: user.avatarUrl,
            firebaseUid: user.firebaseUid,
          },
        });

        AuthService.setAuthCookies(finalResponse, accessToken, refreshToken);
        return finalResponse;
      } catch (firebaseError) {
        console.error('Firebase ID token verification failed:', firebaseError);
        // Continue to custom login
      }
    }

    // Custom email/password authentication
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' }, 
        { status: 400 }
      );
    }

    user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' }, 
        { status: 401 }
      );
    }

    if (!user.password) {
      return NextResponse.json(
        { error: 'Please use Firebase login for this account' }, 
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' }, 
        { status: 401 }
      );
    }

    const { accessToken, refreshToken } = AuthService.generateTokens(
      user._id.toString(),
      user.email
    );

    const finalResponse = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user._id.toString(),
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        firebaseUid: user.firebaseUid,
      },
    });

    AuthService.setAuthCookies(finalResponse, accessToken, refreshToken);
    return finalResponse;
  } catch (error: unknown) {
    console.error('Login error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return NextResponse.json(
      { error: errorMessage },
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
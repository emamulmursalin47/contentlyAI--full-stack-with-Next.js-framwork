import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect, { User } from '@/lib/mongodb';
import { AuthService } from '@/lib/auth';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: NextRequest) {
  try {
    await dbConnect(); // Connect to MongoDB

    const { email, password, fullName, firebaseUid } = await request.json();

    // --- Input Validation ---
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    if (!firebaseUid && !password) {
      return NextResponse.json({ error: 'Password is required for custom registration' }, { status: 400 });
    }

    if (!firebaseUid && password && password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // --- Check for existing user ---
    let existingUser = null;
    if (firebaseUid) {
      existingUser = await User.findOne({ $or: [{ email }, { firebaseUid }] });
    } else {
      existingUser = await User.findOne({ email });
    }

    if (existingUser) {
      if (firebaseUid && existingUser.firebaseUid === firebaseUid) {
        // User already registered via Firebase, return existing user data
        const { accessToken, refreshToken } = AuthService.generateTokens(
          existingUser._id.toString(),
          existingUser.email
        );
        const finalResponse = NextResponse.json(
          {
            message: 'User already registered via Firebase, logged in.',
            user: {
              id: existingUser._id.toString(),
              email: existingUser.email,
              fullName: existingUser.fullName,
              firebaseUid: existingUser.firebaseUid,
            },
          },
          { status: 200 } // Return 200 OK if already registered and logging in
        );
        AuthService.setAuthCookies(finalResponse, accessToken, refreshToken);
        return finalResponse;
      } else if (existingUser.email === email) {
        return NextResponse.json({ error: 'User with this email already exists' }, { status: 409 });
      }
    }

    // --- Create User ---
    let newUser;
    if (firebaseUid) {
      // Firebase registration
      newUser = await User.create({
        email,
        fullName: fullName || email.split('@')[0],
        firebaseUid,
        // No password for Firebase users
      });
    } else {
      // Custom registration
      const hashedPassword = await bcrypt.hash(password, 10);
      newUser = await User.create({
        email,
        password: hashedPassword,
        fullName: fullName || email.split('@')[0],
      });
    }

    // --- Generate JWT and Set Cookies ---
    const { accessToken, refreshToken } = AuthService.generateTokens(
      newUser._id.toString(),
      newUser.email
    );

    const finalResponse = NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: newUser._id.toString(),
          email: newUser.email,
          fullName: newUser.fullName,
          firebaseUid: newUser.firebaseUid,
        },
      },
      { status: 201 }
    );

    AuthService.setAuthCookies(finalResponse, accessToken, refreshToken);

    return finalResponse;

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Add OPTIONS method for CORS preflight requests
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', APP_URL);
  response.headers.set('Access-Control-Allow-Methods', 'POST, GET, HEAD, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}
import { NextRequest, NextResponse } from 'next/server';
import dbConnect, { UserSettings } from '@/lib/mongodb';
import { AuthService } from '@/lib/auth'; // Import AuthService

export async function GET(request: NextRequest) {
  try {
    await dbConnect(); // Connect to MongoDB

    const accessToken = request.cookies.get('access_token')?.value;
    const payload = accessToken ? AuthService.verifyAccessToken(accessToken) : null;
    const userId = payload?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let settings = await UserSettings.findOne({ userId });

    if (!settings) {
      // If no settings exist, create default settings
      settings = await UserSettings.create({
        userId,
        defaultLlmModel: 'llama-3.1-70b-versatile',
        defaultPlatform: 'general',
        theme: 'light',
      });
    }

    return NextResponse.json({ settings });

  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect(); // Connect to MongoDB

    const accessToken = request.cookies.get('access_token')?.value;
    const payload = accessToken ? AuthService.verifyAccessToken(accessToken) : null;
    const userId = payload?.userId;
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();

    const settings = await UserSettings.findOneAndUpdate(
      { userId },
      { ...updates, updatedAt: new Date() },
      { new: true, upsert: true } // Create if not exists, return updated document
    );

    return NextResponse.json({ settings });

  } catch (error) {
    console.error('Settings update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
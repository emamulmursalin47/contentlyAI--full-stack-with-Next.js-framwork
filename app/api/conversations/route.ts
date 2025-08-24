import { NextRequest, NextResponse } from 'next/server';


import dbConnect, { Conversation, User } from '@/lib/mongodb';
import { AuthService } from '@/lib/auth';
import { adminAuth } from '@/lib/firebaseAdmin';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function authenticateUser(request: NextRequest) {
  // Try Firebase authentication first
  const authorizationHeader = request.headers.get('Authorization');
  const firebaseIdToken = authorizationHeader?.startsWith('Bearer ')
    ? authorizationHeader.split(' ')[1]
    : null;

  if (firebaseIdToken) {
    try {
      const decodedToken = await adminAuth.verifyIdToken(firebaseIdToken);
      const user = await User.findOne({ firebaseUid: decodedToken.uid });
      
      if (user) {
        return user._id.toString();
      }
    } catch (firebaseError) {
      console.error('Firebase authentication failed:', firebaseError);
      // Fall through to token authentication
    }
  }

  // Try token authentication
  const accessToken = request.cookies.get('access_token')?.value;
  const payload = accessToken ? AuthService.verifyAccessToken(accessToken) : null;
  
  return payload?.userId || null;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const userId = await authenticateUser(request);
    
    if (!userId) {
      const response = NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
      
      response.headers.set('Access-Control-Allow-Origin', APP_URL);
      response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      
      return response;
    }

    const conversations = await Conversation.find({ userId }).sort({ updatedAt: -1 });
    
    const finalResponse = NextResponse.json({
      conversations: conversations.map(conv => ({
        ...conv.toObject(),
        id: conv._id.toString()
      }))
    });
    
    finalResponse.headers.set('Access-Control-Allow-Origin', APP_URL);
    finalResponse.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    finalResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    finalResponse.headers.set('Access-Control-Allow-Credentials', 'true');
    
    return finalResponse;
  } catch (error: unknown) {
    console.error('Conversations fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch conversations';
    
    const response = NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
    
    response.headers.set('Access-Control-Allow-Origin', APP_URL);
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    
    return response;
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const userId = await authenticateUser(request);

    if (!userId) {
      const response = NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
      response.headers.set('Access-Control-Allow-Origin', APP_URL);
      response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    const { title, targetPlatform, llmModel } = await request.json();

    if (!title) {
      const response = NextResponse.json(
        { error: 'Title is required to create a new conversation' },
        { status: 400 }
      );
      response.headers.set('Access-Control-Allow-Origin', APP_URL);
      response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    const newConversation = new Conversation({
      userId,
      title,
      targetPlatform: targetPlatform || 'general', // Use provided or default
      llmModel: llmModel || 'llama-3.1-8b-instant', // Use provided or default
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await newConversation.save();

    const finalResponse = NextResponse.json(
      {
        conversation: {
          ...newConversation.toObject(),
          id: newConversation._id.toString(),
        },
      },
      { status: 201 } // 201 Created
    );

    finalResponse.headers.set('Access-Control-Allow-Origin', APP_URL);
    finalResponse.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    finalResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    finalResponse.headers.set('Access-Control-Allow-Credentials', 'true');

    return finalResponse;
  } catch (error: unknown) {
    console.error('Conversation creation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create conversation';

    const response = NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );

    response.headers.set('Access-Control-Allow-Origin', APP_URL);
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');

    return response;
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set('Access-Control-Allow-Origin', APP_URL);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}
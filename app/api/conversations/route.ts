import { NextRequest, NextResponse } from 'next/server';
import dbConnect, { User, Conversation } from '@/lib/mongodb';
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

    // Optional pagination parameters (backward compatible)
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100 items
    const skip = (page - 1) * limit;

    // Build query with optional pagination
    let query = Conversation.find({ userId }).sort({ updatedAt: -1 });
    
    // Only apply pagination if page parameter is provided
    if (searchParams.get('page')) {
      query = query.skip(skip).limit(limit);
    }

    // Select only necessary fields for list view
    const conversations = await query.select('title targetPlatform llmModel updatedAt createdAt');
    
    // Get total count for pagination (only if pagination is requested)
    let totalCount: number | undefined = undefined;
    if (searchParams.get('page')) {
      totalCount = await Conversation.countDocuments({ userId });
    }
    
    const responseData: {
      conversations: Array<{
        id: string;
        title: string;
        targetPlatform: string;
        llmModel: string;
        updatedAt: string;
        createdAt: string;
      }>;
      pagination?: {
        page: number;
        limit: number;
        total: number;
        pages: number;
        hasNext: boolean;
        hasPrev: boolean;
      };
    } = {
      conversations: conversations.map(conv => ({
        ...conv.toObject(),
        id: conv._id.toString()
      }))
    };

    // Add pagination metadata if requested
    if (searchParams.get('page') && totalCount !== undefined) {
      responseData.pagination = {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      };
    }
    
    const finalResponse = NextResponse.json(responseData);
    
    // Disable caching for real-time updates
    finalResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    finalResponse.headers.set('Pragma', 'no-cache');
    finalResponse.headers.set('Expires', '0');
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
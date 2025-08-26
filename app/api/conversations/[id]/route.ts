import { NextRequest, NextResponse } from 'next/server';
import dbConnect, { User, Conversation, Message } from '@/lib/mongodb';
import { AuthService } from '@/lib/auth';
import { adminAuth } from '@/lib/firebaseAdmin';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

async function authenticateUser(request: NextRequest): Promise<string | null> {
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
  if (accessToken) {
    try {
      const payload = AuthService.verifyAccessToken(accessToken);
      return payload?.userId || null;
    } catch (tokenError) {
      console.error('Token authentication failed:', tokenError);
    }
  }
  
  return null;
}

function setCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', APP_URL);
  response.headers.set('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const userId = await authenticateUser(request);
    const { id: conversationId } = await params;

    console.log(`[GET /api/conversations/${conversationId}] Received request for conversation ID: ${conversationId}, User ID: ${userId}`);

    if (!userId) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return setCorsHeaders(response);
    }

    if (!conversationId || typeof conversationId !== 'string') {
      const response = NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 });
      return setCorsHeaders(response);
    }

    const conversation = await Conversation.findOne({ _id: conversationId, userId });

    if (!conversation) {
      console.log(`[GET /api/conversations/${conversationId}] Conversation not found for ID: ${conversationId}, User ID: ${userId}`);
      const response = NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
      return setCorsHeaders(response);
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    console.log(`[GET /api/conversations/${conversationId}] Found ${messages.length} messages for conversation ID: ${conversationId}`);

    const responseData = {
      conversation: {
        ...conversation.toObject(),
        id: conversation._id.toString(),
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString()
      },
      messages: messages.map(msg => ({
        ...msg.toObject(),
        id: msg._id.toString(),
        createdAt: msg.createdAt.toISOString()
      }))
    };

    const finalResponse = NextResponse.json(responseData);
    // Disable caching for real-time updates
    finalResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    finalResponse.headers.set('Pragma', 'no-cache');
    finalResponse.headers.set('Expires', '0');
    return setCorsHeaders(finalResponse);

  } catch (error) {
    console.error('Conversation fetch error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const response = NextResponse.json({ error: errorMessage }, { status: 500 });
    return setCorsHeaders(response);
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const userId = await authenticateUser(request);
    const { id: conversationId } = await params;

    if (!userId) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return setCorsHeaders(response);
    }

    if (!conversationId || typeof conversationId !== 'string') {
      const response = NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 });
      return setCorsHeaders(response);
    }

    const body = await request.json();
    const { title, llmModel, targetPlatform } = body;

    const updateFields: { 
      title?: string; 
      llmModel?: string; 
      targetPlatform?: string; 
      updatedAt: Date 
    } = { updatedAt: new Date() };

    // Validate and set title
    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim().length === 0) {
        const response = NextResponse.json(
          { error: 'Title must be a non-empty string' },
          { status: 400 }
        );
        return setCorsHeaders(response);
      }
      updateFields.title = title.trim();
    }

    // Validate and set llmModel
    if (llmModel !== undefined) {
      const validModels = ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile', 'gemma2-9b-it', 'deepseek-r1-distill-llama-70b', 'openai/gpt-oss-120b', 'qwen/qwen3-32b'];
      if (!validModels.includes(llmModel)) {
        const response = NextResponse.json(
          { error: 'Invalid LLM model' },
          { status: 400 }
        );
        return setCorsHeaders(response);
      }
      updateFields.llmModel = llmModel;
    }

    // Validate and set targetPlatform
    if (targetPlatform !== undefined) {
      const validPlatforms = ['twitter', 'linkedin', 'instagram', 'facebook', 'tiktok', 'youtube', 'general'];
      if (!validPlatforms.includes(targetPlatform)) {
        const response = NextResponse.json(
          { error: 'Invalid target platform' },
          { status: 400 }
        );
        return setCorsHeaders(response);
      }
      updateFields.targetPlatform = targetPlatform;
    }

    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId, userId },
      updateFields,
      { new: true }
    );

    if (!conversation) {
      const response = NextResponse.json(
        { error: 'Conversation not found or unauthorized' },
        { status: 404 }
      );
      return setCorsHeaders(response);
    }

    const responseData = {
      conversation: {
        ...conversation.toObject(),
        id: conversation._id.toString(),
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString()
      }
    };

    const finalResponse = NextResponse.json(responseData);
    return setCorsHeaders(finalResponse);

  } catch (error) {
    console.error('Conversation update API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const response = NextResponse.json({ error: errorMessage }, { status: 500 });
    return setCorsHeaders(response);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const userId = await authenticateUser(request);
    const { id: conversationId } = await params;

    console.log('Attempting to delete conversation on backend. ID:', conversationId, 'User ID:', userId);

    if (!userId) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return setCorsHeaders(response);
    }

    if (!conversationId || typeof conversationId !== 'string') {
      const response = NextResponse.json({ error: 'Invalid conversation ID' }, { status: 400 });
      return setCorsHeaders(response);
    }

    // Delete the conversation
    const result = await Conversation.deleteOne({ _id: conversationId, userId });
    console.log('Delete result:', result);

    if (result.deletedCount === 0) {
      const response = NextResponse.json(
        { error: 'Conversation not found or unauthorized' },
        { status: 404 }
      );
      return setCorsHeaders(response);
    }

    // Also delete associated messages
    await Message.deleteMany({ conversationId });

    const finalResponse = NextResponse.json({ 
      message: 'Conversation and associated messages deleted successfully' 
    });
    return setCorsHeaders(finalResponse);

  } catch (error) {
    console.error('Conversation deletion API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const response = NextResponse.json({ error: errorMessage }, { status: 500 });
    return setCorsHeaders(response);
  }
}

export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  return setCorsHeaders(response);
}
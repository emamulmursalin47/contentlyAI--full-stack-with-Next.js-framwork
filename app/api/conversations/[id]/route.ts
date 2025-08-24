import { NextRequest, NextResponse } from 'next/server';
import dbConnect, { Conversation, Message } from '@/lib/mongodb'; // Import Message
import { AuthService } from '@/lib/auth'; // Import AuthService
import { revalidatePath } from 'next/cache';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect(); // Connect to MongoDB

    const accessToken = request.cookies.get('access_token')?.value;
    const payload = accessToken ? AuthService.verifyAccessToken(accessToken) : null;
    const userId = payload?.userId;

    const { id: conversationId } = await params;

    console.log(`[GET /api/conversations/${conversationId}] Received request for conversation ID: ${conversationId}, User ID: ${userId}`);

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversation = await Conversation.findOne({ _id: conversationId, userId });

    if (!conversation) {
      console.log(`[GET /api/conversations/${conversationId}] Conversation not found for ID: ${conversationId}, User ID: ${userId}`);
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
    console.log(`[GET /api/conversations/${conversationId}] Found ${messages.length} messages for conversation ID: ${conversationId}`);

    const finalResponse = NextResponse.json({ conversation: { ...conversation.toObject(), id: conversation._id.toString() }, messages: messages.map(msg => ({ ...msg.toObject(), id: msg._id.toString() })) });
    finalResponse.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    finalResponse.headers.set('Access-Control-Allow-Methods', 'GET, HEAD');
    finalResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    finalResponse.headers.set('Access-Control-Allow-Credentials', 'true');
    return finalResponse;

  } catch (error) {
    console.error('Conversation fetch error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    response.headers.set('Access-Control-Allow-Methods', 'GET, HEAD');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect(); // Connect to MongoDB

    const accessToken = request.cookies.get('access_token')?.value;
    const payload = accessToken ? AuthService.verifyAccessToken(accessToken) : null;
    const userId = payload?.userId;

    const { id: conversationId } = await params;

    if (!userId) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
      response.headers.set('Access-Control-Allow-Methods', 'PUT');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    const { title, llmModel, targetPlatform } = await request.json();

    const updateFields: { title?: string; llmModel?: string; targetPlatform?: string; updatedAt: Date } = { updatedAt: new Date() };
    if (title !== undefined) updateFields.title = title;
    if (llmModel !== undefined) updateFields.llmModel = llmModel;
    if (targetPlatform !== undefined) updateFields.targetPlatform = targetPlatform;

    const conversation = await Conversation.findOneAndUpdate(
      { _id: conversationId, userId },
      updateFields,
      { new: true } // Return the updated document
    );

    if (!conversation) {
      const response = NextResponse.json(
        { error: 'Conversation not found or unauthorized' },
        { status: 404 }
      );
      response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
      response.headers.set('Access-Control-Allow-Methods', 'PUT');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    const finalResponse = NextResponse.json({ conversation: { ...conversation.toObject(), id: conversation._id.toString() } });
    finalResponse.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    finalResponse.headers.set('Access-Control-Allow-Methods', 'PUT');
    finalResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    finalResponse.headers.set('Access-Control-Allow-Credentials', 'true');
    revalidatePath('/chat'); // Revalidate the /chat path to update the sidebar
    return finalResponse;

  } catch (error) {
    console.error('Conversation update API error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    response.headers.set('Access-Control-Allow-Methods', 'PUT');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect(); // Connect to MongoDB

    const accessToken = request.cookies.get('access_token')?.value;
    const payload = accessToken ? AuthService.verifyAccessToken(accessToken) : null;
    const userId = payload?.userId;

    const { id: conversationId } = await params;

    console.log('Attempting to delete conversation on backend. ID:', conversationId, 'User ID:', userId); // Add this line

    if (!userId) {
      const response = NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
      response.headers.set('Access-Control-Allow-Methods', 'DELETE');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    const result = await Conversation.deleteOne({ _id: conversationId, userId });

    console.log('Delete result:', result); // Add this line

    if (result.deletedCount === 0) {
      const response = NextResponse.json(
        { error: 'Conversation not found or unauthorized' },
        { status: 404 }
      );
      response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
      response.headers.set('Access-Control-Allow-Methods', 'DELETE');
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      return response;
    }

    const finalResponse = NextResponse.json({ message: 'Conversation deleted successfully' });
    finalResponse.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    finalResponse.headers.set('Access-Control-Allow-Methods', 'DELETE');
    finalResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    finalResponse.headers.set('Access-Control-Allow-Credentials', 'true');
    return finalResponse;

  } catch (error) {
    console.error('Conversation deletion API error:', error);
    const response = NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    response.headers.set('Access-Control-Allow-Origin', 'http://localhost:3000');
    response.headers.set('Access-Control-Allow-Methods', 'DELETE');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    return response;
  }
}
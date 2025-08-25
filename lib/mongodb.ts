import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

declare global {
  var mongoose: {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
  };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null
  };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;

// Define Mongoose Schemas

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false, select: false }, // Made password optional
  fullName: { type: String },
  avatarUrl: { type: String },
  firebaseUid: { type: String, unique: true, sparse: true }, // Added for Firebase integration
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Add additional indexes for better query performance (email and firebaseUid already have unique indexes)
userSchema.index({ createdAt: -1 });

const conversationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  title: { type: String, required: true },
  targetPlatform: {
    type: String,
    enum: ['twitter', 'linkedin', 'instagram', 'facebook', 'tiktok', 'youtube', 'general'],
    default: 'general',
  },
  llmModel: {
    type: String,
    enum: ['llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma-7b-it', 'deepseek-r1-distill-llama-70b'],
    default: 'llama-3.1-8b-instant',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Add compound indexes for efficient queries
conversationSchema.index({ userId: 1, updatedAt: -1 });
conversationSchema.index({ userId: 1, createdAt: -1 });

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Conversation' },
  role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
  content: { type: String, required: true },
  thinkingContent: { type: String }, // Added thinkingContent
  createdAt: { type: Date, default: Date.now },
});

// Add indexes for message queries
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ conversationId: 1, role: 1 });

const userSettingsSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, ref: 'User' },
  defaultLlmModel: { 
    type: String, 
    enum: ['llama-3.1-8b-instant', 'mixtral-8x7b-32768', 'gemma-7b-it', 'deepseek-r1-distill-llama-70b'], 
    default: 'llama-3.1-8b-instant' 
  },
  defaultPlatform: { 
    type: String, 
    enum: ['twitter', 'linkedin', 'instagram', 'facebook', 'tiktok', 'youtube', 'general'], 
    default: 'general' 
  },
  theme: { type: String, default: 'light' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
export const Conversation = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
export const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export const UserSettings = mongoose.models.UserSettings || mongoose.model('UserSettings', userSettingsSchema);

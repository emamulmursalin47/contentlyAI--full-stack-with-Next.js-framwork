// lib/firebaseAdmin.ts
import * as admin from 'firebase-admin';

let adminAuth: admin.auth.Auth;

if (!admin.apps.length) {
  try {
    const configEnvVar = process.env.FIREBASE_ADMIN_SDK_CONFIG;

    if (!configEnvVar) {
      throw new Error('FIREBASE_ADMIN_SDK_CONFIG environment variable is not set.');
    }

    let jsonString = configEnvVar.trim();
    if (jsonString.startsWith("'") && jsonString.endsWith("'")) {
      jsonString = jsonString.substring(1, jsonString.length - 1);
    }

    const serviceAccount = JSON.parse(jsonString.replace(/\n/g, '\n'));

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log('[firebaseAdmin.ts] Firebase Admin SDK initialized successfully.');

  } catch (error: unknown) {
    console.error('[firebaseAdmin.ts] Firebase Admin initialization error:', error instanceof Error ? error.message : error);
    console.error('[firebaseAdmin.ts] Error stack:', error instanceof Error ? error.stack : 'No stack trace available');
    // Exit the process if initialization fails, as it's a critical dependency
    process.exit(1);
  }
}

// Ensure the app is initialized before getting auth
if (admin.apps.length > 0) {
  adminAuth = admin.auth();
} else {
  // This block should ideally not be reached if the process exits on failure
  console.error('[firebaseAdmin.ts] Firebase Admin SDK not initialized. Auth service is unavailable.');
  // You might want to throw an error here or handle it gracefully
  // For now, we'll throw to prevent runtime errors
  throw new Error('Firebase Admin SDK not initialized.');
}


export { adminAuth };

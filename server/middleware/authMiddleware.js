import admin from 'firebase-admin';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-gemini-journal-secret-key-32chars-min!';

// Initialize Firebase Admin if credentials / default credentials available
let firebaseAdminInitialized = false;

function initFirebaseAdmin() {
  if (!firebaseAdminInitialized && !admin.apps.length) {
    try {
      const projectId = process.env.GCP_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID;
      if (projectId) {
        admin.initializeApp({
          projectId: projectId,
        });
        firebaseAdminInitialized = true;
        console.log('[AuthMiddleware] Firebase Admin SDK initialized for project:', projectId);
      }
    } catch (err) {
      console.warn('[AuthMiddleware] Firebase Admin initialization notice:', err.message);
    }
  }
}

initFirebaseAdmin();

/**
 * Express middleware to authenticate requests via Firebase ID token or signed JWT session.
 * Guarantees zero cross-user leakage by attaching decoded UID to req.user.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized: Missing or malformed Authorization header.',
      code: 'AUTH_REQUIRED'
    });
  }

  const token = authHeader.split('Bearer ')[1].trim();

  // 1. Try Firebase Admin token verification if available
  if (firebaseAdminInitialized) {
    try {
      const decodedFirebaseUser = await admin.auth().verifyIdToken(token);
      req.user = {
        uid: decodedFirebaseUser.uid,
        email: decodedFirebaseUser.email,
        name: decodedFirebaseUser.name || decodedFirebaseUser.email?.split('@')[0] || 'Journaler',
        authProvider: 'firebase'
      };
      return next();
    } catch (firebaseErr) {
      // If not a valid Firebase ID token, fallback to local JWT verify below
    }
  }

  // 2. Fallback: Verify signed JWT session (for local development, demo users, or hybrid auth)
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = {
      uid: decoded.uid || decoded.id,
      email: decoded.email,
      name: decoded.name || 'Demo User',
      authProvider: decoded.authProvider || 'jwt'
    };
    return next();
  } catch (jwtErr) {
    return res.status(403).json({
      error: 'Forbidden: Invalid or expired authentication credentials.',
      code: 'INVALID_TOKEN'
    });
  }
}

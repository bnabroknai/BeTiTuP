import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

/**
 * Handles Firestore errors securely by logging minimal info and throwing a generic message.
 * This prevents leaking PII (UID, Email) and internal paths to the UI or client-side logs.
 */
export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errorMessage = error instanceof Error ? error.message : String(error);

  // Log only the operation and a generic error for security
  // We avoid logging the full path and user info to prevent PII exposure in client logs
  console.error(`Firestore Error [${operationType}]:`, errorMessage);

  // Throw a generic error to the UI
  throw new Error(`Database operation failed (${operationType}). Please try again later.`);
}

export async function loginWithGoogle() {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (error) {
    console.error("Auth Error:", error);
    throw error;
  }
}

export function logout() {
  return auth.signOut();
}

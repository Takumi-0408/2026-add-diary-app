import { getAuthInstance } from './firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { getDb } from './firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export async function signUp(email: string, password: string, displayName: string): Promise<FirebaseUser> {
  const auth = getAuthInstance();
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(result.user, { displayName });
  const db = getDb();
  await setDoc(doc(db, 'users', result.user.uid), {
    id: result.user.uid,
    email,
    displayName,
    createdAt: serverTimestamp(),
  });
  return result.user;
}

export async function logIn(email: string, password: string): Promise<FirebaseUser> {
  const auth = getAuthInstance();
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function logOut(): Promise<void> {
  const auth = getAuthInstance();
  await signOut(auth);
}

export async function resetPassword(email: string): Promise<void> {
  const auth = getAuthInstance();
  await sendPasswordResetEmail(auth, email);
}

export function subscribeToAuthChanges(callback: (user: FirebaseUser | null) => void): () => void {
  const auth = getAuthInstance();
  const unsubscribe = onAuthStateChanged(auth, callback);
  return unsubscribe;
}

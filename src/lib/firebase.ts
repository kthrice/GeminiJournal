import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  Firestore,
  getDocFromServer,
} from "firebase/firestore";
import type {
  JournalEntry,
  CreateJournalEntryInput,
  AuthUserProfile,
} from "../types";
import { OperationType, type FirestoreErrorInfo } from "../types";
import firebaseConfigJson from "../../firebase-applet-config.json";

// Initialize Firebase App safely
const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Use the designated databaseId if present, else default
export const db: Firestore = firebaseConfigJson.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigJson.firestoreDatabaseId)
  : getFirestore(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

// Strict payload sanitizer: strips all undefined values to prevent Firestore driver exceptions
export function sanitizeForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value) &&
        !(value instanceof Date)
      ) {
        result[key] = sanitizeForFirestore(value);
      } else {
        result[key] = value;
      }
    }
  }
  return result;
}

// Global Firestore Error Handler conforming to FirestoreErrorInfo standard
export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Authentication Helpers
export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  await firebaseSignOut(auth);
}

// Helper to retrieve freshly signed Firebase ID Token for backend Bearer headers
export async function getFreshIdToken(): Promise<string | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken(false);
}

export function subscribeToAuthChanges(callback: (user: AuthUserProfile | null) => void) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      callback({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });
    } else {
      callback(null);
    }
  });
}

// Helper verifying that the user is actively authenticated; returns the canonical UID
export function getAuthenticatedUid(): string {
  const currentUser = auth.currentUser;
  if (!currentUser || !currentUser.uid) {
    throw new Error("Unauthorized: An active authenticated Firebase user session is required.");
  }
  return currentUser.uid;
}

// Test initial connection to Firestore
export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.error("Please check your Firebase configuration.");
    }
  }
}

// Boot connection check
testConnection().catch(() => {});

// ==============================================================================
// FIRESTORE DATA LAYER (users/{uid}/journalEntries/{entryId})
// ==============================================================================

/**
 * 1. createJournalEntry()
 * Creates a new reflective journal entry under users/{uid}/journalEntries/{entryId}.
 * - {uid} is derived directly and securely from the authenticated Firebase user session.
 * - {entryId} is generated automatically and uniquely by Firestore.
 * - Does not accept a caller-supplied userId or uid.
 */
export async function createJournalEntry(
  input: CreateJournalEntryInput
): Promise<JournalEntry> {
  const uid = getAuthenticatedUid();
  const entriesColRef = collection(db, "users", uid, "journalEntries");

  // Generate unique document reference via Firestore SDK
  const newEntryDocRef = doc(entriesColRef);
  const entryId = newEntryDocRef.id;
  const path = `users/${uid}/journalEntries/${entryId}`;

  const timestamp = Date.now();
  const entry: JournalEntry = {
    id: entryId,
    userId: uid,
    title: (input.title || "Reflective Journal Entry").trim().slice(0, 300),
    messages: Array.isArray(input.messages) ? input.messages.slice(-60) : [],
    summary: (input.summary || "").slice(0, 5000),
    themes:
      Array.isArray(input.themes) && input.themes.length > 0
        ? input.themes.slice(0, 5)
        : ["Self-Awareness", "Clarity", "Growth"],
    mood: (input.mood || "Mindful Reflection").slice(0, 80),
    moodConfidence:
      typeof input.moodConfidence === "number" && !isNaN(input.moodConfidence)
        ? Math.min(Math.max(input.moodConfidence, 0), 1)
        : 0.85,
    nextStep: (input.nextStep || "").slice(0, 1000),
    reflectionQuestion: (input.reflectionQuestion || "").slice(0, 1000),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  try {
    const cleanPayload = sanitizeForFirestore(entry);
    await setDoc(newEntryDocRef, cleanPayload);
    return entry;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

/**
 * 2. getJournalEntries()
 * Retrieves all journal entries under users/{uid}/journalEntries for the authenticated user,
 * ordered chronologically with the newest first.
 */
export async function getJournalEntries(): Promise<JournalEntry[]> {
  const uid = getAuthenticatedUid();
  const path = `users/${uid}/journalEntries`;
  const entriesColRef = collection(db, "users", uid, "journalEntries");
  const q = query(entriesColRef, orderBy("createdAt", "desc"));

  try {
    const snapshot = await getDocs(q);
    const entries: JournalEntry[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      entries.push({
        id: docSnap.id,
        userId: uid,
        title: data.title || "Reflective Journal Entry",
        messages: Array.isArray(data.messages) ? data.messages : [],
        summary: data.summary || "",
        themes: Array.isArray(data.themes) ? data.themes : [],
        mood: data.mood || "Mindful Reflection",
        moodConfidence:
          typeof data.moodConfidence === "number" ? data.moodConfidence : 0.85,
        nextStep: data.nextStep || "",
        reflectionQuestion: data.reflectionQuestion || "",
        createdAt: data.createdAt || Date.now(),
        updatedAt: data.updatedAt || Date.now(),
      });
    });
    return entries;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * 3. getJournalEntry(entryId)
 * Retrieves a single journal entry under users/{uid}/journalEntries/{entryId}.
 * Returns null if the document does not exist.
 */
export async function getJournalEntry(entryId: string): Promise<JournalEntry | null> {
  const uid = getAuthenticatedUid();
  if (!entryId || typeof entryId !== "string") {
    throw new Error("Invalid argument: entryId must be a non-empty string.");
  }

  const path = `users/${uid}/journalEntries/${entryId}`;
  const entryDocRef = doc(db, "users", uid, "journalEntries", entryId);

  try {
    const docSnap = await getDoc(entryDocRef);
    if (!docSnap.exists()) {
      return null;
    }
    const data = docSnap.data();
    return {
      id: docSnap.id,
      userId: uid,
      title: data.title || "Reflective Journal Entry",
      messages: Array.isArray(data.messages) ? data.messages : [],
      summary: data.summary || "",
      themes: Array.isArray(data.themes) ? data.themes : [],
      mood: data.mood || "Mindful Reflection",
      moodConfidence:
        typeof data.moodConfidence === "number" ? data.moodConfidence : 0.85,
      nextStep: data.nextStep || "",
      reflectionQuestion: data.reflectionQuestion || "",
      createdAt: data.createdAt || Date.now(),
      updatedAt: data.updatedAt || Date.now(),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

/**
 * 4. deleteJournalEntry(entryId)
 * Permanently removes a journal entry under users/{uid}/journalEntries/{entryId}.
 */
export async function deleteJournalEntry(entryId: string): Promise<void>;
export async function deleteJournalEntry(userIdOrEntryId: string, maybeEntryId?: string): Promise<void>;
export async function deleteJournalEntry(
  userIdOrEntryId: string,
  maybeEntryId?: string
): Promise<void> {
  const uid = getAuthenticatedUid();
  // Support both deleteJournalEntry(entryId) and legacy deleteJournalEntry(userId, entryId)
  const entryId = maybeEntryId ? maybeEntryId : userIdOrEntryId;

  if (!entryId || typeof entryId !== "string") {
    throw new Error("Invalid argument: entryId must be a non-empty string.");
  }

  const path = `users/${uid}/journalEntries/${entryId}`;
  const entryDocRef = doc(db, "users", uid, "journalEntries", entryId);

  try {
    await deleteDoc(entryDocRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Real-time reactive listener for the authenticated user's journalEntries.
 */
export function subscribeToJournalEntries(
  onUpdate: (entries: JournalEntry[]) => void,
  onError?: (error: Error) => void
): () => void;
export function subscribeToJournalEntries(
  userId: string,
  onUpdate: (entries: JournalEntry[]) => void,
  onError?: (error: Error) => void
): () => void;
export function subscribeToJournalEntries(
  param1: string | ((entries: JournalEntry[]) => void),
  param2?: ((entries: JournalEntry[]) => void) | ((error: Error) => void),
  param3?: (error: Error) => void
): () => void {
  let uid: string;
  let onUpdate: (entries: JournalEntry[]) => void;
  let onError: ((error: Error) => void) | undefined;

  if (typeof param1 === "string") {
    uid = param1;
    onUpdate = param2 as (entries: JournalEntry[]) => void;
    onError = param3;
  } else {
    uid = getAuthenticatedUid();
    onUpdate = param1;
    onError = param2 as ((error: Error) => void) | undefined;
  }

  const path = `users/${uid}/journalEntries`;
  const entriesColRef = collection(db, "users", uid, "journalEntries");
  const q = query(entriesColRef, orderBy("createdAt", "desc"));

  return onSnapshot(
    q,
    (snapshot) => {
      const entries: JournalEntry[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        entries.push({
          id: docSnap.id,
          userId: uid,
          title: data.title || "Reflective Journal Entry",
          messages: Array.isArray(data.messages) ? data.messages : [],
          summary: data.summary || "",
          themes: Array.isArray(data.themes) ? data.themes : [],
          mood: data.mood || "Mindful Reflection",
          moodConfidence:
            typeof data.moodConfidence === "number" ? data.moodConfidence : 0.85,
          nextStep: data.nextStep || "",
          reflectionQuestion: data.reflectionQuestion || "",
          createdAt: data.createdAt || Date.now(),
          updatedAt: data.updatedAt || Date.now(),
        });
      });
      onUpdate(entries);
    },
    (err) => {
      console.error("Firestore journalEntries subscription error:", err.message);
      if (onError) {
        onError(err);
      } else {
        handleFirestoreError(err, OperationType.GET, path);
      }
    }
  );
}

// Backward-compatibility wrapper for any remaining legacy callers
export async function saveJournalEntry(
  userIdOrEntry: string | (Partial<JournalEntry> & { id?: string }),
  maybeEntry?: Partial<JournalEntry> & { id?: string }
): Promise<string> {
  const entryData = (maybeEntry || userIdOrEntry) as Partial<JournalEntry>;
  const created = await createJournalEntry({
    title: entryData.title,
    messages: entryData.messages || [],
    summary: entryData.summary || "",
    themes: entryData.themes || [],
    mood: entryData.mood || "Mindful Reflection",
    moodConfidence: entryData.moodConfidence || 0.85,
    nextStep: entryData.nextStep || "",
    reflectionQuestion: entryData.reflectionQuestion || "",
  });
  return created.id;
}

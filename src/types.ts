export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: number;
}

export interface ReflectionCompass {
  summary: string;
  themes: string[]; // exactly 3 main themes
  mood: string; // mood label, e.g. "Thoughtful Clarity", "Cautious Optimism", "Grounded Peace"
  moodConfidence: number; // confidence score e.g. 0.92 or 92
  nextStep: string; // one practical next step
  reflectionQuestion: string; // short reflection question
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  summary: string;
  themes: string[];
  mood: string;
  moodConfidence: number;
  nextStep: string;
  reflectionQuestion: string;
  createdAt: number;
  updatedAt: number;
}

export interface CreateJournalEntryInput {
  title?: string;
  messages: ChatMessage[];
  summary: string;
  themes: string[];
  mood: string;
  moodConfidence: number;
  nextStep: string;
  reflectionQuestion: string;
}

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export interface AuthUserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}


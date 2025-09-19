import { v4 as uuidv4 } from 'uuid';

// A simple in-memory fallback for environments where sessionStorage is not available.
const memoryStore: { [key: string]: string } = {};

const safeSessionStorage = {
  getItem(key: string): string | null {
    try {
      // Try to use sessionStorage
      return sessionStorage.getItem(key);
    } catch (e) {
      // If it fails, use in-memory fallback
      console.warn('sessionStorage is not available. Using in-memory fallback for session ID.');
      return memoryStore[key] || null;
    }
  },
  setItem(key: string, value: string): void {
    try {
      // Try to use sessionStorage
      sessionStorage.setItem(key, value);
    } catch (e) {
      // If it fails, use in-memory fallback
      console.warn('sessionStorage is not available. Using in-memory fallback for session ID.');
      memoryStore[key] = value;
    }
  },
};

const SESSION_ID_KEY = 'dili-guest-session-id';

/**
 * This function retrieves the session ID. It's not async but the manager wraps it
 * in a promise to allow for future async logic (e.g., fetching from a server).
 */
const getSessionIdInternal = (): string => {
  let sessionId = safeSessionStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = uuidv4();
    safeSessionStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
};

/**
 * Manages session-related data, providing a stable API for components
 * and handling browser compatibility issues internally.
 */
export const sessionManager = {
  /**
   * Gets the session ID, ensuring one is created if it doesn't exist.
   * This is wrapped in a Promise to allow for future asynchronous operations
   * without changing the calling component's code.
   */
  getSessionId: async (): Promise<string> => {
    return Promise.resolve(getSessionIdInternal());
  },
};
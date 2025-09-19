import { v4 as uuidv4 } from 'uuid';

// A simple in-memory fallback for environments where sessionStorage is not available.
const memoryStore: { [key: string]: string } = {};

class SessionManager {
  private readonly SESSION_ID_KEY = 'dili-guest-session-id';

  private safeSessionStorage = {
    getItem: (key: string): string | null => {
      try {
        return sessionStorage.getItem(key);
      } catch (e) {
        console.warn('sessionStorage is not available. Using in-memory fallback.');
        return memoryStore[key] || null;
      }
    },
    setItem: (key: string, value: string): void => {
      try {
        sessionStorage.setItem(key, value);
      } catch (e) {
        console.warn('sessionStorage is not available. Using in-memory fallback.');
        memoryStore[key] = value;
      }
    },
  };

  private getSessionIdInternal(): string {
    let sessionId = this.safeSessionStorage.getItem(this.SESSION_ID_KEY);
    if (!sessionId) {
      sessionId = uuidv4();
      this.safeSessionStorage.setItem(this.SESSION_ID_KEY, sessionId);
    }
    return sessionId;
  }

  public async getSessionId(): Promise<string> {
    return Promise.resolve(this.getSessionIdInternal());
  }
}

const sessionManager = new SessionManager();
export default sessionManager;
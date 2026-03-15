export interface SessionData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  athlete: any;
  isClubMember: boolean;
}

// Cache simple pour les données API
const apiCache = new Map();

export function getCachedData(key: string): any | null {
  const cached = apiCache.get(key);
  if (!cached) return null;
  
  // Cache valide pendant 30 minutes
  if (Date.now() - cached.timestamp > 30 * 60 * 1000) {
    apiCache.delete(key);
    return null;
  }
  
  return cached.data;
}

export function setCachedData(key: string, data: any): void {
  apiCache.set(key, {
    data,
    timestamp: Date.now()
  });
}

export function clearCache(): void {
  apiCache.clear();
}

export class SessionManager {
  private static sessions = new Map<string, SessionData>();

  static createSession(sessionId: string, data: SessionData): void {
    this.sessions.set(sessionId, data);
  }

  static getSession(sessionId: string): SessionData | undefined {
    return this.sessions.get(sessionId);
  }

  static updateSession(sessionId: string, data: Partial<SessionData>): void {
    const existing = this.sessions.get(sessionId);
    if (existing) {
      this.sessions.set(sessionId, { ...existing, ...data });
    }
  }

  static deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  static isTokenExpired(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return true;
    
    return Date.now() >= session.expiresAt * 1000;
  }
}

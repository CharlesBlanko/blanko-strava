export interface SessionData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  athlete: any;
  isClubMember: boolean;
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

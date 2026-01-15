/**
 * Session types
 */

export type SessionStatus = "active" | "completed";

export interface Session {
  sessionId: string;
  name: string;
  cwd: string;
  display?: string;
  needsInput?: boolean;
  tty?: string;
}

export interface SessionData {
  activeSessions: Session[];
  completedSessions: Session[];
}

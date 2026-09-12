import {
  UserSchema,
  EmailVerificationSchema,
  SessionSchema,
  CaseSchema,
  TimelineEventSchema,
  EvidenceSchema,
  AuditLogSchema,
  SettingsSchema,
  ReportSchema,
  MonitoringAlertSchema,
} from './database.schema';

/**
 * Database Repository Interface
 * Defines methods for CRUD operations on each table
 */

export interface IUserRepository {
  create(user: Omit<UserSchema, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserSchema>;
  findById(id: string): Promise<UserSchema | null>;
  findByEmail(email: string): Promise<UserSchema | null>;
  findByFacebookId(facebookId: string): Promise<UserSchema | null>;
  update(id: string, updates: Partial<UserSchema>): Promise<UserSchema>;
  delete(id: string): Promise<boolean>;
  updateLastLogin(id: string): Promise<void>;
}

export interface IEmailVerificationRepository {
  create(data: Omit<EmailVerificationSchema, 'id' | 'createdAt'>): Promise<EmailVerificationSchema>;
  findByEmail(email: string): Promise<EmailVerificationSchema | null>;
  verify(id: string): Promise<void>;
  incrementAttempts(id: string): Promise<void>;
  cleanup(): Promise<void>; // Remove expired codes
}

export interface ISessionRepository {
  create(session: Omit<SessionSchema, 'id' | 'createdAt' | 'updatedAt'>): Promise<SessionSchema>;
  findByRefreshToken(token: string): Promise<SessionSchema | null>;
  findByUserId(userId: string): Promise<SessionSchema[]>;
  revoke(sessionId: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
  cleanup(): Promise<void>; // Remove expired sessions
}

export interface ICaseRepository {
  create(data: Omit<CaseSchema, 'id' | 'createdAt' | 'updatedAt'>): Promise<CaseSchema>;
  findById(id: string): Promise<CaseSchema | null>;
  findByUserId(userId: string): Promise<CaseSchema[]>;
  update(id: string, updates: Partial<CaseSchema>): Promise<CaseSchema>;
  delete(id: string): Promise<boolean>;
  findByStatus(userId: string, status: string): Promise<CaseSchema[]>;
}

export interface ITimelineEventRepository {
  create(event: Omit<TimelineEventSchema, 'id' | 'createdAt'>): Promise<TimelineEventSchema>;
  findByCaseId(caseId: string): Promise<TimelineEventSchema[]>;
  delete(id: string): Promise<boolean>;
}

export interface IEvidenceRepository {
  create(evidence: Omit<EvidenceSchema, 'id' | 'createdAt'>): Promise<EvidenceSchema>;
  findById(id: string): Promise<EvidenceSchema | null>;
  findByCaseId(caseId: string): Promise<EvidenceSchema[]>;
  delete(id: string): Promise<boolean>;
}

export interface IAuditLogRepository {
  create(log: Omit<AuditLogSchema, 'id' | 'createdAt'>): Promise<AuditLogSchema>;
  findByUserId(userId: string, limit?: number, offset?: number): Promise<AuditLogSchema[]>;
  findByResourceId(resourceId: string): Promise<AuditLogSchema[]>;
  cleanup(daysToKeep?: number): Promise<void>; // Archive old logs
}

export interface ISettingsRepository {
  create(settings: Omit<SettingsSchema, 'id' | 'updatedAt'>): Promise<SettingsSchema>;
  findByUserId(userId: string): Promise<SettingsSchema | null>;
  update(userId: string, updates: Partial<SettingsSchema>): Promise<SettingsSchema>;
}

export interface IReportRepository {
  create(report: Omit<ReportSchema, 'id' | 'createdAt'>): Promise<ReportSchema>;
  findById(id: string): Promise<ReportSchema | null>;
  findByUserId(userId: string): Promise<ReportSchema[]>;
  update(id: string, updates: Partial<ReportSchema>): Promise<ReportSchema>;
  delete(id: string): Promise<boolean>;
}

export interface IMonitoringAlertRepository {
  create(alert: Omit<MonitoringAlertSchema, 'id' | 'createdAt'>): Promise<MonitoringAlertSchema>;
  findById(id: string): Promise<MonitoringAlertSchema | null>;
  findByUserId(userId: string): Promise<MonitoringAlertSchema[]>;
  update(id: string, updates: Partial<MonitoringAlertSchema>): Promise<MonitoringAlertSchema>;
  delete(id: string): Promise<boolean>;
  findActivePlatformAlerts(platform: string): Promise<MonitoringAlertSchema[]>;
}

/**
 * Combined Database Service Interface
 * Exposes all repositories
 */
export interface IDatabase {
  users: IUserRepository;
  emailVerifications: IEmailVerificationRepository;
  sessions: ISessionRepository;
  cases: ICaseRepository;
  timelineEvents: ITimelineEventRepository;
  evidence: IEvidenceRepository;
  auditLogs: IAuditLogRepository;
  settings: ISettingsRepository;
  reports: IReportRepository;
  monitoringAlerts: IMonitoringAlertRepository;
  
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  transaction<T>(callback: () => Promise<T>): Promise<T>;
}

/**
 * Query Builders for common operations
 */
export class UserQueries {
  static getActiveUsers(): string {
    return "SELECT * FROM users WHERE status = 'active'";
  }

  static getRecentlyVerified(days: number): string {
    return `SELECT * FROM users WHERE verified = true AND created_at > NOW() - INTERVAL '${days} days'`;
  }

  static getUserWithCaseCount(userId: string): string {
    return `
      SELECT u.*, COUNT(c.id) as case_count 
      FROM users u 
      LEFT JOIN cases c ON u.id = c.user_id 
      WHERE u.id = '${userId}' 
      GROUP BY u.id
    `;
  }
}

export class CaseQueries {
  static getUserCasesWithStatus(userId: string): string {
    return `SELECT * FROM cases WHERE user_id = '${userId}' ORDER BY created_at DESC`;
  }

  static getHighRiskCases(): string {
    return "SELECT * FROM cases WHERE risk = 'high' AND status != 'closed'";
  }

  static getCasesNeedingAttention(userId: string): string {
    return `
      SELECT * FROM cases 
      WHERE user_id = '${userId}' 
      AND status IN ('open', 'investigating') 
      ORDER BY risk DESC, created_at DESC
    `;
  }
}

export class SessionQueries {
  static getActiveSessions(userId: string): string {
    return `
      SELECT * FROM sessions 
      WHERE user_id = '${userId}' 
      AND is_revoked = false 
      AND refresh_token_expires_at > NOW()
    `;
  }

  static getExpiredSessions(): string {
    return `
      SELECT * FROM sessions 
      WHERE refresh_token_expires_at < NOW() 
      OR access_token_expires_at < NOW()
    `;
  }
}

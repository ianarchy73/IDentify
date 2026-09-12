/**
 * Database Schema Definitions
 * Tables and relationships for IDentify application
 */

/**
 * Users Table
 * Stores user account information
 */
export interface UserSchema {
  id: string; // Primary key
  email: string; // Unique email
  passwordHash?: string; // Optional for email-based login
  facebookId?: string; // Optional Facebook ID for OAuth
  name?: string;
  avatar?: string;
  verified: boolean;
  status: 'active' | 'suspended' | 'deleted';
  lastLogin: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Email Verification Codes Table
 * Stores temporary verification codes for email login
 */
export interface EmailVerificationSchema {
  id: string; // Primary key
  email: string; // Foreign key reference
  code: string; // 6-digit code
  expiresAt: Date; // Code expiration (typically 15 minutes)
  attempts: number; // Failed attempt counter
  verified: boolean;
  createdAt: Date;
}

/**
 * Session/Tokens Table
 * Stores active sessions and refresh tokens
 */
export interface SessionSchema {
  id: string; // Primary key
  userId: string; // Foreign key to Users
  accessToken: string; // JWT access token
  refreshToken: string; // JWT refresh token
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Cases Table
 * Stores impersonation/fraud cases
 */
export interface CaseSchema {
  id: string; // Primary key
  userId: string; // Foreign key to Users
  title: string;
  description?: string;
  url?: string;
  risk: 'high' | 'medium' | 'resolved';
  status: 'open' | 'investigating' | 'closed';
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

/**
 * Timeline Events Table
 * Stores events/updates within a case
 */
export interface TimelineEventSchema {
  id: string; // Primary key
  caseId: string; // Foreign key to Cases
  title: string;
  detail: string;
  eventType: 'update' | 'evidence' | 'contact' | 'resolution';
  createdAt: Date;
}

/**
 * Evidence/Attachments Table
 * Stores screenshots, images, links for cases
 */
export interface EvidenceSchema {
  id: string; // Primary key
  caseId: string; // Foreign key to Cases
  type: 'image' | 'url' | 'document' | 'video';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  uploadedBy: string; // Foreign key to Users
  createdAt: Date;
}

/**
 * Audit Logs Table
 * Stores user actions for monitoring and compliance
 */
export interface AuditLogSchema {
  id: string; // Primary key
  userId: string; // Foreign key to Users
  action: string;
  resourceType: string; // 'case', 'evidence', 'user', etc.
  resourceId: string;
  changes?: Record<string, unknown>; // JSON of what changed
  ipAddress?: string;
  createdAt: Date;
}

/**
 * Settings Table
 * Stores user preferences and settings
 */
export interface SettingsSchema {
  id: string; // Primary key
  userId: string; // Foreign key to Users
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone?: string;
  updatedAt: Date;
}

/**
 * Reports Table
 * Stores generated reports
 */
export interface ReportSchema {
  id: string; // Primary key
  userId: string; // Foreign key to Users
  title: string;
  type: 'summary' | 'detailed' | 'evidence';
  caseIds: string[]; // Array of case IDs included
  status: 'generating' | 'ready' | 'error';
  fileUrl?: string;
  createdAt: Date;
  expiresAt?: Date;
}

/**
 * Monitoring Alerts Table
 * Stores monitored accounts and alerts
 */
export interface MonitoringAlertSchema {
  id: string; // Primary key
  userId: string; // Foreign key to Users
  monitoredItem: string; // Email, username, etc.
  platform: string; // 'facebook', 'twitter', 'google', etc.
  alertType: 'new_account' | 'activity' | 'mention' | 'custom';
  isActive: boolean;
  lastChecked?: Date;
  createdAt: Date;
}

/**
 * Database Indexes
 * Recommended indexes for query performance
 */
export const DatabaseIndexes = {
  users: [
    'email', // Fast lookup by email
    'facebookId', // Fast lookup by Facebook ID
    'status', // Filter by user status
  ],
  emailVerification: [
    'email', // Find verification for email
    'expiresAt', // Cleanup expired codes
  ],
  sessions: [
    'userId', // Find sessions for user
    'refreshToken', // Validate refresh tokens
    'isRevoked', // Filter active sessions
  ],
  cases: [
    'userId', // User's cases
    'status', // Filter by status
    'risk', // Filter by risk level
    'createdAt', // Sort by date
  ],
  timelineEvents: [
    'caseId', // Events for case
    'createdAt', // Timeline order
  ],
  evidence: [
    'caseId', // Evidence for case
    'type', // Filter by type
  ],
  auditLogs: [
    'userId', // User's actions
    'resourceType', // Filter by resource
    'createdAt', // Time-based queries
  ],
  reports: [
    'userId', // User's reports
    'status', // Filter by status
  ],
};

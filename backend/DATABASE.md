# Database Schema Documentation

## Overview

The IDentify application uses a relational database with the following tables to store user accounts, cases, evidence, and monitoring data.

## Tables

### Users
Stores user account information and authentication data.

**Fields:**
- `id` - UUID primary key
- `email` - Unique email address
- `password_hash` - Hashed password (for email-based auth)
- `facebook_id` - Facebook ID (for OAuth login)
- `name` - User's display name
- `avatar` - Profile avatar URL
- `verified` - Email verification status
- `status` - Account status: 'active', 'suspended', 'deleted'
- `last_login` - Timestamp of last login
- `created_at` - Account creation timestamp
- `updated_at` - Last update timestamp

**Indexes:** email, facebook_id, status

---

### Email Verifications
Stores temporary verification codes for email-based login.

**Fields:**
- `id` - UUID primary key
- `email` - Email address to verify
- `code` - 6-digit verification code
- `expires_at` - Code expiration time (typically 15 minutes)
- `attempts` - Failed verification attempts
- `verified` - Whether email was successfully verified
- `created_at` - Code creation timestamp

**Indexes:** email, expires_at

---

### Sessions
Stores active user sessions and tokens.

**Fields:**
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `access_token` - JWT access token
- `refresh_token` - JWT refresh token (unique)
- `access_token_expires_at` - Access token expiration
- `refresh_token_expires_at` - Refresh token expiration
- `ip_address` - User's IP address
- `user_agent` - Browser/client info
- `is_revoked` - Whether session was revoked
- `created_at` - Session start timestamp
- `updated_at` - Last activity timestamp

**Indexes:** user_id, refresh_token, is_revoked

---

### Cases
Stores impersonation/fraud cases reported by users.

**Fields:**
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `title` - Case title
- `description` - Detailed description
- `url` - URL of impersonation or incident
- `risk` - Risk level: 'high', 'medium', 'resolved'
- `status` - Case status: 'open', 'investigating', 'closed'
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp
- `closed_at` - Closure timestamp

**Indexes:** user_id, status, risk, created_at

---

### Timeline Events
Stores chronological events/updates for a case.

**Fields:**
- `id` - UUID primary key
- `case_id` - Foreign key to cases
- `title` - Event title
- `detail` - Event details
- `event_type` - Type: 'update', 'evidence', 'contact', 'resolution'
- `created_at` - Event timestamp

**Indexes:** case_id, created_at

---

### Evidence
Stores files and artifacts attached to cases.

**Fields:**
- `id` - UUID primary key
- `case_id` - Foreign key to cases
- `type` - Evidence type: 'image', 'url', 'document', 'video'
- `file_url` - URL to uploaded file
- `file_name` - Original filename
- `file_size` - File size in bytes
- `uploaded_by` - User ID who uploaded evidence
- `created_at` - Upload timestamp

**Indexes:** case_id, type

---

### Audit Logs
Stores user actions for compliance and security auditing.

**Fields:**
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `action` - Action performed (e.g., 'case_created', 'evidence_added')
- `resource_type` - Type of resource affected ('case', 'evidence', 'user', etc.)
- `resource_id` - ID of affected resource
- `changes` - JSON object with before/after values
- `ip_address` - User's IP address
- `created_at` - Action timestamp

**Indexes:** user_id, resource_type, created_at

---

### Settings
Stores user preferences and settings.

**Fields:**
- `id` - UUID primary key
- `user_id` - Foreign key to users (unique)
- `email_notifications` - Enable email notifications
- `push_notifications` - Enable push notifications
- `theme` - UI theme: 'light', 'dark', 'auto'
- `language` - User's language preference
- `timezone` - User's timezone
- `updated_at` - Last update timestamp

---

### Reports
Stores generated reports.

**Fields:**
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `title` - Report title
- `type` - Report type: 'summary', 'detailed', 'evidence'
- `case_ids` - Array of case IDs included
- `status` - Report status: 'generating', 'ready', 'error'
- `file_url` - URL to generated report file
- `created_at` - Generation timestamp
- `expires_at` - Report expiration time (optional)

**Indexes:** user_id, status

---

### Monitoring Alerts
Stores monitored accounts and alert configurations.

**Fields:**
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `monitored_item` - What to monitor (email, username, etc.)
- `platform` - Platform to monitor: 'facebook', 'twitter', 'google', etc.
- `alert_type` - Alert type: 'new_account', 'activity', 'mention', 'custom'
- `is_active` - Whether monitoring is active
- `last_checked` - Last time checked
- `created_at` - Creation timestamp

**Indexes:** user_id, platform

---

## Running Migrations

### PostgreSQL
```bash
psql -U user -d database_name -f backend/migrations/001_initial_schema.sql
```

### SQLite
```bash
sqlite3 database.db < backend/migrations/001_initial_schema_sqlite.sql
```

## Database Relationships

```
users (1) ─── (many) sessions
users (1) ─── (many) cases
users (1) ─── (many) audit_logs
users (1) ─── (many) reports
users (1) ─── (many) monitoring_alerts
users (1) ─── (1) settings

cases (1) ─── (many) timeline_events
cases (1) ─── (many) evidence

evidence (many) ──── (1) users (uploaded_by)
```

## Cleanup Tasks

### Remove Expired Verification Codes
```sql
DELETE FROM email_verifications WHERE expires_at < NOW();
```

### Revoke Expired Sessions
```sql
UPDATE sessions SET is_revoked = true WHERE refresh_token_expires_at < NOW();
```

### Archive Old Audit Logs (older than 90 days)
```sql
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
```

## Recommended Maintenance

- Run cleanup tasks weekly
- Monitor table sizes and optimize queries
- Backup database daily
- Monitor index performance
- Archive/delete closed cases after retention period

## Type-Safe Operations

Use the repository interfaces defined in `database.ts` for type-safe database operations:

```typescript
// Example usage
const user = await db.users.findByEmail('user@example.com');
const cases = await db.cases.findByUserId(user.id);
await db.auditLogs.create({
  userId: user.id,
  action: 'case_viewed',
  resourceType: 'case',
  resourceId: cases[0].id,
});
```

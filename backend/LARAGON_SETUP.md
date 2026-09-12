# Applying Database Schema to Laragon

Laragon typically uses **MySQL** or **MariaDB**. Here are the methods to apply the schema:

## Method 1: Using phpMyAdmin (Easiest)

1. **Start Laragon** and click the "Web" button to open the dashboard
2. **Click phpMyAdmin** link
3. **Create a new database:**
   - Click "New" on the left
   - Database name: `identify_db`
   - Collation: `utf8mb4_unicode_ci`
   - Click "Create"

4. **Select the `identify_db` database** from the left sidebar

5. **Go to SQL tab** at the top

6. **Copy and paste the entire contents** of `backend/migrations/001_initial_schema_mysql.sql`

7. **Click "Go"** to execute

✅ Your database is now set up!

---

## Method 2: Using MySQL Command Line

1. **Open Laragon Terminal** (click "Terminal" button in Laragon)

2. **Run this command:**
   ```bash
   mysql -u root -p identify_db < backend/migrations/001_initial_schema_mysql.sql
   ```

3. **When prompted for password, just press Enter** (Laragon default has no password)

✅ Database is ready!

---

## Method 3: Using Laragon Console

1. **In Laragon, click "Terminal"**

2. **Verify MySQL is running:**
   ```bash
   mysql --version
   ```

3. **Connect to MySQL:**
   ```bash
   mysql -u root
   ```

4. **Create database and apply schema:**
   ```sql
   CREATE DATABASE identify_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE identify_db;
   -- Then paste the contents of 001_initial_schema_mysql.sql
   ```

---

## Verifying Your Database

**In phpMyAdmin or MySQL console, verify tables were created:**

```bash
mysql -u root -e "USE identify_db; SHOW TABLES;"
```

You should see these 10 tables:
- `users`
- `email_verifications`
- `sessions`
- `cases`
- `timeline_events`
- `evidence`
- `audit_logs`
- `settings`
- `reports`
- `monitoring_alerts`

---

## Connecting from Your Node.js App

### Using MySQL2 (Recommended)

1. **Install MySQL package:**
   ```bash
   npm install mysql2 dotenv
   ```

2. **Create `.env` file in your project root:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=identify_db
   ```

3. **Create `backend/db.ts`:**
   ```typescript
   import mysql from 'mysql2/promise';
   
   export const pool = mysql.createPool({
     host: process.env.DB_HOST || 'localhost',
     port: parseInt(process.env.DB_PORT || '3306'),
     user: process.env.DB_USER || 'root',
     password: process.env.DB_PASSWORD || '',
     database: process.env.DB_NAME || 'identify_db',
     waitForConnections: true,
     connectionLimit: 10,
     queueLimit: 0,
   });
   ```

4. **Use in your code:**
   ```typescript
   import { pool } from './db';
   
   async function getUserByEmail(email: string) {
     const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
     return rows[0];
   }
   ```

---

### Using Prisma ORM (Alternative)

1. **Install Prisma:**
   ```bash
   npm install @prisma/client
   npm install -D prisma
   ```

2. **Initialize Prisma:**
   ```bash
   npx prisma init
   ```

3. **Update `.env`:**
   ```env
   DATABASE_URL="mysql://root:@localhost:3306/identify_db"
   ```

4. **Create `prisma/schema.prisma`** - We can generate this from the database:
   ```bash
   npx prisma db pull
   ```

5. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

---

## Troubleshooting

### Error: "Access denied for user 'root'@'localhost'"
- Check if Laragon's MySQL is running (green icon)
- If Laragon requires a password, update it in `.env`

### Error: "Unknown database 'identify_db'"
- Make sure you created the database first (Method 1 Step 3)
- Or the CREATE DATABASE line didn't execute

### Table doesn't exist error
- Verify all tables appear in phpMyAdmin
- Re-run the SQL migration
- Check for SQL syntax errors in the migration file

### Connection timeout
- Ensure Laragon's MySQL service is running
- Check if port 3306 is available
- Restart Laragon

---

## Next Steps

1. ✅ Database schema created
2. ⏳ Set up Node.js database connection (mysql2 or Prisma)
3. ⏳ Implement repository classes for type-safe queries
4. ⏳ Create API endpoints that use the database
5. ⏳ Replace mock login handlers with real database queries

Would you like help with step 2 (setting up the database connection)?

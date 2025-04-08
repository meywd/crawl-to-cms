import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './shared/schema.js';

// For migrations
async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  console.log('Creating database connection...');
  const sql = postgres(connectionString, { max: 1 });
  const db = drizzle(sql, { schema });

  console.log('Creating schema...');

  // Create tables in order of dependencies
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        username VARCHAR(50) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        last_login TIMESTAMP,
        CONSTRAINT email_idx UNIQUE (email),
        CONSTRAINT username_idx UNIQUE (username)
      );
    `;
    console.log('Users table created');

    // Create crawls table
    await sql`
      CREATE TABLE IF NOT EXISTS crawls (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        url TEXT NOT NULL,
        depth INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'idle',
        options JSONB NOT NULL,
        started_at TIMESTAMP NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMP,
        page_count INTEGER DEFAULT 0,
        error TEXT
      );
    `;
    console.log('Crawls table created');

    // Create pages table
    await sql`
      CREATE TABLE IF NOT EXISTS pages (
        id SERIAL PRIMARY KEY,
        crawl_id INTEGER NOT NULL REFERENCES crawls(id),
        url TEXT NOT NULL,
        path TEXT NOT NULL,
        content TEXT NOT NULL,
        title TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log('Pages table created');

    // Create assets table
    await sql`
      CREATE TABLE IF NOT EXISTS assets (
        id SERIAL PRIMARY KEY,
        crawl_id INTEGER NOT NULL REFERENCES crawls(id),
        url TEXT NOT NULL,
        path TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log('Assets table created');

    // Create saved_sites table
    await sql`
      CREATE TABLE IF NOT EXISTS saved_sites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        crawl_id INTEGER NOT NULL REFERENCES crawls(id),
        url TEXT NOT NULL,
        name TEXT,
        page_count INTEGER NOT NULL,
        size INTEGER NOT NULL,
        saved_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `;
    console.log('Saved sites table created');

    // Create session table for connect-pg-simple
    await sql`
      CREATE TABLE IF NOT EXISTS "session" (
        "sid" varchar NOT NULL COLLATE "default",
        "sess" json NOT NULL,
        "expire" timestamp(6) NOT NULL,
        CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
      );
    `;
    console.log('Session table created');

    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
  } finally {
    await sql.end();
  }
}

main().catch(console.error);
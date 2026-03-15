#!/usr/bin/env node
/**
 * Simple migration runner for SolveIt (Supabase)
 * 
 * Usage:
 *   node scripts/migrate.js              # Run pending migrations
 *   node scripts/migrate.js --status     # Show migration status
 * 
 * Requires env vars: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

const fs = require('fs');
const path = require('path');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  console.error('   Run: source .env.local');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
};

async function rpcSql(sql) {
  // Use Supabase's rpc endpoint or REST. For raw SQL we need the management API.
  // Since we only have REST API, we'll use the rpc approach via a helper function.
  // Alternative: use supabase-js or pg directly.
  
  // For Supabase, we can execute SQL via the /rest/v1/rpc endpoint if we create a function,
  // or we can use the Supabase Management API. For simplicity, let's just track locally
  // and provide SQL to run manually.
  
  console.log('📋 SQL to execute in Supabase SQL Editor:');
  console.log('─'.repeat(60));
  console.log(sql);
  console.log('─'.repeat(60));
}

async function getAppliedMigrations() {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/schema_migrations?select=version,name,executed_at&order=version.asc`,
      { headers }
    );
    if (!res.ok) {
      // Table might not exist yet
      return null;
    }
    return await res.json();
  } catch {
    return null;
  }
}

async function recordMigration(version, name) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/schema_migrations`, {
    method: 'POST',
    headers: { ...headers, 'Prefer': 'return=representation' },
    body: JSON.stringify({ version, name }),
  });
  return res.ok;
}

async function main() {
  const statusOnly = process.argv.includes('--status');
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  
  // Get all migration files
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  console.log(`📁 Found ${files.length} migration file(s)\n`);
  
  // Get applied migrations
  const applied = await getAppliedMigrations();
  const appliedVersions = new Set(
    applied ? applied.map(m => m.version) : []
  );
  
  if (applied === null) {
    console.log('⚠️  schema_migrations table not found.');
    console.log('   Run migration 002_schema_migrations.sql first in Supabase SQL Editor.\n');
  }
  
  if (statusOnly) {
    console.log('Migration Status:');
    console.log('─'.repeat(50));
    for (const file of files) {
      const version = file.split('_')[0];
      const status = appliedVersions.has(version) ? '✅' : '⏳';
      const appliedAt = applied?.find(m => m.version === version)?.executed_at || '';
      console.log(`  ${status} ${file} ${appliedAt ? `(${new Date(appliedAt).toLocaleDateString()})` : '(pending)'}`);
    }
    return;
  }
  
  // Find pending migrations
  const pending = files.filter(f => {
    const version = f.split('_')[0];
    return !appliedVersions.has(version);
  });
  
  if (pending.length === 0) {
    console.log('✅ All migrations are up to date!');
    return;
  }
  
  console.log(`⏳ ${pending.length} pending migration(s):\n`);
  
  for (const file of pending) {
    const version = file.split('_')[0];
    const name = file.replace(/^\d+_/, '').replace('.sql', '');
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    
    console.log(`\n🔄 Migration ${version}: ${name}`);
    console.log('═'.repeat(60));
    console.log(sql);
    console.log('═'.repeat(60));
    console.log(`\n👆 Run this SQL in Supabase SQL Editor (https://supabase.com/dashboard)`);
    console.log(`   Then run: node scripts/migrate.js --record ${version} "${name}"`);
  }
  
  // --record flag: mark a migration as applied
  const recordIdx = process.argv.indexOf('--record');
  if (recordIdx !== -1) {
    const version = process.argv[recordIdx + 1];
    const name = process.argv[recordIdx + 2] || 'unknown';
    if (version) {
      const ok = await recordMigration(version, name);
      if (ok) {
        console.log(`\n✅ Recorded migration ${version} (${name}) as applied.`);
      } else {
        console.log(`\n❌ Failed to record migration ${version}.`);
      }
    }
  }
}

main().catch(console.error);

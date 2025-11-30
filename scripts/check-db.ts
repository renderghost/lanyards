import { createDb } from '../src/lib/db';
import path from 'path';

async function main() {
  const dbPath = path.join(process.cwd(), 'data', 'lanyards.db');
  console.log('Checking database at:', dbPath);

  const db = createDb(dbPath);

  console.log('\n--- Auth Sessions ---');
  const sessions = await db.selectFrom('auth_session').selectAll().execute();
  console.log(`Found ${sessions.length} sessions`);
  sessions.forEach(s => {
    console.log(`Key: ${s.key}`);
    console.log(`Session: ${s.session.substring(0, 100)}...`);
  });

  console.log('\n--- Auth State ---');
  const states = await db.selectFrom('auth_state').selectAll().execute();
  console.log(`Found ${states.length} states`);
  states.forEach(s => {
    console.log(`Key: ${s.key}`);
  });
}

main().catch(console.error);

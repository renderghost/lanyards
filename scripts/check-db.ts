import { createDb } from '../src/lib/db';

async function main() {
  console.log('Checking Postgres database...');
  console.log('POSTGRES_URL:', process.env.POSTGRES_URL ? 'Set' : 'Not set');

  const db = createDb();

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

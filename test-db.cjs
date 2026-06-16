const { Client } = require('pg');

const passwordsToTest = [
  'admin@1234',
  'admin@123',
  'admin123!',
  'salon404',
  'Salon404',
  '12345678',
  'Adriana',
  'adriana',
  'password123'
];

async function tryPassword(password) {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: password,
    database: 'postgres' // default db
  });

  try {
    await client.connect();
    console.log(`\nSUCCESS: The password is: "${password}"`);
    await client.end();
    return true;
  } catch (err) {
    if (err.message.includes('password authentication failed')) {
      process.stdout.write('.');
    } else {
      console.log(`\nError with password "${password}": ${err.message}`);
    }
    return false;
  }
}

async function run() {
  console.log('Testing passwords...');
  for (const pwd of passwordsToTest) {
    const success = await tryPassword(pwd);
    if (success) {
      process.exit(0);
    }
  }
  console.log('\nCould not find password.');
}

run();

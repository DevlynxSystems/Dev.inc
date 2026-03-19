/**
 * Seed script: creates many demo users (and optional admins).
 *
 * Run from Backend folder:
 *   node seedManyUsers.js
 *   npm run seed:many-users
 *
 * Env options:
 * - SEED_USERS_COUNT (default 25)
 * - SEED_ADMINS_COUNT (default 2)
 * - SEED_USERS_PASSWORD (default DemoUser123!)
 * - SEED_USERS_DOMAIN (default dev.inc)
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const dataBaseManager = require('./DatabaseManager');
const User = require('./models/User');

const mongoUri =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devinc_book_catalog';

const COUNT = Math.max(1, parseInt(process.env.SEED_USERS_COUNT || '25', 10) || 25);
const ADMINS = Math.max(0, parseInt(process.env.SEED_ADMINS_COUNT || '2', 10) || 2);
const PASSWORD = process.env.SEED_USERS_PASSWORD || 'DemoUser123!';
const DOMAIN = (process.env.SEED_USERS_DOMAIN || 'dev.inc').trim();

const FIRST_NAMES = [
  'Ava', 'Noah', 'Mia', 'Liam', 'Sofia', 'Ethan', 'Amelia', 'Lucas', 'Olivia', 'Mason',
  'Harper', 'James', 'Ella', 'Benjamin', 'Aria', 'Henry', 'Layla', 'Jack', 'Nora', 'Leo',
];
const LAST_NAMES = [
  'Patel', 'Singh', 'Shah', 'Khan', 'Mehta', 'Gupta', 'Reddy', 'Sharma', 'Das', 'Iyer',
  'Brown', 'Johnson', 'Williams', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Moore', 'Taylor', 'Anderson',
];

function pick(arr, i) {
  return arr[i % arr.length];
}

function makeUser(i, role) {
  const first = pick(FIRST_NAMES, i);
  const last = pick(LAST_NAMES, i * 7 + 3);
  const n = String(i + 1).padStart(3, '0');
  const email = `user${n}.${first.toLowerCase()}.${last.toLowerCase()}@${DOMAIN}`.replace(/\s+/g, '');

  return {
    name: `${first} ${last}`,
    email,
    password: PASSWORD,
    role,
  };
}

async function seed() {
  try {
    await dataBaseManager.connect(mongoUri);
    console.log('Connected. Seeding many users...');

    const hashed = await bcrypt.hash(String(PASSWORD), 10);

    const docs = [];
    for (let i = 0; i < COUNT; i++) {
      const role = i < ADMINS ? 'admin' : 'user';
      const u = makeUser(i, role);
      docs.push({
        name: u.name,
        email: u.email,
        password: hashed,
        role,
      });
    }

    const result = await User.insertMany(docs, { ordered: false }).catch((err) => {
      // Ignore duplicate key errors when re-running seed.
      if (err && (err.code === 11000 || err.writeErrors)) {
        return { insertedCount: (err.result && err.result.insertedCount) || 0 };
      }
      throw err;
    });

    const inserted = result?.insertedCount ?? (Array.isArray(result) ? result.length : 0);
    console.log(`Done. Inserted ~${inserted} users (duplicates skipped on reruns).`);
    console.log(`Password for seeded accounts: ${PASSWORD}`);
  } catch (err) {
    console.error('Seed many users failed:', err.message);
    process.exit(1);
  } finally {
    await dataBaseManager.disconnect();
  }
}

seed();


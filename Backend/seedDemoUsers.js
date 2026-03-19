/**
 * Seed script: creates/updates demo user and demo admin accounts.
 * Run from Backend folder: node seedDemoUsers.js
 *
 * Uses:
 * - MONGO_URI from .env (recommended) OR falls back to local MongoDB.
 *
 * Optional env overrides:
 * - DEMO_USER_EMAIL, DEMO_USER_PASSWORD, DEMO_USER_NAME
 * - DEMO_ADMIN_EMAIL, DEMO_ADMIN_PASSWORD, DEMO_ADMIN_NAME
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const dataBaseManager = require('./DatabaseManager');
const User = require('./models/User');

const mongoUri =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devinc_book_catalog';

const DEMO_USER = {
  name: process.env.DEMO_USER_NAME || 'Demo User',
  email: (process.env.DEMO_USER_EMAIL || 'demo.user@dev.inc')
    .toLowerCase()
    .trim(),
  password: process.env.DEMO_USER_PASSWORD || 'DemoUser123!',
  role: 'user',
};

const DEMO_ADMIN = {
  name: process.env.DEMO_ADMIN_NAME || 'Demo Admin',
  email: (process.env.DEMO_ADMIN_EMAIL || 'demo.admin@dev.inc')
    .toLowerCase()
    .trim(),
  password: process.env.DEMO_ADMIN_PASSWORD || 'DemoAdmin123!',
  role: 'admin',
};

async function upsertUser({ name, email, password, role }) {
  const hashed = await bcrypt.hash(String(password), 10);

  const update = {
    name: String(name).trim(),
    email,
    password: hashed,
    role,
  };

  const doc = await User.findOneAndUpdate(
    { email },
    { $set: update },
    { upsert: true, returnDocument: 'after', runValidators: true }
  );

  return doc;
}

async function seed() {
  try {
    await dataBaseManager.connect(mongoUri);
    console.log('Connected. Seeding demo users...');

    const user = await upsertUser(DEMO_USER);
    const admin = await upsertUser(DEMO_ADMIN);

    console.log('\nDemo accounts ready:\n');
    console.log('User:');
    console.log(`  email:    ${DEMO_USER.email}`);
    console.log(`  password: ${DEMO_USER.password}`);
    console.log(`  id:       ${user._id.toString()}`);

    console.log('\nAdmin:');
    console.log(`  email:    ${DEMO_ADMIN.email}`);
    console.log(`  password: ${DEMO_ADMIN.password}`);
    console.log(`  id:       ${admin._id.toString()}`);
    console.log('');
  } catch (err) {
    console.error('Seed demo users failed:', err.message);
    process.exit(1);
  } finally {
    await dataBaseManager.disconnect();
  }
}

seed();


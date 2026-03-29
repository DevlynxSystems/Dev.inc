const app = require('./app');
const dataBaseManager = require('./DatabaseManager');

const PORT = process.env.PORT || 5000;
const mongoUri =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devinc_book_catalog';

if (!process.env.MONGO_URI) {
  console.warn(
    'Warning: Backend/.env is missing MONGO_URI. Falling back to local MongoDB:'
  );
  console.warn(`  ${mongoUri}`);
}

async function start() {
  try {
    await dataBaseManager.connect(mongoUri);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

start();

const admin = require('firebase-admin');
const { Pool } = require('pg');

admin.initializeApp({
  credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_ADMIN_CONFIG))
});

const pool = new Pool({
  host: process.env.PGPOOL_HOST,
  port: process.env.POSTGRES_PORT,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB
});

admin.auth().onAuthStateChanged(async (user) => {
  if (user) {
    try {
      await pool.query(
        `INSERT INTO users (firebase_uid, email, last_login)
         VALUES ($1, $2, NOW())
         ON CONFLICT (firebase_uid) DO UPDATE
         SET last_login = NOW()`,
        [user.uid, user.email]
      );
      console.log(`Synced user: ${user.email}`);
    } catch (err) {
      console.error('Error syncing user:', err);
    }
  }
});

// Start the sync service
console.log('Firebase-PostgreSQL sync service started');

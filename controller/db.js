import pkg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Your database URL from Render
    ssl: {
        rejectUnauthorized: false, // Important for Render
    },
});

export default pool;
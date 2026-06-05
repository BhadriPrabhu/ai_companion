import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.connect()
    .then((client) => {
        console.log("Database connected successfully!");
        client.release();
    })
    .catch((err) => {
        console.error("Database connection failed:", err.message);
    });

export default pool;
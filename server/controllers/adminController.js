import pool from "../config/db.js";

export const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM users ORDER BY created_at ASC`);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
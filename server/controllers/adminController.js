import pool from "../config/db.js";

export const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM users ORDER BY created_at ASC`);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAPIMetrics = async (req, res) => {
    try {
        
        const query = `
            SELECT 
                COUNT(*)::int AS total_requests,
                ROUND(AVG(response_time_ms), 2)::float AS avg_response_time_ms,
                MIN(response_time_ms) AS min_response_time_ms,
                MAX(response_time_ms) AS max_response_time_ms
            FROM api_metrics;
        `;
        
        const result = await pool.query(query);
        
        const stats = result.rows[0];

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (err) {
        console.error("Error fetching API metrics:", err);
        res.status(500).json({ error: err.message });
    }
}
import pool from "../config/db.js";

export const getAllUsers = async (req, res) => {
    try {
        const result = await pool.query(`SELECT * FROM users ORDER BY created_at ASC`);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAPIStats = async (req, res) => {
    try {
        const apiMetricsQuery = `
            SELECT 
                COUNT(*)::int AS total_requests,
                ROUND(AVG(response_time_ms), 2)::float AS avg_response_time_ms,
                MIN(response_time_ms) AS min_response_time_ms,
                MAX(response_time_ms) AS max_response_time_ms,
                ROUND(
                    (COUNT(CASE WHEN status_code >= 400 THEN 1 END)::numeric / NULLIF(COUNT(*), 0)) * 100, 
                    2
                )::float AS error_rate_percentage
            FROM api_metrics;
        `;

        const usersQuery = `SELECT COUNT(*)::int AS total_users FROM users;`;
        
        const chatsQuery = `
            SELECT COUNT(*)::int AS active_sessions 
            FROM chats;
        `;

        const tokensQuery = `
            SELECT SUM(tokens_used)::int AS total_tokens,
            AVG(gemini_latency_ms)::int AS gemini_latency_time,
            AVG(tts_latency_ms)::int AS tts_latency_time,
            AVG(rhubarb_latency_ms)::int AS rhubarb_latency_time
            FROM messages 
            WHERE created_at >= CURRENT_DATE;
        `;

        const [apiRes, usersRes, chatsRes, tokensRes] = await Promise.all([
            pool.query(apiMetricsQuery),
            pool.query(usersQuery),
            pool.query(chatsQuery),
            pool.query(tokensQuery)
        ]);

        const stats = {
            ...apiRes.rows[0],
            total_users: usersRes.rows[0].total_users,
            active_chat_sessions: chatsRes.rows[0].active_sessions,
            tokens_used_today: tokensRes.rows[0].total_tokens || 0,
            gemini_latency_time: tokensRes.rows[0].gemini_latency_time || 0,
            tts_latency_time: tokensRes.rows[0].tts_latency_time || 0,
            rhubarb_latency_time: tokensRes.rows[0].rhubarb_latency_time || 0,
        };

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (err) {
        console.error("Error fetching API metrics:", err);
        res.status(500).json({ success: false, error: "Failed to fetch dashboard statistics" });
    }
}

export const getAvatarStat = async (req, res) => {
    try {
        const interactQuery = `
        SELECT 
        COUNT(*)::int AS interact_count,
        AVG(response_time_ms)::int AS response_time
        from messages;
        `;
        const result = await pool.query(interactQuery);

        const stats = {
            interact_count: result.rows[0].interact_count || 0,
            response_time: result.rows[0].response_time || 0,
        }
        res.status(200).json({
            success: true,
            data: stats
        })
    } catch (error) {
        console.error("Error fetching avatar stats:",error);
        res.status(500).json({ success: false, error: "Failed to fetch avatar statistics" });
    }
}

export const getChatLog = async (req, res) => {
    try {
        const query = `
            SELECT 
                c.id AS chat_id,
                u.name AS user_name,
                COUNT(m.id)::int AS message_count, -- Cast to int for cleaner JSON output
                c.updated_at,
                COALESCE(c.sentiment, 'Neutral') AS sentiment -- Ensures a value is always returned
            FROM chats c
            JOIN users u ON c.user_id = u.id
            LEFT JOIN messages m ON c.id = m.chat_id
            GROUP BY c.id, u.name, c.sentiment -- Added c.sentiment to GROUP BY
            ORDER BY c.updated_at DESC
            LIMIT 10;
        `;

        const result = await pool.query(query);

        res.status(200).json({
            success: true,
            data: result.rows
        })
    } catch (error) {
        console.error("Error fetching chat log:",error);
        res.status(500).json({ success: false, error: "Failed to fetch the chat log" });
    }
}
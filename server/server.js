require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI, Type } = require('@google/genai');
const googleTTS = require('google-tts-api');
const fs = require('fs');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const tmp = require('tmp'); // Creates temporary files that auto-delete
const axios = require('axios');

const { Pool } = require('pg');
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

const app = express();
app.use(cors());
app.use(express.json());

// Add this near the top of server.js
let EdgeTTS;
(async () => {
    const module = await import('edge-tts-universal');
    EdgeTTS = module.EdgeTTS;
})();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const systemInstruction = `
You are a helpful, friendly AI assistant and your name is Zara.
CRITICAL: Keep your responses VERY brief (under 150 characters) so the audio generates quickly.
Choose an appropriate 'animation' and 'facialExpression' based on your response.

Available animations: "idle", "sad_idle", "talking", "talking1", "talking2", "waving", "silly_dancing", "salute", "rumba_dancing", "formal_bow", "laughing", "hip_hop_dance", "disappointed", "clapping", "crying", "chicken_dance", "shaking"
Available facialExpressions: "default", "smile", "happy"
`;

const responseSchema = {
    type: Type.OBJECT,
    properties: {
        replyText: { type: Type.STRING },
        animation: {
            type: Type.STRING,
            enum: [
                "idle", "sad_idle", "talking", "talking1", "talking2",
                "waving", "silly_dancing", "salute", "rumba_dancing",
                "formal_bow", "laughing", "hip_hop_dance", "disappointed",
                "clapping", "crying", "chicken_dance", "shaking"
            ]
        },
        facialExpression: { type: Type.STRING, enum: ["default", "smile", "happy"] }
    },
    required: ["replyText", "animation", "facialExpression"]
};

// Define the path to your Rhubarb executable
const isWin = process.platform === "win32";
const RHUBARB_PATH = isWin ? 'bin/rhubarb.exe' : './bin/rhubarb';


const CURRENT_USER_ID = '11111111-1111-1111-1111-111111111111';

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required" });

        // Check if user exists
        let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        // If not, create them
        if (result.rows.length === 0) {
            result = await pool.query(
                'INSERT INTO users (email) VALUES ($1) RETURNING *',
                [email]
            );
        }
        
        res.json(result.rows[0]); // Returns the user object with the UUID
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        const chatId = req.body.chatId;

        if (!userMessage) return res.status(400).json({ error: "Message is required" });
        if (!chatId) return res.status(400).json({ error: "chatId is required" });

        console.log(`User said: "${userMessage}" in chat: ${chatId}`);

        // 1. Save User Message to DB
        await pool.query(
            'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)',
            [chatId, 'user', userMessage]
        );

        // 2. Fetch Chat History from DB for Context
        const historyResult = await pool.query(
            'SELECT role, content FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
            [chatId]
        );
        
        // Format history for the Gemini API
        const formattedHistory = historyResult.rows.map(msg => ({
            role: msg.role === 'model' ? 'model' : 'user', // Gemini expects 'model' or 'user'
            parts: [{ text: msg.content }]
        }));

        // 1. Get the Brain's response (Gemini)
        const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userMessage,
            config: {
                systemInstruction: systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema,
                temperature: 0.7,
            }
        });

        const aiData = JSON.parse(aiResponse.text);
        console.log("Gemini decided:", aiData);

        // 4. Save AI Response to DB
        await pool.query(
            'INSERT INTO messages (chat_id, role, content) VALUES ($1, $2, $3)',
            [chatId, 'model', aiData.replyText]
        );

        // Update the chat's updated_at timestamp so it jumps to the top of the sidebar
        await pool.query(
            'UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [chatId]
        );

        // 2. Get the Voice (Microsoft Edge Neural TTS - 100% FREE)
        console.log("Generating audio with Edge Neural TTS...");

        // 'en-US-AriaNeural' is a fantastic, highly realistic female voice.
        // Other options: 'en-US-GuyNeural' (Male), 'en-US-JennyNeural' (Female)
        const tts = new EdgeTTS(aiData.replyText, 'en-US-AriaNeural');
        const result = await tts.synthesize();

        // The package returns an ArrayBuffer. We convert it to Base64 for React.
        const audioBuffer = Buffer.from(await result.audio.arrayBuffer());
        const audioBase64 = audioBuffer.toString('base64');
        aiData.audio = audioBase64;


        // 3. Generate Lip Sync (Rhubarb)
        console.log("Generating lip sync data...");

        // Create temporary files for processing
        const mp3File = tmp.fileSync({ postfix: '.mp3' });
        const wavFile = tmp.fileSync({ postfix: '.wav' });
        const jsonFile = tmp.fileSync({ postfix: '.json' });

        try {
            // A. Save the Base64 audio to an MP3 file
            fs.writeFileSync(mp3File.name, Buffer.from(audioBase64, 'base64'));

            // B. Convert MP3 to WAV using FFmpeg (Rhubarb requires WAV)
            await exec(`ffmpeg -y -i "${mp3File.name}" "${wavFile.name}"`);

            // C. Run Rhubarb Lip Sync
            // We use -f json to output JSON, and -r phonetic for speed
            await exec(`"${RHUBARB_PATH}" -f json -r phonetic -o "${jsonFile.name}" "${wavFile.name}"`);

            // D. Read the generated JSON file
            const rhubarbOutput = fs.readFileSync(jsonFile.name, 'utf8');
            const parsedRhubarb = JSON.parse(rhubarbOutput);

            // Attach the mouthCues to the response
            aiData.lipsync = parsedRhubarb;
            console.log("Lip sync generated successfully!");

        } catch (syncError) {
            console.error("Lip sync generation failed:", syncError.message);
            // We don't throw an error here, so the avatar will still talk, just without moving its mouth
        } finally {
            // Clean up temporary files
            mp3File.removeCallback();
            wavFile.removeCallback();
            jsonFile.removeCallback();
        }

        // Send everything back to React
        res.json(aiData);

    } catch (error) {
        console.error("Server Error:", error);

        if (error.status === 429 || (error.message && error.message.includes('429'))) {
            console.log("Hit rate limit, sending fallback response to React...");
            return res.json({
                replyText: "Whoa, I'm thinking too fast! Give me about ten seconds to catch my breath.",
                animation: "sad_idle",
                facialExpression: "default"
            });
        }

        res.status(500).json({ error: "Failed to process request" });
    }
});


// 1. Get all chats for the sidebar
app.get('/api/chats', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM chats WHERE user_id = $1 ORDER BY updated_at DESC',
            [CURRENT_USER_ID]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Create a new chat session
app.post('/api/chats', async (req, res) => {
    try {
        const title = req.body.title || "New Chat";
        const result = await pool.query(
            'INSERT INTO chats (user_id, title) VALUES ($1, $2) RETURNING *',
            [CURRENT_USER_ID, title]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 3. Get messages for a specific chat
app.get('/api/chats/:chatId/messages', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM messages WHERE chat_id = $1 ORDER BY created_at ASC',
            [req.params.chatId]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 4. Update chat title
app.put('/api/chats/:chatId', async (req, res) => {
    try {
        const { title } = req.body;
        if (!title) return res.status(400).json({ error: "Title is required" });

        const result = await pool.query(
            'UPDATE chats SET title = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 AND user_id = $3 RETURNING *',
            [title, req.params.chatId, CURRENT_USER_ID]
        );
        
        if (result.rows.length === 0) return res.status(404).json({ error: "Chat not found" });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 5. Delete a chat
app.delete('/api/chats/:chatId', async (req, res) => {
    try {
        const result = await pool.query(
            'DELETE FROM chats WHERE id = $1 AND user_id = $2 RETURNING *',
            [req.params.chatId, CURRENT_USER_ID]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: "Chat not found" });
        res.json({ message: "Chat deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
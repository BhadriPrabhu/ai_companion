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

const app = express();
app.use(cors());
app.use(express.json());

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

app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.message;
        if (!userMessage) return res.status(400).json({ error: "Message is required" });

        console.log(`User said: "${userMessage}"`);

        // 1. Get the Brain's response (Gemini)
        const aiResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-lite',
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

        // 2. Get the Voice (Google TTS)
        console.log("Generating audio...");
        const audioBase64 = await googleTTS.getAudioBase64(aiData.replyText, {
            lang: 'en',
            slow: true,
            host: 'https://translate.google.com',
        });
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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
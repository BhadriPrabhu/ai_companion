# AI Companion Server

The backend service for **My AI Companion (Zara AI)**. It exposes the REST API used by the React client for authentication, persistent chat sessions, Gemini-powered responses, speech synthesis, lip-sync generation, and administrator analytics.

## Features

- Email-based user registration and login with 7-day JWTs
- Token-protected chat creation, history, rename, deletion, and messaging
- Gemini response generation with animation and facial-expression metadata
- Microsoft Edge neural text-to-speech audio generation
- Rhubarb lip-sync cue generation for avatar animation
- PostgreSQL persistence for users, chats, messages, and API metrics
- Admin endpoints for users, API performance, avatar interactions, and recent chat logs

## Technology Stack

- **Runtime:** Node.js with native ES modules
- **Framework:** Express 5
- **Database:** PostgreSQL via `pg`
- **Authentication:** JSON Web Tokens via `jsonwebtoken`
- **AI:** Google Gemini via `@google/genai`
- **Speech:** `edge-tts-universal`
- **Lip sync:** Rhubarb bundled in `bin/`

## Prerequisites

- Node.js 16 or newer
- PostgreSQL
- FFmpeg available on the system `PATH`
- A Google Gemini API key
- A database containing the tables described in [`table.txt`](table.txt)

On PostgreSQL, enable the UUID extension before creating tables if your schema uses the default UUID definitions:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

## Configuration

Create a `.env` file in this directory based on [`.env.example`](.env.example):

```env
GEMINI_API_KEY=your_gemini_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/your_database_name
JWT_SECRET=replace_with_a_long_random_secret
```

`DATABASE_URL` and `JWT_SECRET` are required for authenticated and persistent features. `ELEVENLABS_API_KEY` is retained for compatibility with the project configuration; the current chat flow uses Edge TTS.

## Installation and Usage

From the repository root:

```bash
cd server
npm install
node server.js
```

The server listens on `http://localhost:3001` by default, or on the port configured by `PORT`.

> `package.json` currently does not define an `npm start` script. Use `node server.js` unless a start script is added.

## Authentication

Register or log in to receive a JWT:

```http
Authorization: Bearer <token>
```

Pass this header to every protected `/api` endpoint. The token payload contains the authenticated user's `id` and `email` and expires after seven days.

## API Reference

### Authentication

| Method | Endpoint | Description | Auth |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | Create a user with `name` and `email` | No |
| `POST` | `/api/auth/login` | Log in with `email` | No |

Example request:

```json
{
  "name": "Alex",
  "email": "alex@example.com"
}
```

### Chat

All chat endpoints require a Bearer token.

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/api/chat` | Generate a Zara response, audio, and lip-sync data |
| `GET` | `/api/chats?userId=<user-id>` | List a user's chats |
| `GET` | `/api/chats/:chatId/messages` | Get messages for a chat |
| `POST` | `/api/chats` | Create a chat; accepts `title` and `userId` |
| `PUT` | `/api/chats/:chatId` | Rename a chat; accepts `title` and `userId` |
| `DELETE` | `/api/chats/:chatId?userId=<user-id>` | Delete a chat |

A persistent chat request uses `message`, `chatId`, and `userId`. Guest conversations can provide `isGuest: true` and a client-managed `history` instead of a database chat.

### Administration

The current admin routes are mounted at `/admin`:

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/admin/allChat` | Return all users |
| `GET` | `/admin/apiStats` | Return API, user, chat, token, and latency statistics |
| `GET` | `/admin/avatarStats` | Return avatar interaction and animation statistics |
| `GET` | `/admin/chatLog` | Return the ten most recently updated chat logs |

> The current admin routes do not apply `verifyToken` middleware. Add authorization before exposing them outside a trusted environment.

## Database Tables

The server expects these PostgreSQL tables:

- `users`
- `chats`
- `messages`
- `api_metrics`

The expected columns and relationships are listed in [`table.txt`](table.txt).

## Project Structure

```text
server/
├── config/          Database connection
├── controllers/     Authentication, chat, and admin handlers
├── middleware/      JWT verification middleware
├── routes/          Express route definitions
├── bin/             Rhubarb and related runtime resources
├── .env.example     Environment variable template
├── server.js        Express application entrypoint
└── table.txt        Database schema reference
```

## Troubleshooting

- **Database connection failed:** Check that PostgreSQL is running and that `DATABASE_URL` is valid.
- **Authentication errors:** Confirm `JWT_SECRET` is set and that requests include `Authorization: Bearer <token>`.
- **Chat requests fail during lip sync:** Confirm FFmpeg is installed and that the Rhubarb binary exists under `server/bin/`.
- **Gemini requests fail:** Confirm `GEMINI_API_KEY` is valid and available to the server process.

## Related Documentation

See the repository [README](../README.md) for the full-stack architecture and client setup.

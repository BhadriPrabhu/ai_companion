# My AI Companion (Zara AI)

My AI Companion is a robust, full-stack web application that implements a real-time, interactive 3D conversational agent. The system combines a React-based frontend (Vite) with a Node.js backend, featuring WebGL rendering, dynamic animation retargeting, and continuous speech recognition.

## System Architecture & Technical Overview

The project is structured to separate the complex 3D rendering pipeline from standard DOM-based UI state management. The client application leverages Three.js for rendering a GLTF-based avatar, synchronizing facial morph targets (visemes) with audio playback for accurate lip-syncing. The voice interaction subsystem utilizes the Web Speech API to maintain a continuous listening state, implementing wake-word detection for hands-free operation.

## Core Capabilities

* **Real-Time 3D Rendering:** Utilizes Three.js and WebGL to render high-fidelity avatars with dynamic lighting and shadow mapping.
* **Animation & Kinematics:** Implements real-time skeletal animation retargeting, allowing standard Mixamo animations to map accurately to custom Ready Player Me (RPM) avatar armatures.
* **Audio-Visual Synchronization:** Maps audio cues to predefined visemes (`viseme_PP`, `viseme_aa`, etc.) to achieve realistic lip-syncing during AI speech playback.
* **Continuous Voice Interaction:** Integrates browser-based `SpeechRecognition` with a custom "Wake Word" (Hey Zara) protocol, including auto-interruption logic for active audio streams.
* **Dynamic Camera Tracking:** Features state-dependent camera interpolation (Focus Mode) to shift the viewport based on user interaction or current avatar animation.
* **Authentication & Session Management:** Provides full user lifecycle management (Login/Register) with persistent chat histories, alongside a stateless Guest Mode.

## Technology Stack

### Frontend Client
* **Framework:** React 18 (Vite build tool)
* **3D Graphics:** Three.js, `@react-three/fiber` (implied structural dependencies), GLTFLoader
* **Styling:** Tailwind CSS (utility-first, glassmorphism implementation)
* **Icons:** Lucide-React
* **HTTP Client:** Axios

### Backend Server
* **Runtime:** Node.js (v16+ recommended)
* **Architecture:** RESTful API interface for chat resolution, user authentication, and audio generation.

## Repository Structure

- `client/` — React app (Vite) containing UI, assets, and components
- `server/` — Node server and related resources

## Prerequisites

- Node.js (v16+ recommended)
- npm or yarn

## Setup & Run

1. Install dependencies for the client

```bash
cd client
npm install
```

2. Start the client (development)

```bash
npm run dev
```

3. Install dependencies for the server and start it (from repo root or server folder)

```bash
cd server
npm install
npm start
```

## Project Conventions

- Frontend entry: `client/src/main.jsx`
- Main server file: `server/server.js`

---
If you'd like, I can expand sections (usage examples, env variables, API spec) or generate a `LICENSE` and .gitignore.

# Zara AI - Frontend Client

This directory contains the frontend client for **Zara AI (My AI Companion)**. It is a React-based web application powered by Vite, responsible for the real-time 3D rendering, animation retargeting, continuous speech recognition, and the user interface.

---

## Core Technologies

* **Framework:** React 18 + Vite
* **3D Graphics & WebGL:** Three.js, `@react-three/fiber`
* **Asset Loading:** GLTFLoader (for custom Blender-designed avatars)
* **Styling:** Tailwind CSS (Glassmorphism design)
* **Icons:** Lucide-React
* **HTTP Client:** Axios

---

## Key Features

* **Real-Time 3D Rendering:** Renders high-fidelity avatars with dynamic lighting and shadow mapping using Three.js and WebGL.
* **Continuous Voice Interaction:** Utilizes the Web Speech API for persistent listening and "Hey Zara" wake-word detection, featuring auto-interruption logic.
* **Audio-Visual Synchronization (Lip-Syncing):** Accurately maps audio cues to predefined facial morph targets (visemes such as `viseme_PP`, `viseme_aa`) for realistic speech animation.
* **Dynamic Animation Retargeting:** Maps standard Mixamo skeletal animations to custom Ready Player Me (RPM) armatures created and optimized in Blender.
* **Dynamic Camera Tracking:** Implements state-dependent camera interpolation (Focus Mode) that shifts the viewport based on user interaction or the avatar's active animation.
* **Decoupled Architecture:** Strictly separates the complex 3D WebGL rendering pipeline from standard DOM-based UI state management.

---

## Project Structure (Client)

```text
client/
│
├── public/                 # Static assets (GLTF models, textures, audio files)
├── src/
│   ├── assets/             # UI assets and styles
│   ├── components/         # Standard React UI components (Chat, Login, etc.)
│   ├── three/              # Three.js & @react-three/fiber rendering components
│   ├── hooks/              # Custom hooks (e.g., SpeechRecognition, WebAudio)
│   ├── utils/              # Helper functions (animation mapping, viseme logic)
│   ├── App.jsx             # Main application component
│   └── main.jsx            # Frontend entry point
│
├── tailwind.config.js      # Tailwind CSS configuration
├── vite.config.js          # Vite configuration
└── package.json            # Frontend dependencies
```

## Prerequisites

* **Node.js** (v16+ recommended)
* A modern web browser with WebGL and Web Speech API support (Chrome/Edge recommended).

## Setup & Installation

1. **Navigate to the client directory:**
   ```bash
   cd client
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root of the `client` folder to connect to your backend server:
   ```text
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
   *(Update the URL to match your backend port if different).*

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

The application will typically be available at `http://localhost:5173`.

## 3D Assets & Blender Setup

The 3D avatars used in this project are custom-designed and optimized using **Blender**.
To update or modify the avatar:

1.  Export your model from Blender in `.glb` or `.gltf` format.
2.  Ensure morph targets (Shape Keys) are correctly labeled for viseme mapping.
3.  Place the exported model into the `public/models/` directory and update the `GLTFLoader` reference in your Three.js components.

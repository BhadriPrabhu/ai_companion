import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import axios from 'axios';
import { Eye, Mic, Target } from 'lucide-react';

const AIEmotionAnalyzer = ({ avatarState, onLoad, className = "", message, onMessagePlayed, isFocusMode }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const avatarRef = useRef(null);
  const cameraRef = useRef(null);
  const mixerRef = useRef(null);
  const animationActionsRef = useRef({});
  const clockRef = useRef(new THREE.Clock());
  const currentAvatarStateRef = useRef('');
  const audioRef = useRef(null);
  const animationsRef = useRef([]);

  const effectiveState = avatarState || currentAvatarStateRef.current || "idle";

  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [error, setError] = useState(null);
  const [blink, setBlink] = useState(false);
  const [facialExpression, setFacialExpression] = useState('default');
  const [lipsync, setLipsync] = useState(null);

  const facialExpressions = {
    default: {},
    smile: {
      browInnerUp: 0.17, eyeSquintLeft: 0.4, eyeSquintRight: 0.44,
      noseSneerLeft: 0.17, noseSneerRight: 0.14, mouthPressLeft: 0.61, mouthPressRight: 0.41,
    },
    happy: {
      browInnerUp: 0.17, eyeSquintLeft: 0.4, eyeSquintRight: 0.44,
      mouthSmileLeft: 1, mouthSmileRight: 1,
    },
  };

  const visemeMapping = {
    A: "viseme_PP", B: "viseme_kk", C: "viseme_I", D: "viseme_AA",
    E: "viseme_O", F: "viseme_U", G: "viseme_FF", H: "viseme_TH", X: "viseme_PP",
  };

  const avatarStateConfig = {
    idle: { animation: "idle", expression: "default" },
    sad_idle: { animation: "sad idle", expression: "default" },
    talking: { animation: "talking", expression: "default" },
    talking1: { animation: "talking1", expression: "default" },
    talking2: { animation: "talking2", expression: "default" },
    waving: { animation: "waving", expression: "happy" },
    silly_dancing: { animation: "silly_dancing", expression: "happy" },
    salute: { animation: "salute", expression: "default" },
    rumba_dancing: { animation: "rumba_dancing", expression: "smile" },
    formal_bow: { animation: "formal_bow", expression: "default" },
    laughing: { animation: "laughing", expression: "happy" },
    hip_hop_dance: { animation: "hip_hop_dance", expression: "smile" },
    disappointed: { animation: "disappointed", expression: "default" },
    clapping: { animation: "clapping", expression: "happy" },
    crying: { animation: "crying", expression: "default" },
    chicken_dance: { animation: "chicken_dance", expression: "happy" },
    shaking: { animation: "shaking", expression: "default" }
  };

  const lerpMorphTarget = (target, value, speed = 0.1) => {
    if (!avatarRef.current) return;
    avatarRef.current.traverse((child) => {
      if (child.isSkinnedMesh && child.morphTargetDictionary) {
        const index = child.morphTargetDictionary[target];
        if (index !== undefined && child.morphTargetInfluences[index] !== undefined) {
          child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
            child.morphTargetInfluences[index], value, speed
          );
        }
      }
    });
  };

  const loadAvatar = async () => {
    try {
      const loader = new GLTFLoader();

      const [gltf, animationsGltf] = await Promise.all([
        new Promise((res, rej) => loader.load('/model.glb', res, undefined, rej)),
        new Promise((res, rej) => loader.load('/animation3.glb', res, undefined, rej))
      ]);

      const avatar = gltf.scene;
      avatar.scale.set(1.8, 1.8, 1.8);
      avatar.position.set(0, -1.5, 0);

      // 1. Setup the main RPM avatar
      avatar.traverse((child) => {
        if (child.isMesh || child.isSkinnedMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.frustumCulled = false; // Keeps avatar active
          if (child.material) {
            child.material.side = THREE.DoubleSide;
            child.material.needsUpdate = true;
          }
        }
      });

      if (avatarRef.current && sceneRef.current) {
        sceneRef.current.remove(avatarRef.current);
      }

      // Explicitly ONLY add the avatar to the scene. The ghost mesh stays hidden forever.
      sceneRef.current.add(avatar);
      avatarRef.current = avatar;

      // 2. Map nodes from the animation file to resolve UUIDs
      const sourceNodes = {};
      animationsGltf.scene.traverse((child) => {
        sourceNodes[child.uuid] = child;
        sourceNodes[child.name] = child;
      });

      // 3. Process the animations
      if (animationsGltf.animations && animationsGltf.animations.length > 0) {
        const mixer = new THREE.AnimationMixer(avatar);
        mixerRef.current = mixer;
        animationActionsRef.current = {};

        animationsGltf.animations.forEach((clip) => {
          let cleanName = clip.name;
          if (cleanName.includes("|")) cleanName = cleanName.split("|").pop();
          cleanName = cleanName.toLowerCase().trim();

          const retargetedTracks = [];

          clip.tracks.forEach((track) => {
            const parts = track.name.split('.');
            const property = parts.pop();
            const trackId = parts.join('.'); // This might be a UUID or a Name

            // Get the true name of the bone from the animation file
            const sourceNode = sourceNodes[trackId];
            const originalName = sourceNode ? sourceNode.name : trackId;

            // Clean away the Mixamo/Blender junk formatting
            let pureBoneName = originalName.replace(/^.*mixamorig/i, '');
            pureBoneName = pureBoneName.replace(/^.*Armature_/i, '');
            pureBoneName = pureBoneName.replace(/^[:_]/, ''); // Strip leading colons/underscores

            // Filtering: Only take rotation, except for the Hips which need position to bounce
            if (property === 'scale') return;
            if (property === 'position' && pureBoneName !== 'Hips') return;

            // Find the exactly matching bone in the RPM avatar
            const targetBone = avatar.getObjectByName(pureBoneName);

            if (targetBone) {
              const newTrack = track.clone();
              // Binding via the clean targetName stops all UUID crashing
              newTrack.name = `${targetBone.name}.${property}`;
              retargetedTracks.push(newTrack);
            }
          });

          if (retargetedTracks.length > 0) {
            const newClip = new THREE.AnimationClip(cleanName, clip.duration, retargetedTracks);
            const action = mixer.clipAction(newClip);
            action.clampWhenFinished = true;
            animationActionsRef.current[cleanName] = action;
            console.log(`✅ [${cleanName}] Safely mapped ${retargetedTracks.length} tracks to avatar!`);
          }
        });

        animationsRef.current = animationsGltf.animations;

        const initialAnim = animationActionsRef.current['idle'] || Object.values(animationActionsRef.current)[0];
        if (initialAnim) {
          initialAnim.reset().play();
          initialAnim.setEffectiveWeight(1);
          setCurrentAnimation('idle');
        }
      }

      setAvatarLoaded(true);
      setLoadingProgress(100);
      if (onLoad) onLoad();

    } catch (err) {
      console.error('Avatar loading error:', err);
      setError('Failed to load avatar model');
    }
  };

  const changeAnimation = (animationName) => {
    if (!mixerRef.current || !animationActionsRef.current) return;

    const key = animationName.toLowerCase().trim();
    const newAction = animationActionsRef.current[key];

    if (!newAction) return;

    const currentAction = animationActionsRef.current[currentAnimation];
    if (currentAction && currentAction !== newAction) {
      currentAction.crossFadeTo(newAction, 0.5, true);
    }

    newAction.reset().play();
    newAction.setEffectiveWeight(1);
    setCurrentAnimation(key);
  };

  useEffect(() => {
    if (!message) {
      changeAnimation('idle');
      setFacialExpression('default');
      setLipsync(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    if (message.animation) changeAnimation(message.animation);
    if (message.facialExpression) setFacialExpression(message.facialExpression);
    if (message.lipsync) setLipsync(message.lipsync);

    // Give the 3D loop access to the playing audio so it can track the lipsync time!
    if (message.audioObj) {
      audioRef.current = message.audioObj;
      message.audioObj.onended = () => {
        setLipsync(null);
        if (onMessagePlayed) onMessagePlayed();
      };
    }
  }, [message]);

  useEffect(() => {
    if (!avatarLoaded) return;
    const config = avatarStateConfig[effectiveState] || avatarStateConfig['idle'];
    changeAnimation(config.animation);
    setFacialExpression(config.expression);
    currentAvatarStateRef.current = effectiveState;
  }, [avatarState, avatarLoaded]);

  useEffect(() => {
    let blinkTimeout;
    const nextBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          nextBlink();
        }, 200);
      }, THREE.MathUtils.randInt(1000, 5000));
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;
    let animationFrameId;

    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current) return;
      const width = window.innerWidth;
      const height = window.innerHeight;
      rendererRef.current.setSize(width, height);
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
    };

    try {
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf8fafc);
      sceneRef.current = scene;

      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
      camera.position.set(0, 1.6, 4);
      camera.lookAt(0, 1, 0);
      cameraRef.current = camera;

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
      renderer.setSize(400, 400);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      rendererRef.current = renderer;
      mount.appendChild(renderer.domElement);

      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 10, 5);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      loadAvatar();

      window.addEventListener('resize', handleResize);
      handleResize();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        const delta = clockRef.current.getDelta();
        if (mixerRef.current) {
          mixerRef.current.update(delta);
        }

        if (cameraRef.current) {
          const state = currentAvatarStateRef.current;
          let targetZ = 4.0; // Default Idle distance
          let targetY = 1.4; // Default Height

          if (isFocusMode) {
            targetZ = 1.4; // Deep close-up zoom
            targetY = 1.63; // Centered closely on face
          } else if (state.includes('talking')) {
            targetZ = 1.8; // Zoom in close for talking
            targetY = 1.6; // Move up to face level
          } else if (state.includes('dancing') || state.includes('chicken') || state.includes('bow') || state.includes('salute') || state.includes('shaking') || state.includes('clapping') || state.includes('disappointed')) {
            targetZ = 5.5; // Zoom way out for full body
            targetY = 1.0; // Move down to capture feet
          }

          // Smoothly glide the camera to the target position
          cameraRef.current.position.lerp(new THREE.Vector3(0, targetY, targetZ), 0.05);
          cameraRef.current.lookAt(0, 1.2, 0); // Keep looking at the chest/neck area
        }

        if (avatarRef.current) {
          const expression = facialExpressions[facialExpression] || {};
          avatarRef.current.traverse((child) => {
            if (child.isSkinnedMesh && child.morphTargetDictionary) {
              Object.keys(child.morphTargetDictionary).forEach((key) => {
                if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") return;
                const targetValue = expression[key] || 0;
                lerpMorphTarget(key, targetValue, 0.1);
              });
            }
          });

          lerpMorphTarget("eyeBlinkLeft", blink ? 1 : 0, 0.5);
          lerpMorphTarget("eyeBlinkRight", blink ? 1 : 0, 0.5);

          if (lipsync && audioRef.current) {
            const currentAudioTime = audioRef.current.currentTime;
            const appliedMorphTargets = [];

            for (let i = 0; i < lipsync.mouthCues.length; i++) {
              const mouthCue = lipsync.mouthCues[i];
              if (currentAudioTime >= mouthCue.start && currentAudioTime <= mouthCue.end) {
                const viseme = visemeMapping[mouthCue.value];
                if (viseme) {
                  appliedMorphTargets.push(viseme);
                  lerpMorphTarget(viseme, 1, 0.95);
                }
                break;
              }
            }

            Object.values(visemeMapping).forEach((viseme) => {
              if (!appliedMorphTargets.includes(viseme)) {
                lerpMorphTarget(viseme, 0, 0.95);
              }
            });
          }
        }

        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      };
      animate();

    } catch (err) {
      console.error('Error initializing 3D scene:', err);
      setError('Failed to initialize 3D environment');
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      if (rendererRef.current?.domElement && mount.contains(rendererRef.current.domElement)) {
        mount.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) rendererRef.current.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, [onLoad, isFocusMode]);

  return (
    <div className={`fixed top-0 left-0 w-screen h-screen -z-10 ${className}`}>
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};

const AvatarDemo = () => {
  const [avatarState, setAvatarState] = useState('idle');
  const [message, setMessage] = useState(null);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const states = [
    'idle', 'sad_idle', 'talking', 'talking1', 'talking2',
    'waving', 'silly_dancing', 'salute', 'rumba_dancing',
    'formal_bow', 'laughing', 'hip_hop_dance', 'disappointed',
    'clapping', 'crying', 'chicken_dance', 'shaking'
  ];

  // Initialize browser microphone
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      sendMessage(transcript); // Auto-send when you finish talking
    };

    recognition.onend = () => setIsRecording(false);
  }

  const toggleRecording = () => {
    if (!recognition) return alert("Your browser doesn't support microphone input.");
    if (isRecording) {
      recognition.stop();
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const sendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    setIsLoading(true);
    setInputText(''); // Clear input box

    try {
      const response = await axios.post('http://localhost:3001/api/chat', {
        message: text,
      });

      const aiData = response.data;

      let audioObj = null;
      if (aiData.audio) {
        try {
          audioObj = new Audio("data:audio/mp3;base64," + aiData.audio);
          await audioObj.play();
        } catch (e) {
          console.error("Audio play error:", e);
        }
      }

      setMessage({
        animation: aiData.animation,
        facialExpression: aiData.facialExpression,
        lipsync: aiData.lipsync,
        audioObj: audioObj
      });

    } catch (error) {
      console.error("Error communicating with backend:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatLabel = (str) => str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());


  return (
    // ✅ Removed the solid background, added flex to push controls to the bottom
    <div className="min-h-screen flex flex-col justify-end p-4 pointer-events-none">

      {/* The Full-Screen 3D Canvas */}
      <AIEmotionAnalyzer
        avatarState={avatarState}
        message={message}
        onMessagePlayed={() => setMessage(null)}
        isFocusMode={isFocusMode}
      />

      <div className="max-w-3xl mx-auto w-full mb-4">
        <h1 className="text-3xl font-bold text-center mb-2 text-white drop-shadow-md">
          Meet Zara AI
        </h1>

        {/* ✅ Made the UI box transparent (glassmorphism) and restored pointer events */}
        <div className="bg-white/80 backdrop-blur-md p-4 rounded-2xl shadow-2xl pointer-events-auto border border-white/50">

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">Chat with Zara</h3>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Focus Mode
                </span>
                <button
                  onClick={() => setIsFocusMode(!isFocusMode)}
                  className={`relative w-16 h-8 rounded-full border-2 transition-colors duration-300 focus:outline-none flex items-center px-1 ${isFocusMode
                      ? 'border-purple-500'
                      : 'border-gray-300'
                    }`}
                  aria-label="Toggle focus mode"
                  title={isFocusMode ? "Switch to Normal Mode" : "Switch to Focus Mode"}
                >
                  {/* Lock icon hidden when focus is active */}
                  <Target
                    size={17}
                    color={isFocusMode ? 'gray' : 'white'}
                    className={`absolute left-2 z-10 transition-opacity duration-200 text-gray-400 ${isFocusMode ? 'opacity-20' : 'opacity-100'
                      }`}
                  />

                  {/* Eye icon shown when focus is active */}
                  <Eye
                    size={17}
                    color={isFocusMode ? 'white' : 'black'}
                    className={`absolute right-2 z-10 transition-opacity duration-200 text-purple-500 ${isFocusMode ? 'opacity-100' : 'opacity-20'
                      }`}
                  />

                  {/* Sliding solid block slider */}
                  <div
                    className={`w-6 h-6 rounded-xl transition-transform duration-300 shadow-md ${isFocusMode
                        ? 'translate-x-7 bg-purple-600'
                        : 'translate-x-0 bg-gray-400'
                      }`}
                  />
                </button>
              </div>
            </div>


            <div className="flex gap-2">
              <button
                onClick={toggleRecording}
                className={`p-3 rounded-xl text-white shadow-md transition-colors ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-800 hover:bg-gray-700'}`}
                title="Click to Talk"
              >
                <Mic size={20} />
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message or click the mic..."
                className="flex-1 bg-white/90 border border-gray-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={isLoading}
                className={`px-6 py-2.5 text-white font-semibold rounded-xl shadow-md transition-all duration-200 ${isLoading
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 shadow-indigo-950/20 active:scale-[0.98]'
                  }`}
              >
                {isLoading ? 'Thinking...' : 'Send'}
              </button>
            </div>
          </div>

          <details className="group border border-gray-200 rounded-xl p-2 bg-gray-50/50">
            <summary className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer list-none select-none">
              <span>Manual State Override</span>
              <span className="transition-transform group-open:rotate-180 text-gray-400 text-sm">▼</span>
            </summary>

            <div className="flex flex-wrap gap-1.5 mt-2 max-h-24 overflow-y-auto pt-1">
              {states.map(state => (
                <button
                  key={state}
                  onClick={() => setAvatarState(state)}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all ${avatarState === state
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                  {formatLabel(state)}
                </button>
              ))}
            </div>
          </details>

        </div>
      </div>
    </div>
  );
};

export default AvatarDemo;
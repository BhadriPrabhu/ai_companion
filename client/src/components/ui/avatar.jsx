import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import axios from 'axios';
import { ChevronDown, ChevronUp, Eye, Maximize2, Mic, Minimize2, Target } from 'lucide-react';
import FlatUpArrow from '../../assets/icons/flatUpArrow';
import Loader from '../../assets/icons/loader';
import Sidebar from './sidebar';
import AlertModal from './alertModal';
import Login from './login';
import Register from './register';

const AIEmotionAnalyzer = ({ avatarState, onLoad, className = "", message, onMessagePlayed, isFocusMode, isSidebarOpen }) => {
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

  // 🚨 THE FIX: Create Refs so the 3D loop can see the live updates
  const blinkRef = useRef(false);
  const facialExpressionRef = useRef('default');
  const lipsyncRef = useRef(null);
  const isFocusModeRef = useRef(isFocusMode);

  // 🚨 THE FIX: Sync React state to the Refs automatically
  useEffect(() => { blinkRef.current = blink; }, [blink]);
  useEffect(() => { facialExpressionRef.current = facialExpression; }, [facialExpression]);
  useEffect(() => { lipsyncRef.current = lipsync; }, [lipsync]);
  useEffect(() => { isFocusModeRef.current = isFocusMode; }, [isFocusMode]);

  const facialExpressions = {
    default: {},
    smile: {
      browInnerUp: 0.17, eyeSquintLeft: 0.4, eyeSquintRight: 0.44,
      noseSneerLeft: 0.17, noseSneerRight: 0.14, mouthPressLeft: 0.61, mouthPressRight: 0.41,
    },
    happy: {
      browInnerUp: 0.17, eyeSquintLeft: 0.4, eyeSquintRight: 0.44,
      mouthSmileLeft: 0.5, mouthSmileRight: 0.5,
    },
  };

  const visemeMapping = {
    A: ["viseme_PP"], B: ["viseme_kk"], C: ["viseme_I"],
    D: ["viseme_AA", "viseme_aa"],
    E: ["viseme_O", "viseme_o"],
    F: ["viseme_U", "viseme_u"],
    G: ["viseme_FF"], H: ["viseme_TH"], X: ["viseme_PP", "viseme_sil"],
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

    let resizeObserver;

    const handleResize = () => {
      if (!rendererRef.current || !cameraRef.current || !mountRef.current) return;
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
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

      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      if (mount) {
        resizeObserver.observe(mount);
      }
      handleResize();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        const delta = clockRef.current.getDelta();
        if (mixerRef.current) {
          mixerRef.current.update(delta);
        }

        if (cameraRef.current) {
          const state = currentAvatarStateRef.current;
          let targetZ = 4.0;
          let targetY = 1.4;
          let targetX = 0.1;
          let targetLookAtX = 0;
          let targetLookAtY = 1.2;
          let targetLookAtZ = 0;

          // 🚨 Read Focus Mode from the Ref!
          if (isFocusModeRef.current) {
            targetX = 0;
            targetZ = 1.5;
            targetY = 1.43;
          } else if (state.includes('dancing') || state.includes('chicken') || state.includes('bow') || state.includes('salute') || state.includes('shaking') || state.includes('clapping') || state.includes('disappointed')) {
            targetX = 0.1;
            targetZ = 5.5;
            targetY = 1.0;
            targetLookAtY = 1;
          } else if (state.includes('talking1')) {
            targetX = 0.8;
            targetZ = 1.8;
            targetY = 1.6;
          } else if (state.includes('talking2')) {
            targetX = 0.7;
            targetZ = 1.8;
            targetY = 1.6;
          } else if (state.includes('talking')) {
            targetX = 0.1;
            targetZ = 1.8;
            targetY = 1.6;
          } else {
            targetX = 0.1;
            targetZ = 4.5;
            targetY = 1.4;
          }

          cameraRef.current.position.lerp(new THREE.Vector3(targetX, targetY, targetZ), 0.05);
          cameraRef.current.lookAt(new THREE.Vector3(targetLookAtX, targetLookAtY, targetLookAtZ));
        }

        if (avatarRef.current) {
          // 🚨 Read Expression from the Ref!
          const expression = facialExpressions[facialExpressionRef.current] || {};

          // 1. FACIAL EXPRESSIONS
          avatarRef.current.traverse((child) => {
            if (child.isSkinnedMesh && child.morphTargetDictionary) {
              Object.keys(child.morphTargetDictionary).forEach((key) => {
                if (key.includes("eyeBlink") || key.startsWith("viseme_") || key === "jawOpen" || key === "mouthOpen") return;

                const targetValue = expression[key] || 0;
                lerpMorphTarget(key, targetValue, 0.1);
              });
            }
          });

          // 2. BLINKS (Read from the Ref!)
          lerpMorphTarget("eyeBlinkLeft", blinkRef.current ? 1 : 0, 0.5);
          lerpMorphTarget("eyeBlinkRight", blinkRef.current ? 1 : 0, 0.5);

          // 3. PERFECT LIP SYNC (Read from the Ref!)
          const activeLipsync = lipsyncRef.current;

          if (activeLipsync && audioRef.current) {
            const currentAudioTime = audioRef.current.currentTime;
            const appliedMorphTargets = [];

            for (let i = 0; i < activeLipsync.mouthCues.length; i++) {
              const mouthCue = activeLipsync.mouthCues[i];
              if (currentAudioTime >= mouthCue.start && currentAudioTime <= mouthCue.end) {

                const visemes = visemeMapping[mouthCue.value];
                if (visemes) {
                  visemes.forEach(viseme => {
                    appliedMorphTargets.push(viseme);
                    lerpMorphTarget(viseme, 1, 0.2);
                  });
                }

                // Force jaw drop on loud vowels
                if (['D', 'E', 'F'].includes(mouthCue.value)) {
                  appliedMorphTargets.push("jawOpen");
                  lerpMorphTarget("jawOpen", 0.6, 0.2);
                }
                break;
              }
            }

            Object.values(visemeMapping).flat().concat(["jawOpen"]).forEach((viseme) => {
              if (!appliedMorphTargets.includes(viseme)) {
                lerpMorphTarget(viseme, 0, 0.1);
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

      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      if (rendererRef.current?.domElement && mount.contains(rendererRef.current.domElement)) {
        mount.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, [onLoad]);

  return (
    <div className={`absolute inset-0 -z-10 ${className}`}>
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
  const [isMinimized, setIsMinimized] = useState(false);

  // 🚨 NEW: Wake Word State
  const [isWakeWordActive, setIsWakeWordActive] = useState(false);

  const [openChatPreview, setOpenChatPreview] = useState(false);
  const [chatHistory, setChatHistory] = useState([
    { role: 'ai', text: "Hi there! I am Zara. How can I help you today?" }
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isBrowserModalOpen, setIsBrowserModalOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('zara_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [showLoginPage, setShowLoginPage] = useState(false);
  const [showRegisterPage, setShowRegisterPage] = useState(false);

  const isGuest = !currentUser;

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Refs to prevent "Stale Closures" inside the Speech Recognition event listeners
  const isRecordingRef = useRef(isRecording);
  const isWakeWordActiveRef = useRef(isWakeWordActive);
  const inputTextRef = useRef(inputText);

  useEffect(() => { isRecordingRef.current = isRecording; }, [isRecording]);
  useEffect(() => { isWakeWordActiveRef.current = isWakeWordActive; }, [isWakeWordActive]);
  useEffect(() => { inputTextRef.current = inputText; }, [inputText]);

  // Auto-scroll to the bottom whenever a new message appears
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, openChatPreview]);

  useEffect(() => {
    if (!currentChatId) return;

    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_API_URL}/api/chats/${currentChatId}/messages`);

        if (response.data.length > 0) {
          const formattedHistory = response.data.map(msg => ({
            role: msg.role === 'model' ? 'ai' : 'user',
            text: msg.content
          }));
          setChatHistory(formattedHistory);
        } else {
          setChatHistory([{ role: 'ai', text: "Hi there! I am Zara. How can I help you today?" }]);
        }
      } catch (error) {
        console.error("Failed to load chat history", error);
      }
    };
    fetchHistory();
  }, [currentChatId]);

  const states = [
    'idle', 'sad_idle', 'talking', 'talking1', 'talking2',
    'waving', 'silly_dancing', 'salute', 'rumba_dancing',
    'formal_bow', 'laughing', 'hip_hop_dance', 'disappointed',
    'clapping', 'crying', 'chicken_dance', 'shaking'
  ];

  // 🚨 NEW: Continuous Speech Recognition & Interruption Logic
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let final = '';
      let interim = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) final += event.results[i][0].transcript;
        else interim += event.results[i][0].transcript;
      }

      const currentText = final || interim;
      const lowerText = currentText.toLowerCase();

      console.log("Recognized Speech:", currentText, "| Final:", final);

      // WAKE WORD DETECTION & INTERRUPTION
      if (lowerText.includes('hey zara') || lowerText.includes('hi zara') || lowerText.includes('ok zara') || lowerText.includes('hello zara') || lowerText.includes('hey sara') || lowerText.includes('hi sara') || lowerText.includes('ok sara') || lowerText.includes('hello sara')) {

        // 🚨 1. INTERRUPT HER IMMEDIATELY! (Stops audio & animation)
        setMessage(null);

        if (!isRecordingRef.current) setIsRecording(true);

        // 2. Extract only the words spoken AFTER "Hey Zara"
        const splitPoint = lowerText.lastIndexOf('hey zara') !== -1 ? 'hey zara' : lowerText.lastIndexOf('hi zara') !== -1 ? 'hi zara' : lowerText.lastIndexOf('ok zara') !== -1 ? 'ok zara' : lowerText.lastIndexOf('hello zara') !== -1 ? 'hello zara' : lowerText.lastIndexOf('hey sara') !== -1 ? 'hey sara' : lowerText.lastIndexOf('hi sara') !== -1 ? 'hi sara' : lowerText.lastIndexOf('ok sara') !== -1 ? 'ok sara' : 'hello sara';
        const parts = lowerText.split(splitPoint);
        const command = parts[parts.length - 1].trim();

        setInputText(command);

        // 3. Send automatically when they stop speaking
        if (final && command) {
          sendMessage(command);
          setIsRecording(false);
        }
      }
      // MANUAL MIC CLICK HANDLING
      else if (isRecordingRef.current) {
        setMessage(null); // Interrupt if they manually click the mic while she's talking
        setInputText(currentText);
        if (final) {
          sendMessage(currentText);
          setIsRecording(false);
        }
      }
    };

    // Auto-restart the microphone loop if Wake Word mode is ON
    recognition.onend = () => {
      if (isWakeWordActiveRef.current) {
        try { recognition.start(); } catch (e) { }
      } else {
        setIsRecording(false);
      }
    };

    recognitionRef.current = recognition;

    return () => recognition.stop();
  }, []); // Only runs once on mount

  const toggleWakeWord = () => {
    const newState = !isWakeWordActive;
    setIsWakeWordActive(newState);
    if (newState) {
      try { recognitionRef.current?.start(); } catch (e) { }
    } else {
      if (!isRecording) recognitionRef.current?.stop();
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      // alert("Your browser doesn't support microphone input.");
      setIsBrowserModalOpen(true);
      return;
    }
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const sendMessage = async (textToSend) => {
    const text = typeof textToSend === 'string' ? textToSend : inputTextRef.current;
    if (!text || !text.trim()) return;

    if (!isGuest && !currentChatId) {
      // alert("Please select or create a chat session first.");
      setIsSessionModalOpen(true);
      setInputText('');
      return;
    }

    setChatHistory(prev => [...prev, { role: 'user', text }]);

    setIsLoading(true);
    setInputText(''); // Clear input box
    setMessage(null); // Reset avatar to idle while waiting

    try {
      const payload = isGuest
        ? { message: text, isGuest: true, history: chatHistory } // Pass local history
        : { message: text, isGuest: false, chatId: currentChatId, userId: currentUser.id }; // Pass DB IDs

      const response = await axios.post(`${import.meta.env.VITE_BACKEND_API_URL}/api/chat`, payload);

      const aiData = response.data;

      if (aiData.replyText) {
        setChatHistory(prev => [...prev, { role: 'ai', text: aiData.replyText }]);
      }

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
    <div className={`h-[100dvh] w-full flex md:grid transition-all duration-300 ${isSidebarOpen ? 'md:grid-cols-[16rem_1fr]' : 'md:grid-cols-[0px_1fr]'}`}>

      <div className="absolute md:relative h-full z-50 overflow-hidden">
        <Sidebar
          currentChatId={currentChatId}
          onSelectChat={(id) => setCurrentChatId(id)}
          setIsSidebarOpen={setIsSidebarOpen}
          isSidebarOpen={isSidebarOpen}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          onNavigateToLogin={() => setShowLoginPage(true)}
          onNavigateToRegister={() => setShowRegisterPage(true)}
        />
      </div>


      <div className="relative h-full flex-1 w-full flex flex-col justify-end p-3 sm:p-4 overflow-hidden">
        {/* The Full-Screen 3D Canvas */}
        <AIEmotionAnalyzer
          avatarState={avatarState}
          message={message}
          onMessagePlayed={() => setMessage(null)}
          isFocusMode={isFocusMode}
          isSidebarOpen={isSidebarOpen}
        />
        <AlertModal
          isOpen={isClearModalOpen}
          onClose={() => setIsClearModalOpen(false)}
          onConfirm={() => {
            setChatHistory([{ role: 'ai', text: "Conversation cleared. How can I help?" }]);
          }}
          title="Clear Conversation"
          message="Are you sure you want to clear the conversation history? This action cannot be undone."
          confirmText="Clear"
          type='delete'
        />
        <AlertModal
          isOpen={isSessionModalOpen}
          onClose={() => setIsSessionModalOpen(false)}
          onConfirm={() => setIsSessionModalOpen(false)}
          message="Please select or create a chat session first."
          title="No Chat Session"
          type='warning'
          noCancelText={true}
          confirmText='OK'
        />
        <AlertModal
          isOpen={isBrowserModalOpen}
          onClose={() => setIsBrowserModalOpen(false)}
          onConfirm={() => setIsBrowserModalOpen(false)}
          message="Your browser doesn't support microphone input. Please use a modern browser like Chrome or Firefox."
          title="Browser Not Supported"
          type='warning'
          noCancelText={true}
          confirmText='OK'
        />
        <div className={`transition-all duration-300 ${isMinimized
          ? 'fixed bottom-4 right-4 z-50 w-auto' // Compact pill floating in the bottom right
          : 'w-full max-w-3xl mx-auto mb-4' // Full width when expanded
          }`}>

          {/* Hidden title when minimized to clear up vertical space */}
          {!isMinimized && !openChatPreview && (
            <h1 className={`${isFocusMode ? 'text-4xl sm:text-3xl' : 'text-lg sm:text-xl'} font-bold text-center mb-1 sm:mb-2 text-white drop-shadow-md`}>
              Meet Zara AI
            </h1>
          )}

          {/* Glassmorphic Container */}
          <div className={`bg-white/80 backdrop-blur-md rounded-2xl shadow-2xl pointer-events-auto border border-white/50 transition-all duration-300 ${isMinimized ? 'p-2' : 'p-3 sm:p-4'}`}>

            {/* Layout shifts to a compact row when minimized */}
            <div className={`flex ${isMinimized ? 'flex-row items-center justify-between gap-2' : 'flex-col'}`}>

              {openChatPreview && !isMinimized && (
                <div className="w-full transition-all duration-300 mb-2 border-b border-gray-200/60 pb-4">
                  <div className="flex justify-between items-center mb-3 px-1">
                    <span className="font-semibold text-gray-700 text-sm tracking-wide">Conversation</span>
                    <button
                      // onClick={() => setChatHistory([{ role: 'ai', text: "Conversation cleared. How can I help?" }])}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsClearModalOpen(true)
                      }}
                      className="text-[12px] text-gray-400 hover:text-red-500 uppercase tracking-wider font-semibold transition-colors"
                      title="Clear Conversation"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="space-y-3 overflow-y-auto max-h-[35vh] sm:max-h-60 pr-2 scroll-smooth scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    {chatHistory.map((chat, index) => (
                      <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`p-2.5 rounded-2xl max-w-[92%] sm:max-w-[85%] text-sm shadow-sm ${chat.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-tr-sm'
                          : 'bg-white/90 border border-gray-200/80 text-gray-700 rounded-tl-sm'
                          }`}>
                          {chat.text}
                        </div>
                      </div>
                    ))}

                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white/90 border border-gray-200/80 p-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center shadow-sm">
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </div>
              )}



              {!isMinimized && (
                <div className="flex items-start justify-center text-gray-500">
                  <span className={`inline-flex items-center justify-center origin-center transition-transform duration-300 ${openChatPreview ? 'rotate-180' : ''} text-gray-400 text-sm cursor-pointer`} title="Open Chat Preview" onClick={() => setOpenChatPreview(!openChatPreview)}>
                    <FlatUpArrow />
                  </span>
                </div>
              )}

              {!isMinimized && (
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Chat with Zara</h3>

                  <div className="flex items-center gap-4">

                    {/* 🚨 NEW: Wake Word Toggle */}
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:block text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Wake Word
                      </span>
                      <button
                        onClick={toggleWakeWord}
                        className={`relative w-12 h-6 rounded-full border-2 transition-colors duration-300 focus:outline-none flex items-center px-0.5 ${isWakeWordActive ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-100'}`}
                        title="Say 'Hey Zara' to wake her up"
                      >
                        <div className={`w-4 h-4 rounded-full transition-transform duration-300 shadow-sm ${isWakeWordActive ? 'translate-x-6 bg-green-500' : 'translate-x-0 bg-gray-400'}`} />
                      </button>
                    </div>

                    <div className="w-px h-6 bg-gray-300 hidden sm:block"></div>

                    {/* Focus Toggle */}
                    <div className="flex items-center gap-2">
                      <span className="hidden sm:block text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Focus Mode
                      </span>
                      <button
                        onClick={() => setIsFocusMode(!isFocusMode)}
                        className={`relative w-16 h-8 rounded-full border-2 transition-colors duration-300 focus:outline-none flex items-center px-1 ${isFocusMode ? 'border-purple-500' : 'border-gray-300'}`}
                      >
                        <Target size={17} className={`absolute left-2 z-10 transition-opacity duration-200 text-gray-300 ${isFocusMode ? 'opacity-20 text-gray-800' : 'opacity-100'}`} />
                        <Eye size={17} className={`absolute right-2 z-10 transition-opacity duration-200 text-purple-300 ${isFocusMode ? 'opacity-100' : 'opacity-20 text-purple-700'}`} />
                        <div className={`w-6 h-6 rounded-xl transition-transform duration-300 shadow-md ${isFocusMode ? 'translate-x-7 bg-purple-600' : 'translate-x-0 bg-gray-400'}`} />
                      </button>
                    </div>

                    <button onClick={() => setIsMinimized(!isMinimized)} className="text-gray-500 hover:text-gray-800 p-1 rounded-md hover:bg-gray-100 transition">
                      <Minimize2 size={18} />
                    </button>
                  </div>
                </div>
              )}

              <div className={`flex gap-1.5 sm:gap-2 ${isMinimized ? 'justify-center items-center' : 'w-full mb-4'}`}>
                <button
                  onClick={toggleRecording}
                  className={`p-3 rounded-xl text-white shadow-md transition-colors ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-800 hover:bg-gray-700'}`}
                >
                  <Mic size={20} />
                </button>

                {!isMinimized ? (
                  <>
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder={isWakeWordActive ? "Say 'Hey Zara' or type a message..." : "Type a message or click the mic..."}
                      className="flex-1 min-w-0 bg-white border border-gray-300 rounded-xl px-3 sm:px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 shadow-sm"
                      disabled={isLoading}
                    />
                    <button
                      onClick={() => sendMessage()}
                      disabled={isLoading || !inputText.trim()}
                      className={`px-3 sm:px-6 py-2 sm:py-2.5 text-white font-semibold rounded-xl flex items-center gap-2 shadow-md transition-all duration-200 ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : inputText.trim() ? 'bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 shadow-indigo-600/20 active:scale-[0.98]' : 'bg-gray-500 cursor-not-allowed'}`}
                    >
                      {isLoading ? (<><Loader /><span className="hidden sm:inline">Thinking...</span></>) : ('Send')}
                    </button>
                  </>
                ) : (
                  <span className="text-sm font-medium text-gray-700 animate-fade-in hidden sm:inline">
                    {isRecording ? 'Zara is listening...' : 'Talk to Zara'}
                  </span>
                )}
              </div>

              {isMinimized && (
                <button onClick={() => setIsMinimized(!isMinimized)} className="text-gray-500 hover:text-gray-800 p-2 rounded-xl hover:bg-gray-100 transition border border-gray-200 bg-white shadow-sm">
                  <Maximize2 size={18} />
                </button>
              )}

            </div>

            {/* Manual State Override Hidden cleanly when Minimized */}
            {!isMinimized && (
              <details className="group border border-gray-200 rounded-xl p-2 bg-gray-50/50">
                <summary className="flex items-center justify-between text-xs font-semibold text-gray-500 uppercase tracking-wider cursor-pointer list-none select-none">
                  <span>Manual State Override</span>
                  <span className="transition-transform group-open:rotate-180 text-gray-400 text-sm">
                    <ChevronDown size={16} strokeWidth={3} />
                  </span>
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
            )}

          </div>
        </div>
      </div>

      {showLoginPage && (
        <Login
          setCurrentUser={setCurrentUser}
          onNavigateBack={() => setShowLoginPage(false)}
          onNavigateToRegister={() => {
            setShowLoginPage(false);
            setShowRegisterPage(true);
          }}
        />
      )}
      {showRegisterPage && (
        <Register
          setCurrentUser={setCurrentUser}
          onNavigateBack={() => setShowRegisterPage(false)}
          onNavigateToLogin={() => {
            setShowRegisterPage(false);
            setShowLoginPage(true);
          }}
        />
      )}

    </div>
  );
};

export default AvatarDemo;
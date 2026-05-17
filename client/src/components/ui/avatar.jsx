import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const AIEmotionAnalyzer = ({ avatarState, onLoad, className = "", message, onMessagePlayed }) => {
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
      return;
    }
    if (message.animation) changeAnimation(message.animation);
    if (message.facialExpression) setFacialExpression(message.facialExpression);
    if (message.lipsync) setLipsync(message.lipsync);

    if (message.audio) {
      const audio = new Audio("data:audio/mp3;base64," + message.audio);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => {
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

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        
        const delta = clockRef.current.getDelta();
        if (mixerRef.current) {
          mixerRef.current.update(delta);
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
                  lerpMorphTarget(viseme, 1, 0.2);
                }
                break;
              }
            }

            Object.values(visemeMapping).forEach((viseme) => {
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
      if (rendererRef.current?.domElement && mount.contains(rendererRef.current.domElement)) {
        mount.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) rendererRef.current.dispose();
    };
  }, [onLoad]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mountRef} className="w-[400px] h-[400px] rounded-3xl overflow-hidden shadow-2xl relative" />
    </div>
  );
};

const AvatarDemo = () => {
  const [avatarState, setAvatarState] = useState('idle');
  const [message, setMessage] = useState(null);
  const states = [
    'idle', 'sad_idle', 'talking', 'talking1', 'talking2', 'waving', 
    'silly_dancing', 'salute', 'rumba_dancing', 'formal_bow', 
    'laughing', 'hip_hop_dance', 'disappointed', 'clapping', 
    'crying', 'chicken_dance', 'shaking'
  ];

  const simulateMessage = () => {
    setMessage({
      animation: 'talking1',
      facialExpression: 'smile',
      lipsync: {
        mouthCues: [
          { start: 0, end: 0.1, value: 'A' },
          { start: 0.1, end: 0.3, value: 'E' },
          { start: 0.3, end: 0.5, value: 'I' },
        ]
      }
    });
  };

  const formatLabel = (str) => {
    return str.replace(/_/g, ' ')
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Enhanced AI Avatar</h1>
        <div className="flex justify-center mb-8">
          <AIEmotionAnalyzer
            avatarState={avatarState}
            message={message}
            onMessagePlayed={() => setMessage(null)}
          />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4">Avatar Controls</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Avatar State:</label>
              <div className="flex flex-wrap gap-2">
                {states.map(state => (
                  <button
                    key={state}
                    onClick={() => setAvatarState(state)}
                    className={`px-3 py-1 rounded text-sm ${avatarState === state ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  >
                    {formatLabel(state)}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <button onClick={simulateMessage} className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">
                Simulate Speaking Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarDemo;
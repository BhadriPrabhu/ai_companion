import React, { useState, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { AnimationMixer } from 'three';

const AIEmotionAnalyzer = ({ avatarState, onLoad, className = "" }) => {

  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const avatarRef = useRef(null);
  const cameraRef = useRef(null);
  const mixerRef = useRef(null);
  const animationActionsRef = useRef({});
  const clockRef = useRef(new THREE.Clock());
  const currentAvatarStateRef = useRef('');
  
  const effectiveState = avatarState || currentAvatarStateRef.current || "idle";

  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentAnimation, setCurrentAnimation] = useState('idle');
  const [error, setError] = useState(null);

  // Map avatar states to GLB files
  const avatarFiles = {
    'idle': '/avatar_standing_idle.glb',
    'dancing': '/avatar_hiphop_dance.glb',
    'talking': '/avatar_talking.glb',
    'handshake': '/avatar_talking.glb',
    'waving': '/avatar_waving.glb',
    'greeting': '/avatar_waving.glb',
    'listening': '/avatar_standing_idle.glb'
  };

  // Function to load avatar based on state
  const loadAvatarForState = (state) => {
    const avatarFile = avatarFiles[state] || avatarFiles['idle'];
    
    if (currentAvatarStateRef.current === state) {
      return; // Don't reload same state
    }

    // Remove current avatar
    if (avatarRef.current && sceneRef.current) {
      sceneRef.current.remove(avatarRef.current);
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    }

    // Load new avatar
    const loader = new GLTFLoader();
    loader.load(
      avatarFile,
      (gltf) => {
        try {
          const avatar = gltf.scene;
          avatar.scale.set(1.8, 1.8, 1.8);
          avatar.position.set(0, -0.5, 0);
          
          avatar.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              if (child.material) {
                child.material.side = THREE.DoubleSide;
                child.material.needsUpdate = true;
              }
            }
          });

          sceneRef.current.add(avatar);
          avatarRef.current = avatar;
          currentAvatarStateRef.current = state;

          // Setup animations
          if (gltf.animations && gltf.animations.length > 0) {
            const mixer = new AnimationMixer(avatar);
            mixerRef.current = mixer;
            animationActionsRef.current = {};
            
            gltf.animations.forEach((clip) => {
              const action = mixer.clipAction(clip);
              animationActionsRef.current[clip.name.toLowerCase()] = action;
            });

            // Play first available animation
            const actions = Object.values(animationActionsRef.current);
            if (actions.length > 0) {
              actions[0].play();
            }
          }

          console.log(`Loaded avatar for state: ${state} (${avatarFile})`);
          setError(null);
        } catch (err) {
          console.error('Error processing avatar:', err);
          setError('Failed to process avatar');
        }
      },
      (progress) => {
        if (progress.total > 0) {
          const percentComplete = (progress.loaded / progress.total) * 100;
          setLoadingProgress(Math.min(percentComplete, 95));
        }
      },
      (error) => {
        console.error('Avatar loading error:', error);
        setError(`Failed to load avatar: ${avatarFile}`);
      }
    );
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const mount = mountRef.current;
    let animationFrameId;

    try {
      // Scene setup
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf8fafc);
      sceneRef.current = scene;

      // Camera setup
      const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
      camera.position.set(0, 1.6, 4);
      camera.lookAt(0, 1, 0);
      cameraRef.current = camera;

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(400, 400);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      rendererRef.current = renderer;
      mount.appendChild(renderer.domElement);

      // Enhanced lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 10, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      directionalLight.shadow.camera.near = 0.5;
      directionalLight.shadow.camera.far = 50;
      scene.add(directionalLight);

      const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
      fillLight.position.set(-5, 5, -5);
      scene.add(fillLight);

      // Add subtle ground plane
      const groundGeometry = new THREE.PlaneGeometry(10, 10);
      const groundMaterial = new THREE.MeshLambertMaterial({ 
        color: 0xf8fafc, 
        opacity: 0.8, 
        transparent: true 
      });
      const ground = new THREE.Mesh(groundGeometry, groundMaterial);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.5;
      ground.receiveShadow = true;
      scene.add(ground);

      // Load initial avatar
      console.log("avatarstate",avatarState);
      console.log("state",effectiveState);
      loadAvatarForState(effectiveState);
      setAvatarLoaded(true);
      
      if (onLoad) onLoad();

      // Animation loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        
        const delta = clockRef.current.getDelta();
        if (mixerRef.current) {
          mixerRef.current.update(delta);
        }
        
        // Gentle camera sway
        if (cameraRef.current) {
          const time = clockRef.current.getElapsedTime();
          cameraRef.current.position.x = Math.sin(time * 0.2) * 0.1;
          cameraRef.current.lookAt(0, 1, 0);
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

    // Cleanup function
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (rendererRef.current?.domElement && mount.contains(rendererRef.current.domElement)) {
        mount.removeChild(rendererRef.current.domElement);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current.uncacheRoot(mixerRef.current.getRoot());
      }
      // Cleanup Three.js objects
      if (sceneRef.current) {
        sceneRef.current.traverse((object) => {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(material => material.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, [onLoad]);

  // Handle avatar state changes - load different GLB files
  useEffect(() => {
    if (!avatarLoaded) return;
    
    // Load new avatar file when state changes
    loadAvatarForState(effectiveState);
  }, [avatarState, avatarLoaded]);

  const getStatusColor = () => {
    if (error) return 'bg-red-400';
    if (avatarLoaded) return 'bg-green-400';
    return 'bg-yellow-400';
  };

  const getStatusText = () => {
    if (error) return 'Error';
    if (avatarLoaded) return 'Online';
    return 'Loading';
  };

  return (
    <div className={`relative ${className}`}>
      <div 
        ref={mountRef} 
        className="w-[400px] h-[400px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50 backdrop-blur-sm bg-gradient-to-br from-blue-50/80 to-purple-50/80 relative"
        style={{
          background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.8), rgba(245, 243, 255, 0.8))'
        }}
      />
      
      {/* Loading Screen */}
      {!avatarLoaded && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50/95 to-purple-50/95 rounded-3xl backdrop-blur-sm">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <div className="space-y-2">
              <div className="text-lg font-semibold text-gray-700">Loading AI Avatar</div>
              <div className="text-sm text-gray-500">
                {loadingProgress > 0 ? `${Math.round(loadingProgress)}%` : 'Initializing...'}
              </div>
              <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(loadingProgress, 5)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Screen */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-50/95 to-pink-50/95 rounded-3xl backdrop-blur-sm">
          <div className="text-center space-y-4 p-6">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 text-red-500">⚠️</div>
            </div>
            <div className="space-y-2">
              <div className="text-lg font-semibold text-gray-700">Avatar Unavailable</div>
              <div className="text-sm text-gray-500">{error}</div>
              <div className="text-xs text-gray-400 mt-2">
                The 3D avatar model couldn't be loaded, but you can still use the chat features.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="absolute top-4 right-4">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${avatarLoaded && !error ? 'animate-pulse' : ''}`} />
      </div>

      {/* Avatar Status */}
      {avatarLoaded && !error && (
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 text-center shadow-lg">
            <div className="flex items-center justify-between">
              <div className="text-xs font-medium text-gray-600 capitalize">
                {effectiveState || 'idle'}
              </div>
              <div className="text-xs text-gray-500">
                {getStatusText()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="absolute top-4 left-4 text-xs text-gray-500 bg-white/80 p-2 rounded">
        <div>State: {effectiveState}</div>
        <div>File: {avatarFiles[effectiveState] || avatarFiles['idle']}</div>
      </div>
    </div>
  );
};

export default AIEmotionAnalyzer;




// import React, { useState, useRef, useEffect } from 'react';
// import * as THREE from 'three';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
// // import { AnimationMixer } from 'three';

// // Global cache for preloaded models
// const modelCache = {
//   models: {},
//   isLoading: false,
//   loadedCount: 0,
//   totalCount: 0,
//   error: null
// };

// // Define all avatar models to preload
// const avatarFiles = {
//   idle: '/avatar_standing_idle.glb',
//   handshake: '/avatar_bow.glb', 
//   dance: '/avatar_rumpa_dancing.glb',
//   talk: '/avatar_talking.glb',
//   hello: '/avatar_waving.glb',
//   wave: '/avatar_waving_gesture.glb',
//   listening: '/avatar_bow.glb'
// };

// // Preload all models function
// const preloadAllModels = async (onProgress) => {
//   if (modelCache.isLoading) return;
  
//   modelCache.isLoading = true;
//   modelCache.totalCount = Object.keys(avatarFiles).length;
//   modelCache.loadedCount = 0;
//   modelCache.error = null;

//   const loader = new GLTFLoader();
//   const loadPromises = [];

//   Object.entries(avatarFiles).forEach(([key, path]) => {
//     const promise = new Promise((resolve, reject) => {
//       // Skip if already loaded
//       if (modelCache.models[key]) {
//         modelCache.loadedCount++;
//         onProgress && onProgress((modelCache.loadedCount / modelCache.totalCount) * 100);
//         resolve();
//         return;
//       }

//       loader.load(
//         path,
//         (gltf) => {
//           try {
//             // Store the loaded model
//             modelCache.models[key] = {
//               scene: gltf.scene.clone(),
//               animations: gltf.animations || []
//             };
            
//             modelCache.loadedCount++;
//             const progress = (modelCache.loadedCount / modelCache.totalCount) * 100;
//             onProgress && onProgress(progress);
            
//             console.log(`Loaded ${key}: ${progress.toFixed(1)}%`);
//             resolve();
//           } catch (error) {
//             console.error(`Error processing ${key}:`, error);
//             reject(error);
//           }
//         },
//         (progress) => {
//           // Individual file progress - can be used for more detailed progress
//         },
//         (error) => {
//           console.error(`Failed to load ${key}:`, error);
//           // Don't reject, just skip this model
//           modelCache.loadedCount++;
//           onProgress && onProgress((modelCache.loadedCount / modelCache.totalCount) * 100);
//           resolve();
//         }
//       );
//     });
    
//     loadPromises.push(promise);
//   });

//   try {
//     await Promise.all(loadPromises);
//     modelCache.isLoading = false;
//     console.log('All models preloaded successfully!');
//   } catch (error) {
//     modelCache.error = error;
//     modelCache.isLoading = false;
//     console.error('Error preloading models:', error);
//   }
// };

// const AIEmotionAnalyzer = ({ avatarState = 'idle', onLoad, className = "" }) => {
//   const mountRef = useRef(null);
//   const sceneRef = useRef(null);
//   const rendererRef = useRef(null);
//   const avatarRef = useRef(null);
//   const cameraRef = useRef(null);
//   const mixerRef = useRef(null);
//   const animationActionsRef = useRef({});
//   const clockRef = useRef(new THREE.Clock());
//   const frameRef = useRef(null);

//   const [avatarLoaded, setAvatarLoaded] = useState(false);
//   const [loadingProgress, setLoadingProgress] = useState(0);
//   const [currentAnimation, setCurrentAnimation] = useState('idle');
//   const [currentModel, setCurrentModel] = useState('idle');
//   const [error, setError] = useState(null);

//   // Start preloading on component mount
//   useEffect(() => {
//     const initPreload = async () => {
//       if (!modelCache.isLoading && Object.keys(modelCache.models).length === 0) {
//         await preloadAllModels((progress) => {
//           setLoadingProgress(progress);
//         });
//       }
//     };

//     initPreload();
//   }, []);

//   // Initialize scene
//   useEffect(() => {
//     if (!mountRef.current) return;

//     const mount = mountRef.current;
//     let isComponentMounted = true;

//     const initializeScene = async () => {
//       try {
//         // Scene setup
//         const scene = new THREE.Scene();
//         scene.background = new THREE.Color(0xf8fafc);
//         sceneRef.current = scene;

//         // Camera setup
//         const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
//         camera.position.set(0, 1.6, 4);
//         camera.lookAt(0, 1, 0);
//         cameraRef.current = camera;

//         // Renderer setup
//         const renderer = new THREE.WebGLRenderer({ 
//           antialias: true, 
//           alpha: true,
//           powerPreference: "high-performance"
//         });
//         renderer.setSize(400, 400);
//         renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
//         renderer.shadowMap.enabled = true;
//         renderer.shadowMap.type = THREE.PCFSoftShadowMap;
//         renderer.toneMapping = THREE.ACESFilmicToneMapping;
//         renderer.toneMappingExposure = 1.2;
//         rendererRef.current = renderer;
        
//         if (mount && !mount.contains(renderer.domElement)) {
//           mount.appendChild(renderer.domElement);
//         }

//         // Enhanced lighting
//         const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
//         scene.add(ambientLight);
        
//         const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
//         directionalLight.position.set(5, 10, 5);
//         directionalLight.castShadow = true;
//         directionalLight.shadow.mapSize.width = 2048;
//         directionalLight.shadow.mapSize.height = 2048;
//         directionalLight.shadow.camera.near = 0.5;
//         directionalLight.shadow.camera.far = 50;
//         scene.add(directionalLight);

//         const fillLight = new THREE.DirectionalLight(0x87ceeb, 0.3);
//         fillLight.position.set(-5, 5, -5);
//         scene.add(fillLight);

//         // Add ground plane
//         const groundGeometry = new THREE.PlaneGeometry(10, 10);
//         const groundMaterial = new THREE.MeshLambertMaterial({ 
//           color: 0xf8fafc, 
//           opacity: 0.8, 
//           transparent: true 
//         });
//         const ground = new THREE.Mesh(groundGeometry, groundMaterial);
//         ground.rotation.x = -Math.PI / 2;
//         ground.position.y = -0.5;
//         ground.receiveShadow = true;
//         scene.add(ground);

//         // Wait for models to preload
//         while (modelCache.isLoading) {
//           await new Promise(resolve => setTimeout(resolve, 100));
//         }

//         // Load initial avatar (idle)
//         await loadAvatar('idle');

//         setAvatarLoaded(true);
//         setError(null);
        
//         if (onLoad) onLoad();

//         // Animation loop
//         const animate = () => {
//           if (!isComponentMounted) return;
          
//           frameRef.current = requestAnimationFrame(animate);
          
//           try {
//             const delta = clockRef.current.getDelta();
            
//             if (mixerRef.current) {
//               mixerRef.current.update(delta);
//             }
            
//             // Gentle camera sway
//             if (cameraRef.current) {
//               const time = clockRef.current.getElapsedTime();
//               cameraRef.current.position.x = Math.sin(time * 0.2) * 0.1;
//               cameraRef.current.lookAt(0, 1, 0);
//             }

//             if (rendererRef.current && sceneRef.current && cameraRef.current) {
//               rendererRef.current.render(sceneRef.current, cameraRef.current);
//             }
//           } catch (renderError) {
//             console.error('Render error:', renderError);
//           }
//         };
        
//         animate();

//       } catch (initError) {
//         console.error('Scene initialization error:', initError);
//         setError('Failed to initialize 3D environment');
//         setAvatarLoaded(true);
//       }
//     };

//     // Function to load/switch avatar models instantly
//     const loadAvatar = async (modelKey) => {
//       if (!sceneRef.current || !modelCache.models[modelKey]) {
//         console.warn(`Model ${modelKey} not available`);
//         return;
//       }

//       try {
//         // Remove current avatar
//         if (avatarRef.current) {
//           sceneRef.current.remove(avatarRef.current);
          
//           // Clean up current mixer
//           if (mixerRef.current) {
//             mixerRef.current.stopAllAction();
//             mixerRef.current.uncacheRoot(mixerRef.current.getRoot());
//           }
//         }

//         // Clone the cached model
//         const cachedModel = modelCache.models[modelKey];
//         const avatar = cachedModel.scene.clone();
        
//         avatar.scale.set(1.8, 1.8, 1.8);
//         avatar.position.set(0, -0.5, 0);
        
//         // Setup materials
//         avatar.traverse((child) => {
//           if (child.isMesh) {
//             child.castShadow = true;
//             child.receiveShadow = true;
//             if (child.material) {
//               child.material = child.material.clone();
//               child.material.side = THREE.DoubleSide;
//               child.material.needsUpdate = true;
//             }
//           }
//         });

//         sceneRef.current.add(avatar);
//         avatarRef.current = avatar;

//         // Setup animations if available
//         if (cachedModel.animations && cachedModel.animations.length > 0) {
//           const mixer = new THREE.AnimationMixer(avatar);
//           mixerRef.current = mixer;
//           animationActionsRef.current = {};
          
//           cachedModel.animations.forEach((clip) => {
//             try {
//               const clonedClip = clip.clone();
//               const action = mixer.clipAction(clonedClip);
//               action.setLoop(THREE.LoopRepeat);
//               animationActionsRef.current[clip.name.toLowerCase()] = action;
//             } catch (clipError) {
//               console.warn(`Error setting up animation ${clip.name}:`, clipError);
//             }
//           });

//           // Play first available animation
//           const actions = Object.values(animationActionsRef.current);
//           if (actions.length > 0) {
//             actions[0].play();
//           }
//         }

//         setCurrentModel(modelKey);
//         console.log(`Switched to ${modelKey} model instantly!`);

//       } catch (error) {
//         console.error(`Error loading avatar ${modelKey}:`, error);
//       }
//     };

//     // Store loadAvatar function for external access
//     window.loadAvatar = loadAvatar;

//     initializeScene();

//     // Cleanup
//     return () => {
//       isComponentMounted = false;
      
//       if (frameRef.current) {
//         cancelAnimationFrame(frameRef.current);
//       }
      
//       if (mixerRef.current) {
//         mixerRef.current.stopAllAction();
//         mixerRef.current.uncacheRoot(mixerRef.current.getRoot());
//       }
      
//       if (rendererRef.current?.domElement && mount?.contains(rendererRef.current.domElement)) {
//         mount.removeChild(rendererRef.current.domElement);
//       }
      
//       if (rendererRef.current) {
//         rendererRef.current.dispose();
//       }
      
//       if (sceneRef.current) {
//         sceneRef.current.traverse((object) => {
//           if (object.geometry) {
//             object.geometry.dispose();
//           }
//           if (object.material) {
//             if (Array.isArray(object.material)) {
//               object.material.forEach(material => material.dispose());
//             } else {
//               object.material.dispose();
//             }
//           }
//         });
//       }
//     };
//   }, [onLoad]);

//   // Handle avatar state changes - switch models instantly
//   useEffect(() => {
//     if (!avatarLoaded) return;

//     const loadAvatar = window.loadAvatar;
//     if (!loadAvatar) return;

//     // Map avatar states to model files
//     const stateToModel = {
//       'handshake': 'handshake',
//       'dancing': 'dance',
//       'talking': 'talk',
//       'hello': 'hello',
//       'greeting': 'hello',
//       'waving': 'wave',
//       'listening': 'listening',
//       'idle': 'idle'
//     };
    
//     const targetModel = stateToModel[avatarState] || 'idle';
    
//     // Only switch if it's a different model
//     if (targetModel !== currentModel) {
//       loadAvatar(targetModel);
//     }
//   }, [avatarState, avatarLoaded, currentModel]);

//   // Status helper functions
//   const getStatusColor = () => {
//     if (error) return 'bg-red-400';
//     if (avatarLoaded) return 'bg-green-400';
//     return 'bg-yellow-400';
//   };

//   const getStatusText = () => {
//     if (error) return 'Error';
//     if (avatarLoaded) return 'Online';
//     return 'Loading';
//   };

//   return (
//     <div className={`relative ${className}`}>
//       <div 
//         ref={mountRef} 
//         className="w-[400px] h-[400px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50 backdrop-blur-sm bg-gradient-to-br from-blue-50/80 to-purple-50/80 relative"
//         style={{
//           background: 'linear-gradient(135deg, rgba(239, 246, 255, 0.8), rgba(245, 243, 255, 0.8))'
//         }}
//       />
      
//       {/* Enhanced Loading Screen */}
//       {!avatarLoaded && !error && (
//         <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-50/95 to-purple-50/95 rounded-3xl backdrop-blur-sm">
//           <div className="text-center space-y-4">
//             <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
//             <div className="space-y-2">
//               <div className="text-lg font-semibold text-gray-700">Loading AI Avatar</div>
//               <div className="text-sm text-gray-500">
//                 {loadingProgress > 0 ? `${Math.round(loadingProgress)}%` : 'Initializing...'}
//               </div>
//               <div className="text-xs text-gray-400">
//                 Loading {modelCache.loadedCount}/{modelCache.totalCount} models
//               </div>
//               <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
//                 <div 
//                   className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-500 ease-out"
//                   style={{ width: `${Math.max(loadingProgress, 5)}%` }}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Enhanced Error Screen */}
//       {error && (
//         <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-red-50/95 to-pink-50/95 rounded-3xl backdrop-blur-sm">
//           <div className="text-center space-y-4 p-6">
//             <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
//               <div className="w-8 h-8 text-red-500">⚠️</div>
//             </div>
//             <div className="space-y-2">
//               <div className="text-lg font-semibold text-gray-700">Avatar Unavailable</div>
//               <div className="text-sm text-gray-500 max-w-xs">{error}</div>
//               <div className="text-xs text-gray-400 mt-2">
//                 Some 3D models couldn't be loaded. Chat features are still available.
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Status Indicator */}
//       <div className="absolute top-4 right-4">
//         <div className={`w-3 h-3 rounded-full ${getStatusColor()} ${avatarLoaded && !error ? 'animate-pulse' : ''}`} />
//       </div>

//       {/* Enhanced Avatar Status */}
//       {avatarLoaded && !error && (
//         <div className="absolute bottom-4 left-4 right-4">
//           <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 text-center shadow-lg border border-white/20">
//             <div className="flex items-center justify-between">
//               <div className="text-xs font-medium text-gray-600 capitalize">
//                 {currentModel} • {avatarState || 'idle'}
//               </div>
//               <div className="flex items-center space-x-1">
//                 <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
//                 <div className="text-xs text-gray-500">
//                   {getStatusText()}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {process.env.NODE_ENV === 'development' && (
//         <div className="absolute top-4 left-4 text-xs text-gray-500 bg-white/80 p-2 rounded">
//           Models: {Object.keys(modelCache.models).length}/{Object.keys(avatarFiles).length}
//         </div>
//       )}
//     </div>
//   );
// };

// export default AIEmotionAnalyzer;
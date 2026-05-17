import React, { useState } from 'react';
import {
    Brain,
    Activity,
    Heart,
    Users,
    HandMetal,
    Star,
    Sparkles,
    Music,
    Play,
    Home,
    Shield,
    Smile,
    Frown,
    Meh,
    Zap
} from 'lucide-react';
import ChatBot from '../components/ui/Chatbot';
import AIEmotionAnalyzer from '../components/ui/aiEmotionAnalyzer';

// Mock AIEmotionAnalyzer component
// const AIEmotionAnalyzer = ({ avatarState, onLoad, className = "" }) => {
//     React.useEffect(() => {
//         // Simulate loading
//         setTimeout(() => onLoad && onLoad(), 1000);
//     }, [onLoad]);

//     return (
//         <div className={`w-[350px] h-[350px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50 backdrop-blur-sm bg-gradient-to-br from-blue-50/80 to-purple-50/80 relative ${className}`}>
//             <div className="absolute inset-0 flex flex-col items-center justify-center">
//                 <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
//                     <Brain className="w-10 h-10 text-white" />
//                 </div>
//                 <div className="text-center space-y-2">
//                     <div className="text-lg font-semibold text-gray-700">AI Avatar</div>
//                     <div className="text-sm text-gray-500 capitalize">{avatarState || 'idle'}</div>
//                 </div>
//             </div>
            
//             {/* Status Indicator */}
//             <div className="absolute top-4 right-4">
//                 <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
//             </div>
//         </div>
//     );
// };

// Mock ChatBot component
// const ChatBot = ({ 
//     chatOpen, 
//     setChatOpen, 
//     analysisStarted,
//     chatMessages,
//     setChatMessages,
//     newMessage,
//     setNewMessage,
//     avatarPersonality,
//     avatarLoaded,
//     avatarState,
//     onTriggerAction,
//     avatarResponses 
// }) => {
//     const sendMessage = () => {
//         if (!newMessage.trim()) return;
        
//         const userMessage = { 
//             type: 'user', 
//             message: newMessage.trim(), 
//             timestamp: Date.now() 
//         };
//         setChatMessages(prev => [...prev, userMessage]);
//         setNewMessage('');
        
//         // Simulate bot response
//         setTimeout(() => {
//             const responses = [
//                 "That's interesting! Tell me more.",
//                 "I understand. How does that make you feel?",
//                 "Thanks for sharing that with me!"
//             ];
//             const botMessage = {
//                 type: 'bot',
//                 message: responses[Math.floor(Math.random() * responses.length)],
//                 timestamp: Date.now()
//             };
//             setChatMessages(prev => [...prev, botMessage]);
//         }, 1000);
//     };

//     return (
//         <div className={`fixed bottom-6 right-6 transition-all duration-500 z-40 ${
//             chatOpen ? 'w-96 h-[500px]' : 'w-16 h-16'
//         }`}>
//             {chatOpen ? (
//                 <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 h-full flex flex-col">
//                     {/* Header */}
//                     <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-t-3xl flex items-center justify-between">
//                         <div className="flex items-center">
//                             <Brain className="w-6 h-6 mr-2" />
//                             <span className="font-semibold">AI Companion</span>
//                         </div>
//                         <button
//                             onClick={() => setChatOpen(false)}
//                             className="hover:bg-white/20 p-2 rounded-full transition-colors"
//                         >
//                             ×
//                         </button>
//                     </div>

//                     {/* Messages */}
//                     <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-slate-50 to-blue-50">
//                         {chatMessages.map((msg, index) => (
//                             <div key={index} className={`flex mb-3 ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
//                                 <div className={`max-w-[80%] p-3 rounded-2xl ${
//                                     msg.type === 'user'
//                                         ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
//                                         : 'bg-white text-gray-800 border'
//                                 }`}>
//                                     {msg.message}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>

//                     {/* Input */}
//                     <div className="p-4 border-t bg-white/80">
//                         <div className="flex gap-2">
//                             <input
//                                 type="text"
//                                 value={newMessage}
//                                 onChange={(e) => setNewMessage(e.target.value)}
//                                 onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
//                                 placeholder="Type your message..."
//                                 className="flex-1 px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                             />
//                             <button
//                                 onClick={sendMessage}
//                                 className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
//                             >
//                                 Send
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             ) : (
//                 <button
//                     onClick={() => analysisStarted && setChatOpen(true)}
//                     disabled={!analysisStarted}
//                     className={`w-16 h-16 rounded-full shadow-2xl transition-all duration-300 flex items-center justify-center ${
//                         analysisStarted
//                             ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:scale-110'
//                             : 'bg-gray-300 text-gray-500 cursor-not-allowed'
//                     }`}
//                 >
//                     <Brain className="w-7 h-7" />
//                 </button>
//             )}
//         </div>
//     );
// };

const Dashboard = () => {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [analysisStarted, setAnalysisStarted] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [currentMood, setCurrentMood] = useState('neutral');
    const [avatarState, setAvatarState] = useState('idle');
    const [chatMessages, setChatMessages] = useState([
        { 
            type: 'bot', 
            message: 'Hello there! I\'m your AI companion. Ready to interact?', 
            emotion: 'friendly', 
            timestamp: Date.now() 
        }
    ]);
    const [newMessage, setNewMessage] = useState('');
    const [interactionCount, setInteractionCount] = useState(0);
    const [avatarPersonality, setAvatarPersonality] = useState('friendly');
    const [avatarLoaded, setAvatarLoaded] = useState(false);

    const avatarResponses = {
        handshake: [
            "Great! *shakes hand warmly* Nice to meet you!",
            "Wonderful handshake! *grips firmly* Let's be great friends!",
            "Perfect! *shakes hand enthusiastically* I'm excited to chat with you!"
        ],
        greeting: [
            "Hi! I'm your AI companion. What's on your mind today?",
            "Hello! Ready for some engaging conversations?",
            "Welcome! How can I brighten your day?"
        ],
        dancing: [
            "Let's dance together! *starts moving rhythmically*",
            "Music to my circuits! *dances happily*",
            "I love to dance! *grooves to the beat*"
        ],
        waving: [
            "Hello there! *waves enthusiastically*",
            "Hi! *waves with both hands*",
            "Greetings! *gives a friendly wave*"
        ]
    };

    const moodColors = {
        positive: 'from-green-400 to-emerald-500',
        neutral: 'from-yellow-400 to-orange-500',
        negative: 'from-red-400 to-pink-500'
    };

    const startAnalysis = () => {
        setAnalysisProgress(0);
        const interval = setInterval(() => {
            setAnalysisProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setAnalysisStarted(true);
                    setCurrentPage('results');
                    return 100;
                }
                return prev + 8;
            });
        }, 150);
    };

    const triggerAvatarAction = (action) => {
        setAvatarState(action);
        setInteractionCount(prev => prev + 1);

        // Reset avatar state after animation
        const duration = action === 'dancing' ? 5000 : 3000;
        setTimeout(() => setAvatarState('idle'), duration);
    };

    const DashboardView = () => (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
                    {/* Main Content - Takes up 3 columns */}
                    <div className="xl:col-span-3 space-y-8">
                        {/* Header Section */}
                        <div className="text-center xl:text-left space-y-4">
                            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-full text-sm font-medium text-indigo-700 mb-4">
                                <Sparkles className="w-4 h-4 mr-2" />
                                Next-Gen AI Companion
                            </div>
                            <h1 className="text-5xl xl:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
                                Meet Your AI
                                <br />
                                <span className="text-4xl xl:text-5xl">Emotion Buddy</span>
                            </h1>
                            <p className="text-xl text-gray-600 max-w-2xl">
                                Experience the future of AI interaction with emotional intelligence, 
                                natural conversations, and meaningful connections.
                            </p>
                        </div>
                        
                        {/* Main Card */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50 relative overflow-hidden">
                            {/* Background decoration */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-3xl" />
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-200/30 to-purple-200/30 rounded-full -translate-y-16 translate-x-16" />
                            
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                            Start Your AI Journey
                                        </h2>
                                        <p className="text-gray-600">
                                            Your AI companion will analyze your emotions and provide personalized support
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                            {interactionCount}
                                        </div>
                                        <div className="text-sm text-gray-500">Interactions</div>
                                    </div>
                                </div>

                                {/* Feature Pills */}
                                <div className="flex flex-wrap gap-3 mb-6">
                                    {[
                                        { icon: HandMetal, text: 'Interactive Gestures', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
                                        { icon: Music, text: 'Dance Together', bgColor: 'bg-pink-100', textColor: 'text-pink-700' },
                                        { icon: Heart, text: 'Emotional Support', bgColor: 'bg-red-100', textColor: 'text-red-700' },
                                        { icon: Brain, text: 'Smart Responses', bgColor: 'bg-blue-100', textColor: 'text-blue-700' }
                                    ].map((feature, index) => (
                                        <div key={index} className={`flex items-center px-4 py-2 ${feature.bgColor} ${feature.textColor} rounded-full text-sm font-medium`}>
                                            <feature.icon className="w-4 h-4 mr-2" />
                                            {feature.text}
                                        </div>
                                    ))}
                                </div>

                                {/* Progress Bar */}
                                {analysisProgress > 0 && analysisProgress < 100 && (
                                    <div className="mb-6 space-y-3">
                                        <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
                                            <div
                                                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500 relative overflow-hidden"
                                                style={{ width: `${analysisProgress}%` }}
                                            >
                                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center text-gray-600">
                                            <Brain className="w-5 h-5 mr-2 text-indigo-500 animate-spin" />
                                            <span className="font-medium">Initializing your AI companion... {analysisProgress}%</span>
                                        </div>
                                    </div>
                                )}
                                
                                {/* Start Button */}
                                <div className="flex justify-center">
                                    <button
                                        onClick={startAnalysis}
                                        disabled={analysisProgress > 0 && analysisProgress < 100}
                                        className="group relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold w-32 h-32 rounded-full shadow-2xl hover:shadow-pink-500/25 transition-all duration-500 transform hover:scale-110 flex items-center justify-center overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 animate-pulse" />
                                        {analysisProgress > 0 && analysisProgress < 100 ? (
                                            <Activity className="w-8 h-8 animate-pulse relative z-10" />
                                        ) : (
                                            <div className="flex flex-col items-center relative z-10">
                                                <Play className="w-8 h-8 mb-1 group-hover:animate-bounce" />
                                                <span className="text-sm">Start</span>
                                            </div>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Feature Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                {
                                    icon: Brain,
                                    title: '3D AI Avatar',
                                    description: 'Lifelike 3D companion with realistic animations and expressions',
                                    gradient: 'from-indigo-500 to-blue-600'
                                },
                                {
                                    icon: HandMetal,
                                    title: 'Physical Interactions',
                                    description: 'Shake hands, wave, dance, and celebrate together',
                                    gradient: 'from-purple-500 to-pink-600'
                                },
                                {
                                    icon: Shield,
                                    title: 'Private & Secure',
                                    description: 'All conversations remain completely confidential',
                                    gradient: 'from-green-500 to-emerald-600'
                                }
                            ].map((feature, index) => (
                                <div key={index} className="group bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                                    <div className={`w-12 h-12 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-bold text-gray-800 text-center mb-2">{feature.title}</h3>
                                    <p className="text-sm text-gray-600 text-center leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Avatar Column - Takes up 2 columns, positioned properly */}
                    <div className="xl:col-span-2 flex justify-center xl:justify-start">
                        <div className="sticky top-8">
                            <AIEmotionAnalyzer 
                                avatarState={avatarState} 
                                onLoad={() => setAvatarLoaded(true)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const ResultsView = () => (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
                    {/* Main Content - 3 columns */}
                    <div className="xl:col-span-3 space-y-8">
                        {/* Header */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/50">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div>
                                    <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                        AI Companion Active
                                    </h1>
                                    <p className="text-gray-600 mt-2">Your avatar is ready for meaningful interactions!</p>
                                </div>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={() => { 
                                            setCurrentPage('dashboard'); 
                                            setAnalysisStarted(false); 
                                            setAnalysisProgress(0); 
                                        }}
                                        className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                                    >
                                        <Home className="w-5 h-5 mr-2" />
                                        Dashboard
                                    </button>
                                    <div className="flex items-center justify-center px-4 py-3 bg-gray-100 rounded-2xl shadow-md">
                                        <Users className="w-5 h-5 mr-2 text-indigo-600" />
                                        <span className="font-semibold text-gray-700">{interactionCount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mood Analysis */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50">
                            <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 flex items-center">
                                <Activity className="w-6 lg:w-8 h-6 lg:h-8 mr-3 text-indigo-600" />
                                Current Status
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Mood */}
                                <div className="text-center">
                                    <div className={`w-20 h-20 bg-gradient-to-r ${moodColors[currentMood]} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                                        {currentMood === 'positive' && <Smile className="w-10 h-10 text-white" />}
                                        {currentMood === 'neutral' && <Meh className="w-10 h-10 text-white" />}
                                        {currentMood === 'negative' && <Frown className="w-10 h-10 text-white" />}
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 capitalize">{currentMood} Mood</h3>
                                    <p className="text-gray-600">Emotional state detected</p>
                                </div>
                                
                                {/* Personality */}
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                        <Heart className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 capitalize">{avatarPersonality}</h3>
                                    <p className="text-gray-600">Avatar personality</p>
                                </div>
                                
                                {/* Status */}
                                <div className="text-center">
                                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                        <Sparkles className="w-10 h-10 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-800 capitalize">{avatarState}</h3>
                                    <p className="text-gray-600">Current activity</p>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/50">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                                <Zap className="w-6 h-6 mr-3 text-yellow-500" />
                                Quick Interactions
                            </h2>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { action: 'handshake', icon: HandMetal, label: 'Handshake', bgColor: 'bg-purple-100', textColor: 'text-purple-600' },
                                    { action: 'waving', icon: Star, label: 'Wave Hello', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
                                    { action: 'dancing', icon: Music, label: 'Dance Party', bgColor: 'bg-pink-100', textColor: 'text-pink-600' },
                                    { action: 'talking', icon: Brain, label: 'Start Chat', bgColor: 'bg-green-100', textColor: 'text-green-600' }
                                ].map((item) => (
                                    <button
                                        key={item.action}
                                        onClick={() => {
                                            if (item.action === 'talking') {
                                                setChatOpen(true);
                                            } else {
                                                triggerAvatarAction(item.action);
                                            }
                                        }}
                                        className={`p-4 ${item.bgColor} hover:shadow-lg rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-md text-center group border border-white/50`}
                                    >
                                        <item.icon className={`w-8 h-8 ${item.textColor} mx-auto mb-2 group-hover:animate-bounce`} />
                                        <span className={`text-sm font-semibold ${item.textColor} block`}>{item.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Avatar Column - 2 columns, properly positioned */}
                    <div className="xl:col-span-2 flex justify-center xl:justify-start">
                        <div className="sticky top-8">
                            <AIEmotionAnalyzer 
                                avatarState={avatarState} 
                                onLoad={() => setAvatarLoaded(true)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="relative overflow-hidden">
            {/* Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-indigo-100/30 to-purple-100/30 rounded-full" />
                <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-blue-100/30 to-pink-100/30 rounded-full" />
            </div>

            {/* Main Content */}
            <div className="relative z-10">
                {currentPage === 'dashboard' ? <DashboardView /> : <ResultsView />}
            </div>

            {/* Chat Bot */}
            <ChatBot
                chatOpen={chatOpen}
                setChatOpen={setChatOpen}
                analysisStarted={analysisStarted}
                chatMessages={chatMessages}
                setChatMessages={setChatMessages}
                newMessage={newMessage}
                setNewMessage={setNewMessage}
                avatarPersonality={avatarPersonality}
                avatarLoaded={avatarLoaded}
                avatarState={avatarState}
                onTriggerAction={triggerAvatarAction}
                avatarResponses={avatarResponses}
            />
            
            {/* Global Styles */}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(15px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes slide-in {
                    from { opacity: 0; transform: translateX(30px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out;
                }
                
                .animate-slide-in {
                    animation: slide-in 0.6s ease-out;
                }

                /* Ensure proper stacking */
                .relative {
                    position: relative;
                }
                
                .sticky {
                    position: sticky;
                }

                /* Responsive adjustments */
                @media (max-width: 1279px) {
                    .xl\\:col-span-3 {
                        grid-column: span 1;
                    }
                    .xl\\:col-span-2 {
                        grid-column: span 1;
                    }
                }

                /* Ensure chatbot doesn't interfere with layout */
                .fixed {
                    position: fixed;
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
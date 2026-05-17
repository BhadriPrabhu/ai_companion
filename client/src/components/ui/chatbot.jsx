import React, { useState, useRef, useEffect } from 'react';
import {
    Brain,
    MessageCircle,
    X,
    Send,
    HandMetal,
    Music,
    Star,
    Heart
} from 'lucide-react';

const ChatBot = ({ 
    chatOpen, 
    setChatOpen, 
    analysisStarted, 
    chatMessages, 
    setChatMessages, 
    newMessage, 
    setNewMessage, 
    avatarPersonality, 
    avatarLoaded, 
    avatarState,
    onTriggerAction,
    avatarResponses 
}) => {
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Auto scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    // Count unread messages
    useEffect(() => {
        if (!chatOpen) {
            const unread = chatMessages.filter(msg => 
                msg.type === 'bot' && 
                msg.timestamp > (JSON.parse(localStorage.getItem('lastReadTimestamp') || '0'))
            ).length;
            setUnreadCount(unread);
        } else {
            // Mark messages as read when chat is open
            const lastMessage = chatMessages[chatMessages.length - 1];
            if (lastMessage) {
                localStorage.setItem('lastReadTimestamp', JSON.stringify(lastMessage.timestamp));
            }
            setUnreadCount(0);
        }
    }, [chatMessages, chatOpen]);

    // Focus input when chat opens
    useEffect(() => {
        if (chatOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [chatOpen]);

    const sendMessage = () => {
        if (!newMessage.trim()) return;

        const userMessage = { 
            type: 'user', 
            message: newMessage.trim(), 
            timestamp: Date.now() 
        };
        setChatMessages(prev => [...prev, userMessage]);
        setNewMessage('');
        
        // Show typing indicator
        setIsTyping(true);
        
        // Simulate AI response with realistic delay
        const responseDelay = 800 + Math.random() * 1200;
        setTimeout(() => {
            const responses = [
                "That's really interesting! Tell me more about that.",
                "I understand how you feel. What else would you like to share?",
                "That's a great point! How does that make you feel?",
                "I appreciate you sharing that with me! What's on your mind?",
                "Thanks for telling me that. Is there anything specific you'd like to explore?",
                "I'm listening! Please continue with your thoughts.",
                "That sounds important to you. Would you like to talk more about it?"
            ];
            
            const botMessage = {
                type: 'bot',
                message: responses[Math.floor(Math.random() * responses.length)],
                emotion: 'helpful',
                timestamp: Date.now()
            };
            
            setIsTyping(false);
            setChatMessages(prev => [...prev, botMessage]);
        }, responseDelay);
    };

    const handleQuickAction = (action, label) => {
        const actionMessage = `Let's ${label.toLowerCase()}!`;
        const userMessage = {
            type: 'user',
            message: actionMessage,
            timestamp: Date.now()
        };
        
        setChatMessages(prev => [...prev, userMessage]);
        
        // Show typing indicator
        setIsTyping(true);
        
        setTimeout(() => {
            const responses = avatarResponses[action] || avatarResponses.greeting || ["Let's do this!"];
            const botMessage = {
                type: 'bot',
                message: responses[Math.floor(Math.random() * responses.length)],
                emotion: 'friendly',
                timestamp: Date.now()
            };
            
            setIsTyping(false);
            setChatMessages(prev => [...prev, botMessage]);
            onTriggerAction?.(action);
        }, 800);
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const quickActions = [
        { action: 'handshake', icon: HandMetal, label: 'Handshake', color: 'purple-500', bgColor: 'purple-100' },
        { action: 'dancing', icon: Music, label: 'Dance', color: 'pink-500', bgColor: 'pink-100' },
        { action: 'waving', icon: Star, label: 'Wave', color: 'blue-500', bgColor: 'blue-100' }
    ];

    return (
        <div className={`fixed bottom-6 right-6 transition-all duration-500 z-50 ${
            chatOpen ? 'w-96 h-[600px]' : 'w-16 h-16'
        }`}>
            {chatOpen ? (
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/50 h-full flex flex-col overflow-hidden">
                    {/* Chat Header */}
                    <div className="p-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-t-3xl">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mr-3 backdrop-blur-sm">
                                    <Brain className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="font-bold text-lg">AI Companion</div>
                                    <div className="text-xs opacity-90 capitalize flex items-center">
                                        <div className={`w-2 h-2 rounded-full mr-2 ${
                                            avatarLoaded ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
                                        }`} />
                                        {avatarPersonality} • {avatarLoaded ? 'Online' : 'Loading'}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setChatOpen(false)}
                                className="hover:bg-white/20 p-2 rounded-full transition-all duration-300 transform hover:scale-110"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-slate-50 to-blue-50 custom-scrollbar">
                        <div className="space-y-4">
                            {chatMessages.map((msg, index) => (
                                <div
                                    key={index}
                                    className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                                >
                                    <div
                                        className={`max-w-[85%] p-4 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-xl ${
                                            msg.type === 'user'
                                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white ml-4'
                                                : 'bg-white text-gray-800 border border-gray-100 mr-4'
                                        }`}
                                    >
                                        <p className="text-sm leading-relaxed">{msg.message}</p>
                                        {msg.type === 'bot' && (
                                            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                                                <div className="flex items-center space-x-2 opacity-70">
                                                    <div className="w-1 h-1 bg-indigo-500 rounded-full" />
                                                    <span className="text-xs">AI Response</span>
                                                </div>
                                                <div className="text-xs opacity-50">
                                                    {formatTime(msg.timestamp)}
                                                </div>
                                            </div>
                                        )}
                                        {msg.type === 'user' && (
                                            <div className="text-xs opacity-70 mt-2 text-right">
                                                {formatTime(msg.timestamp)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            
                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="flex justify-start animate-fade-in">
                                    <div className="bg-white text-gray-800 border border-gray-100 p-4 rounded-2xl shadow-lg mr-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                            </div>
                                            <span className="text-xs text-gray-500">AI is typing...</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-gray-100 bg-white/80 backdrop-blur-sm">
                        {/* Quick Actions */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {quickActions.map((item) => (
                                <button
                                    key={item.action}
                                    onClick={() => handleQuickAction(item.action, item.label)}
                                    disabled={isTyping}
                                    className={`px-3 py-2 bg-${item.bgColor} hover:bg-opacity-80 text-${item.color} rounded-xl text-xs font-medium transition-all duration-300 flex items-center transform hover:scale-105 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                                >
                                    <item.icon className="w-3 h-3 mr-1" />
                                    {item.label}
                                </button>
                            ))}
                        </div>
                        
                        {/* Message Input */}
                        <div className="flex space-x-3">
                            <input
                                ref={inputRef}
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        sendMessage();
                                    }
                                }}
                                placeholder={`Chat with your ${avatarPersonality} AI companion...`}
                                disabled={isTyping}
                                className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white/90 backdrop-blur-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!newMessage.trim() || isTyping}
                                className="bg-gradient-to-r from-indigo-600 to-purple-600 disabled:from-gray-400 disabled:to-gray-500 text-white p-3 rounded-2xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:hover:shadow-lg disabled:cursor-not-allowed"
                            >
                                <Send className={`w-5 h-5 ${isTyping ? 'animate-pulse' : ''}`} />
                            </button>
                        </div>

                        {/* Status */}
                        <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                            <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-2 ${
                                    avatarLoaded ? 'bg-green-400 animate-pulse' : 'bg-yellow-400'
                                }`} />
                                Avatar {avatarLoaded ? 'ready' : 'loading'}
                            </div>
                            <div className="capitalize">
                                {avatarState} mode
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <button
                    onClick={() => analysisStarted && setChatOpen(true)}
                    className={`group w-16 h-16 rounded-full shadow-2xl transition-all duration-500 flex items-center justify-center relative overflow-hidden ${
                        analysisStarted
                            ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white cursor-pointer hover:scale-110 shadow-indigo-500/25'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!analysisStarted}
                    title={analysisStarted ? "Open chat" : "Start analysis first"}
                >
                    {analysisStarted && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -skew-x-12 group-hover:animate-pulse" />
                    )}
                    <MessageCircle className={`w-7 h-7 transition-transform duration-300 ${
                        analysisStarted ? 'group-hover:scale-110' : ''
                    } relative z-10`} />
                    
                    {/* Notification Badge */}
                    {analysisStarted && unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center animate-bounce">
                            <span className="text-xs font-bold text-white">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        </div>
                    )}
                </button>
            )}
        </div>
    );
};

export default ChatBot;
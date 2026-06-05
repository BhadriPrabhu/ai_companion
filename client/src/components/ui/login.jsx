import React, { useState } from 'react';
import { Sparkle, ArrowRight, Loader2 } from 'lucide-react';
import api from '../../api/api';

const Login = ({ setCurrentUser, onNavigateBack, onNavigateToRegister }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!email.trim()) return;

        setLoading(true);
        setError('');

        try {
            const response = await api.post(`${import.meta.env.VITE_BACKEND_API_URL}/api/auth/login`, {
                email: email.trim()
            });

            const user = response.data;
            setCurrentUser(user);
            localStorage.setItem('zara_user', JSON.stringify(user));

            // Navigate back to the chat interface after successful login
            if (onNavigateBack) onNavigateBack();

        } catch (error) {
            console.error("Login error:", error);
            setError("Failed to log in. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        /* Outer Overlay: Darkened slightly with a blur so the 3D avatar is visible behind it */
        <div className="fixed inset-0 z-[100] w-full min-h-[100dvh] flex items-center justify-center bg-black/20 backdrop-blur-sm">

            {/* Glassmorphic Card matching the main chat UI */}
            <div className="bg-white/80 backdrop-blur-md p-4 sm:p-4 rounded-2xl shadow-2xl border border-white/50 w-full max-w-md mx-4 relative overflow-hidden pointer-events-auto">

                {/* Decorative background element matching Sidebar text gradient */}
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-purple-500 to-orange-400"></div>

                {/* <div className="flex justify-center mb-6">
                    <div className="bg-white/90 border border-gray-200/80 p-3 rounded-2xl shadow-sm">
                        <Sparkle className="text-indigo-600" size={32} strokeWidth={2} />
                    </div>
                </div> */}

                <div className="text-center mb-2">
                    <h1 className="text-3xl font-bold text-gray-800 tracking-tight mb-2 drop-shadow-sm">Login
                        {/* <br /><span className="font-bold text-3xl bg-gradient-to-r from-blue-600 via-purple-500 to-orange-400 text-transparent bg-clip-text tracking-tight">Zara AI</span> */}
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">Enter your email to save your chat history and preferences.</p>
                </div>

                {error && (
                    <div className="bg-red-50/90 backdrop-blur-sm text-red-600 text-sm p-3 rounded-xl mb-4 text-center border border-red-200 shadow-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-3">
                    <div>
                        <label className="block text-sm font-semibold text-gray-500 tracking-wider mb-1 ml-1">
                            Email
                        </label>
                        <input
                            type="email"
                            required
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-white/90 text-gray-800 px-4 py-2 rounded-md outline-none border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all shadow-sm"
                            disabled={loading}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        /* Matches the 'Send' button */
                        className="w-full bg-indigo-600 hover:bg-indigo-800 disabled:bg-indigo-400 text-white font-semibold py-2.5 px-4 rounded-md flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 active:scale-[0.98] transition-all duration-200"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                Authenticating...
                            </>
                        ) : (
                            <>
                                Continue
                                <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                <div>
                    <p className="text-center text-gray-500 text-sm mt-2">Or</p>
                </div>

                <div className="text-center mt-2 flex flex-col gap-2">
                    {onNavigateToRegister && (
                        <button
                            type="button"
                            onClick={onNavigateToRegister}
                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
                        >
                            Don't have an account? Register
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={onNavigateBack}
                        className="text-sm border border-gray-400 text-gray-500 w-full py-2.5 hover:bg-slate-800 hover:text-white rounded-md font-semibold transition-all duration-200 uppercase tracking-wider shadow-none hover:shadow-md"
                    >
                        Continue as Guest
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;
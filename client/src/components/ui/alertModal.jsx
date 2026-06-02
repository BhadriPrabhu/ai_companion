import React, { useEffect, useState } from 'react';
import { AlertTriangle, Info, Trash2, X } from 'lucide-react';

const AlertModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = 'alert', // 'alert' | 'warning' | 'delete'
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    noCancelText = false,
}) => {
    const [show, setShow] = useState(false);

    // Handle smooth fade-in/out
    useEffect(() => {
        if (isOpen) {
            setShow(true);
        } else {
            const timer = setTimeout(() => setShow(false), 300);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!show && !isOpen) return null;

    // Theme configuration based on alert type
    const config = {
        delete: {
            icon: <Trash2 size={24} className="text-red-500" />,
            iconBg: 'bg-red-100',
            confirmBtn: 'bg-red-500 hover:bg-red-600 border border-red-600 shadow-red-500/20 text-white',
        },
        warning: {
            icon: <AlertTriangle size={24} className="text-orange-500" />,
            iconBg: 'bg-orange-100',
            confirmBtn: 'bg-orange-500 hover:bg-orange-600 border border-orange-600 shadow-orange-500/20 text-white',
        },
        alert: {
            icon: <Info size={24} className="text-indigo-500" />,
            iconBg: 'bg-indigo-100',
            confirmBtn: 'bg-indigo-600 hover:bg-indigo-700 border border-indigo-700 shadow-indigo-600/20 text-white',
        }
    };

    const currentConfig = config[type] || config.alert;

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>

            {/* Dimmed Backdrop */}
            <div
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Glassmorphic Modal Card - matching Avatar UI */}
            <div className={`relative w-full max-w-sm bg-white/90 backdrop-blur-md rounded-2xl shadow-2xl border border-white/50 p-5 sm:p-6 transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 p-1 rounded-md hover:bg-gray-100/50 transition-colors"
                >
                    <X size={18} />
                </button>

                {/* Content */}
                <div className="flex flex-col items-center text-center mt-2">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${currentConfig.iconBg}`}>
                        {currentConfig.icon}
                    </div>

                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                        {title}
                    </h3>

                    <p className="text-sm text-gray-500 mb-6 px-2">
                        {message}
                    </p>
                </div>

                {/* Action Buttons - matching Avatar UI button styles */}
                <div className="flex gap-3 w-full">
                    {!noCancelText && (
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm"
                        >
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        className={`flex-1 px-4 py-2.5 font-semibold rounded-xl shadow-md transition-all duration-200 active:scale-[0.98] ${currentConfig.confirmBtn}`}
                    >
                        {confirmText}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AlertModal;
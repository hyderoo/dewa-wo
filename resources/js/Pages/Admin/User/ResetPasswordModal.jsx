import React, { useState, useEffect } from "react";
import { KeyRound, Eye, EyeOff, Mail } from "lucide-react";
import { router } from "@inertiajs/react";

const ResetPasswordModal = ({ onConfirm, onCancel, userId }) => {
    const [activeTab, setActiveTab] = useState('admin'); // 'admin' or 'email'
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const [isValid, setIsValid] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false
    });

    useEffect(() => {
        validatePassword(password);
    }, [password]);

    const validatePassword = (value) => {
        setIsValid({
            length: value.length >= 8,
            uppercase: /[A-Z]/.test(value),
            lowercase: /[a-z]/.test(value),
            number: /[0-9]/.test(value)
        });
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleSubmit = () => {
        // Reset error
        setError("");

        // Basic validation
        if (!password) {
            setError("Password is required");
            return;
        }

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        // Confirm password reset
        onConfirm(password);
    };

    const sendResetLink = () => {
        setSending(true);

        router.post(route('admin.users.send-reset-link', userId), {}, {
            preserveScroll: true,
            onSuccess: () => {
                setSending(false);
                onCancel(); // Close modal after successful send
            },
            onError: () => {
                setError("Failed to send reset link. Please try again.");
                setSending(false);
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto">
                <div className="p-6">
                    <div className="flex items-center mb-4">
                        <KeyRound className="w-6 h-6 text-yellow-500 mr-3" />
                        <h3 className="text-xl font-bold text-gray-800">Reset Password</h3>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b mb-6">
                        <button
                            onClick={() => setActiveTab('admin')}
                            className={`px-4 py-2 font-medium text-sm focus:outline-none ${activeTab === 'admin'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Admin Reset
                        </button>
                        <button
                            onClick={() => setActiveTab('email')}
                            className={`px-4 py-2 font-medium text-sm focus:outline-none ${activeTab === 'email'
                                ? 'border-b-2 border-blue-500 text-blue-600'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            Email Reset Link
                        </button>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    {activeTab === 'admin' ? (
                        <>
                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                    New Password
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                        onClick={togglePasswordVisibility}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                {/* Password strength indicators */}
                                <div className="mt-2 space-y-1">
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full ${isValid.length ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></div>
                                        <span className={`text-xs ${isValid.length ? 'text-green-500' : 'text-gray-500'}`}>
                                            At least 8 characters
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full ${isValid.uppercase ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></div>
                                        <span className={`text-xs ${isValid.uppercase ? 'text-green-500' : 'text-gray-500'}`}>
                                            Contains uppercase letter
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full ${isValid.lowercase ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></div>
                                        <span className={`text-xs ${isValid.lowercase ? 'text-green-500' : 'text-gray-500'}`}>
                                            Contains lowercase letter
                                        </span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full ${isValid.number ? 'bg-green-500' : 'bg-gray-300'} mr-2`}></div>
                                        <span className={`text-xs ${isValid.number ? 'text-green-500' : 'text-gray-500'}`}>
                                            Contains a number
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="block mb-2 text-sm font-medium text-gray-700">
                                    Confirm New Password
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3 mt-6">
                                <button
                                    onClick={onCancel}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={!isValid.length || !isValid.uppercase || !isValid.lowercase || !isValid.number || !confirmPassword || password !== confirmPassword}
                                    className={`px-4 py-2 rounded-md transition ${(isValid.length && isValid.uppercase && isValid.lowercase && isValid.number && confirmPassword && password === confirmPassword)
                                        ? "bg-yellow-500 text-white hover:bg-yellow-600"
                                        : "bg-yellow-300 text-white cursor-not-allowed"
                                        }`}
                                >
                                    Reset Password
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="py-4 text-center">
                                <Mail className="w-16 h-16 mx-auto text-blue-500 mb-4" />
                                <h4 className="text-lg font-medium text-gray-800 mb-2">Send Reset Link via Email</h4>
                                <p className="text-gray-600 mb-6">
                                    A password reset link will be sent to the user's email address. The user can click the link to reset their password.
                                </p>
                                <div className="flex justify-center space-x-3 mt-6">
                                    <button
                                        onClick={onCancel}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={sendResetLink}
                                        disabled={sending}
                                        className={`px-4 py-2 rounded-md transition ${sending
                                            ? "bg-blue-300 text-white cursor-not-allowed"
                                            : "bg-blue-500 text-white hover:bg-blue-600"
                                            }`}
                                    >
                                        {sending ? "Sending..." : "Send Reset Link"}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResetPasswordModal;

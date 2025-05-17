import React, { useState } from "react";
import axios from "axios";
import { Eye, EyeOff, Key, ShieldCheck, AlertCircle } from "lucide-react";

const PasswordChangeModal = ({ isOpen, onClose }) => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Password strength tracking
    const [passwordStrength, setPasswordStrength] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        special: false
    });

    // Check password strength as user types
    const checkPasswordStrength = (password) => {
        setPasswordStrength({
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[^A-Za-z0-9]/.test(password)
        });
    };

    // Calculate overall strength
    const getOverallStrength = () => {
        const { length, uppercase, lowercase, number, special } = passwordStrength;
        const score = [length, uppercase, lowercase, number, special].filter(Boolean).length;

        if (score === 0) return { text: "", color: "" };
        if (score <= 2) return { text: "Lemah", color: "text-red-500" };
        if (score <= 4) return { text: "Sedang", color: "text-yellow-500" };
        return { text: "Kuat", color: "text-green-500" };
    };

    const handleNewPasswordChange = (e) => {
        const value = e.target.value;
        setNewPassword(value);
        checkPasswordStrength(value);
    };

    const handlePasswordChange = async () => {
        // Reset previous messages
        setError("");
        setSuccess("");

        // Basic validation
        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("Semua field harus diisi");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Konfirmasi password tidak cocok");
            return;
        }

        if (newPassword.length < 8) {
            setError("Kata sandi baru minimal 8 karakter");
            return;
        }

        try {
            setLoading(true);

            // Call the API to change the password
            const response = await axios.post(route('admin.password.change'), {
                current_password: currentPassword,
                new_password: newPassword,
                new_password_confirmation: confirmPassword,
            });

            setSuccess("Kata sandi berhasil diubah");

            // Reset form after successful update
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setPasswordStrength({
                length: false,
                uppercase: false,
                lowercase: false,
                number: false,
                special: false
            });

            // Close modal after a delay
            setTimeout(() => {
                onClose();
                setSuccess("");
            }, 2000);

        } catch (err) {
            console.error("Password change error:", err);

            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError("Gagal mengubah kata sandi. Silakan coba lagi.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const strength = getOverallStrength();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 text-gray-600">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <div className="flex items-center justify-center mb-4">
                    <Key className="w-6 h-6 text-pink-500 mr-2" />
                    <h2 className="text-xl font-bold text-center">Ubah Kata Sandi</h2>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 flex items-center">
                        <ShieldCheck className="w-5 h-5 mr-2" />
                        <span>{success}</span>
                    </div>
                )}

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2 font-medium">
                        Kata Sandi Saat Ini <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-300 focus:outline-none"
                            placeholder="Masukkan kata sandi saat ini"
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 mb-2 font-medium">
                        Kata Sandi Baru <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={handleNewPasswordChange}
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-300 focus:outline-none"
                            placeholder="Masukkan kata sandi baru"
                        />
                        <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    {/* Password strength meter */}
                    {newPassword && (
                        <div className="mt-2">
                            <div className="flex justify-between mb-1">
                                <span className="text-xs text-gray-600">Kekuatan Password:</span>
                                <span className={`text-xs font-medium ${strength.color}`}>{strength.text}</span>
                            </div>
                            <div className="flex space-x-1">
                                {[...Array(5)].map((_, index) => {
                                    const criteriaCount = Object.values(passwordStrength).filter(Boolean).length;
                                    return (
                                        <div
                                            key={index}
                                            className={`h-1 w-full rounded-full ${index < criteriaCount
                                                ? criteriaCount <= 2
                                                    ? 'bg-red-500'
                                                    : criteriaCount <= 4
                                                        ? 'bg-yellow-500'
                                                        : 'bg-green-500'
                                                : 'bg-gray-200'
                                                }`}
                                        />
                                    );
                                })}
                            </div>

                            {/* Password criteria checklist */}
                            <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                                <div className={`flex items-center ${passwordStrength.length ? 'text-green-600' : 'text-gray-500'}`}>
                                    <div className={`w-3 h-3 mr-1 rounded-full ${passwordStrength.length ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    Minimal 8 karakter
                                </div>
                                <div className={`flex items-center ${passwordStrength.uppercase ? 'text-green-600' : 'text-gray-500'}`}>
                                    <div className={`w-3 h-3 mr-1 rounded-full ${passwordStrength.uppercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    Huruf besar
                                </div>
                                <div className={`flex items-center ${passwordStrength.lowercase ? 'text-green-600' : 'text-gray-500'}`}>
                                    <div className={`w-3 h-3 mr-1 rounded-full ${passwordStrength.lowercase ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    Huruf kecil
                                </div>
                                <div className={`flex items-center ${passwordStrength.number ? 'text-green-600' : 'text-gray-500'}`}>
                                    <div className={`w-3 h-3 mr-1 rounded-full ${passwordStrength.number ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    Angka
                                </div>
                                <div className={`flex items-center ${passwordStrength.special ? 'text-green-600' : 'text-gray-500'}`}>
                                    <div className={`w-3 h-3 mr-1 rounded-full ${passwordStrength.special ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                    Karakter khusus
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mb-6">
                    <label className="block text-gray-700 mb-2 font-medium">
                        Konfirmasi Kata Sandi Baru <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-pink-300 focus:outline-none ${confirmPassword && newPassword !== confirmPassword ? 'border-red-500' : ''
                                }`}
                            placeholder="Konfirmasi kata sandi baru"
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                    {confirmPassword && newPassword !== confirmPassword && (
                        <p className="text-red-500 text-xs mt-1">Konfirmasi password tidak cocok</p>
                    )}
                </div>

                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                        disabled={loading}
                    >
                        Batal
                    </button>
                    <button
                        onClick={handlePasswordChange}
                        disabled={loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                        className={`px-4 py-2 bg-pink-500 text-white rounded-md hover:bg-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-400 flex items-center ${loading || !currentPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                            }`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Memproses...
                            </>
                        ) : (
                            'Ubah Kata Sandi'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PasswordChangeModal;

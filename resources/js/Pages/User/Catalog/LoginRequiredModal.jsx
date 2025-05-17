import React from "react";
import { Link } from "@inertiajs/react";

// Font classes
const cormorantClass = "font-cormorant font-light";
const cormorantBoldClass = "font-cormorant font-semibold";
const montserratClass = "font-montserrat font-normal";
const montserratMediumClass = "font-montserrat font-medium";

const LoginRequiredModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 text-center">
                <div className="w-16 h-16 bg-pink-50 rounded-full mx-auto mb-6 flex items-center justify-center">
                    <svg
                        className="h-8 w-8 text-pink-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 15v2m0 0v2m0-2h2m-2 0H10m5-6a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>

                <h3 className={`${cormorantBoldClass} text-2xl font-semibold text-gray-900 mb-2`}>
                    Login Diperlukan
                </h3>

                <p className={`${montserratClass} text-gray-600 mb-6`}>
                    Untuk memesan paket atau membuat paket kustom, Anda perlu login terlebih dahulu.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={onClose}
                        className={`
                            ${montserratClass}
                            px-4 py-3 bg-gray-100 rounded-md text-gray-700
                            hover:bg-gray-200 transition-colors
                        `}
                    >
                        Kembali
                    </button>

                    <Link
                        href={route('login', { redirect: window.location.pathname })}
                        className={`
                            ${montserratClass}
                            px-4 py-3 bg-pink-500 rounded-md text-white
                            hover:bg-pink-600 transition-colors
                        `}
                    >
                        Masuk
                    </Link>

                    <Link
                        href={route('register', { redirect: window.location.pathname })}
                        className={`
                            ${montserratClass}
                            px-4 py-3 border border-pink-500 rounded-md text-pink-600
                            hover:bg-pink-50 transition-colors
                        `}
                    >
                        Daftar
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginRequiredModal;

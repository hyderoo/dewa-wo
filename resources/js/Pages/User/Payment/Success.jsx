import React, { useState, useEffect } from "react";
import { Head } from "@inertiajs/react";
import { CheckCircle } from "lucide-react";
import BaseLayout from "@/Layouts/BaseLayout";

// Styles
const cormorantClass = "font-cormorant font-light";
const cormorantBoldClass = "font-cormorant font-semibold";

const Success = ({ auth }) => {
    // For page redirection
    const navigateTo = (path) => {
        window.location.href = path;
    };

    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        let timer;

        if (countdown === 0) {
            navigateTo(route("orders"));
        } else {
            timer = setTimeout(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }

        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [countdown]);

    return (
        <>
            <Head title="Pembayaran Berhasil" />
            <BaseLayout auth={auth}>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="max-w-md w-full mx-4">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="p-8 text-center">
                                <div className="flex justify-center mb-6">
                                    <CheckCircle className="w-20 h-20 text-green-500" />
                                </div>

                                <h1
                                    className={`${cormorantBoldClass} text-2xl font-semibold text-gray-800 mb-4`}
                                >
                                    Pembayaran Berhasil!
                                </h1>

                                <p className="text-gray-600 mb-6">
                                    Terima kasih telah melakukan pembayaran. Tim kami akan segera
                                    menghubungi Anda untuk koordinasi lebih lanjut.
                                </p>

                                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                    <p className="text-gray-600">
                                        Redirecting ke halaman pesanan dalam
                                    </p>
                                    <p className="text-2xl font-bold text-pink-600">{countdown}</p>
                                </div>

                                <div className="flex space-x-4">
                                    <button
                                        onClick={() => navigateTo(route("orders"))}
                                        className="w-full px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
                                    >
                                        Lihat Pesanan Saya
                                    </button>

                                    <button
                                        onClick={() => navigateTo("/")}
                                        className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                                    >
                                        Ke Halaman Utama
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </BaseLayout>
        </>
    );
};

export default Success;

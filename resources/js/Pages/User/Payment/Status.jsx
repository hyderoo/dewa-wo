import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import {
    CheckCircle, XCircle, AlertCircle, Clock,
    ArrowLeft, RefreshCw, Loader2, CreditCard,
    Building, Copy
} from "lucide-react";
import BaseLayout from "@/Layouts/BaseLayout";

// Styles
const cormorantClass = "font-cormorant font-light";
const cormorantBoldClass = "font-cormorant font-semibold";

const Status = ({ payment, auth }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentStatus, setCurrentStatus] = useState(payment.status);
    const [lastChecked, setLastChecked] = useState(new Date());
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ type: "", message: "" });

    // Parse payment instructions from payment_data if available
    const [paymentInstructions, setPaymentInstructions] = useState([]);

    useEffect(() => {
        // Try to parse the payment_data to get our custom instructions
        if (payment.payment_data) {
            try {
                const paymentData = JSON.parse(payment.payment_data);
                if (paymentData.payment_instructions && Array.isArray(paymentData.payment_instructions)) {
                    setPaymentInstructions(paymentData.payment_instructions);
                }
            } catch (error) {
                console.error('Error parsing payment data:', error);
            }
        }
    }, [payment.payment_data]);

    // Calculate time left from payment expiry time
    function calculateTimeLeft() {
        if (!payment.expiry_time) return 0;

        const expiry = new Date(payment.expiry_time);
        const now = new Date();
        const diff = expiry - now;

        return diff > 0 ? Math.floor(diff / 1000) : 0; // Convert to seconds
    }

    // For virtual accounts, check status automatically on load
    useEffect(() => {
        if (payment.payment_method === 'virtual_account' && payment.status === 'pending') {
            checkPaymentStatus();
        }
    }, []);

    // Timer for countdown
    useEffect(() => {
        if (payment.status === 'pending') {
            const timer = setInterval(() => {
                setTimeLeft(calculateTimeLeft());
            }, 1000);

            return () => clearInterval(timer);
        }
    }, []);

    // Auto hide toast after 5 seconds
    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const checkPaymentStatus = async (silent = false) => {
        if (isLoading) return;

        setIsLoading(true);

        try {
            const response = await fetch(`/api/v1/payments/${payment.id}/check-status`);
            const data = await response.json();
            console.log(data);
            if (data.status !== 'error') {
                // If status changed, show toast and update UI or reload
                if (data.status !== currentStatus) {
                    if (data.status === 'verified') {
                        setToastMessage({
                            type: "success",
                            message: "Pembayaran berhasil diverifikasi! Halaman akan dimuat ulang."
                        });
                        setShowToast(true);

                        // Give user time to see the toast before reloading
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    } else if (data.status === 'rejected') {
                        setToastMessage({
                            type: "error",
                            message: "Pembayaran ditolak! Halaman akan dimuat ulang."
                        });
                        setShowToast(true);

                        // Give user time to see the toast before reloading
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    } else if (data.status === 'expired') {
                        setToastMessage({
                            type: "warning",
                            message: "Pembayaran telah kedaluwarsa! Halaman akan dimuat ulang."
                        });
                        setShowToast(true);

                        // Give user time to see the toast before reloading
                        setTimeout(() => {
                            window.location.reload();
                        }, 2000);
                    } else {
                        // For other status changes, just update without reload
                        setCurrentStatus(data.status);
                        setToastMessage({
                            type: "info",
                            message: `Status pembayaran berubah menjadi: ${getStatusDisplay(data.status)}`
                        });
                        setShowToast(true);
                    }
                } else if (!silent) {
                    // If status hasn't changed and it's not a silent check, show toast
                    setToastMessage({
                        type: "info",
                        message: `Status pembayaran masih ${getStatusDisplay(currentStatus)}`
                    });
                    setShowToast(true);
                }
            } else {
                // Error from server
                if (!silent) {
                    setToastMessage({
                        type: "error",
                        message: data.message || "Gagal memeriksa status pembayaran"
                    });
                    setShowToast(true);
                }
            }

            setLastChecked(new Date());
        } catch (error) {
            console.error('Error checking payment status:', error);
            if (!silent) {
                setToastMessage({
                    type: "error",
                    message: "Terjadi kesalahan saat memeriksa status pembayaran"
                });
                setShowToast(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Handle copy to clipboard
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Format time for display
    const formatTime = (seconds) => {
        if (seconds <= 0) return "00:00:00";

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const getStatusIcon = () => {
        switch (currentStatus) {
            case 'verified':
                return (
                    <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <CheckCircle className="h-12 w-12 text-green-500" />
                    </div>
                );
            case 'pending':
                return (
                    <div className="w-20 h-20 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                        <Clock className="h-12 w-12 text-yellow-500" />
                    </div>
                );
            case 'rejected':
            case 'expired':
                return (
                    <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
                        <XCircle className="h-12 w-12 text-red-500" />
                    </div>
                );
            default:
                return (
                    <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                        <AlertCircle className="h-12 w-12 text-gray-500" />
                    </div>
                );
        }
    };

    const getStatusTitle = () => {
        switch (currentStatus) {
            case 'verified':
                return 'Pembayaran Berhasil';
            case 'pending':
                return 'Menunggu Pembayaran';
            case 'rejected':
                return 'Pembayaran Ditolak';
            case 'expired':
                return 'Pembayaran Kadaluarsa';
            default:
                return 'Status Pembayaran';
        }
    };

    const getStatusDisplay = (status) => {
        switch (status) {
            case 'verified':
                return 'Terverifikasi';
            case 'pending':
                return 'Menunggu Verifikasi';
            case 'rejected':
                return 'Ditolak';
            case 'expired':
                return 'Kadaluarsa';
            default:
                return status;
        }
    };

    const getStatusMessage = () => {
        switch (currentStatus) {
            case 'verified':
                return 'Pembayaran Anda telah berhasil diverifikasi. Terima kasih atas pembayaran Anda.';
            case 'pending':
                return 'Kami sedang menunggu konfirmasi pembayaran Anda. Harap selesaikan pembayaran sesuai instruksi.';
            case 'rejected':
                return 'Maaf, pembayaran Anda ditolak. Silakan coba metode pembayaran lain.';
            case 'expired':
                return 'Maaf, batas waktu pembayaran telah berakhir. Silakan lakukan pembayaran baru.';
            default:
                return 'Silakan periksa status pembayaran Anda.';
        }
    };

    const getBankDetails = (bankCode) => {
        if (!bankCode) return { name: "", instructions: [] };

        // Use our custom instructions from the database if available
        if (paymentInstructions.length > 0) {
            return {
                name: `${bankCode} Virtual Account`,
                instructions: paymentInstructions.map(instr => instr.instruction)
            };
        }

        return { name: "", instructions: [] };
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "-";

        const date = new Date(dateString);
        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

    const bankDetails = payment.payment_method === 'virtual_account' ?
        getBankDetails(payment.bank_code) : null;

    return (
        <>
            <Head title="Status Pembayaran" />
            <BaseLayout auth={auth}>
                <div className="min-h-screen bg-gray-50 py-12">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Toast Notification */}
                        {showToast && (
                            <div
                                className={`fixed top-4 right-4 z-50 max-w-md rounded-lg shadow-lg p-4 ${toastMessage.type === "success"
                                    ? "bg-green-100 border border-green-200"
                                    : toastMessage.type === "error"
                                        ? "bg-red-100 border border-red-200"
                                        : toastMessage.type === "warning"
                                            ? "bg-yellow-100 border border-yellow-200"
                                            : "bg-blue-100 border border-blue-200"
                                    }`}
                            >
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        {toastMessage.type === "success" ? (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        ) : toastMessage.type === "error" ? (
                                            <XCircle className="h-5 w-5 text-red-500" />
                                        ) : toastMessage.type === "warning" ? (
                                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                                        ) : (
                                            <AlertCircle className="h-5 w-5 text-blue-500" />
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <p
                                            className={`text-sm font-medium ${toastMessage.type === "success"
                                                ? "text-green-800"
                                                : toastMessage.type === "error"
                                                    ? "text-red-800"
                                                    : toastMessage.type === "warning"
                                                        ? "text-yellow-800"
                                                        : "text-blue-800"
                                                }`}
                                        >
                                            {toastMessage.message}
                                        </p>
                                    </div>
                                    <div className="ml-auto pl-3">
                                        <div className="-mx-1.5 -my-1.5">
                                            <button
                                                onClick={() => setShowToast(false)}
                                                className="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                                            >
                                                <XCircle className="h-5 w-5 text-gray-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mb-6">
                            <Link
                                href={route('payment.history', payment.order_id)}
                                className="inline-flex items-center text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Kembali ke Riwayat Pembayaran
                            </Link>
                        </div>

                        <div className="bg-white overflow-hidden shadow-sm rounded-xl">
                            <div className="p-8 text-center">
                                {getStatusIcon()}

                                <h2 className={`${cormorantBoldClass} text-2xl font-bold text-gray-900 mb-2`}>
                                    {getStatusTitle()}
                                </h2>

                                <p className="text-gray-600 mb-6">
                                    {getStatusMessage()}
                                </p>

                                {/* Payment Info Box */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-6 max-w-md mx-auto">
                                    <div className="grid grid-cols-2 gap-4 text-left">
                                        <div>
                                            <p className="text-sm text-gray-500">Nomor Pesanan</p>
                                            <p className="font-medium">{payment.order.order_number}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Jumlah</p>
                                            <p className="font-medium text-indigo-600">
                                                {payment.formatted_amount || formatCurrency(payment.amount)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Jenis Pembayaran</p>
                                            <p className="font-medium">
                                                {payment.payment_type === 'down_payment' ? 'Uang Muka' :
                                                    payment.payment_type === 'installment' ? 'Cicilan' : 'Pelunasan'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Metode Pembayaran</p>
                                            <p className="font-medium flex items-center">
                                                {payment.payment_method === 'bank_transfer' ? (
                                                    <>
                                                        <Building className="h-4 w-4 mr-1 text-gray-500" />
                                                        Transfer Bank
                                                    </>
                                                ) : payment.payment_method === 'virtual_account' ? (
                                                    <>
                                                        <CreditCard className="h-4 w-4 mr-1 text-blue-500" />
                                                        Virtual Account
                                                    </>
                                                ) : payment.payment_method}
                                            </p>
                                        </div>

                                        {payment.bank_code && (
                                            <div className="col-span-2">
                                                <p className="text-sm text-gray-500">Bank</p>
                                                <p className="font-medium">
                                                    {bankDetails ? bankDetails.name : payment.bank_code}
                                                </p>
                                            </div>
                                        )}

                                        {currentStatus === 'pending' && payment.expiry_time && (
                                            <div className="col-span-2 mt-2 p-2 bg-yellow-50 rounded-lg border border-yellow-100">
                                                <p className="text-sm text-gray-700 font-medium">Batas Waktu:</p>
                                                <p className="text-lg font-bold text-yellow-600">{formatTime(timeLeft)}</p>
                                                <p className="text-xs text-gray-600">
                                                    ({formatDate(payment.expiry_time)})
                                                </p>
                                            </div>
                                        )}

                                        {payment.payment_method === 'virtual_account' && payment.va_number && (
                                            <div className="col-span-2 mt-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                                <p className="text-sm text-gray-700 font-medium">Nomor Virtual Account:</p>
                                                <div className="flex items-center">
                                                    <p className="text-lg font-bold text-blue-700 font-mono mr-2">
                                                        {payment.va_number}
                                                    </p>
                                                    <button
                                                        onClick={() => handleCopy(payment.va_number)}
                                                        className="p-1.5 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                                                    >
                                                        {copied ? (
                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                        ) : (
                                                            <Copy className="h-4 w-4 text-gray-600" />
                                                        )}
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Lakukan pembayaran melalui {bankDetails?.name || payment.bank_code} Mobile/Internet Banking atau ATM
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {currentStatus === 'pending' && payment.payment_method === 'virtual_account' && payment.va_number && (
                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6 max-w-md mx-auto text-left">
                                        <h3 className="font-medium text-blue-700 mb-2">Cara Pembayaran {bankDetails.name}:</h3>
                                        {paymentInstructions.length > 0 ? (
                                            // Use our custom instructions with step titles
                                            <ol className="list-decimal list-inside space-y-3 text-blue-700">
                                                {paymentInstructions.map((instruction, index) => (
                                                    <li key={index} className="text-sm">
                                                        {/* <span className="font-medium">{instruction.step}:</span> {instruction.instruction} */}
                                                        {instruction.instruction}
                                                    </li>
                                                ))}
                                            </ol>
                                        ) : (
                                            // Fall back to basic instructions if no custom ones are available
                                            <ol className="list-decimal list-inside space-y-1 text-blue-700">
                                                {bankDetails.instructions.map((instruction, index) => (
                                                    <li key={index} className="text-sm">{instruction}</li>
                                                ))}
                                            </ol>
                                        )}
                                    </div>
                                )}

                                {currentStatus === 'pending' && payment.payment_method === 'virtual_account' && (
                                    <div className="mb-6">
                                        <button
                                            onClick={() => checkPaymentStatus(false)} // false means not silent
                                            disabled={isLoading}
                                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                    Memeriksa...
                                                </>
                                            ) : (
                                                <>
                                                    <RefreshCw className="h-4 w-4 mr-2" />
                                                    Periksa Status Pembayaran
                                                </>
                                            )}
                                        </button>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Terakhir diperiksa: {lastChecked.toLocaleTimeString()}
                                        </p>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <Link
                                        href={route('payment.history', payment.order_id)}
                                        className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                                    >
                                        Lihat Riwayat Pembayaran
                                    </Link>

                                    {(currentStatus === 'rejected' || currentStatus === 'expired') && (
                                        <Link
                                            href={route('payment.detail', payment.order_id)}
                                            className="inline-flex items-center justify-center px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700"
                                        >
                                            Lakukan Pembayaran Baru
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </BaseLayout>
        </>
    );
};

export default Status;

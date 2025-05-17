import React, { useState, useEffect } from "react";
import { Head, Link } from "@inertiajs/react";
import {
    ArrowLeft, DollarSign, FileText,
    CheckCircle, XCircle, Clock, AlertTriangle,
    CreditCard, Building, Copy
} from "lucide-react";
import BaseLayout from "@/Layouts/BaseLayout";

// Styles
const cormorantClass = "font-cormorant font-light";
const cormorantBoldClass = "font-cormorant font-semibold";

const History = ({ order, payments, auth, toast }) => {
    const [showToast, setShowToast] = useState(!!toast);
    const [toastMessage, setToastMessage] = useState(toast || { type: "", message: "" });
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [viewImageUrl, setViewImageUrl] = useState(null);
    const [copied, setCopied] = useState({});

    // Check for flash messages
    useEffect(() => {
        if (toast) {
            setShowToast(true);

            const timer = setTimeout(() => {
                setShowToast(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [toast]);

    const getPaymentInstructions = (paymentData) => {
        if (!paymentData) return [];

        try {
            const data = typeof paymentData === 'string' ? JSON.parse(paymentData) : paymentData;
            if (data.payment_instructions && Array.isArray(data.payment_instructions)) {
                return data.payment_instructions;
            }
        } catch (error) {
            console.error('Error parsing payment data:', error);
        }

        return [];
    };

    // Get bank name from bank code
    const getBankName = (bankCode) => {
        if (!bankCode) return "";

        // Map bank codes to full names
        const bankNames = {
            'BCA': 'Bank Central Asia',
            'BNI': 'Bank Negara Indonesia',
            'BRI': 'Bank Rakyat Indonesia',
            'MANDIRI': 'Bank Mandiri',
            'PERMATA': 'Bank Permata',
            'CIMB': 'CIMB Niaga'
        };

        return bankNames[bankCode.toUpperCase()] || bankCode;
    };

    // Handle copy to clipboard
    const handleCopy = (text, id) => {
        navigator.clipboard.writeText(text);
        setCopied({ ...copied, [id]: true });
        setTimeout(() => setCopied({ ...copied, [id]: false }), 2000);
    };

    // Format for currency display
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    // Get status badge class
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'verified':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'expired':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Get status display text
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

    // Get status icon
    const getStatusIcon = (status) => {
        switch (status) {
            case 'verified':
                return <CheckCircle className="h-5 w-5 text-green-600" />;
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-600" />;
            case 'rejected':
                return <XCircle className="h-5 w-5 text-red-600" />;
            case 'expired':
                return <AlertTriangle className="h-5 w-5 text-gray-600" />;
            default:
                return null;
        }
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

    return (
        <>
            <Head title={`Riwayat Pembayaran: ${order.order_number}`} />
            <BaseLayout auth={auth}>
                <div className="min-h-screen bg-gray-50 py-8">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Toast Notification */}
                        {showToast && (
                            <div
                                className={`fixed top-4 right-4 z-50 max-w-md rounded-lg shadow-lg p-4 ${toastMessage.type === "success"
                                    ? "bg-green-100 border border-green-200"
                                    : toastMessage.type === "error"
                                        ? "bg-red-100 border border-red-200"
                                        : "bg-blue-100 border border-blue-200"
                                    }`}
                            >
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        {toastMessage.type === "success" ? (
                                            <CheckCircle className="h-5 w-5 text-green-500" />
                                        ) : toastMessage.type === "error" ? (
                                            <XCircle className="h-5 w-5 text-red-500" />
                                        ) : (
                                            <AlertTriangle className="h-5 w-5 text-blue-500" />
                                        )}
                                    </div>
                                    <div className="ml-3">
                                        <p
                                            className={`text-sm font-medium ${toastMessage.type === "success"
                                                ? "text-green-800"
                                                : toastMessage.type === "error"
                                                    ? "text-red-800"
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

                        {/* Image Preview Modal */}
                        {viewImageUrl && (
                            <div
                                className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                                onClick={() => setViewImageUrl(null)}
                            >
                                <div
                                    className="bg-white p-2 rounded-lg max-w-3xl max-h-[90vh] w-full"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="flex justify-end mb-2">
                                        <button
                                            onClick={() => setViewImageUrl(null)}
                                            className="p-1 bg-gray-200 rounded-full"
                                        >
                                            <XCircle className="w-5 h-5 text-gray-700" />
                                        </button>
                                    </div>
                                    <div className="overflow-auto max-h-[80vh]">
                                        <img
                                            src={viewImageUrl}
                                            alt="Bukti Pembayaran"
                                            className="mx-auto max-w-full object-contain"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Back Button */}
                        <div className="mb-6">
                            <Link
                                href={route("orders")}
                                className="inline-flex items-center text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="h-4 w-4 mr-1" />
                                Kembali ke Daftar Pesanan
                            </Link>
                        </div>

                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white">
                                <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center">
                                    <div>
                                        <h1 className={`${cormorantBoldClass} text-2xl font-bold`}>Riwayat Pembayaran</h1>
                                        <p className="text-white/80">
                                            Order #{order.order_number} ({order.client_name})
                                        </p>
                                    </div>
                                    <div className="mt-4 sm:mt-0 sm:text-right">
                                        <p className="text-white/80">Total Dibayar</p>
                                        <p className="text-2xl font-bold">
                                            {formatCurrency(order.paid_amount)}
                                        </p>
                                        <p className="text-white/80">
                                            dari {formatCurrency(order.price)} (
                                            {Math.round((order.paid_amount / order.price) * 100)}%)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Progress */}
                            <div className="p-4 bg-gray-50 border-b border-gray-200">
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-purple-600 h-3 rounded-full"
                                        style={{
                                            width: `${Math.min(
                                                Math.round((order.paid_amount / order.price) * 100),
                                                100
                                            )}%`,
                                        }}
                                    ></div>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500 mt-1">
                                    <span>Rp 0</span>
                                    <span>
                                        {Math.round((order.paid_amount / order.price) * 100)}%
                                    </span>
                                    <span>{formatCurrency(order.price)}</span>
                                </div>
                            </div>

                            {/* Payment List */}
                            <div className="p-6">
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-lg font-medium text-gray-900">
                                        Daftar Pembayaran
                                    </h2>
                                    {order.remaining_amount > 0 && (
                                        <Link
                                            href={route("payment.detail", order.id)}
                                            className="inline-flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-purple-700 focus:outline-none"
                                        >
                                            <DollarSign className="h-4 w-4 mr-1" />
                                            Tambah Pembayaran
                                        </Link>
                                    )}
                                </div>

                                {payments && payments.length > 0 ? (
                                    <div className="space-y-4">
                                        {payments.map((payment) => (
                                            <div
                                                key={payment.id}
                                                className={`border ${payment.status === 'rejected' ? 'border-red-200' : 'border-gray-200'
                                                    } rounded-lg overflow-hidden`}
                                            >
                                                <div
                                                    className={`p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 ${payment.status === 'rejected' ? 'bg-red-50' : ''
                                                        }`}
                                                    onClick={() => setSelectedPayment(selectedPayment === payment.id ? null : payment.id)}
                                                >
                                                    <div className="flex items-center">
                                                        <div
                                                            className={`p-3 rounded-full mr-3 ${payment.status === 'verified'
                                                                ? 'bg-green-100'
                                                                : payment.status === 'pending'
                                                                    ? 'bg-yellow-100'
                                                                    : payment.status === 'rejected'
                                                                        ? 'bg-red-100'
                                                                        : 'bg-gray-100'
                                                                }`}
                                                        >
                                                            {payment.payment_method === 'bank_transfer' ? (
                                                                <Building className="h-5 w-5 text-gray-600" />
                                                            ) : payment.payment_method === 'virtual_account' ? (
                                                                <CreditCard className="h-5 w-5 text-blue-600" />
                                                            ) : (
                                                                getStatusIcon(payment.status)
                                                            )}
                                                        </div>

                                                        <div>
                                                            <div className="flex items-center">
                                                                <span className="font-medium text-gray-900">
                                                                    {payment.formatted_amount || formatCurrency(payment.amount)}
                                                                </span>
                                                                <span
                                                                    className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(
                                                                        payment.status
                                                                    )}`}
                                                                >
                                                                    {getStatusDisplay(payment.status)}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-gray-500">
                                                                {payment.payment_type === 'down_payment' ? 'Uang Muka' :
                                                                    payment.payment_type === 'installment' ? 'Cicilan' : 'Pelunasan'} -
                                                                {payment.payment_method === 'bank_transfer' ? (
                                                                    <span className="font-medium"> Transfer Bank {payment.bank_code}</span>
                                                                ) : payment.payment_method === 'virtual_account' ? (
                                                                    <span className="font-medium"> Virtual Account {payment.bank_code}</span>
                                                                ) : payment.payment_method}
                                                            </p>
                                                            {payment.payment_method === 'virtual_account' &&
                                                                payment.va_number &&
                                                                payment.status === 'pending' && (
                                                                    <div className="mt-1 flex items-center">
                                                                        <p className="text-xs text-blue-600 font-medium">
                                                                            VA: {payment.va_number}
                                                                        </p>
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleCopy(payment.va_number, `va-${payment.id}`);
                                                                            }}
                                                                            className="ml-2 p-1 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                                                                        >
                                                                            {copied[`va-${payment.id}`] ? (
                                                                                <CheckCircle className="h-3 w-3 text-green-600" />
                                                                            ) : (
                                                                                <Copy className="h-3 w-3 text-gray-600" />
                                                                            )}
                                                                        </button>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center">
                                                        <p className="text-sm text-gray-500 mr-3">
                                                            {formatDate(payment.created_at)}
                                                        </p>
                                                        {payment.payment_proof && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setViewImageUrl(payment.payment_proof_url);
                                                                }}
                                                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
                                                            >
                                                                Bukti
                                                            </button>
                                                        )}

                                                        {payment.payment_method === 'virtual_account' && payment.status === 'pending' && (
                                                            <Link
                                                                href={route('payment.status', payment.id)}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="px-3 py-1 ml-2 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700"
                                                            >
                                                                Detail VA
                                                            </Link>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Display rejection reason if payment is rejected */}
                                                {payment.status === 'rejected' && payment.note && (
                                                    <div className="px-4 py-3 bg-red-50 border-t border-red-200 flex items-start">
                                                        <div>
                                                            <p className="text-sm font-medium text-red-800">Alasan Penolakan:</p>
                                                            <p className="text-sm text-red-700">{payment.note}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Expanded details */}
                                                {selectedPayment === payment.id && (
                                                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <h3 className="text-sm font-medium text-gray-700 mb-2">Detail Pembayaran</h3>
                                                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                                                        <div>
                                                                            <p className="text-gray-500">ID Pembayaran</p>
                                                                            <p className="font-medium">{payment.id}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-500">Tanggal</p>
                                                                            <p className="font-medium">{formatDate(payment.created_at)}</p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-500">Metode</p>
                                                                            <p className="font-medium">
                                                                                {payment.payment_method === 'bank_transfer' ? 'Transfer Bank' :
                                                                                    payment.payment_method === 'virtual_account' ? 'Virtual Account' : payment.payment_method}
                                                                            </p>
                                                                        </div>
                                                                        <div>
                                                                            <p className="text-gray-500">Status</p>
                                                                            <p className="font-medium">{getStatusDisplay(payment.status)}</p>
                                                                        </div>

                                                                        {payment.bank_code && (
                                                                            <div>
                                                                                <p className="text-gray-500">Bank</p>
                                                                                <p className="font-medium">{getBankName(payment.bank_code)}</p>
                                                                            </div>
                                                                        )}

                                                                        {payment.transaction_id && (
                                                                            <div>
                                                                                <p className="text-gray-500">Transaction ID</p>
                                                                                <p className="font-medium truncate">{payment.transaction_id}</p>
                                                                            </div>
                                                                        )}

                                                                        {payment.va_number && (
                                                                            <div className="col-span-2">
                                                                                <p className="text-gray-500">Virtual Account</p>
                                                                                <div className="flex items-center">
                                                                                    <p className="font-medium mr-2">{payment.va_number}</p>
                                                                                    <button
                                                                                        onClick={() => handleCopy(payment.va_number, `va-detail-${payment.id}`)}
                                                                                        className="p-1 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                                                                                    >
                                                                                        {copied[`va-detail-${payment.id}`] ? (
                                                                                            <CheckCircle className="h-4 w-4 text-green-600" />
                                                                                        ) : (
                                                                                            <Copy className="h-4 w-4 text-gray-600" />
                                                                                        )}
                                                                                    </button>
                                                                                </div>
                                                                                <p className="text-xs text-gray-500 mt-1">
                                                                                    Lakukan pembayaran melalui {getBankName(payment.bank_code)} Mobile/Internet Banking
                                                                                </p>
                                                                            </div>
                                                                        )}

                                                                        {/* Add this for Virtual Account payment instructions */}
                                                                        {payment.payment_method === 'virtual_account' && payment.payment_data && (
                                                                            <div className="md:col-span-2 mt-2">
                                                                                <h3 className="text-sm font-medium text-gray-700 mb-2">Petunjuk Pembayaran</h3>
                                                                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                                                                    <ol className="list-decimal list-inside space-y-2">
                                                                                        {getPaymentInstructions(payment.payment_data).map((instruction, index) => (
                                                                                            <li key={index} className="text-sm text-blue-800">
                                                                                                {/* <span className="font-medium">{instruction.step}: </span> */}
                                                                                                {instruction.instruction}
                                                                                            </li>
                                                                                        ))}
                                                                                    </ol>
                                                                                    {getPaymentInstructions(payment.payment_data).length === 0 && (
                                                                                        <p className="text-sm text-gray-500 italic">Tidak ada petunjuk pembayaran khusus yang tersedia.</p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        {payment.expiry_time && (
                                                                            <div className="col-span-2">
                                                                                <p className="text-gray-500">Kadaluarsa Pada</p>
                                                                                <p className="font-medium">{formatDate(payment.expiry_time)}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <h3 className="text-sm font-medium text-gray-700 mb-2">Status</h3>
                                                                <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                                    <div className="flex items-center mb-3">
                                                                        <div
                                                                            className={`p-2 rounded-full mr-2 ${payment.status === 'verified'
                                                                                ? 'bg-green-100'
                                                                                : payment.status === 'pending'
                                                                                    ? 'bg-yellow-100'
                                                                                    : payment.status === 'rejected'
                                                                                        ? 'bg-red-100'
                                                                                        : 'bg-gray-100'
                                                                                }`}
                                                                        >
                                                                            {getStatusIcon(payment.status)}
                                                                        </div>
                                                                        <span className="font-medium">
                                                                            {getStatusDisplay(payment.status)}
                                                                        </span>
                                                                    </div>

                                                                    {payment.status === 'verified' && payment.verified_at && (
                                                                        <div className="text-sm text-gray-600">
                                                                            <p>Diverifikasi pada: {formatDate(payment.verified_at)}</p>
                                                                            {payment.verified_by_name && (
                                                                                <p>Diverifikasi oleh: {payment.verified_by_name}</p>
                                                                            )}
                                                                        </div>
                                                                    )}

                                                                    {payment.status === 'rejected' && payment.note && (
                                                                        <div className="mt-2 p-3 bg-red-50 rounded-lg border border-red-200">
                                                                            <p className="font-medium text-red-800 text-sm">Alasan Penolakan:</p>
                                                                            <p className="text-sm text-red-700 mt-1">{payment.note}</p>
                                                                        </div>
                                                                    )}

                                                                    {payment.status === 'pending' && payment.payment_method === 'virtual_account' && (
                                                                        <div className="mt-2">
                                                                            <Link
                                                                                href={route('payment.status', payment.id)}
                                                                                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 w-full justify-center"
                                                                            >
                                                                                Cek Status Pembayaran
                                                                            </Link>
                                                                            <div className="text-sm text-gray-500 italic mt-2">
                                                                                Pembayaran virtual account akan otomatis diverifikasi oleh sistem.
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Payment Proof Section */}
                                                            {payment.payment_method === 'bank_transfer' && payment.payment_proof && (
                                                                <div className="md:col-span-2">
                                                                    <h3 className="text-sm font-medium text-gray-700 mb-2">Bukti Pembayaran</h3>
                                                                    <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                                        <div className="flex justify-center">
                                                                            <img
                                                                                src={payment.payment_proof_url}
                                                                                alt="Bukti Pembayaran"
                                                                                className="max-h-64 rounded-lg object-contain cursor-pointer"
                                                                                onClick={() => setViewImageUrl(payment.payment_proof_url)}
                                                                            />
                                                                        </div>
                                                                        <div className="flex justify-center mt-3">
                                                                            <button
                                                                                onClick={() => setViewImageUrl(payment.payment_proof_url)}
                                                                                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                                                                            >
                                                                                Lihat Gambar Lengkap
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-lg p-8 text-center">
                                        <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-gray-100">
                                            <FileText className="h-6 w-6 text-gray-400" />
                                        </div>
                                        <h3 className="mt-2 text-lg font-medium text-gray-900">Belum Ada Pembayaran</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            Belum ada catatan pembayaran untuk pesanan ini.
                                        </p>
                                        <div className="mt-6">
                                            <Link
                                                href={route("payment.detail", order.id)}
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none"
                                            >
                                                <DollarSign className="-ml-1 mr-2 h-5 w-5" />
                                                Buat Pembayaran
                                            </Link>
                                        </div>
                                    </div>
                                )}

                                {/* Payment Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-green-100 rounded-full">
                                                <DollarSign className="h-5 w-5 text-green-600" />
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">Total Dibayar</p>
                                                <p className="font-medium">
                                                    {formatCurrency(order.paid_amount)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-yellow-100 rounded-full">
                                                <DollarSign className="h-5 w-5 text-yellow-600" />
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">Sisa Pembayaran</p>
                                                <p className="font-medium">
                                                    {formatCurrency(order.remaining_amount)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-center space-x-3">
                                            <div className="p-2 bg-blue-100 rounded-full">
                                                <FileText className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">Status Pembayaran</p>
                                                <p className="font-medium">
                                                    {order.is_fully_paid ? 'Lunas' : 'Belum Lunas'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </BaseLayout>
        </>
    );
};

export default History;

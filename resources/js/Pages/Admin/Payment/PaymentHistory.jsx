import React, { useState, useEffect } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import {
    ArrowLeft,
    DollarSign,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    FileText,
    ExternalLink,
    Loader2,
    MessageSquare,
    AlertTriangle,
} from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";
import Toast from "@/Components/Toast";

const PaymentHistory = () => {
    const { order, payments, toast } = usePage().props;

    const [showToast, setShowToast] = useState(!!toast);
    const [toastMessage, setToastMessage] = useState(toast || { type: "", message: "" });
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [loading, setLoading] = useState({});
    const [viewImageUrl, setViewImageUrl] = useState(null);
    const [verifyingPayment, setVerifyingPayment] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState('verified');
    const [rejectionNote, setRejectionNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    // Function to check Virtual Account payment status
    const checkPaymentStatus = async (payment) => {
        if (payment.status !== 'pending' || payment.payment_method !== 'virtual_account') {
            return;
        }

        setLoading((prev) => ({ ...prev, [payment.id]: true }));

        try {
            const response = await fetch(`/api/v1/payments/${payment.id}/check-status`);
            const data = await response.json();

            if (data.status === 'verified') {
                setToastMessage({
                    type: "success",
                    message: "Pembayaran telah diverifikasi!",
                });
                setShowToast(true);

                // Reload the page to get updated payment status
                window.location.reload();
            } else if (data.status === 'rejected') {
                setToastMessage({
                    type: "error",
                    message: "Pembayaran ditolak: " + data.message,
                });
                setShowToast(true);

                // Reload the page to get updated payment status
                window.location.reload();
            }
        } catch (error) {
            console.error("Error checking payment status:", error);
            setToastMessage({
                type: "error",
                message: "Gagal memeriksa status pembayaran.",
            });
            setShowToast(true);
        } finally {
            setLoading((prev) => ({ ...prev, [payment.id]: false }));
        }
    };

    // Open verify modal
    const openVerifyModal = (payment) => {
        setVerifyingPayment(payment);
        setPaymentStatus('verified');
        setRejectionNote('');
    };

    // Close verify modal
    const closeVerifyModal = () => {
        setVerifyingPayment(null);
        setPaymentStatus('verified');
        setRejectionNote('');
    };

    // Handle status change
    const handleStatusChange = (status) => {
        setPaymentStatus(status);
    };

    // Verify payment
    const verifyPayment = () => {
        if (!verifyingPayment) return;

        setIsSubmitting(true);

        // Prepare data based on status
        const data = {
            status: paymentStatus,
            note: paymentStatus === 'rejected' ? rejectionNote : ''
        };

        router.patch(route('admin.payments.verify', verifyingPayment.id), data, {
            onSuccess: () => {
                setIsSubmitting(false);
                closeVerifyModal();
                setSelectedPayment(null);

                // Show success toast
                setToastMessage({
                    type: "success",
                    message: paymentStatus === 'verified'
                        ? "Pembayaran berhasil diverifikasi!"
                        : "Pembayaran berhasil ditolak!"
                });
                setShowToast(true);

                // Reload the page to get updated payment status
                window.location.reload();
            },
            onError: () => {
                setIsSubmitting(false);
                // Show error toast
                setToastMessage({
                    type: "error",
                    message: "Gagal memproses pembayaran. Silakan coba lagi."
                });
                setShowToast(true);
            }
        });
    };

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
                return <AlertCircle className="h-5 w-5 text-gray-600" />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return "-";

        const date = new Date(dateString);
        return new Intl.DateTimeFormat('id-ID', {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    };

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

    return (
        <AdminLayout activeMenu="order-management">
            <Head title={`Payment History: ${order.order_number}`} />

            {showToast && (
                <Toast
                    type={toastMessage.type}
                    message={toastMessage.message}
                    onClose={() => setShowToast(false)}
                />
            )}

            {/* Image Preview Modal */}
            {viewImageUrl && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                    onClick={() => setViewImageUrl(null)}
                >
                    <div className="bg-white p-2 rounded-lg max-w-3xl max-h-[90vh] w-full" onClick={e => e.stopPropagation()}>
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
                                alt="Payment Proof"
                                className="mx-auto max-w-full object-contain"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Verification Modal */}
            {verifyingPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-lg w-full p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold">Verifikasi Pembayaran</h2>
                            <button
                                onClick={closeVerifyModal}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XCircle className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-500 text-sm">Order Number</p>
                                    <p className="font-medium">{verifyingPayment.order_number}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Jumlah</p>
                                    <p className="font-medium text-green-600">{verifyingPayment.formatted_amount}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Metode Pembayaran</p>
                                    <p className="font-medium">{verifyingPayment.payment_method_display}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Tanggal</p>
                                    <p className="font-medium">{formatDate(verifyingPayment.created_at)}</p>
                                </div>
                            </div>
                        </div>

                        {verifyingPayment.payment_proof && (
                            <div className="mb-6">
                                <h3 className="text-md font-medium mb-2">Bukti Pembayaran</h3>
                                <div className="bg-gray-50 p-4 rounded-lg flex justify-center">
                                    <img
                                        src={verifyingPayment.payment_proof_url}
                                        alt="Bukti Pembayaran"
                                        className="max-h-48 object-contain cursor-pointer"
                                        onClick={() => setViewImageUrl(verifyingPayment.payment_proof_url)}
                                    />
                                </div>
                                <div className="mt-2 text-center">
                                    <button
                                        onClick={() => setViewImageUrl(verifyingPayment.payment_proof_url)}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                    >
                                        Lihat Gambar Lengkap
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status Pembayaran</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange('verified')}
                                    className={`py-2 px-4 rounded-lg border flex items-center justify-center ${paymentStatus === 'verified'
                                        ? 'bg-green-600 text-white border-green-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Verifikasi
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleStatusChange('rejected')}
                                    className={`py-2 px-4 rounded-lg border flex items-center justify-center ${paymentStatus === 'rejected'
                                        ? 'bg-red-600 text-white border-red-600'
                                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Tolak
                                </button>
                            </div>
                        </div>

                        {paymentStatus === 'rejected' && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Alasan Penolakan <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={rejectionNote}
                                    onChange={(e) => setRejectionNote(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                                    placeholder="Jelaskan alasan penolakan pembayaran ini"
                                    rows="3"
                                    required
                                ></textarea>
                                {paymentStatus === 'rejected' && !rejectionNote && (
                                    <p className="text-red-500 text-xs mt-1">Alasan penolakan wajib diisi</p>
                                )}
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={closeVerifyModal}
                                className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={verifyPayment}
                                disabled={isSubmitting || (paymentStatus === 'rejected' && !rejectionNote)}
                                className={`py-2 px-4 rounded-lg text-white ${paymentStatus === 'verified'
                                    ? 'bg-green-600 hover:bg-green-700'
                                    : 'bg-red-600 hover:bg-red-700'
                                    } ${isSubmitting || (paymentStatus === 'rejected' && !rejectionNote) ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? (
                                    <span className="flex items-center">
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Memproses...
                                    </span>
                                ) : paymentStatus === 'verified' ? (
                                    'Verifikasi Pembayaran'
                                ) : (
                                    'Tolak Pembayaran'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link
                        href={route('admin.orders.show', order.id)}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Kembali ke Detail Pesanan
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 text-white">
                        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center">
                            <div>
                                <h1 className="text-2xl font-bold">Riwayat Pembayaran</h1>
                                <p className="text-white/80">
                                    Order #{order.order_number} ({order.clientName})
                                </p>
                            </div>
                            <div className="mt-4 sm:mt-0 sm:text-right">
                                <p className="text-white/80">Total Dibayar</p>
                                <p className="text-2xl font-bold">{order.paidAmount}</p>
                                <p className="text-white/80">
                                    dari {order.price} ({order.paymentPercentage}%)
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Progress */}
                    <div className="p-4 bg-gray-50 border-b border-gray-200">
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className="bg-purple-600 h-3 rounded-full"
                                style={{ width: `${order.paymentPercentage}%` }}
                            ></div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                            <span>Rp 0</span>
                            <span>{order.paymentPercentage}%</span>
                            <span>{order.price}</span>
                        </div>
                    </div>

                    {/* Payment List */}
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-medium text-gray-900">Daftar Pembayaran</h2>
                            <Link
                                href={route('admin.payments.detail', order.id)}
                                className="inline-flex items-center px-4 py-2 bg-purple-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-purple-700 focus:outline-none"
                            >
                                <DollarSign className="h-4 w-4 mr-1" />
                                Tambah Pembayaran
                            </Link>
                        </div>

                        {payments && payments.length > 0 ? (
                            <div className="space-y-4">
                                {payments.map((payment) => (
                                    <div
                                        key={payment.id}
                                        className={`border ${payment.status === 'rejected' ? 'border-red-200' : 'border-gray-200'} rounded-lg overflow-hidden`}
                                    >
                                        <div
                                            className={`p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 ${payment.status === 'rejected' ? 'bg-red-50' : ''}`}
                                            onClick={() => setSelectedPayment(selectedPayment === payment.id ? null : payment.id)}
                                        >
                                            <div className="flex items-center">
                                                <div className={`p-3 rounded-full mr-3 ${payment.status === 'verified' ? 'bg-green-100' :
                                                    payment.status === 'pending' ? 'bg-yellow-100' :
                                                        payment.status === 'rejected' ? 'bg-red-100' :
                                                            'bg-gray-100'
                                                    }`}>
                                                    {getStatusIcon(payment.status)}
                                                </div>

                                                <div>
                                                    <div className="flex items-center">
                                                        <span className="font-medium text-gray-900">
                                                            {payment.formatted_amount}
                                                        </span>
                                                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(payment.status)}`}>
                                                            {getStatusDisplay(payment.status)}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-500">
                                                        {payment.payment_type_display} - {payment.payment_method_display}
                                                        {payment.payment_method === 'virtual_account' && payment.bank_code && (
                                                            <span className="ml-1 font-medium">({payment.bank_code})</span>
                                                        )}
                                                    </p>
                                                    {payment.payment_method === 'virtual_account' && payment.va_number && payment.status === 'pending' && (
                                                        <p className="text-xs text-blue-600 font-medium mt-1">
                                                            VA: {payment.va_number}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <p className="text-sm text-gray-500 mr-3">
                                                    {formatDate(payment.created_at)}
                                                </p>
                                                {payment.status === 'pending' && payment.payment_method === 'virtual_account' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            checkPaymentStatus(payment);
                                                        }}
                                                        disabled={loading[payment.id]}
                                                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                                                    >
                                                        {loading[payment.id] ? (
                                                            <>
                                                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                                Memeriksa...
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Clock className="h-3 w-3 mr-1" />
                                                                Cek Status
                                                            </>
                                                        )}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Display rejection reason if payment is rejected */}
                                        {payment.status === 'rejected' && payment.note && (
                                            <div className="px-4 py-3 bg-red-50 border-t border-red-200 flex items-start">
                                                <MessageSquare className="h-5 w-5 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                                                <div>
                                                    <p className="text-sm font-medium text-red-800">Alasan Penolakan:</p>
                                                    <p className="text-sm text-red-700">{payment.note}</p>
                                                </div>
                                            </div>
                                        )}

                                        {selectedPayment === payment.id && (
                                            <div className="p-4 bg-gray-50 border-t border-gray-200">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Detail Pembayaran</h3>

                                                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                            <div className="grid grid-cols-2 gap-2 text-sm">
                                                                <div>
                                                                    <p className="text-gray-500">ID Pembayaran</p>
                                                                    <p className="font-medium">{payment.id}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500">Tanggal Dibuat</p>
                                                                    <p className="font-medium">{formatDate(payment.created_at)}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500">Jenis Pembayaran</p>
                                                                    <p className="font-medium">{payment.payment_type_display}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-gray-500">Metode Pembayaran</p>
                                                                    <p className="font-medium">{payment.payment_method_display}</p>
                                                                </div>

                                                                {payment.bank_code && (
                                                                    <div>
                                                                        <p className="text-gray-500">Bank</p>
                                                                        <p className="font-medium">{payment.bank_code}</p>
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
                                                                        <p className="font-medium">{getBankName(payment.bank_code)} - {payment.va_number}</p>
                                                                        <p className="text-xs text-gray-500">Silakan lakukan pembayaran sesuai dengan nomor VA di atas</p>
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
                                                        <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>

                                                        <div className="bg-white p-3 rounded-lg border border-gray-200">
                                                            <div className="flex items-center mb-3">
                                                                <div className={`p-2 rounded-full mr-2 ${payment.status === 'verified' ? 'bg-green-100' :
                                                                    payment.status === 'pending' ? 'bg-yellow-100' :
                                                                        payment.status === 'rejected' ? 'bg-red-100' :
                                                                            'bg-gray-100'
                                                                    }`}>
                                                                    {getStatusIcon(payment.status)}
                                                                </div>
                                                                <span className="font-medium">
                                                                    {getStatusDisplay(payment.status)}
                                                                </span>
                                                            </div>

                                                            {payment.status === 'verified' && (
                                                                <div className="text-sm text-gray-600">
                                                                    <p>Diverifikasi pada: {formatDate(payment.verified_at)}</p>
                                                                    {payment.verified_by && (
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

                                                            {payment.status === 'pending' && payment.payment_method === 'bank_transfer' && (
                                                                <div className="mt-2">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            openVerifyModal(payment);
                                                                        }}
                                                                        className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                                        Verifikasi Pembayaran
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {payment.status === 'pending' && payment.payment_method === 'virtual_account' && (
                                                                <div className="mt-2 space-y-2">
                                                                    <button
                                                                        onClick={() => checkPaymentStatus(payment)}
                                                                        disabled={loading[payment.id]}
                                                                        className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:bg-blue-300 w-full justify-center"
                                                                    >
                                                                        {loading[payment.id] ? (
                                                                            <>
                                                                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                                                                                Memeriksa Status...
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Clock className="h-4 w-4 mr-1" />
                                                                                Cek Status Pembayaran
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                    <div className="text-sm text-gray-500 italic">Pembayaran virtual account akan otomatis diverifikasi oleh sistem.
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Payment Proof Section */}
                                                    {payment.payment_method === 'bank_transfer' && payment.payment_proof && (
                                                        <div className="md:col-span-2">
                                                            <h3 className="text-sm font-medium text-gray-500 mb-2">Bukti Pembayaran</h3>
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
                                                                        <ExternalLink className="h-4 w-4 mr-1" />
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
                                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-1">Belum Ada Pembayaran</h3>
                                <p className="text-gray-500 mb-6">
                                    Belum ada catatan pembayaran untuk pesanan ini.
                                </p>
                                <Link
                                    href={route('admin.payments.detail', order.id)}
                                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center"
                                >
                                    <DollarSign className="h-4 w-4 mr-1" />
                                    Proses Pembayaran
                                </Link>
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
                                            {order.paidAmount}
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
                                            {order.remainingAmount}
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
                                            {order.isFullyPaid ? 'Lunas' : 'Belum Lunas'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default PaymentHistory;

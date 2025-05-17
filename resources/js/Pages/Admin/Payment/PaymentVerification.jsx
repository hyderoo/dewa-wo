import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Toast from "@/Components/Toast";
import {
    CheckCircle,
    XCircle,
    ExternalLink,
    Search,
    Clock,
    Loader2,
    Filter,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

const PaymentVerification = () => {
    const { payments, pagination, toast } = usePage().props;

    const [showToast, setShowToast] = useState(!!toast);
    const [toastMessage, setToastMessage] = useState(toast || { type: "", message: "" });
    const [verifyingPayment, setVerifyingPayment] = useState(null);
    const [selectedPayment, setSelectedPayment] = useState(null);
    const [viewProof, setViewProof] = useState(null);
    const [paymentStatus, setPaymentStatus] = useState('verified');
    const [rejectionNote, setRejectionNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Handle page change
    const handlePageChange = (page) => {
        router.get(route('admin.payments.verification'), {
            page: page
        }, {
            preserveState: true,
            replace: true
        });
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

    return (
        <AdminLayout activeMenu="payment-verification">
            <Head title="Verifikasi Pembayaran" />

            {showToast && (
                <Toast
                    type={toastMessage.type}
                    message={toastMessage.message}
                    onClose={() => setShowToast(false)}
                />
            )}

            {/* Payment Proof Modal */}
            {viewProof && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium">Bukti Pembayaran</h3>
                            <button
                                onClick={() => setViewProof(null)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <XCircle className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="flex justify-center mb-4">
                            <img
                                src={viewProof}
                                alt="Bukti Pembayaran"
                                className="max-w-full max-h-[70vh] object-contain"
                            />
                        </div>
                        <div className="flex justify-end space-x-3">
                            <a
                                href={viewProof}
                                target="_blank"
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Buka di Tab Baru
                            </a>
                            <button
                                onClick={() => setViewProof(null)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                                Tutup
                            </button>
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
                                    <p className="text-gray-500 text-sm">Client</p>
                                    <p className="font-medium">{verifyingPayment.client_name}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Jumlah</p>
                                    <p className="font-medium text-green-600">{verifyingPayment.amount}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 text-sm">Tanggal</p>
                                    <p className="font-medium">{verifyingPayment.created_at}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mb-6">
                            <h3 className="text-md font-medium mb-2">Bukti Pembayaran</h3>
                            <div className="bg-gray-50 p-4 rounded-lg flex justify-center">
                                <img
                                    src={verifyingPayment.payment_proof_url}
                                    alt="Bukti Pembayaran"
                                    className="max-h-48 object-contain cursor-pointer"
                                    onClick={() => setViewProof(verifyingPayment.payment_proof_url)}
                                />
                            </div>
                            <div className="mt-2 text-center">
                                <button
                                    onClick={() => setViewProof(verifyingPayment.payment_proof_url)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                >
                                    Lihat Gambar Lengkap
                                </button>
                            </div>
                        </div>

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
                                    className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    <h1 className="text-2xl font-semibold text-gray-900">Verifikasi Pembayaran</h1>
                    <p className="text-gray-600">
                        Verifikasi pembayaran manual yang dilakukan oleh pelanggan
                    </p>
                </div>

                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                            <div className="w-full md:w-auto relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Cari pembayaran..."
                                    className="w-full md:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="flex space-x-2">
                                <button className="px-4 py-2 flex items-center space-x-1 rounded-lg border border-gray-300 hover:bg-gray-50">
                                    <Filter className="w-4 h-4" />
                                    <span>Filter</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Payments List */}
                    {payments && payments.length > 0 ? (
                        <div className="divide-y divide-gray-200">
                            {payments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className={`p-4 hover:bg-gray-50 ${selectedPayment === payment.id ? 'bg-gray-50' : ''}`}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                        <div className="flex-grow">
                                            <div className="flex items-start">
                                                <div className="p-2 bg-yellow-100 rounded-full mr-4">
                                                    <Clock className="h-6 w-6 text-yellow-600" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-medium text-gray-900">
                                                        {payment.client_name} <span className="text-sm text-gray-500">({payment.order_number})</span>
                                                    </h3>
                                                    <p className="text-gray-500">
                                                        {payment.payment_type} - {payment.amount}
                                                    </p>
                                                    <p className="text-sm text-gray-500 mt-1">
                                                        Dibuat: {payment.created_at}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3 mt-4 md:mt-0">
                                            <button
                                                onClick={() => setViewProof(payment.payment_proof_url)}
                                                className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                                            >
                                                Lihat Bukti
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (selectedPayment === payment.id) {
                                                        setSelectedPayment(null);
                                                    } else {
                                                        setSelectedPayment(payment.id);
                                                    }
                                                }}
                                                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200"
                                            >
                                                {selectedPayment === payment.id ? 'Tutup' : 'Detail'}
                                            </button>
                                        </div>
                                    </div>

                                    {selectedPayment === payment.id && (
                                        <div className="mt-4 pt-4 border-t border-gray-200">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Detail Pembayaran</h4>
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                                            <div>
                                                                <p className="text-gray-500">Order Number</p>
                                                                <p className="font-medium">{payment.order_number}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Client</p>
                                                                <p className="font-medium">{payment.client_name}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Dibayar Oleh</p>
                                                                <p className="font-medium">{payment.user_name}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Jumlah</p>
                                                                <p className="font-medium">{payment.amount}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Jenis Pembayaran</p>
                                                                <p className="font-medium">{payment.payment_type}</p>
                                                            </div>
                                                            <div>
                                                                <p className="text-gray-500">Tanggal Pembayaran</p>
                                                                <p className="font-medium">{payment.created_at}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Bukti Pembayaran</h4>
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex justify-center">
                                                        <img
                                                            src={payment.payment_proof_url}
                                                            alt="Bukti Pembayaran"
                                                            className="max-h-48 object-contain cursor-pointer"
                                                            onClick={() => setViewProof(payment.payment_proof_url)}
                                                        />
                                                    </div>

                                                    <div className="mt-4 flex justify-end space-x-3">
                                                        <button
                                                            onClick={() => openVerifyModal(payment)}
                                                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Verifikasi Pembayaran
                                                        </button>
                                                        <Link
                                                            href={route('admin.payments.history', payment.order_id)}
                                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                                        >
                                                            Lihat Order
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak Ada Pembayaran Tertunda</h3>
                            <p className="text-gray-500">
                                Semua pembayaran telah diverifikasi. Tidak ada pembayaran yang perlu diverifikasi.
                            </p>
                        </div>
                    )}

                    {/* Pagination */}
                    {pagination && pagination.total > 0 && (
                        <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                            <div className="flex-1 flex justify-between sm:hidden">
                                <button
                                    onClick={() => handlePageChange(pagination.current_page - 1)}
                                    disabled={pagination.current_page === 1}
                                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${pagination.current_page === 1
                                        ? 'bg-gray-100 text-gray-400 cursor-default'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => handlePageChange(pagination.current_page + 1)}
                                    disabled={pagination.current_page === pagination.last_page}
                                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${pagination.current_page === pagination.last_page
                                        ? 'bg-gray-100 text-gray-400 cursor-default'
                                        : 'bg-white text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">{pagination.from}</span> to{' '}
                                        <span className="font-medium">{pagination.to}</span> of{' '}
                                        <span className="font-medium">{pagination.total}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav
                                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                                        aria-label="Pagination"
                                    >
                                        <button
                                            onClick={() => handlePageChange(pagination.current_page - 1)}
                                            disabled={pagination.current_page === 1}
                                            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${pagination.current_page === 1
                                                ? 'text-gray-300 cursor-default'
                                                : 'text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className="sr-only">Previous</span>
                                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                                        </button>

                                        {/* Generate page numbers */}
                                        {[...Array(pagination.last_page)].map((_, i) => {
                                            const page = i + 1;
                                            // Show only current page, first, last, and pages around current
                                            if (
                                                page === 1 ||
                                                page === pagination.last_page ||
                                                Math.abs(page - pagination.current_page) <= 1
                                            ) {
                                                return (
                                                    <button
                                                        key={page}
                                                        onClick={() => handlePageChange(page)}
                                                        aria-current={page === pagination.current_page ? 'page' : undefined}
                                                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === pagination.current_page
                                                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                            }`}
                                                    >
                                                        {page}
                                                    </button>
                                                );
                                            }
                                            // Show ellipsis if there's a gap
                                            if (
                                                (page === 2 && pagination.current_page > 3) ||
                                                (page === pagination.last_page - 1 && pagination.current_page < pagination.last_page - 2)
                                            ) {
                                                return (
                                                    <span
                                                        key={page}
                                                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                                                    >
                                                        ...
                                                    </span>
                                                );
                                            }
                                            return null;
                                        })}

                                        <button
                                            onClick={() => handlePageChange(pagination.current_page + 1)}
                                            disabled={pagination.current_page === pagination.last_page}
                                            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${pagination.current_page === pagination.last_page
                                                ? 'text-gray-300 cursor-default'
                                                : 'text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            <span className="sr-only">Next</span>
                                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default PaymentVerification;

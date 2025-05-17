import React, { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Users,
    Clock,
    CheckCircle,
    DollarSign,
    Percent,
    AlertCircle,
    Package,
    ShoppingBag,
    Tag,
    Star,
    FileText,
    List,
    X,
    XCircle
} from "lucide-react";
import AdminLayout from "@/Layouts/AdminLayout";
import Toast from "@/Components/Toast";

const StarRating = ({ rating, onRatingChange, readonly = false }) => {
    return (
        <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => !readonly && onRatingChange(star)}
                    disabled={readonly}
                    className={`${star <= rating ? "text-yellow-400" : "text-gray-300"
                        } focus:outline-none ${!readonly && "hover:text-yellow-400"}`}
                >
                    <Star className={`w-6 h-6 ${star <= rating ? "fill-yellow-400" : ""}`} />
                </button>
            ))}
        </div>
    );
};

const OrderDetail = ({ order, toast }) => {
    const [showToast, setShowToast] = useState(!!toast);
    const [toastMessage, setToastMessage] = useState(toast || { type: "", message: "" });
    const [showDiscountDetails, setShowDiscountDetails] = useState(false);

    // Modal states
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [rating, setRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'ongoing':
                return 'bg-blue-100 text-blue-800';
            case 'pending_payment':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusDisplay = (status) => {
        switch (status) {
            case 'completed':
                return 'Selesai';
            case 'ongoing':
                return 'Berlangsung';
            case 'pending_payment':
                return 'Menunggu Pembayaran';
            case 'cancelled':
                return 'Dibatalkan';
            default:
                return status;
        }
    };

    // Handler functions for order actions
    const closeAllModals = () => {
        setShowCancelModal(false);
        setShowCompleteModal(false);
        setShowReviewModal(false);
        setCancelReason("");
        setRating(5);
        setReviewComment("");
    };

    // Cancel Order handler
    const handleCancelOrder = () => {
        if (!cancelReason.trim()) {
            setToastMessage({
                type: "error",
                message: "Alasan pembatalan harus diisi"
            });
            setShowToast(true);
            return;
        }

        setIsSubmitting(true);
        router.patch(route('admin.orders.update-status', order.id), {
            status: 'cancelled',
            cancel_reason: cancelReason
        }, {
            onSuccess: () => {
                setToastMessage({
                    type: "success",
                    message: "Pesanan berhasil dibatalkan"
                });
                setShowToast(true);
                closeAllModals();
                setIsSubmitting(false);
            },
            onError: () => {
                setToastMessage({
                    type: "error",
                    message: "Gagal membatalkan pesanan. Silakan coba lagi."
                });
                setShowToast(true);
                setIsSubmitting(false);
            }
        });
    };

    const handleSubmitReview = () => {
        if (!reviewComment.trim()) {
            setToastMessage({
                type: "error",
                message: "Komentar ulasan harus diisi"
            });
            setShowToast(true);
            return;
        }

        setIsSubmitting(true);
        router.post(route('admin.orders.review', order.id), {
            rating: rating,
            comment: reviewComment
        }, {
            onSuccess: () => {
                setToastMessage({
                    type: "success",
                    message: "Ulasan berhasil dikirim"
                });
                setShowToast(true);
                closeAllModals();
                setIsSubmitting(false);
            },
            onError: () => {
                setToastMessage({
                    type: "error",
                    message: "Gagal mengirim ulasan. Silakan coba lagi."
                });
                setShowToast(true);
                setIsSubmitting(false);
            }
        });
    };

    // Complete Order handler
    const handleCompleteOrder = () => {
        setIsSubmitting(true);
        router.patch(route('admin.orders.update-status', order.id), {
            status: 'completed'
        }, {
            onSuccess: () => {
                setToastMessage({
                    type: "success",
                    message: "Pesanan berhasil diselesaikan"
                });
                setShowToast(true);
                closeAllModals();
                setIsSubmitting(false);
            },
            onError: () => {
                setToastMessage({
                    type: "error",
                    message: "Gagal menyelesaikan pesanan. Silakan coba lagi."
                });
                setShowToast(true);
                setIsSubmitting(false);
            }
        });
    };

    return (
        <AdminLayout activeMenu="order-management">
            <Head title={`Order: ${order.order_number}`} />

            {showToast && (
                <Toast
                    type={toastMessage.type}
                    message={toastMessage.message}
                    onClose={() => setShowToast(false)}
                />
            )}

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <Link
                        href={route('admin.orders')}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Kembali ke Daftar Pesanan
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white">
                        <div className="flex justify-between items-start">
                            <div>
                                <h1 className="text-2xl font-bold">{order.clientName}</h1>
                                <p className="text-white/80">
                                    Order #{order.order_number}
                                </p>
                            </div>
                            <div className="flex items-center">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white/20`}>
                                    {getStatusDisplay(order.status)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="p-6 border-b border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-pink-100 rounded-full">
                                        <Calendar className="h-5 w-5 text-pink-600" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Tanggal Acara</p>
                                        <p className="font-medium">
                                            {new Date(order.date).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-blue-100 rounded-full">
                                        <MapPin className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Lokasi</p>
                                        <p className="font-medium">{order.venue}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-green-100 rounded-full">
                                        <Users className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Estimasi Tamu</p>
                                        <p className="font-medium">{order.details.estimatedGuests} orang</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <div className="p-2 bg-purple-100 rounded-full">
                                        <ShoppingBag className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Paket</p>
                                        <p className="font-medium">{order.packageName}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Price & Payment Section */}
                    <div className="p-6 border-b border-gray-200">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Detail Harga & Pembayaran</h2>

                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div className="flex-1">
                                    {order.hasDiscount ? (
                                        <div className="mb-3">
                                            <div className="flex items-center">
                                                <p className="text-xl font-semibold text-gray-900">
                                                    {order.price}
                                                </p>
                                                <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium flex items-center">
                                                    <Percent className="w-3 h-3 mr-1" />
                                                    Diskon {order.formattedDiscountPercent}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                <span className="line-through">{order.formattedOriginalPrice}</span>
                                                <button
                                                    className="ml-2 text-blue-600 hover:text-blue-800 focus:outline-none text-xs"
                                                    onClick={() => setShowDiscountDetails(!showDiscountDetails)}
                                                >
                                                    {showDiscountDetails ? 'Sembunyikan detail' : 'Lihat detail'}
                                                </button>
                                            </p>

                                            {showDiscountDetails && (
                                                <div className="mt-2 bg-white p-3 rounded-lg border border-gray-200 text-sm">
                                                    <p className="mb-1"><span className="font-medium">Harga Asli:</span> {order.formattedOriginalPrice}</p>
                                                    <p className="mb-1"><span className="font-medium">Diskon:</span> {order.formattedDiscountAmount} ({order.formattedDiscountPercent})</p>
                                                    <p className="mb-1"><span className="font-medium">Harga Akhir:</span> {order.price}</p>
                                                    {order.discount_reason && (
                                                        <p className="mt-2 bg-gray-50 p-2 rounded italic">{order.discount_reason}</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div>
                                            <p className="text-xl font-semibold text-gray-900">
                                                {order.price}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <div className="flex flex-col space-y-1">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Status Pembayaran:</span>
                                            <span className={`font-medium ${order.isFullyPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {order.isFullyPaid ? 'Lunas' : 'Belum Lunas'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Terbayar:</span>
                                            <span className="font-medium">
                                                {order.paidAmount}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Sisa Pembayaran:</span>
                                            <span className="font-medium">
                                                {order.remainingAmount}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Progress Bar */}
                            <div className="mt-4">
                                <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                                    <span>Pembayaran {order.paymentPercentage}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div
                                        className="bg-pink-600 h-2.5 rounded-full"
                                        style={{ width: `${order.paymentPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* Payment & Order Actions */}
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={route('admin.payments.history', order.id)}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                            >
                                <FileText className="w-4 h-4 inline-block mr-1" />
                                Riwayat Pembayaran
                            </Link>

                            {!order.isFullyPaid && order.status !== 'cancelled' && (
                                <Link
                                    href={route('admin.payments.detail', order.id)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <DollarSign className="w-4 h-4 inline-block mr-1" />
                                    Proses Pembayaran
                                </Link>
                            )}

                            {/* Complete button - Show only for ongoing orders */}
                            {order.status === 'ongoing' && (
                                <button
                                    onClick={() => setShowCompleteModal(true)}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-center transition-colors flex items-center"
                                >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Selesaikan Pesanan
                                </button>
                            )}

                            {/* Cancel button - Show only for pending or ongoing orders */}
                            {(order.status === 'pending_payment' || order.status === 'ongoing') && (
                                <button
                                    onClick={() => setShowCancelModal(true)}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-center transition-colors flex items-center"
                                >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Batalkan Pesanan
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Order Details & Features */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Included Services */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <List className="w-5 h-5 mr-2 text-gray-500" />
                                    Layanan Termasuk
                                </h3>

                                {order.details.includedServices && order.details.includedServices.length > 0 ? (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <ul className="space-y-2">
                                            {order.details.includedServices.map((service, index) => (
                                                <li key={index} className="flex items-start">
                                                    <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                                                    <span>{service}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-lg p-4 text-gray-500 text-center">
                                        <p>Tidak ada layanan termasuk</p>
                                    </div>
                                )}
                            </div>

                            {/* Custom Features */}
                            <div>
                                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                                    <Package className="w-5 h-5 mr-2 text-gray-500" />
                                    Fitur Custom
                                </h3>

                                {order.customFeatures && order.customFeatures.length > 0 ? (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <ul className="space-y-3">
                                            {order.customFeatures.map((feature, index) => (
                                                <li key={index} className="flex justify-between items-center">
                                                    <div className="flex items-center">
                                                        <Tag className="w-4 h-4 text-pink-500 mr-2 flex-shrink-0" />
                                                        <span>{feature.name}</span>
                                                    </div>
                                                    <span className="font-medium text-pink-600">{feature.price}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-lg p-4 text-gray-500 text-center">
                                        <p>Tidak ada fitur custom ditambahkan</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Review Section */}
                        {order.status === 'completed' && (
                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900 mb-4">
                                    Ulasan Klien
                                </h3>

                                {order.hasReviewed ? (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex space-x-1 mb-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <svg
                                                    key={star}
                                                    className={`w-5 h-5 ${star <= order.review.rating ? "text-yellow-400" : "text-gray-300"}`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                            <span className="ml-1 text-gray-600">({order.review.rating}/5)</span>
                                        </div>
                                        <p className="text-gray-700">{order.review.comment}</p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Diulas pada: {new Date(order.review.date).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                                        <AlertCircle className="h-6 w-6 text-yellow-500 mx-auto mb-2" />
                                        <p className="text-gray-700">Pesanan ini belum memiliki ulasan.</p>
                                        <button
                                            onClick={() => setShowReviewModal(true)}
                                            className="mt-3 inline-block px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                                        >
                                            Tambahkan Ulasan
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Cancel Order Modal */}
            {showCancelModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Batalkan Pesanan</h3>
                                <p className="text-sm text-gray-500">
                                    Pesanan: {order.order_number} - {order.clientName}
                                </p>
                            </div>
                            <button
                                onClick={closeAllModals}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-4">
                            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100 mb-4">
                                <div className="flex">
                                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0" />
                                    <p className="text-sm text-yellow-700">
                                        Pesanan yang dibatalkan tidak dapat dikembalikan. Mohon pastikan kembali tindakan ini.
                                    </p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Alasan Pembatalan <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={cancelReason}
                                    onChange={(e) => setCancelReason(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    rows="3"
                                    placeholder="Masukkan alasan pembatalan..."
                                    required
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeAllModals}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleCancelOrder}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="h-4 w-4 mr-1" />
                                        Batalkan Pesanan
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Complete Order Modal */}
            {showCompleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Selesaikan Pesanan</h3>
                                <p className="text-sm text-gray-500">
                                    Pesanan: {order.order_number} - {order.clientName}
                                </p>
                            </div>
                            <button
                                onClick={closeAllModals}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                                <div className="flex">
                                    <AlertCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
                                    <div>
                                        <p className="text-sm text-blue-700 mb-1">
                                            Anda akan menandai pesanan ini sebagai selesai.
                                        </p>
                                        <p className="text-sm text-blue-700">
                                            {order.isFullyPaid
                                                ? "Pesanan ini sudah lunas dibayar."
                                                : "Perhatian: Pesanan ini belum lunas, pastikan pembayaran sudah diselesaikan sebelum menyelesaikan pesanan."}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center mb-3">
                                    <DollarSign className="h-5 w-5 text-green-500 mr-2" />
                                    <div className="text-gray-700">
                                        <p className="font-medium">Status Pembayaran</p>
                                        <p className={`text-sm ${order.isFullyPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {order.isFullyPaid ? 'Lunas' : 'Belum Lunas'}
                                        </p>
                                    </div >
                                </div >
                                <div className="flex items-center">
                                    <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                                    <div className="text-gray-700">
                                        <p className="font-medium">Tanggal Acara</p>
                                        <p className="text-sm">
                                            {new Date(order.date).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric"
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div >
                        </div >

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeAllModals}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleCompleteOrder}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle className="h-4 w-4 mr-1" />
                                        Selesaikan Pesanan
                                    </>
                                )}
                            </button>
                        </div>
                    </div >
                </div >
            )}

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Tambah Ulasan</h3>
                                <p className="text-sm text-gray-500">
                                    Pesanan: {order.order_number} - {order.clientName}
                                </p>
                            </div>
                            <button
                                onClick={closeAllModals}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="mb-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rating <span className="text-red-500">*</span>
                                </label>
                                <StarRating rating={rating} onRatingChange={setRating} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Komentar <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={reviewComment}
                                    onChange={(e) => setReviewComment(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                    rows="4"
                                    placeholder="Berikan komentar atas pengalaman klien..."
                                    required
                                ></textarea>
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={closeAllModals}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                onClick={handleSubmitReview}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center"
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Memproses...
                                    </>
                                ) : (
                                    <>
                                        <Star className="h-4 w-4 mr-1" />
                                        Kirim Ulasan
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout >
    );
};

export default OrderDetail;

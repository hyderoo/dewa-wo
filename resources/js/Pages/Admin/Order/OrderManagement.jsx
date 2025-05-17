import React, { useState, useEffect } from "react";
import { Head, router } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import OrderManagementHeader from "./OrderManagementHeader";
import OrderList from "./OrderList";
import Toast from "@/Components/Toast";
import {
    X,
    Check,
    Calendar,
    DollarSign,
    Star,
    AlertCircle,
    CheckCircle,
    XCircle
} from "lucide-react";

const OrderManagement = () => {
    const { orders, pagination, filters, toast } = usePage().props;

    const [showToast, setShowToast] = useState(!!toast);
    const [toastMessage, setToastMessage] = useState(toast || { type: "", message: "" });
    const [activeFilters, setActiveFilters] = useState(filters || {
        status: "all",
        date: "all",
        search: "",
        page: 1
    });
    const [pendingCount, setPendingCount] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);

    // Modal states
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [cancelReason, setCancelReason] = useState("");
    const [rating, setRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Calculate counts for the header component
    useEffect(() => {
        if (orders) {
            const pending = orders.filter(order => order.status === 'pending_payment').length;
            const completed = orders.filter(order => order.status === 'completed').length;
            setPendingCount(pending);
            setCompletedCount(completed);
        }
    }, [orders]);

    useEffect(() => {
        if (toast) {
            setShowToast(true);

            const timer = setTimeout(() => {
                setShowToast(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleFilterChange = (newFilters) => {
        setActiveFilters({
            ...activeFilters,
            ...newFilters,
            // Reset to page 1 when filters change
            page: newFilters.page || 1
        });

        // Convert the active filters to URL query parameters
        router.get(route('admin.orders'), {
            ...activeFilters,
            ...newFilters,
            page: newFilters.page || 1
        }, {
            preserveState: true,
            replace: true
        });
    };

    const handlePageChange = (page) => {
        handleFilterChange({ page });
    };

    const handleCreateOrder = () => {
        router.visit(route('admin.orders.create'));
    };

    // Order Action Handlers
    const openOrderActions = (order) => {
        setSelectedOrder(order);
    };

    const closeAllModals = () => {
        setSelectedOrder(null);
        setShowCancelModal(false);
        setShowCompleteModal(false);
        setShowReviewModal(false);
        setCancelReason("");
        setRating(5);
        setReviewComment("");
    };

    // 1. Cancel Order
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
        router.patch(route('admin.orders.update-status', selectedOrder.id), {
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

    // 2. Complete Order
    const handleCompleteOrder = () => {
        setIsSubmitting(true);
        router.patch(route('admin.orders.update-status', selectedOrder.id), {
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

    // 3. Submit Review
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
        router.post(route('admin.orders.review', selectedOrder.id), {
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

    // Star Rating Component
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

    return (
        <AdminLayout activeMenu="order-management">
            <Head title="Order Management" />

            {showToast && (
                <Toast
                    type={toastMessage.type}
                    message={toastMessage.message}
                    onClose={() => setShowToast(false)}
                />
            )}

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <OrderManagementHeader
                    pendingCount={pendingCount}
                    completedCount={completedCount}
                    onCreateOrder={handleCreateOrder}
                />

                {/* Enhanced Order List with Action Handlers */}
                <OrderList
                    orders={orders}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    filters={activeFilters}
                    onFilterChange={handleFilterChange}
                    onCancelOrder={(order) => {
                        setSelectedOrder(order);
                        setShowCancelModal(true);
                    }}
                    onCompleteOrder={(order) => {
                        setSelectedOrder(order);
                        setShowCompleteModal(true);
                    }}
                    onAddReview={(order) => {
                        setSelectedOrder(order);
                        setShowReviewModal(true);
                    }}
                    onViewDetails={(orderId) => {
                        router.visit(route('admin.orders.show', orderId));
                    }}
                />
            </div>

            {/* Cancel Order Modal */}
            {showCancelModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Batalkan Pesanan</h3>
                                <p className="text-sm text-gray-500">
                                    Pesanan: {selectedOrder.order_number} - {selectedOrder.clientName}
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
            {showCompleteModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Selesaikan Pesanan</h3>
                                <p className="text-sm text-gray-500">
                                    Pesanan: {selectedOrder.order_number} - {selectedOrder.clientName}
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
                                            {selectedOrder.isFullyPaid
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
                                        <p className={`text-sm ${selectedOrder.isFullyPaid ? 'text-green-600' : 'text-yellow-600'}`}>
                                            {selectedOrder.isFullyPaid ? 'Lunas' : 'Belum Lunas'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                                    <div className="text-gray-700">
                                        <p className="font-medium">Tanggal Acara</p>
                                        <p className="text-sm">
                                            {new Date(selectedOrder.date).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric"
                                            })}
                                        </p>
                                    </div>
                                </div>
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
                    </div>
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Tambah Ulasan</h3>
                                <p className="text-sm text-gray-500">
                                    Pesanan: {selectedOrder.order_number} - {selectedOrder.clientName}
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
        </AdminLayout>
    );
};

export default OrderManagement;

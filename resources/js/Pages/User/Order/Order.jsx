import React, { useState, useEffect } from "react";
import { Head, Link, usePage, useForm } from "@inertiajs/react";
import BaseLayout from "@/Layouts/BaseLayout";
import OrderStatusBadge from "./Components/OrderStatusBadge";
import DetailedOrderModal from "./Components/DetailedOrderModal";
import { Calendar, MapPin, Users, DollarSign, CheckCircle, Star, AlertTriangle } from "lucide-react";

// Review Dialog Component
const ReviewDialog = ({ show, onClose, order }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);

    const { data, setData, post, processing, errors } = useForm({
        order_id: order?.id,
        rating: 0,
        comment: "",
    });

    useEffect(() => {
        if (show) {
            setRating(0);
            setData({
                order_id: order?.id,
                rating: 0,
                comment: "",
            });
        }
    }, [show, order]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route("orders.review", order?.id), {
            onSuccess: () => {
                onClose(true);
            },
        });
    };

    const renderStars = () => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`h-8 w-8 cursor-pointer ${i <= (hoverRating || data.rating)
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                        }`}
                    onMouseEnter={() => setHoverRating(i)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => {
                        setRating(i);
                        setData("rating", i);
                    }}
                />
            );
        }
        return stars;
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => onClose(false)}></div>

                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="absolute top-0 right-0 pt-4 pr-4">
                        <button
                            type="button"
                            className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                            onClick={() => onClose(false)}
                        >
                            <span className="sr-only">Close</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                <h3 className="text-xl font-semibold leading-6 text-gray-900">
                                    Berikan Ulasan
                                </h3>
                                <div className="mt-6">
                                    <form onSubmit={handleSubmit}>
                                        <div className="mb-6">
                                            <label className="block text-gray-700 font-medium mb-2">
                                                Berikan Penilaian
                                            </label>
                                            <div className="flex space-x-2 items-center">
                                                {renderStars()}
                                            </div>
                                            {errors.rating && (
                                                <p className="text-red-500 text-sm mt-1">{errors.rating}</p>
                                            )}
                                        </div>

                                        <div className="mb-4">
                                            <label
                                                htmlFor="comment"
                                                className="block text-gray-700 font-medium mb-2"
                                            >
                                                Komentar
                                            </label>
                                            <textarea
                                                id="comment"
                                                rows="4"
                                                value={data.comment}
                                                onChange={(e) => setData("comment", e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder="Bagikan pengalaman Anda bekerja dengan kami..."
                                            ></textarea>
                                            {errors.comment && (
                                                <p className="text-red-500 text-sm mt-1">{errors.comment}</p>
                                            )}
                                        </div>

                                        <div className="mt-6 flex justify-end space-x-2">
                                            <button
                                                type="button"
                                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                                                onClick={() => onClose(false)}
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing || data.rating === 0}
                                                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {processing ? "Mengirim..." : "Kirim Ulasan"}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Confirmation Dialog Component
const ConfirmationDialog = ({ show, onClose, onConfirm, title, message, confirmLabel, isProcessing }) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => onClose()}></div>

                <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                    <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-yellow-100 sm:mx-0 sm:h-10 sm:w-10">
                                <AlertTriangle className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                <h3 className="text-lg font-medium leading-6 text-gray-900">
                                    {title}
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-500">
                                        {message}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                        <button
                            type="button"
                            className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto disabled:opacity-50"
                            onClick={onConfirm}
                            disabled={isProcessing}
                        >
                            {isProcessing ? "Memproses..." : confirmLabel}
                        </button>
                        <button
                            type="button"
                            className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                            onClick={onClose}
                        >
                            Batalkan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Order = () => {
    const { orders, auth, completedOrders, cancelledOrders = [], active = "ongoing" } = usePage().props;
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [activeTab, setActiveTab] = useState(active);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [showReviewDialog, setShowReviewDialog] = useState(false);
    const [showCompleteDialog, setShowCompleteDialog] = useState(false);
    const [orderToReview, setOrderToReview] = useState(null);
    const [orderToComplete, setOrderToComplete] = useState(null);

    const { post, processing } = useForm({});

    // Set initial filtered orders based on active tab
    useEffect(() => {
        if (activeTab === "ongoing") {
            setFilteredOrders(orders || []);
        } else if (activeTab === "completed") {
            setFilteredOrders(completedOrders || []);
        } else {
            setFilteredOrders(cancelledOrders || []);
        }
    }, [activeTab, orders, completedOrders, cancelledOrders]);

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(date);
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

    // Open order detail modal
    const openOrderDetail = (order) => {
        setSelectedOrder(order);
    };

    // Close order detail modal
    const closeOrderDetail = () => {
        setSelectedOrder(null);
    };

    // Handle payment button click
    const handlePayment = (orderId) => {
        window.location.href = route("payment.detail", orderId);
    };

    // Handle order cancellation
    const handleCancelOrder = (orderId) => {
        // Navigate to the cancel order form instead of direct cancellation
        window.location.href = route("orders.cancel.form", orderId);
    };


    // Handle opening the review dialog
    const openReviewDialog = (order) => {
        setOrderToReview(order);
        setShowReviewDialog(true);
    };

    // Handle closing the review dialog
    const closeReviewDialog = (success) => {
        setShowReviewDialog(false);
        if (success) {
            // Reload the page to refresh the data
            window.location.reload();
        }
    };

    // Handle opening the complete order dialog
    const openCompleteDialog = (order) => {
        setOrderToComplete(order);
        setShowCompleteDialog(true);
    };

    // Handle closing the complete order dialog
    const closeCompleteDialog = () => {
        setShowCompleteDialog(false);
    };

    // Handle completing an order
    const handleCompleteOrder = () => {
        post(route("orders.complete", orderToComplete.id), {
            onSuccess: () => {
                setShowCompleteDialog(false);
                // After completing, show the review dialog
                setOrderToReview(orderToComplete);
                setShowReviewDialog(true);
            },
        });
    };

    return (
        <>
            <Head title={activeTab === "ongoing" ? "Pesanan Berlangsung" : (activeTab === "completed" ? "Pesanan Selesai" : "Pesanan Dibatalkan")} />
            <BaseLayout auth={auth}>
                <div className="py-12 bg-gray-50">
                    <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                        <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                            <div className="p-6">
                                {/* Tabs */}
                                <div className="border-b border-gray-200 mb-6">
                                    <nav className="-mb-px flex space-x-8">
                                        <button
                                            onClick={() => setActiveTab("ongoing")}
                                            className={`${activeTab === "ongoing"
                                                ? "border-pink-500 text-pink-600"
                                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                        >
                                            Pesanan Berlangsung
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("completed")}
                                            className={`${activeTab === "completed"
                                                ? "border-pink-500 text-pink-600"
                                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                        >
                                            Pesanan Selesai
                                        </button>
                                        <button
                                            onClick={() => setActiveTab("cancelled")}
                                            className={`${activeTab === "cancelled"
                                                ? "border-pink-500 text-pink-600"
                                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                                        >
                                            Pesanan Dibatalkan
                                        </button>
                                    </nav>
                                </div>
                                <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                                    {activeTab === "ongoing" ? "Pesanan Berlangsung" : (activeTab === "completed" ? "Pesanan Selesai" : "Pesanan Dibatalkan")}
                                </h1>
                                {filteredOrders && filteredOrders.length > 0 ? (
                                    <div className="space-y-6">
                                        {filteredOrders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                                            >
                                                <div className="p-6">
                                                    <div className="flex flex-wrap justify-between items-start">
                                                        <div>
                                                            <h2 className="text-xl font-semibold text-gray-900 mb-1">
                                                                {order.client_name}
                                                            </h2>
                                                            <p className="text-gray-600">
                                                                {order.catalog ? order.catalog.name : "Custom Package"}
                                                            </p>
                                                            <div className="flex items-center mt-2">
                                                                <OrderStatusBadge status={order.status} />
                                                                {order.order_number && (
                                                                    <span className="text-xs text-gray-500 ml-2">
                                                                        Order #{order.order_number}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-right mt-2 md:mt-0">
                                                            <p className="text-lg font-bold text-gray-900">
                                                                {order.formatted_price || formatCurrency(order.price)}
                                                            </p>
                                                            {!order.is_fully_paid && (
                                                                <p className="text-sm text-red-600">
                                                                    Sisa: {formatCurrency(order.remaining_amount)}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-2">
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                                                            <span>{formatDate(order.event_date)}</span>
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                                                            <span>{order.venue || order.event_location || "Lokasi belum ditentukan"}</span>
                                                        </div>
                                                        <div className="flex items-center text-sm text-gray-600">
                                                            <Users className="h-4 w-4 mr-1 text-gray-500" />
                                                            <span>{order.estimated_guests || "-"} tamu</span>
                                                        </div>
                                                    </div>
                                                    <div className="mt-6 flex flex-wrap gap-2 justify-end">
                                                        {activeTab === "ongoing" && (
                                                            <>
                                                                {!order.is_fully_paid && (
                                                                    <button
                                                                        onClick={() => handlePayment(order.id)}
                                                                        className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 text-sm font-medium"
                                                                    >
                                                                        Lakukan Pembayaran
                                                                    </button>
                                                                )}

                                                                {/* Complete Order Button - only show for in_progress and fully paid orders */}
                                                                {order.status === "ongoing" && order.is_fully_paid && (
                                                                    <button
                                                                        onClick={() => openCompleteDialog(order)}
                                                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium flex items-center"
                                                                    >
                                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                                        Selesaikan Pesanan
                                                                    </button>
                                                                )}

                                                                <Link
                                                                    href={route("payment.history", order.id)}
                                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
                                                                >
                                                                    Riwayat Pembayaran
                                                                </Link>
                                                                {order.status === "pending_payment" && (
                                                                    <button
                                                                        onClick={() => handleCancelOrder(order.id)}
                                                                        className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 text-sm font-medium"
                                                                    >
                                                                        Batalkan
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                        {activeTab === "completed" && !order.has_reviewed && (
                                                            <button
                                                                onClick={() => openReviewDialog(order)}
                                                                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 text-sm font-medium flex items-center"
                                                            >
                                                                <Star className="h-4 w-4 mr-1" />
                                                                Berikan Ulasan
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => openOrderDetail(order)}
                                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium"
                                                        >
                                                            Detail Pesanan
                                                        </button>
                                                    </div>
                                                </div>
                                                {/* Payment Progress Bar (only for orders not fully paid and ongoing) */}
                                                {!order.is_fully_paid && activeTab === "ongoing" && (
                                                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                                                        <div className="flex items-center justify-between text-sm mb-1">
                                                            <span className="text-gray-600">
                                                                Pembayaran
                                                            </span>
                                                            <span className="font-medium">
                                                                {order.paid_amount
                                                                    ? `${Math.round((order.paid_amount / order.price) * 100)}%`
                                                                    : "0%"}
                                                            </span>
                                                        </div>
                                                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                            <div
                                                                className="bg-pink-600 h-2.5 rounded-full"
                                                                style={{
                                                                    width: `${order.paid_amount
                                                                        ? Math.min(Math.round((order.paid_amount / order.price) * 100), 100)
                                                                        : 0}%`
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="mx-auto h-12 w-12 text-gray-400">
                                            <svg
                                                className="h-12 w-12"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                />
                                            </svg>
                                        </div>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                                            {activeTab === "ongoing"
                                                ? "Tidak ada pesanan berlangsung"
                                                : "Tidak ada pesanan selesai"}
                                        </h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            {activeTab === "ongoing"
                                                ? "Anda belum memiliki pesanan yang sedang berlangsung."
                                                : "Anda belum memiliki pesanan yang telah selesai."}
                                        </p>
                                        <div className="mt-6">
                                            <Link
                                                href={route("features")}
                                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                            >
                                                Lihat Katalog Layanan
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {/* Order Detail Modal */}
                {selectedOrder && (
                    <DetailedOrderModal
                        order={selectedOrder}
                        onClose={closeOrderDetail}
                        onPayment={() => handlePayment(selectedOrder.id)}
                        onCancel={() => handleCancelOrder(selectedOrder.id)}
                    />
                )}

                {/* Complete Order Confirmation Dialog */}
                <ConfirmationDialog
                    show={showCompleteDialog}
                    onClose={closeCompleteDialog}
                    onConfirm={handleCompleteOrder}
                    title="Selesaikan Pesanan"
                    message="Apakah Anda yakin ingin menyelesaikan pesanan ini? Setelah diselesaikan, Anda akan diminta untuk memberikan ulasan."
                    confirmLabel="Ya, Selesaikan"
                    isProcessing={processing}
                />

                {/* Review Dialog */}
                {orderToReview && (
                    <ReviewDialog
                        show={showReviewDialog}
                        onClose={closeReviewDialog}
                        order={orderToReview}
                    />
                )}
            </BaseLayout>
        </>
    );
};

export default Order;

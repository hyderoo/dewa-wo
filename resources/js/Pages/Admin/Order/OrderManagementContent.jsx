import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import Toast from "@/Components/Toast";
import {
    Search,
    Filter,
    MoreVertical,
    ChevronDown,
    Download,
    Calendar,
    MapPin,
    Star,
    MessageCircle,
    Plus,
    ArrowRight,
    Check,
    AlertTriangle,
    X,
} from "lucide-react";
import { router } from "@inertiajs/react";

const OrderManagementContent = () => {
    const { orders, toast } = usePage().props;

    const [selectedStatus, setSelectedStatus] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ type: "", message: "" });

    const { data, setData, post, processing, errors, reset } = useForm({
        rating: 5,
        comment: "",
    });

    // Check for flash messages
    React.useEffect(() => {
        if (toast) {
            setToastMessage({ type: toast.type, message: toast.message });
            setShowToast(true);

            // Auto-close toast after 5 seconds
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [toast]);

    const getStatusColor = (status) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-800";
            case "ongoing":
                return "bg-blue-100 text-blue-800";
            case "pending_payment":
                return "bg-yellow-100 text-yellow-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getStatusDisplay = (status) => {
        switch (status) {
            case "completed":
                return "Selesai";
            case "ongoing":
                return "Berlangsung";
            case "pending_payment":
                return "Menunggu Pembayaran";
            case "cancelled":
                return "Dibatalkan";
            default:
                return status;
        }
    };

    const handlePaymentClick = (orderId) => {
        router.visit(route('admin.payments.detail', orderId));
    };

    const handleStatusUpdate = (orderId, newStatus) => {
        router.patch(route('admin.orders.update-status', orderId), {
            status: newStatus
        }, {
            onSuccess: () => {
                setSelectedOrder(null);
            }
        });
    };

    const handleSubmitReview = (e) => {
        e.preventDefault();

        post(route('admin.orders.review', selectedOrder.id), {
            onSuccess: () => {
                setShowReviewForm(false);
                setSelectedOrder(null);
                reset();
            }
        });
    };

    const handleCreateOrder = () => {
        router.visit(route('admin.orders.create'));
    };

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
                        <Star className="w-6 h-6 fill-current" />
                    </button>
                ))}
            </div>
        );
    };

    const handleDeleteOrder = (orderId) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus pesanan ini?")) {
            router.delete(route('admin.orders.destroy', orderId), {
                onSuccess: () => {
                    // Will be handled by the toast effect
                },
                onError: () => {
                    setToastMessage({
                        type: "error",
                        message: "Gagal menghapus pesanan. Silakan coba lagi."
                    });
                    setShowToast(true);
                }
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8 text-gray-600">
            {showToast && (
                <Toast
                    type={toastMessage.type}
                    message={toastMessage.message}
                    onClose={() => setShowToast(false)}
                />
            )}

            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                    Manajemen Pesanan
                </h1>
                <p className="text-gray-600">
                    Kelola semua pesanan dalam satu dashboard
                </p>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow mb-6">
                <div className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="w-full md:w-96 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Cari berdasarkan nama client..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <select
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 bg-white"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                        >
                            <option value="all">Semua Status</option>
                            <option value="completed">Selesai</option>
                            <option value="ongoing">Berlangsung</option>
                            <option value="pending_payment">Menunggu Pembayaran</option>
                            <option value="cancelled">Dibatalkan</option>
                        </select>

                        <button
                            onClick={handleCreateOrder}
                            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">Pesanan Baru</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Orders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders && orders.length > 0 ? (
                    orders
                        .filter(
                            (order) =>
                                selectedStatus === "all" || order.status === selectedStatus
                        )
                        .filter(
                            (order) =>
                                order.clientName
                                    .toLowerCase()
                                    .includes(searchTerm.toLowerCase()) ||
                                order.packageName.toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                            >
                                <div className="p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900">
                                                {order.clientName}
                                            </h2>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {order.packageName}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {order.order_number}
                                            </p>
                                        </div>
                                        <span
                                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                                order.status
                                            )}`}
                                        >
                                            {getStatusDisplay(order.status)}
                                        </span>
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        <div className="flex items-center text-gray-600">
                                            <Calendar className="w-5 h-5 mr-2" />
                                            <span>
                                                {new Date(order.date).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <MapPin className="w-5 h-5 mr-2" />
                                            <span>{order.venue}</span>
                                        </div>
                                    </div>

                                    {order.status === "completed" && order.hasReviewed && (
                                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                            <StarRating rating={order.review.rating} readonly />
                                            <p className="text-gray-600 text-sm mt-2">
                                                {order.review.comment}
                                            </p>
                                            <p className="text-gray-400 text-xs mt-2">
                                                Diulas pada:{" "}
                                                {new Date(order.review.date).toLocaleDateString()}
                                            </p>
                                        </div>
                                    )}

                                    <div className="mt-6 space-y-2">
                                        <button
                                            onClick={() => setSelectedOrder(order)}
                                            className="w-full bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 transition-colors duration-300"
                                        >
                                            Lihat Detail
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                ) : (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 bg-white rounded-lg shadow p-8 text-center">
                        <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak ada pesanan ditemukan</h3>
                        <p className="text-gray-500 mb-6">
                            Saat ini tidak ada pesanan yang tersedia. Mulai dengan membuat pesanan baru.
                        </p>
                        <button
                            onClick={handleCreateOrder}
                            className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors inline-flex items-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Buat Pesanan Baru
                        </button>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h2 className="text-2xl font-semibold text-gray-900">
                                        {selectedOrder.clientName}
                                    </h2>
                                    <p className="text-gray-600">{selectedOrder.packageName}</p>
                                    <p className="text-gray-400 text-sm">{selectedOrder.order_number}</p>
                                </div>
                                <button
                                    onClick={() => {
                                        setSelectedOrder(null);
                                        setShowReviewForm(false);
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="h-6 w-6" />
                                </button>
                            </div>

                            <div className="p-3 bg-gray-50 rounded-lg mb-4 flex justify-between items-center">
                                <span
                                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                        selectedOrder.status
                                    )}`}
                                >
                                    {getStatusDisplay(selectedOrder.status)}
                                </span>
                                <span className="font-semibold text-lg text-pink-600">
                                    {selectedOrder.price}
                                </span>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="font-medium text-gray-900">Detail Acara</h3>
                                    <div className="mt-2 space-y-2">
                                        <p className="text-gray-600">
                                            Tanggal:{" "}
                                            {new Date(selectedOrder.date).toLocaleDateString(
                                                "id-ID",
                                                {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                }
                                            )}
                                        </p>
                                        <p className="text-gray-600">
                                            Lokasi: {selectedOrder.venue}
                                        </p>
                                        {selectedOrder.details && (
                                            <>
                                                <p className="text-gray-600">
                                                    Estimasi Tamu: {selectedOrder.details.estimatedGuests}{" "}
                                                    orang
                                                </p>
                                                <div>
                                                    <h3 className="font-medium text-gray-900 mt-4">
                                                        Layanan Termasuk
                                                    </h3>
                                                    <ul className="mt-2 space-y-1">
                                                        {selectedOrder.details.includedServices.map(
                                                            (service, index) => (
                                                                <li
                                                                    key={index}
                                                                    className="flex items-center text-gray-600"
                                                                >
                                                                    <Check className="h-4 w-4 mr-2 text-green-500" />
                                                                    {service}
                                                                </li>
                                                            )
                                                        )}
                                                    </ul>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Review Form */}
                            {selectedOrder.status === "completed" && !selectedOrder.hasReviewed && showReviewForm && (
                                <div className="mt-6 border-t pt-4">
                                    <h3 className="font-medium text-gray-900 mb-3">
                                        Berikan Ulasan untuk Layanan Ini
                                    </h3>
                                    <form onSubmit={handleSubmitReview}>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Rating
                                            </label>
                                            <StarRating
                                                rating={data.rating}
                                                onRatingChange={(value) => setData('rating', value)}
                                            />
                                            {errors.rating && (
                                                <div className="text-red-500 text-sm mt-1">{errors.rating}</div>
                                            )}
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Komentar
                                            </label>
                                            <textarea
                                                value={data.comment}
                                                onChange={(e) => setData('comment', e.target.value)}
                                                rows="3"
                                                className={`w-full px-3 py-2 border ${errors.comment ? 'border-red-500' : 'border-gray-300'
                                                    } rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500`}
                                                placeholder="Berikan komentar atau ulasan tentang layanan yang diberikan..."
                                            ></textarea>
                                            {errors.comment && (
                                                <div className="text-red-500 text-sm mt-1">{errors.comment}</div>
                                            )}
                                        </div>
                                        <div className="flex justify-end space-x-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowReviewForm(false)}
                                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                            >
                                                Batal
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={processing}
                                                className="px-4 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 disabled:opacity-70"
                                            >
                                                {processing ? 'Mengirim...' : 'Kirim Ulasan'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="mt-6 flex flex-wrap justify-end gap-3">
                                {/* Action buttons based on order status */}
                                {selectedOrder.status === "pending_payment" && (
                                    <>
                                        <button
                                            onClick={() => handlePaymentClick(selectedOrder.id)}
                                            className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition-colors duration-300"
                                        >
                                            Lakukan Pembayaran
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(selectedOrder.id, 'cancelled')}
                                            className="px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100"
                                        >
                                            Batalkan
                                        </button>
                                    </>
                                )}

                                {selectedOrder.status === "ongoing" && (
                                    <button
                                        onClick={() => handleStatusUpdate(selectedOrder.id, 'completed')}
                                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                    >
                                        Tandai Selesai
                                    </button>
                                )}

                                {selectedOrder.status === "completed" && !selectedOrder.hasReviewed && !showReviewForm && (
                                    <button
                                        onClick={() => setShowReviewForm(true)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                    >
                                        Berikan Ulasan
                                    </button>
                                )}

                                {/* Edit button for any status */}
                                <button
                                    onClick={() => router.visit(route('admin.orders.edit', selectedOrder.id))}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                                >
                                    Edit
                                </button>

                                {/* Delete button for any status */}
                                <button
                                    onClick={() => {
                                        handleDeleteOrder(selectedOrder.id);
                                        setSelectedOrder(null);
                                    }}
                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100"
                                >
                                    Hapus
                                </button>

                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="px-4 py-2 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100"
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagementContent;

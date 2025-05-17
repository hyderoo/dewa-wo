// DetailedOrderModal.jsx
import React from "react";
import { Link } from "@inertiajs/react";
import OrderStatusBadge from "./OrderStatusBadge";
import { CheckCircle, Star } from "lucide-react";

const DetailedOrderModal = ({ order, onClose, onPayment, onCancel }) => {
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

    // Format currency for display
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Check if order is completed
    const isCompleted = order.status === "completed";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900">
                                {order.client_name}
                            </h2>
                            <p className="text-gray-600">
                                {order.catalog ? order.catalog.name : "Custom Package"}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <svg
                                className="h-6 w-6"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* Order Information Section */}
                        <div>
                            <h3 className="font-medium text-gray-900">Informasi Pesanan</h3>
                            <div className="bg-gray-50 p-4 rounded-lg mt-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-500 text-sm">Nomor Pesanan</p>
                                        <p className="font-medium">{order.order_number || "-"}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Status</p>
                                        <OrderStatusBadge status={order.status} />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Tanggal Dibuat</p>
                                        <p className="font-medium">{formatDate(order.created_at)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Tanggal Acara</p>
                                        <p className="font-medium">{formatDate(order.event_date)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Event Details Section */}
                        <div>
                            <h3 className="font-medium text-gray-900">Detail Acara</h3>
                            <div className="mt-2 space-y-2">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-gray-500 text-sm">Lokasi</p>
                                            <p className="font-medium">{order.venue}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm">Estimasi Tamu</p>
                                            <p className="font-medium">{order.estimated_guests} orang</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Payment Details Section */}
                        <div>
                            <h3 className="font-medium text-gray-900">Informasi Pembayaran</h3>
                            <div className="bg-gray-50 p-4 rounded-lg mt-2">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-gray-500 text-sm">Total Harga</p>
                                        <p className="font-medium">
                                            {order.formatted_price || formatCurrency(order.price)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-sm">Status Pembayaran</p>
                                        <p className="font-medium">
                                            {order.is_fully_paid ? (
                                                <span className="text-green-600 flex items-center">
                                                    <CheckCircle className="h-4 w-4 mr-1" /> Lunas
                                                </span>
                                            ) : (
                                                "Belum Lunas"
                                            )}
                                        </p>
                                    </div>

                                    {order.down_payment_amount && (
                                        <div>
                                            <p className="text-gray-500 text-sm">Uang Muka</p>
                                            <p className="font-medium">
                                                {formatCurrency(order.down_payment_amount)}
                                            </p>
                                        </div>
                                    )}

                                    {order.paid_amount !== undefined && (
                                        <div>
                                            <p className="text-gray-500 text-sm">Sudah Dibayar</p>
                                            <p className="font-medium">
                                                {formatCurrency(order.paid_amount)}
                                            </p>
                                        </div>
                                    )}

                                    {order.remaining_amount !== undefined && !order.is_fully_paid && (
                                        <div>
                                            <p className="text-gray-500 text-sm">Sisa Pembayaran</p>
                                            <p className="font-medium">
                                                {formatCurrency(order.remaining_amount)}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Review Section (for completed orders) */}
                        {isCompleted && order.review && (
                            <div>
                                <h3 className="font-medium text-gray-900">Ulasan</h3>
                                <div className="bg-gray-50 p-4 rounded-lg mt-2">
                                    <div>
                                        <div className="flex items-center mb-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    className={`h-5 w-5 ${star <= order.review.rating
                                                        ? "text-yellow-400 fill-yellow-400"
                                                        : "text-gray-300"
                                                        }`}
                                                />
                                            ))}
                                            <span className="ml-2 text-sm text-gray-600">
                                                ({order.review.rating}/5)
                                            </span>
                                        </div>
                                        <p className="text-gray-700">{order.review.comment}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Included Services Section */}
                        <div>
                            <h3 className="font-medium text-gray-900">Layanan Termasuk</h3>
                            <ul className="mt-2 space-y-1 bg-gray-50 p-4 rounded-lg">
                                {/* First check order details */}
                                {order.details && order.details.length > 0 ? (
                                    order.details.map((detail, index) => (
                                        <li key={index} className="flex items-start text-gray-600">
                                            <svg
                                                className="h-5 w-5 mr-2 text-green-500 flex-shrink-0 mt-0.5"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth="2"
                                                    d="M5 13l4 4L19 7"
                                                />
                                            </svg>
                                            <div>
                                                <span className="font-medium">{detail.service_name}</span>
                                                {detail.description && (
                                                    <p className="text-sm text-gray-500">{detail.description}</p>
                                                )}
                                            </div>
                                        </li>
                                    ))
                                ) :
                                    /* Then check catalog features */
                                    order.catalog && order.catalog.features && order.catalog.features.length > 0 ? (
                                        order.catalog.features.map((feature, index) => (
                                            <li key={index} className="flex items-center text-gray-600">
                                                <svg
                                                    className="h-5 w-5 mr-2 text-green-500"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                {feature}
                                            </li>
                                        ))
                                    ) : (
                                        <li className="text-gray-500 italic">
                                            Tidak ada layanan termasuk.
                                        </li>
                                    )}
                            </ul>
                        </div>

                        {/* Custom Features Section */}
                        {order.custom_features && order.custom_features.length > 0 && (
                            <div>
                                <h3 className="font-medium text-gray-900">Fitur Tambahan (Custom)</h3>
                                <ul className="mt-2 space-y-2 bg-gray-50 p-4 rounded-lg">
                                    {order.custom_features.map((feature, index) => (
                                        <li
                                            key={index}
                                            className="flex justify-between items-start text-gray-600 border-b border-gray-200 last:border-0 pb-2 last:pb-0"
                                        >
                                            <div className="flex items-start flex-1">
                                                <svg
                                                    className="h-5 w-5 mr-2 text-pink-500 flex-shrink-0 mt-0.5"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                <div>
                                                    <span className="font-medium">{feature.feature_name}</span>
                                                    {feature.description && (
                                                        <p className="text-sm text-gray-500">{feature.description}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="font-medium text-pink-600 ml-4">
                                                {formatCurrency(feature.price)}
                                            </span>
                                        </li>
                                    ))}
                                    <li className="flex justify-between items-center pt-2 border-t border-gray-300">
                                        <span className="font-semibold text-gray-900">Total Fitur Tambahan:</span>
                                        <span className="font-semibold text-pink-600">
                                            {formatCurrency(
                                                order.custom_features.reduce((total, feature) => total + parseFloat(feature.price), 0)
                                            )}
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                        {order.status === "pending_payment" && (
                            <>
                                <button
                                    onClick={onPayment}
                                    className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors duration-300"
                                >
                                    Lakukan Pembayaran
                                </button>
                                <button
                                    onClick={onCancel}
                                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors duration-300"
                                >
                                    Batalkan Pesanan
                                </button>
                            </>
                        )}

                        {isCompleted && !order.has_reviewed && (
                            <Link
                                href={route("reviews.show", order.id)}
                                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors duration-300"
                            >
                                Berikan Ulasan
                            </Link>
                        )}

                        <button
                            onClick={onClose}
                            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition-colors duration-300"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DetailedOrderModal;

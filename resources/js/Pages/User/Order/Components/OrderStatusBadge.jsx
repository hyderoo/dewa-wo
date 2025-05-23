import React from "react";

const OrderStatusBadge = ({ status }) => {
    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case "ongoing":
                return "bg-green-100 text-green-800";
            case "pending_payment":
                return "bg-yellow-100 text-yellow-800";
            case "completed":
                return "bg-blue-100 text-blue-800";
            case "cancelled":
                return "bg-red-100 text-red-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    // Format status for display
    const formatStatus = (status) => {
        switch (status) {
            case "ongoing":
                return "Berlangsung";
            case "pending_payment":
                return "Menunggu Pembayaran";
            case "completed":
                return "Selesai";
            case "cancelled":
                return "Dibatalkan";
            case "pending_confirmation":
                return "Menunggu Konfirmasi";
            case "confirmed":
                return "Terkonfirmasi";
            case "in_preparation":
                return "Dalam Persiapan";
            case "ready":
                return "Siap";
            case "delivered":
                return "Terkirim";
            default:
                return status;
        }
    };

    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                status
            )}`}
        >
            {formatStatus(status)}
        </span>
    );
};

export default OrderStatusBadge;

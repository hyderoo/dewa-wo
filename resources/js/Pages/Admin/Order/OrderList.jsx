import React, { useState } from "react";
import {
    Search,
    Calendar,
    MapPin,
    ChevronDown,
    ChevronUp,
    ChevronLeft,
    ChevronRight,
    Filter,
    X,
    CheckCircle,
    XCircle,
    Star,
    Edit,
    Eye
} from "lucide-react";
import { Link, router } from "@inertiajs/react";

const OrderList = ({
    orders,
    pagination,
    onPageChange,
    filters,
    onFilterChange,
    onCancelOrder,
    onCompleteOrder,
    onAddReview,
    onViewDetails
}) => {
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [activeFilters, setActiveFilters] = useState({
        status: filters?.status || "all",
        date: filters?.date || "all",
        search: filters?.search || "",
    });
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const handleSearchChange = (e) => {
        setActiveFilters({
            ...activeFilters,
            search: e.target.value,
        });
    };

    const handleFilterChange = (key, value) => {
        const newFilters = {
            ...activeFilters,
            [key]: value,
        };
        setActiveFilters(newFilters);

        // Call parent filter handler
        if (onFilterChange) {
            onFilterChange(newFilters);
        }
    };

    const handleApplyFilters = () => {
        if (onFilterChange) {
            onFilterChange(activeFilters);
        }
        setIsFilterOpen(false);
    };

    const handleResetFilters = () => {
        const resetFilters = {
            status: "all",
            date: "all",
            search: "",
        };
        setActiveFilters(resetFilters);

        // Call parent filter handler
        if (onFilterChange) {
            onFilterChange(resetFilters);
        }
        setIsFilterOpen(false);
    };

    const toggleOrder = (orderId) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(orderId);
        }
    };

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

    // Star Rating Component for reviews
    const StarRating = ({ rating, size = 'small' }) => {
        const starSize = size === 'small' ? 'w-3 h-3' : 'w-5 h-5';

        return (
            <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        className={`${starSize} ${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                    />
                ))}
            </div>
        );
    };

    // Count active filters
    const activeFilterCount = Object.keys(activeFilters).reduce((count, key) => {
        if (key === 'search') {
            return activeFilters[key] ? count + 1 : count;
        }
        return activeFilters[key] !== 'all' ? count + 1 : count;
    }, 0);

    return (
        <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Filters & Search */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="w-full md:w-auto relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Cari pesanan..."
                            value={activeFilters.search}
                            onChange={handleSearchChange}
                            className="w-full md:w-60 lg:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                        />
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                            className={`px-4 py-2 flex items-center space-x-1 rounded-lg border ${isFilterOpen ? 'bg-pink-50 border-pink-300 text-pink-700' : 'border-gray-300 hover:bg-gray-50'}`}
                        >
                            <Filter className="w-4 h-4" />
                            <span>Filter</span>
                            {activeFilterCount > 0 && (
                                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-pink-500 rounded-full">
                                    {activeFilterCount}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={handleApplyFilters}
                            className="px-4 py-2 rounded-lg bg-pink-600 text-white hover:bg-pink-700"
                        >
                            Terapkan
                        </button>
                    </div>
                </div>

                {isFilterOpen && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
                        <div className="flex justify-between items-center mb-3">
                            <h3 className="font-medium text-gray-700">Filter Lanjutan</h3>
                            <button onClick={() => setIsFilterOpen(false)} className="text-gray-400 hover:text-gray-500">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select
                                    value={activeFilters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                >
                                    <option value="all">Semua Status</option>
                                    <option value="pending_payment">Menunggu Pembayaran</option>
                                    <option value="ongoing">Berlangsung</option>
                                    <option value="completed">Selesai</option>
                                    <option value="cancelled">Dibatalkan</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Acara</label>
                                <select
                                    value={activeFilters.date}
                                    onChange={(e) => handleFilterChange('date', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                >
                                    <option value="all">Semua Waktu</option>
                                    <option value="past">Masa Lalu</option>
                                    <option value="today">Hari Ini</option>
                                    <option value="this_week">Minggu Ini</option>
                                    <option value="this_month">Bulan Ini</option>
                                    <option value="next_month">Bulan Depan</option>
                                    <option value="future">Masa Depan</option>
                                </select>
                            </div>

                            <div className="flex items-end">
                                <button
                                    onClick={handleResetFilters}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Reset Filter
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Orders List */}
            {orders && orders.length > 0 ? (
                <div className="divide-y divide-gray-200">
                    {orders.map((order) => (
                        <div key={order.id} className="divide-y divide-gray-100">
                            <div
                                className={`p-4 ${expandedOrder === order.id ? 'bg-gray-50' : 'hover:bg-gray-50'} cursor-pointer`}
                                onClick={() => toggleOrder(order.id)}
                            >
                                <div className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-medium text-gray-900">
                                                    {order.clientName}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    {order.packageName}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {order.order_number}
                                                </p>
                                            </div>
                                            <div className="hidden sm:block">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeClass(order.status)}`}>
                                                    {getStatusDisplay(order.status)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="mt-3 grid grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-xs text-gray-500">Tanggal Acara</p>
                                                <p className="font-medium flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                                                    {new Date(order.date).toLocaleDateString("id-ID", {
                                                        day: "numeric",
                                                        month: "long",
                                                        year: "numeric",
                                                    })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-gray-500">Lokasi</p>
                                                <p className="font-medium flex items-center">
                                                    <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                                    {order.venue}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Payment Progress for all orders */}
                                        <div className="mt-3">
                                            <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                                                <span>Pembayaran {order.paymentPercentage}%</span>
                                                <span>{order.paidAmount} / {order.price}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-pink-500 h-2 rounded-full"
                                                    style={{ width: `${order.paymentPercentage}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Show discount if applicable */}
                                        {order.hasDiscount && (
                                            <div className="mt-2">
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-pink-100 text-pink-800">
                                                    Diskon {order.formattedDiscountPercent}
                                                </span>
                                                <span className="ml-2 text-xs text-gray-500 line-through">
                                                    {order.formattedOriginalPrice}
                                                </span>
                                            </div>
                                        )}

                                        {/* Show review if available */}
                                        {order.hasReviewed && (
                                            <div className="mt-2 bg-yellow-50 p-1.5 rounded-md inline-flex items-center">
                                                <StarRating rating={order.review.rating} />
                                                <span className="ml-1 text-xs text-gray-600">({order.review.rating}/5)</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="ml-4">
                                        {expandedOrder === order.id ?
                                            <ChevronUp className="h-5 w-5 text-gray-400" /> :
                                            <ChevronDown className="h-5 w-5 text-gray-400" />
                                        }
                                    </div>
                                </div>
                            </div>

                            {expandedOrder === order.id && (
                                <div className="px-4 py-5 bg-gray-50 space-y-4">
                                    {/* If order has a review, show it */}
                                    {order.hasReviewed && (
                                        <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                                            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
                                                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                                                Ulasan Klien
                                            </h4>
                                            <div className="flex items-center mb-2">
                                                <StarRating rating={order.review.rating} size="medium" />
                                                <span className="ml-2 text-sm text-gray-600">({order.review.rating}/5)</span>
                                            </div>
                                            <p className="text-gray-700 text-sm italic">"{order.review.comment}"</p>
                                            <p className="text-xs text-gray-500 mt-2">
                                                Diulas pada: {new Date(order.review.date).toLocaleDateString("id-ID", {
                                                    day: "numeric",
                                                    month: "long",
                                                    year: "numeric",
                                                })}
                                            </p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Detail Pesanan</h4>
                                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Total Harga</p>
                                                        <p className="font-semibold text-lg text-pink-600">{order.price}</p>
                                                    </div>
                                                    {order.hasDiscount && (
                                                        <div>
                                                            <p className="text-sm text-gray-500">Diskon</p>
                                                            <p className="font-medium text-green-600">{order.formattedDiscountAmount}</p>
                                                            <p className="text-xs text-gray-500">{order.discountReason}</p>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-sm text-gray-500">Tamu</p>
                                                        <p className="font-medium">{order.details.estimatedGuests} orang</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Status Pembayaran</p>
                                                        <p className="font-medium">{order.isFullyPaid ? 'Lunas' : 'Belum Lunas'}</p>
                                                    </div>
                                                </div>

                                                {order.details.includedServices && order.details.includedServices.length > 0 && (
                                                    <div className="mt-4">
                                                        <p className="text-sm font-medium text-gray-700 mb-2">Layanan Termasuk:</p>
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                            {order.details.includedServices.map((service, index) => (
                                                                <div key={index} className="flex items-center text-sm">
                                                                    <span className="mr-2 text-green-500">✓</span>
                                                                    {service}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-2">Aksi</h4>
                                            <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
                                                {/* View details button */}
                                                <button
                                                    onClick={() => onViewDetails(order.id)}
                                                    className="w-full py-2 px-4 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-center transition-colors flex items-center justify-center"
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    Lihat Detail Lengkap
                                                </button>

                                                {/* Edit button */}
                                                <Link
                                                    href={route('admin.orders.edit', order.id)}
                                                    className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-center transition-colors flex items-center justify-center"
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit Pesanan
                                                </Link>

                                                {/* Complete button - Show only for ongoing orders */}
                                                {order.status === 'ongoing' && order.isFullyPaid && (
                                                    <button
                                                        onClick={() => onCompleteOrder(order)}
                                                        className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-center transition-colors flex items-center justify-center"
                                                    >
                                                        <CheckCircle className="w-4 h-4 mr-2" />
                                                        Selesaikan Pesanan
                                                    </button>
                                                )}

                                                {/* Review button - Show only for completed orders without reviews */}
                                                {order.status === 'completed' && !order.hasReviewed && (
                                                    <button
                                                        onClick={() => onAddReview(order)}
                                                        className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-center transition-colors flex items-center justify-center"
                                                    >
                                                        <Star className="w-4 h-4 mr-2" />
                                                        Tambah Ulasan
                                                    </button>
                                                )}

                                                {/* Payment link - Show for non-fully paid orders that are not cancelled */}
                                                {!order.isFullyPaid && order.status !== 'cancelled' && (
                                                    <Link
                                                        href={route('admin.payments.detail', order.id)}
                                                        className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-center transition-colors flex items-center justify-center"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9.75m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75m8.25-3.75h1.5c.414 0 .75.336.75.75s-.336.75-.75.75h-1.5m-1.5-12A2.25 2.25 0 0 0 18 7.5v10.5A2.25 2.25 0 0 0 20.25 20h1.5A2.25 2.25 0 0 0 24 17.75V7.5A2.25 2.25 0 0 0 21.75 5.25h-1.5Z" />
                                                        </svg>
                                                        Proses Pembayaran
                                                    </Link>
                                                )}

                                                {/* Payment history link */}
                                                <Link
                                                    href={route('admin.payments.history', order.id)}
                                                    className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-center transition-colors flex items-center justify-center"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-2">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                                    </svg>
                                                    Riwayat Pembayaran
                                                </Link>

                                                {/* Cancel button - Show only for pending or ongoing orders */}
                                                {(order.status === 'pending_payment' || order.status === 'ongoing') && (
                                                    <button
                                                        onClick={() => onCancelOrder(order)}
                                                        className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-center transition-colors flex items-center justify-center"
                                                    >
                                                        <XCircle className="w-4 h-4 mr-2" />
                                                        Batalkan Pesanan
                                                    </button>
                                                )}
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
                    <p className="text-gray-500">Tidak ada pesanan ditemukan.</p>
                </div>
            )}

            {/* Pagination */}
            {pagination && (
                <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => onPageChange(pagination.current_page - 1)}
                            disabled={!pagination.prev_page_url}
                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${!pagination.prev_page_url ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => onPageChange(pagination.current_page + 1)}
                            disabled={!pagination.next_page_url}
                            className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${!pagination.next_page_url ? 'bg-gray-100 text-gray-400 cursor-default' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                            Next
                        </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing <span className="font-medium">{pagination.from}</span> to <span className="font-medium">{pagination.to}</span> of <span className="font-medium">{pagination.total}</span> results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                                <button
                                    onClick={() => onPageChange(pagination.current_page - 1)}
                                    disabled={!pagination.prev_page_url}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${!pagination.prev_page_url ? 'text-gray-300 cursor-default' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <span className="sr-only">Previous</span>
                                    <ChevronLeft className="h-5 w-5" />
                                </button>

                                {[...Array(pagination.last_page)].map((_, i) => {
                                    const pageNum = i + 1;
                                    const isActive = pageNum === pagination.current_page;

                                    // Only show a few pages around the current page
                                    if (
                                        pageNum <= 2 ||
                                        pageNum >= pagination.last_page - 1 ||
                                        (pageNum >= pagination.current_page - 1 && pageNum <= pagination.current_page + 1)
                                    ) {
                                        return (
                                            <button
                                                key={pageNum}
                                                onClick={() => onPageChange(pageNum)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${isActive
                                                    ? 'z-10 bg-pink-50 border-pink-500 text-pink-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    } else if (
                                        (pageNum === 3 && pagination.current_page > 4) ||
                                        (pageNum === pagination.last_page - 2 && pagination.current_page < pagination.last_page - 3)
                                    ) {
                                        return (
                                            <span
                                                key={pageNum}
                                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                                            >
                                                ...
                                            </span>
                                        );
                                    } else {
                                        return null;
                                    }
                                })}

                                <button
                                    onClick={() => onPageChange(pagination.current_page + 1)}
                                    disabled={!pagination.next_page_url}
                                    className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${!pagination.next_page_url ? 'text-gray-300 cursor-default' : 'text-gray-500 hover:bg-gray-50'}`}
                                >
                                    <span className="sr-only">Next</span>
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderList;

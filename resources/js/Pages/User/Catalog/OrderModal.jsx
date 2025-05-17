import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import axios from "axios";
import { Calendar, AlertCircle, Loader } from "lucide-react";
import DatePickerDialog from "./DatePickerDialog";

const OrderModal = ({ service, onClose }) => {
    // State for form data
    const [formData, setFormData] = useState({
        client_name: "",
        event_date: "",
        venue: "",
        venue_address: "",
        estimated_guests: "",
        email: "",
        phone: "",
        alt_phone: "",
        price: 0,
        original_price: 0,
        discount_amount: null,
        discount_percent: null,
        discount_reason: ""
    });

    // State for form errors
    const [errors, setErrors] = useState({});

    // State for booked dates
    const [bookedDates, setBookedDates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [dateCheckLoading, setDateCheckLoading] = useState(false);
    const [dateError, setDateError] = useState("");

    // State for date picker dialog
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    // State for loading
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch booked dates when component mounts
    useEffect(() => {
        const fetchBookedDates = async () => {
            setLoading(true);
            try {
                const response = await axios.get(route('api.booked-dates'));
                setBookedDates(response.data.bookedDates);
            } catch (err) {
                console.error("Error fetching booked dates:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBookedDates();
    }, []);

    // Set initial price based on service when component loads
    useEffect(() => {
        if (service && service.price) {
            let basePrice = 0;

            // If price is an array, use the first value (minimum price)
            if (Array.isArray(service.price) && service.price.length > 0) {
                basePrice = service.price[0];
            } else if (typeof service.price === 'number') {
                basePrice = service.price;
            }

            setFormData(prev => ({
                ...prev,
                price: basePrice,
                original_price: basePrice
            }));
        }
    }, [service]);

    // Helper function to format price from array to string
    const formatPriceRange = (priceArray) => {
        if (!priceArray || !Array.isArray(priceArray) || priceArray.length < 2) {
            return 'Harga tidak tersedia';
        }
        return `Rp ${priceArray[0].toLocaleString()} - Rp ${priceArray[1].toLocaleString()}`;
    };

    // Format number to Indonesian Rupiah
    const formatRupiah = (number) => {
        if (!number) return "";
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number);
    };

    // Handle form input changes
    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handle date selection from date picker
    const handleDateSelect = (date) => {
        // Clear any previous date errors
        setDateError("");
        setDateCheckLoading(true);

        // Double-check with the server for the most up-to-date information
        axios.get(route('api.check-date-availability', { date: date }))
            .then(response => {
                if (!response.data.available) {
                    setDateError("Maaf, tanggal ini sudah dipesan. Silakan pilih tanggal lain.");
                }

                // Set the date regardless - we'll show error if needed
                setFormData({
                    ...formData,
                    event_date: date
                });
            })
            .catch(error => {
                console.error("Error checking date availability:", error);
                setDateError("Terjadi kesalahan saat memeriksa ketersediaan. Silakan coba lagi.");
            })
            .finally(() => {
                setDateCheckLoading(false);
            });
    };

    // Open date picker dialog
    const openDatePicker = (e) => {
        e.preventDefault(); // Prevent default form submission
        setIsDatePickerOpen(true);
    };

    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate form before submission
        if (!formData.event_date) {
            setDateError("Tanggal pernikahan harus diisi.");
            return;
        }

        if (dateError) {
            return;
        }

        setIsSubmitting(true);

        // Check date availability one last time before submitting
        axios.get(route('api.check-date-availability', { date: formData.event_date }))
            .then(response => {
                if (!response.data.available) {
                    setDateError("Maaf, tanggal ini baru saja dipesan. Silakan pilih tanggal lain.");
                    setIsSubmitting(false);
                    return;
                }

                // Format data for the backend
                const orderData = {
                    client_name: formData.client_name,
                    catalog_id: service.id,
                    event_date: formData.event_date,
                    venue: formData.venue + (formData.venue_address ? ` - ${formData.venue_address}` : ''),
                    estimated_guests: formData.estimated_guests,
                    email: formData.email,
                    phone: formData.phone,
                    alt_phone: formData.alt_phone || null,
                    price: formData.price,
                    original_price: formData.original_price
                };

                // Submit form using Inertia
                router.post(route('orders.store'), orderData, {
                    onSuccess: () => {
                        onClose();
                        // Redirect will be handled by the controller response (to payment details)
                    },
                    onError: (errors) => {
                        setErrors(errors);
                        setIsSubmitting(false);
                    }
                });
            })
            .catch(error => {
                console.error("Error checking date availability:", error);
                setIsSubmitting(false);
            });
    };

    // Format date for display
    const formatDisplayDate = (dateString) => {
        if (!dateString) return "";

        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    // Check if the service has reviews
    const hasReviews = service.reviews && Array.isArray(service.reviews) && service.reviews.length > 0;

    return (
        <div className="fixed inset-0 bg-black text-gray-800 bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-gray-200 rounded-full p-2 z-10 hover:bg-gray-300 transition"
                >
                    <svg
                        className="w-6 h-6 text-gray-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>

                {/* Modal Content */}
                <div className="flex flex-col md:flex-row overflow-y-auto max-h-[85vh]">
                    {/* Left Side - Package Information */}
                    <div className="w-full md:w-1/2 bg-pink-50 p-6 md:p-8 overflow-y-auto">
                        <img
                            src={service.image}
                            alt={service.name}
                            className="w-full h-48 md:h-64 object-cover rounded-lg mb-4 md:mb-6"
                        />
                        <h2 className="text-xl md:text-2xl font-semibold text-black mb-2 md:mb-4">
                            {service.name}
                        </h2>
                        <p className="text-gray-600 mb-2 md:mb-4 text-sm md:text-base">
                            {service.description}
                        </p>
                        {/* <div className="font-bold text-pink-600 text-lg md:text-xl mb-2 md:mb-4">
                            {service.formatted_price || formatPriceRange(service.price)}
                        </div> */}
                        <ul className="space-y-1 md:space-y-2 text-gray-700 text-sm md:text-base mb-6">
                            {service.features && Array.isArray(service.features) && service.features.map((feature, index) => (
                                <li key={index} className="flex items-center">
                                    <svg
                                        className="w-4 h-4 md:w-5 md:h-5 text-pink-500 mr-2"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    {feature}
                                </li>
                            ))}
                        </ul>

                        {/* Reviews Section - Only show if there are reviews */}
                        {hasReviews && (
                            <div className="border-t border-gray-200 pt-6">
                                <h3 className="text-lg font-semibold mb-4">
                                    Ulasan Pelanggan
                                </h3>

                                {/* Overall Rating */}
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex items-center">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <svg
                                                    key={star}
                                                    className={`w-5 h-5 ${star <= (service.rating || 5)
                                                        ? "text-yellow-400"
                                                        : "text-gray-300"
                                                        }`}
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-lg font-semibold">
                                            {service.rating || 5}/5
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            ({service.reviews.length} ulasan)
                                        </span>
                                    </div>
                                </div>

                                {/* Individual Reviews */}
                                <div className="space-y-4">
                                    {service.reviews.map((review, index) => (
                                        <div
                                            key={index}
                                            className="border-b border-gray-200 pb-4"
                                        >
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-medium">{review.name}</span>
                                                <span className="text-sm text-gray-500">
                                                    {review.date}
                                                </span>
                                            </div>
                                            <div className="flex items-center mb-2">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <svg
                                                        key={star}
                                                        className={`w-4 h-4 ${star <= review.rating
                                                            ? "text-yellow-400"
                                                            : "text-gray-300"
                                                            }`}
                                                        fill="currentColor"
                                                        viewBox="0 0 20 20"
                                                    >
                                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                    </svg>
                                                ))}
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {review.comment}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side - Order Form */}
                    <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto">
                        <h3 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-center">
                            Form Pemesanan
                        </h3>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="flex flex-col items-center">
                                    <Loader className="h-8 w-8 text-pink-500 animate-spin" />
                                    <p className="mt-2 text-gray-500">Memuat data ketersediaan...</p>
                                </div>
                            </div>
                        ) : (
                            <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit}>
                                {/* Client Information */}
                                <div className="border-b pb-4 mb-4">
                                    <h4 className="text-lg font-semibold mb-3">
                                        Informasi Klien
                                    </h4>
                                    <div>
                                        <label className="block text-gray-700 mb-1 text-sm">
                                            Nama Klien (Pasangan) <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            name="client_name"
                                            value={formData.client_name}
                                            onChange={handleChange}
                                            placeholder="Contoh: Budi & Ani"
                                            required
                                            className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                        />
                                        {errors.client_name && (
                                            <p className="text-red-500 text-xs mt-1">{errors.client_name}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Event Information */}
                                <div className="border-b pb-4 mb-4">
                                    <h4 className="text-lg font-semibold mb-3">
                                        Informasi Acara
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-gray-700 mb-1 text-sm">
                                                Tanggal Pernikahan <span className="text-red-500">*</span>
                                            </label>

                                            {/* Date Picker Button */}
                                            <button
                                                type="button"
                                                onClick={openDatePicker}
                                                className={`
                                                    w-full px-3 py-2 border rounded-md text-sm
                                                    focus:outline-none focus:ring-2 text-left
                                                    flex items-center justify-between relative
                                                    ${dateError ? 'border-red-300 focus:ring-red-500' : 'focus:ring-pink-500'}
                                                    ${!formData.event_date ? 'text-gray-500' : 'text-gray-900'}
                                                `}
                                            >
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                                    <span>
                                                        {formData.event_date
                                                            ? formatDisplayDate(formData.event_date)
                                                            : "Pilih tanggal pernikahan"}
                                                    </span>
                                                </div>
                                                <svg
                                                    className="w-5 h-5 text-gray-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M8 9l4-4 4 4m0 6l-4 4-4-4"
                                                    />
                                                </svg>
                                                {dateCheckLoading && (
                                                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                        <Loader className="h-4 w-4 text-gray-400 animate-spin" />
                                                    </div>
                                                )}
                                            </button>

                                            {/* Hidden input to store the actual value */}
                                            <input
                                                type="hidden"
                                                name="event_date"
                                                value={formData.event_date || ""}
                                                required
                                            />

                                            {dateError && (
                                                <div className="mt-1 flex items-center text-red-500 text-xs">
                                                    <AlertCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                                                    <span>{dateError}</span>
                                                </div>
                                            )}
                                            {errors.event_date && !dateError && (
                                                <p className="text-red-500 text-xs mt-1">{errors.event_date}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 mb-1 text-sm">
                                                Estimasi Jumlah Tamu <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                name="estimated_guests"
                                                value={formData.estimated_guests}
                                                onChange={handleChange}
                                                placeholder="Masukkan perkiraan jumlah tamu"
                                                required
                                                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            />
                                            {errors.estimated_guests && (
                                                <p className="text-red-500 text-xs mt-1">{errors.estimated_guests}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 mb-1 text-sm">
                                                Lokasi Acara 
                                            </label>
                                            <input
                                                type="text"
                                                name="venue"
                                                value={formData.venue}
                                                onChange={handleChange}
                                                placeholder="Nama gedung/tempat acara"
                                                // required
                                                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 mb-2"
                                            />
                                            {errors.venue && (
                                                <p className="text-red-500 text-xs mt-1">{errors.venue}</p>
                                            )}
                                            <textarea
                                                name="venue_address"
                                                value={formData.venue_address}
                                                onChange={handleChange}
                                                placeholder="Alamat lengkap lokasi"
                                                //required
                                                rows={2}
                                                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="border-b pb-4 mb-4">
                                    <h4 className="text-lg font-semibold mb-3">
                                        Informasi Kontak
                                    </h4>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-gray-700 mb-1 text-sm">
                                                Email <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            />
                                            {errors.email && (
                                                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 mb-1 text-sm">
                                                Nomor WhatsApp <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                required
                                                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            />
                                            {errors.phone && (
                                                <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-gray-700 mb-1 text-sm">
                                                Nomor Telepon Alternatif <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="tel"
                                                name="alt_phone"
                                                value={formData.alt_phone}
                                                onChange={handleChange}
                                                className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Price Information */}
                                <div className="border-b pb-4 mb-4">
                                    <h4 className="text-lg font-semibold mb-3">
                                        Informasi Harga
                                    </h4>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-medium text-gray-600">Harga Paket:</span>
                                            <span className="font-semibold text-pink-600">
                                                {formatRupiah(formData.price)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Harga ini merupakan estimasi awal. Setelah pemesanan, tim kami akan
                                            menghubungi Anda untuk konfirmasi dan detail selanjutnya.
                                        </p>
                                    </div>
                                </div>

                                {/* Buttons */}
                                <div className="flex justify-between space-x-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="w-full bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm hover:bg-gray-300 transition"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting || dateError !== "" || dateCheckLoading || !formData.event_date}
                                        className="w-full bg-pink-600 text-white px-4 py-2 rounded-md text-sm hover:bg-pink-700 transition disabled:bg-pink-400 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? "Memproses..." : "Pesan Sekarang"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            {/* Date Picker Dialog */}
            <DatePickerDialog
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                onDateSelect={handleDateSelect}
                bookedDates={bookedDates}
                initialDate={formData.event_date}
                isCheckingDate={dateCheckLoading}
            />
        </div>
    );
};

export default OrderModal;

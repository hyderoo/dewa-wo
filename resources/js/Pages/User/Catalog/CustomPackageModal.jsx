// CustomPackageModal.jsx
import React, { useState, useEffect } from "react";
import { router } from "@inertiajs/react";
import axios from "axios";
import { X, Search, Calendar, AlertCircle, Loader } from "lucide-react";
import DatePickerDialog from "./DatePickerDialog";

const CustomPackageModal = ({ isOpen, onClose, auth }) => {
    // State for available features
    const [availableFeatures, setAvailableFeatures] = useState([]);
    const [loading, setLoading] = useState(true);

    // Search and selection states
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedFeatures, setSelectedFeatures] = useState([]);

    // Form data state
    const [formData, setFormData] = useState({
        client_name: "",
        event_date: "",
        venue: "",
        venue_address: "",
        estimated_guests: "",
        email: auth?.user ? auth.user.email : "",
        phone: auth?.user ? auth.user.phone : "",
        alt_phone: "",
        custom_features: []
    });

    // State for form errors
    const [errors, setErrors] = useState({});

    // State for booked dates
    const [bookedDates, setBookedDates] = useState([]);
    const [dateCheckLoading, setDateCheckLoading] = useState(false);
    const [dateError, setDateError] = useState("");

    // State for date picker dialog
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

    // State for loading
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch booked dates when component mounts
    useEffect(() => {
        const fetchBookedDates = async () => {
            try {
                const response = await axios.get(route('api.booked-dates'));
                setBookedDates(response.data.bookedDates);
            } catch (err) {
                console.error("Error fetching booked dates:", err);
            }
        };

        fetchBookedDates();
    }, []);

    // Load available features when modal opens
    useEffect(() => {
        if (isOpen && loading) {
            axios.get('/api/v1/catalogs/custom-features')
                .then(response => {
                    setAvailableFeatures(response.data.data.features);
                    setLoading(false);
                })
                .catch(error => {
                    console.error("Error loading features:", error);
                    setLoading(false);
                });
        }
    }, [isOpen, loading]);

    // Reset states when modal is closed
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm("");
            setSelectedFeatures([]);
            setFormData({
                client_name: "",
                event_date: "",
                venue: "",
                venue_address: "",
                estimated_guests: "",
                email: auth?.user ? auth.user.email : "",
                phone: auth?.user ? auth.user.phone : "",
                alt_phone: "",
                custom_features: []
            });
            setErrors({});
            setDateError("");
            setIsSubmitting(false);
            setLoading(true);
        }
    }, [isOpen, auth]);

    // Update form data when features are selected
    useEffect(() => {
        setFormData(prev => ({
            ...prev,
            custom_features: selectedFeatures.map(feature => feature.id)
        }));
    }, [selectedFeatures]);

    // Filter features based on search term
    const filteredFeatures = availableFeatures.filter((feature) =>
        feature.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Toggle feature selection
    const toggleFeature = (feature) => {
        if (selectedFeatures.find((f) => f.id === feature.id)) {
            setSelectedFeatures(selectedFeatures.filter((f) => f.id !== feature.id));
        } else {
            setSelectedFeatures([...selectedFeatures, feature]);
        }
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
        setDateError("");
        setDateCheckLoading(true);

        axios.get(route('api.check-date-availability', { date: date }))
            .then(response => {
                if (!response.data.available) {
                    setDateError("Maaf, tanggal ini sudah dipesan. Silakan pilih tanggal lain.");
                }
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
        e.preventDefault();
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

        if (selectedFeatures.length === 0) {
            alert("Silakan pilih minimal satu fitur untuk paket kustom Anda.");
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

                // Calculate total price
                const totalPrice = selectedFeatures.reduce((total, feature) => total + parseFloat(feature.price), 0);

                // Format data for the backend
                const orderData = {
                    client_name: formData.client_name,
                    event_date: formData.event_date,
                    venue: formData.venue + (formData.venue_address ? ` - ${formData.venue_address}` : ''),
                    estimated_guests: formData.estimated_guests,
                    email: formData.email,
                    phone: formData.phone,
                    alt_phone: formData.alt_phone || null,
                    custom_features: formData.custom_features,
                    price: totalPrice,
                    original_price: totalPrice
                };

                // Submit form using Inertia
                router.post(route('custom.store'), orderData, {
                    onSuccess: () => {
                        onClose();
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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black text-gray-800 bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden shadow-2xl">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-gray-200 rounded-full p-2 z-10 hover:bg-gray-300 transition"
                >
                    <X className="w-6 h-6 text-gray-700" />
                </button>

                {/* Modal Content */}
                <div className="flex flex-col md:flex-row h-full max-h-[85vh]">
                    {/* Left Side - Feature Selection */}
                    <div className="w-full md:w-1/2 bg-pink-50 p-6 md:p-8 overflow-y-auto">
                        <h2 className="text-2xl font-semibold text-black mb-6">
                            Buat Paket Kustom Anda
                        </h2>

                        {/* Search Bar */}
                        <div className="relative mb-4">
                            <input
                                type="text"
                                placeholder="Cari fitur..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                            />
                            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                        </div>

                        {/* Available Features List */}
                        <div className="space-y-3 mb-6">
                            <h3 className="text-lg font-medium text-gray-700 mb-3">
                                Pilih Fitur Yang Anda Inginkan
                            </h3>

                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <div className="flex flex-col items-center">
                                        <Loader className="h-8 w-8 text-pink-500 animate-spin" />
                                        <p className="mt-2 text-gray-500">Memuat fitur...</p>
                                    </div>
                                </div>
                            ) : filteredFeatures.length > 0 ? (
                                filteredFeatures.map((feature) => (
                                    <div
                                        key={feature.id}
                                        className={`bg-white p-4 rounded-lg shadow-sm cursor-pointer transition ${selectedFeatures.find((f) => f.id === feature.id)
                                            ? "border-2 border-pink-500"
                                            : "border border-gray-200"
                                            }`}
                                        onClick={() => toggleFeature(feature)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className="font-medium text-gray-800">
                                                    {feature.name}
                                                </h4>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {feature.description}
                                                </p>
                                            </div>
                                            {/* <p className="text-pink-600 font-semibold">
                                                {formatRupiah(feature.price)}
                                            </p> */}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-4">
                                    Tidak ada fitur yang ditemukan
                                </p>
                            )}
                        </div>

                        {/* Selected Features Summary */}
                        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                Fitur Yang Dipilih
                            </h3>
                            {selectedFeatures.length === 0 ? (
                                <p className="text-gray-500 text-sm">
                                    Belum ada fitur yang dipilih
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {selectedFeatures.map((feature) => (
                                        <div
                                            key={feature.id}
                                            className="flex justify-between text-sm"
                                        >
                                            <span className="text-gray-700">{feature.name}</span>
                                            <span className="text-pink-600">
                                                {formatRupiah(feature.price)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Total Estimation */}
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                Estimasi Total
                            </h3>
                            <p className="text-2xl font-bold text-pink-600">
                                {formatRupiah(
                                    selectedFeatures.reduce((total, feature) => total + parseFloat(feature.price), 0)
                                )}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                                Harga ini merupakan estimasi awal. Setelah pemesanan, tim kami akan
                                menghubungi Anda untuk konfirmasi dan detail selanjutnya.
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Order Form */}
                    <div className="w-full md:w-1/2 p-6 md:p-8 overflow-y-auto">
                        <h3 className="text-xl md:text-2xl font-semibold mb-4 md:mb-6 text-center">
                            Form Pemesanan
                        </h3>

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
                                            rows={2}
                                            //required
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
                                        <span className="text-sm font-medium text-gray-600">Total Paket Kustom:</span>
                                        <span className="font-semibold text-pink-600">
                                            {formatRupiah(
                                                selectedFeatures.reduce((total, feature) => total + parseFloat(feature.price), 0)
                                            )}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Harga ini merupakan estimasi awal berdasarkan fitur yang dipilih.
                                        Setelah pemesanan, tim kami akan menghubungi Anda untuk konfirmasi dan detail selanjutnya.
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
                                    disabled={isSubmitting || dateError !== "" || dateCheckLoading || !formData.event_date || selectedFeatures.length === 0}
                                    className="w-full bg-pink-600 text-white px-4 py-2 rounded-md text-sm hover:bg-pink-700 transition disabled:bg-pink-400 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? "Memproses..." : "Pesan Sekarang"}
                                </button>
                            </div>
                        </form>
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

export default CustomPackageModal;

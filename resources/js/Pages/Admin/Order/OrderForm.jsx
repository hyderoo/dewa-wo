import React, { useState, useEffect, useMemo } from "react";
import { Head, useForm } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import Toast from "@/Components/Toast";
import AdminLayout from "@/Layouts/AdminLayout";
import DatePickerDialog from "./DatePickerDialog";
import axios from "axios";
import {
    Calendar,
    Users,
    MapPin,
    PlusCircle,
    X,
    Package,
    DollarSign,
    Check,
    Save,
    ArrowLeft,
    Percent,
    ToggleLeft,
    ToggleRight,
    User,
    Search,
    Loader
} from "lucide-react";

const OrderForm = () => {
    const { catalogs, customFeatures, users, order, includedServices, selectedCustomFeatures, toast } = usePage().props;
    const isEditing = !!order;

    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ type: "", message: "" });
    const [selectedCatalog, setSelectedCatalog] = useState(null);
    const [tempService, setTempService] = useState("");
    const [priceFormatted, setPriceFormatted] = useState("");
    const [selectedFeatures, setSelectedFeatures] = useState([]);
    const [basePrice, setBasePrice] = useState(0);
    const [applyDiscount, setApplyDiscount] = useState(false);
    const [discountType, setDiscountType] = useState("percentage"); // or "fixed"
    const [discountValueFormatted, setDiscountValueFormatted] = useState("");
    const [originalPriceFormatted, setOriginalPriceFormatted] = useState("");
    const [searchUser, setSearchUser] = useState("");
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    // Date picker related states
    const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
    const [bookedDates, setBookedDates] = useState([]);
    const [loadingDates, setLoadingDates] = useState(false);
    const [dateCheckLoading, setDateCheckLoading] = useState(false);
    const [dateError, setDateError] = useState("");

    const { data, setData, post, processing, errors, reset } = useForm({
        user_id: "",
        catalog_id: "",
        client_name: "",
        event_date: "",
        venue: "",
        estimated_guests: 0,
        price: 0,
        original_price: 0,
        discount_percent: null,
        discount_amount: null,
        discount_reason: "",
        down_payment_amount: null,
        included_services: [],
        custom_features: [],
        _method: isEditing ? "PUT" : "",
    });

    // Fetch booked dates when component mounts
    useEffect(() => {
        const fetchBookedDates = async () => {
            setLoadingDates(true);
            try {
                const response = await axios.get(route('api.booked-dates'));
                setBookedDates(response.data.bookedDates);
            } catch (err) {
                console.error("Error fetching booked dates:", err);
                setToastMessage({
                    type: "error",
                    message: "Gagal memuat data ketersediaan tanggal. Silakan coba lagi nanti."
                });
                setShowToast(true);
            } finally {
                setLoadingDates(false);
            }
        };

        fetchBookedDates();
    }, []);

    // Initialize form data from order if editing
    useEffect(() => {
        if (isEditing) {
            setData({
                user_id: order.user_id || "",
                catalog_id: order.catalog_id || "",
                client_name: order.client_name,
                event_date: order.event_date,
                venue: order.venue,
                estimated_guests: order.estimated_guests,
                price: order.price,
                original_price: order.original_price || order.price,
                discount_percent: order.discount_percent,
                discount_amount: order.discount_amount,
                discount_reason: order.discount_reason || "",
                down_payment_amount: order.down_payment_amount,
                included_services: includedServices || [],
                custom_features: selectedCustomFeatures || [],
                _method: "PUT",
            });

            setPriceFormatted(formatRupiah(order.price.toString()));
            setSelectedFeatures(selectedCustomFeatures || []);
            setOriginalPriceFormatted(formatRupiah((order.original_price || order.price).toString()));

            // Set discount state if the order has a discount
            if (order.discount_amount > 0) {
                setApplyDiscount(true);
                if (order.discount_percent > 0) {
                    setDiscountType("percentage");
                    setDiscountValueFormatted(order.discount_percent.toString());
                } else {
                    setDiscountType("fixed");
                    setDiscountValueFormatted(formatRupiah(order.discount_amount.toString()));
                }

                setBasePrice(order.original_price || order.price);
            } else {
                setBasePrice(order.price);
            }

            if (order.catalog_id) {
                const catalog = catalogs.find(c => c.id === order.catalog_id);
                setSelectedCatalog(catalog);
            }
        }
    }, [order, isEditing, includedServices, selectedCustomFeatures]);

    // Check for flash messages
    useEffect(() => {
        if (toast) {
            setToastMessage({ type: toast.type, message: toast.message });
            setShowToast(true);

            const timer = setTimeout(() => {
                setShowToast(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Filter users based on search input
    useEffect(() => {
        if (users && users.length > 0) {
            if (searchUser) {
                const filtered = users.filter(user =>
                    user.name.toLowerCase().includes(searchUser.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchUser.toLowerCase())
                );
                setFilteredUsers(filtered);
            } else {
                setFilteredUsers(users);
            }

            // For debugging
            console.log("Users data available:", users.length);
            console.log("Filtered users:", filteredUsers ? filteredUsers.length : 0);
        } else {
            console.log("No users data available");
            setFilteredUsers([]);
        }
    }, [searchUser, users]);

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

    // Format number to Indonesian Rupiah
    const formatRupiah = (number) => {
        if (!number) return "";

        // Remove non-digit characters for processing
        const numberOnly = number.toString().replace(/\D/g, '');
        if (numberOnly === '') return '';

        // Format the number with dot separators
        return new Intl.NumberFormat('id-ID').format(numberOnly);
    };

    // Convert formatted Rupiah string back to number
    const rupiahToNumber = (rupiahStr) => {
        if (!rupiahStr) return 0;
        // Remove all non-digits
        return parseInt(rupiahStr.replace(/\D/g, ''), 10) || 0;
    };

    const handlePriceChange = (e) => {
        const rawValue = e.target.value;
        const formatted = formatRupiah(rawValue);
        setPriceFormatted(formatted);

        // Update the actual numeric value in the form data
        const numericValue = rupiahToNumber(formatted);
        setData('price', numericValue);

        // If we're not applying a discount, original price is also updated
        if (!applyDiscount) {
            setData('original_price', numericValue);
            setOriginalPriceFormatted(formatted);
            setBasePrice(numericValue);
        }
    };

    const handleOriginalPriceChange = (e) => {
        const rawValue = e.target.value;
        const formatted = formatRupiah(rawValue);
        setOriginalPriceFormatted(formatted);

        // Update the actual numeric value in the form data
        const numericValue = rupiahToNumber(formatted);
        setData('original_price', numericValue);
        setBasePrice(numericValue);

        // Recalculate discount
        calculateDiscount(numericValue, discountType, rupiahToNumber(discountValueFormatted));
    };

    const handleDiscountValueChange = (e) => {
        const value = e.target.value;

        if (discountType === "percentage") {
            // For percentage, we allow direct input (no formatting)
            setDiscountValueFormatted(value);
            const percentValue = parseFloat(value) || 0;

            // Percentage can't be more than 100%
            if (percentValue > 100) {
                setDiscountValueFormatted("100");
                calculateDiscount(basePrice, discountType, 100);
            } else {
                calculateDiscount(basePrice, discountType, percentValue);
            }
        } else {
            // For fixed amount, format as Rupiah
            const formatted = formatRupiah(value);
            setDiscountValueFormatted(formatted);
            const numericValue = rupiahToNumber(formatted);

            // Fixed discount can't be more than the original price
            if (numericValue > basePrice) {
                setDiscountValueFormatted(formatRupiah(basePrice.toString()));
                calculateDiscount(basePrice, discountType, basePrice);
            } else {
                calculateDiscount(basePrice, discountType, numericValue);
            }
        }
    };

    const handleDiscountTypeChange = (type) => {
        setDiscountType(type);
        setDiscountValueFormatted("");

        // Reset discount values when switching types
        if (type === "percentage") {
            setData('discount_percent', null);
            setData('discount_amount', null);
        } else {
            setData('discount_percent', null);
            setData('discount_amount', null);
        }
    };

    const calculateDiscount = (originalPrice, type, value) => {
        if (!originalPrice || !value) {
            setPriceFormatted(formatRupiah(originalPrice.toString()));
            setData('price', originalPrice);
            setData('discount_percent', null);
            setData('discount_amount', null);
            return;
        }

        let discountAmount = 0;
        let discountPercent = null;

        if (type === "percentage") {
            discountPercent = value;
            discountAmount = originalPrice * (value / 100);
        } else {
            discountAmount = value;
            discountPercent = (value / originalPrice) * 100;
        }

        const finalPrice = originalPrice - discountAmount;

        setPriceFormatted(formatRupiah(finalPrice.toString()));
        setData('price', finalPrice);
        setData('discount_percent', discountPercent);
        setData('discount_amount', discountAmount);
    };

    const toggleDiscount = () => {
        setApplyDiscount(!applyDiscount);

        if (!applyDiscount) {
            // When enabling discount, original price becomes current price
            setOriginalPriceFormatted(priceFormatted);
            setBasePrice(data.price);
            setData('original_price', data.price);
        } else {
            // When disabling discount, reset discount values and price becomes original
            setDiscountValueFormatted("");
            setData('discount_percent', null);
            setData('discount_amount', null);
            setData('discount_reason', "");
            setPriceFormatted(originalPriceFormatted);
            setData('price', data.original_price);
        }
    };

    const handleDownPaymentChange = (e) => {
        const formatted = formatRupiah(e.target.value);
        const numericValue = rupiahToNumber(formatted);

        // Down payment can't exceed the total price
        if (numericValue > data.price) {
            setData('down_payment_amount', data.price);
        } else {
            setData('down_payment_amount', numericValue);
        }
    };

    const handleCatalogChange = (e) => {
        const catalogId = e.target.value;
        setData('catalog_id', catalogId);

        if (catalogId) {
            const catalog = catalogs.find(c => c.id === parseInt(catalogId));
            setSelectedCatalog(catalog);

            // If there's a catalog selected, initialize with its features
            if (catalog && catalog.features) {
                setData('included_services', catalog.features);
            }

            // Update the price based on catalog price range
            if (catalog && catalog.price) {
                const minPrice = catalog.price[0] || 0;
                setPriceFormatted(formatRupiah(minPrice.toString()));
                setOriginalPriceFormatted(formatRupiah(minPrice.toString()));
                setData('price', minPrice);
                setData('original_price', minPrice);
                setBasePrice(minPrice);
            }
        } else {
            setSelectedCatalog(null);
            setData('included_services', []);
        }
    };

    const handleAddService = () => {
        if (tempService.trim()) {
            setData('included_services', [...data.included_services, tempService.trim()]);
            setTempService("");
        }
    };

    const handleRemoveService = (index) => {
        const updatedServices = [...data.included_services];
        updatedServices.splice(index, 1);
        setData('included_services', updatedServices);
    };

    const handleCustomFeatureSelect = (feature) => {
        // Check if the feature is already selected
        const exists = selectedFeatures.some(f => f.id === feature.id);

        if (!exists) {
            const newFeature = {
                id: feature.id,
                name: feature.name,
                price: feature.price
            };

            const updatedFeatures = [...selectedFeatures, newFeature];
            setSelectedFeatures(updatedFeatures);

            // Update form data
            setData('custom_features', updatedFeatures);

            // Update the base price and total price - FIX the calculation
            // First, convert all to numbers before adding
            const featurePrice = Number(feature.price);
            const newBasePrice = Number(basePrice) + featurePrice;
            setBasePrice(newBasePrice);

            if (!applyDiscount) {
                setPriceFormatted(formatRupiah(newBasePrice.toString()));
                setData('price', newBasePrice);
                setOriginalPriceFormatted(formatRupiah(newBasePrice.toString()));
                setData('original_price', newBasePrice);
            } else {
                setOriginalPriceFormatted(formatRupiah(newBasePrice.toString()));
                setData('original_price', newBasePrice);
                // Recalculate discount
                if (discountType === "percentage" && data.discount_percent) {
                    calculateDiscount(newBasePrice, "percentage", data.discount_percent);
                } else if (data.discount_amount) {
                    calculateDiscount(newBasePrice, "fixed", data.discount_amount);
                }
            }
        }
    };

    const handleRemoveCustomFeature = (index) => {
        const featureToRemove = selectedFeatures[index];
        const updatedFeatures = [...selectedFeatures];
        updatedFeatures.splice(index, 1);

        setSelectedFeatures(updatedFeatures);
        setData('custom_features', updatedFeatures);

        // Update the base price and total price
        if (featureToRemove) {
            // Convert to numbers for calculation
            const featurePrice = Number(featureToRemove.price);
            const newBasePrice = Number(basePrice) - featurePrice;
            setBasePrice(newBasePrice);

            if (!applyDiscount) {
                setPriceFormatted(formatRupiah(newBasePrice.toString()));
                setData('price', newBasePrice);
                setOriginalPriceFormatted(formatRupiah(newBasePrice.toString()));
                setData('original_price', newBasePrice);
            } else {
                setOriginalPriceFormatted(formatRupiah(newBasePrice.toString()));
                setData('original_price', newBasePrice);
                // Recalculate discount
                if (discountType === "percentage" && data.discount_percent) {
                    calculateDiscount(newBasePrice, "percentage", data.discount_percent);
                } else if (data.discount_amount) {
                    calculateDiscount(newBasePrice, "fixed", data.discount_amount);
                }
            }
        }
    };

    const selectUser = (user) => {
        setData('user_id', user.id);
        setSearchUser(user.name);
        setShowUserDropdown(false);
    };

    // Handle date selection from the dialog
    const handleDateSelect = (date) => {
        // Clear any previous date errors
        setDateError("");
        setDateCheckLoading(true);

        // Double-check with the server for the most up-to-date information
        axios.get(route('api.check-date-availability', { date: date }))
            .then(response => {
                if (!response.data.available) {
                    // If editing and the date is the same as the current order's date, it's okay
                    if (isEditing && order.event_date === date) {
                        setData('event_date', date);
                    } else {
                        setDateError("Maaf, tanggal ini sudah dipesan. Silakan pilih tanggal lain.");
                    }
                } else {
                    // Date is available, set it
                    setData('event_date', date);
                }
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

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate that a user is selected
        if (!data.user_id) {
            setToastMessage({
                type: "error",
                message: "Silakan pilih pengguna untuk pesanan ini."
            });
            setShowToast(true);
            return;
        }

        // Validate that date is selected
        if (!data.event_date) {
            setDateError("Tanggal pernikahan harus diisi.");
            setToastMessage({
                type: "error",
                message: "Tanggal pernikahan harus diisi."
            });
            setShowToast(true);
            return;
        }

        // Check for date error
        if (dateError) {
            setToastMessage({
                type: "error",
                message: dateError
            });
            setShowToast(true);
            return;
        }

        // Format custom features as needed for the API
        const formattedData = {
            ...data,
            custom_features: data.custom_features.map(feature => ({
                id: feature.id,
                name: feature.name,
                price: feature.price
            }))
        };

        if (isEditing) {
            post(route('admin.orders.update', order.id), formattedData);
        } else {
            post(route('admin.orders.store'), formattedData);
        }
    };

    const handleCancel = () => {
        window.history.back();
    };

    // Format price for display in custom feature list
    const formatPriceDisplay = (price) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    };

    // Calculate final price including all features
    const finalPrice = useMemo(() => {
        let total = data.price;
        return formatPriceDisplay(total);
    }, [data.price]);

    // Calculate original price before discount
    const originalPrice = useMemo(() => {
        return formatPriceDisplay(data.original_price);
    }, [data.original_price]);

    // Calculate discount amount
    const discountAmount = useMemo(() => {
        if (!data.discount_amount) return "Rp 0";
        return formatPriceDisplay(data.discount_amount);
    }, [data.discount_amount]);

    // Get user display name for selected user
    const selectedUserDisplay = useMemo(() => {
        if (!data.user_id || !users) return "";
        const user = users.find(u => u.id === data.user_id);
        return user ? `${user.name} (${user.email})` : "";
    }, [data.user_id, users]);

    return (
        <AdminLayout activeMenu="order-management">
            <Head title={isEditing ? "Edit Order" : "Create Order"} />

            {showToast && (
                <Toast
                    type={toastMessage.type}
                    message={toastMessage.message}
                    onClose={() => setShowToast(false)}
                />
            )}

            <div className="py-8 px-4 md:px-0">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">
                            {isEditing ? "Edit Pesanan" : "Buat Pesanan Baru"}
                        </h1>
                        <p className="text-gray-600 mt-1">
                            {isEditing ? "Perbarui informasi pesanan yang ada" : "Tambahkan pesanan baru ke sistem"}
                        </p>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Kembali
                    </button>
                </div>

                <div className="bg-white shadow-md rounded-lg p-6">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Client Information */}
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold border-b pb-2">Informasi Klien</h2>

                                {/* User Selection */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pengguna <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={searchUser}
                                                onChange={(e) => {
                                                    setSearchUser(e.target.value);
                                                    setShowUserDropdown(true);
                                                }}
                                                onFocus={() => setShowUserDropdown(true)}
                                                className={`w-full pl-10 pr-10 py-2 border ${errors.user_id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500`}
                                                placeholder="Cari pengguna berdasarkan nama atau email"
                                            />
                                            {/* Add clear button to the input */}
                                            {searchUser && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSearchUser('');
                                                        setShowUserDropdown(false);
                                                    }}
                                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                                >
                                                    <X className="h-4 w-4" />
                                                </button>
                                            )}
                                            {selectedUserDisplay && (
                                                <div className="mt-1 text-sm text-pink-600 font-medium">
                                                    User terpilih: <span className="font-medium">{selectedUserDisplay}</span>
                                                </div>
                                            )}
                                        </div>

                                        {showUserDropdown && (
                                            <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg max-h-60 overflow-y-auto border border-gray-200">
                                                <div className="flex items-center justify-between p-2 border-b border-gray-200 sticky top-0 bg-white z-20">
                                                    <span className="text-sm font-medium text-gray-600">Pilih User</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowUserDropdown(false)}
                                                        className="p-1 hover:bg-gray-100 rounded-full"
                                                    >
                                                        <X className="h-4 w-4 text-gray-500" />
                                                    </button>
                                                </div>

                                                {filteredUsers && filteredUsers.length > 0 ? (
                                                    <ul className="py-1">
                                                        {filteredUsers.map(user => (
                                                            <li
                                                                key={user.id}
                                                                className={`px-4 py-3 cursor-pointer flex items-center transition-colors ${data.user_id === user.id
                                                                    ? 'bg-pink-50 border-l-4 border-pink-500'
                                                                    : 'hover:bg-gray-50 border-l-4 border-transparent'
                                                                    }`}
                                                                onClick={() => selectUser(user)}
                                                            >
                                                                <User className={`w-5 h-5 mr-3 ${data.user_id === user.id ? 'text-pink-500' : 'text-gray-400'}`} />
                                                                <div className="flex-1">
                                                                    <div className={`font-medium ${data.user_id === user.id ? 'text-pink-700' : 'text-gray-800'}`}>{user.name}</div>
                                                                    <div className="text-xs text-gray-500">{user.email}</div>
                                                                </div>
                                                                {data.user_id === user.id && (
                                                                    <Check className="w-5 h-5 text-pink-500" />
                                                                )}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                ) : (
                                                    <div className="p-4 text-center">
                                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 mb-3">
                                                            <User className="h-6 w-6 text-gray-400" />
                                                        </div>
                                                        <p className="text-sm text-gray-500">Tidak ada pengguna ditemukan</p>
                                                        {searchUser && (
                                                            <button
                                                                type="button"
                                                                onClick={() => setSearchUser('')}
                                                                className="mt-2 text-xs text-pink-600 hover:text-pink-700 font-medium"
                                                            >
                                                                Reset pencarian
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    {errors.user_id && (
                                        <div className="text-red-500 text-xs mt-1">{errors.user_id}</div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Klien <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.client_name}
                                        onChange={e => setData('client_name', e.target.value)}
                                        className={`w-full px-3 py-2 border ${errors.client_name ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500`}
                                        placeholder="Contoh: Budi & Sarah"
                                        required
                                    />
                                    {errors.client_name && (
                                        <div className="text-red-500 text-xs mt-1">{errors.client_name}</div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tanggal Acara <span className="text-red-500">*</span>
                                    </label>
                                    {/* Custom Date Picker Button */}
                                    <button
                                        type="button"
                                        onClick={openDatePicker}
                                        className={`
                                            w-full px-3 py-2 border rounded-md text-sm
                                            focus:outline-none focus:ring-2 text-left
                                            flex items-center justify-between relative
                                            ${dateError || errors.event_date ? 'border-red-300 focus:ring-red-500' : 'border-gray-300 focus:ring-pink-500'}
                                            ${!data.event_date ? 'text-gray-500' : 'text-gray-900'}
                                        `}
                                    >
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                            <span>
                                                {data.event_date
                                                    ? formatDisplayDate(data.event_date)
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
                                        value={data.event_date || ""}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Lokasi Acara <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            value={data.venue}
                                            onChange={e => setData('venue', e.target.value)}
                                            className={`w-full pl-10 px-3 py-2 border ${errors.venue ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500`}
                                            placeholder="Contoh: Hotel Grand Ballroom"
                                            required
                                        />
                                    </div>
                                    {errors.venue && (
                                        <div className="text-red-500 text-xs mt-1">{errors.venue}</div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Estimasi Jumlah Tamu <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <input
                                            type="number"
                                            value={data.estimated_guests}
                                            onChange={e => setData('estimated_guests', parseInt(e.target.value) || 0)}
                                            className={`w-full pl-10 px-3 py-2 border ${errors.estimated_guests ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500`}
                                            min="1"
                                            required
                                        />
                                    </div>
                                    {errors.estimated_guests && (
                                        <div className="text-red-500 text-xs mt-1">{errors.estimated_guests}</div>
                                    )}
                                </div>
                            </div>

                            {/* Order Details */}
                            <div className="space-y-6">
                                <h2 className="text-lg font-semibold border-b pb-2">Detail Pesanan</h2>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Paket / Katalog
                                    </label>
                                    <div className="relative">
                                        <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                        <select
                                            value={data.catalog_id}
                                            onChange={handleCatalogChange}
                                            className={`w-full pl-10 px-3 py-2 border ${errors.catalog_id ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500`}
                                        >
                                            <option value="">-- Pilih Paket --</option>
                                            {catalogs && catalogs.map(catalog => (
                                                <option key={catalog.id} value={catalog.id}>
                                                    {catalog.name} ({catalog.formatted_price})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    {errors.catalog_id && (
                                        <div className="text-red-500 text-xs mt-1">{errors.catalog_id}</div>
                                    )}
                                </div>

                                {/* Price Section with Discount */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Harga & Diskon
                                        </label>
                                        <button
                                            type="button"
                                            onClick={toggleDiscount}
                                            className="flex items-center text-sm font-medium text-gray-600 hover:text-pink-600"
                                        >
                                            {applyDiscount ? (
                                                <>
                                                    <ToggleRight className="h-5 w-5 text-pink-600" />
                                                    <span className="ml-1">Diskon Aktif</span>
                                                </>
                                            ) : (
                                                <>
                                                    <ToggleLeft className="h-5 w-5" />
                                                    <span className="ml-1">Terapkan Diskon</span>
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {applyDiscount ? (
                                        <div className="bg-pink-50 rounded-lg p-4 border border-pink-100">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Harga Asli <span className="text-red-500">*</span>
                                                    </label>
                                                    <div className="relative">
                                                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                                            Rp
                                                        </span>
                                                        <input
                                                            type="text"
                                                            value={originalPriceFormatted}
                                                            onChange={handleOriginalPriceChange}
                                                            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                            placeholder="50.000.000"
                                                            required
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Jenis Diskon
                                                    </label>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDiscountTypeChange("percentage")}
                                                            className={`flex-1 py-2 px-4 rounded-lg border ${discountType === 'percentage' ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-gray-700 border-gray-300'}`}
                                                        >
                                                            Persentase
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDiscountTypeChange("fixed")}
                                                            className={`flex-1 py-2 px-4 rounded-lg border ${discountType === 'fixed' ? 'bg-pink-600 text-white border-pink-600' : 'bg-white text-gray-700 border-gray-300'}`}
                                                        >
                                                            Nominal
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        {discountType === 'percentage' ? 'Persentase Diskon (%)' : 'Jumlah Diskon'}
                                                    </label>
                                                    <div className="relative">
                                                        {discountType === 'percentage' ? (
                                                            <input
                                                                type="number"
                                                                value={discountValueFormatted}
                                                                onChange={handleDiscountValueChange}
                                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                                placeholder="10"
                                                                min="0"
                                                                max="100"
                                                            />
                                                        ) : (
                                                            <div className="relative">
                                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                                                    Rp
                                                                </span>
                                                                <input
                                                                    type="text"
                                                                    value={discountValueFormatted}
                                                                    onChange={handleDiscountValueChange}
                                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                                    placeholder="5.000.000"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Alasan Diskon
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={data.discount_reason}
                                                        onChange={e => setData('discount_reason', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                        placeholder="Contoh: Promo akhir tahun"
                                                    />
                                                </div>
                                            </div>

                                            <div className="mt-4 bg-white p-3 rounded-lg border border-gray-200">
                                                <div className="grid grid-cols-3 gap-2 text-sm">
                                                    <div>
                                                        <p className="text-gray-500">Harga Asli</p>
                                                        <p className="font-medium">{originalPrice}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Diskon</p>
                                                        <p className="font-medium text-green-600">
                                                            {discountAmount}
                                                            {data.discount_percent && <span className="ml-1 text-xs text-gray-500">({data.discount_percent}%)</span>}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500">Harga Akhir</p>
                                                        <p className="font-medium text-pink-600">{finalPrice}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Harga <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                                    Rp
                                                </span>
                                                <input
                                                    type="text"
                                                    value={priceFormatted}
                                                    onChange={handlePriceChange}
                                                    className={`w-full pl-10 pr-3 py-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500`}
                                                    placeholder="50.000.000"
                                                    required
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Format angka tanpa simbol Rp. Contoh: 50.000.000
                                            </p>
                                            {errors.price && (
                                                <div className="text-red-500 text-xs mt-1">{errors.price}</div>
                                            )}
                                        </div>
                                    )}

                                    {/* Down Payment Setting */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Jumlah Uang Muka (Down Payment)
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                                Rp
                                            </span>
                                            <input
                                                type="text"
                                                value={data.down_payment_amount ? formatRupiah(data.down_payment_amount.toString()) : ""}
                                                onChange={handleDownPaymentChange}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder="15.000.000"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Kosongkan untuk menggunakan default 30% dari total harga
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Layanan Termasuk
                                    </label>
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={tempService}
                                            onChange={e => setTempService(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            placeholder="Tambah layanan baru"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddService}
                                            className="px-3 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                                        >
                                            <PlusCircle size={16} />
                                        </button>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-3 min-h-[100px] max-h-[200px] overflow-y-auto">
                                        {data.included_services && data.included_services.length > 0 ? (
                                            <ul className="space-y-2">
                                                {data.included_services.map((service, index) => (
                                                    <li key={index} className="flex justify-between items-center bg-white p-2 rounded">
                                                        <span className="text-gray-700">{service}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveService(index)}
                                                            className="text-red-500 hover:text-red-700"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-center text-gray-500 py-4">
                                                Belum ada layanan ditambahkan
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Custom Features Section */}
                        <div className="mt-8 pt-6 border-t">
                            <h2 className="text-lg font-semibold mb-4">Fitur Custom / Tambahan</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                                        Fitur Tersedia
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-3 min-h-[200px] max-h-[300px] overflow-y-auto">
                                        {customFeatures && customFeatures.length > 0 ? (
                                            <ul className="space-y-2">
                                                {customFeatures.map(feature => (
                                                    <li
                                                        key={feature.id}
                                                        className="bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                                        onClick={() => handleCustomFeatureSelect(feature)}
                                                    >
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">{feature.name}</h4>
                                                                <p className="text-sm text-gray-600">{feature.description}</p>
                                                            </div>
                                                            <span className="font-semibold text-pink-600">
                                                                {formatPriceDisplay(feature.price)}
                                                            </span>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-center text-gray-500 py-4">
                                                Tidak ada fitur custom tersedia
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-sm font-medium text-gray-700 mb-2">
                                        Fitur yang Dipilih
                                    </h3>
                                    <div className="bg-gray-50 rounded-lg p-3 min-h-[200px] max-h-[300px] overflow-y-auto">
                                        {selectedFeatures && selectedFeatures.length > 0 ? (
                                            <ul className="space-y-2">
                                                {selectedFeatures.map((feature, index) => (
                                                    <li key={index} className="bg-white p-3 rounded-lg shadow-sm">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h4 className="font-medium text-gray-900">
                                                                    {feature.name}
                                                                </h4>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-semibold text-pink-600">
                                                                    {formatPriceDisplay(feature.price)}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveCustomFeature(index)}
                                                                    className="text-red-500 hover:text-red-700 p-1"
                                                                >
                                                                    <X size={16} />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <p className="text-center text-gray-500 py-4">
                                                Belum ada fitur custom yang dipilih
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-8 pt-6 border-t flex justify-end space-x-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={processing}
                                className={`px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2 ${processing ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                <Save size={16} />
                                {processing ? 'Menyimpan...' : (isEditing ? 'Perbarui Pesanan' : 'Buat Pesanan')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Date Picker Dialog */}
            <DatePickerDialog
                isOpen={isDatePickerOpen}
                onClose={() => setIsDatePickerOpen(false)}
                onDateSelect={handleDateSelect}
                bookedDates={bookedDates}
                initialDate={data.event_date}
                isCheckingDate={dateCheckLoading}
            />
        </AdminLayout>
    );
};

export default OrderForm;

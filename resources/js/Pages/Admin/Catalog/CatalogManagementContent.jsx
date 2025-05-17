import React, { useState, useEffect, useMemo } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { useForm } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import Toast from "@/Components/Toast";
import CatalogCard from "./CatalogCard";
import CatalogFormModal from "./CatalogFormModal";
import DeleteCatalogConfirmationModal from "./DeleteCatalogConfirmationModal";
import CatalogFilterBar from "./CatalogFilterBar";
import CatalogFilterStatusBar from "./CatalogFilterStatusBar";

const CatalogManagementContent = () => {
    const { catalogs, toast } = usePage().props;

    const [services, setServices] = useState([]);
    const [filteredServices, setFilteredServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState("all");
    const [showModal, setShowModal] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [currentFeature, setCurrentFeature] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ type: "", message: "" });
    const [previewImage, setPreviewImage] = useState(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [catalogToDelete, setCatalogToDelete] = useState(null);

    // For formatted price inputs
    const [minPriceFormatted, setMinPriceFormatted] = useState("");
    const [maxPriceFormatted, setMaxPriceFormatted] = useState("");

    // Service types list
    const serviceTypes = [
        { value: "all-in-one", label: "Paket Lengkap" },
        { value: "decoration", label: "Dekorasi" },
        { value: "documentation", label: "Dokumentasi" },
    ];

    // Initialize services from props
    useEffect(() => {
        if (catalogs) {
            setServices(catalogs);
        }
    }, [catalogs]);

    // Filter services based on search term and selected type
    useEffect(() => {
        let result = services;

        // Filter by search term
        if (searchTerm) {
            result = result.filter(
                (service) =>
                    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    service.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter by service type
        if (selectedType !== "all") {
            result = result.filter((service) => service.type === selectedType);
        }

        setFilteredServices(result);
    }, [services, searchTerm, selectedType]);

    // Check for flash messages
    useEffect(() => {
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

    const { data, setData, post, processing, errors, reset, clearErrors, setError } = useForm({
        name: "",
        description: "",
        min_price: "",
        max_price: "",
        type: "all-in-one",
        features: [],
        image: null,
        _method: "", // For method spoofing when needed
    });

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

    const handleMinPriceChange = (e) => {
        const formatted = formatRupiah(e.target.value);
        setMinPriceFormatted(formatted);

        // Update the actual numeric value in the form data
        const numericValue = rupiahToNumber(formatted);
        setData('min_price', numericValue);

        // Clear any error on this field if it exists
        if (errors.min_price) {
            clearErrors('min_price');
        }
    };

    const handleMaxPriceChange = (e) => {
        const formatted = formatRupiah(e.target.value);
        setMaxPriceFormatted(formatted);

        // Update the actual numeric value in the form data
        const numericValue = rupiahToNumber(formatted);
        setData('max_price', numericValue);

        // Clear any error on this field if it exists
        if (errors.max_price) {
            clearErrors('max_price');
        }
    };

    const handleAddNew = () => {
        setSelectedService(null);
        reset();
        setData({
            name: "",
            description: "",
            min_price: "",
            max_price: "",
            type: "all-in-one",
            features: [],
            image: null,
            _method: "", // No method spoofing for create
        });
        setMinPriceFormatted("");
        setMaxPriceFormatted("");
        setPreviewImage(null);
        setShowModal(true);
    };

    const handleEdit = (service) => {
        setSelectedService(service);

        // Extract min and max prices from the price array
        const minPrice = service.price[0] || 0;
        const maxPrice = service.price[1] || 0;

        // Set formatted price displays first
        setMinPriceFormatted(formatRupiah(minPrice.toString()));
        setMaxPriceFormatted(formatRupiah(maxPrice.toString()));

        // Then set the data with numeric values to ensure proper comparison
        setData({
            name: service.name,
            description: service.description,
            min_price: Number(minPrice), // Ensure it's a number
            max_price: Number(maxPrice), // Ensure it's a number
            type: service.type,
            features: service.features || [],
            image: null, // We don't set the image here, only on actual change
            _method: "PUT", // Set method spoofing for update
        });

        setPreviewImage(service.image);
        setShowModal(true);
    };

    const handleAddFeature = () => {
        if (currentFeature.trim()) {
            setData({
                ...data,
                features: [...data.features, currentFeature.trim()],
            });
            setCurrentFeature("");
        }
    };

    const handleRemoveFeature = (index) => {
        setData({
            ...data,
            features: data.features.filter((_, i) => i !== index),
        });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create file preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreviewImage(e.target.result);
            };
            reader.readAsDataURL(file);

            // Set file to form data
            setData("image", file);
        }
    };

    const validateForm = () => {
        let isValid = true;

        // Ensure values are converted to numbers for comparison
        const minPrice = Number(data.min_price);
        const maxPrice = Number(data.max_price);

        // Validate min price is less than or equal to max price
        if (minPrice > maxPrice) {
            setError('max_price', 'Harga maksimum harus lebih besar dari harga minimum');
            isValid = false;
        }

        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        if (selectedService) {
            // Update existing service using POST with _method=PUT for method spoofing
            // Include the full data object to ensure features are included
            post(route('admin.catalogs.update', selectedService.id), {
                ...data,
                _method: 'PUT',
                // Make sure features array is explicitly included
                features: data.features || [],
                onSuccess: () => {
                    setShowModal(false);
                },
                onError: (errors) => {
                    console.error("Update errors:", errors);
                },
                forceFormData: true // Force FormData to handle file uploads
            });
        } else {
            // Create new service
            post(route('admin.catalogs.store'), {
                onSuccess: () => {
                    setShowModal(false);
                },
                onError: (errors) => {
                    console.error("Create errors:", errors);
                },
                forceFormData: true // Force FormData to handle file uploads
            });
        }
    };

    const openDeleteModal = (service) => {
        setCatalogToDelete(service);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setCatalogToDelete(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-gray-600">
            {showToast && (
                <Toast
                    type={toastMessage.type}
                    message={toastMessage.message}
                    onClose={() => setShowToast(false)}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteCatalogConfirmationModal
                isOpen={deleteModalOpen}
                onClose={closeDeleteModal}
                catalog={catalogToDelete}
            />

            {/* Form Modal */}
            <CatalogFormModal
                isOpen={showModal}
                selectedService={selectedService}
                data={data}
                setData={setData}
                errors={errors}
                minPriceFormatted={minPriceFormatted}
                maxPriceFormatted={maxPriceFormatted}
                handleMinPriceChange={handleMinPriceChange}
                handleMaxPriceChange={handleMaxPriceChange}
                serviceTypes={serviceTypes}
                currentFeature={currentFeature}
                setCurrentFeature={setCurrentFeature}
                handleAddFeature={handleAddFeature}
                handleRemoveFeature={handleRemoveFeature}
                previewImage={previewImage}
                handleImageChange={handleImageChange}
                processing={processing}
                handleSubmit={handleSubmit}
                onClose={() => setShowModal(false)}
            />

            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 md:p-8">
                        <h1 className="font-cormorant text-3xl md:text-4xl font-light text-white text-center tracking-wide">
                            Manajemen Katalog Layanan
                        </h1>
                        <p className="text-center text-white/80 mt-2 max-w-2xl mx-auto">
                            Kelola paket dan layanan pernikahan untuk ditampilkan kepada klien
                        </p>
                    </div>

                    {/* Action Buttons and Filter */}
                    <div className="p-4 md:p-6 bg-gray-50 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
                            <button
                                onClick={handleAddNew}
                                className="w-full md:w-auto bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                            >
                                <Plus className="w-4 h-4 mr-2 inline-block" />
                                Tambah Layanan Baru
                            </button>

                            {/* Filter Bar */}
                            <CatalogFilterBar
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                                selectedType={selectedType}
                                setSelectedType={setSelectedType}
                                serviceTypes={serviceTypes}
                            />
                        </div>
                    </div>

                    {/* Filter Status Bar */}
                    {(selectedType !== "all" || searchTerm) && (
                        <CatalogFilterStatusBar
                            selectedType={selectedType}
                            setSelectedType={setSelectedType}
                            filteredServicesCount={filteredServices.length}
                        />
                    )}

                    {/* Services Grid */}
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredServices.length > 0 ? (
                                filteredServices.map((service) => (
                                    <CatalogCard
                                        key={service.id}
                                        service={service}
                                        serviceTypes={serviceTypes}
                                        onEdit={handleEdit}
                                        onDelete={openDeleteModal}
                                    />
                                ))
                            ) : (
                                <div className="col-span-1 lg:col-span-2 xl:col-span-3 flex flex-col items-center justify-center bg-white rounded-lg shadow p-8">
                                    <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak ada layanan ditemukan</h3>
                                    <p className="text-gray-500 text-center mb-4">
                                        {searchTerm || selectedType !== "all"
                                            ? 'Tidak ada layanan yang cocok dengan filter Anda.'
                                            : 'Silakan tambahkan layanan baru untuk memulai.'}
                                    </p>
                                    <div className="mt-6 flex justify-center space-x-3">
                                        {(searchTerm || selectedType !== "all") && (
                                            <button
                                                onClick={() => {
                                                    setSearchTerm("");
                                                    setSelectedType("all");
                                                }}
                                                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Tampilkan Semua
                                            </button>
                                        )}
                                        <button
                                            onClick={handleAddNew}
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                                        >
                                            <Plus className="-ml-1 mr-2 h-4 w-4" />
                                            Tambah Layanan Baru
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CatalogManagementContent;

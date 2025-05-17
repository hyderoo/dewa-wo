import React, { useState, useEffect } from "react";
import { Plus, AlertCircle } from "lucide-react";
import { useForm } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import Toast from "@/Components/Toast";
import FeatureCard from "./FeatureCard";
import FeatureFilterBar from "./FeatureFilterBar";
import FeatureFormModal from "./FeatureFormModal";
import DeleteFeatureConfirmationModal from "./DeleteFeatureConfirmationModal";

const CustomFeatureManagementContent = () => {
    const { features, toast } = usePage().props;

    const [featuresList, setFeaturesList] = useState([]);
    const [filteredFeatures, setFilteredFeatures] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ type: "", message: "" });
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [featureToDelete, setFeatureToDelete] = useState(null);

    // For formatted price input
    const [priceFormatted, setPriceFormatted] = useState("");

    // Initialize features from props
    useEffect(() => {
        if (features) {
            setFeaturesList(features);
        }
    }, [features]);

    // Filter features based on search term
    useEffect(() => {
        if (searchTerm) {
            const filtered = featuresList.filter(
                (feature) =>
                    feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    feature.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredFeatures(filtered);
        } else {
            setFilteredFeatures(featuresList);
        }
    }, [featuresList, searchTerm]);

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

    const { data, setData, post, processing, errors, reset } = useForm({
        name: "",
        price: "",
        description: "",
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

    const handlePriceChange = (e) => {
        const formatted = formatRupiah(e.target.value);
        setPriceFormatted(formatted);

        // Update the actual numeric value in the form data
        const numericValue = rupiahToNumber(formatted);
        setData('price', numericValue);
    };

    const handleAddNew = () => {
        setSelectedFeature(null);
        reset();
        setData({
            name: "",
            price: "",
            description: "",
            _method: "", // No method spoofing for create
        });
        setPriceFormatted("");
        setShowModal(true);
    };

    const handleEdit = (feature) => {
        setSelectedFeature(feature);
        setData({
            name: feature.name,
            price: feature.price.toString(),
            description: feature.description,
            _method: "PUT", // Set method spoofing for update
        });

        // Set formatted price display
        setPriceFormatted(formatRupiah(feature.price.toString()));

        setShowModal(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (selectedFeature) {
            // Update existing feature using POST with _method=PUT for method spoofing
            post(route('admin.catalogs.features.update', selectedFeature.id), {
                onSuccess: () => {
                    setShowModal(false);
                },
                onError: (errors) => {
                    console.error("Update errors:", errors);
                }
            });
        } else {
            // Create new feature
            post(route('admin.catalogs.features.store'), {
                onSuccess: () => {
                    setShowModal(false);
                },
                onError: (errors) => {
                    console.error("Create errors:", errors);
                }
            });
        }
    };

    const openDeleteModal = (feature) => {
        setFeatureToDelete(feature);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setFeatureToDelete(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            {showToast && (
                <Toast
                    type={toastMessage.type}
                    message={toastMessage.message}
                    onClose={() => setShowToast(false)}
                />
            )}

            {/* Delete Confirmation Modal */}
            <DeleteFeatureConfirmationModal
                isOpen={deleteModalOpen}
                onClose={closeDeleteModal}
                feature={featureToDelete}
            />

            {/* Form Modal */}
            <FeatureFormModal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                selectedFeature={selectedFeature}
                data={data}
                setData={setData}
                errors={errors}
                priceFormatted={priceFormatted}
                handlePriceChange={handlePriceChange}
                processing={processing}
                handleSubmit={handleSubmit}
            />

            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 md:p-8">
                        <h1 className="font-cormorant text-3xl md:text-4xl font-light text-white text-center tracking-wide">
                            Manajemen Fitur Custom
                        </h1>
                        <p className="text-center text-white/80 mt-2 max-w-2xl mx-auto">
                            Kelola fitur-fitur tambahan yang dapat ditambahkan pada paket pernikahan
                        </p>
                    </div>

                    {/* Actions Bar */}
                    <div className="p-4 md:p-6 bg-gray-50 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
                            <button
                                onClick={handleAddNew}
                                className="w-full md:w-auto bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                            >
                                <Plus className="w-4 h-4 mr-2 inline-block" />
                                Tambah Fitur Baru
                            </button>

                            {/* Search Filter */}
                            <div className="w-full md:w-auto">
                                <FeatureFilterBar
                                    searchTerm={searchTerm}
                                    setSearchTerm={setSearchTerm}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Filter Status Bar */}
                    {searchTerm && (
                        <div className="bg-blue-50 px-6 py-2 border-b border-blue-100">
                            <div className="flex justify-between items-center">
                                <p className="text-sm text-blue-600">
                                    <span className="font-medium">Search:</span> "{searchTerm}"
                                    {filteredFeatures.length === 1
                                        ? " (1 item)"
                                        : ` (${filteredFeatures.length} items)`}
                                </p>
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="text-xs text-blue-700 hover:text-blue-900"
                                >
                                    Hapus filter
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Features Grid */}
                    <div className="p-6 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredFeatures.length > 0 ? (
                                filteredFeatures.map((feature) => (
                                    <FeatureCard
                                        key={feature.id}
                                        feature={feature}
                                        onEdit={handleEdit}
                                        onDelete={openDeleteModal}
                                    />
                                ))
                            ) : (
                                <div className="col-span-1 md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center bg-white rounded-lg shadow p-8">
                                    <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak ada fitur ditemukan</h3>
                                    <p className="text-gray-500 text-center mb-4">
                                        {searchTerm
                                            ? 'Tidak ada fitur yang cocok dengan pencarian Anda.'
                                            : 'Silakan tambahkan fitur baru untuk memulai.'}
                                    </p>
                                    <div className="mt-6 flex justify-center space-x-3">
                                        {searchTerm && (
                                            <button
                                                onClick={() => setSearchTerm("")}
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
                                            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                        >
                                            <Plus className="-ml-1 mr-2 h-4 w-4" />
                                            Tambah Fitur Baru
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

export default CustomFeatureManagementContent;

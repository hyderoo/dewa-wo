import React, { useState, useEffect, useMemo } from "react";
import { router, useForm } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import Toast from "@/Components/Toast";
import { PlusCircle } from "lucide-react";
import DeleteServiceConfirmationModal from "./DeleteServiceConfirmationModal";
import ServiceFilterBar from "./ServiceFilterBar";
import ServiceFilterStatusBar from "./ServiceFilterStatusBar";
import ServiceFormModal from "./ServiceFormModal";
import ServiceListByType from "./ServiceListByType";
import EmptyServices from "./EmptyServices";

const ServiceManagementContent = () => {
    const { services, toast } = usePage().props;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ type: "", message: "" });
    const [featureInputs, setFeatureInputs] = useState(['']);
    const [selectedType, setSelectedType] = useState('premium');
    const [filterType, setFilterType] = useState('all');
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);

    // Initialize the form
    const { data, setData, post, put, processing, errors, reset, clearErrors, setError } = useForm({
        title: "",
        description: "",
        icon: "Star",
        type: "premium",
        features: [],
        is_active: true,
    });

    // Filter services based on selected type
    const filteredServices = useMemo(() => {
        if (!services) return [];
        if (filterType === 'all') return services;

        return services.filter(service => service.type === filterType);
    }, [services, filterType]);

    // Group services by type for display
    const groupedServices = useMemo(() => {
        if (!filteredServices) return {};

        return filteredServices.reduce((acc, service) => {
            if (!acc[service.type]) {
                acc[service.type] = [];
            }
            acc[service.type].push(service);
            return acc;
        }, {});
    }, [filteredServices]);

    // Check for flash messages on page load or when toast changes
    useEffect(() => {
        if (toast) {
            setToastMessage({ type: toast.type, message: toast.message });
            if (toast.type === "success") {
                setIsModalOpen(false);
                reset();
                setFeatureInputs(['']);
            }
            setShowToast(true);

            // Auto-close toast after 5 seconds
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [toast]);

    const openModal = (service = null) => {
        setEditingService(service);
        clearErrors();

        if (service) {
            const serviceFeatures = service.features || [];

            setData({
                title: service.title,
                description: service.description,
                icon: service.icon,
                type: service.type,
                features: serviceFeatures,
                is_active: service.is_active,
            });

            setSelectedType(service.type);

            // Setup feature inputs for editing
            if (service.type === 'additional' && serviceFeatures.length > 0) {
                setFeatureInputs(serviceFeatures);
            } else {
                setFeatureInputs(['']);
            }
        } else {
            reset();
            setData({
                title: "",
                description: "",
                icon: "Star",
                type: "premium",
                features: [],
                is_active: true,
            });
            setSelectedType('premium');
            setFeatureInputs(['']);
        }

        setIsModalOpen(true);
    };

    const handleFeatureChange = (index, value) => {
        const updatedFeatures = [...featureInputs];
        updatedFeatures[index] = value;
        setFeatureInputs(updatedFeatures);

        // Also update the features in the form data
        setData('features', updatedFeatures.filter(feature => feature.trim() !== ''));
    };

    const addFeatureInput = () => {
        setFeatureInputs([...featureInputs, '']);
    };

    const removeFeatureInput = (index) => {
        if (featureInputs.length > 1) {
            const updatedFeatures = [...featureInputs];
            updatedFeatures.splice(index, 1);
            setFeatureInputs(updatedFeatures);

            // Also update the features in the form data
            setData('features', updatedFeatures.filter(feature => feature.trim() !== ''));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Client-side validation
        let hasErrors = false;

        if (!data.title.trim()) {
            setError('title', 'Title is required');
            hasErrors = true;
        }

        if (!data.description.trim()) {
            setError('description', 'Description is required');
            hasErrors = true;
        }

        if (data.type === 'additional' && (!data.features || data.features.length === 0)) {
            setError('features', 'At least one feature is required for additional services');
            hasErrors = true;
        }

        if (hasErrors) {
            return;
        }

        // Filter out empty features
        const filteredFeatures = data.features.filter(feature => feature && feature.trim() !== '');
        setData('features', filteredFeatures);

        if (editingService) {
            put(route('admin.services.update', editingService.id));
        } else {
            post(route('admin.services.store'));
        }
    };

    const openDeleteModal = (service) => {
        setServiceToDelete(service);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setServiceToDelete(null);
    };

    const toggleServiceStatus = (id, currentStatus) => {
        router.patch(route('admin.services.toggle-status', id), {
            onSuccess: () => { },
            onError: () => {
                setToastMessage({
                    type: "error",
                    message: currentStatus ? "Failed to deactivate service" : "Failed to activate service"
                });
                setShowToast(true);
            }
        });
    };

    // Function to get the service type translation for display
    const getServiceTypeLabel = (type) => {
        switch (type) {
            case 'premium':
                return 'Premium Features';
            case 'additional':
                return 'Additional Services';
            case 'exclusive':
                return 'Exclusive Benefits';
            default:
                return type.charAt(0).toUpperCase() + type.slice(1);
        }
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
            <DeleteServiceConfirmationModal
                isOpen={deleteModalOpen}
                onClose={closeDeleteModal}
                service={serviceToDelete}
            />

            {/* Service Form Modal */}
            <ServiceFormModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                editingService={editingService}
                data={data}
                setData={setData}
                errors={errors}
                processing={processing}
                handleSubmit={handleSubmit}
                selectedType={selectedType}
                featureInputs={featureInputs}
                handleFeatureChange={handleFeatureChange}
                addFeatureInput={addFeatureInput}
                removeFeatureInput={removeFeatureInput}
            />

            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 md:p-8">
                        <h1 className="font-cormorant text-3xl md:text-4xl font-light text-white text-center tracking-wide">
                            Manajemen Layanan
                        </h1>
                        <p className="text-center text-white/80 mt-2 max-w-2xl mx-auto">
                            Kelola fitur premium, layanan tambahan, dan benefit eksklusif untuk ditampilkan di website
                        </p>
                    </div>

                    {/* Action Buttons and Filter */}
                    <div className="p-4 md:p-6 bg-gray-50 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
                            <button
                                onClick={() => openModal()}
                                className="w-full md:w-auto bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                            >
                                <PlusCircle className="w-4 h-4 mr-2 inline-block" />
                                Tambah Layanan
                            </button>

                            {/* Type Filter */}
                            <ServiceFilterBar
                                filterType={filterType}
                                setFilterType={setFilterType}
                            />
                        </div>
                    </div>

                    {/* Filter Status */}
                    {filterType !== "all" && (
                        <ServiceFilterStatusBar
                            filterType={filterType}
                            setFilterType={setFilterType}
                            filteredCount={filteredServices.length}
                            getServiceTypeLabel={getServiceTypeLabel}
                        />
                    )}

                    {/* Services List */}
                    <div className="p-6 md:p-8">
                        {Object.keys(groupedServices).length > 0 ? (
                            <div className="space-y-10">
                                {Object.entries(groupedServices).map(([type, typeServices]) => (
                                    <ServiceListByType
                                        key={type}
                                        type={type}
                                        services={typeServices}
                                        getServiceTypeLabel={getServiceTypeLabel}
                                        onEdit={openModal}
                                        onDelete={openDeleteModal}
                                        onToggleStatus={toggleServiceStatus}
                                    />
                                ))}
                            </div>
                        ) : (
                            <EmptyServices onAddNew={() => openModal()} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceManagementContent;

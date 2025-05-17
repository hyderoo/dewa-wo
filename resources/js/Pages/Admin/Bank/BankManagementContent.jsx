import React, { useState, useEffect, useRef } from "react";
import { router, useForm } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import Toast from "@/Components/Toast";
import {
    AlertTriangle,
    Upload,
    X,
    Save,
    Building
} from "lucide-react";
import DeleteBankConfirmationModal from "./DeleteBankConfirmationModal";

const BankManagementContent = () => {
    const { banks, toast } = usePage().props;

    const fileInputRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBank, setEditingBank] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ type: "", message: "" });
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [bankToDelete, setBankToDelete] = useState(null);

    // Initialize the form
    const { data, setData, post, processing, errors, reset, clearErrors, setError } = useForm({
        name: "",
        code: "",
        account_number: "",
        account_name: "",
        branch: "",
        logo: null,
        _logo: "", // Store existing logo URL for display
        is_active: true,
        description: "",
        _method: "PUT",  // For spoofing PUT method in POST requests
    });

    // Check for flash messages on page load or when toast changes
    useEffect(() => {
        if (toast) {
            setToastMessage({ type: toast.type, message: toast.message });
            if (toast.type === "success") {
                setIsModalOpen(false);
                reset();
                setImagePreview(null);
            }
            setUploading(false);
            setShowToast(true);

            // Auto-close toast after 5 seconds
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handleInputChange = (e) => {
        const { name, value, type, checked, files } = e.target;

        if (type === 'file') {
            if (files && files.length > 0) {
                // Validate file type
                const file = files[0];
                const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];

                if (!validTypes.includes(file.type)) {
                    setError('logo', 'Please select a valid image file (JPEG, PNG, GIF)');
                    return;
                }

                // Validate file size (2MB max)
                if (file.size > 2 * 1024 * 1024) {
                    setError('logo', 'Image size should be less than 2MB');
                    return;
                }

                // Clear previous errors
                clearErrors('logo');

                // Set the file to the form data
                setData('logo', file);

                // Create preview URL for the selected image
                const previewUrl = URL.createObjectURL(file);
                setImagePreview(previewUrl);
            }
        } else if (type === 'checkbox') {
            setData(name, checked);
        } else {
            setData(name, value);
        }
    };

    const openModal = (bank = null) => {
        setEditingBank(bank);
        clearErrors();

        if (bank) {
            setData({
                name: bank.name,
                code: bank.code,
                account_number: bank.account_number,
                account_name: bank.account_name,
                branch: bank.branch || "",
                logo: null, // Reset logo to null to allow new upload
                _logo: bank.logo || "/bank-placeholder.jpg", // Store existing logo URL for display
                is_active: bank.is_active || true,
                description: bank.description || "",
                _method: "PUT",  // For method spoofing
            });
            setImagePreview(bank.logo);
        } else {
            reset();
            setData({
                name: "",
                code: "",
                account_number: "",
                account_name: "",
                branch: "",
                logo: null,
                _logo: "",
                is_active: true,
                description: "",
                _method: "",  // Clear method spoofing for new entries
            });
            setImagePreview(null);
        }

        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Client-side validation
        let hasErrors = false;

        if (!data.name.trim()) {
            setError('name', 'Bank name is required');
            hasErrors = true;
        }

        if (!data.code.trim()) {
            setError('code', 'Bank code is required');
            hasErrors = true;
        }

        if (!data.account_number.trim()) {
            setError('account_number', 'Account number is required');
            hasErrors = true;
        }

        if (!data.account_name.trim()) {
            setError('account_name', 'Account name is required');
            hasErrors = true;
        }

        if (hasErrors) {
            return;
        }

        // Create FormData for file uploads
        const formData = new FormData();

        // Add all form fields to FormData
        formData.append('name', data.name);
        formData.append('code', data.code);
        formData.append('account_number', data.account_number);
        formData.append('account_name', data.account_name);
        formData.append('branch', data.branch || '');
        formData.append('is_active', data.is_active ? '1' : '0');
        formData.append('description', data.description || '');

        // Only append logo if it's a File object
        if (data.logo instanceof File) {
            console.log('Appending logo file to form data:', data.logo.name);
            formData.append('logo', data.logo);
        }

        // Add method spoofing for updates
        if (editingBank) {
            formData.append('_method', 'PUT');
        }

        // For debugging - log form data
        console.log("Form data entries:");
        for (let pair of formData.entries()) {
            console.log(pair[0] + ': ' + (pair[1] instanceof File ? pair[1].name : pair[1]));
        }

        setUploading(true);

        const options = {
            preserveState: false,
            preserveScroll: true,
            forceFormData: true,
            onSuccess: () => {
                setUploading(false);
            },
            onError: (errors) => {
                setUploading(false);
                console.error('Form submission errors:', errors);

                // Handle validation errors
                if (errors.logo) {
                    setToastMessage({
                        type: "error",
                        message: errors.logo
                    });
                    setShowToast(true);
                }
            }
        };

        if (editingBank) {
            post(route('admin.banks.update', editingBank.id), formData, options);
        } else {
            post(route('admin.banks.store'), formData, options);
        }
    };

    const openDeleteModal = (bank) => {
        setBankToDelete(bank);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setBankToDelete(null);
    };

    const toggleActive = (bank) => {
        router.patch(route('admin.banks.toggle-active', bank.id), {}, {
            preserveScroll: true,
            onError: () => {
                setToastMessage({
                    type: "error",
                    message: "Failed to toggle bank status"
                });
                setShowToast(true);
            }
        });
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
            <DeleteBankConfirmationModal
                isOpen={deleteModalOpen}
                onClose={closeDeleteModal}
                bank={bankToDelete}
            />

            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 md:p-8">
                        <h1 className="text-3xl md:text-4xl font-semibold text-white text-center tracking-wide">
                            Bank Account Management
                        </h1>
                        <p className="text-center text-white/80 mt-2 max-w-2xl mx-auto">
                            Manage your bank accounts efficiently and professionally
                        </p>
                    </div>

                    {/* Action Button */}
                    <div className="p-4 md:p-6 bg-gray-50 border-b border-gray-200">
                        <button
                            onClick={() => openModal()}
                            className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            + Add New Bank Account
                        </button>
                    </div>

                    {/* Bank Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 md:p-8">
                        {banks && banks.length > 0 ? (
                            banks.map((bank) => (
                                <div
                                    key={bank.id}
                                    className={`bg-white border ${bank.is_active ? 'border-blue-500 ring-2 ring-blue-300' : 'border-gray-200'} rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden`}
                                >
                                    <div className="p-6">
                                        {bank.is_active && (
                                            <div className="mb-2">
                                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                    Active Bank
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center mb-4">
                                            <img
                                                src={bank.logo || '/bank-placeholder.jpg'}
                                                alt={bank.name}
                                                className={`w-16 h-16 rounded-full object-cover mr-4 border-2 ${bank.is_active ? 'border-blue-500' : 'border-gray-200'}`}
                                            />
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800">{bank.name}</h3>
                                                <p className="text-sm text-gray-500">{bank.code}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center">
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-500">Account Number</p>
                                                    <p className="font-medium">{bank.account_number}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center">
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-500">Account Name</p>
                                                    <p className="font-medium">{bank.account_name}</p>
                                                </div>
                                            </div>

                                            {bank.branch && (
                                                <div className="flex items-center">
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-500">Branch</p>
                                                        <p className="font-medium">{bank.branch}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                                            <button
                                                onClick={() => toggleActive(bank)}
                                                className={`px-3 py-1 rounded-full text-sm ${bank.is_active
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                                            >
                                                {bank.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => openModal(bank)}
                                                    className="text-blue-500 hover:text-blue-700 text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(bank)}
                                                    className="text-red-500 hover:text-red-700 text-sm"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12">
                                <Building className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">No banks added</h3>
                                <p className="mt-1 text-sm text-gray-500">Get started by adding a new bank account</p>
                                <div className="mt-6">
                                    <button
                                        onClick={() => openModal()}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        + Add New Bank
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal is similar to the one in team management */}
            {/* Render the modal similar to TeamManagementContent */}
            {/* Modal content would be similar with bank-specific fields */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
                        {/* Fixed Header */}
                        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {editingBank ? "Edit Bank Account" : "Add New Bank Account"}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Scrollable Form Content */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="bankForm" onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
                                {/* Name Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bank Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="Enter bank name"
                                    />
                                    {errors.name && (
                                        <div className="text-red-500 text-sm mt-1">{errors.name}</div>
                                    )}
                                </div>

                                {/* Bank Code Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bank Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="code"
                                        value={data.code}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border ${errors.code ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="Enter bank code"
                                    />
                                    {errors.code && (
                                        <div className="text-red-500 text-sm mt-1">{errors.code}</div>
                                    )}
                                </div>

                                {/* Account Number Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="account_number"
                                        value={data.account_number}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border ${errors.account_number ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="Enter account number"
                                    />
                                    {errors.account_number && (
                                        <div className="text-red-500 text-sm mt-1">{errors.account_number}</div>
                                    )}
                                </div>

                                {/* Account Name Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="account_name"
                                        value={data.account_name}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border ${errors.account_name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="Enter account name"
                                    />
                                    {errors.account_name && (
                                        <div className="text-red-500 text-sm mt-1">{errors.account_name}</div>
                                    )}
                                </div>

                                {/* Branch Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Branch
                                    </label>
                                    <input
                                        type="text"
                                        name="branch"
                                        value={data.branch}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border ${errors.branch ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        placeholder="Enter branch name"
                                    />
                                    {errors.branch && (
                                        <div className="text-red-500 text-sm mt-1">{errors.branch}</div>
                                    )}
                                </div>

                                {/* Logo Upload Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <span>Bank Logo</span>
                                        <span className="ml-2 text-red-500 text-xs font-normal">
                                            {!editingBank ? "(Optional)" : "(Optional)"}
                                        </span>
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-24 h-24 border-2 border-dashed ${errors.logo ? 'border-red-400 bg-red-50' : 'border-gray-300'} rounded-full flex items-center justify-center overflow-hidden`}>
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-center">
                                                    <Building className="w-8 h-8 text-gray-400 mx-auto" />
                                                    {!editingBank && (
                                                        <p className="text-xs text-gray-500 mt-1">Optional</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col space-y-2">
                                            <input
                                                type="file"
                                                name="logo"
                                                id="logo-upload"
                                                ref={fileInputRef}
                                                accept="image/jpeg,image/png,image/gif,image/jpg"
                                                onChange={handleInputChange}
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current.click()}
                                                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 inline-flex items-center"
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                Browse Logo
                                            </button>
                                            {data.logo instanceof File && (
                                                <p className="text-xs text-gray-500">
                                                    Selected: {data.logo.name}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {errors.logo && (
                                        <div className="text-red-500 text-sm mt-1">{errors.logo}</div>
                                    )}
                                </div>

                                {/* Description Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        name="description"
                                        value={data.description}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                        rows="3"
                                        placeholder="Optional description"
                                    ></textarea>
                                    {errors.description && (
                                        <div className="text-red-500 text-sm mt-1">{errors.description}</div>
                                    )}
                                </div>

                                {/* Active Checkbox */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        name="is_active"
                                        checked={data.is_active}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                                        Active
                                    </label>
                                </div>
                            </form>
                        </div>

                        {/* Fixed Footer with Buttons */}
                        <div className="p-6 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-xl z-10">
                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md inline-flex items-center"
                                >
                                    <X className="w-4 h-4 mr-2" />
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="bankForm"
                                    disabled={processing || uploading}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {uploading ? 'Uploading...' : processing ? 'Processing...' : editingBank ? "Update" : "Add"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BankManagementContent;

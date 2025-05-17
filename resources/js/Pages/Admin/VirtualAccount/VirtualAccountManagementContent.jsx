import React, { useState, useEffect, useRef } from "react";
import { router, useForm } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import Toast from "@/Components/Toast";
import {
    AlertTriangle,
    Upload,
    X,
    Save,
    CreditCard,
    Plus,
    Trash,
    Edit2
} from "lucide-react";
import DeleteVirtualAccountConfirmationModal from "./DeleteVirtualAccountConfirmationModal";

const VirtualAccountManagementContent = () => {
    const { virtualAccounts, toast } = usePage().props;

    const fileInputRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingVA, setEditingVA] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ type: "", message: "" });
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [vaToDelete, setVaToDelete] = useState(null);

    // State for payment instructions
    const [instructions, setInstructions] = useState([{ step: "", instruction: "" }]);

    // Initialize the form
    const { data, setData, post, processing, errors, reset, clearErrors, setError } = useForm({
        bank_code: "",
        name: "",
        account_number: "",
        description: "",
        logo: null,
        _logo: "", // Store existing logo URL for display
        is_active: true,
        payment_instructions: [],
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
                setInstructions([{ step: "", instruction: "" }]);
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

    // Handle payment instruction changes
    const handleInstructionChange = (index, field, value) => {
        const updatedInstructions = [...instructions];
        updatedInstructions[index][field] = value;
        setInstructions(updatedInstructions);

        // Update form data
        setData('payment_instructions', updatedInstructions);
    };

    const addInstruction = () => {
        setInstructions([...instructions, { step: "", instruction: "" }]);
    };

    const removeInstruction = (index) => {
        const updatedInstructions = instructions.filter((_, i) => i !== index);
        setInstructions(updatedInstructions);
        setData('payment_instructions', updatedInstructions);
    };

    const openModal = (virtualAccount = null) => {
        setEditingVA(virtualAccount);
        clearErrors();

        if (virtualAccount) {
            setData({
                bank_code: virtualAccount.bank_code,
                name: virtualAccount.name,
                account_number: virtualAccount.account_number || "",
                description: virtualAccount.description || "",
                logo: null, // Reset logo to null to allow new upload
                _logo: virtualAccount.logo || "/va-placeholder.jpg", // Store existing logo URL for display
                is_active: virtualAccount.is_active || true,
                payment_instructions: virtualAccount.payment_instructions || [],
                _method: "PUT",  // For method spoofing
            });

            // Set instructions from existing VA
            if (virtualAccount.payment_instructions && virtualAccount.payment_instructions.length > 0) {
                setInstructions(virtualAccount.payment_instructions);
            } else {
                setInstructions([{ step: "", instruction: "" }]);
            }

            setImagePreview(virtualAccount.logo);
        } else {
            reset();
            setData({
                bank_code: "",
                name: "",
                account_number: "",
                description: "",
                logo: null,
                _logo: "",
                is_active: true,
                payment_instructions: [],
                _method: "",  // Clear method spoofing for new entries
            });
            setImagePreview(null);
            setInstructions([{ step: "", instruction: "" }]);
        }

        setIsModalOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Client-side validation
        let hasErrors = false;

        if (!data.bank_code.trim()) {
            setError('bank_code', 'Bank code is required');
            hasErrors = true;
        }

        if (!data.name.trim()) {
            setError('name', 'Virtual Account name is required');
            hasErrors = true;
        }

        // Validate payment instructions
        if (instructions.some(instr => !instr.step.trim() || !instr.instruction.trim())) {
            setError('payment_instructions', 'All payment instructions must have both step and instruction filled');
            hasErrors = true;
        }

        if (hasErrors) {
            return;
        }

        // Update payment instructions in form data
        setData('payment_instructions', instructions);

        // Create FormData for file uploads
        const formData = new FormData();

        // Add all form fields to FormData
        formData.append('bank_code', data.bank_code);
        formData.append('name', data.name);
        formData.append('account_number', data.account_number || '');
        formData.append('description', data.description || '');
        formData.append('is_active', data.is_active ? '1' : '0');

        // Add payment instructions as JSON
        formData.append('payment_instructions', JSON.stringify(instructions));

        // Only append logo if it's a File object
        if (data.logo instanceof File) {
            console.log('Appending logo file to form data:', data.logo.name);
            formData.append('logo', data.logo);
        }

        // Add method spoofing for updates
        if (editingVA) {
            formData.append('_method', 'PUT');
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

        if (editingVA) {
            post(route('admin.virtual-accounts.update', editingVA.id), formData, options);
        } else {
            post(route('admin.virtual-accounts.store'), formData, options);
        }
    };

    const openDeleteModal = (virtualAccount) => {
        setVaToDelete(virtualAccount);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setVaToDelete(null);
    };

    const toggleActive = (virtualAccount) => {
        router.patch(route('admin.virtual-accounts.toggle-active', virtualAccount.id), {}, {
            preserveScroll: true,
            onError: () => {
                setToastMessage({
                    type: "error",
                    message: "Failed to toggle virtual account status"
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
            <DeleteVirtualAccountConfirmationModal
                isOpen={deleteModalOpen}
                onClose={closeDeleteModal}
                virtualAccount={vaToDelete}
            />

            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-6 md:p-8">
                        <h1 className="text-3xl md:text-4xl font-semibold text-white text-center tracking-wide">
                            Virtual Account Management
                        </h1>
                        <p className="text-center text-white/80 mt-2 max-w-2xl mx-auto">
                            Manage virtual accounts for Midtrans payment gateway
                        </p>
                    </div>

                    {/* Action Button */}
                    <div className="p-4 md:p-6 bg-gray-50 border-b border-gray-200">
                        <button
                            onClick={() => openModal()}
                            className="w-full md:w-auto bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                        >
                            + Add New Virtual Account
                        </button>
                    </div>

                    {/* Virtual Account Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 md:p-8">
                        {virtualAccounts && virtualAccounts.length > 0 ? (
                            virtualAccounts.map((va) => (
                                <div
                                    key={va.id}
                                    className={`bg-white border ${va.is_active ? 'border-purple-500 ring-2 ring-purple-300' : 'border-gray-200'} rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden`}
                                >
                                    <div className="p-6">
                                        {va.is_active && (
                                            <div className="mb-2">
                                                <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                    Active
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex items-center mb-4">
                                            <img
                                                src={va.logo || '/va-placeholder.jpg'}
                                                alt={va.name}
                                                className={`w-16 h-16 rounded-full object-cover mr-4 border-2 ${va.is_active ? 'border-purple-500' : 'border-gray-200'}`}
                                            />
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-800">{va.name}</h3>
                                                <p className="text-sm text-gray-500">{va.bank_code}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-2 mb-4">
                                            {va.account_number && (
                                                <div className="flex items-center">
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-500">Account Number</p>
                                                        <p className="font-medium">{va.account_number}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {va.description && (
                                                <div className="flex items-center">
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-500">Description</p>
                                                        <p className="font-medium">{va.description}</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center">
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-500">Payment Instructions</p>
                                                    <p className="font-medium">{va.payment_instructions?.length || 0} steps</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                                            <button
                                                onClick={() => toggleActive(va)}
                                                className={`px-3 py-1 rounded-full text-sm ${va.is_active
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
                                            >
                                                {va.is_active ? 'Active' : 'Inactive'}
                                            </button>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => openModal(va)}
                                                    className="text-blue-500 hover:text-blue-700 text-sm"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(va)}
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
                                <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-2 text-sm font-semibold text-gray-900">No virtual accounts added</h3>
                                <p className="mt-1 text-sm text-gray-500">Get started by adding a new virtual account</p>
                                <div className="mt-6">
                                    <button
                                        onClick={() => openModal()}
                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                                    >
                                        + Add New Virtual Account
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Virtual Account Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
                        {/* Fixed Header */}
                        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10 flex justify-between items-center">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {editingVA ? "Edit Virtual Account" : "Add New Virtual Account"}
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
                            <form id="vaForm" onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
                                {/* Bank Code Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Bank Code <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="bank_code"
                                        value={data.bank_code}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border ${errors.bank_code ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                        placeholder="e.g., bca, bni, mandiri"
                                    />
                                    {errors.bank_code && (
                                        <div className="text-red-500 text-sm mt-1">{errors.bank_code}</div>
                                    )}
                                </div>

                                {/* Name Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Virtual Account Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                        placeholder="Enter name (e.g., BCA Virtual Account)"
                                    />
                                    {errors.name && (
                                        <div className="text-red-500 text-sm mt-1">{errors.name}</div>
                                    )}
                                </div>

                                {/* Account Number Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Account Number <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="account_number"
                                        value={data.account_number}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border ${errors.account_number ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                        placeholder="Virtual Account number (if fixed)"
                                    />
                                    {errors.account_number && (
                                        <div className="text-red-500 text-sm mt-1">{errors.account_number}</div>
                                    )}
                                </div>

                                {/* Logo Upload Field */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <span>Bank Logo</span>
                                        <span className="ml-2 text-gray-400 text-xs font-normal">(Optional)</span>
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
                                                    <CreditCard className="w-8 h-8 text-gray-400 mx-auto" />
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
                                                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 inline-flex items-center"
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
                                        Description <span className="text-gray-400 text-xs font-normal">(Optional)</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={data.description}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500`}
                                        rows="3"
                                        placeholder="Optional description of this virtual account"
                                    ></textarea>
                                    {errors.description && (
                                        <div className="text-red-500 text-sm mt-1">{errors.description}</div>
                                    )}
                                </div>

                                {/* Payment Instructions */}
                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Payment Instructions <span className="text-red-500">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={addInstruction}
                                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-purple-700 bg-purple-100 hover:bg-purple-200"
                                        >
                                            <Plus className="w-3 h-3 mr-1" />
                                            Add Step
                                        </button>
                                    </div>

                                    {errors.payment_instructions && (
                                        <div className="text-red-500 text-sm mb-2">{errors.payment_instructions}</div>
                                    )}

                                    <div className="space-y-3 bg-gray-50 p-3 rounded-md">
                                        {instructions.map((instruction, index) => (
                                            <div key={index} className="flex space-x-2 items-start">
                                                <div className="flex-1">
                                                    <div className="mb-1">
                                                        <input
                                                            type="text"
                                                            placeholder="Step title (e.g., Open Mobile Banking)"
                                                            value={instruction.step}
                                                            onChange={(e) => handleInstructionChange(index, 'step', e.target.value)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                                        />
                                                    </div>
                                                    <div>
                                                        <textarea
                                                            placeholder="Detailed instruction"
                                                            value={instruction.instruction}
                                                            onChange={(e) => handleInstructionChange(index, 'instruction', e.target.value)}
                                                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                                                            rows="2"
                                                        ></textarea>
                                                    </div>
                                                </div>
                                                {instructions.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeInstruction(index)}
                                                        className="mt-1 p-1 text-red-500 hover:bg-red-100 rounded"
                                                    >
                                                        <Trash className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Active Checkbox */}
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        name="is_active"
                                        checked={data.is_active}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
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
                                    form="vaForm"
                                    disabled={processing || uploading}
                                    className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {uploading ? 'Uploading...' : processing ? 'Processing...' : editingVA ? "Update" : "Add"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VirtualAccountManagementContent;

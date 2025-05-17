import React, { useState, useEffect, useRef } from "react";
import { router, useForm } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import Toast from "@/Components/Toast";
import {
    AlertTriangle,
    Upload,
    X,
    Save
} from "lucide-react";
import DeleteTeamConfirmationModal from "./DeleteTeamConfirmationModal";

const TeamManagementContent = () => {
    const { teams, toast } = usePage().props;

    const fileInputRef = useRef(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ type: "", message: "" });
    const [imagePreview, setImagePreview] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [teamToDelete, setTeamToDelete] = useState(null);

    // Initialize the form
    const { data, setData, post, processing, errors, reset, clearErrors, setError } = useForm({
        name: "",
        role: "",
        description: "",
        image: null,
        _image: "", // Store existing image URL for display
        instagram: "",
        linkedin: "",
        is_highlighted: false,
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
                    setError('image', 'Please select a valid image file (JPEG, PNG, GIF)');
                    return;
                }

                // Validate file size (2MB max)
                if (file.size > 2 * 1024 * 1024) {
                    setError('image', 'Image size should be less than 2MB');
                    return;
                }

                // Clear previous errors
                clearErrors('image');

                // Set the file to the form data
                setData('image', file);

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

    const openModal = (member = null) => {
        setEditingMember(member);
        clearErrors();

        if (member) {
            setData({
                name: member.name,
                role: member.role,
                description: member.description,
                image: null, // Reset image to null to allow new upload
                _image: member.image || "/tim.jpg", // Store existing image URL for display
                instagram: member.instagram || "",
                linkedin: member.linkedin || "",
                is_highlighted: member.is_highlighted || false,
                _method: "PUT",  // For method spoofing
            });
            setImagePreview(member.image);
        } else {
            reset();
            setData({
                name: "",
                role: "",
                description: "",
                image: null,
                _image: "",
                instagram: "",
                linkedin: "",
                is_highlighted: false,
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
            setError('name', 'Name is required');
            hasErrors = true;
        }

        if (!data.role.trim()) {
            setError('role', 'Role is required');
            hasErrors = true;
        }

        if (!data.description.trim()) {
            setError('description', 'Description is required');
            hasErrors = true;
        }

        if (!editingMember && !data.image) {
            setError('image', 'Image is required for new team members');
            hasErrors = true;
        }

        if (hasErrors) {
            return;
        }

        // Create FormData for file uploads
        const formData = new FormData();

        // Add all form fields to FormData
        formData.append('name', data.name);
        formData.append('role', data.role);
        formData.append('description', data.description);
        formData.append('instagram', data.instagram || '');
        formData.append('linkedin', data.linkedin || '');
        formData.append('is_highlighted', data.is_highlighted ? '1' : '0');

        // Only append image if it's a File object
        if (data.image instanceof File) {
            console.log('Appending image file to form data:', data.image.name);
            formData.append('image', data.image);
        }

        // Add method spoofing for updates
        if (editingMember) {
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
                if (errors.image) {
                    setToastMessage({
                        type: "error",
                        message: errors.image
                    });
                    setShowToast(true);
                }
            }
        };

        if (editingMember) {
            post(route('admin.teams.update', editingMember.id), formData, options);
        } else {
            post(route('admin.teams.store'), formData, options);
        }
    };

    const openDeleteModal = (member) => {
        setTeamToDelete(member);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setTeamToDelete(null);
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
            <DeleteTeamConfirmationModal
                isOpen={deleteModalOpen}
                onClose={closeDeleteModal}
                teamMember={teamToDelete}
            />

            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 md:p-8">
                        <h1 className="font-cormorant text-3xl md:text-4xl font-light text-white text-center tracking-wide">
                            Manajemen Tim Profesional
                        </h1>
                        <p className="text-center text-white/80 mt-2 max-w-2xl mx-auto">
                            Kelola informasi dan struktur tim Anda dengan efisien dan profesional
                        </p>
                    </div>

                    {/* Action Button */}
                    <div className="p-4 md:p-6 bg-gray-50 border-b border-gray-200">
                        <button
                            onClick={() => openModal()}
                            className="w-full md:w-auto bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                        >
                            + Tambah Anggota Tim
                        </button>
                    </div>

                    {/* Team Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 md:p-8">
                        {teams && teams.map((member) => (
                            <div
                                key={member.id}
                                className={`bg-white border ${member.is_highlighted ? 'border-pink-500 ring-2 ring-pink-300' : 'border-gray-200'} rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden`}
                            >
                                <div className="p-6">
                                    {member.is_highlighted && (
                                        <div className="mb-2">
                                            <span className="bg-pink-100 text-pink-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                                Highlighted Team Member
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center mb-4">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className={`w-16 h-16 rounded-full object-cover mr-4 border-2 ${member.is_highlighted ? 'border-pink-500' : 'border-pink-100'}`}
                                        />
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800">{member.name}</h3>
                                            <p className="text-sm text-gray-500">{member.role}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 mb-4 text-sm">{member.description}</p>
                                    <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                                        <div className="flex space-x-3">
                                            {member.instagram && (
                                                <a
                                                    href={member.instagram}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-pink-600 hover:text-pink-800 transition-colors"
                                                >
                                                    Instagram
                                                </a>
                                            )}
                                            {member.linkedin && (
                                                <a
                                                    href={member.linkedin}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-pink-600 hover:text-pink-800 transition-colors"
                                                >
                                                    LinkedIn
                                                </a>
                                            )}
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => openModal(member)}
                                                className="text-blue-500 hover:text-blue-700 text-sm"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(member)}
                                                className="text-red-500 hover:text-red-700 text-sm"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
                        {/* Fixed Header */}
                        <div className="p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {editingMember ? "Edit Anggota Tim" : "Tambah Anggota Tim Baru"}
                            </h2>
                        </div>

                        {/* Scrollable Form Content */}
                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="teamForm" onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nama Lengkap <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500`}
                                        placeholder="Masukkan nama lengkap"
                                    />
                                    {errors.name && (
                                        <div className="text-red-500 text-sm mt-1">{errors.name}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Posisi/Jabatan <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        name="role"
                                        value={data.role}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border ${errors.role ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500`}
                                        placeholder="Masukkan posisi"
                                    />
                                    {errors.role && (
                                        <div className="text-red-500 text-sm mt-1">{errors.role}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Deskripsi <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        name="description"
                                        value={data.description}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500`}
                                        rows="4"
                                        placeholder="Tuliskan deskripsi singkat"
                                    />
                                    {errors.description && (
                                        <div className="text-red-500 text-sm mt-1">{errors.description}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                                        <span>Profile Photo</span>
                                        <span className="ml-2 text-red-500 text-xs font-normal">
                                            {!editingMember ? "*Required" : "(Optional)"}
                                        </span>
                                    </label>
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-24 h-24 border-2 border-dashed ${errors.image ? 'border-red-400 bg-red-50' : 'border-gray-300'} rounded-full flex items-center justify-center overflow-hidden`}>
                                            {imagePreview ? (
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="text-center">
                                                    <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                                                    </svg>
                                                    {!editingMember && (
                                                        <p className="text-xs text-gray-500 mt-1">Required</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col space-y-2">
                                            <input
                                                type="file"
                                                name="image"
                                                id="image-upload"
                                                ref={fileInputRef}
                                                accept="image/jpeg,image/png,image/gif,image/jpg"
                                                onChange={handleInputChange}
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current.click()}
                                                className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 inline-flex items-center"
                                            >
                                                <Upload className="w-4 h-4 mr-2" />
                                                Browse Image
                                            </button>
                                            {data.image instanceof File && (
                                                <p className="text-xs text-gray-500">
                                                    Selected: {data.image.name}
                                                </p>
                                            )}
                                            {!editingMember && !data.image && (
                                                <p className="text-xs text-red-500">
                                                    <AlertTriangle className="w-3 h-3 inline mr-1" />
                                                    Image is required for new team members
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    {errors.image && (
                                        <div className="text-red-500 text-sm mt-1">{errors.image}</div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Link Instagram
                                    </label>
                                    <input
                                        type="url"
                                        name="instagram"
                                        value={data.instagram}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border ${errors.instagram ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500`}
                                        placeholder="https://instagram.com/username"
                                    />
                                    {errors.instagram && (
                                        <div className="text-red-500 text-sm mt-1">{errors.instagram}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Link LinkedIn
                                    </label>
                                    <input
                                        type="url"
                                        name="linkedin"
                                        value={data.linkedin}
                                        onChange={handleInputChange}
                                        className={`w-full px-3 py-2 border ${errors.linkedin ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500`}
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                    {errors.linkedin && (
                                        <div className="text-red-500 text-sm mt-1">{errors.linkedin}</div>
                                    )}
                                </div>

                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="is_highlighted"
                                        name="is_highlighted"
                                        checked={data.is_highlighted}
                                        onChange={handleInputChange}
                                        className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="is_highlighted" className="ml-2 block text-sm text-gray-700">
                                        Highlight this team member (will remove highlight from others)
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
                                    Batalkan
                                </button>
                                <button
                                    type="submit"
                                    form="teamForm"
                                    disabled={processing || uploading || (!editingMember && !data.image)}
                                    className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {uploading ? 'Uploading...' : processing ? 'Processing...' : editingMember ? "Update" : "Tambah"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamManagementContent;

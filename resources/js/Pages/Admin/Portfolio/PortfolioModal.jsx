import React, { useState, useRef, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { Save, X } from "lucide-react";
import PortfolioFormFields from "./PortfolioFormFields";
import PortfolioImageUploader from "./PortfolioImageUploader";

const PortfolioModal = ({ isOpen, setIsOpen, editingPortfolio, categories }) => {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    // State for multi-image support
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagesToDelete, setImagesToDelete] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Initialize the form
    const { data, setData, post, processing, errors, reset, clearErrors, setError } = useForm({
        title: editingPortfolio ? editingPortfolio.title : "",
        category: editingPortfolio ? editingPortfolio.category : categories[0],
        description: editingPortfolio ? editingPortfolio.description : "",
        images: [],
        delete_image_ids: [],
        _method: editingPortfolio ? "PUT" : "",  // For spoofing PUT method in POST requests
    });

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            if (files && files.length > 0) {
                const fileArray = Array.from(files);
                const newImages = [];

                // Validate files
                let hasError = false;
                for (let i = 0; i < fileArray.length; i++) {
                    const file = fileArray[i];
                    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];

                    if (!validTypes.includes(file.type)) {
                        setError('images', 'Please select valid image files (JPEG, PNG, GIF)');
                        hasError = true;
                        break;
                    }

                    if (file.size > 2 * 1024 * 1024) {
                        setError('images', 'Image size should be less than 2MB');
                        hasError = true;
                        break;
                    }

                    newImages.push(file);
                }

                if (hasError) return;

                // Clear previous errors
                clearErrors('images');

                // Set the files to state
                setSelectedImages(prevImages => [...prevImages, ...newImages]);
                setData(prevData => ({
                    ...prevData,
                    images: [...prevData.images, ...newImages]
                }));
            }
        } else {
            setData(name, value);
        }
    };

    const removeSelectedImage = (index) => {
        const newSelectedImages = [...selectedImages];
        newSelectedImages.splice(index, 1);
        setSelectedImages(newSelectedImages);

        const newImages = [...data.images];
        newImages.splice(index, 1);

        setData({
            ...data,
            images: newImages
        });
    };

    const toggleImageDeletion = (imageId) => {
        const updatedImagesToDelete = [...imagesToDelete];
        const index = updatedImagesToDelete.indexOf(imageId);

        if (index === -1) {
            updatedImagesToDelete.push(imageId);
        } else {
            updatedImagesToDelete.splice(index, 1);
        }

        setImagesToDelete(updatedImagesToDelete);
        setData('delete_image_ids', updatedImagesToDelete);
    };

    const navigateImage = (direction) => {
        if (!editingPortfolio || !editingPortfolio.images) return;

        const totalImages = editingPortfolio.images.length;
        if (totalImages <= 1) return;

        let newIndex;
        if (direction === 'next') {
            newIndex = (currentImageIndex + 1) % totalImages;
        } else {
            newIndex = (currentImageIndex - 1 + totalImages) % totalImages;
        }

        setCurrentImageIndex(newIndex);
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

        if (!editingPortfolio && data.images.length === 0) {
            setError('images', 'At least one image is required for new portfolios');
            hasErrors = true;
        }

        if (hasErrors) {
            return;
        }

        // Create FormData for file uploads
        const formData = new FormData();

        // Add all form fields to FormData
        formData.append('title', data.title);
        formData.append('category', data.category);
        formData.append('description', data.description);

        // Append all selected images to FormData
        data.images.forEach((image, index) => {
            formData.append(`images[${index}]`, image);
        });

        // Add image IDs to delete if editing
        if (editingPortfolio && imagesToDelete.length > 0) {
            imagesToDelete.forEach(id => {
                formData.append('delete_image_ids[]', id);
            });
        }

        // Add method spoofing for updates
        if (editingPortfolio) {
            formData.append('_method', 'PUT');
        }

        setUploading(true);

        const options = {
            preserveState: false,
            preserveScroll: true,
            forceFormData: true,
        };

        if (editingPortfolio) {
            post(route('admin.portfolios.update', editingPortfolio.id), formData, options);
        } else {
            post(route('admin.portfolios.store'), formData, options);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                {/* Fixed Header */}
                <div className="p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {editingPortfolio ? "Edit Portfolio" : "Tambah Portfolio Baru"}
                    </h2>
                </div>

                {/* Scrollable Form Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    <form id="portfolioForm" onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
                        {/* Form Fields */}
                        <PortfolioFormFields
                            data={data}
                            errors={errors}
                            categories={categories}
                            handleInputChange={handleInputChange}
                        />

                        {/* Image Uploader */}
                        <PortfolioImageUploader
                            fileInputRef={fileInputRef}
                            selectedImages={selectedImages}
                            imagesToDelete={imagesToDelete}
                            currentImageIndex={currentImageIndex}
                            setCurrentImageIndex={setCurrentImageIndex}
                            editingPortfolio={editingPortfolio}
                            errors={errors}
                            handleInputChange={handleInputChange}
                            removeSelectedImage={removeSelectedImage}
                            toggleImageDeletion={toggleImageDeletion}
                            navigateImage={navigateImage}
                        />
                    </form>
                </div>

                {/* Fixed Footer with Buttons */}
                <div className="p-6 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-xl z-10">
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md inline-flex items-center"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="portfolioForm"
                            disabled={processing || uploading || (!editingPortfolio && selectedImages.length === 0)}
                            className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {uploading ? 'Uploading...' : processing ? 'Processing...' : editingPortfolio ? "Update" : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PortfolioModal;

import React from "react";
import {
    Plus,
    Trash,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

const PortfolioImageUploader = ({
    fileInputRef,
    selectedImages,
    imagesToDelete,
    currentImageIndex,
    setCurrentImageIndex,
    editingPortfolio,
    errors,
    handleInputChange,
    removeSelectedImage,
    toggleImageDeletion,
    navigateImage
}) => {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700 flex items-center">
                    <span>Images</span>
                    <span className="ml-2 text-red-500 text-xs font-normal">
                        {!editingPortfolio ? "*Required" : ""}
                    </span>
                </label>
                <input
                    type="file"
                    name="images"
                    id="images-upload"
                    ref={fileInputRef}
                    accept="image/jpeg,image/png,image/gif,image/jpg"
                    onChange={handleInputChange}
                    className="hidden"
                    multiple
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current.click()}
                    className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 inline-flex items-center text-sm"
                >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Images
                </button>
            </div>

            {/* Display selected new images */}
            {selectedImages.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">New Images</h4>
                    <div className="grid grid-cols-4 gap-3">
                        {selectedImages.map((image, index) => (
                            <div
                                key={`new-${index}`}
                                className="relative h-24 rounded-md border border-gray-200 overflow-hidden group"
                            >
                                <img
                                    src={URL.createObjectURL(image)}
                                    alt={`Selected ${index}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                    <div className="flex space-x-1">
                                        <button
                                            type="button"
                                            onClick={() => removeSelectedImage(index)}
                                            className="p-1 rounded-full bg-white/70 text-red-600 hover:bg-white"
                                            title="Remove image"
                                        >
                                            <Trash className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Display existing images if editing */}
            {editingPortfolio && editingPortfolio.images && editingPortfolio.images.length > 0 && (
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="text-sm font-medium text-gray-700">Current Images</h4>
                        <div className="flex space-x-2 items-center">
                            {editingPortfolio.images.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={() => navigateImage('prev')}
                                        className="p-1 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-xs text-gray-500">
                                        {currentImageIndex + 1}/{editingPortfolio.images.length}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => navigateImage('next')}
                                        className="p-1 rounded-full bg-gray-200 text-gray-600 hover:bg-gray-300"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="relative h-56 bg-gray-100 rounded-lg overflow-hidden">
                        {editingPortfolio.images.length > 0 && (
                            <>
                                <img
                                    src={editingPortfolio.images[currentImageIndex]?.path}
                                    alt={`Portfolio image ${currentImageIndex + 1}`}
                                    className="w-full h-full object-contain"
                                />

                                <div className="absolute top-2 right-2 flex space-x-2">
                                    {!imagesToDelete.includes(editingPortfolio.images[currentImageIndex]?.id) && (
                                        <button
                                            type="button"
                                            disabled={editingPortfolio.images.length <= 1}
                                            onClick={() => toggleImageDeletion(editingPortfolio.images[currentImageIndex]?.id)}
                                            className={`p-1.5 rounded-full bg-red-100 text-red-600 hover:bg-red-200 ${editingPortfolio.images.length <= 1 ? 'opacity-50 cursor-not-allowed' : ''
                                                }`}
                                            title={editingPortfolio.images.length <= 1 ? "Cannot delete the only image" : "Mark for deletion"}
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>

                                {imagesToDelete.includes(editingPortfolio.images[currentImageIndex]?.id) && (
                                    <div className="absolute inset-0 bg-red-100/80 flex flex-col items-center justify-center">
                                        <p className="text-red-700 font-medium mb-2">Marked for deletion</p>
                                        <button
                                            type="button"
                                            onClick={() => toggleImageDeletion(editingPortfolio.images[currentImageIndex]?.id)}
                                            className="px-3 py-1 bg-white text-red-600 rounded-md border border-red-300 text-sm hover:bg-red-50"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {editingPortfolio.images.length > 1 && (
                        <div className="flex mt-2 overflow-x-auto pb-2 gap-2">
                            {editingPortfolio.images.map((img, idx) => (
                                <div
                                    key={img.id}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden cursor-pointer border-2 ${currentImageIndex === idx ? 'border-pink-500' : 'border-transparent'
                                        } ${imagesToDelete.includes(img.id) ? 'opacity-40' : ''}`}
                                >
                                    <img
                                        src={img.path}
                                        alt={`Thumbnail ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {errors.images && (
                <div className="text-red-500 text-sm mt-1">{errors.images}</div>
            )}
        </div>
    );
};

export default PortfolioImageUploader;

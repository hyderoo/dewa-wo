import React from "react";
import { X } from "lucide-react";
import CatalogForm from "./CatalogForm";

const CatalogFormModal = ({
    isOpen,
    selectedService,
    data,
    setData,
    errors,
    minPriceFormatted,
    maxPriceFormatted,
    handleMinPriceChange,
    handleMaxPriceChange,
    serviceTypes,
    currentFeature,
    setCurrentFeature,
    handleAddFeature,
    handleRemoveFeature,
    previewImage,
    handleImageChange,
    processing,
    handleSubmit,
    onClose
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">
                        {selectedService ? "Edit Layanan" : "Tambah Layanan Baru"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <CatalogForm
                    data={data}
                    setData={setData}
                    errors={errors}
                    selectedService={selectedService}
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
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                />
            </div>
        </div>
    );
};

export default CatalogFormModal;

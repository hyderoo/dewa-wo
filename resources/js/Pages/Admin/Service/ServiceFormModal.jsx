import React from "react";
import { Save, X } from "lucide-react";
import { IconSelector } from "./IconSelector";
import ServiceFeaturesList from "./ServiceFeaturesList";

const ServiceFormModal = ({
    isOpen,
    onClose,
    editingService,
    data,
    setData,
    errors,
    processing,
    handleSubmit,
    selectedType,
    featureInputs,
    handleFeatureChange,
    addFeatureInput,
    removeFeatureInput,
}) => {
    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (type === 'checkbox') {
            setData(name, checked);
        } else {
            setData(name, value);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
                {/* Fixed Header */}
                <div className="p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl z-10">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {editingService ? "Edit Service" : "Add New Service"}
                    </h2>
                </div>

                {/* Scrollable Form Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    <form id="serviceForm" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Service Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                name="type"
                                value={data.type}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                            >
                                <option value="premium">Premium Feature</option>
                                <option value="additional">Additional Service</option>
                                <option value="exclusive">Exclusive Benefit</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={data.title}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500`}
                                placeholder="Enter service title"
                            />
                            {errors.title && (
                                <div className="text-red-500 text-sm mt-1">{errors.title}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                name="description"
                                value={data.description}
                                onChange={handleInputChange}
                                className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500`}
                                rows={3}
                                placeholder="Enter service description"
                            />
                            {errors.description && (
                                <div className="text-red-500 text-sm mt-1">{errors.description}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Icon <span className="text-red-500">*</span>
                            </label>
                            <IconSelector
                                selectedIcon={data.icon}
                                onChange={(e) => setData('icon', e.target.value)}
                            />
                        </div>

                        {/* Features list - only for Additional Services */}
                        {selectedType === 'additional' && (
                            <ServiceFeaturesList
                                featureInputs={featureInputs}
                                handleFeatureChange={handleFeatureChange}
                                addFeatureInput={addFeatureInput}
                                removeFeatureInput={removeFeatureInput}
                                error={errors.features}
                            />
                        )}

                        <div className="pt-2">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="is_active"
                                    checked={data.is_active}
                                    onChange={handleInputChange}
                                    className="h-4 w-4 text-pink-600 border-gray-300 rounded focus:ring-pink-500"
                                />
                                <span className="ml-2 text-sm text-gray-700">Active (visible on website)</span>
                            </label>
                        </div>
                    </form>
                </div>

                {/* Fixed Footer with Buttons */}
                <div className="p-6 border-t border-gray-200 sticky bottom-0 bg-white rounded-b-xl z-10">
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md inline-flex items-center"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="serviceForm"
                            disabled={processing}
                            className="px-6 py-2 bg-pink-600 text-white rounded-md hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center"
                        >
                            <Save className="w-4 h-4 mr-2" />
                            {processing ? 'Processing...' : editingService ? "Update" : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ServiceFormModal;

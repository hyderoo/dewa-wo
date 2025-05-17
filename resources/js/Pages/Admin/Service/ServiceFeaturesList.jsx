import React from "react";
import { X, Plus } from "lucide-react";

const ServiceFeaturesList = ({
    featureInputs,
    handleFeatureChange,
    addFeatureInput,
    removeFeatureInput,
    error
}) => {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
                Features <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
                {featureInputs.map((feature, index) => (
                    <div key={index} className="flex items-center">
                        <input
                            type="text"
                            value={feature}
                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                            placeholder={`Feature ${index + 1}`}
                        />
                        <button
                            type="button"
                            onClick={() => removeFeatureInput(index)}
                            className="ml-2 p-2 text-red-600 hover:bg-red-50 rounded-md"
                            disabled={featureInputs.length <= 1}
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
            <button
                type="button"
                onClick={addFeatureInput}
                className="mt-2 text-sm text-pink-600 hover:text-pink-700 inline-flex items-center"
            >
                <Plus className="w-4 h-4 mr-1" />
                Add Feature
            </button>
            {error && (
                <div className="text-red-500 text-sm mt-1">{error}</div>
            )}
        </div>
    );
};

export default ServiceFeaturesList;

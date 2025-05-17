import React from "react";
import { Edit2, Trash2 } from "lucide-react";

const FeatureCard = ({ feature, onEdit, onDelete }) => {
    // Format number to Indonesian Rupiah for display
    const formatRupiahDisplay = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(number);
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 p-4 hover:shadow-lg transition-shadow">
            <div className="mb-4">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                    {feature.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                    {feature.description}
                </p>
                <p className="font-semibold text-purple-600">
                    {formatRupiahDisplay(feature.price)}
                </p>
            </div>

            <div className="flex gap-2">
                <button
                    onClick={() => onEdit(feature)}
                    className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                >
                    <Edit2 className="h-4 w-4" />
                    Edit
                </button>
                <button
                    onClick={() => onDelete(feature)}
                    className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                >
                    <Trash2 className="h-4 w-4" />
                    Hapus
                </button>
            </div>
        </div>
    );
};

export default FeatureCard;

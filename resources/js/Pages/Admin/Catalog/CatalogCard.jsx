import React from "react";
import { Edit2, Trash2 } from "lucide-react";

const CatalogCard = ({ service, serviceTypes, onEdit, onDelete }) => {
    // Find the label for the service type
    const typeLabel = serviceTypes.find((t) => t.value === service.type)?.label || service.type;

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
            <img
                src={service.image}
                alt={service.name}
                className="w-full h-48 object-cover"
            />
            <div className="p-4">
                <h3 className="font-semibold text-lg text-gray-800 mb-2">
                    {service.name}
                </h3>
                <p className="text-gray-600 text-sm mb-2">
                    {service.description}
                </p>
                <p className="font-semibold text-pink-600 mb-3">
                    {service.formatted_price}
                </p>

                <div className="mb-3">
                    <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-full">
                        {typeLabel}
                    </span>
                </div>

                <div className="mb-4">
                    <h4 className="font-medium mb-2">Fitur:</h4>
                    <ul className="space-y-1">
                        {service.features && service.features.map((feature, index) => (
                            <li
                                key={index}
                                className="text-sm text-gray-600 flex items-center gap-2"
                            >
                                <span className="text-pink-500">✓</span>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => onEdit(service)}
                        className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                    >
                        <Edit2 className="h-4 w-4" />
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(service)}
                        className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors flex items-center justify-center gap-1"
                    >
                        <Trash2 className="h-4 w-4" />
                        Hapus
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CatalogCard;

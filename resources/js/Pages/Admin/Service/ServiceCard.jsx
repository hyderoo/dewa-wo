import React from "react";
import { Edit2, Trash2, Eye, XCircle, Star } from "lucide-react";
import { iconMap } from "./IconSelector";

const ServiceCard = ({ service, onEdit, onDelete, onToggleStatus }) => {
    return (
        <div className={`bg-white rounded-lg border ${service.is_active ? 'border-gray-200' : 'border-red-200 bg-red-50'} shadow-sm overflow-hidden hover:shadow-md transition-shadow`}>
            <div className="p-5 flex items-start justify-between">
                <div className="flex">
                    <div className="mr-4 flex-shrink-0">
                        <div className="h-12 w-12 flex items-center justify-center rounded-full bg-pink-100 text-pink-600">
                            {iconMap[service.icon] || <Star />}
                        </div>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                            {service.title}
                            {!service.is_active && (
                                <span className="ml-2 text-xs font-normal text-red-600 bg-red-100 px-2 py-1 rounded-full">
                                    Inactive
                                </span>
                            )}
                        </h3>
                        <p className="mt-1 text-gray-600">
                            {service.description}
                        </p>
                        {service.type === 'additional' && service.features && service.features.length > 0 && (
                            <div className="mt-3">
                                <h4 className="text-sm font-medium text-gray-700 mb-2">Features:</h4>
                                <ul className="ml-5 list-disc text-sm space-y-1">
                                    {service.features.map((feature, idx) => (
                                        <li key={idx}>{feature}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex items-start space-x-2">
                    <button
                        onClick={() => onToggleStatus(service.id, service.is_active)}
                        className={`p-2 ${service.is_active ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'} rounded-lg transition-colors duration-200`}
                        title={service.is_active ? "Deactivate" : "Activate"}
                    >
                        {service.is_active ? <Eye className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={() => onEdit(service)}
                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors duration-200"
                    >
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => onDelete(service)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ServiceCard;

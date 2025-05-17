import React from "react";
import { Star, PlusCircle } from "lucide-react";

const EmptyServices = ({ onAddNew }) => {
    return (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
            <Star className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No services found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new service.</p>
            <div className="mt-6">
                <button
                    onClick={onAddNew}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                    <PlusCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    New Service
                </button>
            </div>
        </div>
    );
};

export default EmptyServices;

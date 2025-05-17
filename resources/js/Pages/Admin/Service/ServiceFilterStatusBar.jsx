import React from "react";

const ServiceFilterStatusBar = ({ filterType, setFilterType, filteredCount, getServiceTypeLabel }) => {
    return (
        <div className="bg-blue-50 px-6 py-2 border-b border-blue-100">
            <div className="flex justify-between items-center">
                <p className="text-sm text-blue-600">
                    <span className="font-medium">Filter aktif:</span> {getServiceTypeLabel(filterType)}
                    {filteredCount === 1
                        ? " (1 item)"
                        : ` (${filteredCount} items)`}
                </p>
                <button
                    onClick={() => setFilterType("all")}
                    className="text-xs text-blue-700 hover:text-blue-900"
                >
                    Hapus filter
                </button>
            </div>
        </div>
    );
};

export default ServiceFilterStatusBar;

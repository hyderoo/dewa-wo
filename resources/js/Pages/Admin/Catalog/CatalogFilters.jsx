import React from "react";
import { Search } from "lucide-react";

const CatalogFilters = ({
    searchTerm,
    setSearchTerm,
    selectedType,
    setSelectedType,
    serviceTypes
}) => {
    return (
        <div className="p-4 md:p-6 bg-gray-50 border-b border-gray-200">
            <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0 md:space-x-4">
                {/* Search Field */}
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Cari layanan..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>

                {/* Type Filter */}
                <div className="relative w-full sm:w-64">
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent appearance-none"
                    >
                        <option value="all">Semua Tipe</option>
                        {serviceTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Add Button - Pass this from parent */}
                <div className="flex-shrink-0">
                    <slot name="addButton" />
                </div>
            </div>
        </div>
    );
};

export default CatalogFilters;

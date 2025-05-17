import React from "react";
import { Filter, RefreshCw, Search } from "lucide-react";

const CatalogFilterBar = ({ searchTerm, setSearchTerm, selectedType, setSelectedType, serviceTypes }) => {
    return (
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            {/* Search Field */}
            <div className="relative flex-grow max-w-md">
                <input
                    type="text"
                    placeholder="Cari layanan..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
            </div>

            {/* Type Filter */}
            <div className="flex items-center space-x-2">
                <div className="flex items-center bg-white rounded-lg shadow-sm px-2 border border-gray-200">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="py-2 px-3 border-0 bg-transparent text-gray-700 focus:outline-none focus:ring-0"
                    >
                        <option value="all">Semua Tipe</option>
                        {serviceTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={() => {
                        setSelectedType("all");
                        setSearchTerm("");
                    }}
                    className="p-2 bg-white rounded-lg shadow-sm border border-gray-200"
                    title="Reset filter"
                >
                    <RefreshCw className="w-4 h-4 text-gray-500" />
                </button>
            </div>
        </div>
    );
};

export default CatalogFilterBar;

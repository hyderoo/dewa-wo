import React from "react";
import { Search, RefreshCw } from "lucide-react";

const FeatureFilterBar = ({ searchTerm, setSearchTerm }) => {
    return (
        <div className="flex items-center space-x-2">
            <div className="relative flex-grow">
                <input
                    type="text"
                    placeholder="Cari fitur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                </div>
            </div>
            {searchTerm && (
                <button
                    onClick={() => setSearchTerm("")}
                    className="p-2 bg-white rounded-lg shadow-sm border border-gray-200"
                    title="Reset filter"
                >
                    <RefreshCw className="w-4 h-4 text-gray-500" />
                </button>
            )}
        </div>
    );
};

export default FeatureFilterBar;

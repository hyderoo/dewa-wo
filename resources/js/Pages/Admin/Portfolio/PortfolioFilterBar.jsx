import React from "react";
import { Filter, RefreshCw } from "lucide-react";

const PortfolioFilterBar = ({ selectedCategory, setSelectedCategory, uniqueCategories }) => {
    return (
        <div className="flex items-center space-x-2">
            <div className="flex items-center bg-white rounded-lg shadow-sm px-2 border border-gray-200">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="py-2 px-3 border-0 bg-transparent text-gray-700 focus:outline-none focus:ring-0"
                >
                    <option value="all">Semua Kategori</option>
                    {uniqueCategories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
            </div>
            <button
                onClick={() => setSelectedCategory("all")}
                className="p-2 bg-white rounded-lg shadow-sm border border-gray-200"
                title="Reset filter"
            >
                <RefreshCw className="w-4 h-4 text-gray-500" />
            </button>
        </div>
    );
};

export default PortfolioFilterBar;

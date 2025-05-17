import React from "react";

const FilterStatusBar = ({ selectedCategory, setSelectedCategory, filteredPortfoliosCount }) => {
    return (
        <div className="bg-blue-50 px-6 py-2 border-b border-blue-100">
            <div className="flex justify-between items-center">
                <p className="text-sm text-blue-600">
                    <span className="font-medium">Filter aktif:</span> {selectedCategory}
                    {filteredPortfoliosCount === 1
                        ? " (1 item)"
                        : ` (${filteredPortfoliosCount} items)`}
                </p>
                <button
                    onClick={() => setSelectedCategory("all")}
                    className="text-xs text-blue-700 hover:text-blue-900"
                >
                    Hapus filter
                </button>
            </div>
        </div>
    );
};

export default FilterStatusBar;

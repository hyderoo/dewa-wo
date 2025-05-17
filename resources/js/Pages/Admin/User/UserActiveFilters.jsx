import React from "react";

const UserActiveFilters = ({ roleFilter, searchTerm, onClearRoleFilter, onClearSearchTerm, onClearAllFilters }) => {
    if (roleFilter === 'all' && !searchTerm) return null;

    return (
        <div className="bg-blue-50 px-6 py-2 border-b border-blue-100">
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-blue-600 font-medium">Active filters:</span>

                {roleFilter !== 'all' && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Role: {roleFilter.charAt(0).toUpperCase() + roleFilter.slice(1)}
                        <button
                            onClick={onClearRoleFilter}
                            className="ml-1 text-blue-500 hover:text-blue-700"
                        >
                            &times;
                        </button>
                    </span>
                )}

                {searchTerm && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Search: {searchTerm}
                        <button
                            onClick={onClearSearchTerm}
                            className="ml-1 text-blue-500 hover:text-blue-700"
                        >
                            &times;
                        </button>
                    </span>
                )}

                <button
                    onClick={onClearAllFilters}
                    className="text-xs text-blue-600 hover:text-blue-800 ml-auto"
                >
                    Clear all filters
                </button>
            </div>
        </div>
    );
};

export default UserActiveFilters;

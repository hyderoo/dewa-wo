import React from "react";
import { Search, RefreshCw, Users, Shield, User as UserIcon } from "lucide-react";

const UserFilterBar = ({
    searchTerm,
    onSearchChange,
    perPage,
    onPerPageChange,
    roleFilter,
    onRoleFilterChange,
    onResetFilters
}) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-wrap w-full md:w-auto gap-2">
                {/* Search Input */}
                <div className="relative flex-1 md:w-64 min-w-[200px]">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={onSearchChange}
                    />
                </div>

                {/* Role Filter Buttons */}
                <div className="flex space-x-1 min-w-[200px]">
                    <button
                        onClick={() => onRoleFilterChange('all')}
                        className={`px-3 py-2 rounded-md text-sm flex items-center ${roleFilter === 'all'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        <Users size={16} className="mr-1" />
                        All
                    </button>
                    <button
                        onClick={() => onRoleFilterChange('admin')}
                        className={`px-3 py-2 rounded-md text-sm flex items-center ${roleFilter === 'admin'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        <Shield size={16} className="mr-1" />
                        Admin
                    </button>
                    <button
                        onClick={() => onRoleFilterChange('user')}
                        className={`px-3 py-2 rounded-md text-sm flex items-center ${roleFilter === 'user'
                            ? 'bg-green-100 text-green-800 border border-green-300'
                            : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        <UserIcon size={16} className="mr-1" />
                        User
                    </button>
                </div>

                {/* Per Page Selection */}
                <select
                    className="block w-24 px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    value={perPage}
                    onChange={onPerPageChange}
                >
                    <option value="5">5 / page</option>
                    <option value="10">10 / page</option>
                    <option value="25">25 / page</option>
                    <option value="50">50 / page</option>
                </select>

                {/* Reset Filters Button */}
                <button
                    onClick={onResetFilters}
                    className="p-2 bg-white border border-gray-300 rounded-md hover:bg-gray-100 flex items-center"
                    title="Reset filters"
                >
                    <RefreshCw className="w-5 h-5 text-gray-500" />
                </button>
            </div>
        </div>
    );
};

export default UserFilterBar;

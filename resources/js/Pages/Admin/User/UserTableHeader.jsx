import React from "react";
import { ArrowUp, ArrowDown } from "lucide-react";

const UserTableHeader = ({ sortField, sortDirection, onSort }) => {
    // Function to render sort indicators
    const renderSortIndicator = (field) => {
        if (field !== sortField) return null;
        return sortDirection === 'asc'
            ? <ArrowUp className="w-4 h-4 inline-block ml-1" />
            : <ArrowDown className="w-4 h-4 inline-block ml-1" />;
    };

    return (
        <thead className="bg-gray-100 border-b">
            <tr>
                <th
                    className="p-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                    onClick={() => onSort('name')}
                >
                    <span className="flex items-center">
                        Name {renderSortIndicator('name')}
                    </span>
                </th>
                <th
                    className="p-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                    onClick={() => onSort('phone')}
                >
                    <span className="flex items-center">
                        Phone {renderSortIndicator('phone')}
                    </span>
                </th>
                <th
                    className="p-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                    onClick={() => onSort('email')}
                >
                    <span className="flex items-center">
                        Email {renderSortIndicator('email')}
                    </span>
                </th>
                <th
                    className="p-3 text-left text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-200"
                    onClick={() => onSort('role')}
                >
                    <span className="flex items-center">
                        Role {renderSortIndicator('role')}
                    </span>
                </th>
                <th className="p-3 text-center text-xs md:text-sm font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                </th>
            </tr>
        </thead>
    );
};

export default UserTableHeader;

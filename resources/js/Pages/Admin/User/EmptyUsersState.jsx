import React from "react";
import { AlertCircle } from "lucide-react";

const EmptyUsersState = ({ hasFilters }) => {
    return (
        <tr>
            <td colSpan="5" className="text-center py-8 text-gray-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>{hasFilters
                    ? 'No users found matching your filter criteria.'
                    : 'No users found. Add your first user to get started.'}</p>
            </td>
        </tr>
    );
};

export default EmptyUsersState;

import React from "react";
import { Edit, Trash2, KeyRound, Shield, User } from "lucide-react";

const UserTableRow = ({ user, onEdit, onResetPassword, onDelete }) => {
    return (
        <tr className="hover:bg-gray-50 transition">
            <td className="p-3 whitespace-nowrap">{user.name}</td>
            <td className="p-3 whitespace-nowrap">{user.phone}</td>
            <td className="p-3 whitespace-nowrap">{user.email}</td>
            <td className="p-3 whitespace-nowrap">
                <span className={`px-2 py-1 rounded-full text-xs flex items-center w-fit ${user.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-green-100 text-green-800'
                    }`}>
                    {user.role === 'admin'
                        ? <Shield size={12} className="mr-1" />
                        : <User size={12} className="mr-1" />
                    }
                    {user.role}
                </span>
            </td>
            <td className="p-3">
                <div className="flex justify-center space-x-3">
                    <button
                        onClick={() => onEdit(user)}
                        className="text-blue-500 hover:text-blue-700 transition"
                        title="Edit User"
                    >
                        <Edit className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onResetPassword(user.id)}
                        className="text-yellow-500 hover:text-yellow-700 transition"
                        title="Reset Password"
                    >
                        <KeyRound className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onDelete(user.id)}
                        className="text-red-500 hover:text-red-700 transition"
                        title="Delete User"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default UserTableRow;

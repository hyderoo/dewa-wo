import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import UserManagementContent from "./UserManagementContent";
import { Head } from "@inertiajs/react";

// Main UserManagement component with AdminLayout
const UserManagement = ({ users, filters, toast }) => {
    return (
        <AdminLayout activeMenu="user-management">
            <Head title="User Management" />
            <UserManagementContent users={users} filters={filters} toast={toast} />
        </AdminLayout>
    );
};

export default UserManagement;

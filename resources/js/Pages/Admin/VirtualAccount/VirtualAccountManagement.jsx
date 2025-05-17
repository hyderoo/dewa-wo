import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import VirtualAccountManagementContent from "./VirtualAccountManagementContent";
import { Head } from "@inertiajs/react";

// Main VirtualAccountManagement component with AdminLayout
const VirtualAccountManagement = ({ virtualAccounts, toast }) => {
    return (
        <AdminLayout activeMenu="virtual-account-management">
            <Head title="Virtual Account Management" />
            <VirtualAccountManagementContent virtualAccounts={virtualAccounts} toast={toast} />
        </AdminLayout>
    );
};

export default VirtualAccountManagement;

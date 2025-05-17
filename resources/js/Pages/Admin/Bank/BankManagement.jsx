import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import BankManagementContent from "./BankManagementContent";
import { Head } from "@inertiajs/react";

// Main BankManagement component with AdminLayout
const BankManagement = ({ banks, toast }) => {
    return (
        <AdminLayout activeMenu="bank-management">
            <Head title="Bank Management" />
            <BankManagementContent banks={banks} toast={toast} />
        </AdminLayout>
    );
};

export default BankManagement;

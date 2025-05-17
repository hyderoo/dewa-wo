import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import CustomFeatureManagementContent from "./CustomFeatureManagementContent";
import { Head } from "@inertiajs/react";

// Main CustomFeatureManagement Page component with AdminLayout
const CustomFeatureManagement = ({ features, toast }) => {
    return (
        <AdminLayout activeMenu="catalog-features">
            <Head title="Custom Feature Management" />
            <CustomFeatureManagementContent features={features} toast={toast} />
        </AdminLayout>
    );
};

export default CustomFeatureManagement;

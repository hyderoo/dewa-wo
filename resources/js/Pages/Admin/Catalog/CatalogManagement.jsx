import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import CatalogManagementContent from "./CatalogManagementContent";
import { Head } from "@inertiajs/react";

// Main CatalogManagement component with AdminLayout
const CatalogManagement = () => {
    return (
        <AdminLayout activeMenu="catalog-list">
            <Head title="Catalog Management" />
            <CatalogManagementContent />
        </AdminLayout>
    );
};

export default CatalogManagement;

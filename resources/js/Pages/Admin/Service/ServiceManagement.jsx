import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import ServiceManagementContent from "./ServiceManagementContent";
import { Head } from "@inertiajs/react";

// Main ServiceManagement component with AdminLayout
const ServiceManagement = ({ services, toast }) => {
    return (
        <AdminLayout activeMenu="service-management">
            <Head title="Service Management" />
            <ServiceManagementContent services={services} toast={toast} />
        </AdminLayout>
    );
};

export default ServiceManagement;

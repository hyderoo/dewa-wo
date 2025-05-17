import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import PortfolioManagementContent from "./PortfolioManagementContent";
import { Head } from "@inertiajs/react";

// Main PortfolioManagement component with AdminLayout
const PortfolioManagement = ({ portfolios, toast }) => {
    return (
        <AdminLayout activeMenu="portfolio-management">
            <Head title="Portfolio Management" />
            <PortfolioManagementContent portfolios={portfolios} toast={toast} />
        </AdminLayout>
    );
};

export default PortfolioManagement;

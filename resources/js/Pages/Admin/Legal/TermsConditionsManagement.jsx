import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import TermsConditionsManagementContent from "./TermsConditionsManagementContent";
import { Head } from "@inertiajs/react";

// Main TermsConditionsManagement component with AdminLayout
const TermsConditionsManagement = ({ termsConditions, version }) => {
    return (
        <AdminLayout activeMenu="terms-conditions">
            <Head title="Terms & Conditions Management" />
            <TermsConditionsManagementContent
                termsConditions={termsConditions}
                version={version}
            />
        </AdminLayout>
    );
};

export default TermsConditionsManagement;

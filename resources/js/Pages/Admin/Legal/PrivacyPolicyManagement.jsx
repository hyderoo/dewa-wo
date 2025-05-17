import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import PrivacyPolicyManagementContent from "./PrivacyPolicyManagementContent";
import { Head } from "@inertiajs/react";

// Main PrivacyPolicyManagement component with AdminLayout
const PrivacyPolicyManagement = ({ privacyPolicy, version }) => {
    return (
        <AdminLayout activeMenu="privacy-policy">
            <Head title="Privacy Policy Management" />
            <PrivacyPolicyManagementContent
                privacyPolicy={privacyPolicy}
                version={version}
            />
        </AdminLayout>
    );
};

export default PrivacyPolicyManagement;

import React from "react";
import AdminLayout from "@/Layouts/AdminLayout";
import TeamManagementContent from "./TeamManagementContent";
import { Head } from "@inertiajs/react";

// Main TeamManagement component with AdminLayout
const TeamManagement = ({ teams, toast }) => {
    return (
        <AdminLayout activeMenu="team-management">
            <Head title="Team Management" />
            <TeamManagementContent />
        </AdminLayout>
    );
};

export default TeamManagement;

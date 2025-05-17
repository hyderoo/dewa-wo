import React, { useState } from "react";
import { usePage } from "@inertiajs/react";
import Sidebar from "@/Components/Admin/Sidebar";

// Admin Layout Component
const AdminLayout = ({ children, activeMenu: initialActiveMenu = "dashboard" }) => {
    const [activeMenu, setActiveMenu] = useState(initialActiveMenu);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { unverifiedPaymentCount } = usePage().props;

    return (
        <div className="relative">
            {/* Sidebar */}
            <Sidebar
                activeMenu={activeMenu}
                setActiveMenu={setActiveMenu}
                isMobileMenuOpen={isMobileMenuOpen}
                setIsMobileMenuOpen={setIsMobileMenuOpen}
                unverifiedPaymentCount={unverifiedPaymentCount || 0}
            />

            {/* Content Area */}
            <div className="md:ml-64 p-6 bg-gray-50 min-h-screen">
                {children}
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminLayout;

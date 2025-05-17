import React, { useState } from "react";
import {
    Users,
    List,
    Settings,
    Image,
    ShoppingCart,
    Menu,
    X,
    KeyRound,
    ChevronDown,
    ChevronRight,
    LayoutList,
    Database,
    DollarSign,
    Star,
    LogOut,
    Building,
    ShieldCheck,
    FileText,
    LayoutDashboard,
    CreditCard
} from "lucide-react";
import { router } from '@inertiajs/react';
import PasswordChangeModal from "./Modals/PasswordChangeModal";
import LogoutConfirmationModal from "./Modals/LogoutConfirmationModal";

const Sidebar = ({
    activeMenu,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    unverifiedPaymentCount = 0,
}) => {
    const [isPasswordChangeModalOpen, setIsPasswordChangeModalOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [expandedMenu, setExpandedMenu] = useState(null);

    const menuItems = [
        {
            icon: <LayoutDashboard size={20} />,
            label: "Dashboard",
            key: "dashboard",
        },
        {
            icon: <Users size={20} />,
            label: "Manajemen Tim",
            key: "team-management",
        },
        {
            icon: <List size={20} />,
            label: "Manajemen Katalog",
            key: "catalog",
            subMenus: [
                {
                    icon: <LayoutList size={18} />,
                    label: "Katalog",
                    key: "catalog-list",
                },
                {
                    icon: <Database size={18} />,
                    label: "Fitur Custom",
                    key: "catalog-features",
                }
            ]
        },
        {
            icon: <Image size={20} />,
            label: "Manajemen Portofolio",
            key: "portfolio-management",
        },
        {
            icon: <Star size={20} />,
            label: "Manajemen Layanan",
            key: "service-management",
        },
        {
            icon: <Users size={20} />,
            label: "Manajemen User",
            key: "user-management",
        },
        {
            icon: <ShoppingCart size={20} />,
            label: "Manajemen Order",
            key: "order-management",
        },
        {
            icon: <DollarSign size={20} />,
            label: "Verifikasi Pembayaran",
            key: "payment-verification",
            count: unverifiedPaymentCount > 0 ? unverifiedPaymentCount : null
        },
        {
            icon: <Building size={20} />,
            label: "Manajemen Bank",
            key: "bank-management",
        },
        {
            icon: <CreditCard size={20} />,
            label: "Virtual Account",
            key: "virtual-account-management",
        },
        {
            icon: <Settings size={20} />,
            label: "Pengaturan Legal",
            key: "legal-settings",
            subMenus: [
                {
                    icon: <ShieldCheck size={18} />,
                    label: "Privacy Policy",
                    key: "privacy-policy",
                },
                {
                    icon: <FileText size={18} />,
                    label: "Terms & Conditions",
                    key: "terms-conditions",
                }
            ]
        },
    ];

    const toggleSubMenu = (key) => {
        if (expandedMenu === key) {
            setExpandedMenu(null);
        } else {
            setExpandedMenu(key);
        }
    };

    const handleMenuClick = (key) => {
        setIsMobileMenuOpen(false);

        // Handle navigation based on menu key using router
        switch (key) {
            case "dashboard":
                router.visit(route('admin.dashboard'));
                break;
            case "team-management":
                router.visit(route('admin.teams'));
                break;
            case "catalog":
                toggleSubMenu('catalog');
                break;
            case "catalog-list":
                router.visit(route('admin.catalogs'));
                break;
            case "catalog-features":
                router.visit(route('admin.catalogs.features'));
                break;
            case "portfolio-management":
                router.visit(route('admin.portfolios'));
                break;
            case "service-management":
                router.visit(route('admin.services'));
                break;
            case "user-management":
                router.visit(route('admin.users'));
                break;
            case "order-management":
                router.visit(route('admin.orders'));
                break;
            case "payment-verification":
                router.visit(route('admin.payments.verification'));
                break;
            case "bank-management":
                router.visit(route('admin.banks'));
                break;
            case "virtual-account-management":
                router.visit(route('admin.virtual-accounts'));
                break;
            case "legal-settings":
                toggleSubMenu('legal-settings');
                break;
            case "privacy-policy":
                router.visit(route('admin.privacy-policy'));
                break;
            case "terms-conditions":
                router.visit(route('admin.terms-conditions'));
                break;
            default:
                router.visit(route('admin.dashboard'));
        }
    };

    // Simple function to show/hide logout modal
    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const handleCloseLogoutModal = () => {
        setIsLogoutModalOpen(false);
    };

    // Helper function to check if a menu or its submenu is active
    const isMenuActive = (item) => {
        if (activeMenu === item.key) return true;
        if (item.subMenus) {
            return item.subMenus.some(subMenu => activeMenu === subMenu.key);
        }
        return false;
    };

    // Check if current page is a submenu and expand parent menu automatically
    React.useEffect(() => {
        const menuMappings = {
            "catalog-list": "catalog",
            "catalog-features": "catalog",
            "privacy-policy": "legal-settings",
            "terms-conditions": "legal-settings"
        };

        if (menuMappings[activeMenu]) {
            setExpandedMenu(menuMappings[activeMenu]);
        }
    }, [activeMenu]);

    return (
        <>
            {/* Password Change Modal */}
            <PasswordChangeModal
                isOpen={isPasswordChangeModalOpen}
                onClose={() => setIsPasswordChangeModalOpen(false)}
            />

            {/* Logout Confirmation Modal */}
            <LogoutConfirmationModal
                isOpen={isLogoutModalOpen}
                onClose={handleCloseLogoutModal}
            />

            {/* Mobile Menu Toggle */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 bg-pink-500 text-white rounded-md"
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar */}
            <div
                className={`
                    fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 overflow-y-auto
                    ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
                    md:translate-x-0
                `}
            >
                <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
                </div>

                <nav className="p-4">
                    {menuItems.map((item) => (
                        <React.Fragment key={item.key}>
                            <button
                                onClick={() => handleMenuClick(item.key)}
                                className={`
                                    w-full flex items-center p-3 rounded-lg mb-1 transition-all
                                    ${isMenuActive(item)
                                        ? "bg-pink-500 text-white"
                                        : "hover:bg-pink-100 text-gray-700"}
                                    ${item.subMenus && item.subMenus.some(sub => activeMenu === sub.key) && expandedMenu !== item.key
                                        ? "border-l-4 border-pink-500"
                                        : ""}
                                `}
                            >
                                <span className="mr-3">{item.icon}</span>
                                <span className="flex-1 text-left">
                                    {item.label}
                                    {item.subMenus &&
                                        item.subMenus.some(sub => activeMenu === sub.key) &&
                                        expandedMenu !== item.key && (
                                            <span className="ml-2 inline-block w-2 h-2 bg-pink-400 rounded-full"></span>
                                        )}
                                </span>
                                {/* Tambahkan badge untuk count */}
                                {item.count > 0 && (
                                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full ml-2">
                                        {item.count}
                                    </span>
                                )}
                                {item.subMenus && (
                                    <span>
                                        {expandedMenu === item.key
                                            ? <ChevronDown size={16} />
                                            : <ChevronRight size={16} />}
                                    </span>
                                )}
                            </button>

                            {/* Render submenu items if expanded */}
                            {item.subMenus && expandedMenu === item.key && (
                                <div className="ml-6 space-y-1 mb-2">
                                    {item.subMenus.map(subMenu => (
                                        <button
                                            key={subMenu.key}
                                            onClick={() => handleMenuClick(subMenu.key)}
                                            className={`
                                                w-full flex items-center p-2 rounded-lg transition-all
                                                ${activeMenu === subMenu.key
                                                    ? "bg-pink-400 text-white"
                                                    : "hover:bg-pink-50 text-gray-700"}
                                            `}
                                        >
                                            <span className="mr-3">{subMenu.icon}</span>
                                            <span>{subMenu.label}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </React.Fragment>
                    ))}

                    {/* Additional Sidebar Actions */}
                    <div className="border-t mt-4 pt-4">
                        <button
                            onClick={() => setIsPasswordChangeModalOpen(true)}
                            className="w-full flex items-center p-3 rounded-lg mb-2 hover:bg-pink-100 text-gray-700"
                        >
                            <span className="mr-3">
                                <KeyRound size={20} />
                            </span>
                            Ubah Kata Sandi
                        </button>

                        <button
                            onClick={handleLogoutClick}
                            className="w-full flex items-center p-3 rounded-lg hover:bg-pink-100 text-gray-700"
                        >
                            <span className="mr-3">
                                <LogOut size={20} />
                            </span>
                            Logout
                        </button>
                    </div>
                </nav>
            </div>
        </>
    );
};

export default Sidebar;

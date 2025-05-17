import React, { useState, useEffect, useMemo } from "react";
import { usePage } from "@inertiajs/react";
import Toast from "@/Components/Toast";
import PortfolioList from "./PortfolioList";
import PortfolioFilterBar from "./PortfolioFilterBar";
import PortfolioModal from "./PortfolioModal";
import FilterStatusBar from "./FilterStatusBar";
import { PlusCircle } from "lucide-react";

const PortfolioManagementContent = () => {
    const { portfolios, toast } = usePage().props;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPortfolio, setEditingPortfolio] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ type: "", message: "" });

    // Filter state
    const [selectedCategory, setSelectedCategory] = useState("all");

    // Available categories
    const categories = [
        "Pernikahan Adat",
        "Pernikahan Modern",
        "Intimate Wedding",
        "Destination Wedding",
    ];

    // Get unique categories from portfolios including predefined ones
    const uniqueCategories = useMemo(() => {
        if (!portfolios) return categories;

        const categoriesFromData = portfolios.map(item => item.category);
        const allCategories = [...new Set([...categories, ...categoriesFromData])];
        return allCategories.sort();
    }, [portfolios, categories]);

    // Filter portfolios based on selected category
    const filteredPortfolios = useMemo(() => {
        if (!portfolios) return [];
        if (selectedCategory === "all") return portfolios;

        return portfolios.filter(item => item.category === selectedCategory);
    }, [portfolios, selectedCategory]);

    // Check for flash messages on page load or when toast changes
    useEffect(() => {
        if (toast) {
            setToastMessage({ type: toast.type, message: toast.message });
            if (toast.type === "success") {
                setIsModalOpen(false);
            }
            setShowToast(true);

            // Auto-close toast after 5 seconds
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [toast]);

    const openModal = (portfolio = null) => {
        setEditingPortfolio(portfolio);
        setIsModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 text-gray-600">
            {showToast && (
                <Toast
                    type={toastMessage.type}
                    message={toastMessage.message}
                    onClose={() => setShowToast(false)}
                />
            )}

            <div className="max-w-7xl mx-auto">
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 md:p-8">
                        <h1 className="font-cormorant text-3xl md:text-4xl font-light text-white text-center tracking-wide">
                            Manajemen Portfolio
                        </h1>
                        <p className="text-center text-white/80 mt-2 max-w-2xl mx-auto">
                            Kelola karya terbaik perusahaan Anda dengan tampilan yang menarik
                        </p>
                    </div>

                    {/* Action Buttons and Filter */}
                    <div className="p-4 md:p-6 bg-gray-50 border-b border-gray-200">
                        <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
                            <button
                                onClick={() => openModal()}
                                className="w-full md:w-auto bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                            >
                                <PlusCircle className="w-4 h-4 mr-2 inline-block" />
                                Tambah Portfolio
                            </button>

                            {/* Category Filter */}
                            <PortfolioFilterBar
                                selectedCategory={selectedCategory}
                                setSelectedCategory={setSelectedCategory}
                                uniqueCategories={uniqueCategories}
                            />
                        </div>
                    </div>

                    {/* Filter Status */}
                    {selectedCategory !== "all" && (
                        <FilterStatusBar
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            filteredPortfoliosCount={filteredPortfolios.length}
                        />
                    )}

                    {/* Portfolio List */}
                    <div className="p-6 md:p-8">
                        <PortfolioList
                            filteredPortfolios={filteredPortfolios}
                            selectedCategory={selectedCategory}
                            setSelectedCategory={setSelectedCategory}
                            openModal={openModal}
                        />
                    </div>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <PortfolioModal
                    isOpen={isModalOpen}
                    setIsOpen={setIsModalOpen}
                    editingPortfolio={editingPortfolio}
                    categories={uniqueCategories}
                />
            )}
        </div>
    );
};

export default PortfolioManagementContent;

import React, { useState } from "react";
import { Edit2, Trash2, Image as ImageIcon, PlusCircle, RefreshCw } from "lucide-react";
import { router } from "@inertiajs/react";
import DeletePortfolioConfirmationModal from "./DeletePortfolioConfirmationModal";

const PortfolioList = ({ filteredPortfolios, selectedCategory, setSelectedCategory, openModal }) => {
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [portfolioToDelete, setPortfolioToDelete] = useState(null);

    const openDeleteModal = (portfolio) => {
        setPortfolioToDelete(portfolio);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setPortfolioToDelete(null);
    };

    // If portfolios are available
    if (filteredPortfolios && filteredPortfolios.length > 0) {
        return (
            <>
                <DeletePortfolioConfirmationModal
                    isOpen={deleteModalOpen}
                    onClose={closeDeleteModal}
                    portfolio={portfolioToDelete}
                />

                <div className="space-y-6">
                    {filteredPortfolios.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-lg border border-gray-200 shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                        >
                            <div className="flex flex-col sm:flex-row">
                                <div className="w-full sm:w-48 h-48 relative">
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {item.images && item.images.length > 1 && (
                                        <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs rounded-full px-2 py-1">
                                            <span>+{item.images.length - 1}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-xl font-semibold text-gray-900">
                                                {item.title}
                                            </h3>
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                <span className="inline-block bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                                                    {item.category}
                                                </span>
                                                {item.images && (
                                                    <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                                        {item.images.length} images
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => openModal(item)}
                                                className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors duration-200"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => openDeleteModal(item)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-gray-600">{item.description}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </>
        );
    }

    // If a category is selected but no portfolios found
    if (selectedCategory !== "all") {
        return (
            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">No portfolios in this category</h3>
                <p className="mt-1 text-sm text-gray-500">Try selecting a different category or create a new portfolio.</p>
                <div className="mt-6 flex justify-center space-x-3">
                    <button
                        onClick={() => setSelectedCategory("all")}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                        <RefreshCw className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                        Show All
                    </button>
                    <button
                        onClick={() => openModal()}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                    >
                        <PlusCircle className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
                        New Portfolio
                    </button>
                </div>
            </div>
        );
    }

    // Default - No portfolios found
    return (
        <div className="text-center py-12">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No portfolios found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new portfolio.</p>
            <div className="mt-6">
                <button
                    onClick={() => openModal()}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
                >
                    <PlusCircle className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    New Portfolio
                </button>
            </div>
        </div>
    );
};

export default PortfolioList;

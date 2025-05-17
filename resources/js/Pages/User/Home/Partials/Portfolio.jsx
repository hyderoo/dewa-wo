import React, { useState, useEffect } from "react";
import { ChevronLeft, Search, X, Maximize2, Minimize2, ChevronRight } from "lucide-react";

// Font classes
const cormorantClass = "font-cormorant font-light";
const montserratClass = "font-montserrat font-normal";
const montserratMediumClass = "font-montserrat font-medium";

// Portfolio categories - you could also make this dynamic based on the data
const portfolioCategories = [
    "Semua Acara",
    "Pernikahan Adat",
    "Pernikahan Modern",
    "Intimate Wedding",
    "Destination Wedding",
];

export default function Portfolio({ portfolioItems }) {
    // For Inertia navigation when needed
    const navigateBack = () => {
        window.history.back();
    };

    const [activeCategory, setActiveCategory] = useState("Semua Acara");
    const [selectedPortfolio, setSelectedPortfolio] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isFullscreen, setIsFullscreen] = useState(false); // Default to small view

    // Helper function to get the main image for a portfolio
    const getMainImagePath = (portfolio) => {
        // First check if portfolio has images array with items
        if (portfolio.images && portfolio.images.length > 0) {
            // Use the first image
            return portfolio.images[0].image_path;
        }

        // Fall back to thumbnail attribute if it exists
        if (portfolio.thumbnail) {
            return portfolio.thumbnail;
        }

        // Last resort: use legacy image field
        return portfolio.image;
    };

    // Helper to get all images for a portfolio (for the gallery)
    const getPortfolioImages = (portfolio) => {
        if (portfolio.images && portfolio.images.length > 0) {
            // Sort images by display_order if available
            return [...portfolio.images].sort((a, b) => a.display_order - b.display_order);
        }

        // If no images relationship, create an array with the single image
        return [{
            id: 'legacy',
            portfolio_id: portfolio.id,
            image_path: portfolio.image || portfolio.thumbnail,
            display_order: 1
        }];
    };

    // Handle keyboard events
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (selectedPortfolio) {
                if (e.key === "Escape") {
                    closeImageModal();
                } else if (e.key === "ArrowRight") {
                    nextImage();
                } else if (e.key === "ArrowLeft") {
                    prevImage();
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [selectedPortfolio, currentImageIndex]);

    // Filter portfolio items by category
    const filteredPortfolio =
        activeCategory === "Semua Acara"
            ? portfolioItems
            : portfolioItems.filter((item) => item.category === activeCategory);

    // Open modal with the selected portfolio
    const openImageModal = (portfolio) => {
        setSelectedPortfolio(portfolio);
        setCurrentImageIndex(0);
        setIsFullscreen(false); // Start in small view
    };

    const closeImageModal = () => {
        setSelectedPortfolio(null);
        setCurrentImageIndex(0);
        setIsFullscreen(false); // Reset to small view for next time
    };

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen);
    };

    // Image navigation functions
    const nextImage = () => {
        if (!selectedPortfolio) return;

        const images = getPortfolioImages(selectedPortfolio);
        if (images.length <= 1) return;

        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        if (!selectedPortfolio) return;

        const images = getPortfolioImages(selectedPortfolio);
        if (images.length <= 1) return;

        setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    // If no portfolioItems are provided, show a message
    if (!portfolioItems || portfolioItems.length === 0) {
        return (
            <div className={`bg-white py-20 ${montserratClass} text-gray-600`}>
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <h1 className={`text-4xl mb-6 ${cormorantClass} text-gray-800`}>
                        Portfolio Kami
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Belum ada portfolio yang ditampilkan. Silakan kembali nanti.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white py-20 ${montserratClass} text-gray-600`}>
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className={`text-4xl mb-6 ${cormorantClass} text-gray-800`}>
                        Portfolio Kami
                    </h1>
                    <p className="text-gray-600 text-sm md:text-base tracking-wider max-w-2xl mx-auto">
                        Setiap pernikahan adalah cerita unik. Temukan inspirasi dari koleksi
                        momen istimewa yang telah kami hadirkan.
                    </p>
                </div>

                {/* Category Filters */}
                <div className="flex flex-wrap justify-center gap-4 mb-16">
                    {portfolioCategories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setActiveCategory(category)}
                            className={`
                                px-4 py-2 rounded-full text-sm font-medium transition-all
                                ${activeCategory === category
                                    ? "bg-gray-700 text-white"
                                    : "bg-white text-gray-700 hover:bg-gray-100"
                                }
                            `}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Portfolio Grid */}
                <div className="grid md:grid-cols-3 gap-8">
                    {filteredPortfolio.map((item) => (
                        <div
                            key={item.id}
                            className="text-center p-6 bg-white rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => openImageModal(item)}
                        >
                            <div className="relative overflow-hidden rounded-lg mb-4">
                                <img
                                    src={getMainImagePath(item)}
                                    alt={item.title}
                                    className="w-full h-64 object-cover transform hover:scale-110 transition-transform duration-300"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/placeholder-image.jpg";
                                    }}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                    <Search
                                        className="text-white opacity-0 hover:opacity-100 transition-opacity duration-300"
                                        size={48}
                                    />
                                </div>
                            </div>
                            <h3 className={`text-xl mb-3 ${cormorantClass}`}>
                                {item.title}
                            </h3>
                            <p className="text-gray-600 text-sm">{item.description}</p>
                        </div>
                    ))}
                </div>

                {/* Image Modal */}
                {selectedPortfolio && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
                        onClick={closeImageModal}
                    >
                        <div
                            className={`
                                relative w-full ${isFullscreen ? "h-full" : "max-h-[90vh] max-w-6xl mx-auto"}
                                flex flex-col ${isFullscreen ? "bg-transparent" : "bg-white rounded-lg shadow-2xl"} overflow-hidden
                            `}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Image Container */}
                            <div
                                className={`
                                    flex-grow flex items-center justify-center
                                    ${isFullscreen ? "h-full" : "max-h-[60vh]"}
                                    ${isFullscreen ? "bg-transparent" : "bg-black"} relative
                                `}
                            >
                                {/* Current Image */}
                                {getPortfolioImages(selectedPortfolio)[currentImageIndex] && (
                                    <img
                                        src={getPortfolioImages(selectedPortfolio)[currentImageIndex].image_path}
                                        alt={selectedPortfolio.title}
                                        className={`
                                            object-contain
                                            ${isFullscreen ? "w-full h-full" : "max-w-full h-auto"}
                                        `}
                                        style={{ maxHeight: isFullscreen ? '90vh' : '55vh' }}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/placeholder-image.jpg";
                                        }}
                                    />
                                )}

                                {/* Image counter - placed at top left corner */}
                                {getPortfolioImages(selectedPortfolio).length > 1 && (
                                    <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-3 py-1 rounded-full text-white text-sm font-medium">
                                        {currentImageIndex + 1} / {getPortfolioImages(selectedPortfolio).length}
                                    </div>
                                )}

                                {/* Navigation arrows - only show if multiple images */}
                                {getPortfolioImages(selectedPortfolio).length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                prevImage();
                                            }}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-70 transition-colors"
                                            aria-label="Previous Image"
                                        >
                                            <ChevronLeft size={24} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                nextImage();
                                            }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 p-2 rounded-full text-white hover:bg-opacity-70 transition-colors"
                                            aria-label="Next Image"
                                        >
                                            <ChevronRight size={24} />
                                        </button>
                                    </>
                                )}
                            </div>

                            {/* Thumbnail Navigation - only show if NOT in fullscreen and multiple images */}
                            {!isFullscreen && getPortfolioImages(selectedPortfolio).length > 1 && (
                                <div className="p-2 bg-black flex justify-center overflow-x-auto" style={{ maxHeight: '100px' }}>
                                    {getPortfolioImages(selectedPortfolio).map((image, idx) => (
                                        <div
                                            key={image.id || idx}
                                            className={`
                                                cursor-pointer mx-1 border-2 rounded overflow-hidden
                                                ${idx === currentImageIndex ? "border-pink-500" : "border-transparent"}
                                                flex-shrink-0
                                            `}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentImageIndex(idx);
                                            }}
                                        >
                                            <img
                                                src={image.image_path}
                                                alt={`Thumbnail ${idx + 1}`}
                                                className="h-16 w-20 object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = "/placeholder-image.jpg";
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Image Info - only show if NOT in fullscreen */}
                            {!isFullscreen && (
                                <div className="bg-white p-4">
                                    <div>
                                        <h3 className={`text-xl sm:text-2xl ${cormorantClass} text-gray-800`}>
                                            {selectedPortfolio.title}
                                        </h3>
                                        <p className="text-sm sm:text-base text-gray-600">
                                            {selectedPortfolio.description}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Modal Controls */}
                            <div className="absolute top-4 right-4 flex space-x-4">
                                {/* Fullscreen Toggle */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleFullscreen();
                                    }}
                                    className="text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 p-2 rounded-full"
                                    aria-label={
                                        isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"
                                    }
                                >
                                    {isFullscreen ? (
                                        <Minimize2 size={20} />
                                    ) : (
                                        <Maximize2 size={20} />
                                    )}
                                </button>

                                {/* Close Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        closeImageModal();
                                    }}
                                    className="text-white hover:text-gray-300 transition-colors bg-black bg-opacity-50 p-2 rounded-full"
                                    aria-label="Close"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

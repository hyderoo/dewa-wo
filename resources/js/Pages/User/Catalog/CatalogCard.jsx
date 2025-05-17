import React from "react";
import { Link } from "@inertiajs/react";

// Font classes
const cormorantClass = "font-cormorant font-light";

const CatalogCard = ({ service, onBuyClick, isAuthenticated }) => {
    // Helper function to format price from array to string
    const formatPriceRange = (priceArray) => {
        if (!priceArray || !Array.isArray(priceArray) || priceArray.length < 2) {
            return 'Harga tidak tersedia';
        }
        return `Rp ${priceArray[0].toLocaleString()} - Rp ${priceArray[1].toLocaleString()}`;
    };

    // Handle button click with authentication check
    const handleBuyClick = () => {
        if (isAuthenticated) {
            onBuyClick(service);
        }
        // If not authenticated, the Link component below will redirect to login
    };

    return (
        <div className="group px-4 text-center sm:px-0 bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
            <div className="mx-auto mb-6 h-64 w-full overflow-hidden">
                <img
                    src={service.image}
                    alt={service.name}
                    className="h-full w-full object-cover transition-all duration-300 group-hover:scale-110"
                />
            </div>

            <h3
                className={`
                    ${cormorantClass}
                    mt-4
                    mb-2
                    text-xl
                    font-light
                    text-black
                    tracking-wide
                    sm:mb-3
                    sm:text-2xl
                `}
            >
                {service.name}
            </h3>

            <p className="mb-3 text-gray-600 px-4 sm:px-6 h-24 overflow-hidden">
                {service.description}
            </p>

            <ul className="mb-6 px-4 text-left text-gray-700">
                {service.features && Array.isArray(service.features) &&
                    service.features.map((feature, featureIndex) => (
                        <li
                            key={featureIndex}
                            className="py-1 border-b last:border-b-0 border-gray-200"
                        >
                            ✓ {feature}
                        </li>
                    ))}
            </ul>

            {isAuthenticated ? (
                <button
                    onClick={handleBuyClick}
                    className="mb-4 bg-pink-600 text-white px-6 py-2 rounded-full hover:bg-pink-700 transition duration-300"
                >
                    Pilih Paket
                </button>
            ) : (
                <Link
                    href={route('login', { redirect: route('features') })}
                    className="mb-4 inline-block bg-pink-600 text-white px-6 py-2 rounded-full hover:bg-pink-700 transition duration-300"
                >
                    Login untuk Pesan
                </Link>
            )}
        </div>
    );
};

export default CatalogCard;

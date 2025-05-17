import React, { useState } from "react";
import { usePage } from "@inertiajs/react";
import WeddingCalendar from "./WeddingCalendar";
import CustomPackageModal from "./CustomPackageModal";
import CatalogFilter from "./CatalogFilter";
import CatalogCard from "./CatalogCard";
import OrderModal from "./OrderModal";
import LoginRequiredModal from "./LoginRequiredModal";

// Font classes
const cormorantClass = "font-cormorant font-light";

export default function CatalogContent() {
    const { catalogs, auth } = usePage().props;
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedService, setSelectedService] = useState(null);
    const [selectedType, setSelectedType] = useState("all"); // Default "all" untuk menampilkan semua
    const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    // Check if user is authenticated
    const isAuthenticated = auth && auth.user;

    const handleBuyClick = (service) => {
        if (isAuthenticated) {
            setSelectedService(service);
        } else {
            // Show login modal or redirect to login page
            setIsLoginModalOpen(true);
        }
    };

    const handleCustomPackageClick = () => {
        if (isAuthenticated) {
            setIsCustomModalOpen(true);
        } else {
            setIsLoginModalOpen(true);
        }
    };

    const typeOptions = [
        { value: "all", label: "Semua" },
        { value: "all-in-one", label: "Paket Lengkap" },
        { value: "decoration", label: "Dekorasi" },
        { value: "documentation", label: "Dokumentasi" },
    ];

    const filteredServices = catalogs
        ? catalogs.filter(
            (service) =>
                (selectedType === "all" || service.type === selectedType) &&
                service.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];

    return (
        <div className="bg-white py-16 sm:py-24 min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center sm:mb-16">
                    <h2
                        className={`
                            ${cormorantClass}
                            text-3xl
                            font-light
                            text-black
                            tracking-wide
                            sm:text-4xl
                        `}
                    >
                        Katalog Layanan Pernikahan
                    </h2>
                    <p className="mt-3 mx-auto max-w-xl tracking-wider leading-relaxed text-gray-600 px-4 sm:mt-4 sm:max-w-2xl sm:px-0">
                        Temukan paket pernikahan sempurna yang sesuai dengan impian dan
                        anggaran anda
                    </p>
                </div>

                {/* Filters Section */}
                <CatalogFilter
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    selectedType={selectedType}
                    setSelectedType={setSelectedType}
                    typeOptions={typeOptions}
                />

                {/* Catalog Cards Grid */}
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4 sm:gap-16 text-gray-600">
                    {filteredServices.map((service) => (
                        <CatalogCard
                            key={service.id}
                            service={service}
                            onBuyClick={handleBuyClick}
                            isAuthenticated={isAuthenticated}
                        />
                    ))}

                    {/* Custom Package Card */}
                    <div
                        onClick={handleCustomPackageClick}
                        className="group px-4 text-center sm:px-0 bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105 min-h-[200px] flex flex-col items-center justify-center cursor-pointer"
                    >
                        <div className="text-4xl text-pink-600 mb-4">+</div>
                        <h3
                            className={`${cormorantClass} text-xl font-light text-black tracking-wide sm:text-2xl`}
                        >
                            Custom Paket
                        </h3>
                        {!isAuthenticated && (
                            <p className="text-sm text-gray-500 mt-2">Login untuk memesan</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-16">
                <WeddingCalendar />
            </div>

            {/* Modals */}
            {isAuthenticated && (
                <>
                    <CustomPackageModal
                        isOpen={isCustomModalOpen}
                        onClose={() => setIsCustomModalOpen(false)}
                        auth={auth}
                    />

                    {selectedService && (
                        <OrderModal
                            service={selectedService}
                            onClose={() => setSelectedService(null)}
                        />
                    )}
                </>
            )}

            {/* Login Required Modal */}
            <LoginRequiredModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
            />
        </div>
    );
}

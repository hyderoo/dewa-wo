import React from "react";

const CatalogFilterStatusBar = ({ selectedType, setSelectedType, filteredServicesCount }) => {
    return (
        <div className="bg-blue-50 px-6 py-2 border-b border-blue-100">
            <div className="flex justify-between items-center">
                <p className="text-sm text-blue-600">
                    <span className="font-medium">Filter aktif:</span> {selectedType === "all" ? "Semua Tipe" :
                        selectedType === "all-in-one" ? "Paket Lengkap" :
                            selectedType === "decoration" ? "Dekorasi" :
                                selectedType === "documentation" ? "Dokumentasi" : selectedType}
                    {filteredServicesCount === 1
                        ? " (1 item)"
                        : ` (${filteredServicesCount} items)`}
                </p>
                <button
                    onClick={() => setSelectedType("all")}
                    className="text-xs text-blue-700 hover:text-blue-900"
                >
                    Hapus filter
                </button>
            </div>
        </div>
    );
};

export default CatalogFilterStatusBar;

import React from "react";
import { X } from "lucide-react";

const FeatureFormModal = ({
    isOpen,
    onClose,
    selectedFeature,
    data,
    setData,
    errors,
    priceFormatted,
    handlePriceChange,
    processing,
    handleSubmit
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-semibold">
                        {selectedFeature ? "Edit Fitur" : "Tambah Fitur Baru"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nama Fitur
                            </label>
                            <input
                                type="text"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'
                                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                                required
                            />
                            {errors.name && (
                                <div className="text-red-500 text-xs mt-1">{errors.name}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Harga
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                    Rp
                                </span>
                                <input
                                    type="text"
                                    value={priceFormatted}
                                    onChange={handlePriceChange}
                                    className={`w-full pl-10 pr-3 py-2 border ${errors.price ? 'border-red-500' : 'border-gray-300'
                                        } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                                    placeholder="5.000.000"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Contoh: 5.000.000 untuk Rp 5.000.000
                            </p>
                            {errors.price && (
                                <div className="text-red-500 text-xs mt-1">{errors.price}</div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Deskripsi
                            </label>
                            <textarea
                                value={data.description}
                                onChange={(e) => setData('description', e.target.value)}
                                className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'
                                    } rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                                rows="3"
                                required
                            />
                            {errors.description && (
                                <div className="text-red-500 text-xs mt-1">{errors.description}</div>
                            )}
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className={`flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors ${processing ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                        >
                            {processing ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Mengirim...
                                </span>
                            ) : (
                                selectedFeature ? "Simpan Perubahan" : "Tambah Fitur"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FeatureFormModal;

import React from "react";
import { Upload, X } from "lucide-react";

const CatalogForm = ({
    data,
    setData,
    errors,
    selectedService,
    minPriceFormatted,
    maxPriceFormatted,
    handleMinPriceChange,
    handleMaxPriceChange,
    serviceTypes,
    currentFeature,
    setCurrentFeature,
    handleAddFeature,
    handleRemoveFeature,
    previewImage,
    handleImageChange,
    processing,
    onSubmit,
    onCancel
}) => {
    return (
        <form onSubmit={onSubmit} encType="multipart/form-data" className="p-4">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nama Layanan
                    </label>
                    <input
                        type="text"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'
                            } rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                        required
                    />
                    {errors.name && (
                        <div className="text-red-500 text-xs mt-1">{errors.name}</div>
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
                            } rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                        rows="3"
                        required
                    />
                    {errors.description && (
                        <div className="text-red-500 text-xs mt-1">{errors.description}</div>
                    )}
                </div>

                {/* Price Range Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Harga Minimum
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                Rp
                            </span>
                            <input
                                type="text"
                                value={minPriceFormatted}
                                onChange={handleMinPriceChange}
                                className={`w-full pl-10 pr-3 py-2 border ${errors.min_price ? 'border-red-500' : 'border-gray-300'
                                    } rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                                placeholder="50.000.000"
                                required
                            />
                        </div>
                        {errors.min_price && (
                            <div className="text-red-500 text-xs mt-1">{errors.min_price}</div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Harga Maksimum
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                Rp
                            </span>
                            <input
                                type="text"
                                value={maxPriceFormatted}
                                onChange={handleMaxPriceChange}
                                className={`w-full pl-10 pr-3 py-2 border ${errors.max_price ? 'border-red-500' : 'border-gray-300'
                                    } rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                                placeholder="100.000.000"
                                required
                            />
                        </div>
                        {errors.max_price && (
                            <div className="text-red-500 text-xs mt-1">{errors.max_price}</div>
                        )}
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                    Format angka tanpa simbol Rp. Contoh: 50.000.000
                </p>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipe Layanan
                    </label>
                    <select
                        value={data.type}
                        onChange={(e) => setData('type', e.target.value)}
                        className={`w-full px-3 py-2 border ${errors.type ? 'border-red-500' : 'border-gray-300'
                            } rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent`}
                    >
                        {serviceTypes.map((type) => (
                            <option key={type.value} value={type.value}>
                                {type.label}
                            </option>
                        ))}
                    </select>
                    {errors.type && (
                        <div className="text-red-500 text-xs mt-1">{errors.type}</div>
                    )}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fitur-fitur
                    </label>
                    <div className="flex gap-2 mb-2">
                        <input
                            type="text"
                            value={currentFeature}
                            onChange={(e) => setCurrentFeature(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                            placeholder="Tambah fitur baru"
                        />
                        <button
                            type="button"
                            onClick={handleAddFeature}
                            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                        >
                            Tambah
                        </button>
                    </div>
                    <ul className="space-y-2">
                        {data.features.map((feature, index) => (
                            <li
                                key={index}
                                className="flex items-center justify-between bg-gray-50 p-2 rounded"
                            >
                                <span>{feature}</span>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveFeature(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gambar
                    </label>
                    <div
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => document.getElementById('imageUpload').click()}
                    >
                        {previewImage ? (
                            <div className="relative">
                                <img
                                    src={previewImage}
                                    alt="Preview"
                                    className="w-full h-40 object-cover rounded-lg mx-auto"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                                    <p className="text-white">Klik untuk mengubah gambar</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600">
                                    Klik untuk memilih gambar atau drop file di sini
                                </p>
                            </>
                        )}
                        <input
                            id="imageUpload"
                            type="file"
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                    {errors.image && (
                        <div className="text-red-500 text-xs mt-1">{errors.image}</div>
                    )}
                </div>
            </div>

            <div className="flex gap-3 mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={processing}
                    className={`flex-1 px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors ${processing ? 'opacity-75 cursor-not-allowed' : ''
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
                        selectedService ? "Simpan Perubahan" : "Tambah Layanan"
                    )}
                </button>
            </div>
        </form>
    );
};

export default CatalogForm;

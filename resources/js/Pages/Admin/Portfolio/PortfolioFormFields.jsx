import React from "react";

const PortfolioFormFields = ({ data, errors, categories, handleInputChange }) => {
    return (
        <>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Judul <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    name="title"
                    value={data.title}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500`}
                    placeholder="Masukkan judul portfolio"
                />
                {errors.title && (
                    <div className="text-red-500 text-sm mt-1">{errors.title}</div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori <span className="text-red-500">*</span>
                </label>
                <select
                    name="category"
                    value={data.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
                >
                    {categories.map((category) => (
                        <option key={category} value={category}>
                            {category}
                        </option>
                    ))}
                </select>
                {errors.category && (
                    <div className="text-red-500 text-sm mt-1">{errors.category}</div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi <span className="text-red-500">*</span>
                </label>
                <textarea
                    name="description"
                    value={data.description}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500`}
                    rows={4}
                    placeholder="Masukkan deskripsi portfolio"
                />
                {errors.description && (
                    <div className="text-red-500 text-sm mt-1">{errors.description}</div>
                )}
            </div>
        </>
    );
};

export default PortfolioFormFields;

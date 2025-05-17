import React, { useState } from "react";
import { Trash2, AlertCircle } from "lucide-react";
import { router } from '@inertiajs/react';

const DeleteTeamConfirmationModal = ({ isOpen, onClose, teamMember }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState("");

    const handleConfirmDelete = () => {
        if (isDeleting || !teamMember) return;

        setIsDeleting(true);
        setError("");

        router.delete(route('admin.teams.destroy', teamMember.id), {
            onSuccess: () => {
                // Successfully deleted
                onClose();
            },
            onError: () => {
                setError("Gagal menghapus anggota tim. Silakan coba lagi.");
                setIsDeleting(false);
            },
            onFinish: () => {
                setIsDeleting(false);
            }
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full text-gray-600">
                <div className="flex justify-center mb-4">
                    <div className="bg-red-100 p-3 rounded-full">
                        <Trash2 className="h-6 w-6 text-red-500" />
                    </div>
                </div>
                <h2 className="text-xl font-bold mb-4 text-center">
                    Konfirmasi Hapus Tim
                </h2>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center">
                        <AlertCircle className="w-5 h-5 mr-2" />
                        <span>{error}</span>
                    </div>
                )}

                <p className="text-gray-600 mb-6 text-center">
                    Apakah Anda yakin ingin menghapus <span className="font-semibold">{teamMember?.name}</span> dari tim? Tindakan ini tidak dapat dibatalkan.
                </p>

                <div className="flex justify-center space-x-4">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                    >
                        Batal
                    </button>
                    <button
                        onClick={handleConfirmDelete}
                        disabled={isDeleting}
                        className={`px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 flex items-center ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {isDeleting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Memproses...
                            </>
                        ) : (
                            'Hapus'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteTeamConfirmationModal;

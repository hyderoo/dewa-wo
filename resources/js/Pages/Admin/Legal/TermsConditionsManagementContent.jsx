import React, { useState, useEffect } from "react";
import { useForm } from "@inertiajs/react";
import { usePage } from "@inertiajs/react";
import Toast from "@/Components/Toast";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Toolbar from './Toolbar';

const TermsConditionsManagementContent = ({ termsConditions, version }) => {
    const { toast } = usePage().props;
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState({ type: "", message: "" });

    // Form handling
    const { data, setData, post, processing, errors } = useForm({
        content: termsConditions || '',
        version: version || '1.0'
    });

    // Editor setup
    const editor = useEditor({
        extensions: [StarterKit],
        content: data.content,
        onUpdate: ({ editor }) => {
            setData('content', editor.getHTML());
        }
    });

    // Check for flash messages
    useEffect(() => {
        if (toast) {
            setToastMessage({ type: toast.type, message: toast.message });
            setShowToast(true);

            // Auto-close toast after 5 seconds
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [toast]);

    // Save terms
    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('admin.terms-conditions.update'), {
            onSuccess: () => {
                setToastMessage({
                    type: "success",
                    message: "Syarat & Ketentuan berhasil diperbarui!"
                });
                setShowToast(true);
            }
        });
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
                            Manajemen Syarat & Ketentuan
                        </h1>
                        <p className="text-center text-white/80 mt-2 max-w-2xl mx-auto">
                            Kelola syarat & ketentuan untuk aplikasi Anda
                        </p>
                    </div>

                    <div className="p-6 md:p-8">
                        <form onSubmit={handleSubmit}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold text-gray-800">Syarat & Ketentuan</h2>
                                <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                    Versi: {data.version}
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Versi
                                </label>
                                <input
                                    type="text"
                                    value={data.version}
                                    onChange={(e) => setData('version', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                                />
                                {errors.version && (
                                    <p className="text-red-500 text-xs mt-1">{errors.version}</p>
                                )}
                            </div>

                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Konten
                                </label>
                                <div className="border border-gray-300 rounded-lg overflow-hidden">
                                    <Toolbar editor={editor} />
                                    <div className="p-4 min-h-[400px] bg-white">
                                        <EditorContent editor={editor} />
                                    </div>
                                </div>
                                {errors.content && (
                                    <p className="text-red-500 text-xs mt-1">{errors.content}</p>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => editor && editor.commands.setContent(termsConditions)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    Reset
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-75"
                                    disabled={processing}
                                >
                                    {processing ? 'Menyimpan...' : 'Simpan Perubahan'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsConditionsManagementContent;

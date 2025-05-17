import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import BaseLayout from "@/Layouts/BaseLayout";

const CancelOrder = ({ order, auth }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        reason: "",
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        post(route("orders.cancel", order.id), {
            onSuccess: () => {
                // Redirect will be handled by controller
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    };

    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(date);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <>
            <Head title="Batalkan Pesanan" />
            <BaseLayout auth={auth}>
                <div className="py-12 bg-gray-50">
                    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Back button */}
                        <Link
                            href={route("orders")}
                            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Kembali ke Daftar Pesanan
                        </Link>

                        <div className="bg-white rounded-lg shadow overflow-hidden">
                            <div className="bg-red-600 px-6 py-4">
                                <h1 className="text-xl font-semibold text-white">
                                    Batalkan Pesanan
                                </h1>
                            </div>

                            <div className="p-6 border-b border-gray-200">
                                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
                                    <div className="flex">
                                        <div className="flex-shrink-0">
                                            <AlertTriangle className="h-5 w-5 text-red-400" />
                                        </div>
                                        <div className="ml-3">
                                            <p className="text-sm text-red-700">
                                                Perhatian: Pembatalan pesanan tidak dapat dibatalkan. Pastikan Anda yakin ingin membatalkan pesanan ini.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <h2 className="text-lg font-medium text-gray-900 mb-4">
                                    Detail Pesanan
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                        <p className="text-sm text-gray-600">Nomor Pesanan</p>
                                        <p className="font-medium">#{order.order_number}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Tanggal Acara</p>
                                        <p className="font-medium">{formatDate(order.event_date)}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Jenis Paket</p>
                                        <p className="font-medium">
                                            {order.catalog ? order.catalog.name : "Custom Package"}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Total Harga</p>
                                        <p className="font-medium">{formatCurrency(order.price)}</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-6">
                                        <label
                                            htmlFor="reason"
                                            className="block text-sm font-medium text-gray-700 mb-2"
                                        >
                                            Alasan Pembatalan
                                        </label>
                                        <textarea
                                            id="reason"
                                            name="reason"
                                            rows="4"
                                            value={data.reason}
                                            onChange={(e) => setData("reason", e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-red-500 focus:ring focus:ring-red-500 focus:ring-opacity-50"
                                            placeholder="Silakan berikan alasan pembatalan pesanan (opsional)"
                                        ></textarea>
                                        {errors.reason && (
                                            <p className="mt-2 text-sm text-red-600">
                                                {errors.reason}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-end space-x-3">
                                        <Link
                                            href={route("orders")}
                                            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                                        >
                                            Kembali
                                        </Link>
                                        <button
                                            type="submit"
                                            disabled={processing || isSubmitting}
                                            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                        >
                                            {processing || isSubmitting
                                                ? "Memproses..."
                                                : "Batalkan Pesanan"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </BaseLayout>
        </>
    );
};

export default CancelOrder;

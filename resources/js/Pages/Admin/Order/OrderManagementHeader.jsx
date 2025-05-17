import React from "react";
import { PlusCircle, FileText, DollarSign, Calendar } from "lucide-react";

const OrderManagementHeader = ({ title, subtitle, pendingCount, completedCount, onCreateOrder }) => {
    return (
        <div className="relative overflow-hidden mb-8">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 md:p-8 rounded-2xl shadow-xl">
                <div className="relative z-10">
                    <h1 className="font-cormorant text-3xl md:text-4xl font-light text-white text-center tracking-wide">
                        {title || "Manajemen Pesanan"}
                    </h1>
                    <p className="text-center text-white/80 mt-2 max-w-2xl mx-auto">
                        {subtitle || "Kelola semua pesanan pernikahan dalam satu dashboard"}
                    </p>

                    <div className="mt-6 flex flex-col md:flex-row justify-center items-center gap-4">
                        <button
                            onClick={onCreateOrder}
                            className="inline-flex items-center px-6 py-3 bg-white text-pink-600 rounded-lg hover:bg-pink-50 shadow-md transition-colors duration-200"
                        >
                            <PlusCircle className="w-5 h-5 mr-2" />
                            Buat Pesanan Baru
                        </button>

                        {pendingCount > 0 && (
                            <div className="inline-flex items-center px-4 py-2 bg-white/20 text-white rounded-lg backdrop-blur-sm">
                                <Calendar className="w-4 h-4 mr-2" />
                                <span>{pendingCount} pesanan menunggu pembayaran</span>
                            </div>
                        )}
                    </div>

                    {(pendingCount > 0 || completedCount > 0) && (
                        <div className="flex justify-center mt-6 gap-3">
                            <div className="inline-flex items-center bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
                                <div className="flex gap-2 items-center">
                                    <div className="h-2 w-2 rounded-full bg-yellow-300"></div>
                                    <span className="text-white text-sm font-medium">Pending: {pendingCount || 0}</span>
                                </div>
                            </div>
                            <div className="inline-flex items-center bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
                                <div className="flex gap-2 items-center">
                                    <div className="h-2 w-2 rounded-full bg-green-300"></div>
                                    <span className="text-white text-sm font-medium">Completed: {completedCount || 0}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-72 h-72 opacity-10">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="white" d="M42.8,-62.2C54.9,-56.3,63.8,-42.8,69.7,-28.2C75.5,-13.7,78.4,1.9,75.4,16.9C72.3,31.9,63.4,46.3,50.9,55.3C38.4,64.3,22.4,67.9,7.3,67.8C-7.9,67.7,-23.1,63.9,-38.2,57C-53.2,50,-68.1,39.8,-74.9,25.7C-81.7,11.7,-80.3,-6.2,-72.4,-19.4C-64.4,-32.7,-50,-41.2,-36.7,-47C-23.5,-52.7,-11.7,-55.6,2.2,-58.8C16.2,-62,32.5,-65.6,42.8,-62.2Z" transform="translate(100 100)" />
                    </svg>
                </div>

                <div className="absolute -bottom-10 -left-10 w-40 h-40 opacity-10">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                        <path fill="white" d="M48.2,-71.9C63.9,-62.8,79.1,-52.1,82.8,-38.1C86.5,-24,78.8,-6.7,75.4,12.2C72,31.1,73,51.7,64.7,66.3C56.3,80.9,38.7,89.5,21.9,87.3C5.2,85,-11.8,71.8,-25.8,61.2C-39.9,50.5,-51,42.3,-62.2,30.7C-73.4,19.1,-84.7,4.1,-82.4,-9.2C-80,-22.5,-64.1,-34.1,-50.2,-43.5C-36.3,-52.9,-24.4,-60.2,-10.4,-67.8C3.6,-75.4,19.5,-83.4,35.5,-81.9C51.5,-80.5,67.5,-67.7,70.3,-69C73.1,-70.3,62.6,-85.6,58.3,-87.8C54,-90,55.8,-79.1,48.2,-71.9Z" transform="translate(100 100)" />
                    </svg>
                </div>

                {/* Floating Icons */}
                <div className="absolute top-10 left-10 text-white/20">
                    <FileText className="h-10 w-10" />
                </div>

                <div className="absolute bottom-10 right-20 text-white/20">
                    <DollarSign className="h-16 w-16" />
                </div>
            </div>
        </div>
    );
};

export default OrderManagementHeader;

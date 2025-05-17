import React, { useState, useEffect } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import {
    Copy, AlertTriangle, ChevronDown, ChevronUp,
    Building, CreditCard, DollarSign, Circle, CheckCircle
} from "lucide-react";
import BaseLayout from "@/Layouts/BaseLayout";

// Styles
const cormorantClass = "font-cormorant font-light";
const cormorantBoldClass = "font-cormorant font-semibold";

const Detail = () => {
    const { order, banks, virtualAccounts, auth } = usePage().props;

    const [expandedMethod, setExpandedMethod] = useState(null); // 'transfer' or 'virtual_account'
    const [selectedBank, setSelectedBank] = useState(null);
    const [copied, setCopied] = useState(false);
    const [timeLeft, setTimeLeft] = useState(24 * 60 * 60); // 24 hours in seconds
    const [imagePreview, setImagePreview] = useState(null);
    const [paymentType, setPaymentType] = useState(order.requires_down_payment ? "down_payment" : "full_payment");

    const { data, setData, post, processing, errors } = useForm({
        order_id: order.id,
        payment_type: order.requires_down_payment ? "down_payment" : "full_payment",
        payment_method: "",
        bank_code: "",
        amount: order.requires_down_payment ? order.down_payment_amount : order.remaining_amount,
        payment_proof: null,
    });

    // Handle payment type change
    useEffect(() => {
        // Update amount based on payment type
        if (paymentType === "down_payment") {
            setData("amount", order.down_payment_amount);
        } else if (paymentType === "installment") {
            // Default installment amount could be a smaller portion of remaining amount
            const suggestedAmount = Math.min(order.remaining_amount / 2, order.remaining_amount);
            setData("amount", suggestedAmount);
        } else if (paymentType === "full_payment") {
            setData("amount", order.remaining_amount);
        }

        setData("payment_type", paymentType);
    }, [paymentType]);

    // Timer for payment countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Format time for display
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
            2,
            "0"
        )}:${String(secs).padStart(2, "0")}`;
    };

    // Toggle payment method accordion
    const toggleAccordion = (method) => {
        if (expandedMethod === method) {
            setExpandedMethod(null);
            setData("payment_method", "");
        } else {
            setExpandedMethod(method);
            setData("payment_method", method);
        }
    };

    // Handle bank selection
    const handleBankSelect = (bank) => {
        setSelectedBank(bank);
        setData("bank_code", bank.code);
    };

    // Handle file change for payment proof
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setData("payment_proof", file);

        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreview(null);
        }
    };

    // Handle copy to clipboard
    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Handle amount change
    const handleAmountChange = (e) => {
        const amount = parseFloat(e.target.value);
        if (isNaN(amount) || amount <= 0) {
            setData("amount", 0);
            return;
        }

        // Validate maximum amount
        if (amount > order.remaining_amount) {
            setData("amount", order.remaining_amount);
            return;
        }

        setData("amount", amount);
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

    // Handle payment submission
    const handlePayment = () => {
        if (expandedMethod === 'transfer') {
            post(route("payments.store"));
        } else if (expandedMethod === 'virtual_account') {
            post(route("payments.virtual_account"));
        }
    };

    // Virtual Account options with better details
    const vaOptions = virtualAccounts.map(va => ({
        code: va.bank_code,
        name: va.name,
        logo: va.logo,
        fullName: va.name,
        description: va.description || `Transfer melalui Mobile Banking, Internet Banking, atau ATM ${va.name}`
    }));

    // Determine available payment types
    const availablePaymentTypes = () => {
        const types = [];

        // If down payment is required and not yet paid
        if (order.requires_down_payment && !order.down_payment_paid) {
            types.push({
                id: "down_payment",
                name: "Uang Muka",
                description: `${formatCurrency(order.down_payment_amount)} (${order.down_payment_percentage}%)`
            });
        }

        // If order is not fully paid
        if (order.remaining_amount > 0) {
            // If order has remaining amount but isn't just the down payment
            if (order.paid_amount > 0 || !order.requires_down_payment) {
                types.push({
                    id: "installment",
                    name: "Cicilan",
                    description: "Bayar sebagian dari sisa pembayaran"
                });
            }

            types.push({
                id: "full_payment",
                name: "Pelunasan",
                description: `${formatCurrency(order.remaining_amount)}`
            });
        }

        return types;
    };

    // Get instructions for specific bank's VA
    const getVirtualAccountInstructions = (bankCode) => {
        const va = virtualAccounts.find(va => va.bank_code === bankCode);
        if (!va) return [];
        const instructions = va.payment_instructions;
        console.log(instructions);
        return instructions.map(instruction => instruction.instruction);
    };

    return (
        <>
            <Head title="Detail Pembayaran" />
            <BaseLayout auth={auth}>
                <div className="min-h-screen bg-gray-50 py-12 text-gray-600">
                    <div className="max-w-3xl mx-auto px-4">
                        {/* Back Button */}
                        <a href={route("orders")}>
                            <button className="mb-8 inline-flex items-center text-gray-600 hover:text-pink-600 transition-colors">
                                <svg
                                    className="w-5 h-5 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                                    />
                                </svg>
                                Kembali
                            </button>
                        </a>

                        {/* Main Content */}
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            {/* Header */}
                            <div className="bg-pink-600 px-6 py-4">
                                <h1 className={`${cormorantClass} text-2xl text-white`}>
                                    Detail Pembayaran
                                </h1>
                            </div>

                            {/* Order Summary */}
                            <div className="p-6 border-b">
                                <h2 className="text-lg font-semibold mb-4">Ringkasan Pesanan</h2>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Paket</span>
                                        <span className="font-medium">{order.catalog ? order.catalog.name : "Custom Package"}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Tanggal Acara</span>
                                        <span>{new Date(order.event_date).toLocaleDateString("id-ID", {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        })}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total Harga</span>
                                        <span>{formatCurrency(order.price)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Sudah Dibayar</span>
                                        <span>{formatCurrency(order.paid_amount)}</span>
                                    </div>
                                    <div className="flex justify-between text-lg font-semibold mt-4">
                                        <span>Sisa Pembayaran</span>
                                        <span className="text-pink-600">{formatCurrency(order.remaining_amount)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Timer */}
                            <div className="p-6 bg-pink-50 border-b">
                                <div className="text-center">
                                    <p className="text-gray-600 mb-2">Selesaikan pembayaran dalam</p>
                                    <p className="text-2xl font-bold text-pink-600">
                                        {formatTime(timeLeft)}
                                    </p>
                                </div>
                            </div>

                            {/* Payment Type Selection */}
                            <div className="p-6 border-b">
                                <h2 className="text-lg font-semibold mb-4">Jenis Pembayaran</h2>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {availablePaymentTypes().map((type) => (
                                        <div
                                            key={type.id}
                                            onClick={() => setPaymentType(type.id)}
                                            className={`p-4 border rounded-lg cursor-pointer transition-all
                                                ${paymentType === type.id
                                                    ? 'border-pink-500 bg-pink-50'
                                                    : 'border-gray-200 hover:border-pink-200 hover:bg-pink-50/30'
                                                }`}
                                        >
                                            <div className="flex items-center mb-2">
                                                <div className={`h-5 w-5 mr-2 flex items-center justify-center`}>
                                                    {paymentType === type.id ? (
                                                        <CheckCircle className="h-5 w-5 text-pink-600" />
                                                    ) : (
                                                        <Circle className="h-5 w-5 text-gray-300" />
                                                    )}
                                                </div>
                                                <span className="font-medium">{type.name}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 ml-7">
                                                {type.description}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Custom amount for installments */}
                                {paymentType === 'installment' && (
                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Jumlah Pembayaran
                                        </label>
                                        <div className="relative">
                                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                                Rp
                                            </span>
                                            <input
                                                type="number"
                                                value={data.amount}
                                                onChange={handleAmountChange}
                                                min="1"
                                                max={order.remaining_amount}
                                                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                placeholder="0"
                                                required
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Maksimal: {formatCurrency(order.remaining_amount)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Payment Methods Section */}
                            <div className="p-6">
                                <h2 className="text-lg font-semibold mb-4">Pilih Metode Pembayaran</h2>

                                {/* Bank Transfer Accordion */}
                                <div className="mb-4 border rounded-lg overflow-hidden">
                                    <div
                                        className={`flex justify-between items-center p-4 cursor-pointer ${expandedMethod === 'transfer' ? 'bg-pink-50 border-pink-500' : 'bg-white hover:bg-gray-50'}`}
                                        onClick={() => toggleAccordion('transfer')}
                                    >
                                        <div className="flex items-center">
                                            <div className={`p-2 rounded-full mr-3 ${expandedMethod === 'transfer' ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600'}`}>
                                                <Building className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">Transfer Bank</h3>
                                                <p className="text-sm text-gray-500">Transfer manual melalui bank, perlu verifikasi admin</p>
                                            </div>
                                        </div>
                                        {expandedMethod === 'transfer' ? (
                                            <ChevronUp className="h-5 w-5 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-gray-500" />
                                        )}
                                    </div>

                                    {expandedMethod === 'transfer' && (
                                        <div className="p-4 border-t border-gray-200">
                                            <h4 className="font-medium mb-3">Pilih Bank</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                                                {banks && banks.map((bank) => (
                                                    <div
                                                        key={bank.id}
                                                        onClick={() => handleBankSelect(bank)}
                                                        className={`p-3 border rounded-lg cursor-pointer flex items-center transition-all ${selectedBank && selectedBank.id === bank.id
                                                            ? "border-pink-500 bg-pink-50"
                                                            : "border-gray-200 hover:border-pink-200"
                                                            }`}
                                                    >
                                                        {bank.logo ? (
                                                            <img src={bank.logo} alt={bank.name} className="h-8 mr-3" />
                                                        ) : (
                                                            <div className="p-1 bg-gray-100 rounded-md mr-3">
                                                                <Building className="h-6 w-6 text-gray-600" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium">{bank.name}</p>
                                                            <p className="text-xs text-gray-500">{bank.account_number}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {selectedBank && (
                                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                    <h4 className="font-medium mb-2">Rekening Tujuan:</h4>
                                                    <div className="space-y-1 mb-4">
                                                        <p>Bank: <span className="font-medium">{selectedBank.name}</span></p>
                                                        <div className="flex items-center">
                                                            <p className="mr-2">No. Rekening: <span className="font-medium font-mono">{selectedBank.account_number}</span></p>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleCopy(selectedBank.account_number);
                                                                }}
                                                                className="p-1 bg-gray-200 rounded-md hover:bg-gray-300 transition"
                                                            >
                                                                {copied ? (
                                                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                                                ) : (
                                                                    <Copy className="h-4 w-4 text-gray-600" />
                                                                )}
                                                            </button>
                                                        </div>
                                                        <p>Atas Nama: <span className="font-medium">{selectedBank.account_name}</span></p>
                                                        <p className="mt-2">Nominal Transfer: <span className="font-medium text-pink-600">{formatCurrency(data.amount)}</span></p>
                                                    </div>

                                                    {/* Upload Payment Proof */}
                                                    <div className="mt-4">
                                                        <h4 className="font-medium mb-2">Unggah Bukti Pembayaran</h4>
                                                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                                                            <input
                                                                type="file"
                                                                id="payment_proof"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={handleFileChange}
                                                            />
                                                            {imagePreview ? (
                                                                <div>
                                                                    <img
                                                                        src={imagePreview}
                                                                        alt="Preview"
                                                                        className="max-h-48 mx-auto mb-3"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setImagePreview(null);
                                                                            setData("payment_proof", null);
                                                                        }}
                                                                        className="text-red-500 text-sm hover:text-red-700"
                                                                    >
                                                                        Hapus Gambar
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <label htmlFor="payment_proof" className="cursor-pointer block">
                                                                    <div className="bg-gray-100 rounded-full h-12 w-12 flex items-center justify-center mx-auto mb-2">
                                                                        <svg
                                                                            className="h-6 w-6 text-gray-500"
                                                                            fill="none"
                                                                            stroke="currentColor"
                                                                            viewBox="0 0 24 24"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                strokeWidth="2"
                                                                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                                            />
                                                                        </svg>
                                                                    </div>
                                                                    <p className="text-gray-700 font-medium">
                                                                        Klik untuk unggah bukti pembayaran
                                                                    </p>
                                                                    <p className="text-gray-500 text-sm mt-1">
                                                                        Format: JPG, JPEG, PNG (Maks. 5MB)
                                                                    </p>
                                                                </label>
                                                            )}
                                                        </div>
                                                        {errors.payment_proof && (
                                                            <p className="text-red-500 text-sm mt-1">{errors.payment_proof}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Virtual Account Accordion */}
                                <div className="mb-4 border rounded-lg overflow-hidden">
                                    <div
                                        className={`flex justify-between items-center p-4 cursor-pointer ${expandedMethod === 'virtual_account' ? 'bg-pink-50 border-pink-500' : 'bg-white hover:bg-gray-50'}`}
                                        onClick={() => toggleAccordion('virtual_account')}
                                    >
                                        <div className="flex items-center">
                                            <div className={`p-2 rounded-full mr-3 ${expandedMethod === 'virtual_account' ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-600'}`}>
                                                <CreditCard className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-medium">Virtual Account</h3>
                                                <p className="text-sm text-gray-500">Pembayaran otomatis via Virtual Account</p>
                                            </div>
                                        </div>
                                        {expandedMethod === 'virtual_account' ? (
                                            <ChevronUp className="h-5 w-5 text-gray-500" />
                                        ) : (
                                            <ChevronDown className="h-5 w-5 text-gray-500" />
                                        )}
                                    </div>

                                    {expandedMethod === 'virtual_account' && (
                                        <div className="p-4 border-t border-gray-200">
                                            <h4 className="font-medium mb-3">Pilih Bank Virtual Account</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {vaOptions.map((bank) => (
                                                    <div
                                                        key={bank.code}
                                                        onClick={() => setData("bank_code", bank.code)}
                                                        className={`p-3 border rounded-lg cursor-pointer flex items-center transition-all ${data.bank_code === bank.code
                                                            ? "border-pink-500 bg-pink-50"
                                                            : "border-gray-200 hover:border-pink-200"
                                                            }`}
                                                    >
                                                        {bank.logo ? (
                                                            <img
                                                                src={bank.logo}
                                                                alt={bank.name}
                                                                className="h-8 w-8 object-contain mr-3"
                                                            />
                                                        ) : (
                                                            <div className="p-1 bg-gray-100 rounded-md mr-3">
                                                                <CreditCard className="h-6 w-6 text-gray-600" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium">{bank.name}</p>
                                                            <p className="text-xs text-gray-500">{bank.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {data.bank_code && (
                                                <div className="mt-4">
                                                    <div className="p-4 bg-blue-50 rounded-lg flex items-start">
                                                        <AlertTriangle className="h-5 w-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <p className="font-medium text-blue-700">Informasi Virtual Account</p>
                                                            <p className="text-sm text-blue-600 mt-1">
                                                                Setelah melanjutkan, Anda akan mendapatkan nomor Virtual Account yang harus dibayarkan.
                                                                Pembayaran akan diverifikasi secara otomatis. Virtual Account akan aktif selama 24 jam.
                                                            </p>
                                                        </div>
                                                    </div>

                                                    {/* VA Payment Instructions */}
                                                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                        <h4 className="font-medium mb-2">Cara Pembayaran {vaOptions.find(b => b.code === data.bank_code)?.fullName || data.bank_code}:</h4>
                                                        <ol className="list-decimal ml-5 text-sm space-y-1 text-gray-600">
                                                            {getVirtualAccountInstructions(data.bank_code).map((instruction, index) => (
                                                                <li key={index}>{instruction}</li>
                                                            ))}
                                                        </ol>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Error Messages */}
                                {errors.payment_method && (
                                    <p className="text-red-500 text-sm mb-4">{errors.payment_method}</p>
                                )}
                                {errors.bank_code && (
                                    <p className="text-red-500 text-sm mb-4">{errors.bank_code}</p>
                                )}

                                {/* Payment Summary */}
                                {expandedMethod && (
                                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                        <h3 className="font-semibold mb-3">Ringkasan Pembayaran</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Jenis Pembayaran</span>
                                                <span className="font-medium">
                                                    {paymentType === 'down_payment' ? 'Uang Muka' :
                                                        paymentType === 'installment' ? 'Cicilan' : 'Pelunasan'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Metode Pembayaran</span>
                                                <span className="font-medium">
                                                    {expandedMethod === 'transfer' ? 'Transfer Bank' : 'Virtual Account'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Jumlah</span>
                                                <span className="font-medium text-pink-600">{formatCurrency(data.amount)}</span>
                                            </div>
                                            {selectedBank && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Bank</span>
                                                    <span className="font-medium">{selectedBank.name}</span>
                                                </div>
                                            )}
                                            {data.bank_code && expandedMethod === 'virtual_account' && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-600">Bank</span>
                                                    <span className="font-medium">{vaOptions.find(b => b.code === data.bank_code)?.fullName || data.bank_code}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Buttons */}
                            <div className="p-6 bg-gray-50 border-t">
                                <div className="flex space-x-4">
                                    <a href={route("orders")} className="w-full">
                                        <button className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">
                                            Batalkan
                                        </button>
                                    </a>
                                    <button
                                        onClick={handlePayment}
                                        disabled={
                                            !expandedMethod ||
                                            (expandedMethod === 'transfer' && (!selectedBank || !data.payment_proof)) ||
                                            (expandedMethod === 'virtual_account' && !data.bank_code) ||
                                            processing ||
                                            data.amount <= 0
                                        }
                                        className="w-full px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {processing ? "Memproses..." : "Lakukan Pembayaran"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </BaseLayout>
        </>
    );
};

export default Detail;

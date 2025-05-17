import React, { useState, useEffect } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import AdminLayout from "@/Layouts/AdminLayout";
import Toast from "@/Components/Toast";
import {
    ArrowLeft,
    DollarSign,
    Calendar,
    Clock,
    CreditCard,
    CheckCircle,
    AlertCircle,
    Loader2,
    FileText,
    Upload,
    Building,
    Wallet,
    AlertTriangle,
    X
} from "lucide-react";

const PaymentDetail = () => {
    const { order, banks, virtualAccounts, toast } = usePage().props;

    const [showToast, setShowToast] = useState(!!toast);
    const [toastMessage, setToastMessage] = useState(toast || { type: "", message: "" });
    const [paymentStep, setPaymentStep] = useState(1);
    const [selectedMethod, setSelectedMethod] = useState(null);
    const [selectedBank, setSelectedBank] = useState(null);
    const [selectedVA, setSelectedVA] = useState(null);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [expiryTime, setExpiryTime] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState("");
    const [imagePreview, setImagePreview] = useState(null);
    const [amountFormatted, setAmountFormatted] = useState("");

    const { data, setData, post, processing, errors, reset } = useForm({
        payment_type: order.requires_down_payment ? "down_payment" : "full_payment",
        payment_method: "",
        bank_code: "",
        amount: order.requires_down_payment ? order.down_payment_amount_value : order.remainingAmount,
        payment_proof: null,
    });

    // Calculate expiry time - 24 hours from now
    useEffect(() => {
        const calculateExpiry = () => {
            const now = new Date();
            const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours later
            setExpiryTime(expiry);
        };

        calculateExpiry();
    }, []);

    // Format initial amount on component mount
    useEffect(() => {
        const initialAmount = order.requires_down_payment ? order.down_payment_amount_value : order.remainingAmount;
        setAmountFormatted(formatRupiah(initialAmount.toString()));
    }, [order]);

    // Update countdown timer
    useEffect(() => {
        if (!expiryTime) return;

        const updateCountdown = () => {
            const now = new Date();
            const diff = expiryTime - now;

            if (diff <= 0) {
                setTimeRemaining("Waktu pembayaran telah habis");
                return;
            }

            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeRemaining(
                `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
            );
        };

        // Update immediately and then set interval
        updateCountdown();
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [expiryTime]);

    // Handle toast display
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                setShowToast(false);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [toast]);

    const handlePaymentMethodSelect = (method) => {
        setSelectedMethod(method);
        setData("payment_method", method);

        // Reset bank selection when changing methods
        setSelectedBank(null);
        setSelectedVA(null);
        setData("bank_code", "");

        // Move to next step
        setPaymentStep(2);
    };

    const handleBankSelect = (bank) => {
        setSelectedBank(bank);
        setData("bank_code", bank.code);
    };

    const handleVASelect = (va) => {
        setSelectedVA(va);
        setData("bank_code", va.bank_code);
    };

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

    const processPayment = () => {
        setPaymentLoading(true);
        setShowConfirmation(false);

        if (data.payment_method === "bank_transfer") {
            // For manual bank transfer, submit with proof
            post(route("admin.payments.process", order.id), {
                onSuccess: () => {
                    setPaymentLoading(false);
                    window.location.href = route("admin.payments.history", order.id);
                },
                onError: () => {
                    setPaymentLoading(false);
                    setToastMessage({
                        type: "error",
                        message: "Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi."
                    });
                    setShowToast(true);
                }
            });
        } else if (data.payment_method === "virtual_account") {
            // For virtual account, use Midtrans with selected virtual account
            post(route("admin.payments.midtrans", order.id), {
                onSuccess: (response) => {
                    setPaymentLoading(false);
                    if (response.success) {
                        window.location.href = route("admin.payments.history", order.id);
                    } else {
                        setToastMessage({
                            type: "error",
                            message: response.message || "Terjadi kesalahan saat memproses pembayaran."
                        });
                        setShowToast(true);
                    }
                },
                onError: () => {
                    setPaymentLoading(false);
                    setToastMessage({
                        type: "error",
                        message: "Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi."
                    });
                    setShowToast(true);
                }
            });
        } else if (data.payment_method === "cash") {
            // For cash payment, just submit
            post(route("admin.payments.add-cash", order.id), {
                onSuccess: () => {
                    setPaymentLoading(false);
                    window.location.href = route("admin.payments.history", order.id);
                },
                onError: () => {
                    setPaymentLoading(false);
                    setToastMessage({
                        type: "error",
                        message: "Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi."
                    });
                    setShowToast(true);
                }
            });
        }
    };

    // Format number to Indonesian Rupiah
    const formatRupiah = (number) => {
        if (!number) return "";

        // Remove non-digit characters for processing
        const numberOnly = number.toString().replace(/\D/g, '');
        if (numberOnly === '') return '';

        return new Intl.NumberFormat('id-ID').format(numberOnly);
    };

    // Convert formatted Rupiah string back to number
    const rupiahToNumber = (rupiahStr) => {
        if (!rupiahStr) return 0;
        // Remove all non-digits
        return parseInt(rupiahStr.replace(/\D/g, ''), 10) || 0;
    };

    // Handle amount change with validation
    const handleAmountChange = (e) => {
        const formatted = formatRupiah(e.target.value);
        setAmountFormatted(formatted);

        const numericValue = rupiahToNumber(formatted);

        // Validate amount doesn't exceed remaining amount
        if (numericValue > order.remainingAmount) {
            setAmountFormatted(formatRupiah(order.remainingAmount.toString()));
            setData('amount', order.remainingAmount);

            setToastMessage({
                type: "warning",
                message: "Jumlah pembayaran tidak boleh melebihi sisa pembayaran."
            });
            setShowToast(true);
        } else {
            setData('amount', numericValue);
        }
    };

    // Format for display
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    return (
        <AdminLayout activeMenu="order-management">
            <Head title={`Process Payment: ${order.order_number}`} />

            {showToast && (
                <Toast
                    type={toastMessage.type}
                    message={toastMessage.message}
                    onClose={() => setShowToast(false)}
                />
            )}

            <div className="py-6 px-4 sm:px-6 lg:px-8">
                <div className="mb-6">
                    <a
                        href={route("admin.orders.show", order.id)}
                        className="inline-flex items-center text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Kembali ke Detail Pesanan
                    </a>
                </div>

                <div className="bg-white rounded-lg shadow-lg">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-pink-500 to-rose-500 p-6 text-white rounded-t-lg">
                        <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center">
                            <div>
                                <h1 className="text-2xl font-bold">Proses Pembayaran</h1>
                                <p className="text-white/80">
                                    Order #{order.order_number} ({order.clientName})
                                </p>
                            </div>
                            <div className="mt-4 sm:mt-0 sm:text-right">
                                <p className="text-white/80">Sisa Pembayaran</p>
                                <p className="text-2xl font-bold">{formatCurrency(order.remainingAmount)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Payment Steps */}
                    <div className="p-6">
                        {/* Expiry Timer */}
                        <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100 flex items-center">
                            <AlertTriangle className="h-5 w-5 text-yellow-500 mr-3" />
                            <div>
                                <p className="font-medium text-yellow-700">Batas Waktu Pembayaran</p>
                                <p className="text-yellow-600">
                                    {timeRemaining || "Menghitung..."}
                                </p>
                                <p className="text-sm text-yellow-600">
                                    Pembayaran akan dibatalkan secara otomatis jika melewati batas waktu
                                </p>
                            </div>
                        </div>

                        {/* Step 1: Select Payment Method */}
                        <div className={`mb-8 ${paymentStep !== 1 && "opacity-100"}`}>
                            <div className="flex items-center mb-4">
                                <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                                    1
                                </div>
                                <h2 className="text-lg font-medium">Pilih Metode Pembayaran</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                {/* Bank Transfer */}
                                <div
                                    className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedMethod === "bank_transfer"
                                        ? 'border-pink-500 bg-pink-50'
                                        : 'border-gray-200 hover:border-pink-200 hover:bg-pink-50/30'
                                        }`}
                                    onClick={() => handlePaymentMethodSelect("bank_transfer")}
                                >
                                    <div className="flex items-center mb-3">
                                        <div
                                            className={`p-2 rounded-full mr-3 ${selectedMethod === "bank_transfer"
                                                ? "bg-pink-100 text-pink-600"
                                                : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            <Building className="h-5 w-5" />
                                        </div>
                                        <span className="font-medium">Transfer Bank</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Upload bukti pembayaran untuk diverifikasi admin
                                    </p>
                                </div>

                                {/* Virtual Account */}
                                <div
                                    className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedMethod === "virtual_account"
                                        ? 'border-pink-500 bg-pink-50'
                                        : 'border-gray-200 hover:border-pink-200 hover:bg-pink-50/30'
                                        }`}
                                    onClick={() => handlePaymentMethodSelect("virtual_account")}
                                >
                                    <div className="flex items-center mb-3">
                                        <div
                                            className={`p-2 rounded-full mr-3 ${selectedMethod === "virtual_account"
                                                ? "bg-pink-100 text-pink-600"
                                                : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            <CreditCard className="h-5 w-5" />
                                        </div>
                                        <span className="font-medium">Virtual Account</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Pembayaran dengan Virtual Account melalui Midtrans
                                    </p>
                                </div>

                                {/* Cash */}
                                <div
                                    className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedMethod === "cash"
                                        ? 'border-pink-500 bg-pink-50'
                                        : 'border-gray-200 hover:border-pink-200 hover:bg-pink-50/30'
                                        }`}
                                    onClick={() => handlePaymentMethodSelect("cash")}
                                >
                                    <div className="flex items-center mb-3">
                                        <div
                                            className={`p-2 rounded-full mr-3 ${selectedMethod === "cash"
                                                ? "bg-pink-100 text-pink-600"
                                                : "bg-gray-100 text-gray-600"
                                                }`}
                                        >
                                            <DollarSign className="h-5 w-5" />
                                        </div>
                                        <span className="font-medium">Tunai</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Pembayaran tunai langsung kepada admin
                                    </p>
                                </div>
                            </div>

                            {errors.payment_method && (
                                <div className="text-red-500 text-sm mt-2">{errors.payment_method}</div>
                            )}
                        </div>

                        {/* Step 2: Payment Details */}
                        {paymentStep >= 2 && (
                            <div className="mb-8">
                                <div className="flex items-center mb-4">
                                    <div className="w-8 h-8 bg-pink-600 text-white rounded-full flex items-center justify-center font-bold mr-3">
                                        2
                                    </div>
                                    <h2 className="text-lg font-medium">Detail Pembayaran</h2>
                                </div>

                                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Tipe Pembayaran</p>
                                            <select
                                                value={data.payment_type}
                                                onChange={(e) => setData('payment_type', e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            >
                                                {order.requires_down_payment && (
                                                    <option value="down_payment">Uang Muka</option>
                                                )}
                                                <option value="installment">Cicilan</option>
                                                <option value="full_payment">Pelunasan</option>
                                            </select>
                                        </div>

                                        <div>
                                            <p className="text-sm text-gray-500 mb-1">Jumlah Pembayaran</p>
                                            <div className="relative">
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                                    Rp
                                                </span>
                                                <input
                                                    type="text"
                                                    value={amountFormatted}
                                                    onChange={handleAmountChange}
                                                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                                                    placeholder="0"
                                                    required
                                                />
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Maksimal: {formatCurrency(order.remainingAmount)}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Change Payment Method Button */}
                                <div className="mb-6">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentStep(1)}
                                        className="text-pink-600 hover:text-pink-800 font-medium flex items-center"
                                    >
                                        <ArrowLeft className="h-4 w-4 mr-1" />
                                        Ubah Metode Pembayaran
                                    </button>
                                </div>

                                {/* Bank Transfer Options */}
                                {selectedMethod === "bank_transfer" && (
                                    <div className="mb-6">
                                        <h3 className="text-md font-medium mb-3">Pilih Bank</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {banks.map((bank) => (
                                                <div
                                                    key={bank.id}
                                                    className={`p-3 border rounded-lg cursor-pointer flex items-center ${selectedBank && selectedBank.id === bank.id
                                                        ? "border-pink-500 bg-pink-50"
                                                        : "border-gray-200 hover:border-pink-200"
                                                        }`}
                                                    onClick={() => handleBankSelect(bank)}
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
                                                        <p className="text-gray-600 text-sm">{bank.account_number}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {errors.bank_code && (
                                            <div className="text-red-500 text-sm mt-2">{errors.bank_code}</div>
                                        )}

                                        {selectedBank && (
                                            <div className="mt-6">
                                                <h3 className="text-md font-medium mb-3">Upload Bukti Pembayaran</h3>
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
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
                                                                className="max-h-64 mx-auto mb-3"
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
                                                        <label
                                                            htmlFor="payment_proof"
                                                            className="cursor-pointer block"
                                                        >
                                                            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                                            <p className="text-gray-700 font-medium">
                                                                Klik untuk mengunggah bukti pembayaran
                                                            </p>
                                                            <p className="text-gray-500 text-sm mt-1">
                                                                Format: JPG, JPEG, PNG (Maks. 5MB)
                                                            </p>
                                                        </label>
                                                    )}
                                                    {errors.payment_proof && (
                                                        <div className="text-red-500 text-sm mt-2">{errors.payment_proof}</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Virtual Account Options - Now using data from database */}
                                {selectedMethod === "virtual_account" && (
                                    <div className="mb-6">
                                        <h3 className="text-md font-medium mb-3">Pilih Bank untuk Virtual Account</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {virtualAccounts && virtualAccounts.length > 0 ? (
                                                virtualAccounts.map((va) => (
                                                    <div
                                                        key={va.id}
                                                        className={`p-3 border rounded-lg cursor-pointer flex items-center ${data.bank_code === va.bank_code
                                                            ? "border-pink-500 bg-pink-50"
                                                            : "border-gray-200 hover:border-pink-200"
                                                            }`}
                                                        onClick={() => handleVASelect(va)}
                                                    >
                                                        {va.logo ? (
                                                            <img src={va.logo} alt={va.name} className="h-8 w-8 object-contain mr-3" />
                                                        ) : (
                                                            <div className="p-1 bg-gray-100 rounded-md mr-3">
                                                                <CreditCard className="h-6 w-6 text-gray-600" />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="font-medium">{va.name}</p>
                                                            <p className="text-gray-600 text-sm">{va.description || 'Virtual Account'}</p>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                // Fallback if no VAs in database - use standard options
                                                [
                                                    { bank_code: "BCA", name: "BCA Virtual Account" },
                                                    { bank_code: "BNI", name: "BNI Virtual Account" },
                                                    { bank_code: "BRI", name: "BRI Virtual Account" },
                                                    { bank_code: "MANDIRI", name: "Mandiri Virtual Account" },
                                                    { bank_code: "CIMB", name: "CIMB Niaga Virtual Account" }
                                                ].map((bank) => (
                                                    <div
                                                        key={bank.bank_code}
                                                        className={`p-3 border rounded-lg cursor-pointer flex items-center ${data.bank_code === bank.bank_code
                                                            ? "border-pink-500 bg-pink-50"
                                                            : "border-gray-200 hover:border-pink-200"
                                                            }`}
                                                        onClick={() => setData("bank_code", bank.bank_code)}
                                                    >
                                                        <div className="p-1 bg-gray-100 rounded-md mr-3">
                                                            <CreditCard className="h-6 w-6 text-gray-600" />
                                                        </div>
                                                        <div>
                                                            <p className="font-medium">{bank.name}</p>
                                                            <p className="text-gray-600 text-sm">Virtual Account</p>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        {errors.bank_code && (
                                            <div className="text-red-500 text-sm mt-2">{errors.bank_code}</div>
                                        )}

                                        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                            <div className="flex items-start">
                                                <AlertCircle className="h-5 w-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                                                <div>
                                                    <p className="font-medium text-blue-700">Informasi Virtual Account</p>
                                                    <p className="text-sm text-blue-600 mt-1">
                                                        Setelah melanjutkan, Anda akan mendapatkan nomor Virtual Account yang harus dibayarkan.
                                                        Pembayaran akan diverifikasi secara otomatis. Virtual Account akan aktif selama 24 jam.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Cash Payment Note */}
                                {selectedMethod === "cash" && (
                                    <div className="mb-6 p-4 bg-green-50 rounded-lg">
                                        <div className="flex items-start">
                                            <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                                            <div>
                                                <p className="font-medium text-green-700">Informasi Pembayaran Tunai</p>
                                                <p className="text-sm text-green-600 mt-1">
                                                    Pembayaran tunai akan langsung diverifikasi oleh admin.
                                                    Pastikan Anda telah menyerahkan uang tunai sebesar{" "}
                                                    <span className="font-medium">{formatCurrency(data.amount)}</span>{" "}
                                                    kepada admin yang berwenang.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end mt-8">
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmation(true)}
                                        className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                                        disabled={
                                            (selectedMethod === "bank_transfer" && (!selectedBank || !data.payment_proof)) ||
                                            (selectedMethod === "virtual_account" && !data.bank_code) ||
                                            processing ||
                                            data.amount <= 0
                                        }
                                    >
                                        Lanjutkan Pembayaran
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Instructions for each payment method */}
                <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-lg font-medium mb-4">Petunjuk Pembayaran</h2>

                    {selectedMethod === "bank_transfer" && (
                        <div>
                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                <h3 className="font-medium mb-2">Cara Pembayaran Transfer Bank:</h3>
                                <ol className="list-decimal ml-5 space-y-2 text-gray-700">
                                    <li>Transfer dana sesuai jumlah tagihan ke rekening yang dipilih</li>
                                    <li>Simpan bukti transfer (screenshot atau foto)</li>
                                    <li>Unggah bukti transfer pada form di atas</li>
                                    <li>Admin akan memverifikasi pembayaran Anda dalam 1x24 jam</li>
                                </ol>
                            </div>
                            {selectedBank && (
                                <div className="p-4 border border-gray-200 rounded-lg">
                                    <h4 className="font-medium mb-2">Informasi Rekening:</h4>
                                    <p>Bank: {selectedBank.name}</p>
                                    <p>No. Rekening: {selectedBank.account_number}</p>
                                    <p>Atas Nama: {selectedBank.account_name}</p>
                                    <p className="text-pink-600 font-medium mt-2">
                                        Total: {formatCurrency(data.amount)}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {selectedMethod === "virtual_account" && (
                        <div>
                            {/* Display VA-specific instructions if available */}
                            {selectedVA && selectedVA.payment_instructions && (
                                <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                    <h4 className="font-medium text-blue-700 mb-2">Instruksi Detail untuk {selectedVA.name}:</h4>
                                    <ol className="list-decimal ml-5 space-y-1 text-blue-700">
                                        {selectedVA.payment_instructions.map((instruction, idx) => (
                                            <li key={idx} className="text-sm">
                                                {/* {instruction.step}: {instruction.instruction} */}
                                                {instruction.instruction}
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            )}
                        </div>
                    )}

                    {selectedMethod === "cash" && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-medium mb-2">Cara Pembayaran Tunai:</h3>
                            <ol className="list-decimal ml-5 space-y-2 text-gray-700">
                                <li>Serahkan uang tunai sebesar {formatCurrency(data.amount)} kepada admin</li>
                                <li>Dapatkan bukti pembayaran dari admin</li>
                                <li>Pembayaran akan langsung terverifikasi oleh sistem</li>
                            </ol>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmation && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-xl max-w-lg w-full">
                        <h3 className="text-xl font-bold mb-4">Konfirmasi Pembayaran</h3>
                        <p className="text-gray-700 mb-4">
                            Anda akan memproses pembayaran dengan detail berikut:
                        </p>

                        <div className="bg-gray-50 p-4 rounded-lg mb-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <p className="text-sm text-gray-500">Jumlah</p>
                                    <p className="font-semibold">{formatCurrency(data.amount)}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Metode</p>
                                    <p className="font-semibold">
                                        {data.payment_method === "bank_transfer"
                                            ? "Transfer Bank"
                                            : data.payment_method === "virtual_account"
                                                ? "Virtual Account"
                                                : "Tunai"}
                                    </p>
                                </div>
                                {data.payment_method === "bank_transfer" && selectedBank && (
                                    <div className="col-span-2 mt-2">
                                        <p className="text-sm text-gray-500">Bank Tujuan</p>
                                        <p className="font-semibold">{selectedBank.name} - {selectedBank.account_number}</p>
                                    </div>
                                )}
                                {data.payment_method === "virtual_account" && data.bank_code && (
                                    <div className="col-span-2 mt-2">
                                        <p className="text-sm text-gray-500">Virtual Account</p>
                                        <p className="font-semibold">
                                            {selectedVA ? selectedVA.name : `Bank ${data.bank_code}`}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirmation(false)}
                                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={processPayment}
                                disabled={paymentLoading}
                                className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors disabled:bg-pink-300"
                            >
                                {paymentLoading ? (
                                    <span className="flex items-center">
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Memproses...
                                    </span>
                                ) : (
                                    "Konfirmasi Pembayaran"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default PaymentDetail;

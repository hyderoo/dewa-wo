import React, { useEffect } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import GuestLayout from "@/Layouts/GuestLayout";

// Font classes
const cormorantClass = "font-cormorant font-light";
const cormorantBoldClass = "font-cormorant font-semibold";
const montserratClass = "font-montserrat font-normal";
const montserratMediumClass = "font-montserrat font-medium";

export default function Register({ redirect }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        redirect: redirect || '', // Store redirect URL if provided
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="min-h-screen lg:flex">
                {/* Left Side - Image Section */}
                <div className="hidden lg:flex lg:w-1/2 bg-pink-50 items-center justify-center p-12">
                    <div className="max-w-lg text-center">
                        <div className="mb-8">
                            <div className="relative w-32 h-32 mx-auto">
                                <img
                                    src="/logo.png"
                                    alt="Company Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>
                        <h1
                            className={`${cormorantBoldClass} text-4xl font-semibold text-gray-900 mb-4`}
                        >
                            Selamat Datang
                        </h1>
                        <p className={`${montserratClass} text-gray-600 text-lg`}>
                            Bergabunglah dengan kami untuk mendapatkan pengalaman terbaik dalam
                            merencanakan pernikahan Anda.
                        </p>
                    </div>
                </div>

                {/* Right Side - Form Section */}
                <div className="lg:w-1/2 min-h-screen overflow-y-auto bg-white">
                    <div className="p-4 sm:p-8 lg:p-12">
                        <Link
                            href={route('home')}
                            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            <span className={`${montserratClass} text-sm`}>Kembali</span>
                        </Link>

                        {/* Mobile Logo */}
                        <div className="lg:hidden flex justify-center mb-8">
                            <div className="relative w-24 h-24">
                                <img
                                    src="/logo.png"
                                    alt="Company Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        </div>

                        <h2
                            className={`
                                ${cormorantBoldClass}
                                text-3xl
                                text-gray-900
                                mb-8
                                font-semibold
                            `}
                        >
                            Buat Akun Baru
                        </h2>

                        {/* Show redirect message if present */}
                        {redirect && (
                            <div className="mb-6 p-4 bg-pink-50 border-l-4 border-pink-500 rounded-md">
                                <p className={`${montserratClass} text-sm text-gray-700`}>
                                    Daftar akun untuk dapat melanjutkan pemesanan
                                </p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label
                                    htmlFor="name"
                                    className={`
                                        ${montserratClass}
                                        block text-sm font-medium text-gray-700 mb-2
                                    `}
                                >
                                    Nama Lengkap
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    className="
                                        w-full
                                        px-4
                                        py-3
                                        border
                                        border-gray-200
                                        rounded-md
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-pink-200
                                        focus:border-pink-300
                                        transition-colors
                                    "
                                    placeholder="Masukkan nama lengkap"
                                />
                                {errors.name && <div className="text-red-500 text-sm mt-1">{errors.name}</div>}
                            </div>

                            <div>
                                <label
                                    htmlFor="email"
                                    className={`
                                        ${montserratClass}
                                        block text-sm font-medium text-gray-700 mb-2
                                    `}
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    className="
                                        w-full
                                        px-4
                                        py-3
                                        border
                                        border-gray-200
                                        rounded-md
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-pink-200
                                        focus:border-pink-300
                                        transition-colors
                                    "
                                    placeholder="contoh@email.com"
                                />
                                {errors.email && <div className="text-red-500 text-sm mt-1">{errors.email}</div>}
                            </div>

                            <div>
                                <label
                                    htmlFor="phone"
                                    className={`
                                        ${montserratClass}
                                        block text-sm font-medium text-gray-700 mb-2
                                    `}
                                >
                                    Nomor Telepon
                                </label>
                                <input
                                    type="tel"
                                    id="phone"
                                    name="phone"
                                    value={data.phone}
                                    onChange={(e) => setData('phone', e.target.value)}
                                    required
                                    className="
                                        w-full
                                        px-4
                                        py-3
                                        border
                                        border-gray-200
                                        rounded-md
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-pink-200
                                        focus:border-pink-300
                                        transition-colors
                                    "
                                    placeholder="Masukkan nomor telepon"
                                />
                                {errors.phone && <div className="text-red-500 text-sm mt-1">{errors.phone}</div>}
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className={`
                                        ${montserratClass}
                                        block text-sm font-medium text-gray-700 mb-2
                                    `}
                                >
                                    Kata Sandi
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    className="
                                        w-full
                                        px-4
                                        py-3
                                        border
                                        border-gray-200
                                        rounded-md
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-pink-200
                                        focus:border-pink-300
                                        transition-colors
                                    "
                                    placeholder="Buat kata sandi"
                                />
                                {errors.password && <div className="text-red-500 text-sm mt-1">{errors.password}</div>}
                            </div>

                            <div>
                                <label
                                    htmlFor="password_confirmation"
                                    className={`
                                        ${montserratClass}
                                        block text-sm font-medium text-gray-700 mb-2
                                    `}
                                >
                                    Konfirmasi Kata Sandi
                                </label>
                                <input
                                    type="password"
                                    id="password_confirmation"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    onChange={(e) => setData('password_confirmation', e.target.value)}
                                    required
                                    className="
                                        w-full
                                        px-4
                                        py-3
                                        border
                                        border-gray-200
                                        rounded-md
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-pink-200
                                        focus:border-pink-300
                                        transition-colors
                                    "
                                    placeholder="Ulangi kata sandi"
                                />
                                {errors.password_confirmation && <div className="text-red-500 text-sm mt-1">{errors.password_confirmation}</div>}
                            </div>

                            {/* Hidden redirect input */}
                            {redirect && (
                                <input type="hidden" name="redirect" value={data.redirect} />
                            )}

                            <button
                                type="submit"
                                disabled={processing}
                                className="
                                    w-full
                                    bg-pink-500
                                    text-white
                                    px-4
                                    py-3
                                    rounded-md
                                    text-sm
                                    font-medium
                                    tracking-wide
                                    hover:bg-pink-600
                                    transition-colors
                                    shadow-sm
                                    disabled:opacity-75
                                "
                            >
                                {processing ? 'Processing...' : 'Daftar'}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p
                                className={`
                                    ${montserratClass}
                                    text-sm
                                    text-gray-600
                                `}
                            >
                                Sudah punya akun?{" "}
                                <Link
                                    href={route('login', redirect ? { redirect } : {})}
                                    className="
                                        text-pink-500
                                        hover:text-pink-600
                                        font-medium
                                        transition-colors
                                    "
                                >
                                    Masuk
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}

import React, { useState } from "react";
import { Link } from "@inertiajs/react";

// Font classes
const cormorantClass = "font-cormorant font-light";

export default function Navbar({ auth }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileReviewOpen, setMobileReviewOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const handleLogout = () => {
        // Redirect to logout page
        window.location.href = route('logout.page');
    };

    // Check if user is authenticated
    const isLoggedIn = auth && auth.user;

    return (
        <nav className="fixed top-0 w-full bg-white shadow-sm z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-24 items-center relative">
                    {/* Logo */}
                    <Link href={route('home')} className="flex items-center space-x-3">
                        <img
                            src="/logo.png"
                            alt="Dewa Management Logo"
                            className="h-12 sm:h-16 w-auto"
                        />
                        <div className="flex flex-col">
                            <span
                                className={`text-2xl sm:text-3xl font-light text-black ${cormorantClass}`}
                            >
                                DEWA
                            </span>
                            <span className="text-xs tracking-[0.3em] text-gray-600 uppercase">
                                Management
                            </span>
                        </div>
                    </Link>

                    {/* Menu Desktop */}
                    <div className="hidden md:flex space-x-6 lg:space-x-12">
                        <Link
                            href={route('home')}
                            className="text-gray-800 hover:text-black text-sm tracking-widest uppercase"
                        >
                            Utama
                        </Link>
                        <Link
                            href={route('about')}
                            className="text-gray-800 hover:text-black text-sm tracking-widest uppercase"
                        >
                            Tentang Kami
                        </Link>
                        <Link
                            href={route('features')}
                            className="text-gray-800 hover:text-black text-sm tracking-widest uppercase"
                        >
                            Layanan
                        </Link>
                        <Link
                            href={route('team')}
                            className="text-gray-800 hover:text-black text-sm tracking-widest uppercase"
                        >
                            Tim
                        </Link>
                        {/* Review with Dropdown - Only for logged in users */}
                        {isLoggedIn && (
                            <>
                                <Link
                                    href={route('orders')}
                                    className="text-gray-800 hover:text-black text-sm tracking-widest uppercase"
                                >
                                    Pesanan
                                </Link>
                            </>

                        )}
                        {isLoggedIn ? (
                            <>
                                <button
                                    onClick={handleLogout}
                                    className="text-gray-800 hover:text-black text-sm tracking-widest uppercase"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link
                                    href={route('login')}
                                    className="text-gray-800 hover:text-black text-sm tracking-widest uppercase"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="text-gray-800 hover:text-black text-sm tracking-widest uppercase"
                                >
                                    Daftar
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={toggleMobileMenu}
                            className="text-gray-800 focus:outline-none"
                        >
                            {mobileMenuOpen ? (
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    ></path>
                                </svg>
                            ) : (
                                <svg
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 6h16M4 12h16M4 18h16"
                                    ></path>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="absolute top-full left-0 w-full bg-white shadow-lg md:hidden">
                        <div className="flex flex-col space-y-4 p-4">
                            <Link
                                href={route('home')}
                                className="text-gray-800 hover:text-black text-sm tracking-widest uppercase"
                                onClick={toggleMobileMenu}
                            >
                                Utama
                            </Link>
                            <Link
                                href={route('about')}
                                className="text-gray-800 hover:text-black text-sm tracking-widest uppercase"
                                onClick={toggleMobileMenu}
                            >
                                Tentang Kami
                            </Link>
                            <Link
                                href={route('features')}
                                className="text-gray-800 hover:text-black text-sm tracking-widest uppercase"
                                onClick={toggleMobileMenu}
                            >
                                Layanan
                            </Link>

                            <Link
                                href={route('team')}
                                className="text-gray-800 hover:text-black text-sm tracking-widest uppercase"
                                onClick={toggleMobileMenu}
                            >
                                Tim
                            </Link>

                            {/* Pesanan Mobile Dropdown - Only for logged in users */}
                            {isLoggedIn && (
                                <>


                                    <Link
                                        href={route('orders')}
                                        className="text-gray-800 hover:text-black text-sm tracking-widest uppercase"
                                        onClick={toggleMobileMenu}
                                    >
                                        Pesanan
                                    </Link>
                                </>
                            )}

                            {isLoggedIn ? (
                                <>
                                    <Link
                                        href={route('profile.edit')}
                                        className="text-gray-800 hover:text-black text-sm tracking-widest uppercase"
                                        onClick={toggleMobileMenu}
                                    >
                                        Profile
                                    </Link>
                                    <button
                                        onClick={() => {
                                            handleLogout();
                                            toggleMobileMenu();
                                        }}
                                        className="text-gray-800 hover:text-black text-sm tracking-widest uppercase text-left"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        href={route('login')}
                                        className="text-gray-800 hover:text-black text-sm tracking-widest uppercase"
                                        onClick={toggleMobileMenu}
                                    >
                                        Masuk
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

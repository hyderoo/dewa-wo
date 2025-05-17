import React from "react";
import { usePage } from "@inertiajs/react";
import Navbar from "@/Components/Navbar";
import Footer from "@/Components/Footer";

// Font class for consistent styling
const montserratClass = "font-montserrat font-normal";

export default function BaseLayout({ children }) {
    // Get auth from page props
    const { auth } = usePage().props;

    return (
        <div className={`min-h-screen bg-white ${montserratClass} text-gray-600`}>
            <Navbar auth={auth} />

            {/* Main Content with Responsive Padding */}
            <main className="pt-24 min-h-screen px-4 sm:px-6 lg:px-8">
                {children}
            </main>

            <Footer />
        </div>
    );
}

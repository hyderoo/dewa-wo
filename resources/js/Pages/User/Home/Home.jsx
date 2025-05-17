import React, { useState } from "react";
import { Head } from "@inertiajs/react";
import BaseLayout from "@/Layouts/BaseLayout";
import HeroSection from "./Partials/HeroSection";
import WhatsAppFloat from "./Partials/WhatsAppFloat";
import SplashScreen from "@/Pages/User/SplashScreen";
import Location from "./Partials/Location";
import WhyUs from "./Partials/WhyUs";
import SpecialFeatures from "./Partials/SpecialFeatures";
import Portfolio from "./Partials/Portfolio";
import CustomerReviews from "./Partials/CustomerReviews";

export default function Home({ auth, portfolios, services, reviews }) {
    const [splashComplete, setSplashComplete] = useState(false);

    const handleSplashComplete = () => {
        setSplashComplete(true);
    };

    return (
        <>
            <Head title="Home" />

            {!splashComplete ? (
                <SplashScreen onComplete={handleSplashComplete} />
            ) : (
                <BaseLayout auth={auth}>
                    <div className="relative">
                        <HeroSection />
                        <WhyUs />
                        <SpecialFeatures services={services} />
                        <Portfolio portfolioItems={portfolios} />
                        <CustomerReviews reviews={reviews} />
                        <WhatsAppFloat />
                        <Location />
                    </div>
                </BaseLayout>
            )}
        </>
    );
}

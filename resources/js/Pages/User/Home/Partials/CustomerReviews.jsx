// User/Home/Partials/CustomerReviews.jsx
import React from "react";
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";

// Font classes
const cormorantClass = "font-cormorant font-light";
const montserratClass = "font-montserrat font-normal";

const CustomerReviews = ({ reviews = [] }) => {
    const [currentReview, setCurrentReview] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Auto advance reviews
    useEffect(() => {
        if (!isAutoPlaying || reviews.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentReview((prev) => (prev + 1) % reviews.length);
        }, 5000); // Change every 5 seconds

        return () => clearInterval(interval);
    }, [isAutoPlaying, reviews.length]);

    const nextReview = () => {
        setCurrentReview((prev) => (prev + 1) % reviews.length);
        setIsAutoPlaying(false); // Stop auto-play when user manually navigates
    };

    const prevReview = () => {
        setCurrentReview((prev) => (prev === 0 ? reviews.length - 1 : prev - 1));
        setIsAutoPlaying(false); // Stop auto-play when user manually navigates
    };

    // If no reviews, don't render anything
    if (!reviews || reviews.length === 0) {
        return null;
    }

    // Helper function to render stars
    const renderStars = (rating) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Star
                    key={i}
                    className={`w-5 h-5 ${i <= rating
                        ? "text-yellow-400 fill-yellow-400"
                        : "text-gray-300"
                        }`}
                />
            );
        }
        return stars;
    };

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "long",
            year: "numeric",
        }).format(date);
    };

    return (
        <div className={`bg-gray-50 py-20 ${montserratClass} text-gray-600`}>
            <div className="mx-auto max-w-6xl px-4">
                <div className="text-center mb-16">
                    <h2 className={`text-4xl mb-6 ${cormorantClass} text-gray-800`}>
                        Testimoni Klien
                    </h2>
                    <p className="text-gray-600 text-sm md:text-base tracking-wider max-w-2xl mx-auto">
                        Dengarkan pengalaman mereka yang telah mempercayakan moment
                        istimewa kepada kami
                    </p>
                </div>

                <div className="relative max-w-4xl mx-auto">
                    {/* Review Container */}
                    <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
                        {/* Quote Icon */}
                        <div className="flex justify-center mb-6">
                            <Quote className="w-12 h-12 text-pink-400 opacity-50" />
                        </div>

                        {/* Review Content */}
                        <div className="text-center">
                            {/* Stars */}
                            <div className="flex justify-center mb-4">
                                {renderStars(reviews[currentReview].rating)}
                            </div>

                            {/* Review Text */}
                            <p className="text-lg md:text-xl text-gray-700 mb-6 italic leading-relaxed">
                                "{reviews[currentReview].comment}"
                            </p>

                            {/* Reviewer Info */}
                            <div className="border-t pt-6">
                                <p className={`text-xl font-semibold text-gray-800 ${cormorantClass}`}>
                                    {reviews[currentReview].client_name || reviews[currentReview].order?.client_name || "Anonymous"}
                                </p>
                                {reviews[currentReview].event_type && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        {reviews[currentReview].event_type}
                                    </p>
                                )}
                                <p className="text-sm text-gray-400 mt-2">
                                    {formatDate(reviews[currentReview].created_at)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Buttons - Only show if more than one review */}
                    {reviews.length > 1 && (
                        <>
                            <button
                                onClick={prevReview}
                                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow hidden md:block"
                                aria-label="Previous review"
                            >
                                <ChevronLeft className="w-6 h-6 text-gray-600" />
                            </button>
                            <button
                                onClick={nextReview}
                                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow hidden md:block"
                                aria-label="Next review"
                            >
                                <ChevronRight className="w-6 h-6 text-gray-600" />
                            </button>
                        </>
                    )}

                    {/* Dots Navigation */}
                    {reviews.length > 1 && (
                        <div className="flex justify-center space-x-2 mt-8">
                            {reviews.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrentReview(index);
                                        setIsAutoPlaying(false);
                                    }}
                                    className={`w-2 h-2 rounded-full transition-all ${index === currentReview
                                        ? "bg-pink-500 w-6"
                                        : "bg-gray-300"
                                        }`}
                                    aria-label={`Go to review ${index + 1}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Mobile Navigation */}
                {reviews.length > 1 && (
                    <div className="flex justify-center space-x-4 mt-6 md:hidden">
                        <button
                            onClick={prevReview}
                            className="bg-white rounded-full p-3 shadow-lg"
                            aria-label="Previous review"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <button
                            onClick={nextReview}
                            className="bg-white rounded-full p-3 shadow-lg"
                            aria-label="Next review"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomerReviews;

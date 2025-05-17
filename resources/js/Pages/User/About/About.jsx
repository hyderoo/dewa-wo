import React from "react";
import { Head } from "@inertiajs/react";
import { Users, Heart, Clock, Award } from "lucide-react";
import BaseLayout from "@/Layouts/BaseLayout";

// Font classes for Laravel Inertia (instead of Next.js font imports)
const cormorantClass = "font-cormorant font-light";
const montserratClass = "font-montserrat font-normal";
const montserratMediumClass = "font-montserrat font-medium";

export default function About({ auth }) {
    const services = [
        {
            title: "All In Package",
            description:
                "Layanan lengkap mencakup wedding organizer, dekorasi, catering, dokumentasi, dan entertainment untuk pernikahan impian Anda.",
            features: [
                "Wedding Organizer",
                "Dekorasi",
                "Catering",
                "Dokumentasi",
                "Entertainment",
            ],
        },
        {
            title: "Standard Package",
            description:
                "Paket dasar yang dapat disesuaikan dengan kebutuhan dan anggaran Anda.",
            features: ["Wedding Organizer", "Dekorasi", "Dokumentasi"],
        },
        {
            title: "Custom Package",
            description:
                "Kebebasan memilih layanan sesuai kebutuhan spesifik pernikahan Anda.",
            features: ["Fleksibel", "Personalisasi", "Konsultasi Pribadi"],
        },
    ];

    return (
        <BaseLayout auth={auth}>
            <Head title="About Us" />

            <div className={`w-full bg-white ${montserratClass} text-gray-600`}>
                {/* Hero Section */}
                <section className="relative h-[60vh] bg-gray-100 flex items-center justify-center">
                    <div className="text-center px-4 max-w-4xl mx-auto">
                        <h1 className={`text-4xl md:text-5xl mb-4 ${cormorantClass}`}>
                            DEWA MANAGEMENT
                        </h1>
                        <p className="text-gray-600 text-sm md:text-base tracking-wider max-w-2xl mx-auto">
                            Mewujudkan pernikahan impian dengan sentuhan elegan dan
                            profesional
                        </p>
                    </div>
                </section>

                {/* About Section */}
                <section className="py-20 px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className={`text-3xl text-center mb-12 ${cormorantClass}`}>
                            Tentang Kami
                        </h2>
                        <div className="prose mx-auto text-gray-600 space-y-6 text-center max-w-3xl">
                            <p className="leading-relaxed">
                                Dewa Management adalah penyedia jasa wedding organizer
                                profesional yang berdedikasi untuk menciptakan momen pernikahan
                                yang tak terlupakan. Dengan pengalaman dan keahlian kami, kami
                                berkomitmen untuk menghadirkan sentuhan elegan dalam setiap
                                detail pernikahan Anda.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Vision & Mission */}
                <section className="py-20 px-4 bg-gray-50">
                    <div className="max-w-4xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12">
                            <div className="text-center">
                                <h3 className={`text-2xl mb-6 ${cormorantClass}`}>Visi</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Menjadi wedding organizer terpercaya yang menghadirkan
                                    kebahagiaan dan kesempurnaan dalam setiap momen pernikahan
                                    klien kami.
                                </p>
                            </div>
                            <div className="text-center">
                                <h3 className={`text-2xl mb-6 ${cormorantClass}`}>Misi</h3>
                                <ul className="text-gray-600 space-y-4 list-none p-0">
                                    <li>
                                        Memberikan pelayanan profesional dan berkualitas tinggi
                                    </li>
                                    <li>Menciptakan konsep pernikahan yang unik dan personal</li>
                                    <li>Menjalin hubungan yang baik dengan klien dan vendor</li>
                                    <li>
                                        Mengutamakan kepuasan klien dalam setiap aspek layanan
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Values */}
                <section className="py-20 px-4">
                    <div className="max-w-4xl mx-auto">
                        <h2 className={`text-3xl text-center mb-16 ${cormorantClass}`}>
                            Nilai-Nilai Kami
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            <div className="text-center">
                                <Users className="w-8 h-8 mx-auto mb-4 text-gray-700" />
                                <h4 className="text-sm uppercase tracking-wider mb-2">
                                    Profesional
                                </h4>
                            </div>
                            <div className="text-center">
                                <Heart className="w-8 h-8 mx-auto mb-4 text-gray-700" />
                                <h4 className="text-sm uppercase tracking-wider mb-2">
                                    Dedikasi
                                </h4>
                            </div>
                            <div className="text-center">
                                <Clock className="w-8 h-8 mx-auto mb-4 text-gray-700" />
                                <h4 className="text-sm uppercase tracking-wider mb-2">
                                    Tepat Waktu
                                </h4>
                            </div>
                            <div className="text-center">
                                <Award className="w-8 h-8 mx-auto mb-4 text-gray-700" />
                                <h4 className="text-sm uppercase tracking-wider mb-2">
                                    Kualitas
                                </h4>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Services */}
                <section className="py-20 px-4 bg-gray-50">
                    <div className="max-w-4xl mx-auto">
                        <h2 className={`text-3xl text-center mb-16 ${cormorantClass}`}>
                            Layanan Kami
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {services.map((service, index) => (
                                <div key={index} className="bg-white p-6 rounded-lg shadow-sm">
                                    <h3 className={`text-xl mb-4 ${cormorantClass}`}>
                                        {service.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-6">
                                        {service.description}
                                    </p>
                                    <ul className="text-gray-600 text-sm space-y-2">
                                        {service.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center">
                                                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </BaseLayout>
    );
}

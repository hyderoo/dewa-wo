import React from "react";
import BaseLayout from "@/Layouts/BaseLayout";
import {
    MapPin,
    Phone,
    Mail,
    Clock,
    Instagram,
    Linkedin,
    Facebook,
} from "lucide-react";
import { Head } from '@inertiajs/react';

// Since we're moving to a regular React app, we need to handle fonts differently
const cormorantClass = "font-cormorant font-light";
const cormorantBoldClass = "font-cormorant font-semibold";

// Contact information
const contactInfo = {
    address: "Jl. Wedding Paradise No. 123, Jakarta Selatan",
    phone: "+6281393344476",
    email: "contoh@gmail.com",
    hours: "Senin - Sabtu: 09:00 - 17:00",
    socialMedia: {
        instagram: "Dewa Management",
        whatsapp: "+62812345678",
    },
};

export default function OurTeam({ team, auth }) {
    // Find the founder (highlighted team member)
    const founder = team.find(member => member.is_highlighted) || team[0];

    // Other team members (non-founders)
    const teamMembers = team.filter(member => member !== founder);

    return (
        <BaseLayout>
            <Head title="Tim Kami" />
            <div className="bg-white min-h-screen">
                {/* Hero Section */}
                <div className="bg-gray-100 text-gray-600">
                    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                        <h1
                            className={`${cormorantClass} text-4xl text-center font-light tracking-wide mb-4`}
                        >
                            Tim Kami
                        </h1>
                        <p className="text-center text-gray-600 max-w-2xl mx-auto">
                            Memperkenalkan tim profesional kami yang berdedikasi untuk
                            mewujudkan pernikahan impian Anda
                        </p>
                    </div>
                </div>

                {/* Founder Profile Section */}
                {founder && (
                    <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="space-y-6">
                                <h2
                                    className={`${cormorantClass} text-3xl text-pink-600 font-light tracking-wide`}
                                >
                                    {founder.name}
                                </h2>
                                <p className="text-xl text-gray-600 italic">{founder.role}</p>
                                <p className="text-gray-600 leading-relaxed">
                                    {founder.description}
                                </p>
                                <div className="flex space-x-4">
                                    {founder.instagram && (
                                        <a
                                            href={founder.instagram}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-pink-600 hover:text-pink-800 transition-colors"
                                        >
                                            <Instagram className="w-6 h-6" />
                                        </a>
                                    )}
                                    {founder.linkedin && (
                                        <a
                                            href={founder.linkedin}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-pink-600 hover:text-pink-800 transition-colors"
                                        >
                                            <Linkedin className="w-6 h-6" />
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="relative rounded-lg overflow-hidden shadow-xl h-96">
                                <img
                                    src={founder.image || `/api/placeholder/400/400?text=${encodeURIComponent(founder.name)}`}
                                    alt={founder.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        e.target.src = `/api/placeholder/400/400?text=${encodeURIComponent(founder.name)}`;
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Team Organization Section */}
                <div className="bg-gray-50 py-16 text-gray-600">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2
                            className={`${cormorantClass} text-3xl font-light text-center mb-12`}
                        >
                            Struktur Organisasi
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {teamMembers.map((member, index) => (
                                <div
                                    key={index}
                                    className="bg-white rounded-lg shadow-lg p-6 text-center transition-transform duration-300 hover:-translate-y-2"
                                >
                                    <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                                        <img
                                            src={member.image || `/api/placeholder/400/400?text=${encodeURIComponent(member.name)}`}
                                            alt={member.name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = `/api/placeholder/400/400?text=${encodeURIComponent(member.name)}`;
                                            }}
                                        />
                                    </div>
                                    <h3 className="text-xl font-semibold mb-2 text-pink-600">
                                        {member.name}
                                    </h3>
                                    <p className="text-gray-600 mb-4">{member.role}</p>
                                    <p className="text-sm text-gray-500">{member.description}</p>
                                    <div className="flex justify-center space-x-4 mt-4">
                                        {member.instagram && (
                                            <a
                                                href={member.instagram}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-pink-600 hover:text-pink-800 transition-colors"
                                            >
                                                <Instagram className="w-5 h-5" />
                                            </a>
                                        )}
                                        {member.linkedin && (
                                            <a
                                                href={member.linkedin}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-pink-600 hover:text-pink-800 transition-colors"
                                            >
                                                <Linkedin className="w-5 h-5" />
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Contact Information Section */}
                <div className="py-16 text-gray-600">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <h2
                            className={`${cormorantClass} text-3xl font-light text-center mb-12`}
                        >
                            Hubungi Kami
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                            <div className="flex items-start space-x-4">
                                <MapPin className="text-pink-600 w-6 h-6 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold mb-2">Lokasi</h3>
                                    <p className="text-gray-600 text-sm">{contactInfo.address}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <Phone className="text-pink-600 w-6 h-6 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold mb-2">Telepon</h3>
                                    <p className="text-gray-600 text-sm">{contactInfo.phone}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <Mail className="text-pink-600 w-6 h-6 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold mb-2">Email</h3>
                                    <p className="text-gray-600 text-sm">{contactInfo.email}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <Clock className="text-pink-600 w-6 h-6 flex-shrink-0" />
                                <div>
                                    <h3 className="font-semibold mb-2">Jam Operasional</h3>
                                    <p className="text-gray-600 text-sm">{contactInfo.hours}</p>
                                </div>
                            </div>
                        </div>

                        {/* Social Media Links */}
                        <div className="flex justify-center space-x-6">
                            <a
                                href={`https://www.instagram.com/dewa_management?igsh=MXB1aWg1N3VzdXd4bg==`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-pink-600 hover:text-pink-800 transition-colors"
                            >
                                <Instagram className="w-6 h-6" />
                            </a>

                            <a
                                href={`https://wa.me/${encodeURIComponent("6281393344476")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-pink-600 hover:text-pink-800 transition-colors"
                            >
                                <svg
                                    className="w-6 h-6"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.501-.669-.51-.173-.008-.371-.011-.57-.011-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </BaseLayout>
    );
}

import React from 'react';
import { Head } from '@inertiajs/react';
import BaseLayout from '@/Layouts/BaseLayout';

export default function Team() {
    const team = [
        {
            name: 'Dewi Anggraini',
            title: 'Founder & Creative Director',
            image: '/team/dewi.jpg', // Replace with actual image path
            bio: 'Dewi adalah pendiri Dewa Management dengan pengalaman lebih dari 10 tahun dalam industri pernikahan.',
        },
        {
            name: 'Budi Santoso',
            title: 'Senior Event Manager',
            image: '/team/budi.jpg', // Replace with actual image path
            bio: 'Budi menangani koordinasi hari pernikahan dengan keahlian logistik dan manajemen waktu yang presisi.',
        },
        {
            name: 'Siti Rahayu',
            title: 'Design & Decoration Specialist',
            image: '/team/siti.jpg', // Replace with actual image path
            bio: 'Siti adalah ahli dekorasi dengan sentuhan estetika yang unik untuk setiap pernikahan.',
        },
        {
            name: 'Ahmad Faisal',
            title: 'Client Relations Manager',
            image: '/team/ahmad.jpg', // Replace with actual image path
            bio: 'Ahmad memastikan komunikasi yang lancar dan membantu klien melalui setiap tahap persiapan pernikahan.',
        },
    ];

    return (
        <BaseLayout>
            <Head title="Tim Kami" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="lg:text-center">
                        <h2 className="text-base text-pink-600 font-semibold tracking-wide uppercase">Tim Kami</h2>
                        <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                            Bertemu Dengan Tim Profesional Kami
                        </p>
                        <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                            Tim berpengalaman kami berkomitmen untuk mewujudkan pernikahan impian Anda
                        </p>
                    </div>

                    <div className="mt-10">
                        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {team.map((member, index) => (
                                <div key={index} className="bg-white overflow-hidden shadow rounded-lg">
                                    <div className="aspect-w-1 aspect-h-1">
                                        <img
                                            src={member.image || `/api/placeholder/400/400?text=${encodeURIComponent(member.name)}`}
                                            alt={member.name}
                                            className="object-cover w-full h-full"
                                            onError={(e) => {
                                                e.target.src = `/api/placeholder/400/400?text=${encodeURIComponent(member.name)}`;
                                            }}
                                        />
                                    </div>
                                    <div className="px-4 py-5 sm:p-6">
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">{member.name}</h3>
                                        <p className="mt-1 text-sm text-pink-600">{member.title}</p>
                                        <p className="mt-3 text-base text-gray-500">{member.bio}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </BaseLayout>
    );
}

import React from "react";
import { CheckCircle } from "lucide-react";

// Since we're moving to a regular React app, we need to handle fonts differently
const cormorantClass = "font-cormorant font-light";
const montserratClass = "font-montserrat font-normal";
const montserratMediumClass = "font-montserrat font-medium";

export default function WhyUs() {
    return (
        <div className={`bg-white py-20 ${montserratClass} text-gray-600`}>
            <div className="mx-auto max-w-6xl px-4">
                <div className="text-center mb-16">
                    <h2 className={`text-4xl mb-6 ${cormorantClass} text-gray-800`}>
                        Kenapa Memilih Kami?
                    </h2>
                    <p className="text-gray-600 text-sm md:text-base tracking-wider max-w-2xl mx-auto">
                        Kami adalah mitra terbaik Anda dalam merancang momen istimewa yang
                        tak terlupakan. Dengan profesionalisme, perhatian terhadap detail,
                        dan kreativitas, kami siap memberikan layanan terbaik.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            title: "Profesionalisme",
                            description:
                                "Tim kami terdiri dari profesional berpengalaman yang siap menghadirkan layanan terbaik untuk acara Anda.",
                        },
                        {
                            title: "Kreativitas Tanpa Batas",
                            description:
                                "Kami memberikan sentuhan kreatif yang disesuaikan dengan visi dan keinginan Anda.",
                        },
                        {
                            title: "Perhatian Terhadap Detail",
                            description:
                                "Kami memastikan setiap detail acara Anda dirancang dengan hati dan presisi.",
                        },
                    ].map((feature, index) => (
                        <div
                            key={index}
                            className="text-center p-6 bg-white rounded-lg hover:shadow-md transition-shadow"
                        >
                            <CheckCircle className="w-12 h-12 mb-4 mx-auto text-gray-700" />
                            <h3 className={`text-xl mb-3 ${cormorantClass}`}>
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 text-sm">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

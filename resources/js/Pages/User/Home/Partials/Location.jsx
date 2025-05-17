import React from "react";

// Since we're moving to a regular React app, we need to handle fonts differently
const cormorantClass = "font-cormorant font-light";
const cormorantBoldClass = "font-cormorant font-semibold";

export default function Location() {
    return (
        <div className="bg-white py-16 sm:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-12 text-center sm:mb-16">
                    <h2
                        className={`
              ${cormorantClass}
              text-3xl
              font-light
              text-black
              tracking-wide
              sm:text-4xl
            `}
                    >
                        Lokasi Kami
                    </h2>
                    <p className="mt-3 mx-auto max-w-xl tracking-wider leading-relaxed text-gray-600 px-4 sm:mt-4 sm:max-w-2xl sm:px-0">
                        Kunjungi studio kami atau hubungi untuk konsultasi pernikahan impian
                        Anda
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Informasi Kontak */}
                    <div className="space-y-6 p-6 bg-gray-50 rounded-lg">
                        <div>
                            <h3 className="text-xl font-semibold text-black mb-2">
                                Alamat Kantor
                            </h3>
                            <p className="text-gray-700">
                                Gg. Kenari No.RT 01/03, Patemon, Kec. Gn. Pati, Kota Semarang, Jawa Tengah 50228
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-black mb-2">Kontak</h3>
                            <p className="text-gray-700">
                                <strong>Telepon:</strong> +62 813-9334-4476
                            </p>
                            <p className="text-gray-700">
                                <strong>Email:</strong> dewamanagementid@gmail.com
                            </p>
                        </div>

                        <div>
                            <h3 className="text-xl font-semibold text-black mb-2">
                            Jam Operasional
                            </h3>
                            <div className="text-gray-700 space-y-1">
                                <p>Senin - Jumat: 09.00 - 18.00 WIB</p>
                                <p>Sabtu: 10.00 - 16.00 WIB</p>
                                <p>Minggu: Tutup</p>
                                </div>

                        </div>
                    </div>

                    {/* Google Maps Embed */}
                    <div className="w-full h-96 overflow-hidden rounded-lg shadow-xl">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3959.5270567844905!2d110.3977462!3d-7.0647193999999995!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e70892df9e6b973%3A0xfc2714b198f34399!2sDewa%20Management%20(event%20%26%20Wedding%20Organizer)!5e0!3m2!1sen!2sid!4v1746942591651!5m2!1sen!2sid"
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Google Maps - Lokasi Kantor"
                        ></iframe>
                    </div>
                </div>
            </div>
        </div>
    );
}

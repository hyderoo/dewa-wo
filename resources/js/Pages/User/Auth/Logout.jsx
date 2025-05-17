import React, { useEffect } from "react";
import { Head, useForm } from "@inertiajs/react";
import { LogOut } from "lucide-react";

const Logout = () => {
    const { post } = useForm();

    useEffect(() => {
        const redirectTimer = setTimeout(() => {
            post(route('logout'));
        }, 3000);

        return () => clearTimeout(redirectTimer);
    }, []);

    return (
        <>
            <Head title="Logging Out" />

            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-full max-w-md p-8 flex flex-col items-center">
                    <div className="mb-6 animate-fade-in">
                        <div className="bg-white rounded-full p-6 shadow-md mb-6">
                            <LogOut
                                className="w-12 h-12 text-gray-600 animate-bounce"
                                strokeWidth={1.5}
                            />
                        </div>
                        <h1
                            className="font-cormorant font-light text-3xl text-center text-gray-800 mb-2"
                        >
                            Logging Out
                        </h1>
                        <p className="text-gray-600 text-center text-sm tracking-wide">
                            Thank you for using Dewa Management
                        </p>
                    </div>

                    <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gray-600 rounded-full transition-all duration-3000 ease-out"
                            style={{
                                width: "100%",
                                animation: "progress 3s linear",
                            }}
                        />
                    </div>
                </div>
            </div>

            <style jsx="true">{`
                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out;
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes progress {
                    from {
                        width: 0%;
                    }
                    to {
                        width: 100%;
                    }
                }
            `}</style>
        </>
    );
};

export default Logout;

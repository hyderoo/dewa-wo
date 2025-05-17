import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const cormorantClass = "font-cormorant font-light";
const montserratClass = "font-montserrat font-normal";

export default function SplashScreen({ onComplete }) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            onComplete();
        }, 3000);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center space-y-6"
                >
                    <motion.div
                        initial={{ scale: 0.7, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                            type: "spring",
                            stiffness: 100,
                            damping: 10,
                            duration: 0.7,
                        }}
                    >
                        <img
                            src="/logo.png"
                            alt="Dewa Management Logo"
                            className="h-40 w-auto mx-auto mb-6 animate-pulse"
                        />
                    </motion.div>

                    <div className="text-center">
                        <h1
                            className={`
                ${cormorantClass}
                text-4xl
                text-gray-900
                tracking-wide
                mb-2
                opacity-90
              `}
                        >
                            Selamat Datang
                        </h1>
                        <h2
                            className={`
                ${montserratClass}
                text-xl
                text-gray-600
                tracking-widest
                uppercase
              `}
                        >
                            Di Website Dewa Management
                        </h2>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

import React, { useMemo } from "react";
import {
    Star,
    Heart,
    Crown,
    Camera,
    Music,
    Palette,
    Users,
    Gift,
    Cake,
    MapPin,
    Calendar,
    Utensils,
    Award,
    Headphones,
    Image,
    MessageCircle,
    Bell
} from "lucide-react";

// Font classes
const cormorantClass = "font-cormorant font-light";
const montserratClass = "font-montserrat font-normal";

// Icon map for rendering icons based on icon name from the database
const iconMap = {
    Star: <Star className="w-12 h-12 mb-4" />,
    Crown: <Crown className="w-12 h-12 mb-4" />,
    Heart: <Heart className="w-12 h-12 mb-4" />,
    Camera: <Camera className="w-12 h-12 mb-4" />,
    Music: <Music className="w-12 h-12 mb-4" />,
    Palette: <Palette className="w-12 h-12 mb-4" />,
    Users: <Users className="w-12 h-12 mb-4" />,
    Gift: <Gift className="w-12 h-12 mb-4" />,
    Cake: <Cake className="w-12 h-12 mb-4" />,
    MapPin: <MapPin className="w-12 h-12 mb-4" />,
    Calendar: <Calendar className="w-12 h-12 mb-4" />,
    Utensils: <Utensils className="w-12 h-12 mb-4" />,
    Award: <Award className="w-12 h-12 mb-4" />,
    Headphones: <Headphones className="w-12 h-12 mb-4" />,
    Image: <Image className="w-12 h-12 mb-4" />,
    MessageCircle: <MessageCircle className="w-12 h-12 mb-4" />,
    Bell: <Bell className="w-12 h-12 mb-4" />
};

const SpecialFeatures = ({ services }) => {
    // Group services by type
    const groupedServices = useMemo(() => {
        if (!services || !Array.isArray(services)) return {};

        return services.reduce((acc, service) => {
            if (!acc[service.type]) {
                acc[service.type] = [];
            }
            acc[service.type].push(service);
            return acc;
        }, {});
    }, [services]);

    const premiumFeatures = groupedServices.premium || [];
    const additionalServices = groupedServices.additional || [];
    const exclusiveServices = groupedServices.exclusive || [];

    // Check if we have any services to display
    const hasServices = premiumFeatures.length > 0 ||
        additionalServices.length > 0 ||
        exclusiveServices.length > 0;

    // Helper function to render icon based on icon name
    const renderIcon = (iconName) => {
        return iconMap[iconName] || <Star className="w-12 h-12 mb-4" />;
    };

    // If no services to display, return nothing
    if (!hasServices) {
        return null;
    }

    return (
        <div className={`w-full bg-white ${montserratClass} text-gray-600`}>
            {/* Hero Section */}
            <section className="relative h-[60vh] bg-gray-100 flex items-center justify-center text-center">
                <div className="max-w-4xl mx-auto px-4">
                    <h1 className={`text-4xl md:text-5xl mb-6 ${cormorantClass}`}>
                        Special Features
                    </h1>
                    <p className="text-gray-600 text-sm md:text-base tracking-wider max-w-2xl mx-auto">
                        Layanan eksklusif untuk mewujudkan pernikahan impian yang tak
                        terlupakan
                    </p>
                </div>
            </section>

            {/* Premium Features */}
            {premiumFeatures.length > 0 && (
                <section className="py-20 px-4">
                    <div className="max-w-6xl mx-auto">
                        <h2 className={`text-3xl text-center mb-16 ${cormorantClass}`}>
                            Premium Features
                        </h2>
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                            {premiumFeatures.map((feature, index) => (
                                <div
                                    key={index}
                                    className="text-center p-6 bg-white rounded-lg hover:shadow-md transition-shadow"
                                >
                                    <div className="text-gray-700">
                                        {renderIcon(feature.icon)}
                                    </div>
                                    <h3 className={`text-xl mb-3 ${cormorantClass}`}>
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Additional Services */}
            {additionalServices.length > 0 && (
                <section className="py-20 px-4 bg-gray-50">
                    <div className="max-w-6xl mx-auto">
                        <h2 className={`text-3xl text-center mb-16 ${cormorantClass}`}>
                            Additional Services
                        </h2>
                        <div className="grid md:grid-cols-2 gap-8">
                            {additionalServices.map((service, index) => (
                                <div key={index} className="bg-white p-8 rounded-lg shadow-sm">
                                    <h3 className={`text-2xl mb-4 ${cormorantClass}`}>
                                        {service.title}
                                    </h3>
                                    <p className="text-gray-600 mb-6">{service.description}</p>
                                    <ul className="space-y-3">
                                        {service.features && service.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center text-gray-600">
                                                <Star className="w-4 h-4 mr-2 text-gray-400" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* Exclusive Benefits */}
            {exclusiveServices.length > 0 && (
                <section className="py-20 px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className={`text-3xl mb-16 ${cormorantClass}`}>
                            Exclusive Benefits
                        </h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {exclusiveServices.map((service, index) => (
                                <div key={index} className="p-6 text-center">
                                    <div className="text-gray-700 flex justify-center">
                                        {renderIcon(service.icon)}
                                    </div>
                                    <h3 className="text-lg mb-3">{service.title}</h3>
                                    <p className="text-gray-600 text-sm">{service.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
};

export default SpecialFeatures;

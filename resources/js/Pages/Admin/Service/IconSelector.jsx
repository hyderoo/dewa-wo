import React from "react";
import {
    Star, Crown, Heart, Camera, Music, Palette,
    Users, Gift, Cake, MapPin, Calendar, Utensils,
    Award, Headphones, Image, MessageCircle, Bell
} from "lucide-react";

// List of available Lucide icons for the dropdown
const availableIcons = [
    'Star', 'Crown', 'Heart', 'Camera', 'Music', 'Palette',
    'Users', 'Gift', 'Cake', 'MapPin', 'Calendar', 'Utensils',
    'Award', 'Headphones', 'Image', 'MessageCircle', 'Bell'
];

// Icon map for rendering the actual icons
const iconMap = {
    Star: <Star />,
    Crown: <Crown />,
    Heart: <Heart />,
    Camera: <Camera />,
    Music: <Music />,
    Palette: <Palette />,
    Users: <Users />,
    Gift: <Gift />,
    Cake: <Cake />,
    MapPin: <MapPin />,
    Calendar: <Calendar />,
    Utensils: <Utensils />,
    Award: <Award />,
    Headphones: <Headphones />,
    Image: <Image />,
    MessageCircle: <MessageCircle />,
    Bell: <Bell />
};

const IconSelector = ({ selectedIcon, onChange }) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
            <select
                name="icon"
                value={selectedIcon}
                onChange={onChange}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
                {availableIcons.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                ))}
            </select>
            <div className="mt-3 sm:mt-0 w-16 h-16 flex items-center justify-center rounded-full bg-pink-100 text-pink-600">
                {iconMap[selectedIcon] || <Star />}
            </div>
        </div>
    );
};

// Export both the component and the icon utilities
export { IconSelector, iconMap, availableIcons };
export default IconSelector;

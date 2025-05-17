import React from 'react';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div>
            {/* The layout is minimal since most of the styling is in the individual pages */}
            {children}
        </div>
    );
}

import React from "react";
import { Head } from "@inertiajs/react";
import BaseLayout from "@/Layouts/BaseLayout";
import CatalogContent from "./CatalogContent";

export default function CatalogPage({ auth, catalogs }) {
    return (
        <BaseLayout auth={auth} title="Katalog Layanan">
            <Head title="Katalog Layanan" />
            <CatalogContent catalogs={catalogs} />
        </BaseLayout>
    );
}

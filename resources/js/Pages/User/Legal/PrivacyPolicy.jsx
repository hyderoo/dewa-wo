import React from "react";
import { Head } from "@inertiajs/react";
import BaseLayout from "@/Layouts/BaseLayout";

export default function PrivacyPolicy({ auth, policy }) {
    return (
        <>
            <Head title="Privacy Policy" />
            <BaseLayout auth={auth}>
                <div className="max-w-4xl mx-auto py-12">
                    <div className="bg-white shadow overflow-hidden rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            {/* Render the HTML content safely */}
                            <div dangerouslySetInnerHTML={{ __html: policy.content }} />

                            <div className="mt-6 text-sm text-gray-500">
                                <p>Last updated: Version {policy.version}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </BaseLayout>
        </>
    );
}

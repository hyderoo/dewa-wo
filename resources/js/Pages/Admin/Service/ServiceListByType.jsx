import React from "react";
import ServiceCard from "./ServiceCard";

const ServiceListByType = ({
    type,
    services,
    getServiceTypeLabel,
    onEdit,
    onDelete,
    onToggleStatus
}) => {
    return (
        <div>
            <h2 className="text-2xl font-cormorant mb-6 pb-2 border-b border-gray-200">
                {getServiceTypeLabel(type)}
            </h2>
            <div className="space-y-4">
                {services.map((service) => (
                    <ServiceCard
                        key={service.id}
                        service={service}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onToggleStatus={onToggleStatus}
                    />
                ))}
            </div>
        </div>
    );
};

export default ServiceListByType;

import { Capability } from "../types/capability";

import "../styles/capability-list.css";

interface CapabilityListProps {
    capabilities: Capability[];
    activeCapability: string | null;

    onActiveCapabilityChange: (id: string) => void;
}

export default function CapabilityList({
    capabilities,
    activeCapability,
    onActiveCapabilityChange,
}: CapabilityListProps) {
    return (
        <div className="capability-list">

            {capabilities.map((capability) => (

                <div
                    key={capability.id}
                    className={
                        capability.id === activeCapability
                            ? "capability-item active"
                            : "capability-item"
                    }
                    onMouseEnter={() =>
                        onActiveCapabilityChange(capability.id)
                    }
                >
                    {capability.title}
                </div>

            ))}

        </div>
    );
}
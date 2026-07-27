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
                    role="button"
                    tabIndex={0}
                    aria-pressed={capability.id === activeCapability}
                    className={
                        capability.id === activeCapability
                            ? "capability-item active"
                            : "capability-item"
                    }
                    onMouseEnter={() =>
                        onActiveCapabilityChange(capability.id)
                    }
                    onFocus={() =>
                        onActiveCapabilityChange(capability.id)
                    }
                    onClick={() =>
                        onActiveCapabilityChange(capability.id)
                    }
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onActiveCapabilityChange(capability.id);
                        }
                    }}
                >
                    {capability.title}
                </div>

            ))}

        </div>
    );
}
import { Capability } from "../types/capability";

import "../styles/capability-list.css";

interface CapabilityListProps {
    capabilities: Capability[];
    activeCapability: string | null;

    onActiveCapabilityChange: (id: string) => void;

    /**
     * Opens the Capability's description window.
     * Triggered by a click/Enter/Space, distinct from
     * hover/focus (which only preview the Capability's
     * Systems in the right-hand panel).
     */
    onCapabilityOpen: (capability: Capability) => void;
}

export default function CapabilityList({
    capabilities,
    activeCapability,
    onActiveCapabilityChange,
    onCapabilityOpen,
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
                    style={{ "--capability-color": capability.color } as React.CSSProperties}
                    onMouseEnter={() =>
                        onActiveCapabilityChange(capability.id)
                    }
                    onFocus={() =>
                        onActiveCapabilityChange(capability.id)
                    }
                    onClick={() => {
                        onActiveCapabilityChange(capability.id);
                        onCapabilityOpen(capability);
                    }}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onActiveCapabilityChange(capability.id);
                            onCapabilityOpen(capability);
                        }
                    }}
                >
                    {capability.title}
                </div>

            ))}

        </div>
    );
}

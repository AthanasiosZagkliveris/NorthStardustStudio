import PressRow from "./controls/PressRow.tsx";
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

                <PressRow
                    key={capability.id}
                    pressed={capability.id === activeCapability}
                    className={
                        capability.id === activeCapability
                            ? "capability-item active"
                            : "capability-item"
                    }
                    style={{ "--capability-color": capability.color } as React.CSSProperties}
                    onReach={() => onActiveCapabilityChange(capability.id)}
                    onPress={() => {
                        onActiveCapabilityChange(capability.id);
                        onCapabilityOpen(capability);
                    }}
                >
                    {/* Sized for its bold, tracked hover and selected
                        look from the start (.hover-width-reserve). */}
                    <span className="hover-width-reserve" data-reserve={capability.title}>
                        {capability.title}
                    </span>
                </PressRow>

            ))}

        </div>
    );
}

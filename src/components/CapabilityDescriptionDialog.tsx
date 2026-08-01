import { Capability } from "../types/capability";
import { CapabilityDescription } from "../framework/engine/CapabilityDescriptions.ts";
import { getCapabilityIcon } from "../data/capabilityIcons.ts";

import "../styles/capability-description.css";

interface CapabilityDescriptionDialogProps {

    open: boolean;

    capability: Capability | null;

    description: CapabilityDescription | null;

    onBack: () => void;

}

export default function CapabilityDescriptionDialog({

    open,

    capability,

    description,

    onBack

}: CapabilityDescriptionDialogProps) {

    if (!open || !capability) {
        return null;
    }

    const icon =
        description?.number !== undefined
            ? getCapabilityIcon(Number(description.number))
            : undefined;

    return (

        <div className="capability-description-overlay" onClick={onBack}>

            <div
                className="capability-description-dialog"
                style={{ "--capability-color": capability.color } as React.CSSProperties}
                onClick={(event) => event.stopPropagation()}
            >

                <div className="capability-description-heading">

                    {icon && (
                        <img
                            src={icon}
                            alt=""
                            className="capability-description-icon"
                        />
                    )}

                    <h2 className="capability-description-title">
                        {capability.title}
                    </h2>

                </div>

                {description?.tagline && (
                    <p className="capability-description-tagline">
                        {description.tagline}
                    </p>
                )}

                <div className="capability-description-body">

                    {(description?.paragraphs ?? []).map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}

                    {!description && (
                        <p>No description is available for this Capability yet.</p>
                    )}

                </div>

                {description?.corePrinciple && (
                    <div className="capability-description-principle">
                        <span className="capability-description-principle-label">
                            Core principle
                        </span>
                        <p>{description.corePrinciple}</p>
                    </div>
                )}

                <div className="capability-description-actions">

                    <button
                        type="button"
                        className="capability-description-back"
                        onClick={onBack}
                    >
                        ← Back
                    </button>

                </div>

            </div>

        </div>

    );

}

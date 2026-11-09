import { ReactNode } from "react";
import FieldLabel from "../../controls/FieldLabel.tsx";

/**
 * A TITLED SECTION OF A DIALOG, under what stands above it: split from it by the shared double rule, its title a band on the primary fill, what it holds in a
 * band under it (`tiles`: small tiles, with the field gap above them). One drawing for the Segment Description's Profiles, the Competitors' Differentiation and
 * the Founders & Ownership's founder Profiles (owner, 2026-11-09).
 */
export default function DialogSectionBand({ title, tiles = false, children }: { title: string; tiles?: boolean; children: ReactNode }) {
    return (
        <div className="legal-entity-grid legal-entity-grid-pairs legal-entity-grid-organization legal-entity-audience business-segment-grid business-segment-grid-full">
            <div className="legal-entity-field">
                <div className="business-capability-card-rule legal-entity-org-rule business-capability-card-rule-double" role="separator" />
                <div className="business-segment-box">
                    <div className="legal-entity-org-section">
                        <span className="business-foundation-label-info legal-entity-label-info">
                            <FieldLabel className="business-foundation-label" role="heading" aria-level={3}>{title}</FieldLabel>
                        </span>
                    </div>
                    <div className={"legal-entity-org-section" + (tiles ? " business-profiles-band" : "")}>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

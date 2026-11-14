import { ReactNode } from "react";
import FieldLabel from "../../controls/FieldLabel.tsx";
import FoldArrow from "./FoldArrow.tsx";

/**
 * A FOLDED LIST ON A CARD, one look wherever it stands (owner, 2026-11-14 18:10 and 18:11: "Make the layout and gaps ... similar to Links and Responsibilities";
 * "The Fees too"): the fold arrow and the label on one line, the count after them where there is one, and under them, unfolded, the lines 6px apart -- a
 * card's Links, a relationship type's stage channels, a subchannel's Fees. The label may be a link (the Fees' to the Global Settings); the lines are the
 * place's own (FoldListLine).
 */
export default function FoldList({ label, name, count, open, onToggle, className, children }: {
    /** The words beside the arrow: text, or a link. */
    label: ReactNode;
    /** What the arrow folds, for its accessible name ("Links of this card"). */
    name: string;
    /** How many lines it holds, after the label (none where the count says nothing). */
    count?: number;
    open: boolean;
    onToggle: () => void;
    className?: string;
    children?: ReactNode;
}) {
    return (
        <div className={"business-foundation-field business-capability-links" + (className ? " " + className : "")}>
            <span className="business-foundation-label-info business-capability-responsibilities-head business-capability-links-head">
                <FieldLabel className="business-foundation-label">
                    <FoldArrow variant="label" open={open} name={(open ? "Minimise " : "Maximise ") + name} onToggle={onToggle} />
                    {label}
                </FieldLabel>
                {count !== undefined && <FieldLabel className="field-label-muted business-capability-responsibilities-count">{count}</FieldLabel>}
            </span>
            {open && <div className="business-capability-links-list">{children}</div>}
        </div>
    );
}

/**
 * One line of a FoldList: its kind as a letter or a mark before it where it has one (R. Resource), then its words or its link -- one line cut by an ellipsis,
 * or, with `wrap`, its whole words over as many lines as they need; `nested` sets it in by the kind's column (a subchannel under its channel).
 */
export function FoldListLine({ kind, title, wrap = false, nested = false, children }: { kind?: string; title?: string; wrap?: boolean; nested?: boolean; children: ReactNode }) {
    return (
        <p className={"business-capability-activity-line business-capability-card-link" + (wrap ? " fold-list-line-wrap" : "") + (nested ? " fold-list-line-nested" : "")} title={title}>
            {kind !== undefined && <span className="business-capability-card-link-kind" aria-hidden="true">{kind}</span>}
            {children}
        </p>
    );
}

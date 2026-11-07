import type { ReactNode } from "react";
import "../../styles/fold-head.css";

import FoldArrow from "../interview/fields/FoldArrow.tsx";

/**
 * THE HEAD OF A FOLDING GROUP outside the cards (a Review's Organization, the Notes panel's groups): the fold arrow every card
 * head carries, the group's name and its count, with a rule under them. Clicking the name folds the group too; the arrow is the
 * control the keyboard and the screen reader get.
 */
export default function FoldHead({ open, label, name, count, className, onToggle, children, folds = true }: {
    open: boolean;
    /** What the arrow folds, read after "Minimise " / "Maximise ". */
    label: string;
    name: ReactNode;
    count?: ReactNode;
    className?: string;
    onToggle: () => void;
    /** Whatever stands at the end of the head (a funnel). */
    children?: ReactNode;
    /** False: the same head with no arrow and no folding, its group always open (the Review's Organizations; owner, 2026-11-05). */
    folds?: boolean;
}) {
    return (
        <div className={"fold-head" + (className ? " " + className : "")}>
            {folds && <FoldArrow open={open} label={label} onToggle={onToggle} />}
            <span className="fold-head-name" onClick={folds ? onToggle : undefined}>{name}</span>
            {count !== undefined && <span className="fold-head-count">{count}</span>}
            {children}
        </div>
    );
}

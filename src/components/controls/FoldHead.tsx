import type { ReactNode } from "react";
import "../../styles/fold-head.css";

import FoldArrow from "../interview/fields/FoldArrow.tsx";

/**
 * THE HEAD OF A FOLDING GROUP outside the cards (a Review's Organization, the Notes panel's groups): the fold arrow every card
 * head carries, the group's name and its count, with a rule under them. Clicking the name folds the group too; the arrow is the
 * control the keyboard and the screen reader get.
 */
export default function FoldHead({ open, label, name, count, className, onToggle, children }: {
    open: boolean;
    /** What the arrow folds, read after "Minimize " / "Maximize ". */
    label: string;
    name: ReactNode;
    count?: ReactNode;
    className?: string;
    onToggle: () => void;
    /** Whatever stands at the end of the head (a funnel). */
    children?: ReactNode;
}) {
    return (
        <div className={"fold-head" + (className ? " " + className : "")}>
            <FoldArrow open={open} label={label} onToggle={onToggle} />
            <span className="fold-head-name" onClick={onToggle}>{name}</span>
            {count !== undefined && <span className="fold-head-count">{count}</span>}
            {children}
        </div>
    );
}

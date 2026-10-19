import { ReactNode } from "react";

import FoldArrow from "./FoldArrow.tsx";
import CardNumber from "./CardNumber.tsx";

/**
 * THE CARD HEAD of every folding card: the fold arrow, the number, the card's mark, the name (a `NameCell`), the actions (the x, a drag handle), then whatever the card says on the head's row under the name (its summary). The classes are the card kind's own (`className`, always with `fold-card-head`); the order and the parts are this component's.
 */
export default function CardHead({ className, onToggle, open, foldLabel, number, kind, legal, mark, name, actions, children }: {
    className: string;
    /** Absent: the card does not fold, so no arrow. */
    onToggle?: () => void;
    open: boolean;
    foldLabel: string;
    number: number;
    kind?: string;
    /** The Legal Entity card's number markup. */
    legal?: boolean;
    mark?: ReactNode;
    name: ReactNode;
    actions?: ReactNode;
    children?: ReactNode;
}) {
    return (
        <div className={className}>
            {onToggle && <FoldArrow open={open} label={foldLabel} onToggle={onToggle} />}
            <CardNumber number={number} kind={kind} legal={legal} />
            {mark}
            {name}
            {actions}
            {children}
        </div>
    );
}

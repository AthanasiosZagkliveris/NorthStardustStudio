import LabelArrow from "./LabelArrow.tsx";

/**
 * The fold arrow every folding card, group and section head carries: named
 * "Minimize …" / "Maximize …" after what it folds. It is the Label Arrow
 * (LabelArrow.tsx, docs/ai/layout-rules.md "The label arrow"): one element, so
 * all of them stay the same control.
 */
export default function FoldArrow({

    open,

    label,

    onToggle

}: {

    open: boolean;
    /** What the arrow folds, read after "Minimize " / "Maximize ". */
    label: string;
    onToggle: () => void;

}) {

    return (
        <LabelArrow
            open={open}
            label={(open ? "Minimize " : "Maximize ") + label}
            onToggle={onToggle}
        />
    );

}

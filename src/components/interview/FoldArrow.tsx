/**
 * The fold arrow every folding card, group and section head carries:
 * ▾ open, ▸ folded, named "Minimize …" / "Maximize …" after what it
 * folds. One component so all of them stay the same control.
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
        <button
            type="button"
            className="strategy-box-toggle"
            aria-expanded={open}
            aria-label={(open ? "Minimize " : "Maximize ") + label}
            onClick={onToggle}
        >
            {open ? "▾" : "▸"}
        </button>
    );

}

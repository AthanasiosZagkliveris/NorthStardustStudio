import "../../../styles/fold-arrow.css";
import "../../../styles/label-arrow.css";

/**
 * THE FOLD ARROW: the one arrow that folds and unfolds, wherever it stands -- a card's head, a group's, a section's, a label's. An outlined triangle in the ink colour,
 * pointing right while what it folds is hidden and down while it is shown, filled under the pointer and the keyboard focus, with no ground and no ring under the
 * pointer. Its name is "Minimize ..." / "Maximize ..." after what it folds (`label`), or the whole name a place gives it (`name`).
 *
 * Two sizes, one arrow: the `card` arrow (default) is a 36px control on a card's or a group's head; the `label` arrow stands INSIDE a label or after a title, in the
 * label's own colour and size (docs/ai/layout-rules.md, "The label arrow"). `controls` names the block it shows and hides.
 */
export default function FoldArrow({

    open,

    label,

    name,

    controls,

    variant = "card",

    direction,

    pressed,

    className,

    onToggle

}: {

    open: boolean;
    /** What the arrow folds, read after "Minimize " / "Maximize ". */
    label?: string;
    /** The whole accessible name, where a place says it its own way ("Fold the list"). */
    name?: string;
    controls?: string;
    variant?: "card" | "label";
    /** A label arrow that chooses instead of folding (the cost order): it points up or down and is pressed or not. */
    direction?: "up" | "down";
    pressed?: boolean;
    className?: string;
    onToggle: () => void;

}) {

    const accessibleName = name ?? (open ? "Minimize " : "Maximize ") + (label ?? "");

    if (variant === "label") {
        return (
            <button
                type="button"
                className={"label-arrow" + (className ? " " + className : "")}
                aria-expanded={direction ? undefined : open}
                aria-pressed={direction ? pressed : undefined}
                data-direction={direction}
                aria-controls={controls}
                aria-label={accessibleName}
                onClick={onToggle}
            >
                <svg viewBox="0 0 11 18" aria-hidden="true" focusable="false">
                    <polygon points="1.2,1.2 9.8,9 1.2,16.8" vectorEffect="non-scaling-stroke" />
                </svg>
            </button>
        );
    }

    return (
        <button
            type="button"
            className={"strategy-box-toggle" + (className ? " " + className : "")}
            aria-expanded={open}
            aria-controls={controls}
            aria-label={accessibleName}
            onClick={onToggle}
        >
            {open ? "▾" : "▸"}
        </button>
    );

}

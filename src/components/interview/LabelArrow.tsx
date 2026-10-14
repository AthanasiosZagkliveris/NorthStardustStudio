import "../../styles/label-arrow.css";

/**
 * THE LABEL ARROW (docs/ai/layout-rules.md, "The label arrow"): the one fold arrow that stands beside a label or a text and
 * shows or hides what belongs to it. A triangle in the label's own colour and size, pointing right while what it
 * reveals is hidden and down while it is shown; an outline at rest, filled under the pointer and the keyboard focus. No frame.
 *
 * Put it INSIDE the label's element (left of the words) so it takes the label's colour and size, or after a title
 * (right) in a row that carries the title's colour and `--label-arrow-size`.
 */
export default function LabelArrow({

    open,

    label,

    controls,

    onToggle

}: {

    open: boolean;
    /** The accessible name ("Minimize Objective 1 initiatives", "Show help for Infrastructure"). */
    label: string;
    /** The id of the block this arrow shows and hides, when it has one. */
    controls?: string;
    onToggle: () => void;

}) {

    return (
        <button
            type="button"
            className="label-arrow"
            aria-expanded={open}
            aria-controls={controls}
            aria-label={label}
            onClick={onToggle}
        >
            <svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
                <path d="M4 14 L4 86 Q4 96 13 91.5 L87 54.5 Q96 50 87 45.5 L13 8.5 Q4 4 4 14 Z" vectorEffect="non-scaling-stroke" />
            </svg>
        </button>
    );

}

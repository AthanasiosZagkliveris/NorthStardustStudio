import "../../styles/title-arrow.css";

/**
 * The arrow beside a column TITLE that folds that column's own guidance
 * (docs/ai/layout-rules.md, "The title arrow"): pointing right while the
 * guidance is hidden, down while it is open. Its glyph is the title's own
 * size (--title-arrow-size, in em of the title), not the 36px fold arrow.
 */
export default function TitleHelpArrow({

    open,

    title,

    controls,

    onToggle

}: {

    open: boolean;
    /** The column's title, read after "Show help for " / "Hide help for ". */
    title: string;
    /** The id of the guidance block this arrow shows and hides. */
    controls: string;
    onToggle: () => void;

}) {

    return (
        <button
            type="button"
            className="title-arrow"
            aria-expanded={open}
            aria-controls={controls}
            aria-label={(open ? "Hide help for " : "Show help for ") + title}
            onClick={onToggle}
        >
            {open ? "▾" : "▸"}
        </button>
    );

}

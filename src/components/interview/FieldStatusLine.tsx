import { FIELD_FLAG_WORDS, type FieldFlag } from "../../framework/engine/Annotations";

/**
 * THE ONE STATUS LINE UNDER A FIELD'S LABEL: what is said about the
 * field besides its answer, in words with a small mark beside each
 * (never colour alone) --
 *
 *   ⚑ Not sure yet  /  ⚑ Needs research: <what to find out>  /
 *   ⚑ Doesn't apply     a flag (the field menu)
 *   ✎ Note              a note, which the mark opens and closes
 *   Changed in <Scenario> · Reset   later: a scenario's own value
 *
 * Quiet: small muted type, and nothing at all when there is nothing
 * to say. Every field that can carry these draws them here, so they
 * look the same everywhere.
 */
export default function FieldStatusLine({

    label,

    flag,

    research,

    hasNote = false,

    noteOpen = false,

    onToggleNote,

    changedIn,

    onReset

}: {

    /** The field's label, for the note button's accessible name. */
    label: string;
    flag?: FieldFlag;
    research?: string;
    hasNote?: boolean;
    noteOpen?: boolean;
    onToggleNote?: () => void;
    /** The scenario whose own value this field shows. */
    changedIn?: string;
    onReset?: () => void;

}) {

    if (!flag && !hasNote && !changedIn) {
        return null;
    }

    return (
        <span className="field-status-line">

            {flag && (
                <span className="field-status-item field-status-flag">
                    <span className="field-status-mark" aria-hidden="true">⚑</span>
                    {FIELD_FLAG_WORDS[flag]}
                    {flag === "research" && research?.trim() ? ": " + research.trim() : ""}
                </span>
            )}

            {hasNote && (
                <button
                    type="button"
                    className="field-status-item field-status-note"
                    aria-expanded={noteOpen}
                    aria-label={(noteOpen ? "Hide" : "Show") + " the note on " + label}
                    onClick={onToggleNote}
                >
                    <span className="field-status-mark" aria-hidden="true">✎</span>
                    Note
                </button>
            )}

            {changedIn && (
                <span className="field-status-item field-status-changed">
                    Changed in {changedIn}
                    {onReset && (
                        <>
                            {" · "}
                            <button type="button" className="field-status-reset" onClick={onReset}>
                                Reset
                            </button>
                        </>
                    )}
                </span>
            )}

        </span>
    );

}

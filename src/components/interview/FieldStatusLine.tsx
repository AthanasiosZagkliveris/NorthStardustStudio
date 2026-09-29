/**
 * THE ONE STATUS LINE UNDER A FIELD'S LABEL: what is said about the
 * field besides its answer, in words with a small mark where it has
 * one (never colour alone) --
 *
 *   ⚑                               a note in your Notepad links here
 *                                   (aria "In your notes"): opens it there
 *   Changed in <Scenario> · Reset   later: a scenario's own value
 *
 * Quiet: small muted type, and nothing at all when there is nothing
 * to say. Every field that can carry these draws them here, so they
 * look the same everywhere.
 */
export default function FieldStatusLine({

    label,

    onOpenNotes,

    changedIn,

    onReset

}: {

    /** The field's label, for what the line's controls are named after. */
    label: string;
    /** Given when a note links here: opens the Notepad at those notes. */
    onOpenNotes?: () => void;
    /** The scenario whose own value this field shows. */
    changedIn?: string;
    onReset?: () => void;

}) {

    if (!changedIn && !onOpenNotes) {
        return null;
    }

    return (
        <span className="field-status-line">

            {onOpenNotes && (
                <button
                    type="button"
                    className="field-status-item field-status-notes"
                    aria-label="In your notes"
                    data-field={label}
                    onClick={onOpenNotes}
                >
                    <span className="field-status-mark" aria-hidden="true">⚑</span>
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

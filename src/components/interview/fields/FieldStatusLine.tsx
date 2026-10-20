/**
 * THE ONE STATUS LINE UNDER A FIELD'S LABEL: what is said about the
 * field besides its answer, in words with a small mark where it has
 * one (never colour alone) --
 *
 *   Choose a country first.         what a frozen field waits for
 *                                   (FrozenUntil, FieldDependencies.ts)
 *   Changed in <Scenario> · Reset   later: a scenario's own value
 *
 * Quiet: small muted type, and nothing at all when there is nothing
 * to say. Every field that can carry these draws them here, so they
 * look the same everywhere.
 */
export default function FieldStatusLine({

    waiting,

    changedIn,

    onReset

}: {

    /** The field's label, for what the line's controls are named after. */
    label: string;
    /** What the field waits for, while it is frozen: "Choose a country first." */
    waiting?: string;
    /** The scenario whose own value this field shows. */
    changedIn?: string;
    onReset?: () => void;

}) {

    if (!changedIn && !waiting) {
        return null;
    }

    return (
        <span className="field-status-line">

            {waiting && <span className="field-status-item field-status-waiting">{waiting}</span>}

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

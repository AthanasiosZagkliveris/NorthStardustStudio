import FieldRow from "../../fields/FieldRow.tsx";
import { SingleColumn } from "../foundation/shared.tsx";
import { BusinessTicks } from "../../cards/BusinessCardFields.tsx";
import { PB13_INFO, PB13_LABEL, VALUE_KINDS, VALUE_KINDS_MAX, asValueKinds, manifestoDraft, principlesDraft, valuesDraft } from "../../../../framework/engine/choices/MissionChoices.ts";
import { valueLines, withValuesText } from "../../../../framework/engine/ValueIds.ts";
import { AutoDraft, useAutoDraft } from "../../fields/useAutoDraft.ts";

const text = (value: unknown) => (typeof value === "string" ? value : "");

/**
 * THE VALUES' KINDS, PB13, ABOVE THE VALUES (doc 45, section 8; the owner's approval of 2026-11-20 22:08 UTC+2, "All, Values A"): the kind of value that matters
 * most in how the business works (the Competing Values Framework), each tick starting a line of the Values ("Care: ") that the founder finishes; written in by
 * itself while the Values are empty or still the app's own. The same field row and ticks as the Vision's and the Mission's choices.
 */
export default function ValuesChoices({ value, onChange, disabled = false }: {
    /** The Identity System's Purpose answer, which holds the Values and PB13. */
    value: Record<string, unknown>;
    onChange: (next: Record<string, unknown>) => void;
    disabled?: boolean;
}) {
    const kinds = asValueKinds(value.valueKinds);
    // (The Values keep an id for each line, beside their text: withValuesText.)
    useAutoDraft(text(value.values), valuesDraft(kinds), (next) => onChange(withValuesText(value, next)), disabled);
    return (
        <SingleColumn>
            <div className="legal-entity-org-section legal-entity-org-band">
                <FieldRow pair fullList label={PB13_LABEL} info={PB13_INFO} labelNote={<span className="business-foundation-tick-note">{VALUE_KINDS_MAX + " max"}</span>}>
                    <div className="radio-choice legal-entity-radio-stack" role="group" aria-label={PB13_LABEL}>
                        <BusinessTicks
                            name={PB13_LABEL}
                            disabled={disabled}
                            options={VALUE_KINDS.map(kind => ({ id: kind.id, label: kind.label }))}
                            chosen={kinds}
                            max={VALUE_KINDS_MAX}
                            onChange={(next) => onChange({ ...value, valueKinds: asValueKinds(next) })}
                        />
                    </div>
                </FieldRow>
            </div>
        </SingleColumn>
    );
}

/**
 * THE PRINCIPLES' AND THE MANIFESTO'S DRAFTS (doc 45, section 8): a "We always ..." line under each Value, and "We are for [the Values]." with the Philosophy's
 * first sentence; each written in by itself while its text is empty or still the app's own. It draws nothing.
 */
export function PurposeDrafts({ part, value, onChange, disabled = false }: {
    part: "principles" | "manifesto";
    value: Record<string, unknown>;
    onChange: (next: Record<string, unknown>) => void;
    disabled?: boolean;
}) {
    const values = valueLines(text(value.values));
    const draft = part === "principles" ? principlesDraft(values) : manifestoDraft(values, text(value.philosophy));
    return <AutoDraft text={text(value[part])} draft={draft} write={(next) => onChange({ ...value, [part]: next })} disabled={disabled} />;
}

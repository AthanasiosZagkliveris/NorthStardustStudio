import FieldRow from "../../fields/FieldRow.tsx";
import RadioChoice from "../../../controls/RadioChoice.tsx";
import { BusinessTicks } from "../../cards/BusinessCardFields.tsx";
import { businessFoundationSegments } from "../../../../framework/engine/AnswerUtils.ts";
import { PB7_INFO, PB8_INFO, VISION_AMBITIONS, VISION_AMBITIONS_MAX, VISION_REACH, asVisionAmbitions, asVisionReach, widestSegmentReach } from "../../../../framework/engine/VisionChoices.ts";

/**
 * THE VISION'S TWO CHOICES, PB7 AND PB8 (doc 45, section 3.8; the owner's approved plan of 2026-11-18, §3, B2): under the Vision's text in the Mission & Vision
 * dialog, one question per band, as the Positioning dialog's questions stand (layout rules section 13, "The Positioning tile's dialog": bands, every other one
 * tinted). The shared controls only: the field row with its label and "i" (`FieldRow`), the ticks with their limit (`BusinessTicks`, "3 max"), the one
 * choice (`RadioChoice`). PB8 has, under it, the Segment's widest reach today, as a muted line.
 */
export default function VisionChoices({ value, onChange, foundation, disabled = false }: {
    /** The Identity System's Definition answer, which holds the Vision and these two. */
    value: Record<string, unknown>;
    onChange: (next: Record<string, unknown>) => void;
    /** The Business System's Foundation, for the Segment's reach today. */
    foundation?: unknown;
    disabled?: boolean;
}) {
    const ambitions = asVisionAmbitions(value.visionAmbitions);
    const reach = asVisionReach(value.visionReach);
    const today = widestSegmentReach(businessFoundationSegments(foundation));
    return (
        <div className="legal-entity-audience legal-entity-bands">
            <div className="legal-entity-org-section">
                <FieldRow pair fullList label="What will your business be when your Vision comes true?" info={PB7_INFO} labelNote={<span className="business-foundation-tick-note">{VISION_AMBITIONS_MAX + " max"}</span>}>
                    <div className="radio-choice legal-entity-radio-stack" role="group" aria-label="What will your business be when your Vision comes true?">
                        <BusinessTicks
                            name="What will your business be when your Vision comes true?"
                            disabled={disabled}
                            options={VISION_AMBITIONS.map(option => ({ id: option.id, label: option.label }))}
                            chosen={ambitions}
                            max={VISION_AMBITIONS_MAX}
                            onChange={(next) => onChange({ ...value, visionAmbitions: asVisionAmbitions(next) })}
                        />
                    </div>
                </FieldRow>
            </div>
            <div className="legal-entity-org-section legal-entity-org-band">
                <FieldRow pair fullList label="Where will your customers be?" info={PB8_INFO}>
                    <RadioChoice
                        label="Where will your customers be?"
                        group="vision-reach"
                        className="legal-entity-radio-stack"
                        disabled={disabled}
                        value={reach as never}
                        onChange={(next) => onChange({ ...value, visionReach: asVisionReach(next) })}
                        options={VISION_REACH.map(option => ({ id: option.id, label: option.label })) as never}
                    />
                    {today && <p className="legal-entity-empty-note">{"Today: " + today.label + " (" + today.segment + ")"}</p>}
                </FieldRow>
            </div>
        </div>
    );
}

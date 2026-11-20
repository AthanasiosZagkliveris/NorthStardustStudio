import FieldRow from "../../fields/FieldRow.tsx";
import { SingleColumn } from "../foundation/shared.tsx";
import RadioChoice from "../../../controls/RadioChoice.tsx";
import { BusinessTicks } from "../../cards/BusinessCardFields.tsx";
import { businessFoundationSegments } from "../../../../framework/engine/AnswerUtils.ts";
import { PB7_INFO, PB8_INFO, VISION_AMBITIONS, VISION_AMBITIONS_MAX, VISION_REACH, asVisionAmbitions, asVisionReach, visionChoicesSentence, widestSegmentReach } from "../../../../framework/engine/VisionChoices.ts";
import { useAutoDraft } from "../../fields/useAutoDraft.ts";
import InfoNote, { InfoText } from "../../fields/InfoNote.tsx";

/**
 * THE VISION'S TWO CHOICES, PB8 THEN PB7, ABOVE ITS TEXT, AND "ADD A DRAFT" (doc 45, section 3.8; doc 49, section 9, P1 and P2; owner, 2026-11-20 12:49 UTC+2,
 * "proceed to changes"): where the customers will be first, then what the business will be, as the Vision's own guiding questions run; then "Add a draft",
 * the Value Proposition's and the Ambassador's link, writing the Business Plan's own sentence (visionChoicesSentence) at the end of the Vision. Formerly under the
 * Vision's text (the owner's approved plan of 2026-11-18, §3, B2), in the Mission & Vision
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
    const vision = typeof value.vision === "string" ? value.vision : "";
    const draft = visionChoicesSentence(ambitions, reach);
    // (The draft written in by itself while the Vision is empty or still the app's: owner, 2026-11-20 18:35 UTC+2; its Notes stand under the text.)
    useAutoDraft(vision, draft, (next) => onChange({ ...value, vision: next }), disabled);
    return (
        // (One column of bands, the shared helper the Positioning's and the cards' questions stand in.)
        <SingleColumn>
            <div className="legal-entity-org-section">
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
                    {/* (The Segment it is read from in its "i", never in brackets: owner, 2026-11-20 18:35 UTC+2.) */}
                    {today && (
                        <p className="legal-entity-empty-note">
                            <InfoText text={"Today: " + today.label}>
                                <InfoNote label="Today" points={["Read from the Segment that reaches widest today: " + today.segment + "."]} />
                            </InfoText>
                        </p>
                    )}
                </FieldRow>
            </div>
            <div className="legal-entity-org-section legal-entity-org-band">
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
        </SingleColumn>
    );
}

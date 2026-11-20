import FieldRow from "../../fields/FieldRow.tsx";
import { SingleColumn } from "../foundation/shared.tsx";
import { BusinessTicks } from "../../cards/BusinessCardFields.tsx";
import { businessFoundationSegments } from "../../../../framework/engine/AnswerUtils.ts";
import {
    MISSION_GAINS_MAX, MISSION_OFFERS_MAX, MISSION_SERVES_MAX, PB10_INFO, PB10_LABEL, PB11_INFO, PB11_LABEL, PB12_INFO, PB12_LABEL,
    asMissionGains, asMissionOffers, asMissionServes, missionDraft, missionGainOptions, missionOfferOptions, missionServeOptions
} from "../../../../framework/engine/MissionChoices.ts";
import { useAutoDraft } from "../../fields/useAutoDraft.ts";

/**
 * THE MISSION'S THREE CHOICES, PB10 TO PB12, ABOVE ITS TEXT (doc 45, section 8; the owner's approval of 2026-11-20 22:08 UTC+2, "All, Values A"): who the
 * business serves first, what it offers them, what they gain -- read from the Business System's Segments, their Offerings and their Profiles' goals -- then the
 * Mission's draft written in by itself while the Mission is empty or still the app's own (`useAutoDraft`). The Vision's choices are its pattern: one band a
 * question, the shared field row with its label and "i" (`FieldRow`), the ticks with their limit (`BusinessTicks`).
 */
export default function MissionChoices({ value, onChange, foundation, disabled = false }: {
    /** The Identity System's Definition answer, which holds the Mission and these three. */
    value: Record<string, unknown>;
    onChange: (next: Record<string, unknown>) => void;
    /** The Business System's Foundation: its Segments, their Offerings and Profiles. */
    foundation?: unknown;
    disabled?: boolean;
}) {
    const segments = businessFoundationSegments(foundation);
    const serves = asMissionServes(value.missionServes);
    const offers = asMissionOffers(value.missionOffers);
    const gains = asMissionGains(value.missionGains);
    const mission = typeof value.mission === "string" ? value.mission : "";
    useAutoDraft(mission, missionDraft(segments, serves, offers, gains), (next) => onChange({ ...value, mission: next }), disabled);
    if (segments.length === 0) {
        return null;
    }
    const question = (label: string, info: string[], max: number, options: { id: string; label: string }[], chosen: string[], key: string, band: boolean) => (
        <div className={"legal-entity-org-section" + (band ? " legal-entity-org-band" : "")}>
            <FieldRow pair fullList label={label} info={info} labelNote={<span className="business-foundation-tick-note">{max + " max"}</span>}>
                <div className="radio-choice legal-entity-radio-stack" role="group" aria-label={label}>
                    <BusinessTicks
                        name={label}
                        disabled={disabled}
                        options={options}
                        chosen={chosen.filter(id => options.some(option => option.id === id))}
                        max={max}
                        onChange={(next) => onChange({ ...value, [key]: next })}
                    />
                </div>
            </FieldRow>
        </div>
    );
    // (The bands alternate, the last one tinted as the Vision's last one is, so the Mission's text stands a band's gap under it in both columns.)
    return (
        <SingleColumn>
            {question(PB10_LABEL, PB10_INFO, MISSION_SERVES_MAX, missionServeOptions(segments), serves, "missionServes", true)}
            {question(PB11_LABEL, PB11_INFO, MISSION_OFFERS_MAX, missionOfferOptions(segments, serves), offers, "missionOffers", false)}
            {question(PB12_LABEL, PB12_INFO, MISSION_GAINS_MAX, missionGainOptions(segments, serves), gains, "missionGains", true)}
        </SingleColumn>
    );
}

import type { ReactNode } from "react";

import FieldRow from "../../fields/FieldRow.tsx";
import InfoNote, { InfoText } from "../../fields/InfoNote.tsx";
import TextLink from "../../fields/TextLink.tsx";
import RadioChoice from "../../../controls/RadioChoice.tsx";
import RatingScaleGroup from "../../../controls/RatingScaleGroup.tsx";
import { ratingScaleMeaning } from "../../../controls/RatingScaleEnds.tsx";
import type { Rating } from "../../../controls/RatingScale.tsx";
import { BusinessTicks } from "../../cards/BusinessCardFields.tsx";
import { joinImprint, splitImprint } from "../../fields/ColumnFields.tsx";
import { draftAdds, withDraft } from "../../../../framework/engine/CompetitorQuestions.ts";
import {
    AMBASSADOR_CHARACTERS, AMBASSADOR_DRESS, AMBASSADOR_PRESENCE, AMBASSADOR_SETTINGS, AMBASSADOR_TICKS_MAX, AMBASSADOR_TONE, BA_INFO, BA_LABELS,
    type AmbassadorContext, aestheticsDraft, ambassadorShown, asAmbassadorChoices, bodyLanguageDraft, characterLimit, feelingOptions, firstImpressionDraft, voiceDraft, wordsOptions
} from "../../../../framework/engine/AmbassadorChoices.ts";

/** The Ambassador's four texts, by their saved keys (the Brand System's first section). */
export const AMBASSADOR_PARTS = ["aesthetics", "attitude-body-language", "communication-voice", "imprint"] as const;

/**
 * THE AMBASSADOR'S CHOICES (doc 46; the owner's approved plan of 2026-11-18, §3, B2): above each of the four texts, its questions, one per band, as the Vision's
 * choices and the Positioning dialog's stand (layout rules section 13: bands, every other one tinted), then "Add a draft" (the Value Proposition's link, doc 42),
 * which writes the tile's sentence at the end of its text once. The shared controls only: the field row with its label and "i" (`FieldRow`), the one choice
 * (`RadioChoice`), the ticks with their limit (`BusinessTicks`), the rated rows (`RatingScaleGroup`). Saved under the section's key `ambassador`.
 */
export default function AmbassadorChoices({ part, value, onChange, context, stage, disabled = false }: {
    /** Which text's choices: one of AMBASSADOR_PARTS. */
    part: string;
    /** The section's answer: the four texts and `ambassador`. */
    value: Record<string, unknown>;
    onChange: (next: Record<string, unknown>) => void;
    context: AmbassadorContext;
    /** The business stage: BA1 is one choice until Managing. */
    stage: string;
    disabled?: boolean;
}) {
    const raw = value.ambassador && typeof value.ambassador === "object" && !Array.isArray(value.ambassador) ? value.ambassador as Record<string, unknown> : {};
    const shown = ambassadorShown(asAmbassadorChoices(value), context);
    const set = (key: string, next: unknown) => onChange({ ...value, ambassador: { ...raw, [key]: next } });
    const band = (content: ReactNode, at: number, key: string) => (
        <div key={key} className={"legal-entity-org-section" + (at % 2 === 1 ? " legal-entity-org-band" : "")}>{content}</div>
    );
    const ticks = (label: string, options: readonly { id: string; label: string; info?: string[] }[], chosen: readonly string[], max: number, save: (next: string[]) => void) => (
        <div className="radio-choice legal-entity-radio-stack" role="group" aria-label={label}>
            <BusinessTicks name={label} disabled={disabled} options={options} chosen={chosen} max={max} onChange={save} />
        </div>
    );
    const question = (id: keyof typeof BA_LABELS, control: ReactNode, max?: number) => (
        <FieldRow pair fullList label={BA_LABELS[id]} info={[...BA_INFO[id]]} labelNote={max !== undefined ? <span className="business-foundation-tick-note">{max + " max"}</span> : undefined}>
            {control}
        </FieldRow>
    );
    /** Rated rows, each with its row name and its own "i" (what 1 and 5 mean first: doc 46, 1.3). */
    const rated = (label: string, group: string, rows: readonly { id: string; label: string; low: string; high: string; info?: string }[], values: Readonly<Partial<Record<string, number>>>, save: (row: string, next: Rating | undefined) => void) => (
        <RatingScaleGroup
            label={label}
            name={group}
            rows={rows.map(row => ({
                id: row.id,
                name: row.label,
                label: <InfoText text={row.label}><InfoNote label={row.label} points={[ratingScaleMeaning(row), ...(row.info ? [row.info] : [])]} fullList /></InfoText>
            }))}
            values={values as Readonly<Partial<Record<string, Rating>>>}
            onChange={save}
            lowLabel=""
            highLabel=""
            disabled={disabled}
        />
    );

    const bands: ReactNode[] = [];
    let draft = "";
    let text = typeof value[part] === "string" ? value[part] as string : "";
    let writeDraft = (next: string) => onChange({ ...value, [part]: next });

    if (part === "aesthetics") {
        const limit = characterLimit(stage);
        const characters = AMBASSADOR_CHARACTERS.map(option => ({ id: option.id, label: option.label, info: [option.info] }));
        bands.push(question("ba1", limit === 1 && shown.character.length <= 1
            ? <RadioChoice label={BA_LABELS.ba1} group="ambassador-character" className="legal-entity-radio-stack" disabled={disabled} value={shown.character[0] ?? ""}
                onChange={(next) => set("character", [next])}
                options={characters.map(option => ({ id: option.id, name: option.label, label: <InfoText text={option.label}><InfoNote label={option.label} points={option.info} fullList /></InfoText> }))} />
            : ticks(BA_LABELS.ba1, characters, shown.character, limit, (next) => set("character", next)), limit === 1 && shown.character.length <= 1 ? undefined : limit));
        bands.push(question("ba2", <RadioChoice label={BA_LABELS.ba2} group="ambassador-dress" className="legal-entity-radio-stack" disabled={disabled} value={shown.dress} onChange={(next) => set("dress", next)} options={AMBASSADOR_DRESS.map(option => ({ id: option.id, label: option.label }))} />));
        bands.push(question("ba3", ticks(BA_LABELS.ba3, AMBASSADOR_SETTINGS.map(option => ({ id: option.id, label: option.label })), shown.setting, AMBASSADOR_TICKS_MAX, (next) => set("setting", next)), AMBASSADOR_TICKS_MAX));
        draft = aestheticsDraft(shown);
    } else if (part === "attitude-body-language") {
        bands.push(question("ba4", rated(BA_LABELS.ba4, "ambassador-presence", AMBASSADOR_PRESENCE, { energy: shown.energy, expression: shown.expression }, (row, next) => set(row, next))));
        draft = bodyLanguageDraft(shown, context);
    } else if (part === "communication-voice") {
        bands.push(question("ba6", rated(BA_LABELS.ba6, "ambassador-tone", AMBASSADOR_TONE, shown.tone, (row, next) => set("tone", { ...(raw.tone && typeof raw.tone === "object" ? raw.tone as Record<string, unknown> : {}), [row]: next }))));
        bands.push(question("ba7", <RadioChoice label={BA_LABELS.ba7} group="ambassador-words" className="legal-entity-radio-stack" disabled={disabled} value={shown.words} onChange={(next) => set("words", next)} options={wordsOptions(context)} />));
        draft = voiceDraft(shown);
    } else if (part === "imprint") {
        const options = feelingOptions(context);
        bands.push(question("ba8", ticks(BA_LABELS.ba8, options, shown.feeling, AMBASSADOR_TICKS_MAX, (next) => set("feeling", next.filter(id => options.some(option => option.id === id)))), AMBASSADOR_TICKS_MAX));
        // (The First impression's sentence goes into its own text: doc 46, section 3, "First impression: people feel ...".)
        const { first, lasting } = splitImprint(value[part]);
        text = first;
        writeDraft = (next: string) => onChange({ ...value, [part]: joinImprint(next, lasting) });
        draft = firstImpressionDraft(shown, context);
    }
    if (bands.length === 0) {
        return null;
    }
    return (
        <>
            <div className="legal-entity-audience legal-entity-bands">
                {bands.map((content, at) => band(content, at, part + "-" + at))}
            </div>
            {draftAdds(text, draft) && (
                <TextLink className="business-competitor-draft" disabled={disabled} onClick={() => writeDraft(withDraft(text, draft))}>
                    Add a draft
                </TextLink>
            )}
        </>
    );
}

/**
 * ONE COMPETITOR CARD (doc 41): its Type, its Description boxes with K1 to K7, the SWOT with K8 and K9, and the Insights with K10.
 * One part of useFoundationSubsections (moved out whole on 2026-11-09, no change of behaviour): what it reads of the Segment and of the page comes in as `scope`.
 */
import TickField from "../../../controls/TickField.tsx";
import AddButton from "../../../controls/AddButton.tsx";
import { Fragment, ReactNode } from "react";
import { BUSINESS_COMPETITOR_TYPES, BusinessCompetitorValue } from "../../../../framework/engine/AnswerUtils.ts";
import FieldRow from "../../fields/FieldRow.tsx";
import { BusinessStep, BusinessTicks, OptionalNote } from "../../cards/BusinessCardFields.tsx";
import RadioChoice from "../../../controls/RadioChoice.tsx";
import RatingScale, { type Rating } from "../../../controls/RatingScale.tsx";
import { ratingScaleMeaning } from "../../../controls/RatingScaleEnds.tsx";
import RatingScaleGroup from "../../../controls/RatingScaleGroup.tsx";
import TextLink from "../../fields/TextLink.tsx";
import TextBox from "../../../controls/TextBox.tsx";
import { type OtherQuestion, competitorOtherAdd, competitorOtherName, competitorOtherRemove, competitorOtherSettle, competitorOtherTick, competitorOthers, COMPETITOR_CHANNEL_OPTIONS, COMPETITOR_EXPERIENCE_HOW, COMPETITOR_INFO, COMPETITOR_OFFER_OPTIONS, COMPETITOR_RATINGS, COMPETITOR_REACH_OPTIONS, COMPETITOR_SIZE_OPTIONS, COMPETITOR_STAGES, type CompetitorAnswers, type CompetitorQuestionId, REVIEW_PLATFORM_EXAMPLES, competitorAsks, competitorOpenings, competitorRate, competitorRatings, competitorSettle, competitorWording, competitorValueRows, shownOpenings, COMPETITOR_SUBCHANNELS, COMPETITOR_BAND_LINE, bandTone, COMPETITOR_CHANGES, valueProfiles, hardToBeat, reviewPlatformOrder } from "../../../../framework/engine/CompetitorQuestions.ts";
import FittingRadioChoice from "./FittingRadioChoice.tsx";
import { type SegmentQuestion, segmentRowChoice } from "../../../../framework/engine/SegmentQuestions.ts";
import { summaryText } from "../../cards/cardSummary.ts";
import OptionPicker from "../../fields/OptionPicker.tsx";
import { COMPETITOR_TYPE_QUESTIONS, NOTE_PLACEHOLDERS, SUBSECTIONS, SingleColumn, competitorParts } from "./shared.tsx";
import type { FoundationCardScope } from "./useFoundationSubsections.tsx";

/** Which of the card's questions each box of its Description asks (doc 41): K1 in Offerings, K2 to K4 in Market, K5 in Customer Acquisition, K6 and K7 in Customer Experience. */
const PART_QUESTIONS: Record<string, CompetitorQuestionId[]> = { offerings: ["k1"], market: ["k2", "k3", "k4"], acquisition: ["k5"], experience: ["k6", "k7"] };

export function competitorCard(scope: FoundationCardScope, competitor: BusinessCompetitorValue, index: number): ReactNode {

    const { card, description, disabled, group, groupFold, identity, labelled, remove, segment, segmentEndsUser, segmentIndex, segmentPath, updateSegment } = scope;

    const change = (
    patch: Partial<BusinessCompetitorValue>
    ) => updateSegment(segmentIndex, {
    competitors: segment.competitors.map(
        (candidate, position) => position === index
            ? { ...candidate, ...patch }
            : candidate
    )
    });

    const chosen = BUSINESS_COMPETITOR_TYPES.find(
    type => type.id === competitor.type
    );

    // What this type changes about the questions,
    // if anything.
    const asked = COMPETITOR_TYPE_QUESTIONS[competitor.type] ?? {};

    /* ---- The card's questions (doc 41): K1 to K10, each in its box or band ---- */
    const whose = segmentPath + ", Competitor " + (index + 1);
    const answers: CompetitorAnswers = competitor.questions ?? {};
    // A change of answers is settled against the type: a question it does not ask, an option or a row not offered, loses its answer.
    const write = (next: CompetitorAnswers) => change({ questions: competitorSettle(next, competitor.type) });
    // (K8 reads the buyer's B1: "your buyers" where the Segment has an end user, 2026-11-09.)
    const words = (id: CompetitorQuestionId) => id === "k8" && segmentEndsUser ? competitorWording(competitor.type, id).replace("your customers", "your buyers") : competitorWording(competitor.type, id);
    // A radio of short options stands in one row, as on the Segment and the Profile.
    const radio = (id: CompetitorQuestionId, options: readonly { id: string; label: string }[]) => segmentRowChoice({ id, label: words(id), box: "demographics", many: false, options } as unknown as SegmentQuestion, options.map(option => ({ ...option })))
    ? <FittingRadioChoice label={words(id)} group={competitor.id + "-" + id} disabled={disabled} value={answers[id]?.[0] ?? ""} onChange={(next) => write({ ...answers, [id]: [next] })} options={options.map(option => ({ ...option }))} />
    : <RadioChoice label={words(id)} group={competitor.id + "-" + id} className="legal-entity-radio-stack" disabled={disabled} value={answers[id]?.[0] ?? ""} onChange={(next) => write({ ...answers, [id]: [next] })} options={options} />;
    const rated = (id: "k6" | "k7" | "k8" | "k9", rows: readonly { id: string; label: ReactNode; name?: string; below?: ReactNode; fixed?: boolean }[], extra: Partial<Parameters<typeof RatingScaleGroup>[0]> = {}) => (
    <RatingScaleGroup
        label={words(id)}
        name={competitor.id + "-" + id}
        rows={rows}
        values={competitorRatings(answers, id)}
        onChange={(row, next) => write(competitorRate(answers, id, row, next))}
        lowLabel={COMPETITOR_RATINGS[id].low}
        highLabel={COMPETITOR_RATINGS[id].high}
        disabled={disabled}
        {...extra}
    />
    );
    // Other (K6; owner 2026-11-04): ticked, a row to write in, rated as the listed ones; a name that means a listed item becomes it.
    const otherRows = (id: OtherQuestion) => competitorOthers(answers, id).map((name, at) => ({
    id: "other-" + at,
    name: name.trim() || "Other " + (at + 1),
    fixed: true,
    label: (
        <TextBox
            className="interview-input business-competitor-other"
            aria-label={words(id) + ", other " + (at + 1)}
            placeholder="Where else are they reviewed?"
            disabled={disabled}
            value={name}
            onChange={(event) => write(competitorOtherName(answers, id, at, event.target.value))}
            onBlur={() => {
                const done = competitorOtherSettle(answers, id, at);
                if (done !== answers) {
                    write(done);
                } else if (!name.trim() && competitorOthers(answers, id).length > 1) {
                    write(competitorOtherRemove(answers, id, at));
                }
            }}
        />
    )
    }));
    const otherTick = (id: OtherQuestion) => (
    <div className="business-competitor-other-row">
        <TickField className="business-foundation-tick business-foundation-tick-inline" disabled={disabled} checked={competitorOthers(answers, id).length > 0} onChange={(event) => write(competitorOtherTick(answers, id, event.currentTarget.checked))}>
            Other
        </TickField>
        {competitorOthers(answers, id).length > 0 && (
            <TextLink className="business-competitor-add-other" disabled={disabled} onClick={() => write(competitorOtherAdd(answers, id))}>Add another</TextLink>
        )}
    </div>
    );
    // K6: the platforms in the order of the App User's industry and country (L18); a platform ticked before stays shown.
    const platforms = reviewPlatformOrder(identity?.country ?? "", identity?.activityCode ?? "");
    const platformRows = [...platforms.first, ...platforms.rest.filter(platform => (answers.k6 ?? []).includes(platform.id))];
    const context = { profiles: segment.profiles.map(profile => profile.questions ?? {}), others: segment.competitors.filter(other => other.id !== competitor.id).map(other => other.questions ?? {}) };
    // K8 (doc 41; owner, 2026-11-04): every value, the Profiles' highest rated first, each chosen value with a band of one colour, darker the more
    // Profiles chose it (bandTone: the count only).
    const valueRows = competitorValueRows(context).map(value => ({ ...value, tone: bandTone(valueProfiles(value.id, context)) }));
    const valuesBanded = valueRows.some(row => row.tone > 0);
    // K9: the Segment's changes, those it ticks first (no band: no Segment or Profile answer chooses a change directly; owner, 2026-11-04).
    const ticked = segment.questions.trends ?? [];
    const changeRows = [...COMPETITOR_CHANGES.filter(entry => ticked.includes(entry.id)), ...COMPETITOR_CHANGES.filter(entry => !ticked.includes(entry.id))];
    // K10: the openings, from the answers above; a tick no longer offered goes.
    const openings = competitorOpenings(answers, competitor.type, context);
    const openingTicks = (answers.k10 ?? []).filter(id => openings.some(opening => opening.id === id));
    const controls: Record<CompetitorQuestionId, () => ReactNode> = {
    k1: () => <FittingRadioChoice label={words("k1")} group={competitor.id + "-k1"} disabled={disabled} value={answers.k1?.[0] ?? ""} onChange={(next) => write({ ...answers, k1: [next] })} options={COMPETITOR_OFFER_OPTIONS} />,
    k2: () => radio("k2", COMPETITOR_REACH_OPTIONS),
    k3: () => radio("k3", COMPETITOR_SIZE_OPTIONS),
    k4: () => (
        <RatingScale
            label={words("k4")}
            name={competitor.id + "-k4"}
            disabled={disabled}
            value={answers.k4?.[0] ? Number(answers.k4[0]) as Rating : undefined}
            onChange={(next) => write(next ? { ...answers, k4: [String(next)] } : Object.fromEntries(Object.entries(answers).filter(([key]) => key !== "k4")))}
            lowLabel={COMPETITOR_RATINGS.k4.low}
            highLabel={COMPETITOR_RATINGS.k4.high}
        />
    ),
    // K5 (owner, 2026-11-04): each channel a tick in the left half; once ticked, a dropdown of its sub-channels in the right half (the Rating
    // Scale's horizontal rule), the "+" in the card's x column adding one more row under it, each added row with its x. The lists are the
    // Profile's own (C2 to C4), so they compare with the customers; a sub-channel chosen in one row is not offered in another.
    k5: () => {
        const channels = answers.k5 ?? [];
        const subsOf = (channel: string) => (answers["k5-sub"] ?? []).filter(entry => entry.startsWith(channel + ":")).map(entry => entry.slice(channel.length + 1));
        const setSubs = (channel: string, list: readonly string[]) => write({ ...answers, "k5-sub": [...(answers["k5-sub"] ?? []).filter(entry => !entry.startsWith(channel + ":")), ...list.filter(Boolean).map(id => channel + ":" + id)] });
        return (
            <div className="business-competitor-channels" role="group" aria-label={words("k5")}>
                {COMPETITOR_CHANNEL_OPTIONS.map(channel => {
                    const on = channels.includes(channel.id);
                    const list = on ? COMPETITOR_SUBCHANNELS[channel.id] : undefined;
                    const chosen = subsOf(channel.id);
                    // One dropdown to start with; each chosen sub-channel keeps its row.
                    const rows = chosen.length > 0 ? chosen : [""];
                    const picker = (id: string, at: number) => list && (
                        <OptionPicker
                            label={channel.label + ", which one" + (rows.length > 1 ? " " + (at + 1) : "")}
                            options={list.filter(option => option.id === id || !chosen.includes(option.id)).map(option => option.label)}
                            disabled={disabled}
                            value={list.find(option => option.id === id)?.label ?? ""}
                            onChange={(next) => {
                                const picked = list.find(option => option.label === next)?.id;
                                if (picked) {
                                    setSubs(channel.id, rows.map((entry, position) => position === at ? picked : entry));
                                }
                            }}
                        />
                    );
                    return (
                        <Fragment key={channel.id}>
                            <TickField
                                className="business-foundation-tick business-competitor-channel"
                                aria-label={words("k5") + ": " + channel.label}
                                disabled={disabled}
                                checked={on}
                                onChange={(event) => write({ ...answers, k5: event.currentTarget.checked ? COMPETITOR_CHANNEL_OPTIONS.map(option => option.id).filter(id => id === channel.id || channels.includes(id)) : channels.filter(id => id !== channel.id) })}
                            >
                                <span className="business-foundation-tick-label">{channel.label}</span>
                            </TickField>
                            {list && (
                                <>
                                    <div className="business-competitor-subchannel">{picker(rows[0], 0)}</div>
                                    <div className="business-competitor-subchannel-step">
                                        {chosen.length > 0 && chosen.length < list.length && (
                                            <AddButton shape="box" small aria-label={"Add another " + channel.label + " choice"} disabled={disabled} onClick={() => {
                                                const free = list.find(option => !chosen.includes(option.id));
                                                if (free) {
                                                    setSubs(channel.id, [...chosen, free.id]);
                                                }
                                            }} />
                                        )}
                                    </div>
                                    {rows.slice(1).map((id, index) => (
                                        <Fragment key={channel.id + "-" + id}>
                                            <div className="business-competitor-subchannel">{picker(id, index + 1)}</div>
                                            <div className="business-competitor-subchannel-step">
                                                <BusinessStep kind="remove" what={channel.label + " choice"} disabled={disabled} onClick={() => setSubs(channel.id, chosen.filter((_entry, position) => position !== index + 1))} />
                                            </div>
                                        </Fragment>
                                    ))}
                                </>
                            )}
                        </Fragment>
                    );
                })}
            </div>
        );
    },
    k6: () => (
        <>
            {rated("k6", [...platformRows, ...otherRows("k6")], {
                selectable: true,
                selected: answers.k6 ?? [],
                onSelect: (row, on) => write({ ...answers, k6: on ? [...(answers.k6 ?? []), row] : (answers.k6 ?? []).filter(entry => entry !== row) })
            })}
            {otherTick("k6")}
        </>
    ),
    k7: () => rated("k7", COMPETITOR_STAGES),
    k8: () => rated("k8", valueRows),
    k9: () => rated("k9", changeRows),
    k10: () => (
        <div className="radio-choice legal-entity-radio-stack" role="group" aria-label={words("k10")}>
            <BusinessTicks name={words("k10")} disabled={disabled} options={shownOpenings(openings, openingTicks)} chosen={openingTicks} max={3} onChange={(next) => write({ ...answers, k10: next })} />
        </div>
    )
    };
    const INFO: Partial<Record<CompetitorQuestionId, readonly string[]>> = {
    k6: [...COMPETITOR_INFO.k6, ...REVIEW_PLATFORM_EXAMPLES],
    k8: valuesBanded ? [...COMPETITOR_INFO.k8, COMPETITOR_BAND_LINE] : COMPETITOR_INFO.k8,
    k10: [...COMPETITOR_INFO.k10, ...hardToBeat(competitor.name, answers, context)]
    };
    /** One question: its words (by type) with its "i" (and its limit) over its control. */
    const question = (id: CompetitorQuestionId) => (
    <FieldRow
        key={id}
        pair
        fullList
        label={words(id)}
        info={[...(id in COMPETITOR_RATINGS ? [ratingScaleMeaning(COMPETITOR_RATINGS[id as keyof typeof COMPETITOR_RATINGS])] : []), ...(INFO[id] ?? COMPETITOR_INFO[id])]}
        labelNote={id === "k10" ? <span className="business-foundation-tick-note">3 max</span> : undefined}
    >
        {controls[id]()}
    </FieldRow>
    );
    /**
     * A question standing alone in a group (K8 to K10): its bands straight under the group's title band, as the Profile's Needs are (one band pattern on every card: the first
     * band untinted, the next tinted, the Notes the next tint). Not in a box: a box's first band is its own title band.
     */
    const band = (content: ReactNode | null, note?: ReactNode) => (
        <SingleColumn>
            {content && <div className="legal-entity-org-section">{content}</div>}
            {note && <div className={"legal-entity-org-section business-note-band" + (content ? " legal-entity-org-band" : "")}>{note}</div>}
        </SingleColumn>
    );

    return card(
    {
        kind: "Competitor",
        ariaPrefix: segmentPath,
        number: index + 1,
        name: competitor.name,
        onName: (next) => change({ name: next }),
        key: competitor.id,
        summary: summaryText(
            chosen?.label
        ),
        // The five Types, each shown with the explanation the specification gives it. Under the name, from its box's edge.
        headRow: labelled(
            "Type",
            <OptionPicker
                label={segmentPath + ", Competitor " + (index + 1) + " type"}
                hug
                options={BUSINESS_COMPETITOR_TYPES.map(
                    type => type.label
                )}
                disabled={disabled}
                value={chosen ? chosen.label : ""}
                onChange={(next) => change({
                    type: BUSINESS_COMPETITOR_TYPES.find(
                        type => type.label === next
                    )?.id ?? ""
                })}
            />,
            SUBSECTIONS.competitors.type
        ),
        actions: segment.competitors.length > 1 &&
            remove(
                "Competitor " + (index + 1),
                () => updateSegment(segmentIndex, {
                    competitors: segment.competitors.filter(
                        (_candidate, position) =>
                            position !== index
                    )
                })
            )
    },
    <>

        {/* What this TYPE of competitor is asked (doc 41, K1 to K7, COMPETITOR_TYPE_QUESTIONS for the boxes): each box asks its questions as bands and keeps its built text as the note. */}
        {description(
            whose,
            competitorParts(competitor.type).map(part => {
                const questions = (PART_QUESTIONS[part.id] ?? []).filter(id => competitorAsks(competitor.type, id, { stage: identity?.stage })).map(question);
                return {
                    ...part,
                    extra: part.id === "experience" ? [COMPETITOR_EXPERIENCE_HOW] : part.extra,
                    questions,
                    note: true,
                    placeholder: NOTE_PLACEHOLDERS[part.id],
                    level: 4,
                    weight: 2 + questions.length * 4
                };
            }),
            competitor.description,
            (next) => change({ description: next }),
            true,
            undefined,
            groupFold(competitor.id, "Description", whose),
            true
        )}


        {group("SWOT Analysis", <>

        {/* K8, one band over Strengths and Weaknesses; K9, one over Opportunities and Threats (doc 41): the built boxes stay as the notes. */}
        {/* One Notes under each rating (owner, 2026-11-05): what no rating says, kept under `strengths` and `opportunities`. */}
        {band(question("k8"), (
            <OptionalNote
                label="Notes"
                fieldId="strengths and weaknesses notes"
                ariaLabel={whose + " strengths and weaknesses notes"}
                placeholder={NOTE_PLACEHOLDERS.strengths ?? "Add a note"}
                disabled={disabled}
                value={competitor.strengths}
                onChange={(next) => change({ strengths: next })}
            />
        ))}

        {band(question("k9"), (
            <OptionalNote
                label="Notes"
                fieldId="opportunities and threats notes"
                ariaLabel={whose + " opportunities and threats notes"}
                placeholder={NOTE_PLACEHOLDERS.opportunities ?? "Add a note"}
                disabled={disabled}
                value={competitor.opportunities}
                onChange={(next) => change({ opportunities: next })}
            />
        ))}

        </>, undefined, groupFold(competitor.id, "SWOT Analysis", whose))}

        {/* What the SWOT above it was for, so
            it is titled like the SWOT rather
            than labelled like one more field
            inside it. K10 above the text: openings drawn from the answers above (doc 41). */}
        {/* "Insights" (2026-11-09): the Differentiation is the Segment's, once, under its Competitors (K14); the Business Plan's table says Insights too. */}

        {group(
            "Insights",
            // K10 untinted under the title band, then the Insights in a Notes field, the note band, the next tint (owner, 2026-11-10: "replace the free text
            // to a Note field. It does not need Add to text option").
            band(openings.length > 0 ? question("k10") : null, (
                <OptionalNote
                    label="Notes"
                    fieldId="insights notes"
                    ariaLabel={whose + " insights"}
                    placeholder="Add a note"
                    disabled={disabled}
                    value={competitor.insights}
                    onChange={(next) => change({ insights: next })}
                />
            )),
            asked.insights === undefined
                ? SUBSECTIONS.competitors.insights
                : [asked.insights],
            // A section band as the Description's and the SWOT's (owner, 2026-11-04), with their fold.
            groupFold(competitor.id, "Insights", whose)
        )}

    </>
    );

}

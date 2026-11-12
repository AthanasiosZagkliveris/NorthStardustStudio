/**
 * THE CARDS AND SUBSECTIONS: the remove and add buttons, the target-audience note and the four subsections.
 * One part of BusinessFoundationEditor (see BusinessFoundationEditor.tsx): what it needs of the parts before it comes in as `earlier`; what the parts after it need goes out.
 */
import ListStatic from "../../fields/ListStatic.tsx";
import { Fragment, ReactNode, useState } from "react";
import FieldLabel from "../../../controls/FieldLabel.tsx";
import { BusinessCustomerProfileValue, BusinessCustomerSegmentValue, BusinessOfferingValue, businessSegmentFunctionalItems, functionalNeedIds, reconcileLineIds, createBusinessCompetitor, createBusinessCustomerProfile, createBusinessOffering } from "../../../../framework/engine/AnswerUtils.ts";
import { randomId } from "../../../../framework/engine/Readers.ts";
import FieldRow from "../../fields/FieldRow.tsx";
import { BusinessAddButton, BusinessCard, BusinessEmpty, BusinessRemove, BusinessTicks, OptionalNote } from "../../cards/BusinessCardFields.tsx";
import RadioChoice from "../../../controls/RadioChoice.tsx";
import RatingScale, { type Rating } from "../../../controls/RatingScale.tsx";
import { ratingScaleMeaning } from "../../../controls/RatingScaleEnds.tsx";
import RatingScaleGroup from "../../../controls/RatingScaleGroup.tsx";
import TextLink from "../../fields/TextLink.tsx";
import { draftToAdd, differentiationSourceCards, namesInSentence } from "../../../../framework/engine/CompetitorQuestions.ts";
import FittingRadioChoice from "./FittingRadioChoice.tsx";
import { type OfferingContext, draftOffered, valuePropositionDraft, valuePropositionOpenItems } from "../../../../framework/engine/OfferingQuestions.ts";
import { effectiveOfferingAnswers, effectiveProfileAnswers, effectiveProfileUserAnswers, offeringContextOf, withFieldSet } from "../../../../framework/engine/EffectiveAnswers.ts";
import NumberCell from "../../../controls/NumberCell.tsx";
import { type ProfileBox, type ProfilePart, type ProfileQuestion, DUAL_USER, OWN_TASKS_INFO, PROFILE_NOTE_HINTS, profileAgeRange, profileChoose, profileOutcomeLimit, profileRate, profileRatings, profileWho, profileQuestionsOf, profileSettle, profileUserAgeRange, profileUserQuestionsOf, profileUserSettle, profileUserWho, profileUserName, profileOptionsShown, proposedBusinessProfiles, segmentNeedTicks } from "../../../../framework/engine/ProfileQuestions.ts";
import { type SegmentBox, type SegmentQuestion, SEGMENT_QUESTIONS, segmentChoose, segmentOptions, segmentQuestionsOf, segmentRowChoice, segmentSettle, segmentSettledNotes } from "../../../../framework/engine/SegmentQuestions.ts";
import { DIFFERENTIATIONS, INFO as POSITIONING_INFO, choiceLimit, differentiationOptionsFor, stageLimitLine, userOutcomeOptionsFor, withStageLine } from "../legal/shared.tsx";
import InfoNote, { InfoPoint, InfoText } from "../../fields/InfoNote.tsx";
import { OPEN_EVENT, type OpenRequest } from "../../tiles/SectionTiles.tsx";
import { land } from "../../tiles/jumpTo.ts";
import NumberedListInput from "../../fields/NumberedListInput.tsx";
import StrategyTextArea from "../../fields/StrategyTextArea.tsx";
import { BusinessNeedKind, DescriptionPart, OPTIONAL_DESCRIPTION_PART, SUBSECTIONS, SingleColumn, otherProfileNeeds } from "./shared.tsx";
import { BUSINESS_AUDIENCE, PEOPLE_AUDIENCE, audienceLine, segmentContextFor, segmentFrame, segmentPositioningShown } from "./identityLink.ts";
import type { useFoundationState } from "./useFoundationState.tsx";
import { competitorCard } from "./CompetitorCard.tsx";
import { offeringCard } from "./OfferingCard.tsx";

type Earlier = ReturnType<typeof useFoundationState>;

/** The head of one Profile, Competitor or Offering card (see `card` below). */
export interface FoundationCardHead {
    kind: string;
    number: number;
    name: string;
    onName: (next: string) => void;
    key: string;
    actions?: ReactNode;
    /** "Segment 2": which Segment the card belongs to. */
    ariaPrefix?: string;
    /** The one line shown in the head while the card is folded. */
    summary?: string;
    /** A field under the name, from the name box's edge (see BusinessCard). */
    headRow?: ReactNode;
}

/** What a Competitor's or an Offering's card reads of its Segment and of the page (CompetitorCard.tsx, OfferingCard.tsx). */
export interface FoundationCardScope extends Pick<Earlier, "description" | "disabled" | "group" | "groupFold" | "identity" | "labelled" | "updateSegment"> {
    card: (head: FoundationCardHead, children: ReactNode) => ReactNode;
    remove: (what: string, onRemove: () => void) => ReactNode;
    segment: BusinessCustomerSegmentValue;
    segmentEndsUser: boolean;
    segmentIndex: number;
    segmentPath: string;
}

/** K14's "i": how it links to K10 (doc 41). */
/**
 * EACH DIFFERENTIATION'S OWN "i" (owner, 2026-11-10: "put the options in the question's sequence and place the related i next to each option"): its line of the
 * Positioning "i" (the line that starts with its name), beside it; the question's "i" keeps what is said of them all.
 */
const DIFFERENTIATION_LINES = POSITIONING_INFO.differentiation.filter((point): point is string => typeof point === "string" && DIFFERENTIATIONS.some(option => point.startsWith(option.label + " ") || point.startsWith(option.label + ":")));
const differentiationMeaning = (label: string): InfoPoint[] | undefined => {
    const line = DIFFERENTIATION_LINES.find(point => point.startsWith(label + " ") || point.startsWith(label + ":"));
    return line ? [line] : undefined;
};
const DIFFERENTIATION_SHARED = POSITIONING_INFO.differentiation.filter(point => !(DIFFERENTIATION_LINES as InfoPoint[]).includes(point));

/**
 * A competitor named under a Differentiation opens its card, at the question its ticks came from, "What could you do differently?" (owner, 2026-11-10: "Link the
 * competitors listed under each Differentiation option to their related field").
 */
function openCompetitorOpenings(cardId: string) {
    document.dispatchEvent(new CustomEvent<OpenRequest>(OPEN_EVENT, { detail: { card: cardId } }));
    // (Lands as soon as the card has drawn the question, looked for every 40 ms for up to 3 s: no fixed wait.)
    const started = Date.now();
    const look = () => {
        const field = [...document.querySelectorAll<HTMLElement>(".floating-card-host [data-field-key]")].find(element => /what-could-you-do-differently$/.test(element.dataset.fieldKey ?? ""));
        if (!field) {
            if (Date.now() - started < 3000) {
                window.setTimeout(look, 40);
            }
            return;
        }
        // (The question's pair is drawn by its children: what shows it is brought into view, in the card's own scroll; land frames it.)
        const shown = getComputedStyle(field).display !== "contents" ? field : field.parentElement ?? field;
        shown.scrollIntoView({ block: "center" });
        land(field);
        window.setTimeout(() => shown.scrollIntoView({ block: "center" }), 300);
    };
    look();
}

const DIFFERENTIATION_FROM_OPENINGS = "Started from the openings you ticked on your Competitors (What could you do differently?); change it freely.";

/**
 * The exact age of a Profile (A1). What is typed stays in the cell while it is typed: the age is settled against the Segment's age group (an age outside it is cleared), and a first digit
 * such as the 4 of 45 is outside a group of 40 to 54, so settling at every key made the number impossible to write. The cell holds a draft while it has the focus; leaving it settles.
 */
function ProfileAgeCell({ value, label, disabled, onType, onDone }: { value: string; label: string; disabled?: boolean; onType: (typed: string) => void; onDone: () => void }) {
    const [draft, setDraft] = useState<string | null>(null);
    return (
        <NumberCell
            kind="int"
            className="business-capability-people business-profile-age"
            aria-label={label}
            disabled={disabled}
            value={draft ?? value}
            onChange={(event) => {
                const typed = event.target.value.replace(/\D/g, "").slice(0, 3);
                setDraft(typed);
                onType(typed);
            }}
            onBlur={() => {
                setDraft(null);
                onDone();
            }}
        />
    );
}

export function useFoundationSubsections(earlier: Earlier) {

    const { built, description, disabled, folds, forceOpen, group, groupFold, labelled, targetAudience, identity, updateProfile, updateSegment } = earlier;

    /** The delete control every card on this page carries. */
    function remove(what: string, onRemove: () => void) {
        return (
            <BusinessRemove what={what} onRemove={onRemove} disabled={disabled} />
        );
    }
    /**
     * One input card: its head, and its fields when it is open.
     *
     * Built the way the Strategic Period page builds its Theme,
     * Goal and Objective boxes: the toggle, the number ("1.") in a
     * .strategy-box-number, THE NAME ASKED in the head itself
     * (CardNameInput), then the card's controls.
     *
     * The name is asked once, in the one place it is also read, and
     * stays legible while the card is folded shut.
     *
     * The Segment's own card is built inline in the render below --
     * it is a grid rather than a stack, because it holds the four
     * subsections side by side -- but its head is this same head.
     */
    function card(
        {
            kind,
            number,
            name,
            onName,
            key,
            actions = null,
            ariaPrefix,
            summary,
            headRow
        }: FoundationCardHead,
        children: ReactNode
    ) {

        // Every card this helper builds is a Profile, Competitor or
        // Offering -- the three item kinds -- so all three fold
        // through the shared `folds` state (see useItemFolds). The
        // Segment card that holds them is built inline below and
        // stays on `collapsed`.
        const node = (
            <BusinessCard
                key={key}
                anchor={key}
                kind={kind}
                number={number}
                name={name}
                onName={onName}
                ariaPrefix={ariaPrefix}
                open={forceOpen.current || folds.isOpen(key)}
                onToggle={forceOpen.current ? undefined : () => folds.toggle(key)}
                actions={actions}
                disabled={disabled}
                summary={summary}
                headRow={headRow}
            >
                {children}
            </BusinessCard>
        );
        built.set(key, node);
        return node;

    }
    function addButton(label: string, onAdd: () => void, span = false) {
        return (
            <BusinessAddButton label={label} onAdd={onAdd} disabled={disabled} span={span} />
        );
    }
    /*
        What the "i" on the first instruction shows: the Target
        Audience as written, or where to go and write it. A note
        that opened empty would answer a question with silence.
    */
    const targetAudienceNote: InfoPoint[] = [
        targetAudience.trim().length > 0
            ? targetAudience.trim()
            : "Nothing recorded yet. Write it under 1. Identity System → 1. Definition → Positioning."
    ];
    /**
     * The four subsection headings and their guidance -- the same
     * for every Segment, which is why they sit above the process
     * line and outside the input cards.
     */
    const heads = [
        {
            number: 1,
            title: "Customer Segment and Profile",
            instructions: SUBSECTIONS.segments.instructions,
            note: { label: "Your Positioning (Identity)", points: targetAudienceNote }
        },
        {
            number: 2,
            title: "Competitor and Alternative",
            instructions: SUBSECTIONS.competitors.instructions,
            // Who you are compared with follows from where you stand.
            note: { label: "Your Positioning (Identity)", points: targetAudienceNote }
        },
        // The Offering before the Value Proposition (owner, 2026-11-08): the Value Proposition is drafted from what the three before it hold.
        {
            number: 3,
            title: "Offering",
            instructions: SUBSECTIONS.offerings.instructions,
            note: null
        },
        {
            number: 4,
            title: "Value Proposition",
            instructions: SUBSECTIONS.valueProposition.instructions,
            note: null
        }
    ];
    /**
     * One Segment's answers, as the pieces its card lays out.
     *
     * Everything this section asks is asked about a Segment, so
     * this is the whole of the input: the Segment and its Profiles,
     * the competitors facing it, the one promise made to it, and
     * the Offerings sold to it.
     *
     * Named pieces rather than a list of four, because they are no
     * longer four equal columns: the Segment's own Description runs
     * the width of the card, and the promise made to a Segment sits
     * above the Offerings that have to keep it.
     */
    function subsectionsFor(
        segment: BusinessCustomerSegmentValue,
        segmentIndex: number
    ) {

        /* ---- The Segment's own Description ---- */

        const segmentPath = "Segment " + (segmentIndex + 1);

        // The boxes follow the Seller and Buyer Relationship (Identity): people only asks Demographics (not Business Data); businesses only asks Business Data (not Demographics) and
        // asks it without the tick; otherwise (nothing chosen, or several) every box stands, as before. The audience chosen in Identity is added to the "i" of the box it belongs to.
        const frame = segmentFrame(identity);
        const asked = segmentContextFor(identity, segment.description[OPTIONAL_DESCRIPTION_PART] !== undefined);
        // (The Competitor cards name their type's own `asked`: the Segment's end user is read through this.)
        const segmentEndsUser = asked.endsUser;

        // The questions that left Positioning for the Segment (owner, 2026-11-08): the Differentiation (K14, under the Competitors) and the end user's outcome (End user, 9). The Positioning
        // answer saved before starts each where the Segment has none saved (segmentPositioningShown); the business stage sets their limit, and they keep Positioning's order and "i".
        // (Where Positioning saved none, the Differentiation starts from the Competitors' K10 ticks, through the crosswalk: doc 41, K14.)
        const shownAnswers = segmentPositioningShown(segment.questions, identity, asked, segment.competitors);
        // (Beside each Differentiation the K10 ticks argue for, the competitors it came from: owner, 2026-11-09.)
        const sources = differentiationSourceCards(segment.competitors);
        // (A bullet list under the option, a competitor a line; owner, 2026-11-10: "under its option make a bullet list".)
        const sourceNote = (id: string) => sources[id]?.length
            ? <span className="business-foundation-tick-source-list">{sources[id].map(card => <span key={card.name}>{card.id ? <TextLink onClick={() => openCompetitorOpenings(card.id)}>{card.name}</TextLink> : card.name}</span>)}</span>
            : undefined;
        const sourceText = (id: string) => sources[id]?.length ? "from " + namesInSentence(sources[id].map(card => card.name)) : undefined;
        const positioningOrder = { customerType: identity?.relationships ?? [], audience: identity?.audience ?? [], buyerCategory: identity?.buyerCategory ?? [], endUser: identity?.endUser ?? [], purpose: identity?.purpose ?? [] };
        const stageLimit = choiceLimit(asked.stage, "outcome");

        /** One question of a box, as the Positioning card asks one: its label with its "i" (and its limit) over the radio or the ticks, settled against what the other answers and Identity allow. */
        const questionOf = (question: SegmentQuestion) => {
            const chosen = shownAnswers[question.id] ?? [];
            // (K14 stands under its section's title, "Differentiation": its label asks the question rather than repeating the title.)
            const label = question.id === "differentiation" ? "How will you stand apart?" : question.label;
            // (K14's options in the question's own order, Positioning's (owner, 2026-11-10: "put the options in the question's sequence"), each with its "i" and the competitors it came from.)
            const options = question.id === "differentiation" ? differentiationOptionsFor(positioningOrder, chosen).map(option => ({ ...option, info: differentiationMeaning(option.label), note: sourceNote(option.id), noteText: sourceText(option.id) }))
                : question.id === "u-outcome" ? userOutcomeOptionsFor(positioningOrder)
                    : segmentOptions(question, segment.questions, asked);
            // (On a radio, the note stands in the option's words: its accessible name says both.)
            const radioOptions = (options as readonly { id: string; label: string; info?: InfoPoint[]; note?: ReactNode; noteText?: string }[]).map(option => option.note || option.info ? { ...option, label: <>{option.info ? <InfoText text={option.label}><InfoNote label={option.label} points={option.info} fullList /></InfoText> : option.label}{option.note && <span className="business-foundation-tick-source">{option.note}</span>}</>, name: option.label + (option.noteText ? ", " + option.noteText : "") } : option);
            const choose = (next: string[]) => updateSegment(segmentIndex, {
                questions: segmentSettle(segmentChoose(question, segment.questions, next), asked)
            });
            // (A question from Positioning: one choice is a radio, several are ticks that lock at the stage's limit, as on Positioning.)
            const max = question.fromPositioning ? stageLimit ?? undefined : question.max;
            const radio = question.fromPositioning && stageLimit === 1 && chosen.length <= 1;
            const info: InfoPoint[] = question.rating ? [ratingScaleMeaning(question.rating), ...question.info]
                : question.fromPositioning ? withStageLine(question.id === "differentiation" ? [DIFFERENTIATION_SHARED[0], DIFFERENTIATION_FROM_OPENINGS, ...DIFFERENTIATION_SHARED.slice(1)] : question.info, stageLimitLine(asked.stage, stageLimit))
                    : [...question.info];
            return (
                <FieldRow
                    key={question.id}
                    pair
                    fullList
                    label={label}
                    info={info}
                    labelNote={max !== undefined && !radio ? <span className="business-foundation-tick-note">{max + " max"}</span> : undefined}
                >
                    {question.rating
                        // A degree is a rating from 1 to 5 (doc 35): its end words over its rounds; pressing the chosen round again clears it.
                        ? (
                            <RatingScale
                                label={label}
                                name={segment.id + "-" + question.id}
                                disabled={disabled}
                                value={chosen[0] ? Number(chosen[0]) as Rating : undefined}
                                onChange={(next) => choose(next ? [String(next)] : [])}
                                lowLabel={question.rating.low}
                                highLabel={question.rating.high}
                            />
                        )
                        : question.many && !radio
                        ? (
                            <div className="radio-choice legal-entity-radio-stack" role="group" aria-label={label}>
                                <BusinessTicks name={label} disabled={disabled} options={options} chosen={chosen} max={max} onChange={choose} />
                            </div>
                        )
                        : (
                            segmentRowChoice(question, options)
                                ? (
                                    <FittingRadioChoice
                                        label={label}
                                        group={segment.id + "-" + question.id}
                                        disabled={disabled}
                                        value={chosen[0] ?? ""}
                                        onChange={(next) => choose([next])}
                                        options={options}
                                    />
                                )
                                : (
                                    <RadioChoice
                                        label={label}
                                        group={segment.id + "-" + question.id}
                                        className="legal-entity-radio-stack"
                                        disabled={disabled}
                                        value={chosen[0] ?? ""}
                                        onChange={(next) => choose([next])}
                                        options={radioOptions}
                                    />
                                )
                        )}
                </FieldRow>
            );
        };
        const settledNotes = (box: SegmentBox) => segmentSettledNotes(box, segment.questions, asked);
        const questionsOf = (box: SegmentBox) => {
            const notes = settledNotes(box);
            const list = segmentQuestionsOf(box, segment.questions, asked).map(questionOf);
            // (What Positioning or the answers above have set is said in one line, in the small note style the cards already use, so a hidden answer is never a silent one.)
            return notes.length > 0
                ? [<span key="settled" className="business-foundation-tick-note business-segment-settled">{"Set for you from Positioning and your answers above: " + notes.join("; ") + "."}</span>, ...list]
                : list;
        };
        /** A box's height in lines: its title, and each question's label and options. */
        const weightOf = (box: SegmentBox) => 2 + segmentQuestionsOf(box, segment.questions, asked).reduce((sum, question) => sum + 2 + (question.rating ? 2 : segmentOptions(question, segment.questions, asked).length), 0);

        const segmentParts: DescriptionPart[] = SUBSECTIONS.segments.segmentDescription
            // (A Segment is one group: a business Segment has no Demographics, a people Segment no Business Data.)
            .filter(part => !((asked.frame === "people" && part.id === OPTIONAL_DESCRIPTION_PART) || (asked.frame === "business" && part.id === "demographics")))
            .map(part => part.id === "demographics"
                ? { ...part, extra: [...SUBSECTIONS.segments.boxNotes[part.id], ...audienceLine(identity, PEOPLE_AUDIENCE)], questions: questionsOf("demographics"), weight: weightOf("demographics") }
                : part.id === OPTIONAL_DESCRIPTION_PART
                    ? { ...part, extra: [...SUBSECTIONS.segments.boxNotes[part.id], ...audienceLine(identity, BUSINESS_AUDIENCE)], always: true, questions: questionsOf("business-data"), weight: weightOf("business-data") }
                    : { ...part, extra: SUBSECTIONS.segments.boxNotes[part.id], questions: questionsOf(part.id as SegmentBox), weight: weightOf(part.id as SegmentBox) })
            // A business buyer's Business Data comes before Geographics.
            .sort((a, b) => asked.frame === "business"
                ? Number(b.id === OPTIONAL_DESCRIPTION_PART) - Number(a.id === OPTIONAL_DESCRIPTION_PART)
                : 0);

        // Where Positioning chose both relationships the first two Segments are made for the user, the first of people (B2C) and the second of businesses (B2B), and are not asked; a Segment added after
        // them asks who its customer is, as the one question that opens its first box. (The choice is kept as the presence of the Business Data key.)
        if (frame === "open" && segmentIndex >= 2 && segmentParts.length > 0) {
            const isBusiness = segment.description[OPTIONAL_DESCRIPTION_PART] !== undefined;
            const kindOptions = [{ id: "people", label: "People (B2C)" }, { id: "business", label: "Businesses (B2B)" }];
            const kindQuestion = (
                <FieldRow
                    key="kind"
                    pair
                    fullList
                    label="Who is this Segment's customer?"
                    info={["The Segment is one group: people, or businesses.", "Choosing one changes the questions asked and removes the answers to questions that drop away."]}
                >
                    <FittingRadioChoice
                        label="Who is this Segment's customer?"
                        group={segment.id + "-kind"}
                        disabled={disabled}
                        value={isBusiness ? "business" : "people"}
                        onChange={(next) => {
                            const description = { ...segment.description };
                            if (next === "business") {
                                description[OPTIONAL_DESCRIPTION_PART] = description[OPTIONAL_DESCRIPTION_PART] ?? "";
                            } else {
                                delete description[OPTIONAL_DESCRIPTION_PART];
                            }
                            updateSegment(segmentIndex, { description, questions: segmentSettle(segment.questions, segmentContextFor(identity, next === "business")) });
                        }}
                        options={kindOptions}
                    />
                </FieldRow>
            );
            segmentParts[0] = { ...segmentParts[0], questions: [kindQuestion, ...(segmentParts[0].questions ?? [])], weight: (segmentParts[0].weight ?? 0) + 3 };
        }

        // The user of a Proxy or Dual-Intent buyer: described in the same card, right after who the buyer is (owner, 2026-11-08, P9a): after Demographics, or after Business Data
        // for a business Segment.
        if (asked.endsUser) {
            const after = segmentParts.findIndex(part => part.id === "demographics" || part.id === OPTIONAL_DESCRIPTION_PART);
            segmentParts.splice(after + 1, 0, {
                id: "user",
                title: "End user",
                text: "Who uses what the buyer buys?",
                extra: SUBSECTIONS.segments.boxNotes.user,
                questions: questionsOf("user"),
                weight: weightOf("user"),
                withFirst: true
            });
        }

        const segmentDescription = description(
            segmentPath,
            segmentParts,
            segment.description,
            (next) => updateSegment(segmentIndex, { description: next }),
            true,
            segment.id
        );

        /* ---- 1. Its Profiles ---- */

        /**
         * One question of a Profile box: as the Segment's are drawn (a radio, ticks or the number of the age), against what the Segment answered. `part` says where it stands and is
         * kept (doc 36, 2.1): "buyer" (a Direct Segment's one person too) and "user" (E1, E2 and the Needs in the end user's part) are kept in `questions`; "own", the end user's own
         * answers (A1, A7, A8, E4), in `user.questions`. The end user's questions are written of the end user.
         */
        const profileQuestionOf = (profile: BusinessCustomerProfileValue, profileIndex: number, shown: Record<string, string[]>, question: ProfileQuestion, part: "buyer" | "user" | "own" = "buyer") => {
            const own = part === "own";
            // (The end user's A1 and A7 stand on the same card as the buyer's: their names differ.)
            const group = profile.id + (own ? "-user-" : "-") + question.id;
            // (The end user's part names the end user by the relationship, "the child"; a Dual-Intent Segment asks E1, E2 and the Needs of a typical user, the buyer using it too: 2026-11-09.)
            const label = part === "buyer" ? profileWho(question.label, shown.a2?.[0]) : profileUserWho(question.label, part === "user" && asked.dual ? DUAL_USER : profileUserName(asked));
            const ageRange = question.number ? (own ? profileUserAgeRange(segment.questions, asked) : profileAgeRange(segment.questions)) : null;
            const chosen = shown[question.id] ?? [];
            // Only this field is saved (with its ratings and Other); every other field keeps following its start (docs 36 and 43; owner, 2026-11-08).
            const saved = (own ? profile.user?.questions : profile.questions) ?? {};
            const settle = (answers: Record<string, string[]>) => own ? profileUserSettle(answers, shownAnswers, asked) : profileSettle(answers, segment.questions, asked);
            // (A Profile whose Segment has no end user any more loses its end user's part with its next answer: doc 36, 2.2.)
            const put = (answers: Record<string, string[]>) => updateProfile(segmentIndex, profileIndex, own ? { user: { ...profile.user, questions: answers } } : { questions: answers, ...(!asked.endsUser && profile.user ? { user: undefined } : {}) });
            const write = (next: Record<string, string[]>) => put(settle(withFieldSet(saved, next, question.id)));
            const choose = (next: string[]) => write(profileChoose(question, shown, next));
            // The end user's outcome (E4): ordered as on Positioning, its limit the stage's, one choice a radio while only one is allowed (as the Segment's End user, 9 was).
            const outcome = own && question.id === "outcome";
            const stageMax = outcome ? profileOutcomeLimit(asked) ?? undefined : undefined;
            const max = outcome ? stageMax : question.max;
            const radio = outcome && stageMax === 1 && chosen.length <= 1;
            // (Tailored and ordered by the answers, never locked: a minor end user's goals and frustrations, the household by the relationship, the worries by B1; profileOptionsShown.)
            const options = (outcome ? userOutcomeOptionsFor(positioningOrder) : own ? question.options : profileOptionsShown(question, segment.questions, asked, shown)).map(option => ({ ...option }));
            const info: InfoPoint[] = question.rating ? [ratingScaleMeaning(question.rating), ...question.info]
                : outcome ? withStageLine(question.info, stageLimitLine(asked.stage, stageMax ?? null))
                    : [...question.info];
            return (
                <FieldRow
                    key={question.id}
                    pair
                    fullList
                    label={label}
                    info={info}
                    labelNote={max !== undefined && !radio ? <span className="business-foundation-tick-note">{max + " max"}</span> : question.number && ageRange ? <span className="business-foundation-tick-note">{ageRange[1] >= 130 ? ageRange[0] + " or older" : ageRange[0] + "–" + (ageRange[1] - 1)}</span> : undefined}
                >
                    {question.number
                        // (A number stands beside its label, on the label's line, at the right end of the band: see .business-profile-age.)
                        ? (
                            <ProfileAgeCell
                                label={label}
                                disabled={disabled}
                                value={chosen[0] ?? ""}
                                onType={(typed) => put(typed ? { ...settle({ ...saved, [question.id]: [typed] }), [question.id]: [typed] } : settle({ ...saved, [question.id]: [] }))}
                                onDone={() => write(shown)}
                            />
                        )
                        : question.rating && !question.many
                            // A degree (the end user's online comfort, A8): a rating from 1 to 5, as the Segment's; pressing the chosen round again clears it.
                            ? (
                                <RatingScale
                                    label={label}
                                    name={group}
                                    disabled={disabled}
                                    value={chosen[0] ? Number(chosen[0]) as Rating : undefined}
                                    onChange={(next) => choose(next ? [String(next)] : [])}
                                    lowLabel={question.rating.low}
                                    highLabel={question.rating.high}
                                />
                            )
                        : outcome && radio
                            ? <RadioChoice label={label} group={group} className="legal-entity-radio-stack" disabled={disabled} value={chosen[0] ?? ""} onChange={(next) => write({ ...shown, [question.id]: [next] })} options={options} />
                        : outcome
                            ? (
                                <div className="radio-choice legal-entity-radio-stack" role="group" aria-label={label}>
                                    <BusinessTicks name={label} disabled={disabled} options={options} chosen={chosen} max={max} onChange={(next) => write({ ...shown, [question.id]: next })} />
                                </div>
                            )
                        : question.rating
                            // Ticked, then each tick rated from 1 to 5 (doc 36, section 11): the limit holds the ticks; an untick takes its rating with it (profileSettle).
                            ? (
                                <RatingScaleGroup
                                    label={label}
                                    name={group}
                                    rows={options.map(option => ({ id: option.id, label: option.label }))}
                                    values={profileRatings(shown, question)}
                                    selectable
                                    selected={chosen}
                                    onSelect={(id, on) => {
                                        if (on && question.max !== undefined && chosen.length >= question.max) {
                                            return;
                                        }
                                        write(profileChoose(question, shown, on ? [...chosen, id] : chosen.filter(entry => entry !== id)));
                                    }}
                                    onChange={(id, next) => write(profileRate(question, shown, id, next))}
                                    lowLabel={question.rating.low}
                                    highLabel={question.rating.high}
                                    disabled={disabled}
                                />
                            )
                        : question.many
                            ? (
                                <>
                                    <div className="radio-choice legal-entity-radio-stack" role="group" aria-label={label}>
                                        <BusinessTicks name={label} disabled={disabled} options={options} chosen={chosen} max={question.max} onChange={choose} />
                                    </div>
                                    {question.other && chosen.includes("other") && (
                                        <StrategyTextArea
                                            className="interview-input business-foundation-note"
                                            ariaLabel={label + " Other"}
                                            disabled={disabled}
                                            value={shown[question.id + "-other"]?.[0] ?? ""}
                                            onChange={(next) => write({ ...shown, [question.id + "-other"]: [next] })}
                                        />
                                    )}
                                </>
                            )
                            : segmentRowChoice({ ...question, box: "demographics" } as unknown as SegmentQuestion, options)
                                ? <FittingRadioChoice label={label} group={group} disabled={disabled} value={chosen[0] ?? ""} onChange={(next) => choose([next])} options={options} />
                                : <RadioChoice label={label} group={group} className="legal-entity-radio-stack" disabled={disabled} value={chosen[0] ?? ""} onChange={(next) => choose([next])} options={options} />}
                </FieldRow>
            );
        };
        /** The boxes of a Profile's Description, each with its questions and its note, and the ones the Segment leaves no question in are plain notes. */
        const profileParts = (profile: BusinessCustomerProfileValue, profileIndex: number): DescriptionPart[] => {
            const shown = effectiveProfileAnswers(profile, segment, identity);
            return SUBSECTIONS.segments.profileDescription.map(({ textBusiness, ...part }: { id: string; title: string; text: string; textBusiness?: string }) => ({
                ...part,
                // The Personal box's prompt says what it asks (owner, 2026-11-03): a B2B Profile is asked its job level and role in buying, not its household.
                text: asked.frame === "business" && textBusiness ? textBusiness : part.text,
                note: true,
                level: 4,
                extra: [PROFILE_NOTE_HINTS[part.id as ProfileBox]],
                questions: profileQuestionsOf(part.id as ProfileBox, segment.questions, asked).map(question => profileQuestionOf(profile, profileIndex, shown, question)),
                weight: 2 + profileQuestionsOf(part.id as ProfileBox, segment.questions, asked).length * 4
            }));
        };
        /**
         * The Motivations as boxes built as the Description's are: a title band with its "i", then the box's question as a band, then its own note. They stand in the one grid the Description's
         * boxes stand in (one column), which is also what keeps them in the card's content column.
         */
        const motivations = (profile: BusinessCustomerProfileValue, profileIndex: number) => {
            const boxes: { box: ProfileBox; title: string; info: InfoPoint[]; text: string; field: "goals" | "challenges" | "objections" }[] = [
                { box: "goals", title: "Goals & Desires", info: [...SUBSECTIONS.segments.motivations.goals, PROFILE_NOTE_HINTS.goals], text: profile.goals, field: "goals" },
                { box: "challenges", title: "Challenges & Problems", info: [...SUBSECTIONS.segments.motivations.challenges, PROFILE_NOTE_HINTS.challenges], text: profile.challenges, field: "challenges" },
                { box: "objections", title: "Objections", info: [...SUBSECTIONS.segments.motivations.objections, PROFILE_NOTE_HINTS.objections], text: profile.objections, field: "objections" }
            ];
            const shown = effectiveProfileAnswers(profile, segment, identity);
            return (
                <SingleColumn>
                        {boxes.map((entry, at) => (
                            <Fragment key={entry.box}>
                                {at > 0 && <div className="business-capability-card-rule legal-entity-org-rule business-capability-card-rule-double" role="separator" />}
                                <div className="business-segment-box">
                                    <div className="legal-entity-org-section">
                                        <span className="business-foundation-label-info legal-entity-label-info">
                                            <FieldLabel className="business-foundation-label" role="heading" aria-level={4}>
                                                <InfoText text={entry.title}>
                                                    <InfoNote label={entry.title} points={entry.info} fullList />
                                                </InfoText>
                                            </FieldLabel>
                                        </span>
                                    </div>
                                    {profileQuestionsOf(entry.box, segment.questions, asked).map((question, position) => (
                                        <div className={"legal-entity-org-section" + (position % 2 === 1 ? " legal-entity-org-band" : "")} key={question.id}>
                                            {profileQuestionOf(profile, profileIndex, shown, question)}
                                        </div>
                                    ))}
                                    <div className={"legal-entity-org-section business-note-band" + (profileQuestionsOf(entry.box, segment.questions, asked).length % 2 === 1 ? " legal-entity-org-band" : "")}>
                                        <OptionalNote
                                            label="Notes"
                                            fieldId={entry.title + " notes"}
                                            ariaLabel={segmentPath + ", Profile " + (profileIndex + 1) + " " + entry.title + " notes"}
                                            disabled={disabled}
                                            value={entry.text}
                                            onChange={(next) => updateProfile(segmentIndex, profileIndex, { [entry.field]: next })}
                                        />
                                    </div>
                                </div>
                            </Fragment>
                        ))}
                </SingleColumn>
            );
        };

        /**
         * The bands of a Profile's Needs: Functional (the jobs ticked and rated, then the numbered list of their own tasks), Emotional and Social (ticked and rated, then their Notes).
         * One band pattern everywhere (the Needs section of a Direct Segment's Profile and the end user's Needs box, doc 36, 2.1): under the title band the ticks untinted, their Notes
         * (or own tasks) the next tint. In the end user's box the questions are written of the end user.
         */
        const NEEDS_INFO = ["Functional: tick and rate up to three jobs, then write their own tasks, one numbered line each; the Offerings choose from these lines.", "Emotional and Social: tick and rate up to three each, then add Notes."];
        const needsBands = (profile: BusinessCustomerProfileValue, profileIndex: number, inBox: boolean) => SUBSECTIONS.segments.needs.map((kind, at) => {
            // Emotional and Social are ticked and rated (doc 36, section 10), their numbered list kept as the note; Functional stays the list.
            const choices = profileQuestionsOf("needs", segment.questions, asked).find(question => question.id.split("-")[0] === kind.id);
            const shown = effectiveProfileAnswers(profile, segment, identity);
            return (
            // Emotional and Social: the ticks in their band, then the shared Notes in a band of its own, as every box's Notes
            // (owner, 2026-11-05), one line a need, kept as the list the Value Proposition reads. Functional stays the numbered list
            // the Offerings pick from.
            choices ? (
                <Fragment key={kind.id}>
                    {/* The tints run on across every band (Functional, then each kind's ticks and its Notes), one rule everywhere: under a title band the ticks untinted, their Notes (or own tasks) the next tint. */}
                    <div className="legal-entity-org-section">
                        {profileQuestionOf(profile, profileIndex, shown, choices, inBox ? "user" : "buyer")}
                    </div>
                    {kind.id === "functional" ? (
                        // Functional (owner, 2026-11-07): the jobs ticked and rated above, the customer's own tasks in the numbered list below,
                        // as built; each line keeps its id, so an Offering's tick follows the line through edits.
                        <div className="legal-entity-org-section legal-entity-org-band">
                            {/* (The list's label and its "i", owner, 2026-11-10: "I was talking about the list text": the practical tasks of the Value Proposition
                                Canvas's customer jobs, in the person's words; tried on a person, a business buyer and a parent buying for a child.) */}
                            <FieldRow pair fullList label={inBox ? profileUserWho("What does {s} want to achieve?", asked.dual ? DUAL_USER : profileUserName(asked)) : profileWho("What does {s} want to achieve?", shown.a2?.[0])} info={OWN_TASKS_INFO}>
                                <NumberedListInput
                                    label={kind.title + " needs for " + segmentPath + ", Profile " + (profileIndex + 1)}
                                    items={profile.needs.functional}
                                    lineIds={functionalNeedIds(profile.needs)}
                                    disabled={disabled}
                                    suggestions={otherProfileNeeds(segment, profileIndex, "functional")}
                                    onChange={(items) => updateProfile(segmentIndex, profileIndex, { needs: { ...profile.needs, functional: items, functionalIds: reconcileLineIds(profile.needs.functional, functionalNeedIds(profile.needs), items, () => randomId("need")) } })}
                                />
                            </FieldRow>
                        </div>
                    ) : (
                    <div className="legal-entity-org-section business-note-band legal-entity-org-band">
                        <OptionalNote
                            label="Notes"
                            fieldId={kind.title + " notes"}
                            ariaLabel={kind.title + " needs notes for " + segmentPath + ", Profile " + (profileIndex + 1)}
                            disabled={disabled}
                            value={profile.needs[kind.id as BusinessNeedKind].join("\n").replace(/^\n+|\n+$/g, "")}
                            onChange={(next) => updateProfile(segmentIndex, profileIndex, { needs: { ...profile.needs, [kind.id]: next.split("\n") } })}
                        />
                    </div>
                    )}
                </Fragment>
            ) : (
            <div className={"legal-entity-org-section" + (at % 2 === 1 ? " legal-entity-org-band" : "")} key={kind.id}>
                <FieldRow pair fullList label={kind.title} info={[kind.text]}>
                    <NumberedListInput
                        label={kind.title + " needs for " + segmentPath + ", Profile " + (profileIndex + 1)}
                        items={profile.needs[kind.id as BusinessNeedKind]}
                        disabled={disabled}
                        /* What the OTHER Profiles of this Segment have called this need, offered as it is typed: they share
                           their needs, so the second Profile to want the same thing says so in the same words. */
                        suggestions={otherProfileNeeds(segment, profileIndex, kind.id as BusinessNeedKind)}
                        onChange={(items) => updateProfile(segmentIndex, profileIndex, { needs: { ...profile.needs, [kind.id]: items } })}
                    />
                </FieldRow>
            </div>
            )
            );
        });

        /**
         * A PROFILE OF A SEGMENT WITH AN END USER (owner, 2026-11-08: "If the buyer is proxy, the profile should contain questions for both buyer and end user."; doc 36, 2.1): two
         * sections in the one card, the buyer's and the end user's, each a section as the Description is, its boxes the Profile's boxes with their Notes. The buyer, who chooses and
         * pays: the Description's four boxes and Objections. The end user, who it is for: its own Personal box, Goals & Desires (E4, then E1), Challenges & Problems (E2) and Needs.
         */
        const dual = asked.dual === true;
        const twoParts = (profile: BusinessCustomerProfileValue, profileIndex: number) => {
            const path = segmentPath + ", Profile " + (profileIndex + 1);
            const shown = effectiveProfileAnswers(profile, segment, identity);
            const userShown = effectiveProfileUserAnswers(profile, segment, identity);
            const parts = SUBSECTIONS.segments.profileParts;
            const own = (box: ProfileBox) => profileUserQuestionsOf(box, segment.questions, asked).map(question => profileQuestionOf(profile, profileIndex, userShown, question, "own"));
            const motivation = (box: "goals" | "challenges" | "objections", title: string, part: ProfilePart, before: ReactNode[] = []): DescriptionPart => ({
                id: box, title, text: SUBSECTIONS.segments.motivations[box][0], extra: [PROFILE_NOTE_HINTS[box]], level: 4, note: true,
                noteValue: profile[box], onNote: (next) => updateProfile(segmentIndex, profileIndex, { [box]: next }),
                questions: [...before, ...profileQuestionsOf(box, segment.questions, asked, part).map(question => profileQuestionOf(profile, profileIndex, shown, question, part))]
            });
            const buyer: DescriptionPart[] = [...profileParts(profile, profileIndex), motivation("objections", "Objections", "buyer")];
            const user: DescriptionPart[] = [
                {
                    id: "user-personal", title: "Specific Personal Information", text: parts.userPersonal, extra: [parts.userPersonalHint], level: 4, note: true,
                    noteValue: profile.user?.note ?? "", noteId: "End user Specific Personal Information notes",
                    onNote: (next) => updateProfile(segmentIndex, profileIndex, { user: { ...profile.user, note: next } }),
                    questions: own("personal")
                },
                motivation("goals", "Goals & Desires", "user", own("goals")),
                motivation("challenges", "Challenges & Problems", "user"),
                { id: "needs", title: "Needs", text: "What the end user needs done, how they want to feel and how they want to be seen.", extra: NEEDS_INFO, level: 4, questions: [], body: needsBands(profile, profileIndex, true) }
            ];
            return (
                <>
                    {description(path, buyer, profile.description, (next) => updateProfile(segmentIndex, profileIndex, { description: next }), true, undefined, groupFold(profile.id, "The buyer", path), true, dual ? "The buyer (who also uses it)" : "The buyer", parts.buyer)}
                    {description(path + ", end user", user, {}, () => undefined, true, undefined, groupFold(profile.id, "The end user", path), true, dual ? "The others who use it" : "The end user", dual ? parts.userDual : parts.user)}
                </>
            );
        };

        const profiles = (
            <>

                {segment.profiles.map((profile, profileIndex) => card(
                    {
                        kind: "Profile",
                        ariaPrefix: segmentPath,
                        number: profileIndex + 1,
                        name: profile.name,
                        onName: (next) => updateProfile(
                            segmentIndex, profileIndex, { name: next }
                        ),
                        key: profile.id,
                        // Folded, a Profile shows its number, name and x only.
                        // One Profile card must always exist.
                        actions: segment.profiles.length > 1 &&
                            remove(
                                "Profile " + (profileIndex + 1),
                                () => updateSegment(segmentIndex, {
                                    profiles: segment.profiles.filter(
                                        (_candidate, position) =>
                                            position !== profileIndex
                                    )
                                })
                            )
                    },
                    asked.endsUser ? twoParts(profile, profileIndex) : <>

                        {description(
                            segmentPath + ", Profile " + (profileIndex + 1),
                            profileParts(profile, profileIndex),
                            profile.description,
                            (next) => updateProfile(
                                segmentIndex, profileIndex, { description: next }
                            ),
                            true,
                            undefined,
                            groupFold(profile.id, "Description", segmentPath + ", Profile " + (profileIndex + 1)),
                            true
                        )}

                        {/* What the Profile wants and what stands in
                            the way -- questions about the same thing,
                            asked under one title rather than as three
                            unrelated boxes.

                            Named "Motivations" rather than
                            "Motivations and Needs": the needs now
                            have a titled section of their own just
                            below, and a section called "... and
                            Needs" containing a section called "Needs"
                            says it twice. */}

                        {group("Motivations", <>

                        {motivations(profile, profileIndex)}

                        </>, undefined, groupFold(profile.id, "Motivations", segmentPath + ", Profile " + (profileIndex + 1)))}

                        {/* Three kinds of need under one title, a
                            numbered list each. The list needs no
                            Add button -- Enter opens the next line
                            and Backspace on an empty one takes it
                            away, the way every other list in this
                            Framework behaves (see
                            NumberedListInput) -- and a numbered
                            line is what the Offerings subsection
                            picks from. */}
                        {/* NEEDS is a section as Description and Motivations are: its heading, then its labelled bands (Functional, Emotional, Social), each label over its numbered list. */}

                        {group("Needs", (
                            <SingleColumn>
                                {needsBands(profile, profileIndex, false)}
                            </SingleColumn>
                        ), NEEDS_INFO, groupFold(profile.id, "Needs", segmentPath + ", Profile " + (profileIndex + 1)))}

                    </>
                ))}

                {/* Always offered. The specification's "up to 3" is
                    advice, and it is given as advice in the guidance
                    above the line -- a founder with a fourth Profile
                    to describe is not served by the button quietly
                    going away. */}
                {/* The Profiles proposed by buying role (doc 36, 2), read from the Segment's "Who decides to buy?": each is added
                    with its name and its roles in buying ticked, and is not offered again once a Profile has its name. */}
                {(() => {
                    const proposals = proposedBusinessProfiles(segment.questions, asked, segment.profiles.map(profile => profile.name));
                    return proposals.length > 0 && (
                        <div className="profile-proposals" aria-label={"Proposed Profiles for " + segmentPath}>
                            {proposals.map(proposal => (
                                <Fragment key={proposal.id}>
                                    {addButton(proposal.name + " Profile", () => {
                                        const profile = { ...createBusinessCustomerProfile(), name: proposal.name, questions: { a5: proposal.roles } };
                                        updateSegment(segmentIndex, { profiles: [...segment.profiles, profile] });
                                        folds.expand(profile.id);
                                    })}
                                </Fragment>
                            ))}
                        </div>
                    );
                })()}

                {addButton("Profile", () => {
                    const profile = createBusinessCustomerProfile();
                    updateSegment(segmentIndex, {
                        profiles: [...segment.profiles, profile]
                    });
                    folds.expand(profile.id);
                }, true)}

            </>
        );

        /* ---- 2. The competitors facing this Segment ---- */

        /** What a Competitor's and an Offering's card read of this Segment and of the page (CompetitorCard.tsx, OfferingCard.tsx). */
        const scope: FoundationCardScope = { card, description, disabled, group, groupFold, identity, labelled, remove, segment, segmentEndsUser, segmentIndex, segmentPath, updateSegment };
        /**
         * THE DIFFERENTIATION (doc 41, K14; owner, 2026-11-08: "Move all three"): once for the Segment, after its Competitors, since what the offering does differently is set against all
         * of them (Dunford, Obviously Awesome). A question of the Segment, drawn as the Segment's are; the Competitors' dialog stands it under their tiles, the column under their cards.
         */
        const differentiationQuestion = SEGMENT_QUESTIONS.find(question => question.id === "differentiation");
        const differentiation = differentiationQuestion ? questionOf(differentiationQuestion) : null;

        const competitors = (
            <>

                {segment.competitors.map((competitor, index) => competitorCard(scope, competitor, index))}

                {/* The Differentiation (K14), once for the Segment after its Competitors: a group of the Segment as its Value Proposition is. */}
                {group(
                    "Differentiation",
                    <div className="business-foundation-field">
                        {differentiation}
                    </div>
                )}

                {addButton("Competitor", () => {
                    const competitor = createBusinessCompetitor();
                    updateSegment(segmentIndex, {
                        competitors: [...segment.competitors, competitor]
                    });
                    folds.expand(competitor.id);
                }, true)}

            </>
        );

        /* ---- 3. The one promise made to this Segment ---- */

        /*
            No card and no Add button: the card IS this Segment, and
            a Segment has exactly one Value Proposition.

            Titled the way every other group on the page is, with
            its "i" on the end of the title. There is one Value
            Proposition per Segment, so it carries no number of its
            own -- and no Segment name either: the card it sits in is
            that Segment, and its head says so.

            It sits in the card's UPPER RIGHT CORNER, spanning the
            head's row and the Description's, so it is read before
            the detail that has to serve it rather than after. The
            two kinds of need it exists to address are recalled
            beneath it.
        */
        /* The Offerings' answers as their cards show them (doc 43: starting values included), read by the Value Proposition's draft and open items too. */
        // (EffectiveAnswers.ts: the same answers the Business Plan and the export read.)
        const offeringContext = (offering: BusinessOfferingValue): OfferingContext => offeringContextOf(offering, segment, identity);
        const offeringAnswers = segment.offerings.map(offering => effectiveOfferingAnswers(offering, segment, identity));
        const profileAnswers = segment.profiles.map(profile => effectiveProfileAnswers(profile, segment, identity));

        /* The draft (doc 42, 1): one link for each Offering with a Type (the doc's proposal for several Offerings), adding its sentence at the end of the text. */
        const drafts = draftOffered(segment)
            ? segment.offerings.map((offering, at) => ({ offering, draft: offering.category.trim() ? valuePropositionDraft(segment, offering, offeringAnswers[at], offeringContext(offering), profileAnswers) : "" })).filter(entry => entry.draft && draftToAdd(segment.valueProposition, entry.draft))
            : [];
        const openItems = valuePropositionOpenItems(segment, offeringAnswers, profileAnswers);

        // In the bands every card has (one band pattern, as the Profiles' and the Differentiation's sections): the text untinted, then Emotional Needs and Social Needs side by side,
        // one tinted band across, then Open items untinted. Where the needs stand one under the other (a dialog under 600px) the run goes on band by band: Social untinted, Open items tinted.
        const valueProposition = group(
            "Value Proposition",
            <div className="legal-entity-grid legal-entity-grid-pairs legal-entity-grid-organization legal-entity-audience business-segment-grid business-segment-grid-full">
            <div className="legal-entity-field">
            <div className="legal-entity-org-section business-foundation-field">

                {drafts.map(({ offering, draft }) => (
                    <TextLink
                        key={offering.id}
                        className="business-competitor-draft"
                        disabled={disabled}
                        onClick={() => {
                            const adding = draftToAdd(segment.valueProposition, draft);
                            updateSegment(segmentIndex, { valueProposition: segment.valueProposition.trim() ? segment.valueProposition.replace(/\s+$/, "") + "\n\n" + adding : adding });
                        }}
                    >
                        {segment.offerings.length > 1 ? "Add a draft for " + (offering.name.trim() || "this Offering") : "Add a draft"}
                    </TextLink>
                ))}

                <StrategyTextArea
                    className="interview-input business-foundation-proposition-input"
                    ariaLabel={
                        "Value Proposition for " +
                        (segment.name.trim() || "Segment " + (segmentIndex + 1))
                    }
                    disabled={disabled}
                    value={segment.valueProposition}
                    onChange={(next) => updateSegment(segmentIndex, {
                        valueProposition: next
                    })}
                />

            </div>

                {/* The two kinds of need this answer is the one
                    answer for: "Identify how the Value Proposition
                    addresses each Customer Profile's emotional and
                    social needs." They are read here and written in
                    the Profile, so this is a reminder of what has to
                    be addressed, not a second place to answer it --
                    nothing here can be typed in or ticked. */}
                {(() => {


                    /* Both headings stand whether or not anything
                       has been written under them. They say what
                       this answer has to address, so a Segment
                       with none recorded is the case where that
                       most needs saying -- and the panel keeps one
                       shape as the Profiles are filled in rather
                       than growing a new section part way
                       through. */

                    // THE NEEDS, THEN THE NOTES, APART (owner, 2026-11-09: "Needs and notes should not have a common numbered sequence. Either the notes go under the related
                    // needs, or they are placed separately"): the needs ticked on the Profiles, numbered, strongest first (owner, 2026-11-07); under them, "From the Profiles' Notes"
                    // in the label's style, then each line of the Profiles' Notes as a bullet followed by its Profile's name, small and muted; a line written twice shows once, with both names.
                    const shownAnswers = segment.profiles.map(profile => effectiveProfileAnswers(profile, segment, identity));
                    const notesOf = (kind: "emotional" | "social") => {
                        const lines: { text: string; names: string[] }[] = [];
                        segment.profiles.forEach((profile, at) => {
                            const name = profile.name.trim() || "Profile " + (at + 1);
                            for (const need of profile.needs[kind]) {
                                const text = need.trim();
                                const same = lines.find(line => line.text.toLocaleLowerCase() === text.toLocaleLowerCase());
                                if (text === "") {
                                    continue;
                                }
                                if (same) {
                                    if (!same.names.includes(name)) {
                                        same.names.push(name);
                                    }
                                } else {
                                    lines.push({ text, names: [name] });
                                }
                            }
                        });
                        return lines;
                    };
                    const entriesOf = (ticks: string[], notes: { text: string; names: string[] }[]) => {
                        return ticks.length + notes.length > 0 ? (
                            <div>
                                {ticks.length > 0 && <ListStatic lines={ticks.map(tick => ({ key: tick, text: tick }))} />}
                                {notes.length > 0 && (
                                    <>
                                        <span className="field-label business-proposition-notes-label">From the Profiles' Notes</span>
                                        <ListStatic marker="bullet" label="From the Profiles' Notes" lines={notes.map(note => ({ key: note.text, text: <>{note.text}<span className="business-proposition-note-profile">{note.names.join(", ")}</span></> }))} />
                                    </>
                                )}
                            </div>
                        ) : (
                            <BusinessEmpty>
                                None recorded.
                            </BusinessEmpty>
                        );
                    };

                    // The needs side by side (owner, 2026-11-09: "Place needs next to each other."), in the two columns of the Segment's Description (its grid, its 1px divider; one
                    // under the other only in a dialog under 600px, 13-business-foundation.css): each list a field row in its own band, as "Open items" below, both bands the next tint after the text.
                    return (
                        <div className="legal-entity-grid legal-entity-grid-pairs legal-entity-grid-organization legal-entity-audience business-segment-grid business-proposition-needs">
                            <div className="legal-entity-field">
                                <div className="legal-entity-org-section legal-entity-org-band">
                                    <FieldRow pair fullList label="Emotional Needs">
                                        {entriesOf(segmentNeedTicks(shownAnswers, "emotional"), notesOf("emotional"))}
                                    </FieldRow>
                                </div>
                            </div>
                            <div className="legal-entity-field">
                                <div className="legal-entity-org-section legal-entity-org-band">
                                    <FieldRow pair fullList label="Social Needs">
                                        {entriesOf(segmentNeedTicks(shownAnswers, "social"), notesOf("social"))}
                                    </FieldRow>
                                </div>
                            </div>
                        </div>
                    );

                })()}

                {/* The open items (doc 42, 2): read-only, under the needs; untinted after the needs' band (tinted where the needs stand one under the other, 13-business-foundation.css). */}
                {openItems.length > 0 && (
                    <div className="legal-entity-org-section business-proposition-items">
                        <FieldRow pair fullList label="Open items" info={["Gaps between what your customers want and what your Offerings give. Each one is a reminder to look at."]}>
                            <ListStatic marker="bullet" lines={openItems.map((item, at) => ({ key: item.kind + at, text: item.kind + ": " + item.text }))} />
                        </FieldRow>
                    </div>
                )}

            </div>
            </div>,
            [...SUBSECTIONS.valueProposition.note, "Add a draft: a starting sentence made from your answers on this page. It is yours once added: change it freely.", "Based on: Moore's positioning template, and the pains and gains of the Value Proposition Canvas."]
        );

        /* ---- 4. The Offerings sold to this Segment ---- */

        const needs = businessSegmentFunctionalItems(segment);

        const offerings = (
            <>

                {segment.offerings.map((offering, index) => offeringCard(scope, offering, index, { needs, offeringContext, offeringAnswers }))}

                {addButton("Offering", () => {
                    const offering = createBusinessOffering();
                    updateSegment(segmentIndex, {
                        offerings: [...segment.offerings, offering]
                    });
                    folds.expand(offering.id);
                }, true)}

            </>
        );

        return { segmentDescription, profiles, competitors, differentiation, valueProposition, offerings };

    }

    return { addButton, heads, remove, subsectionsFor };

}

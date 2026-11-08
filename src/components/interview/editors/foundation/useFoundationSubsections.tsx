/**
 * THE CARDS AND SUBSECTIONS: the remove and add buttons, the target-audience note and the four subsections.
 * One part of BusinessFoundationEditor (see BusinessFoundationEditor.tsx): what it needs of the parts before it comes in as `earlier`; what the parts after it need goes out.
 */
import ListStatic from "../../fields/ListStatic.tsx";
import TickField from "../../../controls/TickField.tsx";
import AddButton from "../../../controls/AddButton.tsx";
import { Fragment, ReactNode, useState } from "react";
import FieldLabel from "../../../controls/FieldLabel.tsx";
import { BUSINESS_COMPETITOR_TYPES, BUSINESS_OFFERING_CATEGORIES, BusinessCompetitorValue, BusinessCustomerProfileValue, BusinessCustomerSegmentValue, BusinessOfferingValue, businessSegmentNeeds, businessSegmentFunctionalItems, functionalNeedIds, reconcileLineIds, createBusinessCompetitor, createBusinessCustomerProfile, createBusinessOffering } from "../../../../framework/engine/AnswerUtils.ts";
import { randomId } from "../../../../framework/engine/Readers.ts";
import FieldRow from "../../fields/FieldRow.tsx";
import { BusinessAddButton, BusinessCard, BusinessEmpty, BusinessRemove, BusinessStep, BusinessTicks, OptionalNote } from "../../cards/BusinessCardFields.tsx";
import RadioChoice from "../../../controls/RadioChoice.tsx";
import RatingScale, { type Rating } from "../../../controls/RatingScale.tsx";
import { ratingScaleMeaning } from "../../../controls/RatingScaleEnds.tsx";
import RatingScaleGroup from "../../../controls/RatingScaleGroup.tsx";
import TextLink from "../../fields/TextLink.tsx";
import TextBox from "../../../controls/TextBox.tsx";
import { type OtherQuestion, competitorOtherAdd, competitorOtherName, competitorOtherRemove, competitorOtherSettle, competitorOtherTick, competitorOthers, COMPETITOR_CHANNEL_OPTIONS, COMPETITOR_EXPERIENCE_HOW, COMPETITOR_INFO, COMPETITOR_OFFER_OPTIONS, COMPETITOR_RATINGS, COMPETITOR_REACH_OPTIONS, COMPETITOR_SIZE_OPTIONS, COMPETITOR_STAGES, type CompetitorAnswers, type CompetitorQuestionId, REVIEW_PLATFORM_EXAMPLES, competitorAsks, competitorOpenings, competitorRate, competitorRatings, competitorSettle, competitorWording, competitorValueRows, shownOpenings, COMPETITOR_SUBCHANNELS, COMPETITOR_BAND_LINE, bandTone, COMPETITOR_CHANGES, valueProfiles, draftToAdd, hardToBeat, insightsDraft, reviewPlatformOrder } from "../../../../framework/engine/CompetitorQuestions.ts";
import FittingRadioChoice from "./FittingRadioChoice.tsx";
import { OFFERING_BOX_QUESTIONS, OFFERING_QUESTIONS, offeringChoose, type OfferingAnswers, type OfferingContext, type OfferingQuestionId, draftOffered, offeringAsks, offeringInfo, offeringOptions, valuePropositionDraft, valuePropositionOpenItems } from "../../../../framework/engine/OfferingQuestions.ts";
import { effectiveOfferingAnswers, effectiveProfileAnswers, effectiveProfileUserAnswers, offeringContextOf, withFieldSet } from "../../../../framework/engine/EffectiveAnswers.ts";
import NumberCell from "../../../controls/NumberCell.tsx";
import { type ProfileBox, type ProfilePart, type ProfileQuestion, PROFILE_NOTE_HINTS, profileAgeRange, profileChoose, profileOutcomeLimit, profileRate, profileRatings, profileWho, profileQuestionsOf, profileSettle, profileUserAgeRange, profileUserQuestionsOf, profileUserSettle, profileUserWho, proposedBusinessProfiles, segmentNeedTicks } from "../../../../framework/engine/ProfileQuestions.ts";
import { type SegmentBox, type SegmentQuestion, SEGMENT_QUESTIONS, segmentChoose, segmentOptions, segmentQuestionsOf, segmentRowChoice, segmentSettle, segmentSettledNotes } from "../../../../framework/engine/SegmentQuestions.ts";
import { INFO as POSITIONING_INFO, choiceLimit, differentiationOptionsFor, stageLimitLine, userOutcomeOptionsFor, withStageLine } from "../legal/shared.tsx";
import { summaryText } from "../../cards/cardSummary.ts";
import InfoNote, { InfoPoint, InfoText } from "../../fields/InfoNote.tsx";
import NumberedListInput from "../../fields/NumberedListInput.tsx";
import OptionPicker from "../../fields/OptionPicker.tsx";
import StrategyTextArea from "../../fields/StrategyTextArea.tsx";
import { BusinessNeedKind, CATEGORY_OTHER, COMPETITOR_TYPE_QUESTIONS, DescriptionPart, NOTE_PLACEHOLDERS, OPTIONAL_DESCRIPTION_PART, SUBSECTIONS, competitorParts, otherProfileNeeds } from "./shared.tsx";
import { BUSINESS_AUDIENCE, PEOPLE_AUDIENCE, audienceLine, segmentContextFor, segmentFrame, segmentPositioningShown } from "./identityLink.ts";
import type { useFoundationState } from "./useFoundationState.tsx";

type Earlier = ReturnType<typeof useFoundationState>;

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
        }: {
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
        },
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

        // The questions that left Positioning for the Segment (owner, 2026-11-08): the Differentiation (K14, under the Competitors) and the end user's outcome (End user, 9). The Positioning
        // answer saved before starts each where the Segment has none saved (segmentPositioningShown); the business stage sets their limit, and they keep Positioning's order and "i".
        const shownAnswers = segmentPositioningShown(segment.questions, identity, asked);
        const positioningOrder = { customerType: identity?.relationships ?? [], audience: identity?.audience ?? [], buyerCategory: identity?.buyerCategory ?? [], endUser: identity?.endUser ?? [], purpose: identity?.purpose ?? [] };
        const stageLimit = choiceLimit(asked.stage, "outcome");

        /** One question of a box, as the Positioning card asks one: its label with its "i" (and its limit) over the radio or the ticks, settled against what the other answers and Identity allow. */
        const questionOf = (question: SegmentQuestion) => {
            const chosen = shownAnswers[question.id] ?? [];
            const options = question.id === "differentiation" ? differentiationOptionsFor(positioningOrder, chosen)
                : question.id === "u-outcome" ? userOutcomeOptionsFor(positioningOrder)
                    : segmentOptions(question, segment.questions, asked);
            const choose = (next: string[]) => updateSegment(segmentIndex, {
                questions: segmentSettle(segmentChoose(question, segment.questions, next), asked)
            });
            // (A question from Positioning: one choice is a radio, several are ticks that lock at the stage's limit, as on Positioning.)
            const max = question.fromPositioning ? stageLimit ?? undefined : question.max;
            const radio = question.fromPositioning && stageLimit === 1 && chosen.length <= 1;
            const info: InfoPoint[] = question.rating ? [ratingScaleMeaning(question.rating), ...question.info]
                : question.fromPositioning ? withStageLine(question.id === "differentiation" ? POSITIONING_INFO.differentiation : question.info, stageLimitLine(asked.stage, stageLimit))
                    : [...question.info];
            return (
                <FieldRow
                    key={question.id}
                    pair
                    fullList
                    label={question.label}
                    info={info}
                    labelNote={max !== undefined && !radio ? <span className="business-foundation-tick-note">{max + " max"}</span> : undefined}
                >
                    {question.rating
                        // A degree is a rating from 1 to 5 (doc 35): its end words over its rounds; pressing the chosen round again clears it.
                        ? (
                            <RatingScale
                                label={question.label}
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
                            <div className="radio-choice legal-entity-radio-stack" role="group" aria-label={question.label}>
                                <BusinessTicks name={question.label} disabled={disabled} options={options} chosen={chosen} max={max} onChange={choose} />
                            </div>
                        )
                        : (
                            segmentRowChoice(question, options)
                                ? (
                                    <FittingRadioChoice
                                        label={question.label}
                                        group={segment.id + "-" + question.id}
                                        disabled={disabled}
                                        value={chosen[0] ?? ""}
                                        onChange={(next) => choose([next])}
                                        options={options}
                                    />
                                )
                                : (
                                    <RadioChoice
                                        label={question.label}
                                        group={segment.id + "-" + question.id}
                                        className="legal-entity-radio-stack"
                                        disabled={disabled}
                                        value={chosen[0] ?? ""}
                                        onChange={(next) => choose([next])}
                                        options={options}
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
                    info={["The Segment is one group: people, or businesses.", "Choosing one changes the questions asked; answers that no longer apply are removed."]}
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
            const label = part === "buyer" ? profileWho(question.label, shown.a2?.[0]) : profileUserWho(question.label);
            const ageRange = question.number ? (own ? profileUserAgeRange(segment.questions) : profileAgeRange(segment.questions)) : null;
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
            const options = (outcome ? userOutcomeOptionsFor(positioningOrder) : question.options).map(option => ({ ...option }));
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
                placeholder: NOTE_PLACEHOLDERS[part.id],
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
                <div className="legal-entity-grid legal-entity-grid-pairs legal-entity-grid-organization legal-entity-audience business-segment-grid business-segment-grid-single">
                    <div className="legal-entity-field">
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
                                            placeholder={NOTE_PLACEHOLDERS[entry.box] ?? "Add a note"}
                                            disabled={disabled}
                                            value={entry.text}
                                            onChange={(next) => updateProfile(segmentIndex, profileIndex, { [entry.field]: next })}
                                        />
                                    </div>
                                </div>
                            </Fragment>
                        ))}
                    </div>
                </div>
            );
        };

        /**
         * The bands of a Profile's Needs: Functional (the jobs ticked and rated, then the numbered list of their own tasks), Emotional and Social (ticked and rated, then their Notes).
         * In the Needs section of a Direct Segment's Profile the ticks are tinted; in the end user's Needs box (doc 36, 2.1) the bands run on from its title band, so the tints
         * alternate the other way, as every box's do, and the questions are written of the end user.
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
                    {/* The tints run on across every band (Functional, then each kind's ticks and its Notes): in the Needs section the ticks tinted, the Notes not; in a box the other way. */}
                    <div className={"legal-entity-org-section" + (inBox ? "" : " legal-entity-org-band")}>
                        {profileQuestionOf(profile, profileIndex, shown, choices, inBox ? "user" : "buyer")}
                    </div>
                    {kind.id === "functional" ? (
                        // Functional (owner, 2026-11-07): the jobs ticked and rated above, the customer's own tasks in the numbered list below,
                        // as built; each line keeps its id, so an Offering's tick follows the line through edits.
                        <div className={"legal-entity-org-section" + (inBox ? " legal-entity-org-band" : "")}>
                            <FieldRow pair fullList label="Their own tasks" info={[kind.text]}>
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
                    <div className={"legal-entity-org-section business-note-band" + (inBox ? " legal-entity-org-band" : "")}>
                        <OptionalNote
                            label="Notes"
                            fieldId={kind.title + " notes"}
                            ariaLabel={kind.title + " needs notes for " + segmentPath + ", Profile " + (profileIndex + 1)}
                            placeholder={NOTE_PLACEHOLDERS.needs ?? "Add a note"}
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
        const dual = (identity?.buyerCategory ?? []).some(id => id.endsWith(":dual") && (asked.frame === "business") !== id.startsWith("b2c:"));
        const twoParts = (profile: BusinessCustomerProfileValue, profileIndex: number) => {
            const path = segmentPath + ", Profile " + (profileIndex + 1);
            const shown = effectiveProfileAnswers(profile, segment, identity);
            const userShown = effectiveProfileUserAnswers(profile, segment, identity);
            const parts = SUBSECTIONS.segments.profileParts;
            const own = (box: ProfileBox) => profileUserQuestionsOf(box, segment.questions, asked).map(question => profileQuestionOf(profile, profileIndex, userShown, question, "own"));
            const motivation = (box: "goals" | "challenges" | "objections", title: string, part: ProfilePart, before: ReactNode[] = []): DescriptionPart => ({
                id: box, title, text: SUBSECTIONS.segments.motivations[box][0], extra: [PROFILE_NOTE_HINTS[box]], level: 4, note: true,
                placeholder: NOTE_PLACEHOLDERS[box], noteValue: profile[box], onNote: (next) => updateProfile(segmentIndex, profileIndex, { [box]: next }),
                questions: [...before, ...profileQuestionsOf(box, segment.questions, asked, part).map(question => profileQuestionOf(profile, profileIndex, shown, question, part))]
            });
            const buyer: DescriptionPart[] = [...profileParts(profile, profileIndex), motivation("objections", "Objections", "buyer")];
            const user: DescriptionPart[] = [
                {
                    id: "user-personal", title: "Specific Personal Information", text: parts.userPersonal, extra: [parts.userPersonalHint], level: 4, note: true,
                    placeholder: NOTE_PLACEHOLDERS.userPersonal, noteValue: profile.user?.note ?? "", noteId: "End user Specific Personal Information notes",
                    onNote: (next) => updateProfile(segmentIndex, profileIndex, { user: { ...profile.user, note: next } }),
                    questions: own("personal")
                },
                motivation("goals", "Goals & Desires", "user", own("goals")),
                motivation("challenges", "Challenges & Problems", "user"),
                { id: "needs", title: "Needs", text: "What the end user needs done, how they want to feel and how they want to be seen.", extra: NEEDS_INFO, level: 4, questions: [], body: needsBands(profile, profileIndex, true) }
            ];
            return (
                <>
                    {description(path, buyer, profile.description, (next) => updateProfile(segmentIndex, profileIndex, { description: next }), true, undefined, groupFold(profile.id, "The buyer", path), true, "The buyer", parts.buyer)}
                    <div className="business-capability-card-rule legal-entity-org-rule business-capability-card-rule-double business-profile-section-rule" role="separator" />
                    {description(path + ", end user", user, {}, () => undefined, true, undefined, groupFold(profile.id, "The end user", path), true, "The end user", dual ? parts.userDual : parts.user)}
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
                        <div className="business-capability-card-rule legal-entity-org-rule business-capability-card-rule-double business-profile-section-rule" role="separator" />

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
                        <div className="business-capability-card-rule legal-entity-org-rule business-capability-card-rule-double business-profile-section-rule" role="separator" />

                        {group("Needs", (
                            <div className="legal-entity-grid legal-entity-grid-pairs legal-entity-grid-organization legal-entity-audience business-segment-grid business-segment-grid-single">
                                <div className="legal-entity-field">
                                    {needsBands(profile, profileIndex, false)}
                                </div>
                            </div>
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

        /** Which of the card's questions each box of its Description asks (doc 41): K1 in Offerings, K2 to K4 in Market, K5 in Customer Acquisition, K6 and K7 in Customer Experience. */
        const PART_QUESTIONS: Record<string, CompetitorQuestionId[]> = { offerings: ["k1"], market: ["k2", "k3", "k4"], acquisition: ["k5"], experience: ["k6", "k7"] };
        /**
         * THE DIFFERENTIATION (doc 41, K14; owner, 2026-11-08: "Move all three"): once for the Segment, after its Competitors, since what the offering does differently is set against all
         * of them (Dunford, Obviously Awesome). A question of the Segment, drawn as the Segment's are; the Competitors' dialog stands it under their tiles, the column under their cards.
         */
        const differentiationQuestion = SEGMENT_QUESTIONS.find(question => question.id === "differentiation");
        const differentiation = differentiationQuestion ? questionOf(differentiationQuestion) : null;

        const competitors = (
            <>

                {segment.competitors.map((competitor, index) => {

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
                    const words = (id: CompetitorQuestionId) => competitorWording(competitor.type, id);
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
                    const draft = insightsDraft(competitor.name, { ...answers, k10: openingTicks }, { ...context, names: segment.competitors.map(other => ({ name: other.name, answers: other.questions ?? {} })) }, openings);
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
                    /** A question standing alone in a group (K8 to K10): a band as the boxes' questions are, in the same wrapper as the Profile's Motivations, with its Notes in the note band under it. */
                    const band = (content: ReactNode, note?: ReactNode) => (
                        <div className="legal-entity-grid legal-entity-grid-pairs legal-entity-grid-organization legal-entity-audience business-segment-grid business-segment-grid-single">
                            <div className="legal-entity-field">
                                <div className="business-segment-box">
                                    <div className="legal-entity-org-section">{content}</div>
                                    {note && <div className="legal-entity-org-section business-note-band legal-entity-org-band">{note}</div>}
                                </div>
                            </div>
                        </div>
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
                                    const questions = (PART_QUESTIONS[part.id] ?? []).filter(id => competitorAsks(competitor.type, id)).map(question);
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

                            {group("Competitors SWOT Analysis", <>

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

                            </>, undefined, groupFold(competitor.id, "Competitors SWOT Analysis", whose))}

                            {/* What the SWOT above it was for, so
                                it is titled like the SWOT rather
                                than labelled like one more field
                                inside it. K10 above the text: openings drawn from the answers above (doc 41). */}
                            {group(
                                "Insights & Differentiation",
                                <>
                                    {openings.length > 0 && band(question("k10"))}
                                    {/* Only the sentences not already in the text; nothing new, no link. */}
                                    {draftToAdd(competitor.insights, draft) && (
                                        <TextLink
                                            className="business-competitor-draft"
                                            disabled={disabled}
                                            onClick={() => {
                                                const adding = draftToAdd(competitor.insights, draft);
                                                change({ insights: competitor.insights.trim() ? competitor.insights.replace(/\s+$/, "") + "\n\n" + adding : adding });
                                            }}
                                        >
                                            Add to text
                                        </TextLink>
                                    )}
                                    <StrategyTextArea
                                        className="interview-input business-foundation-note"
                                        ariaLabel={whose + " insights & differentiation"}
                                        disabled={disabled}
                                        value={competitor.insights}
                                        onChange={(next) => change({ insights: next })}
                                    />
                                </>,
                                asked.insights === undefined
                                    ? SUBSECTIONS.competitors.insights
                                    : [asked.insights],
                                // A section band as the Description's and the SWOT's (owner, 2026-11-04), with their fold.
                                groupFold(competitor.id, "Insights & Differentiation", whose)
                            )}

                        </>
                    );

                })}

                {/* The Differentiation (K14), once for the Segment after its Competitors: a group of the Segment as its Value Proposition is. */}
                {group(
                    "Insights & Differentiation",
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

        const valueProposition = group(
            "Value Proposition",
            <div className="business-foundation-field">

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

                {/* The two kinds of need this answer is the one
                    answer for: "Identify how the Value Proposition
                    addresses each Customer Profile's emotional and
                    social needs." They are read here and written in
                    the Profile, so this is a reminder of what has to
                    be addressed, not a second place to answer it --
                    nothing here can be typed in or ticked. */}
                {(() => {

                    const emotional = businessSegmentNeeds(segment, "emotional");
                    const social = businessSegmentNeeds(segment, "social");

                    /* Both headings stand whether or not anything
                       has been written under them. They say what
                       this answer has to address, so a Segment
                       with none recorded is the case where that
                       most needs saying -- and the panel keeps one
                       shape as the Profiles are filled in rather
                       than growing a new section part way
                       through. */

                    // The needs ticked on the Profiles, strongest first (owner, 2026-11-07), numbered; then the lines of their Notes, what no tick says, as bullets.
                    const shownAnswers = segment.profiles.map(profile => effectiveProfileAnswers(profile, segment, identity));
                    const entriesOf = (ticks: string[], notes: string[]) => (
                        ticks.length + notes.length > 0 ? (
                            <div>
                                {ticks.length > 0 && <ListStatic lines={ticks.map(tick => ({ key: tick, text: tick }))} />}
                                {notes.length > 0 && <ListStatic marker="bullet" lines={notes.map(note => ({ key: note, text: note }))} />}
                            </div>
                        ) : (
                            <BusinessEmpty>
                                None recorded.
                            </BusinessEmpty>
                        )
                    );

                    // Each list as a field row, as "Open items" below: on the content line, with the shared label line.
                    return (
                        <>
                            <FieldRow pair fullList nested label="Emotional Needs">
                                {entriesOf(segmentNeedTicks(shownAnswers, "emotional"), emotional)}
                            </FieldRow>
                            <FieldRow pair fullList label="Social Needs">
                                {entriesOf(segmentNeedTicks(shownAnswers, "social"), social)}
                            </FieldRow>
                        </>
                    );

                })()}

                {/* The open items (doc 42, 2): read-only, under the text. */}
                {openItems.length > 0 && (
                    <FieldRow pair fullList label="Open items" info={["Gaps between what your customers want and what your Offerings give. They are reminders, not errors."]}>
                        <ListStatic marker="bullet" lines={openItems.map((item, at) => ({ key: item.kind + at, text: item.kind + ": " + item.text }))} />
                    </FieldRow>
                )}

            </div>,
            [...SUBSECTIONS.valueProposition.note, "Add a draft: a starting sentence made from your answers on this page. It is yours once added: change it freely.", "Based on: Moore's positioning template, and the pains and gains of the Value Proposition Canvas."]
        );

        /* ---- 4. The Offerings sold to this Segment ---- */

        const needs = businessSegmentFunctionalItems(segment);

        const offerings = (
            <>

                {segment.offerings.map((offering, index) => {

                    const change = (
                        patch: Partial<BusinessOfferingValue>
                    ) => updateSegment(segmentIndex, {
                        offerings: segment.offerings.map(
                            (candidate, position) => position === index
                                ? { ...candidate, ...patch }
                                : candidate
                        )
                    });

                    return card(
                        {
                            kind: "Offering",
                            ariaPrefix: segmentPath,
                            number: index + 1,
                            name: offering.name,
                            onName: (next) => change({ name: next }),
                            key: offering.id,
                            summary: summaryText(
                                offering.category === CATEGORY_OTHER
                                    ? offering.categoryOther
                                    : offering.category,
                                (() => {
                                    // The items ticked, each once (the same words on two Profiles are one item, ticked by both ids).
                                    const count = needs.filter(item => item.ids.some(id => offering.needsAddressed.includes(id))).length;
                                    return count ? count + (count === 1 ? " need" : " needs") : "";
                                })()
                            ),
                            // What kind of thing it is, before what it is for: an Offering is a product, a service or both, and that frames everything asked after it. Under the name, from its box's edge.
                            headRow: labelled(
                                "Type",
                                <OptionPicker
                                    label={segmentPath + ", Offering " + (index + 1) + " type"}
                                    hug
                                    options={offering.category === CATEGORY_OTHER ? [...BUSINESS_OFFERING_CATEGORIES, CATEGORY_OTHER] : [...BUSINESS_OFFERING_CATEGORIES]}
                                    disabled={disabled}
                                    value={offering.category}
                                    onChange={(next) => change({
                                        category: next,
                                        categoryOther: next === CATEGORY_OTHER
                                            ? offering.categoryOther
                                            : ""
                                    })}
                                />
                            ),
                            actions: segment.offerings.length > 1 &&
                                remove(
                                    "Offering " + (index + 1),
                                    () => updateSegment(segmentIndex, {
                                        offerings: segment.offerings.filter(
                                            (_candidate, position) =>
                                                position !== index
                                        )
                                    })
                                )
                        },
                        <>

                            {/* The six Description boxes (doc 43; owner, 2026-11-07), as the Profile's and the Competitor's: each asks its questions, one band each
                                (O3's band holds its two rows), then its optional Notes, the box's saved text. A starting value shows until changed. */}
                            {(() => {
                                const context = offeringContext(offering);
                                /* The FUNCTIONAL needs typed into this Segment's own Profiles, more than one selectable: tick boxes, because the choice is a set. Functional only: an
                                   Offering is the practical thing that gets a job done; how the customer wants to feel about it, and to be seen for it, is what the Value Proposition
                                   answers, and those two are shown there. Its band opens the Customer Benefit box, before O8 and O4 (owner, 2026-11-08, P6). */
                                const needsBand = (
                                    <FieldRow pair fullList label="Functional Needs Addressed">
                                        {needs.length === 0 ? (
                                            <BusinessEmpty>
                                                Add Functional Needs to a Customer
                                                Profile first, then choose them here.
                                            </BusinessEmpty>
                                        ) : (
                                            <div className="radio-choice legal-entity-radio-stack" role="group" aria-label="Functional Needs Addressed">
                                                {/* Ticked by the items' ids (owner, 2026-11-07), so editing an item's words on the Profile keeps the tick. */}
                                                <BusinessTicks
                                                    name={segmentPath + ", Offering " + (index + 1) + " Functional Needs Addressed"}
                                                    disabled={disabled}
                                                    options={needs.map(item => ({ id: item.ids[0], label: item.text }))}
                                                    chosen={needs.filter(item => item.ids.some(id => offering.needsAddressed.includes(id))).map(item => item.ids[0])}
                                                    onChange={(next) => {
                                                        const itemIds = new Set(needs.flatMap(item => item.ids));
                                                        change({
                                                            needsAddressed: [
                                                                ...offering.needsAddressed.filter(entry => !itemIds.has(entry)),
                                                                ...needs.filter(item => next.includes(item.ids[0])).flatMap(item => item.ids)
                                                            ]
                                                        });
                                                    }}
                                                />
                                            </div>
                                        )}
                                    </FieldRow>
                                );
                                const shown = offeringAnswers[index];
                                const whose = segmentPath + ", Offering " + (index + 1);
                                // Only the question answered is saved; the others keep following their starts (owner, 2026-11-08).
                                const write = (id: OfferingQuestionId, next: string[]) => change({ questions: { ...(offering.questions ?? {}), [id]: offeringChoose(id, shown[id] ?? [], next) } as OfferingAnswers });
                                const ask = (id: OfferingQuestionId) => {
                                    const question = OFFERING_QUESTIONS.find(entry => entry.id === id)!;
                                    const options = offeringOptions(id, context).map(option => ({ ...option }));
                                    const chosen = shown[id] ?? [];
                                    return (
                                        // (O3's second row stands under the first in one band: nested, the shared 12px between rows.)
                                        <FieldRow key={id} pair fullList nested={id === "o3t"} label={question.label} info={[...offeringInfo(id, context)]}
                                            labelNote={question.max !== undefined ? <span className="business-foundation-tick-note">{question.max + " max"}</span> : undefined}>
                                            {question.many
                                                ? (
                                                    <div className="radio-choice legal-entity-radio-stack" role="group" aria-label={question.label}>
                                                        <BusinessTicks name={whose + " " + question.label} disabled={disabled} options={options} chosen={chosen} max={question.max} onChange={(next) => write(id, next)} />
                                                    </div>
                                                )
                                                // A radio of short options stands in one row, as on the Segment and the Profile.
                                                : segmentRowChoice({ ...question, box: "demographics" } as unknown as SegmentQuestion, options)
                                                    ? <FittingRadioChoice label={question.label} group={offering.id + "-" + id} disabled={disabled} value={chosen[0] ?? ""} onChange={(next) => write(id, [next])} options={options} />
                                                    : <RadioChoice label={question.label} group={offering.id + "-" + id} className="legal-entity-radio-stack" disabled={disabled} value={chosen[0] ?? ""} onChange={(next) => write(id, [next])} options={options} />}
                                        </FieldRow>
                                    );
                                };
                                return description(
                                    whose,
                                    SUBSECTIONS.offerings.description.map(part => {
                                        const bands = (OFFERING_BOX_QUESTIONS[part.id] ?? []).map(band => band.filter(id => offeringAsks(id, context))).filter(band => band.length > 0);
                                        return {
                                            ...part,
                                            questions: [...(part.id === "benefit" ? [<Fragment key="needs">{needsBand}</Fragment>] : []), ...bands.map(band => <Fragment key={band.join("-")}>{band.map(ask)}</Fragment>)],
                                            note: true,
                                            placeholder: NOTE_PLACEHOLDERS[part.id],
                                            level: 4,
                                            weight: 2 + (bands.flat().length + (part.id === "benefit" ? 1 : 0)) * 4
                                        };
                                    }),
                                    offering.description,
                                    (next) => change({ description: next }),
                                    true,
                                    undefined,
                                    groupFold(offering.id, "Description", whose),
                                    true
                                );
                            })()}

                        </>
                    );

                })}

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

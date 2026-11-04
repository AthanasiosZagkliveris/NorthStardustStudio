/**
 * THE CARDS AND SUBSECTIONS: the remove and add buttons, the target-audience note and the four subsections.
 * One part of BusinessFoundationEditor (see BusinessFoundationEditor.tsx): what it needs of the parts before it comes in as `earlier`; what the parts after it need goes out.
 */
import ListStatic from "../../fields/ListStatic.tsx";
import TickField from "../../../controls/TickField.tsx";
import AddButton from "../../../controls/AddButton.tsx";
import { Fragment, ReactNode, useState } from "react";
import FieldLabel from "../../../controls/FieldLabel.tsx";
import { BUSINESS_COMPETITOR_TYPES, BUSINESS_OFFERING_CATEGORIES, BusinessCompetitorValue, BusinessCustomerProfileValue, BusinessCustomerSegmentValue, BusinessOfferingValue, businessSegmentNeeds, createBusinessCompetitor, createBusinessCustomerProfile, createBusinessOffering } from "../../../../framework/engine/AnswerUtils.ts";
import FieldRow from "../../fields/FieldRow.tsx";
import { BusinessAddButton, BusinessCard, BusinessRemove, BusinessStep, BusinessTicks, OptionalNote } from "../../cards/BusinessCardFields.tsx";
import RadioChoice from "../../../controls/RadioChoice.tsx";
import RatingScale, { type Rating } from "../../../controls/RatingScale.tsx";
import { ratingScaleMeaning } from "../../../controls/RatingScaleEnds.tsx";
import RatingScaleGroup from "../../../controls/RatingScaleGroup.tsx";
import TextLink from "../../fields/TextLink.tsx";
import TextBox from "../../../controls/TextBox.tsx";
import { type OtherQuestion, competitorOtherAdd, competitorOtherName, competitorOtherRemove, competitorOtherSettle, competitorOtherTick, competitorOthers, COMPETITOR_CHANNEL_OPTIONS, COMPETITOR_EXPERIENCE_HOW, COMPETITOR_INFO, COMPETITOR_OFFER_OPTIONS, COMPETITOR_RATINGS, COMPETITOR_REACH_OPTIONS, COMPETITOR_SIZE_OPTIONS, COMPETITOR_STAGES, type CompetitorAnswers, type CompetitorQuestionId, REVIEW_PLATFORM_EXAMPLES, competitorAsks, competitorOpenings, competitorRate, competitorRatings, competitorSettle, competitorWording, competitorValueRows, COMPETITOR_SUBCHANNELS, COMPETITOR_BAND_LINE, bandTone, COMPETITOR_CHANGES, valueProfiles, draftToAdd, hardToBeat, insightsDraft, reviewPlatformOrder } from "../../../../framework/engine/CompetitorQuestions.ts";
import FittingRadioChoice from "./FittingRadioChoice.tsx";
import NumberCell from "../../../controls/NumberCell.tsx";
import { type ProfileBox, type ProfileQuestion, PROFILE_NOTE_HINTS, profileAgeRange, profileChoose, profileRate, profileRatings, profileWho, profileQuestionsOf, profileSettle, profileShown, proposedBusinessProfiles } from "../../../../framework/engine/ProfileQuestions.ts";
import { type SegmentBox, type SegmentQuestion, segmentChoose, segmentOptions, segmentQuestionsOf, segmentRowChoice, segmentSettle, segmentSettledNotes } from "../../../../framework/engine/SegmentQuestions.ts";
import { summaryText } from "../../cards/cardSummary.ts";
import InfoNote, { InfoPoint, InfoText } from "../../fields/InfoNote.tsx";
import NumberedListInput from "../../fields/NumberedListInput.tsx";
import OptionPicker from "../../fields/OptionPicker.tsx";
import StrategyTextArea from "../../fields/StrategyTextArea.tsx";
import { BusinessNeedKind, CATEGORY_OTHER, COMPETITOR_TYPE_QUESTIONS, DescriptionPart, NOTE_PLACEHOLDERS, OPTIONAL_DESCRIPTION_PART, SUBSECTIONS, competitorParts, otherProfileNeeds } from "./shared.tsx";
import { BUSINESS_AUDIENCE, PEOPLE_AUDIENCE, audienceLine, segmentContextFor, segmentFrame } from "./identityLink.ts";
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
                const typed = event.target.value.replace(/D/g, "").slice(0, 3);
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

    const { built, description, disabled, folds, forceOpen, group, groupFold, labelled, targetAudience, identity, text, updateProfile, updateSegment } = earlier;

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
        {
            number: 3,
            title: "Value Proposition",
            instructions: SUBSECTIONS.valueProposition.instructions,
            note: null
        },
        {
            number: 4,
            title: "Offering",
            instructions: SUBSECTIONS.offerings.instructions,
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

        /** One question of a box, as the Positioning card asks one: its label with its "i" (and its limit) over the radio or the ticks, settled against what the other answers and Identity allow. */
        const questionOf = (question: SegmentQuestion) => {
            const options = segmentOptions(question, segment.questions, asked);
            const chosen = segment.questions[question.id] ?? [];
            const choose = (next: string[]) => updateSegment(segmentIndex, {
                questions: segmentSettle(segmentChoose(question, segment.questions, next), asked)
            });
            return (
                <FieldRow
                    key={question.id}
                    pair
                    fullList
                    label={question.label}
                    info={question.rating ? [ratingScaleMeaning(question.rating), ...question.info] : [...question.info]}
                    labelNote={question.max !== undefined ? <span className="business-foundation-tick-note">{question.max + " max"}</span> : undefined}
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
                        : question.many
                        ? (
                            <div className="radio-choice legal-entity-radio-stack" role="group" aria-label={question.label}>
                                <BusinessTicks name={question.label} disabled={disabled} options={options} chosen={chosen} max={question.max} onChange={choose} />
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

        // The user of a Proxy or Dual-Intent buyer: described in the same card.
        if (asked.endsUser) {
            segmentParts.push({
                id: "user",
                title: "End user",
                text: "Who uses what the buyer buys?",
                extra: SUBSECTIONS.segments.boxNotes.user,
                questions: questionsOf("user"),
                weight: weightOf("user")
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

        /** One question of a Profile box: as the Segment's are drawn (a radio, ticks or the number of the age), against what the Segment answered. */
        const profileQuestionOf = (profile: BusinessCustomerProfileValue, profileIndex: number, shown: Record<string, string[]>, question: ProfileQuestion) => {
            const label = profileWho(question.label, shown.a2?.[0]);
            const ageRange = question.number ? profileAgeRange(segment.questions) : null;
            const chosen = shown[question.id] ?? [];
            const write = (next: Record<string, string[]>) => updateProfile(segmentIndex, profileIndex, { questions: profileSettle(next, segment.questions, asked) });
            const choose = (next: string[]) => write(profileChoose(question, shown, next));
            const options = question.options.map(option => ({ ...option }));
            return (
                <FieldRow
                    key={question.id}
                    pair
                    fullList
                    label={label}
                    info={question.rating ? [ratingScaleMeaning(question.rating), ...question.info] : [...question.info]}
                    labelNote={question.max !== undefined ? <span className="business-foundation-tick-note">{question.max + " max"}</span> : question.number && ageRange ? <span className="business-foundation-tick-note">{ageRange[1] >= 130 ? ageRange[0] + " or older" : ageRange[0] + "–" + (ageRange[1] - 1)}</span> : undefined}
                >
                    {question.number
                        // (A number stands beside its label, on the label's line, at the right end of the band: see .business-profile-age.)
                        ? (
                            <ProfileAgeCell
                                                                label={label}
                                disabled={disabled}
                                value={chosen[0] ?? ""}
                                onType={(typed) => updateProfile(segmentIndex, profileIndex, { questions: typed ? { ...profileSettle({ ...shown, [question.id]: [typed] }, segment.questions, asked), [question.id]: [typed] } : profileSettle({ ...shown, [question.id]: [] }, segment.questions, asked) })}
                                onDone={() => write(shown)}
                            />
                        )
                        : question.rating
                            // Ticked, then each tick rated from 1 to 5 (doc 36, section 11): the limit holds the ticks; an untick takes its rating with it (profileSettle).
                            ? (
                                <RatingScaleGroup
                                    label={label}
                                    name={profile.id + "-" + question.id}
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
                                ? <FittingRadioChoice label={label} group={profile.id + "-" + question.id} disabled={disabled} value={chosen[0] ?? ""} onChange={(next) => choose([next])} options={options} />
                                : <RadioChoice label={label} group={profile.id + "-" + question.id} className="legal-entity-radio-stack" disabled={disabled} value={chosen[0] ?? ""} onChange={(next) => choose([next])} options={options} />}
                </FieldRow>
            );
        };
        /** The boxes of a Profile's Description, each with its questions and its note, and the ones the Segment leaves no question in are plain notes. */
        const profileParts = (profile: BusinessCustomerProfileValue, profileIndex: number): DescriptionPart[] => {
            const shown = profileShown(profile.questions ?? {}, segment.questions, asked);
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
            const shown = profileShown(profile.questions ?? {}, segment.questions, asked);
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
                    <>

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
                                    {SUBSECTIONS.segments.needs.map((kind, at) => {
                                        // Emotional and Social are ticked and rated (doc 36, section 10), their numbered list kept as the note; Functional stays the list.
                                        const choices = profileQuestionsOf("needs", segment.questions, asked).find(question => question.id.split("-")[0] === kind.id);
                                        const shown = profileShown(profile.questions ?? {}, segment.questions, asked);
                                        return (
                                        <div className={"legal-entity-org-section" + (at % 2 === 1 ? " legal-entity-org-band" : "")} key={kind.id}>
                                            {choices && profileQuestionOf(profile, profileIndex, shown, choices)}
                                            <FieldRow pair fullList label={choices ? kind.title + " notes" : kind.title} info={choices ? [PROFILE_NOTE_HINTS.needs] : [kind.text]}>
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
                                        );
                                    })}
                                </div>
                            </div>
                        ), ["Each need is one numbered line. The Offerings choose from these needs."], groupFold(profile.id, "Needs", segmentPath + ", Profile " + (profileIndex + 1)))}

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
                    const radio = (id: CompetitorQuestionId, options: readonly { id: string; label: string }[]) => (
                        <RadioChoice label={words(id)} group={competitor.id + "-" + id} className="legal-entity-radio-stack" disabled={disabled} value={answers[id]?.[0] ?? ""} onChange={(next) => write({ ...answers, [id]: [next] })} options={options} />
                    );
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
                    // Other (K6, K8; owner 2026-11-04, in place of "Show all"): ticked, a row to write in, rated as the listed ones; a name that means a listed item becomes it.
                    const otherRows = (id: OtherQuestion) => competitorOthers(answers, id).map((name, at) => ({
                        id: "other-" + at,
                        name: name.trim() || "Other " + (at + 1),
                        fixed: true,
                        label: (
                            <TextBox
                                className="interview-input business-competitor-other"
                                aria-label={words(id) + ", other " + (at + 1)}
                                placeholder={id === "k6" ? "Where else are they reviewed?" : "What else do customers value?"}
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
                                <BusinessTicks name={words("k10")} disabled={disabled} options={openings} chosen={openingTicks} max={3} onChange={(next) => write({ ...answers, k10: next })} />
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
                    /** A question standing alone in a group (K8 to K10): a band as the boxes' questions are. */
                    const band = (content: ReactNode) => (
                        <div className="business-segment-box">
                            <div className="legal-entity-org-section">{content}</div>
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
                            {band(question("k8"))}

                            {/* The shared Notes (owner, 2026-11-04: as on the Profile card): ticked to write; saved text starts ticked. */}
                            <OptionalNote
                                label="Strengths"
                                fieldId="Strengths"
                                ariaLabel={whose + " strengths"}
                                info={SUBSECTIONS.competitors.strengths}
                                placeholder={NOTE_PLACEHOLDERS.strengths ?? "Add a note"}
                                disabled={disabled}
                                value={competitor.strengths}
                                onChange={(next) => change({ strengths: next })}
                            />

                            {/* The shared Notes (owner, 2026-11-04: as on the Profile card): ticked to write; saved text starts ticked. */}
                            <OptionalNote
                                label="Weaknesses"
                                fieldId="Weaknesses"
                                ariaLabel={whose + " weaknesses"}
                                info={SUBSECTIONS.competitors.weaknesses}
                                placeholder={NOTE_PLACEHOLDERS.weaknesses ?? "Add a note"}
                                disabled={disabled}
                                value={competitor.weaknesses}
                                onChange={(next) => change({ weaknesses: next })}
                            />

                            {band(question("k9"))}

                            {/* The shared Notes (owner, 2026-11-04: as on the Profile card): ticked to write; saved text starts ticked. */}
                            <OptionalNote
                                label="Opportunities"
                                fieldId="Opportunities"
                                ariaLabel={whose + " opportunities"}
                                info={SUBSECTIONS.competitors.opportunities}
                                placeholder={NOTE_PLACEHOLDERS.opportunities ?? "Add a note"}
                                disabled={disabled}
                                value={competitor.opportunities}
                                onChange={(next) => change({ opportunities: next })}
                            />

                            {/* The shared Notes (owner, 2026-11-04: as on the Profile card): ticked to write; saved text starts ticked. */}
                            <OptionalNote
                                label="Threats"
                                fieldId="Threats"
                                ariaLabel={whose + " threats"}
                                info={SUBSECTIONS.competitors.threats}
                                placeholder={NOTE_PLACEHOLDERS.threats ?? "Add a note"}
                                disabled={disabled}
                                value={competitor.threats}
                                onChange={(next) => change({ threats: next })}
                            />

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
        const valueProposition = group(
            "Value Proposition",
            <div className="business-foundation-field">

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

                    const entriesOf = (entries: string[]) => (
                        entries.length > 0 ? (
                            <ListStatic
                                lines={entries.map(entry => ({ key: entry, text: entry }))}
                            />
                        ) : (
                            <p className="business-foundation-empty">
                                None recorded.
                            </p>
                        )
                    );

                    /*
                        Laid out flat rather than as two columns of
                        their own: the two titles, ONE RULE ACROSS
                        BOTH, then the two lists. A rule per column
                        was two rules with a gap between them, which
                        read as two of something rather than as the
                        single line the boxes opposite draw.
                    */
                    return (
                        <div className="business-foundation-needs-recall">

                            <FieldLabel className="business-foundation-label">
                                Emotional Needs
                            </FieldLabel>

                            <FieldLabel className="business-foundation-label">
                                Social Needs
                            </FieldLabel>

                            <div
                                className="business-foundation-needs-recall-rule"
                                aria-hidden="true"
                            />

                            {entriesOf(emotional)}
                            {entriesOf(social)}

                        </div>
                    );

                })()}

            </div>,
            SUBSECTIONS.valueProposition.note
        );

        /* ---- 4. The Offerings sold to this Segment ---- */

        const needs = businessSegmentNeeds(segment, "functional");

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
                                offering.needsAddressed.length
                                    ? offering.needsAddressed.length +
                                        (offering.needsAddressed.length === 1 ? " need" : " needs")
                                    : ""
                            ),
                            // What kind of thing it is, before what it is for: an Offering is a product, a service or both, and that frames everything asked after it. Under the name, from its box's edge.
                            headRow: labelled(
                                "Type",
                                <OptionPicker
                                    label={segmentPath + ", Offering " + (index + 1) + " type"}
                                    hug
                                    options={[...BUSINESS_OFFERING_CATEGORIES]}
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

                            {offering.category === CATEGORY_OTHER && text(
                                "Name the type",
                                offering.categoryOther,
                                (next) => change({ categoryOther: next })
                            )}

                            {/* The FUNCTIONAL needs typed into this
                                Segment's own Profiles, more than one
                                selectable. Tick boxes rather than a
                                list, because the choice is a set
                                rather than one value.

                                Functional only: an Offering is the
                                practical thing that gets a job done.
                                How the customer wants to feel about
                                it, and to be seen for it, is what the
                                Value Proposition answers -- and those
                                two are shown there, beneath it. */}
                            <div className="business-foundation-field">

                                <FieldLabel className="business-foundation-label">
                                    Functional Needs Addressed
                                </FieldLabel>

                                {needs.length === 0 ? (
                                    <p className="business-foundation-empty">
                                        Add Functional Needs to a Customer
                                        Profile first, then choose them here.
                                    </p>
                                ) : needs.map(need => (
                                    <TickField className="business-foundation-tick" key={need} disabled={disabled} checked={
                                                offering.needsAddressed.includes(need)
                                            } onChange={(event) => change({
                                                needsAddressed: event.target.checked
                                                    ? [...offering.needsAddressed, need]
                                                    : offering.needsAddressed.filter(
                                                        entry => entry !== need
                                                    )
                                            })}>
                                        <span className="business-foundation-tick-label">
                                            {need}
                                        </span>
                                    </TickField>
                                ))}

                            </div>

                            {description(
                                segmentPath + ", Offering " + (index + 1),
                                SUBSECTIONS.offerings.description,
                                offering.description,
                                (next) => change({ description: next }),
                                false,
                                undefined,
                                groupFold(offering.id, "Description", segmentPath + ", Offering " + (index + 1))
                            )}

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

        return { segmentDescription, profiles, competitors, valueProposition, offerings };

    }

    return { addButton, heads, remove, subsectionsFor };

}

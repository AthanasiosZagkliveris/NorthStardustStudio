/**
 * THE CARDS AND SUBSECTIONS: the remove and add buttons, the target-audience note and the four subsections.
 * One part of BusinessFoundationEditor (see BusinessFoundationEditor.tsx): what it needs of the parts before it comes in as `earlier`; what the parts after it need goes out.
 */
import ListStatic from "../../fields/ListStatic.tsx";
import TickField from "../../../controls/TickField.tsx";
import { ReactNode } from "react";
import FieldLabel from "../../../controls/FieldLabel.tsx";
import { BUSINESS_COMPETITOR_TYPES, BUSINESS_OFFERING_CATEGORIES, BusinessCompetitorValue, BusinessCustomerSegmentValue, BusinessOfferingValue, businessSegmentNeeds, createBusinessCompetitor, createBusinessCustomerProfile, createBusinessOffering } from "../../../../framework/engine/AnswerUtils.ts";
import { BusinessAddButton, BusinessCard, BusinessRemove } from "../../cards/BusinessCardFields.tsx";
import { summaryText } from "../../cards/cardSummary.ts";
import InfoNote, { InfoPoint, InfoText } from "../../fields/InfoNote.tsx";
import NumberedListInput from "../../fields/NumberedListInput.tsx";
import OptionPicker from "../../fields/OptionPicker.tsx";
import { FieldMark, FieldStatus } from "../../fields/fieldMarks.tsx";
import StrategyTextArea from "../../fields/StrategyTextArea.tsx";
import { BusinessNeedKind, CATEGORY_OTHER, COMPETITOR_TYPE_QUESTIONS, OPTIONAL_DESCRIPTION_PART, SUBSECTIONS, competitorParts, otherProfileNeeds } from "./shared.tsx";
import { BUSINESS_AUDIENCE, PEOPLE_AUDIENCE, audienceLine, segmentFrame } from "./identityLink.ts";
import type { useFoundationState } from "./useFoundationState.tsx";

type Earlier = ReturnType<typeof useFoundationState>;

export function useFoundationSubsections(earlier: Earlier) {

    const { built, description, disabled, folds, forceOpen, group, groupFold, labelled, note, targetAudience, identity, text, updateProfile, updateSegment } = earlier;

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
        const segmentParts = SUBSECTIONS.segments.segmentDescription
            // (A box that already has text stays, so nothing written is hidden.)
            .filter(part => !((frame === "people" && part.id === OPTIONAL_DESCRIPTION_PART) || (frame === "business" && part.id === "demographics")) || (segment.description[part.id] ?? "").trim().length > 0)
            .map(part => part.id === "demographics"
                ? { ...part, extra: audienceLine(identity, PEOPLE_AUDIENCE) }
                : part.id === OPTIONAL_DESCRIPTION_PART
                    ? { ...part, extra: audienceLine(identity, BUSINESS_AUDIENCE), always: frame === "business" }
                    : part);

        const segmentDescription = description(
            segmentPath,
            segmentParts,
            segment.description,
            (next) => updateSegment(segmentIndex, { description: next }),
            true,
            segment.id
        );

        /* ---- 1. Its Profiles ---- */

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
                            SUBSECTIONS.segments.profileDescription,
                            profile.description,
                            (next) => updateProfile(
                                segmentIndex, profileIndex, { description: next }
                            ),
                            false,
                            undefined,
                            groupFold(profile.id, "Description", segmentPath + ", Profile " + (profileIndex + 1))
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

                        {note(
                            "Goals & Desires",
                            profile.goals,
                            (next) => updateProfile(
                                segmentIndex, profileIndex, { goals: next }
                            ),
                            SUBSECTIONS.segments.motivations.goals,
                            segmentPath + ", Profile " + (profileIndex + 1)
                        )}

                        {note(
                            "Challenges & Problems",
                            profile.challenges,
                            (next) => updateProfile(
                                segmentIndex, profileIndex, { challenges: next }
                            ),
                            SUBSECTIONS.segments.motivations.challenges,
                            segmentPath + ", Profile " + (profileIndex + 1)
                        )}

                        {note(
                            "Objections",
                            profile.objections,
                            (next) => updateProfile(
                                segmentIndex, profileIndex, { objections: next }
                            ),
                            SUBSECTIONS.segments.motivations.objections,
                            segmentPath + ", Profile " + (profileIndex + 1)
                        )}

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
                        {group("Needs", SUBSECTIONS.segments.needs.map(kind => (
                            <div
                                className="business-foundation-field"
                                key={kind.id}
                            >

                                <span className="business-foundation-label-info">
                                    <FieldLabel className="business-foundation-label">
                                        <InfoText text={kind.title}>
                                            <InfoNote
                                                label={kind.title}
                                                points={[kind.text]}
                                                fullList
                                            />
                                        </InfoText>
                                        <FieldMark label={kind.title} />
                                    </FieldLabel>
                                    <FieldStatus label={kind.title} />
                                </span>

                                <NumberedListInput
                                    label={
                                        kind.title +
                                        " needs for " + segmentPath + ", Profile " + (profileIndex + 1)
                                    }
                                    items={profile.needs[kind.id as BusinessNeedKind]}
                                    disabled={disabled}
                                    /* What the OTHER Profiles in this
                                       Segment have called this need,
                                       offered as it is typed. They
                                       share their needs, so the
                                       second Profile to want the same
                                       thing should be able to say so
                                       in the same words -- typing it
                                       afresh is how "Bill on time"
                                       and "Billing on time" become
                                       two needs that are one. */
                                    suggestions={otherProfileNeeds(
                                        segment,
                                        profileIndex,
                                        kind.id as BusinessNeedKind
                                    )}
                                    onChange={(items) => updateProfile(
                                        segmentIndex, profileIndex, {
                                            needs: {
                                                ...profile.needs,
                                                [kind.id]: items
                                            }
                                        }
                                    )}
                                />

                            </div>
                        )), undefined, groupFold(profile.id, "Needs", segmentPath + ", Profile " + (profileIndex + 1)))}

                    </>
                ))}

                {/* Always offered. The specification's "up to 3" is
                    advice, and it is given as advice in the guidance
                    above the line -- a founder with a fourth Profile
                    to describe is not served by the button quietly
                    going away. */}
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

                            {/* What this TYPE of competitor is
                                asked -- see
                                COMPETITOR_TYPE_QUESTIONS. */}
                            {description(
                                segmentPath + ", Competitor " + (index + 1),
                                competitorParts(competitor.type),
                                competitor.description,
                                (next) => change({ description: next }),
                                false,
                                undefined,
                                groupFold(competitor.id, "Description", segmentPath + ", Competitor " + (index + 1))
                            )}

                            {group("Competitors SWOT Analysis", <>

                            {note(
                                "Strengths",
                                competitor.strengths,
                                (next) => change({ strengths: next }),
                                SUBSECTIONS.competitors.strengths,
                                segmentPath + ", Competitor " + (index + 1)
                            )}

                            {note(
                                "Weaknesses",
                                competitor.weaknesses,
                                (next) => change({ weaknesses: next }),
                                SUBSECTIONS.competitors.weaknesses,
                                segmentPath + ", Competitor " + (index + 1)
                            )}

                            {note(
                                "Opportunities",
                                competitor.opportunities,
                                (next) => change({ opportunities: next }),
                                SUBSECTIONS.competitors.opportunities,
                                segmentPath + ", Competitor " + (index + 1)
                            )}

                            {note(
                                "Threats",
                                competitor.threats,
                                (next) => change({ threats: next }),
                                SUBSECTIONS.competitors.threats,
                                segmentPath + ", Competitor " + (index + 1)
                            )}

                            </>, undefined, groupFold(competitor.id, "Competitors SWOT Analysis", segmentPath + ", Competitor " + (index + 1)))}

                            {/* What the SWOT above it was for, so
                                it is titled like the SWOT rather
                                than labelled like one more field
                                inside it. */}
                            {group(
                                "Insights & Differentiation",
                                <StrategyTextArea
                                    className="interview-input business-foundation-note"
                                    ariaLabel={segmentPath + ", Competitor " + (index + 1) + " insights & differentiation"}
                                    disabled={disabled}
                                    value={competitor.insights}
                                    onChange={(next) => change({ insights: next })}
                                />,
                                asked.insights === undefined
                                    ? SUBSECTIONS.competitors.insights
                                    : [asked.insights]
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

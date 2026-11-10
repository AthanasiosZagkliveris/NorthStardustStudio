/**
 * ONE OFFERING CARD (doc 43): its Type, then its six boxes in two sections (Description; Terms & Service), each box asking its questions in bands over its Notes.
 * One part of useFoundationSubsections (moved out whole on 2026-11-09, no change of behaviour): what it reads of the Segment and of the page comes in as `scope`.
 */
import { Fragment, ReactNode } from "react";
import { BUSINESS_OFFERING_CATEGORIES, BusinessOfferingValue, businessSegmentFunctionalItems } from "../../../../framework/engine/AnswerUtils.ts";
import FieldRow from "../../fields/FieldRow.tsx";
import { BusinessEmpty, BusinessTicks } from "../../cards/BusinessCardFields.tsx";
import RadioChoice from "../../../controls/RadioChoice.tsx";
import FittingRadioChoice from "./FittingRadioChoice.tsx";
import { OFFERING_BOX_QUESTIONS, OFFERING_QUESTIONS, offeringChoose, type OfferingAnswers, type OfferingContext, type OfferingQuestionId, offeringAsks, offeringInfo, offeringOptionsWith, offeringWho } from "../../../../framework/engine/OfferingQuestions.ts";
import { type SegmentQuestion, segmentRowChoice } from "../../../../framework/engine/SegmentQuestions.ts";
import { summaryText } from "../../cards/cardSummary.ts";
import OptionPicker from "../../fields/OptionPicker.tsx";
import { CATEGORY_OTHER, NOTE_PLACEHOLDERS, SUBSECTIONS } from "./shared.tsx";
import type { FoundationCardScope } from "./useFoundationSubsections.tsx";

/** `read`: the Segment's functional needs, and each Offering's context and answers as the cards show them (the Value Proposition reads them too). */
export function offeringCard(scope: FoundationCardScope, offering: BusinessOfferingValue, index: number, read: { needs: ReturnType<typeof businessSegmentFunctionalItems>; offeringContext: (offering: BusinessOfferingValue) => OfferingContext; offeringAnswers: readonly OfferingAnswers[] }): ReactNode {

    const { card, description, disabled, groupFold, labelled, remove, segment, segmentIndex, segmentPath, updateSegment } = scope;
    const { needs, offeringContext, offeringAnswers } = read;

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
                (one question per band, O3b too), then its optional Notes, the box's saved text. A starting value shows until changed. */}
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
                    const chosen = shown[id] ?? [];
                    // (A retired option still saved shows until it is unticked: offeringOptionsWith.)
                    const options = offeringOptionsWith(id, context, chosen, shown).map(option => ({ ...option }));
                    // (Of the end user or the buyer where the buyer is Proxy: offeringWho, 2026-11-09.)
                    const label = offeringWho(id, question.label, context);
                    return (
                        <FieldRow key={id} pair fullList label={label} info={[...offeringInfo(id, context)]}
                            labelNote={question.max !== undefined ? <span className="business-foundation-tick-note">{question.max + " max"}</span> : undefined}>
                            {question.many
                                ? (
                                    <div className="radio-choice legal-entity-radio-stack" role="group" aria-label={label}>
                                        <BusinessTicks name={whose + " " + label} disabled={disabled} options={options} chosen={chosen} max={question.max} onChange={(next) => write(id, next)} />
                                    </div>
                                )
                                // A radio of short options stands in one row, as on the Segment and the Profile.
                                : segmentRowChoice({ ...question, box: "demographics" } as unknown as SegmentQuestion, options)
                                    ? <FittingRadioChoice label={label} group={offering.id + "-" + id} disabled={disabled} value={chosen[0] ?? ""} onChange={(next) => write(id, [next])} options={options} />
                                    : <RadioChoice label={label} group={offering.id + "-" + id} className="legal-entity-radio-stack" disabled={disabled} value={chosen[0] ?? ""} onChange={(next) => write(id, [next])} options={options} />}
                        </FieldRow>
                    );
                };
                // The boxes of one section, each asking its questions (one question per band), then its Notes, the box's saved text.
                const parts = (list: typeof SUBSECTIONS.offerings.description) => list.map(part => {
                    // (One question per band: each asked question is one entry of the box's bands.)
                    const asked = (OFFERING_BOX_QUESTIONS[part.id] ?? []).filter(id => offeringAsks(id, context));
                    return {
                        ...part,
                        questions: [...(part.id === "benefit" ? [<Fragment key="needs">{needsBand}</Fragment>] : []), ...asked.map(ask)],
                        note: true,
                        placeholder: NOTE_PLACEHOLDERS[part.id],
                        level: 4,
                        weight: 2 + (asked.length + (part.id === "benefit" ? 1 : 0)) * 4
                    };
                });
                // Two sections, as the Profile's (owner, 2026-11-09): Description (Function, Customer Benefit, Content & Scope) and Terms & Service (Purchase & Delivery,
                // Support & Communication, Requirements & Conditions), the shared double rule between them; both keep their text in the Offering's one Description.
                return (
                    <>
                        {description(whose, parts(SUBSECTIONS.offerings.description), offering.description, (next) => change({ description: next }), true, undefined, groupFold(offering.id, "Description", whose), true)}
                        <div className="business-capability-card-rule legal-entity-org-rule business-capability-card-rule-double business-profile-section-rule" role="separator" />
                        {description(whose, parts(SUBSECTIONS.offerings.terms), offering.description, (next) => change({ description: next }), true, undefined, groupFold(offering.id, "Terms & Service", whose), true, "Terms & Service")}
                    </>
                );
            })()}

        </>
    );

}

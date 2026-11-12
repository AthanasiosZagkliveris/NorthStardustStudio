/**
 * THE EDITOR'S STATE: the folds, the writes and the small cells (label, text, note, group, description).
 * One part of BusinessFoundationEditor (see BusinessFoundationEditor.tsx): what it needs of the parts before it comes in as `earlier`; what the parts after it need goes out.
 */
import TickField from "../../../controls/TickField.tsx";
import { CSSProperties, Fragment, ReactNode, useEffect, useRef, useState } from "react";
import FieldLabel from "../../../controls/FieldLabel.tsx";
import { BusinessCustomerProfileValue, BusinessCustomerSegmentValue, BusinessDescriptionValue, BusinessFoundationValue, asBusinessFoundationValue } from "../../../../framework/engine/AnswerUtils.ts";
import { BusinessField, BusinessGroup, BusinessNote, BusinessText, OptionalNote } from "../../cards/BusinessCardFields.tsx";
import InfoNote, { InfoPoint, InfoText } from "../../fields/InfoNote.tsx";
import { FieldMark, FieldStatus } from "../../fields/fieldMarks.tsx";
import StrategyTextArea from "../../fields/StrategyTextArea.tsx";
import { useItemFolds } from "../../fields/useItemFolds.ts";
import { toggledIn } from "../../fields/toggledIn.ts";
import { BusinessFoundationEditorProps, DescriptionPart, OPTIONAL_DESCRIPTION_PART, SingleColumn } from "./shared.tsx";
import { createBusinessCustomerSegment, segmentHue } from "../../../../framework/engine/AnswerUtils.ts";
import { segmentSettle } from "../../../../framework/engine/SegmentQuestions.ts";
import { segmentContextFor } from "../../../../framework/engine/SegmentContext.ts";

export function useFoundationState(props: BusinessFoundationEditorProps) {

    const {

    value,

    onChange,

    disabled = false,

    showInstructions = true,

    columnsDivider,

    targetAudience = "",

    identity,

    asTiles = false

} = props;

    const foundation = asBusinessFoundationValue(value);
    /**
     * The cards folded away, by key.
     *
     * Not stored with the answer: which cards a reader has closed
     * is how they are looking at the page, not part of what they
     * have said. Everything starts open.
     */
    const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
    // The groups folded inside the Profile, Competitor and Offering
    // cards (see groupFold): every group starts open.
    const [foldedGroups, setFoldedGroups] = useState<ReadonlySet<string>>(new Set());
    /**
     * Which Profile, Competitor and Offering cards are open. These
     * three item kinds start CLOSED -- see useItemFolds -- unlike
     * the Segment above them, which stays on `collapsed` and so
     * starts open.
     */
    const folds = useItemFolds();
    // The latest answer (a card made by a tile's "+" is judged blank, and removed, against the answer as it is by then), the cards as they are built (a tile
    // opens ONE of them floating) and whether the cards being built are opened for that (no fold arrow).
    const latest = useRef(foundation);
    latest.current = foundation;
    const built = new Map<string, ReactNode>();
    const forceOpen = { current: false };
    function update(patch: Partial<BusinessFoundationValue>) {
        onChange({ ...foundation, ...patch });
    }

    /*
        Where Positioning chose both B2C and B2B, the first two Segment cards are made for the user and are not asked: the first is of people, the second of businesses
        (the kind is the presence of the Business Data key). A Segment added after them asks who its customer is.
    */
    const relationships = identity?.relationships ?? [];
    const bothChosen = relationships.includes("b2c") && relationships.some(id => id === "b2b" || id === "b2g" || id === "g2b");
    const [first, second] = foundation.segments;
    const needsFix = bothChosen && !disabled && (!second || first.description[OPTIONAL_DESCRIPTION_PART] !== undefined || second.description[OPTIONAL_DESCRIPTION_PART] === undefined);
    useEffect(() => {
        if (!needsFix) {
            return;
        }
        const current = latest.current.segments;
        const made = [current[0], current[1] ?? createBusinessCustomerSegment(current.map(segmentHue))].map((segment, at) => {
            const description = { ...segment.description };
            if (at === 0) {
                delete description[OPTIONAL_DESCRIPTION_PART];
            } else {
                description[OPTIONAL_DESCRIPTION_PART] = description[OPTIONAL_DESCRIPTION_PART] ?? "";
            }
            return { ...segment, description, questions: segmentSettle(segment.questions, segmentContextFor(identity, at === 1)) };
        });
        onChange({ ...latest.current, segments: [...made, ...current.slice(2)] });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [needsFix]);
    function updateSegment(index: number, patch: Partial<BusinessCustomerSegmentValue>) {
        update({
            segments: foundation.segments.map(
                (segment, position) => position === index
                    ? { ...segment, ...patch }
                    : segment
            )
        });
    }
    function updateProfile(
        segmentIndex: number,
        profileIndex: number,
        patch: Partial<BusinessCustomerProfileValue>
    ) {
        updateSegment(segmentIndex, {
            profiles: foundation.segments[segmentIndex].profiles.map(
                (profile, position) => position === profileIndex
                    ? { ...profile, ...patch }
                    : profile
            )
        });
    }
    /* ---------- Building blocks ----------

       Every one of these is now a thin call on the shared pieces in
       BusinessCardFields, which is where they were moved when the
       Customer Engagement page (Page 2) turned out to be built from
       exactly the same ones. They are kept here as functions so
       that not one call site below had to change -- what moved is
       the markup, not the way this page reads. */

    /** A label, with its "i" note when the specification gives one. */
    function labelled(
        label: string,
        control: ReactNode,
        info?: InfoPoint[]
    ) {
        return (
            /* A single choice (a Competitor's or an Offering's Type): its
               label beside it, only as wide as its word, on the picker's
               line -- a compact run of its own, so the card's labels above
               do not pull it on top (.business-field-run-compact). */
            <div className="business-field-run business-field-run-compact">
                <BusinessField label={label} info={info} inline>
                    {control}
                </BusinessField>
            </div>
        );
    }
    function text(
        label: string,
        current: string,
        onNext: (next: string) => void,
        info?: InfoPoint[]
    ) {
        return (
            <BusinessText
                label={label}
                value={current}
                onChange={onNext}
                info={info}
                disabled={disabled}
            />
        );
    }
    function note(
        label: string,
        current: string,
        onNext: (next: string) => void,
        info?: InfoPoint[],
        /** Which Profile or Competitor this is, for assistive technology. */
        whose?: string
    ) {
        return (
            <BusinessNote
                label={label}
                ariaLabel={whose ? whose + " " + label : undefined}
                value={current}
                onChange={onNext}
                info={info}
                disabled={disabled}
            />
        );
    }
    /**
     * A named group of fields inside a card -- the treatment
     * "SWOT Analysis" already had. Its title is a
     * subhead rather than a field label, so several fields can
     * belong to it and read as one piece of work.
     */
    function group(
        title: string,
        children: ReactNode,
        info?: InfoPoint[],
        fold?: { open: boolean; label: string; onToggle: () => void }
    ) {
        return (
            <BusinessGroup title={title} info={info} fold={fold}>
                {children}
            </BusinessGroup>
        );
    }
    /**
     * A group inside a Profile, Competitor or Offering card that folds
     * (its Description, Motivations, Needs, SWOT): open until folded,
     * remembered while the page is open, as the cards' own folds are.
     */
    function groupFold(itemId: string, title: string, path: string) {
        const key = itemId + " " + title;
        return {
            open: !foldedGroups.has(key),
            label: path + " → " + title,
            onToggle: () => setFoldedGroups(current => toggledIn(current, key))
        };
    }
    /**
     * A Description: one box per named parameter, under one title.
     *
     * It used to be a single box with every parameter's name listed
     * in its placeholder. A box each is the same list made
     * answerable: the parameter names the box, and its "i" carries
     * the question. The question is not repeated inside the box --
     * a prompt that vanishes on the first keystroke is not where an
     * explanation belongs.
     *
     * `kind` only names the fields for a screen reader. Four cards
     * on this page each ask for a "Description", so "Segment
     * description: Demographics" says which one is being read out.
     *
     * `split` lays the parts out in two columns instead of one
     * stack -- for the Segment, whose Description runs the whole
     * width of the card and would otherwise be five boxes in a
     * very long line.
     */
    function description(
        kind: string,
        parts: DescriptionPart[],
        current: BusinessDescriptionValue,
        onNext: (next: BusinessDescriptionValue) => void,
        split = false,
        /** The card, for a Description that sits outside its card's section (the Segment's). */
        anchor?: string,
        /** Its fold, where the group folds (see groupFold). */
        fold?: { open: boolean; label: string; onToggle: () => void },
        /** The boxes of questions in ONE column, in their order (the Profile's card, which floats at the width every floating card has). */
        oneColumn = false,
        /** The section's title and its "i": a Profile with an end user has two, "The buyer" and "The end user" (doc 36, 2.1). */
        title = "Description",
        info?: InfoPoint[]
    ) {

        const box = (part: DescriptionPart) => {

            /*
                A parameter that only applies to some organizations
                asks whether it applies before asking anything else.
                Business Data is the one: "IF YOU SELL TO COMPANIES,
                what is their company type, size and industry?" --
                so a founder selling to people is asked one question
                rather than left looking at a box they should skip.

                The tick is the presence of the parameter's own key.
                Nothing extra is stored to remember it, and an
                answer that already has text reads as ticked.
            */
            const optional = part.id === OPTIONAL_DESCRIPTION_PART && !part.always;

            const asked = !optional || current[part.id] !== undefined;

            const labelRow = (
                    <span className={"business-foundation-label-info" + (part.questions ? " legal-entity-label-info" : "")}>

                        {optional ? (
                            /*
                                The tick and its name are one label,
                                so the name is clickable. The "i"
                                follows OUTSIDE it: anything inside a
                                label toggles the tick it belongs to,
                                so a button in there would tick the
                                box every time someone asked what it
                                meant.
                            */
                            <TickField className="business-foundation-tick business-foundation-tick-inline" disabled={disabled} checked={asked} onChange={(event) => {
                                        const next = { ...current };
                                        if (event.target.checked) {
                                            next[part.id] = "";
                                        } else {
                                            delete next[part.id];
                                        }
                                        onNext(next);
                                    }}>
                                <FieldLabel className="business-foundation-label">
                                    {part.title}
                                </FieldLabel>
                            </TickField>
                        ) : (
                            /* Glued to the name's last word, as every
                               label's "i" is (see InfoText). */
                            <FieldLabel className="business-foundation-label" role="heading" aria-level={part.level ?? 3}>
                                <InfoText text={part.title}>
                                    <InfoNote
                                        label={part.title}
                                        points={[part.text, ...(part.extra ?? [])]}
                                        fullList
                                    />
                                </InfoText>
                                <FieldMark label={part.title} anchor={anchor} />
                            </FieldLabel>
                        )}

                        {optional && (
                            <InfoNote
                                label={part.title}
                                points={[part.text, ...(part.extra ?? [])]}
                                fullList
                            />
                        )}

                        {optional && <FieldMark label={part.title} anchor={anchor} />}

                        <FieldStatus label={part.title} anchor={anchor} />

                    </span>
            );

            // A box with questions (the Segment's) is laid out as the Positioning card is: its title over a divider line, then each question a band (see below).
            if (part.questions) {
                return (
                    <div className="business-segment-box" key={part.id}>
                        <div className="legal-entity-org-section">{labelRow}</div>
                        {asked && (part.body ?? part.questions.map((question, at) => (
                            <div className={"legal-entity-org-section" + (at % 2 === 1 ? " legal-entity-org-band" : "")} key={at}>{question}</div>
                        )))}
                        {/* The box ends with the shared Note (the tick and the word, as every card has), ticked where it holds words. */}
                        {part.note && (
                            <div className={"legal-entity-org-section business-note-band" + (part.questions.length % 2 === 1 ? " legal-entity-org-band" : "")}>
                                <OptionalNote
                                    label="Notes"
                                    fieldId={part.noteId ?? part.title + " notes"}
                                    ariaLabel={kind + " description: " + part.title + " notes"}
                                    info={part.noteInfo}
                                    disabled={disabled}
                                    value={part.noteValue ?? current[part.id] ?? ""}
                                    onChange={(next) => part.onNote ? part.onNote(next) : onNext({ ...current, [part.id]: next })}
                                />
                            </div>
                        )}
                    </div>
                );
            }

            return (
                <div className="business-foundation-field" key={part.id}>

                    {labelRow}

                    {asked && (
                        <StrategyTextArea
                            className="interview-input business-foundation-note"
                            ariaLabel={kind + " description: " + part.title}
                            disabled={disabled}
                            value={current[part.id] ?? ""}
                            onChange={(next) => onNext({
                                ...current,
                                [part.id]: next
                            })}
                        />
                    )}

                </div>
            );

        };

        /** The boxes of a column, a double rule between one box and the next (as between the Positioning card's groups). */
        const column = (list: DescriptionPart[]) => list.map((part, at) => (
            <Fragment key={part.id}>
                {at > 0 && <div className="business-capability-card-rule legal-entity-org-rule business-capability-card-rule-double" role="separator" />}
                {box(part)}
            </Fragment>
        ));

        // Three then two, for the Segment's five: the first column
        // takes the larger half so the two read top-to-bottom,
        // left-to-right.
        const half = Math.ceil(parts.length / 2);

        // The rows of the one grid both columns fill: auto, but the last
        // flexible, so the shorter column's last field (it spans down to
        // it) never stretches a row it shares with the longer column's.
        const descriptionTemplate = half > 1
            ? "repeat(" + (half - 1) + ", auto) 1fr"
            : "auto";

        // The columns of the questions' layout are of one height: the boxes are shared between them, each column keeping the order of the boxes, in the way that leaves the two nearest in height
        // (the first box stays in the left column).
        const weights = parts.map(part => part.weight ?? 1);
        const total = weights.reduce((sum, weight) => sum + weight, 0);
        let leftSet = new Set(parts.slice(0, Math.min(half, parts.length)).map(part => part.id));
        let best = Infinity;
        for (let mask = 1; mask < (1 << parts.length) - 1; mask++) {
            // (A box that stays with the first, the Segment's End user part, stands in the left column too.)
            if (!(mask & 1) || parts.some((part, at) => part.withFirst && !(mask & (1 << at)))) {
                continue;
            }
            const left = weights.reduce((sum, weight, at) => sum + (mask & (1 << at) ? weight : 0), 0);
            const gap = Math.abs(total - 2 * left);
            if (gap < best) {
                best = gap;
                leftSet = new Set(parts.filter((_part, at) => mask & (1 << at)).map(part => part.id));
            }
        }
        const leftBoxes = parts.filter(part => leftSet.has(part.id));
        const rightBoxes = parts.filter(part => !leftSet.has(part.id));

        const boxes = split && oneColumn && parts.some(part => part.questions)
            ? <SingleColumn>{column(parts)}</SingleColumn>
            : split && parts.some(part => part.questions)
            ? (
                <div className="legal-entity-grid legal-entity-grid-pairs legal-entity-grid-organization legal-entity-audience business-segment-grid">
                    <div className="legal-entity-field">{column(leftBoxes)}</div>
                    <div className="legal-entity-field legal-entity-questions">{column(rightBoxes)}</div>
                </div>
            )
            : split
                ? (
                    <div
                        className="business-foundation-description-split"
                        style={{
                            "--description-template": descriptionTemplate,
                            "--description-tail": half - (parts.length - half) + 1
                        } as CSSProperties}
                    >
                        <div className="business-foundation-description-column">
                            {parts.slice(0, half).map(box)}
                        </div>
                        <div className="business-foundation-description-column">
                            {parts.slice(half).map(box)}
                        </div>
                    </div>
                )
                : parts.map(box);

        return group(
            title,
            boxes,
            info,
            fold
        );

    }

    return { asTiles, built, collapsed, columnsDivider, description, disabled, folds, forceOpen, foundation, group, groupFold, labelled, latest, note, onChange, setCollapsed, showInstructions, targetAudience, identity, text, update, updateProfile, updateSegment };

}

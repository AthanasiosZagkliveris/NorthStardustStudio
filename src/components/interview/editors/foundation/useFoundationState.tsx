/**
 * THE EDITOR'S STATE: the folds, the writes and the small cells (label, text, note, group, description).
 * One part of BusinessFoundationEditor (see BusinessFoundationEditor.tsx): what it needs of the parts before it comes in as `earlier`; what the parts after it need goes out.
 */
import TickField from "../../../controls/TickField.tsx";
import { CSSProperties, ReactNode, useRef, useState } from "react";
import FieldLabel from "../../../controls/FieldLabel.tsx";
import { BusinessCustomerProfileValue, BusinessCustomerSegmentValue, BusinessDescriptionValue, BusinessFoundationValue, asBusinessFoundationValue } from "../../../../framework/engine/AnswerUtils.ts";
import { BusinessField, BusinessGroup, BusinessNote, BusinessText } from "../../cards/BusinessCardFields.tsx";
import InfoNote, { InfoPoint, InfoText } from "../../fields/InfoNote.tsx";
import { FieldMark, FieldStatus } from "../../fields/fieldMarks.tsx";
import StrategyTextArea from "../../fields/StrategyTextArea.tsx";
import { useItemFolds } from "../../fields/useItemFolds.ts";
import { toggledIn } from "../../fields/toggledIn.ts";
import { BusinessFoundationEditorProps, DescriptionPart, OPTIONAL_DESCRIPTION_PART } from "./shared.tsx";

export function useFoundationState(props: BusinessFoundationEditorProps) {

    const {

    value,

    onChange,

    disabled = false,

    showInstructions = true,

    columnsDivider,

    targetAudience = "",

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
     * "Competitors SWOT Analysis" already had. Its title is a
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
        fold?: { open: boolean; label: string; onToggle: () => void }
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
            const optional = part.id === OPTIONAL_DESCRIPTION_PART;

            const asked = !optional || current[part.id] !== undefined;

            return (
                <div className="business-foundation-field" key={part.id}>

                    <span className="business-foundation-label-info">

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
                            <FieldLabel className="business-foundation-label">
                                <InfoText text={part.title}>
                                    <InfoNote
                                        label={part.title}
                                        points={[part.text]}
                                        fullList
                                    />
                                </InfoText>
                                <FieldMark label={part.title} anchor={anchor} />
                            </FieldLabel>
                        )}

                        {optional && (
                            <InfoNote
                                label={part.title}
                                points={[part.text]}
                                fullList
                            />
                        )}

                        {optional && <FieldMark label={part.title} anchor={anchor} />}

                        <FieldStatus label={part.title} anchor={anchor} />

                    </span>

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

        return group(
            "Description",
            split
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
                : parts.map(box),
            undefined,
            fold
        );

    }

    return { asTiles, built, collapsed, columnsDivider, description, disabled, folds, forceOpen, foundation, group, groupFold, labelled, latest, note, onChange, setCollapsed, showInstructions, targetAudience, text, update, updateProfile, updateSegment };

}

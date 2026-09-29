import { ReactNode, useEffect, useRef, useState } from "react";

import InfoNote, { InfoPoint, InfoText } from "./InfoNote.tsx";
import { FieldMark, FieldStatus } from "./fieldMarks.tsx";
import StrategyTextArea from "./StrategyTextArea.tsx";
import FoldArrow from "./FoldArrow.tsx";
import CardNumber from "./CardNumber.tsx";
import CardNameInput from "./CardNameInput.tsx";

import "../../styles/card-folding.css";

/**
 * The pieces every Business System page is built out of.
 *
 * They were written inside the Foundation page (Page 1) as local
 * helpers, which was right while there was one page using them.
 * Customer Engagement (Page 2) is built from exactly the same
 * pieces -- the same card head, the same label-and-"i", the same
 * add and delete controls -- and a second page is the point at
 * which a copy becomes two things free to drift apart.
 *
 * So they live here, once, and every Business page imports them --
 * Foundation, Customer Engagement, Infrastructure & Capability and
 * the two Financial pages. Page 1's own helpers delegate to these:
 * the markup and the class names here are its markup and its class
 * names, moved rather than rewritten.
 *
 * Everything is a component rather than a function returning
 * markup, because that is what lets them be shared: the originals
 * closed over the editor's `disabled` flag and its collapsed-card
 * state, neither of which another page can reach.
 */

/* ---------------------------------------------------------------
   Labels and fields
--------------------------------------------------------------- */

/**
 * A label, with its "i" note when the specification gives one, and
 * whatever control it names underneath.
 */
export function BusinessField({

    label,

    info,

    inline = false,

    children

}: {

    label: string;
    info?: InfoPoint[];
    /** The label beside its control rather than above it. */
    inline?: boolean;
    children: ReactNode;

}) {

    return (
        <div className={"business-foundation-field" + (inline ? " business-field-inline" : "")}>

            {info
                ? (
                    <span className="business-foundation-label-info">
                        <span className="field-label business-foundation-label">
                            <InfoText text={label}>
                                <InfoNote label={label} points={info} fullList />
                            </InfoText>
                            <FieldMark label={label} />
                        </span>
                        <FieldStatus label={label} />
                    </span>
                )
                : (
                    <span className="field-label business-foundation-label">
                        {label}
                        <FieldMark label={label} />
                        <FieldStatus label={label} />
                    </span>
                )}

            {children}

        </div>
    );

}

/**
 * A named group of fields inside a card. Its title is a subhead
 * rather than a field label, so several fields can belong to it
 * and read as one piece of work.
 */
export function BusinessGroup({

    title,

    info,

    titleExtra,

    children

}: {

    title: string;
    info?: InfoPoint[];
    /**
     * Drawn at the far end of the title's own row -- the group's
     * "Expand all" (see .fold-group-head), so it never adds a line.
     */
    titleExtra?: ReactNode;
    children: ReactNode;

}) {

    const heading = info
        ? (
            <span className="business-foundation-label-info">
                <span className="field-group-title business-foundation-subhead">
                    <InfoText text={title}>
                        <InfoNote label={title} points={info} fullList />
                    </InfoText>
                </span>
            </span>
        )
        : <span className="field-group-title business-foundation-subhead">{title}</span>;

    return (
        <>

            {titleExtra
                ? (
                    <div className="fold-group-head">
                        {heading}
                        {titleExtra}
                    </div>
                )
                : heading}

            {children}

        </>
    );

}

/** A one-line answer. */
export function BusinessText({

    label,

    value,

    onChange,

    info,

    placeholder,

    disabled = false,

    ariaLabel,

    inline = false

}: {

    label: string;
    value: string;
    onChange: (next: string) => void;
    info?: InfoPoint[];
    placeholder?: string;
    disabled?: boolean;
    /** When several fields share a label: which one this is. */
    ariaLabel?: string;
    inline?: boolean;

}) {

    return (
        <BusinessField label={label} info={info} inline={inline}>
            <input
                type="text"
                className="interview-input"
                aria-label={ariaLabel ?? label}
                placeholder={placeholder}
                disabled={disabled}
                value={value}
                onChange={(event) => onChange(event.target.value)}
            />
        </BusinessField>
    );

}

/**
 * A written answer, in a box that grows with what is in it and
 * shrinks back when it is deleted (see StrategyTextArea).
 */
export function BusinessNote({

    label,

    value,

    onChange,

    info,

    ariaLabel,

    disabled = false

}: {

    label: string;
    value: string;
    onChange: (next: string) => void;
    info?: InfoPoint[];
    /** When the label alone would not say which box this is. */
    ariaLabel?: string;
    disabled?: boolean;

}) {

    return (
        <BusinessField label={label} info={info}>
            <StrategyTextArea
                className="interview-input business-foundation-note"
                ariaLabel={ariaLabel ?? label}
                disabled={disabled}
                value={value}
                onChange={onChange}
            />
        </BusinessField>
    );

}

/**
 * AN OPTIONAL FIELD, OPENED BY ITS TICK BOX: [☐ Label ⓘ].
 *
 * For the secondary, optional text inside a card -- Conditions,
 * Relevant Information, Links, Assumptions -- never a card's primary
 * question. Unticked, only that one line shows and the field is
 * simply not answered. Ticked, the field appears under it and takes
 * the focus. A field that already has content loads ticked.
 *
 * Unticking a field WITH content clears it, so it asks first: an
 * inline "Remove text?" beside the tick box, which a second click
 * confirms (no dialogs). Nothing hidden is ever kept, so nothing
 * hidden can reach the documents.
 *
 * The same checkbox-and-label as the Foundation page's Business
 * Data (.business-foundation-tick). No field menu
 * (`data-field-kind="optional"`, fieldMarks.tsx).
 */
export function OptionalField({

    label,

    info,

    filled,

    onClear,

    disabled = false,

    children

}: {

    label: string;
    info?: InfoPoint[];
    /** Whether the field holds anything: it then loads ticked. */
    filled: boolean;
    /** Empties the field (after "Remove text?"). */
    onClear: () => void;
    disabled?: boolean;
    children: ReactNode;

}) {

    const [open, setOpen] = useState(filled);
    const [confirming, setConfirming] = useState(false);
    const [focusOnOpen, setFocusOnOpen] = useState(false);
    const body = useRef<HTMLDivElement | null>(null);
    const tick = useRef<HTMLInputElement | null>(null);
    const shown = open || filled;

    useEffect(() => {
        if (!focusOnOpen || !shown) {
            return;
        }
        setFocusOnOpen(false);
        body.current?.querySelector<HTMLElement>("textarea, input, [contenteditable=true]")?.focus({ preventScroll: true });
    }, [focusOnOpen, shown]);

    function clear() {
        // TODO(C1): switch this confirmation to the undo toast.
        onClear();
        setOpen(false);
        setConfirming(false);
        tick.current?.focus({ preventScroll: true });
    }

    return (
        <div className="business-foundation-field optional-field" data-field-kind="optional">

            {/*
                The tick and its name are one label, so the name is
                clickable. The "i" follows OUTSIDE it: anything inside
                a label toggles the tick it belongs to.
            */}
            <span className="business-foundation-label-info optional-field-head">
                <label className="business-foundation-tick business-foundation-tick-inline">
                    <input
                        type="checkbox"
                        ref={tick}
                        className="brand-tick-box"
                        disabled={disabled}
                        checked={shown}
                        onChange={(event) => {
                            if (event.target.checked) {
                                setOpen(true);
                                setConfirming(false);
                                setFocusOnOpen(true);
                            } else if (filled) {
                                setConfirming(true);
                            } else {
                                setOpen(false);
                            }
                        }}
                    />
                    <span className="field-label business-foundation-label">
                        {label}
                        <FieldMark label={label} />
                    </span>
                </label>
                {info && <InfoNote label={label} points={info} fullList />}
                {confirming && (
                    <button
                        type="button"
                        className="optional-field-confirm"
                        autoFocus
                        onClick={clear}
                        onBlur={() => setConfirming(false)}
                        onKeyDown={(event) => {
                            if (event.key === "Escape") {
                                event.stopPropagation();
                                setConfirming(false);
                                tick.current?.focus({ preventScroll: true });
                            }
                        }}
                    >
                        Remove text?
                    </button>
                )}
            </span>

            {shown && <div className="optional-field-body" ref={body}>{children}</div>}

        </div>
    );

}

/**
 * OptionalField holding a written answer: the growing box of
 * BusinessNote, behind its tick box.
 */
export function OptionalNote({

    label,

    value,

    onChange,

    info,

    ariaLabel,

    placeholder,

    className = "interview-input business-foundation-note",

    disabled = false

}: {

    label: string;
    value: string;
    onChange: (next: string) => void;
    info?: InfoPoint[];
    ariaLabel?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;

}) {

    return (
        <OptionalField label={label} info={info} filled={value.trim() !== ""} onClear={() => onChange("")} disabled={disabled}>
            <StrategyTextArea
                className={className}
                ariaLabel={ariaLabel ?? label}
                placeholder={placeholder}
                disabled={disabled}
                value={value}
                onChange={onChange}
            />
        </OptionalField>
    );

}

/**
 * What a section says when there is nothing for it to show yet --
 * and, where it is waiting on another page, where to go and answer
 * it. A blank space answers a question with silence.
 */
export function BusinessEmpty({ children }: { children: ReactNode }) {
    return <p className="business-foundation-empty">{children}</p>;
}

/* ---------------------------------------------------------------
   Choosing from a fixed list
--------------------------------------------------------------- */

/** One thing that can be ticked. */
export interface BusinessTickOption {
    id: string;
    label: string;
    /** Shown after the label, for a list whose names need one. */
    meaning?: string;
}

/**
 * A set of tick boxes: the control for a choice that is a SET
 * rather than one value.
 *
 * The Foundation page chooses an Offering's Needs this way, and
 * this page chooses a channel's Offerings and journey stages, a
 * Profile's relationship types and an interaction's goals. All of
 * them are "one or more of these", and a dropdown that has to be
 * opened once per choice is the wrong shape for that.
 *
 * `meaning` is drawn beside the name for a list whose names need
 * it -- today the Financial Foundation's Funding Needs, each shown
 * with its amount.
 */
export function BusinessTicks({

    name,

    options,

    chosen,

    onChange,

    disabled = false

}: {

    /** Names the group for assistive technology. */
    name: string;
    options: readonly BusinessTickOption[];
    chosen: readonly string[];
    onChange: (next: string[]) => void;
    disabled?: boolean;

}) {

    return (
        <>
            {options.map(option => (

                <label className="business-foundation-tick" key={option.id}>

                    <input
                        type="checkbox"
                        className="brand-tick-box"
                        /* The group's name in front of the box's
                           own, because a page can hold the same
                           five stages a dozen times over and
                           "Discovery" alone says nothing about
                           which one is being read out.

                           It carries the WHOLE of the visible
                           label, meaning included -- an accessible
                           name has to contain the label a speech
                           user can see (SC 2.5.3). */
                        aria-label={
                            name + ": " + option.label +
                            (option.meaning === undefined
                                ? ""
                                : ": " + option.meaning)
                        }
                        disabled={disabled}
                        checked={chosen.includes(option.id)}
                        onChange={(event) => onChange(
                            event.target.checked
                                // Kept in the order the LIST gives,
                                // not the order they were ticked, so
                                // two people who chose the same
                                // things see the same page.
                                ? options
                                    .map(entry => entry.id)
                                    .filter(id =>
                                        id === option.id || chosen.includes(id)
                                    )
                                : chosen.filter(id => id !== option.id)
                        )}
                    />

                    <span className="business-foundation-tick-label">
                        {option.meaning === undefined
                            ? option.label
                            : (
                                <>
                                    <strong className="business-tick-name">
                                        {option.label}
                                    </strong>
                                    {": " + option.meaning}
                                </>
                            )}
                    </span>

                </label>

            ))}
        </>
    );

}

/**
 * A set of named things as choices for a picker, each with a label
 * no other one in the set shares.
 *
 * A picker works in NAMES and stores an ID, so two things called
 * "Website", or two that have not been named at all, have to stay
 * tellable apart or choosing one would be choosing either. A repeat
 * is numbered rather than hidden, so both stay selectable.
 */
export function uniqueChoices(
    entries: readonly { id: string; name: string }[],
    fallback: string
): { id: string; label: string }[] {

    const used = new Map<string, number>();

    return entries.map(entry => {

        const base = entry.name.trim().length > 0 ? entry.name.trim() : fallback;

        const seen = (used.get(base) ?? 0) + 1;

        used.set(base, seen);

        return {
            id: entry.id,
            label: seen === 1 ? base : base + " (" + seen + ")"
        };

    });

}

/* ---------------------------------------------------------------
   Cards
--------------------------------------------------------------- */

/** The delete control every card carries. */
export function BusinessRemove({

    what,

    onRemove,

    disabled = false

}: {

    what: string;
    onRemove: () => void;
    disabled?: boolean;

}) {

    return (
        <button
            type="button"
            className="strategy-box-remove"
            aria-label={"Remove " + what}
            title={"Remove " + what}
            disabled={disabled}
            onClick={onRemove}
        >
            ×
        </button>
    );

}

/**
 * The add, or the ×, for a value that is one of several.
 *
 * The add is the app's one labelled add button, "+ Add Offering",
 * as everywhere else (.strategy-add-button, drawn in its card's
 * colour family): a bare "+" said nothing about what it adds. It
 * stands on its own line under the last value (.business-step-add-
 * row), so a narrow column does not have to hold it beside the
 * field. The × is the 32px remove every card carries.
 */
export function BusinessStep({

    kind,

    what,

    label,

    onClick,

    disabled = false

}: {

    kind: "add" | "remove";
    /** What is added or taken away, for the control's own name. */
    what: string;
    /**
     * The add's visible name where `what` carries more ("Relationship
     * Type" for "Relationship Type for AI Workflow Audit").
     */
    label?: string;
    onClick: () => void;
    disabled?: boolean;

}) {

    const adding = kind === "add";

    if (adding) {
        return (
            <div className="business-step-add-row">
                <button
                    type="button"
                    className="strategy-add-button"
                    /* Its name starts with the words it shows, then says
                       which one: "Add Relationship Type for …". */
                    aria-label={"Add " + what}
                    disabled={disabled}
                    onClick={onClick}
                >
                    {"+ Add " + (label ?? what)}
                </button>
            </div>
        );
    }

    return (
        <button
            type="button"
            /* The remove is the app's one remove control, the 32px ×
               every card carries (.strategy-box-remove), not a small
               minus of its own. */
            className="strategy-box-remove"
            aria-label={"Remove this " + what}
            title={"Remove this " + what}
            disabled={disabled}
            onClick={onClick}
        >
            ×
        </button>
    );

}

export function BusinessAddButton({

    label,

    onAdd,

    disabled = false

}: {

    label: string;
    onAdd: () => void;
    disabled?: boolean;

}) {

    return (
        <button
            type="button"
            className="strategy-add-button"
            disabled={disabled}
            onClick={onAdd}
        >
            {"+ Add " + label}
        </button>
    );

}

/**
 * One input card: its head, and its fields when it is open.
 *
 * Built the way the Strategic Period page builds its Theme, Goal
 * and Objective boxes: the toggle, the number (CardNumber -- no kind
 * word: the list's own title names these cards), THE NAME ASKED in
 * the head itself, then the card's controls.
 *
 * The name is asked once, in the one place it is also read -- and
 * stays legible when the card is folded shut.
 *
 * `onName` is omitted for a card whose name is answered elsewhere
 * -- the Founder (Legal Entity), the Delivery Offering (Page 1) and
 * the Revenue Stream (its Offering) -- so the name is shown rather
 * than asked, and answering it here would be the duplication the
 * specifications forbid.
 */
export function BusinessCard({

    kind,

    number,

    name,

    onName,

    open,

    onToggle,

    actions = null,

    className,

    disabled = false,

    ariaPrefix,

    anchor,

    summary,

    children

}: {

    kind: string;
    number: number;
    name: string;
    /** Absent for a card whose name belongs to another page. */
    onName?: (next: string) => void;
    open: boolean;
    /** Absent for a card that is always open: it has no fold arrow. */
    onToggle?: () => void;
    actions?: ReactNode;
    className?: string;
    disabled?: boolean;
    /**
     * What the card sits inside, for assistive technology: "Segment 2"
     * makes "Profile 1 name" say which Segment's Profile it is.
     */
    ariaPrefix?: string;
    /** Its name for a link that opens it (see jumpTo.ts). */
    anchor?: string;
    /**
     * One line shown under the head while the card is folded, so a
     * folded list can still be read ("Costs · $35 monthly"). On its
     * own line, so it never squeezes the name beside it.
     */
    summary?: ReactNode;
    children: ReactNode;

}) {

    const who = (ariaPrefix ? ariaPrefix + ", " : "") + kind + " " + number;

    /* Folded, a card is read rather than edited: its name is text,
       as the Founder card's always is, and becomes a box once the
       card is opened. A card that cannot fold keeps its box. */
    const editable = onName !== undefined && (open || !onToggle);

    return (
        <div
            className={
                "business-foundation-card" + (className ? " " + className : "")
            }
            data-anchor={anchor}
        >

            {/* A foldable card's head is the one every folding card
                shares (.fold-card-head): arrow, number, name, remove,
                and the folded summary on a row of its own under the
                name. */}
            <div className={"strategy-box-head" + (onToggle ? " fold-card-head" : "")}>

                {onToggle && (
                    <FoldArrow open={open} label={who} onToggle={onToggle} />
                )}

                <CardNumber number={number} />

                {editable
                    ? (
                        <CardNameInput
                            ariaLabel={who + " name"}
                            placeholder={kind + " name"}
                            disabled={disabled}
                            value={name}
                            onChange={(name) => onName(name)}
                        />
                    )
                    : (
                        /* Shown, not asked. It fills the same slot
                           the input would, so a referring card and
                           an answering one have the same head. */
                        <span className="strategy-name-static">
                            {name.trim().length > 0
                                ? name
                                : "Unnamed " + kind.toLocaleLowerCase()}
                        </span>
                    )}

                {actions}

                {!open && summary && (
                    <div className="business-card-summary">{summary}</div>
                )}

            </div>

            {open && children}

        </div>
    );

}

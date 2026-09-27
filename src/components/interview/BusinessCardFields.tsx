import { ReactNode } from "react";

import InfoNote, { InfoPoint } from "./InfoNote.tsx";
import StrategyTextArea from "./StrategyTextArea.tsx";

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
 * So they live here, once, and both pages import them. Page 1's own
 * helpers now delegate to these, which is why not one of its call
 * sites changed: the markup and the class names here are its
 * markup and its class names, moved rather than rewritten.
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
                        <span className="business-foundation-label">{label}</span>
                        <InfoNote label={label} points={info} fullList />
                    </span>
                )
                : <span className="business-foundation-label">{label}</span>}

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

    children

}: {

    title: string;
    info?: InfoPoint[];
    children: ReactNode;

}) {

    return (
        <>

            {info
                ? (
                    <span className="business-foundation-label-info">
                        <span className="business-foundation-subhead">{title}</span>
                        <InfoNote label={title} points={info} fullList />
                    </span>
                )
                : <span className="business-foundation-subhead">{title}</span>}

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
 * `meaning` is drawn beside the name for the one list that needs
 * it -- Get, Keep and Grow, whose names say nothing on their own to
 * anyone who has not met the model before.
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
 * The small "+" or "−" beside a value that is one of several.
 *
 * Where a whole section grows by one card, the wide "+ Add Channel"
 * button is right -- it is a heading for what it makes. Where a
 * CELL grows by one line, it is not: a button wider than the value
 * it adds to reads as the more important of the two, and a column
 * of them reads as the page's main business.
 *
 * 28px square, which clears the 24 the target-size rule asks for
 * and matches the line the labels are set on.
 */
export function BusinessStep({

    kind,

    what,

    onClick,

    disabled = false

}: {

    kind: "add" | "remove";
    /** What is added or taken away, for the control's own name. */
    what: string;
    onClick: () => void;
    disabled?: boolean;

}) {

    const adding = kind === "add";

    return (
        <button
            type="button"
            className={"business-step business-step-" + kind}
            aria-label={(adding ? "Add another " : "Remove this ") + what}
            title={(adding ? "Add another " : "Remove this ") + what}
            disabled={disabled}
            onClick={onClick}
        >
            {adding ? "+" : "−"}
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
 * and Objective boxes: the toggle, the number and kind ("1.
 * Profile") in a .strategy-box-number, THE NAME AS AN INPUT in the
 * head itself, then the card's controls.
 *
 * The name is asked once, in the one place it is also read -- and
 * stays legible when the card is folded shut.
 *
 * `onName` is omitted for a card that REFERS to something answered
 * on another page. Page 2's Segment and Profile cards are the
 * whole of that case: they are Page 1's Segments and Profiles, so
 * the name is shown rather than asked, and answering it here would
 * be the duplication both specifications forbid.
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

    style,

    disabled = false,

    ariaPrefix,

    anchor,

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
    style?: React.CSSProperties;
    disabled?: boolean;
    /**
     * What the card sits inside, for assistive technology: "Segment 2"
     * makes "Profile 1 name" say which Segment's Profile it is.
     */
    ariaPrefix?: string;
    /** Its name for a link that opens it (see jumpTo.ts). */
    anchor?: string;
    children: ReactNode;

}) {

    const who = (ariaPrefix ? ariaPrefix + ", " : "") + kind + " " + number;

    return (
        <div
            className={
                "business-foundation-card" + (className ? " " + className : "")
            }
            style={style}
            data-anchor={anchor}
        >

            <div className="strategy-box-head">

                {onToggle && (
                    <button
                        type="button"
                        className="strategy-box-toggle"
                        aria-expanded={open}
                        aria-label={
                            (open ? "Minimize " : "Maximize ") + who
                        }
                        onClick={onToggle}
                    >
                        {open ? "▾" : "▸"}
                    </button>
                )}

                <span className="strategy-box-number">
                    {onName ? number + "." : number + ". " + kind}
                </span>

                {onName
                    ? (
                        <input
                            type="text"
                            className="interview-input strategy-name-input"
                            aria-label={who + " name"}
                            placeholder={kind + " name"}
                            disabled={disabled}
                            value={name}
                            onChange={(event) => onName(event.target.value)}
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

            </div>

            {open && children}

        </div>
    );

}

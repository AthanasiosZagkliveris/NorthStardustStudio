import { createContext, CSSProperties, ReactNode, useContext, useEffect, useRef, useState } from "react";

import RemoveButton from "../RemoveButton.tsx";
import OptionPicker from "./OptionPicker.tsx";
import InfoNote, { InfoPoint, InfoText } from "./InfoNote.tsx";
import { FieldMark, FieldStatus } from "./fieldMarks.tsx";
import StrategyTextArea from "./StrategyTextArea.tsx";
import FoldArrow from "./FoldArrow.tsx";
import { drawnTitle } from "./SectionTiles.tsx";
import CardNumber from "./CardNumber.tsx";
import CardNameInput from "./CardNameInput.tsx";
import { UndoService } from "../../services/UndoService";

import "../../styles/card-folding.css";
import TextLink from "./TextLink.tsx";

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
 * WHAT AN INCOMPLETE CARD LACKS, for the cells to show it (CardCompleteness.ts). The page gives the whole map (card id -> what it lacks); a card takes its own
 * entry and gives it to its fields, and a field that is one of those flashes the red of the card's tile and says why, in a short line under it.
 */
export const MissingMapContext = createContext<ReadonlyMap<string, readonly string[]>>(new Map());
const NO_MISSING: readonly string[] = [];
export const MissingFieldsContext = createContext<readonly string[]>([]);

/**
 * A card just made (it still lacks its Name when it opens) is quiet while it is open: nothing flashes at someone who is only starting it. It shows what it lacks
 * the next time it is opened.
 */
export function MissingScope({ lacking, children }: { lacking: readonly string[]; children: (shown: readonly string[]) => ReactNode }) {
    const [quiet] = useState(() => lacking.includes("Name"));
    const shown = quiet ? NO_MISSING : lacking;
    return <MissingFieldsContext.Provider value={shown}>{children(shown)}</MissingFieldsContext.Provider>;
}

/** The labels of the cells each thing a card can lack stands for (the lower-cased start of the field's label). */
const MISSING_LABELS: Record<string, readonly string[]> = {
    "Start date": ["start date"],
    "Status": ["status"],
    "Activity": ["activity"],
    "Partner or Supplier": ["name"],
    "Rent": ["rent"],
    "Cost option": ["cost option"],
    "Amortisation period": ["amortisation"],
    "Price": ["price"],
    "Payment Frequency": ["frequency"],
    "Payment Plan": ["payment plan"],
    "Category": ["category", "group"],
    "Group": ["group"],
    "Performer": ["performer"],
    "Responsible": ["responsible"],
    "Linked Offerings": ["linked to", "offerings"],
    "Offering shares": ["linked to"],
    "Salary": ["salary"],
    "Working Hours": ["working hrs"],
    "Delivery Hours": ["delivery hrs"]
};

/** What a missing cell says under it. */
const MISSING_WORDS: Record<string, string> = {
    "Payment Plan": "The payments must total 100%, each with a date.",
    "Offering shares": "The shares must total 100%, or every Offering needs its units.",
    "Linked Offerings": "Link at least one Offering.",
    "Category": "Pick a Group so the card knows where it belongs."
};

/** The thing the card lacks that a field of this label stands for, or "" when it is none. */
export function missingFor(lacking: readonly string[], label: string): string {
    const text = label.trim().toLowerCase();
    return lacking.find(item => (MISSING_LABELS[item] ?? []).some(start => text.startsWith(start))) ?? "";
}

/** The words under a missing cell. */
export const missingWords = (item: string) => MISSING_WORDS[item] ?? "Required: this card is not counted until it is given.";

/** The tick box next to a BusinessField's label (see BusinessField's `tick`). */
export interface BusinessFieldTick {
    on: boolean;
    onChange: (on: boolean) => void;
    disabled?: boolean;
    ariaLabel?: string;
}

/**
 * A label, with its "i" note when the specification gives one, and
 * whatever control it names underneath.
 */
export function BusinessField({

    label,

    info,

    inline = false,

    side = false,

    fieldId,

    tick,

    className,

    children

}: {

    label: string;
    info?: InfoPoint[];
    /** A class of the field's own, after the ones it has. */
    className?: string;
    /**
     * A tick box NEXT TO the label (tick, then the label's words), so the
     * field can be turned off for this card: Responsible on a Capability
     * card or a Strategy Objective. The label is the tick's label, so its
     * name is clickable; the "i" follows outside it. The caller draws the
     * control (children) only while the tick is on.
     */
    tick?: BusinessFieldTick;
    /**
     * The field's stable id in its key (FieldKeys.ts), where the label
     * could change: a note that links it keeps working when it does.
     * The label's slug otherwise.
     */
    fieldId?: string;
    /** The label beside its control rather than above it. */
    inline?: boolean;
    /**
     * A SHORT SIDE LABEL (global.css, --side-label-short): the label in the
     * one short label column, then --side-label-gap, then its control, label
     * and control on one centre line. Frequency and Responsibility in the
     * Capability cards -- their controls start at one x.
     */
    side?: boolean;
    children: ReactNode;

}) {

    const lacking = useContext(MissingFieldsContext);
    const lacks = lacking.length > 0 ? missingFor(lacking, label) : "";

    return (
        <div className={"business-foundation-field" + (inline ? " business-field-inline" : "") + (side ? " business-field-side" : "") + (lacks ? " business-field-missing" : "") + (className ? " " + className : "")}>

            {tick
                ? (
                    <>
                        <span className="business-foundation-label-info">
                            <label className="business-foundation-tick business-foundation-tick-inline">
                                <input
                                    type="checkbox"
                                    className="brand-tick-box"
                                    aria-label={tick.ariaLabel}
                                    disabled={tick.disabled}
                                    checked={tick.on}
                                    onChange={(event) => tick.onChange(event.target.checked)}
                                />
                                <span className="field-label business-foundation-label">
                                    {label}
                                    <FieldMark label={label} keyLabel={fieldId} />
                                </span>
                            </label>
                            {info && <InfoNote label={label} points={info} fullList />}
                        </span>
                        <FieldStatus label={label} keyLabel={fieldId} />
                    </>
                )
                : info
                ? (
                    <span className="business-foundation-label-info">
                        <span className="field-label business-foundation-label">
                            <InfoText text={label}>
                                <InfoNote label={label} points={info} fullList />
                            </InfoText>
                            <FieldMark label={label} keyLabel={fieldId} />
                        </span>
                        <FieldStatus label={label} keyLabel={fieldId} />
                    </span>
                )
                : (
                    <span className="field-label business-foundation-label">
                        {label}
                        <FieldMark label={label} keyLabel={fieldId} />
                        <FieldStatus label={label} keyLabel={fieldId} />
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

    fold,

    children

}: {

    title: string;
    info?: InfoPoint[];
    /**
     * Drawn at the far end of the title's own row -- the group's
     * "Expand all" (see .fold-group-head), so it never adds a line.
     */
    titleExtra?: ReactNode;
    /**
     * A group that folds: the app's fold arrow before its title,
     * hanging in the card's arrow column so the title stays at the
     * body's edge; folded, only the title's line shows.
     */
    fold?: { open: boolean; label: string; onToggle: () => void };
    children: ReactNode;

}) {

    const heading = info
        ? (
            <span className="business-foundation-label-info">
                <span className="field-group-title business-foundation-subhead">
                    <InfoText text={drawnTitle(title)}>
                        <InfoNote label={title} points={info} fullList />
                    </InfoText>
                </span>
            </span>
        )
        : <span className="field-group-title business-foundation-subhead">{drawnTitle(title)}</span>;

    if (fold) {
        return (
            <>

                <div className="fold-group-head business-group-fold-head">
                    <FoldArrow open={fold.open} label={fold.label} onToggle={fold.onToggle} />
                    {heading}
                    {titleExtra}
                </div>

                {fold.open && children}

            </>
        );
    }

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
 * Unticking a field WITH content clears it at once, and the undo
 * toast offers it back ("Assumptions removed. Undo", UndoService).
 * Nothing hidden is ever kept, so nothing hidden can reach the
 * documents.
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

    fieldId,

    inline = false,

    children

}: {

    label: string;
    info?: InfoPoint[];
    /** The field's key where its label was renamed (FieldKeys.ts). */
    fieldId?: string;
    /** The control beside the label (on the same line, in the next column) rather than under it. */
    inline?: boolean;
    /** Whether the field holds anything: it then loads ticked. */
    filled: boolean;
    /** Empties the field (as it is unticked). */
    onClear: () => void;
    disabled?: boolean;
    children: ReactNode;

}) {

    const [open, setOpen] = useState(filled);
    const [focusOnOpen, setFocusOnOpen] = useState(false);
    const body = useRef<HTMLDivElement | null>(null);
    const shown = open || filled;

    useEffect(() => {
        if (!focusOnOpen || !shown) {
            return;
        }
        setFocusOnOpen(false);
        body.current?.querySelector<HTMLElement>("textarea, input, [contenteditable=true]")?.focus({ preventScroll: true });
    }, [focusOnOpen, shown]);

    function clear() {
        // Marked as a removal, so the page offers to undo it.
        UndoService.markRemoval(label);
        onClear();
        setOpen(false);
    }

    return (
        <div className={"business-foundation-field optional-field" + (inline ? " optional-field-inline" : "")} data-field-kind="optional">

            {/*
                The tick and its name are one label, so the name is
                clickable. The "i" follows OUTSIDE it: anything inside
                a label toggles the tick it belongs to.
            */}
            <span className="business-foundation-label-info optional-field-head">
                <label className="business-foundation-tick business-foundation-tick-inline">
                    <input
                        type="checkbox"
                        className="brand-tick-box"
                        disabled={disabled}
                        checked={shown}
                        onChange={(event) => {
                            if (event.target.checked) {
                                setOpen(true);
                                setFocusOnOpen(true);
                            } else if (filled) {
                                clear();
                            } else {
                                setOpen(false);
                            }
                        }}
                    />
                    <span className="field-label business-foundation-label">
                        {label}
                        <FieldMark label={label} keyLabel={fieldId} />
                    </span>
                </label>
                {info && <InfoNote label={label} points={info} fullList />}
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

    disabled = false,

    fieldId

}: {

    label: string;
    /** The field's key where its label was renamed (FieldKeys.ts). */
    fieldId?: string;
    value: string;
    onChange: (next: string) => void;
    info?: InfoPoint[];
    ariaLabel?: string;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}) {

    return (
        <OptionalField label={label} info={info} filled={value.trim() !== ""} onClear={() => onChange("")} disabled={disabled} fieldId={fieldId}>
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
    /** A sub-option of the one above it: drawn indented. */
    indent?: boolean;
    /** Cannot be ticked here: drawn grey, unticked, with this said beside it (what already uses it). */
    blocked?: string;
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

    disabled = false,

    trailing

}: {

    /** Names the group for assistive technology. */
    name: string;
    options: readonly BusinessTickOption[];
    chosen: readonly string[];
    onChange: (next: string[]) => void;
    disabled?: boolean;
    /** A control at the end of an option's row (by option id): the share each Offering carries, in the x's column. Only the options given one are rows. */
    trailing?: Readonly<Record<string, ReactNode>>;

}) {

    const row = (option: BusinessTickOption, label: ReactNode) => trailing && trailing[option.id] !== undefined
        ? <div className="business-tick-row" key={option.id}>{label}{trailing[option.id]}</div>
        : label;

    return (
        <>
            {options.map(option => row(option, (

                <label className={"business-foundation-tick" + (option.indent ? " business-foundation-tick-indented" : "") + (option.blocked ? " business-foundation-tick-blocked" : "")} key={option.id}>

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
                        disabled={disabled || !!option.blocked}
                        checked={!option.blocked && chosen.includes(option.id)}
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

                    {option.blocked && <span className="business-foundation-tick-note">{option.blocked}</span>}

                </label>

            )))}
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

/**
 * THE LINK SYMBOL, beside a name chosen from a dropdown that leads to another card: a click opens that card. (A card another card generated has
 * no symbol: its name is the link.)
 */
export function LinkSymbol({
    noun,
    name,
    onOpen,
    title
}: {
    /** What the card is called: "Supplier", "Partner", "Workspace". */
    noun: string;
    name: string;
    onOpen: () => void;
    title?: string;
}) {
    const text = "Open " + noun + " “" + name + "”";
    return (
        <button
            type="button"
            className="business-link-symbol"
            aria-label={text}
            title={title ?? text}
            onClick={onOpen}
        >
            <svg className="business-link-symbol-icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" focusable="false">
                <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.1 1.1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.1-1.1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
    );
}

/** The delete control every card carries. */
export function BusinessRemove({

    what,

    onRemove,

    cell = false,

    disabled = false

}: {

    what: string;
    onRemove: () => void;
    disabled?: boolean;
    /** A row inside a card's cell (a performer, a milestone), not the card's own delete: it keeps the cell x's red. */
    cell?: boolean;

}) {

    return (
        <button
            type="button"
            className={"strategy-box-remove" + (cell ? "" : " card-remove")}
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
        <RemoveButton
            aria-label={"Remove this " + what}
            title={"Remove this " + what}
            disabled={disabled}
            onClick={onClick}
        />
    );

}

export function BusinessAddButton({

    label,

    onAdd,

    disabled = false,

    span = false

}: {

    label: string;
    onAdd: () => void;
    disabled?: boolean;
    /** The cards' whole width, label centred (.card-list-add): only the
        add buttons the rulebook lists. */
    span?: boolean;

}) {

    return (
        <button
            type="button"
            className={"strategy-add-button" + (span ? " card-list-add" : "")}
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

    headRow,

    fixedFolded = false,

    style,

    nameLink,

    children

}: {

    kind: string;
    number: number;
    name: string;
    /** Absent for a card whose name belongs to another page. */
    onName?: (next: string) => void;
    /** For a card whose name belongs to another page (a Customer Channel's): its name is a link to that page, as an investigated activity's name is. */
    nameLink?: { title: string; onClick: () => void };
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
    /**
     * A field set in the head, under the name and starting at the name
     * box's left edge, while the card is open (a Competitor's or an
     * Offering's Type).
     */
    headRow?: ReactNode;
    /**
     * Folded, the card is ONE FIXED SIZE (a Capability list's Resource and
     * Partner / Provider cards): its name on one line cut by an ellipsis
     * (the full name in a tooltip), and its summary on one line under it,
     * cut the same way -- the line kept even when there is none -- so
     * every folded card in the list is as tall as the next.
     */
    fixedFolded?: boolean;
    /** The card's own inline style: a folded colour card's tint (Brand Style). */
    style?: CSSProperties;
    children: ReactNode;

}) {

    const who = (ariaPrefix ? ariaPrefix + ", " : "") + kind + " " + number;

    // What this card lacks (its fields flash for it); a founder's anchor is "founder-" and its id.
    const stored = useContext(MissingMapContext).get((anchor ?? "").replace(/^founder-/, "")) ?? NO_MISSING;

    /* Folded, a card is read rather than edited: its name is text,
       as the Founder card's always is, and becomes a box once the
       card is opened. A card that cannot fold keeps its box. */
    const editable = onName !== undefined && (open || !onToggle);

    return (
        <MissingScope lacking={stored}>{(lacking) => (
        <div
            className={
                "business-foundation-card" + (className ? " " + className : "")
            }
            data-anchor={anchor}
            data-lacks={lacking.length > 0 ? "|" + lacking.join("|") + "|" : undefined}
            style={style}
        >

            {/* A foldable card's head is the one every folding card
                shares (.fold-card-head): arrow, number, name, remove,
                and the folded summary on a row of its own under the
                name. */}
            <div className={"strategy-box-head" + (onToggle || headRow ? " fold-card-head fold-card-fixed" : "") + (fixedFolded && !open ? " fold-card-head-fixed" : "")}>

                {onToggle && (
                    <FoldArrow open={open} label={who} onToggle={onToggle} />
                )}

                <CardNumber number={number} />

                {/* The card as a whole has a key, so a note can link it. */}
                {anchor && <FieldMark label={kind + " " + number + (name.trim() ? ": " + name.trim() : "")} card />}

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
                    : nameLink && name.trim().length > 0
                    ? (
                        <TextLink
                            type="button"
                            className="business-capability-child-name"
                            title={nameLink.title}
                            aria-label={"Open " + nameLink.title}
                            onClick={nameLink.onClick}
                        >
                            {name}
                        </TextLink>
                    )
                    : (
                        /* Shown, not asked. It fills the same slot
                           the input would, so a referring card and
                           an answering one have the same head. */
                        <span
                            className="strategy-name-static"
                            title={name.trim().length > 0 ? name : undefined}
                        >
                            {name.trim().length > 0
                                ? name
                                : "Unnamed " + kind.toLocaleLowerCase()}
                        </span>
                    )}

                {actions}

                {!open && (summary || fixedFolded) && (
                    <div
                        className="business-card-summary"
                        title={typeof summary === "string" ? summary : undefined}
                    >
                        {summary}
                    </div>
                )}

                {open && headRow && (
                    <div className="fold-card-head-row">{headRow}</div>
                )}

            </div>

            {open && children}

        </div>
        )}</MissingScope>
    );

}


/**
 * THE RESPONSIBLE FIELD, one for every card that has one (an Activity, a Partner or Supplier, a Legal expense, a Strategy Objective): the label "Responsible"
 * with its tick on the side-label row, and, ticked, the dropdown of the founders at the right (a dropdown alone in its row takes the row). Unticked, the choice
 * goes. What a founder is responsible for is read back from these fields, into the founder's Responsibilities (businessFounderResponsibilities).
 */
export function ResponsibleField({
    what,
    founders,
    value,
    off,
    onChange,
    onOff,
    disabled = false,
    info,
    layout = "side",
    className
}: {
    /** Which card, for assistive technology: "Expense 2", "Objective 1". */
    what: string;
    founders: readonly { id: string; label: string }[];
    value: string;
    off: boolean;
    onChange: (founderId: string) => void;
    onOff: (off: boolean) => void;
    disabled?: boolean;
    info?: InfoPoint[];
    /** Where the card lays out its rows: the short side-label column (default), or a label and its control inline. */
    layout?: "side" | "inline";
    className?: string;
}) {
    return (
        <BusinessField
            label="Responsible"
            side={layout === "side"}
            inline={layout === "inline"}
            className={className}
            info={info}
            fieldId="Responsibility"
            tick={{ on: !off, onChange: (on) => onOff(!on), disabled, ariaLabel: what + " has a responsible" }}
        >
            {off ? null : (
                <OptionPicker
                    label={what + " responsible"}
                    fill="fit"
                    placeholder="Select"
                    options={founders.map(founder => founder.label)}
                    disabled={disabled}
                    value={founders.find(founder => founder.id === value)?.label ?? ""}
                    onChange={(next) => onChange(founders.find(founder => founder.label === next)?.id ?? "")}
                />
            )}
        </BusinessField>
    );
}

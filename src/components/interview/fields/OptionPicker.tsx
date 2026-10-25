import { useEffect, useLayoutEffect, useRef, useState } from "react";

import AddButton from "../../controls/AddButton.tsx";
import TickField from "../../controls/TickField.tsx";
import { usePopupDismiss } from "../../controls/PopupPanel.tsx";
import { useFloatingPanel } from "../../../hooks/useFloatingPanel.ts";

import { consumeKey } from "./consumeKey.ts";

import "../../../styles/option-picker.css";

/** The standard control widths (global.css), smallest first. */
const CONTROL_STEPS = ["s", "m", "l"] as const;

export type ControlStep = typeof CONTROL_STEPS[number] | "full";

/**
 * The smallest standard control width that fits a picker: its widest
 * option (the sizer spans, see below) plus the trigger's own padding
 * and border, against --control-s/-m/-l. "full" when even the largest
 * is too narrow. Where nothing can be measured (no layout: a test),
 * the smallest.
 */
export function controlStep(trigger: HTMLElement): ControlStep {

    const need = controlNeed(trigger);
    const root = getComputedStyle(document.documentElement);

    return CONTROL_STEPS.find(step => {
        const limit = parseFloat(root.getPropertyValue("--control-" + step));
        return !Number.isFinite(limit) || need <= limit;
    }) ?? "full";

}

/**
 * The width a picker needs: its widest option (or placeholder) and the
 * trigger's own padding (the chevron's side included) and border.
 */
export function controlNeed(trigger: HTMLElement): number {

    const style = getComputedStyle(trigger);
    const chrome =
        (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0) +
        (parseFloat(style.borderLeftWidth) || 0) + (parseFloat(style.borderRightWidth) || 0);

    let widest = 0;

    trigger.querySelectorAll(".option-picker-sizer, .option-picker-value:not([data-empty])").forEach(span => {
        const range = document.createRange();
        range.selectNodeContents(span);
        // A range's box is its text's full width even where the span
        // clips it -- which is what a trigger narrower than its
        // widest option does.
        const width = typeof range.getBoundingClientRect === "function"
            ? range.getBoundingClientRect().width
            : 0;
        widest = Math.max(widest, width);
    });

    return widest + chrome;

}

/**
 * One option's height: 18px text at 1.5, plus 8px of padding above
 * and below. Kept here because the list's own height is measured in
 * options rather than in pixels.
 */
const OPTION_HEIGHT = 43;

/**
 * How many options a list shows before it scrolls. Ten is enough to
 * take in at a glance, and short enough that a list of fifty states
 * does not become the whole page.
 */
const VISIBLE_OPTIONS = 10;

/** The filter box, where there is one, plus the list's own padding. */
const SEARCH_HEIGHT = 49;
const LIST_PADDING = 8;

interface OptionPickerProps {

    /** Names the control for assistive technology. */
    label: string;

    /** What shows, and what is announced, when nothing is chosen. */
    placeholder?: string;

    /** The choices, in the order they should be offered. */
    options: readonly string[];

    /** The chosen option, or "" for none. */
    value: string;

    disabled?: boolean;

    /**
     * Adds a box at the top of the list that narrows it as the user
     * types. Worth it once a list is long enough that scanning it is
     * slower than typing the answer -- the country list is 195 rows.
     * Short lists are quicker to read than to filter, so this is off
     * unless asked for.
     */
    searchable?: boolean;

    /** A currency code: the one cell width and the one list width every currency picker has (three letters). */
    currency?: boolean;

    /**
     * Extra words each option can be found by, keyed by the option
     * itself -- a country code, a state abbreviation. Typing "CA"
     * finds California without it appearing in the list.
     */
    searchAliases?: Record<string, string>;

    /** The word in the search box while it is empty (default "Type to search"). */
    searchPlaceholder?: string;

    /**
     * As wide as its widest option exactly, rather than the size step
     * that holds it: a side-label picker's allowed exception (a
     * Competitor's or an Offering's Type, docs/ai/layout-rules.md).
     */
    hug?: boolean;

    /** A hugging picker keeps its longest option's width even when it stands alone in its row (the funnel window's Status and Frequency), instead of taking the row. */
    keepWidth?: boolean;

    /**
     * Fills the column it stands in, and asks for exactly the width its widest option (with the words of
     * `sizeFor`) needs: pickers that all `fill` one column make it as wide as the widest of them, and
     * are every one that wide (the Workspace form: docs/ai/layout-rules.md). `"fit"` fills the column too but asks for
     * nothing: its own options never widen it (a longer one ends in an ellipsis).
     */
    fill?: boolean | "fit";
    /** How many options the list shows before it scrolls (10 by default); a long list of long official titles (the Activities) asks for more, and the window's room still caps it. */
    visibleOptions?: number;
    /**
     * A hugging picker as wide as its longest OPTION and no wider: the placeholder is not counted (nothing chosen yet,
     * it is shown cut by an ellipsis rather than making the picker wider than any option).
     */
    tight?: boolean;

    /**
     * Words the picker is also made wide enough for, though they are not
     * its options now (the Customer Channel's Journey Stage offers only
     * the stages a channel has left, and is as wide as its longest stage
     * all the same, so it does not change width as stages are chosen).
     */
    sizeFor?: readonly string[];

    onChange: (value: string) => void;

}

/**
 * A dropdown that the page actually draws.
 *
 * A native <select> renders its open list outside the page: the
 * platform draws it, and the row it highlights is the platform's
 * own accent colour. Neither `accent-color` nor `option:checked`
 * reliably reaches it -- on Windows the highlight came back solid
 * blue inside a Strategic Theme whose every other control had
 * moved to that Theme's colour, which is the whole reason this
 * exists.
 *
 * So the list is markup, and the same CSS that colours the rest of
 * a Theme colours the chosen row too (see "Choosing, in the
 * Theme's colour" in conversation.css).
 *
 * Built to the same shape as MonthYearPicker -- the app's other
 * bespoke chooser -- so a trigger button plus a floating panel,
 * dismissed by clicking away or pressing Escape.
 *
 * A real <select> is still what a keyboard user gets from this: the
 * trigger opens on Enter, Space or either arrow; Up/Down move
 * through the options and Home/End jump to the ends, with the
 * highlight following focus; Enter or Space takes the focused one;
 * Escape closes without changing anything and hands focus back to
 * the trigger. `role="listbox"`/`role="option"` and aria-selected
 * are what make that legible to a screen reader.
 */
export default function OptionPicker({

    label,

    placeholder = "Select",

    options,

    value,

    disabled = false,

    searchable = false,
    currency = false,

    searchAliases,
    searchPlaceholder = "Type to search",

    hug = false,
    keepWidth = false,

    fill = false,
    visibleOptions = VISIBLE_OPTIONS,
    tight = false,

    sizeFor = [],

    onChange

}: OptionPickerProps) {

    const [open, setOpen] = useState(false);

    // What has been typed into the filter box. Cleared every time
    // the list opens, so it never reopens showing yesterday's search.
    const [query, setQuery] = useState("");

    // Which option the keyboard is on, as an index into `options`.
    // Kept apart from `value`: moving through the list must not
    // commit anything until the user says so, or arrowing past an
    // option would silently choose it.
    const [activeIndex, setActiveIndex] = useState(0);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const searchRef = useRef<HTMLInputElement | null>(null);

    // Its width step (see controlStep and "One control-sizing rule",
    // global.css): measured from its options, again once the fonts
    // have loaded (they change every width), and whenever the
    // options change.
    const [step, setStep] = useState<ControlStep>("s");
    // Hugging: the width its widest option needs (0 until measured).
    const [hugWidth, setHugWidth] = useState(0);

    /* A dropdown that is the ONLY control in its row takes the row: its right side is the available space's (12px after the card's x, or 56px from the card's right edge where there is none), whatever its options say. */
    const [alone, setAlone] = useState(false);
    useLayoutEffect(() => {
        const row = containerRef.current?.parentElement;
        if (!row || !hug) {
            return;
        }
        const others = [...row.querySelectorAll("input:not([type=checkbox]):not([type=file]), textarea, select, .date-cell, .month-picker, .option-picker")]
            .filter(control => !containerRef.current!.contains(control));
        setAlone(!keepWidth && others.length === 0);
    });
    const optionsKey = [placeholder, ...options, "\u0001", ...sizeFor, tight ? "tight" : ""].join("\u0000");

    useLayoutEffect(() => {

        const trigger = triggerRef.current;

        if (!trigger) {
            return;
        }

        let live = true;
        const measure = () => {
            if (!live) {
                return;
            }
            setStep(controlStep(trigger));
            if (hug) {
                setHugWidth(Math.ceil(controlNeed(trigger)));
            }
        };

        measure();
        document.fonts?.ready.then(measure);

        return () => { live = false; };

    }, [optionsKey, hug]);

    // Opens downwards where there is room and upwards where there
    // is not, so the last option is never under the window edge or
    // behind the navigation bar (see useFloatingPanel).
    const listMaxHeight =
        OPTION_HEIGHT * visibleOptions +
        LIST_PADDING +
        (searchable ? SEARCH_HEIGHT : 0);

    // On page 3 (a card, a dialog, the Inventory funnel -- boxes that scroll or clip) the list floats free of the boxes around it: placed in window
    // coordinates under the cell, over it where there is no room below, else capped to the larger room and scrolling, so no option is ever cut off.
    const [free, setFree] = useState(false);

    const { panelRef: listRef, panelStyle } = useFloatingPanel(
        open,
        triggerRef,
        listMaxHeight,
        free
    );


    /* THE LIST IS A CARD OF ITS OWN under the cell (the placement's gap, above it where there is no room below), exactly the cell's width: its left
       edge is the cell's and it is as wide as its longest option needs (never narrower than the cell). A very long option wraps (its full text is the tooltip). Measured on opening and on resizing. */
    const [reach, setReach] = useState<{ left: number; width: number } | null>(null);

    useLayoutEffect(() => {
        const trigger = triggerRef.current;
        if (!open || !trigger) {
            setReach(null);
            return;
        }
        const measure = () => {
            const width = trigger.getBoundingClientRect().width;
            setReach(previous => previous && Math.abs(previous.width - width) < 0.01 && previous.left === trigger.offsetLeft ? previous : { left: trigger.offsetLeft, width });
        };
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, [open, optionsKey]);

    // THE SEARCH STANDS NEXT TO THE CELL: a list that opens above its cell has its search box at its foot (over the cell, not at the far top); one that opens below has it at its head.
    const [listAbove, setListAbove] = useState(false);
    useLayoutEffect(() => {
        if (!open || !searchable) {
            setListAbove(false);
            return;
        }
        const measure = () => {
            const list = listRef.current;
            const trigger = triggerRef.current;
            if (list && trigger) {
                setListAbove(list.getBoundingClientRect().bottom <= trigger.getBoundingClientRect().top + 2);
            }
        };
        measure();
        const frame = window.requestAnimationFrame(measure);
        window.addEventListener("resize", measure);
        window.addEventListener("scroll", measure, true);
        return () => {
            window.cancelAnimationFrame(frame);
            window.removeEventListener("resize", measure);
            window.removeEventListener("scroll", measure, true);
        };
    }, [open, searchable, query, reach]);

    // Clicking anywhere else, or pressing Escape, closes without
    // choosing -- both are what a popover is expected to do.
    usePopupDismiss(open, [containerRef], () => setOpen(false), { escape: false });

    // The list takes focus when it opens, so the arrow keys reach
    // it without the user having to Tab into a thing that just
    // appeared under their hands.
    useEffect(() => {

        if (!open) {
            return;
        }

        // `preventScroll`, because focusing scrolls the thing
        // focused into view -- which moves the control the panel was
        // just measured against, and undoes the placement (see
        // useFloatingPanel).
        //
        // A searchable list hands focus to its filter box instead.
        // Typing is the first thing to do there, and the box carries
        // the same key handler, so the arrows still move through the
        // options from inside it.
        if (searchable) {
            searchRef.current?.focus({ preventScroll: true });
        } else {
            listRef.current?.focus({ preventScroll: true });
        }

    }, [open, searchable]);

    function start() {

        // Opens on whatever is already chosen, so reopening to
        // change a value starts from that value rather than from
        // the top of the list.
        const chosen = options.indexOf(value);

        setQuery("");
        setActiveIndex(chosen >= 0 ? chosen : 0);
        setFree(!!triggerRef.current?.closest(".business-capability, .section-tile-overlay, .section-tile-dialog, .strategy-sort-menu"));
        setOpen(true);

    }

    function choose(option: string) {

        onChange(option);

        setOpen(false);

        // Back to the trigger: the list is gone, and focus cannot
        // be left on an element that no longer exists.
        triggerRef.current?.focus();

    }

    function close() {
        setOpen(false);
        triggerRef.current?.focus();
    }

    function onTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {

        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            start();
        }

    }

    function onListKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {

        // Against what is on screen, not against every option: with
        // a filter applied, arrowing past the last visible row would
        // otherwise land on something the user cannot see.
        const last = matches.length - 1;

        // Every row is a real option now, so the first one is 0.
        const floor = 0;

        switch (event.key) {

            case "ArrowDown":
                event.preventDefault();
                setActiveIndex(index => Math.min(index + 1, last));
                break;

            case "ArrowUp":
                event.preventDefault();
                setActiveIndex(index => Math.max(index - 1, floor));
                break;

            case "Home":
                event.preventDefault();
                setActiveIndex(floor);
                break;

            case "End":
                event.preventDefault();
                setActiveIndex(last);
                break;

            case "Enter":
                event.preventDefault();
                if (matches[activeIndex]) {
                    choose(matches[activeIndex]);
                }
                break;

            // Space only picks when there is no filter box to type
            // it into -- in a searchable list a space is part of
            // "United Kingdom", not a command.
            case " ":
                if (!searchable && matches[activeIndex]) {
                    event.preventDefault();
                    choose(matches[activeIndex]);
                }
                break;

            // Consumed, or it closes the list and leaves the page
            // in one press (see consumeKey).
            case "Escape":
                consumeKey(event);
                close();
                break;

            // Tab is not: nothing above this listens for it, and
            // the panel closing is all this has ever done with it.
            case "Tab":
                event.preventDefault();
                close();
                break;

            default:
                break;

        }

    }

    const display = value.trim().length > 0 ? value : placeholder;

    /**
     * What the list is showing. A filter matches anywhere in the
     * option, not just at the start, so "kingdom" finds "United
     * Kingdom" and "emirates" finds the UAE. Case and surrounding
     * space are ignored, because neither is something the user
     * should have to get right.
     */
    const needle = query.trim().toLowerCase();

    const matches = needle.length > 0
        ? options.filter(option =>
            option.toLowerCase().includes(needle) ||
            (searchAliases?.[option] ?? "").toLowerCase().includes(needle))
        : options;

    /**
     * The options, and only the options. "Select a country" names
     * the empty state on the trigger; offering it as a row as well
     * would be a choice nobody means to make.
     */
    const rows = matches.map(option => ({ value: option, text: option }));

    return (

        <div
            className="option-picker"
            data-size={currency ? "currency" : fill === "fit" ? "fit" : fill ? "fill" : hug && alone ? "full" : hug ? "hug" : step}
            style={!currency && hug && !alone && hugWidth > 0 ? { width: "min(100%, " + hugWidth + "px)" } : undefined}
            ref={containerRef}
        >

            <button
                ref={triggerRef}
                type="button"
                className="interview-input option-picker-trigger"
                aria-label={`${label}: ${display}`}
                /* The Metric row is narrow enough that the longest
                   frequency does not fit -- it ellipsises, so the
                   full value has to be reachable some other way. */
                title={display}
                aria-expanded={open}
                aria-haspopup="listbox"
                disabled={disabled}
                onClick={() => open ? close() : start()}
                onKeyDown={onTriggerKeyDown}
            >
                <span className="option-picker-value" data-empty={tight && value.trim().length === 0 ? "" : undefined}>{display}</span>

                {/*
                    Every choice, laid in the same grid cell as the
                    value and given no height -- so the button is
                    always as wide as its widest option and never
                    resizes as the value changes. A native <select>
                    did this for free; this is what replaces it.
                */}
                {/* Once each: a placeholder that is also an option
                    ("When earned") would otherwise be listed twice. */}
                {[...new Set([...(tight ? [] : [placeholder]), ...options, ...sizeFor])].map(option => (
                    <span
                        className="option-picker-sizer"
                        key={option}
                        aria-hidden="true"
                    >
                        {option}
                    </span>
                ))}

            </button>

            {open && (

                <div
                    ref={listRef}
                    className={"option-picker-list" + (listAbove ? " option-picker-list-above" : "")}
                    style={{
                        ...panelStyle,
                        // (Not shifted sideways: the width and the left edge are the cell's.)
                        transform: undefined,
                        ...(currency ? {} : free
                            // (Free: its left edge is placed by hand, at the cell's; only its width is the cell's.)
                            ? (() => {
                                const width = triggerRef.current?.getBoundingClientRect().width;
                                return width ? { width: "max-content", minWidth: width, maxWidth: "min(560px, 92vw)" } : {};
                            })()
                            : reach ? { left: reach.left, width: "max-content", minWidth: reach.width, maxWidth: "min(560px, 92vw)" } : {})
                    }}
                    role="listbox"
                    aria-label={label}
                    tabIndex={-1}
                    onKeyDown={onListKeyDown}
                >

                    {searchable && (
                        <input
                            type="text"
                            className="interview-input option-picker-search"
                            ref={searchRef}
                            aria-label={label + ": type to narrow the list"}
                            placeholder={searchPlaceholder}
                            value={query}
                            onChange={(event) => {
                                setQuery(event.target.value);
                                // Back to the first match: the row
                                // the keyboard was on is usually not
                                // in the new list at all.
                                setActiveIndex(0);
                            }}
                            onKeyDown={onListKeyDown}
                        />
                    )}

                    {rows.length === 0 && (
                        <p className="option-picker-empty">No match for that.</p>
                    )}

                    {rows.map((row, index) => {

                        // Every row is an option, so a row's place in
                        // the list IS the position the keyboard uses.
                        const position = index;

                        return (

                            <div
                                key={row.value || "__placeholder__"}
                                className={
                                    "option-picker-option" +
                                    (row.value === value ? " option-picker-option-chosen" : "") +
                                    (position === activeIndex ? " option-picker-option-active" : "")
                                }
                                role="option"
                                aria-selected={row.value === value}
                                title={row.text}
                                onMouseEnter={() => setActiveIndex(position)}
                                onClick={() => choose(row.value)}
                            >
                                {row.text}
                            </div>

                        );

                    })}

                </div>

            )}

        </div>

    );

}

/**
 * THE PICKER FOR CHOICES WHOSE VALUE IS NOT THEIR WORDS (a key, a number, a period's id): the same dropdown, shown by `label`, answering with the choice's `value`. `OptionPicker` is for choices that are just their words.
 */
export function ValuePicker({ choices, value, onChange, ...rest }: Omit<OptionPickerProps, "options" | "value" | "onChange"> & {
    choices: readonly { value: string; label: string }[];
    value: string;
    onChange: (value: string) => void;
}) {
    const chosen = choices.find(choice => choice.value === value);
    return (
        <OptionPicker
            {...rest}
            options={choices.map(choice => choice.label)}
            value={chosen ? chosen.label : ""}
            onChange={(label) => onChange(choices.find(choice => choice.label === label)?.value ?? "")}
        />
    );
}

/**
 * THE DROP-DOWN OF SEVERAL CHOICES: the same drop-down cell (this file's trigger and list, the same classes) whose list is a tick for each option, with All and None; what is
 * ticked is counted on the cell ("Dates: 7 of 10"). A value of one choice is `OptionPicker`; this is the same control for a set.
 */
export function MultiPicker<T extends string>({
    label,
    options,
    selected,
    onChange
}: {
    label: string;
    options: readonly { id: T; label: string }[];
    selected: ReadonlySet<T>;
    onChange: (next: ReadonlySet<T>) => void;
}) {
    const [open, setOpen] = useState(false);
    const box = useRef<HTMLDivElement | null>(null);
    const listBox = useRef<HTMLDivElement | null>(null);

    usePopupDismiss(open, [box], () => setOpen(false), { escape: false });

    // THE LIST STAYS WHOLE: opened under its cell from the cell's left edge; held inside what clips it (a panel that cuts what overflows it, else the window), on both sides: moved
    // towards the left where it would run past the right edge, and narrowed to the room where it is wider than that (its words then wrap).
    useLayoutEffect(() => {
        const list = listBox.current;
        const cell = box.current;
        if (!open || !list || !cell) {
            return;
        }
        list.style.left = "";
        list.style.maxWidth = "";
        let clip = { left: 0, right: window.innerWidth };
        for (let parent = list.parentElement; parent; parent = parent.parentElement) {
            if (getComputedStyle(parent).overflowX !== "visible") {
                const rect = parent.getBoundingClientRect();
                clip = { left: Math.max(clip.left, rect.left), right: Math.min(clip.right, rect.right) };
                break;
            }
        }
        const room = clip.right - clip.left - 8;
        list.style.maxWidth = room + "px";
        const own = list.getBoundingClientRect();
        const cellLeft = cell.getBoundingClientRect().left;
        const wanted = Math.max(clip.left + 4, Math.min(cellLeft, clip.right - 4 - own.width));
        list.style.left = (wanted - cellLeft) + "px";
    }, [open]);

    return (
        <div className="option-picker multi-picker" data-size="hug" ref={box}>
            <button
                type="button"
                className="interview-input option-picker-trigger"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={label}
                onClick={() => setOpen(current => !current)}
            >
                <span className="option-picker-value">{label}: {selected.size === options.length ? "All" : selected.size + " of " + options.length}</span>
            </button>
            {open && (
                <div ref={listBox} className="option-picker-list multi-picker-list" role="group" aria-label={label}>
                    <div className="multi-picker-actions">
                        <AddButton
                            onClick={() => onChange(new Set(options.map(option => option.id)))}>All</AddButton>
                        <AddButton
                            onClick={() => onChange(new Set())}>None</AddButton>
                    </div>
                    {options.map(option => (
                        <TickField key={option.id} className="option-picker-option" checked={selected.has(option.id)} onChange={(event) => {
                                    const next = new Set(selected);
                                    if (event.target.checked) {
                                        next.add(option.id);
                                    } else {
                                        next.delete(option.id);
                                    }
                                    onChange(next);
                                }}>
                            <span>{option.label}</span>
                        </TickField>
                    ))}
                </div>
            )}
        </div>
    );
}

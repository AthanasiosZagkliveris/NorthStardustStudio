import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { useFloatingPanel } from "../../hooks/useFloatingPanel.ts";

import { consumeKey } from "./consumeKey.ts";

import "../../styles/option-picker.css";

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

    const style = getComputedStyle(trigger);
    const chrome =
        (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0) +
        (parseFloat(style.borderLeftWidth) || 0) + (parseFloat(style.borderRightWidth) || 0);

    let widest = 0;

    trigger.querySelectorAll(".option-picker-sizer, .option-picker-value").forEach(span => {
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

    const need = widest + chrome;
    const root = getComputedStyle(document.documentElement);

    return CONTROL_STEPS.find(step => {
        const limit = parseFloat(root.getPropertyValue("--control-" + step));
        return !Number.isFinite(limit) || need <= limit;
    }) ?? "full";

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

    /**
     * Extra words each option can be found by, keyed by the option
     * itself -- a country code, a state abbreviation. Typing "CA"
     * finds California without it appearing in the list.
     */
    searchAliases?: Record<string, string>;

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

    searchAliases,

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
    const optionsKey = [placeholder, ...options].join("\u0000");

    useLayoutEffect(() => {

        const trigger = triggerRef.current;

        if (!trigger) {
            return;
        }

        let live = true;
        const measure = () => live && setStep(controlStep(trigger));

        measure();
        document.fonts?.ready.then(measure);

        return () => { live = false; };

    }, [optionsKey]);

    // Opens downwards where there is room and upwards where there
    // is not, so the last option is never under the window edge or
    // behind the navigation bar (see useFloatingPanel).
    const listMaxHeight =
        OPTION_HEIGHT * VISIBLE_OPTIONS +
        LIST_PADDING +
        (searchable ? SEARCH_HEIGHT : 0);

    const { panelRef: listRef, panelStyle } = useFloatingPanel(
        open,
        triggerRef,
        listMaxHeight
    );

    // Clicking anywhere else, or pressing Escape, closes without
    // choosing -- both are what a popover is expected to do.
    useEffect(() => {

        if (!open) {
            return;
        }

        function onPointerDown(event: MouseEvent) {
            if (!containerRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener("mousedown", onPointerDown);

        return () => document.removeEventListener("mousedown", onPointerDown);

    }, [open]);

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

        <div className="option-picker" data-size={step} ref={containerRef}>

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
                <span className="option-picker-value">{display}</span>

                {/*
                    Every choice, laid in the same grid cell as the
                    value and given no height -- so the button is
                    always as wide as its widest option and never
                    resizes as the value changes. A native <select>
                    did this for free; this is what replaces it.
                */}
                {/* Once each: a placeholder that is also an option
                    ("When earned") would otherwise be listed twice. */}
                {[...new Set([placeholder, ...options])].map(option => (
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
                    className="option-picker-list"
                    style={panelStyle}
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
                            placeholder="Type to search"
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

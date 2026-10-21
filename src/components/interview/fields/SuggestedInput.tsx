import { KeyboardEvent, useEffect, useRef, useState } from "react";

import { usePopupDismiss } from "../../controls/PopupPanel.tsx";
import { useAutoGrow } from "../../../hooks/useAutoGrow.ts";
import { useFloatingPanel } from "../../../hooks/useFloatingPanel.ts";

import { consumeKey } from "./consumeKey.ts";

interface SuggestedInputProps {

    /** Names the control for assistive technology. */
    label: string;

    placeholder?: string;

    /**
     * The names worth offering, in the order they should be
     * offered. EMPTY MEANS NO LIST: the control is then an ordinary
     * text box, which is what a field with nothing sensible to
     * suggest should be.
     */
    options: readonly string[];

    value: string;

    disabled?: boolean;

    /** Takes the focus when it appears (the text box an "Other" opens). */
    autoFocus?: boolean;

    onChange: (next: string) => void;

}

/**
 * A text box that knows some likely answers.
 *
 * ONE FIELD, always. The name is typed straight into it, and the
 * chevron beside it offers the names worth offering -- the
 * category's own platforms, and whatever is already recorded under
 * it. Choosing one fills the box; typing is how you say anything
 * else.
 *
 * It replaces a dropdown whose last entry was "Other" and which
 * grew a SECOND box underneath when you picked it: two controls and
 * two stored fields for one name, and a mode to get into and out
 * of. Here "Other" empties the box and puts the caret in it, which
 * is all it ever meant.
 *
 * With no options it renders as the plain input it would otherwise
 * have been, so a field that has a useful list and one that does
 * not are the same control at the same size.
 *
 * Built to OptionPicker's shape and wearing its classes for the
 * list, so the two read as one family.
 */
export default function SuggestedInput({

    label,

    placeholder,

    options,

    value,

    disabled = false,

    autoFocus = false,

    onChange

}: SuggestedInputProps) {

    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLTextAreaElement | null>(null);

    // A name can be a long one ("SumUp card reader & online checkout"):
    // it wraps and the box grows, as a card's name does (CardNameInput),
    // rather than being cut off at the box's edge.
    useAutoGrow(inputRef, value);

    useEffect(() => {
        if (autoFocus) {
            inputRef.current?.focus();
        }
    }, [autoFocus]);
    const triggerRef = useRef<HTMLButtonElement | null>(null);

    const { panelRef, panelStyle } = useFloatingPanel(open, containerRef);

    usePopupDismiss(open, [containerRef], () => setOpen(false), { escape: false });

    // `preventScroll` for the reason OptionPicker documents:
    // focusing scrolls, and scrolling moves the anchor the
    // placement was just measured against.
    useEffect(() => {

        if (open) {
            panelRef.current?.focus({ preventScroll: true });
        }

    }, [open, panelRef]);

    function close() {
        setOpen(false);
        triggerRef.current?.focus({ preventScroll: true });
    }

    /**
     * Taking a name from the list.
     *
     * "Other" GOES INTO THE BOX like any other choice, and is then
     * selected so the first keystroke replaces it. It used to empty
     * the box instead, which left the field looking exactly as it
     * had before it was clicked -- the choice was made and nothing
     * on screen said so.
     *
     * The selection is made on the next frame, once the box is
     * holding the new value: selecting before that would select
     * whatever it held a moment ago.
     */
    function choose(option: string) {

        onChange(option);

        setOpen(false);

        if (option === "Other") {
            window.requestAnimationFrame(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
            });
        } else {
            triggerRef.current?.focus({ preventScroll: true });
        }

    }

    function onListKeyDown(event: KeyboardEvent<HTMLDivElement>) {

        const last = options.length - 1;

        switch (event.key) {

            case "ArrowDown":
                event.preventDefault();
                setActiveIndex(index => Math.min(index + 1, last));
                break;

            case "ArrowUp":
                event.preventDefault();
                setActiveIndex(index => Math.max(index - 1, 0));
                break;

            case "Home":
                event.preventDefault();
                setActiveIndex(0);
                break;

            case "End":
                event.preventDefault();
                setActiveIndex(last);
                break;

            case " ":
            case "Enter":
                event.preventDefault();
                if (options[activeIndex] !== undefined) {
                    choose(options[activeIndex]);
                }
                break;

            // Consumed, or it closes the list and leaves the page
            // in one press (see consumeKey).
            case "Escape":
                consumeKey(event);
                close();
                break;

            case "Tab":
                event.preventDefault();
                close();
                break;

            default:
                break;

        }

    }

    return (

        <div className="suggested-input" ref={containerRef}>

            {/* One line of data that wraps: Enter adds no line, and a
                pasted line break becomes a space (as CardNameInput). */}
            <textarea
                ref={inputRef}
                rows={1}
                className="interview-input suggested-input-field card-name-input"
                aria-label={label}
                placeholder={placeholder}
                disabled={disabled}
                value={value}
                onKeyDown={(event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                    }
                }}
                onChange={(event) => onChange(event.target.value.replace(/\r?\n/g, " "))}
            />

            {options.length > 0 && (
                <button
                    ref={triggerRef}
                    type="button"
                    className="suggested-input-toggle"
                    aria-label={label + ": choose from the list"}
                    aria-expanded={open}
                    aria-haspopup="listbox"
                    disabled={disabled}
                    onClick={() => {

                        if (open) {
                            close();
                            return;
                        }

                        // Opens on whatever is already in the box,
                        // so reopening to change it starts from that
                        // answer rather than from the top.
                        const at = options.indexOf(value.trim());

                        setActiveIndex(at >= 0 ? at : 0);
                        setOpen(true);

                    }}
                >
                    {/* The chevron is drawn by the stylesheet, from
                        the same 12x8 mark every dropdown in this app
                        carries -- a typed "▾" came out smaller than
                        its neighbours and at the mercy of the
                        font. */}
                </button>
            )}

            {open && (

                <div
                    ref={panelRef}
                    className="option-picker-list"
                    style={panelStyle}
                    role="listbox"
                    aria-label={label}
                    tabIndex={-1}
                    onKeyDown={onListKeyDown}
                >

                    {options.map((option, index) => (
                        <div
                            key={option}
                            className={
                                "option-picker-option" +
                                (option === value.trim()
                                    ? " option-picker-option-chosen"
                                    : "") +
                                (index === activeIndex
                                    ? " option-picker-option-active"
                                    : "")
                            }
                            role="option"
                            aria-selected={option === value.trim()}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => choose(option)}
                        >
                            {option}
                        </div>
                    ))}

                </div>

            )}

        </div>

    );

}

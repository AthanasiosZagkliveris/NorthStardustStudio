import { KeyboardEvent, useEffect, useId, useRef, useState, useSyncExternalStore } from "react";

import { usePopupDismiss } from "./PopupPanel.tsx";
import { ThemeService, ThemeChoice, type Theme } from "../services/ThemeService";
import { consumeKey } from "./interview/consumeKey";

import "../styles/option-picker.css";
import "../styles/theme-switch.css";

const OPTIONS: readonly { value: ThemeChoice; label: string; title: string }[] = [
    { value: "light", label: "Light", title: "Light theme" },
    { value: "sepia", label: "Sepia", title: "Sepia theme: warm paper for long reading" },
    { value: "dark", label: "Dark", title: "Dark theme" },
    { value: "auto", label: "Auto", title: "Follow the system's light or dark setting" }
];

/** The choice and the theme it comes to, as one value React can compare ("auto:dark"). */
function themeState(): string {
    const choice = ThemeService.getChoice();
    return choice + ":" + ThemeService.resolve(choice);
}

/** A sun, an open book for Sepia, a moon, and a half-filled circle for Auto. Drawn in the text colour. */
function ThemeIcon({ value }: { value: ThemeChoice }) {

    return (
        <svg className="header-tool-icon theme-switch-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
            {value === "light" && (
                <>
                    <circle cx="8" cy="8" r="3" fill="currentColor" />
                    <path
                        d="M8 1v2M8 13v2M1 8h2M13 8h2M3.05 3.05l1.4 1.4M11.55 11.55l1.4 1.4M3.05 12.95l1.4-1.4M11.55 4.45l1.4-1.4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </>
            )}
            {value === "sepia" && (
                <path
                    d="M8 4.2C6.6 3.2 4.6 2.8 2 3v9.3c2.6-.2 4.6.2 6 1.2 1.4-1 3.4-1.4 6-1.2V3c-2.6-.2-4.6.2-6 1.2zM8 4.2v9.3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                />
            )}
            {value === "dark" && (
                <path d="M13.5 10.2A6 6 0 0 1 5.8 2.5a6 6 0 1 0 7.7 7.7z" fill="currentColor" />
            )}
            {value === "auto" && (
                <>
                    <circle cx="8" cy="8" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 2a6 6 0 0 1 0 12z" fill="currentColor" />
                </>
            )}
        </svg>
    );

}

/**
 * THE READING MODE, in the app header: one compact picker. The button
 * shows the current mode's icon and name (the icon alone in a narrow
 * header, the name kept in its accessible name) and opens a short list
 * of the four, the current one marked (aria-selected, and bold). Built
 * like the app's option picker (OptionPicker.tsx), and drawn with its
 * list: Enter, Space or an arrow opens it on the current mode; Up,
 * Down, Home and End move; Enter or Space takes one; Escape or Tab
 * closes without changing anything; a click elsewhere closes it too.
 * Auto follows the system's light or dark setting (ThemeService).
 */
export default function ThemeSwitch() {

    const listId = useId();

    // The choice AND what it comes to: under Auto the system's change
    // alters only the latter, and the picker's icon has to follow it.
    const state = useSyncExternalStore(ThemeService.subscribe, themeState, themeState);
    const [choice, resolved] = state.split(":") as [ThemeChoice, Theme];
    const current = OPTIONS.find(option => option.value === choice) ?? OPTIONS[OPTIONS.length - 1];

    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);

    const containerRef = useRef<HTMLDivElement | null>(null);
    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const listRef = useRef<HTMLDivElement | null>(null);

    // A click anywhere else closes it without choosing.
    usePopupDismiss(open, [containerRef], () => setOpen(false), { escape: false });

    // The list takes the keyboard as it opens.
    useEffect(() => {
        if (open) {
            listRef.current?.focus({ preventScroll: true });
        }
    }, [open]);

    function start() {
        setActiveIndex(Math.max(0, OPTIONS.indexOf(current)));
        setOpen(true);
    }

    function close() {
        setOpen(false);
        triggerRef.current?.focus();
    }

    function choose(value: ThemeChoice) {
        ThemeService.setChoice(value);
        close();
    }

    function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
        if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            start();
        }
    }

    function onListKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        const last = OPTIONS.length - 1;
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
            case "Enter":
            case " ":
                event.preventDefault();
                choose(OPTIONS[activeIndex].value);
                break;
            // Consumed, so it closes the list and nothing else (see consumeKey).
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
        <div className="theme-switch" ref={containerRef}>

            <button
                ref={triggerRef}
                type="button"
                className="header-tool theme-switch-trigger"
                aria-label={"Reading mode: " + current.label}
                title={current.title}
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-controls={open ? listId : undefined}
                onClick={() => open ? close() : start()}
                onKeyDown={onTriggerKeyDown}
            >
                {/* Auto says "Auto", with the icon of what it comes to now. */}
                <ThemeIcon value={current.value === "auto" ? resolved : current.value} />
                <span className="header-tool-word">{current.label}</span>
                <svg className="theme-switch-chevron" viewBox="0 0 12 8" aria-hidden="true" focusable="false">
                    <path d="M1 1.5 6 6.5 11 1.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && (
                <div
                    ref={listRef}
                    id={listId}
                    className="option-picker-list theme-switch-list"
                    role="listbox"
                    aria-label="Reading mode"
                    tabIndex={-1}
                    aria-activedescendant={listId + "-" + OPTIONS[activeIndex].value}
                    onKeyDown={onListKeyDown}
                >
                    {OPTIONS.map((option, index) => (
                        <div
                            key={option.value}
                            id={listId + "-" + option.value}
                            className={
                                "option-picker-option theme-switch-option" +
                                (option.value === current.value ? " option-picker-option-chosen" : "") +
                                (index === activeIndex ? " option-picker-option-active" : "")
                            }
                            role="option"
                            aria-selected={option.value === current.value}
                            title={option.title}
                            onMouseEnter={() => setActiveIndex(index)}
                            onClick={() => choose(option.value)}
                        >
                            <ThemeIcon value={option.value} />
                            <span>{option.label}</span>
                        </div>
                    ))}
                </div>
            )}

        </div>
    );

}

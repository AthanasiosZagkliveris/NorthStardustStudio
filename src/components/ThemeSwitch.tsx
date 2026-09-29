import { useId, useSyncExternalStore } from "react";

import { ThemeService, ThemeChoice } from "../services/ThemeService";

import "../styles/theme-switch.css";

const OPTIONS: readonly { value: ThemeChoice; label: string; title: string }[] = [
    { value: "light", label: "Light", title: "Light theme" },
    { value: "sepia", label: "Sepia", title: "Sepia theme: warm paper for long reading" },
    { value: "dark", label: "Dark", title: "Dark theme" },
    { value: "auto", label: "Auto", title: "Follow the system's light or dark setting" }
];

/** A sun, an open book for Sepia, a moon, and a half-filled circle for Auto. Drawn in the text colour. */
function ThemeIcon({ value }: { value: ThemeChoice }) {

    return (
        <svg className="theme-switch-icon" width="14" height="14" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
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
 * The Light / Sepia / Dark / Auto switch in the app header. Four
 * radio buttons in one group, so the arrow keys move between them
 * and a screen reader announces the choice; Auto follows the
 * system's light or dark setting (ThemeService). In a narrow window
 * only the icons show, each still named by its label.
 */
export default function ThemeSwitch() {

    const name = useId();

    const choice = useSyncExternalStore(ThemeService.subscribe, ThemeService.getChoice, ThemeService.getChoice);

    return (
        <fieldset className="theme-switch">

            <legend className="theme-switch-legend">Theme</legend>

            {OPTIONS.map(option => (
                <label
                    key={option.value}
                    className={"theme-switch-option" + (choice === option.value ? " theme-switch-option-checked" : "")}
                    title={option.title}
                >
                    <input
                        type="radio"
                        className="theme-switch-input"
                        name={name}
                        value={option.value}
                        checked={choice === option.value}
                        onChange={() => ThemeService.setChoice(option.value)}
                    />
                    <ThemeIcon value={option.value} />
                    <span className="theme-switch-text">{option.label}</span>
                </label>
            ))}

        </fieldset>
    );

}

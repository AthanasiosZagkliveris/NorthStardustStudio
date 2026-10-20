import type { ReactNode } from "react";

import "../../styles/radio-choice.css";

/**
 * THE RADIO CHOICE: every choice of one among a few that is drawn as a round with a bullet and its word beside it (Units / %, Tiles / Table) is this one component.
 * Each option is a native radio (arrows move between them, Space chooses), named by `name` where its word is not enough. The place's class says only where it stands.
 */
export default function RadioChoice<T extends string>({ label, group, options, value, onChange, disabled, className }: {
    /** What the group chooses, for a screen reader. */
    label: string;
    /** The radios' shared name (one per group on the page). */
    group: string;
    options: readonly { id: T; label: ReactNode; /** The accessible name where the words are not enough. */ name?: string }[];
    value: T;
    onChange: (next: T) => void;
    disabled?: boolean;
    className?: string;
}) {
    return (
        <div className={"radio-choice" + (className ? " " + className : "")} role="radiogroup" aria-label={label}>
            {options.map(option => (
                <label key={option.id} className="radio-choice-option">
                    <input
                        type="radio"
                        name={group}
                        aria-label={option.name}
                        disabled={disabled}
                        checked={value === option.id}
                        onChange={() => onChange(option.id)}
                    />
                    <span>{option.label}</span>
                </label>
            ))}
        </div>
    );
}

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
    options: readonly { id: T; label: ReactNode; /** The accessible name where the words are not enough. */ name?: string; /** Not open yet: drawn grey and cannot be chosen (no reason beside it). */ locked?: boolean; /** The heading of the group this option opens, drawn above it in the field group title's style (owner, 2026-11-17). */ heading?: string }[];
    value: T;
    onChange: (next: T) => void;
    disabled?: boolean;
    className?: string;
}) {
    return (
        <div className={"radio-choice" + (className ? " " + className : "")} role="radiogroup" aria-label={label}>
            {options.map(option => [
                ...(option.heading ? [<span className="field-group-title radio-choice-heading" key={"heading-" + option.id} role="presentation">{option.heading}</span>] : []),
                <label key={option.id} className={"radio-choice-option" + (option.locked ? " radio-choice-option-locked" : "")}>
                    <input
                        type="radio"
                        name={group}
                        aria-label={option.name}
                        disabled={disabled || option.locked}
                        checked={value === option.id}
                        onChange={() => onChange(option.id)}
                    />
                    <span>{option.label}</span>
                </label>
            ])}
        </div>
    );
}

import type { ReactNode } from "react";

import "../../styles/date-format-toggle.css";

/**
 * THE SEGMENTED TOGGLE: every choice of one among a few that are all shown at once (the date presentation, Tiles / Table, the table's text size, the cost order, the
 * legend's connections) is this one component: the options side by side in one frame, the chosen one filled. `allowClear` lets a press on the chosen one choose
 * nothing. Each option is a button with its own name (`name`), pressed or not (`aria-pressed`). Its look is date-format-toggle.css (the name it had first).
 */
export default function SegmentedToggle<T extends string>({ label, options, value, onChange, allowClear = false, className }: {
    /** What the group chooses, for a screen reader. */
    label: string;
    options: readonly { id: T; label: ReactNode; /** The accessible name where the words are not enough ("Low to high" for an arrow). */ name?: string }[];
    value: T | "";
    onChange: (next: T | "") => void;
    allowClear?: boolean;
    className?: string;
}) {
    return (
        <div className={"date-format-toggle-group" + (className ? " " + className : "")} role="group" aria-label={label}>
            {options.map(option => (
                <button
                    key={option.id}
                    type="button"
                    className={"date-format-toggle-option" + (value === option.id ? " date-format-toggle-option-active" : "")}
                    aria-pressed={value === option.id}
                    aria-label={option.name}
                    onClick={() => onChange(allowClear && value === option.id ? "" : option.id)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}

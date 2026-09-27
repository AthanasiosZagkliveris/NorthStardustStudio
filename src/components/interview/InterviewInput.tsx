import { useListAutoFormat } from "../../hooks/useListAutoFormat.ts";
import { useAutoGrow } from "../../hooks/useAutoGrow.ts";

interface InterviewInputProps {
    value: string;
    onChange: (value: string) => void;
    rows?: number;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    mode?: "textarea" | "input" | "select";
    options?: string[];

    /**
     * The control's accessible name -- what a screen reader
     * announces when focus lands on it.
     *
     * Needed because these controls carry no visible <label>: the
     * thing naming them is a Table column header, a Multi-Part
     * column title, or a Section heading elsewhere in the DOM. A
     * `placeholder` is NOT a substitute -- it disappears as soon as
     * the field has content, and is announced inconsistently -- so
     * without this every field announced only as "edit text", with
     * no way to tell one from another.
     *
     * Optional so existing call sites are unaffected; supplied
     * wherever the caller knows the field's own title.
     */
    ariaLabel?: string;

    /**
     * Textarea mode only: grow the box to fit its content instead
     * of scrolling inside it (see useAutoGrow.ts). Its normal
     * height stays the minimum.
     */
    autoGrow?: boolean;
}

export default function InterviewInput({
    value,
    onChange,
    rows = 12,
    placeholder = "",
    disabled = false,
    className = "interview-input",
    mode = "textarea",
    options = [],
    ariaLabel,
    autoGrow = false
}: InterviewInputProps) {

    // Called unconditionally (mode can switch, and the "input"/"select"
    // branches below return early) -- the hook itself is a no-op for
    // those, since only the textarea JSX further down attaches its
    // ref/handlers.
    const listAutoFormat = useListAutoFormat(value, onChange);

    // Same ref, same reasoning: only the textarea attaches it.
    useAutoGrow(listAutoFormat.textareaRef, value, autoGrow && mode === "textarea");

    if (mode === "input") {
        return (
            <input
                className={className}
                aria-label={ariaLabel}
                type="text"
                value={value}
                placeholder={placeholder}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
            />
        );
    }

    if (mode === "select") {
        return (
            <select
                className={className}
                aria-label={ariaLabel}
                value={value}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
            >
                {/* Every dropdown's own placeholder option reads the
                    SAME single word, "Select" -- no "Select an
                    option"/"Select frequency"/etc variants, even when
                    a Framework-authored `placeholder` is supplied
                    (see FieldRenderer.tsx's own `field.placeholder`
                    passthrough) -- "The drop down options for all the
                    fields, should have only a default single word
                    Select". `placeholder` still applies normally to
                    the "input"/"textarea" modes above, unaffected. */}
                <option value="" disabled>
                    Select
                </option>
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        );
    }

    return (
        <textarea
            ref={listAutoFormat.textareaRef}
            className={className}
            aria-label={ariaLabel}
            value={value}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            onChange={listAutoFormat.onChange}
            onKeyDown={listAutoFormat.onKeyDown}
        />
    );
}

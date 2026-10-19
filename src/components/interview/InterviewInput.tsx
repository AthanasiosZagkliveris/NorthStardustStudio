import OptionPicker from "./OptionPicker.tsx";
import TextField from "../TextField.tsx";

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
     * height stays the minimum. On by default: every text box in
     * the app grows with its text, so none needs a resize handle
     * (textarea, conversation.css); `false` is for a box that
     * must keep a fixed height.
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
    autoGrow = true
}: InterviewInputProps) {

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
        // Every dropdown's own placeholder reads the SAME single word, "Select" -- no "Select an option" variants, even when a Framework-authored `placeholder` is supplied (see FieldRenderer.tsx's `field.placeholder` passthrough): "The drop down options for all the fields, should have only a default single word Select".
        return <OptionPicker label={ariaLabel ?? ""} options={options} value={value} disabled={disabled} onChange={onChange} />;
    }

    return (
        <TextField
            className={className}
            ariaLabel={ariaLabel}
            value={value}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            grow={autoGrow}
            onChange={onChange}
        />
    );
}

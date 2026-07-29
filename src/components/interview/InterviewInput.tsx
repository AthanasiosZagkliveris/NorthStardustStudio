import { useListAutoFormat } from "../../hooks/useListAutoFormat.ts";

interface InterviewInputProps {
    value: string;
    onChange: (value: string) => void;
    rows?: number;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    mode?: "textarea" | "input" | "select";
    options?: string[];
}

export default function InterviewInput({
    value,
    onChange,
    rows = 12,
    placeholder = "",
    disabled = false,
    className = "interview-input",
    mode = "textarea",
    options = []
}: InterviewInputProps) {

    // Called unconditionally (mode can switch, and the "input"/"select"
    // branches below return early) -- the hook itself is a no-op for
    // those, since only the textarea JSX further down attaches its
    // ref/handlers.
    const listAutoFormat = useListAutoFormat(value, onChange);

    if (mode === "input") {
        return (
            <input
                className={className}
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
                value={value}
                disabled={disabled}
                onChange={(event) => onChange(event.target.value)}
            >
                <option value="" disabled>
                    {placeholder || "Select an option"}
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
            value={value}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            onChange={listAutoFormat.onChange}
            onKeyDown={listAutoFormat.onKeyDown}
        />
    );
}

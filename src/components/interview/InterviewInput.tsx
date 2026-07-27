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
            className={className}
            value={value}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
        />
    );
}

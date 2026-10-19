import TextField from "../TextField.tsx";

/**
 * A multi-line answer field on the Strategy System pages: the shared TextField with its list writing.
 *
 * It never opens shorter than its own placeholder (the shared TextField measures the placeholder while the box is empty), so a long parameter list is readable.
 * Everything else is a plain textarea: same classes, same value,
 * same onChange.
 */
export default function StrategyTextArea({ className, ariaLabel, placeholder, disabled = false, value, onChange }: {
    className: string;
    ariaLabel: string;
    placeholder?: string;
    disabled?: boolean;
    value: string;
    onChange: (value: string) => void;
}) {
    return <TextField rows={2} className={className} ariaLabel={ariaLabel} placeholder={placeholder} disabled={disabled} value={value} onChange={onChange} />;
}

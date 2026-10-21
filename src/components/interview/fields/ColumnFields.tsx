import NumberedListInput from "./NumberedListInput.tsx";
import FieldLabel from "../../controls/FieldLabel.tsx";
import StrategyTextArea from "./StrategyTextArea.tsx";

/** A line of a list as written, without the number or bullet it may start with. */
function bare(line: string): string {
    return line.replace(/^\s*(?:\d+[.)]|[\u2022*-])\s*/, "");
}

/**
 * A column answered as a LIST (Ethics' Values and Principles): one numbered line each. The answer stays the one text it always was, a line for each,
 * "1. Craft over speed" -- what was written there before is read as the lines it already was.
 */
export function NumberedTextList({ label, value, onChange, disabled }: { label: string; value: unknown; onChange: (next: string) => void; disabled?: boolean }) {
    const written = typeof value === "string" ? value : "";
    const lines = written.split("\n").map(bare);
    return (
        <NumberedListInput
            label={label}
            items={lines.length > 0 ? lines : [""]}
            disabled={disabled}
            onChange={(items) => onChange(items.map((text, at) => text.trim() === "" ? "" : (at + 1) + ". " + text).join("\n").replace(/\n+$/, ""))}
        />
    );
}

const FIRST = /^\s*first impression:\s*/i;
const LASTING = /\n?\s*lasting impression:\s*/i;

/** The Imprint's answer as its two texts: what was written before is read as the two it already held ("First impression: ... Lasting impression: ..."). */
export function splitImprint(value: unknown): { first: string; lasting: string } {
    const written = typeof value === "string" ? value : "";
    const at = written.search(LASTING);
    const first = (at < 0 ? written : written.slice(0, at)).replace(FIRST, "");
    const lasting = at < 0 ? "" : written.slice(at).replace(LASTING, "");
    return { first: first.trim(), lasting: lasting.trim() };
}

/** The Imprint's two texts as its answer. */
export function joinImprint(first: string, lasting: string): string {
    return [first.trim() ? "First impression: " + first.trim() : "", lasting.trim() ? "Lasting impression: " + lasting.trim() : ""].filter(Boolean).join("\n");
}

/** The Ambassador's Imprint: a text for the First Impression and one for the Lasting Impression. */
export function ImprintFields({ value, onChange, disabled }: { value: unknown; onChange: (next: string) => void; disabled?: boolean }) {
    const { first, lasting } = splitImprint(value);
    return (
        <div className="column-fields">
            <FieldLabel as="label">First impression</FieldLabel>
            <StrategyTextArea
                className="interview-input"
                ariaLabel="First impression"
                placeholder="What first impression does the Ambassador leave?"
                disabled={disabled}
                value={first}
                onChange={(next) => onChange(joinImprint(next, lasting))}
            />
            <FieldLabel as="label">Lasting impression</FieldLabel>
            <StrategyTextArea
                className="interview-input"
                ariaLabel="Lasting impression"
                placeholder="What lasting impression remains? What should people feel and remember?"
                disabled={disabled}
                value={lasting}
                onChange={(next) => onChange(joinImprint(first, next))}
            />
        </div>
    );
}

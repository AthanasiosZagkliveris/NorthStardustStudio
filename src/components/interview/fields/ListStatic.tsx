import { ReactNode } from "react";

import "../../../styles/numbered-list.css";

export interface ListStaticLine {
    key: string;
    text: ReactNode;
    /** What stands at the line's end (a numbered list's). */
    end?: ReactNode;
    className?: string;
}

/**
 * THE READ-ONLY LIST: lines shown, not asked, as a numbered list (\`marker\` "number", the default) or a bullet list ("bullet"). The look is the numbered list's own (\`numbered-list.css\`): the number or bullet stands in the column of the list-number, and \`flush\` takes the indent away. \`start\` is the first number; \`label\` names a bullet list for assistive technology.
 */
export default function ListStatic({ lines, marker = "number", start = 1, flush = false, label }: {
    lines: readonly ListStaticLine[];
    marker?: "number" | "bullet";
    start?: number;
    flush?: boolean;
    label?: string;
}) {
    if (marker === "bullet") {
        return (
            <ul className="bullet-list-static" aria-label={label}>
                {lines.map(line => (
                    <li key={line.key}>
                        <span className="bullet-list-static-text">{line.text}</span>
                    </li>
                ))}
            </ul>
        );
    }
    return (
        <ol
            className={"numbered-list-static" + (flush ? " numbered-list-static-flush" : "")}
            start={start}
            style={start !== 1 ? { counterReset: "numbered-list-static " + (start - 1) } : undefined}
        >
            {lines.map(line => (
                <li key={line.key} className={line.className}>
                    <span className="numbered-list-static-text">{line.text}</span>
                    {line.end && (
                        <span className="numbered-list-static-end">{line.end}</span>
                    )}
                </li>
            ))}
        </ol>
    );
}

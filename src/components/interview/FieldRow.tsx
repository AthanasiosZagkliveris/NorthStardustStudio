import { ReactNode } from "react";

import FieldLabel from "../FieldLabel.tsx";
import InfoNote, { InfoPoint, InfoText } from "./InfoNote.tsx";
import { FieldMark, FieldStatus } from "./fieldMarks.tsx";

/**
 * THE FIELD ROW OF THE LEGAL ENTITY PAGE: a label and its control as one cell of the page's grid. The label is the field label, with its "i" 6px after its last word (`info`), the field's mark and status line, a link symbol after its words (`labelExtra`) and a × at its line's end for an optional field the user opened (`remove`). `side` puts the label beside its control, `wide` makes the cell as wide as the grid. `pair` is a field of several stacked in one column (its own holder; `nested` adds the space that tells one pair from the next). Written once here: the page's two row helpers were two copies of it.
 */
export default function FieldRow({ label, info, fullList = false, keyLabel, labelExtra, wide = false, side = false, pair = false, nested = false, remove, children }: {
    label: string;
    info?: InfoPoint[];
    /** The "i" lists all its points (an optional field's), not the first three. */
    fullList?: boolean;
    /** The field's key where its label was renamed (FieldKeys.ts). */
    keyLabel?: string;
    labelExtra?: ReactNode;
    wide?: boolean;
    side?: boolean;
    pair?: boolean;
    nested?: boolean;
    /** The × at the label's line end: the button itself (the page draws it). */
    remove?: ReactNode;
    children: ReactNode;
}) {
    const nest = pair && nested ? " legal-entity-label-nested" : "";
    // (A field with its × and a pair name their mark by the label; the others by the field's key where it was renamed.)
    const keyedMark = !remove && !pair;
    const marks = (
        <>
            <FieldMark label={label} keyLabel={keyedMark ? keyLabel : undefined} />
            <FieldStatus label={label} keyLabel={pair ? undefined : keyLabel} />
            {!remove && labelExtra}
        </>
    );
    const noted = (full: boolean) => (
        <InfoText text={label}>
            <InfoNote label={label} points={info ?? []} fullList={full} />
        </InfoText>
    );
    let head: ReactNode;
    if (remove) {
        head = (
            <span className={"legal-entity-label-row" + nest}>
                {info && !pair
                    ? (
                        <span className="legal-entity-label-info">
                            <FieldLabel className="legal-entity-label">{noted(true)}{marks}</FieldLabel>
                        </span>
                    )
                    : <FieldLabel className="legal-entity-label">{label}{marks}</FieldLabel>}
                {remove}
            </span>
        );
    } else if (info) {
        head = (
            <span className={"legal-entity-label-info" + nest}>
                <FieldLabel className="legal-entity-label">{noted(fullList)}{marks}</FieldLabel>
            </span>
        );
    } else {
        head = <FieldLabel className={"legal-entity-label" + nest}>{label}{marks}</FieldLabel>;
    }
    return (
        <div className={pair ? "legal-entity-pair" : "legal-entity-field" + (wide ? " legal-entity-field-wide" : "") + (side ? " legal-entity-field-side" : "")}>
            {head}
            {children}
        </div>
    );
}

import { ReactNode } from "react";

import FieldLabel from "../../controls/FieldLabel.tsx";
import InfoNote, { InfoPoint, InfoText } from "./InfoNote.tsx";
import { FieldMark, FieldStatus } from "./fieldMarks.tsx";

/**
 * THE HEAD OF A FIELD: its label (the field label) with its "i" 6px after the last word (`info`), its mark and its status line (inside the label, or after it inside the "i"'s holder: `statusAfter`), and what a place adds after its words (`extra`, a link symbol). The Business fields and the Legal Entity page's fields draw their label here; each passes its own classes.
 */
export function FieldHead({ label, info, fullList = false, keyLabel, labelClass, infoClass, statusAfter = false, extra, note }: {
    label: string;
    info?: readonly InfoPoint[];
    fullList?: boolean;
    keyLabel?: string;
    /** The label's class beside `field-label`. */
    labelClass: string;
    /** The class of the holder the label stands in where it has an "i". */
    infoClass: string;
    statusAfter?: boolean;
    extra?: ReactNode;
    /** A short note beside the label ("2 max"): one unbreakable piece, on the label's row where it fits and on the next row where it does not. */
    note?: ReactNode;
}) {
    const status = <FieldStatus label={label} keyLabel={keyLabel} />;
    if (info) {
        return (
            <span className={infoClass}>
                <FieldLabel className={labelClass}>
                    <InfoText text={label}>
                        <InfoNote label={label} points={[...info]} fullList={fullList} />
                    </InfoText>
                    {note ? <> {note}</> : null}
                    <FieldMark label={label} keyLabel={keyLabel} />
                    {!statusAfter && status}
                    {extra}
                </FieldLabel>
                {statusAfter && status}
            </span>
        );
    }
    return (
        <FieldLabel className={labelClass}>
            {label}
            {note ? <> {note}</> : null}
            <FieldMark label={label} keyLabel={keyLabel} />
            {status}
            {extra}
        </FieldLabel>
    );
}

/**
 * THE FIELD ROW OF THE LEGAL ENTITY PAGE: a label and its control as one cell of the page's grid. The label is the field label, with its "i" 6px after its last word (`info`), the field's mark and status line, a link symbol after its words (`labelExtra`) and a × at its line's end for an optional field the user opened (`remove`). `side` puts the label beside its control, `wide` makes the cell as wide as the grid. `pair` is a field of several stacked in one column (its own holder; `nested` adds the space that tells one pair from the next). Written once here: the page's two row helpers were two copies of it.
 */
export default function FieldRow({ label, info, fullList = false, keyLabel, labelExtra, labelNote, wide = false, side = false, pair = false, nested = false, remove, children }: {
    label: string;
    info?: InfoPoint[];
    /** The "i" lists all its points (an optional field's), not the first three. */
    fullList?: boolean;
    /** The field's key where its label was renamed (FieldKeys.ts). */
    keyLabel?: string;
    labelExtra?: ReactNode;
    /** A short note beside the label ("2 max"), kept whole on one row. */
    labelNote?: ReactNode;
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
    } else {
        // (A pair names its mark and status by the label, the others by the field's key where it was renamed.)
        head = <FieldHead label={label} info={info} fullList={fullList} keyLabel={pair ? undefined : keyLabel} labelClass={"legal-entity-label" + (info ? "" : nest)} infoClass={"legal-entity-label-info" + nest} extra={labelExtra} note={labelNote} />;
    }
    return (
        <div className={pair ? "legal-entity-pair" : "legal-entity-field" + (wide ? " legal-entity-field-wide" : "") + (side ? " legal-entity-field-side" : "")}>
            {head}
            {children}
        </div>
    );
}

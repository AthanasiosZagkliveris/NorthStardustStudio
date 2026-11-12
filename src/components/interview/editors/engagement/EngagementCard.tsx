/**
 * A CUSTOMER ENGAGEMENT FLOATING CARD, in the default floating card layout (owner, 2026-11-12 18:41: "does not follow the default floated card's lay out ... Compare it
 * with a Profile, Competitor or offering floated card"): the shared BusinessCard head (the number, the Offering's name, a link to its card on the Foundation page),
 * its sections as BusinessGroup (the double rule, the title band, the fold), and in each section the boxes of one column (SingleColumn): a box's title band, then
 * one band per question, the tints alternating, as the Offering card's boxes. Only shared components and classes: nothing here is styled on its own.
 */
import { Fragment, ReactNode, useState } from "react";
import { BusinessCard, BusinessGroup } from "../../cards/BusinessCardFields.tsx";
import FieldLabel from "../../../controls/FieldLabel.tsx";
import InfoNote, { InfoPoint, InfoText } from "../../fields/InfoNote.tsx";
import { SingleColumn } from "../foundation/shared.tsx";

/** The card: the Offering's number and name (its name a link to the Foundation's Offering, where it is named), always open. */
export function EngagementCard({ kind, number, name, anchor, ariaPrefix, onOpenName, headRow, children }: {
    kind: string;
    number: number;
    name: string;
    anchor: string;
    ariaPrefix?: string;
    onOpenName?: () => void;
    headRow?: ReactNode;
    children: ReactNode;
}) {
    return (
        <BusinessCard
            kind={kind}
            number={number}
            name={name}
            anchor={anchor}
            ariaPrefix={ariaPrefix}
            open
            headRow={headRow}
            emptyName="Unnamed Offering"
            nameLink={onOpenName ? { title: name.trim() || "Offering", onClick: onOpenName, ariaLabel: "Open the Foundation page, where the Offering " + (name.trim() || "") + " is defined" } : undefined}
        >
            {children}
        </BusinessCard>
    );
}

/** The folds of a card's sections, open until folded, kept while the page is open (as the Foundation cards' groupFold). */
export function useSectionFolds() {
    const [folded, setFolded] = useState<ReadonlySet<string>>(new Set());
    return (key: string, label: string) => ({
        open: !folded.has(key),
        label,
        onToggle: () => setFolded(current => {
            const next = new Set(current);
            if (!next.delete(key)) {
                next.add(key);
            }
            return next;
        })
    });
}

/** A section of the card: its double rule and title band (BusinessGroup), its boxes in one column. */
export function EngagementSection({ title, info, fold, extra, children }: {
    title: string;
    info?: InfoPoint[];
    fold: { open: boolean; label: string; onToggle: () => void };
    extra?: ReactNode;
    children: ReactNode;
}) {
    return (
        <BusinessGroup title={title} info={info} fold={fold} titleExtra={extra}>
            <SingleColumn>{children}</SingleColumn>
        </BusinessGroup>
    );
}

/** The boxes of a section, the shared double rule between one box and the next. */
export function EngagementBoxes({ children }: { children: ReactNode[] }) {
    const boxes = children.filter(Boolean);
    return (
        <>
            {boxes.map((box, at) => (
                <Fragment key={at}>
                    {at > 0 && <div className="business-capability-card-rule legal-entity-org-rule business-capability-card-rule-double" role="separator" />}
                    {box}
                </Fragment>
            ))}
        </>
    );
}

/** One box: its title band (with its "i" and what stands at its end), then a band per question, the tints alternating. */
export function EngagementBox({ title, info, extra, bands, anchor }: {
    title: ReactNode;
    info?: InfoPoint[];
    extra?: ReactNode;
    bands: ReactNode[];
    anchor?: string;
}) {
    const shown = bands.filter(band => band !== null && band !== undefined && band !== false && band !== "");
    const label = (
        <span className="business-foundation-label-info legal-entity-label-info">
            <FieldLabel className="business-foundation-label" role="heading" aria-level={4}>
                {info && typeof title === "string"
                    ? <InfoText text={title}><InfoNote label={title} points={info} fullList /></InfoText>
                    : title}
            </FieldLabel>
        </span>
    );
    return (
        <div className="business-segment-box" data-anchor={anchor}>
            {/* (What stands at the end of the title's row -- a source's figure and its x -- shares the row as a group's controls do: .fold-group-head.) */}
            <div className="legal-entity-org-section">
                {extra ? <div className="fold-group-head">{label}{extra}</div> : label}
            </div>
            {shown.map((band, at) => (
                <div className={"legal-entity-org-section" + (at % 2 === 1 ? " legal-entity-org-band" : "")} key={at}>{band}</div>
            ))}
        </div>
    );
}

/** A row of short ticks (the Goals: Get, Keep, Grow), in the row the Foundation's short choices stand in. */
export function TickRow({ label, children }: { label: string; children: ReactNode }) {
    return <div className="radio-choice business-segment-row" role="group" aria-label={label}>{children}</div>;
}

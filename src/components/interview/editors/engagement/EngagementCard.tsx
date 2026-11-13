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
import RadioChoice from "../../../controls/RadioChoice.tsx";

/** The card: the Offering's number and name (its name a link to the Foundation's Offering, where it is named), always open. */
export function EngagementCard({ kind, number, name, anchor, ariaPrefix, onOpenName, headRow, actions, emptyName = "Unnamed Offering", children, headless = false }: {
    /** What stands at the end of the head: the card's x (a relationship type's, while its Offering has another). */
    actions?: ReactNode;
    emptyName?: string;
    /** No head at all: the tile it opens from names the Offering and its Profiles (the relationship card; owner, 2026-11-12 19:54). */
    headless?: boolean;
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
            head={headless ? <></> : undefined}
            emptyName={emptyName}
            actions={actions}
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
    /** Absent where the card's head names the box (a relationship type's own card): its bands only. */
    title?: ReactNode;
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
            {/* (What stands at the end of the title band -- a source's figure, then its x in the card's x column -- shares the band's own row and line: owner,
                2026-11-13 12:32, the cards "follow the rules (colour bands, x buttons)".) */}
            {extra}
        </span>
    );
    const bandsOf = shown.map((band, at) => (
        <div className={"legal-entity-org-section" + (at % 2 === (title === undefined ? 0 : 1) ? " legal-entity-org-band" : "")} key={at}>{band}</div>
    ));
    // (With no title, its bands stand straight in the card under its head, the first tinted, so it parts from the head as a title band would.)
    if (title === undefined) {
        return <>{bandsOf}</>;
    }
    return (
        <div className="business-segment-box" data-anchor={anchor}>
            <div className="legal-entity-org-section">{label}</div>
            {shown.map((band, at) => (
                <div className={"legal-entity-org-section" + (at % 2 === 1 ? " legal-entity-org-band" : "")} key={at}>{band}</div>
            ))}
        </div>
    );
}

/**
 * WHAT A DIALOG OFFERS (owner, 2026-11-12 19:54: "an option to present all the options or only what it is come from the previous selections"): From your answers,
 * the channels, subchannels and relationship types the founder uses and those the earlier answers suggest; All, every option the page has, with its adds.
 * One choice for the Segment's three dialogs (Channels & Journey, Customer's Relationship, Demand & Conversion), at the head of each, From your answers first.
 */
export type OptionScope = "answers" | "all";
export function ScopeChoice({ value, onChange, group }: { value: OptionScope; onChange: (next: OptionScope) => void; group: string }) {
    return (
        <RadioChoice
            className="capability-overview-views"
            label="Show"
            group={group}
            options={[{ id: "answers", label: "From your answers" }, { id: "all", label: "All" }]}
            value={value}
            onChange={(next) => onChange(next as OptionScope)}
        />
    );
}

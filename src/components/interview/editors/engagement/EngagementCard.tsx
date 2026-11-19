/**
 * A CUSTOMER ENGAGEMENT FLOATING CARD, in the default floating card layout (owner, 2026-11-12 18:41: "does not follow the default floated card's lay out ... Compare it
 * with a Profile, Competitor or offering floated card"): the shared BusinessCard head (the number, the Offering's name, a link to its card on the Foundation page),
 * its sections as BusinessGroup (the double rule, the title band, the fold), and in each section the boxes of one column (SingleColumn): a box's title band, then
 * one band per question, the tints alternating, as the Offering card's boxes. Only shared components and classes: nothing here is styled on its own.
 */
import { Children, Fragment, ReactNode, isValidElement, useState } from "react";
import { BusinessCard, BusinessGroup } from "../../cards/BusinessCardFields.tsx";
import FieldLabel from "../../../controls/FieldLabel.tsx";
import InfoNote, { InfoPoint, InfoText } from "../../fields/InfoNote.tsx";
import { SingleColumn } from "../foundation/shared.tsx";

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
export function EngagementBox({ title, info, extra, bands, anchor, sections, headings }: {
    /** Absent where the card's head names the box (a relationship type's own card): its bands only. */
    title?: ReactNode;
    info?: InfoPoint[];
    extra?: ReactNode;
    bands: ReactNode[];
    anchor?: string;
    /** For each band, the section of a card it holds (BandSection), where the card groups its questions so. */
    sections?: (string | undefined)[];
    /** For each band, whether it is a section's heading band (a titled BandSection). */
    headings?: boolean[];
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
        <div className={"legal-entity-org-section" + (headings?.[at] ? " business-section-band" : at % 2 === (title === undefined ? 0 : 1) ? " legal-entity-org-band" : "")} data-section={sections?.[at]} key={at}>{band}</div>
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

/** What a card holds, its fragments opened out: one item a field, a row or a note. */
function cardItems(node: ReactNode): ReactNode[] {
    return Children.toArray(node).flatMap(child => isValidElement(child) && child.type === Fragment
        ? cardItems((child.props as { children?: ReactNode }).children)
        : [child]);
}

/**
 * A CARD'S QUESTIONS AS BANDS, with no title of their own (owner, 2026-11-18 10:38: Infrastructure & Capability's cards "to fit the other"): each question a band,
 * the tints alternating from the first, as a relationship type's card under its head (EngagementBox with no title); a line that says something of the question
 * above it -- a total, an alarm, a note -- stays in that question's band.
 */
export function EngagementBands({ children }: { children: ReactNode }) {
    // (A band of a SECTION holds every question of it, one under the other, the card's thin line between them: owner, 2026-11-18 21:45 and 22:00 UTC+2, "Start and End
    // page should be a section, defining the type another, costs another, notes, another, team and responsibilities another", "I did not ask for titles". Two
    // neighbouring parts of one section are one band; a section with nothing in it draws none; the card's order is kept.)
    const bands: { section?: string; heading?: boolean; items: ReactNode[]; questions: number }[] = [];
    for (const item of cardItems(children)) {
        if (isValidElement(item) && item.type === BandSection) {
            const { name, title, children: inner } = item.props as { name: string; title?: string; children?: ReactNode };
            const parts = cardItems(inner);
            if (parts.length === 0) {
                continue;
            }
            // (A section with a title stands under a section band of its own: the Profile's DESCRIPTION band, light capitals on the dark fill; owner, 2026-11-19
            // 00:16 and 01:08 UTC+2, the Offerings.)
            if (title) {
                bands.push({ section: name + "-heading", heading: true, items: [<span className="field-group-title business-foundation-subhead" role="heading" aria-level={3} key="heading">{title}</span>], questions: 0 });
            }
            const last = bands[bands.length - 1];
            const band = last && last.section === name ? last : { section: name, items: [], questions: 0 };
            if (band !== last) {
                bands.push(band);
            }
            for (const part of parts) {
                // (A card's own divider line in a section is no question of it: the band parts from the one above by its colour.)
                if (isValidElement(part) && part.type === "div" && /\bbusiness-capability-card-rule\b/.test(String((part.props as { className?: string }).className ?? ""))) {
                    continue;
                }
                const says = isValidElement(part) && part.type === "p" && band.items.length > 0;
                if (!says && band.questions > 0) {
                    band.items.push(<div className="business-capability-card-rule" role="separator" key={"rule-" + band.items.length} />);
                }
                band.items.push(part);
                band.questions += says ? 0 : 1;
            }
            continue;
        }
        // (A card's own divider line between its parts is no band of its own: the bands part from each other by their tints.)
        if (isValidElement(item) && item.type === "div" && /\bbusiness-capability-card-rule\b/.test(String((item.props as { className?: string }).className ?? ""))) {
            continue;
        }
        const says = isValidElement(item) && item.type === "p" && bands.length > 0;
        if (says) {
            bands[bands.length - 1].items.push(item);
        } else {
            bands.push({ items: [item], questions: 1 });
        }
    }
    return (
        <SingleColumn>
            <EngagementBox
                bands={bands.map((band, at) => <Fragment key={at}>{band.items.map((part, index) => <Fragment key={index}>{part}</Fragment>)}</Fragment>)}
                sections={bands.map(band => band.section)}
                headings={bands.map(band => !!band.heading)}
            />
        </SingleColumn>
    );
}

/** A SECTION OF A CARD IN BANDS (BandSection's names: dates, type, status, costs, options, team, notes, links, offerings): its questions stand in one band (EngagementBands), under a
 *  section band of its `title` where it has one; on a card that is not banded (the Workspace form) it is nothing but its questions. */
export function BandSection({ children }: { name: "dates" | "type" | "status" | "costs" | "options" | "team" | "notes" | "links" | "offerings"; title?: string; children?: ReactNode }) {
    return <>{children}</>;
}

/** A card's body: in bands, or as it stands (a card kept as it is: the Workspace form, owner's rule). */
export function CardBody({ banded, children }: { banded: boolean; children: ReactNode }) {
    return banded ? <EngagementBands>{children}</EngagementBands> : <>{children}</>;
}

import { useLayoutEffect, useRef, type ReactNode } from "react";

import { verticalAcross } from "../../../hooks/useVerticalLayout.ts";

import { getCapabilityColor } from "../../../data/capabilities";
import { getSystemIcon } from "../../../data/systemIcons";

interface InterviewHeaderProps {
    /** The symbol's drawing fills its square (a Capability's): drawn smaller, so every page's symbol is one height (owner, 2026-11-24 01:59 UTC+2). */
    iconFull?: boolean;
    /** Left out on a page that belongs to no System (the Workbook): its title is the name alone. */
    systemNumber?: string;
    systemName: string;
    capabilityId?: string;

    /**
     * The current page's own title, joined onto the System title
     * with a spaced em dash -- "1. Identity System — Definition: Who
     * are you?". A Strategy title's own " · Jan 2027 – Dec 2029"
     * period suffix keeps its middle dot. Passed only for a page that has moved its title up
     * here (a column-layout Section; see Conversation.tsx), which
     * then renders no separate heading of its own below. Omitted
     * everywhere else, leaving the System title exactly as it was.
     */
    pageTitle?: string;

    /**
     * The page title shown in capitals ("— INTRODUCTION"), by CSS
     * alone: the text stays as written, so a screen reader reads
     * "Introduction", not a spelled-out word.
     */
    pageTitleCapitals?: boolean;

    /** The title in capitals, by CSS alone (a Capability's page: "FOUNDATION"). */
    nameCapitals?: boolean;

    /** What stands after the title, inside the heading. */
    note?: ReactNode;

    /** The icon before the title on a page that belongs to no System (the Workbook's), drawn as a System's is. */
    icon?: string;

    /** What stands at the right end of the title's row (the Workbook's section buttons), on the title's line. */
    actions?: ReactNode;
}

export default function InterviewHeader({
    systemNumber,
    systemName,
    capabilityId,
    pageTitle,
    pageTitleCapitals = false,
    nameCapitals = false,
    note,
    icon: ownIcon,
    iconFull = false,
    actions
}: InterviewHeaderProps) {

    const color = getCapabilityColor(capabilityId);

    // (THE PAGE TITLE ON ONE LINE (owner, 2026-11-23 21:05 UTC+2: "let's refine it adjusting the text size"): a page of tiles is as wide as its tiles, so a long title
    // -- "Business System — 1. Foundation & Engagement" -- may not fit its rule; on a wide screen it steps down, 2px at a time, to 24px at the least, until it stands on
    // one line, so every page's tiles start at one height. The vertical layout keeps its two lines.)
    const heading = useRef<HTMLHeadingElement | null>(null);
    useLayoutEffect(() => {
        const node = heading.current;
        if (!node) {
            return;
        }
        const fit = () => {
            node.style.removeProperty("font-size");
            node.style.removeProperty("line-height");
            node.classList.remove("interview-header-page-only");
            const line = parseFloat(getComputedStyle(node).lineHeight) || (parseFloat(getComputedStyle(node).fontSize) || 0) * 1.2;
            // (THE PAGE'S NAME ALONE WHERE BOTH DO NOT FIT (owner, 2026-11-24 00:21 UTC+2: "If the system and the page title do not fit in a single row, then use
            // only the symbol and the page title"): on every window; the System's name stays in the page's symbol, its tooltip and the document's title.)
            if (pageTitle && line > 0 && node.getBoundingClientRect().height > line * 1.5) {
                node.classList.add("interview-header-page-only");
            }
            if (verticalAcross() > 0) {
                return;
            }
            // (Its line keeps its height, so the rule under it, and the tiles, stand where they do on every page.)
            if (line > 0) {
                node.style.lineHeight = line + "px";
            }
            let size = parseFloat(getComputedStyle(node).fontSize) || 0;
            while (line > 0 && size > 24 && node.getBoundingClientRect().height > line * 1.5) {
                size -= 2;
                node.style.fontSize = size + "px";
            }
        };
        fit();
        void document.fonts?.ready.then(fit);
        const observer = typeof ResizeObserver === "undefined" ? null : new ResizeObserver(() => fit());
        if (node.parentElement) {
            observer?.observe(node.parentElement);
        }
        return () => observer?.disconnect();
    }, [systemName, pageTitle]);
    const icon = ownIcon ?? (systemNumber ? getSystemIcon(Number(systemNumber)) : undefined);

    return (

        <header
            className="interview-header"
            style={{ "--capability-color": color } as React.CSSProperties}
        >

            <div className="interview-header-title-row">

                {icon && (
                    <img
                        src={icon}
                        alt=""
                        className={"interview-header-icon" + (iconFull ? " interview-header-icon-full" : "")}
                    />
                )}

                {/* (THE SYSTEM'S NAME WITHOUT ITS ORDER NUMBER (owner, 2026-11-23 17:28 UTC+2: "Hide the Systems order numbers on their tiles, and titles, but keep them
                    as information, documents and coding"): the number stays in the documents, the code and the heading's data, not drawn.) */}
                <h1 ref={heading} data-system-number={systemNumber}>
                    <span className={"interview-header-system" + (nameCapitals ? " interview-header-page-title-capitals" : "")}>{systemName}</span>
                    {pageTitle && (
                        <span className={"interview-header-page-title" + (pageTitleCapitals ? " interview-header-page-title-capitals" : "")}>
                            {/* (In the vertical layout the page's title stands on a line of its own under the System's name, without the dash: 01-interview.css.) */}
                            <span className="interview-header-dash">{" — "}</span>
                            {pageTitle}
                        </span>
                    )}
                    {note}
                </h1>

                {actions}

            </div>

            <div className="interview-divider" />

        </header>

    );

}

import { useLayoutEffect, useRef, type ReactNode } from "react";

import { verticalAcross } from "../../../hooks/useVerticalLayout.ts";
import { usePhonePage } from "../../../hooks/usePhonePage.ts";

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

    /**
     * The name of the open tab (the Handbook's, the Workbook's): where the title stands in the header it stands there in place of the name, which stays in the
     * symbol's tooltip (owner, 2026-11-25: "Here should not be the Handbook title, but the name of the page /tag"; app-header.css).
     */
    tabName?: string;

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
    tabName,
    icon: ownIcon,
    iconFull = false,
    actions
}: InterviewHeaderProps) {

    const color = getCapabilityColor(capabilityId);

    // (A phone's page: its ground in its chapters' colour, and a sideways swipe to the next or previous page -- usePhonePage.)
    usePhonePage();

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
            // (On one line it does not fit where it runs past its box: a phone in landscape, whose title stands in the header on one line, app-header.css.)
            // (Measured by its words against its content box: a title clipped in the header reports no overflow of its own -- "Capabil..." at 1024 x 768, owner,
            // 2026-11-25 15:51 UTC+2.)
            const style = getComputedStyle(node);
            const words = document.createRange();
            words.selectNodeContents(node);
            const room = node.clientWidth - (parseFloat(style.paddingLeft) || 0) - (parseFloat(style.paddingRight) || 0);
            const runsPast = node.scrollWidth > node.clientWidth + 1 || (style.whiteSpace === "nowrap" && typeof words.getBoundingClientRect === "function" && words.getBoundingClientRect().width > room + 0.5);
            if (pageTitle && line > 0 && (node.getBoundingClientRect().height > line * 1.5 || runsPast)) {
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
    // (EVERY PAGE'S SYMBOL THE HEIGHT OF THE TITLE'S CAPITALS, ON THEIR MIDDLE (owner, 2026-11-24 05:18 and 05:27 UTC+2: "make the systems' icon similar to size as
    // the capabilities"; "Double check all the icons to have the same height between them, and with the page titles"): the drawing's own ink is measured once the
    // picture has loaded -- its top and bottom in its square --, the square is sized so the ink stands as tall as the capitals (Inter's 0.727em of the title's
    // size), and moved so the ink's middle is the capitals' middle. Every System's and Capability's symbol alike, a new one too; a page with no title text keeps
    // the stylesheet's 36px.)
    const symbol = useRef<HTMLImageElement | null>(null);
    const ink = useRef<{ top: number; bottom: number } | null>(null);
    const alignSymbol = () => {
        const picture = symbol.current;
        const title = heading.current;
        // (The first words drawn: the System's name, or the page's alone where the title shows it alone.)
        const words = (title ? Array.from(title.querySelectorAll<HTMLElement>("span")).find(part => part.getBoundingClientRect().width > 0) : null) ?? title;
        if (!picture || !title || !words || !ink.current) {
            return;
        }
        const size = parseFloat(getComputedStyle(title).fontSize) || 0;
        const share = ink.current.bottom - ink.current.top;
        if (size <= 0 || share <= 0) {
            return;
        }
        const box = Math.round((0.727 * size) / share);
        picture.style.setProperty("--icon-box", box + "px");
        picture.style.translate = "0 0";
        const place = picture.getBoundingClientRect();
        const text = words.getBoundingClientRect();
        // (The capitals' middle in the text's box: Inter's ascender 0.96875em less half its cap height, 0.3635em.)
        const capitals = text.top + 0.605 * size;
        const middle = place.top + ((ink.current.top + ink.current.bottom) / 2) * place.height;
        picture.style.translate = "0 " + Math.round((capitals - middle) * 10) / 10 + "px";
    };
    const measureInk = (picture: HTMLImageElement) => {
        const canvas = document.createElement("canvas");
        canvas.width = 96;
        canvas.height = 96;
        let context: CanvasRenderingContext2D | null = null;
        try {
            context = canvas.getContext("2d");
        } catch {
            context = null;
        }
        if (!context) {
            return;
        }
        context.drawImage(picture, 0, 0, 96, 96);
        const data = context.getImageData(0, 0, 96, 96).data;
        let top = 96;
        let bottom = -1;
        for (let y = 0; y < 96; y++) {
            for (let x = 0; x < 96; x++) {
                if (data[(y * 96 + x) * 4 + 3] > 40) {
                    top = Math.min(top, y);
                    bottom = Math.max(bottom, y);
                }
            }
        }
        if (bottom < top) {
            return;
        }
        ink.current = { top: top / 96, bottom: (bottom + 1) / 96 };
        alignSymbol();
    };
    useLayoutEffect(() => {
        const again = () => window.requestAnimationFrame(alignSymbol);
        window.addEventListener("resize", again);
        window.addEventListener("tiles-fit", again);
        void document.fonts?.ready.then(again);
        const observer = typeof ResizeObserver === "undefined" || !heading.current ? null : new ResizeObserver(again);
        if (heading.current) {
            observer?.observe(heading.current);
        }
        return () => {
            window.removeEventListener("resize", again);
            window.removeEventListener("tiles-fit", again);
            observer?.disconnect();
        };
    // (Set up when the title changes, not at every render of the page: its observer measures it again whenever the title's box does.)
    }, [systemName, pageTitle]);

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
                        title={systemName}
                        ref={symbol}
                        className={"interview-header-icon" + (iconFull ? " interview-header-icon-full" : "")}
                        onLoad={(event) => measureInk(event.currentTarget)}
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
                    {/* (Drawn for the eye; the heading's name stays the Handbook's or the Workbook's, its tab named by the tab itself.) */}
                    {tabName && <span className="interview-header-tab-name" aria-hidden="true">{tabName}</span>}
                    {note}
                </h1>

                {actions}

            </div>

            <div className="interview-divider" />

        </header>

    );

}

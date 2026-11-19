import { ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";

import type { RailItem } from "./railItems";
import { PAGE_STATUS_WORDS } from "../../../framework/engine/PageStatus";
import { slotMargin, useRailSlot } from "./useRailSlot.ts";

import "../../../styles/status-shape.css";
import "../../../styles/bullet-rail.css";

// A narrow window's tooltip label sits this far from its bullet
// (bullet-rail.css), and at least this far from the screen edge.
const TOOLTIP_GAP = 12;
const TOOLTIP_EDGE_MARGIN = 8;

/**
 * A column of bullets beside the interview card, under its name:
 * pages on the left, the current page's sections on the right (both
 * held in place by a `.bullet-rails` wrapper, see bullet-rail.css).
 * The current bullet "blooms" blue and grows; the rest stay ice
 * blue. Its label turns bold too, and it carries aria-current, so
 * the state never rests on colour alone. The bullet is always on the side nearest the card:
 * label then bullet on the left, bullet then label on the right.
 *
 * An item with a `status` (a page's, or a section's) draws it as the
 * bullet's shape -- ○ not started, ◐ in progress, ● defined
 * (status-shape.css) -- inside the same active and hover looks,
 * and says it in words in the narrow layout's tooltip and in the
 * accessible name. No native `title`: the label is already on
 * screen (or in the app's own tooltip), and the browser's would only
 * repeat it over the page.
 */
export default function BulletRail({

    items,

    activeId,

    onSelect,

    side,

    label,

    arrow

}: {

    items: readonly RailItem[];
    activeId: string | null;
    onSelect: (id: string) => void;
    side: "left" | "right";
    label: string;
    /**
     * A page arrow (PageArrow) on its own row ABOVE the rail's title:
     * "‹" over PAGES, "›" over SECTIONS. Shown even where the rail
     * itself has too few items to draw.
     */
    arrow?: ReactNode;

}) {

    // Items whose tooltip label would be cut off by the screen edge
    // on the outer side, so it shows over the card instead.
    const [tooltipInside, setTooltipInside] = useState<Record<string, boolean>>({});

    // Narrow windows only (the label is a tooltip, absolutely
    // positioned): measure whether it fits on the outer side.
    function placeTooltip(id: string, button: HTMLButtonElement) {

        const tooltip = button.querySelector<HTMLElement>(".bullet-rail-label");

        if (!tooltip || getComputedStyle(tooltip).position !== "absolute") {
            return;
        }

        const bullet = button.getBoundingClientRect();

        const needed = tooltip.offsetWidth + TOOLTIP_GAP + TOOLTIP_EDGE_MARGIN;

        const fits = side === "left"
            ? bullet.left - needed >= 0
            : bullet.right + needed <= document.documentElement.clientWidth;

        if (tooltipInside[id] !== !fits) {
            setTooltipInside(previous => ({ ...previous, [id]: !fits }));
        }

    }

    // A label that does not fit on one line (it wraps in the gutter): the rail shows its bullets alone, and a name appears beside a bullet under the pointer.
    const nav = useRef<HTMLElement | null>(null);
    useLayoutEffect(() => {
        const node = nav.current;
        if (!node) {
            return;
        }
        // ONE RAIL FOR EVERY LAYER (layout rules section 10; owner, 2026-11-18 20:13 UTC+2: names "(full size) only when screen size permits"): the names show only
        // where the room beside the frame holds the named tab (--rail-tab-named-width, bullet-rail.css) and every name fits in it whole; else the bullets alone.
        const fit = () => {
            node.classList.remove("bullet-rail-compact");
            const box = node.getBoundingClientRect();
            const room = side === "left" ? box.right : window.innerWidth - box.left;
            const named = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--rail-tab-named-width")) || 388;
            // (THE RAIL SIZES TO ITS LONGEST NAME LIT (owner, 2026-11-19 22:47 UTC+2, the SEGMENTS rail: "2. Designers & Boutique Hotels" ran to the tab's edge; layout
            // rules section 10, "Names whole"): each name measured bold, with the bold tracking -- 0.05em wider a letter than at rest --, its dot and gap beside it, and
            // the padding on both sides; the named tab's width at least, wider where a name needs it and the room beside the frame holds it, else the bullets alone.)
            const style = getComputedStyle(node);
            const padding = (parseFloat(style.paddingLeft) || 0) + (parseFloat(style.paddingRight) || 0);
            let need = 0;
            let wraps = false;
            Array.from(node.querySelectorAll<HTMLElement>(".bullet-rail-label")).forEach(label => {
                const labelStyle = getComputedStyle(label);
                if (labelStyle.position === "absolute") {
                    return;
                }
                const size = parseFloat(labelStyle.fontSize) || 16;
                const item = label.closest<HTMLElement>(".bullet-rail-item");
                const lit = item?.classList.contains("active") ?? false;
                // (The letters shown: the status word stands in the narrow window's tooltip only.)
                const shown = (label.textContent ?? "").length - (label.querySelector(".bullet-rail-status-word")?.textContent ?? "").length;
                const extra = lit ? 0 : shown * size * 0.05;
                const beside = item ? item.getBoundingClientRect().width - label.getBoundingClientRect().width : 0;
                need = Math.max(need, label.scrollWidth + extra + Math.max(beside, 0));
                wraps = wraps || label.getBoundingClientRect().height > size * 1.9;
            });
            const width = Math.max(named, Math.ceil(need + padding));
            node.style.setProperty("--rail-own-named-width", width + "px");
            node.classList.toggle("bullet-rail-compact", wraps || room < width);
        };
        fit();
        window.addEventListener("resize", fit);
        return () => window.removeEventListener("resize", fit);
    });

    // ONE PLACEMENT FOR EVERY RAIL (useRailSlot; layout rules section 10, "One rail for every layer", "Page tab"): the rail starts 12px under its frame's top
    // (--rail-frame-top, bullet-rail.css) and the page arrow keeps the one arrow level (--arrow-level); where the rail stands under its arrow, the arrow takes one
    // line's place in the list, as a dialog's or a card's tab does. (Measured again when the window or the tiles settle: the arrow level moves with them.)
    const [, setSettled] = useState(0);
    useEffect(() => {
        const again = () => setSettled(count => count + 1);
        window.addEventListener("resize", again);
        window.addEventListener("tiles-fit", again);
        const later = [300, 900, 1600].map(delay => window.setTimeout(again, delay));
        return () => {
            window.removeEventListener("resize", again);
            window.removeEventListener("tiles-fit", again);
            later.forEach(timer => window.clearTimeout(timer));
        };
    }, []);
    const slot = useRailSlot(nav, () => {
        const arrowNode = nav.current?.querySelector<HTMLElement>(".bullet-rail-head > .page-arrow");
        if (!arrowNode) {
            return null;
        }
        const box = arrowNode.getBoundingClientRect();
        return box.width > 0 ? { left: box.left, right: box.right, top: box.top, bottom: box.bottom } : null;
    }, items.length >= 2, "ol > li");

    // The head: the page arrow on a row of its own, then the rail's
    // name ("PAGES", "SECTIONS"), hidden from assistive technology
    // (the nav's own label says it).
    const head = (
        <div className="bullet-rail-head">
            {arrow}
            {/* (No rail, no title: a page with nothing to list leaves its name out too.) */}
            {items.length >= 2 && <span className="bullet-rail-title" aria-hidden="true">{label}</span>}
        </div>
    );

    if (items.length < 2) {
        return arrow ? <div className={"bullet-rail bullet-rail-" + side}>{head}</div> : null;
    }

    return (
        <nav ref={nav} className={"bullet-rail bullet-rail-" + side} aria-label={label}>

            {head}

            <ol className="bullet-rail-list">

                {items.map((item, position) => {

                    const active = item.id === activeId;

                    const statusWord = item.status ? PAGE_STATUS_WORDS[item.status] : null;

                    // "2. Customer Engagement: in progress".
                    const name = statusWord ? item.label + ": " + statusWord : item.label;

                    const dot = (
                        <span
                            className="bullet-rail-dot status-shape"
                            data-status={item.status}
                            aria-hidden="true"
                        />
                    );

                    // A leading "1." stands in the list-number column
                    // (global.css), so the labels' text lines up.
                    const numbered = /^(\d+\.)\s+(.*)$/s.exec(item.label);
                    const text = (
                        <span className="bullet-rail-label">
                            {numbered
                                ? <><span className="list-number">{numbered[1]}</span> <span className="bullet-rail-label-text">{numbered[2]}</span></>
                                : item.label}
                            {/* In the narrow layout's tooltip only;
                                wide windows show the shape beside
                                the label and the word on hover. */}
                            {statusWord && (
                                <span className="bullet-rail-status-word">: {statusWord}</span>
                            )}
                        </span>
                    );

                    return (
                        <li key={item.id} style={slotMargin(slot, position) > 0 ? { marginTop: slotMargin(slot, position) } : undefined}>
                            <button
                                type="button"
                                className={"bullet-rail-item" + (active ? " active" : "") + (tooltipInside[item.id] ? " tooltip-inside" : "") + (item.capitals ? " bullet-rail-item-capitals" : "")}
                                aria-current={active ? "true" : undefined}
                                aria-label={statusWord ? name : undefined}
                                onClick={() => onSelect(item.id)}
                                onMouseEnter={event => placeTooltip(item.id, event.currentTarget)}
                                onFocus={event => placeTooltip(item.id, event.currentTarget)}
                            >
                                {side === "left" ? <>{text}{dot}</> : <>{dot}{text}</>}
                            </button>
                        </li>
                    );

                })}

            </ol>

        </nav>
    );

}

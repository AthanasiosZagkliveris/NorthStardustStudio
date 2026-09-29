import { useState } from "react";

import type { RailItem } from "./railItems";
import { PAGE_STATUS_WORDS } from "../../../framework/engine/PageStatus";

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
 * bullet's shape -- ○ not started, ◐ in progress, ● defined, ◆ needs
 * review (status-shape.css) -- inside the same active and hover looks,
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

    label

}: {

    items: readonly RailItem[];
    activeId: string | null;
    onSelect: (id: string) => void;
    side: "left" | "right";
    label: string;

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

    if (items.length < 2) {
        return null;
    }

    return (
        <nav className={"bullet-rail bullet-rail-" + side} aria-label={label}>

            {/* The rail's name, shown above it ("PAGES", "SECTIONS").
                Hidden from assistive technology: the nav's own
                label already says it. */}
            <span className="bullet-rail-title" aria-hidden="true">{label}</span>

            <ol className="bullet-rail-list">

                {items.map(item => {

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
                        <li key={item.id}>
                            <button
                                type="button"
                                className={"bullet-rail-item" + (active ? " active" : "") + (tooltipInside[item.id] ? " tooltip-inside" : "")}
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

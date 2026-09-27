import { useState } from "react";

import type { RailItem } from "./railItems";

import "../../../styles/bullet-rail.css";

// A narrow window's tooltip label sits this far from its bullet
// (bullet-rail.css), and at least this far from the screen edge.
const TOOLTIP_GAP = 12;
const TOOLTIP_EDGE_MARGIN = 8;

/**
 * A fixed column of bullets beside the interview card: pages on the
 * left, the current page's sections on the right. The current bullet
 * "blooms" blue and grows; the rest stay ice blue. Its label turns
 * bold too, and it carries aria-current, so the state never rests on
 * colour alone. The bullet is always on the side nearest the card:
 * label then bullet on the left, bullet then label on the right.
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

            <ol className="bullet-rail-list">

                {items.map(item => {

                    const active = item.id === activeId;

                    const dot = <span className="bullet-rail-dot" aria-hidden="true" />;

                    const text = <span className="bullet-rail-label">{item.label}</span>;

                    return (
                        <li key={item.id}>
                            <button
                                type="button"
                                className={"bullet-rail-item" + (active ? " active" : "") + (tooltipInside[item.id] ? " tooltip-inside" : "")}
                                aria-current={active ? "true" : undefined}
                                title={item.label}
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

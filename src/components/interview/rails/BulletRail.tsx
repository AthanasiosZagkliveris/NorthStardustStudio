import type { RailItem } from "./railItems";

import "../../../styles/bullet-rail.css";

/**
 * A fixed column of bullets beside the interview card: pages on the
 * left, the current page's sections on the right. The current bullet
 * "blooms" green and grows; the rest stay ice blue. Its label turns
 * bold too, and it carries aria-current, so the state never rests on
 * colour alone.
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

    if (items.length < 2) {
        return null;
    }

    return (
        <nav className={"bullet-rail bullet-rail-" + side} aria-label={label}>

            <ol className="bullet-rail-list">

                {items.map(item => {

                    const active = item.id === activeId;

                    return (
                        <li key={item.id}>
                            <button
                                type="button"
                                className={"bullet-rail-item" + (active ? " active" : "")}
                                aria-current={active ? "true" : undefined}
                                title={item.label}
                                onClick={() => onSelect(item.id)}
                            >
                                <span className="bullet-rail-dot" aria-hidden="true" />
                                <span className="bullet-rail-label">{item.label}</span>
                            </button>
                        </li>
                    );

                })}

            </ol>

        </nav>
    );

}

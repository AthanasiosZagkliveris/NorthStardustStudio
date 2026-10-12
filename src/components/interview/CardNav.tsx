import "../../styles/status-shape.css";
import "../../styles/bullet-rail.css";

/**
 * A strategy card's own navigation, as the page system has it: the previous / next arrows (the page arrow's look) and a rail of bullets, one for
 * each card under the same parent (the Goals of a Theme, the Objectives of a Goal, the Metrics of an Objective); this card's bullet is the lit
 * one. The left arrow stands under the card's "+", the right one under its x, the rail under the left arrow; the whole stays in view as the card
 * scrolls (sticky). Beside the x, outside the card, a symbol of four arrows pointing at the centre shows the group as tiles. A card alone has none.
 *
 * One card is shown at a time: an arrow or a bullet brings that card forward in the place of this one (groupView.ts).
 */
export default function CardNav({

    kind,

    ids,

    names,

    index,

    onGo,

    onTiles

}: {

    /** What the cards are called: "Goal", "Objective", "Metric". */
    kind: string;
    /** The ids of every card under the same parent, in order. */
    ids: readonly string[];
    /** Their names, for the bullets' tooltips ("" where a card has none yet). */
    names?: readonly string[];
    /** This card's place among them. */
    index: number;
    /** Brings a card forward. */
    onGo: (id: string) => void;
    /** Shows the group as tiles. */
    onTiles: () => void;

}) {

    if (ids.length < 2 || index < 0) {
        return null;
    }

    const last = ids.length - 1;

    return (
        <>
        <button
            type="button"
            className="strategy-box-tiles"
            aria-label={"Show the " + kind + "s as tiles"}
            title={"Show the " + kind + "s as tiles"}
            onClick={onTiles}
        >
            {/* Four diagonal arrows pointing at the centre. */}
            <svg viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                <path d="M2 2 L6.5 6.5 M3 6.5 H6.5 V3 M14 2 L9.5 6.5 M13 6.5 H9.5 V3 M2 14 L6.5 9.5 M3 9.5 H6.5 V13 M14 14 L9.5 9.5 M13 9.5 H9.5 V13" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </button>
        <div className="strategy-card-nav-lane">
            <nav className="strategy-card-nav" aria-label={kind + " navigation"}>

                <div className="strategy-card-nav-arrows">
                    <button
                        type="button"
                        className="page-arrow"
                        data-direction="previous"
                        aria-label={"Previous " + kind}
                        title={"Previous " + kind}
                        onClick={() => onGo(ids[index === 0 ? last : index - 1])}
                    >
                        ‹
                    </button>
                    <button
                        type="button"
                        className="page-arrow"
                        data-direction="next"
                        aria-label={"Next " + kind}
                        title={"Next " + kind}
                        onClick={() => onGo(ids[index === last ? 0 : index + 1])}
                    >
                        ›
                    </button>
                </div>

                <ol className="bullet-rail-list">
                    {ids.map((id, at) => (
                        <li key={id}>
                            <button
                                type="button"
                                className={"bullet-rail-item" + (at === index ? " active" : "")}
                                aria-current={at === index ? "true" : undefined}
                                aria-label={kind + " " + (at + 1) + (names?.[at]?.trim() ? ": " + names[at].trim() : "")}
                                onClick={() => onGo(id)}
                            >
                                <span className="bullet-rail-dot status-shape" aria-hidden="true" />
                                <span className="strategy-card-nav-tip" aria-hidden="true">{(at + 1) + ". " + (names?.[at]?.trim() || "Unnamed " + kind.toLowerCase())}</span>
                            </button>
                        </li>
                    ))}
                </ol>

            </nav>
        </div>
        </>
    );

}

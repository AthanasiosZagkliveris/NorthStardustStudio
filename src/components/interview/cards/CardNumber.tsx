/**
 * A folding card's number, in its head (.fold-card-head): "1.".
 *
 * THE KIND IS WRITTEN ONLY WHERE KINDS NEST. Where cards of several
 * kinds sit inside one another -- the Strategic Period's Theme >
 * Goal > Objective > Metric, a Segment holding its Profiles,
 * Competitors and Offerings -- the head says which kind it is: "1.
 * Goal", "1. Objective". Everywhere else the card list's own section
 * title already names its cards ("1. Founders", "Profiles", "1.
 * Revenue"), and the head is just the number and the name: "1.
 * Jordan Ellis", not "1. Founder Jordan Ellis".
 *
 * So `kind` is passed only by a card whose list nests kinds.
 */
export default function CardNumber({

    number,

    kind,

    legal = false

}: {

    number: number;
    /** The card's kind, for a card in a list that nests kinds. */
    kind?: string;
    /** The Legal Entity cards' own number markup (its own CSS), until the two are one. */
    legal?: boolean;

}) {

    if (legal) {
        return <span className="legal-entity-card-number">{number + "."}</span>;
    }

    return (
        <span className="strategy-box-number">
            {/* The number in the list-number column (global.css). */}
            <span className="list-number">{number + "."}</span>
            {kind ? " " + kind : ""}
        </span>
    );

}

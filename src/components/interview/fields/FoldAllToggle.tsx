import type { ItemFolds } from "./useItemFolds";

import "../../../styles/card-folding.css";

/**
 * "Expand all" / "Collapse all" for one group of item cards. Hidden
 * for a group of fewer than two, where it would only duplicate the
 * card's own arrow.
 *
 * It CASCADES: `nested` names the item folds inside those cards (an
 * Offering's Demand & Conversion block, say), and they open and close
 * with them, so "Expand all" shows everything the group holds. It
 * reads "Collapse all" only once all of it is open.
 */
export default function FoldAllToggle({

    ids,

    nested = [],

    folds,

    label

}: {

    ids: readonly string[];
    /** The folds inside the group's cards, opened and closed with them. */
    nested?: readonly string[];
    folds: ItemFolds;
    /** What the group holds, plural and lower case: "profiles". */
    label: string;

}) {

    if (ids.length < 2) {
        return null;
    }

    const all = [...ids, ...nested];

    const allOpen = folds.allOpen(all);

    return (
        <button
            type="button"
            className="fold-all-toggle"
            aria-label={(allOpen ? "Collapse all " : "Expand all ") + label}
            onClick={() => folds.setAll(all, !allOpen)}
        >
            {allOpen ? "Collapse all" : "Expand all"}
        </button>
    );

}

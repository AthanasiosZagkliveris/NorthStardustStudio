import type { ItemFolds } from "./useItemFolds";

import "../../styles/card-folding.css";

/**
 * "Expand all" / "Collapse all" for one group of item cards. Hidden
 * for a group of fewer than two, where it would only duplicate the
 * card's own arrow.
 */
export default function FoldAllToggle({

    ids,

    folds,

    label

}: {

    ids: readonly string[];
    folds: ItemFolds;
    /** What the group holds, plural and lower case: "profiles". */
    label: string;

}) {

    if (ids.length < 2) {
        return null;
    }

    const allOpen = folds.allOpen(ids);

    return (
        <button
            type="button"
            className="fold-all-toggle"
            aria-label={(allOpen ? "Collapse all " : "Expand all ") + label}
            onClick={() => folds.setAll(ids, !allOpen)}
        >
            {allOpen ? "Collapse all" : "Expand all"}
        </button>
    );

}

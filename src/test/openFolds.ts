import { act, fireEvent } from "@testing-library/react";

/**
 * Every fold arrow starts closed (the app's rule); the tests of the pages whose sections used to start open look inside them, so they open the structural
 * sections (a Segment, a channel, a numbered section, Costs, Funding Need, Revenue...) first. Folds a test is about (a category, an Offering's block) are left
 * as the page draws them.
 */
const STRUCTURAL = /^Maximize (Segment \d+|\d+\. .*|Costs|Funding Need|Capital & Funding|Financial Position|Revenue|Break Even|channel expenses|Customer Channel.*)$/i;

export function openFolds(container: HTMLElement): void {
    for (let pass = 0; pass < 6; pass++) {
        const closed = [...container.querySelectorAll<HTMLElement>("button[aria-expanded=\"false\"]")]
            .filter(button => STRUCTURAL.test(button.getAttribute("aria-label") ?? ""));
        if (closed.length === 0) {
            return;
        }
        act(() => {
            closed.forEach(button => fireEvent.click(button));
        });
    }
}

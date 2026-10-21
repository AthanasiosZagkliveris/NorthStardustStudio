import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import FoldAllToggle from "./FoldAllToggle";
import { useItemFolds } from "./useItemFolds";

function Harness({ ids, nested = [] }: { ids: string[]; nested?: string[] }) {

    const folds = useItemFolds();

    return (
        <>
            <FoldAllToggle ids={ids} nested={nested} folds={folds} label="profiles" />
            {[...ids, ...nested].map(id => (
                <span key={id}>{id}:{folds.isOpen(id) ? "open" : "closed"}</span>
            ))}
            {nested.map(id => (
                <button type="button" key={"toggle-" + id} onClick={() => folds.toggle(id)}>
                    {"toggle " + id}
                </button>
            ))}
        </>
    );

}

afterEach(cleanup);

describe("FoldAllToggle", () => {

    it("is hidden for fewer than two items", () => {

        render(<Harness ids={["a"]} />);

        expect(screen.queryByRole("button")).toBeNull();

    });

    it("expands then collapses the whole group", () => {

        render(<Harness ids={["a", "b"]} />);

        fireEvent.click(screen.getByRole("button", { name: "Expand all profiles" }));
        expect(screen.getByText("a:open")).toBeTruthy();
        expect(screen.getByText("b:open")).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Collapse all profiles" }));
        expect(screen.getByText("a:closed")).toBeTruthy();

    });

    // Cascade: the group's cards AND the folds nested inside them --
    // Engagement's "Expand all offerings" opens each Offering's Demand
    // & Conversion block too.
    it("opens and closes the nested folds with the cards", () => {

        render(<Harness ids={["a", "b"]} nested={["a-demand", "b-demand"]} />);

        fireEvent.click(screen.getByRole("button", { name: "Expand all profiles" }));
        expect(screen.getByText("a-demand:open")).toBeTruthy();
        expect(screen.getByText("b-demand:open")).toBeTruthy();

        fireEvent.click(screen.getByRole("button", { name: "Collapse all profiles" }));
        expect(screen.getByText("a:closed")).toBeTruthy();
        expect(screen.getByText("a-demand:closed")).toBeTruthy();
        expect(screen.getByText("b-demand:closed")).toBeTruthy();

    });

    // "Collapse all" only once everything it opens is open: a closed
    // nested fold leaves it offering to expand.
    it("offers Expand all while a nested fold is closed", () => {

        render(<Harness ids={["a", "b"]} nested={["a-demand"]} />);

        fireEvent.click(screen.getByRole("button", { name: "Expand all profiles" }));
        fireEvent.click(screen.getByRole("button", { name: "toggle a-demand" }));

        expect(screen.getByText("a:open")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Expand all profiles" })).toBeTruthy();

    });

    // Two nested folds are not a group of cards: the toggle still needs
    // two cards of its own.
    it("is hidden for one card, whatever it holds", () => {

        render(<Harness ids={["a"]} nested={["a-demand", "a-other"]} />);

        expect(screen.queryByRole("button", { name: /all profiles$/ })).toBeNull();

    });

});

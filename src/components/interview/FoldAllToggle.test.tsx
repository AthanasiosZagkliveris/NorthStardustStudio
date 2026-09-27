import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import FoldAllToggle from "./FoldAllToggle";
import { useItemFolds } from "./useItemFolds";

function Harness({ ids }: { ids: string[] }) {

    const folds = useItemFolds();

    return (
        <>
            <FoldAllToggle ids={ids} folds={folds} label="profiles" />
            {ids.map(id => <span key={id}>{id}:{folds.isOpen(id) ? "open" : "closed"}</span>)}
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

});

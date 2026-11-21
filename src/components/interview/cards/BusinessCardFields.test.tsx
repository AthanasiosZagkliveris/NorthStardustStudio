import { afterEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { BusinessCard, MissingScope, OptionalNote } from "./BusinessCardFields";
import { freshCards } from "./freshCards";
import { useState } from "react";
import { UndoService } from "../../../services/UndoService";

/* THE FIELDS OF A BUSINESS CARD (BusinessCardFields.tsx). */

describe("the business card", () => {
    afterEach(cleanup);

    describe("BusinessCard summary", () => {

        it("shows the summary only while folded", () => {

            const { rerender } = render(
                <BusinessCard kind="Resource" number={1} name="Notion" open={false} onToggle={() => {}} summary="Costs · $10 monthly">
                    <p>body</p>
                </BusinessCard>
            );

            expect(screen.getByText("Costs · $10 monthly")).toBeTruthy();
            expect(screen.queryByText("body")).toBeNull();

            rerender(
                <BusinessCard kind="Resource" number={1} name="Notion" open={true} onToggle={() => {}} summary="Costs · $10 monthly">
                    <p>body</p>
                </BusinessCard>
            );

            expect(screen.queryByText("Costs · $10 monthly")).toBeNull();
            expect(screen.getByText("body")).toBeTruthy();

        });

        // Inline beside the name it squeezed the name input to a few
        // letters: it has a row of its own, the head's second, under the
        // name (see .fold-card-head).
        it("puts the summary on its own row under the name", () => {

            render(
                <BusinessCard kind="Resource" number={1} name="Notion" onName={() => {}} open={false} onToggle={() => {}} summary="Costs · $10 monthly">
                    <p>body</p>
                </BusinessCard>
            );

            const summary = screen.getByText("Costs · $10 monthly");
            const head = summary.parentElement!;

            expect(head.classList.contains("fold-card-head")).toBe(true);
            expect(head.lastElementChild).toBe(summary);
            expect(summary.classList.contains("business-card-summary")).toBe(true);

        });

    });

    describe("BusinessCard name", () => {

        // Folded, a card is read, not edited: its name is text, as the
        // Founder card's is, and becomes a box once the card is opened.
        it("shows the name as text while folded and as a box once open", () => {

            const { rerender } = render(
                <BusinessCard kind="Resource" number={1} name="Notion" onName={() => {}} open={false} onToggle={() => {}}>
                    <p>body</p>
                </BusinessCard>
            );

            expect(screen.queryByRole("textbox", { name: "Resource 1 name" })).toBeNull();
            expect(screen.getByText("Notion").classList.contains("strategy-name-static")).toBe(true);

            rerender(
                <BusinessCard kind="Resource" number={1} name="Notion" onName={() => {}} open={true} onToggle={() => {}}>
                    <p>body</p>
                </BusinessCard>
            );

            expect((screen.getByRole("textbox", { name: "Resource 1 name" }) as HTMLInputElement).value).toBe("Notion");

        });

        it("names an unnamed folded card by its kind", () => {

            render(
                <BusinessCard kind="Resource" number={2} name="  " onName={() => {}} open={false} onToggle={() => {}}>
                    <p>body</p>
                </BusinessCard>
            );

            expect(screen.getByText("Unnamed resource")).toBeTruthy();

        });

    });
});

describe("the missing scope", () => {
    afterEach(() => freshCards.remove("card-1"));

    describe("a card's fields show what it lacks exactly when its tile flashes", () => {

        it("shows what a card lacks, its Name included, once it is not a card just made", () => {
            render(<MissingScope lacking={["Name", "Price"]} cardId="card-1">{(shown) => <p>{shown.join(",")}</p>}</MissingScope>);
            expect(screen.getByText("Name,Price")).toBeTruthy();
        });

        it("is quiet while the card is a card just made and still open, and speaks when it is closed", () => {
            freshCards.add("card-1");
            const view = render(<MissingScope lacking={["Name", "Price"]} cardId="card-1">{(shown) => <p>{"[" + shown.join(",") + "]"}</p>}</MissingScope>);
            expect(screen.getByText("[]")).toBeTruthy();
            freshCards.remove("card-1");
            view.rerender(<MissingScope lacking={["Name", "Price"]} cardId="card-1">{(shown) => <p>{"[" + shown.join(",") + "]"}</p>}</MissingScope>);
            expect(screen.getByText("[Name,Price]")).toBeTruthy();
        });

    });
});

describe("an optional field", () => {
    afterEach(cleanup);

    /** An OptionalNote over its own stored value, which the test can read. */
    function Harness({ initial, onStore }: { initial: string; onStore: (value: string) => void }) {
        const [value, setValue] = useState(initial);
        return (
            <OptionalNote
                label="Conditions"
                ariaLabel="Loan conditions"
                value={value}
                onChange={(next) => { setValue(next); onStore(next); }}
            />
        );
    }

    describe("an optional field opened by its tick box", () => {

        it("shows only its tick box and label until ticked, then the field, focused", () => {
            render(<Harness initial="" onStore={() => undefined} />);
            const tick = screen.getByRole("checkbox", { name: "Conditions" });
            expect((tick as HTMLInputElement).checked).toBe(false);
            expect(screen.queryByRole("textbox", { name: "Loan conditions" })).toBeNull();

            act(() => { fireEvent.click(tick); });

            const box = screen.getByRole("textbox", { name: "Loan conditions" });
            expect(document.activeElement).toBe(box);
            expect(box.closest("[data-field-kind=optional]")).toBeTruthy();
        });

        it("loads ticked when it already has content", () => {
            render(<Harness initial="Personal guarantee" onStore={() => undefined} />);
            expect((screen.getByRole("checkbox", { name: "Conditions" }) as HTMLInputElement).checked).toBe(true);
            expect((screen.getByRole("textbox", { name: "Loan conditions" }) as HTMLTextAreaElement).value).toBe("Personal guarantee");
        });

        it("closes straight away when empty", () => {
            render(<Harness initial="" onStore={() => undefined} />);
            const tick = screen.getByRole("checkbox", { name: "Conditions" });
            act(() => { fireEvent.click(tick); });
            act(() => { fireEvent.click(tick); });
            expect(screen.queryByRole("textbox", { name: "Loan conditions" })).toBeNull();
        });

        it("clears its text at once as it is unticked, marked as a removal the page can undo", () => {
            let stored = "Personal guarantee";
            render(<Harness initial={stored} onStore={(value) => { stored = value; }} />);
            const tick = screen.getByRole("checkbox", { name: "Conditions" });

            act(() => { fireEvent.click(tick); });

            expect(stored).toBe("");
            expect((tick as HTMLInputElement).checked).toBe(false);
            expect(screen.queryByRole("textbox", { name: "Loan conditions" })).toBeNull();
            expect(screen.queryByRole("button", { name: /Remove/ })).toBeNull();
            // The page's answer changed in the same moment: it offers the undo.
            expect(UndoService.takeRemoval()).toBe("Conditions");
        });

        it("keeps nothing hidden, so the documents have nothing hidden to print", () => {
            // Content can never sit behind an unticked box: text shows the
            // field ticked, and unticking clears what the documents read.
            let stored = "Only if the lender asks";
            render(<Harness initial={stored} onStore={(value) => { stored = value; }} />);
            act(() => { fireEvent.click(screen.getByRole("checkbox", { name: "Conditions" })); });
            expect(stored).toBe("");
            expect(document.body.textContent).not.toContain("Only if the lender asks");
        });

    });
});

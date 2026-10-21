import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { BusinessCard } from "../cards/BusinessCardFields";

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

import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { BusinessCard } from "./BusinessCardFields";

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

    // Inline in the head it squeezed the name input to a few letters.
    it("puts the summary on its own line below the head", () => {

        render(
            <BusinessCard kind="Resource" number={1} name="Notion" onName={() => {}} open={false} onToggle={() => {}} summary="Costs · $10 monthly">
                <p>body</p>
            </BusinessCard>
        );

        const summary = screen.getByText("Costs · $10 monthly");

        expect(summary.closest(".strategy-box-head")).toBeNull();
        expect(summary.previousElementSibling?.classList.contains("strategy-box-head")).toBe(true);

    });

});

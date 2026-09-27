import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessEngagementEditor from "./BusinessEngagementEditor";
import {
    BUSINESS_JOURNEY_STAGES,
    asBusinessEngagementValue,
    asBusinessFoundationValue,
    createBusinessChannel,
    createBusinessCustomerSegment,
    createBusinessOffering,
    createBusinessSegmentEngagement
} from "../../framework/engine/AnswerUtils";

/**
 * A Segment with two named Offerings, and one Channel that carries
 * both of them at the first Journey Stage -- so both Offerings get
 * an actual Customer Relationship block (relationshipsFor reads its
 * Offerings off the Channels table's interactions, not off Page 1
 * directly: an Offering with no channel and stage recorded against
 * it has no relationship row to fold at all).
 */
function engagementScenario() {

    const segment = createBusinessCustomerSegment([]);
    const audit = { ...createBusinessOffering(), name: "Audit" };
    const retainer = { ...createBusinessOffering(), name: "Retainer" };

    const foundation = {
        ...asBusinessFoundationValue(undefined),
        segments: [{
            ...segment,
            name: "Firms",
            offerings: [audit, retainer]
        }]
    };

    const engagement = {
        ...asBusinessEngagementValue(undefined),
        segments: [{
            ...createBusinessSegmentEngagement(segment.id),
            channels: [{
                ...createBusinessChannel(),
                id: segment.id + "-channel",
                category: "Website",
                offerings: [audit.id, retainer.id],
                stages: [BUSINESS_JOURNEY_STAGES[0].id]
            }, {
                ...createBusinessChannel(),
                id: segment.id + "-email",
                category: "Email"
            }, {
                ...createBusinessChannel(),
                id: segment.id + "-email-2",
                category: "Email"
            }]
        }]
    };

    return { foundation, engagement };

}

function Harness() {
    // Built once: the scenario's ids are random, and a Foundation
    // rebuilt on every render would no longer match the answer.
    const [{ foundation, engagement }] = useState(engagementScenario);
    const [value, setValue] = useState<unknown>(engagement);
    return <BusinessEngagementEditor value={value} onChange={setValue} foundation={foundation} />;
}

afterEach(cleanup);

describe("BusinessEngagementEditor folding", () => {

    it("folds per-Offering blocks but keeps the page sections open", () => {

        render(<Harness />);

        const all = screen.getAllByRole("button").filter(b => b.classList.contains("strategy-box-toggle"));
        const offeringBlocks = all.filter(b => /Audit|Retainer/.test(b.getAttribute("aria-label") ?? ""));
        const sections = all.filter(b => /Customer Channel|Customer Relationship/.test(b.getAttribute("aria-label") ?? ""));

        expect(offeringBlocks.length).toBeGreaterThan(0);
        offeringBlocks.forEach(b => expect(b.getAttribute("aria-expanded")).toBe("false"));
        sections.forEach(b => expect(b.getAttribute("aria-expanded")).toBe("true"));

    });

    // "B. Customer Relationship" has one Expand all, in its head --
    // the second one over the relationship table is gone.
    it("has a single Expand all for Customer Relationship", () => {

        render(<Harness />);

        expect(screen.getAllByRole("button", { name: "Expand all offerings" })).toHaveLength(1);
        expect(screen.queryByRole("button", { name: /demand and conversion blocks/ })).toBeNull();

    });

    it("starts Channel Categories collapsed, with a channel count", () => {

        render(<Harness />);

        const categories = screen.getAllByRole("button", { name: /^(Maximize|Minimize) (Website|Email)$/ });

        expect(categories).toHaveLength(2);
        categories.forEach(b => {
            expect(b.classList.contains("strategy-box-toggle")).toBe(true);
            expect(b.getAttribute("aria-expanded")).toBe("false");
        });

        expect(screen.getByText("1 channel")).toBeTruthy();
        expect(screen.getByText("2 channels")).toBeTruthy();

        // On its own line below the category select, not squeezed
        // into the row beside it.
        const count = screen.getByText("2 channels");
        expect(count.closest(".business-channel-category")).toBeNull();
        expect(count.previousElementSibling?.classList.contains("business-channel-category")).toBe(true);

    });

    it("opens every Channel Category with Expand all channel categories", () => {

        render(<Harness />);

        fireEvent.click(screen.getByRole("button", { name: "Expand all channel categories" }));

        screen.getAllByRole("button", { name: /^(Maximize|Minimize) (Website|Email)$/ })
            .forEach(b => expect(b.getAttribute("aria-expanded")).toBe("true"));

        expect(screen.queryByText("2 channels")).toBeNull();
        expect(screen.getByRole("button", { name: "Collapse all channel categories" })).toBeTruthy();

    });

    it("hides the References until asked for", () => {

        const { container } = render(<Harness />);

        const toggle = screen.getByRole("button", { name: "Show References" });
        expect(toggle.getAttribute("aria-expanded")).toBe("false");
        expect(container.querySelector<HTMLElement>(".business-engagement-reference-columns")?.hidden).toBe(true);

        fireEvent.click(toggle);

        expect(screen.getByRole("button", { name: "Hide References" }).getAttribute("aria-expanded")).toBe("true");
        expect(container.querySelector<HTMLElement>(".business-engagement-reference-columns")?.hidden).toBe(false);

    });

    it("opens a newly added Channel Category", () => {

        render(<Harness />);

        const before = new Set(screen.queryAllByRole("combobox").concat(screen.queryAllByRole("textbox")));

        fireEvent.click(screen.getByRole("button", { name: /Add Channel Category/ }));

        const added = screen.queryAllByRole("combobox").concat(screen.queryAllByRole("textbox"))
            .find(el => !before.has(el) && /Channel Category for an unnamed channel/.test(el.getAttribute("aria-label") ?? ""));

        expect(added).toBeTruthy();

        fireEvent.change(added!, { target: { value: "Podcast" } });

        expect(screen.getByRole("button", { name: "Minimize Podcast" }).getAttribute("aria-expanded")).toBe("true");

    });

});

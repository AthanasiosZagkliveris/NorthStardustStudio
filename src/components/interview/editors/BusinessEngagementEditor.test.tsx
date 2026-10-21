import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render as renderBase, screen } from "@testing-library/react";
import { openFolds } from "../../../test/openFolds.ts";

/** The page as it opens, its structural sections opened (every fold arrow starts closed: see openFolds). */
function render(ui: Parameters<typeof renderBase>[0], options?: Parameters<typeof renderBase>[1]) {
    const result = renderBase(ui, options);
    openFolds(result.container);
    return result;
}

import BusinessEngagementEditor from "./BusinessEngagementEditor";
import {
    BUSINESS_JOURNEY_STAGES,
    asBusinessEngagementValue,
    asBusinessFoundationValue,
    createBusinessChannel,
    createBusinessCustomerSegment,
    createBusinessOffering,
    createBusinessSegmentEngagement
} from "../../../framework/engine/AnswerUtils";

/** Opens a fold that is closed (its button says Maximize); the items of this page start OPEN, and then there is nothing to do. */
function maximize(name: string | RegExp) {
    const button = screen.queryAllByRole("button", { name })[0];
    if (button) {
        fireEvent.click(button);
    }
}


/** Opens every fold that starts closed: Customer Engagement's items start OPEN, and then there is nothing to expand (the button says Collapse all). */
function expandAll(name: string) {
    const button = screen.queryByRole("button", { name });
    if (button) {
        fireEvent.click(button);
    }
}

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

    it("starts the per-Offering blocks and the page sections open (they are content)", () => {

        render(<Harness />);

        const all = screen.getAllByRole("button").filter(b => b.classList.contains("strategy-box-toggle"));
        const offeringBlocks = all.filter(b => /Audit|Retainer/.test(b.getAttribute("aria-label") ?? ""));
        const sections = all.filter(b => /Customer Channel|Customer Relationship/.test(b.getAttribute("aria-label") ?? ""));

        expect(offeringBlocks.length).toBeGreaterThan(0);
        offeringBlocks.forEach(b => expect(b.getAttribute("aria-expanded")).toBe("true"));
        sections.forEach(b => expect(b.getAttribute("aria-expanded")).toBe("true"));

    });

    // "2. Customer Relationship" has one Expand all, in its head --
    // the second one over the relationship table is gone.
    it("has a single Collapse all for Customer Relationship (the items start open)", () => {

        render(<Harness />);

        expect(screen.getAllByRole("button", { name: "Collapse all offerings" })).toHaveLength(1);
        expect(screen.queryByRole("button", { name: /demand and conversion blocks/ })).toBeNull();

    });

    it("starts Channel Categories open, with a subchannel count", () => {

        render(<Harness />);

        const categories = screen.getAllByRole("button", { name: /^(Maximize|Minimize) (Website|Email)$/ });

        expect(categories).toHaveLength(2);
        categories.forEach(b => {
            expect(b.classList.contains("strategy-box-toggle")).toBe(true);
            expect(b.getAttribute("aria-expanded")).toBe("true");
        });

        // (The subchannel count is the summary of a FOLDED category: an open one shows its channels instead.)
        expect(screen.queryByText("1 subchannel")).toBeNull();

    });

    it("folds and opens every Channel Category with Collapse all and Expand all channel categories", () => {

        render(<Harness />);

        expandAll("Expand all channel categories");

        screen.getAllByRole("button", { name: /^(Maximize|Minimize) (Website|Email)$/ })
            .forEach(b => expect(b.getAttribute("aria-expanded")).toBe("true"));

        expect(screen.queryByText("2 subchannels")).toBeNull();
        expect(screen.getByRole("button", { name: "Collapse all channel categories" })).toBeTruthy();

    });

    it("shows the References on the card, with the fold arrow beside 1. SEGMENT and no Show / Hide button", () => {

        const { container } = render(<Harness />);

        expect(screen.queryByRole("button", { name: /(Show|Hide) References/ })).toBeNull();
        expect(container.querySelector(".business-engagement-reference")).toBeNull();
        expect(container.querySelector(".business-engagement-input > .fold-card-head")).toBeNull();

        const labels = [...container.querySelectorAll(".business-engagement-reference-column > .business-foundation-label-info")]
            .map(label => label.textContent?.replace(/\s+/g, " ").trim());
        expect(labels[0]).toContain("1.Segment");
        expect(labels[1]).toMatch(/^Profiles/);
        expect(labels[2]).toMatch(/^Offerings/);

        // The card's own arrow stands in the Segment column's heading.
        const heading = container.querySelector(".business-engagement-reference-column > .business-foundation-label-info")!;
        const arrow = screen.getByRole("button", { name: "Minimize Segment 1" });
        expect(heading.contains(arrow)).toBe(true);

        // The Segment's details start folded.
        const segmentColumn = container.querySelector(".business-engagement-reference-column")!;
        expect(segmentColumn.querySelector(".business-engagement-reference-facts")).toBeNull();

        // Folding the card leaves its heading and the Segment's name.
        fireEvent.click(arrow);
        expect(container.querySelector(".business-engagement-reference-columns")).toBeNull();
        const folded = container.querySelector(".business-engagement-segment-folded")!;
        expect(folded.textContent).toMatch(/1\.\s*Segment/);
        expect(screen.getByRole("button", { name: "Maximize Segment 1" })).toBeTruthy();

    });

    it("opens a newly added Channel Category", () => {

        render(<Harness />);

        const before = new Set(screen.queryAllByRole("combobox").concat(screen.queryAllByRole("textbox")));

        fireEvent.click(screen.getByRole("button", { name: /Add Channel/ }));

        const added = screen.queryAllByRole("combobox").concat(screen.queryAllByRole("textbox"))
            .find(el => !before.has(el) && /Channel for an unnamed subchannel/.test(el.getAttribute("aria-label") ?? ""));

        expect(added).toBeTruthy();

        fireEvent.change(added!, { target: { value: "Podcast" } });

        expect(screen.getByRole("button", { name: "Minimize Podcast" }).getAttribute("aria-expanded")).toBe("true");

    });

});

describe("BusinessEngagementEditor number limits", () => {

    it("refuses a keystroke that would take Buy (%) over 100", () => {

        function DemandHarness() {
            const [{ foundation, engagement }] = useState(() => {
                const scenario = engagementScenario();
                const audit = scenario.foundation.segments[0].offerings[0];
                return {
                    ...scenario,
                    engagement: {
                        ...scenario.engagement,
                        demand: { [audit.id]: { sources: [{ id: "s1", type: "referrals", calculate: true, estimate: "", inputs: {}, basis: "" }] } }
                    }
                };
            });
            const [value, setValue] = useState<unknown>(engagement);
            return <BusinessEngagementEditor value={value} onChange={setValue} foundation={foundation} />;
        }

        render(<DemandHarness />);

        // Expand all cascades into the Demand & Conversion blocks.
        expandAll("Expand all offerings");

        const buy = screen.getByLabelText("Buy (%), customer source 1 for Audit") as HTMLInputElement;
        ["1", "15", "150"].forEach(value => fireEvent.change(buy, { target: { value } }));

        expect(buy.value).toBe("15");

    });

});

describe("BusinessEngagementEditor formula references", () => {

    it("shows the sales funnel formula beside a counted result", () => {

        function DemandHarness() {
            const [{ foundation, engagement }] = useState(() => {
                const scenario = engagementScenario();
                const audit = scenario.foundation.segments[0].offerings[0];
                return {
                    ...scenario,
                    engagement: {
                        ...scenario.engagement,
                        demand: {
                            [audit.id]: {
                                sources: [{
                                    id: "s1",
                                    type: "funnel",
                                    calculate: true,
                                    estimate: "",
                                    inputs: { prospects: "40", qualified: "15", buy: "25" },
                                    basis: ""
                                }]
                            }
                        }
                    }
                };
            });
            const [value, setValue] = useState<unknown>(engagement);
            return <BusinessEngagementEditor value={value} onChange={setValue} foundation={foundation} />;
        }

        render(<DemandHarness />);

        // Expand all cascades into the Demand & Conversion blocks.
        expandAll("Expand all offerings");

        fireEvent.click(screen.getByRole("button", { name: "Sales funnel result: what this means" }));

        expect(screen.getByText("Formula:")).toBeTruthy();
        expect(screen.getByText("Sales / month = Prospects × Qualified% × Buy%")).toBeTruthy();
        // The formula is the app's own arithmetic: no outside source to cite.
        expect(screen.queryByRole("link")).toBeNull();

    });

});

describe("BusinessEngagementEditor offering picker", () => {

    // Two Offerings may share a name. Each gets its own label, as
    // every other picker gives them, and choosing the second records
    // the second -- not the first one with that name.
    it("tells apart and records two Offerings with the same name", () => {

        const segment = createBusinessCustomerSegment([]);
        const first = { ...createBusinessOffering(), name: "Audit" };
        const second = { ...createBusinessOffering(), name: "Audit" };

        const foundation = {
            ...asBusinessFoundationValue(undefined),
            segments: [{ ...segment, name: "Firms", offerings: [first, second] }]
        };

        const initial = {
            ...asBusinessEngagementValue(undefined),
            segments: [{
                ...createBusinessSegmentEngagement(segment.id),
                channels: [{ ...createBusinessChannel(), id: "channel-1", category: "Website" }]
            }]
        };

        let saved: unknown = initial;

        function PickHarness() {
            const [value, setValue] = useState<unknown>(initial);
            return (
                <BusinessEngagementEditor
                    value={value}
                    onChange={(next) => { saved = next; setValue(next); }}
                    foundation={foundation}
                />
            );
        }

        render(<PickHarness />);

        maximize("Maximize Website");
        fireEvent.click(screen.getByRole("button", { name: /^Offering 1 for Subchannel \d+:/ }));

        const options = screen.getAllByRole("option").map(option => option.textContent);
        expect(options).toContain("Audit");
        expect(options).toContain("Audit (2)");

        fireEvent.click(screen.getByRole("option", { name: "Audit (2)" }));

        const channel = asBusinessEngagementValue(saved).segments[0].channels[0];
        expect(channel.offerings).toEqual([second.id]);
        expect(screen.getByRole("button", { name: /^Offering 1 for Subchannel \d+: Audit \(2\)$/ })).toBeTruthy();

    });

    // A channel cannot be without Offerings: the last one is changed, not removed.
    it("never offers to remove a channel's last Offering", () => {

        render(<Harness />);

        maximize("Maximize Website");

        // Two carried: each can go.
        expect(screen.getAllByRole("button", { name: "Remove this Offering" })).toHaveLength(2);

        fireEvent.click(screen.getAllByRole("button", { name: "Remove this Offering" })[0]);

        // One left: nothing to remove.
        expect(screen.queryByRole("button", { name: "Remove this Offering" })).toBeNull();
        expect(screen.getByRole("button", { name: /^Offering 1 for Subchannel \d+: Retainer$/ })).toBeTruthy();

    });

    it("gives a new channel every Offering, with nothing to remove", () => {

        render(<Harness />);

        maximize("Maximize Email");

        expect(screen.getAllByRole("button", { name: /^Offering 1 for Subchannel \d+: All Offerings$/ }).length).toBeGreaterThan(0);

    });

});

describe("BusinessEngagementEditor Engagement Strategy (2. Customer Relationship)", () => {

    function StrategyHarness() {
        const [{ foundation, engagement }] = useState(() => {
            const scenario = engagementScenario();
            const [audit] = scenario.foundation.segments[0].offerings;
            const segment = scenario.engagement.segments[0];
            return {
                foundation: scenario.foundation,
                engagement: {
                    ...scenario.engagement,
                    segments: [{ ...segment, offerings: [{ offeringId: audit.id, types: ["self-service"], typeDetail: {} }] }]
                }
            };
        });
        const [value, setValue] = useState<unknown>(engagement);
        return <BusinessEngagementEditor value={value} onChange={setValue} foundation={foundation} />;
    }

    function openAudit() {
        const view = render(<StrategyHarness />);
        // (The Offering blocks start open.)
        const closed = screen.queryAllByRole("button", { name: /^Maximize (?!Demand).*Audit/ })[0];
        if (closed) {
            fireEvent.click(closed);
        }
        return view;
    }

    it("shows the Engagement Strategy as a table: a column for each stage (no fold arrow, its channels in an \"i\"), a row for the Goal and one for the Approach", () => {
        const { container } = openAudit();
        expect(screen.queryByRole("button", { name: /^Maximize Discover/ })).toBeNull();
        const table = container.querySelector("table.business-relationship-strategy-table")!;
        expect(table).toBeTruthy();
        expect(table.querySelectorAll("thead th").length).toBeGreaterThan(0);
        const rows = table.querySelectorAll(":scope > tbody > tr");
        expect(container.querySelector(".business-relationship-strategy-title")?.textContent).toContain("Goal");
        expect(rows[0].querySelector(".business-engagement-goal-ticks")).toBeTruthy();
        expect(container.querySelector(".business-relationship-strategy-title")?.textContent).toContain("Approach");
        expect(rows[1].querySelector("textarea[aria-label^=\"Approach\"]")).toBeTruthy();
        expect(screen.getByRole("button", { name: /Discover: the channels/ })).toBeTruthy();
    });

});

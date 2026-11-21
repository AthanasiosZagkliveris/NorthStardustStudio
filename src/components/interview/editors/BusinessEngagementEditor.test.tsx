import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { act, cleanup, fireEvent, render as renderBase, screen } from "@testing-library/react";
import { openFolds } from "../../../test/openFolds.ts";
import { closeAllTiles, openTile } from "../../../test/interviewTestUtils.ts";
import { createDemand, createDemandSource } from "../../../framework/engine/DemandCapacity.ts";

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
    channelCategoryHidden,
    createBusinessChannel,
    createBusinessCustomerSegment,
    createBusinessOffering,
    createBusinessSegmentEngagement
} from "../../../framework/engine/answers/AnswerUtils";

/** Opens a fold that is closed (its button says Maximise); the items of this page start OPEN, and then there is nothing to do. */
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
        expect(screen.queryByRole("button", { name: /sales forecast blocks/ })).toBeNull();

    });

    it("starts Channel Categories open, with a subchannel count", () => {

        render(<Harness />);

        const categories = screen.getAllByRole("button", { name: /^(Maximise|Minimise) (Website|Email)$/ });

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

        screen.getAllByRole("button", { name: /^(Maximise|Minimise) (Website|Email)$/ })
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
        const arrow = screen.getByRole("button", { name: "Minimise Segment 1" });
        expect(heading.contains(arrow)).toBe(true);

        // The Segment's details start folded.
        const segmentColumn = container.querySelector(".business-engagement-reference-column")!;
        expect(segmentColumn.querySelector(".business-engagement-reference-facts")).toBeNull();

        // Folding the card leaves its heading and the Segment's name.
        fireEvent.click(arrow);
        expect(container.querySelector(".business-engagement-reference-columns")).toBeNull();
        const folded = container.querySelector(".business-engagement-segment-folded")!;
        expect(folded.textContent).toMatch(/1\.\s*Segment/);
        expect(screen.getByRole("button", { name: "Maximise Segment 1" })).toBeTruthy();

    });

    it("opens a newly added Channel Category", () => {

        render(<Harness />);

        const before = new Set(screen.queryAllByRole("combobox").concat(screen.queryAllByRole("textbox")));

        fireEvent.click(screen.getByRole("button", { name: /Add Channel/ }));

        const added = screen.queryAllByRole("combobox").concat(screen.queryAllByRole("textbox"))
            .find(el => !before.has(el) && /Channel for an unnamed subchannel/.test(el.getAttribute("aria-label") ?? ""));

        expect(added).toBeTruthy();

        fireEvent.change(added!, { target: { value: "Podcast" } });

        expect(screen.getByRole("button", { name: "Minimise Podcast" }).getAttribute("aria-expanded")).toBe("true");

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

        // Expand all cascades into the Sales Forecast blocks.
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

        // Expand all cascades into the Sales Forecast blocks.
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

        maximize("Maximise Website");
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

        maximize("Maximise Website");

        // Two carried: each can go.
        expect(screen.getAllByRole("button", { name: "Remove this Offering" })).toHaveLength(2);

        fireEvent.click(screen.getAllByRole("button", { name: "Remove this Offering" })[0]);

        // One left: nothing to remove.
        expect(screen.queryByRole("button", { name: "Remove this Offering" })).toBeNull();
        expect(screen.getByRole("button", { name: /^Offering 1 for Subchannel \d+: Retainer$/ })).toBeTruthy();

    });

    it("gives a new channel every Offering, with nothing to remove", () => {

        render(<Harness />);

        maximize("Maximise Email");

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
        const closed = screen.queryAllByRole("button", { name: /^Maximise (?!Demand).*Audit/ })[0];
        if (closed) {
            fireEvent.click(closed);
        }
        return view;
    }

    it("shows the Engagement Strategy as a table: a column for each stage (no fold arrow, its channels in an \"i\"), a row for the Goal and one for the Approach", () => {
        const { container } = openAudit();
        expect(screen.queryByRole("button", { name: /^Maximise Discover/ })).toBeNull();
        const table = container.querySelector("table.business-relationship-strategy-table")!;
        expect(table).toBeTruthy();
        expect(table.querySelectorAll("thead th").length).toBeGreaterThan(0);
        const rows = table.querySelectorAll(":scope > tbody > tr");
        expect(container.querySelector(".business-relationship-strategy-title")?.textContent).toContain("Goal");
        expect(rows[0].querySelector(".business-engagement-goal-ticks")).toBeTruthy();
        expect(container.querySelector(".business-relationship-strategy-title")?.textContent).toContain("Approach");
        expect(rows[1].querySelector("textarea[aria-label^=\"Approach\"]")).toBeTruthy();
        // (The Retainer, with no type saved, has Personal Assistance too -- every Offering has one --, so its stage carries the same "i".)
        expect(screen.getAllByRole("button", { name: /Discover: the channels/ }).length).toBeGreaterThan(0);
    });

});

describe("BusinessEngagementEditor starts from Page 1 (phase 5f, 2026-11-09)", () => {

    function StartHarness({ saved }: { saved?: boolean }) {
        const [{ foundation, engagement }] = useState(() => {
            const scenario = engagementScenario();
            const [audit, retainer] = scenario.foundation.segments[0].offerings;
            const offerings = [{ ...audit, category: "Service", questions: { o3: ["project"] } }, { ...retainer, category: "Service", questions: { o3: ["retainer"] } }];
            return {
                foundation: { ...scenario.foundation, segments: [{ ...scenario.foundation.segments[0], offerings }] },
                // (A demand saved for the Retainer, bought one sale at a time: the page's own answer.)
                engagement: saved ? { ...scenario.engagement, demand: { [retainer.id]: { sources: [], recurring: false } } } : scenario.engagement
            };
        });
        const [value, setValue] = useState<unknown>(engagement);
        return <BusinessEngagementEditor value={value} onChange={setValue} foundation={foundation} />;
    }

    it("reads Customers Buy from the Offering's O3, shown as the terms say it (owner, 2026-11-13 16:50)", () => {
        const { container } = render(<StartHarness />);
        expandAll("Expand all offerings");
        const shown = [...container.querySelectorAll(".strategy-name-static")].map(node => node.textContent);
        expect(shown).toEqual(expect.arrayContaining(["Every month, until they cancel", "One sale at a time"]));
        expect(screen.queryByRole("button", { name: /^How customers buy/ })).toBeNull();
    });

    it("keeps the terms over an answer saved before: a retainer is bought every month", () => {
        let saved: ReturnType<typeof asBusinessEngagementValue> | null = null;
        function Saved() {
            const [{ foundation, engagement }] = useState(() => {
                const scenario = engagementScenario();
                const [audit, retainer] = scenario.foundation.segments[0].offerings;
                const offerings = [{ ...audit, category: "Service", questions: { o3: ["project"] } }, { ...retainer, category: "Service", questions: { o3: ["retainer"] } }];
                return { foundation: { ...scenario.foundation, segments: [{ ...scenario.foundation.segments[0], offerings }] }, engagement: { ...scenario.engagement, demand: { [retainer.id]: { sources: [], recurring: false } } }, retainer };
            });
            const [value, setValue] = useState<unknown>(engagement);
            return <BusinessEngagementEditor value={value} onChange={(next) => { saved = asBusinessEngagementValue(next); setValue(next); }} foundation={foundation} />;
        }
        render(<Saved />);
        expect(Object.values(saved!.demand).some(entry => entry.recurring === true)).toBe(true);
    });
});

describe("BusinessEngagementEditor without a physical item (Questions 2, 11.7)", () => {

    /** The channel tiles of one Segment whose Offerings are of these Types, with these channels already made. */
    function tileTitles(types: string[], channels: string[] = []) {
        const segment = createBusinessCustomerSegment([]);
        const foundation = {
            ...asBusinessFoundationValue(undefined),
            // (Where they shop names a website and stockists: their channels are suggested; the physical ones hide while no Offering is physical.)
            segments: [{ ...segment, name: "Firms", questions: { setting: ["multi"], shops: ["stockists"] }, offerings: types.map((category, at) => ({ ...createBusinessOffering(), name: "Offering " + (at + 1), category })) }]
        };
        const engagement = {
            ...asBusinessEngagementValue(undefined),
            segments: [{ ...createBusinessSegmentEngagement(segment.id), channels: channels.map(category => ({ ...createBusinessChannel(), category, name: "Shop" })) }]
        };
        render(<BusinessEngagementEditor value={engagement} onChange={() => undefined} foundation={foundation} asTiles />);
        // (The channels are the tiles of the Channels dialog: it opens first; the ones the answers suggest stand faded.)
        openTile("Channels & Journey");
        const titles = [...document.querySelectorAll(".section-tile .section-tile-title")].map(title => (title.textContent ?? "").replace(/\s+/g, " "));
        cleanup();
        return titles;
    }

    it("hides the Physical Delivery and Retail & Wholesale channels while no Offering is physical, as Page 3 hides its physical categories", () => {
        const services = tileTitles(["Service", "Service"]);
        expect(services).not.toContain("Physical Delivery");
        expect(services).not.toContain("Retail & Wholesale");
        expect(services).toContain("Website");
        // (A Product or Hybrid Offering brings them back: hidden, never deleted.)
        for (const types of [["Service", "Product"], ["Hybrid"]]) {
            expect(tileTitles(types)).toEqual(expect.arrayContaining(["Retail & Wholesale"]));
        }
        // (A channel already made stays shown.)
        const kept = tileTitles(["Service"], ["Retail & Wholesale"]);
        expect(kept).toContain("Retail & Wholesale");
        expect(kept).not.toContain("Physical Delivery");
    });

    it("says which channel categories are hidden: only the two physical ones, only with no physical item, only while unused", () => {
        expect(channelCategoryHidden("Physical Delivery", true, [])).toBe(true);
        expect(channelCategoryHidden("Retail & Wholesale", true, [])).toBe(true);
        expect(channelCategoryHidden("Retail & Wholesale", true, ["Retail & Wholesale"])).toBe(false);
        expect(channelCategoryHidden("Physical Delivery", false, [])).toBe(false);
        expect(channelCategoryHidden("Website", true, [])).toBe(false);
    });

});

describe("Customer Engagement follows the Foundation (Questions 17, section 3)", () => {

    it("suggests a channel from how the customers discover you, in the one grid of channels, and pressing it adds that channel at its stage", () => {
        const segment = { ...createBusinessCustomerSegment([]), name: "Firms", questions: { discover: ["search"] } };
        const foundation = { ...asBusinessFoundationValue(undefined), segments: [segment] };
        let saved: ReturnType<typeof asBusinessEngagementValue> | null = null;
        render(<BusinessEngagementEditor value={asBusinessEngagementValue(undefined)} onChange={(next) => { saved = next as ReturnType<typeof asBusinessEngagementValue>; }} foundation={foundation} asTiles />);
        openTile("Channels & Journey");
        // (One grid: the channel the Segment does not use yet is a faded tile listing the subchannel suggested for it.)
        const tile = [...document.querySelectorAll<HTMLElement>(".section-tile")].find(candidate => (candidate.textContent ?? "").startsWith("Website")) as HTMLElement;
        expect(tile).toBeTruthy();
        expect(tile.closest(".section-tile-slot")?.textContent).toContain("Main Website");
        fireEvent.click(tile);
        const channels = saved!.segments.find(entry => entry.segmentId === segment.id)!.channels;
        // (A new Segment starts with one blank channel; the suggestion is added beside it.)
        expect(channels.filter(channel => channel.category !== "").map(channel => [channel.category, channel.name, channel.stages])).toEqual([["Website", "Main Website", ["discovery"]]]);
    });

    it("links a subchannel tile's Offerings only where they have cards of their own (owner, 2026-11-16 14:24)", () => {
        const segment = { ...createBusinessCustomerSegment([]), name: "Makers", offerings: [{ ...createBusinessOffering(), name: "Throws" }, { ...createBusinessOffering(), name: "Classes" }] };
        const foundation = { ...asBusinessFoundationValue(undefined), segments: [segment] };
        const [throws, classes] = segment.offerings.map(offering => offering.id);
        const engagement = {
            ...asBusinessEngagementValue(undefined),
            segments: [{ ...createBusinessSegmentEngagement(segment.id), channels: [
                { ...createBusinessChannel(), category: "Social Media", name: "Instagram", offerings: ["*"], stages: ["discovery"] },
                { ...createBusinessChannel(), category: "Social Media", name: "Pinterest", offerings: [throws], stages: ["discovery"] },
                { ...createBusinessChannel(), category: "Social Media", name: "Pinterest", offerings: [classes], stages: ["discovery"] }
            ] }]
        };
        render(<BusinessEngagementEditor value={engagement} onChange={() => undefined} foundation={foundation} asTiles />);
        openTile("Channels & Journey");
        fireEvent.click([...document.querySelectorAll<HTMLElement>(".section-tile")].find(tile => (tile.textContent ?? "").startsWith("Social Media"))!);
        const slot = (name: string) => [...document.querySelectorAll<HTMLElement>(".section-tile-overlay .card-tile-slot")].find(entry => (entry.textContent ?? "").includes(name))!;
        // (One card serves both: its Offerings are words, the tile opens the card.)
        expect(slot("Instagram").querySelectorAll(".section-tile-link")).toHaveLength(0);
        expect(slot("Instagram").textContent).toContain("Throws");
        // (A card for each Offering: each Offering a link to its own card.)
        expect(slot("Pinterest").querySelectorAll(".section-tile-link")).toHaveLength(2);
    });

    it("lists an answer-made channel the founder removed under Removed, and Restore brings it back (owner, 2026-11-16 16:36)", () => {
        const base = asBusinessFoundationValue(undefined).segments[0];
        const segment = { ...base, name: "Makers", profiles: [{ ...base.profiles[0], questions: { c2: ["instagram", "facebook"] } }] };
        const foundation = { ...asBusinessFoundationValue(undefined), segments: [segment] };
        const engagement = {
            ...asBusinessEngagementValue(undefined),
            segments: [{ ...createBusinessSegmentEngagement(segment.id), channels: [{ ...createBusinessChannel(), category: "Social Media", name: "Facebook", stages: ["discovery"], fromAnswers: true }], dismissedChannels: ["social media|instagram"] }]
        };
        let saved: ReturnType<typeof asBusinessEngagementValue> = engagement as never;
        function Host() {
            const [value, setValue] = useState<unknown>(engagement);
            return <BusinessEngagementEditor value={value} onChange={(next) => { saved = next as ReturnType<typeof asBusinessEngagementValue>; setValue(next); }} foundation={foundation} asTiles />;
        }
        render(<Host />);
        openTile("Channels & Journey");
        fireEvent.click(screen.getByRole("button", { name: "Maximise Removed channels" }));
        fireEvent.click(screen.getByRole("button", { name: "Restore" }));
        expect(saved.segments[0].dismissedChannels ?? []).toEqual([]);
        expect(saved.segments[0].channels.map(channel => channel.name)).toEqual(expect.arrayContaining(["Facebook", "Instagram"]));
    });

    it("makes the Customer Sources the Foundation proposes, as the channels are, with no add of its own; a removed one comes back from Removed (owner, 2026-11-16 19:18)", () => {
        const segment = { ...createBusinessCustomerSegment([]), name: "Firms", offerings: [{ ...createBusinessOffering(), name: "Audit" }, { ...createBusinessOffering(), name: "Payroll" }] };
        const foundation = { ...asBusinessFoundationValue(undefined), segments: [segment] };
        const site = { ...createBusinessChannel(), category: "Website", name: "Main Website", stages: ["discovery"] };
        const flyers = { ...createBusinessChannel(), category: "Other", name: "Church noticeboard", stages: ["discovery"] };
        const engagement = { ...asBusinessEngagementValue(undefined), segments: [{ ...createBusinessSegmentEngagement(segment.id), channels: [site, flyers] }] };
        function Harness() {
            const [value, setValue] = useState<unknown>(engagement);
            return <BusinessEngagementEditor value={value} onChange={setValue} foundation={foundation} asTiles />;
        }
        render(<Harness />);
        openTile("Sales Forecast");
        openTile("1. Audit");
        const tiles = () => [...document.querySelectorAll<HTMLElement>(".section-tile-overlay .card-tile")].map(tile => tile.textContent ?? "");
        // (A sales funnel through the website, and an Other source by its channel's name.)
        expect(tiles().some(text => text.includes("Sales funnel") && text.includes("Main Website"))).toBe(true);
        expect(tiles().some(text => text.includes("Church noticeboard"))).toBe(true);
        expect(tiles().some(text => text.includes("Suggested from your Foundation"))).toBe(false);
        expect(screen.queryAllByRole("button", { name: /Add Card/ })).toHaveLength(0);
    });

});

describe("every Offering has at least one relationship type (owner, 2026-11-13 00:29)", () => {

    function TilesHarness() {
        const [{ foundation, engagement }] = useState(engagementScenario);
        const [value, setValue] = useState<unknown>(engagement);
        return <BusinessEngagementEditor value={value} onChange={setValue} foundation={foundation} asTiles />;
    }
    const removes = () => [...document.querySelectorAll(".floating-card-host .card-remove, .floating-card-host .strategy-box-remove")];

    it("gives an Offering with no answers Personal Assistance, its card with no x while it is the only type; a second type is a card of its own, with its x", async () => {
        render(<TilesHarness />);
        openTile("Customer's Relationship");
        // (A LONE CARD OPENS DIRECTLY (owner, 2026-11-14 13:54; kept 2026-11-16 16:39): the type's link on the Offering's tile opens its card alone, no dialog.)
        const link = [...document.querySelectorAll<HTMLElement>(".section-tile-overlay .section-tile-link")].find(entry => (entry.textContent ?? "").includes("Personal Assistance"))!;
        fireEvent.click(link);
        await act(() => new Promise(resolve => setTimeout(resolve, 100)));
        expect(document.querySelector(".floating-card-host")?.textContent).toContain("Personal Assistance");
        expect(removes()).toHaveLength(0);
        fireEvent.keyDown(document, { key: "Escape" });
        await act(() => new Promise(resolve => setTimeout(resolve, 100)));
        // (No "+" and no Add Card: every type comes from the answers; owner, 2026-11-16 19:18.)
        expect(screen.queryAllByRole("button", { name: /Add Card|Add Relationship Type/ })).toHaveLength(0);
    });

    it("makes a type of each help written under O7's Other, named, as the five are (owner, 2026-11-16 19:18)", async () => {
        const offering = { ...createBusinessOffering(), name: "Audit", questions: { o7: ["personal", "other"], "o7-other": ["Monthly clinic"] } };
        const segment = { ...createBusinessCustomerSegment([]), name: "Firms", offerings: [offering] };
        const foundation = { ...asBusinessFoundationValue(undefined), segments: [segment] };
        const site = { ...createBusinessChannel(), category: "Website", name: "Main Website", stages: ["discovery"] };
        const engagement = { ...asBusinessEngagementValue(undefined), segments: [{ ...createBusinessSegmentEngagement(segment.id), channels: [site] }] };
        function Harness() {
            const [value, setValue] = useState<unknown>(engagement);
            return <BusinessEngagementEditor value={value} onChange={setValue} foundation={foundation} asTiles />;
        }
        render(<Harness />);
        openTile("Customer's Relationship");
        openTile("1. Audit");
        const names = [...document.querySelectorAll<HTMLElement>(".section-tile-overlay .card-tile")].map(tile => tile.textContent ?? "");
        expect(names.some(text => text.includes("Personal Assistance"))).toBe(true);
        expect(names.some(text => text.includes("Monthly clinic"))).toBe(true);
    });

});

describe("a Customer Source's choices narrowed by the earlier answers (owner, 2026-11-13 13:56)", () => {

    it("lists the channels serving the Offering and the source kind its channel's customers come by; All lists every one; a chosen channel fills an empty kind", () => {
        const audit = { ...createBusinessOffering(), name: "Audit" };
        const build = { ...createBusinessOffering(), name: "Build" };
        const segment = { ...createBusinessCustomerSegment([]), name: "Firms", offerings: [audit, build] };
        const foundation = { ...asBusinessFoundationValue(undefined), segments: [segment] };
        const site = { ...createBusinessChannel(), category: "Website", name: "Main Website", stages: ["discovery"] };
        const fair = { ...createBusinessChannel(), category: "In Person", name: "Trade Fair", stages: ["discovery"], offerings: [build.id] };
        const start = {
            ...asBusinessEngagementValue(undefined),
            segments: [{ ...createBusinessSegmentEngagement(segment.id), channels: [site, fair] }],
            demand: { [audit.id]: { ...createDemand(), sources: [{ ...createDemandSource(), id: "s1" }] }, [build.id]: { ...createDemand(), sources: [{ ...createDemandSource(), id: "s2" }] } }
        };
        let saved: ReturnType<typeof asBusinessEngagementValue> = asBusinessEngagementValue(start);
        function Harness() {
            const [value, setValue] = useState<unknown>(start);
            return <BusinessEngagementEditor value={value} onChange={(next) => { saved = asBusinessEngagementValue(next); setValue(next); }} foundation={foundation} asTiles />;
        }
        render(<Harness />);
        openTile("Sales Forecast");
        // (The Audit's dialog: its Expected Sales section, then its source's tile; owner, 2026-11-13 16:35.)
        openTile("1. Audit");
        expect(document.body.textContent).toContain("Expected Sales");
        fireEvent.click([...document.querySelectorAll<HTMLElement>(".section-tile-overlay [aria-label^='Sales Forecast of'] button.card-tile")][0]);
        const optionsOf = (label: string) => {
            // (One option is a record, not a dropdown: its value, read only; owner, 2026-11-14 14:21.)
            const record = screen.queryByRole("textbox", { name: new RegExp("^" + label) });
            if (record) {
                return [record.textContent ?? ""];
            }
            fireEvent.click(screen.getByRole("button", { name: new RegExp("^" + label) }));
            const names = [...document.querySelectorAll("[role=option]")].map(option => option.textContent ?? "");
            fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
            return names;
        };
        // (The Audit is served by the website alone: the fair serves the Build.)
        // (One channel: a record, and the source's channel at once.)
        expect(optionsOf("Channel, ")).toEqual(["Main Website"]);
        expect(saved.demand[audit.id].sources[0]).toMatchObject({ channelId: site.id, type: "funnel" });
        // (Its kind narrowed to the one its channel's customers come by.)
        expect(optionsOf("Customer source")).toEqual(["Sales funnel"]);
    });

});

describe("a Customer Source's kind narrows its channels (owner, 2026-11-14 11:15)", () => {

    it("lists the channels whose customers come by the source's kind; All lists every one", () => {
        const audit = { ...createBusinessOffering(), name: "Audit" };
        const build = { ...createBusinessOffering(), name: "Build" };
        const segment = { ...createBusinessCustomerSegment([]), name: "Firms", offerings: [audit, build] };
        const foundation = { ...asBusinessFoundationValue(undefined), segments: [segment] };
        const site = { ...createBusinessChannel(), category: "Website", name: "Main Website", stages: ["discovery"] };
        const studio = { ...createBusinessChannel(), category: "In Person", name: "Studio", stages: ["discovery"] };
        const start = {
            ...asBusinessEngagementValue(undefined),
            segments: [{ ...createBusinessSegmentEngagement(segment.id), channels: [site, studio] }],
            demand: { [audit.id]: { ...createDemand(), sources: [{ ...createDemandSource("marketplace"), id: "s1" }] }, [build.id]: { ...createDemand(), sources: [] } }
        };
        function Harness() {
            const [value, setValue] = useState<unknown>(start);
            return <BusinessEngagementEditor value={value} onChange={setValue} foundation={foundation} asTiles />;
        }
        render(<Harness />);
        openTile("Sales Forecast");
        openTile("1. Audit");
        fireEvent.click([...document.querySelectorAll<HTMLElement>(".section-tile-overlay [aria-label^='Sales Forecast of'] button.card-tile")][0]);
        const channels = () => {
            // (One option is a record, not a dropdown: its value, read only; owner, 2026-11-14 14:21.)
            const record = screen.queryByRole("textbox", { name: /^Channel, / });
            if (record) {
                return [record.textContent ?? ""];
            }
            fireEvent.click(screen.getByRole("button", { name: /^Channel, / }));
            const names = [...document.querySelectorAll("[role=option]")].map(option => option.textContent ?? "");
            fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
            return names;
        };
        // (A walk-in source: the places, not the website. Saved, the one Visitors source takes the kind's channels, listed: owner, 2026-11-16 20:29.)
        expect(channels).toBeTypeOf("function");
        const card = document.querySelector(".floating-card-host")?.textContent ?? "";
        expect(card).toContain("Studio");
        expect(card).not.toContain("Main Website");
    });

});

/* Owner, 2026-11-16 19:18: a relationship type or a Customer Source the answers make and the founder removed comes back from the dialog's folded "Removed" list. */
describe("the Removed lists of Customer's Relationship and Sales Forecast", () => {

    it("opens a lone type's card at once from its Offering's tile while nothing is removed (owner, 2026-11-14 13:54; kept 2026-11-16 19:18)", async () => {
        const offering = { ...createBusinessOffering(), name: "Audit", questions: { o7: ["personal"] } };
        const segment = { ...createBusinessCustomerSegment([]), name: "Firms", offerings: [offering] };
        const foundation = { ...asBusinessFoundationValue(undefined), segments: [segment] };
        const site = { ...createBusinessChannel(), id: "site", category: "Website", name: "Main Website", stages: ["discovery"] };
        const engagement = { ...asBusinessEngagementValue(undefined), segments: [{ ...createBusinessSegmentEngagement(segment.id), channels: [site] }] };
        render(<BusinessEngagementEditor value={engagement} onChange={() => undefined} foundation={foundation} asTiles />);
        openTile("Customer's Relationship");
        openTile("1. Audit");
        await act(() => new Promise(resolve => setTimeout(resolve, 100)));
        expect(document.querySelector(".floating-card-host")?.textContent).toContain("Personal Assistance");
    });

    it("lists a removed source, and Restore brings it back; a relationship dialog lists no removed type", () => {
        const offering = { ...createBusinessOffering(), name: "Audit", questions: { o7: ["personal", "dedicated"] } };
        const segment = { ...createBusinessCustomerSegment([]), name: "Firms", offerings: [offering] };
        const foundation = { ...asBusinessFoundationValue(undefined), segments: [segment] };
        const site = { ...createBusinessChannel(), id: "site", category: "Website", name: "Main Website", stages: ["discovery"] };
        const start = {
            ...asBusinessEngagementValue(undefined),
            segments: [{ ...createBusinessSegmentEngagement(segment.id), channels: [site], offerings: [{ offeringId: offering.id, types: [], typeDetail: {}, dismissed: ["dedicated-support"] }] }],
            demand: { [offering.id]: { ...createDemand(), dismissed: ["funnel|group:Sales funnel"] } }
        };
        let latest: unknown = start;
        function Harness() {
            const [value, setValue] = useState<unknown>(start);
            return <BusinessEngagementEditor value={value} onChange={(next) => { latest = next; setValue(next); }} foundation={foundation} asTiles />;
        }
        render(<Harness />);
        const saved = () => asBusinessEngagementValue(latest);
        // (No Removed list on a relationship dialog: owner, 2026-11-18 10:38.)
        openTile("Customer's Relationship");
        expect(screen.queryByRole("button", { name: "Maximise Removed relationship types" })).toBeNull();
        closeAllTiles();
        // The source: not made while removed; Restore makes it again.
        expect(saved().demand[offering.id]?.sources.some(source => (source.channelIds ?? []).includes("site")) ?? false).toBe(false);
        openTile("Sales Forecast");
        openTile("1. Audit");
        fireEvent.click(screen.getByRole("button", { name: "Maximise Removed customer sources" }));
        fireEvent.click(screen.getByRole("button", { name: "Restore" }));
        expect(saved().demand[offering.id]?.dismissed ?? []).toEqual([]);
        expect(saved().demand[offering.id]?.sources.some(source => source.group === "Sales funnel" && (source.channelIds ?? []).includes("site") && source.type === "funnel")).toBe(true);
    });

});

import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render as renderBase, screen, within } from "@testing-library/react";
import { openFolds } from "../../../test/openFolds.ts";

/** The page as it opens, its structural sections opened (every fold arrow starts closed: see openFolds). */
function render(ui: Parameters<typeof renderBase>[0], options?: Parameters<typeof renderBase>[1]) {
    const result = renderBase(ui, options);
    openFolds(result.container);
    return result;
}
import { useState } from "react";

import BusinessEngagementEditor from "../editors/BusinessEngagementEditor";
import { channelNameOptions, stageIsUsual, stageOptionsFor } from "../editors/BusinessEngagementModel";
import {
    BUSINESS_CHANNEL_CATEGORIES,
    BUSINESS_CHANNEL_OTHER,
    BUSINESS_JOURNEY_STAGES,
    asBusinessEngagementValue,
    asBusinessFoundationValue,
    channelCategoryHelp,
    channelOptionHelp,
    asBusinessCapabilityValue,
    createBusinessChannel,
    createBusinessCustomerSegment,
    createBusinessResourceSlot,
    createBusinessSegmentEngagement
} from "../../../framework/engine/AnswerUtils";

/** Opens a fold that is closed; where the item starts OPEN (Customer Engagement, the financial pages) it is left as it is. */
function openFold(toggle: Element) {
    if (toggle.getAttribute("aria-expanded") !== "true") {
        fireEvent.click(toggle);
    }
}

/** Opens every fold that starts closed: Customer Engagement's items start OPEN, and then there is nothing to expand (the button says Collapse all). */
function expandAll(name: string) {
    const button = screen.queryByRole("button", { name });
    if (button) {
        fireEvent.click(button);
    }
}

/** The Customer Channels specification (final taxonomy), as one table: each category's channels and stages. */
const SPEC: [string, string[], string[]][] = [
    ["Social Media", ["Instagram", "Facebook", "LinkedIn", "YouTube", "TikTok", "Pinterest", "X (Twitter)"], ["Discover", "Evaluation", "Support & Follow Up"]],
    ["Community", ["Facebook Group", "Discord", "Reddit", "Slack", "Meetup"], ["Discover", "Evaluation", "Support & Follow Up"]],
    ["Website", ["Main Website", "Online Store", "Landing Page", "Booking / Registration Page", "Contact Page"], ["Discover", "Evaluation", "Purchase", "Delivery", "Support & Follow Up"]],
    ["Marketplace", ["Etsy", "Amazon", "Gumroad", "Fiverr", "Upwork"], ["Discover", "Evaluation", "Purchase", "Delivery"]],
    ["In Person", ["Studio / Shop", "Market / Pop-up", "Trade Fair / Exhibition", "Workshop / Class", "Event / Talk", "Sales Visit", "Customer Location", "Pickup / Collection"], ["Discover", "Evaluation", "Delivery", "Support & Follow Up"]],
    ["Email", ["Direct Email", "Newsletter", "Email Campaign", "Automated Email"], ["Evaluation", "Delivery", "Support & Follow Up"]],
    ["Online / Live", ["Zoom", "Google Meet", "Microsoft Teams", "Live Stream"], ["Evaluation", "Delivery", "Support & Follow Up"]],
    ["Direct Payment", ["Card", "Cash", "Bank Transfer", "Payment Link", "Invoice"], ["Purchase"]],
    ["File Delivery", ["WeTransfer", "Google Drive", "Dropbox", "OneDrive", "Email Attachment", "Client Portal"], ["Delivery"]],
    ["Physical Delivery", ["Courier", "Postal Service", "Local Delivery", "Third-party Fulfilment"], ["Delivery"]],
    ["Retail & Wholesale", ["Retail Stockist", "Distributor", "Wholesale Account", "Reseller", "Concession / Shop-in-shop"], ["Discover", "Evaluation", "Purchase", "Delivery"]],
    ["Referral & Affiliates", ["Referral Partner", "Affiliate", "Influencer / Ambassador", "Customer Referral"], ["Discover", "Evaluation", "Purchase"]],
    ["Other", [], ["Discover", "Evaluation", "Purchase", "Delivery", "Support & Follow Up"]]
];

const stageLabel = (id: string) => BUSINESS_JOURNEY_STAGES.find(stage => stage.id === id)?.label;

describe("the customer channel categories", () => {

    it("are the specification's, in its order, each with its channels and its journey stages", () => {
        expect(BUSINESS_CHANNEL_CATEGORIES.map(category => category.label)).toEqual(SPEC.map(([label]) => label));
        for (const [label, channels, stages] of SPEC) {
            const category = BUSINESS_CHANNEL_CATEGORIES.find(entry => entry.label === label)!;
            expect(category.channels.map(channel => channel.label)).toEqual(channels);
            // Every category and every channel says what it is, in a sentence, with no dash for a colon.
            expect(category.description).toMatch(/^[A-Z].*\.$/);
            expect(category.otherDescription).toMatch(/^[A-Z].*\.$/);
            for (const channel of category.channels) {
                expect(channel.description).toMatch(/^[A-Z].*\.$/);
                expect(channel.description).not.toMatch(/\u2014/);
            }
            expect(category.stages.map(stageLabel)).toEqual(stages);
        }
        expect(BUSINESS_JOURNEY_STAGES.map(stage => stage.label)).toEqual(["Discover", "Evaluation", "Purchase", "Delivery", "Support & Follow Up"]);
        // The stored id of Discover is unchanged.
        expect(BUSINESS_JOURNEY_STAGES[0].id).toBe("discovery");
    });

    it("offers each category's channels, then Other, which lets the name be typed", () => {
        for (const [label, channels] of SPEC.filter(([, channels]) => channels.length > 0)) {
            expect(channelNameOptions(label, [])).toEqual([...channels, BUSINESS_CHANNEL_OTHER]);
        }
    });

    it("offers a channel only its category's journey stages", () => {
        const channel = { ...createBusinessChannel(), category: "Direct Payment" };
        expect(stageOptionsFor("Direct Payment", channel).map(stage => stage.label)).toEqual(["Purchase"]);
        expect(stageOptionsFor("A category of my own", channel)).toHaveLength(5);
    });

    it("loses nothing saved before: a channel named outside the list keeps its name, and a stage its category does not take is kept, marked as not usual", () => {
        const old = { ...createBusinessChannel(), category: "Email", name: "Monthly newsletter (Klaviyo)", stages: ["evaluation", "purchase"] };
        // The name is offered back as it was, beside the category's own.
        expect(channelNameOptions("Email", [old])).toContain("Monthly newsletter (Klaviyo)");
        // The stage stays on offer and chosen; it is only called not usual.
        expect(stageOptionsFor("Email", old).map(stage => stage.id)).toContain("purchase");
        expect(stageIsUsual("Email", "purchase")).toBe(false);
        expect(stageIsUsual("Email", "evaluation")).toBe(true);
        expect(stageIsUsual("A category of my own", "purchase")).toBe(true);
    });

});

describe("the channel help", () => {

    it("explains every category, the chosen one first", () => {
        const help = channelCategoryHelp("File Delivery");
        expect(help[0]).toEqual({ title: "File Delivery", text: "Services or methods used to deliver digital files or downloadable products to customers." });
        expect(help.map(point => point.title).sort()).toEqual(SPEC.map(([label]) => label).sort());
    });

    it("explains a category's channels and its Other, the chosen one first, and nothing for a category of one's own", () => {
        const help = channelOptionHelp("Physical Delivery", "Local Delivery");
        expect(help.map(point => point.title)).toEqual(["Local Delivery", "Courier", "Postal Service", "Third-party Fulfilment", "Other"]);
        expect(help[help.length - 1].text).toBe("Another physical delivery method.");
        expect(channelOptionHelp("A category of my own", "")).toEqual([]);
    });

});

describe("the examples, on the new categories", () => {

    for (const file of ["lumen-and-loom-studio.json", "quillfield-automation-llc.json"]) {

        it(file + " loads with every channel, stage and action kept", () => {
            const document = JSON.parse(readFileSync("src/data/examples/" + file, "utf8"));
            const stored = document.systems["3"].responses[1].value;
            const loaded = asBusinessEngagementValue(stored);
            const summary = (value: typeof loaded) => value.segments.flatMap(segment => segment.channels.map(channel => ({
                category: channel.category, name: channel.name, stages: channel.stages, actions: channel.actions
            })));
            // As saved: the texts, or (a Segment whose actions are shared) its actions by id.
            type Saved = { actions?: { id: string; text: string }[]; channels: { category: string; name: string; stages: string[]; actions?: Record<string, string[]>; actionIds?: Record<string, string[]> }[] };
            const saved = (stored.segments as Saved[]).flatMap(segment => segment.channels.map(channel => ({
                category: channel.category, name: channel.name, stages: channel.stages,
                actions: channel.actionIds
                    ? Object.fromEntries(Object.entries(channel.actionIds).map(([stage, ids]) => [stage, ids.map(id => segment.actions?.find(action => action.id === id)?.text ?? "")]))
                    : channel.actions
            })));
            expect(summary(loaded)).toEqual(saved);
            // Every channel is on a category of the table (Other is for a typed one).
            for (const channel of summary(loaded)) {
                expect(BUSINESS_CHANNEL_CATEGORIES.some(category => category.label === channel.category)).toBe(true);
            }
        });

    }

    it("draws a stage its category does not usually take with a quiet note, and a usual one without", () => {
        function Harness() {
            const [{ foundation, engagement }] = useState(() => {
                const segment = createBusinessCustomerSegment([]);
                return {
                    foundation: { ...asBusinessFoundationValue(undefined), segments: [{ ...segment, name: "Firms" }] },
                    engagement: {
                        ...asBusinessEngagementValue(undefined),
                        segments: [{
                            ...createBusinessSegmentEngagement(segment.id),
                            channels: [
                                { ...createBusinessChannel(), id: "email", category: "Email", name: "Newsletter", stages: ["purchase"] },
                                { ...createBusinessChannel(), id: "web", category: "Website", name: "Main Website", stages: ["purchase"] }
                            ]
                        }]
                    }
                };
            });
            const [value, setValue] = useState<unknown>(engagement);
            return <BusinessEngagementEditor value={value} onChange={setValue} foundation={foundation} />;
        }
        render(<Harness />);
        expandAll("Expand all channel categories");
        expect(screen.getAllByText("Not usual for this category")).toHaveLength(1);
        // Each category and each channel picker has its "i"; the two rows share one shape.
        expect(screen.getAllByRole("button", { name: "Channel: what this means" })).toHaveLength(2);
        expect(screen.getAllByRole("button", { name: "Channel: what this means" })).toHaveLength(2);
        // Both open as the wide note (1.5 times the standard width).
        fireEvent.click(screen.getAllByRole("button", { name: "Channel: what this means" })[0]);
        expect(document.querySelector(".info-note-panel")?.classList.contains("info-note-panel-wide")).toBe(true);
        fireEvent.keyDown(document.querySelector(".info-note-panel")!, { key: "Escape" });
        const name = document.querySelector(".business-channel-name")!;
        expect(name.querySelector(".business-channel-nest")).toBeTruthy();
        expect(document.querySelector(".business-channel-cell-nested")).toBeTruthy();
    });

});

describe("a Segment's shared channel actions, in the table", () => {

    it("offers the Segment's other actions as a line is typed, shares the one chosen, and takes a line out of one row only", () => {
        cleanup();
        let saved: ReturnType<typeof asBusinessEngagementValue> | undefined;
        function Harness() {
            const [{ foundation, engagement }] = useState(() => {
                const segment = createBusinessCustomerSegment([]);
                return {
                    foundation: { ...asBusinessFoundationValue(undefined), segments: [{ ...segment, name: "Homes" }] },
                    engagement: {
                        ...asBusinessEngagementValue(undefined),
                        segments: [{
                            ...createBusinessSegmentEngagement(segment.id),
                            channels: [
                                { ...createBusinessChannel(), id: "insta", category: "Social Media", name: "Instagram", stages: ["discovery"], actions: { discovery: ["Post weaving reels"] } },
                                { ...createBusinessChannel(), id: "pin", category: "Social Media", name: "Pinterest", stages: ["discovery"] }
                            ]
                        }]
                    }
                };
            });
            const [value, setValue] = useState<unknown>(engagement);
            return <BusinessEngagementEditor value={value} onChange={(next) => { saved = next; setValue(next); }} foundation={foundation} />;
        }
        render(<Harness />);
        openFold(document.querySelector(".business-channel-category .strategy-box-toggle")!);

        const pinLine = screen.getByLabelText("Discover actions for Subchannel 2 1");
        fireEvent.change(pinLine, { target: { value: "Post" } });
        fireEvent.mouseDown(screen.getByRole("option", { name: "Post weaving reels" }));

        const segment = saved!.segments[0];
        const [insta, pin] = segment.channels;
        expect(pin.actionIds.discovery).toEqual(insta.actionIds.discovery);
        expect(segment.actions).toHaveLength(1);
        // A shared symbol on both rows (a name for assistive technology), in place of the old note.
        expect(screen.getAllByRole("button", { name: "Shared in 2 places" })).toHaveLength(2);
        expect(screen.queryByText(/^also in/)).toBeNull();

        // Out of Pinterest's row: still in Instagram's.
        fireEvent.click(screen.getByRole("button", { name: "Remove action 1 from Discover actions for Subchannel 2" }));
        expect(saved!.segments[0].channels[1].actionIds.discovery).toEqual([]);
        expect(saved!.segments[0].channels[0].actions.discovery).toEqual(["Post weaving reels"]);
    });

    function renderPair(pinActions: string[] = []) {
        cleanup();
        const holder: { saved?: ReturnType<typeof asBusinessEngagementValue> } = {};
        function Harness() {
            const [{ foundation, engagement }] = useState(() => {
                const segment = createBusinessCustomerSegment([]);
                return {
                    foundation: { ...asBusinessFoundationValue(undefined), segments: [{ ...segment, name: "Homes" }] },
                    engagement: {
                        ...asBusinessEngagementValue(undefined),
                        segments: [{
                            ...createBusinessSegmentEngagement(segment.id),
                            channels: [
                                { ...createBusinessChannel(), id: "insta", category: "Social Media", name: "Instagram", stages: ["discovery"], actions: { discovery: ["Post weaving reels", "Answer DMs"] } },
                                { ...createBusinessChannel(), id: "pin", category: "Social Media", name: "Pinterest", stages: ["discovery"], actions: { discovery: pinActions } }
                            ]
                        }]
                    }
                };
            });
            const [value, setValue] = useState<unknown>(engagement);
            return <BusinessEngagementEditor value={value} onChange={(next) => { holder.saved = next; setValue(next); }} foundation={foundation} />;
        }
        render(<Harness />);
        openFold(document.querySelector(".business-channel-category .strategy-box-toggle")!);
        return holder;
    }

    it("shares an action by typing # and its total order number in a line: it is offered first, and Enter puts the same action there", () => {
        const holder = renderPair();
        const line = screen.getByLabelText("Discover actions for Subchannel 2 1");
        fireEvent.change(line, { target: { value: "#2" } });
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Answer DMs"]);
        fireEvent.keyDown(line, { key: "Enter" });
        const [insta, pin] = holder.saved!.segments[0].channels;
        // The same action (same id), not a copy; the typed text is replaced by its words; no stray "#2" action.
        expect(pin.actionIds.discovery).toEqual([insta.actionIds.discovery[1]]);
        expect(holder.saved!.segments[0].actions).toHaveLength(2);
        expect((screen.getByLabelText("Discover actions for Subchannel 2 1") as HTMLTextAreaElement).value).toBe("Answer DMs");
        // Shared actions carry one number: #2 on both rows.
        expect([...document.querySelectorAll(".numbered-list-order")].map(node => node.textContent)).toEqual(["#1", "#2", "#2"]);
    });

    it("leaves a number that refers to nothing, or to an action already on the row, as typed", () => {
        const holder = renderPair(["Pin room sets"]);
        const line = screen.getByLabelText("Discover actions for Subchannel 2 1");
        for (const typed of ["#9", "#0", "#", "# 3 4", "#3"]) {
            fireEvent.change(line, { target: { value: typed } });
            // #3 is this row's own action ("Pin room sets" is typed over by now): nothing to offer.
            expect(screen.queryByRole("option")).toBeNull();
        }
        fireEvent.keyDown(line, { key: "Enter" });
        expect(holder.saved!.segments[0].channels[1].actions.discovery[0]).toBe("#3");
    });

    it("lets an empty line go when focus leaves it, and keeps the one line of an empty row", async () => {
        renderPair(["Pin room sets"]);
        const first = screen.getByLabelText("Discover actions for Subchannel 2 1");
        first.focus();
        // Enter opens a new line to type in...
        fireEvent.keyDown(first, { key: "Enter" });
        const second = screen.getByLabelText("Discover actions for Subchannel 2 2");
        expect(document.activeElement).toBe(second);
        // ...it stays while it is being typed in or only just opened...
        await act(() => new Promise(resolve => window.setTimeout(resolve, 260)));
        expect(screen.queryByLabelText("Discover actions for Subchannel 2 2")).not.toBeNull();
        // ...and goes when focus leaves it empty.
        second.blur();
        await act(() => new Promise(resolve => window.setTimeout(resolve, 260)));
        expect(screen.queryByLabelText("Discover actions for Subchannel 2 2")).toBeNull();
        expect((screen.getByLabelText("Discover actions for Subchannel 2 1") as HTMLTextAreaElement).value).toBe("Pin room sets");
    });

    it("keeps the one empty line of a row with no action, whatever focus does", async () => {
        renderPair();
        const lone = screen.getByLabelText("Discover actions for Subchannel 2 1");
        lone.focus();
        lone.blur();
        await act(() => new Promise(resolve => window.setTimeout(resolve, 260)));
        expect(screen.getByLabelText("Discover actions for Subchannel 2 1")).toBeTruthy();
        expect(screen.queryByLabelText("Discover actions for Subchannel 2 2")).toBeNull();
    });

});

describe("action markers in the Customer Channel table", () => {

    function renderTable() {
        cleanup();
        function Harness() {
            const [{ foundation, engagement, capability }] = useState(() => {
                const segment = createBusinessCustomerSegment([]);
                const capability = asBusinessCapabilityValue(undefined);
                return {
                    foundation: { ...asBusinessFoundationValue(undefined), segments: [{ ...segment, name: "Homes" }] },
                    capability: {
                        ...capability,
                        offering: {
                            ...capability.offering,
                            resources: [
                                { ...createBusinessResourceSlot(), id: "card-shop", name: "Shopify Basic" },
                                { ...createBusinessResourceSlot(), id: "card-ads", name: "Mail ads" }
                            ]
                        }
                    },
                    engagement: {
                        ...asBusinessEngagementValue(undefined),
                        channelResources: [
                            { id: "link-shop", segmentId: segment.id, channelId: "insta", resourceId: "card-shop", actionIds: ["a-reels", "a-plain"] },
                            { id: "link-ads", segmentId: segment.id, channelId: "mail", resourceId: "card-ads", actionIds: ["a-news"] }
                        ],
                        segments: [{
                            ...createBusinessSegmentEngagement(segment.id),
                            actions: [{ id: "a-reels", text: "Post reels" }, { id: "a-pins", text: "Pin room sets" }, { id: "a-plain", text: "Answer DMs" }, { id: "a-news", text: "Send the monthly note" }],
                            channels: [
                                { ...createBusinessChannel(), id: "insta", category: "Social Media", name: "Instagram", offerings: ["*"], stages: ["discovery"], actionIds: { discovery: ["a-reels", "a-plain"] } },
                                { ...createBusinessChannel(), id: "pin", category: "Social Media", name: "Pinterest", offerings: ["*"], stages: ["discovery"], actionIds: { discovery: ["a-reels", "a-pins"] } },
                                { ...createBusinessChannel(), id: "mail", category: "Email", name: "Newsletter", offerings: ["*"], stages: ["discovery"], actionIds: { discovery: ["a-news"] } }
                            ]
                        }]
                    }
                };
            });
            const [value, setValue] = useState<unknown>(engagement);
            return <BusinessEngagementEditor value={value} onChange={setValue} foundation={foundation} capability={capability} onChangeCapability={() => undefined} />;
        }
        render(<Harness />);
        for (const toggle of document.querySelectorAll(".business-channel-category .strategy-box-toggle")) {
            openFold(toggle);
        }
    }

    const rowOf = (id: string) => [...document.querySelectorAll(`.numbered-list-row[data-action-id="${id}"]`)];
    const shared = () => screen.getAllByRole("button", { name: "Shared in 2 places" });
    const resource = () => screen.getAllByRole("button", { name: "Linked to Shopify Basic" });
    const collapsed = (id: string) => rowOf(id).map(row => row.classList.contains("is-collapsed"));
    // (The Relationship Types' own Add is not the table's: it is open now that the page starts open.)
    const adds = () => [...document.querySelectorAll(".business-channel-table-wrap .strategy-add-button")].filter(button => !/Relationship Type/.test(button.textContent ?? ""));

    it("puts a link symbol on every row of a shared action and a tag symbol on a linked one, each in its own colour, with a line at the cell's edge", () => {
        renderTable();
        // "Post reels" stands in two rows and is linked to a resource: both symbols on each.
        expect(shared()).toHaveLength(2);
        expect(resource()).toHaveLength(3);
        for (const row of rowOf("a-reels")) {
            expect(row.querySelectorAll(".numbered-list-line-end .action-symbol")).toHaveLength(2);
            // The resource's colour down the left, the shared action's down the right.
            expect(row.classList.contains("has-line-left") && row.classList.contains("has-line-right")).toBe(true);
            expect((row as HTMLElement).style.getPropertyValue("--line-right")).toContain("--shared-hue-1");
            expect((row as HTMLElement).style.getPropertyValue("--line-left")).toContain("--resource-hue-1");
        }
        expect(shared()[0].className).toMatch(/tint-shared-1/);
        expect(resource()[0].className).toMatch(/tint-resource-1/);
        // The second resource has the second warm colour, on its action's symbol, line and card.
        expect(screen.getByRole("button", { name: "Linked to Mail ads" }).className).toMatch(/tint-resource-2/);
        expect((rowOf("a-news")[0] as HTMLElement).style.getPropertyValue("--line-left")).toContain("--resource-hue-2");
        expect(rowOf("a-news")[0].classList.contains("has-line-right")).toBe(false);
        expect(document.querySelector('[data-channel-resource="link-shop"]')?.className).toMatch(/tint-resource-1/);
        expect(document.querySelector('[data-channel-resource="link-ads"]')?.className).toMatch(/tint-resource-2/);
        // A plain action (in one row, no resource) has neither symbol nor lines.
        expect(rowOf("a-pins")[0].querySelector(".action-symbol")).toBeNull();
        expect(rowOf("a-pins")[0].classList.contains("has-line-left") || rowOf("a-pins")[0].classList.contains("has-line-right")).toBe(false);
        // A shared action only: the right line, no left.
        // Every action line is a two-line cell.
        expect(document.querySelectorAll(".numbered-list-row.is-action-line").length).toBeGreaterThanOrEqual(5);
        // Gone: the chips, the tags row, the filter.
        expect(document.querySelector(".action-chip, .channel-action-tags, .action-filter")).toBeNull();
        expect(screen.queryByRole("button", { name: "All actions" })).toBeNull();
    });

    it("numbers every placement down the whole table, under its list number, and the resource's chips with the same numbers", () => {
        renderTable();
        const order = (id: string) => rowOf(id).map(row => row.querySelector(".numbered-list-order")?.textContent);
        // Social Media (Instagram, Pinterest), then Email: category, channel, stage, line. A shared
        // action has ONE number, on every row it stands in, and the numbers have no gaps.
        expect(order("a-reels")).toEqual(["#1", "#1"]);
        expect(order("a-plain")).toEqual(["#2"]);
        expect(order("a-pins")).toEqual(["#3"]);
        expect(order("a-news")).toEqual(["#4"]);
        const chips = [...document.querySelectorAll('[data-channel-resource="link-shop"] .notepad-chip-open')].map(chip => chip.textContent);
        expect(chips).toEqual(["#1Post reels", "#2Answer DMs"]);
        // Isolating renumbers nothing.
        fireEvent.click(shared()[0]);
        expect(order("a-reels")).toEqual(["#1", "#1"]);
    });

    it("shows the app's tooltip, one line of words, on hover or focus, and Escape closes it", () => {
        renderTable();
        const symbol = shared()[0];
        fireEvent.focus(symbol);
        expect(screen.getByRole("tooltip").textContent).toBe("Shared in 2 places");
        expect(screen.getByRole("tooltip").className).toMatch(/app-tooltip/);
        fireEvent.keyDown(symbol, { key: "Escape" });
        expect(screen.queryByRole("tooltip")).toBeNull();
        fireEvent.mouseEnter(resource()[0]);
        expect(screen.getByRole("tooltip").textContent).toBe("Linked to Shopify Basic");
        fireEvent.mouseLeave(resource()[0]);
        expect(screen.queryByRole("tooltip")).toBeNull();
    });

    it("lights an action's twins when its row is pointed at, and a resource's actions when its card or its symbol is", () => {
        renderTable();
        const [first, second] = rowOf("a-reels");
        fireEvent.mouseEnter(first);
        expect(first.classList.contains("is-lit") && second.classList.contains("is-lit")).toBe(true);
        expect(rowOf("a-pins")[0].classList.contains("is-lit")).toBe(false);
        fireEvent.mouseLeave(first);
        expect(document.querySelectorAll(".numbered-list-row.is-lit")).toHaveLength(0);

        fireEvent.mouseEnter(document.querySelector('[data-channel-resource="link-shop"]')!);
        expect(rowOf("a-reels").every(row => row.classList.contains("is-lit"))).toBe(true);
        fireEvent.mouseLeave(document.querySelector('[data-channel-resource="link-shop"]')!);
        expect(document.querySelectorAll(".numbered-list-row.is-lit")).toHaveLength(0);
        fireEvent.mouseEnter(resource()[0]);
        expect(document.querySelector('[data-channel-resource="link-shop"]')?.classList.contains("is-lit")).toBe(true);
    });

    it("isolates a shared action by collapsing: only its lines, its channels' rows and the cards linked to it stay, no add button, and the note names the channels", () => {
        renderTable();
        const channelInputs = () => document.querySelectorAll(".business-channel-category-row").length;
        expect(channelInputs()).toBe(2);
        const rowsBefore = document.querySelectorAll(".business-channel-table tbody tr").length;
        expect(adds().length).toBeGreaterThan(0);
        expect(screen.getAllByRole("button", { name: /Add expense to/ }).length).toBeGreaterThan(0);

        fireEvent.click(shared()[0]);
        expect(shared().every(button => button.getAttribute("aria-pressed") === "true")).toBe(true);
        expect(collapsed("a-reels")).toEqual([false, false]);
        expect(collapsed("a-plain").every(Boolean)).toBe(true);
        expect(collapsed("a-pins")).toEqual([true]);
        // The Email category held nothing of it: its band and row are gone; Social Media stays.
        expect(channelInputs()).toBe(1);
        expect(document.querySelectorAll(".business-channel-table tbody tr").length).toBeLessThan(rowsBefore);
        // Every Add is hidden; so are the cards and cost lines not linked to the action.
        expect(adds()).toHaveLength(0);
        expect(screen.queryByRole("button", { name: /Add expense to/ })).toBeNull();
        expect(screen.queryByRole("button", { name: /Link an action to/ })).toBeNull();
        expect(document.querySelector('[data-channel-resource="link-shop"]')).toBeTruthy();
        expect(document.querySelector('[data-channel-resource="link-ads"]')).toBeNull();
        expect(document.querySelector(".business-channel-cost-summary")).toBeNull();
        // "Shared: <the channels that hold it>", every name.
        expect(screen.getByRole("button", { name: /Show every action again/ }).textContent).toBe("Shared: Instagram, Pinterest ×");

        // Second click on the same symbol.
        fireEvent.click(shared()[0]);
        expect(document.querySelectorAll(".numbered-list-row.is-collapsed")).toHaveLength(0);
        expect(channelInputs()).toBe(2);
        expect(document.querySelectorAll(".business-channel-table tbody tr")).toHaveLength(rowsBefore);
        expect(screen.queryByText(/^Shared:/)).toBeNull();
        expect(adds().length).toBeGreaterThan(0);

        // Escape.
        fireEvent.click(shared()[0]);
        expect(document.querySelectorAll(".numbered-list-row.is-collapsed").length).toBeGreaterThan(0);
        fireEvent.keyDown(document, { key: "Escape" });
        expect(document.querySelectorAll(".numbered-list-row.is-collapsed")).toHaveLength(0);
        expect(channelInputs()).toBe(2);

        // The title row's note.
        fireEvent.click(shared()[0]);
        fireEvent.click(screen.getByRole("button", { name: /Show every action again/ }));
        expect(document.querySelectorAll(".numbered-list-row.is-collapsed")).toHaveLength(0);
        expect(document.querySelector(".business-channel-table")?.classList.contains("is-isolating")).toBe(false);
    });

    it("isolating a shared action shows EVERY card linked to it in EVERY channel kept: at home and, by the shared action, in the other", () => {
        renderTable();
        fireEvent.click(shared()[0]);
        const cell = (channel: string) => [...document.querySelectorAll(".business-channel-name")]
            .find(name => (name.querySelector("textarea") as HTMLTextAreaElement | null)?.value === channel)!;
        // Shopify Basic was made on Instagram: its card is there, and Pinterest (which holds the same action) lists it as shared.
        expect(within(cell("Instagram") as HTMLElement).getByDisplayValue("Shopify Basic")).toBeTruthy();
        const viaPinterest = cell("Pinterest").querySelector(".business-channel-resources-shared");
        expect(viaPinterest?.textContent).toContain("Shopify Basic");
        expect(within(viaPinterest as HTMLElement).getByRole("button", { name: /^Go to shared action #1/ })).toBeTruthy();
        // The card linked to nothing here (Mail ads) is in neither.
        expect(cell("Instagram").textContent).not.toContain("Mail ads");
        expect(cell("Pinterest").textContent).not.toContain("Mail ads");
    });

    it("creates nothing while isolated: Enter in an action line opens no new line, a Links box is not opened, and the lines stay editable", () => {
        renderTable();
        const line = () => document.querySelector('.numbered-list-row[data-action-id="a-reels"] textarea') as HTMLTextAreaElement;
        const linesIn = () => document.querySelectorAll(".business-channel-table textarea[data-field-id]").length;
        const before = linesIn();
        fireEvent.keyDown(line(), { key: "Enter" });
        expect(linesIn()).toBe(before + 1);
        fireEvent.click(shared()[0]);
        const isolated = linesIn();
        fireEvent.keyDown(line(), { key: "Enter" });
        expect(linesIn()).toBe(isolated);
        // Text can still be edited.
        fireEvent.change(line(), { target: { value: "Post reels weekly" } });
        expect(line().value).toBe("Post reels weekly");
        // The Links tick (it opens a new box) is shut.
        for (const tick of document.querySelectorAll<HTMLInputElement>(".business-channel-links input[type=checkbox]")) {
            expect(tick.disabled).toBe(true);
        }
    });

    it("a click on empty space ends the isolation; a click on a control or a cell's content does not", () => {
        renderTable();
        const isolating = () => document.querySelector(".business-channel-table")?.classList.contains("is-isolating");
        const press = (target: Element) => {
            fireEvent.mouseDown(target);
            fireEvent.mouseUp(target);
            fireEvent.click(target);
        };
        fireEvent.click(shared()[0]);
        expect(isolating()).toBe(true);
        // Controls and content: the line's text, its row, a resource card and its name.
        press(rowOf("a-reels")[0].querySelector("textarea")!);
        press(rowOf("a-reels")[0]);
        press(document.querySelector('[data-channel-resource="link-shop"]')!);
        press(document.querySelector('[data-channel-resource="link-shop"] input')!);
        expect(isolating()).toBe(true);
        // A drag that began on a text and ended outside it is no click on empty space.
        fireEvent.mouseDown(rowOf("a-reels")[0].querySelector("textarea")!);
        fireEvent.click(document.body);
        expect(isolating()).toBe(true);
        // Empty space: the table's head, the page.
        press(document.querySelector(".business-channel-table thead th")!);
        expect(isolating()).toBe(false);
        expect(document.querySelectorAll(".numbered-list-row.is-collapsed")).toHaveLength(0);
        fireEvent.click(shared()[0]);
        expect(isolating()).toBe(true);
        press(document.body);
        expect(isolating()).toBe(false);
    });

    it("isolates a resource from an action's symbol: only its card(s), with all its actions as chips and the clicked one highlighted, and the note names the resources", () => {
        renderTable();
        fireEvent.click(resource()[0]);
        expect(resource().every(button => button.getAttribute("aria-pressed") === "true")).toBe(true);
        expect(shared().every(button => button.getAttribute("aria-pressed") === "false")).toBe(true);
        expect(collapsed("a-reels")).toEqual([false, false]);
        expect(collapsed("a-plain")).toEqual([false]);
        expect(collapsed("a-pins")).toEqual([true]);
        expect(rowOf("a-news")).toHaveLength(0);
        // Its card only: no other card, no summary, no add, no link.
        expect(document.querySelector('[data-channel-resource="link-shop"]')).toBeTruthy();
        expect(document.querySelector('[data-channel-resource="link-ads"]')).toBeNull();
        expect(document.querySelector(".business-channel-cost-summary")).toBeNull();
        expect(adds()).toHaveLength(0);
        expect(screen.queryByRole("button", { name: /Link an action to/ })).toBeNull();
        // All of its actions are chips; the one clicked from is highlighted.
        const chips = [...document.querySelectorAll('[data-channel-resource="link-shop"] .notepad-chip')];
        expect(chips.map(chip => chip.querySelector(".notepad-chip-open")?.textContent)).toEqual(["#1Post reels", "#2Answer DMs"]);
        expect(chips.map(chip => chip.classList.contains("is-picked"))).toEqual([true, false]);
        expect(screen.getByRole("button", { name: /Show every action again/ }).textContent).toBe("Linked: Shopify Basic ×");
        // Only one isolation at a time: the shared symbol replaces it.
        fireEvent.click(shared()[0]);
        expect(resource().every(button => button.getAttribute("aria-pressed") === "false")).toBe(true);
        expect(shared().every(button => button.getAttribute("aria-pressed") === "true")).toBe(true);
        expect(screen.getAllByText(/^(Shared|Linked):/)).toHaveLength(1);
    });

    it("isolates a resource from its own card: its symbol, or the actions part of its summary, and a second click restores", () => {
        renderTable();
        const card = () => document.querySelector('[data-channel-resource="link-shop"]')!;
        const words = () => within(card() as HTMLElement).getByRole("button", { name: "2 actions" });
        // The card has no symbol: its summary line says "2 actions" (one action: "action"; none: "no actions").
        expect(card().querySelector(".action-symbol")).toBeNull();
        expect(card().querySelector(".business-channel-resource-summary")?.textContent).toBe("No cost yet · 2 actions");
        expect(document.querySelector('[data-channel-resource="link-ads"] .business-channel-resource-summary')?.textContent).toBe("No cost yet · action");
        fireEvent.click(words());
        expect(words().getAttribute("aria-pressed")).toBe("true");
        expect(collapsed("a-pins")).toEqual([true]);
        expect(collapsed("a-plain")).toEqual([false]);
        // Opened from the card: no action is singled out.
        expect(card().querySelectorAll(".notepad-chip.is-picked")).toHaveLength(0);
        expect(screen.getByRole("button", { name: /Show every action again/ }).textContent).toBe("Linked: Shopify Basic ×");
        // A second click restores everything.
        fireEvent.click(words());
        expect(document.querySelectorAll(".numbered-list-row.is-collapsed")).toHaveLength(0);
        expect(rowOf("a-news")).toHaveLength(1);
    });

});

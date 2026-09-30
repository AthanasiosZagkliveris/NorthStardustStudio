import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";

import BusinessEngagementEditor, { channelNameOptions, stageIsUsual, stageOptionsFor } from "./BusinessEngagementEditor";
import {
    BUSINESS_CHANNEL_CATEGORIES,
    BUSINESS_CHANNEL_OTHER,
    BUSINESS_JOURNEY_STAGES,
    asBusinessEngagementValue,
    asBusinessFoundationValue,
    channelCategoryHelp,
    channelOptionHelp,
    createBusinessChannel,
    createBusinessCustomerSegment,
    createBusinessSegmentEngagement
} from "../../framework/engine/AnswerUtils";

/** The Customer Channels specification (final taxonomy), as one table: each category's channels and stages. */
const SPEC: [string, string[], string[]][] = [
    ["Social Media", ["Instagram", "Facebook", "LinkedIn", "YouTube", "TikTok", "Pinterest", "X (Twitter)"], ["Discover", "Evaluation", "Support & Follow Up"]],
    ["Community", ["Facebook Group", "Discord", "Reddit", "Slack", "Meetup"], ["Discover", "Evaluation", "Support & Follow Up"]],
    ["Website", ["Main Website", "Online Store", "Landing Page", "Booking / Registration Page", "Contact Page"], ["Discover", "Evaluation", "Purchase", "Delivery", "Support & Follow Up"]],
    ["Marketplace", ["Etsy", "Amazon", "Gumroad", "Fiverr", "Upwork"], ["Discover", "Evaluation", "Purchase", "Delivery"]],
    ["In Person", ["Studio / Shop", "Market / Pop-up", "Trade Fair / Exhibition", "Workshop / Class", "Event / Talk", "Sales Visit", "Customer Location", "Pickup / Collection"], ["Discover", "Evaluation", "Delivery", "Support & Follow Up"]],
    ["Email", ["Direct Email", "Newsletter", "Email Campaign", "Automated Email"], ["Evaluation", "Delivery", "Support & Follow Up"]],
    ["Online / Live", ["Zoom", "Google Meet", "Microsoft Teams", "Live Stream", "Discord"], ["Evaluation", "Delivery", "Support & Follow Up"]],
    ["Direct Payment", ["Card", "Cash", "Bank Transfer", "Payment Link", "Invoice"], ["Purchase"]],
    ["File Delivery", ["WeTransfer", "Google Drive", "Dropbox", "OneDrive", "Email Attachment", "Client Portal"], ["Delivery"]],
    ["Physical Delivery", ["Courier", "Postal Service", "Local Delivery", "Third-party Fulfilment"], ["Delivery"]],
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
            const document = JSON.parse(readFileSync("docs/examples/" + file, "utf8"));
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
        fireEvent.click(screen.getByRole("button", { name: "Expand all channel categories" }));
        expect(screen.getAllByText("Not usual for this category")).toHaveLength(1);
        // Each category and each channel picker has its "i"; the two rows share one shape.
        expect(screen.getAllByRole("button", { name: "Channel Category: what this means" })).toHaveLength(2);
        expect(screen.getAllByRole("button", { name: "Channel: what this means" })).toHaveLength(2);
        // Both open as the wide note (1.5 times the standard width).
        fireEvent.click(screen.getAllByRole("button", { name: "Channel Category: what this means" })[0]);
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
        fireEvent.click(document.querySelector(".business-channel-category .strategy-box-toggle")!);

        const pinLine = screen.getByLabelText("Discover actions for Channel 2 1");
        fireEvent.change(pinLine, { target: { value: "Post" } });
        fireEvent.mouseDown(screen.getByRole("option", { name: "Post weaving reels" }));

        const segment = saved!.segments[0];
        const [insta, pin] = segment.channels;
        expect(pin.actionIds.discovery).toEqual(insta.actionIds.discovery);
        expect(segment.actions).toHaveLength(1);
        expect(screen.getAllByText("also in 1 place")).toHaveLength(2);

        // Out of Pinterest's row: still in Instagram's.
        fireEvent.click(screen.getByRole("button", { name: "Remove action 1 from Discover actions for Channel 2" }));
        expect(saved!.segments[0].channels[1].actionIds.discovery).toEqual([]);
        expect(saved!.segments[0].channels[0].actions.discovery).toEqual(["Post weaving reels"]);
    });

});

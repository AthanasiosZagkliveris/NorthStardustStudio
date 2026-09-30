import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";

import BusinessEngagementEditor, { channelNameOptions, stageIsUsual, stageOptionsFor } from "./BusinessEngagementEditor";
import {
    BUSINESS_CHANNEL_CATEGORIES,
    BUSINESS_CHANNEL_OTHER,
    BUSINESS_JOURNEY_STAGES,
    asBusinessEngagementValue,
    asBusinessFoundationValue,
    createBusinessChannel,
    createBusinessCustomerSegment,
    createBusinessSegmentEngagement
} from "../../framework/engine/AnswerUtils";

/** The Customer Channels specification, as one table: each category's channels and stages. */
const SPEC: [string, string[], string[]][] = [
    ["Social Media", ["Facebook", "Instagram", "LinkedIn", "TikTok", "YouTube", "X (Twitter)", "Pinterest"], ["Discover", "Evaluation", "Support & Follow Up"]],
    ["Website", ["Main Website", "Online Store", "Landing Page", "Booking / Registration Page", "Client Portal"], ["Discover", "Evaluation", "Purchase", "Delivery", "Support & Follow Up"]],
    ["Email", ["Newsletter", "Direct Email", "Automated Email", "Email Campaign"], ["Evaluation", "Delivery", "Support & Follow Up"]],
    ["Community", ["Reddit", "Discord", "Slack", "Facebook Group", "Meetup"], ["Discover", "Evaluation", "Support & Follow Up"]],
    ["Marketplace", ["Gumroad", "Etsy", "Amazon", "Fiverr", "Upwork"], ["Discover", "Evaluation", "Purchase", "Delivery"]],
    ["Direct Payment", ["Bank Transfer", "Payment Link", "Card", "Cash", "Invoice"], ["Purchase"]],
    ["File Delivery", ["WeTransfer", "Google Drive", "Dropbox", "OneDrive", "Client Portal", "Download Link"], ["Delivery"]],
    ["Physical Delivery", ["Postal Service", "Courier", "Local Delivery", "Third-party Fulfilment"], ["Delivery"]],
    ["Online / Live", ["Zoom", "Google Meet", "Microsoft Teams", "Discord", "Live Stream", "Client Portal"], ["Evaluation", "Delivery", "Support & Follow Up"]],
    ["In Person", ["Studio / Shop", "Customer Location", "Market / Pop-up", "Trade Fair / Exhibition", "Workshop / Class", "Event / Talk", "Sales Visit", "Pickup / Collection"], ["Discover", "Evaluation", "Delivery", "Support & Follow Up"]],
    ["Other", [], ["Discover", "Evaluation", "Purchase", "Delivery", "Support & Follow Up"]]
];

const stageLabel = (id: string) => BUSINESS_JOURNEY_STAGES.find(stage => stage.id === id)?.label;

describe("the customer channel categories", () => {

    it("are the specification's, in its order, each with its channels and its journey stages", () => {
        expect(BUSINESS_CHANNEL_CATEGORIES.map(category => category.label)).toEqual(SPEC.map(([label]) => label));
        for (const [label, channels, stages] of SPEC) {
            const category = BUSINESS_CHANNEL_CATEGORIES.find(entry => entry.label === label)!;
            expect([...category.channels]).toEqual(channels);
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

describe("the examples, on the new categories", () => {

    for (const file of ["lumen-and-loom-studio.json", "quillfield-automation-llc.json"]) {

        it(file + " loads with every channel, stage and action kept", () => {
            const document = JSON.parse(readFileSync("docs/examples/" + file, "utf8"));
            const stored = document.systems["3"].responses[1].value;
            const loaded = asBusinessEngagementValue(stored);
            const summary = (value: typeof loaded) => value.segments.flatMap(segment => segment.channels.map(channel => ({
                category: channel.category, name: channel.name, stages: channel.stages, actions: channel.actions
            })));
            expect(summary(loaded)).toEqual(summary(stored));
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
    });

});

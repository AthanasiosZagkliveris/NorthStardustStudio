import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";

import ChannelResources, { ActionPickService, ActionPicker, useLatestEngagement } from "./ChannelResources";
import { asBusinessCapabilityValue, asBusinessEngagementValue, type BusinessCapabilityValue, type BusinessEngagementValue } from "../../framework/engine/AnswerUtils";
import { capabilityCards } from "../../framework/engine/ChannelResources";
import { UndoService } from "../../services/UndoService";

afterEach(() => {
    cleanup();
    UndoService.dismiss();
    ActionPickService.finish(null);
});

let saved: { engagement: BusinessEngagementValue; capability: BusinessCapabilityValue };

/** The one "+ Add expense" button opens a menu (if it is not open): a blank expense, all typical costs, one of them, or a card to link. */
function openMenu(channel: string) {
    const button = screen.getByRole("button", { name: "Add expense to " + channel });
    if (button.getAttribute("aria-expanded") !== "true") {
        fireEvent.click(button);
    }
}

function addBlank(channel: string) {
    openMenu(channel);
    fireEvent.click(screen.getByRole("button", { name: "Blank expense for " + channel }));
}

function Harness({ onIsolate, onOpenAction, category = "Social Media" }: { onIsolate?: (next: unknown) => void; onOpenAction?: (actionId: string) => void; category?: string } = {}) {
    const [engagement, setEngagement] = useState(() => asBusinessEngagementValue({
        segments: [{
            segmentId: "seg-1",
            actions: [{ id: "action-reels", text: "Post reels" }, { id: "action-pins", text: "Pin room sets" }],
            channels: [
                { id: "insta", category, name: "Instagram", stages: ["discovery"], offerings: ["*"], actionIds: { discovery: ["action-reels"] } },
                { id: "pin", category, name: "Pinterest", stages: ["discovery"], actionIds: { discovery: ["action-reels", "action-pins"] } }
            ]
        }]
    }));
    const [capability, setCapability] = useState(() => asBusinessCapabilityValue(undefined));
    saved = { engagement, capability };
    useLatestEngagement(engagement);
    const segment = engagement.segments[0];
    const cell = (channelId: string, what: string) => (
        <ChannelResources
            segment={segment}
            channelId={channelId}
            what={what}
            engagement={engagement}
            capability={capability}
            cards={capabilityCards(capability)}
            currency="GBP"
            onWrite={(next) => {
                if (next.capability) {
                    setCapability(next.capability);
                }
                if (next.engagement) {
                    setEngagement(next.engagement);
                }
            }}
            actionOrder={(id) => id === "action-reels" ? 1 : 2}
            onIsolate={onIsolate}
            onOpenAction={onOpenAction}
        />
    );
    return (
        <>
            <table className="business-channel-table"><tbody><tr><td>
                <textarea aria-label="Discover actions for Channel 1 1" data-field-id="action-reels" defaultValue="Post reels" />
            </td></tr></tbody></table>
            {cell("insta", "Channel 1")}
            {cell("pin", "Channel 2")}
            <ActionPicker />
        </>
    );
}

describe("a channel's resources, in its cell", () => {

    it("adds a resource: a BLANK card is made in Offering's Capability, linked to the channel, named in both places at once", () => {
        render(<Harness />);
        addBlank("Channel 1");
        const name = screen.getByLabelText("Resource 1 of Channel 1 name");
        fireEvent.change(name, { target: { value: "Meta ads" } });
        const slot = saved.capability.offering.resources[0];
        expect(slot).toMatchObject({ name: "Meta ads", status: "" });
        expect(slot.offeringIds).toEqual([]);
        expect(saved.capability.resources.digital ?? []).toHaveLength(0);
        expect(saved.engagement.channelResources[0].resourceId).toBe(slot.id);
        expect(document.querySelector(".business-channel-resource-summary")?.textContent).toBe("No cost yet · no actions");
    });

    it("links an action by \"#\", shows it as a chip, and serves the other channel through it", () => {
        render(<Harness />);
        addBlank("Channel 1");
        fireEvent.click(screen.getByRole("button", { name: "Link an action to Resource 1 of Channel 1" }));
        const box = screen.getByLabelText(/^Action for Resource 1 of Channel 1/);
        fireEvent.change(box, { target: { value: "#reels" } });
        fireEvent.keyDown(box, { key: "Enter" });
        expect(saved.engagement.channelResources[0].actionIds).toEqual(["action-reels"]);
        const chip = screen.getByRole("list", { name: "Actions of Resource 1 of Channel 1" });
        // "#" and the action's total order number in the table, then its words.
        expect(chip.textContent).toContain("#1");
        expect(chip.textContent).not.toContain("3.2.1");
        expect(chip.textContent).toContain("Post reels");
        expect(chip.querySelector("button")?.getAttribute("title")).toBe("#1 Post reels");
        // Pinterest shares the action: the resource serves it too.
        const shared = screen.getByRole("list", { name: "Resources serving Channel 2 through shared actions" });
        // "via shared action" in WORDS (no symbol); the shared action is a link to its line.
        expect(shared.textContent).toContain("via shared action");
        expect(shared.querySelector("svg, [role=img]")).toBeNull();
        expect(shared.querySelector("button")?.getAttribute("title")).toBe("Created on Social Media › Instagram");
    });

    it("\"shared action\" is a link that goes to the action's line; one link per action (#N) when the card is shared through several", () => {
        const opened: string[] = [];
        render(<Harness onOpenAction={(id) => opened.push(id)} />);
        addBlank("Channel 1");
        const link = (typed: string) => {
            fireEvent.click(screen.getByRole("button", { name: "Link an action to Resource 1 of Channel 1" }));
            const box = screen.getByLabelText(/^Action for Resource 1 of Channel 1/);
            fireEvent.change(box, { target: { value: typed } });
            fireEvent.keyDown(box, { key: "Enter" });
        };
        link("#reels");
        const shared = screen.getByRole("list", { name: "Resources serving Channel 2 through shared actions" });
        const via = within(shared).getByRole("button", { name: "Go to shared action #1: Post reels" });
        expect(via.textContent).toBe("shared action");
        fireEvent.click(via);
        expect(opened).toEqual(["action-reels"]);
        // A second action Pinterest holds as well (link it from Instagram's card by its number): one link each, "#N".
        link("2");
        const links = within(shared).getAllByRole("button", { name: /^Go to #[0-9]/ });
        expect(links.map(entry => entry.textContent)).toEqual(["#1", "#2"]);
        fireEvent.click(links[1]);
        expect(opened).toEqual(["action-reels", "action-pins"]);
    });

    it("finds an action of ANOTHER channel of the table by its number or words, and links it (the card then shows in that channel too)", () => {
        render(<Harness />);
        addBlank("Channel 1");
        fireEvent.click(screen.getByRole("button", { name: "Link an action to Resource 1 of Channel 1" }));
        const box = screen.getByLabelText(/^Action for Resource 1 of Channel 1/);
        // "Pin room sets" is in Pinterest's rows only, yet Instagram's card offers it: by number, with or without the #, and by words.
        for (const typed of ["2", "#2", "pin room"]) {
            fireEvent.change(box, { target: { value: typed } });
            expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["#2 Pin room sets"]);
        }
        fireEvent.change(box, { target: { value: "2" } });
        fireEvent.keyDown(box, { key: "Enter" });
        expect(saved.engagement.channelResources[0].channelId).toBe("insta");
        expect(saved.engagement.channelResources[0].actionIds).toEqual(["action-pins"]);
        // Linked to an action of the table that is not in its own channel: the home cell still has it, Pinterest's shows it too.
        expect(screen.getByRole("list", { name: "Actions of Resource 1 of Channel 1" }).textContent).toContain("#2");
        expect(screen.getByRole("list", { name: "Resources serving Channel 2 through shared actions" })).not.toBeNull();
    });

    it("finds an action to link by its number in the table as well as by its words", () => {
        render(<Harness />);
        addBlank("Channel 2");
        fireEvent.click(screen.getByRole("button", { name: "Link an action to Resource 1 of Channel 2" }));
        const box = screen.getByLabelText(/^Action for Resource 1 of Channel 2/);
        fireEvent.change(box, { target: { value: "#2" } });
        expect(screen.getByRole("option").textContent).toBe("#2 Pin room sets");
        fireEvent.keyDown(box, { key: "Enter" });
        expect(saved.engagement.channelResources[0].actionIds).toEqual(["action-pins"]);
    });

    it("finds it by the digits alone, with or without the #, the exact number first and selected", () => {
        render(<Harness />);
        addBlank("Channel 2");
        fireEvent.click(screen.getByRole("button", { name: "Link an action to Resource 1 of Channel 2" }));
        const box = screen.getByLabelText(/^Action for Resource 1 of Channel 2/);
        for (const typed of ["2", "#2", " # 2"]) {
            fireEvent.change(box, { target: { value: typed } });
            expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["#2 Pin room sets"]);
            expect(screen.getAllByRole("option")[0].getAttribute("aria-selected")).toBe("true");
        }
        fireEvent.change(box, { target: { value: "1" } });
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["#1 Post reels"]);
        fireEvent.change(box, { target: { value: "2" } });
        fireEvent.keyDown(box, { key: "Enter" });
        expect(saved.engagement.channelResources[0].actionIds).toEqual(["action-pins"]);
    });

    it("has no symbol on the card: its summary says no actions, action or N actions, and the words isolate its actions", () => {
        const isolations: unknown[] = [];
        render(<Harness onIsolate={(next) => isolations.push(next)} />);
        addBlank("Channel 2");
        const summary = () => document.querySelector(".business-channel-resource-summary")!;
        // No actions linked yet: "no actions", plain text.
        expect(summary().textContent).toBe("No cost yet · no actions");
        expect(summary().querySelectorAll("button")).toHaveLength(1);
        const link = (typed: string) => {
            fireEvent.click(screen.getByRole("button", { name: "Link an action to Resource 1 of Channel 2" }));
            const box = screen.getByLabelText(/^Action for Resource 1 of Channel 2/);
            fireEvent.change(box, { target: { value: typed } });
            fireEvent.keyDown(box, { key: "Enter" });
        };
        link("#reels");
        // One action: the word "action", no number; and no symbol anywhere on the card.
        expect(summary().textContent).toBe("No cost yet · action");
        expect(document.querySelector(".business-channel-resource .action-symbol")).toBeNull();
        expect(screen.queryByRole("button", { name: /^Linked to/ })).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "action" }));
        expect(isolations).toHaveLength(1);
        expect(isolations[0]).toMatchObject({ kind: "resource", segmentId: "seg-1", resourceIds: [saved.engagement.channelResources[0].resourceId] });
        // Several: the number before the word.
        link("#pin");
        expect(summary().textContent).toBe("No cost yet · 2 actions");
        expect(screen.getByRole("button", { name: "2 actions" })).not.toBeNull();
    });

    it("links an action picked in the table", () => {
        render(<Harness />);
        addBlank("Channel 1");
        fireEvent.click(screen.getByRole("button", { name: "Link an action to Resource 1 of Channel 1" }));
        fireEvent.click(screen.getByRole("button", { name: "Link an action" }));
        expect(screen.getByRole("status").textContent).toMatch(/^Click an action to link it to .+ · Esc to cancel$/);
        fireEvent.click(screen.getByLabelText("Discover actions for Channel 1 1"));
        expect(saved.engagement.channelResources[0].actionIds).toEqual(["action-reels"]);
        expect(ActionPickService.current()).toBeNull();
    });

    it("picks only an action of its own Segment's table in the click-to-pick", () => {
        render(<Harness />);
        addBlank("Channel 1");
        fireEvent.click(screen.getByRole("button", { name: "Link an action to Resource 1 of Channel 1" }));
        fireEvent.click(screen.getByRole("button", { name: "Link an action" }));
        const foreign = document.createElement("textarea");
        foreign.setAttribute("data-field-id", "action-elsewhere");
        document.querySelector(".business-channel-table td")!.appendChild(foreign);
        fireEvent.click(foreign);
        expect(saved.engagement.channelResources[0].actionIds).toEqual([]);
        expect(ActionPickService.current()).not.toBeNull();
        fireEvent.click(screen.getByLabelText("Discover actions for Channel 1 1"));
        expect(saved.engagement.channelResources[0].actionIds).toEqual(["action-reels"]);
    });

    it("takes a resource off with its card, and the undo toast brings both back", () => {
        render(<Harness />);
        addBlank("Channel 1");
        fireEvent.click(screen.getByRole("button", { name: "Take Resource 1 of Channel 1 off the channel" }));
        expect(saved.engagement.channelResources).toHaveLength(0);
        expect(saved.capability.offering.resources).toHaveLength(0);
        act(() => UndoService.undo());
        expect(saved.engagement.channelResources).toHaveLength(1);
        expect(saved.capability.offering.resources).toHaveLength(1);
    });

});

describe("Typical costs for this channel (H4)", () => {

    const press = (channel = "Channel 1") => {
        openMenu(channel);
        fireEvent.click(screen.getByRole("button", { name: "Typical costs for " + channel }));
    };

    it("one press makes every template (T1 to T10 and T12, no T11) in its group, the price blank, linked to the channel", () => {
        render(<Harness category="Other" />);
        press();
        const { offering } = saved.capability;
        expect(offering.resources.map(slot => slot.name)).toEqual([
            "Platform or tool subscription", "Stall, pitch, stand or event fee", "Display kit or hardware", "Travel and van hire", "Packaging and samples", "Event or transit insurance"
        ]);
        expect(offering.providers.map(partner => partner.name)).toEqual(["Payment processing fees", "Marketplace fees and commission", "Ads and influencers", "Courier, postal, fulfilment"]);
        expect(offering.professionals.map(partner => partner.name)).toEqual(["Referral or reseller commission"]);
        expect(offering.resources[0]).toMatchObject({ status: "costs", category: "digital", group: "sales-delivery-tools" });
        expect(offering.resources.every(slot => slot.cost.price === "")).toBe(true);
        expect(offering.providers[2]).toMatchObject({ category: "suppliers", group: "agencies-influencers" });
        expect(saved.engagement.channelResources).toHaveLength(11);
        expect(screen.queryByRole("list", { name: /list$/ })).toBeNull();
    });

    it("pressing again makes nothing twice", () => {
        render(<Harness category="Other" />);
        press();
        press();
        expect(saved.engagement.channelResources).toHaveLength(11);
    });

    it("an item the company already has is not made but offered as Link existing; linking makes nothing, and taking it off keeps the card", () => {
        render(<Harness category="Other" />);
        press();
        // (Channel 1 made them all: Channel 2 is offered each one to link, and makes none.)
        press("Channel 2");
        expect(saved.capability.offering.resources).toHaveLength(6);
        expect(screen.getAllByRole("button", { name: /^Link existing .* to Channel 2$/ })).toHaveLength(11);
        fireEvent.click(screen.getByRole("button", { name: "Link existing Platform or tool subscription to Channel 2" }));
        const second = saved.engagement.channelResources.find(link => link.channelId === "pin")!;
        expect(second.existing).toBe(true);
        expect(screen.queryByRole("button", { name: "Link existing Platform or tool subscription to Channel 2" })).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: /Take Resource 1 of Channel 2 off the channel/ }));
        expect(saved.capability.offering.resources).toHaveLength(6);
        expect(saved.engagement.channelResources.filter(link => link.channelId === "pin")).toHaveLength(0);
    });

    it("an offered template can still be added as a new card", () => {
        render(<Harness category="Other" />);
        press();
        press("Channel 2");
        fireEvent.click(screen.getByRole("button", { name: "Add new Ads and influencers to Channel 2" }));
        expect(saved.capability.offering.providers.filter(partner => partner.name === "Ads and influencers")).toHaveLength(2);
    });

    it("taking a template-made supplier off the channel removes its card too", () => {
        render(<Harness category="Other" />);
        press();
        const before = saved.capability.offering.providers.length;
        fireEvent.click(screen.getAllByRole("button", { name: /Take Resource [0-9]+ of Channel 1 off the channel/ })[6]);
        expect(saved.capability.offering.providers.length + saved.capability.offering.resources.length + saved.capability.offering.professionals.length).toBe(10);
        expect(before).toBe(4);
    });

});

describe("Typical costs are filtered by the channel's category", () => {

    it("a Social Media channel is offered only the templates that fit it", () => {
        render(<Harness />);
        fireEvent.click(screen.getByRole("button", { name: "Add expense to Channel 1" }));
        fireEvent.click(screen.getByRole("button", { name: "Typical costs for Channel 1" }));
        expect(saved.engagement.channelResources.length).toBeGreaterThan(0);
        expect(saved.engagement.channelResources.length).toBeLessThan(11);
        expect(saved.capability.offering.resources.map(slot => slot.name)).not.toContain("Stall, pitch, stand or event fee");
    });

});

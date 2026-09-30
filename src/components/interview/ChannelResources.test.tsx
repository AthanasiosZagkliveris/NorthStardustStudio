import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

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

function Harness() {
    const [engagement, setEngagement] = useState(() => asBusinessEngagementValue({
        segments: [{
            segmentId: "seg-1",
            actions: [{ id: "action-reels", text: "Post reels" }, { id: "action-pins", text: "Pin room sets" }],
            channels: [
                { id: "insta", category: "Social Media", name: "Instagram", stages: ["discovery"], actionIds: { discovery: ["action-reels"] } },
                { id: "pin", category: "Social Media", name: "Pinterest", stages: ["discovery"], actionIds: { discovery: ["action-reels", "action-pins"] } }
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
            actionNumber={() => "3.2.1.1"}
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

    it("adds a resource: its card is made on Infrastructure & Capability, named in both places at once", () => {
        render(<Harness />);
        fireEvent.click(screen.getByRole("button", { name: "Add resource for Channel 1" }));
        const name = screen.getByLabelText("Resource 1 of Channel 1 name");
        fireEvent.change(name, { target: { value: "Meta ads" } });
        const slot = saved.capability.resources.digital[0].slots[0];
        expect(slot).toMatchObject({ name: "Meta ads", status: "costs" });
        expect(saved.engagement.channelResources[0].resourceId).toBe(slot.id);
        expect(screen.getByText("No cost yet · 0 actions")).toBeTruthy();
    });

    it("links an action by \"#\", shows it as a chip, and serves the other channel through it", () => {
        render(<Harness />);
        fireEvent.click(screen.getByRole("button", { name: "Add resource for Channel 1" }));
        fireEvent.click(screen.getByRole("button", { name: "Link an action to Resource 1 of Channel 1" }));
        const box = screen.getByLabelText(/^Action for Resource 1 of Channel 1/);
        fireEvent.change(box, { target: { value: "#reels" } });
        fireEvent.keyDown(box, { key: "Enter" });
        expect(saved.engagement.channelResources[0].actionIds).toEqual(["action-reels"]);
        const chip = screen.getByRole("list", { name: "Actions of Resource 1 of Channel 1" });
        expect(chip.textContent).toContain("# 3.2.1.1");
        expect(chip.textContent).toContain("Post reels");
        // Pinterest shares the action: the resource serves it too.
        const shared = screen.getByRole("list", { name: "Resources serving Channel 2 through shared actions" });
        expect(shared.textContent).toContain("via shared action");
        expect(shared.querySelector("button")?.getAttribute("title")).toBe("Created on Social Media › Instagram");
    });

    it("links an action picked in the table", () => {
        render(<Harness />);
        fireEvent.click(screen.getByRole("button", { name: "Add resource for Channel 1" }));
        fireEvent.click(screen.getByRole("button", { name: "Link an action to Resource 1 of Channel 1" }));
        fireEvent.click(screen.getByRole("button", { name: "Link an action" }));
        expect(screen.getByRole("status").textContent).toMatch(/^Click an action to link it to .+ · Esc to cancel$/);
        fireEvent.click(screen.getByLabelText("Discover actions for Channel 1 1"));
        expect(saved.engagement.channelResources[0].actionIds).toEqual(["action-reels"]);
        expect(ActionPickService.current()).toBeNull();
    });

    it("takes a resource off with its card, and the undo toast brings both back", () => {
        render(<Harness />);
        fireEvent.click(screen.getByRole("button", { name: "Add resource for Channel 1" }));
        fireEvent.click(screen.getByRole("button", { name: "Take Resource 1 of Channel 1 off the channel" }));
        expect(saved.engagement.channelResources).toHaveLength(0);
        expect(saved.capability.resources.digital[0].slots).toHaveLength(0);
        act(() => UndoService.undo());
        expect(saved.engagement.channelResources).toHaveLength(1);
        expect(saved.capability.resources.digital[0].slots).toHaveLength(1);
    });

});

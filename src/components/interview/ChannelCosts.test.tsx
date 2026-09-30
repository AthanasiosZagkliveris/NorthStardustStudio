import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";

import ChannelCosts, { CostPicker, usePickedCost } from "./ChannelCosts";
import { CostPickService } from "./costPick";
import { asBusinessCapabilityValue, asBusinessEngagementValue, createBusinessResourceSlot, type BusinessEngagementValue } from "../../framework/engine/AnswerUtils";
import { costCards, withNewCostCard } from "../../framework/engine/ChannelCosts";
import { UndoService } from "../../services/UndoService";

afterEach(() => {
    cleanup();
    UndoService.dismiss();
    CostPickService.cancel();
});

const cost = (price: string, frequency: string) => ({ price, frequency, frequencyOther: "", currency: "" });

function startingCapability() {
    const base = asBusinessCapabilityValue(undefined);
    return {
        ...base,
        offering: {
            ...base.offering,
            resources: [{ ...createBusinessResourceSlot(), id: "resource-ads1", name: "Instagram ads", status: "costs", cost: cost("150", "monthly") }]
        }
    };
}

let saved: BusinessEngagementValue = asBusinessEngagementValue(undefined);

function Harness({ picking = false }: { picking?: boolean }) {
    const [engagement, setEngagement] = useState(() => asBusinessEngagementValue(undefined));
    const [capability, setCapability] = useState(startingCapability);
    const write = (next: BusinessEngagementValue) => { saved = next; setEngagement(next); };
    usePickedCost(engagement, write);
    const cards = costCards(capability);
    return (
        <>
            <ChannelCosts
                segmentId="seg-1"
                channelKey="channel-a"
                what="Channel 1"
                returnTo={["channel-channel-a"]}
                engagement={engagement}
                cards={cards}
                currency="GBP"
                onEngagement={write}
                numberOf={() => "3.3.2.1"}
                onCreate={(name) => {
                    const created = withNewCostCard(capability, name);
                    setCapability(created.capability);
                    return created.id;
                }}
                onPick={() => undefined}
            />
            {picking && <div data-anchor="resource-ads1">Instagram ads card</div>}
            {picking && <CostPicker cards={cards} />}
        </>
    );
}

function add(query: string) {
    fireEvent.click(screen.getByRole("button", { name: "Add cost for Channel 1" }));
    const box = screen.getByLabelText(/^Cost for Channel 1/);
    fireEvent.change(box, { target: { value: query } });
    return box;
}

describe("a channel's costs", () => {

    it("links a cost card by name, shown as a chip with its number, name and amount", () => {
        render(<Harness />);
        const box = add("#Insta");
        fireEvent.keyDown(box, { key: "Enter" });
        const chip = document.querySelector(".notepad-chip")!;
        expect(chip.textContent).toContain("# 3.3.2.1");
        expect(chip.textContent).toContain("Instagram ads · £150 a month");
        expect(screen.getByText("Costs: £150 a month")).toBeTruthy();
        expect(saved.channelCosts).toEqual([expect.objectContaining({ segmentId: "seg-1", channelKey: "channel-a", costId: "resource-ads1" })]);
    });

    it("creates a cost of the name typed when there is none, and links it", () => {
        render(<Harness />);
        const box = add("#Flyers");
        expect(screen.getByText("Create a cost “Flyers”")).toBeTruthy();
        fireEvent.keyDown(box, { key: "Enter" });
        expect(document.querySelector(".notepad-chip")?.textContent).toContain("Flyers");
        expect(saved.channelCosts).toHaveLength(1);
    });

    it("unlinks with ×, and the undo toast links it back", () => {
        render(<Harness />);
        fireEvent.keyDown(add("#Insta"), { key: "Enter" });
        fireEvent.click(screen.getByRole("button", { name: "Unlink cost Instagram ads from Channel 1" }));
        expect(saved.channelCosts).toHaveLength(0);
        expect(UndoService.current()?.message).toBe("Cost Instagram ads unlinked.");
        act(() => UndoService.undo());
        expect(saved.channelCosts).toHaveLength(1);
    });

    it("picks a card on the other page and links it once the channel's page is back", () => {
        const { unmount } = render(<Harness picking />);
        fireEvent.click(screen.getByRole("button", { name: "Add cost for Channel 1" }));
        fireEvent.click(screen.getByRole("button", { name: "Pick a cost card" }));
        expect(screen.getByRole("status").textContent).toBe("Click a cost card to link it to Channel 1 · Esc to cancel");
        // A click on the card: nothing on it is edited, the card is chosen.
        fireEvent.click(screen.getByText("Instagram ads card"));
        expect(CostPickService.current()).toBeNull();
        unmount();
        // The channel's page again: the card chosen is linked.
        render(<Harness />);
        expect(saved.channelCosts).toEqual([expect.objectContaining({ costId: "resource-ads1" })]);
    });

});

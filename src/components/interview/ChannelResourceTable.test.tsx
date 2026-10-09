import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";

import BusinessEngagementEditor from "./BusinessEngagementEditor";
import ChannelResourceTable from "./ChannelResourceTable";
import {
    asBusinessCapabilityValue,
    asBusinessEngagementValue,
    asBusinessFoundationValue,
    createBusinessChannel,
    createBusinessCustomerSegment,
    createBusinessResourceSlot,
    createBusinessSegmentEngagement
} from "../../framework/engine/AnswerUtils";

afterEach(cleanup);

function renderPage({ linked = true, onOpenCapability = vi.fn() } = {}) {
    function Harness() {
        const [{ foundation, engagement, capability }] = useState(() => {
            const segment = createBusinessCustomerSegment([]);
            const capability = asBusinessCapabilityValue(undefined);
            const price = (amount: string, frequency: string) => ({ price: amount, frequency, frequencyOther: "", currency: "" });
            return {
                foundation: { ...asBusinessFoundationValue(undefined), segments: [{ ...segment, name: "Homes" }] },
                capability: {
                    ...capability,
                    offering: {
                        ...capability.offering,
                        resources: [
                            { ...createBusinessResourceSlot(), id: "card-shop", name: "Shopify Basic", status: "costs", cost: price("25", "monthly") },
                            { ...createBusinessResourceSlot(), id: "card-ship", name: "Courier label", status: "costs", cost: price("1.4", "per-order") }
                        ]
                    }
                },
                engagement: {
                    ...asBusinessEngagementValue(undefined),
                    channelResources: linked
                        ? [
                            { id: "link-shop", segmentId: segment.id, channelId: "insta", resourceId: "card-shop", actionIds: ["a-reels"] },
                            { id: "link-ship", segmentId: segment.id, channelId: "mail", resourceId: "card-ship", actionIds: [] }
                        ]
                        : [],
                    segments: [{
                        ...createBusinessSegmentEngagement(segment.id),
                        actions: [{ id: "a-reels", text: "Post reels" }, { id: "a-pins", text: "Pin room sets" }],
                        channels: [
                            { ...createBusinessChannel(), id: "insta", category: "Social Media", name: "Instagram", stages: ["discovery"], actionIds: { discovery: ["a-reels"] } },
                            { ...createBusinessChannel(), id: "pin", category: "Social Media", name: "Pinterest", stages: ["discovery"], actionIds: { discovery: ["a-reels", "a-pins"] } },
                            { ...createBusinessChannel(), id: "mail", category: "Email", name: "Newsletter", stages: ["evaluation"], actionIds: {} }
                        ]
                    }]
                }
            };
        });
        const [value, setValue] = useState<unknown>(engagement);
        return (
            <BusinessEngagementEditor
                value={value}
                onChange={setValue}
                foundation={foundation}
                capability={capability}
                currency="GBP"
                onChangeCapability={() => undefined}
                onOpenCapability={onOpenCapability}
            />
        );
    }
    render(<Harness />);
    return { onOpenCapability };
}

describe("the Channel resources table (Customer Engagement, 1. Customer Channel)", () => {

    it("lists each channel resource with its cost, behaviour, home channel (and the others it shows in), stages and actions, read-only", () => {
        renderPage();
        const table = screen.getByRole("table", { name: /Channel resources of Homes/ });
        const rows = within(table).getAllByRole("row").slice(1);
        expect(within(table).getAllByRole("columnheader").map(cell => cell.textContent)).toEqual([
            "Resource", "Cost", "Behaviour", "Channel", "Offerings", "Journey stages", "Actions"
        ]);
        // Social Media is the first category in the channel table, Email the second.
        // The categories come in first-appearance order: Social Media (Instagram), then Email.
        expect(rows).toHaveLength(2);
        const cells = (row: HTMLElement) => within(row).getAllByRole("cell").map(cell => cell.textContent);
        expect(within(rows[0]).getByRole("rowheader").textContent).toBe("Shopify Basic");
        // No "Where it lives", Status or "Also reaches" column: the Channel cell lists the home channel
        // first and each other channel the resource shows in after it, as bullets styled alike.
        expect(cells(rows[0])).toEqual([
            "£25 a month", "Fixed", "Social Media · InstagramSocial Media · Pinterest", "—", "Discover", "#1"
        ]);
        const home = within(rows[0]).getAllByRole("cell")[2];
        expect([...home.querySelectorAll("li")].map(item => item.textContent))
            .toEqual(["Social Media · Instagram", "Social Media · Pinterest"]);
        expect(home.querySelector("ul")?.className).toContain("channel-resource-bullets");
        expect(home.textContent).not.toContain("also");
        // One value is plain text indented to the bullets' text, with no bullet list.
        expect(within(rows[0]).getAllByRole("cell")[4].querySelector("ul")).toBeNull();
        expect(within(rows[0]).getAllByRole("cell")[4].querySelector(".channel-resource-single")).not.toBeNull();
        expect(within(rows[1]).getByRole("rowheader").textContent).toBe("Courier label");
        expect(cells(rows[1])).toEqual([
            "£1.40 per order", "Variable", "Email · Newsletter", "—", "—", "—"
        ]);
        // Each row is in its resource's warm colour.
        expect(rows[0].className).toMatch(/tint-resource-1/);
        expect(rows[1].className).toMatch(/tint-resource-2/);
        // The footer sums the rows, and says it is not a forecast.
        expect(screen.getByText(/Summary of the rows above \(not a forecast\)/).parentElement?.textContent)
            .toContain("Fixed per month: £25 · Variable: £1.40 per order");
        // Read-only: no field in it.
        expect(table.querySelector("input, textarea, select")).toBeNull();
    });

    it("opens the card on 3. Infrastructure & Capability from the name, and names each action in a button", () => {
        const { onOpenCapability } = renderPage();
        const table = screen.getByRole("table", { name: /Channel resources/ });
        fireEvent.click(within(table).getByRole("button", { name: /Shopify Basic/ }));
        expect(onOpenCapability).toHaveBeenCalledWith(expect.arrayContaining(["card-shop", "capability-offering-capability"]));
        const action = within(table).getByRole("button", { name: "Go to action #1: Post reels" });
        expect(action.getAttribute("title")).toBe("#1 Post reels");
    });

    it("is a fold of its own, open until folded, and is not drawn while the Segment has no resources", () => {
        renderPage();
        const fold = screen.getByRole("button", { name: "Minimize channel resources" });
        expect(screen.getByText("Channel resources")).toBeTruthy();
        fireEvent.click(fold);
        expect(screen.queryByRole("table", { name: /Channel resources/ })).toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Maximize channel resources" }));
        expect(screen.getByRole("table", { name: /Channel resources/ })).toBeTruthy();
        cleanup();
        renderPage({ linked: false });
        expect(screen.queryByText("Channel resources")).toBeNull();
        expect(screen.queryByRole("table", { name: /Channel resources/ })).toBeNull();
    });

    it("lists two or more journey stages, offerings or actions one under the other, bulleted alike", () => {
        const row = {
            resourceId: "r", linkIds: [], name: "Shop", colour: 1, anchors: [], place: "", costText: "£1", costDetail: "",
            behaviour: "Fixed" as const, home: "Email · News", reaches: [], stages: ["Discover", "Evaluate"],
            actions: [{ id: "a", order: 1, text: "One" }, { id: "b", order: 2, text: "Two" }], offerings: ["Mugs", "Plates"]
        };
        render(<ChannelResourceTable
            segmentName="Homes"
            table={{ rows: [row], summary: { fixedPerMonth: null, oneTime: null, variable: [], notSummed: 0 }, summaryText: "" }}
        />);
        const cells = within(screen.getByRole("table")).getAllByRole("cell");
        const lists = cells.map(cell => [...cell.querySelectorAll("li")].map(item => item.textContent));
        // Channel (one value), Offerings, Journey stages, Actions
        expect(lists.slice(2)).toEqual([[], ["Mugs", "Plates"], ["Discover", "Evaluate"], ["#1", "#2"]]);
        for (const cell of cells.slice(3, 5)) {
            expect(cell.querySelector("ul")?.className).toContain("channel-resource-bullets");
        }
        // Actions: side by side, no bullets.
        expect(cells[5].querySelector("ul")?.className).toContain("channel-resource-chips");
        expect(cells[5].querySelector("ul")?.className).not.toContain("channel-resource-bullets");
    });

});

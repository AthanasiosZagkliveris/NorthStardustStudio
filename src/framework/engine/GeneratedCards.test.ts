import { describe, expect, it } from "vitest";
import { asBusinessCapabilityValue, createBusinessPartner, createBusinessResourceSlot } from "./AnswerUtils.ts";
import { orphanedCards, withoutCards } from "./GeneratedCards.ts";

function base() {
    const parent = { ...createBusinessResourceSlot(), id: "r1", name: "Laptop", status: "partners-suppliers", providerId: "p1" };
    const made = { ...createBusinessPartner("Repairs Ltd", "suppliers"), id: "p1", madeBy: "r1" };
    const value = asBusinessCapabilityValue({});
    return { parent, made, value: { ...value, providers: [made], offering: { ...value.offering, resources: [parent] } } };
}

describe("generated cards", () => {

    it("asks about a generated card its parent stops naming, and nothing else names", () => {
        const { parent, value } = base();
        const after = { ...value, offering: { ...value.offering, resources: [{ ...parent, providerId: "", status: "costs" }] } };
        expect(orphanedCards(value, after).map(card => card.id)).toEqual(["p1"]);
        expect(withoutCards(after, ["p1"]).providers).toEqual([]);
    });

    it("keeps a generated card another card names", () => {
        const { parent, value } = base();
        const other = { ...createBusinessResourceSlot(), id: "r2", status: "partners-suppliers", providerId: "p1" };
        const before = { ...value, offering: { ...value.offering, resources: [parent, other] } };
        const after = { ...before, offering: { ...before.offering, resources: [{ ...parent, providerId: "" }, other] } };
        expect(orphanedCards(before, after)).toEqual([]);
    });

    it("does not ask about a card made in the same change, or one made on its own", () => {
        const { parent, made, value } = base();
        const empty = { ...value, providers: [], offering: { ...value.offering, resources: [{ ...parent, providerId: "" }] } };
        expect(orphanedCards(empty, value)).toEqual([]);
        const own = { ...value, providers: [{ ...made, madeBy: "" }] };
        expect(orphanedCards(own, { ...own, offering: { ...own.offering, resources: [{ ...parent, providerId: "" }] } })).toEqual([]);
    });

});

describe("generated cards and their parent's removal and Offerings", () => {

    it("asks about a generated card whose parent was removed", () => {
        const { value } = base();
        const after = { ...value, offering: { ...value.offering, resources: [] } };
        expect(orphanedCards(value, after).map(card => card.id)).toEqual(["p1"]);
    });

    it("makes a generated card serve the Offerings of its parent", async () => {
        const { withInheritedOfferings } = await import("./GeneratedCards.ts");
        const { parent, made, value } = base();
        const next = withInheritedOfferings({ ...value, offering: { ...value.offering, resources: [{ ...parent, offeringIds: ["o1"], offeringShares: { o1: "100" } }], providers: [made] }, providers: [] });
        expect(next.offering.providers[0].offeringIds).toEqual(["o1"]);
    });

    it("adds, never removes: another connected card's Offerings are added, the user's own stay, and the parent's change does not take them off", async () => {
        const { withInheritedOfferings, connectedOfferings } = await import("./GeneratedCards.ts");
        const { parent, made, value } = base();
        const other = { ...createBusinessResourceSlot(), id: "r2", status: "partners-suppliers", providerId: "p1", offeringIds: ["o2"], offeringShares: { o2: "100" } };
        const own = { ...made, offeringIds: ["o9"], offeringShares: { o9: "100" } };
        const before = { ...value, providers: [], offering: { ...value.offering, resources: [{ ...parent, offeringIds: ["o1"], offeringShares: { o1: "100" } }, other], providers: [own] } };
        const next = withInheritedOfferings(before);
        // (The user's o9 stays; the parent's o1 and the other card's o2 are added.)
        expect(next.offering.providers[0].offeringIds.sort()).toEqual(["o1", "o2", "o9"]);
        expect(connectedOfferings(next, next.offering.providers[0]).ids.sort()).toEqual(["o1", "o2"]);
        // (The parent stops serving o1 and a connected card still serves o2: the generated card keeps all it had.)
        const dropped = { ...next, offering: { ...next.offering, resources: next.offering.resources.map(slot => slot.id === "r1" ? { ...slot, offeringIds: [], offeringShares: {} } : slot) } };
        expect(withInheritedOfferings(dropped).offering.providers[0].offeringIds.sort()).toEqual(["o1", "o2", "o9"]);
        // (And what the card gained did not touch its parent.)
        expect(next.offering.resources.find(slot => slot.id === "r1")!.offeringIds).toEqual(["o1"]);
    });

});

import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessCapabilityEditor from "./BusinessCapabilityEditor";
import { openCard, openTile } from "../../test/interviewTestUtils";
import { asBusinessCapabilityValue, createBusinessResourceSlot, withNewInsurances } from "../../framework/engine/AnswerUtils";
import { incompleteCards } from "../../framework/engine/CardCompleteness";

/* H3: an Insurances card is generated, once, for a premises, vehicle, workshop, machine or event that is made. */

afterEach(cleanup);

type Value = ReturnType<typeof asBusinessCapabilityValue>;
const base = () => asBusinessCapabilityValue(undefined);
const withSlot = (value: Value, subsection: string, category: string, fields: object): Value => ({
    ...value, resources: { ...value.resources, [category]: [{ id: subsection, name: "", slots: [{ ...createBusinessResourceSlot(), id: "s1", ...fields }] }] }
});
const insurancesOf = (value: Value) => (value.resources.documents ?? []).flatMap(subsection => subsection.slots);

describe("withNewInsurances", () => {

    it("a named premises gets an Insurances card in Infrastructure, linked both ways, annual, to be priced", () => {
        const next = withNewInsurances(base(), withSlot(base(), "premises", "workspace", { name: "Studio", status: "rent" }));
        const [card] = insurancesOf(next);
        expect(card.name).toBe("Insurance for Studio");
        expect(card.insuresId).toBe("s1");
        expect(card.status).toBe("costs");
        expect(card.cost.frequency).toBe("annually");
        expect(next.resources.workspace[0].slots[0].insuranceId).toBe(card.id);
        expect((next.resources.documents ?? [])[0].id).toBe("insurances");
    });

    it("a card with no name yet gets none; it gets one when it is named", () => {
        const blank = withSlot(base(), "premises", "workspace", {});
        expect(insurancesOf(withNewInsurances(base(), blank))).toEqual([]);
        expect(insurancesOf(withNewInsurances(blank, withSlot(base(), "premises", "workspace", { name: "Studio" })))).toHaveLength(1);
    });

    it("is made once: not again after the card is renamed or its Insurances card is removed", () => {
        const first = withNewInsurances(base(), withSlot(base(), "premises", "workspace", { name: "Studio" }));
        const renamed = { ...first, resources: { ...first.resources, workspace: [{ ...first.resources.workspace[0], slots: [{ ...first.resources.workspace[0].slots[0], name: "Loft" }] }] } };
        expect(insurancesOf(withNewInsurances(first, renamed))).toHaveLength(1);
        const removed = { ...renamed, resources: { ...renamed.resources, documents: [{ id: "insurances", name: "", slots: [] }] } };
        expect(insurancesOf(withNewInsurances(renamed, removed))).toHaveLength(0);
    });

    it("an Offering machine, workshop, event or delivery vehicle gets one in the Offering's Documents & Rights, with its Offerings; a desk gets none", () => {
        const slot = (id: string, group: string, category: string) => ({ ...createBusinessResourceSlot(), id, name: id, category, group, offeringIds: ["o1"] });
        const next = withNewInsurances(base(), {
            ...base(),
            offering: { ...base().offering, resources: [slot("loom", "production-machinery", "equipment"), slot("van", "delivery-vehicles", "vehicles"), slot("pitch", "site-hire", "workspace"), slot("shelf", "workshop-storage", "workspace"), slot("kit", "devices-tools", "equipment")] }
        });
        const made = next.offering.resources.filter(entry => entry.insuresId !== "");
        expect(made.map(entry => entry.insuresId)).toEqual(["loom", "van", "pitch", "shelf"]);
        expect(made.every(entry => entry.category === "documents" && entry.group === "insurances" && entry.offeringIds[0] === "o1")).toBe(true);
        expect(made.find(entry => entry.insuresId === "pitch")!.cost.frequency).toBe("per-project");
    });

    it("keeps the insurance links through the reader", () => {
        const next = withNewInsurances(base(), withSlot(base(), "premises", "workspace", { name: "Studio" }));
        const again = asBusinessCapabilityValue(JSON.parse(JSON.stringify(next)));
        expect(insurancesOf(again)[0].insuresId).toBe("s1");
        expect(again.resources.workspace[0].slots[0].insuranceId).toBe(insurancesOf(again)[0].id);
        expect(incompleteCards(again).has(insurancesOf(again)[0].id)).toBe(true);
    });

});

describe("the editor", () => {

    it("naming a premises makes its Insurances card", () => {
        let latest: Value | undefined;
        function Harness() {
            const [value, setValue] = useState<unknown>(withSlot(base(), "premises", "workspace", { status: "exists" }));
            return <BusinessCapabilityEditor value={value} onChange={(next) => { setValue(next); latest = next as Value; }} />;
        }
        render(<Harness />);
        openTile("Workspace");
        openCard(/./);
        fireEvent.change(screen.getByPlaceholderText("Resource name"), { target: { value: "Studio" } });
        expect(insurancesOf(latest!).map(card => card.name)).toEqual(["Insurance for Studio"]);
    });

});

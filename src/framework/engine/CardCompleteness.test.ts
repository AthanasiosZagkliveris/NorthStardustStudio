import { describe, expect, test } from "vitest";
import { asBusinessCapabilityValue, workspacesOf } from "./AnswerUtils.ts";
import { countedCapability, incompleteCards } from "./CardCompleteness.ts";

const cost = (price: string, frequency: string) => ({ price, frequency, frequencyOther: "", currency: "" });
const slot = (fields: Record<string, unknown>) => ({ id: "s", name: "Thing", status: "exists", cost: cost("", ""), ...fields });
const partner = (fields: Record<string, unknown>) => ({ id: "p", name: "Partner", cost: cost("100", "monthly"), ...fields });
const founder = { id: "f1", name: "Maya", roles: [], salary: "1800", hours: "160", deliveryHours: "100" };

describe("incomplete cards", () => {

    test("a resource needs its name and status, and at Costs a price and a frequency; at Partners & Suppliers who", () => {
        const value = asBusinessCapabilityValue({
            founders: [founder],
            resources: { equipment: [{ id: "computing", name: "", slots: [
                slot({ id: "a", name: "", status: "" }),
                slot({ id: "b", status: "costs" }),
                slot({ id: "c", status: "costs", cost: cost("12", "monthly") }),
                slot({ id: "d", status: "partners-providers" }),
                slot({ id: "e", status: "partners-providers", providerId: "p" }),
                slot({ id: "f" })
            ] }] },
            providers: [partner({ id: "p" })]
        });
        const missing = incompleteCards(value);
        expect(missing.get("a")).toEqual(["Name", "Status"]);
        expect(missing.get("b")).toEqual(["Price", "Payment Frequency"]);
        expect(missing.has("c")).toBe(false);
        expect(missing.get("d")).toEqual(["Partner or Supplier"]);
        expect(missing.has("e")).toBe(false);
        expect(missing.has("f")).toBe(false);
    });

    test("a partner or provider needs its price and frequency; an activity a performer", () => {
        const value = asBusinessCapabilityValue({
            founders: [founder],
            providers: [partner({ id: "p1", cost: cost("", "") }), partner({ id: "p2" })],
            activities: [{ id: "operational", name: "", activities: [{ id: "a1", name: "Do it", startDate: "2030-01-01", performerIds: [] }, { id: "a2", name: "Done", startDate: "2030-01-01", performerIds: ["f1"] }] }]
        });
        const missing = incompleteCards(value);
        expect(missing.get("p1")).toEqual(["Price", "Payment Frequency"]);
        expect(missing.has("p2")).toBe(false);
        expect(missing.get("a1")).toEqual(["Performer"]);
        expect(missing.has("a2")).toBe(false);
    });

    test("an untouched Workspace or founder is not an error; a half-filled one is", () => {
        const untouched = asBusinessCapabilityValue({ founders: [{ ...founder, salary: "", hours: "", deliveryHours: "" }] });
        expect(incompleteCards(untouched).size).toBe(0);
        const half = asBusinessCapabilityValue({
            founders: [{ ...founder, hours: "" }],
            workspace: { kind: "dedicated", status: "costs", cost: cost("", "") }
        });
        const missing = incompleteCards(half);
        expect(missing.get("f1")).toEqual(["Working Hours"]);
        expect(missing.get("workspace")).toEqual(["Price", "Payment Frequency"]);
    });

    test("the counted capability leaves incomplete cards out and strips the Workspace and the founder; the stored answer is untouched", () => {
        const value = asBusinessCapabilityValue({
            founders: [{ ...founder, hours: "" }],
            // (A Workspace bought has the one frequency, One-time: its Price is what it lacks.)
            workspace: { kind: "dedicated", status: "costs", cost: cost("", ""), deposit: "3750" },
            resources: { equipment: [{ id: "computing", name: "", slots: [slot({ id: "a", status: "costs" }), slot({ id: "c", status: "costs", cost: cost("12", "monthly") })] }] },
            providers: [partner({ id: "p1", cost: cost("", "") }), partner({ id: "p2" })]
        });
        const counted = countedCapability(value);
        expect(counted.resources.equipment[0].slots.map(entry => entry.id)).toEqual(["c"]);
        expect(counted.providers.map(entry => entry.id)).toEqual(["p2"]);
        expect(workspacesOf(counted)[0].status).toBe("");
        expect(workspacesOf(counted)[0].deposit).toBe("");
        expect(counted.founders[0].salary).toBe("");
        expect(value.resources.equipment[0].slots).toHaveLength(2);
        expect(workspacesOf(value)[0].status).toBe("buy");
        // Nothing missing: the very same object.
        const whole = asBusinessCapabilityValue({ founders: [founder] });
        expect(countedCapability(whole)).toBe(whole);
    });

    test("every Workspace card is judged on its own and left out of the counts on its own", () => {
        const value = asBusinessCapabilityValue({
            founders: [founder],
            workspaces: [
                { id: "workspace", kind: "dedicated", status: "costs", cost: cost("900", "monthly"), deposit: "500" },
                { id: "ws-2", kind: "coworking", status: "costs", cost: cost("", ""), deposit: "300" }
            ]
        });
        const missing = incompleteCards(value);
        expect(missing.has("workspace")).toBe(false);
        expect(missing.get("ws-2")).toEqual(["Price", "Payment Frequency"]);
        const counted = countedCapability(value);
        expect(workspacesOf(counted)[0]).toEqual(workspacesOf(value)[0]);
        expect(workspacesOf(counted)[1].status).toBe("");
        expect(workspacesOf(counted)[1].deposit).toBe("");
    });
});

describe("a card with no category yet", () => {

    test("a new Activity or Partner / Provider (no category yet) lacks its Category first, and is kept as stored; the cards of a chosen category do not", () => {
        const value = asBusinessCapabilityValue({
            founders: [founder],
            activities: [{ id: "unassigned", name: "", activities: [{ id: "a1", category: "unassigned", name: "Dye", startDate: "2030-01-01", performerIds: ["f1"] }] }],
            professionals: [partner({ id: "p1", category: "unassigned" }), partner({ id: "p2", category: "partners" })],
            offering: { activities: [{ id: "a2", category: "unassigned", name: "Weave", startDate: "2030-01-01", performerIds: ["f1"] }], professionals: [], providers: [], resources: [] }
        });
        expect(value.activities[0].id).toBe("unassigned");
        expect(value.offering.activities[0].category).toBe("unassigned");
        expect(value.professionals[0].category).toBe("unassigned");
        const missing = incompleteCards(value);
        expect(missing.get("a1")).toEqual(["Category"]);
        expect(missing.get("a2")).toEqual(["Category", "Linked Offerings"]);
        expect(missing.get("p1")).toEqual(["Category"]);
        expect(missing.has("p2")).toBe(false);
        // (Left out of every count till a Category is chosen.)
        expect(countedCapability(value).activities[0].activities).toEqual([]);
        expect(countedCapability(value).professionals.map(entry => entry.id)).toEqual(["p2"]);
    });

});

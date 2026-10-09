import { describe, expect, test } from "vitest";
import {
    asBusinessCapabilityValue,
    BUSINESS_PEOPLE_STATUS_IDS,
    BUSINESS_RESOURCE_CARD_STATUS_IDS,
    BUSINESS_RESOURCE_STATUSES,
    BUSINESS_WORKSPACE_STATUS_IDS,
    isCostingStatus,
    buyCostOf,
    statusInGroup,
    isPartnered,
    resourceStatusIds,
    workspacesOf
} from "./AnswerUtils.ts";

const slot = (id: string, status: string) => ({ id, name: id, status });

describe("a resource's status (stage C)", () => {

    test("a card's status follows the group it is filed in: Rent and Buy are a space's, Partners & Suppliers and Costs another card's", () => {
        expect(statusInGroup("partners-suppliers", "premises")).toBe("rent");
        expect(statusInGroup("costs", "company-vehicles")).toBe("buy");
        expect(statusInGroup("rent", "devices-tools")).toBe("partners-suppliers");
        expect(statusInGroup("buy", "devices-tools")).toBe("costs");
        expect(statusInGroup("exists", "premises")).toBe("exists");
        expect(statusInGroup("activity", "premises")).toBe("activity");
        // (Needs Investigation belongs to the people cards: elsewhere it is cleared.)
        expect(statusInGroup("investigation", "premises")).toBe("");
        expect(statusInGroup("investigation", "admin-team")).toBe("investigation");
        expect(statusInGroup("", "premises")).toBe("");
    });

    test("a Buy asks for its group's price: a space One-time, a vehicle Per unit; what is there is kept", () => {
        const empty = { price: "", frequency: "", frequencyOther: "", unit: "", currency: "" };
        expect(buyCostOf("premises", empty).frequency).toBe("one-time");
        expect(buyCostOf("company-vehicles", empty)).toMatchObject({ frequency: "per-unit", unit: "unit" });
        expect(buyCostOf("premises", { ...empty, frequency: "monthly" }).frequency).toBe("monthly");
    });

    test("Provided and Partners are one status, Partners & Suppliers, in a saved answer; the Workspace's Provided is Rent and its Costs is Buy", () => {
        const value = asBusinessCapabilityValue({
            resources: { utilities: [{ id: "electricity", name: "", slots: [slot("a", "provided"), slot("b", "professional"), slot("c", "costs"), slot("e", "partners-providers")] }] },
            offering: { resources: [slot("d", "professional")] },
            workspace: { kind: "dedicated", status: "provided" }
        });
        expect(value.resources.utilities[0].slots.map(entry => entry.status)).toEqual(["partners-suppliers", "partners-suppliers", "costs", "partners-suppliers"]);
        expect(value.offering.resources[0].status).toBe("partners-suppliers");
        expect(workspacesOf(value)[0].status).toBe("rent");
        expect(workspacesOf(asBusinessCapabilityValue({ workspace: { kind: "dedicated", status: "costs" } }))[0].status).toBe("buy");
        expect(isPartnered("partners-suppliers")).toBe(true);
        expect(isCostingStatus("costs")).toBe(true);
        expect(isCostingStatus("buy")).toBe(true);
        expect(isCostingStatus("rent")).toBe(false);
    });

    test("Needs Investigation is for the people cards only: on any other card an old answer's is cleared and said in its description", () => {
        const value = asBusinessCapabilityValue({
            resources: { equipment: [{ id: "computing", name: "", slots: [slot("a", "investigation")] }] },
            workspace: { kind: "dedicated", status: "investigation" }
        });
        expect(value.resources.equipment[0].slots[0].status).toBe("");
        expect(value.resources.equipment[0].slots[0].description).toBe("Earlier status: Needs Investigation.");
        expect(workspacesOf(value)[0].status).toBe("");
        expect(workspacesOf(value)[0].name).not.toBe("");
        const people = asBusinessCapabilityValue({
            formatVersion: 3,
            resources: { hr: [{ id: "admin-team", name: "", slots: [slot("p", "investigation")] }] }
        });
        expect(people.resources.hr[0].slots[0].status).toBe("investigation");
    });

    test("a resource card offers four statuses, a people card five and a space or a vehicle four of its own", () => {
        expect(BUSINESS_RESOURCE_CARD_STATUS_IDS).toEqual(["exists", "partners-suppliers", "activity", "costs"]);
        expect(BUSINESS_PEOPLE_STATUS_IDS).toEqual(["exists", "partners-suppliers", "activity", "investigation", "costs"]);
        expect(BUSINESS_WORKSPACE_STATUS_IDS).toEqual(["exists", "rent", "activity", "buy"]);
        for (const group of ["premises", "workshop-storage", "company-vehicles", "delivery-vehicles"]) {
            expect(resourceStatusIds(group)).toEqual(["exists", "rent", "activity", "buy"]);
        }
        expect(resourceStatusIds("devices-tools")).toEqual(BUSINESS_RESOURCE_CARD_STATUS_IDS);
        expect(resourceStatusIds("admin-team")).toEqual(BUSINESS_PEOPLE_STATUS_IDS);
        expect(resourceStatusIds("delivery-team")).toEqual(BUSINESS_PEOPLE_STATUS_IDS);
        expect(BUSINESS_RESOURCE_STATUSES.find(entry => entry.id === "partners-suppliers")?.label).toBe("Partners & Suppliers");
        expect(BUSINESS_RESOURCE_STATUSES.find(entry => entry.id === "exists")?.label).toBe("Exists / Free");
    });

});

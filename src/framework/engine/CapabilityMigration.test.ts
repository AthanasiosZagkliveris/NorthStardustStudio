import { describe, expect, test } from "vitest";
import {
    asBusinessCapabilityValue,
    asLegalEntityValue,
    BUSINESS_ACTIVITY_GROUPS,
    BUSINESS_CAPABILITY_FORMAT_VERSION,
    BUSINESS_COST_FREQUENCIES,
    BUSINESS_OFFERING_RESOURCE_GROUPS,
    BUSINESS_PARTNER_GROUPS,
    BUSINESS_RESOURCE_GROUPS,
    businessQuantityText,
    createBusinessActivity,
    createBusinessPartner,
    createBusinessResourceSlot,
    isPurchaseGroup,
    resourceUnitCount,
    workspacesOf
} from "./AnswerUtils.ts";
import { asFinancialFoundationValue, consolidateCosts, type CostSources } from "./FinancialModel.ts";

/* F2 to F4: the nine categories with their groups, Partners & Suppliers, the new statuses and frequencies, and the move of a saved answer into them. */

const cost = (price: string, frequency: string, extra: Record<string, unknown> = {}) => ({ price, frequency, frequencyOther: "", currency: "", ...extra });
const slot = (id: string, fields: Record<string, unknown> = {}) => ({ id, name: id, status: "costs", cost: cost("10", "monthly"), ...fields });
const only = <T>(list: readonly T[]): T => {
    expect(list).toHaveLength(1);
    return list[0];
};

describe("the data model (F2)", () => {

    test("nine resource categories; 21 groups in Infrastructure (Founders & Owners is the Founders tile) and 26 in the Offering, with the partner and supplier groups", () => {
        expect(BUSINESS_RESOURCE_GROUPS.map(group => group.id)).toEqual(["workspace", "utilities", "workstation", "equipment", "vehicles", "digital", "materials", "documents", "hr"]);
        expect(BUSINESS_OFFERING_RESOURCE_GROUPS.map(group => group.id)).toEqual(BUSINESS_RESOURCE_GROUPS.map(group => group.id));
        const infrastructure = BUSINESS_RESOURCE_GROUPS.flatMap(group => group.kinds).length + 1;
        const offering = BUSINESS_OFFERING_RESOURCE_GROUPS.flatMap(group => group.kinds).length;
        const partners = (place: "infrastructure" | "offering") => Object.values(BUSINESS_PARTNER_GROUPS[place]).flat().length;
        expect(infrastructure + partners("infrastructure")).toBe(21);
        expect(offering + partners("offering")).toBe(26);
        expect(infrastructure + partners("infrastructure") + offering + partners("offering")).toBe(47);
    });

    test("activity groups by place: Pre-Operational and Operational in Infrastructure; Production, Marketing and Sales & Customer in the Offering", () => {
        expect(BUSINESS_ACTIVITY_GROUPS.infrastructure.map(group => [group.id, group.period])).toEqual([["pre-operational", "plan-start-to-opening"], ["operational", "from-opening"]]);
        expect(BUSINESS_ACTIVITY_GROUPS.offering.map(group => [group.id, group.period])).toEqual([["production", "from-plan-start"], ["marketing", "from-plan-start"], ["sales", "from-opening"]]);
        expect(createBusinessActivity().type).toBe("");
        expect(asBusinessCapabilityValue({ formatVersion: 3, offering: { activities: [{ id: "a", category: "production", type: "startup" }] } }).offering.activities[0].type).toBe("startup");
        expect(asBusinessCapabilityValue({ formatVersion: 3, offering: { activities: [{ id: "a", category: "production", type: "nonsense" }] } }).offering.activities[0].type).toBe("");
    });

    test("a new partner has a group (none yet) and a new resource a quantity of 1", () => {
        expect(createBusinessPartner().group).toBe("");
        expect(createBusinessResourceSlot().quantity).toBe("1");
        expect(createBusinessResourceSlot().category).toBe("");
    });

});

describe("an answer saved before the nine categories is moved into them (F3)", () => {

    test("each earlier kind is filed in its group (F1)", () => {
        const value = asBusinessCapabilityValue({
            resources: {
                workspace: [{ id: "workspace", name: "", slots: [slot("w", { status: "exists" })] }],
                utilities: [
                    { id: "electricity", name: "", slots: [slot("u1")] },
                    { id: "internet", name: "", slots: [slot("u2")] },
                    { id: "heating", name: "", slots: [slot("u3")] },
                    { id: "cooling", name: "", slots: [slot("u4")] },
                    { id: "water", name: "", slots: [slot("u5")] }
                ],
                workstation: [{ id: "furniture", name: "", slots: [slot("f1")] }, { id: "electrical", name: "", slots: [slot("f2")] }, { id: "supporting", name: "", slots: [slot("f3")] }],
                equipment: [{ id: "computing", name: "", slots: [slot("e1")] }, { id: "peripherals", name: "", slots: [slot("e2")] }, { id: "specialised", name: "", slots: [slot("e3")] }],
                digital: [{ id: "software", name: "", slots: [slot("d1")] }, { id: "services", name: "", slots: [slot("d2")] }, { id: "presence", name: "", slots: [slot("d3")] }]
            }
        });
        const idsIn = (category: string, group: string) => (value.resources[category] ?? []).filter(subsection => subsection.id === group).flatMap(subsection => subsection.slots.map(entry => entry.id));
        expect(workspacesOf(value).map(entry => entry.id)).toEqual(["w"]);
        expect(value.resources.workspace.map(subsection => subsection.id)).toEqual(["premises"]);
        expect(idsIn("utilities", "premises-utilities")).toEqual(["u1", "u2", "u3", "u4", "u5"]);
        expect(value.resources.utilities).toHaveLength(1);
        expect(idsIn("workstation", "furniture-fittings")).toEqual(["f1", "f2", "f3"]);
        expect(idsIn("equipment", "devices-tools")).toEqual(["e1", "e2", "e3"]);
        expect(idsIn("digital", "software-web")).toEqual(["d1", "d3"]);
        expect(idsIn("digital", "cloud-security")).toEqual(["d2"]);
        expect(value.formatVersion).toBe(BUSINESS_CAPABILITY_FORMAT_VERSION);
    });

    test("a group the user made is the category's 'No group' (or its one group), its name written into the description of its cards", () => {
        const value = asBusinessCapabilityValue({
            resources: {
                documents: [{ id: "custom-1", name: "Lighting", slots: [slot("l1", { description: "LED" })] }, { id: "custom-2", name: "Empty one", slots: [] }],
                workstation: [{ id: "custom-3", name: "Lamps", slots: [slot("l2")] }]
            }
        });
        const subsection = only(value.resources.documents);
        expect(subsection.id).toBe("unassigned");
        expect(subsection.slots[0].description).toBe("Earlier group: Lighting. LED");
        // Workstation has the one group: nothing is left to choose, so the card is filed in it.
        const lamps = only(value.resources.workstation);
        expect(lamps.id).toBe("furniture-fittings");
        expect(lamps.slots[0].description).toBe("Earlier group: Lamps.");
    });

    test("statuses: Provided is Rent on the Workspace and Partners & Suppliers elsewhere; Costs on the Workspace is Buy; Needs Activity is Activity", () => {
        const value = asBusinessCapabilityValue({
            workspaces: [
                { id: "w1", kind: "dedicated", status: "provided", providerId: "p1", cost: cost("", "") },
                { id: "w2", kind: "coworking", status: "costs", cost: cost("900", "monthly") },
                { id: "w3", kind: "home", status: "exists", cost: cost("", "") }
            ],
            resources: { utilities: [{ id: "internet", name: "", slots: [slot("a", { status: "provided" }), slot("b", { status: "professional" }), slot("c", { status: "partners-providers" }), slot("d", { status: "activity" }), slot("e", { status: "exists" })] }] }
        });
        expect(workspacesOf(value).map(entry => entry.status)).toEqual(["rent", "buy", "exists"]);
        expect(workspacesOf(value)[0].providerId).toBe("p1");
        expect(only(value.resources.utilities).slots.map(entry => entry.status)).toEqual(["partners-suppliers", "partners-suppliers", "partners-suppliers", "activity", "exists"]);
    });

    test("Needs Investigation outside the people cards is cleared, said in the description, and its activity stays (without its link)", () => {
        const value = asBusinessCapabilityValue({
            resources: { equipment: [{ id: "computing", name: "", slots: [slot("m", { name: "Mill", status: "investigation", description: "Ask around" })] }] },
            activities: [{ id: "operational", name: "", activities: [{ id: "a1", name: "Investigate Mill", sourceId: "m" }] }]
        });
        const mill = only(only(value.resources.equipment).slots);
        expect(mill.status).toBe("");
        expect(mill.description).toBe("Earlier status: Needs Investigation. Ask around");
        expect(value.activities.flatMap(container => container.activities).map(entry => [entry.name, entry.category])).toEqual([["Investigate Mill", "operational"]]);
    });

    test("partners and providers are Suppliers: the old Partners in Business Services (Infrastructure) or Contractors & Advisers (Offering), the old Providers and a category the user made with no group", () => {
        const value = asBusinessCapabilityValue({
            professionals: [{ id: "p1", name: "Accountant", cost: cost("80", "monthly") }, { id: "p2", name: "Courier", category: "category-x", description: "Daily", cost: cost("", "") }],
            providers: [{ id: "p3", name: "Landlord", cost: cost("", "") }],
            partnerCategories: [{ id: "category-x", name: "Couriers" }],
            offering: { professionals: [{ id: "o1", name: "Adviser", cost: cost("", "") }], providers: [{ id: "o2", name: "Mill", cost: cost("", "") }] }
        });
        expect(value.professionals.map(entry => [entry.id, entry.category, entry.group])).toEqual([["p1", "suppliers", "business-services"], ["p2", "suppliers", ""]]);
        expect(value.professionals[1].description).toBe("Earlier category: Couriers. Daily");
        expect(value.providers.map(entry => [entry.category, entry.group])).toEqual([["suppliers", ""]]);
        expect(value.offering.professionals.map(entry => [entry.category, entry.group])).toEqual([["suppliers", "contractors-advisers"]]);
        expect(value.offering.providers.map(entry => [entry.category, entry.group])).toEqual([["suppliers", ""]]);
        expect(value.partnerCategories).toEqual([]);
    });

    test("Offering resources are not sorted by the old model: they wait in 'No category' (no category, no group), channel-made ones included", () => {
        const value = asBusinessCapabilityValue({ offering: { resources: [slot("r1"), slot("r2", { category: "equipment", group: "production-machinery" })] } });
        expect(value.offering.resources.map(entry => [entry.category, entry.group])).toEqual([["", ""], ["equipment", "production-machinery"]]);
        // A group that is not one of its category's is dropped; so is a category that does not exist.
        const wrong = asBusinessCapabilityValue({ formatVersion: 3, offering: { resources: [slot("r1", { category: "equipment", group: "delivery-team" }), slot("r2", { category: "nope", group: "nope" })] } });
        expect(wrong.offering.resources.map(entry => [entry.category, entry.group])).toEqual([["equipment", ""], ["", ""]]);
    });

    test("activities: Operational stays; the other earlier categories are 'No category' in Infrastructure, with the old one named", () => {
        const value = asBusinessCapabilityValue({
            activities: [
                { id: "operational", name: "", activities: [{ id: "a1", name: "Admin" }] },
                { id: "production", name: "", activities: [{ id: "a2", name: "Make" }] }
            ],
            offering: { activities: [{ id: "o1", name: "Sell", category: "sales" }, { id: "o2", name: "Run", category: "operational" }] }
        });
        expect(value.activities.map(container => [container.id, container.activities.map(entry => entry.id)])).toEqual([["operational", ["a1"]], ["unassigned", ["a2"]]]);
        expect(value.activities[1].activities[0].description).toBe("Earlier category: Production.");
        expect(value.offering.activities.map(entry => entry.category)).toEqual(["sales", "unassigned"]);
    });

    test("reading it again moves nothing; an answer that carries the version is read as it is", () => {
        const once = asBusinessCapabilityValue({
            workspaces: [{ id: "w1", kind: "dedicated", status: "costs", cost: cost("900", "monthly") }],
            resources: {
                equipment: [{ id: "computing", name: "", slots: [slot("m", { status: "investigation" }), slot("laptop", { cost: cost("1000", "one-time"), quantity: "3" })] }],
                workstation: [{ id: "custom", name: "Lamps", slots: [slot("l")] }]
            },
            professionals: [{ id: "p1", name: "Accountant", cost: cost("", "") }],
            activities: [{ id: "marketing", name: "", activities: [{ id: "a1", name: "Posters" }] }]
        });
        expect(asBusinessCapabilityValue(once)).toEqual(once);
        expect(asBusinessCapabilityValue(JSON.parse(JSON.stringify(once)))).toEqual(once);
        const own = asBusinessCapabilityValue({ formatVersion: 3, professionals: [{ id: "p", name: "Guild", category: "partners", group: "alliances-networks" }], activities: [{ id: "my-own", name: "Mine", activities: [] }] });
        expect(own.professionals.map(entry => [entry.category, entry.group])).toEqual([["partners", "alliances-networks"]]);
        // (A group that is not the type's in this place is dropped.)
        expect(asBusinessCapabilityValue({ formatVersion: 3, professionals: [{ id: "p", category: "partners", group: "business-services" }] }).professionals[0].group).toBe("");
    });

});

describe("frequencies and quantity (F4)", () => {

    test("the seven frequencies: Quarterly and % of Rev added; Per order and Other gone", () => {
        expect(BUSINESS_COST_FREQUENCIES.map(entry => entry.id)).toEqual(["one-time", "monthly", "quarterly", "annually", "per-unit", "per-project", "percent-revenue"]);
    });

    test("Per order is Per unit with the unit 'order'; Other is cleared and its words kept in the description", () => {
        const value = asBusinessCapabilityValue({
            offering: { resources: [slot("a", { cost: cost("3", "per-order") }), slot("b", { cost: cost("12", "other", { frequencyOther: "per participant" }), description: "Kit" })] },
            providers: [{ id: "p", name: "Courier", cost: cost("5", "per-order") }]
        });
        expect(value.offering.resources[0].cost).toMatchObject({ frequency: "per-unit", unit: "order" });
        expect(value.offering.resources[1].cost).toMatchObject({ frequency: "", frequencyOther: "" });
        expect(value.offering.resources[1].description).toBe("Earlier frequency: per participant. Kit");
        expect(value.providers[0].cost).toMatchObject({ frequency: "per-unit", unit: "order" });
    });

    test("an asset purchase moves from One-time to Per unit (its quantity kept); a bought space, a lease and other groups stay as they are", () => {
        const value = asBusinessCapabilityValue({
            workspaces: [{ id: "w", kind: "dedicated", status: "costs", cost: cost("50000", "one-time") }],
            resources: {
                equipment: [{ id: "computing", name: "", slots: [slot("laptops", { quantity: "3", cost: cost("1000", "one-time") }), slot("lease", { cost: cost("90", "monthly") })] }],
                workstation: [{ id: "furniture", name: "", slots: [slot("desk", { cost: cost("300", "one-time") })] }],
                digital: [{ id: "software", name: "", slots: [slot("licence", { cost: cost("200", "one-time") })] }]
            }
        });
        const [laptops, lease] = only(value.resources.equipment).slots;
        expect(laptops.cost).toMatchObject({ frequency: "per-unit", unit: "unit", price: "1000" });
        expect(laptops.quantity).toBe("3");
        expect(lease.cost.frequency).toBe("monthly");
        expect(only(value.resources.workstation).slots[0].cost.frequency).toBe("per-unit");
        expect(only(value.resources.digital).slots[0].cost.frequency).toBe("one-time");
        expect(workspacesOf(value)[0].cost.frequency).toBe("one-time");
        expect(isPurchaseGroup("devices-tools")).toBe(true);
        expect(isPurchaseGroup("software-web")).toBe(false);
    });

    test("a Per unit purchase is multiplied by its quantity; any other Per unit price is not", () => {
        expect(resourceUnitCount("3", "per-unit", true)).toBe(3);
        expect(resourceUnitCount("3", "per-unit")).toBeNull();
        expect(resourceUnitCount("3", "one-time")).toBe(3);
        expect(resourceUnitCount("3", "percent-revenue", true)).toBeNull();
        expect(resourceUnitCount("1", "per-unit", true)).toBeNull();
    });

    test("a Qty is a whole number, with decimals only for an hour, a metre, a litre or kWh", () => {
        expect(businessQuantityText("2.5")).toBe("25");
        expect(businessQuantityText("2.5", "unit")).toBe("25");
        expect(businessQuantityText("2.5", "hour")).toBe("2.5");
        expect(businessQuantityText("2.5.1", "kWh")).toBe("2.51");
        expect(businessQuantityText("abc12", "litre")).toBe("12");
    });

    test("the cost model counts an asset purchase as a one-time cost of Qty times the price, and a Per unit order cost per order", () => {
        const capability = asBusinessCapabilityValue({
            founders: [],
            resources: { equipment: [{ id: "computing", name: "", slots: [slot("laptops", { name: "Laptops", quantity: "3", cost: cost("1000", "one-time") })] }] },
            offering: { resources: [slot("parcel", { name: "Parcels", offeringIds: ["off"], cost: cost("4", "per-order") })] }
        });
        const sources: CostSources = {
            legalEntity: asLegalEntityValue(undefined),
            capability,
            resourceGroupLabels: {},
            subsectionLabels: {},
            currency: "EUR",
            foundersLinked: true
        };
        const lines = consolidateCosts({ ...asFinancialFoundationValue({}), planStart: { month: "01", year: "2027" } }, sources);
        const byId = Object.fromEntries(lines.map(line => [line.id, line]));
        expect(byId.laptops).toMatchObject({ frequency: "one-time", amount: 3000, quantity: 3, unitAmount: 1000, group: "establishment" });
        expect(byId.parcel).toMatchObject({ frequency: "per-order", amount: 4 });
    });

});

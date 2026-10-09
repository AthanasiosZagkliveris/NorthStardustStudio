import { describe, expect, test } from "vitest";
import { asBusinessCapabilityValue } from "../../framework/engine/AnswerUtils.ts";
import { DEFAULT_FLOOR_FILTER, FLOOR_PLACES, FloorFilter, FloorRow, filterFloor, floorCategories, floorRows, floorSubgroups, kindClass, placeOf, subgroupKey, sortFloor, tileLines, typeClass } from "./capabilityFloor.ts";

const slot = (fields: Record<string, unknown>) => ({
    id: "s", name: "", quantity: "", description: "", status: "", providerId: "", offeringIds: [],
    cost: { price: "", frequency: "", frequencyOther: "", unit: "", currency: "" }, category: "", group: "", ...fields
});

const capability = asBusinessCapabilityValue({
    formatVersion: 3,
    founders: [{ id: "f1", name: "Maya", roles: [] }],
    resources: {
        utilities: [{ id: "premises-utilities", name: "", slots: [slot({ id: "r1", name: "Mains power", status: "costs", cost: { price: "80", frequency: "monthly", frequencyOther: "", currency: "" } })] }],
        equipment: [{ id: "devices-tools", name: "", slots: [slot({ id: "r2", name: "Loom service", status: "partners-suppliers", providerId: "p1" })] }],
        hr: [{ id: "admin-team", name: "", slots: [slot({ id: "r3", name: "Warping mill", status: "activity", activityId: "a1" })] }]
    },
    activities: [{ id: "operational", name: "", activities: [{ id: "a1", name: "Investigate Warping mill", performerIds: [], completed: false }] }],
    professionals: [{ id: "p1", name: "Loom Co", description: "", responsibleId: "", cost: { price: "", frequency: "", frequencyOther: "", currency: "" }, offeringIds: [] }]
});

describe("the floor", () => {

    const rows = floorRows(capability);

    test("a row says where it belongs and what it is connected to", () => {
        const power = rows.find(row => row.id === "r1")!;
        expect(power.path).toEqual(["Infrastructure", "Utilities", "Premises Utilities"]);
        expect(power.amount).toBe(80);
        expect(power.frequency).toBe("monthly");
        expect(rows.find(row => row.id === "r3")!.links).toEqual([{ id: "a1", name: "Investigate Warping mill", type: "activity" }]);
        expect(rows.find(row => row.id === "r2")!.links).toEqual([{ id: "p1", name: "Loom Co", type: "partner" }]);
        expect(rows.find(row => row.id === "p1")!.links.map(link => link.id)).toEqual(["r2"]);
    });

    test("the Founders can be left out; a Workspace is a resource card, so it goes with the Resources", () => {
        const withSpace = floorRows(asBusinessCapabilityValue({
            formatVersion: 3,
            founders: [{ id: "f1", name: "Maya", roles: [] }],
            resources: { workspace: [{ id: "premises", name: "", slots: [slot({ id: "w1", name: "Studio", workspaceKind: "dedicated", status: "rent" })] }] }
        }));
        const space = withSpace.find(row => row.id === "w1")!;
        expect(space).toMatchObject({ kind: "resource", path: ["Infrastructure", "Workspace", "Premises"] });
        const ids = (filter: FloorFilter) => filterFloor(withSpace, filter).map(row => row.id);
        expect(ids({ ...DEFAULT_FLOOR_FILTER, kinds: new Set(["resource", "activity", "partner", "provider"]) })).toEqual(["w1"]);
        expect(ids({ ...DEFAULT_FLOOR_FILTER, kinds: new Set(["founder"]) })).toEqual(["f1"]);
        expect(ids({ ...DEFAULT_FLOOR_FILTER, kinds: new Set(["activity", "partner", "provider"]) })).toEqual([]);
    });

    test("a row's place and type: a channel-toned row is the Offering's 'channel' type, and there is no Channel place", () => {
        const base = rows.find(row => row.id === "r1")!;
        const make = (patch: Partial<FloorRow>): FloorRow => ({ ...base, ...patch });
        expect(FLOOR_PLACES.map(place => place.id)).toEqual(["legal", "infrastructure", "offering"]);
                expect(kindClass(make({ kind: "founder" }))).toBe("founder");
        const channelMade = make({ tone: "channel", kind: "resource", path: ["Offering's Capability", "Resources", "Providers"] });
        expect(placeOf(channelMade)).toBe("offering");
        expect(typeClass(channelMade)).toBe("channel");
        expect(placeOf(make({ tone: "infrastructure" }))).toBe("infrastructure");
        expect(typeClass(make({ tone: "offering", kind: "partner" }))).toBe("partner");
        expect(typeClass(make({ tone: "infrastructure", kind: "resource" }))).toBe("resource");
    });

    test("the categories of the channel type are those of the channel-made cards (and never the Founders)", () => {
        const base = rows.find(row => row.id === "r1")!;
        const made = (id: string, kind: FloorRow["kind"], category: string): FloorRow => ({ ...base, id, tone: "channel", kind, path: ["Offering's Capability", category] });
        const own: FloorRow = { ...base, id: "own", tone: "offering", kind: "partner", path: ["Offering's Capability", "Partners"] };
        const list = [own, made("m1", "resource", "Resources"), made("m2", "partner", "Providers")];
        expect(floorCategories(list, "offering", ["channel"]).sort()).toEqual(["Providers", "Resources"]);
        expect(floorCategories(list, "offering", ["partner"])).toEqual(["Partners"]);
        expect(floorCategories(rows, "infrastructure")).not.toContain("Founders");
        expect(floorCategories(rows, "infrastructure", ["founder"])).toEqual([]);
    });

    test("the counts of the types add up to the tiles of a place", () => {
        const all = rows;
        for (const place of ["infrastructure", "offering", "legal"] as const) {
            const inPlace = all.filter(row => placeOf(row) === place);
            const byType = new Map<string, number>();
            for (const row of inPlace) {
                byType.set(typeClass(row), (byType.get(typeClass(row)) ?? 0) + 1);
            }
            expect([...byType.values()].reduce((sum, count) => sum + count, 0)).toBe(inPlace.length);
        }
        expect(all.filter(row => placeOf(row) === "infrastructure").length).toBeGreaterThan(0);
    });

    test("filters by place, status, payment frequency and cost range", () => {
        const ids = (patch: object) => filterFloor(rows, { ...DEFAULT_FLOOR_FILTER, ...patch }).map(row => row.id);
        // Step 1 is one place, step 2 the groups the place has; changing the place starts step 2 again.
        expect(floorCategories(rows, "infrastructure")).toEqual(expect.arrayContaining(["Utilities", "Equipment"]));
        expect(ids({ place: "infrastructure", categories: ["Utilities"] })).toEqual(["r1"]);
        expect(ids({ place: "infrastructure", categories: ["Utilities", "Equipment", "Human Resources"] }).sort()).toEqual(["r1", "r2", "r3"]);
        expect(ids({ place: "offering" })).toEqual([]);
        // The Category step is not Resources-only: the categories of the kinds ticked (activities' and partners' too), all four kinds while none is.
        const partnerCategories = floorCategories(rows, "infrastructure", ["partner", "provider"]);
        expect(partnerCategories).not.toContain("Utilities");
        expect(floorCategories(rows, "infrastructure", ["activity"])).not.toContain("Utilities");
        expect(floorCategories(rows, "infrastructure", ["activity", "partner", "provider"]).length).toBeGreaterThan(0);
        expect(ids({ place: "infrastructure", placeKinds: ["partner"], categories: partnerCategories }).sort()).toEqual(["p1"]);
        // Step 4: the groups (subsections) of the ticked categories only.
        expect(floorSubgroups(rows, "infrastructure", ["Utilities"]).map(entry => entry.label)).toEqual(["Premises Utilities"]);
        expect(floorSubgroups(rows, "infrastructure", [])).toEqual([]);
        expect(ids({ place: "infrastructure", categories: ["Equipment"], subgroups: [subgroupKey("Equipment", "Devices & Tools")] })).toEqual(["r2"]);
        // A category with no group ticked stays whole beside one that is narrowed.
        expect(ids({ place: "infrastructure", categories: ["Equipment", "Utilities"], subgroups: [subgroupKey("Equipment", "Devices & Tools")] }).sort()).toEqual(["r1", "r2"]);
        expect(ids({ status: "activity" })).toEqual(["r3"]);
        expect(ids({ frequency: "monthly" })).toEqual(["r1"]);
        expect(ids({ min: "50", max: "100" })).toEqual(["r1"]);
        expect(ids({ min: "100" })).toEqual([]);
        expect(ids({ connectedOnly: true }).sort()).toEqual(["a1", "p1", "r2", "r3"]);
    });


    test("a tile lists where it belongs, then its status and cost, as plain lines (no labels, no arrows)", () => {
        const lines = tileLines(rows.find(row => row.id === "r1")!, amount => "£" + amount);
        expect(lines).toEqual(["Infrastructure", "Utilities", "Premises Utilities", "Costs", "£80 monthly"]);
        expect(lines.join("")).not.toMatch(/[>›→:]/);
    });

    test("a circle's links: an activity is seen from the card that chose it too, a Workspace card links its chosen activity and its supplier", () => {
        const loom = rows.find(row => row.id === "r2")!;
        expect(loom.links).toEqual([{ id: "p1", name: "Loom Co", type: "partner" }]);
        const space = asBusinessCapabilityValue({
            formatVersion: 3,
            resources: { workspace: [{ id: "premises", name: "", slots: [slot({ id: "workspace", name: "Dedicated", workspaceKind: "dedicated", status: "rent", providerId: "p1", activityId: "a9" })] }] },
            activities: [{ id: "operational", name: "", activities: [{ id: "a9", name: "Open the studio", performerIds: [], completed: false }] }],
            professionals: [{ id: "p1", category: "partners", name: "Loom Co", description: "", responsibleId: "", cost: { price: "", frequency: "", frequencyOther: "", currency: "" }, offeringIds: [] }]
        });
        const list = floorRows(space);
        const workspaceLinks = list.find(row => row.id === "workspace")!.links;
        expect(workspaceLinks.map(link => link.id).sort()).toEqual(["a9", "p1"]);
        expect(workspaceLinks.find(link => link.id === "a9")!.type).toBe("activity");
        expect(workspaceLinks.find(link => link.id === "p1")!.type).toBe("partner");
        const types = new Set(list.flatMap(row => row.links.map(link => link.type)));
        for (const type of types) {
            expect(["activity", "investigation", "partner", "provider", "resource"]).toContain(type);
        }
        // The partner sees what it provides, and the activity investigating a resource is seen from that resource.
        expect(list.find(row => row.id === "p1")!.links.map(link => link.id)).toContain("workspace");
    });

    test("an activity a partner performs is seen from the partner's side, and from the card that chose it", () => {
        const value = asBusinessCapabilityValue({
            formatVersion: 3,
            resources: { hr: [{ id: "admin-team", name: "", slots: [slot({ id: "r3", name: "Warping mill", status: "activity", activityId: "a1" })] }] },
            activities: [{ id: "operational", name: "", activities: [{ id: "a1", name: "Investigate Warping mill", performerIds: ["p1"], completed: false }] }],
            professionals: [{ id: "p1", category: "partners", name: "Loom Co", description: "", responsibleId: "", cost: { price: "", frequency: "", frequencyOther: "", currency: "" }, offeringIds: [] }]
        });
        const list = floorRows(value);
        expect(list.find(row => row.id === "p1")!.links).toEqual([{ id: "a1", name: "Investigate Warping mill", type: "activity" }]);
        expect(list.find(row => row.id === "a1")!.links.map(link => link.type).sort()).toEqual(["partner", "resource"]);
    });

    test("the Costs option isolates the tiles that have an expense (a price, or a Workspace deposit); the cost order and range then apply to them", () => {
        const base = rows.find(row => row.id === "r1")!;
        const make = (id: string, patch: Partial<FloorRow> = {}): FloorRow => ({ ...base, id, amount: null, frequency: "", deposit: null, missing: undefined, links: [], ...patch });
        const list = [make("a", { amount: 100, frequency: "one-time" }), make("w", { deposit: 300 }), make("n"), make("m", { amount: 20, frequency: "monthly" })];
        const ids = (patch: Partial<FloorFilter>) => filterFloor(list, { ...DEFAULT_FLOOR_FILTER, ...patch }).map(row => row.id);
        expect(ids({})).toEqual(["a", "w", "n", "m"]);
        expect(ids({ costsOnly: true })).toEqual(["a", "w", "m"]);
        expect(ids({ costsOnly: true, min: "50" })).toEqual(["a"]);
        expect(sortFloor(filterFloor(list, { ...DEFAULT_FLOOR_FILTER, costsOnly: true }), "cost-desc")[0].id).toBe("a");
    });

    test("can be sorted by name and by cost", () => {
        expect(sortFloor(rows, "cost-desc")[0].id).toBe("r1");
        expect(sortFloor(rows, "name-asc").map(row => row.name)[0]).toBe("Investigate Warping mill");
    });


    test("a cost reads as the Costs section counts it: times the quantity; a founder's pay and the Workspace's deposit are costs too", () => {
        const many = asBusinessCapabilityValue({
            formatVersion: 3,
            founders: [{ id: "f1", name: "Maya", roles: [], salary: "1800", period: "month" }],
            resources: { workspace: [{ id: "premises", name: "", slots: [slot({ id: "workspace", name: "Dedicated", workspaceKind: "dedicated", status: "buy", cost: { price: "1250", frequency: "monthly", frequencyOther: "", currency: "" }, deposit: "3750" })] }], equipment: [{ id: "devices-tools", name: "", slots: [slot({ id: "q1", name: "Looms", quantity: "3", status: "costs", cost: { price: "2400", frequency: "one-time", frequencyOther: "", currency: "" } })] }] }
        });
        const list = floorRows(many);
        expect(list.find(row => row.id === "q1")!.amount).toBe(7200);
        expect(list.find(row => row.id === "f1")).toMatchObject({ amount: 1800, frequency: "monthly" });
        expect(list.find(row => row.id === "workspace")).toMatchObject({ amount: 1250, deposit: 3750 });
        expect(tileLines(list.find(row => row.id === "workspace")!, amount => "£" + amount)).toEqual(["Infrastructure", "Workspace", "Premises", "Buy", "£1250 monthly", "£3750 deposit"]);
    });

});

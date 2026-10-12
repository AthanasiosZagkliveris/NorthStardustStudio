import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";

import BusinessCapabilityEditor from "./BusinessCapabilityEditor";
import { cardBoxes, floatingCardHost, infrastructureCard, openBox, openCard, openTile, tileButton } from "../../test/interviewTestUtils";
import { asBusinessCapabilityValue, createBusinessActivity, createBusinessResourceSlot, workspacesOf } from "../../framework/engine/AnswerUtils";
import { countedCapability, incompleteCards } from "../../framework/engine/CardCompleteness";

afterEach(cleanup);

const founder = (id: string, name: string) => ({ id, name, ownership: "50", capital: "", roles: [""], experience: "" });

// A card whose Status is Activity and the ordinary activity it chose (the card links to it by `activityId`; the activity knows nothing of the card).
const slot = { ...createBusinessResourceSlot(), id: "resource-mill", name: "Warping mill", status: "activity", activityId: "activity-mill" };
const child = { ...createBusinessActivity(), id: "activity-mill", name: "Set up the mill" };

function seeded(overrides: { child?: Partial<typeof child>; slot?: Partial<typeof slot> } = {}) {
    const base = asBusinessCapabilityValue(undefined);
    return {
        ...base,
        formatVersion: 3,
        resources: { hr: [{ id: "admin-team", name: "", slots: [{ ...slot, ...overrides.slot }] }] },
        activities: [{ id: "operational", name: "", activities: [{ ...child, ...overrides.child }] }]
    };
}

function Harness({ initial }: { initial: unknown }) {
    const [value, setValue] = useState<unknown>(initial);
    return (
        <BusinessCapabilityEditor
            value={value}
            onChange={setValue}
            legalEntityFounders={[founder("f1", "Ann"), founder("f2", "Bo")]}
        />
    );
}

type Capability = ReturnType<typeof asBusinessCapabilityValue>;

function Spy({ initial, spy }: { initial: unknown; spy: (value: Capability) => void }) {
    const [value, setValue] = useState<unknown>(initial);
    return <BusinessCapabilityEditor value={value} onChange={(next) => { spy(asBusinessCapabilityValue(next)); setValue(next); }} legalEntityFounders={[founder("f1", "Ann")]} />;
}

/**
 * The card tiles of a category's own view (the page tile's list now names only the categories); the view is left again with Escape.
 * (A category without a card opens a blank one floating over its view: that blank card is no card of the category and is left out.)
 */
function cardsIn(category: string) {
    openTile(category);
    const names = cardBoxes().filter(name => !/: Unnamed /.test(name ?? ""));
    fireEvent.keyDown(document, { key: "Escape" });
    return names;
}

/** Opens the Resource card of Human Resources > Admin Team. */
function openAdminCard() {
    fireEvent.click(tileButton("Resources", infrastructureCard()));
    openBox("Human Resources");
    openBox("Admin Team");
    openCard("Resource 1");
}

/** Opens the Workspace card, the first of Workspace > Premises. */
function openWorkspaceCard() {
    fireEvent.click(tileButton("Resources", infrastructureCard()));
    openBox("Workspace");
    openBox("Premises");
    openCard("Resource 1");
}

/** Changes the Status of the open Resource card. */
function chooseStatus(label: string) {
    fireEvent.click(screen.getByRole("button", { name: /^Resource 1 status/ }));
    fireEvent.click(screen.getByRole("option", { name: label }));
}

const activitiesOf = (value: Capability) => value.activities.flatMap(entry => entry.activities);
const linkOf = (name: string) => screen.getByRole("button", { name: "Open Activity “" + name + "”" });

describe("the pure rules of the card -> activity choice", () => {

    it("reads an old answer's derived activity (it named its card in sourceId) as the activity the card chooses: the same activity, now an ordinary one", () => {
        const read = asBusinessCapabilityValue({
            formatVersion: 3,
            resources: { hr: [{ id: "admin-team", name: "", slots: [{ ...slot, activityId: "" }] }] },
            activities: [{ id: "operational", name: "", activities: [{ ...child, name: "Set up Warping mill", sourceId: "resource-mill" }] }]
        });
        expect(read.resources.hr[0].slots[0].activityId).toBe("activity-mill");
        expect(activitiesOf(read).map(activity => activity.id)).toEqual(["activity-mill"]);
        expect("sourceId" in activitiesOf(read)[0]).toBe(false);
    });

    it("keeps the activity a card already chose, and leaves an activity of the user's own alone", () => {
        const own = { ...createBusinessActivity(), id: "own", name: "Mine" };
        const read = asBusinessCapabilityValue({ ...seeded(), activities: [{ id: "operational", name: "", activities: [child, own] }] });
        expect(read.resources.hr[0].slots[0].activityId).toBe("activity-mill");
        expect(activitiesOf(read).map(activity => activity.name)).toEqual(["Set up the mill", "Mine"]);
    });

    it("a card with the Status Activity and no activity chosen is incomplete: Activity is missing; choosing one completes it", () => {
        const missing = incompleteCards(asBusinessCapabilityValue(seeded({ slot: { activityId: "" } }))).get("resource-mill") ?? [];
        expect(missing).toContain("Activity");
        const chosen = incompleteCards(asBusinessCapabilityValue(seeded())).get("resource-mill") ?? [];
        expect(chosen).not.toContain("Activity");
    });

});

describe("the activity of a card in the editor", () => {

    it("is an ordinary activity card: the common head, a number, a name box and a remove x, and no message about a card it follows", () => {
        render(<Harness initial={seeded()} />);
        openTile("Operational", undefined, "Set up the mill");
        const card = floatingCardHost()!;
        expect(within(card).getByRole("textbox", { name: /Activity 1 name/ })).toBeTruthy();
        expect(within(card).getByRole("button", { name: /^Remove Activity/ })).toBeTruthy();
        expect(card.querySelector(".list-number")!.textContent).toBe("1.");
        expect(card.querySelector(".business-capability-child-head")).toBeNull();
        expect(card.querySelector("button.business-capability-child-name")).toBeNull();
        expect(card.textContent).not.toMatch(/Follows “/);
    });

    it("keeps its own name when the card is renamed: the activity does not follow the card", () => {
        render(<Harness initial={seeded()} />);
        openAdminCard();
        fireEvent.change(screen.getByRole("textbox", { name: "Resource 1 name" }), { target: { value: "Spinning wheel" } });
        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(cardsIn("Operational")).toEqual(["Activity 1: Set up the mill"]);
    });

    it("stays when the card's Status changes", () => {
        let latest: Capability | null = null;
        render(<Spy initial={seeded()} spy={value => { latest = value; }} />);
        openAdminCard();
        chooseStatus("Partners & Suppliers");
        expect(latest!.resources.hr[0].slots[0].status).toBe("partners-suppliers");
        expect(activitiesOf(latest!).map(activity => activity.id)).toEqual(["activity-mill"]);
        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(cardsIn("Operational")).toEqual(["Activity 1: Set up the mill"]);
    });

    it("stays when the card is deleted", () => {
        render(<Harness initial={seeded()} />);
        openAdminCard();
        fireEvent.click(screen.getByRole("button", { name: "Remove Resource 1" }));
        // (The card is gone: its floating card closed by itself and the view it came from is back, without the card.)
        expect(floatingCardHost()).toBeNull();
        expect(cardBoxes()).toEqual([]);
        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(cardsIn("Operational")).toEqual(["Activity 1: Set up the mill"]);
    });

});

describe("the Activity row under the card's Status", () => {

    it("is one row, Activity, with the chosen activity and a link symbol beside it; there is no Open Activity line, no alarm", () => {
        render(<Harness initial={seeded({ child: { description: "Compare buying new with sharing" } })} />);
        openAdminCard();
        const card = floatingCardHost()!;
        expect(within(card).getByRole("button", { name: "Resource 1 activity: Set up the mill" })).toBeTruthy();
        expect(within(card).getAllByRole("button", { name: "Open Activity “Set up the mill”" })).toHaveLength(1);
        expect(card.querySelector(".business-capability-alarm")).toBeNull();
        expect(card.querySelector(".business-capability-activity-line")).toBeNull();
        expect(card.textContent).not.toMatch(/Open Activity “Set up the mill”/);
    });

    it("lists the activities of the place that have not ended at the card's Start date, each as Name (Category), then + Add", () => {
        const base = seeded();
        const ended = { ...createBusinessActivity("operational"), id: "activity-old", name: "Close the stall", endDate: "2020-01-31" };
        const open = { ...createBusinessActivity("operational"), id: "activity-shop", name: "Open the shop" };
        render(<Harness initial={{ ...base, resources: { hr: [{ id: "admin-team", name: "", slots: [{ ...slot, startDate: "2021-05-01" }] }] }, activities: [{ id: "operational", name: "", activities: [child, ended, open] }] }} />);
        openAdminCard();
        fireEvent.click(screen.getByRole("button", { name: /^Resource 1 activity: / }));
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Set up the mill", "Open the shop", "+ Add"]);
    });

    it("makes a new ordinary activity with + Add: filed in Operational, starting with the card, chosen and named in a box; nothing else changes", () => {
        let latest: Capability | null = null;
        render(<Spy initial={seeded({ slot: { activityId: "", startDate: "2021-05-01" } })} spy={value => { latest = value; }} />);
        openAdminCard();
        fireEvent.click(screen.getByRole("button", { name: /^Resource 1 activity: / }));
        fireEvent.click(screen.getByRole("option", { name: "+ Add" }));
        const made = activitiesOf(latest!).find(activity => activity.id !== "activity-mill")!;
        expect(made).toMatchObject({ category: "operational", startDate: "2021-05-01", name: "" });
        expect(latest!.resources.hr[0].slots[0].activityId).toBe(made.id);
        fireEvent.change(screen.getByRole("textbox", { name: "Name the activity" }), { target: { value: "Weigh the yarn" } });
        expect(activitiesOf(latest!).find(activity => activity.id === made.id)!.name).toBe("Weigh the yarn");
        expect(linkOf("Weigh the yarn")).toBeTruthy();
    });

    it("choosing Activity as the Status creates nothing: only the Activity row appears, to choose from", () => {
        let latest: Capability | null = null;
        render(<Spy initial={seeded({ slot: { status: "costs", activityId: "" } })} spy={value => { latest = value; }} />);
        openAdminCard();
        chooseStatus("Needs Activity");
        expect(activitiesOf(latest!).map(activity => activity.id)).toEqual(["activity-mill"]);
        expect(latest!.resources.hr[0].slots[0]).toMatchObject({ status: "activity", activityId: "" });
        expect(screen.getByRole("button", { name: "Resource 1 activity: Select" })).toBeTruthy();
    });

    it("a further status row of Activity shows the same Activity row", () => {
        render(<Harness initial={seeded({ slot: { status: "costs", activityId: "" } })} />);
        openAdminCard();
        fireEvent.click(screen.getByRole("button", { name: "Add Status to Resource 1" }));
        fireEvent.click(screen.getByRole("button", { name: /^Resource 1 status 2/ }));
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(expect.arrayContaining(["Partners & Suppliers", "Needs Activity"]));
        fireEvent.click(screen.getByRole("option", { name: "Needs Activity" }));
        expect(screen.getByRole("button", { name: "Resource 1 status 2 activity: Select" })).toBeTruthy();
    });

    it("opens the card above its activity, stacked, each with its own box name; Back closes both", () => {
        render(<Harness initial={seeded()} />);
        openAdminCard();
        fireEvent.click(linkOf("Set up the mill"));
        // The pair stands over the card and the view under it: nothing was closed to open it.
        expect(document.querySelectorAll(".floating-card-host").length).toBe(2);
        expect(document.querySelector(".section-tile-dialog")).not.toBeNull();
        const stack = floatingCardHost()!;
        expect(stack.getAttribute("data-pair")).toBe("resource-mill");
        const items = [...stack.querySelectorAll(".floating-card-item")];
        expect(items).toHaveLength(2);
        expect(items.map(item => item.querySelector(".floating-card-caption")!.textContent!.replace(/i$/, ""))).toEqual(["Human Resources", "Operational"]);
        // The card first (above), the activity after it.
        expect(items[0].querySelector("textarea")!.getAttribute("aria-label")).toBe("Resource 1 name");
        expect(items[1].querySelector("textarea")!.getAttribute("aria-label")).toBe("Activity 1 name");
        // Back takes the pair away and returns to what was under it: the card itself; Escape then closes everything.
        fireEvent.mouseDown(document.body);
        expect(document.querySelector("[data-pair]")).toBeNull();
        expect(floatingCardHost()!.querySelector("textarea")!.getAttribute("aria-label")).toBe("Resource 1 name");
        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("closes the whole pair with Escape", () => {
        render(<Harness initial={seeded()} />);
        openAdminCard();
        fireEvent.click(linkOf("Set up the mill"));
        expect(floatingCardHost()!.getAttribute("data-pair")).toBe("resource-mill");
        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("the activity opened in the pair is edited in place: renaming it renames the choice shown on the card", () => {
        render(<Harness initial={seeded()} />);
        openAdminCard();
        fireEvent.click(linkOf("Set up the mill"));
        fireEvent.change(screen.getByRole("textbox", { name: "Activity 1 name" }), { target: { value: "Fit the loom" } });
        // (The card stands twice under the pair -- on its own and as the pair's upper half -- so every one of them shows the new name.)
        expect(screen.getAllByRole("button", { name: "Resource 1 activity: Fit the loom" }).length).toBeGreaterThan(0);
        expect(screen.getAllByRole("button", { name: "Open Activity “Fit the loom”" }).length).toBeGreaterThan(0);
    });

});

describe("a card's number is its place in the view it is listed in", () => {

    it("numbers an Offering activity within its category, so the tile and the opened card agree", () => {
        const base = asBusinessCapabilityValue(undefined);
        const make = (name: string, category: string) => ({ ...createBusinessActivity(category), name });
        render(<Harness initial={{ ...base, offering: { ...base.offering, activities: [make("A", "marketing"), make("B", "marketing"), make("C", "production"), make("D", "production")] } }} />);
        openTile("Activities", "Production", "D");
        const host = floatingCardHost()!;
        expect(host.querySelector(".list-number")!.textContent).toBe("2.");
    });

});

describe("several Workspaces", () => {

    it("adds a Workspace card with the + of the Workspace category tile; left blank it is taken away, filled it stays and is one more category card", () => {
        let latest: Capability | null = null;
        render(<Spy initial={seeded()} spy={value => { latest = value; }} />);
        fireEvent.click(tileButton("Resources", infrastructureCard()));
        fireEvent.click(screen.getByRole("button", { name: "Add Resource to Workspace" }));
        // The card is an ordinary Resource card; there is no standalone form.
        expect(floatingCardHost()!.querySelector(".workspace-form")).toBeNull();
        expect(within(floatingCardHost()!).getByLabelText(/Resource 1 status: /)).toBeTruthy();
        expect(workspacesOf(latest!)).toHaveLength(1);
        // Left blank, it is taken away again (the view it came from is back).
        fireEvent.mouseDown(document.body);
        expect(workspacesOf(latest!)).toHaveLength(0);
        expect(floatingCardHost()).toBeNull();
        expect(document.querySelector(".section-tile-dialog")).not.toBeNull();
        fireEvent.click(screen.getByRole("button", { name: "Add Resource to Workspace" }));
        expect(workspacesOf(latest!)).toHaveLength(1);
        // Filled: the card stays.
        fireEvent.click(within(floatingCardHost()!).getByLabelText(/Resource 1 status: /));
        fireEvent.click(screen.getAllByRole("option")[0]);
        expect(workspacesOf(latest!)[0].status).not.toBe("");
        fireEvent.mouseDown(document.body);
        expect(workspacesOf(latest!)).toHaveLength(1);
    });

});

describe("the Workspace as a Category of a resource", () => {

    it("lists Workspace first among the Categories; choosing it turns the card into a Workspace card that keeps its id, cost and links", () => {
        let latest: Capability | null = null;
        const costly = seeded({ slot: { status: "investigation", cost: { price: "250", frequency: "monthly", frequencyOther: "", currency: "", unit: "" } } });
        render(<Spy initial={costly} spy={value => { latest = value; }} />);
        openAdminCard();
        fireEvent.click(screen.getByLabelText(/Resource Warping mill category: /));
        expect(screen.getAllByRole("option").map(option => option.textContent)[0]).toBe("Workspace");
        fireEvent.click(screen.getByRole("option", { name: "Workspace" }));
        expect(latest!.resources.hr.flatMap(entry => entry.slots)).toEqual([]);
        const made = workspacesOf(latest!).find(entry => entry.id === "resource-mill")!;
        // (Needs Investigation is no Workspace status: the card enters the Workspace with its Status to be chosen.)
        expect(made.status).toBe("");
        expect(made.cost.price).toBe("250");
        expect(made.name).toBe("Warping mill");
        // The activity the card had chosen is an ordinary one and stays, whatever the card does.
        expect(latest!.activities.flatMap(entry => entry.activities).map(activity => activity.id)).toEqual(["activity-mill"]);
    });

    it("maps Partners & Suppliers to Rent on the way into the Workspace, and back on the way out; the id and the cost stay", () => {
        let latest: Capability | null = null;
        const provided = seeded({ slot: { status: "partners-suppliers", providerId: "p1", cost: { price: "90", frequency: "monthly", frequencyOther: "", currency: "", unit: "" } } });
        render(<Spy initial={{ ...provided, activities: [] }} spy={value => { latest = value; }} />);
        openAdminCard();
        fireEvent.click(screen.getByLabelText(/Resource Warping mill category: /));
        fireEvent.click(screen.getByRole("option", { name: "Workspace" }));
        expect(workspacesOf(latest!)[0]).toMatchObject({ id: "resource-mill", status: "rent", providerId: "p1" });
        expect(workspacesOf(latest!)[0].cost.price).toBe("90");
        // The card is open still: choose Utilities again.
        fireEvent.click(screen.getByLabelText(/Resource Warping mill category: /));
        fireEvent.click(screen.getByRole("option", { name: "Utilities" }));
        expect(workspacesOf(latest!)).toEqual([]);
        const back = Object.values(latest!.resources).flatMap(list => list.flatMap(entry => entry.slots)).find(entry => entry.id === "resource-mill")!;
        expect(back.status).toBe("partners-suppliers");
        expect(back.cost.price).toBe("90");
    });

});

describe("the Workspace fields live in the merged Resource card", () => {

    const withWorkspace = (patch: Record<string, unknown> = {}) => {
        const base = asBusinessCapabilityValue(undefined);
        return {
            ...base,
            formatVersion: 3,
            resources: { workspace: [{ id: "premises", name: "", slots: [{ ...createBusinessResourceSlot(), id: "workspace", name: "Dedicated Workspace", workspaceKind: "dedicated", status: "buy", deposit: "500", ...patch }] }] }
        };
    };

    it("shows the Workspace fields in the normal resource card, with its Category cell, and no standalone form", () => {
        render(<Harness initial={withWorkspace()} />);
        openWorkspaceCard();
        const card = floatingCardHost()!;
        expect(card.querySelector(".workspace-form")).toBeNull();
        expect(card.querySelector(".workspace-card")).toBeNull();
        expect(within(card).getByLabelText(/Resource Dedicated Workspace category: /)).toBeTruthy();
        expect(within(card).getByLabelText(/Resource 1 status: /)).toBeTruthy();
        expect(within(card).getByLabelText("Workspace deposit")).toBeTruthy();
    });

    it("has no kind list any more: the old Workspace dropdown and its Other name are gone, whatever kind an old answer held", () => {
        render(<Harness initial={withWorkspace({ workspaceKind: "other", workspaceKindOther: "Barn" })} />);
        openWorkspaceCard();
        const card = floatingCardHost()!;
        expect(within(card).queryByRole("button", { name: /^Workspace: / })).toBeNull();
        expect(within(card).queryByRole("textbox", { name: "Name the workspace" })).toBeNull();
    });

    it("deletes a Workspace card with its x, the first one too", () => {
        let latest: Capability | null = null;
        render(<Spy initial={withWorkspace()} spy={value => { latest = value; }} />);
        openWorkspaceCard();
        fireEvent.click(screen.getByRole("button", { name: "Remove Resource 1" }));
        expect(workspacesOf(latest!)).toEqual([]);
        expect(floatingCardHost()).toBeNull();
    });

});

describe("an old Workspace answer is read into Workspace cards", () => {

    const empty = { price: "", frequency: "", frequencyOther: "", currency: "" };

    it("turns a single old workspace into a card of the Workspace category: its id kept, its name the type's label, nothing lost", () => {
        const value = asBusinessCapabilityValue({
            workspace: { kind: "dedicated", status: "costs", cost: { price: "1250", frequency: "monthly", frequencyOther: "", currency: "" }, providerId: "", deposit: "3750" }
        });
        expect(workspacesOf(value)).toHaveLength(1);
        expect(workspacesOf(value)[0]).toMatchObject({ id: "workspace", name: "Dedicated Workspace", kind: "dedicated", status: "buy", deposit: "3750" });
        expect(workspacesOf(value)[0].cost.price).toBe("1250");
        expect("workspaces" in value).toBe(false);
    });

    it("turns several old workspaces into several cards, keeping their ids; an Other one is named by what was written; an untouched one makes no card", () => {
        const value = asBusinessCapabilityValue({
            workspaces: [
                { id: "workspace", kind: "dedicated", status: "provided", cost: empty, providerId: "p1", deposit: "" },
                { id: "workspace-2", kind: "other", kindOther: "Barn", status: "costs", cost: { ...empty, price: "40", frequency: "monthly" }, providerId: "", deposit: "" },
                { id: "workspace-3", kind: "", status: "", cost: empty, providerId: "", deposit: "" }
            ]
        });
        const list = workspacesOf(value);
        expect(list.map(entry => entry.id)).toEqual(["workspace", "workspace-2"]);
        expect(list.map(entry => entry.name)).toEqual(["Dedicated Workspace", "Barn"]);
        expect(list[0]).toMatchObject({ status: "rent", providerId: "p1" });
        expect(list[1].cost.price).toBe("40");
    });

    it("an answer with no workspace has no Workspace card", () => {
        expect(workspacesOf(asBusinessCapabilityValue(undefined))).toEqual([]);
    });

});

describe("a new Resource card is filed with no Category", () => {

    it("is incomplete: Missing Category, then Group once a Category is chosen; the counted answer leaves it out", () => {
        const base = asBusinessCapabilityValue(undefined);
        const fresh = { ...createBusinessResourceSlot(), id: "fresh", name: "Kettle", status: "costs", cost: { price: "10", frequency: "monthly", frequencyOther: "", currency: "", unit: "" } };
        const unassigned = { ...base, resources: { unassigned: [{ id: "unassigned", name: "", slots: [fresh] }] } };
        expect(incompleteCards(unassigned).get("fresh")).toContain("Category");
        const noGroup = { ...base, resources: { utilities: [{ id: "unassigned", name: "", slots: [fresh] }] } };
        const missing = incompleteCards(noGroup).get("fresh") ?? [];
        expect(missing).toContain("Group");
        expect(missing).not.toContain("Category");
        const placed = { ...base, resources: { utilities: [{ id: "premises-utilities", name: "", slots: [fresh] }] } };
        expect(incompleteCards(placed).get("fresh") ?? []).not.toContain("Group");
        expect(Object.values(countedCapability(unassigned).resources).flatMap(list => list.flatMap(entry => entry.slots))).toEqual([]);
    });

    it("is what the Resources section's Add Card makes: its Category cell reads Select and the card says what is missing", () => {
        render(<Harness initial={seeded()} />);
        fireEvent.click(tileButton("Resources", infrastructureCard()));
        fireEvent.click(screen.getByRole("button", { name: "Add Card" }));
        const card = floatingCardHost()!;
        expect(within(card).getByLabelText(/category: /).textContent).toContain("Select");
    });

});

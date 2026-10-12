import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessCapabilityEditor from "./BusinessCapabilityEditor";
import { openCard, openTile } from "../../test/interviewTestUtils";
import { incompleteCards } from "../../framework/engine/CardCompleteness";
import { asBusinessCapabilityValue, createBusinessActivity, createBusinessResourceSlot } from "../../framework/engine/AnswerUtils";

/* G5: the status Activity chooses an activity (the derived "Set up" / "Investigate" activities are gone). */

afterEach(cleanup);

type Value = ReturnType<typeof asBusinessCapabilityValue>;

function Harness({ initial, onValue }: { initial: unknown; onValue?: (value: Value) => void }) {
    const [value, setValue] = useState<unknown>(initial);
    return <BusinessCapabilityEditor value={value} onChange={(next) => { setValue(next); onValue?.(next as Value); }} legalEntityFounders={[{ id: "f1", name: "Ann", ownership: "100", capital: "", roles: [""], experience: "" }]} />;
}

const base = () => asBusinessCapabilityValue(undefined);
const activity = (id: string, name: string, fields: Record<string, unknown> = {}) => ({ ...createBusinessActivity(), id, name, category: "operational", ...fields });
const oven = (fields: Record<string, unknown> = {}) => ({ ...createBusinessResourceSlot(), id: "oven", name: "Oven", status: "activity", startDate: "2027-01-01", ...fields });

function setup(activities: ReturnType<typeof activity>[], slot = oven()) {
    let latest: Value | undefined;
    const value = base();
    render(<Harness
        initial={{
            ...value,
            resources: { equipment: [{ id: "devices-tools", name: "", slots: [slot] }] },
            activities: [{ id: "operational", name: "", activities }]
        }}
        onValue={(next) => { latest = next; }}
    />);
    openTile("Equipment");
    openCard("Oven");
    return () => latest!;
}

describe("the Activity status", () => {

    it("lists the activities of the place with their category, then + Add", () => {
        setup([activity("a1", "Install the oven"), activity("a2", "Train the staff")]);
        fireEvent.click(screen.getByLabelText(/Resource 1 activity: /));
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Install the oven", "Train the staff", "+ Add"]);
    });

    it("does not offer an activity that ended before the card starts (the chosen one stays)", () => {
        setup(
            [activity("a1", "Install the oven", { endDate: "2027-01-31" }), activity("a2", "Train the staff", { endDate: "2027-12-31" }), activity("a3", "Open the shop")],
            oven({ startDate: "2027-03-01" })
        );
        fireEvent.click(screen.getByLabelText(/Resource 1 activity: /));
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Train the staff", "Open the shop", "+ Add"]);
    });

    it("with no activity the list holds only + Add", () => {
        setup([]);
        fireEvent.click(screen.getByLabelText(/Resource 1 activity: /));
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["+ Add"]);
    });

    it("choosing one stores it on the card; the link symbol beside the name opens it; nothing is made", () => {
        const latest = setup([activity("a1", "Install the oven")]);
        fireEvent.click(screen.getByLabelText(/Resource 1 activity: /));
        fireEvent.click(screen.getByRole("option", { name: "Install the oven" }));
        expect(latest().resources.equipment[0].slots[0].activityId).toBe("a1");
        expect(latest().activities.flatMap(category => category.activities)).toHaveLength(1);
        const symbol = screen.getByRole("button", { name: "Open Activity “Install the oven”" });
        expect(symbol.textContent).toBe("🔗");
        fireEvent.click(symbol);
        expect(document.querySelector("[data-pair]")).toBeTruthy();
    });

    it("+ Add makes an ordinary activity (the only founder's, starting with the card), chooses it and asks its name", () => {
        const latest = setup([], oven({ startDate: "2027-03-01" }));
        fireEvent.click(screen.getByLabelText(/Resource 1 activity: /));
        fireEvent.click(screen.getByRole("option", { name: "+ Add" }));
        const made = latest().activities.flatMap(category => category.activities)[0];
        expect(made).toMatchObject({ category: "operational", startDate: "2027-03-01", performerIds: ["f1"], responsibleId: "f1" });
        expect(latest().resources.equipment[0].slots[0].activityId).toBe(made.id);
        fireEvent.change(screen.getByRole("textbox", { name: "Name the activity" }), { target: { value: "Fit the oven" } });
        expect(latest().activities.flatMap(category => category.activities)[0].name).toBe("Fit the oven");
    });

    it("changing the status makes nothing and takes nothing away", () => {
        const latest = setup([activity("a1", "Install the oven")], oven({ activityId: "a1" }));
        fireEvent.click(screen.getByLabelText(/Resource 1 status: /));
        fireEvent.click(screen.getByRole("option", { name: "Exists / Free" }));
        expect(latest().activities.flatMap(category => category.activities).map(entry => entry.id)).toEqual(["a1"]);
        expect(latest().resources.equipment[0].slots[0].activityId).toBe("a1");
    });

    it("a card at Activity with no activity chosen is incomplete", () => {
        const value = asBusinessCapabilityValue({
            ...base(),
            resources: { equipment: [{ id: "devices-tools", name: "", slots: [oven({ id: "a" }), oven({ id: "b", activityId: "a1" })] }] },
            activities: [{ id: "operational", name: "", activities: [activity("a1", "Install the oven", { performerIds: ["f1"] })] }]
        });
        const missing = incompleteCards(value);
        expect(missing.get("a")).toEqual(["Activity"]);
        expect(missing.has("b")).toBe(false);
    });

});

describe("an older answer's derived activities", () => {

    it("the activity a card's status made is the one the card chooses now, and an ordinary activity", () => {
        const value = asBusinessCapabilityValue({
            resources: { equipment: [{ id: "computing", name: "", slots: [{ id: "m", name: "Mill", status: "activity" }, { id: "n", name: "Kiln", status: "investigation" }] }] },
            activities: [{ id: "operational", name: "", activities: [{ id: "a1", name: "Set up Mill", sourceId: "m" }, { id: "a2", name: "Investigate Kiln", sourceId: "n" }] }]
        });
        const [mill, kiln] = value.resources.equipment[0].slots;
        expect(mill).toMatchObject({ status: "activity", activityId: "a1" });
        // (Needs Investigation outside the people cards was cleared; its activity stays, ordinary.)
        expect(kiln).toMatchObject({ status: "", activityId: "" });
        expect(value.activities.flatMap(category => category.activities).map(entry => entry.name)).toEqual(["Set up Mill", "Investigate Kiln"]);
        expect(value.activities[0].activities[0]).not.toHaveProperty("sourceId");
        expect(asBusinessCapabilityValue(value)).toEqual(value);
    });

});

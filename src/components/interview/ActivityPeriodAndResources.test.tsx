import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessCapabilityEditor from "./editors/BusinessCapabilityEditor";
import { openTile, topDialog } from "../../test/interviewTestUtils";
import { incompleteCards } from "../../framework/engine/CardCompleteness";
import {
    activityDateIssues,
    activityPeriod,
    asBusinessCapabilityValue,
    createBusinessActivity,
    createBusinessPartner,
    createBusinessResourceSlot,
    resourcesStartingTooLate
} from "../../framework/engine/AnswerUtils";

/* H1: an activity's period, its Start date and Type, the resources it uses, and how many people a performer is. */

afterEach(cleanup);

type Value = ReturnType<typeof asBusinessCapabilityValue>;

function Harness({ initial, onValue }: { initial: unknown; onValue?: (value: Value) => void }) {
    const [value, setValue] = useState<unknown>(initial);
    return <BusinessCapabilityEditor value={value} onChange={(next) => { setValue(next); onValue?.(next as Value); }} legalEntityFounders={[{ id: "f1", name: "Ann", ownership: "100", capital: "", roles: [""], experience: "" }]} />;
}

const base = () => asBusinessCapabilityValue(undefined);
const activity = (fields: Record<string, unknown> = {}) => ({ ...createBusinessActivity(), id: "a1", name: "Weave", category: "operational", startDate: "2027-03-01", performerIds: ["f1"], ...fields });

describe("the period of an activity", () => {

    it("Pre-Operational runs from Plan Start to the day before the Opening Date; Operational and Sales from the Opening Date; Production and Marketing from Plan Start", () => {
        expect(activityPeriod("pre-operational", "2027-01-01", "2027-06-01")).toEqual({ from: "2027-01-01", to: "2027-05-31" });
        expect(activityPeriod("operational", "2027-01-01", "2027-06-01")).toEqual({ from: "2027-06-01", to: "" });
        expect(activityPeriod("sales", "2027-01-01", "2027-06-01")).toEqual({ from: "2027-06-01", to: "" });
        expect(activityPeriod("production", "2027-01-01", "2027-06-01")).toEqual({ from: "2027-01-01", to: "" });
        expect(activityPeriod("marketing", "2027-01-01", "2027-06-01")).toEqual({ from: "2027-01-01", to: "" });
        expect(activityPeriod("pre-operational", "2027-01-01", "")).toEqual({ from: "2027-01-01", to: "" });
    });

    it("says a start before the period, an end past it, and an end before the start", () => {
        const period = { from: "2027-01-01", to: "2027-05-31" };
        expect(activityDateIssues({ startDate: "2027-02-01", endDate: "2027-03-01" }, period)).toEqual([]);
        expect(activityDateIssues({ startDate: "2026-12-01", endDate: "" }, period)).toEqual(["The Start date is before the period begins."]);
        expect(activityDateIssues({ startDate: "2027-04-01", endDate: "2027-07-01" }, period)).toEqual(["The dates run past the end of the period."]);
        expect(activityDateIssues({ startDate: "2027-04-01", endDate: "2027-03-01" }, period)).toEqual(["The End date is before the Start date."]);
    });

    it("a linked resource that starts after the activity ends is found (the activity without an end counts as one day)", () => {
        const linked = [{ id: "r1", units: "" }, { id: "r2", units: "" }];
        expect(resourcesStartingTooLate({ startDate: "2027-03-01", endDate: "2027-03-31" }, { r1: "2027-03-15", r2: "2027-04-02" }, linked)).toEqual(["r2"]);
        expect(resourcesStartingTooLate({ startDate: "2027-03-01", endDate: "" }, { r1: "2027-03-01", r2: "2027-03-02" }, linked)).toEqual(["r2"]);
    });

});

describe("what an activity needs to be complete", () => {

    it("a Start date (a Pre-Operational activity has no Type to give)", () => {
        const value = asBusinessCapabilityValue({
            founders: [{ id: "f1", name: "Ann", ownership: "100", capital: "", roles: [""], experience: "" }],
            activities: [
                { id: "operational", name: "", activities: [{ ...activity({ id: "a1", startDate: "" }) }, { ...activity({ id: "a2" }) }] },
                { id: "pre-operational", name: "", activities: [{ ...activity({ id: "a3", category: "pre-operational" }) }, { ...activity({ id: "a4", category: "pre-operational", type: "capex" }) }] }
            ]
        });
        const missing = incompleteCards(value);
        expect(missing.get("a1")).toEqual(["Start date"]);
        expect(missing.has("a2")).toBe(false);
        expect(missing.has("a3")).toBe(false);
        expect(missing.has("a4")).toBe(false);
    });

});

describe("the Activity card", () => {

    function open(extra: Record<string, unknown> = {}, resources: ReturnType<typeof createBusinessResourceSlot>[] = []) {
        let latest: Value | undefined;
        render(<Harness
            initial={{
                ...base(),
                resources: resources.length > 0 ? { equipment: [{ id: "devices-tools", name: "", slots: resources }] } : {},
                activities: [{ id: "operational", name: "", activities: [activity(extra)] }]
            }}
            onValue={(next) => { latest = next; }}
        />);
        openTile("Operational", undefined, "Weave");
        return { card: topDialog().querySelector(".business-capability-activity") as HTMLElement, latest: () => latest! };
    }

    const kiln = (fields: Record<string, unknown> = {}) => ({ ...createBusinessResourceSlot(), id: "kiln", name: "Kiln", status: "exists", category: "equipment", group: "devices-tools", ...fields });

    it("a performer card that holds several people gets a number box, never more than the card holds; one that holds one gets none", () => {
        let latest: Value | undefined;
        render(<Harness
            initial={{
                ...base(),
                providers: [{ ...createBusinessPartner("Crew", "suppliers"), id: "crew", name: "Crew", quantity: "4" }],
                activities: [{ id: "operational", name: "", activities: [activity({ performerIds: ["crew"] })] }]
            }}
            onValue={(next) => { latest = next; }}
        />);
        openTile("Operational", undefined, "Weave");
        fireEvent.change(screen.getByLabelText("Activity 1 performer 1 people"), { target: { value: "9x" } });
        expect(latest!.activities[0].activities[0].performerPeople).toEqual({ crew: "4" });
    });

    it("a founder is one person: no number box", () => {
        open();
        expect(screen.queryByLabelText("Activity 1 performer 1 people")).toBeNull();
    });

    it("the Resources tick opens a dropdown row per resource, with its link symbol and a + for another", () => {
        const { latest } = open({}, [kiln()]);
        fireEvent.click(screen.getByRole("checkbox", { name: /Resources/ }));
        fireEvent.click(screen.getByLabelText(/Activity 1 resource 1: /));
        fireEvent.click(screen.getByRole("option", { name: "Kiln" }));
        expect(latest().activities[0].activities[0].resources).toEqual([{ id: "kiln", units: "" }]);
        expect(screen.getByRole("button", { name: /Open Resource “Kiln”/ })).toBeTruthy();
    });

    it("says a resource that begins after the activity ends", () => {
        open({ endDate: "2027-03-31", resources: [{ id: "kiln", units: "" }] }, [kiln({ startDate: "2027-05-01" })]);
        expect(screen.getByText("Kiln begins after this activity ends.")).toBeTruthy();
    });

    it("a Per unit resource takes the units the activity uses, and the Cost is the price times them", () => {
        open({ resources: [{ id: "kiln", units: "3" }] }, [kiln({ status: "costs", quantity: "5", cost: { price: "10", frequency: "per-unit", frequencyOther: "", unit: "hour", currency: "" } })]);
        expect((screen.getByLabelText("Activity 1 units of Kiln") as HTMLInputElement).value).toBe("3");
        expect(document.querySelector(".business-capability-cost-line")?.textContent).toMatch(/Kiln.*30/);
        // (Never more units than the resource holds.)
        fireEvent.change(screen.getByLabelText("Activity 1 units of Kiln"), { target: { value: "99" } });
        expect((screen.getByLabelText("Activity 1 units of Kiln") as HTMLInputElement).value).toBe("5");
    });

    it("a Pre-Operational activity has no Type field", () => {
        const base0 = base();
        render(<Harness
            initial={{ ...base0, activities: [{ id: "pre-operational", name: "", activities: [activity({ category: "pre-operational" })] }] }}
        />);
        openTile("Pre-Operational", undefined, "Weave");
        expect(screen.queryByLabelText(/Activity 1 type: /)).toBeNull();
    });

});

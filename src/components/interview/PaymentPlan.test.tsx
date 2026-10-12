import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessCapabilityEditor from "./BusinessCapabilityEditor";
import { openCard, openTile } from "../../test/interviewTestUtils";
import { incompleteCards } from "../../framework/engine/CardCompleteness";
import {
    asBusinessCapabilityValue,
    createBusinessResourceSlot,
    equalPercents,
    instalmentLines,
    paymentPlanIncomplete,
    paymentPlanLines,
    paymentPlanTotal
} from "../../framework/engine/AnswerUtils";

/* G8: the payment plan of a Per project price: Deposit & Balance, Instalments or Milestones, and the 100% check. */

afterEach(cleanup);

type Value = ReturnType<typeof asBusinessCapabilityValue>;

function Harness({ initial, onValue }: { initial: unknown; onValue?: (value: Value) => void }) {
    const [value, setValue] = useState<unknown>(initial);
    return <BusinessCapabilityEditor value={value} onChange={(next) => { setValue(next); onValue?.(next as Value); }} />;
}

const line = (percent: string, date = "", title = "") => ({ id: "l" + percent + date + title, title, percent, date });
const plan = (type: string, lines: ReturnType<typeof line>[], on = true) => ({ on, type, count: "", lines });
const perProject = { price: "1200", frequency: "per-project", frequencyOther: "", unit: "", currency: "" };

describe("the rules of a payment plan", () => {

    it("equal shares total 100%, the last taking what rounding leaves", () => {
        expect(equalPercents(4)).toEqual(["25", "25", "25", "25"]);
        expect(equalPercents(3)).toEqual(["33.33", "33.33", "33.34"]);
        expect(equalPercents(0)).toEqual([]);
    });

    it("instalments are dated evenly from the Start date to the End date", () => {
        expect(instalmentLines(3, "2027-01-01", "2027-01-31").map(entry => [entry.percent, entry.date])).toEqual([["33.33", "2027-01-01"], ["33.33", "2027-01-16"], ["33.34", "2027-01-31"]]);
        expect(instalmentLines(1, "2027-01-01", "2027-01-31").map(entry => entry.date)).toEqual(["2027-01-01"]);
        expect(instalmentLines(2, "", "").map(entry => entry.date)).toEqual(["", ""]);
    });

    it("Deposit & Balance pays the first on the Start date and the balance on its own date, else the End date", () => {
        const lines = paymentPlanLines(plan("deposit-balance", [line("30"), line("70")]), "2027-02-01", "2027-06-30");
        expect(lines.map(entry => [entry.percent, entry.date])).toEqual([["30", "2027-02-01"], ["70", "2027-06-30"]]);
        const own = paymentPlanLines(plan("deposit-balance", [line("30"), line("70", "2027-04-01")]), "2027-02-01", "2027-06-30");
        expect(own[1].date).toBe("2027-04-01");
    });

    it("a plan is incomplete when ticked with no type, when the percents do not total 100%, or when a payment has no date", () => {
        expect(paymentPlanTotal(plan("milestones", [line("40"), line("60.5")]))).toBe(100.5);
        const incomplete = (p: ReturnType<typeof plan>, start = "2027-01-01", end = "2027-12-31", frequency = "per-project") => paymentPlanIncomplete({ frequency }, p, start, end);
        expect(incomplete(plan("", []))).toBe(true);
        expect(incomplete(plan("milestones", [line("40", "2027-01-01"), line("60", "2027-02-01")]))).toBe(false);
        expect(incomplete(plan("milestones", [line("40", "2027-01-01"), line("50", "2027-02-01")]))).toBe(true);
        expect(incomplete(plan("milestones", [line("40", "2027-01-01"), line("60")]))).toBe(true);
        expect(incomplete(plan("deposit-balance", [line("50"), line("50")]))).toBe(false);
        expect(incomplete(plan("deposit-balance", [line("50"), line("50")]), "", "2027-12-31")).toBe(true);
        expect(incomplete(plan("deposit-balance", [line("50"), line("50")]), "2027-01-01", "")).toBe(true);
        // (Not ticked, or not a Per project price: nothing to check.)
        expect(incomplete(plan("", [], false))).toBe(false);
        expect(incomplete(plan("milestones", [line("40")]), "2027-01-01", "2027-12-31", "monthly")).toBe(false);
    });

    it("a card with a ticked plan that does not total 100% is incomplete", () => {
        const value = asBusinessCapabilityValue({
            ...asBusinessCapabilityValue(undefined),
            resources: { documents: [{ id: "tickets-trips", name: "", slots: [
                { ...createBusinessResourceSlot(), id: "bad", name: "Fair", status: "costs", cost: perProject, startDate: "2027-01-01", paymentPlan: plan("milestones", [line("40", "2027-01-01")]) },
                { ...createBusinessResourceSlot(), id: "good", name: "Show", status: "costs", cost: perProject, startDate: "2027-01-01", paymentPlan: plan("milestones", [line("100", "2027-01-01")]) }
            ] }] }
        });
        const missing = incompleteCards(value);
        expect(missing.get("bad")).toEqual(["Payment Plan"]);
        expect(missing.has("good")).toBe(false);
    });

    it("is read clean: a known type, whole digits for a count, percents and real dates", () => {
        const read = asBusinessCapabilityValue({
            formatVersion: 3,
            offering: { resources: [{ id: "r", paymentPlan: { on: true, type: "nonsense", count: "x4", lines: [{ percent: "12,5%", date: "2027-02-30", title: "A" }] } }] }
        });
        expect(read.offering.resources[0].paymentPlan).toMatchObject({ on: true, type: "", count: "4", lines: [{ title: "A", percent: "125", date: "" }] });
        expect(asBusinessCapabilityValue(read)).toEqual(read);
    });

});

describe("the plan on the card", () => {

    function setup(extra: Record<string, unknown> = {}, frequency = "per-project") {
        let latest: Value | undefined;
        const value = asBusinessCapabilityValue(undefined);
        render(<Harness
            initial={{
                ...value,
                resources: { documents: [{ id: "tickets-trips", name: "", slots: [{ ...createBusinessResourceSlot(), name: "Fair", status: "costs", cost: { ...perProject, frequency }, startDate: "2027-03-01", endDate: "2027-05-31", ...extra }] }] }
            }}
            onValue={(next) => { latest = next; }}
        />);
        openTile("Documents & Rights", "Tickets & Trip Costs");
        openCard("Fair");
        return () => latest!.resources.documents[0].slots[0];
    }

    it("is offered on a Per project price only", () => {
        setup({}, "monthly");
        expect(screen.queryByRole("checkbox", { name: "Resource 1 payment plan" })).toBeNull();
        cleanup();
        setup();
        expect(screen.getByRole("checkbox", { name: "Resource 1 payment plan" })).toBeTruthy();
        expect(screen.queryByLabelText(/payment plan type/)).toBeNull();
    });

    it("Deposit & Balance: two rows, each an amount, a percent and a date; the deposit is paid at the Start date and the balance follows", () => {
        const slot = setup();
        fireEvent.click(screen.getByRole("checkbox", { name: "Resource 1 payment plan" }));
        fireEvent.click(screen.getByLabelText(/Resource 1 payment plan type: /));
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Deposit & Balance", "Instalments", "Milestones"]);
        fireEvent.click(screen.getByRole("option", { name: "Deposit & Balance" }));
        expect(slot().paymentPlan.lines.map(entry => entry.percent)).toEqual(["50", "50"]);
        // The price (1,200) is shown as the amounts the percents come to.
        expect((screen.getByLabelText("Resource 1 deposit amount") as HTMLInputElement).value).toBe("600");
        fireEvent.change(screen.getByLabelText("Resource 1 deposit percent"), { target: { value: "30" } });
        expect(slot().paymentPlan.lines.map(entry => entry.percent)).toEqual(["30", "70"]);
        expect((screen.getByLabelText("Resource 1 balance amount") as HTMLInputElement).value).toBe("840");
        // Typing the amount sets the percent (the same figure written the other way).
        fireEvent.change(screen.getByLabelText("Resource 1 deposit amount"), { target: { value: "300" } });
        expect(slot().paymentPlan.lines.map(entry => entry.percent)).toEqual(["25", "75"]);
        // (The balance's figures are the rest; the deposit's date is the card's Start date, not asked.)
        expect((screen.getByLabelText("Resource 1 balance percent") as HTMLInputElement).readOnly).toBe(true);
        expect((screen.getByLabelText("Resource 1 deposit date") as HTMLInputElement).disabled).toBe(true);
        expect(screen.getByText("Total 100%")).toBeTruthy();
    });

    it("Instalments: a two-digit number beside the type makes that many numbered rows; a new number makes them again", () => {
        const slot = setup();
        fireEvent.click(screen.getByRole("checkbox", { name: "Resource 1 payment plan" }));
        fireEvent.click(screen.getByLabelText(/Resource 1 payment plan type: /));
        fireEvent.click(screen.getByRole("option", { name: "Instalments" }));
        // (No row until a number is typed.)
        expect(slot().paymentPlan.lines).toHaveLength(0);
        fireEvent.change(screen.getByLabelText("Resource 1 number of instalments"), { target: { value: "3" } });
        expect(slot().paymentPlan.lines.map(entry => entry.percent)).toEqual(["33.33", "33.33", "33.34"]);
        expect(slot().paymentPlan.lines[0].date).toBe("2027-03-01");
        expect(slot().paymentPlan.lines[2].date).toBe("2027-05-31");
        expect((screen.getByLabelText("Resource 1 instalment 1 amount") as HTMLInputElement).value).toBe("399.96");
        fireEvent.change(screen.getByLabelText("Resource 1 number of instalments"), { target: { value: "4" } });
        expect(slot().paymentPlan.lines.map(entry => entry.percent)).toEqual(["25", "25", "25", "25"]);
        // (Two digits, 1 to 99.)
        fireEvent.change(screen.getByLabelText("Resource 1 number of instalments"), { target: { value: "45" } });
        expect(slot().paymentPlan.lines).toHaveLength(45);
        fireEvent.change(screen.getByLabelText("Resource 1 number of instalments"), { target: { value: "4" } });
        const second = screen.getByLabelText("Resource 1 instalment 2 date");
        fireEvent.change(second, { target: { value: "20/04/2027" } });
        fireEvent.blur(second);
        fireEvent.change(screen.getByLabelText("Resource 1 instalment 2 percent"), { target: { value: "30" } });
        expect(screen.getByText("Total 105%: the payments must total 100%")).toBeTruthy();
        // The amount and the percent of an instalment are one figure.
        fireEvent.change(screen.getByLabelText("Resource 1 instalment 2 amount"), { target: { value: "300" } });
        expect(slot().paymentPlan.lines[1].percent).toBe("25");
        expect(screen.getByText("Total 100%")).toBeTruthy();
    });

    it("Milestones: a stage row with the + (an x on the ones after), then the amount, percent and date; the total must be 100%", () => {
        const slot = setup();
        fireEvent.click(screen.getByRole("checkbox", { name: "Resource 1 payment plan" }));
        fireEvent.click(screen.getByLabelText(/Resource 1 payment plan type: /));
        fireEvent.click(screen.getByRole("option", { name: "Milestones" }));
        fireEvent.change(screen.getByLabelText("Resource 1 milestone 1 title"), { target: { value: "Application" } });
        fireEvent.change(screen.getByLabelText("Resource 1 milestone 1 percent"), { target: { value: "40" } });
        fireEvent.click(screen.getByRole("button", { name: "Add milestone to Resource 1" }));
        expect(screen.queryByRole("button", { name: "Remove Resource 1 milestone 1" })).toBeNull();
        fireEvent.change(screen.getByLabelText("Resource 1 milestone 2 title"), { target: { value: "Audit" } });
        fireEvent.change(screen.getByLabelText("Resource 1 milestone 2 percent"), { target: { value: "50" } });
        expect(screen.getByText("Total 90%: the payments must total 100%")).toBeTruthy();
        expect(slot().paymentPlan.lines.map(entry => [entry.title, entry.percent])).toEqual([["Application", "40"], ["Audit", "50"]]);
        fireEvent.change(screen.getByLabelText("Resource 1 milestone 2 amount"), { target: { value: "720" } });
        expect(slot().paymentPlan.lines[1].percent).toBe("60");
        expect(screen.getByText("Total 100%")).toBeTruthy();
        fireEvent.click(screen.getByRole("button", { name: /Remove Resource 1 milestone 2/ }));
        expect(slot().paymentPlan.lines).toHaveLength(1);
    });
    it("unticking keeps nothing hidden on screen, and the card is complete again", () => {
        setup({ paymentPlan: plan("milestones", [line("40", "2027-03-01")]) });
        expect(screen.getByText("Total 40%: the payments must total 100%")).toBeTruthy();
        fireEvent.click(screen.getByRole("checkbox", { name: "Resource 1 payment plan" }));
        expect(screen.queryByText(/Total/)).toBeNull();
    });

});

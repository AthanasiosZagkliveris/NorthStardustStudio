import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import BusinessCapabilityEditor from "../BusinessCapabilityEditor";
import { closeTile, openTile } from "../../../../test/interviewTestUtils";
import { BUSINESS_ACTIVITY_CATEGORIES, asBusinessCapabilityValue, createBusinessActivity, createBusinessPartner, businessPartnerResponsibleId, businessResponsibleId } from "../../../../framework/engine/answers/AnswerUtils";
import { stylesheet } from "../../../../test/stylesheet";

const OPERATIONAL = BUSINESS_ACTIVITY_CATEGORIES.find(category => category.id === "operational")!;

afterEach(cleanup);

/** Backs out of whatever is open (a card, its list, the boxes) until the dialog is closed. */

function closeAll() {
    for (let back = 0; back < 4 && screen.queryAllByRole("dialog").length > 0; back++) {
        closeTile();
    }
}

describe("BusinessCapabilityEditor founders' roles", () => {

    const ann = { id: "f1", name: "Ann", ownership: "100", capital: "", roles: ["Old role"], experience: "" };

    function renderWith(foundersProfile?: unknown) {
        let saved: unknown;
        function ValueHarness() {
            const [value, setValue] = useState<unknown>(asBusinessCapabilityValue(undefined));
            return (
                <BusinessCapabilityEditor
                    value={value}
                    onChange={(next) => { saved = next; setValue(next); }}
                    legalEntityFounders={[ann]}
                    foundersProfile={foundersProfile}
                />
            );
        }
        render(<ValueHarness />);
        openTile("Founders");
        // The founders' cards are open in the dialog and cannot fold (no arrow on them).
        expect(screen.queryAllByRole("button", { name: /^(Maximise|Minimise) Founder 1$/ })).toHaveLength(0);
        return () => asBusinessCapabilityValue(saved);
    }

    it("asks one Frequency for the salary and both hours", () => {

        const saved = renderWith();

        const labels = [...document.querySelectorAll(".business-founder-grid .field-label")].map(label => label.textContent?.replace(/i$/, "").trim());
        expect(labels.slice(1)).toEqual(["Frequency", "Working Hours", "Delivery Hours"]);
        const frequency = screen.getByRole("button", { name: /^Ann frequency of salary and hours/ });
        fireEvent.click(frequency);
        expect(screen.getAllByRole("option").map(option => option.textContent)).toEqual(["Weekly", "Monthly", "Annually"]);
        fireEvent.click(screen.getByRole("option", { name: "Annually" }));
        expect(saved().founders[0].period).toBe("year");
        expect(screen.getByLabelText(/^Ann working hours a year/)).toBeTruthy();
        expect(screen.getByLabelText(/^Ann salary a year/)).toBeTruthy();

    });

    it("shows each founder's roles from the Founders Profile, read-only", () => {

        const saved = renderWith({ founders: [{ id: "f1", roles: ["Director", "Designer"] }] });

        // A bullet list named "Roles", with no visible "Roles" label, and nothing to type in.
        const list = screen.getByRole("list", { name: "Roles" });
        expect(list.classList.contains("bullet-list-static")).toBe(true);
        expect([...list.querySelectorAll("li")].map(item => item.textContent)).toEqual(["Director", "Designer"]);
        expect(screen.queryByRole("textbox", { name: /roles/i })).toBeNull();
        expect([...document.querySelectorAll(".section-tile-dialog .field-label")].map(label => label.textContent)).not.toContain("Roles");
        expect(saved().founders[0].roles).toEqual(["Director", "Designer"]);

    });

    it("reads the roles a Legal Entity saved before the Founders Profile existed", () => {

        renderWith(undefined);

        const roles = [...screen.getByRole("list", { name: "Roles" }).querySelectorAll("li")].map(item => item.textContent);
        expect(roles).toEqual(["Old role"]);

    });

    it("points to Founders & Ownership when a founder has none", () => {

        renderWith({ founders: [{ id: "f1", roles: [""] }] });

        expect(screen.getByText(/Add them under 1\. Identity System → Definition & Purpose → Founders & Ownership\./)).toBeTruthy();

    });

});

describe("BusinessCapabilityEditor founders' Responsibilities", () => {

    const ann = { id: "f1", name: "Ann", ownership: "100", capital: "", roles: [""], experience: "" };

    /** Ann, the only founder, is responsible for every named activity. */
    function renderWith(names: string[], completed: number) {
        const initial = {
            ...asBusinessCapabilityValue(undefined),
            activities: [{
                id: OPERATIONAL.id,
                name: "",
                activities: names.map((name, index) => ({ ...createBusinessActivity(), name, completed: index < completed }))
            }]
        };
        function ValueHarness() {
            const [value, setValue] = useState<unknown>(initial);
            return <BusinessCapabilityEditor value={value} onChange={setValue} legalEntityFounders={[ann]} />;
        }
        const view = render(<ValueHarness />);
        openTile("Founders");
        // The founders' cards are open in the dialog and cannot fold (no arrow on them).
        expect(screen.queryAllByRole("button", { name: /^(Maximise|Minimise) Founder 1$/ })).toHaveLength(0);
        // The section is drawn in a dialog, outside the render's own container.
        return { ...view, container: document.body };
    }

    const lines = (container: HTMLElement) =>
        [...container.querySelectorAll(".business-capability-responsibilities-head ~ div .numbered-list-static-text .business-capability-responsibility-link")].map(line => line.textContent);

    it("counts what is done of all of them, beside the label", () => {
        const { container } = renderWith(["A", "B", "C", "D", "E", "F", "G"], 3);
        expect(container.querySelector(".business-capability-responsibilities-count")?.textContent).toBe("3/7");
    });

    it("shows only the rate beside the label, no word before it", () => {
        const { container } = renderWith(["A", "B", "C"], 1);
        const count = container.querySelector(".business-capability-responsibilities-count")!;
        expect(count.textContent).toBe("1/3");
        expect(count.textContent).not.toMatch(/Completed/);
    });

    it("starts a list of more than five folded, and unfolds it from its arrow", () => {
        const { container } = renderWith(["A", "B", "C", "D", "E", "F"], 1);
        const arrow = screen.getByRole("button", { name: /^Maximise Links of (Ann|Founder 1)$/ });
        expect(arrow.getAttribute("aria-expanded")).toBe("false");
        expect(lines(container)).toEqual([]);
        fireEvent.click(arrow);
        const open = screen.getByRole("button", { name: /^Minimise Links of (Ann|Founder 1)$/ });
        expect(open.getAttribute("aria-expanded")).toBe("true");
        // What is done waits in its own Completed fold, folded.
        expect(lines(container)).toEqual(["B", "C", "D", "E", "F"]);
        fireEvent.click(open);
        expect(lines(container)).toEqual([]);
    });

    it("keeps what is done out of the list, in a Completed fold under it that starts folded", () => {
        const { container } = renderWith(["A", "B", "C", "D"], 2);
        // (Every list starts folded; this one is opened by hand.)
        fireEvent.click(screen.getByRole("button", { name: /^Maximise Links of (Ann|Founder 1)$/ }));
        expect(lines(container)).toEqual(["C", "D"]);
        // (The same row as Responsibilities: the standard fold arrow, then the label.)
        const completed = screen.getByRole("button", { name: /^Maximise completed links of (Ann|Founder 1)$/ });
        expect(completed.getAttribute("aria-expanded")).toBe("false");
        fireEvent.click(completed);
        expect(lines(container)).toEqual(["C", "D", "A", "B"]);
        // Its own numbers, from 1; each line says what it is (A. Activity) before its link.
        const done = container.querySelectorAll(".business-capability-completed .numbered-list-static");
        expect(done[done.length - 1].getAttribute("start")).toBe("1");
        expect(container.querySelector(".business-capability-completed .business-capability-card-link-kind")?.textContent).toBe("A.");
        expect(container.querySelector(".business-capability-responsibilities-count")?.textContent).toBe("2/4");
    });

    it("starts a list of five or fewer folded as well: every list is collapsed by default", () => {
        const { container } = renderWith(["A", "B", "C", "D", "E"], 0);
        expect(screen.getByRole("button", { name: /^Maximise Links of (Ann|Founder 1)$/ }).getAttribute("aria-expanded")).toBe("false");
        expect(lines(container)).toHaveLength(0);
        expect(container.querySelector(".business-capability-responsibilities-count")?.textContent).toBe("0/5");
    });

    it("stands the numbered list at the card's content edge, and its Completed row under the Responsibilities arrow", () => {
        const { container } = renderWith(["A", "B", "C", "D"], 2);
        fireEvent.click(screen.getByRole("button", { name: /^Maximise Links of (Ann|Founder 1)$/ }));
        for (const list of container.querySelectorAll(".business-capability-responsibilities-head ~ div .numbered-list-static")) {
            expect(list.classList.contains("numbered-list-static-flush")).toBe(true);
        }
        const css = stylesheet("section-tiles.css");
        // No indent for the list the arrow folds any more.
        expect(css).not.toMatch(/responsibilities-head:has\(> \.strategy-box-toggle\) ~ \*/);
        expect(css).not.toMatch(/margin-left: 44px/);
        expect(stylesheet("numbered-list.css")).toMatch(/\.numbered-list-static-flush > li::before ?\{[^}]*padding-left: ?0;[^}]*text-align: ?left;/);
    });

    it("collapses the list again every time the dialog opens; toggling inside an open dialog works", () => {
        const { container } = renderWith(["A", "B", "C"], 0);
        fireEvent.click(screen.getByRole("button", { name: /^Maximise Links of (Ann|Founder 1)$/ }));
        expect(lines(container)).toEqual(["A", "B", "C"]);
        closeTile();
        openTile("Founders");
        expect(screen.getByRole("button", { name: /^Maximise Links of (Ann|Founder 1)$/ }).getAttribute("aria-expanded")).toBe("false");
        expect(lines(container)).toHaveLength(0);
    });

    it("has no arrow and no count while there is nothing to list", () => {
        const { container } = renderWith([], 0);
        expect(screen.queryByRole("button", { name: /Links of/ })).toBeNull();
        expect(container.querySelector(".business-capability-responsibilities-count")).toBeNull();
    });

});

describe("a Partnership / Provider's Responsible", () => {

    const founder = (id: string, name: string) => ({ id, name, ownership: "50", capital: "", roles: [""], experience: "" });

    function renderPartner(founders: ReturnType<typeof founder>[], responsibleId = "") {
        const base = asBusinessCapabilityValue(undefined);
        const initial = {
            ...base,
            offering: { ...base.offering, professionals: [{ ...createBusinessPartner("Printer"), responsibleId }] }
        };
        function PartnerHarness() {
            const [value, setValue] = useState<unknown>(initial);
            return <BusinessCapabilityEditor value={value} onChange={setValue} legalEntityFounders={founders} />;
        }
        render(<PartnerHarness />);
        openTile("Partners & Suppliers", "Partners", "Partner 1");
        return document.querySelector(".floating-card-host")!;
    }

    const responsible = (section: Element) => [...section.querySelectorAll(".business-field-side")]
        .find(field => field.querySelector(".field-label")?.textContent?.startsWith("Responsible"))!;

    it("is called Responsible", () => {
        const section = renderPartner([founder("f1", "Ann"), founder("f2", "Bo")]);
        const field = responsible(section);
        expect(field.querySelector(".field-label")?.textContent).toMatch(/^Responsible/);
        expect(field.querySelector(".field-label")?.textContent).not.toMatch(/Responsibility/);
        expect(field.querySelector(".option-picker-trigger")?.getAttribute("aria-label")).toMatch(/^Printer responsible: /);
    });

    it("is not shown at all in an organisation with ONE founder: no label, no text, no empty row (he is still responsible)", () => {
        const section = renderPartner([founder("f1", "Ann")]);
        expect(responsible(section)).toBeUndefined();
        expect(section.textContent).not.toMatch(/Responsib/);
        expect(section.querySelector(".business-capability-automatic")).toBeNull();
        expect(section.querySelector(".business-capability-cost-after")).toBeNull();
        expect(businessPartnerResponsibleId({ responsibleId: "" }, ["f1"])).toBe("f1");
    });

    it("keeps an explicit choice among several founders, and leaves it to the user with several or none", () => {
        const chosen = renderPartner([founder("f1", "Ann"), founder("f2", "Bo")], "f2");
        expect(responsible(chosen).querySelector(".option-picker-trigger")?.textContent).toContain("Bo");
        cleanup();
        const open = renderPartner([founder("f1", "Ann"), founder("f2", "Bo")]);
        expect(responsible(open).querySelector(".option-picker-trigger")?.textContent).toContain("Select");
        expect(responsible(open).querySelector(".business-capability-automatic")).toBeNull();
        cleanup();
        const none = renderPartner([]);
        expect(responsible(none).querySelector(".option-picker")).toBeNull();
        expect(responsible(none).querySelector(".business-capability-automatic")).toBeNull();
    });

});

describe("the Responsible tick on a Capability card", () => {

    const founder = (id: string, name: string) => ({ id, name, ownership: "50", capital: "", roles: [""], experience: "" });
    const two = [founder("f1", "Ann"), founder("f2", "Bo")];

    let latest: ReturnType<typeof asBusinessCapabilityValue>;

    function renderCards(founders: typeof two, patch: { activity?: object; partner?: object } = {}) {
        const base = asBusinessCapabilityValue(undefined);
        const initial = {
            ...base,
            activities: [{
                id: OPERATIONAL.id,
                name: "",
                activities: [{ ...createBusinessActivity(), name: "Pack orders", ...patch.activity }]
            }],
            offering: { ...base.offering, professionals: [{ ...createBusinessPartner("Printer"), ...patch.partner }] }
        };
        function TickHarness() {
            const [value, setValue] = useState<unknown>(initial);
            return <BusinessCapabilityEditor value={value} onChange={(next) => { latest = asBusinessCapabilityValue(next); setValue(next); }} legalEntityFounders={founders} />;
        }
        render(<TickHarness />);
    }

    /** Opens a tile and its card; the other tile's card is not drawn while this one is open. */
    function openCards(tile: string, card: string, box?: string) {
        openTile(tile, box, card);
    }

    const openActivity = () => openCards("Operational", "Activity 1");
    const openPartner = () => openCards("Partners & Suppliers", "Partner 1", "Partners");

    const activityTick = () => screen.queryByRole("checkbox", { name: "Activity 1 has a responsible" }) as HTMLInputElement | null;
    const partnerTick = () => screen.queryByRole("checkbox", { name: "Printer has a responsible" }) as HTMLInputElement | null;

    it("is ticked by default, next to the label, with the dropdown (tick, then label, then dropdown)", () => {
        renderCards(two);
        const expectTicked = (tick: HTMLInputElement) => {
            expect(tick.checked).toBe(true);
            const field = tick.closest(".business-foundation-field")!;
            expect(field.firstElementChild?.querySelector("label.business-foundation-tick > input.brand-tick-box")).toBe(tick);
            expect(tick.nextElementSibling?.textContent).toMatch(/^Responsib/);
            expect(field.querySelector(".option-picker")).not.toBeNull();
        };
        openActivity();
        expectTicked(activityTick()!);
        closeAll();
        openPartner();
        expectTicked(partnerTick()!);
    });

    it("unticking removes the field for that card and clears the choice; re-ticking brings the dropdown back empty", () => {
        renderCards(two, { activity: { responsibleId: "f2" }, partner: { responsibleId: "f1" } });
        const untick = (tick: () => HTMLInputElement | null) => {
            fireEvent.click(tick()!);
            expect(tick()!.checked).toBe(false);
            // The tick and its label stay, the dropdown is gone.
            expect(tick()!.closest(".business-foundation-field")!.querySelector(".option-picker")).toBeNull();
            expect(tick()!.closest(".business-foundation-field")!.textContent).toMatch(/Responsib/);
        };
        openActivity();
        untick(activityTick);
        closeAll();
        openPartner();
        untick(partnerTick);
        closeAll();
        expect(latest.activities[0].activities[0]).toMatchObject({ responsibleOff: true, responsibleId: "" });
        expect(latest.offering.professionals[0]).toMatchObject({ responsibleOff: true, responsibleId: "" });

        openActivity();
        fireEvent.click(activityTick()!);
        expect(activityTick()!.checked).toBe(true);
        expect(activityTick()!.closest(".business-foundation-field")!.querySelector(".option-picker-trigger")?.textContent).toContain("Select");
        expect(latest.activities[0].activities[0].responsibleOff).toBeUndefined();
        expect(latest.activities[0].activities[0].responsibleId).toBe("");
    });

    it("starts unticked from a stored responsibleOff, and a card without the key is ticked", () => {
        renderCards(two, { activity: { responsibleOff: true } });
        openActivity();
        expect(activityTick()!.checked).toBe(false);
        closeAll();
        openPartner();
        expect(partnerTick()!.checked).toBe(true);
    });

    it("an unticked activity is not given the founder its single Performer would make responsible", () => {
        renderCards(two, { activity: { performerIds: ["f1"], responsibleOff: true } });
        openActivity();
        expect(activityTick()!.checked).toBe(false);
        expect(activityTick()!.closest(".business-foundation-field")!.querySelector(".business-capability-automatic")).toBeNull();
        expect(businessResponsibleId({ ...createBusinessActivity(), performerIds: ["f1"], responsibleOff: true }, ["f1", "f2"])).toBe("");
    });

    it("shows no tick, no label and no dropdown with ONE founder", () => {
        renderCards([founder("f1", "Ann")] as typeof two);
        openActivity();
        expect(activityTick()).toBeNull();
        expect(document.body.textContent).not.toMatch(/Responsib/);
        closeAll();
        openPartner();
        expect(partnerTick()).toBeNull();
        expect(document.body.textContent).not.toMatch(/Responsib/);
    });

});

describe("BusinessCapabilityEditor founders' share of working hours", () => {

    function renderAnn() {
        function ShareHarness() {
            const [value, setValue] = useState<unknown>(asBusinessCapabilityValue(undefined));
            return (
                <BusinessCapabilityEditor
                    value={value}
                    onChange={setValue}
                    legalEntityFounders={[{ id: "f1", name: "Ann", ownership: "100", capital: "", roles: ["Weaver"], experience: "" }]}
                />
            );
        }
        render(<ShareHarness />);
        openTile("Founders");
    }

    const note = () => document.querySelector(".business-founder-share");

    it("says only the share of the working hours, without repeating the delivery hours of the field above", () => {
        renderAnn();
        fireEvent.change(screen.getByLabelText(/^Ann working hours/), { target: { value: "160" } });
        fireEvent.change(screen.getByLabelText(/^Ann delivery hours/), { target: { value: "112" } });
        expect(note()?.textContent).toBe("70% of working hours");
        expect(document.body.textContent).not.toMatch(/Delivery hours: 112/);
        expect(note()!.classList.contains("delivery-muted")).toBe(true);
    });

    it("shows nothing while the working hours are blank or 0", () => {
        renderAnn();
        fireEvent.change(screen.getByLabelText(/^Ann delivery hours/), { target: { value: "40" } });
        expect(note()).toBeNull();
        fireEvent.change(screen.getByLabelText(/^Ann working hours/), { target: { value: "0" } });
        expect(note()).toBeNull();
    });

    it("adds the month a weekly Frequency counts to (new information), still without the delivery figure", () => {
        renderAnn();
        fireEvent.click(screen.getByRole("button", { name: /Ann frequency of salary and hours/ }));
        fireEvent.click(screen.getByRole("option", { name: "Weekly" }));
        fireEvent.change(screen.getByLabelText(/^Ann working hours/), { target: { value: "40" } });
        fireEvent.change(screen.getByLabelText(/^Ann delivery hours/), { target: { value: "20" } });
        expect(note()?.textContent).toMatch(/^50% of working hours, about [\d.,]+ a month/);
    });

    it("lays the founder card's head out as the other cards: the number at the body's edge, the name 8px after it", () => {
        const css = stylesheet("section-tiles.css");
        // The number hangs in the marker column (left of the content edge); the name follows at the head's one 8px gap.
        expect(css).toMatch(/\.business-founder-open > \.strategy-box-head > \.strategy-box-number \{[^}]*min-width: calc\(var\(--founder-marker\) - 8px\);/);
        expect(css).toMatch(/\.business-founder-open > \.strategy-box-head > \.strategy-box-number > \.list-number \{[^}]*text-align: left;/);
    });

});

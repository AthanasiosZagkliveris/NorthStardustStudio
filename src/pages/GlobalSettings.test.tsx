import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import GlobalSettings from "./GlobalSettings";
import SettingsButton from "../components/SettingsButton";
import { asGlobalSettings } from "../framework/engine/GlobalSettings";
import { OrganizationService } from "../services/OrganizationService";

function Where({ name }: { name: string }) {
    const location = useLocation();
    return <p>{name + " at " + location.pathname}</p>;
}

let organizationId = "";

beforeEach(() => {
    localStorage.clear();
    organizationId = OrganizationService.create("Lumen").id;
    OrganizationService.setSelected(organizationId);
});

afterEach(cleanup);

const saved = () => asGlobalSettings(OrganizationService.getGlobalSettings(organizationId));

function open() {
    render(
        <MemoryRouter initialEntries={["/settings"]}>
            <Routes><Route path="/settings" element={<GlobalSettings />} /></Routes>
        </MemoryRouter>
    );
}

describe("opening Global Settings", () => {

    it("opens from the header button, and returns to where it was opened from on Escape", () => {
        render(
            <MemoryRouter initialEntries={["/introduction"]}>
                <SettingsButton />
                <Routes>
                    <Route path="/introduction" element={<Where name="The interview" />} />
                    <Route path="/settings" element={<GlobalSettings />} />
                </Routes>
            </MemoryRouter>
        );
        act(() => { fireEvent.click(screen.getByRole("button", { name: "Global Settings" })); });
        expect(screen.getByRole("heading", { name: /^Global Settings/ })).toBeTruthy();
        act(() => { fireEvent.keyDown(window, { key: "Escape" }); });
        expect(screen.getByText("The interview at /introduction")).toBeTruthy();
    });

});

describe("the Global Settings screen", () => {

    it("shows the starting values and lists the figures of the cost model", () => {
        open();
        for (const name of [
            "Employer on-cost coefficient", "Insurance per employee", "Corporate income tax rate", "Capitalisation limit",
            "Royalty on sales", "Affiliate network or influencer commission", "Sales agent or B2B broker commission", "Target operating reserve"
        ]) {
            expect(screen.getByLabelText(name)).toBeTruthy();
        }
        expect((screen.getByLabelText("Target operating reserve") as HTMLInputElement).value).toBe("3");
        // (Only a group that holds an asset is listed: this organization has none.)
        expect(screen.queryByLabelText("Production Machinery")).toBeNull();
        expect((screen.getByLabelText("Channel 1") as HTMLInputElement).value).toBe("Stripe");
    });

    it("saves a figure at once, kept to what a number box takes", () => {
        open();
        fireEvent.change(screen.getByLabelText("Employer on-cost coefficient"), { target: { value: "25" } });
        fireEvent.change(screen.getByLabelText("Capitalisation limit"), { target: { value: "5x00" } });
        expect(saved().onCostRate).toBe("25");
        expect(saved().capitalisationLimit).toBe("");
        fireEvent.change(screen.getByLabelText("Capitalisation limit"), { target: { value: "500" } });
        expect(saved().capitalisationLimit).toBe("500");
    });

    it("keeps the contingency rates: 10% for the startup fund and 4% for the operational one to begin with", () => {
        open();
        expect((screen.getByLabelText("Startup Contingency Fund") as HTMLInputElement).value).toBe("10");
        expect((screen.getByLabelText("Operational Contingency Fund") as HTMLInputElement).value).toBe("4");
        fireEvent.change(screen.getByLabelText("Startup Contingency Fund"), { target: { value: "15" } });
        expect(saved().startupContingencyRate).toBe("15");
    });

    it("lists only the groups that hold an asset", () => {
        open();
        expect(screen.queryByLabelText("Furniture & Fittings")).toBeNull();
    });

    it("adds, edits and removes a channel of the Channel Fee Table", () => {
        open();
        fireEvent.click(screen.getByRole("button", { name: "+ Add channel" }));
        expect(saved().channelFees).toHaveLength(4);
        fireEvent.change(screen.getByLabelText("Channel 4"), { target: { value: "Etsy" } });
        fireEvent.change(screen.getByLabelText("Channel 4 commission"), { target: { value: "6.5" } });
        fireEvent.change(screen.getByLabelText("Channel 4 fixed fee"), { target: { value: "0.2" } });
        expect(saved().channelFees[3]).toMatchObject({ channel: "Etsy", commission: "6.5", fixedFee: "0.2" });
        fireEvent.click(screen.getByRole("button", { name: "Remove channel 1" }));
        expect(saved().channelFees.map(row => row.channel)).toEqual(["PayPal", "Wolt, Amazon", "Etsy"]);
        expect(within(screen.getByRole("table", { name: "Channel Fee Table" })).getAllByRole("row")).toHaveLength(4);
    });

    it("is kept for the Organization it belongs to", () => {
        const other = OrganizationService.create("Quillfield").id;
        OrganizationService.setSelected(organizationId);
        open();
        fireEvent.change(screen.getByLabelText("Insurance per employee"), { target: { value: "40" } });
        expect(asGlobalSettings(OrganizationService.getGlobalSettings(other)).insurancePerEmployee).toBe("");
        expect(saved().insurancePerEmployee).toBe("40");
    });

});

describe("the Business stages of the Global Settings", () => {

    it("lists the four stages with their durations, Planning, Launching and Managing in months, Growing in years, and the defaults to start with", () => {
        open();
        const table = screen.getByRole("table", { name: "Business stages" });
        expect(within(table).getAllByRole("row").slice(1).map(row => within(row).getAllByRole("rowheader")[0].textContent?.replace(/i$/, ""))).toEqual(["Planning", "Launching", "Managing", "Growing"]);
        // The columns: the stage, the action, the date (the key point), the duration, the unit it is in.
        expect(within(table).getAllByRole("columnheader").map(head => head.textContent)).toEqual(["Stage", "Start", "End", "Duration", "Time in:", "Reset"]);
        expect(within(within(table).getAllByRole("row")[4]).getAllByRole("cell").map(cell => cell.textContent).filter(Boolean)).toEqual(["years"]);
        expect((screen.getByLabelText("Planning duration (months)") as HTMLInputElement).value).toBe("3");
        expect((screen.getByLabelText("Launching duration (months)") as HTMLInputElement).value).toBe("12");
        expect((screen.getByLabelText("Managing duration (months)") as HTMLInputElement).value).toBe("12");
        expect((screen.getByLabelText("Growing duration (years)") as HTMLInputElement).value).toBe("3");
    });

    it("takes whole numbers only, keeps them, and resets one stage or all", () => {
        open();
        const launching = screen.getByLabelText("Launching duration (months)") as HTMLInputElement;
        // (A decimal point, or more than 120 months, is refused: the box keeps what it had.)
        fireEvent.change(launching, { target: { value: "18.5" } });
        expect(launching.value).toBe("12");
        fireEvent.change(launching, { target: { value: "1200" } });
        expect(launching.value).toBe("12");
        fireEvent.change(launching, { target: { value: "18" } });
        expect(launching.value).toBe("18");
        expect(saved().stageDurations.launching).toBe("18");

        fireEvent.change(screen.getByLabelText("Growing duration (years)"), { target: { value: "5" } });
        expect(saved().stageDurations.growing).toBe("5");

        // One stage's own Reset, then the table's.
        fireEvent.click(screen.getByTitle("Reset Launching to 12 months"));
        expect(saved().stageDurations.launching).toBe("12");
        fireEvent.click(within(screen.getByRole("table", { name: "Business stages" })).getAllByRole("button", { name: "Reset" })[0]);
        expect(saved().stageDurations).toEqual({ planning: "3", launching: "12", managing: "12", growing: "3" });
    });

    it("highlights the stage the business is in today, from the Opening Date, and says the rest in the \"i\" of the title", () => {
        OrganizationService.saveGlobalSettings(organizationId, { ...saved(), openingDate: "2000-01-01" });
        open();
        const rows = within(screen.getByRole("table", { name: "Business stages" })).getAllByRole("row").slice(1);
        expect(rows.map(row => row.getAttribute("aria-current") === "true")).toEqual([false, false, false, true]);
        expect(rows[3].className).toContain("settings-stage-current");
        // (Start and End: the Opening Date is where Planning ends and Launching starts; Managing runs from 12 months after it to 24.)
        expect(within(rows[0]).getAllByRole("cell").slice(0, 2).map(cell => cell.textContent)).toEqual(["1 Oct 1999", "1 Jan 2000"]);
        expect(within(rows[2]).getAllByRole("cell").slice(0, 2).map(cell => cell.textContent)).toEqual(["1 Jan 2001", "1 Jan 2002"]);
        expect(screen.getByText("Opening Date")).toBeTruthy();
        expect(screen.getByRole("button", { name: "Business stages: what this means" })).toBeTruthy();
    });

});

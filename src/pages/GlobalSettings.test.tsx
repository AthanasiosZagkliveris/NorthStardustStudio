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

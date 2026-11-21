import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import Workbook from "../../pages/Workbook";
import { OrganizationService } from "../../services/OrganizationService";
import quillfield from "../../data/examples/quillfield-automation-llc.json";

/* THE WORKBOOK'S FINANCIAL DOCUMENTS (Questions 20, section 14; owner, 2026-11-20 20:46 UTC+2): each tab draws its own document, on the Quillfield example. */
const EXAMPLE = quillfield as unknown as { id: string; name: string; createdAt: number };

beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("northstardust-organization-" + EXAMPLE.id, JSON.stringify(EXAMPLE));
    localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: EXAMPLE.id, name: EXAMPLE.name, createdAt: EXAMPLE.createdAt }]));
    OrganizationService.setSelected(EXAMPLE.id);
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-10T12:00:00"));
});

afterEach(() => {
    cleanup();
    vi.useRealTimers();
});

function openOn(state: { tab: "financial-documents" | "glossary"; document?: "forecast" | "funding" | "financial-plan"; term?: string }) {
    render(
        <MemoryRouter initialEntries={[{ pathname: "/workbook", state }]}>
            <Routes><Route path="/workbook" element={<Workbook />} /></Routes>
        </MemoryRouter>
    );
}

const documents = () => screen.getByRole("region", { name: "Financial Documents" });
const tab = (name: string) => within(documents()).getByRole("tab", { name });

describe("the Workbook's Financial Documents", () => {

    it("draw each document on its own tab: the Forecast with its two charts, the Funding Request, the Financial Plan with its Stress Test", () => {
        openOn({ tab: "financial-documents" });
        expect(tab("Financial Forecast").getAttribute("aria-selected")).toBe("true");
        const captions = [...documents().querySelectorAll(".business-forecast-caption")].map(node => node.textContent);
        // Its tables, the Cash-Flow Forecast's two charts under it, each once.
        expect(captions).toEqual(["Profit & Loss Forecast", "Profit Kept in the Business", "Balance Sheet", "Cash-Flow Forecast", "Funding Timeline", "Revenue-Adjusted Financial Position"]);

        act(() => { fireEvent.click(tab("Funding Request")); });
        expect(tab("Funding Request").getAttribute("aria-selected")).toBe("true");
        expect(documents().textContent).toContain("Startup Contingency Fund");
        expect(documents().textContent).toContain("Operational Contingency Fund");

        act(() => { fireEvent.click(tab("Financial Plan")); });
        expect(tab("Financial Plan").getAttribute("aria-selected")).toBe("true");
        expect(documents().textContent).toContain("Stress Test");
    });

    it("opens on the document a link names", () => {
        openOn({ tab: "financial-documents", document: "financial-plan" });
        expect(tab("Financial Plan").getAttribute("aria-selected")).toBe("true");
    });

    it("are where a Glossary place with a document leads: the Financial Documents, on that document's tab", () => {
        openOn({ tab: "glossary" });
        const links = screen.getAllByRole("button", { name: /^Workbook, Financial Documents, Funding Request/ });
        act(() => { fireEvent.click(links[0]); });
        expect(screen.getByRole("heading", { level: 2, name: /^Financial Documents/ })).toBeTruthy();
        expect(tab("Funding Request").getAttribute("aria-selected")).toBe("true");
    });

});

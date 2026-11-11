import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import Conversation from "./Conversation";
import { OrganizationService } from "../services/OrganizationService";
import { systems } from "../data/systems";
import { frameworkRegistry } from "../framework/engine/FrameworkRegistry";
import lumen from "../data/examples/lumen-and-loom-studio.json";
import quillfield from "../data/examples/quillfield-automation-llc.json";

/*
    EVERY PAGE OF THE EXAMPLES, AS IT READS TODAY (written 2026-11-11 before the large screens are split further: the owner, "Go on, do all
    together"). Each page of the Systems below is opened with each example Organisation's saved answers, and the words it shows are kept in a
    snapshot: the large screens that had no test of their own (the two Financial pages, the Strategic Period and Roadmap, the Operational Log, the
    answers drawn by AnswerRenderer) are pinned with the rest, so a change that moves their code must leave every page reading the same. A change
    that means to change what a page says updates the snapshot (npx vitest run -u) and says so.
*/

vi.mock("../components/OrganizationCalendarPanel", () => ({ default: () => null }));

const EXAMPLES = [lumen, quillfield] as unknown as Array<{ id: string; name: string; createdAt: number }>;
const SYSTEMS = ["identity", "brand", "business", "strategy", "operations"];

/** The words a person reads on the page: its text, its fields' values, with the spaces evened out. */
function pageWords(container: HTMLElement): string {
    const values = [...container.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("input:not([type=checkbox]):not([type=radio]), textarea")].map(field => field.value).filter(Boolean);
    return (container.textContent ?? "").replace(/\s+/g, " ").trim() + "\n[fields] " + values.join(" | ");
}

let selected = "";

beforeEach(() => {
    localStorage.clear();
    for (const example of EXAMPLES) {
        localStorage.setItem("northstardust-organization-" + example.id, JSON.stringify(example));
    }
    localStorage.setItem("northstardust-organizations", JSON.stringify(EXAMPLES.map(example => ({ id: example.id, name: example.name, createdAt: example.createdAt }))));
    vi.spyOn(OrganizationService, "getSelected").mockImplementation(() => selected);
    // (One day for every run: a page that counts from today -- the business stage, a date default -- reads the same.)
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-10T12:00:00"));
});

afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
});

for (const example of EXAMPLES) {
    describe(example.name, () => {
        for (const id of SYSTEMS) {
            const system = systems.find(candidate => candidate.id === id)!;
            for (const section of frameworkRegistry.getFramework(system.id).sections) {
                it(system.title + " › " + section.number + ". " + section.title, () => {
                    selected = example.id;
                    const { container } = render(
                        <MemoryRouter initialEntries={[{ pathname: "/conversation", state: { system, targetSectionNumber: section.number, resume: {} } }]}>
                            <Routes>
                                <Route path="/conversation" element={<Conversation />} />
                            </Routes>
                        </MemoryRouter>
                    );
                    // (The page is drawn: its System's name heads it.)
                    expect(screen.getAllByText(new RegExp(system.title)).length).toBeGreaterThan(0);
                    expect(pageWords(container)).toMatchSnapshot();
                    // Every section tile's dialog in turn (the pages drawn as tiles keep their editors there: the Strategic Period and Roadmap, the Legal Entity ...).
                    const tiles = [...container.querySelectorAll<HTMLElement>("button.section-tile[data-tile]")].map(tile => tile.dataset.tile!);
                    for (const tile of tiles) {
                        const button = container.querySelector<HTMLElement>("button.section-tile[data-tile='" + tile + "']");
                        if (!button) continue;
                        fireEvent.click(button);
                        const dialog = document.querySelector<HTMLElement>(".section-tile-overlay");
                        if (dialog) {
                            expect(pageWords(dialog)).toMatchSnapshot("tile " + tile);
                        }
                        // (Closed by its own Back: an Escape here would also go Back from the page.)
                        let back = document.querySelector<HTMLElement>(".section-tile-overlay .section-tile-back, .section-tile-overlay .carousel-rail-back");
                        for (let level = 0; back && level < 4; level++) {
                            fireEvent.click(back);
                            back = document.querySelector<HTMLElement>(".section-tile-overlay .section-tile-back, .section-tile-overlay .carousel-rail-back");
                        }
                    }
                });
            }
        }
    });
}

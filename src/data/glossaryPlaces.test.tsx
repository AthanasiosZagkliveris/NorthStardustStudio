import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import Conversation from "../pages/Conversation";
import { OrganizationService } from "../services/OrganizationService";
import { systems } from "./systems";
import quillfield from "./examples/quillfield-automation-llc.json";
import { APP_TERMS } from "./glossary";

/* A GLOSSARY PLACE LANDS ON WHAT IT NAMES (ai-collaboration-rules.md, "Read the app's structure by what a thing is"): each place's tile or field is found
   on the page it names, in the Quillfield example, by its id -- a target that matches nothing would open the page and land nowhere. */
const EXAMPLE = quillfield as unknown as { id: string; name: string; createdAt: number };

beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("northstardust-organization-" + EXAMPLE.id, JSON.stringify(EXAMPLE));
    localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: EXAMPLE.id, name: EXAMPLE.name, createdAt: EXAMPLE.createdAt }]));
    vi.spyOn(OrganizationService, "getSelected").mockImplementation(() => EXAMPLE.id);
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-10T12:00:00"));
});

afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
});

const places = APP_TERMS.flatMap(term => (term.places ?? []).filter(place => place.tile || place.field).map(place => ({ term: term.id, ...place })));

describe("the Glossary's places", () => {
    it.each(places.map(place => [place.term + " → " + place.system + "." + place.page + " " + place.part, place] as const))("%s is on its page", (_name, place) => {
        const system = systems.find(candidate => candidate.number === place.system)!;
        const { container } = render(
            <MemoryRouter initialEntries={[{ pathname: "/conversation", state: { system, targetSectionNumber: place.page, resume: {} } }]}>
                <Routes><Route path="/conversation" element={<Conversation />} /></Routes>
            </MemoryRouter>
        );
        const target = (place.tile ?? place.field)!;
        expect(container.querySelector(target), target).not.toBeNull();
    });
});

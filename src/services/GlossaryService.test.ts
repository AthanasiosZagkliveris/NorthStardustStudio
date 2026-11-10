import { describe, expect, it } from "vitest";

import example from "../data/examples/lumen-and-loom-studio.json";
import { APP_TERMS } from "../data/glossary";
import { SOURCES } from "../framework/engine/Sources";
import { GlossaryService, namedCardsOfPage } from "./GlossaryService";

describe("the Glossary's terms", () => {

    it("reads your terms from the saved answers: the named cards, with their kind", () => {
        const systems = (example as { systems: Record<string, { responses: { sectionNumber: number; value: unknown }[] }> }).systems;
        const terms = systems["3"].responses.flatMap(response => namedCardsOfPage(response.value, 3, response.sectionNumber));
        const byName = new Map(terms.map(term => [term.name, term.kind]));
        expect(byName.get("London Homemakers")).toBe("Segment");
        expect(byName.get("The Considered Nester")).toBe("Profile");
        expect(byName.get("Weaving Workshops")).toBe("Offering");
        // A channel is named by the app, not by you: not a term of yours.
        expect(byName.has("Instagram")).toBe(false);
    });

    it("gives every app term a meaning and cites only registered sources", () => {
        const ids = new Set(APP_TERMS.map(term => term.id));
        expect(ids.size).toBe(APP_TERMS.length);
        for (const term of APP_TERMS) {
            expect(term.meaning.length, term.id).toBeGreaterThan(20);
            for (const source of term.sources ?? []) {
                expect(SOURCES[source], term.id + " " + source).toBeTruthy();
            }
        }
    });

});

describe("the app's terms that have appeared", () => {
    it("lists an app term once one of its pages holds an answer, and every term with no Organisation", () => {
        const all = GlossaryService.appTerms();
        expect(GlossaryService.appTermsAppeared([])).toHaveLength(all.length);
        // (An Organisation with nothing saved: no page holds an answer, so no term with a place has appeared.)
        expect(GlossaryService.appTermsAppeared(["no-such-organisation"]).every(term => !term.places)).toBe(true);
    });
});

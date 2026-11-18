import { describe, expect, it } from "vitest";

/**
 * "&" IN LABELS AND OPTIONS (owner, 2026-10-29/30: '"and" is "&" in the card's labels and options'; again 2026-11-19 00:24 UTC+2: "I have said use & instead of
 * and"): a label or an option the app writes says "&", never " and ". Kept as they are, and named here: a full sentence (it reads as one), an official
 * classification's own name (the layout rules' exception: official and legal names stay as written), and a channel cost template's name, which a card made from
 * it keeps as its name and is found by (renaming it would lose the cards already made).
 */
const KEPT = new Set([
    // Sentences.
    "After comparing options: They weigh prices, features and reviews first",
    "On impulse: They see it, like it and buy it there and then",
    "One person decides: The person who uses it has the budget and the final say.",
    "Several departments check: IT or security, legal and finance.",
    "The team agrees: The people who use it try it and push it upward.",
    "They tell friends and family",
    // The sectors, by their classifications' names.
    "Administrative and support services",
    "Arts, sport and recreation",
    "Energy, water and waste",
    "Farming, forestry and fishing",
    "Finance and insurance",
    "Government and public administration",
    "Health and social care",
    "Human services & public sector, and other services",
    "Mining, oil, gas and quarrying",
    "Professional, scientific and technical services",
    "Real estate and property",
    "Software, IT, media and telecoms",
    "Tech, data & media, and business services",
    "Transport, postal and logistics",
    "Wholesale and retail trade",
    // The Profile's care options (ProfileQuestions, CARES), whose saved ids are made from their words: renaming them would lose the answers saved; the library's
    // rating sample mirrors them. Put to the owner (2026-11-19).
    "Quality and results",
    // Channel cost templates (a card's name, found by it).
    "Ads and influencers",
    "Marketplace fees and commission",
    "Packaging and samples",
    "Printing and postage",
    "Travel and van hire"
]);

/** Every source of the app (its tests aside), as text. */
const sources = import.meta.glob(["../../**/*.{ts,tsx}", "../../../src/data/**/*.ts", "!../../**/*.test.{ts,tsx}"], { query: "?raw", import: "default", eager: true }) as Record<string, string>;

describe("labels and options say & (owner, 2026-10-29/30 and 2026-11-19)", () => {
    it("has no ' and ' in a label the app writes, but the sentences and names kept on purpose", () => {
        const found = Object.values(sources)
            .flatMap(text => [...text.matchAll(/label: "([^"]* and [^"]*)"/g)].map(match => match[1]))
            .filter(label => !KEPT.has(label));
        expect(found).toEqual([]);
    });
});

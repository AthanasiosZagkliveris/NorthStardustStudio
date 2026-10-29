import { describe, expect, it } from "vitest";

import designDocument from "../../../docs/design/current/01-current-design.md?raw";
import { BUSINESS_PARTNER_GROUPS, BUSINESS_OFFERING_RESOURCE_GROUPS, BUSINESS_RESOURCE_GROUPS, partnerGroupHelp } from "./AnswerUtils";

/* The help texts of docs/design/current/01-current-design.md (part H) are the ones the app shows: the 47 groups, the partner and supplier groups included. */

/* The cells of the document's tables, one entry each. */
const doc = designDocument
    .split("\n")
    .filter(line => line.startsWith("|"))
    .flatMap(line => line.replace(/^\||\|$/g, "").split(/(?<!\\)\|/))
    .map(cell => cell.replace(/\\\|/g, "|"))
    .flatMap(cell => cell.split("<br>"))
    .map(cell => cell.trim())
    .filter(Boolean);

const sentence = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

describe("the partner and supplier groups carry the help text of the help-texts document", () => {

    const groups = (["infrastructure", "offering"] as const).flatMap(place =>
        (["partners", "suppliers"] as const).flatMap(type => BUSINESS_PARTNER_GROUPS[place][type].map(group => ({ place, type, group })))
    );

    it("has fifteen groups, each with a text", () => {
        expect(groups.length).toBe(15);
        groups.forEach(({ group }) => expect(group.help.length).toBeGreaterThan(20));
    });

    it.each(groups.map(entry => [entry.group.label, entry] as const))("%s: its text is the document's, word for word", (_label, { group }) => {
        expect(doc.some(line => sentence(line) === sentence(group.help))).toBe(true);
    });

    it("is read through partnerGroupHelp, and says nothing for no group", () => {
        expect(partnerGroupHelp("infrastructure", "suppliers", "technical-support")).toMatch(/An installation is linked to the asset it installs\.$/);
        expect(partnerGroupHelp("offering", "suppliers", "")).toBe("");
        expect(partnerGroupHelp("offering", undefined, "platforms-payments")).toBe("");
    });

    it("keeps no dash that reads as an em dash", () => {
        groups.forEach(({ group }) => expect(group.help).not.toMatch(/—/));
    });

});

describe("every resource group carries the help text of the document", () => {

    const kinds = [...BUSINESS_RESOURCE_GROUPS, ...BUSINESS_OFFERING_RESOURCE_GROUPS].flatMap(category => category.kinds);

    it("has a text for each, taken from the document", () => {
        const found = kinds.filter(kind => kind.help.length > 0);
        expect(found.length).toBeGreaterThanOrEqual(31);
        found.forEach(kind => expect(doc.some(line => sentence(line) === sentence(kind.help))).toBe(true));
    });

});

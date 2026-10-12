import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";

import BusinessCapabilityEditor from "./BusinessCapabilityEditor";
import { captionText, floatingCardHost } from "../../test/interviewTestUtils";
import { asBusinessCapabilityValue, createBusinessActivity, createBusinessPartner, createBusinessResourceSlot } from "../../framework/engine/AnswerUtils";

afterEach(cleanup);

const NBSP = / /g;

const founder = (id: string, name: string) => ({ id, name, ownership: "50", capital: "", roles: [""], experience: "" });

function seeded() {
    const base = asBusinessCapabilityValue(undefined);
    const named = <T extends { name: string }>(card: T, name: string): T => ({ ...card, name });
    return {
        ...base,
        resources: {
            utilities: [{ id: "electricity", name: "", slots: [named(createBusinessResourceSlot(), "Mains power")] }],
            workstation: [{ id: "furniture", name: "", slots: [named(createBusinessResourceSlot(), "Standing desk")] }]
        },
        activities: [
            { id: "operational", name: "", activities: [named(createBusinessActivity(), "Book the studio"), named(createBusinessActivity(), "Pay the rent")] },
            { id: "marketing", name: "", activities: [{ ...named(createBusinessActivity(), "Launch the shop"), completed: true }] }
        ],
        providers: [named(createBusinessPartner(), "Maker Yard")],
        offering: {
            ...base.offering,
            resources: [named(createBusinessResourceSlot(), "Yarn"), named(createBusinessResourceSlot(), "Dye")],
            activities: [named(createBusinessActivity(), "Weave the pieces"), { ...named(createBusinessActivity(), "Ship the order"), completed: true }],
            professionals: [named(createBusinessPartner(), "Tutor")],
            providers: [named(createBusinessPartner(), "Courier")]
        }
    };
}

function Harness({ initial = seeded() }: { initial?: unknown }) {
    const [value, setValue] = useState<unknown>(initial);
    return (
        <BusinessCapabilityEditor
            value={value}
            onChange={setValue}
            legalEntityFounders={[founder("f1", "Ann"), founder("f2", "Bo")]}
        />
    );
}

/** Every tile's slot: its title and its list links. */
function slots() {
    return [...document.querySelectorAll<HTMLElement>(".section-tile-slot")].map(slot => ({
        slot,
        title: slot.querySelector(".section-tile-title")!.textContent!.replace(NBSP, " "),
        links: [...slot.querySelectorAll<HTMLButtonElement>("button.section-tile-link")]
    }));
}

/**
 * Walks EVERY link of EVERY tile's list on the page, twice each, and says how many it walked: the card that opens is the item that was pressed, of
 * the kind its tile holds, under its tile's name; Back closes it and the focus is on the item again.
 */
function walkEveryLink(): number {
    let walked = 0;
    const kinds: Record<string, RegExp> = {
        Founders: /./,
        Utilities: /^Resource \d+ name/,
        Workstation: /^Resource \d+ name/,
        Equipment: /^Resource \d+ name/,
        "Digital Infrastructure": /^Resource \d+ name/,
        Operational: /^Activity \d+ name/,
        Production: /^Activity \d+ name/,
        Marketing: /^Activity \d+ name/,
        "Sales & Customer": /^Activity \d+ name/,
        Completed: /^Activity \d+ name/,
        "Partners": /^Professional \d+ name/,
        Providers: /^Provider \d+ name/,
        Resources: /^Resource \d+ name/,
        Activities: /^Activity \d+ name/,
        "Partners & Suppliers": /^(Professional|Provider) \d+ name/
    };
    // (Two tiles are called Completed -- Infrastructure's and Offering's Capability's: a tile is found by its place on the page.)
    slots().forEach(({ title, links }, place) => {
        for (let at = 0; at < links.length; at++) {
            const text = links[at].textContent!.trim().replace(NBSP, " ");
            for (let round = 0; round < 2; round++) {
                // (The list is drawn again after a card: the link is looked for afresh.)
                const link = slots()[place].links[at];
                fireEvent.click(link);
                const where = title + " > " + text + " (press " + (round + 1) + ")";
                const dialogName = title;
                if (floatingCardHost() === null) {
                    // A category link: the section's dialog, on that category's own view (every category has its own tile now, whatever it holds).
                    const dialog = screen.getByRole("dialog");
                    expect(dialog.classList.contains("section-tile-dialog"), where).toBe(true);
                    expect(floatingCardHost(), where).toBeNull();
                    expect(dialog.querySelector(".dialog-heading-sub")!.textContent, where).toBe(text);
                    for (let back = 0; back < 3 && document.querySelector(".section-tile-dialog"); back++) {
                        fireEvent.click(document.querySelector(".section-tile-back")!);
                    }
                    expect(document.querySelector(".section-tile-dialog"), where).toBeNull();
                    walked++;
                    continue;
                } else {
                    const card = floatingCardHost()!;
                    expect(card.getAttribute("aria-label"), where).toBe(dialogName);
                    expect(card.classList.contains("floating-card-host"), where).toBe(true);
                    // Exactly one card, under its tile's name.
                    expect(card.querySelectorAll(".floating-card-item"), where).toHaveLength(1);
                    expect(captionText(card.querySelector(".floating-card-caption")!), where).toBe(dialogName);
                    const field = card.querySelector<HTMLTextAreaElement>("textarea.card-name-input");
                    const shown = field ? field.value : card.querySelector(".strategy-name-static")!.textContent!;
                    if (title === "Founders" || title === "Completed") {
                        expect(shown, where).toBe(text);
                    } else {
                        // (A category link opens its view; only a category with no card yet makes ONE blank card and opens it floating -- Back takes it away again.)
                        expect(shown, where).toBe("");
                    }
                    if (field) {
                        expect(field.getAttribute("aria-label")!, where).toMatch(kinds[title]);
                    }
                }
                // Back closes the card alone (the view it came from, if any, stays under it); Escape then closes the rest.
                fireEvent.mouseDown(document.body);
                expect(floatingCardHost(), where).toBeNull();
                fireEvent.keyDown(document, { key: "Escape" });
                expect(screen.queryByRole("dialog"), where).toBeNull();
                // The focus is back on the item that opened it.
                expect(document.activeElement, where).toBe(slots()[place].links[at]);
                walked++;
            }
        }
    });
    return walked;
}

describe("every link of every tile's list", () => {

    it("opens the right card -- the item that was pressed, of the kind its tile holds -- under its tile's name; Back closes it and the focus is back on the item; a second press works", () => {
        render(<Harness />);
        // Infrastructure: Founders (2), Resources (the Workspace form and the subcategories that name cards), Activities and Partners & Suppliers (their
        // categories); Offering's Capability: Resources, Activities and Partners & Suppliers -- each link twice.
        expect(walkEveryLink()).toBeGreaterThanOrEqual(24);
    }, 90000);

    it("walks the page of a fresh organization too: every tile without a link is plain, and nothing breaks", () => {
        render(<Harness initial={asBusinessCapabilityValue(undefined)} />);
        expect(walkEveryLink()).toBeGreaterThanOrEqual(6);
    }, 90000);

    it("draws no list item under the + box of its tile", () => {
        render(<Harness />);
        for (const { slot } of slots()) {
            const plus = slot.querySelector(".section-tile-plus");
            expect(plus === null || slot.classList.contains("section-tile-slot-plus")).toBe(true);
        }
        // The layer's bottom padding keeps the list clear of the + box (the probe measures it on the page).
        expect(document.querySelectorAll(".section-tile-slot-plus > .section-tile-links-layer").length).toBeGreaterThan(0);
    });

});

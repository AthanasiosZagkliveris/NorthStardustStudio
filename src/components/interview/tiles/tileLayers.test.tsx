import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import BusinessCapabilityEditor from "../editors/BusinessCapabilityEditor";
import { closeAllTiles, closeTile, floatingCardHost, infrastructureCard, openCard, openTile, tileButton, toggles, topDialog } from "../../../test/interviewTestUtils";
import { asBusinessCapabilityValue, createBusinessActivity, createBusinessResourceSlot } from "../../../framework/engine/answers/AnswerUtils";
import { stylesheet } from "../../../test/stylesheet";
import SectionTiles, { dialogFrame, tailPlacement } from "./SectionTiles";
import { OPEN_EVENT } from "./FloatingCards";

afterEach(cleanup);

const founder = (id: string, name: string) => ({ id, name, ownership: "50", capital: "", roles: [""], experience: "" });

function Harness({ initial, engagement, founders }: { initial?: unknown; engagement?: unknown; founders?: number }) {
    const [value, setValue] = useState<unknown>(initial ?? asBusinessCapabilityValue(undefined));
    const list = founders === undefined
        ? [founder("f1", "Ann"), founder("f2", "Bo")]
        : Array.from({ length: founders }, (_, index) => founder("f" + (index + 1), "Founder Name " + (index + 1)));
    return (
        <BusinessCapabilityEditor
            value={value}
            onChange={setValue}
            engagement={engagement}
            legalEntityFounders={list}
        />
    );
}


/** A resource card of that name. */

const utilitySlot = (name: string) => ({ ...createBusinessResourceSlot(), name });

/**
 * A value whose Utilities, Workstation, Equipment, Vehicles, Digital Infrastructure and Documents & Rights each hold two cards (a category with two cards or
 * more is a category tile in the Resources view), all in one group: Premises Utilities, Furniture & Fittings, Devices & Tools, Company Vehicles, Software & Web, Insurances.
 */

const twoInEach = () => ({
    ...asBusinessCapabilityValue(undefined),
    resources: {
        utilities: [{ id: "premises-utilities", name: "", slots: [utilitySlot("Mains"), utilitySlot("Generator")] }],
        workstation: [{ id: "furniture-fittings", name: "", slots: [utilitySlot("Desk"), utilitySlot("Chair")] }],
        equipment: [{ id: "devices-tools", name: "", slots: [utilitySlot("Monitor"), utilitySlot("Printer")] }],
        digital: [{ id: "software-web", name: "", slots: [utilitySlot("Editor"), utilitySlot("Ledger")] }],
        vehicles: [{ id: "company-vehicles", name: "", slots: [utilitySlot("Van"), utilitySlot("Bike")] }],
        documents: [{ id: "insurances", name: "", slots: [utilitySlot("Cover"), utilitySlot("Policy")] }]
    }
});

describe("the tiles' stylesheet", () => {

    const css = stylesheet("section-tiles.css");

    it("draws every tile a true square of one size token, left-aligned in a 12px grid of the one shape", () => {
        const global = stylesheet("global.css");
        expect(global).toMatch(/--section-tile-min: 120px;/);
    });

    it("keeps page 3's heading and the cards' title rows in place and scrolls each card's body on its own", () => {
        const page = stylesheet("conversation.css");
        // The page no longer locks to the window: the area grows down and the page scrolls; no card scrolls inside.
        // (Side by side from the Laptop tier: a landscape window 900px wide and 640px tall -- the responsive layout, 2026-11-23.)
        expect(page).toMatch(/@media \(min-width: 900\.02px\) and \(orientation: landscape\) and \(min-height: 640px\) ?\{[^@]*\.conversation-page:has\(\.answer-columns\.business-capability\) ?\{ ?min-height: ?100vh;/);
        expect(page).not.toMatch(/\.conversation-page:has\(\.answer-columns\.business-capability\) ?\{[^}]*overflow: ?hidden;/);
        expect(page).toMatch(/\.conversation-card \.answer-columns\.business-capability ?\{[^}]*grid-template-rows: ?auto;/);
        expect(page).toMatch(/\.answer-columns\.business-capability > \.business-foundation-card ?\{ ?max-height: ?none;/);
        expect(page).toMatch(/\.business-capability > \.business-foundation-card > \.card-scroll ?\{ ?flex: ?1 1 auto;[^}]*overflow: ?visible;/);
    });

    it("sets the page's two cards side by side in the page's two equal columns, stacked where every page's chapters stack (under 900px, a portrait window or under 640px tall)", () => {
        const page = stylesheet("conversation.css");
        expect(page).toMatch(/\.business-capability > \.business-foundation-card ?\{ ?grid-column: ?auto;[^}]*align-self: ?start; ?\}/);
        // (The one stacking query, 07-floating-cards-and-page-layout.css; owner, 2026-11-22 09:52 and 09:58 UTC+2; layout rules section 23.)
        const tiles = stylesheet("section-tiles.css");
        expect(tiles).toMatch(/@media \(max-width: 900px\), \(orientation: portrait\), \(max-height: 639px\) ?\{[^@]*\.business-capability:not\(\.page-group \.answer-columns\) > \.business-foundation-card:is\(:nth-child\(1\), :nth-child\(2\)\) ?\{ ?grid-column: ?1 \/ -1;/);
        expect(page).not.toMatch(/@container page-card \(max-width: 699px\) ?\{[^@]*\.business-capability[^{]*> \.business-foundation-card:is/);
    });

    it("draws no rule down the left of a group of sections any more", () => {
        expect(stylesheet("conversation.css")).not.toMatch(/\.business-capability-group\s*\{/);
    });

    it("centres the content of every dialog across it, starting at the top", () => {
        expect(css).toMatch(/\.section-tile-dialog-body \{[^}]*justify-content: flex-start;/);
        expect(css).toMatch(/\.section-tile-dialog \.section-tiles \{[^}]*justify-content: center;[^}]*max-width: none;/);
        expect(css).toMatch(/\.card-box-open \{[^}]*width: min\(100%, var\(--open-card-width\)\);[^}]*margin-inline: auto;/);
        expect(css).not.toMatch(/\.workspace-card/);
        expect(css).toMatch(/\.founder-row \{[^}]*margin-inline: auto;/);
    });

});

describe("the page's cards and titles", () => {

    it("gives each card its column title as its one label, with no head of its own, and nothing in it folds", () => {
        render(<Harness />);
        expect(document.querySelector(".business-capability-card-head")).toBeNull();
        const cards = [...document.querySelectorAll(".business-capability > .business-foundation-card")];
        expect(cards).toHaveLength(2);
        // The title is the first thing in its card (no title row outside the cards).
        expect(cards.map(card => card.querySelector(":scope > .card-title-block .answer-column-label")?.textContent))
            .toEqual(["1.Infrastructure", "2.Offering's Capability"]);
        expect(document.querySelector(".business-capability > .answer-column-label")).toBeNull();
        // No fold arrow at all on the page itself (the tiles are the grouping), nor "Expand all".
        expect(toggles(/.*/).filter(b => !/^(Show|Hide) help for /.test(b.getAttribute("aria-label") ?? ""))).toHaveLength(0);
        expect(screen.queryByRole("button", { name: /Expand all|Collapse all/ })).toBeNull();
        // The sections have no headings on the page (their tiles stand in for them); the heading is drawn in the section's dialog.
        expect(document.querySelectorAll(".business-capability-section > .business-engagement-section-head .business-foundation-subhead")).toHaveLength(0);
        expect(document.querySelector("[data-anchor='capability-infrastructure']")).toBeTruthy();
        expect(document.querySelector("[data-anchor='capability-offering-capability']")).toBeTruthy();
    });

    it("lines up the first tile rows of the two cards with a heading-height row in Capability", () => {
        render(<Harness />);
        const spacer = document.querySelector(".business-capability-heading-spacer")!;
        expect(spacer.getAttribute("aria-hidden")).toBe("true");
        expect(spacer.nextElementSibling!.querySelector(".section-tile")).toBeTruthy();
        // (No heading-height row between the title and the tiles of the two page cards any more: the spacer is not drawn.)
        expect(stylesheet("conversation.css")).toMatch(/\.business-capability-heading-spacer ?\{\s*display: ?none;/);
        expect(stylesheet("global.css")).toMatch(/--section-head-height: 36px;/);
    });

    it("hides every title's guidance to begin with, and opens one at a time with its own arrow", () => {
        render(<Harness />);
        expect(document.querySelector(".answer-column-questions")).toBeNull();

        const first = screen.getByRole("button", { name: "Show help for Infrastructure" });
        const second = screen.getByRole("button", { name: "Show help for Offering's Capability" });
        expect(first.getAttribute("aria-expanded")).toBe("false");
        expect(second.getAttribute("aria-expanded")).toBe("false");

        fireEvent.click(first);
        const open = screen.getByRole("button", { name: "Hide help for Infrastructure" });
        expect(open.getAttribute("aria-expanded")).toBe("true");
        const help = document.getElementById(open.getAttribute("aria-controls")!)!;
        expect(help.textContent).toMatch(/Record the resources, activities, partners and suppliers/);
        // The other title is untouched.
        expect(screen.getByRole("button", { name: "Show help for Offering's Capability" }).getAttribute("aria-expanded")).toBe("false");
        expect(document.querySelectorAll(".answer-column-questions")).toHaveLength(1);

        // Opening the other closes this one: one panel at a time.
        fireEvent.click(second);
        expect(document.querySelectorAll(".answer-column-questions")).toHaveLength(1);
        expect(screen.getByRole("button", { name: "Show help for Infrastructure" })).toBeTruthy();
        expect(screen.getByRole("button", { name: "Hide help for Offering's Capability" })).toBeTruthy();

        // The arrow closes it.
        fireEvent.click(screen.getByRole("button", { name: "Hide help for Offering's Capability" }));
        expect(document.querySelectorAll(".answer-column-questions")).toHaveLength(0);
    });

    it("drops the guidance over the card, taking no room: it is absolutely positioned under the title", () => {
        render(<Harness />);
        fireEvent.click(screen.getByRole("button", { name: "Show help for Infrastructure" }));
        const panel = document.querySelector(".card-title-help")!;
        expect(panel.parentElement!.classList.contains("card-title-block")).toBe(true);
        const css = stylesheet("title-arrow.css");
        expect(css).toMatch(/\.card-title-block \{[^}]*position: relative;/);
        expect(css).toMatch(/\.card-title-block > \.card-title-help \{[^}]*position: absolute;[^}]*left: 0;[^}]*right: 0;[^}]*z-index: 22;/);
    });

    it("closes the guidance with Escape (the key goes no further) and with a press outside it", () => {
        render(<Harness />);
        const page = vi.fn();
        window.addEventListener("keydown", page);
        const arrow = () => screen.getByRole("button", { name: /help for Infrastructure/ });

        fireEvent.click(arrow());
        expect(document.querySelector(".card-title-help")).toBeTruthy();
        fireEvent.keyDown(document.body, { key: "Escape" });
        expect(document.querySelector(".card-title-help")).toBeNull();
        expect(page).not.toHaveBeenCalled();
        window.removeEventListener("keydown", page);

        fireEvent.click(arrow());
        // A press inside the panel keeps it; one outside closes it.
        fireEvent.mouseDown(document.querySelector(".card-title-help")!);
        expect(document.querySelector(".card-title-help")).toBeTruthy();
        fireEvent.mouseDown(document.body);
        expect(document.querySelector(".card-title-help")).toBeNull();
    });

    it("sets the tile titles one step up the type scale, the body size (18px)", () => {
        expect(stylesheet("section-tiles.css")).toMatch(/\.section-tile \{[^}]*font-size: var\(--font-body\);/);
    });

    it("sizes every title on the one fluid type scale, in rem, in a hierarchy: page 24 to 36, column title 20 to 28, dialog title and section heading 18 to 24, body 16 to 18, small 13 to 14", () => {
        const global = stylesheet("global.css");
        expect(global).toMatch(/--font-h1: clamp\(1\.5rem, [^;]*, 2\.25rem\);/);
        expect(global).toMatch(/--font-h2: clamp\(1\.25rem, [^;]*, 1\.75rem\);/);
        expect(global).toMatch(/--font-h3: clamp\(1\.125rem, [^;]*, 1\.5rem\);/);
        expect(global).toMatch(/--font-body: clamp\(1rem, [^;]*, 1\.125rem\);/);
        expect(global).toMatch(/--font-small: clamp\(0\.8125rem, [^;]*, 0\.875rem\);/);
        const css = stylesheet("section-tiles.css");
        expect(css).toMatch(/\.business-capability > \.business-foundation-card:not\(\.section-tile-dialog\) \.answer-column-label \{[^}]*font-size: var\(--font-h2\);/);
        expect(css).toMatch(/\.business-capability-tiles-section > \.business-engagement-section-head \.field-group-title,\s*\.section-tile-dialog-body > div > \.business-engagement-section-head \.field-group-title,\s*\.workbook-head > \.business-engagement-section-head \.field-group-title \{[^}]*font-size: var\(--font-h3\);/);
    });

});

describe("the dialog's square and backdrop", () => {

    it("measures a page-wide frame from the underline of the page heading to 12px above the window's foot, over the footer's band (owner, 2026-11-12), the page card area's width, at most 92% of the window's", () => {
        const line = document.createElement("div");
        line.className = "interview-divider";
        const footer = document.createElement("footer");
        footer.className = "workspace-footer";
        document.body.append(line, footer);
        line.getBoundingClientRect = () => ({ bottom: 200, top: 198 } as DOMRect);
        footer.getBoundingClientRect = () => ({ top: 900, bottom: 964 } as DOMRect);
        Object.defineProperty(window, "innerWidth", { value: 1600, configurable: true });
        Object.defineProperty(window, "innerHeight", { value: 964, configurable: true });
        // No card area: 92% of the window.
        expect(dialogFrame()).toEqual({ width: 1472, height: 752, top: 200 });
        const area = document.createElement("div");
        area.className = "conversation-card";
        area.getBoundingClientRect = () => ({ width: 1400 } as DOMRect);
        document.body.append(area);
        expect(dialogFrame()).toEqual({ width: 1400, height: 752, top: 200 });
        Object.defineProperty(window, "innerWidth", { value: 1000, configurable: true });
        expect(dialogFrame()).toEqual({ width: 920, height: 752, top: 200 });
        area.remove();
        Object.defineProperty(window, "innerWidth", { value: 1600, configurable: true });
        // Without the lines the CSS fallback applies.
        line.remove();
        expect(dialogFrame()).toBeNull();
        footer.remove();
    });

    it("closes on a click on the dimmed backdrop, not on one inside the dialog or a drag that began inside", () => {
        render(<Harness />);
        const tile = tileButton("Workspace");
        fireEvent.click(tile);
        const dialog = topDialog();
        const overlay = dialog.parentElement!;

        fireEvent.mouseDown(dialog);
        fireEvent.click(dialog);
        expect(screen.queryByRole("dialog")).toBeTruthy();

        // A press that starts inside and is released on the backdrop (a text drag) stays open.
        fireEvent.mouseDown(dialog);
        fireEvent.click(overlay);
        expect(screen.queryByRole("dialog")).toBeTruthy();

        fireEvent.mouseDown(overlay);
        fireEvent.click(overlay);
        expect(screen.queryByRole("dialog")).toBeNull();
        expect(document.activeElement).toBe(tile);
    });

});

describe("the Founders tile: the founders are tiles, and a card opens floating, the width of any card", () => {

    it("is no exception: every dialog has the one frame, so none carries a wide class", () => {
        render(<Harness founders={3} />);
        openTile("Founders");
        expect(screen.getByRole("dialog", { name: "Founders" }).className).not.toMatch(/wide/);
        closeTile();
        // (A section view of tiles has the same frame: Infrastructure's Resources, with Utilities holding two cards.)
        cleanup();
        render(<Harness initial={twoInEach()} />);
        fireEvent.click(tileButton("Resources", infrastructureCard()));
        expect(topDialog().className).not.toMatch(/wide/);
    });

    it("shows the founders as card tiles (name and role), however many there are, with no open cards in the dialog", () => {
        for (const count of [2, 4, 9]) {
            const { unmount } = render(<Harness founders={count} />);
            openTile("Founders");
            const dialog = topDialog();
            expect(dialog.querySelector(".founder-row")).toBeNull();
            const boxes = within(dialog).getAllByRole("button", { name: /Founder Name/ });
            expect(boxes).toHaveLength(count);
            expect(boxes.every(box => box.classList.contains("section-tile"))).toBe(true);
            expect(within(dialog).queryByText("Salary")).toBeNull();
            unmount();
        }
    });

    it("pressing a founder tile opens that founder's card floating, in the card width of every other card", () => {
        render(<Harness founders={9} />);
        openTile("Founders");
        fireEvent.click(within(topDialog()).getAllByRole("button", { name: /Founder Name/ })[2]);
        const card = floatingCardHost()!;
        expect(card).toBeTruthy();
        expect(card.querySelector(".business-founder-open")).toBeTruthy();
        expect(within(card).getAllByText("Salary")).toHaveLength(1);
        expect(within(card).queryByRole("button", { name: /Maximise|Minimise/ })).toBeNull();
        // (The card is the width of any card, not a founder's own 297px.)
        expect(card.getAttribute("data-card-kind") ?? "card").toBe("card");
    });

    it("names a founder's tile for a link to it, which presses it (data-opens)", () => {
        render(<Harness founders={9} />);
        openTile("Founders");
        const box = topDialog().querySelector("[data-anchor='f4']")!;
        expect(box.hasAttribute("data-opens")).toBe(true);
    });

    it("lists each founder with the rate of their responsibilities on the Founders tile", () => {
        render(<Harness founders={3} />);
        expect(tileButton("Founders").getAttribute("aria-label")).toBe("Founders, Founder Name 1, Founder Name 2, Founder Name 3");
    });

});

describe("the app header over the page's layers", () => {

    it("is never made inert by a dialog, though the page around it is, and the header z-order rule is in the stylesheet", () => {
        const root = document.createElement("div");
        const header = document.createElement("header");
        header.className = "app-header";
        const page = document.createElement("div");
        root.append(header, page);
        document.body.append(root);
        render(<Harness />, { container: page });
        fireEvent.click(tileButton("Activities", infrastructureCard()));
        expect(document.querySelector(".section-tile-dialog")).not.toBeNull();
        expect(header.closest("[inert]")).toBeNull();
        expect(root.hasAttribute("inert")).toBe(false);
        expect(page.hasAttribute("inert")).toBe(true);
        expect(stylesheet("app-header.css").includes("body:has(.section-tile-overlay) .app-header { z-index: 1001; }")).toBe(true);
        closeAllTiles();
        expect(page.hasAttribute("inert")).toBe(false);
        root.remove();
    });

    it("lets a press or an Escape in the header alone: a press there does not close a floating card, an Escape typed there with Notes open is Notes\u2019", () => {
        const root = document.createElement("div");
        const header = document.createElement("header");
        header.className = "app-header";
        const panel = document.createElement("section");
        panel.className = "notepad-panel";
        const note = document.createElement("textarea");
        panel.append(note);
        header.append(panel);
        const page = document.createElement("div");
        root.append(header, page);
        document.body.append(root);
        render(<Harness initial={{ ...asBusinessCapabilityValue(undefined), activities: [{ id: "operational", name: "", activities: [{ ...createBusinessActivity("operational"), name: "Dye" }] }] }} />, { container: page });
        fireEvent.click(tileButton("Activities", infrastructureCard()));
        fireEvent.click(screen.getAllByRole("button").find(button => /Dye/.test(button.textContent ?? "") && button.classList.contains("section-tile-link"))!);
        expect(document.querySelector(".floating-overlay")).not.toBeNull();
        fireEvent.mouseDown(note);
        expect(document.querySelector(".floating-overlay")).not.toBeNull();
        fireEvent.keyDown(note, { key: "Escape" });
        expect(document.querySelector(".floating-overlay")).not.toBeNull();
        // (With nothing open in the header, the same key closes the layers.)
        panel.remove();
        fireEvent.keyDown(header, { key: "Escape" });
        closeAllTiles();
        root.remove();
    });

});

void openCard;

describe("tailPlacement", () => {
    it("puts the tail tile right of the last tile of a 2 x 2 square, in a third column", () => {
        expect(tailPlacement(4, 2)).toEqual({ row: 2, column: 3, columns: 3 });
    });
    it("fills the first free cell of a short last row", () => {
        expect(tailPlacement(5, 3)).toEqual({ row: 2, column: 3, columns: 3 });
    });
    it("starts a new row when the last row is full and wide", () => {
        expect(tailPlacement(6, 3)).toEqual({ row: 3, column: 1, columns: 3 });
    });
});

describe("THE CAROUSEL ARROWS beside the card or the section opened last", () => {

    it("goes to the next and the previous card of the tile, round its ends", () => {
        render(<Harness initial={twoInEach()} />);
        openTile("Utilities");
        openCard("Mains");
        const name = () => (screen.getByRole("textbox", { name: /Resource \d+ name/ }) as HTMLTextAreaElement).value;
        expect(name()).toBe("Mains");
        fireEvent.click(screen.getByRole("button", { name: "Next card" }));
        expect(name()).toBe("Generator");
        fireEvent.click(screen.getByRole("button", { name: "Next card" }));
        expect(name()).toBe("Mains");
        fireEvent.click(screen.getByRole("button", { name: "Previous card" }));
        expect(name()).toBe("Generator");
    });

    it("goes through the sections from an opened section, and leaves the dialog's own arrows out of sight under a card", () => {
        render(<Harness initial={twoInEach()} />);
        openTile("Resources");
        const title = () => document.querySelector(".section-tile-dialog-name")?.textContent;
        expect(title()).toBe("Resources");
        fireEvent.click(screen.getByRole("button", { name: "Next section" }));
        expect(title()).toBe("Activities");
        fireEvent.click(screen.getByRole("button", { name: "Previous section" }));
        expect(title()).toBe("Resources");
    });

});

describe("THE ROWS OF A TABLE THAT HOLD THE OPEN CARD (a Journey Stage's subchannels; owner, 2026-11-16 23:58)", () => {

    it("frames the whole row of the card now open -- every cell but a channel cell spanning other rows --, follows the carousel arrows, and scrolls the dialog to it", () => {
        const scrolled: string[] = [];
        const original = Element.prototype.scrollIntoView;
        Element.prototype.scrollIntoView = function (this: Element) { scrolled.push(this.closest("[data-card-row]")?.getAttribute("data-card-row") ?? this.tagName); } as typeof Element.prototype.scrollIntoView;
        const open = (card: string) => document.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { tile: "stage", card } }));
        render(<SectionTiles label="Stages" hue={200} tiles={[{
            id: "stage",
            title: "Discover",
            view: true,
            items: ["Instagram", "Etsy"],
            holds: ["s1", "s2"],
            links: [{ card: "s1" }, { card: "s2" }],
            cardFor: (id: string) => <div data-testid="card">{id}</div>,
            content: () => (
                <table>
                    <tbody>
                        {["s1", "s2"].map((id, at) => (
                            <tr key={id} data-card-row={id}>
                                {at === 0 && <td data-col="channel" rowSpan={2}>Social Media</td>}
                                <th scope="row"><button type="button" className="capability-overview-name" onClick={() => open(id)}>{id}</button></th>
                                <td data-col="offerings">Rugs</td>
                                <td data-col="actions">Post weekly</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )
        }]} />);
        try {
            fireEvent.click(tileButton("Discover"));
            fireEvent.click(screen.getByRole("button", { name: "s1" }));
            // (The cells framed: their row, their column and which edge of the frame each draws.)
            const framed = () => [...document.querySelectorAll<HTMLElement>("[data-opener-cell]")].map(cell => cell.closest("[data-card-row]")!.getAttribute("data-card-row") + ":" + (cell.getAttribute("data-col") ?? "subchannel") + ":" + cell.getAttribute("data-opener-cell"));
            expect(screen.getByTestId("card").textContent).toBe("s1");
            // (The channel cell spans both subchannels' rows: it stays out of the frame.)
            expect(framed()).toEqual(["s1:subchannel:first", "s1:offerings:middle", "s1:actions:last"]);
            expect(scrolled).toContain("s1");
            fireEvent.click(screen.getByRole("button", { name: "Next card" }));
            expect(screen.getByTestId("card").textContent).toBe("s2");
            expect(framed()).toEqual(["s2:subchannel:first", "s2:offerings:middle", "s2:actions:last"]);
            expect(scrolled[scrolled.length - 1]).toBe("s2");
        } finally {
            Element.prototype.scrollIntoView = original;
        }
    });

    it("draws one frame round the row in the links' blue, the colour a link frames its target in; the name keeps its own weight", () => {
        const css = stylesheet("card-tile.css");
        expect(css).toMatch(/\[data-opener-cell\] \{[^}]*--row-frame: var\(--text-primary\);[^}]*box-shadow: inset 0 4px 0 var\(--row-frame\), inset 0 -4px 0 var\(--row-frame\);/);
        expect(css).toMatch(/\[data-opener-cell~="first"\] \{[^}]*inset 4px 0 0 var\(--row-frame\)/);
        expect(css).toMatch(/\[data-opener-cell~="last"\] \{[^}]*inset -4px 0 0 var\(--row-frame\)/);
        expect(css).not.toMatch(/stage-record-expense-name\) \{/);
    });

});

describe("A DIALOG UNDER A FLOATING CARD (owner, 2026-11-17 00:22: \"Hide it\")", () => {

    it("hides its rail and arrows while the card is open, whether or not the card has cards beside it, and shows them again when it closes", async () => {
        const tile = (id: string, title: string, cards: string[]) => ({
            id, title, view: true, items: cards, holds: cards, links: cards.map(card => ({ card })),
            cardFor: (card: string) => <div data-testid="card">{card}</div>,
            content: () => <div>{cards.map(card => <button type="button" key={card} onClick={() => document.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { tile: id, card } }))}>{"open " + card}</button>)}</div>
        });
        render(<SectionTiles label="Stages" hue={200} tiles={[tile("discover", "Discover", ["s1"]), tile("evaluation", "Evaluation", ["s2", "s3"])]} />);
        const rails = () => document.querySelectorAll(".carousel-rail").length;
        fireEvent.click(tileButton("Discover"));
        // (The dialog steps through the stages: its rail.)
        expect(rails()).toBe(1);
        expect(screen.getByRole("button", { name: "Next section" })).toBeTruthy();
        // A card with no cards beside it: the dialog's rail and arrows are hidden all the same.
        fireEvent.click(screen.getByRole("button", { name: "open s1" }));
        expect(screen.getByTestId("card").textContent).toBe("s1");
        // (The cover is read when the page changes: a moment after the card opens.)
        await waitFor(() => expect(rails()).toBe(0));
        expect(screen.queryByRole("button", { name: "Next section" })).toBeNull();
        // Closed, the dialog's come back.
        closeTile();
        expect(screen.queryByTestId("card")).toBeNull();
        await waitFor(() => expect(rails()).toBe(1));
        expect(screen.getByRole("button", { name: "Next section" })).toBeTruthy();
    });

});

describe("an empty card is taken away however its layer is left (layout rules, section 11: \"An empty card is taken away when it is left\")", () => {

    // (A dialog that holds tiles of its own -- the Strategic Period's Themes: Escape closes every layer at once, and the inner tiles go with their dialog still open.
    // The blank Theme stayed, one more at each "+" (layout check, 2026-11-21: nine of them, then the page failed).)
    function Nested({ discard }: { discard: () => void }) {
        const inner = [{ id: "inner", title: "Inner", items: [], content: () => <p>Inner content</p>, discardIfBlank: discard }];
        const outer = [{ id: "outer", title: "Outer", items: [], content: () => <SectionTiles label="Inner tiles" hue={200} tiles={inner} /> }];
        return <SectionTiles label="Outer tiles" hue={200} tiles={outer} />;
    }

    it("removes a blank card whose dialog closes with the layer under it (Escape closes every layer)", async () => {
        const discard = vi.fn();
        render(<Nested discard={discard} />);
        fireEvent.click(screen.getByRole("button", { name: /^Outer/ }));
        fireEvent.click(await screen.findByRole("button", { name: /^Inner/ }));
        await screen.findByText("Inner content");
        expect(discard).not.toHaveBeenCalled();
        fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
        await waitFor(() => expect(screen.queryAllByRole("dialog")).toHaveLength(0));
        expect(discard).toHaveBeenCalledTimes(1);
    });

    it("removes it once when it is left with Back, a layer at a time", async () => {
        const discard = vi.fn();
        render(<Nested discard={discard} />);
        fireEvent.click(screen.getByRole("button", { name: /^Outer/ }));
        fireEvent.click(await screen.findByRole("button", { name: /^Inner/ }));
        await screen.findByText("Inner content");
        closeAllTiles();
        await waitFor(() => expect(screen.queryAllByRole("dialog")).toHaveLength(0));
        expect(discard).toHaveBeenCalledTimes(1);
    });
});

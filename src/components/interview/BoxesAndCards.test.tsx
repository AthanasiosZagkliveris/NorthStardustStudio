import { afterEach, describe, expect, it } from "vitest";
import { useState } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";

import BusinessCapabilityEditor from "./BusinessCapabilityEditor";
import OptionPicker from "./OptionPicker";
import { captionText, closeTile, floatingCardHost, infrastructureCard, offeringCard, openBox, openCard, openTile, tileButton, topDialog } from "../../test/interviewTestUtils";
import { asBusinessCapabilityValue, createBusinessActivity, createBusinessPartner, createBusinessResourceSlot } from "../../framework/engine/AnswerUtils";
import { stylesheet } from "../../test/stylesheet";

afterEach(cleanup);

const founder = (id: string, name: string) => ({ id, name, ownership: "50", capital: "", roles: [""], experience: "" });

function Harness({ initial }: { initial?: unknown }) {
    const [value, setValue] = useState<unknown>(initial ?? asBusinessCapabilityValue(undefined));
    return (
        <BusinessCapabilityEditor value={value} onChange={setValue} legalEntityFounders={[founder("f1", "Ann"), founder("f2", "Bo")]} />
    );
}

/** An Offering resource slot filed in Equipment > Production Machinery (the Capability > Resources view is grouped like Infrastructure's). */
const filed = <T extends object>(slot: T) => ({ ...slot, category: "equipment", group: "production-machinery" });

/** Opens an Offering resource card through its category tile and group box. */
function openOfferingResource(name: string) {
    openTile("Resources", undefined, undefined, offeringCard());
    openBox("Equipment");
    openBox("Production Machinery");
    openCard(name);
}

const css = stylesheet("section-tiles.css");
const global = stylesheet("global.css");
const edges = stylesheet("page-3-edges.css");

describe("the boxes have no stroke: an inset light and an inset shade", () => {

    it("takes the border out of a box altogether and gives it the light from the top left and the shade to the bottom right, per theme", () => {
        // No border at all: a transparent 1px border left a hairline of the plain ground OUTSIDE the inset shadow, in the opposite tone to the
        // light and the shade beside it. The padding takes its pixel, so nothing inside the box moves.
        expect(css).toMatch(/\.section-tile \{[^}]*padding: 1px calc\(var\(--card-padding\) \+ 1px\) calc\(var\(--card-padding\) \+ 1px\);[^}]*border: 0;[^}]*box-shadow: var\(--box-inset\);/);
        expect(css).not.toMatch(/\.section-tile \{[^}]*border: 1px solid transparent;/);
        expect(css).toMatch(/\.section-tile-links-layer \{[^}]*padding: 1px calc\(var\(--card-padding\) \+ 1px\) calc\(var\(--card-padding\) \+ 1px\);[^}]*border: 0;/);
        expect(global).toMatch(/--box-light: rgba\(255, 255, 255, 0\.75\);/);
        expect(global).toMatch(/--box-shade: rgba\(0, 0, 0, 0\.18\);/);
        expect(global).toMatch(/--box-inset: inset 3px 3px 6px var\(--box-light\), inset -3px -3px 6px var\(--box-shade\);/);
        expect(global).toMatch(/:root\[data-theme="dark"\] \{[^}]*--box-light:[^}]*--box-shade:/);
        expect(global).toMatch(/:root\[data-theme="sepia"\] \{[^}]*--box-light:[^}]*--box-shade:/);
    });

    it("keeps the hover and the focus: the glow beside the inset, and a ring by outline", () => {
        expect(css).toMatch(/\.section-tile:hover:not\(:focus-visible\) \{[^}]*box-shadow: var\(--box-inset\), 0 0 0 4px/);
        expect(css).toMatch(/\.section-tile:focus-visible \{[^}]*outline: 2px solid var\(--focus-ring-ink\);/);
        expect(css).not.toMatch(/\.section-tile:hover[^{]*\{[^}]*border-color/);
    });

    it("leaves the dashed add box its own edge", () => {
        expect(css).toMatch(/\.section-tile-add \{[^}]*border: 1px dashed hsl\(var\(--strategy-theme-hue, 0\) var\(--theme-line-edge\)\);[^}]*box-shadow: none;/);
    });

});

describe("the opened cards, their cells and the Back button have no stroke either", () => {

    it("paints the border they keep (it holds the box model) in the light and the shade, side by side, so the inset shadow runs into it", () => {
        // Top, right, bottom, left: the light on the top and the left, the shade on the right and the bottom.
        expect(edges).toMatch(/--box-edge: color-mix\(in srgb, var\(--box-light\) 55%, transparent\) color-mix\(in srgb, var\(--box-shade\) 55%, transparent\) color-mix\(in srgb, var\(--box-shade\) 55%, transparent\) color-mix\(in srgb, var\(--box-light\) 55%, transparent\);/);
        expect(edges).toMatch(/--cell-edge: color-mix\(in srgb, var\(--cell-light\) 55%, transparent\)/);
        // The cards: founder, resource / partner / provider (business-capability-slot), activity.
        expect(edges).toMatch(/\.section-tile-overlay\.business-capability :is\(\.business-capability-slot, \.business-founder-open, \.business-capability-activity\):not\(\.delivery-card\) \{[^}]*border-color: var\(--box-edge\);[^}]*box-shadow: var\(--box-inset\), var\(--card-drop, 0 0 0 0 transparent\);/);
        // The cells and the x, lighter; the Back button of a floating card.
        expect(edges).toMatch(/:is\(\.interview-input, \.option-picker-trigger\):not\(:focus\)[^{]*\{[^}]*border-color: var\(--cell-edge\);[^}]*box-shadow: var\(--cell-inset\);/);
        // (The x is the app's one remove button and keeps its own look: no rule of the edges names it.)
        expect(edges).not.toMatch(/strategy-box-remove/);
        // (The Back button of a floating card is no longer one of the edges: it is the "+" box's swap of two colours, in section-tiles.css.)
        expect(edges).not.toMatch(/floating-card-back/);
        expect(css).toMatch(/\.floating-card-host \.floating-card-back\.floating-card-back \{[^}]*border: 2px solid var\(--plus-fill\);[^}]*background: var\(--plus-ground\);[^}]*color: var\(--plus-fill\);/);
        expect(css).toMatch(/\.floating-card-back\.floating-card-back:is\(:hover, :focus-visible\) \{[^}]*border-color: transparent;[^}]*background: var\(--plus-fill\);[^}]*color: var\(--plus-ground\);/);
        // The focus ring stays.
        expect(edges).toMatch(/:is\(\.interview-input, \.option-picker-trigger\):focus[^{]*\{[^}]*box-shadow: var\(--cell-inset\), 0 0 0 3px/);
        expect(global).toMatch(/--cell-inset: inset 2px 2px 3px var\(--cell-light\), inset -2px -2px 3px var\(--cell-shade\);/);
        expect(global).toMatch(/:root\[data-theme="dark"\] \{[^}]*--cell-light:[^}]*--cell-shade:/);
    });

    it("keeps the tick boxes' own box and takes no stroke from a disabled (frozen) cell", () => {
        expect(edges).toMatch(/:is\(\.interview-input, \.option-picker-trigger\):disabled[^{]*\{[^}]*border-color: transparent;[^}]*box-shadow: none;/);
        expect(edges).not.toMatch(/brand-tick-box/);
    });

});

const workspaceSeed = () => ({
    ...asBusinessCapabilityValue(undefined),
    resources: { workspace: [{ id: "premises", name: "", slots: [{ ...createBusinessResourceSlot(), id: "workspace", name: "Dedicated Workspace", workspaceKind: "dedicated", status: "buy", cost: { price: "100", frequency: "monthly", frequencyOther: "", unit: "", currency: "" } }] }] }
});

describe("the Delivery cards take the same edges, in one block that can be taken away (a Workspace is an ordinary resource card now)", () => {

    it("keeps them out of the general rules and gives them the same tokens in a block of their own at the foot of the edges", () => {
        const at = edges.indexOf("THE WORKSPACE FORM AND THE DELIVERY CARDS");
        expect(at).toBeGreaterThan(0);
        const block = edges.slice(at, edges.indexOf("THE FOLD ARROWS"));
        expect(block).toMatch(/:is\(\.delivery-card\) \{[^}]*border-color: var\(--box-edge\);[^}]*box-shadow: var\(--box-inset\)/);
        expect(block).toMatch(/:is\(\.delivery-card\) :is\(\.interview-input, \.option-picker-trigger\):not\(:focus\) \{[^}]*border-color: var\(--cell-edge\);[^}]*box-shadow: var\(--cell-inset\);/);
        // Nothing before the block names them except to leave them out.
        const general = edges.slice(0, at);
        expect(general.replace(/:not\(\.(workspace|delivery)-card[^)]*\)/g, "").replace(/\/\*[\s\S]*?\*\//g, "")).not.toMatch(/\.(workspace|delivery)-card(?!\))/);
        // There is no Workspace card of its own to take edges: it is a resource card.
        expect(edges.replace(/\/\*[\s\S]*?\*\//g, "")).not.toMatch(/\.workspace-(card|form)/);
    });

});

describe("a tile's title, with its line, stands one line higher", () => {

    it("lifts the title by one line of its own size, the list keeping its place", () => {
        expect(css).toMatch(/--tile-title-lift: calc\(var\(--section-tile-line-height\) \* 1em\);/);
        expect(css).toMatch(/\.section-tile-title \{[^}]*margin-bottom: min\(var\(--tile-title-lift\), max\(0px, calc\(var\(--tile-title-row\) - 17px - var\(--section-tile-line-height\) \* 1em\)\)\);/);
        expect(css).toMatch(/--tile-title-row: calc\(var\(--section-tile-size\) \* var\(--tile-title-top\) - 1px \+ 5px \+ var\(--section-tile-line-height\) \* 0\.5em\);/);
    });

    it("starts the list 12px under the underline: it comes up by the lift the title measured for its tile", () => {
        expect(css).toMatch(/\.section-tile-list \{[^}]*margin: calc\(var\(--space-card\) - var\(--tile-lift, 0px\)\) 0 0;/);
        render(<Harness />);
        // (No layout in a test; the lift is written in the browser: TileTitle sets --tile-lift on the tile and on its slot, the list's two places.)
        expect(tileButton("Utilities").style.getPropertyValue("--tile-lift")).toBeDefined();
    });

});

describe("the head of an opened card", () => {

    it("starts its number at the content edge and keeps the number and the x on the name cell's first line", () => {
        expect(css).toMatch(/\.card-box-open \.strategy-box-head \{[^}]*--card-name-line: 44\.3px;[^}]*align-items: flex-start;/);
        expect(css).toMatch(/\.card-box-open \.strategy-box-head > \.strategy-box-number \{[^}]*min-width: 0;[^}]*height: var\(--card-name-line\);/);
        expect(css).toMatch(/\.card-box-open \.strategy-box-head > \.strategy-box-number > \.list-number \{[^}]*min-width: 0;[^}]*text-align: left;/);
        expect(css).toMatch(/\.card-box-open \.strategy-box-head > \.strategy-box-remove \{[^}]*margin-top: calc\(\(var\(--card-name-line\) - 32px\) \/ 2\);/);
    });

});

describe("the cards of the finished activities are grey", () => {

    it("marks an opened completed activity and gives it the Completed tint", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(<Harness initial={{ ...base, activities: [{ id: "operational", name: "", activities: [{ ...createBusinessActivity(), name: "Done one", completed: true }] }] }} />);
        fireEvent.click(within(tileButton("Completed").parentElement!).getByRole("button", { name: "Done one" }));
        const card = topDialog().querySelector(".business-capability-activity")!;
        expect(card.classList.contains("business-capability-activity-completed")).toBe(true);
        expect(css).toMatch(/\.business-capability-activity\.business-capability-activity-completed \{[^}]*border-color: var\(--line-completed\);[^}]*background: var\(--bg-completed-card\);/);
    });

    it("does not tint an active activity", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(<Harness initial={{ ...base, activities: [{ id: "operational", name: "", activities: [{ ...createBusinessActivity(), name: "Open one" }] }] }} />);
        openTile("Operational", undefined, "Open one");
        expect(topDialog().querySelector(".business-capability-activity-completed")).toBeNull();
    });

});

describe("a hugging picker is as wide as its longest option", () => {

    it("leaves its placeholder out of the width when it is told to be tight", () => {
        const { container, rerender } = render(<OptionPicker label="Frequency" placeholder="Select a frequency" hug tight options={["One-time", "Monthly"]} value="" onChange={() => undefined} />);
        const sizers = () => [...container.querySelectorAll(".option-picker-sizer")].map(span => span.textContent);
        expect(sizers()).toEqual(["One-time", "Monthly"]);
        expect(container.querySelector(".option-picker-value")!.hasAttribute("data-empty")).toBe(true);
        rerender(<OptionPicker label="Frequency" placeholder="Select a frequency" hug options={["One-time", "Monthly"]} value="" onChange={() => undefined} />);
        expect(sizers()).toEqual(["Select a frequency", "One-time", "Monthly"]);
    });

    it("is used by the Frequency of a Resource and of a Partner", () => {
        const base = asBusinessCapabilityValue(undefined);
        // (A group with several frequencies: Devices & Tools. A group with one shows it as text.)
        const slot = { ...filed({ ...createBusinessResourceSlot(), name: "Loom", status: "costs" }), group: "devices-tools" };
        render(<Harness initial={{ ...base, offering: { ...base.offering, resources: [slot] } }} />);
        openTile("Resources", undefined, undefined, offeringCard());
        openBox("Equipment");
        openBox("Devices & Tools");
        openCard("Loom");
        const frequency = screen.getByRole("button", { name: /payment frequency/ }).closest(".option-picker")!;
        expect([...frequency.querySelectorAll(".option-picker-sizer")].map(span => span.textContent)).not.toContain("Select a frequency");
    });

});

describe("a Resource card's Status is a side-label row, like its Frequency", () => {

    it("sets the label beside the dropdown in the one label column", () => {
        const base = asBusinessCapabilityValue(undefined);
        const slot = filed({ ...createBusinessResourceSlot(), name: "Loom", status: "costs" });
        render(<Harness initial={{ ...base, offering: { ...base.offering, resources: [slot] } }} />);
        openOfferingResource("Loom");
        const card = topDialog();
        const status = [...card.querySelectorAll(".business-foundation-field")].find(field => field.querySelector(":scope > .business-foundation-label-info, :scope > .field-label")?.textContent?.startsWith("Status"))!;
        expect(status.classList.contains("business-field-side")).toBe(true);
        // (It runs to the right edge of its column -- the name cell's -- instead of hugging its longest option.)
        expect(status.querySelector(".option-picker")!.getAttribute("data-size")).toBe("fit");
        // (The one short label column, --side-label-short = 164px, as the Responsible's: the card has no column of its own.)
        expect(css).not.toMatch(/--card-side-label: /);
    });

    it("gives a Workspace card (a resource card with the Workspace fields) the same side-label Status row", () => {
        render(<Harness initial={workspaceSeed()} />);
        openTile("Workspace", undefined, "Resource 1");
        const status = [...topDialog().querySelectorAll(".business-foundation-field")].find(field => field.querySelector(":scope > .business-foundation-label-info, :scope > .field-label")?.textContent?.startsWith("Status"))!;
        expect(status.classList.contains("business-field-side")).toBe(true);
    });

});

describe("the Responsible tick row is one row at every width", () => {

    it("sets the tick, its words and the dropdown on one grid row that the narrow-card rules do not stack", () => {
        const conversation = stylesheet("conversation.css");
        expect(conversation).toMatch(/\.business-foundation-field\.business-foundation-field\.business-foundation-field:not\(\.optional-field\):has\(> \.business-foundation-label-info > \.business-foundation-tick-inline\)\{[^}]*display:grid;[^}]*grid-template-columns:minmax\(min-content, var\(--side-label-short\)\) minmax\(0, 1fr\);/);
        // The optional notes (Description, Deposit) are not this field: the Workspace's Deposit row stays as it was.
        expect(conversation).toMatch(/:not\(\.optional-field\):has/);
    });

    it("puts Qty, Price, currency and Frequency on ONE row: the currency over the side pickers' left edge, the Frequency to the name cell's right edge, the Price between", () => {
        expect(css).toMatch(/.business-capability-cost-row {[^}]*--cost-x: calc\(var\(--card-side-label, var\(--side-label-short\)\) \+ var\(--side-label-gap\)\);[^}]*--qty-w: 56px;/);
        expect(css).toMatch(/\.business-capability-cost-row \{[^}]*grid-template-columns: calc\(var\(--cost-x\) - var\(--space-cell\)\) var\(--space-cell\) max-content minmax\(0, 1fr\) max-content;/);
        expect(css).toMatch(/\.business-capability-cost-grid-quantity \.business-capability-cost-row \{[^}]*grid-template-columns: var\(--qty-w\) var\(--space-cell\) calc\(var\(--cost-x\) - var\(--qty-w\) - 2 \* var\(--space-cell\)\) var\(--space-cell\) max-content minmax\(0, 1fr\) max-content;/);
    });

    it("lets the Frequency go under the row in a card too narrow for them (under 358px of content)", () => {
        expect(css).toMatch(/@container cost-fields \(max-width: 357\.98px\) \{\s*\.business-capability-cost-row \{\s*grid-template-columns: minmax\(0, 1fr\) var\(--space-cell\) max-content;/);
    });

});

describe("the box name above a floating card", () => {

    it("is plain text centred above the card, outside it, and the card is under it", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(<Harness initial={{ ...base, activities: [{ id: "operational", name: "", activities: [{ ...createBusinessActivity(), name: "First" }] }] }} />);
        openTile("Operational", undefined, "First");
        const item = topDialog().querySelector(".floating-card-item")!;
        expect([...item.children].map(child => child.className.split(" ")[0])).toEqual(["floating-card-caption", "floating-card-body"]);
        const caption = item.querySelector(".floating-card-caption")!;
        // (The caption is the name of the section tile whose list named the card: Activities.)
        expect(captionText(caption)).toBe("Activities");
        expect(caption.closest("input, textarea, .business-foundation-card, .section-tile")).toBeNull();
        expect(css).toMatch(/\.floating-card-item \{[^}]*align-items: center;[^}]*gap: var\(--space-card\);/);
        expect(css).toMatch(/\.floating-card-caption \{[^}]*font-size: var\(--font-h3\);[^}]*text-align: center;[^}]*color: var\(--floating-caption-ink\);/);
    });

    it("is also over a Workspace card, which floats under the name of the Resources tile whose list names it", () => {
        render(<Harness initial={workspaceSeed()} />);
        openTile("Workspace", undefined, "Resource 1");
        const card = floatingCardHost()!;
        expect(captionText(card.querySelector(".floating-card-caption")!)).toBe("Resources");
        expect(card.querySelector(".workspace-card")).toBeNull();
    });

    it("says the box's own 'i' after its name where the box has a note (what the dialog's header says), and none where it has none", () => {
        render(<Harness initial={{ ...asBusinessCapabilityValue(undefined), activities: [{ id: "operational", name: "", activities: [{ ...createBusinessActivity(), name: "First" }] }] }} />);
        openTile("Operational", undefined, "First");
        const note = topDialog().querySelector(".floating-card-caption .info-note-button") as HTMLElement;
        expect(note.getAttribute("aria-label")).toBe("Activities: what this means");
        fireEvent.click(note);
        // (The note opens as a dialog of its own over the floating card; Escape closes it first.)
        expect(screen.getAllByRole("dialog", { name: "Activities" })).toHaveLength(2);
        fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
        expect(screen.getAllByRole("dialog", { name: "Activities" })).toHaveLength(1);
        fireEvent.keyDown(document, { key: "Escape" });
        expect(screen.queryByRole("dialog")).toBeNull();
        // A Workspace card's too: it floats under the Resources note.
        cleanup();
        render(<Harness initial={workspaceSeed()} />);
        openTile("Workspace", undefined, "Resource 1");
        expect(floatingCardHost()!.querySelector(".floating-card-caption .info-note-button")).toBeTruthy();
    });

});

describe("the box name above a card opened from a subcategory", () => {

    it("leaves the subcategory's own note to the dialog's header, and says the section's note after the name of a card opened from it", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(<Harness initial={{
            ...base,
            resources: {
                digital: [{ id: "software-web", name: "", slots: [{ ...createBusinessResourceSlot(), name: "Domain" }, { ...createBusinessResourceSlot(), name: "Email" }] }],
                utilities: [{ id: "premises-utilities", name: "", slots: [{ ...createBusinessResourceSlot(), name: "Mains" }, { ...createBusinessResourceSlot(), name: "Gas" }] }]
            }
        }} />);
        // The subcategory's own note is said by the dialog's header while its box is open ...
        openTile("Digital Infrastructure", "Software & Web");
        const heading = document.querySelector(".section-tile-dialog .dialog-heading")!;
        fireEvent.click(heading.querySelector(".info-note-button") as HTMLElement);
        expect(document.querySelector(".info-note-panel")!.textContent).toBe("Software subscriptions and the public website, e.g. Bookkeeping software, Company website, Shared mailbox, Fleet tracking.");
        fireEvent.keyDown(document.activeElement ?? document.body, { key: "Escape" });
        // ... and the card opened from it floats under the section's name, with the section's note (the caption no longer takes the subcategory's).
        openCard("Domain");
        const host = screen.getByRole("dialog", { name: "Resources" });
        expect(captionText(host.querySelector(".floating-card-caption")!)).toBe("Resources");
        fireEvent.click(host.querySelector(".floating-card-caption .info-note-button") as HTMLElement);
        expect(document.querySelector(".info-note-panel")!.textContent).toContain("Physical and digital resources");
    });

});

describe("the page behind a floating card is only dimmed", () => {

    it("is a flat scrim: no blur, no lift of brightness, no inset light or shade on the page", () => {
        const block = /\.section-tile-overlay\.floating-overlay\.business-foundation \{[^}]*\}/.exec(css)![0].replace(/\/\*[\s\S]*?\*\//g, "");
        expect(block).toMatch(/background: var\(--floating-scrim\);/);
        expect(block).not.toMatch(/backdrop-filter/);
        expect(block).not.toMatch(/brightness|blur/);
        expect(global).toMatch(/--floating-scrim: rgba\(0, 0, 0, 0\.6\);/);
        // The white of the names over it: 5.7:1 at the least, over a white page.
        expect(global).toMatch(/--floating-caption-ink: #ffffff;/);
    });

    it("leaves the dialog its own 80% transparent ground", () => {
        expect(css).toMatch(/backdrop-filter: blur\(var\(--dialog-blur\)\) brightness\(var\(--dialog-backdrop-brightness\)\);/);
        expect(global).toMatch(/--dialog-ground-alpha: 20%;/);
    });

});

describe("the fold arrows of a founder's card do not move when toggled, and neither they nor the title arrows react to the pointer", () => {

    it("has one margin for the closed and the open arrow", () => {
        expect(css).toMatch(/\.business-founder-open \.business-capability-responsibilities-head > \.strategy-box-toggle \{[^}]*margin-left: calc\(-1 \* var\(--founder-marker\) - 12\.5px\);[^}]*margin-right: calc\(var\(--founder-marker\) - 35\.5px\);/);
        expect(css).not.toMatch(/\.business-founder-open[^{]*strategy-box-toggle\[aria-expanded="true"\] \{/);
    });

    it("has no ground, ring or bolder glyph under the pointer on a founder's arrows, and none on the title arrows", () => {
        expect(edges).toMatch(/\.business-capability \.business-founder-open \.strategy-box-toggle:hover \{[^}]*border-color: transparent;[^}]*background: transparent;[^}]*box-shadow: none;[^}]*text-shadow: none;/);
        expect(stylesheet("title-arrow.css")).not.toMatch(/\.title-arrow:hover/);
        // The ring of the keyboard focus is kept.
        expect(stylesheet("title-arrow.css")).toMatch(/\.title-arrow:focus-visible \{/);
    });

});

describe("the + box", () => {

    it("is two bars drawn from the middle of the box: no glyph to sit off-centre", () => {
        render(<Harness />);
        const plus = tileButton("Operational").parentElement!.querySelector(".plus-box") as HTMLElement;
        expect(plus.textContent).toBe("");
        expect(plus.getAttribute("aria-label")).toBe("Add Activity to Activities");
        expect(css).toMatch(/\.plus-box::before,\s*\.plus-box::after \{[^}]*top: 50%;[^}]*left: 50%;[^}]*transform: translate\(-50%, -50%\);/);
        expect(css).toMatch(/\.plus-box::before \{[^}]*width: var\(--plus-bar\);[^}]*height: 2px;/);
        expect(css).toMatch(/\.plus-box::after \{[^}]*width: 2px;[^}]*height: var\(--plus-bar\);/);
        expect(css).toMatch(/--plus-bar: 16px;/);
    });

    it("swaps its two colours: the ground, a 2px stroke and the darker tone at rest; the tone filled, no stroke, the ground for the + under the pointer", () => {
        expect(css).toMatch(/\.plus-box \{[^}]*border: 2px solid var\(--plus-fill\);[^}]*background: var\(--plus-ground\);[^}]*color: var\(--plus-fill\);/);
        expect(css).toMatch(/\.plus-box:hover:not\(:disabled\),\s*\.plus-box:focus-visible \{[^}]*border-color: transparent;[^}]*background: var\(--plus-fill\);[^}]*color: var\(--plus-ground\);/);
    });

});

describe("the 'i' of a coloured card", () => {

    it("is the ground of its surface with a 1.5px stroke and its letter in the darker tint; under the pointer they swap and the stroke goes", () => {
        expect(edges).toMatch(/\.business-capability\.business-capability \.info-note > \.info-note-button \{[^}]*border: 1\.5px solid var\(--info-ink\);[^}]*background: var\(--info-fill\);[^}]*color: var\(--info-ink\);/);
        expect(edges).toMatch(/\.info-note-button:hover,[^{]*\{[^}]*border-color: transparent;[^}]*background: var\(--info-ink\);[^}]*color: var\(--info-fill\);/);
        // The tint is the card's hue's; the ground is the surface's own.
        expect(edges).toMatch(/--info-ink: hsl\(var\(--strategy-theme-hue, 0\) var\(--theme-text-ink\)\);/);
        expect(edges).toMatch(/--info-fill: color-mix\(in srgb, hsl\(var\(--strategy-theme-hue, 0\) var\(--theme-bg-ground\)\)/);
        expect(edges).toMatch(/\.floating-card-caption \{[^}]*--info-ink: var\(--floating-caption-ink\);/);
    });

});

describe("the Activity card's rows", () => {

    function open(extra: object = {}) {
        const base = asBusinessCapabilityValue(undefined);
        render(<Harness initial={{
            ...base,
            activities: [{ id: "operational", name: "", activities: [{ ...createBusinessActivity(), name: "Weave", performerIds: ["f1"], responsibleId: "f2", ...extra }] }]
        }} />);
        openTile("Operational", undefined, "Weave");
        return topDialog().querySelector(".business-capability-activity") as HTMLElement;
    }

    it("sets the Performer label beside its dropdown, which runs on to the + box in the x's own column; Completed is the last tick on the left", () => {
        const card = open();
        const row = card.querySelector(".business-capability-performer")!;
        expect([...row.children].map(child => child.className.split(" ")[0])).toEqual(["option-picker", "plus-box"]);
        expect(card.querySelector(".business-capability-performer-field")!.classList.contains("business-field-inline")).toBe(true);
        expect(row.querySelector(".option-picker")!.getAttribute("data-size")).toBe("fit");
        const plus = row.querySelector(".plus-box") as HTMLElement;
        expect(plus.classList.contains("plus-box-small")).toBe(true);
        expect(plus.getAttribute("aria-label")).toBe("Add Performer to Activity 1");
        // No old "+ Add Performer" rectangle.
        expect(within(card).queryByRole("button", { name: "+ Add Performer" })).toBeNull();
        expect(css).toMatch(/\.card-box-open \.business-capability-performer > :is\(\.plus-box, \.strategy-box-remove, \.business-capability-performer-slot\) \{[^}]*width: 32px;[^}]*height: 32px;/);
        expect(css).toMatch(/\.card-box-open \.business-capability-performer > \.option-picker \{[^}]*flex: 1 1 auto;/);
        expect(css).toMatch(/\.business-capability-activity \.business-capability-done \{[^}]*align-self: flex-start;/);
        // Completed is the card's last row, outside the frozen fields.
        expect(card.lastElementChild!.classList.contains("business-capability-done")).toBe(true);
    });

    it("adds a performer's row with the +, repeating the dropdown and the x's column with an x; the + stays on the first row", () => {
        const card = open();
        fireEvent.click(within(card).getByRole("button", { name: "Add Performer to Activity 1" }));
        const rows = [...card.querySelectorAll(".business-capability-performer")];
        expect(rows).toHaveLength(2);
        expect(rows[0].querySelector(".plus-box")).toBeNull();
        // (Both founders are chosen now: nothing more to add, so the first row's place is empty and the second row has its x.)
        expect(rows[0].querySelector(".business-capability-performer-slot")).toBeTruthy();
        fireEvent.click(within(rows[1] as HTMLElement).getByRole("button", { name: "Remove Activity 1 performer 2" }));
        expect(card.querySelectorAll(".business-capability-performer")).toHaveLength(1);
        expect(card.querySelector(".business-capability-performer .plus-box")).toBeTruthy();
    });

});

describe("a finished activity is frozen", () => {

    it("puts every field in a disabled fieldset and leaves the Completed tick outside it", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(<Harness initial={{ ...base, activities: [{ id: "operational", name: "", activities: [{ ...createBusinessActivity(), name: "Done one", completed: true, performerIds: ["f1"] }] }] }} />);
        fireEvent.click(within(tileButton("Completed").parentElement!).getByRole("button", { name: "Done one" }));
        const card = topDialog().querySelector(".business-capability-activity") as HTMLElement;
        const frozen = card.querySelector("fieldset.business-capability-frozen") as HTMLFieldSetElement;
        expect(frozen.disabled).toBe(true);
        expect(frozen.contains(card.querySelector("textarea.card-name-input"))).toBe(true);
        expect(frozen.contains(card.querySelector(".strategy-box-remove"))).toBe(true);
        expect(frozen.contains(card.querySelector(".plus-box"))).toBe(true);
        const done = screen.getByRole("checkbox", { name: "Activity 1 completed" });
        expect(frozen.contains(done)).toBe(false);
        expect((done as HTMLInputElement).disabled).toBe(false);
        expect(css).toMatch(/\.business-capability-frozen \{[^}]*display: contents;/);
        expect(css).toMatch(/\.business-capability-activity\[data-frozen\] \.business-capability-frozen :is\(\.interview-input, \.option-picker-trigger\):disabled \{[^}]*color: var\(--text-completed-ink\);/);
    });

});

describe("the cards of a resource group", () => {

    it("have no fold arrow: a resource, an activity, a partner or a provider card is only ever open", () => {
        const base = asBusinessCapabilityValue(undefined);
        render(<Harness initial={{
            ...base,
            resources: { utilities: [{ id: "premises-utilities", name: "", slots: [{ ...createBusinessResourceSlot(), name: "Mains" }] }] },
            activities: [{ id: "operational", name: "", activities: [{ ...createBusinessActivity(), name: "Weave" }] }],
            providers: [createBusinessPartner("Maker Yard", "suppliers")]
        }} />);
        for (const [tile, category, name] of [["Resources", "Utilities", "Mains"], ["Activities", "Operational", "Weave"], ["Partners & Providers", "Suppliers", "Maker Yard"]] as const) {
            openTile(tile, category, undefined, infrastructureCard());
            if (tile === "Resources") {
                openBox("Premises Utilities");
            }
            openCard(name);
            const host = topDialog();
            expect(host.querySelector(".strategy-box-toggle, .fold-card-head, [aria-expanded]:not(.info-note-button):not(.option-picker-trigger)"), tile).toBeNull();
            expect(within(host).queryByRole("button", { name: /Back/ })).toBeNull();
            closeTile();
        }
    });

});

describe("the text and number cells are recessed", () => {

    it("has one token for the recess (the inset the other way round), used by the text and number inputs and textareas, not by a picker", () => {
        expect(global).toMatch(/--cell-inset-recess: inset 2px 2px 3px var\(--cell-shade\), inset -2px -2px 3px var\(--cell-light\);/);
        expect(edges).toMatch(/:is\(input\.interview-input:not\(\[type=checkbox\]\), textarea\.interview-input\):not\(\.option-picker-trigger\):not\(:focus\):not\(:disabled\) \{[^}]*box-shadow: var\(--cell-inset-recess\);/);
        // The focus ring stays, drawn over the recess; a disabled (frozen) cell is flat (the rule it already had).
        expect(edges).toMatch(/:focus \{[^}]*box-shadow: var\(--cell-inset-recess\), 0 0 0 3px/);
        // A picker keeps the raised inset.
        expect(edges).toMatch(/:is\(\.interview-input, \.option-picker-trigger\):not\(:focus\)[^{]*\{[^}]*box-shadow: var\(--cell-inset\);/);
    });

});

describe("page 3's rules are scoped to page 3 (the Financial pages carry .business-capability too)", () => {

    /** Every selector of a stylesheet that names the bare `.business-capability` class (not `.business-capability-xyz`). */
    const bare = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, "").split("{").slice(0, -1)
        .flatMap(chunk => chunk.split("}").pop()!.split(","))
        .map(selector => selector.trim())
        .filter(selector => /\.business-capability(?![\w-])/.test(selector));

    it("scopes every rule of the page-3 edges that names .business-capability to page 3's own root or its overlays", () => {
        const selectors = bare(edges);
        expect(selectors.length).toBeGreaterThan(10);
        for (const selector of selectors) {
            expect(selector, selector).toMatch(/\.answer-columns|\.section-tile-overlay/);
        }
    });

    it("scopes the page's two-cards layout in conversation.css to .answer-columns (a Financial page's cards were once shrunk to 25px by it)", () => {
        const conversation = stylesheet("conversation.css");
        const cards = bare(conversation).filter(selector => /\.business-capability\s*>\s*\.business-foundation-card/.test(selector));
        expect(cards.length).toBeGreaterThan(3);
        for (const selector of cards) {
            expect(selector, selector).toMatch(/\.answer-columns/);
        }
        expect(css).not.toMatch(/(^|\n)\.business-capability > \.business-foundation-card/);
    });

});

describe("the round of small controls: the x, the Back button, the lift, the ring, the numbers, the help, the titles, the lists", () => {

    const removeCss = stylesheet("remove-button.css");
    const colours = stylesheet("colors.css");

    it("gives the x the '+' box's swap of two colours: the card's ground, a 2px red stroke and X; filled red and the X in the ground under the pointer and the focus", () => {
        expect(removeCss).toMatch(/\.strategy-box-remove\.strategy-box-remove,[^{]*\{[^}]*color:var\(--x-red\);[^}]*border:2px solid var\(--x-red\);[^}]*background:var\(--x-ground, var\(--bg-surface\)\);/);
        expect(removeCss).toMatch(/:is\(:hover, :focus-visible\):not\(:disabled\),[^{]*\{[^}]*color:var\(--x-ground, var\(--bg-surface\)\);[^}]*border-color:transparent;[^}]*background:var\(--x-red\);/);
        expect(removeCss).toMatch(/--x-red:var\(--bg-danger-strong\);/);
        // The grounds the cards set.
        expect(stylesheet("conversation.css")).toMatch(/--x-ground:var\(--bg-card-tint\);/);
    });


    it("multiplies the page-3 glows by one token, --hover-lift (1.2)", () => {
        expect(global).toMatch(/--hover-lift: 1\.2;/);
        expect(css).toMatch(/\.section-tile:hover:not\(:focus-visible\) \{[^}]*calc\(18% \* var\(--hover-lift\)\)/);
        expect(edges).toMatch(/calc\(18% \* var\(--hover-lift\)\)/);
        expect(edges).toMatch(/calc\(28% \* var\(--hover-lift\)\)/);
    });

    it("rings a focused cell in the dark theme with a clean white, one token", () => {
        expect(global).toMatch(/--focus-ring-ink: var\(--line-primary\);/);
        expect(edges).toMatch(/:root\[data-theme="dark"\] \{[^}]*--focus-ring-ink: rgba\(255, 255, 255, 0\.9\);/);
        expect(edges).toMatch(/:root\[data-theme="dark"\] [^{]*:focus \{[^}]*border-color: var\(--focus-ring-ink\) !important;[^}]*0 0 0 1px var\(--focus-ring-ink\)/);
    });

    it("right-aligns the numbers of page 3 and leaves the text inputs", () => {
        expect(edges).toMatch(/input\.interview-input:is\(\[inputmode="decimal"\], \[inputmode="numeric"\], \[type="number"\]\) \{[^}]*padding-right: 12px;[^}]*text-align: right;/);
    });

    it("makes the section's help drop-down 480px wide", () => {
        expect(css).toMatch(/\.card-title-block > \.card-title-help \{[^}]*--help-width: 480px;[^}]*width: min\(var\(--help-width\), 100%\);/);
    });

    it("gives titles and captions their own inks, softer than the theme's extremes", () => {
        expect(colours).toMatch(/:root \{\s*--title-ink: #303a49;/);
        expect(colours).toMatch(/:root\[data-theme="dark"\] \{[^}]*--title-ink: #cdd1d8;[^}]*--floating-caption-ink: #cdd1d8;/);
        expect(colours).toMatch(/\.section-tile-title\.section-tile-title,[^{]*\{[^}]*color: var\(--title-ink\);/);
    });

    it("lets the lists on the tiles scroll: every item, a thin themed scrollbar, no '+N more'", () => {
        expect(css).toMatch(/\.section-tile-list \{[^}]*overflow-y: auto;[^}]*overscroll-behavior: contain;/);
        expect(css).toMatch(/\.section-tile-list::-webkit-scrollbar-button \{[^}]*display: none;/);
        expect(css).toMatch(/\.section-tile-list:hover::-webkit-scrollbar-thumb \{/);
        expect(css).not.toMatch(/section-tile-list-more/);
    });

    it("draws a Workspace card's Deposit currency as plain text where the Price row's letters are (the currency picker's inner left padding)", () => {
        expect(css).toMatch(/\.business-capability-deposit-currency \{[^}]*padding-left: 8\.67px;/);
        expect(css).toMatch(/\.business-capability-deposit-row > \.business-capability-deposit-currency \{[^}]*grid-column: 3;/);
    });

});

describe("the page-3 edges reach only the cards, their cells and the Back buttons", () => {

    it("leaves the x (the app's one remove button), the ticks, the 'i', the '+' and the arrows their own look: no rule of the edges names them", () => {
        expect(edges).not.toMatch(/strategy-box-remove/);
        expect(edges).not.toMatch(/plus-box|brand-tick-box/);
        // The recess is for text and number inputs only: never a tick box.
        expect(edges).toMatch(/input\.interview-input:not\(\[type=checkbox\]\)/);
    });

});

describe("the fold arrows and the title arrows are wired, and filled under the pointer", () => {

    it("draws the triangle as a mask: an outline at rest (stroke 1.5), filled on hover and keyboard focus, at the same size", () => {
        expect(edges).toMatch(/\.strategy-box-toggle\[aria-expanded="false"\]::before \{[^}]*width: 11px;[^}]*height: 18px;[^}]*mask-image: url\("data:image\/svg\+xml,[^"]*fill='none'[^"]*stroke-width='1\.5'/);
        expect(edges).toMatch(/\.strategy-box-toggle\[aria-expanded="false"\]:is\(:hover, :focus-visible\)::before \{[^}]*mask-image: url\("data:image\/svg\+xml,[^"]*fill='black'/);
        expect(edges).toMatch(/\.title-arrow\[aria-expanded="true"\]:is\(:hover, :focus-visible\)::before \{[^}]*mask-image: url\("data:image\/svg\+xml,[^"]*fill='black'/);
        // (The hover state sets no size or margin: nothing moves.)
        const hover = edges.match(/\.title-arrow\[aria-expanded="false"\]:is\(:hover, :focus-visible\)::before \{([^}]*)\}/)![1];
        expect(hover).not.toMatch(/^\s*(width|height|margin)/m);
    });

});

describe("the opened card's columns: everything under the head starts and ends at the name cell", () => {

    it("lays a Resource / Activity / Partner / Provider card out on three columns (the marker, the content, the x) with the head on a subgrid", () => {
        expect(css).toMatch(/\.card-box-open > \.business-capability-slot:not\(\.delivery-card\) \{[^}]*grid-template-columns: max-content minmax\(0, 1fr\) var\(--card-x-column\);/);
        expect(css).toMatch(/\.card-box-open > \.business-capability-slot:not\(\.delivery-card\) > \*,[^{]*\{[^}]*grid-column: 2;/);
        expect(css).toMatch(/> \.strategy-box-head,[^{]*\{[^}]*grid-column: 1 \/ -1;[^}]*grid-template-columns: subgrid;/);
        expect(css).toMatch(/--card-x-column: 32px;/);
        // The old 40px margin that held the child's name short of the x is gone: the grid does it.
        expect(css).not.toMatch(/margin: 0 40px 0 0;/);
    });

});

void openTile;
void offeringCard;

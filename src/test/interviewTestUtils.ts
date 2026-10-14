import { fireEvent, screen, within } from "@testing-library/react";

/** The fold arrows (.label-arrow) whose name matches `pattern`. */
export const toggles = (pattern: RegExp) =>
    screen.getAllByRole("button", { name: pattern }).filter(b => b.classList.contains("label-arrow"));

/** Types `text` one keystroke at a time, the way a number box's limits see it. */
export function typeInto(input: HTMLInputElement, text: string) {
    for (let length = 1; length <= text.length; length++) {
        fireEvent.change(input, { target: { value: text.slice(0, length) } });
    }
}

/** The words of a floating card's caption (without the "i" a box's note may add after them). */
export function captionText(caption: Element): string {
    const copy = caption.cloneNode(true) as HTMLElement;
    copy.querySelectorAll(".info-note").forEach(note => note.remove());
    return copy.textContent!.replace(/ /g, " ");
}

/** The page's two cards (a tile of the same name -- Completed -- stands in each). */
export const infrastructureCard = () => document.querySelector<HTMLElement>('[data-anchor="capability-infrastructure"]')!;
export const offeringCard = () => document.querySelector<HTMLElement>('[data-anchor="capability-offering-capability"]')!;

/**
 * The button of a tile or box named `name`: its accessible name is its title, then (after a comma) what it
 * lists ("Utilities, Electricity, Internet"), so a string matches the title alone or followed by the list.
 */
export function tileButton(name: string | RegExp, scope: HTMLElement = document.body): HTMLElement {
    if (typeof name !== "string") {
        return within(scope).getByRole("button", { name });
    }
    const matches = within(scope).getAllByRole("button").filter(button => {
        const label = button.getAttribute("aria-label") ?? "";
        return label === name || label.startsWith(name + ", ");
    });
    // (Infrastructure's section tiles and Offering's Capability's carry the same names -- Resources, Activities, Partners & Suppliers: unless a scope says
    // otherwise, the name means Offering's.)
    const own = matches.length > 1 && scope === document.body ? matches.filter(button => offeringCard().contains(button)) : matches;
    if (own.length === 0 && scope === document.body && SECTION_OF_CATEGORY[name] !== undefined) {
        // (A category of Infrastructure has no tile of its own on the page: its section's tile stands for it.)
        return tileButton(SECTION_OF_CATEGORY[name], infrastructureCard());
    }
    if (own.length !== 1) {
        throw new Error("Expected one tile or box named " + name + ", found " + matches.length);
    }
    return own[0];
}

/**
 * The section tile of Infrastructure that holds a CATEGORY (Utilities, Operational, Providers ...): Infrastructure has four tiles, Founders, Resources,
 * Activities and Partners & Suppliers, whose views group the cards by category.
 */
const SECTION_OF_CATEGORY: Record<string, string> = {
    Utilities: "Resources", Workstation: "Resources", Equipment: "Resources", Vehicles: "Resources", "Digital Infrastructure": "Resources", "Materials & Inventory": "Resources",
    "Documents & Rights": "Resources", "Human Resources": "Resources", Workspace: "Resources",
    "Pre-Operational": "Activities", Operational: "Activities", Production: "Activities", Marketing: "Activities", "Sales & Customer": "Activities",
    Partners: "Partners & Suppliers", Suppliers: "Partners & Suppliers", Providers: "Partners & Suppliers"
};

/**
 * Opens a section tile's dialog (SectionTiles) by the tile's title; with `box`, also the
 * subcategory box of that name inside it (SubcategoryBoxes: Utilities > Electricity); with `card`,
 * also the card box inside that (CardBoxes: "Resource 1").
 */
export function openTile(name: string | RegExp, box?: string | RegExp, card?: string | RegExp, scope: HTMLElement = document.body) {
    const category = typeof name === "string" ? SECTION_OF_CATEGORY[name] : undefined;
    if (category !== undefined && scope === document.body && !tileExists(name as string)) {
        // A category of Infrastructure: its section tile first, then the category's own tile when the view has one (a category of two cards or more).
        fireEvent.click(tileButton(category, infrastructureCard()));
        const dialog = grid();
        const inside = dialog && [...dialog.querySelectorAll<HTMLElement>("button.section-tile")].find(button => {
            const label = button.getAttribute("aria-label") ?? "";
            return label === name || label.startsWith(name + ", ");
        });
        if (inside) {
            fireEvent.click(inside);
        }
    } else {
        fireEvent.click(tileButton(name, scope));
    }
    // (A tile connected with exactly one card opens that card floating at once: there is no grid to go on into.)
    if (box !== undefined) {
        openBox(box);
    }
    if (card !== undefined) {
        descendSole();
        openCard(card);
    }
}

/** A category with one group shows that group's one tile (empty or not): the card tiles are one press further in. */
export function descendSole(): number {
    let levels = 0;
    for (let level = 0; level < 2; level += 1) {
        const dialog = grid();
        if (dialog === null || floatingCardHost() !== null || dialog.querySelector(".card-tile") !== null) {
            return levels;
        }
        const tiles = [...dialog.querySelectorAll<HTMLElement>("button.section-tile")];
        if (tiles.length !== 1) {
            return levels;
        }
        fireEvent.click(tiles[0]);
        levels += 1;
    }
    return levels;
}

/** The name of the section tile of Infrastructure that holds a category. */
export const sectionOfCategory = (category: string) => SECTION_OF_CATEGORY[category] ?? category;

function tileExists(name: string): boolean {
    return screen.queryAllByRole("button").some(button => {
        const label = button.getAttribute("aria-label") ?? "";
        return label === name || label.startsWith(name + ", ");
    });
}

/** The floating card (its host, role dialog) when one is open (the topmost, if a pair stands over a card); the section dialog it came from may stay mounted under it. */
export const floatingCardHost = () => [...document.querySelectorAll<HTMLElement>(".floating-card-host")].pop() ?? null;

/** The dialog that is a grid of boxes (never a card): null while a card floats or nothing is open. */
const grid = () => document.querySelector<HTMLElement>(".section-tile-dialog");

/** Opens a subcategory box inside the open dialog. */
export function openBox(name: string | RegExp) {
    const dialog = grid();
    if (dialog === null) {
        return;
    }
    // (A group with fewer than two cards is no tile: its cards stand in the view directly.)
    const present = [...dialog.querySelectorAll<HTMLElement>("button.section-tile")].some(button => {
        const label = button.getAttribute("aria-label") ?? "";
        return typeof name === "string" ? label === name || label.startsWith(name + ", ") : name.test(label);
    });
    if (present) {
        fireEvent.click(tileButton(name, dialog));
    }
}

/** Opens a card box (a list of cards drawn as closed square boxes) inside the open dialog: "Resource 1" or its name. */
export function openCard(name: string | RegExp) {
    descendSole();
    const dialog = grid();
    if (dialog === null) {
        // (The box held one card: it floats already.)
        return;
    }
    const box = [...dialog.querySelectorAll<HTMLElement>(".card-tile")].find(candidate => {
        const label = candidate.getAttribute("aria-label") ?? "";
        return typeof name === "string" ? label.includes(name) : name.test(label);
    });
    if (!box) {
        if (floatingCardHost() !== null) {
            // (The box held one card: it floated at once, over the dialog that stays under it.)
            return;
        }
        throw new Error("No card box named " + String(name));
    }
    fireEvent.click(box);
}

/** The card tiles in the open dialog, by their accessible names. */
export const cardBoxes = () => {
    descendSole();
    return [...(grid() ?? document.createElement("div")).querySelectorAll<HTMLElement>(".card-tile")].map(box => box.getAttribute("aria-label"));
};

/** Presses the Back button of the top layer: the floating card's (back to the dialog it came from), else the dialog's (one level up). */
export function closeTile() {
    if (document.querySelector(".floating-card-host")) {
        fireEvent.mouseDown(document.body);
        return;
    }
    const backs = document.querySelectorAll<HTMLElement>(".section-tile-back");
    fireEvent.click(backs[backs.length - 1]);
}

/** Presses Back on every layer, the top one first, until no dialog is open. */
export function closeAllTiles() {
    for (let guard = 0; guard < 8 && screen.queryAllByRole("dialog").length > 0; guard++) {
        closeTile();
    }
}

/** The topmost open dialog: the floating card when one is open (the section dialog it came from may stay under it), else the section dialog. */
export const topDialog = () => {
    const all = screen.getAllByRole("dialog");
    return all[all.length - 1];
};

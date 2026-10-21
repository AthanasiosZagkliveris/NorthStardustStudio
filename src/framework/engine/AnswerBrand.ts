/**
 * THE BRAND SYSTEM: the Style and Inventory answer values and their readers.
 * Split out of AnswerUtils.ts (still importable from there).
 */
import { AnswerDefinition } from "../model/index.ts";
import { AnswerType } from "../enums/AnswerType.ts";
import { STRATEGY_FOUNDATION_SECTIONS } from "./AnswerStrategy.ts";

/**
 * One slot of the Brand System's palette.
 *
 * `enabled` is the slot's activation tick: a brand does not have
 * to define all six colours, so an unticked slot keeps whatever was
 * typed in it but is greyed out and excluded from completeness.
 * That is deliberately different from "blank" -- it lets someone
 * park a candidate colour without it counting as part of the
 * palette.
 */
export interface BrandColourValue {
    enabled: boolean;
    name: string;
    hex: string;
    usage: string;
}

export interface BrandTypefaceValue {
    enabled: boolean;
    font: string;
    purpose: string;
}

export interface BrandHierarchyValue {
    enabled: boolean;
    size: string;
}

/**
 * One image asset held inline as a data URL. Stored inline rather
 * than as a file path because this app persists to localStorage and
 * has no filesystem access -- see BrandInventoryEditor for the
 * downscaling and size caps that keeps within.
 */
export interface BrandAssetValue {
    dataUrl: string;
    fileName: string;
}

export interface BrandImageValue extends BrandAssetValue {
    name: string;
    description: string;
}

export interface BrandStyleAnswerValue {
    colours: BrandColourValue[];
    typefaces: BrandTypefaceValue[];
    hierarchy: Record<string, BrandHierarchyValue>;
    /** The Icon & Logo and the Brand Images: the Style page holds them too (they were a page of their own, "Inventory"). */
    inventory: BrandInventoryAnswerValue;
}

/**
 * The icon, or the logo: ONE file, an SVG or a PNG (`file`).
 *
 * The page used to ask for each mark twice, as an SVG and as a PNG,
 * and saved them under `svg` and `png`. Those are kept exactly as
 * saved -- never deleted -- and read through brandMarkFile: while
 * `file` is empty the saved SVG is shown in its place, else the
 * saved PNG. `null` is a file removed by hand, which shows nothing
 * even where an older one is still saved.
 */
export interface BrandMarkValue {
    file?: BrandAssetValue | null;
    png?: BrandAssetValue;
    svg?: BrandAssetValue;
}

export interface BrandInventoryAnswerValue {
    icon: BrandMarkValue;
    logo: BrandMarkValue;
    /**
     * What the logo and icon show, what they mean and how they are
     * to be used. Answers saved before it was asked load with it
     * empty.
     */
    markDescription: string;
    images: BrandImageValue[];
}

/** The one file a mark shows: its own, else a PNG or SVG saved by the page's earlier two-file version (see BrandMarkValue). */
export function brandMarkFile(mark: BrandMarkValue): BrandAssetValue | undefined {
    return mark.file === null ? undefined : mark.file ?? mark.svg ?? mark.png;
}

/**
 * The palette's 6 fixed slots in ROW-MAJOR order, because they
 * render as 3 rows of 2 (Primary A | Primary B, then Secondary,
 * then Neutral) inside a single "Colours" section -- not as two
 * separate A and B columns.
 *
 * `defaultEnabled` marks the slots a brand almost always has, so a
 * new palette starts with Primary A and Secondary A already ticked
 * rather than everything switched off.
 */
export const BRAND_COLOUR_SLOTS = [
    { id: "primary-a", label: "Primary A", defaultEnabled: true, dependsOn: undefined,
        help: "Use for the most frequently occurring and recognisable brand elements." },
    { id: "primary-b", label: "Primary B", defaultEnabled: false, dependsOn: "primary-a",
        help: "Use for elements that need stronger visual distinction within the primary palette." },
    { id: "secondary-a", label: "Secondary A", defaultEnabled: true, dependsOn: undefined,
        help: "Use for illustrations, categories and supporting visual elements." },
    { id: "secondary-b", label: "Secondary B", defaultEnabled: false, dependsOn: "secondary-a",
        help: "Use for additional visual variation where Secondary A is not sufficient." },
    { id: "neutral-a", label: "Neutral A", defaultEnabled: false, dependsOn: undefined,
        help: "Use for neutral surfaces, backgrounds and areas requiring minimal visual emphasis." },
    { id: "neutral-b", label: "Neutral B", defaultEnabled: false, dependsOn: "neutral-a",
        help: "Use for secondary neutral surfaces, borders, dividers and other low-emphasis elements." }
] as const;

export const BRAND_TYPEFACE_SLOTS = [
    { id: "primary", label: "Primary", defaultEnabled: true, dependsOn: undefined,
        help: "Use for headings, logo lockups, product names and other designated brand expressions." },
    { id: "secondary", label: "Secondary", defaultEnabled: false, dependsOn: undefined,
        help: "Use for body text, interface content and product descriptions." },
    { id: "optional", label: "Optional", defaultEnabled: false, dependsOn: "secondary",
        help: "Use for specific applications where an additional typographic character is useful." }
] as const;

/** Each level with its recommended size range: guidance, never enforced. */
export const BRAND_HIERARCHY_LEVELS = [
    { id: "h1", label: "H1 (Title)", defaultEnabled: true, dependsOn: undefined, range: "36–48" },
    { id: "h2", label: "H2 (Section)", defaultEnabled: false, dependsOn: undefined, range: "28–36" },
    { id: "h3", label: "H3 (Subsection)", defaultEnabled: false, dependsOn: "h2", range: "22–28" },
    { id: "body", label: "Body Text", defaultEnabled: true, dependsOn: undefined, range: "16–18" },
    { id: "caption", label: "Captions & Metadata / Interface", defaultEnabled: false, dependsOn: undefined, range: "12–14" }
] as const;

/**
 * Back to 2, matching the "Upload 2-5 images" guidance the page
 * states. Guidance and validation have to agree on what "done"
 * means -- while the wording said "up to 5" with no minimum, a
 * single image satisfied everything on screen yet was still flagged
 * in the completeness dialog with nothing explaining why.
 *
 * Doubles as the number of slots the editor always shows (see
 * asBrandInventoryValue), so the page opens with the two it asks
 * for rather than one "add" button.
 */
export const BRAND_IMAGE_MIN = 2;
export const BRAND_IMAGE_MAX = 5;

/**
 * The titles of the Brand Style and Brand Inventory pages' sections
 * (1-3 and 1-2, each page counting its own), used
 * both to head each section and to name it in the completeness
 * dialog.
 */
export const BRAND_STYLE_SECTIONS = ["Colours", "Typography", "Text Hierarchy"] as const;

export const BRAND_INVENTORY_SECTIONS = ["Icon & Logo", "Brand Images"] as const;

/** The Style page's sections: its own three, then the Icon & Logo and the Brand Images (once the Inventory page). */
export const BRAND_STYLE_PAGE_SECTIONS = [...BRAND_STYLE_SECTIONS, ...BRAND_INVENTORY_SECTIONS] as const;

/**
 * How many individually-numbered parts a Section contributes to its
 * System's running count -- the columns of a column-layout page, or
 * the named sections a Brand editor holds. Everything else
 * contributes 0, since it is numbered as a whole Section instead.
 *
 * Callers pass `resolveShared` so a Shared Answer can be counted by
 * what it actually renders: the Brand System's first page mirrors
 * four Identity columns, and those four have to be counted or its
 * Style page would start numbering at 1 instead of 5.
 */
export function numberedUnitCount(
    answer: AnswerDefinition | undefined,
    resolveShared?: (answer: AnswerDefinition) => AnswerDefinition | undefined
): number {

    if (!answer) {
        return 0;
    }

    if (answer.type === AnswerType.SharedAnswer) {
        const source = resolveShared?.(answer);
        return source ? numberedUnitCount(source, resolveShared) : 0;
    }

    if (answer.type === AnswerType.BrandStyle) {
        return BRAND_STYLE_PAGE_SECTIONS.length;
    }

    if (answer.type === AnswerType.BrandInventory) {
        return BRAND_INVENTORY_SECTIONS.length;
    }

    if (answer.type === AnswerType.StrategyFoundation) {
        return STRATEGY_FOUNDATION_SECTIONS.length;
    }

    // ONE, not six. The Legal Entity page takes a single number of
    // its own in a running count -- 9 after the Identity System's
    // two four-column pages -- and its six subsections number
    // themselves from inside it (1 to 6 under the page-by-page
    // numbering the Identity System uses), the way a Strategic
    // Theme numbers its Goals.
    if (answer.type === AnswerType.LegalEntity) {
        return 1;
    }

    // One, for the same reason: its two subsections number
    // themselves from inside it.
    if (answer.type === AnswerType.FoundersProfile) {
        return 1;
    }

    // The Strategy System's other two pages carry no numbers of
    // their own: page 2 expands the Foundation page's fourth
    // section (its Themes are 4.1, 4.2, ... and number themselves
    // from the nesting), and page 3 is a drawing of both.
    if (answer.type === AnswerType.StrategicPeriod ||
        answer.type === AnswerType.StrategicRoadmap) {
        return 0;
    }

    return answer.columns ? (answer.parts?.length ?? 0) : 0;

}

/**
 * Normalizes whatever is stored into a complete Brand Style value,
 * padding any missing slot so the editor can render every row
 * unconditionally. Tolerates a null/legacy value rather than
 * throwing -- the Brand System previously held a completely
 * different shape (see StorageService's own migration).
 */
export function asBrandStyleValue(value: unknown): BrandStyleAnswerValue {

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Partial<BrandStyleAnswerValue>
        : {};

    const colours = BRAND_COLOUR_SLOTS.map((slot, index) => {
        const stored = Array.isArray(source.colours) ? source.colours[index] : undefined;
        return {
            enabled: typeof stored?.enabled === "boolean" ? stored.enabled : slot.defaultEnabled,
            name: typeof stored?.name === "string" ? stored.name : "",
            hex: typeof stored?.hex === "string" ? stored.hex : "",
            usage: typeof stored?.usage === "string" ? stored.usage : ""
        };
    });

    const typefaces = BRAND_TYPEFACE_SLOTS.map((slot, index) => {
        const stored = Array.isArray(source.typefaces) ? source.typefaces[index] : undefined;
        return {
            enabled: typeof stored?.enabled === "boolean" ? stored.enabled : slot.defaultEnabled,
            font: typeof stored?.font === "string" ? stored.font : "",
            purpose: typeof stored?.purpose === "string" ? stored.purpose : ""
        };
    });

    const storedHierarchy =
        source.hierarchy && typeof source.hierarchy === "object"
            ? source.hierarchy as Record<string, unknown>
            : {};

    const hierarchy: Record<string, BrandHierarchyValue> = {};

    for (const level of BRAND_HIERARCHY_LEVELS) {
        const stored = storedHierarchy[level.id];
        const record = stored && typeof stored === "object"
            ? stored as Partial<BrandHierarchyValue>
            : {};
        hierarchy[level.id] = {
            enabled: typeof record.enabled === "boolean" ? record.enabled : level.defaultEnabled,
            size: typeof record.size === "string" ? record.size : ""
        };
    }

    return { colours, typefaces, hierarchy, inventory: asBrandInventoryValue(source.inventory) };

}

/**
 * Normalizes whatever the user typed into a HEX value the colour
 * sample and the colour picker can both use.
 *
 * Accepts "#1a2b3c", "1a2b3c", "#abc" and "abc" -- people paste HEX
 * with and without the hash, and 3-digit shorthand is common in
 * brand guidelines. Anything that isn't a complete 3- or 6-digit
 * HEX returns undefined, so a half-typed value shows as "nothing
 * chosen" rather than flashing through wrong colours per keystroke.
 */
export function normalizeHex(input: string): string | undefined {

    const raw = input.trim().replace(/^#/, "");

    if (!/^[0-9a-f]{3}$/i.test(raw) && !/^[0-9a-f]{6}$/i.test(raw)) {
        return undefined;
    }

    const full = raw.length === 3
        ? raw.split("").map(character => character + character).join("")
        : raw;

    return `#${full.toLowerCase()}`;

}

/**
 * Whether each of the Style page's three sections (Colours,
 * Typography, Text Hierarchy) still needs attention. Only ACTIVATED
 * slots count -- an unticked slot is a deliberate "this brand
 * doesn't use one", not an unfinished field.
 */
export function brandStyleSectionsEmpty(value: unknown): boolean[] {

    const style = asBrandStyleValue(value);

    const colours = style.colours.filter(colour => colour.enabled);
    const typefaces = style.typefaces.filter(typeface => typeface.enabled);
    const levels = BRAND_HIERARCHY_LEVELS
        .map(level => style.hierarchy[level.id])
        .filter(level => level.enabled);

    // A whole HEX, as normalizeHex accepts it (#RGB or #RRGGBB, the
    // # optional), and a size of 8 px or more.
    const wholeHex = (hex: string) => normalizeHex(hex) !== undefined;
    const readableSize = (size: string) => /^\d+$/.test(size.trim()) && Number(size.trim()) >= 8;

    return [
        colours.length === 0 || colours.some(colour => !wholeHex(colour.hex)),
        typefaces.length === 0 || typefaces.some(typeface => typeface.font.trim().length === 0),
        levels.length === 0 || levels.some(level => !readableSize(level.size)),
        ...brandInventorySectionsEmpty(style.inventory)
    ];

}

/**
 * Normalizes whatever is stored into a complete Brand Inventory
 * value. Same tolerance as asBrandStyleValue above.
 */
export function asBrandInventoryValue(value: unknown): BrandInventoryAnswerValue {

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Partial<BrandInventoryAnswerValue>
        : {};

    const asset = (input: unknown): BrandAssetValue | undefined => {

        if (!input || typeof input !== "object") {
            return undefined;
        }

        const record = input as Partial<BrandAssetValue>;

        return typeof record.dataUrl === "string" && record.dataUrl.length > 0
            ? { dataUrl: record.dataUrl, fileName: String(record.fileName ?? "") }
            : undefined;

    };

    const mark = (input: unknown): BrandMarkValue => {
        const record = input && typeof input === "object" ? input as Record<string, unknown> : {};
        return {
            file: record.file === null ? null : asset(record.file),
            png: asset(record.png),
            svg: asset(record.svg)
        };
    };

    const images = (Array.isArray(source.images) ? source.images : [])
        .slice(0, BRAND_IMAGE_MAX)
        .map(stored => ({
            dataUrl: typeof stored?.dataUrl === "string" ? stored.dataUrl : "",
            fileName: typeof stored?.fileName === "string" ? stored.fileName : "",
            name: typeof stored?.name === "string" ? stored.name : "",
            description: typeof stored?.description === "string" ? stored.description : ""
        }));

    // Always at least the 2 the page asks for, so both slots -- each
    // with its Name and Short Description beside it -- are on screen
    // from the start rather than hidden behind an "add" button. An
    // empty slot simply carries no dataUrl, which is what the
    // completeness check already counts on.
    while (images.length < BRAND_IMAGE_MIN) {
        images.push({ dataUrl: "", fileName: "", name: "", description: "" });
    }

    return {
        icon: mark(source.icon),
        logo: mark(source.logo),
        markDescription: typeof source.markDescription === "string" ? source.markDescription : "",
        images
    };

}

/**
 * Whether each of the Inventory page's two sections (Icon & Logo,
 * Brand Images) still needs attention.
 */
export function brandInventorySectionsEmpty(value: unknown): boolean[] {

    const inventory = asBrandInventoryValue(value);

    // As the page asks: one icon and one logo, each an SVG or a PNG.
    const marksComplete = !!brandMarkFile(inventory.icon) && !!brandMarkFile(inventory.logo);

    const usableImages = inventory.images.filter(image => !!image.dataUrl);

    return [!marksComplete, usableImages.length < BRAND_IMAGE_MIN];

}

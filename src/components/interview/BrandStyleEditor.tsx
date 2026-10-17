import { CSSProperties, ReactNode, useLayoutEffect, useRef, useState } from "react";

import { brandColourMissing, brandTypefaceMissing } from "../../framework/engine/SystemCardCompleteness.ts";
import ColourPicker from "./ColourPicker.tsx";
import {
    BRAND_COLOUR_SLOTS,
    BRAND_HIERARCHY_LEVELS,
    BRAND_STYLE_SECTIONS,
    BRAND_TYPEFACE_SLOTS,
    BrandStyleAnswerValue,
    asBrandStyleValue,
    normalizeHex,
    relativeLuminance
} from "../../framework/engine/AnswerUtils.ts";
import { SOURCES } from "../../framework/engine/Sources.ts";
import InfoNote, { InfoPoint, InfoText } from "./InfoNote.tsx";
import { ColumnHeading, GuidanceBullets } from "./ColumnHeads.tsx";
import { limitedHexText } from "./numberInput.ts";
import { railId } from "./rails/railItems.ts";
import SectionTiles, { DialogHeading, type SectionTile } from "./SectionTiles.tsx";
import PictureBoxes, { type PictureBox } from "./PictureBoxes.tsx";
import BrandInventoryEditor from "./BrandInventoryEditor.tsx";
import type { CardBoxAdd } from "./CardBoxes.tsx";
import { workHue } from "../../framework/engine/WorkColours.ts";
import { BusinessAddButton, BusinessCard, BusinessField, BusinessRemove, OptionalNote } from "./BusinessCardFields.tsx";
import { LevelSize, cardTint, clampedSize, pixelRange, useCardInk } from "./brandStyleParts.tsx";
import FoldAllToggle from "./FoldAllToggle.tsx";
import OptionPicker from "./OptionPicker.tsx";
import { useItemFolds } from "./useItemFolds.ts";
import { inwardOrigin } from "./CardTile.tsx";
import { UndoService } from "../../services/UndoService";

interface BrandStyleEditorProps {

    value: unknown;

    onChange: (value: BrandStyleAnswerValue) => void;

    disabled?: boolean;

    /**
     * The number this page's FIRST section carries: 1 on a page
     * that numbers its own sections (see
     * AnswerDefinition.nestedNumbering), otherwise where the
     * System's running count has got to.
     */
    startNumber?: number;

    /**
     * The interview's progress line, rendered as one full-width row
     * between the section headings and the inputs -- the same
     * arrangement the Identity System's column pages use.
     */
    columnsDivider?: ReactNode;

    /**
     * Whether the bullet guidance above the progress line shows.
     * Toggled by the Help button the page renders just above that
     * line -- see AnswerRendererProps.showInstructions.
     */
    showInstructions?: boolean;

    /** The page drawn as tiles (the page's tile system); the editor's own tests draw the whole page. */
    asTiles?: boolean;

    /** The frame's heading, on top of its tiles (a page of several sections). */
    frameTitle?: string;

}

/** WCAG relative luminance of a normalised HEX. */
function luminance(hex: string): number {
    const [red, green, blue] = [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16) / 255);
    return relativeLuminance([red, green, blue]);
}

/** WCAG contrast ratio between two HEX colours, 1 to 21. */
function contrastRatio(one: string, other: string): number {
    const [light, dark] = [luminance(one), luminance(other)].sort((a, b) => b - a);
    return (light + 0.05) / (dark + 0.05);
}

/** The contrast ratio's own formula, the "i" beside the AA/AAA line. */
const CONTRAST_HELP: InfoPoint[] = [
    { title: "Formula", text: "Contrast = (L_lighter + 0.05) ÷ (L_darker + 0.05)" },
    "How readable text in this colour is against white or black. AA needs 4.5:1 for body text (3:1 large), AAA 7:1.",
    { title: "Source", source: SOURCES.contrastRatio }
];

/**
 * How readable text is in this colour on white, and white text on it
 * -- the same ratio either way -- and the same against black. Said in
 * words, so the colour of the note never carries the meaning.
 */
function contrastNote(hex: string): string {
    const verdict = (ratio: number) =>
        ratio >= 7 ? "AAA" : ratio >= 4.5 ? "AA" : ratio >= 3 ? "large text only" : "not for text";
    const white = contrastRatio(hex, "#ffffff");
    const black = contrastRatio(hex, "#000000");
    return "With white " + white.toFixed(1) + ":1 (" + verdict(white) + ") · with black " +
        black.toFixed(1) + ":1 (" + verdict(black) + ")";
}

/** A card's fold key and anchor: "brand-colour-primary-a". */
function cardId(kind: "colour" | "typeface", slotId: string): string {
    return "brand-" + kind + "-" + slotId;
}

/**
 * The size a level's name is drawn at: the size typed, within its
 * range (the same one its "i" states); nothing (the page's own size)
 * while the box is empty or holds no number.
 */
function previewSize(size: string, range: string): number | undefined {
    const bounds = pixelRange(range);
    if (!bounds || size.trim() === "" || !Number.isFinite(Number(size))) {
        return undefined;
    }
    return Number(clampedSize(size, bounds));
}

/**
 * A Text Hierarchy level's row height, px: its name's lines at the
 * LARGEST size its range allows (line height 1.2), and never under a
 * control's 45px. Fixed, so a size typed, stepped or switched off
 * never moves another row or resizes the box.
 */
export function levelHeight(): number {
    // Every row one height (an equal pitch): the room the tallest name
    // needs at the largest size its range allows (lines at 1.25, which hold
    // the type's whole height), and never
    // under the px box's square, which stands at the row's foot.
    return Math.max(44, ...BRAND_HIERARCHY_LEVELS.map(level =>
        Math.ceil((pixelRange(level.range)?.max ?? 18) * 1.25 * level.label.split(" / ").length)));
}

/** The Text Hierarchy's one box. */
const HIERARCHY_CARD = "brand-text-hierarchy";

/** A role (slot) with the one it needs switched on first. */
interface StyleSlot {
    readonly id: string;
    readonly label: string;
    readonly help: string;
    readonly dependsOn: string | undefined;
}

/** Whether a slot's prerequisite is switched on (or it has none). */
function prerequisiteOn(slots: readonly StyleSlot[], entries: readonly { enabled: boolean }[], index: number): boolean {
    const needs = slots[index].dependsOn;
    return !needs || entries[slots.findIndex(slot => slot.id === needs)]?.enabled === true;
}

/** The first role that can be added now (switched off, its prerequisite on), or null. */
function nextFree(slots: readonly StyleSlot[], entries: readonly { enabled: boolean }[]): number | null {
    const at = slots.findIndex((_slot, index) => !entries[index].enabled && prerequisiteOn(slots, entries, index));
    return at >= 0 ? at : null;
}

/**
 * A card moved to another role: what it holds goes to that slot,
 * switched on, and the slot it leaves takes back what that one held,
 * switched off -- so nothing typed into either is lost.
 */
function movedSlot<T extends { enabled: boolean }>(entries: readonly T[], from: number, to: number): T[] {
    return entries.map((entry, index) =>
        index === to ? { ...entries[from], enabled: true }
            : index === from ? { ...entries[to], enabled: false }
                : entry);
}

/* ---------- Help: how to choose and combine (the column "i"s) ---------- */

const COLOUR_ASSOCIATIONS: InfoPoint[] = [
    { title: "Red", text: "energy, passion, excitement and urgency." },
    { title: "Orange", text: "enthusiasm, creativity, warmth and playfulness." },
    { title: "Yellow", text: "optimism, happiness, positivity and attention." },
    { title: "Green", text: "nature, growth, health and renewal." },
    { title: "Blue", text: "trust, stability, calm and reliability." },
    { title: "Purple", text: "creativity, luxury, mystery and sophistication." },
    { title: "Pink", text: "love, care, playfulness and romance." },
    { title: "Brown", text: "natural, earthy, reliable and comforting." },
    { title: "Black", text: "strength, sophistication, authority and elegance." },
    { title: "White", text: "simplicity, purity, cleanliness and openness." },
    { title: "Grey", text: "neutrality, balance, practicality and formality." },
    "These are common associations rather than fixed meanings, and can change with context, shade and culture."
];

const COLOUR_COMBINATIONS: InfoPoint[] = [
    { title: "Monochromatic", text: "variations of one colour create a cohesive and controlled appearance." },
    { title: "Analogous", text: "neighbouring colours create harmony and visual continuity." },
    { title: "Complementary", text: "opposing colours create strong contrast and visual energy." },
    { title: "Triadic", text: "three evenly spaced colours create balanced variety and visual interest." },
    { title: "Neutral + Accent", text: "neutral colours with one stronger colour create restrained designs with focused emphasis." },
    { title: "Primary + Secondary", text: "a dominant brand colour supported by secondary colours creates recognition with visual flexibility." },
    "The 60 / 30 / 10 ratio is a starting point, not a rule, and the balance can change according to the application."
];

const TYPEFACE_STYLES: InfoPoint[] = [
    { title: "Serif", text: "letters with finishing strokes, often giving a traditional, editorial or refined feel. E.g. Georgia, Garamond, Times New Roman." },
    { title: "Sans-serif", text: "letters without finishing strokes, often giving a modern, clear and straightforward feel. E.g. Inter, Helvetica, Arial." },
    { title: "Slab serif", text: "serif typefaces with thick, block-like finishing strokes, often giving a strong, solid and distinctive feel. E.g. Rockwell, Roboto Slab." },
    { title: "Script", text: "typefaces inspired by handwriting or calligraphy, often giving a personal, elegant or expressive feel. E.g. Pacifico, Dancing Script." },
    { title: "Display", text: "typefaces designed for visual impact at larger sizes, often used for headlines, titles and short statements. E.g. Bebas Neue, Abril Fatface." },
    "These categories describe common visual characteristics and associations, not fixed meanings."
];

const HIERARCHY_RELATIONSHIP: InfoPoint[] = [
    "Use size and weight to distinguish levels, keep similar content at the same level, and avoid creating unnecessary text levels."
];

/** What each text level is for (the Text Hierarchy's one "i"). */
const LEVEL_PURPOSES: Record<string, string> = {
    h1: "the title of a page or document.",
    h2: "the headings of its sections.",
    h3: "the headings within a section.",
    body: "paragraphs and anything read at length.",
    caption: "captions, dates and labels, and the text of an interface."
};

/**
 * Every level in one list: its recommended range -- the same range its
 * px box keeps to -- and what it is for.
 */
const HIERARCHY_LEVEL_HELP: InfoPoint[] = BRAND_HIERARCHY_LEVELS.map(level => ({
    title: level.label + ", " + level.range + " px",
    text: LEVEL_PURPOSES[level.id] ?? ""
}));

const TYPEFACE_PAIRINGS: InfoPoint[] = [
    { title: "Serif + Sans-serif", text: "Georgia + Inter creates classic headings with clean, modern body text." },
    { title: "Display + Sans-serif", text: "Abril Fatface + Inter creates expressive headings with clear supporting text." },
    { title: "Sans-serif + Sans-serif", text: "Montserrat + Open Sans creates a clean, contemporary system with subtle contrast." },
    { title: "Serif + Serif", text: "Garamond + Georgia can create an editorial feel when each has a distinct role." },
    { title: "Single typeface family", text: "Inter Regular + Inter Bold creates a simple, consistent system using weight rather than different typefaces." },
    { title: "Readability", text: "use highly expressive typefaces selectively and prioritise clear, comfortable reading for body text and interface content." }
];

/**
 * The Brand System's Style page (see AnswerType.BrandStyle).
 *
 * Laid out as the Identity System's column pages are: every
 * section's heading and bullet guidance sit ABOVE the progress
 * line, every input below it. Three equal columns -- Colours,
 * Typography, Text Hierarchy.
 *
 * Below the line, the app's standard cards: one per colour and one
 * per typeface -- each a fixed role (slot) switched on, kept under
 * the same keys as ever, "+ Add" switching the next free role on and
 * the × switching it off (what it holds is kept, and the undo toast
 * offers it back) -- and one card for the Text Hierarchy, its levels
 * ticked on inside it. Roles still chain: a B colour needs its A
 * partner, the optional typeface the secondary, and H3 needs H2 --
 * so switching a prerequisite off takes its dependents with it
 * rather than leaving an orphan active.
 */
export default function BrandStyleEditor({

    value,

    onChange,

    disabled = false,

    startNumber = 1,

    columnsDivider,

    showInstructions = true,

    frameTitle,

    asTiles = false

}: BrandStyleEditorProps) {

    const style = asBrandStyleValue(value);

    /** Which cards are open -- see useItemFolds. */
    const folds = useItemFolds();

    /** The card ground and texts, for a folded colour card's tint. */
    const ink = useCardInk();

    /* The answer as it is now, for an undo offered a moment ago. */
    const latest = useRef({ style, onChange });
    latest.current = { style, onChange };

    const colourCards = BRAND_COLOUR_SLOTS
        .map((slot, index) => ({ slot, index }))
        .filter(({ index }) => style.colours[index].enabled);

    const typefaceCards = BRAND_TYPEFACE_SLOTS
        .map((slot, index) => ({ slot, index }))
        .filter(({ index }) => style.typefaces[index].enabled);

    /** "+ Add Colour" / "+ Add Typeface": the first role free now, opened. */
    function addSlot(list: "colours" | "typefaces") {
        const slots: readonly StyleSlot[] = list === "colours" ? BRAND_COLOUR_SLOTS : BRAND_TYPEFACE_SLOTS;
        const at = nextFree(slots, style[list]);
        if (at === null) {
            return;
        }
        if (list === "colours") {
            toggleColour(at, true);
        } else {
            toggleTypeface(at, true);
        }
        folds.expand(cardId(list === "colours" ? "colour" : "typeface", slots[at].id));
    }

    /**
     * The ×: the role is switched off (with any that need it), what it
     * holds kept under its key, and the undo toast offers it back.
     */
    function removeSlot(list: "colours" | "typefaces", index: number, what: string) {
        const before = style[list].map(entry => entry.enabled);
        if (list === "colours") {
            toggleColour(index, false);
        } else {
            toggleTypeface(index, false);
        }
        UndoService.offer(what + " removed.", () => {
            const { style: now, onChange: write } = latest.current;
            if (list === "colours") {
                write({ ...now, colours: now.colours.map((entry, position) => before[position] ? { ...entry, enabled: true } : entry) });
            } else {
                write({ ...now, typefaces: now.typefaces.map((entry, position) => before[position] ? { ...entry, enabled: true } : entry) });
            }
        });
    }

    /**
     * The card's role (Primary A, Secondary…): its own, or one free
     * now. A role another card needs (Primary A under Primary B)
     * cannot be left, so it is the only choice.
     */
    function roleField(
        what: string,
        slots: readonly StyleSlot[],
        entries: readonly { enabled: boolean }[],
        index: number,
        onMove: (to: number) => void,
        onMoved: (to: number) => void,
        /** The label beside the picker, on its first line. */
        inline = false
    ) {
        const needed = slots.some((slot, position) => slot.dependsOn === slots[index].id && entries[position].enabled);
        const choices = slots
            .map((slot, position) => ({ slot, position }))
            .filter(({ position }) => position === index || (!needed && !entries[position].enabled &&
                slots[position].dependsOn !== slots[index].id && prerequisiteOn(slots, entries, position)));
        const field = (
                <BusinessField label="Role" info={[slots[index].help]} inline={inline}>
                    <OptionPicker
                        label={what + " role"}
                        options={choices.map(({ slot }) => slot.label)}
                        disabled={disabled}
                        value={slots[index].label}
                        onChange={(next) => {
                            const to = slots.findIndex(slot => slot.label === next);
                            if (to >= 0 && to !== index) {
                                onMove(to);
                                onMoved(to);
                            }
                        }}
                    />
                </BusinessField>
            );
        return field;
    }

    /**
     * Switches a colour slot on or off, cascading the change to any
     * slot that depends on it -- turning Primary A off cannot leave
     * Primary B stranded in an active state its prerequisite no
     * longer supports.
     */
    function toggleColour(index: number, next: boolean) {

        const slot = BRAND_COLOUR_SLOTS[index];

        const colours = style.colours.map((colour, position) => {

            if (position === index) {
                return { ...colour, enabled: next };
            }

            const other = BRAND_COLOUR_SLOTS[position];

            return !next && other.dependsOn === slot.id
                ? { ...colour, enabled: false }
                : colour;

        });

        onChange({ ...style, colours });

    }

    function toggleTypeface(index: number, next: boolean) {

        const slot = BRAND_TYPEFACE_SLOTS[index];

        const typefaces = style.typefaces.map((typeface, position) => {

            if (position === index) {
                return { ...typeface, enabled: next };
            }

            const other = BRAND_TYPEFACE_SLOTS[position];

            return !next && other.dependsOn === slot.id
                ? { ...typeface, enabled: false }
                : typeface;

        });

        onChange({ ...style, typefaces });

    }

    function toggleLevel(id: string, next: boolean) {

        const hierarchy = { ...style.hierarchy, [id]: { ...style.hierarchy[id], enabled: next } };

        if (!next) {
            for (const level of BRAND_HIERARCHY_LEVELS) {
                if (level.dependsOn === id) {
                    hierarchy[level.id] = { ...hierarchy[level.id], enabled: false };
                }
            }
        }

        onChange({ ...style, hierarchy });

    }

    function updateColour(index: number, patch: Partial<BrandStyleAnswerValue["colours"][number]>) {
        onChange({
            ...style,
            colours: style.colours.map(
                (colour, position) => position === index ? { ...colour, ...patch } : colour
            )
        });
    }

    function updateTypeface(index: number, patch: Partial<BrandStyleAnswerValue["typefaces"][number]>) {
        onChange({
            ...style,
            typefaces: style.typefaces.map(
                (typeface, position) => position === index ? { ...typeface, ...patch } : typeface
            )
        });
    }

    function updateLevelSize(id: string, size: string) {
        onChange({
            ...style,
            hierarchy: {
                ...style.hierarchy,
                [id]: { ...style.hierarchy[id], size }
            }
        });
    }

    /*
        A level's name wider than its row (a large size in a narrow
        column) is SCALED to fit, from its left edge and its row's
        centre line, rather than wrapped: wrapping would need a second
        line the fixed row has no room for. Measured after every
        change and whenever the card's width changes.
    */
    const [hierarchyNode, setHierarchyNode] = useState<HTMLDivElement | null>(null);
    useLayoutEffect(() => {
        const card = hierarchyNode;
        if (!card) {
            return;
        }
        function fit() {
            card!.querySelectorAll<HTMLElement>(".brand-hierarchy-row .brand-slot-label").forEach(label => {
                label.style.removeProperty("--level-fit");
                // Within its row's width (its height is the row's to give:
                // it grows up from the square's foot, see the CSS).
                const room = label.clientWidth;
                const needed = label.scrollWidth;
                const fit = room > 0 && needed > room + 0.5 ? room / needed : 1;
                if (fit < 1) {
                    label.style.setProperty("--level-fit", String(Math.floor(fit * 1000) / 1000));
                }
            });
        }
        fit();
        if (typeof ResizeObserver === "undefined") {
            return;
        }
        let width = card.clientWidth;
        const observer = new ResizeObserver(() => {
            if (card.clientWidth !== width) {
                width = card.clientWidth;
                fit();
            }
        });
        observer.observe(card);
        return () => observer.disconnect();
    }, [style.hierarchy, hierarchyNode]);

    function heading(offset: number, info?: InfoPoint[]) {
        return (
            <ColumnHeading
                info={info}
                offset={offset}
                title={BRAND_STYLE_SECTIONS[offset]}
                startNumber={startNumber}
            />
        );
    }

    function bullets(lines: ReactNode[]) {
        return <GuidanceBullets lines={lines} show={showInstructions} />;
    }

    /**
     * The activation tick. `blocked` means a prerequisite is not
     * satisfied yet -- the tick is disabled and says why, rather
     * than silently doing nothing when clicked.
     */
    function activationTick(
        label: string,
        enabled: boolean,
        blocked: string | undefined,
        onToggle: (next: boolean) => void,
        /** What the role is for: shown behind an "i" beside its name. */
        help?: string,
        /** The label drawn at this size (a Text Hierarchy level's own), px. */
        labelSize?: number
    ) {
        return (
            /*
                Deliberately a <span>, not a <label> wrapping both: a
                label turns its WHOLE area into a click target, so
                tapping the title -- or the empty space beside it --
                toggled the slot, which is easy to do by accident
                while scanning. Only the box itself toggles now.

                The accessible name moves to `aria-label` on the box,
                so a screen reader still announces "Primary A,
                checkbox" even though the visible text is no longer
                wired up as a label.
            */
            <span
                className={
                    "brand-tick" +
                    (blocked ? " brand-tick-blocked" : "") +
                    // A label that will be set on two lines (see
                    // below) needs its box level with the first of
                    // them rather than centred on both.
                    (label.includes(" / ") ? " brand-tick-stacked" : "")
                }
                title={blocked}
            >
                <input
                    type="checkbox"
                    className="brand-tick-box"
                    aria-label={label}
                    checked={enabled}
                    disabled={disabled || !!blocked}
                    onChange={(event) => onToggle(event.target.checked)}
                />
                {/*
                    A label written with a " / " in it is two things
                    named together, so it is set on two lines rather
                    than one long one -- "Captions & Metadata /"
                    above "Interface". The slash stays on the first
                    line, where it belongs.

                    Driven by the label itself rather than by a
                    special case for one slot, and the accessible
                    name on the box above is still the whole string,
                    so nothing changes for a screen reader.
                */}
                {/* The "i" ends the LAST line, glued to its last
                    word (see InfoText) -- not after the block, where
                    it sat between the two lines. */}
                <span
                    className={"brand-slot-label" + (labelSize ? " brand-slot-label-sized" : "")}
                    style={labelSize ? { fontSize: labelSize + "px" } : undefined}
                >
                    {label.split(" / ").map((part, index, parts) => (
                        <span className="brand-slot-label-line" key={index}>
                            {index < parts.length - 1
                                ? `${part} /`
                                : (
                                    <InfoText text={part}>
                                        {help && <InfoNote label={label} points={[help]} />}
                                    </InfoText>
                                )}
                        </span>
                    ))}
                </span>
            </span>
        );
    }

    /** One colour card; `always` is the card floating over its tile (open, with no fold arrow). */
    function colourCard({ slot, index }: { slot: StyleSlot; index: number }, position: number, always = false) {

                    const colour = style.colours[index];
                    const swatch = normalizeHex(colour.hex);
                    const id = cardId("colour", slot.id);
                    const what = "Colour " + (position + 1);
                    const open = always || folds.isOpen(id);
                    /* Folded, the card is tinted with its own colour
                       (as much as keeps its text at 4.5:1). */
                    const tint = open ? null : cardTint(swatch, ink);

                    return (
                        <BusinessCard
                            key={slot.id}
                            anchor={id}
                            className={"brand-style-card" + (tint ? " brand-style-card-tinted" : "")}
                            kind="Colour"
                            number={position + 1}
                            name={colour.name}
                            onName={(name) => updateColour(index, { name })}
                            open={open}
                            onToggle={always ? undefined : () => folds.toggle(id)}
                            disabled={disabled}
                            style={tint ? { background: tint } : undefined}
                            summary={slot.label}
                            actions={
                                <BusinessRemove
                                    what={what}
                                    disabled={disabled}
                                    onRemove={() => removeSlot("colours", index, what)}
                                />
                            }
                        >

                            {/* Role and Colour, each label BESIDE its control
                                on the control's centre line, the labels in one
                                column and the controls from one x to the name
                                box's right edge (.brand-side-rows). */}
                            <div className="brand-side-rows business-field-run">

                            {roleField(
                                what,
                                BRAND_COLOUR_SLOTS,
                                style.colours,
                                index,
                                (to) => onChange({ ...style, colours: movedSlot(style.colours, index, to) }),
                                (to) => folds.expand(cardId("colour", BRAND_COLOUR_SLOTS[to].id)),
                                true
                            )}

                            {/* The contrast is the first point of the Colour's
                                "i", worked out live from the colour chosen. */}
                            <BusinessField
                                label="Colour"
                                inline
                                info={[...(swatch ? [contrastNote(swatch)] : []), ...CONTRAST_HELP]}
                            >
                                <div className="brand-colour-row">

                                    {/* The colour is a 32px box INSIDE the cell, at its right end, 6px from its top, bottom and right, as the date cell's calendar button is. */}
                                    <div className="date-cell-field brand-colour-cell">

                                        <input
                                            type="text"
                                            className="interview-input brand-hex-input"
                                            aria-label={`${slot.label} HEX`}
                                            placeholder="#000000"
                                            disabled={disabled}
                                            value={colour.hex}
                                            onChange={(event) => updateColour(index, { hex: limitedHexText(event.target.value, colour.hex) })}
                                        />

                                        <ColourPicker
                                            ariaLabel={`${slot.label} colour picker`}
                                            disabled={disabled}
                                            value={swatch ?? ""}
                                            onChange={(hex) => updateColour(index, { hex })}
                                        />

                                    </div>

                                    <BusinessRemove
                                        what={slot.label + " colour"}
                                        disabled={disabled || !colour.hex}
                                        onRemove={() => updateColour(index, { hex: "" })}
                                    />

                                </div>

                            </BusinessField>

                            </div>

                            {/* A growing box behind its tick, as every optional field. */}
                            <OptionalNote
                                label="Usage"
                                ariaLabel={`${slot.label} usage`}
                                placeholder="Where the colour is used"
                                disabled={disabled}
                                value={colour.usage}
                                onChange={(usage) => updateColour(index, { usage })}
                            />

                        </BusinessCard>
                    );

    }

    /** One typeface card; `always` is the card floating over its tile (open, with no fold arrow). */
    function typefaceCard({ slot, index }: { slot: StyleSlot; index: number }, position: number, always = false) {

                    const typeface = style.typefaces[index];
                    const id = cardId("typeface", slot.id);
                    const what = "Typeface " + (position + 1);

                    return (
                        <BusinessCard
                            key={slot.id}
                            anchor={id}
                            className="brand-style-card"
                            kind="Typeface"
                            number={position + 1}
                            name={typeface.font}
                            onName={(font) => updateTypeface(index, { font })}
                            open={always || folds.isOpen(id)}
                            onToggle={always ? undefined : () => folds.toggle(id)}
                            disabled={disabled}
                            summary={slot.label}
                            actions={
                                <BusinessRemove
                                    what={what}
                                    disabled={disabled}
                                    onRemove={() => removeSlot("typefaces", index, what)}
                                />
                            }
                        >

                            <div className="brand-side-rows business-field-run">
                            {roleField(
                                what,
                                BRAND_TYPEFACE_SLOTS,
                                style.typefaces,
                                index,
                                (to) => onChange({ ...style, typefaces: movedSlot(style.typefaces, index, to) }),
                                (to) => folds.expand(cardId("typeface", BRAND_TYPEFACE_SLOTS[to].id)),
                                true
                            )}
                            </div>

                            {/* A growing box behind its tick, as every optional
                                field: "Usage", as a colour's; its key stays
                                "Purpose". */}
                            <OptionalNote
                                label="Usage"
                                fieldId="Purpose"
                                ariaLabel={`${slot.label} usage`}
                                placeholder="What the typeface is used for"
                                disabled={disabled}
                                value={typeface.purpose}
                                onChange={(purpose) => updateTypeface(index, { purpose })}
                            />

                        </BusinessCard>
                    );

    }

    /** The Text Hierarchy's one box, a row for each level. */
    function hierarchyTable() {
        return (
                    <div
                        ref={setHierarchyNode}
                        className="business-foundation-card brand-style-card brand-hierarchy-card"
                        data-anchor={HIERARCHY_CARD}
                        style={{ "--level-height": levelHeight() + "px" } as CSSProperties}
                    >
    
                        <div className="brand-hierarchy-levels">
    
                            {BRAND_HIERARCHY_LEVELS.map(level => {
    
                                const entry = style.hierarchy[level.id];
    
                                const prerequisite = level.dependsOn
                                    ? BRAND_HIERARCHY_LEVELS.find(other => other.id === level.dependsOn)
                                    : undefined;
    
                                const prerequisiteMet =
                                    !prerequisite || style.hierarchy[prerequisite.id].enabled;
    
                                const blocked = prerequisiteMet
                                    ? undefined
                                    : `Activate ${prerequisite?.label} first`;
    
                                return (
    
                                    <div
                                        className="brand-hierarchy-row"
                                        key={level.id}
                                        // Its fixed height (levelHeight), and its name's lines.
                                        style={{
                                            "--level-height": levelHeight() + "px",
                                            "--level-lines": level.label.split(" / ").length
                                        } as CSSProperties}
                                    >
    
                                        {activationTick(
                                            level.label,
                                            entry.enabled,
                                            blocked,
                                            (next) => toggleLevel(level.id, next),
                                            // What each level is for, and its range, is in the
                                            // one "i" of the section's first guidance line.
                                            undefined,
                                            entry.enabled ? previewSize(entry.size, level.range) : undefined
                                        )}
    
                                        {entry.enabled && (
                                            <LevelSize
                                                label={level.label}
                                                range={level.range}
                                                value={entry.size}
                                                disabled={disabled}
                                                onChange={(next) => updateLevelSize(level.id, next)}
                                            />
                                        )}
    
                                    </div>
    
                                );
    
                            })}
    
                        </div>
    
                    </div>
        );
    }

    /* THE PAGE AS TILES (the page's tile system): two LARGE tiles. Colours carries every colour as a block; Typography & Text Hierarchy carries the typefaces. A
       tile opens its dialog: the colours, or the typefaces with the Text Hierarchy's table under them. A colour's or a typeface's box opens its card floating. */
    if (asTiles) {
        const info: InfoPoint[][] = [
            [
                "Choose colours that support the character and purpose of your organisation.", ...COLOUR_ASSOCIATIONS,
                "As a starting point, consider a 60 / 30 / 10 distribution guide.", ...COLOUR_COMBINATIONS,
                "Accessibility: check text/background contrast before assigning a colour to text or essential interface elements."
            ],
            [
                "Choose typefaces that support your brand's character while remaining appropriate for their intended use.", ...TYPEFACE_STYLES,
                "Use complementary typefaces and prioritise readability over personality.", ...TYPEFACE_PAIRINGS,
                "Recommended: use 1–2 typefaces for most brands; use 3 only when each has a clearly defined purpose."
            ],
            [
                "Use larger sizes for more important headings, and smaller sizes for longer text to keep it comfortable to read.", ...HIERARCHY_LEVEL_HELP,
                "Maintain a clear and consistent relationship between text levels.", ...HIERARCHY_RELATIONSHIP
            ]
        ];
        const rail = (section: number) => railId(BRAND_STYLE_SECTIONS[section]);
        const colourId = (slotId: string) => cardId("colour", slotId);
        const typefaceId = (slotId: string) => cardId("typeface", slotId);
        // WHAT A CARD STILL LACKS (SystemCardCompleteness.ts): a card with something written but not what it needs lights its box and its tile, flashing red.
        const missingById = new Map<string, readonly string[]>();
        colourCards.forEach(entry => { const lacks = brandColourMissing(style.colours[entry.index]); if (lacks.length > 0) { missingById.set(colourId(entry.slot.id), lacks); } });
        typefaceCards.forEach(entry => { const lacks = brandTypefaceMissing(style.typefaces[entry.index]); if (lacks.length > 0) { missingById.set(typefaceId(entry.slot.id), lacks); } });
        /** A card floating over its tile keeps the page's Style scope (its pickers, its roles). */
        const floating = (card: ReactNode) => (
            <div className="brand-style brand-style-columns" style={{ "--answer-column-count": 1 } as CSSProperties}>
                <div className="brand-style-body brand-style-cards">{card}</div>
            </div>
        );
        const inkOf = (swatch: string | null) => swatch ? (luminance(swatch) > 0.5 ? "#1c1c1c" : "#ffffff") : undefined;

        /** A blank card added and left blank is taken away again. */
        const addOf = (list: "colours" | "typefaces", kind: "colour" | "typeface", label: string): CardBoxAdd | undefined => {
            const slots: readonly StyleSlot[] = list === "colours" ? BRAND_COLOUR_SLOTS : BRAND_TYPEFACE_SLOTS;
            if (nextFree(slots, style[list]) === null) {
                return undefined;
            }
            const indexOf = (id: string) => slots.findIndex(slot => cardId(kind, slot.id) === id);
            return {
                label,
                disabled,
                onAdd: () => {
                    const at = nextFree(slots, latest.current.style[list]) ?? 0;
                    addSlot(list);
                    return cardId(kind, slots[at].id);
                },
                isBlank: (id: string) => {
                    const entry = latest.current.style[list][indexOf(id)] as { name?: string; hex?: string; usage?: string; font?: string; purpose?: string } | undefined;
                    return !entry || [entry.name, entry.hex, entry.usage, entry.font, entry.purpose].every(text => (text ?? "").trim() === "");
                },
                onRemove: (ids: string[]) => {
                    const { style: now, onChange: write } = latest.current;
                    const off = ids.map(indexOf).filter(at => at >= 0);
                    write({ ...now, [list]: now[list].map((entry, at) => off.includes(at) ? { ...entry, enabled: false } : entry) });
                }
            };
        };

        // The A colours on the top row, the B colours under them.
        const inPairs = [...colourCards.filter(entry => /A$/.test(entry.slot.label)), ...colourCards.filter(entry => !/A$/.test(entry.slot.label))];
        // In the dialog every colour keeps its place: a column for each of Primary, Secondary and Neutral, its A over its B (so removing one leaves its place empty).
        const cellOf = (slotIndex: number) => ({ column: Math.floor(slotIndex / 2) + 1, row: (slotIndex % 2) + 1 });
        const colourBoxes: PictureBox[] = inPairs.map((entry) => {
            const position = colourCards.indexOf(entry);
            const colour = style.colours[entry.index];
            const swatch = normalizeHex(colour.hex);
            return {
                id: colourId(entry.slot.id),
                cell: cellOf(entry.index),
                missing: missingById.get(colourId(entry.slot.id)),
                label: "Colour " + (position + 1) + ": " + (colour.name.trim() || entry.slot.label),
                style: swatch ? { background: swatch, color: inkOf(swatch) } : undefined,
                children: (
                    <>
                        <span className="picture-box-line">{entry.slot.label}</span>
                        <span className="picture-box-name">{colour.name.trim() || "Unnamed colour"}</span>
                        <span className="picture-box-line picture-box-code">{swatch ? swatch.toUpperCase() : "No colour yet"}</span>
                    </>
                )
            };
        });
        const typefaceBoxes: PictureBox[] = typefaceCards.map((entry, position) => {
            const typeface = style.typefaces[entry.index];
            return {
                id: typefaceId(entry.slot.id),
                missing: missingById.get(typefaceId(entry.slot.id)),
                label: "Typeface " + (position + 1) + ": " + (typeface.font.trim() || entry.slot.label),
                children: (
                    <>
                        <span className="picture-box-name">{typeface.font.trim() || "Unnamed typeface"}</span>
                        <span className="picture-box-line">{entry.slot.label}</span>
                        <span className="picture-box-specimen" style={typeface.font.trim() ? { fontFamily: '"' + typeface.font.trim() + '", sans-serif' } : undefined}>Aa</span>
                    </>
                )
            };
        });

        const colourTile: SectionTile = {
            id: "brand-style-colours",
            note: info[0],
            title: BRAND_STYLE_SECTIONS[0],
            large: true,
            view: true,
            rail: rail(0),
            holds: colourCards.map(entry => colourId(entry.slot.id)),
            add: addOf("colours", "colour", "colour"),
            cardFor: (id: string) => {
                const at = colourCards.findIndex(entry => colourId(entry.slot.id) === id);
                return at >= 0 ? floating(colourCard(colourCards[at], at, true)) : null;
            },
            picture: colourCards.length > 0
                ? (
                    <span className="brand-mosaic" style={{ "--mosaic-across": 3 } as CSSProperties}>
                        {inPairs.map((entry) => <span key={entry.slot.id} data-card={colourId(entry.slot.id)} style={{ transformOrigin: inwardOrigin(cellOf(entry.index).row * 3 - 3 + cellOf(entry.index).column - 1, 6, 3), gridColumn: cellOf(entry.index).column, gridRow: cellOf(entry.index).row, background: normalizeHex(style.colours[entry.index].hex) ?? "transparent" }} />)}
                    </span>
                )
                : <span className="section-tile-picture-colour section-tile-picture-colour-empty">No colours yet</span>,
            content: () => (
                <div className="column-tile-content brand-style" data-rail={rail(0)}>
                    <div className="business-engagement-section-head"><DialogHeading title={BRAND_STYLE_SECTIONS[0]} info={info[0]} noteSize="double" /></div>
                    <PictureBoxes label="Colours" items={colourBoxes} add={addOf("colours", "colour", "colour")} columns={3} addCell={(() => { const at = nextFree(BRAND_COLOUR_SLOTS, style.colours); return at === null ? undefined : cellOf(at); })()} />
                </div>
            )
        };

        const levels = BRAND_HIERARCHY_LEVELS.filter(level => style.hierarchy[level.id].enabled).length;
        const typographyTile: SectionTile = {
            id: "brand-style-typography",
            note: info[1],
            title: BRAND_STYLE_SECTIONS[1] + " &\n" + BRAND_STYLE_SECTIONS[2],
            large: true,
            view: true,
            rail: rail(1),
            holds: typefaceCards.map(entry => typefaceId(entry.slot.id)),
            add: addOf("typefaces", "typeface", "typeface"),
            cardFor: (id: string) => {
                const at = typefaceCards.findIndex(entry => typefaceId(entry.slot.id) === id);
                return at >= 0 ? floating(typefaceCard(typefaceCards[at], at, true)) : null;
            },
            picture: (
                <span className="brand-specimens">
                    {typefaceCards.map(entry => {
                        const font = style.typefaces[entry.index].font.trim();
                        return <span key={entry.slot.id} data-card={typefaceId(entry.slot.id)} style={font ? { fontFamily: '"' + font + '", sans-serif' } : undefined}>{font || entry.slot.label}</span>;
                    })}
                    <span className="brand-specimens-note">{levels + (levels === 1 ? " text level" : " text levels")}</span>
                </span>
            ),
            content: () => (
                <div className="column-tile-content brand-style" data-rail={rail(1)}>
                    <div className="business-engagement-section-head"><DialogHeading title={BRAND_STYLE_SECTIONS[1]} info={info[1]} noteSize="double" /></div>
                    <PictureBoxes label="Typefaces" items={typefaceBoxes} add={addOf("typefaces", "typeface", "typeface")} />
                    <div className="business-engagement-section-head" data-rail={rail(2)}><DialogHeading title={BRAND_STYLE_SECTIONS[2]} info={info[2]} noteSize="double" /></div>
                    <div className="brand-style-columns" style={{ "--answer-column-count": 1 } as CSSProperties}>
                        <div className="brand-style-body brand-style-cards">{hierarchyTable()}</div>
                    </div>
                </div>
            )
        };

        // The page: the Colours, the Typography & Text Hierarchy, then the Icon & Logo and the Brand Images (the Inventory editor hands over its two tiles).
        const page = (inventoryTiles: SectionTile[], imagesMissing: ReadonlyMap<string, readonly string[]> = new Map()) => (
            <div className="answer-columns business-foundation business-engagement business-capability column-tiles-page" style={{ "--answer-column-count": 1 } as CSSProperties}>
                <div
                    className="business-foundation-input business-foundation-card business-engagement-input"
                    data-anchor="column-tiles"
                    style={{ "--strategy-theme-hue": workHue("create") } as CSSProperties}
                >
                    <div className="card-scroll">
                        <div className="business-capability-section business-capability-tiles-section">
                            {frameTitle ? <div className="business-engagement-section-head tiles-frame-head"><span className="field-group-title business-foundation-subhead">{frameTitle}</span></div> : <div className="business-capability-heading-spacer" aria-hidden="true" />}
                            <SectionTiles label="Style" hue={workHue("create")} tiles={[colourTile, typographyTile, ...inventoryTiles]} incomplete={new Map([...missingById, ...imagesMissing])} />
                        </div>
                    </div>
                </div>
            </div>
        );
        return (
            <BrandInventoryEditor
                value={style.inventory}
                onChange={(next) => latest.current.onChange({ ...latest.current.style, inventory: next })}
                disabled={disabled}
                asTiles
                renderTiles={page}
            />
        );
    }

    return (

        <div
            className="brand-style brand-style-columns"
            style={{ "--answer-column-count": 3 } as CSSProperties}
        >

            {/* Row 1 -- headings and guidance, above the line */}
            <div className="brand-style-head">
                {heading(0)}
                {bullets([
                    <>
                        <InfoText text="Choose colours that support the character and purpose of your organisation.">
                            <InfoNote label="Common colour associations" points={COLOUR_ASSOCIATIONS} fullList />
                        </InfoText>
                    </>,
                    <>
                        <InfoText text="As a starting point, consider a 60 / 30 / 10 distribution guide.">
                            <InfoNote label="Common colour combinations" points={COLOUR_COMBINATIONS} fullList />
                        </InfoText>
                    </>,
                    "Accessibility: check text/background contrast before assigning a colour to text or essential interface elements."
                ])}
            </div>

            <div className="brand-style-head">
                {heading(1)}
                {bullets([
                    <>
                        <InfoText text="Choose typefaces that support your brand's character while remaining appropriate for their intended use.">
                            <InfoNote label="Typeface styles & examples" points={TYPEFACE_STYLES} fullList />
                        </InfoText>
                    </>,
                    <>
                        <InfoText text="Use complementary typefaces and prioritise readability over personality.">
                            <InfoNote label="Common pairings & examples" points={TYPEFACE_PAIRINGS} fullList />
                        </InfoText>
                    </>,
                    "Recommended: use 1–2 typefaces for most brands; use 3 only when each has a clearly defined purpose."
                ])}
            </div>

            <div className="brand-style-head">
                {heading(2)}
                {bullets([
                    <>
                        <InfoText text="Use larger sizes for more important headings, and smaller sizes for longer text to keep it comfortable to read.">
                            <InfoNote label="Text levels and their sizes" points={HIERARCHY_LEVEL_HELP} fullList />
                        </InfoText>
                    </>,
                    <>
                        <InfoText text="Maintain a clear and consistent relationship between text levels.">
                            <InfoNote label="Text levels" points={HIERARCHY_RELATIONSHIP} />
                        </InfoText>
                    </>
                ])}
            </div>

            {/* Row 2 -- the progress line, spanning every column */}
            {columnsDivider && (
                <div className="answer-columns-divider">{columnsDivider}</div>
            )}

            {/* Row 3 -- the inputs, below the line: the app's standard
                cards. One per colour and one per typeface -- each a
                role (a fixed slot, kept under the same key) that is
                switched on -- and one for the Text Hierarchy. */}
            <div className="brand-style-body brand-style-cards" data-rail={railId(BRAND_STYLE_SECTIONS[0])}>

                <div className="fold-group-head brand-style-cards-head">
                    <FoldAllToggle
                        ids={colourCards.map(({ slot }) => cardId("colour", slot.id))}
                        folds={folds}
                        label="colours"
                    />
                </div>

                {colourCards.map((entry, position) => colourCard(entry, position))}

                {nextFree(BRAND_COLOUR_SLOTS, style.colours) !== null && (
                    <div className="business-step-add-row">
                        <BusinessAddButton
                            label="Colour"
                            disabled={disabled}
                            onAdd={() => addSlot("colours")}
                        />
                    </div>
                )}

            </div>

            <div className="brand-style-body brand-style-cards" data-rail={railId(BRAND_STYLE_SECTIONS[1])}>

                <div className="fold-group-head brand-style-cards-head">
                    <FoldAllToggle
                        ids={typefaceCards.map(({ slot }) => cardId("typeface", slot.id))}
                        folds={folds}
                        label="typefaces"
                    />
                </div>

                {typefaceCards.map((entry, position) => typefaceCard(entry, position))}

                {nextFree(BRAND_TYPEFACE_SLOTS, style.typefaces) !== null && (
                    <div className="business-step-add-row">
                        <BusinessAddButton
                            label="Typeface"
                            disabled={disabled}
                            onAdd={() => addSlot("typefaces")}
                        />
                    </div>
                )}

            </div>

            <div className="brand-style-body brand-style-cards" data-rail={railId(BRAND_STYLE_SECTIONS[2])}>

                {/* An empty head row, as the other two columns have,
                    so the three columns' first cards start level. */}
                <div className="fold-group-head brand-style-cards-head" />

                {/* One plain box: the section's heading above names
                    it, so it has no head, number or fold of its own.
                    Each level's name is drawn at the size in its box. */}
                {hierarchyTable()}

            </div>

        </div>

    );

}

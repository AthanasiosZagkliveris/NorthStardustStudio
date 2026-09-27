import { CSSProperties, ReactNode } from "react";

import {
    BRAND_COLOUR_SLOTS,
    BRAND_HIERARCHY_LEVELS,
    BRAND_STYLE_SECTIONS,
    BRAND_TYPEFACE_SLOTS,
    BrandStyleAnswerValue,
    asBrandStyleValue
} from "../../framework/engine/AnswerUtils.ts";
import InfoNote, { InfoPoint } from "./InfoNote.tsx";
import { railId } from "./rails/railItems.ts";

interface BrandStyleEditorProps {

    value: unknown;

    onChange: (value: BrandStyleAnswerValue) => void;

    disabled?: boolean;

    /**
     * The number this page's FIRST section carries. The Brand
     * System numbers its parts continuously across all three pages
     * (1-4 Brand Foundation, 5-7 Style, 8-9 Inventory), so this
     * page starts at 5 rather than restarting at 1.
     */
    /** A page numbered under its own number ("2" gives 2.1, 2.2): see AnswerDefinition.nestedNumbering. */
    numberPrefix?: string;

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

/** WCAG relative luminance of a normalised HEX. */
function luminance(hex: string): number {
    const channels = [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16) / 255)
        .map(value => value <= 0.03928 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4));
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

/** WCAG contrast ratio between two HEX colours, 1 to 21. */
export function contrastRatio(one: string, other: string): number {
    const [light, dark] = [luminance(one), luminance(other)].sort((a, b) => b - a);
    return (light + 0.05) / (dark + 0.05);
}

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

/**
 * The Brand System's Style page (see AnswerType.BrandStyle).
 *
 * Laid out as the Identity System's column pages are: every
 * section's heading and bullet guidance sit ABOVE the progress
 * line, every input below it. Three equal columns -- Colours,
 * Typography, Text Hierarchy.
 *
 * Every slot is progressively disclosed. Deactivated, a slot shows
 * only its tick and its title; ticking it drops the rest of its
 * fields open. Slots also chain: a B colour can only be switched on
 * once its A partner is, the optional typeface needs the secondary
 * first, and H3 needs H2 -- so the palette can only be built in an
 * order that makes sense, and switching a prerequisite back off
 * takes its dependents with it rather than leaving an orphan
 * active.
 */
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

const TYPEFACE_PAIRINGS: InfoPoint[] = [
    { title: "Serif + Sans-serif", text: "Georgia + Inter creates classic headings with clean, modern body text." },
    { title: "Display + Sans-serif", text: "Abril Fatface + Inter creates expressive headings with clear supporting text." },
    { title: "Sans-serif + Sans-serif", text: "Montserrat + Open Sans creates a clean, contemporary system with subtle contrast." },
    { title: "Serif + Serif", text: "Garamond + Georgia can create an editorial feel when each has a distinct role." },
    { title: "Single typeface family", text: "Inter Regular + Inter Bold creates a simple, consistent system using weight rather than different typefaces." },
    { title: "Readability", text: "use highly expressive typefaces selectively and prioritise clear, comfortable reading for body text and interface content." }
];

export default function BrandStyleEditor({

    value,

    onChange,

    disabled = false,

    startNumber = 1,

    numberPrefix,

    columnsDivider,

    showInstructions = true

}: BrandStyleEditorProps) {

    const style = asBrandStyleValue(value);

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
            // Digits only -- "px" is printed beside the field, so a
            // typed "24px" must not become "24pxpx".
            hierarchy: { ...style.hierarchy, [id]: { ...style.hierarchy[id], size: size.replace(/[^0-9]/g, "") } }
        });
    }

    function heading(offset: number) {
        return (
            <h3 className="answer-column-label brand-section-heading">
                <span className="answer-column-label-number">
                    {numberPrefix ? numberPrefix + "." + (offset + 1) : (startNumber + offset) + "."}
                </span>
                <span className="answer-column-label-text">{BRAND_STYLE_SECTIONS[offset]}</span>
            </h3>
        );
    }

    function bullets(lines: ReactNode[]) {
        // Nothing at all when the page's Help button has hidden
        // the guidance -- an empty block would still take a grid
        // track and its gap.
        if (!showInstructions) {
            return null;
        }

        return (
            <div className="answer-column-questions">
                {lines.map((line, index) => (
                    <span key={index} className="answer-question-line answer-question-line-bullet">
                        {"• "}{line}
                    </span>
                ))}
            </div>
        );
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
        help?: string
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
                <span className="brand-slot-label">
                    {label.split(" / ").map((part, index, parts) => (
                        <span className="brand-slot-label-line" key={index}>
                            {index < parts.length - 1 ? `${part} /` : part}
                        </span>
                    ))}
                </span>
                {help && <InfoNote label={label} points={[help]} />}
            </span>
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
                        Choose colours that support the character and purpose of your organisation.{" "}
                        <InfoNote label="Common colour associations" points={COLOUR_ASSOCIATIONS} fullList />
                    </>,
                    <>
                        As a starting point, consider a 60 / 30 / 10 distribution guide.{" "}
                        <InfoNote label="Common colour combinations" points={COLOUR_COMBINATIONS} fullList />
                    </>,
                    "Accessibility: check text/background contrast before assigning a colour to text or essential interface elements."
                ])}
            </div>

            <div className="brand-style-head">
                {heading(1)}
                {bullets([
                    <>
                        Choose typefaces that support your brand's character while remaining appropriate for their intended use.{" "}
                        <InfoNote label="Typeface styles & examples" points={TYPEFACE_STYLES} fullList />
                    </>,
                    <>
                        Use complementary typefaces and prioritise readability over personality.{" "}
                        <InfoNote label="Common pairings & examples" points={TYPEFACE_PAIRINGS} fullList />
                    </>,
                    "Recommended: use 1–2 typefaces for most brands; use 3 only when each has a clearly defined purpose."
                ])}
            </div>

            <div className="brand-style-head">
                {heading(2)}
                {bullets([
                    "Use larger sizes for more important headings, and smaller sizes for longer text to keep it comfortable to read.",
                    <>
                        Maintain a clear and consistent relationship between text levels.{" "}
                        <InfoNote label="Text levels" points={HIERARCHY_RELATIONSHIP} />
                    </>
                ])}
            </div>

            {/* Row 2 -- the progress line, spanning every column */}
            {columnsDivider && (
                <div className="answer-columns-divider">{columnsDivider}</div>
            )}

            {/* Row 3 -- the inputs, below the line */}
            <div className="brand-style-body" data-rail={railId(BRAND_STYLE_SECTIONS[0])}>

                {BRAND_COLOUR_SLOTS.map((slot, index) => {

                    const colour = style.colours[index];
                    const swatch = normalizeHex(colour.hex);

                    const prerequisite = slot.dependsOn
                        ? BRAND_COLOUR_SLOTS.find(other => other.id === slot.dependsOn)
                        : undefined;

                    const prerequisiteMet = !prerequisite || style.colours[
                        BRAND_COLOUR_SLOTS.findIndex(other => other.id === prerequisite.id)
                    ].enabled;

                    const blocked = prerequisiteMet
                        ? undefined
                        : `Activate ${prerequisite?.label} first`;

                    return (

                        <div className="brand-colour" key={slot.id}>

                            {activationTick(
                                slot.label,
                                colour.enabled,
                                blocked,
                                (next) => toggleColour(index, next),
                                slot.help
                            )}

                            {/*
                                Disclosed only when active. A
                                deactivated slot is its tick and title
                                alone, so the column reads as a short
                                checklist until a colour is actually
                                being defined.
                            */}
                            {colour.enabled && (

                                <div className="brand-slot-fields">

                                    <div className="brand-colour-row">

                                        <input
                                            type="color"
                                            className={`brand-colour-picker${swatch ? "" : " brand-colour-picker-empty"}`}
                                            aria-label={`${slot.label} colour picker`}
                                            disabled={disabled}
                                            value={swatch ?? "#ffffff"}
                                            onChange={(event) => updateColour(index, { hex: event.target.value })}
                                        />

                                        <input
                                            type="text"
                                            className="interview-input brand-hex-input"
                                            aria-label={`${slot.label} HEX`}
                                            placeholder="#000000"
                                            disabled={disabled}
                                            value={colour.hex}
                                            onChange={(event) => updateColour(index, { hex: event.target.value })}
                                        />

                                    </div>

                                    <input
                                        type="text"
                                        className="interview-input"
                                        aria-label={`${slot.label} name`}
                                        placeholder="Name"
                                        disabled={disabled}
                                        value={colour.name}
                                        onChange={(event) => updateColour(index, { name: event.target.value })}
                                    />

                                    <input
                                        type="text"
                                        className="interview-input"
                                        aria-label={`${slot.label} usage`}
                                        placeholder="Usage"
                                        disabled={disabled}
                                        value={colour.usage}
                                        onChange={(event) => updateColour(index, { usage: event.target.value })}
                                    />

                                    {normalizeHex(colour.hex) && (
                                        <span className="brand-style-contrast">
                                            {contrastNote(normalizeHex(colour.hex)!)}
                                        </span>
                                    )}

                                </div>

                            )}

                        </div>

                    );

                })}

            </div>

            <div className="brand-style-body" data-rail={railId(BRAND_STYLE_SECTIONS[1])}>

                {BRAND_TYPEFACE_SLOTS.map((slot, index) => {

                    const typeface = style.typefaces[index];

                    const prerequisite = slot.dependsOn
                        ? BRAND_TYPEFACE_SLOTS.find(other => other.id === slot.dependsOn)
                        : undefined;

                    const prerequisiteMet = !prerequisite || style.typefaces[
                        BRAND_TYPEFACE_SLOTS.findIndex(other => other.id === prerequisite.id)
                    ].enabled;

                    const blocked = prerequisiteMet
                        ? undefined
                        : `Activate ${prerequisite?.label} first`;

                    return (

                        <div className="brand-typeface" key={slot.id}>

                            {activationTick(
                                slot.label,
                                typeface.enabled,
                                blocked,
                                (next) => toggleTypeface(index, next),
                                slot.help
                            )}

                            {typeface.enabled && (

                                <div className="brand-slot-fields">

                                    <input
                                        type="text"
                                        className="interview-input"
                                        aria-label={`${slot.label} font`}
                                        placeholder="Font"
                                        disabled={disabled}
                                        value={typeface.font}
                                        onChange={(event) => updateTypeface(index, { font: event.target.value })}
                                    />

                                    <input
                                        type="text"
                                        className="interview-input"
                                        aria-label={`${slot.label} purpose`}
                                        placeholder="Purpose"
                                        disabled={disabled}
                                        value={typeface.purpose}
                                        onChange={(event) => updateTypeface(index, { purpose: event.target.value })}
                                    />

                                </div>

                            )}

                        </div>

                    );

                })}

            </div>

            {/*
                Its own class because this section stacks at a
                tighter 6px: a hierarchy level is one line, so the
                gap between two slots here IS the gap between two
                number holders, and it matches the 6px Colours and
                Typography use between the fields inside a slot.
            */}
            <div
                className="brand-style-body brand-hierarchy-body"
                data-rail={railId(BRAND_STYLE_SECTIONS[2])}
            >

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

                        <div className="brand-hierarchy-row" key={level.id}>

                            {activationTick(
                                level.label,
                                entry.enabled,
                                blocked,
                                (next) => toggleLevel(level.id, next),
                                "Recommended range: " + level.range + " px."
                            )}

                            {entry.enabled && (

                                <span className="brand-hierarchy-size">

                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        className="interview-input brand-size-input"
                                        aria-label={`${level.label} size in pixels, recommended ${level.range}`}
                                        placeholder={level.range}
                                        disabled={disabled}
                                        value={entry.size}
                                        onChange={(event) => updateLevelSize(level.id, event.target.value)}
                                    />

                                    <span className="brand-hierarchy-unit" aria-hidden="true">px</span>

                                </span>

                            )}

                        </div>

                    );

                })}

            </div>

        </div>

    );

}

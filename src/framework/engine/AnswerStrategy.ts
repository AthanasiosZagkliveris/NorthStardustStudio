/**
 * THE STRATEGY SYSTEM: Foundation, Period, Themes, Goals, Objectives and Metrics.
 * Split out of AnswerUtils.ts (still importable from there).
 */
import { CURRENCY_CODES } from "./Currencies.ts";
import { asText, randomId } from "./Readers.ts";
import { nextPaletteHue, paletteHue, paletteHuesInOrder } from "./Palette.ts";

/* ==========================================================
   Strategy System

   Three pages that read forward: the Foundation page owns the
   Strategic Period and the Strategic Themes, the Strategic Period
   page develops each Theme into Goals / Objectives / Initiatives /
   Metrics, and the Roadmap page draws both across a timeline.

   Only the Foundation page STORES the Period and the Themes; the
   other two hold references to them. A Theme renamed on page 1 is
   renamed everywhere at once, and the three pages can never drift
   apart the way three copies would.
========================================================== */

/** The Foundation page's four columns, in order. */
export const STRATEGY_FOUNDATION_SECTIONS = [
    "Current Situation Analysis",
    "SWOT Analysis",
    "Strategic Compass",
    "Strategic Period"
] as const;

/** The four quadrants of the SWOT column, in order. */
export const STRATEGY_SWOT_QUADRANTS = [
    { id: "strengths", label: "Strengths" },
    { id: "weaknesses", label: "Weaknesses" },
    { id: "opportunities", label: "Opportunities" },
    { id: "threats", label: "Threats" }
] as const;

/** How often a Metric is measured. */
export const STRATEGY_METRIC_FREQUENCIES = [
    "Weekly",
    "Monthly",
    "Quarterly",
    "Semiannually",
    "Annually"
] as const;

/**
 * What a Metric's Baseline and Target are counted in. A money Metric
 * is Currency (its currency chosen beside it); anything else counted
 * is a Number, what it counts said in the Metric's name or
 * description. (A "Custom" unit, named in a box of its own, was a
 * second way to say Currency -- "£" -- and is read as one of these
 * now; see migratedMetricUnit.)
 */
export const STRATEGY_METRIC_UNITS = [
    "Number",
    "Percentage",
    "Currency"
] as const;

/** A money Metric: its currency is chosen as a Business price's is. */
export const STRATEGY_METRIC_CURRENCY_UNIT = "Currency";

/**
 * A month/year point. Both halves are strings because both come
 * from a <select>, and an unset point is "" rather than a sentinel
 * number that could be mistaken for a real month.
 */
export interface StrategyMonthValue {
    month: string;
    year: string;
}

/** A start and end month/year. Used for both Periods. */
export interface StrategyRangeValue {
    start: StrategyMonthValue;
    end: StrategyMonthValue;
}

export interface StrategyThemeValue {
    id: string;
    name: string;
    description: string;
}

export interface StrategyFoundationValue {
    situation: string;
    /**
     * Where the Current Situation text came from: "auto", the draft
     * built from the Business System (kept in step with it); "edited",
     * the founder's own words (never replaced without asking); "" for
     * an answer saved before the draft existed.
     */
    situationSource: "" | "auto" | "edited";
    swot: Record<string, string[]>;
    compass: string;
    period: StrategyRangeValue;
    themes: StrategyThemeValue[];
}

export interface StrategyMetricValue {
    id: string;
    name: string;
    description: string;
    baseline: string;
    target: string;
    frequency: string;
    unit: string;
    /**
     * For a Currency Metric: its currency code. "" is the
     * organization's own (from the Legal Entity country), so it
     * follows the registration as a Business price does.
     */
    currency: string;
}

export interface StrategyObjectiveValue {
    id: string;
    name: string;
    description: string;
    period: StrategyRangeValue;
    initiatives: string[];
    metrics: StrategyMetricValue[];
    /** The founder who owns it -- a Legal Entity founder id, or "". */
    ownerId: string;
    /**
     * The Responsible tick, unticked: this objective has no responsible
     * by choice. Absent means ticked (the default), so nothing stored
     * before this key existed changes. See responsibleIsOff.
     */
    responsibleOff?: boolean;
}

export interface StrategyGoalValue {
    id: string;
    name: string;
    description: string;
    objectives: StrategyObjectiveValue[];
}

/**
 * The Strategic Period page's stored value.
 *
 * Keyed by Theme id rather than held as a parallel array: a Theme
 * reordered or deleted on the Foundation page must never silently
 * re-point this page's Goals at a different Theme, and a map cannot
 * be knocked out of step by an insertion the way an array can.
 */
export interface StrategicPeriodValue {
    goalsByTheme: Record<string, StrategyGoalValue[]>;
}


export function strategyStringList(value: unknown, minimum: number): string[] {

    const list = Array.isArray(value) ? value.map(asText) : [];

    while (list.length < minimum) {
        list.push("");
    }

    return list;

}

export function strategyMonth(value: unknown): StrategyMonthValue {

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};

    return { month: asText(source.month), year: asText(source.year) };

}

export function strategyRange(value: unknown): StrategyRangeValue {

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};

    return { start: strategyMonth(source.start), end: strategyMonth(source.end) };

}

export function isMonthSet(month: StrategyMonthValue): boolean {
    return month.month.trim().length > 0 && month.year.trim().length > 0;
}

export function isRangeSet(range: StrategyRangeValue): boolean {
    return isMonthSet(range.start) && isMonthSet(range.end);
}

/**
 * A month/year as one comparable integer (year * 12 + month), so
 * ranges can be compared and iterated without any date arithmetic.
 * -1 for an unset point, which never compares as inside a range.
 */
export function monthIndex(month: StrategyMonthValue): number {

    if (!isMonthSet(month)) {
        return -1;
    }

    return Number(month.year) * 12 + (Number(month.month) - 1);

}

export function monthFromIndex(index: number): StrategyMonthValue {
    return {
        year: String(Math.floor(index / 12)),
        month: String((index % 12) + 1).padStart(2, "0")
    };
}

export const STRATEGY_MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
] as const;

/** "03/26" -- the MM/YY the Strategy page titles are written in. */
export function formatMonthShort(month: StrategyMonthValue): string {

    if (!isMonthSet(month)) {
        return "MM/YY";
    }

    return month.month.padStart(2, "0") + "/" + month.year.slice(-2);

}

/**
 * A Strategy page title with its period: the placeholder "MM/YY -
 * MM/YY" becomes " · Jan 2027 – Dec 2029" once the Strategic Period
 * is set, and nothing until then.
 */
export function titleWithPeriod(title: string, range: StrategyRangeValue): string {
    const period = isRangeSet(range) ? " · " + formatRangeAbbrev(range) : "";
    return title.replace(/\s*MM\/YY - MM\/YY/, period);
}

/** A period as "Jan 2027 – Dec 2029". */
export function formatRangeAbbrev(range: StrategyRangeValue): string {
    const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const label = (month: StrategyMonthValue) => names[Number(month.month) - 1] + " " + month.year;
    return label(range.start) + " – " + label(range.end);
}

export function formatRangeShort(range: StrategyRangeValue): string {
    return formatMonthShort(range.start) + " - " + formatMonthShort(range.end);
}

export function formatMonthLong(month: StrategyMonthValue): string {

    if (!isMonthSet(month)) {
        return "";
    }

    return STRATEGY_MONTH_NAMES[Number(month.month) - 1] + " " + month.year;

}

export function asStrategyFoundationValue(value: unknown): StrategyFoundationValue {

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};

    const storedSwot = source.swot && typeof source.swot === "object" && !Array.isArray(source.swot)
        ? source.swot as Record<string, unknown>
        : {};

    const swot: Record<string, string[]> = {};

    for (const quadrant of STRATEGY_SWOT_QUADRANTS) {
        // One line each from the start: a quadrant showing nothing
        // but an empty space reads as broken rather than as
        // "nothing entered yet".
        swot[quadrant.id] = strategyStringList(storedSwot[quadrant.id], 1);
    }

    const themes = (Array.isArray(source.themes) ? source.themes : []).map(entry => {

        const theme = entry && typeof entry === "object" && !Array.isArray(entry)
            ? entry as Record<string, unknown>
            : {};

        return {
            id: asText(theme.id) || randomId("theme"),
            name: asText(theme.name),
            description: asText(theme.description)
        };

    });

    return {
        situation: asText(source.situation),
        situationSource: source.situationSource === "auto" || source.situationSource === "edited"
            ? source.situationSource
            : "",
        swot,
        compass: asText(source.compass),
        period: strategyRange(source.period),
        themes
    };

}

export function strategyMetric(value: unknown): StrategyMetricValue {

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};

    return {
        id: asText(source.id) || randomId("metric"),
        name: asText(source.name),
        baseline: asText(source.baseline),
        target: asText(source.target),
        frequency: asText(source.frequency),
        ...migratedMetricUnit(asText(source.unit), asText(source.customUnit), asText(source.currency), asText(source.description))
    };

}

/** Currency symbols a "Custom" unit was written as, and their codes. */
export const METRIC_UNIT_SYMBOLS: Record<string, string> = {
    "£": "GBP", "$": "USD", "US$": "USD", "€": "EUR", "¥": "JPY", "C$": "CAD", "A$": "AUD", "CHF": "CHF"
};

/**
 * A Metric saved with the "Custom" unit, read as one of the three:
 * a currency's symbol or code (£, $, €, GBP, USD…) is Currency in
 * that currency; "%" or "percent" is Percentage; "number" or "count"
 * is Number; anything else is a Number, its words kept at the end of
 * the Description ("Unit: hours per build"), so nothing is lost.
 */
export function migratedMetricUnit(
    unit: string,
    customUnit: string,
    currency: string,
    description: string
): { unit: string; currency: string; description: string } {
    if (unit !== "Custom") {
        return { unit, currency, description };
    }
    const text = customUnit.trim();
    const code = METRIC_UNIT_SYMBOLS[text] ?? (/^[A-Za-z]{3}$/.test(text) && CURRENCY_CODES.includes(text.toUpperCase()) ? text.toUpperCase() : "");
    if (code) {
        return { unit: "Currency", currency: code, description };
    }
    if (/^(%|percent(age)?)$/i.test(text)) {
        return { unit: "Percentage", currency, description };
    }
    if (text === "" || /^(number|count|#)$/i.test(text)) {
        return { unit: "Number", currency, description };
    }
    return {
        unit: "Number",
        currency,
        description: (description.trim() ? description.replace(/\s+$/, "") + "\n" : "") + "Unit: " + text
    };
}

export function strategyObjective(value: unknown): StrategyObjectiveValue {

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};

    const metrics = (Array.isArray(source.metrics) ? source.metrics : []).map(strategyMetric);

    return {
        id: asText(source.id) || randomId("objective"),
        name: asText(source.name),
        description: asText(source.description),
        period: strategyRange(source.period),
        initiatives: strategyStringList(source.initiatives, 1),
        metrics: metrics.length > 0 ? metrics : [strategyMetric(undefined)],
        ownerId: asText(source.ownerId),
        ...(source.responsibleOff === true ? { responsibleOff: true } : {})
    };

}

export function strategyGoal(value: unknown): StrategyGoalValue {

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};

    const objectives = (Array.isArray(source.objectives) ? source.objectives : []).map(strategyObjective);

    return {
        id: asText(source.id) || randomId("goal"),
        name: asText(source.name),
        description: asText(source.description),
        objectives: objectives.length > 0 ? objectives : [strategyObjective(undefined)]
    };

}

export function createStrategyGoal(): StrategyGoalValue {
    return strategyGoal(undefined);
}

export function createStrategyObjective(): StrategyObjectiveValue {
    return strategyObjective(undefined);
}

export function createStrategyMetric(): StrategyMetricValue {
    return strategyMetric(undefined);
}

/** A Theme's name as shown: "Untitled Theme" until it has one. */
export function strategyThemeName(theme: StrategyThemeValue): string {
    return theme.name.trim().length > 0 ? theme.name : "Untitled Theme";
}

export function createStrategyTheme(name = "", description = ""): StrategyThemeValue {
    return { id: randomId("theme"), name, description };
}

/**
 * Common Strategic Themes for a small organization: broad,
 * outcome-oriented areas of focus, offered as suggestions. A founder
 * may pick any, change them, or write their own.
 */
export const STRATEGY_THEME_SUGGESTIONS: { name: string; description: string }[] = [
    { name: "Growth & Market", description: "Focus on expanding the organisation's customer base, market presence, reach, or overall scale." },
    { name: "Customers & Experience", description: "Focus on acquiring, retaining, understanding, and creating greater value for customers, including improving their overall experience." },
    { name: "Products & Innovation", description: "Focus on developing, improving, expanding, or innovating the organisation's products, services, offerings, or intellectual property." },
    { name: "Revenue & Financial Sustainability", description: "Focus on building sustainable revenue, improving profitability, managing costs, strengthening cash flow, and achieving financial stability." },
    { name: "Brand & Positioning", description: "Focus on strengthening brand recognition, differentiation, reputation, market positioning, and the organisation's relationship with its audience." },
    { name: "Operations & Capability", description: "Focus on improving operational efficiency and developing the people, systems, technology, resources, and capabilities required to execute the strategy." },
    { name: "Partnerships & Expansion", description: "Focus on developing strategic partnerships, entering new markets or locations, and creating new opportunities through external relationships." }
];

export function asStrategicPeriodValue(value: unknown): StrategicPeriodValue {

    const source = value && typeof value === "object" && !Array.isArray(value)
        ? value as Record<string, unknown>
        : {};

    const stored = source.goalsByTheme && typeof source.goalsByTheme === "object"
        ? source.goalsByTheme as Record<string, unknown>
        : {};

    const goalsByTheme: Record<string, StrategyGoalValue[]> = {};

    for (const entry of Object.entries(stored)) {
        goalsByTheme[entry[0]] = (Array.isArray(entry[1]) ? entry[1] : []).map(strategyGoal);
    }

    return { goalsByTheme };

}

/**
 * The Goals stored for one Theme, seeded with the single Goal a
 * Theme always starts with.
 *
 * Seeded on READ rather than on write, so a Theme created on the
 * Foundation page already has its first Goal, Objective, Initiative
 * and Metric the first time this page is opened -- without page 1
 * needing to know anything about page 2's shape.
 *
 * The seeded ids are DERIVED from the Theme's own id rather than
 * generated. They have to be: nothing is stored until the user types
 * something, so this runs again on every render, and a random id
 * would be a different id each time. The page tracks which box is
 * open by id, so that made a seeded Goal impossible to reopen once
 * closed -- it was no longer the box the page had a note of.
 */
export function strategyGoalsForTheme(
    value: StrategicPeriodValue,
    themeId: string
): StrategyGoalValue[] {

    const goals = value.goalsByTheme[themeId];

    if (goals && goals.length > 0) {
        return goals;
    }

    return [{
        id: `${themeId}-goal-1`,
        name: "",
        description: "",
        objectives: [{
            id: `${themeId}-objective-1`,
            name: "",
            description: "",
            period: { start: { month: "", year: "" }, end: { month: "", year: "" } },
            initiatives: [""],
            ownerId: "",
            metrics: [{
                id: `${themeId}-metric-1`,
                name: "",
                description: "",
                baseline: "",
                target: "",
                frequency: "",
                unit: "",
                currency: ""
            }]
        }]
    }];

}

/** Whether a Theme has anything recorded against it on page 2. */
export function strategyThemeHasContent(
    value: StrategicPeriodValue,
    themeId: string
): boolean {

    const goals = value.goalsByTheme[themeId];

    if (!goals) {
        return false;
    }

    return goals.some(goal =>
        goal.name.trim().length > 0 ||
        goal.description.trim().length > 0 ||
        goal.objectives.some(objective =>
            objective.name.trim().length > 0 ||
            objective.description.trim().length > 0 ||
            isRangeSet(objective.period) ||
            objective.initiatives.some(entry => entry.trim().length > 0) ||
            objective.metrics.some(metric => metric.name.trim().length > 0)
        )
    );

}

/**
 * Whether each of the Foundation page's four columns still needs
 * attention, in the order STRATEGY_FOUNDATION_SECTIONS lists them.
 */
export function strategyFoundationSectionsEmpty(value: unknown): boolean[] {

    const foundation = asStrategyFoundationValue(value);

    const swotEmpty = STRATEGY_SWOT_QUADRANTS.some(quadrant =>
        !(foundation.swot[quadrant.id] ?? []).some(entry => entry.trim().length > 0)
    );

    // The fourth column is done once the Period is set. Strategic
    // Themes are optional: a founder may define none.
    const periodEmpty = !isRangeSet(foundation.period);

    return [
        foundation.situation.trim().length === 0,
        swotEmpty,
        foundation.compass.trim().length === 0,
        periodEmpty
    ];

}

/**
 * Whether an Objective still needs attention: a name, a period, at
 * least one Initiative, and at least one named Metric.
 */
export function strategyObjectiveIncomplete(objective: StrategyObjectiveValue): boolean {

    return objective.name.trim().length === 0 ||
        !isRangeSet(objective.period) ||
        !objective.initiatives.some(entry => entry.trim().length > 0) ||
        !objective.metrics.some(metric => metric.name.trim().length > 0);

}

/**
 * A colour for each Strategic Theme, keyed by id.
 *
 * Themes are the only thing on these pages that repeats without a
 * fixed identity -- there is no "first" Theme in the way there is a
 * Primary colour or an Icon slot -- so a quiet tint is what lets a
 * reader tell one Theme's block from the next at a glance, on the
 * Strategic Period page and the Roadmap alike.
 *
 * Every Theme gets a DIFFERENT palette colour (Palette.ts), which
 * is why this takes the whole list rather than one id: hashing
 * each id on its own could land two Themes on the same colour,
 * and two Themes that look alike is the one thing the tint exists
 * to prevent. The palette's eight go round in its own order, each
 * well away from the one before.
 *
 * The order is taken from the ids sorted, not from the Themes'
 * positions, so reordering the Themes does not repaint them --
 * a colour follows its Theme.
 */
export function strategyThemeHues(themeIds: string[]): Record<string, number> {
    return paletteHuesInOrder([...new Set(themeIds)].sort());
}

/**
 * A hue for one thing, derived from THE THING rather than from
 * its place among its siblings.
 *
 * strategyThemeHues above hands out the palette across whatever
 * it is handed, which keeps neighbours apart -- but a colour is
 * then a function of POSITION. Delete the first of two Segments
 * and the second inherits its colour, so the card that is left
 * looks like the card that went. A colour that moves between
 * things is worse than a colour that is merely close to another.
 *
 * Hashed with FNV-1a, whose avalanche means two ids differing by
 * one character land nowhere near each other. Tenths of a degree
 * rather than whole ones, so there is no needless clustering.
 *
 * This is a raw hue, as Segments recorded before the palette
 * stored it: draw it through paletteHue (as stableCardHue does).
 */
export function stableHue(id: string): number {

    let hash = 2166136261;

    for (let index = 0; index < id.length; index++) {
        hash ^= id.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return ((hash >>> 0) % 3600) / 10;

}

/** The palette colour a thing with a fixed id is drawn in: its stable hue's nearest. */
export function stableCardHue(id: string): number {
    return paletteHue(stableHue(id));
}

/**
 * A Segment's colour: the hue it was given, else its stable one --
 * drawn as the nearest palette colour, so a hue stored before the
 * palette existed (any point on the wheel) still draws calm. The
 * stored value itself is left as it is.
 */
export function segmentHue(segment: { id: string; hue?: number }): number {
    return paletteHue(segment.hue ?? stableHue(segment.id));
}

/**
 * The palette hue for a NEW thing, given the hues its siblings
 * already have (see nextPaletteHue): the next palette colour after
 * its neighbour's, the least used first, never the neighbour's own.
 *
 * Chosen once and then STORED, which is what keeps it still.
 * Recomputing it against the current siblings would put the
 * colours back on the footing this replaced -- deleting one thing
 * would recolour the rest.
 *
 * With nothing taken it is the palette's first, sky: new things
 * take the palette in its order of priority (Palette.ts), the
 * colours that sit best with the app's blue first.
 */
export function pickHue(taken: number[]): number {
    return nextPaletteHue(taken);
}

/*
 * There was a `strategyThemeTints` here that turned each hue into
 * a finished `hsl(... 96%)` background string. Every caller now
 * hands the raw HUE to the element instead, as
 * --strategy-theme-hue, and the stylesheet derives the ground,
 * the strokes and the glow from it -- one number rather than one
 * pre-mixed colour per thing that needs one.
 */

/**
 * The saturation the Roadmap's selected Objective bar is filled at
 * (see .roadmap-bar-open in conversation.css). Kept here because
 * `strategyThemeBarLightness` has to solve for a lightness AT this
 * saturation -- the two are one colour, described in two files.
 */
export const STRATEGY_BAR_SATURATION = 36;

/**
 * The contrast the selected bar's white label is held to. 4.6:1
 * rather than a bare 4.5:1, so rounding the lightness to a tenth
 * of a percent can never drop it under the line.
 */
export const STRATEGY_BAR_TEXT_CONTRAST = 4.6;

/** One HSL colour as linear 0-1 sRGB channels. */
export function hslChannels(hue: number, saturation: number, lightness: number): [number, number, number] {

    const s = saturation / 100;
    const l = lightness / 100;

    const chroma = (1 - Math.abs(2 * l - 1)) * s;
    const sector = (((hue % 360) + 360) % 360) / 60;
    const second = chroma * (1 - Math.abs((sector % 2) - 1));

    const [red, green, blue] =
        sector < 1 ? [chroma, second, 0] :
        sector < 2 ? [second, chroma, 0] :
        sector < 3 ? [0, chroma, second] :
        sector < 4 ? [0, second, chroma] :
        sector < 5 ? [second, 0, chroma] :
                     [chroma, 0, second];

    const offset = l - chroma / 2;

    return [red + offset, green + offset, blue + offset];

}

/** WCAG relative luminance (SC 1.4.3's own definition), from channels in 0-1. */
export function relativeLuminance(channels: [number, number, number]): number {

    const [red, green, blue] = channels.map(channel =>
        channel <= 0.03928 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4)
    );

    return 0.2126 * red + 0.7152 * green + 0.0722 * blue;

}

/**
 * How light the selected Objective bar can be FOR THIS HUE and
 * still carry white text at 4.6:1.
 *
 * A single lightness cannot do this. At one saturation the same
 * HSL lightness is a bright yellow and a near-black blue -- the
 * palette's hues differ by more than 3x in luminance -- so pinning
 * every Theme to one value means pinning every Theme to whatever
 * the brightest hue can bear, and the rest come out far darker
 * than they need to be. Solving per hue lets each Theme's bar sit
 * as light as its own colour allows, which is what makes the
 * selected state readable rather than merely dark.
 *
 * Returned as a CSS percentage string, ready for
 * `--strategy-bar-lightness`.
 */
export function strategyThemeBarLightness(hue: number): string {

    // White against a background of luminance L is
    // (1.05) / (L + 0.05); inverted, this is the lightest the
    // background may be.
    const ceiling = 1.05 / STRATEGY_BAR_TEXT_CONTRAST - 0.05;

    // Luminance rises monotonically with lightness at a fixed hue
    // and saturation, so a plain bisection finds the answer. 20
    // rounds takes a 60-point range under a thousandth of a point.
    let low = 0;
    let high = 60;

    for (let round = 0; round < 20; round += 1) {

        const middle = (low + high) / 2;

        if (relativeLuminance(hslChannels(hue, STRATEGY_BAR_SATURATION, middle)) > ceiling) {
            high = middle;
        } else {
            low = middle;
        }

    }

    return `${Math.floor(low * 10) / 10}%`;

}

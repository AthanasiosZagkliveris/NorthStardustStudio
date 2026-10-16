import type { AssetContract } from "../contract.ts";

/**
 * The dropdown (OptionPicker.tsx, option-picker.css; the trigger wears
 * .interview-input; rulebook "Sizes: the closed set" and "Picker options"):
 * the app's drawn dropdown, used for every choice of one value (86 uses in 16
 * files). A trigger as tall as every single-line control (44px), as wide as the
 * smallest standard width that holds its widest option (220, 300 or 420px) or
 * hugging it, with a drawn chevron; its list floats under it, exactly as wide,
 * 6px below, a card of 4px padding and 8px corners with 43px options. The
 * chosen option is bold and says aria-selected. The numbers are the rulebook's.
 */
export const dropdown: AssetContract = {
    name: "Dropdown",
    kind: "dropdown",
    summary: "A drawn dropdown: a 44px trigger in one of the standard widths (or hugging its widest option) with a chevron, and a floating list of 43px options exactly as wide as the trigger.",
    component: "src/components/interview/OptionPicker.tsx",
    stylesheet: "src/styles/option-picker.css",
    alsoStylesheets: ["src/styles/global.css", "src/styles/conversation.css"],
    parts: ["trigger (button.interview-input with the value, a hidden copy of every option, and a drawn chevron)", "list (role listbox, floating under the trigger)", "option (role option; the chosen one bold, aria-selected)"],
    states: ["rest", "hover", "focus", "open", "disabled"],
    variants: [
        { id: "step-s", context: "step s", note: "short options (Yes / No): the trigger is --control-s wide" },
        { id: "step-m", context: "step m", note: "a typical choice (\"No tax at business level\"): --control-m wide" },
        { id: "step-l", context: "step l", note: "a long choice (\"Private Company Limited by Shares\"): --control-l wide" },
        { id: "hug", context: "hug", note: "as wide as its widest option exactly, no wider (a side-label picker's allowed exception)" },
        { id: "disabled", context: "disabled", note: "a disabled trigger: faint text, the card-line edge, not-allowed cursor" }
    ],
    tokens: ["--control-s", "--control-m", "--control-l", "--control-square", "--select-padding-left", "--select-padding-right", "--select-chevron", "--select-chevron-inset", "--bg-surface", "--text-default", "--text-faint", "--line-card", "--glow-color", "--box-inset"],
    geometry: {
        height: 44,
        stepS: 220,
        stepM: 300,
        stepL: 420,
        chevronWidth: 12,
        chevronHeight: 8,
        fontSize: 18,
        listGap: 6,
        listPadding: 4,
        listRadius: 8,
        optionHeight: 43,
        optionPaddingY: 8,
        optionPaddingX: 10,
        chosenWeight: 700,
        minTargetPx: 24,
        /** A hugging trigger may differ from the measured need by this much (the need is rounded up). */
        hugTolerancePx: 2,
        tolerancePx: 0.6
    },
    accessibility: {
        contrast: [
            { ink: "the value against the trigger's ground", ground: "page", min: 4.5 },
            { ink: "the value against the trigger's ground", ground: "card", min: 4.5 },
            { ink: "an option against the list's surface", ground: "list", min: 4.5 }
        ],
        focusRing: true,
        accessibleName: "<label>: <value> (aria-label), aria-haspopup=listbox, aria-expanded"
    },
    uses: [
        "every choice of one value on the Foundation pages and in the cards",
        "frequencies, statuses, types, currencies, countries (searchable)"
    ]
};

import type { AssetContract } from "../contract.ts";
import { lookHeight } from "../componentTokens.ts";

/**
 * The in-cell x (CellRemoveButton, .cell-remove in remove-button.css; library BTN.XCL.001.003; owner, 2026-11-14 12:29 and 12:33): the x that stands
 * INSIDE a cell, at its right end -- a channel's action line, a channel expense's linked action. No frame, outline or fill: the X alone in the danger red, on a 24px target. Under
 * the pointer or the keyboard focus it grows by a fifth (--hover-lift) with one soft red haze; the focus adds the ring; reduced motion keeps the glow only.
 */
export const cellRemoveX: AssetContract = {
    name: "Cell remove x",
    kind: "remove button",
    summary: "A frameless X inside a cell, at its right end, that removes what the cell holds (an action line of a stage, a linked action of an expense). It grows 20% with a soft red glow under the pointer and the focus.",
    component: "src/components/controls/CellRemoveButton.tsx",
    stylesheet: "src/styles/remove-button.css",
    alsoStylesheets: ["src/styles/global.css", "src/styles/components.generated.css"],
    parts: ["button (the 24px target, no frame)", "two bars (::before, ::after) turned +45 and -45 degrees, drawn from the middle"],
    states: ["rest", "hover", "focus", "disabled"],
    variants: [
        { id: "action", context: "row", note: "inside an action line of a channel's journey stage, at its right end, centred on the line's first line" },
        { id: "chip", context: "row", note: "inside a channel expense's linked-action chip (32px tall, --chip-height), at its right end" }
    ],
    tokens: ["--size-cell-x", "--x-red", "--hover-lift", "--chip-height", "--text-faint", "--focus-ring-ink", "--line-primary"],
    geometry: {
        size: lookHeight("BTN.XCL.001.003"),
        barLength: 14,
        barThickness: 2,
        strokeWidth: 0,
        growth: 1.2,
        outlineWidth: 2,
        outlineOffset: 2,
        tolerancePx: 0.5
    },
    accessibility: {
        contrast: [
            { ink: "the red X against the chip's ground", ground: "card", min: 3 }
        ],
        focusRing: true,
        accessibleName: "Unlink <what> from <where> (aria-label)"
    },
    uses: [
        "the action lines of a channel's journey stages and the linked actions (#12, #14 ...) of a channel's expense, on a subchannel's card (owner, 2026-11-14 12:38)",
        "never a card's or a row's own x: that is the framed Remove x"
    ]
};

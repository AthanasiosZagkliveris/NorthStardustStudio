/*
    THE LAYOUT PROBE: measured in the page itself (docs/ai/layout-rules.md).

    Loaded into an open page of the app (see run.mjs), it adds
    window.__layoutProbe with two calls:

      inventory()   what the page's cards and fields measure now: the
                    distinct values in use, per rule (Step 1 of the
                    rulebook).
      check(spec)   the rulebook's checks on the page as drawn: a list
                    of failures, each naming the rule, the element and
                    the numbers. An empty list is a pass.

    Plain browser JavaScript (no build step), so it runs in any page
    Playwright opens -- and its pure parts (the `rules` object) are
    tested with vitest (src/test/layoutProbe.test.ts).
*/
(function (root) {

    /* ---------- Pure helpers (tested) ---------- */

    const rules = {

        /** Whether two numbers are equal within a tolerance. */
        near(one, other, tolerance) {
            // A hundredth over, for sub-pixel rounding.
            return Math.abs(one - other) <= (tolerance ?? 0.5) + 0.01;
        },

        /**
         * Rows of boxes: boxes whose tops are within `tolerance` of one
         * another belong to one row. Returns the rows, each a list.
         */
        rowsOf(boxes, tolerance) {
            const rows = [];
            for (const box of [...boxes].sort((one, other) => one.top - other.top)) {
                const row = rows.find(candidate => Math.abs(candidate[0].top - box.top) <= (tolerance ?? 6));
                if (row) {
                    row.push(box);
                } else {
                    rows.push([box]);
                }
            }
            return rows;
        },

        /** The distinct values of a list, rounded to a tenth, with how often each occurs. */
        distinct(values) {
            const counts = new Map();
            for (const value of values) {
                const key = Math.round(value * 10) / 10;
                counts.set(key, (counts.get(key) ?? 0) + 1);
            }
            return [...counts.entries()].sort((one, other) => other[1] - one[1]).map(([value, count]) => ({ value, count }));
        },

        /**
         * The failures of a list of same-column controls: every left edge
         * equal to the first. Each box: { left, label }.
         */
        misalignedLefts(boxes, tolerance) {
            if (boxes.length < 2) {
                return [];
            }
            const first = boxes[0].left;
            return boxes.filter(box => !rules.near(box.left, first, tolerance)).map(box => ({ ...box, expected: first }));
        }

    };

    root.__layoutRules = rules;

    if (typeof document === "undefined") {
        return;
    }

    /* ---------- In the page ---------- */

    const CARD = ".business-foundation-card, .legal-entity-card, .strategy-theme-box, .strategy-goal-box, .strategy-objective-box, .strategy-metric-box, .business-capability-activity, .brand-style-card, .financial-cost-card, .financial-funding-card";
    const FIELD = ".business-foundation-field, .legal-entity-field, .strategy-metric-field";
    const CONTROL = "input.interview-input, textarea.interview-input, .option-picker, .month-picker-trigger, .suggested-input, input.brand-colour-picker";
    /* Composites whose parts share one column: a price and its currency, a
       swatch and its HEX, a list row's control beside its ×, a name typed
       with its suggestions. The group is the column. */
    const GROUPS = ".business-capability-price, .brand-colour-row, .legal-entity-number-row, .business-channel-resource-head, .strategy-metric-unit-currency, .suggested-input, .business-capability-quantity-price, .business-capability-performer, .business-channel-pick, .brand-image-text, .financial-milestone, .financial-schedule-row, .financial-cost-row, .legal-entity-founders, .strategy-period-box .month-picker, .strategy-objective-period .month-picker";
    // Every card and section box (docs/ai/layout-rules.md, "Cards and section boxes").
    const CARDS = ".legal-entity-section, .legal-entity-card, .business-foundation-card, .business-capability-activity, .business-engagement-reference, .financial-need-card, .financial-offering-cost-card, .financial-cost-row, .strategy-theme-box, .strategy-theme-panel, .strategy-goal-box, .strategy-objective-box, .strategy-metric-box, .roadmap-theme-box";
    const GRIDS = ".founders-profile-row, .business-capability-cost-grid, .business-founder-grid, .card-field-pairs-grid, .legal-entity-grid, .strategy-metric-fields";

    const rect = element => element.getBoundingClientRect();
    const visible = element => { const box = rect(element); return box.width > 0 && box.height > 0; };
    const describe = element => {
        const label = element.getAttribute("aria-label") || element.querySelector?.(".field-label")?.textContent?.trim() || element.className || element.tagName;
        return String(label).replace(/\s+/g, " ").slice(0, 80);
    };
    const place = element => {
        const card = element.closest("[data-anchor]");
        return (card ? card.getAttribute("data-anchor").split(" ")[0] + " › " : "") + describe(element);
    };

    /** The text of a card head's number, as drawn. */
    function numberBox(head) {
        const number = head.querySelector(":scope > .strategy-box-number, :scope > .legal-entity-card-number");
        if (!number || !visible(number)) {
            return null;
        }
        // Its text as drawn: the digits (and a nested kind, "1. Goal").
        const range = document.createRange();
        range.selectNodeContents(number);
        const text = range.getBoundingClientRect();
        const digits = number.querySelector(".list-number");
        const first = digits ? (() => { const inner = document.createRange(); inner.selectNodeContents(digits); return inner.getBoundingClientRect(); })() : text;
        return { column: rect(number), text: { left: first.left, right: text.right } };
    }

    /** A card head's name: its box, or its text. */
    function nameBox(head) {
        const name = head.querySelector(":scope > .card-name-input, :scope > .strategy-name-input, :scope > .strategy-name-static, :scope > .strategy-theme-name, :scope > textarea");
        return name && visible(name) ? rect(name) : null;
    }

    /** Where a card's body starts: the left edge of the first visible block after its head. */
    function bodyLeft(head) {
        for (let next = head.nextElementSibling; next; next = next.nextElementSibling) {
            if (visible(next)) {
                return rect(next).left;
            }
        }
        return null;
    }

    function inventory() {
        const heads = [...document.querySelectorAll(".fold-card-head")].filter(visible);
        const numberToName = [], numberToBody = [], nameFromNumber = [], padding = [], removes = [];
        for (const head of heads) {
            const number = numberBox(head);
            const name = nameBox(head);
            if (number && name) {
                numberToName.push(name.left - number.text.right);
                nameFromNumber.push(name.left - number.text.left);
            }
            const body = bodyLeft(head);
            if (number && body !== null) {
                numberToBody.push(number.text.left - body);
            }
            const card = head.parentElement;
            padding.push(rect(head).left - rect(card).left);
            const remove = head.querySelector(".strategy-box-remove");
            if (remove && visible(remove)) {
                removes.push(rect(remove).width);
            }
        }
        const fields = [...document.querySelectorAll(FIELD)].filter(visible);
        const labelGap = [], labelHeight = [], widths = [];
        for (const field of fields) {
            const label = field.querySelector(":scope > .field-label, :scope > .business-foundation-label-info, :scope > .legal-entity-label-info, :scope > span > .field-label");
            const control = field.querySelector(CONTROL);
            if (label && control && visible(label) && visible(control) && !field.classList.contains("business-field-inline")) {
                labelGap.push(rect(control).top - rect(label).bottom);
                labelHeight.push(rect(label).height);
            }
            if (control && visible(control)) {
                widths.push(rect(control).width);
            }
        }
        const rowGaps = [];
        for (const grid of document.querySelectorAll(GRIDS)) {
            const rows = rules.rowsOf([...grid.children].filter(visible).map(rect));
            for (let index = 1; index < rows.length; index++) {
                rowGaps.push(rows[index][0].top - Math.max(...rows[index - 1].map(box => box.bottom)));
            }
        }
        const cardGaps = [];
        for (const list of new Set([...document.querySelectorAll(CARD)].map(card => card.parentElement))) {
            const cards = [...list.children].filter(child => child.matches(CARD) && visible(child)).map(rect).sort((one, other) => one.top - other.top);
            for (let index = 1; index < cards.length; index++) {
                if (rules.near(cards[index].left, cards[index - 1].left, 1)) {
                    cardGaps.push(cards[index].top - cards[index - 1].bottom);
                }
            }
        }
        return {
            numberToName: rules.distinct(numberToName),
            nameFromNumber: rules.distinct(nameFromNumber),
            numberToBody: rules.distinct(numberToBody),
            headPadding: rules.distinct(padding),
            removeSize: rules.distinct(removes),
            labelToControl: rules.distinct(labelGap),
            labelHeight: rules.distinct(labelHeight),
            rowGap: rules.distinct(rowGaps),
            cardGap: rules.distinct(cardGaps),
            controlWidth: rules.distinct(widths).slice(0, 12)
        };
    }

    /**
     * The rulebook's checks (docs/ai/layout-rules.md). `spec` holds the
     * values: { nameFromNumber, tolerance }.
     */
    function check(spec) {
        const tolerance = spec.tolerance ?? 0.5;
        const failures = [];
        const fail = (rule, element, detail) => failures.push({ rule, where: place(element), detail });

        // 1-2. A card head: the number where the body starts; the name one fixed step after it.
        for (const head of [...document.querySelectorAll(".fold-card-head")].filter(visible)) {
            const number = numberBox(head);
            if (!number) {
                continue;
            }
            const body = bodyLeft(head);
            // THE NAMED EXCEPTION: a colour or typeface card's body stands under its
            // name box, from its left edge to its right edge.
            if (head.parentElement && head.parentElement.matches(".brand-style-card")) {
                const name = nameBox(head);
                const next = head.nextElementSibling;
                if (name && next && visible(next)) {
                    const box = rect(next);
                    if (!rules.near(box.left, name.left, tolerance) || !rules.near(box.right, name.right, tolerance)) {
                        fail("body under the name box", head, { body: [box.left, box.right], name: [name.left, name.right] });
                    }
                }
                continue;
            }
            if (body !== null && !rules.near(number.text.left, body, tolerance)) {
                fail("number-left = body-left", head, { number: number.text.left, body });
            }
            const name = nameBox(head);
            if (name && !rules.near(name.left - number.text.right, spec.numberToName, tolerance)) {
                fail("number → name gap", head, { gap: name.left - number.text.right, expected: spec.numberToName });
            }
        }

        // 3-4. A field grid: a control starts at its cell's left edge; the
        // controls of one row share their top edge.
        for (const grid of [...document.querySelectorAll(GRIDS)].filter(visible)) {
            const cells = [...grid.children].filter(visible);
            const controls = [];
            for (const cell of cells) {
                const control = cell.matches(CONTROL) ? cell : cell.querySelector(CONTROL);
                // A cell that is a row of its own (the VAT tick and its number, a list of numbers) is checked as one.
                if (!control || !visible(control) || cell.classList.contains("business-field-inline") || cell.matches(".legal-entity-tax-row, .legal-entity-registrations, .legal-entity-field-wide:has(.legal-entity-number-row), .legal-entity-side-row, .founders-profile-row")) {
                    continue;
                }
                if (!rules.near(rect(control).left, rect(cell).left, tolerance)) {
                    fail("control at its column's left edge", control, { control: rect(control).left, column: rect(cell).left });
                }
                controls.push({ cell: rect(cell), control: rect(control), element: control });
            }
            for (const row of rules.rowsOf(controls.map(entry => ({ ...entry.cell, entry })), 1)) {
                const tops = row.map(box => box.entry.control.top);
                if (Math.max(...tops) - Math.min(...tops) > tolerance) {
                    fail("same-row controls share a top edge", row[0].entry.element, { tops });
                }
            }
        }

        // 5. Lists with a ×: the × on every row in one column.
        for (const list of new Set([...document.querySelectorAll(".legal-entity-number-row, .numbered-list-row")].map(row => row.parentElement))) {
            const xs = [...list.querySelectorAll(":scope > .legal-entity-number-row > .strategy-box-remove, :scope > .numbered-list-row .numbered-list-remove")]
                .filter(visible).map(button => ({ left: rect(button).left, element: button }));
            for (const box of rules.misalignedLefts(xs, tolerance)) {
                fail("list × in one column", box.element, { left: box.left, expected: box.expected });
            }
        }

        // 6. An add button at a list's end spans the list.
        for (const button of [...document.querySelectorAll(".legal-entity-list-add")].filter(visible)) {
            const list = button.parentElement;
            const row = list.querySelector(".legal-entity-number-row");
            if (row && !(rules.near(rect(button).left, rect(row).left, tolerance) && rules.near(rect(button).right, rect(row).right, tolerance))) {
                fail("add button spans its list", button, { button: [rect(button).left, rect(button).right], list: [rect(row).left, rect(row).right] });
            }
        }

        // 7. Side by side: equal bottoms.
        for (const row of [...document.querySelectorAll(".brand-slot-row")].filter(visible)) {
            const bottoms = [...row.children].filter(visible).map(child => rect(child).bottom);
            if (bottoms.length > 1 && Math.max(...bottoms) - Math.min(...bottoms) > tolerance) {
                fail("side-by-side bottoms equal", row, { bottoms });
            }
        }

        // 8. Text boxes: never clipped; a written answer at least two lines.
        for (const box of [...document.querySelectorAll("textarea")].filter(visible)) {
            if (box.scrollHeight > box.clientHeight + 1) {
                fail("text box not clipped", box, { scroll: box.scrollHeight, client: box.clientHeight });
            }
            const line = parseFloat(getComputedStyle(box).lineHeight) || 24;
            const oneLine = box.matches(".card-name-input, .numbered-list-input, .suggested-input-field, .notepad-note-text, .business-channel-resource-name");
            if (!oneLine && box.clientHeight < 2 * line - 0.5) {
                fail("text box at least two lines", box, { height: box.clientHeight, line });
            }
        }

        // 9. A closed picker is one line.
        for (const value of [...document.querySelectorAll(".option-picker-value")].filter(visible)) {
            const line = parseFloat(getComputedStyle(value).lineHeight) || 27;
            if (rect(value).height > line * 1.5) {
                fail("picker one line", value.closest(".option-picker") ?? value, { height: rect(value).height });
            }
        }

        // 10. Nothing overflows its frame, nor the page.
        if (document.documentElement.scrollWidth > document.documentElement.clientWidth + 1) {
            fail("no page overflow", document.documentElement, { scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth });
        }
        for (const card of [...document.querySelectorAll(CARD + ", .legal-entity-section")].filter(visible)) {
            const frame = rect(card);
            for (const child of card.querySelectorAll("input, textarea, button, .option-picker, .notepad-chip, img, table")) {
                if (!visible(child) || child.closest(".info-note-panel, .option-picker-list, .notepad-suggestions, .numbered-list-suggestions, .option-picker-sizer")) {
                    continue;
                }
                // Inside a box that scrolls sideways (a wide table), it is not overflowing.
                let scrolled = false;
                for (let up = child.parentElement; up && up !== card; up = up.parentElement) {
                    if (["auto", "scroll", "hidden"].includes(getComputedStyle(up).overflowX)) {
                        scrolled = true;
                        break;
                    }
                }
                const box = rect(child);
                if (!scrolled && (box.right > frame.right + tolerance || box.left < frame.left - tolerance)) {
                    fail("nothing overflows its card", child, { child: [box.left, box.right], card: [frame.left, frame.right] });
                    break;
                }
            }
        }

        // 11. Text beside a control: its first line centred on the control's
        // centre line (side labels, a tick's words beside a field, "px", "h").
        const firstLineMid = element => {
            const box = rect(element);
            const line = parseFloat(getComputedStyle(element).lineHeight) || box.height;
            return box.top + Math.min(line, box.height) / 2;
        };
        const mid = element => { const box = rect(element); return box.top + box.height / 2; };
        const pairs = [];
        for (const field of [...document.querySelectorAll(".business-field-inline")].filter(visible)) {
            const label = field.querySelector(".field-label");
            const control = field.querySelector(CONTROL);
            if (label && control && visible(label) && visible(control) && rect(control).left > rect(label).right - 1) {
                pairs.push([label, control.matches(".option-picker") ? control.querySelector(".option-picker-trigger") ?? control : control]);
            }
        }
        for (const row of [...document.querySelectorAll(".legal-entity-tax-row")].filter(visible)) {
            const words = row.querySelector(".legal-entity-switch-label");
            const control = row.querySelector("input.interview-input");
            if (words && control && visible(control)) {
                pairs.push([words, control]);
            }
        }
        for (const unit of [...document.querySelectorAll(".brand-hierarchy-unit, .delivery-person-unit")].filter(visible)) {
            const control = unit.parentElement.querySelector("input.interview-input");
            if (control && visible(control)) {
                pairs.push([unit, control]);
            }
        }
        for (const [text, control] of pairs) {
            if (!rules.near(firstLineMid(text), mid(control), tolerance)) {
                fail("text beside a control on its centre line", control, { text: firstLineMid(text), control: mid(control) });
            }
        }
        // A tick box on its words' first line.
        for (const box of [...document.querySelectorAll("input[type=checkbox]")].filter(visible)) {
            // A Text Hierarchy level: a fixed-height row whose tick, name
            // (its whole block) and px box share the row's centre line.
            const level = box.closest(".brand-hierarchy-row");
            if (level) {
                // The tick on its px square's centre line; the name never below the
                // square's foot, never above its row (into the row above).
                const size = level.querySelector(".brand-size-input");
                const words = box.nextElementSibling;
                if (size && visible(size)) {
                    if (!rules.near(mid(box), mid(size), 1)) {
                        fail("a hierarchy tick on its square's centre line", box, { box: mid(box), square: mid(size) });
                    }
                    if (words && rect(words).bottom > rect(size).bottom + 0.5) {
                        fail("a hierarchy name not below its square", words, { name: rect(words).bottom, square: rect(size).bottom });
                    }
                }
                if (words && rect(words).top < rect(level).top - 0.5) {
                    fail("a hierarchy name within its row", words, { name: rect(words).top, row: rect(level).top });
                }
                continue;
            }
            const words = box.nextElementSibling;
            if (words && visible(words) && !rules.near(mid(box), firstLineMid(words), tolerance)) {
                fail("tick box on its words' first line", box, { box: mid(box), words: firstLineMid(words) });
            }
        }

        // 12. Every control one of the size steps: a set width (spec.widths),
        // or its column's / its container's whole width; single-line controls
        // one height.
        for (const control of [...document.querySelectorAll("input.interview-input:not([type=checkbox]), .option-picker > .option-picker-trigger, .month-picker-trigger")].filter(visible)) {
            if (control.closest("table, .numbered-list, .notepad-panel, .business-channel-cost-add")) {
                continue;
            }
            const width = rect(control).width;
            const holder = control.closest(".option-picker") ?? control;
            // Its column: the nearest box around it that has a width of its own.
            let cell = holder.parentElement;
            while (cell && rect(cell).width === 0) {
                cell = cell.parentElement;
            }
            const inner = cell ? cell.clientWidth - parseFloat(getComputedStyle(cell).paddingLeft) - parseFloat(getComputedStyle(cell).paddingRight) : 0;
            // Or one track of the grid it stands in (a card's two columns).
            const tracks = cell && getComputedStyle(cell).display.includes("grid")
                ? getComputedStyle(cell).gridTemplateColumns.split(" ").map(parseFloat).filter(Number.isFinite)
                : [];
            const allowed = (spec.widths ?? []).some(step => rules.near(width, step, 1)) || rules.near(width, inner, 1) || (cell && rules.near(width, rect(cell).width, 1)) ||
                tracks.some(track => rules.near(width, track, 1)) ||
                (spec.square && rules.near(width, spec.square, 1) && rules.near(rect(control).height, spec.square, 1));
            // Groups and list rows are measured as the group (the column), not each part.
            if (!allowed && !control.closest(GROUPS)) {
                fail("control width is a size step", control, { width, column: inner });
            }
            if (spec.controlHeight && !control.matches("textarea") && !control.closest(".brand-image-text") && !rules.near(rect(control).height, spec.controlHeight, 1)) {
                fail("single-line control height", control, { height: rect(control).height, expected: spec.controlHeight });
            }
        }

        // 14. An "i" right after its words: on their (last) line's centre, one gap after the last word.
        for (const button of [...document.querySelectorAll(".info-note-button")].filter(visible)) {
            const note = button.closest(".info-note");
            const holder = note.closest(".info-note-glue") ?? note.previousElementSibling;
            if (!holder) {
                continue;
            }
            const walker = document.createTreeWalker(holder, NodeFilter.SHOW_TEXT);
            let last = null;
            for (let node = walker.nextNode(); node; node = walker.nextNode()) {
                // The words BEFORE the "i" (a full stop after it is not what it follows).
                if (node.textContent.trim() && !node.parentElement.closest(".info-note") && (node.compareDocumentPosition(note) & Node.DOCUMENT_POSITION_FOLLOWING)) {
                    last = node;
                }
            }
            if (!last) {
                continue;
            }
            const range = document.createRange();
            range.selectNodeContents(last);
            const lines = range.getClientRects();
            // After a badge (a figure in a pill), the badge is what it follows.
            const holderStyle = getComputedStyle(holder);
            const boxed = parseFloat(holderStyle.borderLeftWidth) > 0 || holderStyle.backgroundColor !== "rgba(0, 0, 0, 0)";
            const words = boxed ? rect(holder) : lines[lines.length - 1];
            if (!words) {
                continue;
            }
            const box = rect(button);
            if (!rules.near(box.top + box.height / 2, words.top + words.height / 2, 1)) {
                fail("an i on its words' centre line", button, { i: box.top + box.height / 2, words: words.top + words.height / 2 });
            }
            if (Math.abs(box.top - words.top) < words.height && !rules.near(box.left - words.right, 8, 0.5)) {
                fail("an i one gap after its words", button, { gap: box.left - words.right });
            }
        }

        // 15. ONE VERTICAL RHYTHM in every card and section box: a label 6px
        // (spec.labelGap) above its control, and a control, list row or add
        // button 12px (spec.fieldGap) above what follows it. Measured from a
        // label's line box (its words' middle, half a line either way), between
        // things that stand one above the other in one column; gaps of 30px or
        // more are separations of their own (a subhead, a group) and are not
        // this rule's.
        if (spec.labelGap && spec.fieldGap) {
            const lineBox = label => {
                const range = document.createRange();
                range.selectNodeContents(label);
                const glyphs = [...range.getClientRects()].filter(box => box.width > 0);
                const line = parseFloat(getComputedStyle(label).lineHeight);
                if (!glyphs.length || !Number.isFinite(line)) {
                    return null;
                }
                const first = glyphs[0], last = glyphs[glyphs.length - 1];
                return { top: first.top + first.height / 2 - line / 2, bottom: last.top + last.height / 2 + line / 2, left: Math.min(...glyphs.map(g => g.left)), right: Math.max(...glyphs.map(g => g.right)) };
            };
            for (const card of [...document.querySelectorAll(CARDS)].filter(visible)) {
                const items = [];
                for (const label of card.querySelectorAll(".field-label, .legal-entity-column-head, label:has(> input[type=checkbox])")) {
                    if (!visible(label) || label.closest(".info-note-panel, table, .fold-card-head, .legal-entity-number-row")) {
                        continue;
                    }
                    // An option of a tick list (several ticks under one label) is a row
                    // of that one field, not a field of its own.
                    if (label.matches("label") && label.parentElement && label.parentElement.querySelectorAll(":scope > label:has(> input[type=checkbox]), :scope > * > label:has(> input[type=checkbox])").length > 1) {
                        continue;
                    }
                    const box = lineBox(label);
                    if (box) {
                        items.push({ kind: "label", element: label, ...box });
                    }
                }
                for (const control of card.querySelectorAll("input.interview-input:not([type=checkbox]), textarea.interview-input, .option-picker-trigger, .month-picker-trigger, .strategy-add-button")) {
                    // A Text Hierarchy level is measured as its fixed row (rows a field gap apart).
                    if (!visible(control) || control.closest(".info-note-panel, table, .fold-card-head, .numbered-list, .notepad-panel, .brand-hierarchy-card")) {
                        continue;
                    }
                    const box = rect(control);
                    items.push({ kind: "control", element: control, top: box.top, bottom: box.bottom, left: box.left, right: box.right });
                }
                // A label BESIDE a control (a side label) is part of the control's row.
                const beside = item => item.kind === "label" && items.some(other => other.kind === "control" &&
                    other.top <= item.top + 1 && other.bottom >= item.bottom - 1 && (other.left >= item.right - 1 || other.right <= item.left + 1));
                const stack = items.filter(item => !beside(item));
                for (const item of stack) {
                    // What stands directly above it, in its column, in the same card.
                    const home = item.element.closest(CARDS);
                    let above = null;
                    for (const other of stack) {
                        if (other === item || other.bottom > item.top + 0.5 || other.right <= item.left + 1 || other.left >= item.right - 1 || other.element.closest(CARDS) !== home) {
                            continue;
                        }
                        if (!above || other.bottom > above.bottom) {
                            above = other;
                        }
                    }
                    if (!above) {
                        continue;
                    }
                    const gap = item.top - above.bottom;
                    if (gap >= 30) {
                        continue;
                    }
                    const expected = above.kind === "label" && item.kind === "control" ? spec.labelGap : spec.fieldGap;
                    // A GROUP GAP: two groups divided by a rule, a field gap either side of it.
                    let divided = false;
                    for (let node = item.element.parentElement; node && node !== card; node = node.parentElement) {
                        const top = rect(node).top;
                        if (parseFloat(getComputedStyle(node).borderTopWidth) > 0 && top >= above.bottom - 0.5 && top <= item.top + 0.5) {
                            divided = true;
                        }
                    }
                    if (divided && rules.near(gap, 2 * spec.fieldGap, 1)) {
                        continue;
                    }
                    // A cell of a grid row stands under the row's TALLEST cell, which may be
                    // in the next column: measured from the lowest thing above it in the card.
                    const lowest = Math.max(...stack.filter(other => other !== item && other.bottom <= item.top + 0.5 && other.element.closest(CARDS) === home).map(other => other.bottom));
                    if (lowest > above.bottom && rules.near(item.top - lowest, spec.fieldGap, 1)) {
                        continue;
                    }
                    // The first thing in a field of a grid: its field is a row gap under the
                    // grid row above (whose tallest cell sets it).
                    const field = item.element.closest(FIELD);
                    if (field && field.parentElement && getComputedStyle(field.parentElement).display.includes("grid") && item.top - rect(field).top < spec.fieldGap) {
                        const fieldTop = rect(field).top;
                        const bottoms = [...field.parentElement.children].map(child => rect(child).bottom).filter(bottom => bottom <= fieldTop + 0.5);
                        if (bottoms.length && rules.near(fieldTop - Math.max(...bottoms), spec.fieldGap, 1)) {
                            continue;
                        }
                    }
                    if (!rules.near(gap, expected, 1)) {
                        fail(above.kind === "label" && item.kind === "control" ? "label gap" : "row gap", item.element, { gap, expected, above: describe(above.element) });
                    }
                }
            }
        }

        // 13. Every card and section box: one inner side margin (--card-padding).
        if (spec.cardPadding) {
            for (const box of [...document.querySelectorAll(CARDS)].filter(visible)) {
                const style = getComputedStyle(box);
                // The Text Hierarchy box: a declared 12px more each side.
                const margin = box.matches(".brand-hierarchy-card") ? spec.cardPadding + 12 : spec.cardPadding;
                for (const side of ["paddingLeft", "paddingRight"]) {
                    if (!rules.near(parseFloat(style[side]), margin, 0.01)) {
                        fail("card side margin", box, { side, padding: parseFloat(style[side]), expected: margin });
                    }
                }
            }
        }

        return failures;
    }

    root.__layoutProbe = { inventory, check, rules };

})(typeof window !== "undefined" ? window : globalThis);

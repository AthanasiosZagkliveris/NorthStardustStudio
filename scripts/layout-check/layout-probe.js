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

        /** Where the tail tile goes (mirror of tailPlacement in SectionTiles.tsx): { row, column, columns }. */
        tailPlacement(count, columns) {
            const rows = Math.max(1, Math.ceil(count / columns));
            if (count % columns !== 0) {
                return { row: rows, column: (count % columns) + 1, columns };
            }
            return columns === 2 ? { row: rows, column: 3, columns: 3 } : { row: rows + 1, column: 1, columns };
        },

        /** How many across in the ONE SHAPE of every set of tiles / boxes (mirror of gridColumns in SectionTiles.tsx). */
        gridColumns(count) {
            if (count <= 3) {
                return Math.max(1, count);
            }
            return count === 4 ? 2 : Math.ceil(count / 2);
        },

        /** "rgb(r, g, b)", "rgba(...)" or "color(srgb r g b / a)" as [r, g, b] in 0-255 (null where it is not one). */
        parseColor(text) {
            const srgb = /color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)/.exec(text);
            if (srgb) {
                return [srgb[1], srgb[2], srgb[3]].map(value => parseFloat(value) * 255);
            }
            const rgb = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(text);
            return rgb ? [rgb[1], rgb[2], rgb[3]].map(value => parseFloat(value)) : null;
        },

        /**
         * The ground an element really stands on, as [r, g, b]: its own background and its ancestors' laid one over another (over white), up to the
         * first opaque one. A button with no background of its own (an "i") has the ground of its surface.
         */
        effectiveGround(element) {
            const channels = text => {
                const srgb = /color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?/.exec(text);
                if (srgb) return [srgb[1], srgb[2], srgb[3]].map(value => parseFloat(value) * 255).concat(srgb[4] === undefined ? 1 : parseFloat(srgb[4]));
                const rgb = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+%?))?/.exec(text);
                if (!rgb) return null;
                const alpha = rgb[4] === undefined ? 1 : rgb[4].endsWith("%") ? parseFloat(rgb[4]) / 100 : parseFloat(rgb[4]);
                return [rgb[1], rgb[2], rgb[3]].map(value => parseFloat(value)).concat(alpha);
            };
            const layers = [];
            for (let node = element; node; node = node.parentElement) {
                const colour = channels(getComputedStyle(node).backgroundColor);
                if (colour && colour[3] > 0) {
                    layers.push(colour);
                    if (colour[3] >= 0.99) break;
                }
            }
            let ground = [255, 255, 255];
            for (const colour of layers.reverse()) {
                ground = [0, 1, 2].map(index => colour[index] * colour[3] + ground[index] * (1 - colour[3]));
            }
            return ground;
        },

        /** WCAG contrast ratio of two [r, g, b] colours. */
        contrast(one, other) {
            const luminance = ([r, g, b]) => {
                const channel = value => {
                    const unit = value / 255;
                    return unit <= 0.03928 ? unit / 12.92 : Math.pow((unit + 0.055) / 1.055, 2.4);
                };
                return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
            };
            const a = luminance(one);
            const b = luminance(other);
            return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
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
    const CARDS = ".legal-entity-section, .legal-entity-card, .business-foundation-card, .business-capability-activity, .financial-need-card, .financial-offering-cost-card, .financial-cost-row, .strategy-theme-box, .strategy-theme-panel, .strategy-goal-box, .strategy-objective-box, .strategy-metric-box, .roadmap-theme-box";
    // The add buttons that span their list of cards (docs/ai/layout-rules.md,
    // "Card-list add buttons"): an explicit list, not every add.
    const CARD_LIST_ADDS = ["+ Add legal requirement", "+ Add expense", "+ Add Profile", "+ Add Competitor", "+ Add Offering"];
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
            if (label && control && visible(label) && visible(control) && !field.classList.contains("business-field-inline") && !field.classList.contains("business-field-side")) {
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
     * THE "+" BOX (a tile's, 36px; the Activity card's Add Performer, 32px): a swap of two colours -- at rest the ground of what it stands on, a
     * stroke and its "+" in the darker tone (3:1 or more between them); the "+" is two bars drawn from the middle of the box, so its centre is the
     * box's centre to the pixel (measured from the bars' computed boxes).
     */
    function plusBoxChecks(plus, name, fail, rules) {
        const style = getComputedStyle(plus);
        const box = plus.getBoundingClientRect();
        if (plus.textContent.trim() !== "") {
            fail(name + " draws its + with bars, no glyph of text", plus, { text: plus.textContent });
        }
        const ground = rules.parseColor(style.backgroundColor);
        const tone = rules.parseColor(style.color);
        const border = rules.parseColor(style.borderTopColor);
        // (The box has no ground of its own at rest: it stands on the ground of its surface, so that is the ground measured.)
        const surface = rules.effectiveGround(plus);
        if (!ground || !tone) {
            fail(name + " is filled with the ground at rest", plus, { background: style.backgroundColor });
        } else if (rules.contrast(tone, surface) < 3) {
            fail(name + " holds 3:1 between its + and its ground", plus, { contrast: rules.contrast(tone, surface) });
        }
        if (border && tone && (Math.abs(border[0] - tone[0]) > 2 || Math.abs(border[1] - tone[1]) > 2 || Math.abs(border[2] - tone[2]) > 2)) {
            fail(name + " has its stroke in the colour of its +", plus, { border: style.borderTopColor, color: style.color });
        }
        if (parseFloat(style.borderTopWidth) < 1) {
            fail(name + " has a stroke at rest", plus, { width: style.borderTopWidth });
        }
        const inner = { w: box.width - parseFloat(style.borderLeftWidth) - parseFloat(style.borderRightWidth), h: box.height - parseFloat(style.borderTopWidth) - parseFloat(style.borderBottomWidth) };
        for (const which of ["::before", "::after"]) {
            const bar = getComputedStyle(plus, which);
            const width = parseFloat(bar.width);
            const height = parseFloat(bar.height);
            const matrix = new DOMMatrixReadOnly(bar.transform === "none" ? undefined : bar.transform);
            const centreX = parseFloat(bar.left) + matrix.e + width / 2;
            const centreY = parseFloat(bar.top) + matrix.f + height / 2;
            if (Math.abs(centreX - inner.w / 2) > 0.5 || Math.abs(centreY - inner.h / 2) > 0.5) {
                fail(name + "'s + is centred in the box (optical centre within 0.5px)", plus, { bar: which, centre: [centreX, centreY], box: [inner.w / 2, inner.h / 2] });
            }
        }
    }

    /**
     * The rulebook's checks (docs/ai/layout-rules.md). `spec` holds the
     * values: { nameFromNumber, tolerance }.
     */
    /**
     * THE PAGE TILES' HOVER SCALE IS NOT A LAYOUT (it is the tiles' reaction under the pointer, left as it is): while the probe measures, the slots do not grow, so
     * a tile the pointer happens to rest on (after a dialog closed over it) is read at its size, not at 150% of it.
     */
    function holdHover() {
        if (!document.getElementById("layout-probe-hold-hover")) {
            const style = document.createElement("style");
            style.id = "layout-probe-hold-hover";
            style.textContent = ".section-tile-slot, .section-tile-slot:hover, .card-tile-slot:hover { transform: none !important; transition: none !important; }";
            document.head.appendChild(style);
        }
    }

    function check(spec) {
        holdHover();
        const tolerance = spec.tolerance ?? 0.5;
        const failures = [];
        // A card whose body scrolls on its own (page 3) is measured at the top of its body, as a person first sees it.
        document.querySelectorAll(".card-scroll").forEach(body => { body.scrollTop = 0; });
        const fail = (rule, element, detail) => failures.push({ rule, where: place(element), detail });

        // 1-2. A card head: the number where the body starts; the name one fixed step after it.
        //      (A Metric box's head too: a grip, no fold arrow.)
        for (const head of [...document.querySelectorAll(".fold-card-head, .strategy-metric-box:not(.strategy-initiatives-box) > .strategy-box-head")].filter(visible)) {
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
                if (!control || !visible(control) || cell.classList.contains("business-field-inline") || cell.classList.contains("business-field-side") || cell.classList.contains("legal-entity-field-side") || cell.matches(".business-capability-cost-after:has(> .business-field-side), .legal-entity-tax-row, .legal-entity-registrations, .legal-entity-field-wide:has(.legal-entity-number-row), .legal-entity-side-row, .founders-profile-row")) {
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

        // 5b. Action lines (Customer Channel): at least two text lines high, symbols 24 x 24 and clear of the x.
        for (const row of [...document.querySelectorAll(".numbered-list-row.is-action-line:not(.is-collapsed)")].filter(visible)) {
            const field = row.querySelector("textarea");
            if (field && rect(field).height < 69.5) {
                fail("action line two lines high", field, { height: rect(field).height });
            }
            const x = row.querySelector(".numbered-list-remove");
            for (const symbol of row.querySelectorAll(".action-symbol")) {
                const a = rect(symbol);
                const b = x ? rect(x) : null;
                if (a.width < 23.5 || a.height < 23.5) {
                    fail("action symbol hit area", symbol, { width: a.width, height: a.height });
                }
                if (b && a.left < b.right - 0.5 && a.right > b.left + 0.5 && a.top < b.bottom - 0.5 && a.bottom > b.top + 0.5) {
                    fail("action symbol clear of the ×", symbol, { symbol: [a.left, a.top], x: [b.left, b.top] });
                }
            }
        }

        // 5c. The Customer Channel table's Journey Stage picker shows its whole word (it is as
        //     wide as its longest option), and, while the table has four columns, the Journey
        //     Stage column is exactly the picker, the gap, the × and the 12px padding at both sides
        //     -- or, where wider, the "+ Add Journey Stage" button on ONE line and the padding.
        for (const trigger of [...document.querySelectorAll(".business-channel-table:not(.business-relationship-table) .business-channel-pick-stage .option-picker-trigger")].filter(visible)) {
            const value = trigger.querySelector(".option-picker-value");
            if (value && value.scrollWidth > value.clientWidth + 1) {
                fail("journey stage picker shows its whole word", trigger, { scroll: value.scrollWidth, width: value.clientWidth });
            }
            const pick = trigger.closest(".business-channel-pick");
            const cell = trigger.closest("td");
            const steps = pick && pick.querySelector(".business-channel-steps");
            if (cell && steps && getComputedStyle(cell).display === "table-cell") {
                const picker = trigger.closest(".option-picker");
                const padding = 2 * parseFloat(getComputedStyle(cell).paddingLeft);
                let wanted = rect(picker).width + parseFloat(getComputedStyle(steps).marginLeft) + rect(steps).width + padding;
                // The add button as wide as it is on one line (measured as it is drawn, then put back).
                const add = [...cell.closest("table").querySelectorAll(".business-channel-pick > .business-step-add-row > .strategy-add-button")].find(button => /Journey Stage/.test(button.textContent));
                if (add) {
                    const style = add.getAttribute("style");
                    add.style.flex = "none";
                    add.style.whiteSpace = "nowrap";
                    add.parentElement.style.width = "max-content";
                    const natural = rect(add).width;
                    add.parentElement.style.width = "";
                    if (style === null) { add.removeAttribute("style"); } else { add.setAttribute("style", style); }
                    wanted = Math.max(wanted, Math.ceil(natural + 2) + padding);
                    if (rect(add).height > 44.5) {
                        fail("journey stage add button on one line", add, { height: rect(add).height });
                    }
                }
                if (!rules.near(rect(cell).width, wanted, 3)) {
                    fail("journey stage column fits its picker", cell, { width: rect(cell).width, expected: wanted });
                }
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
        for (const field of [...document.querySelectorAll(".business-field-inline, .business-field-side")].filter(visible)) {
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
        for (const unit of [...document.querySelectorAll(".brand-hierarchy-unit")].filter(visible)) {
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
            // THE HUG EXCEPTION: a side-label picker marked to hug (data-size
            // "hug") is as wide as its widest option and its padding and border.
            const hugs = holder.matches(".option-picker[data-size=\"hug\"]") && (() => {
                const style = getComputedStyle(control);
                const chrome = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
                const widest = Math.max(0, ...[...control.querySelectorAll(".option-picker-sizer, .option-picker-value")].map(span => { const range = document.createRange(); range.selectNodeContents(span); return range.getBoundingClientRect().width; }));
                return rules.near(width, Math.ceil(widest + chrome), 1);
            })();
            // THE WORKSPACE FORM: its pickers and boxes fill the control column (the form's second track).
            const form = control.closest(".workspace-form");
            const formFills = form !== null && (() => {
                const tracks = getComputedStyle(form).gridTemplateColumns.split(" ").map(parseFloat).filter(Number.isFinite);
                return tracks.length > 1 && rules.near(width, tracks[1], 1);
            })();
            // A FOUNDER'S FOUR CELLS: --founder-cell wide (checked by the founder-card rule), whatever their column.
            const founderCell = control.closest(".business-founder-grid") !== null && rules.near(width, parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--founder-cell")) || 108, 1);
            // A FILLING picker of an opened card (Status, Responsible, Provider) runs to the right edge of the name cell: its width is what is left of the
            // content column (checked by "a filling dropdown ... end at the name cell's right edge").
            const fillsCard = holder.matches(".option-picker[data-size=\"fit\"]") && control.closest(".card-box-open > .business-capability-slot") !== null;
            const allowed = hugs || formFills || founderCell || fillsCard || (spec.widths ?? []).some(step => rules.near(width, step, 1)) || rules.near(width, inner, 1) || (cell && rules.near(width, rect(cell).width, 1)) ||
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
            // Words cut by an ellipsis (a long header's sub-view name): the range is the whole text, the ink is what shows.
            const range = document.createRange();
            range.selectNodeContents(last);
            const cut = last.parentElement.closest(".dialog-heading-sub");
            if (cut && (cut.scrollWidth > cut.clientWidth || range.getBoundingClientRect().right > cut.getBoundingClientRect().right + 1)) {
                continue;
            }
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
            if (Math.abs(box.top - words.top) < words.height && !rules.near(box.left - words.right, 6, 0.5)) {
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
                // The options of one tick list are one line each, a row gap (spec.fieldGap)
                // apart -- the same distance as two tick fields stand from each other
                // (every stack of tick rows: the Links, a field's tick options).
                for (const list of card.querySelectorAll(".legal-entity-links, .business-foundation-field")) {
                    const rows = [...list.querySelectorAll(":scope > label:has(> input[type=checkbox])")].filter(visible);
                    for (let n = 1; n < rows.length; n++) {
                        const gap = rect(rows[n]).top - rect(rows[n - 1]).bottom;
                        if (!rules.near(gap, spec.fieldGap, 1)) {
                            fail("tick-list options a row gap (" + spec.fieldGap + "px) apart", rows[n], { gap });
                        }
                    }
                }
                for (const label of card.querySelectorAll(".field-label, .legal-entity-column-head, label:has(> input[type=checkbox])")) {
                    if (!visible(label) || label.closest(".info-note-panel, table, .fold-card-head, .legal-entity-number-row")) {
                        continue;
                    }
                    // DECLARED EXCEPTION (layout-rules 7): a side label whose control is the empty message ("Add a
                    // founder under ...", a card of an organization with no founder yet) is centred on that
                    // message, which may wrap to two lines.
                    if (label.closest(".business-foundation-field")?.querySelector(":scope > .business-foundation-empty")) {
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
                if (box.matches(".legal-entity-unframed .legal-entity-section")) continue; // DECLARED: no frame in the dialogs, so no padding to measure
                const style = getComputedStyle(box);
                // The Text Hierarchy box: a declared 12px more each side.
                const margin = box.matches(".brand-hierarchy-card") ? spec.cardPadding + 12 : spec.cardPadding;
                for (const side of ["paddingLeft", "paddingRight"]) {
                    // A founder's card (declared exception, layout-rules 7): its left side is the card padding
                    // plus the inset and the marker column (--founder-inset, --founder-marker) that bullets and numbers hang in.
                    const wanted = side === "paddingLeft" && box.matches(".business-founder-open")
                        ? margin + (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--founder-inset")) || 4.5) + (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--founder-marker")) || 26.3)
                        : margin;
                    if (!rules.near(parseFloat(style[side]), wanted, 0.01)) {
                        fail("card side margin", box, { side, padding: parseFloat(style[side]), expected: wanted });
                    }
                }
            }
        }

        // 15. A card's head to its body: the one head gap (--space-field),
        //     from the head's lowest edge to the body's highest.
        for (const card of [...document.querySelectorAll(CARD)].filter(visible)) {
            if (card.matches(".strategy-initiatives-box")) {
                continue;
            }
            const head = card.querySelector(":scope > .strategy-box-head, :scope > .fold-card-head");
            if (!head || !visible(head)) {
                continue;
            }
            const headParts = [...head.children].filter(visible).map(rect);
            const bodyParts = [];
            for (let next = head.nextElementSibling; next; next = next.nextElementSibling) {
                if (next.matches(".business-card-summary")) {
                    continue;
                }
                bodyParts.push(...[next, ...next.querySelectorAll("*")].filter(visible).map(rect));
            }
            // Only what stands UNDER the head: a column set beside it (a
            // Segment's proposition at full width) is not its body's first row.
            const headLeft = Math.min(...headParts.map(part => part.left));
            const headRight = Math.max(...headParts.map(part => part.right));
            const under = bodyParts.filter(part => part.right > headLeft + 1 && part.left < headRight - 1);
            if (!headParts.length || !under.length) {
                continue;
            }
            const gap = Math.min(...under.map(part => part.top)) - Math.max(...headParts.map(part => part.bottom));
            if (!rules.near(gap, spec.fieldGap, 1)) {
                fail("head → body gap", head, { gap, expected: spec.fieldGap });
            }
        }

        // 15b. A Business Foundation Segment's top (wide layout): the name box
        //      ends at the right edge of the FIRST column (Profiles) by default and
        //      at most at the SECOND's (Competitors); the Description card and the
        //      Value Proposition start at one top, below the name box.
        for (const card of [...document.querySelectorAll(".business-foundation:not(.business-engagement) > .business-foundation-input")].filter(visible)) {
            const name = card.querySelector(":scope > .fold-card-head > .strategy-name-input");
            const first = card.querySelector(":scope > .business-foundation-profiles");
            const second = card.querySelector(":scope > .business-foundation-competitors");
            const description = card.querySelector(":scope > .business-foundation-description");
            const proposition = card.querySelector(":scope > .business-foundation-proposition");
            if (!name || !first || !second || !description || !proposition || !visible(first) || !visible(second) || !visible(description) || !visible(proposition)) {
                continue;
            }
            const nameRect = rect(name);
            const wide = rect(second).left > rect(first).right + 1 && rect(proposition).left > rect(description).left + 1;
            if (!wide) {
                continue;
            }
            if (nameRect.right < rect(first).right - tolerance || nameRect.right > rect(second).right + tolerance) {
                fail("segment name between the first and second column edges", name, { right: nameRect.right, first: rect(first).right, second: rect(second).right });
            }
            if (!rules.near(rect(description).top, rect(proposition).top, tolerance)) {
                fail("description card level with the value proposition", description, { description: rect(description).top, proposition: rect(proposition).top });
            }
            if (rect(description).top < nameRect.bottom - tolerance) {
                fail("description card below the name box", description, { top: rect(description).top, name: nameRect.bottom });
            }
        }

        // 15c. 4. Tax & Business Registration: the tax number's label and the VAT
        //      tick (with its "i") end at the right edge of column 1 (the Tax /
        //      Registration cell's).
        for (const row of [...document.querySelectorAll(".legal-entity-number-row > .legal-entity-row-label, .legal-entity-number-row > .legal-entity-switch-cell")].filter(visible)) {
            const column = rect(row);
            const last = [...row.querySelectorAll("*")].filter(visible).map(rect).reduce((edge, box) => Math.max(edge, box.right), -Infinity);
            if (last < column.right - tolerance - 1 || last > column.right + tolerance) {
                fail("tax label / VAT tick right-aligned to the Tax / Registration cell's right edge", row, { right: last, column: column.right });
            }
        }

        // 15d. 3. Formation & Registration: the Status label starts at the card body's
        //      left edge (the side row's), i.e. aligned with the Authority / Name label.
        for (const side of [...document.querySelectorAll(".legal-entity-side-row")].filter(visible)) {
            const picker = side.querySelector(":scope > .legal-entity-field > .option-picker");
            const label = picker && picker.parentElement.querySelector(".field-label");
            if (!picker || !visible(picker) || !label || rect(label).right > rect(picker).left + 1) {
                continue;
            }
            if (!rules.near(rect(label).left, rect(side).left, tolerance)) {
                fail("Status label left edge = the card body's", label, { label: rect(label).left, body: rect(side).left });
            }
        }

        // 16. A head's action buttons (filter, x): a cell gap apart.
        for (const actions of [...document.querySelectorAll(".strategy-box-actions")].filter(visible)) {
            const buttons = [...actions.children].filter(visible).map(rect).sort((one, other) => one.left - other.left);
            for (let index = 1; index < buttons.length; index++) {
                const gap = buttons[index].left - buttons[index - 1].right;
                if (!rules.near(gap, spec.fieldGap, 0.5)) {
                    fail("action buttons a cell gap apart", actions, { gap, expected: spec.fieldGap });
                }
            }
        }

        // 16a. The page grids (answer columns, Brand's columns, Legal Entity's
        //      section boxes): columns, rows and stacked boxes all 12px apart
        //      (--space-column / --space-field / --space-card), never 24px.
        for (const grid of [...document.querySelectorAll(".answer-columns, .brand-style, .brand-inventory, .legal-entity-body, .legal-entity-row")].filter(visible)) {
            const style = getComputedStyle(grid);
            if (!style.display.includes("grid") && !style.display.includes("flex")) {
                continue;
            }
            for (const [name, value] of [["column", style.columnGap], ["row", style.rowGap]]) {
                const gap = parseFloat(value);
                if (Number.isFinite(gap) && !rules.near(gap, spec.fieldGap, 0.5)) {
                    fail("page grid " + name + " gap is 12px", grid, { gap, expected: spec.fieldGap });
                }
            }
        }

        // 16b. A Strategy card's head buttons: a cell gap after the name box,
        //      the last at the card's side margin (padding + edge).
        for (const card of [...document.querySelectorAll(".strategy-theme-box, .strategy-goal-box, .strategy-objective-box, .strategy-metric-box")].filter(visible)) {
            const head = card.querySelector(":scope > .strategy-box-head");
            const actions = head && head.querySelector(":scope > .strategy-box-actions");
            const buttons = actions ? [...actions.children].filter(visible).map(rect) : [];
            if (!buttons.length) {
                continue;
            }
            const style = getComputedStyle(card);
            const edge = rect(card).right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight);
            const last = Math.max(...buttons.map(button => button.right));
            if (!rules.near(last, edge, 0.5)) {
                fail("head buttons at the side margin", head, { right: last, edge });
            }
            const name = nameBox(head);
            if (name) {
                const gap = Math.min(...buttons.map(button => button.left)) - name.right;
                if (!rules.near(gap, spec.fieldGap, 0.5)) {
                    fail("name → head buttons a cell gap", head, { gap, expected: spec.fieldGap });
                }
            }
        }

        // 16c. A field set in a card head under the name (a Competitor's or an
        //      Offering's Type): its control (the picker) ends at the name box's
        //      right edge.
        for (const row of [...document.querySelectorAll(".fold-card-head > .fold-card-head-row")].filter(visible)) {
            const name = nameBox(row.parentElement);
            const last = [...row.querySelectorAll(".option-picker, input, textarea, select")].filter(visible).pop() ?? row;
            if (name && !rules.near(rect(last).right, name.right, 0.5)) {
                fail("head row under the name box", row, { right: rect(last).right, name: name.right });
            }
        }

        // 18. CONTENT STARTS AT THE TITLE: under every head with a fold arrow --
        //     a numbered card, section, sub-block or item ("1. Segment",
        //     "2. Customer Relationship") or a titled block with no number
        //     ("Demand & Conversion", "Electricity") -- the content starts at
        //     the left edge of the title's text (its number, where it has
        //     one). Fold arrows, grips and "Expand all" are not content.
        //     Named exceptions: a Brand colour or typeface card (its body
        //     under its name box). A table's band heads (a cell, or a cell's own
        //     row) are set by its cells.
        {
            const HEADS = ".fold-card-head, .fold-group-head, .business-engagement-section-head, .business-capability-subsection-head, .financial-cost-group-head, .business-demand-head, .strategy-box-head";
            const aside = element => element.closest(".strategy-box-toggle, .label-arrow, .strategy-drag-handle, .fold-all-toggle, .info-note-panel, .option-picker-list, .month-picker-panel, .business-card-summary");
            for (const arrow of [...document.querySelectorAll(".strategy-box-toggle")].filter(visible)) {
                const head = arrow.closest(HEADS) ?? arrow.parentElement;
                if (!head || head.matches("th, td, tr") || (head.parentElement && head.parentElement.matches("th, td, .brand-style-card"))) {
                    continue;
                }
                // DECLARED: a reference row's fold arrow stands at the RIGHT of its link text (layout-rules 5, "reference column").
                if (arrow.closest(".business-engagement-reference-name-row")) {
                    continue;
                }
                // DECLARED EXCEPTION (layout-rules 7): a founder's card has no arrow column, and its
                // Responsibilities list stands at the card's content edge (the arrow's x), not past the
                // arrow -- checked by the founder-card rule (17e) instead.
                if (head.matches(".business-capability-responsibilities-head") && head.closest(".business-founder-open")) {
                    continue;
                }
                // The title: the first text after the arrow (or, for a card, its number or name box).
                let titleLeft = null;
                const walker = document.createTreeWalker(head, NodeFilter.SHOW_TEXT);
                for (let node = walker.nextNode(); node; node = walker.nextNode()) {
                    if (!node.textContent.trim() || aside(node.parentElement) || node.parentElement.closest("textarea, input, .business-demand-figure, .financial-subtotal")) {
                        continue;
                    }
                    if (arrow.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_PRECEDING) {
                        continue;
                    }
                    const range = document.createRange();
                    range.selectNodeContents(node);
                    const boxes = [...range.getClientRects()].filter(box => box.width > 0);
                    if (boxes.length) {
                        titleLeft = Math.min(...boxes.map(box => box.left));
                        break;
                    }
                }
                if (titleLeft === null) {
                    const name = nameBox(head);
                    titleLeft = name ? name.left : null;
                }
                if (titleLeft === null) {
                    continue;
                }
                const content = [];
                for (let next = head.nextElementSibling; next; next = next.nextElementSibling) {
                    for (const element of [next, ...next.querySelectorAll("*")]) {
                        if (visible(element) && !aside(element)) {
                            content.push(rect(element).left);
                        }
                    }
                }
                if (!content.length) {
                    continue;
                }
                const left = Math.min(...content);
                if (!rules.near(left, titleLeft, 1)) {
                    fail("content starts at the title", head, { content: left, title: titleLeft });
                }
            }
        }

        // 17. A drag grip to what follows it (the fold arrow, or the
        //     number's first character where there is no arrow): the head's
        //     one 8px gap.
        for (const grip of [...document.querySelectorAll(".strategy-drag-handle")].filter(visible)) {
            let next = grip.nextElementSibling;
            while (next && !visible(next)) {
                next = next.nextElementSibling;
            }
            if (!next) {
                continue;
            }
            let left = rect(next).left;
            if (next.matches(".strategy-box-number, .legal-entity-card-number")) {
                const range = document.createRange();
                range.selectNodeContents(next);
                const glyphs = [...range.getClientRects()].filter(box => box.width > 0);
                if (glyphs.length) {
                    left = Math.min(...glyphs.map(box => box.left));
                }
            }
            const gap = left - rect(grip).right;
            if (!rules.near(gap, spec.numberToName, 1)) {
                fail("grip → next gap", grip, { gap, expected: spec.numberToName, next: describe(next) });
            }
        }

        // 14. The card-list adds the rulebook names (and only those): the
        //     cards' whole width, from the cards' left edge to their right
        //     (the list's content width while it has none), label centred.
        for (const button of [...document.querySelectorAll("button.strategy-add-button")].filter(visible)) {
            if (!CARD_LIST_ADDS.includes(button.textContent.trim()) || button.closest(".business-step-add-row")) {
                continue;
            }
            const list = button.parentElement;
            const cards = [...list.children].filter(child => child.matches(CARD) && visible(child)).map(rect);
            const style = getComputedStyle(list);
            const span = cards.length
                ? [Math.min(...cards.map(card => card.left)), Math.max(...cards.map(card => card.right))]
                : [rect(list).left + parseFloat(style.borderLeftWidth) + parseFloat(style.paddingLeft), rect(list).right - parseFloat(style.borderRightWidth) - parseFloat(style.paddingRight)];
            const box = rect(button);
            if (!rules.near(box.left, span[0], 1) || !rules.near(box.right, span[1], 1) || getComputedStyle(button).textAlign !== "center") {
                fail("card-list add spans the cards", button, { button: [box.left, box.right], cards: span, textAlign: getComputedStyle(button).textAlign });
            }
        }

        // 15. A shown bulleted list (.business-engagement-channel-list): the
        //     dot's right edge stands --bullet-gap (12px) from the text.
        for (const item of [...document.querySelectorAll(".business-engagement-channel-list > li")].filter(visible)) {
            const dot = getComputedStyle(item, "::before");
            const range = document.createRange();
            range.selectNodeContents(item);
            const text = range.getClientRects()[0];
            const gap = text ? text.left - (rect(item).left + parseFloat(dot.left) + parseFloat(dot.width)) : 12;
            if (!rules.near(gap, 12, 1)) {
                fail("bullet → text gap", item, { gap, expected: 12 });
            }
        }

        // 19. The Channel resources table (read-only, auto-generated): 12px
        //     (--space-field) from every cell's edge to its text (the name
        //     cell's left edge has the 4px colour stripe besides), and no
        //     sideways scroll inside its box from 1366px wide up.
        for (const wrap of [...document.querySelectorAll(".channel-resource-table-wrap")].filter(visible)) {
            for (const cell of wrap.querySelectorAll("th, td")) {
                const style = getComputedStyle(cell);
                const left = cell.matches("tbody th") ? 16 : 12;
                if (![style.paddingTop, style.paddingRight, style.paddingBottom].every(value => rules.near(parseFloat(value), 12, 0.5)) || !rules.near(parseFloat(style.paddingLeft), left, 0.5)) {
                    fail("channel resources cell margins", cell, { padding: style.padding, expected: 12 });
                    break;
                }
            }
            if (window.innerWidth >= 1366 && wrap.scrollWidth > wrap.clientWidth + 1) {
                fail("channel resources table fits its card", wrap, { scroll: wrap.scrollWidth, width: wrap.clientWidth });
            }

            // The text of every cell of a list column (Channel, Offerings, Journey
            // stages) starts at one x, a single value (indented) or a bullet's item;
            // the Actions cell has no bullets and its "#N" buttons stay on one line.
            const table = wrap.querySelector("table");
            for (const column of [4, 5, 6]) {
                const lefts = [...table.querySelectorAll("tbody tr > :nth-child(" + column + ")")].filter(visible).map(cell => {
                    const item = cell.querySelector(".channel-resource-single, li");
                    return item ? rect(item).left + (item.matches("li") || item.matches(".channel-resource-single") ? parseFloat(getComputedStyle(item).paddingLeft) : 0) : null;
                }).filter(value => value !== null);
                if (lefts.length > 1 && Math.max(...lefts) - Math.min(...lefts) > 1) {
                    fail("channel resources: one text start per column", table, { column, lefts });
                }
            }
            for (const button of [...wrap.querySelectorAll(".channel-resource-action")].filter(visible)) {
                if (button.getClientRects().length !== 1 || rect(button).height > 2 * parseFloat(getComputedStyle(button).fontSize) * 1.4 || button.closest("li")?.matches(".channel-resource-bullets > li")) {
                    fail("channel resources: an action button is one line, no bullet", button, { height: rect(button).height });
                }
            }
        }

        // 16. A Relationship Type's cell: its picker, Purpose and + Add stand a
        //     field gap (12px) apart; its × a cell gap (12px) from the picker.
        for (const cell of [...document.querySelectorAll(".business-relationship-type-cell:not(.business-channel-cell-derived)")].filter(visible)) {
            const parts = [cell.querySelector(".business-channel-pick"), cell.querySelector(".business-relationship-purpose"), cell.querySelector(".business-relationship-add button")]
                .filter(part => part && visible(part)).map(rect);
            parts.slice(1).forEach((below, index) => {
                if (!rules.near(below.top - parts[index].bottom, 12, 1)) {
                    fail("relationship type cells a field gap apart", cell, { gap: below.top - parts[index].bottom, expected: 12 });
                }
            });
            const picker = cell.querySelector(".business-channel-pick .option-picker");
            const remove = cell.querySelector(".business-channel-pick .business-channel-steps button");
            if (picker && remove && !rules.near(rect(remove).left - rect(picker).right, 12, 1)) {
                fail("relationship type picker → × gap", cell, { gap: rect(remove).left - rect(picker).right, expected: 12 });
            }
        }

        // 17. A Customer Engagement reference column (Segment / Profiles /
        //     Offerings): one left edge -- the title's text, every link's text
        //     and every details block's text start at the same x.
        for (const column of [...document.querySelectorAll(".business-engagement-reference-column")].filter(visible)) {
            const left = (element) => {
                const range = document.createRange();
                range.selectNodeContents(element);
                const first = range.getClientRects()[0];
                return first ? first.left : null;
            };
            const title = column.querySelector(".business-foundation-subhead");
            const edge = title ? left(title.querySelector(".business-engagement-reference-number") || title.querySelector(":scope > span:not(.strategy-box-toggle)") || title) : null;
            const parts = [
                ...[...column.querySelectorAll(".business-engagement-reference-name-row > :not(.strategy-box-toggle):not(.info-note)")].map(left),
                ...[...column.querySelectorAll(".business-engagement-reference-label, .business-engagement-reference-text")].map(left)
            ].filter(x => x !== null);
            if (edge !== null && parts.some(x => !rules.near(x, edge, 1))) {
                fail("reference column one left edge", column, { title: edge, parts });
            }
        }

        // 18. A reference link's fold arrow: centred on the link's FIRST line, and
        //     its right edge no further than the column's right edge (12px short
        //     of the next column's hanging rule; the last column's: 12px short of
        //     the Segment card's right side).
        for (const row of [...document.querySelectorAll(".business-engagement-reference-name-row")].filter(visible)) {
            const arrow = row.querySelector(":scope > .strategy-box-toggle");
            const link = row.querySelector(":scope > :not(.strategy-box-toggle)");
            const column = row.closest(".business-engagement-reference-column");
            if (!arrow || !link || !column) continue;
            const range = document.createRange();
            range.selectNodeContents(link);
            const first = range.getClientRects()[0];
            const a = rect(arrow);
            if (first && !rules.near((a.top + a.bottom) / 2, (first.top + first.bottom) / 2, 1)) {
                fail("reference arrow centred on the link's first line", row, { arrow: (a.top + a.bottom) / 2, line: (first.top + first.bottom) / 2 });
            }
            // The last column's limit is the card's right side (inside its border) less 12px.
            const card = column.closest(".business-engagement-input");
            const last = column === column.parentElement.lastElementChild;
            let limit = rect(column).right;
            if (last && card) {
                limit = Math.min(limit, rect(card).right - (parseFloat(getComputedStyle(card).borderRightWidth) || 0) - spec.fieldGap);
            }
            if (a.right > limit + 1) {
                fail("reference arrow within the column's limit", row, { arrow: a.right, limit });
            }
        }

        // 20. A FOLDED CARD IS ONE FIXED HEIGHT (card-folding.css, the flat card lists
        //     that carry .fold-card-fixed; not Customer Engagement, Strategy): the
        //     head whose arrow says it is folded has its written name on one line,
        //     ellipsis-cut (a name carrying an "i" aside), its summary on one line, and
        //     the heads of one kind (same classes, same summary or none) stand equally high.
        {
            const kinds = new Map();
            for (const head of [...document.querySelectorAll(".fold-card-fixed")].filter(visible)) {
                if (!head.querySelector(":scope > .strategy-box-toggle[aria-expanded='false']")) {
                    continue;
                }
                const name = head.querySelector(":scope > .strategy-name-static");
                const summary = head.querySelector(":scope > .business-card-summary");
                if (name && !name.querySelector(".info-note")) {
                    const style = getComputedStyle(name);
                    if (style.whiteSpace !== "nowrap" || style.textOverflow !== "ellipsis" || name.getClientRects().length !== 1 || rect(name).height > 1.5 * parseFloat(style.fontSize) * 1.5 + 18) {
                        fail("a folded card's name is one ellipsis-cut line", name, { whiteSpace: style.whiteSpace, textOverflow: style.textOverflow, height: rect(name).height });
                    }
                }
                if (summary) {
                    const style = getComputedStyle(summary);
                    if (style.whiteSpace !== "nowrap" || style.textOverflow !== "ellipsis" || rect(summary).height > 1.6 * parseFloat(style.fontSize) * 1.5) {
                        fail("a folded card's summary is one ellipsis-cut line", summary, { whiteSpace: style.whiteSpace, textOverflow: style.textOverflow, height: rect(summary).height });
                    }
                }
                const key = head.className + "|" + (summary ? "summary" : "head-only");
                kinds.set(key, [...(kinds.get(key) ?? []), head]);
            }
            for (const heads of kinds.values()) {
                const heights = heads.map(head => rect(head).height);
                if (heads.length > 1 && Math.max(...heights) - Math.min(...heights) > 1) {
                    fail("folded cards of a kind are equally high", heads[0], { heights });
                }
            }
        }

        // 17. SECTION TILES (docs/ai/layout-rules.md, "Section tiles and dialog"): every
        //     tile is a true square of the one size -- a third of its group's width less the
        //     two gaps (--section-tile-size, never under --section-tile-min), so three across
        //     fill the group -- the tiles of a group are 12px apart and left-aligned, the
        //     title is centred in its tile and wholly inside it, and a card's groups all use
        //     the same size.
        {
            const tiles = [...document.querySelectorAll(".section-tile")].filter(visible);
            const smallest = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--section-tile-min")) || 120;
            const sizes = new Map();
            for (const tile of tiles) {
                // DECLARED: the squeezed row (Inventory, Completed) shows titles only, 57px high: not a square, no list, no anatomy.
                if (tile.closest(".section-tiles-completed[data-squeezed]")) continue;
                // DECLARED: a DIAGRAM tile (the Roadmap) is a category of its own: a wide banner with a large title, no list, not a square of the page tile size.
                if (tile.matches(".section-tile-diagram")) continue;
                const box = rect(tile);
                const holder = tile.closest(".section-tiles-box");
                // The Founders' closed boxes (more than 8 founders) are squares of their own fixed size
                // (--section-box-size); the SUBCATEGORY boxes (a section with several subcategories) are
                // squares sized so the set stands in two rows (checked below, per group); the add box is half
                // their side. Neither is a third of a group's width.
                const founderBox = tile.closest(".section-tiles-founders, .section-tiles-boxes, .card-tile-grid") !== null;
                // (Three across or fewer: a third of the width less two gaps; more across: the width less its gaps over them.)
                const across = Math.max(3, parseFloat(getComputedStyle(tile.parentElement).getPropertyValue("--tile-columns")) || 3);
                const size = holder ? Math.max(smallest, (rect(holder).width - (across - 1) * spec.fieldGap) / across) : box.width;
                if (tile.closest(".section-tiles-founders")) {
                    const boxSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--section-box-size")) || 160;
                    if (!rules.near(box.width, box.height, tolerance) || !rules.near(box.width, boxSize, tolerance)) {
                        fail("a founder's box is a square of the shared box size", tile, { width: box.width, height: box.height, boxSize });
                    }
                } else if (founderBox) {
                    if (!rules.near(box.width, box.height, tolerance)) {
                        fail("a subcategory or card box is a square", tile, { width: box.width, height: box.height });
                    }
                } else if (tile.closest(".section-tiles-quad")) {
                    // The four tiles of a page card (2 x 2): squares as large as the card allows, 12px apart (never more than half the width less the gap).
                    const half = (rect(holder).width - spec.fieldGap) / 2;
                    if (!rules.near(box.width, box.height, tolerance) || box.width > half + 1) {
                        fail("the four tiles of a page card are squares, at most half the group's width less the gap", tile, { width: box.width, height: box.height, half });
                    }
                } else if (tile.closest(".section-tiles-small, .business-engagement-section")) {
                    // (Tiles kept at the page's own small size -- 215px -- whatever their number: squares all the same.)
                    if (!rules.near(box.width, box.height, tolerance)) {
                        fail("a section tile is a square", tile, { width: box.width, height: box.height });
                    }
                } else if (!rules.near(box.width, size, tolerance) || !rules.near(box.height, size, tolerance)) {
                    fail("a section tile is a square, a third of its group's width less the gaps", tile, { width: box.width, height: box.height, size });
                }
                if (!founderBox) {
                    const home = tile.closest(".business-foundation-card");
                    sizes.set(home, [...(sizes.get(home) ?? []), box.width]);
                }
                const title = tile.querySelector(".section-tile-title");
                if (title && !tile.classList.contains("section-tile-add")) {
                    // A title that wraps has room between its lines (line-height 1.45 of its size, not
                    // under 1.4), and an "&" never ends a line: it is joined to the next word with a no-break space.
                    {
                        const style = getComputedStyle(title);
                        const lines = new Set([...title.getClientRects()].map(line => Math.round(line.top))).size;
                        const range = document.createRange();
                        range.selectNodeContents(title);
                        const rows = new Set([...range.getClientRects()].map(line => Math.round(line.top))).size;
                        const ratio = (parseFloat(style.lineHeight) || 0) / parseFloat(style.fontSize);
                        if (rows > 1 && ratio < 1.4) {
                            fail("a tile title that wraps has the roomy line height (1.45)", tile, { ratio, rows });
                        }
                        if (/ &( |$)/.test(title.textContent)) {
                            fail("an & in a title is joined to the next word (no-break space)", tile, { text: title.textContent });
                        }
                        void lines;
                    }
                    // TILE ANATOMY (docs/ai/layout-rules.md, "Tile anatomy"): the title is centred across the
                    // square, its first line's centre one third down it (--tile-title-top), underlined by a rule
                    // of its own (a 1px bottom border on the title element); under it the list of what the
                    // section includes (small, muted, bulleted, one line each, inside the square) or, for an
                    // empty section, the "+"; a founder's box / a card box adds its one small line.
                    // (On a page tile the list is laid over the square, in its slot: the tile's button, the list and the "+" are the slot's parts.)
                    const slot = tile.parentElement && tile.parentElement.classList.contains("section-tile-slot") ? tile.parentElement : null;
                    const listOfTile = tile.querySelector(":scope > .section-tile-list") || (slot ? slot.querySelector(":scope > .section-tile-links-layer > .section-tile-list") : null);
                    const below = tile.querySelector(".section-tile-sub") || listOfTile || title;
                    const ink = { left: Math.min(rect(title).left, rect(below).left), right: Math.max(rect(title).right, rect(below).right), top: rect(title).top, bottom: rect(below).bottom };
                    if (ink.left < box.left - tolerance || ink.right > box.right + tolerance || ink.top < box.top - tolerance || ink.bottom > box.bottom + tolerance) {
                        fail("a section tile's title is inside its square", tile, { tile: [box.left, box.top, box.right, box.bottom], title: [ink.left, ink.top, ink.right, ink.bottom] });
                    }
                    const titleBox = rect(title);
                    const aside = Math.abs((titleBox.left + titleBox.right) / 2 - (box.left + box.right) / 2);
                    if (aside > 2) {
                        fail("a section tile's title is centred across its square", tile, { aside });
                    }
                    // THE TITLE'S FIRST LINE STANDS 24px FROM THE SQUARE'S TOP (+ the tile's 1px edge) on every tile of every size (docs/ai/tile-and-card-pattern.md): a title of two lines keeps its first line there.
                    const firstFromTop = titleBox.top - box.top;
                    if (Math.abs(firstFromTop - 25) > 2.5) {
                        fail("a tile's title has its first line 24px from the top of the square (whatever the number of lines)", tile, { firstFromTop, wanted: 25, tile: box.height });
                    }
                    if (titleBox.top - box.top < 12 - tolerance - 1) {
                        fail("a tile's title is 12px or more from the top of the square", tile, { fromTop: titleBox.top - box.top });
                    }
                    {
                        const rule = getComputedStyle(title);
                        if (parseFloat(rule.borderBottomWidth) < 0.5 || rule.borderBottomStyle !== "solid") {
                            fail("a tile's title is underlined by a hairline of its own", tile, { width: rule.borderBottomWidth, style: rule.borderBottomStyle });
                        }
                    }
                    const list = listOfTile;
                    if (list) {
                        const listBox = rect(list);
                        const small = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--font-small")) || 14;
                        if (listBox.top < titleBox.bottom - tolerance || listBox.bottom > box.bottom + tolerance || listBox.left < box.left || listBox.right > box.right) {
                            fail("a tile's list stands under the title, inside the square", tile, { list: [listBox.left, listBox.top, listBox.right, listBox.bottom], tile: [box.left, box.top, box.right, box.bottom], title: titleBox.bottom });
                        }
                        if (Math.abs((listBox.left + listBox.right) / 2 - (box.left + box.right) / 2) > 2.5) {
                            fail("a tile's list block is centred under its title", tile, { list: (listBox.left + listBox.right) / 2, tile: (box.left + box.right) / 2 });
                        }
                        // THE LIST STARTS A FIXED 12px UNDER THE UNDERLINE of the title (it comes up with the lifted title).
                        if (!rules.near(listBox.top - titleBox.bottom, spec.fieldGap, 0.75)) {
                            fail("a tile's list starts 12px under the title's underline", tile, { gap: listBox.top - titleBox.bottom });
                        }
                        const items = [...list.children].filter(visible);
                        // A list holds EVERY item and scrolls inside its bounds when they do not fit (thin themed scrollbar, no "+N more").
                        const scrolls = list.scrollHeight > list.clientHeight + 1;
                        if (scrolls && (getComputedStyle(list).overflowY !== "auto" || !list.hasAttribute("data-scrolls"))) {
                            fail("a tile's list that does not fit scrolls inside its bounds", list, { overflowY: getComputedStyle(list).overflowY });
                        }
                        if (/\+\d+ more/.test(list.textContent)) {
                            fail("a tile's list has no '+N more' item: it scrolls", list, { text: list.textContent });
                        }
                        for (const item of items) {
                            // (The list of the four large tiles of a page card is the body size.)
                            const wanted = item.closest(".section-tiles-quad[data-large]") ? (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--font-body")) || 18) : small;
                            if (!rules.near(parseFloat(getComputedStyle(item).fontSize), wanted, 0.5)) {
                                fail("a tile's list is in the small size", item, { size: getComputedStyle(item).fontSize });
                            }
                            // (An item whose text carries a forced break -- "Cooling & Air" / "Conditioning" -- is two lines, each cut by its own ellipsis; no other item breaks.)
                            const broken = item.querySelectorAll(".section-tile-list-line").length;
                            if (!item.closest(".column-tiles-page") && (rect(item).height > Math.max(1, broken) * 1.6 * small * 1.45 || (!scrolls && rect(item).bottom > listBox.bottom + tolerance))) {
                                fail("a tile's list items are one line each (two where a forced break is) and inside the list", item, { height: rect(item).height, bottom: rect(item).bottom, list: listBox.bottom });
                            }
                            if (broken > 1 && !/^(Cooling & Air|Online Presence)/.test(item.textContent.trim())) {
                                fail("only the named subcategory items break onto a second line", item, { text: item.textContent });
                            }
                        }
                        if (items.length === 0) {
                            fail("a tile's list shows at least one line", tile, {});
                        }
                        const ground = rules.parseColor(getComputedStyle(tile).backgroundColor);
                        const ink = rules.parseColor(getComputedStyle(list).color);
                        if (ground && ink && rules.contrast(ink, ground) < 4.5) {
                            fail("a tile's list text holds 4.5:1 on the tile", tile, { contrast: rules.contrast(ink, ground) });
                        }
                    }
                }
            }
            for (const [home, widths] of sizes) {
                if (Math.max(...widths) - Math.min(...widths) > tolerance) {
                    fail("every group of tiles in a card uses one tile size", home, { sizes: rules.distinct(widths) });
                }
            }
            // SUBCATEGORY BOXES: the boxes and the add box stand in TWO ROWS across the dialog's content
            // width -- ceil(n / 2) columns, the side (width less the gaps) / columns, at most a third of
            // the width and low enough for two rows in the dialog; the add box half that side, at the
            // top left of its cell.
            for (const group of [...document.querySelectorAll(".section-tiles-boxes")].filter(visible)) {
                const all = [...group.querySelectorAll(":scope > .section-tile")].filter(visible);
                const add = all.find(tile => tile.classList.contains("section-tile-add"));
                const boxes = all.filter(tile => tile !== add);
                if (boxes.length === 0) continue;
                const columns = rules.gridColumns(all.length);
                const shapeRows = Math.ceil(all.length / columns);
                const width = rect(group).width;
                const dialog = group.closest(".section-tile-dialog");
                const side = Math.min((width - (columns - 1) * spec.fieldGap) / columns, width / 3, dialog ? (rect(dialog).height - 160 - (shapeRows - 1) * spec.fieldGap) / shapeRows : Infinity);
                const side0 = rect(boxes[0]);
                if (!rules.near(side0.width, side, tolerance + 0.5)) {
                    fail("subcategory boxes take the one shape (a row of up to 3, a 2 x 2 square, else two rows) and the side that fits", group, { side: side0.width, expected: side, columns, n: all.length });
                }
                const tops = rules.distinct(all.map(tile => Math.round(rect(tile).top)));
                if (tops.length !== shapeRows) {
                    fail("subcategory boxes stand in the rows of the one shape", group, { rows: tops.length, expected: shapeRows, n: all.length });
                }
                if (add) {
                    const a = rect(add);
                    if (!rules.near(a.width, side0.width, tolerance + 0.5) || !rules.near(a.height, a.width, tolerance)) {
                        fail("the add box is a square of the other boxes' side", add, { width: a.width, height: a.height, side: side0.width });
                    }
                    if (add !== all[all.length - 1]) {
                        fail("the add box comes after the last subcategory box", add, {});
                    }
                    if (add.getAttribute("aria-label") !== "Add Other") {
                        fail("the add box is named 'Add Other'", add, { label: add.getAttribute("aria-label") });
                    }
                }
            }
            // THE "+" OF AN EMPTY SECTION: under the title, inside the square, centred, 24px, decorative, the tile
            // described as "No items yet"; and only a section that holds no cards shows it.
            for (const tile of [...document.querySelectorAll(".section-tile")].filter(visible)) {
                const plus = tile.querySelector(":scope > .section-tile-empty");
                if (!plus) {
                    continue;
                }
                const title = tile.querySelector(":scope > .section-tile-title");
                const p = rect(plus);
                const t = rect(title);
                const b = rect(tile);
                if (p.top < t.bottom - tolerance) {
                    fail("the + of an empty section stands under the title", tile, { plus: p.top, title: t.bottom });
                }
                if (p.left < b.left || p.right > b.right || p.bottom > b.bottom) {
                    fail("the + of an empty section is inside the tile's square", tile, { plus: [p.left, p.top, p.right, p.bottom], tile: [b.left, b.top, b.right, b.bottom] });
                }
                if (Math.abs((p.left + p.right) / 2 - (t.left + t.right) / 2) > 2) {
                    fail("the + of an empty section is centred under the title", tile, { plus: (p.left + p.right) / 2, title: (t.left + t.right) / 2 });
                }
                if (!rules.near(parseFloat(getComputedStyle(plus).fontSize), 24, 1) || plus.getAttribute("aria-hidden") !== "true") {
                    fail("the + of an empty section is a decorative 24px glyph", tile, { size: getComputedStyle(plus).fontSize, hidden: plus.getAttribute("aria-hidden") });
                }
                const note = tile.querySelector(":scope > .section-tile-empty-note");
                if (!note || note.textContent.trim() !== "No items yet") {
                    fail("an empty section's tile is described as 'No items yet'", tile, {});
                }
                if ((tile.getAttribute("data-holds") || "").trim() !== "") {
                    fail("only a section with no cards shows the +", tile, { holds: tile.getAttribute("data-holds") });
                }
            }
            // THE GREY OF THE FINISHED ONES: the Completed tile is the neutral completed grey (ground and edge), its text grey
            // and still 4.5:1 on that ground; no category hue.
            for (const tile of [...document.querySelectorAll(".section-tile-completed")].filter(visible)) {
                const root = getComputedStyle(document.documentElement);
                const grey = rules.parseColor(getComputedStyle(tile).backgroundColor);
                const edge = rules.parseColor(getComputedStyle(tile).borderTopColor);
                const edgeToken = rules.parseColor((() => { const probe = document.createElement("span"); probe.style.color = "var(--line-completed)"; document.body.append(probe); const colour = getComputedStyle(probe).color; probe.remove(); return colour; })());
                if (!grey || Math.max(...grey) - Math.min(...grey) > 24) {
                    fail("the Completed tile's ground is a neutral grey", tile, { ground: getComputedStyle(tile).backgroundColor });
                }
                // NO STROKE AND NO BORDER: a box's edge is its inset light and shade (--box-inset); a transparent border left a hairline of plain
                // ground outside the shadow, in the opposite tone.
                if (parseFloat(getComputedStyle(tile).borderTopWidth) !== 0 || parseFloat(getComputedStyle(tile).borderLeftWidth) !== 0) {
                    fail("a box has no border at all (its edge is the inset light and shade, with no hairline outside it)", tile, { border: getComputedStyle(tile).borderTopWidth });
                }
                void edge;
                void edgeToken;
                for (const part of tile.querySelectorAll(".section-tile-title, .section-tile-list > li")) {
                    const ink = rules.parseColor(getComputedStyle(part).color);
                    if (grey && ink && rules.contrast(ink, grey) < 4.5) {
                        fail("the Completed tile's text holds 4.5:1 on its grey ground", tile, { contrast: rules.contrast(ink, grey), text: part.textContent });
                        break;
                    }
                }
                void root;
            }
            // CARD TILES (docs/ai/layout-rules.md, "Card tiles"): every grid of cards (a dialog's, the Inventory overlay's) is the ONE card tile (CardTile.tsx),
            // squares of the page tile's own side, 12px apart from the left; the add box half the side, last in the flow, named "Add <item>"; titles 18px unless
            // they are too long for their room (14px); the tile lists at least one line.
            for (const grid of [...document.querySelectorAll(".card-tile-grid")].filter(visible)) {
                const all = [...grid.querySelectorAll(":scope > .card-tile-slot > .section-tile, :scope > .section-tile")].filter(visible);
                const adds = all.filter(tile => tile.classList.contains("card-box-add"));
                const add = adds[0];
                const boxes = all.filter(tile => !adds.includes(tile));
                if (all.length === 0) continue;
                const pageTile = document.querySelector(".answer-columns.business-capability .section-tile-slot:not(.card-tile-slot) > .section-tile");
                // (offsetWidth: the tile under the pointer is grown on hover, and a rect would read that.)
                // (The tile of every dialog is the one a page card of three across would have; the four tiles of a page card are scaled up from it.)
                const quadBox = pageTile ? pageTile.closest(".section-tiles-quad") : null;
                const side = quadBox ? Math.floor((quadBox.clientWidth - 2 * spec.fieldGap) / 3 - 0.01) : pageTile ? pageTile.offsetWidth : (boxes.length > 0 ? boxes[0].offsetWidth : null);
                for (const box of boxes) {
                    if (side !== null && (!rules.near(rect(box).width, side, tolerance) || !rules.near(rect(box).height, side, tolerance))) {
                        fail("card tiles are squares of the page tile's side", box, { width: rect(box).width, height: rect(box).height, side });
                    }
                    const title = box.querySelector(".section-tile-title");
                    if (title) {
                        const size = parseFloat(getComputedStyle(title).fontSize);
                        if (!rules.near(size, box.hasAttribute("data-title-small") ? 14 : 18, 0.5)) {
                            fail("a card tile's title is 18px (14px where it is too long for its room)", box, { size });
                        }
                    }
                    if ((box.closest(".section-tile-slot") || box).querySelectorAll(".section-tile-list > li").length === 0 && !box.closest(".section-tile-completed") && !box.closest(".section-tile-slot-empty") && !box.closest("[data-own]") && !box.hasAttribute("data-own")) {
                        fail("a card tile lists at least one line", box, {});
                    }
                }
                for (const row of rules.rowsOf(boxes.map(rect), 2)) {
                    const ordered = row.sort((one, other) => one.left - other.left);
                    for (let at = 1; at < ordered.length; at++) {
                        if (!rules.near(ordered[at].left - ordered[at - 1].right, spec.fieldGap, tolerance)) {
                            fail("card tiles are 12px apart", grid, { gap: ordered[at].left - ordered[at - 1].right });
                        }
                    }
                }
                if (boxes.length > 0 && !rules.near(rect(boxes.sort((one, other) => rect(one).left - rect(other).left)[0]).left, rect(grid).left, tolerance + 1)) {
                    fail("card tiles start at the grid's left edge", grid, { first: rect(boxes[0]).left, grid: rect(grid).left });
                }
                if (add) {
                    const a = rect(add);
                    if (side !== null && (!rules.near(a.width, side, tolerance + 0.5) || !rules.near(a.height, a.width, tolerance))) {
                        fail("the add box of a list of cards is a square of the tiles' side", add, { width: a.width, height: a.height, side });
                    }
                    // (A grid may end with several add boxes: Resources has "Add Resource" and "Add Workspace".)
                    if (all.indexOf(add) !== all.length - adds.length) {
                        fail("the add box comes after the last card tile", add, {});
                    }
                    if (!/^Add [A-Z]/.test(add.getAttribute("aria-label") || "")) {
                        fail("the add box is named 'Add <Item>' (title case)", add, { label: add.getAttribute("aria-label") });
                    }
                }
            }
            // THE ONE SHAPE (docs/ai/layout-rules.md, "Tile grids"): every group of tiles on the page is a row of up
            // to 3, exactly 4 a 2 x 2 square, 5 or more two rows (ceil(n / 2) across) -- where the group is wide
            // enough for that many at the tile size (a narrow group wraps to fewer across).
            for (const group of [...document.querySelectorAll(".section-tiles")].filter(visible)) {
                if (group.closest(".section-tile-dialog")) continue;
                const tail = [...group.querySelectorAll(":scope > .section-tile[data-tail], :scope > .section-tile-slot > .section-tile[data-tail]")].filter(visible).map(rect);
                const tiles = [...group.querySelectorAll(":scope > .section-tile:not([data-tail]), :scope > .section-tile-slot > .section-tile:not([data-tail])")].filter(visible).map(rect);
                if (tiles.length === 0) continue;
                const across = rules.distinct(tiles.map(tile => Math.round(tile.left))).length;
                const wanted = rules.gridColumns(tiles.length);
                const fitsAll = wanted * tiles[0].width + (wanted - 1) * spec.fieldGap <= rect(group).width + 1;
                if (fitsAll && across !== wanted) {
                    fail("a group of tiles takes the one shape (a row of up to 3, a 2 x 2 square, else two rows)", group, { across, wanted, n: tiles.length });
                }
                // THE DECLARED EXCEPTION (layout-rules 5a): the TAIL tile (Infrastructure's grey Completed tile) is not
                // counted in the shape. It stands in the first free cell of the last row, beside the last tile; with the 2 x 2
                // square (its last row full) in a third column of that row, the first row's third cell empty; with three
                // across or more, on a row of its own under the first column.
                for (const tile of tail) {
                    const place = rules.tailPlacement(tiles.length, wanted);
                    const first = rules.rowsOf(tiles, 2).sort((one, other) => one[0].top - other[0].top);
                    const lastRow = first[first.length - 1];
                    const lastBottom = Math.max(...tiles.map(other => other.bottom));
                    const columnLeft = Math.min(...tiles.map(other => other.left)) + (place.column - 1) * (tiles[0].width + spec.fieldGap);
                    const rowTop = Math.min(...tiles.map(other => other.top)) + (place.row - 1) * (tiles[0].height + spec.fieldGap);
                    void lastRow;
                    void lastBottom;
                    if (fitsAll && (!rules.near(tile.left, columnLeft, tolerance + 1) || !rules.near(tile.top, rowTop, tolerance + 1))) {
                        fail("the tail tile (Completed) stands beside the last tile in the final row, or on a new row when that row is full", group, { left: tile.left, top: tile.top, expected: [columnLeft, rowTop], place });
                    }
                    if (!rules.near(tile.width, tiles[0].width, tolerance) || !rules.near(tile.height, tiles[0].height, tolerance)) {
                        fail("the tail tile is the size of the others", group, { width: tile.width, height: tile.height });
                    }
                }
            }
            for (const group of document.querySelectorAll(".section-tiles")) {
                const boxes = [...group.querySelectorAll(":scope > .section-tile, :scope > .section-tile-slot > .section-tile")].filter(visible).map(rect);
                const rows = rules.rowsOf(boxes, 2).map(row => row.sort((one, other) => one.left - other.left));
                rows.forEach((row, at) => {
                    for (let index = 1; index < row.length; index++) {
                        if (!rules.near(row[index].left - row[index - 1].right, spec.fieldGap, tolerance)) {
                            fail("section tiles are 12px apart", group, { gap: row[index].left - row[index - 1].right });
                        }
                    }
                    if (at > 0 && !rules.near(row[0].top - rows[at - 1][0].bottom, spec.fieldGap, tolerance)) {
                        fail("section tiles are 12px apart", group, { rowGap: row[0].top - rows[at - 1][0].bottom });
                    }
                    // A group in a dialog is a block centred in it (its boxes left-aligned inside the block: the
                    // first row's first box is the block's left edge); a group on the page is left-aligned.
                    if (!group.closest(".section-tile-dialog, .section-tiles-completed") && !rules.near(row[0].left, rect(group).left, tolerance)) {
                        fail("section tiles are left-aligned in their group", group, { first: row[0].left, group: rect(group).left });
                    }
                    if (at > 0 && group.closest(".section-tile-dialog") && !rules.near(row[0].left, rows[0][0].left, tolerance)) {
                        fail("the boxes of a dialog's grid are left-aligned in their block", group, { first: row[0].left, block: rows[0][0].left });
                    }
                });
            }
        }

        // 17j. A PAGE TILE'S SLOT (docs/ai/layout-rules.md, "Tile anatomy", "Reactions"): the tile's button, its list (a button an
        //      item) and, on the tiles that take new cards, the "+" box all stand INSIDE the square -- nothing of the tile
        //      overflows it; the "+" box is a 36px square 12px from the square's lower right with the list clear of it; the
        //      slot is the tile's size (it is what scales); and at 150% (the hover) the tile stays inside its card's
        //      scrolling body, scaled from the corner, edge or centre its place in the group sets.
        {
            const slots = [...document.querySelectorAll(".section-tile-slot")].filter(visible);
            for (const slot of slots) {
                const tile = slot.querySelector(":scope > .section-tile");
                if (!tile) continue;
                const box = rect(slot);
                if (!rules.near(rect(tile).width, box.width, tolerance) || !rules.near(rect(tile).height, box.height, tolerance)) {
                    fail("a page tile's slot is the tile's size", slot, { slot: [box.width, box.height], tile: [rect(tile).width, rect(tile).height] });
                }
                const parts = [...slot.querySelectorAll(".section-tile-title, .section-tile-empty, .section-tile-list, .section-tile-list > li, .section-tile-link, .section-tile-plus")].filter(visible);
                for (const part of parts) {
                    const inner = rect(part);
                    // (An item of a list that scrolls may lie beyond the list: the list is what must be inside the square.)
                    if (part !== part.closest(".section-tile-list") && part.closest(".section-tile-list[data-scrolls]")) continue;
                    if (inner.left < box.left - tolerance || inner.right > box.right + tolerance || inner.top < box.top - tolerance || inner.bottom > box.bottom + tolerance) {
                        fail("the content of a tile (title, list, items, +) is inside its square, no overflow", part, { part: [inner.left, inner.top, inner.right, inner.bottom], tile: [box.left, box.top, box.right, box.bottom] });
                    }
                }
                // Every item of a list that leads somewhere is a button of its own: one line, inside the list.
                for (const item of slot.querySelectorAll(".section-tile-list > li")) {
                    const control = item.querySelector(":scope > button.section-tile-link");
                    const brokenLines = item.querySelectorAll(".section-tile-list-line").length;
                    if (control && !item.closest(".column-tiles-page") && (rect(control).height > Math.max(1, brokenLines) * 1.6 * parseFloat(getComputedStyle(control).fontSize) * 1.45 || rect(control).right > rect(item).right + tolerance)) {
                        fail("a list item's button is one line (two where a forced break is) inside its row", control, { height: rect(control).height });
                    }
                }
                const plus = slot.querySelector(":scope > .section-tile-plus");
                if (plus) {
                    const p = rect(plus);
                    if (!rules.near(p.width, 32, tolerance) || !rules.near(p.height, 32, tolerance)) {
                        fail("a tile's + box is a 32px square", plus, { width: p.width, height: p.height });
                    }
                    if (!rules.near(box.right - p.right, spec.cardPadding, tolerance + 1) || !rules.near(box.bottom - p.bottom, spec.cardPadding, tolerance + 1)) {
                        fail("a tile's + box stands at its lower right, 12px from the edges", plus, { right: box.right - p.right, bottom: box.bottom - p.bottom });
                    }
                    const list = slot.querySelector(".section-tile-list");
                    if (list && rect(list).bottom > p.top + tolerance) {
                        fail("a tile's list stays clear of its + box", plus, { list: rect(list).bottom, plus: p.top });
                    }
                    if (!/^Add [A-Z][A-Za-z]* to /.test(plus.getAttribute("aria-label") || "")) {
                        fail("a tile's + box is named 'Add <Item> to <tile>'", plus, { label: plus.getAttribute("aria-label") });
                    }
                    plusBoxChecks(plus, "a tile's + box", fail, rules);
                }
            }
            // THE HOVER (150%): the aim is taken the way the pointer does (pointerover), the scale applied by hand (a stylesheet's :hover
            // cannot be forced), the scaled rect compared with the scrolling body of the card the tile stands in, then undone.
            const scrolled = new Set();
            for (const slot of slots) {
                const body = slot.closest(".card-scroll");
                if (!body) continue;
                const keep = body.scrollTop;
                slot.scrollIntoView({ block: "nearest" });
                slot.dispatchEvent(new PointerEvent("pointerover", { bubbles: true }));
                const before = slot.style.cssText;
                slot.style.transition = "none";
                slot.style.transform = "scale(1.5)";
                const grown = rect(slot);
                const room = rect(body);
                const resting = { width: grown.width / 1.5 };
                if (!rules.near(grown.width, resting.width * 1.5, 1)) {
                    fail("a page tile grows to 150%", slot, { width: grown.width });
                }
                if (grown.left < room.left - 0.5 || grown.right > room.right + 0.5 || grown.top < room.top - 0.5 || grown.bottom > room.bottom + 0.5) {
                    fail("a page tile at 150% stays inside its card", slot, { tile: [grown.left, grown.top, grown.right, grown.bottom], card: [room.left, room.top, room.right, room.bottom], origin: slot.style.transformOrigin });
                }
                slot.style.cssText = before;
                // (The pointer leaves: the next stay is aimed afresh.)
                slot.dispatchEvent(new PointerEvent("pointerout", { bubbles: true, relatedTarget: document.body }));
                scrolled.add(body);
                void keep;
            }
            for (const body of scrolled) body.scrollTop = 0;
        }

        // 17b. THE TITLE ARROW (docs/ai/layout-rules.md, "The title arrow"): the column title is
        //      the one label of its card, the card's first row (12px of padding above it, no head
        //      row of its own, nothing in the card folds); the arrow beside it is 24px or more to
        //      hit, 8px after the title's text, centred on the title's line, its glyph the
        //      title's size (three quarters of its font size); the card's content follows the
        //      title row at 12px; an open guidance panel FLOATS (absolutely positioned under the
        //      title, the card's content width, over what is below: it moves nothing).
        {
            for (const arrow of [...document.querySelectorAll(".title-arrow")].filter(visible)) {
                const row = arrow.closest(".card-title-row");
                const heading = row && row.querySelector(".answer-column-label");
                const card = row && row.closest(".business-foundation-card");
                if (!heading || !card) {
                    fail("a title arrow stands beside a card's title", arrow, {});
                    continue;
                }
                const box = rect(arrow);
                const title = rect(heading);
                const text = document.createRange();
                text.selectNodeContents(heading);
                const ink = text.getBoundingClientRect();
                if (box.width < 24 || box.height < 24) {
                    fail("a title arrow is at least 24px to hit", arrow, { width: box.width, height: box.height });
                }
                // (After the title's text -- or after the column's "i", which follows the text at the same gap.)
                const note = row.querySelector(":scope > .info-note");
                const from = note ? note.getBoundingClientRect().right : ink.right;
                if (!rules.near(box.left - from, 8, tolerance + 1)) {
                    fail("a title arrow is 8px after its title's text (and its i)", arrow, { gap: box.left - from });
                }
                if (!rules.near((box.top + box.bottom) / 2, (title.top + title.bottom) / 2, tolerance + 1)) {
                    fail("a title arrow is centred on its title's line", arrow, { arrow: (box.top + box.bottom) / 2, title: (title.top + title.bottom) / 2 });
                }
                const glyph = getComputedStyle(arrow, "::before");
                const open = arrow.getAttribute("aria-expanded") === "true";
                // (The glyph is a wired triangle drawn as a mask over a box: its long side is that box's width open, its height closed.)
                const side = open ? parseFloat(glyph.width) : parseFloat(glyph.height);
                if (!/svg/.test(glyph.maskImage || glyph.webkitMaskImage || "")) {
                    fail("a title arrow is drawn as a wired triangle (a mask), filled under the pointer", arrow, { mask: glyph.maskImage });
                }
                const wanted = parseFloat(getComputedStyle(heading).fontSize) * 0.75;
                if (!rules.near(side, wanted, 1.5)) {
                    fail("a title arrow's glyph is the title's size", arrow, { glyph: side, wanted });
                }
                // Title row: the card's padding (and border) above it; the content 12px under it.
                const edge = rect(card);
                const border = parseFloat(getComputedStyle(card).borderTopWidth) || 1;
                if (!rules.near(rect(row).top - edge.top, spec.cardPadding + border, tolerance + 0.5)) {
                    fail("a card's title is its first row, one card padding from its top", card, { gap: rect(row).top - edge.top });
                }
                const block = row.parentElement;
                const next = block.nextElementSibling;
                // (A card whose body scrolls on its own keeps 6px of padding inside the clip, for the
                // tiles' glow: the content starts 12px under the title all the same.)
                const nextInset = next ? parseFloat(getComputedStyle(next).paddingTop) || 0 : 0;
                if (next && visible(next) && !rules.near(rect(next).top + nextInset - rect(row).bottom, spec.fieldGap, tolerance + 0.5)) {
                    fail("a card's content is 12px under its title", card, { gap: rect(next).top + nextInset - rect(row).bottom });
                }
                const help = document.getElementById(arrow.getAttribute("aria-controls"));
                if (help && visible(help)) {
                    const panel = rect(help);
                    const holder = rect(block);
                    if (getComputedStyle(help).position !== "absolute") {
                        fail("an open guidance floats over the card (absolutely positioned)", help, { position: getComputedStyle(help).position });
                    }
                    if (!rules.near(panel.left, holder.left, tolerance) || !rules.near(panel.right, holder.right, tolerance)) {
                        fail("an open guidance is the card content's width", help, { panel: [panel.left, panel.right], card: [holder.left, holder.right] });
                    }
                    if (!rules.near(panel.top - rect(row).bottom, spec.labelGap, tolerance + 0.5)) {
                        fail("an open guidance hangs 6px under its title", help, { gap: panel.top - rect(row).bottom });
                    }
                    if (!rules.near(holder.height, rect(row).height, tolerance)) {
                        fail("an open guidance takes no room (the title block keeps its height)", help, { block: holder.height, row: rect(row).height });
                    }
                }
            }
            // Side by side (tops level; stacked under 1100px there is nothing to line up), the two
            // cards' first tile rows start at one y; and a card has no head row of its own.
            const cardsOnPage = [...document.querySelectorAll(".answer-columns.business-capability > .business-foundation-card:not(.section-tile-dialog)")].filter(visible);
            const sideBySide = cardsOnPage.length > 1 && Math.abs(rect(cardsOnPage[0]).top - rect(cardsOnPage[1]).top) <= tolerance;
            const firsts = sideBySide
                ? cardsOnPage.map(card => card.querySelector(".section-tile")).filter(Boolean).map(tile => rect(tile).top)
                : [];
            if (firsts.length > 1 && Math.max(...firsts) - Math.min(...firsts) > tolerance) {
                fail("the first tile rows of the two cards start at one y", document.querySelector(".business-capability"), { tops: firsts });
            }
            const head = document.querySelector(".answer-columns.business-capability .business-capability-card-head");
            if (head) {
                fail("the cards of Infrastructure & Capability have no head of their own", head, {});
            }
        }

        // 17d. THE WORKSPACE FORM (docs/ai/layout-rules.md, "The Workspace dialog"): one CARD (the shared
        //      glass ground, 12px padding, 560px wide at most) centred in its dialog and at its top, holding
        //      one form on two columns: a label column as wide as the widest label (no more than 2px
        //      over) and the control column 12px after it; every label at one x, every control at one x,
        //      rows 12px apart (a wrapped label 6px); the pickers HUG their longest option and stand at the
        //      control column's left; the Deposit is a row like the others (tick and label in the label
        //      column, amount and currency on its line in the control column).
        {
            for (const form of [...document.querySelectorAll(".workspace-form")].filter(visible)) {
                const card = form.closest(".workspace-card");
                if (!card) {
                    fail("the workspace form is inside a card", form, {});
                    continue;
                }
                const box = rect(card);
                const holder = card.parentElement ? rect(card.parentElement) : box;
                if (box.width > 560 + tolerance) {
                    fail("the workspace card is 560px wide at most", card, { width: box.width });
                }
                if (!rules.near((box.left + box.right) / 2, (holder.left + holder.right) / 2, tolerance + 0.5)) {
                    fail("the workspace card is centred in its dialog", card, { card: (box.left + box.right) / 2, holder: (holder.left + holder.right) / 2 });
                }
                if (!rules.near(rect(form).left - box.left, spec.cardPadding + 1, 1.5) || !rules.near(box.right - rect(form).right, spec.cardPadding + 1, 1.5)) {
                    fail("the workspace form is a card padding (12px) in from its card", card, { left: rect(form).left - box.left, right: box.right - rect(form).right });
                }
                const fields = [...form.children].filter(visible);
                const controlsAt = [];
                const labelsAt = [];
                const naturals = [];
                const rights = [];
                let previous = null;
                let labelWidth = 0;
                for (const field of fields) {
                    const label = field.children[0];
                    const control = field.children[1];
                    if (label) {
                        labelsAt.push(Math.round(rect(label).left * 2) / 2);
                        labelWidth = Math.max(labelWidth, rect(label).width);
                        const range = document.createRange();
                        range.selectNodeContents(label);
                        naturals.push(range.getBoundingClientRect().width);
                    }
                    if (control) controlsAt.push(Math.round(rect(control).left * 2) / 2);
                    if (previous && !rules.near(rect(field).top - rect(previous).bottom, spec.fieldGap, tolerance + 0.5)) {
                        fail("the workspace form's rows are 12px apart", field, { gap: rect(field).top - rect(previous).bottom });
                    }
                    if (label && control && !rules.near(rect(control).left - rect(label).right, spec.fieldGap, tolerance + 0.5)) {
                        fail("a workspace label is 12px before its control", field, { gap: rect(control).left - rect(label).right });
                    }
                    if (control) {
                        const picker = control.matches(".option-picker") ? control : null;
                        if (picker) {
                            if (!["fill", "fit"].includes(picker.getAttribute("data-size"))) {
                                fail("a workspace picker fills the control column (the widest of them sets it)", picker, { size: picker.getAttribute("data-size") });
                            }
                            rights.push(Math.round(rect(picker).right * 2) / 2);
                        }
                        // The price row (price box, 8px, currency picker) ends where the pickers do.
                        const price = control.matches(".business-capability-price") ? control : null;
                        if (price) {
                            rights.push(Math.round(rect(price).right * 2) / 2);
                            const parts = [...price.children].filter(visible);
                            if (parts.length === 2 && !rules.near(rect(parts[1]).left - rect(parts[0]).right, 8, tolerance + 0.5)) {
                                fail("the price box and its currency are 8px apart", price, { gap: rect(parts[1]).left - rect(parts[0]).right });
                            }
                        }
                        // Deposit: tick and label in the label column, amount and currency on its line; the row is the
                        // control's 45px high ticked or not, so it never moves when clicked.
                        if (field.matches(".optional-field")) {
                            if (!rules.near(rect(field).height, spec.controlHeight, 1)) {
                                fail("the Deposit row is 45px high, ticked or not", field, { height: rect(field).height });
                            }
                            const tick = field.querySelector("input[type=checkbox]");
                            if (tick && !rules.near(rect(tick).left, rect(label).left, tolerance + 1)) {
                                fail("the Deposit's tick stands at the label column's left edge", tick, { tick: rect(tick).left, column: rect(label).left });
                            }
                            const line = [...control.querySelectorAll("input:not([type=checkbox]), .business-capability-deposit-currency")].filter(visible);
                            const centre = (rect(label).top + rect(label).bottom) / 2;
                            for (const part of line) {
                                if (!rules.near((rect(part).top + rect(part).bottom) / 2, centre, 3)) {
                                    fail("the Deposit's amount and currency stand on its label's line", part, { part: (rect(part).top + rect(part).bottom) / 2, label: centre });
                                }
                            }
                        }
                    }
                    previous = field;
                }
                if (rules.distinct(controlsAt).length > 1) {
                    fail("every control of the workspace form starts at one x", form, { x: rules.distinct(controlsAt) });
                }
                if (rules.distinct(rights).length > 1) {
                    fail("every picker and the price row of the workspace form end at one x", form, { x: rules.distinct(rights) });
                }
                if (rules.distinct(labelsAt).length > 1) {
                    fail("every label of the workspace form starts at one x", form, { x: rules.distinct(labelsAt) });
                }
                if (naturals.length > 0 && labelWidth - Math.max(...naturals) > 2 + tolerance) {
                    fail("the workspace label column is as wide as its widest label (and no wider)", form, { column: labelWidth, widest: Math.max(...naturals) });
                }
            }
        }

        // 17e. A FOUNDER'S CARD (the Founders' dialog; layout-rules 5a "A founder's card: one left edge"):
        //      ONE left text edge -- the content edge (card border + 12px padding + the inset + the 26.3px marker column).
        //      The name, the roles' TEXT, the labels, the cells (inputs, pickers), the share line, the
        //      Responsibilities label, the list items' TEXT and "Completed N" all start there; the bullets and
        //      numbers (the head's "1.", the roles' bullets, the list numbers) and the fold arrows hang in
        //      the marker column, at the card's padding edge, to the left of it. The pairs are two equal
        //      columns 12px apart; wrapped list lines align under their first line's text; lists have line
        //      height 1.45 and 6px between items.
        {
            const textLeft = (element) => {
                const range = document.createRange();
                range.selectNodeContents(element);
                return range.getBoundingClientRect().left;
            };
            for (const card of [...document.querySelectorAll(".business-founder-open")].filter(visible)) {
                const style = getComputedStyle(card);
                const marker = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--founder-marker")) || 26.3;
                const content = rect(card).left + (parseFloat(style.borderLeftWidth) || 0) + (parseFloat(style.paddingLeft) || 0);
                const hang = content - marker;
                const edgeOk = (value, wanted) => rules.near(value, wanted, tolerance + 0.75);
                if ([...card.querySelectorAll(".field-label")].some(label => /^Roles/.test(label.textContent.trim()))) {
                    fail("a founder's card has no Roles label", card, {});
                }
                for (const roleText of card.querySelectorAll(".bullet-list-static-text")) {
                    if (!edgeOk(textLeft(roleText), content)) {
                        fail("a founder's roles (text) start at the card's content edge", roleText, { left: textLeft(roleText), edge: content });
                    }
                }
                for (const bullet of card.querySelectorAll(".bullet-list-static > li")) {
                    if (!edgeOk(rect(bullet).left, hang)) {
                        fail("a founder's bullets hang in the marker column", bullet, { left: rect(bullet).left, marker: hang });
                    }
                }
                const number = card.querySelector(":scope > .strategy-box-head .list-number");
                const name = card.querySelector(":scope > .strategy-box-head .strategy-name-static, :scope > .strategy-box-head textarea");
                if (number && !edgeOk(textLeft(number), hang)) {
                    fail("a founder's head number hangs in the marker column", number, { left: textLeft(number), marker: hang });
                }
                if (name && !edgeOk(name.matches("textarea") ? rect(name).left : textLeft(name), content)) {
                    fail("a founder's name starts at the card's content edge", name, { left: textLeft(name), edge: content });
                }
                // THE HEAD: the number and the name are on one line -- the same vertical centre and the same baseline --
                // and the number ends 8px before the name (a single-digit number in tabular figures).
                if (number && name && !name.matches("textarea")) {
                    const range = (element) => { const r = document.createRange(); r.selectNodeContents(element); return r.getBoundingClientRect(); };
                    const baseline = (element) => {
                        const probe = document.createElement("span");
                        probe.style.cssText = "display:inline-block;width:0;height:0;vertical-align:baseline";
                        element.appendChild(probe);
                        const y = probe.getBoundingClientRect().bottom;
                        probe.remove();
                        return y;
                    };
                    const one = range(number);
                    const other = range(name);
                    if (!rules.near((one.top + one.bottom) / 2, (other.top + other.bottom) / 2, 0.75)) {
                        fail("a founder's head number and name share a vertical centre", number, { number: (one.top + one.bottom) / 2, name: (other.top + other.bottom) / 2 });
                    }
                    if (!rules.near(baseline(number), baseline(name), 0.75)) {
                        fail("a founder's head number and name share a baseline", number, { number: baseline(number), name: baseline(name) });
                    }
                    if (/^\d\.$/.test(number.textContent.trim()) && !rules.near(other.left - one.right, 8, 0.75)) {
                        fail("a founder's head number ends 8px before the name", number, { gap: other.left - one.right });
                    }
                }
                for (const label of card.querySelectorAll(".business-founder-share, .business-capability-responsibilities-head .business-foundation-label")) {
                    if (visible(label) && !edgeOk(textLeft(label), content)) {
                        fail("a founder's text starts at the card's content edge", label, { left: textLeft(label), edge: content });
                    }
                }
                // THE FOUR CELLS (Salary, Frequency, Working Hrs, Delivery Hrs): one size (--founder-cell wide, 45px high),
                // two columns side by side 12px apart at the LEFT -- the first at the content edge; each label over its cell,
                // left-aligned to it: Salary and Frequency on one line, Working Hrs and Delivery Hrs on TWO; every label inside
                // the card; the labels of a row never touch.
                const grid = card.querySelector(".business-founder-grid");
                if (grid) {
                    const cellW = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--founder-cell")) || 108;
                    const fields = [...grid.children].filter(visible);
                    const controls = fields.map(field => field.querySelector("input, .option-picker")).filter(Boolean);
                    for (const control of controls) {
                        const box = rect(control);
                        if (!rules.near(box.width, cellW, tolerance + 0.5) || !rules.near(box.height, spec.controlHeight, 1)) {
                            fail("a founder's four cells are one size (the Frequency picker's longest option) and 45px high", control, { width: box.width, height: box.height, cell: cellW });
                        }
                    }
                    const left = controls.filter((control, at) => at % 2 === 0);
                    const right = controls.filter((control, at) => at % 2 === 1);
                    for (const control of left) {
                        if (!edgeOk(rect(control).left, content)) {
                            fail("a founder's left cells start at the card's content edge", control, { left: rect(control).left, edge: content });
                        }
                    }
                    for (const control of right) {
                        if (left.length > 0 && !rules.near(rect(control).left - rect(left[0]).right, spec.fieldGap, tolerance + 0.5)) {
                            fail("a founder's two columns of cells are 12px apart (the right one moved to the left)", control, { gap: rect(control).left - rect(left[0]).right });
                        }
                    }
                    fields.forEach((field, at) => {
                        const label = field.firstElementChild;
                        const control = field.querySelector("input, .option-picker");
                        if (!label || !control) return;
                        // (Lines by height: the "i" button is taller than a line of text.)
                        const lines = rect(label).height > 36 ? 2 : 1;
                        const wanted = at >= 2 && at < 4 ? 2 : 1;
                        if (lines !== wanted) {
                            fail("a founder's Working Hrs and Delivery Hrs labels are two lines, Salary and Frequency one", label, { lines, wanted, at });
                        }
                        const box = rect(label);
                        const cell = rect(control);
                        if (!edgeOk(box.left, cell.left)) {
                            fail("a founder's label is left-aligned to its cell", label, { label: box.left, cell: cell.left });
                        }
                        if (box.left < rect(card).left || box.right > rect(card).right - (parseFloat(style.borderRightWidth) || 0)) {
                            fail("a founder's label stays inside the card", label, { label: [box.left, box.right] });
                        }
                    });
                    for (let at = 0; at + 1 < fields.length; at += 2) {
                        const one = fields[at].firstElementChild;
                        const other = fields[at + 1].firstElementChild;
                        if (one && other && Math.abs(rect(one).top - rect(other).top) < 8 && rect(other).left < rect(one).right - 0.5) {
                            fail("a founder's two labels of a row never touch", one, { first: rect(one).right, second: rect(other).left });
                        }
                    }
                }
                const list = card.querySelector(".business-capability-responsibilities-head ~ div .numbered-list-static");
                if (list) {
                    const items = [...list.querySelectorAll(":scope > li")].filter(visible);
                    // (A two-digit number is wider than the marker column: the column grows and the text follows it, by that much.)
                    const numberColumn = parseFloat(getComputedStyle(list).gridTemplateColumns.split(" ")[0]) || marker;
                    const textEdge = content + Math.max(0, numberColumn - marker);
                    for (const item of items) {
                        const text = item.querySelector(".numbered-list-static-text");
                        if (!edgeOk(rect(item).left, hang)) {
                            fail("a founder's Responsibilities numbers hang in the marker column", item, { left: rect(item).left, marker: hang });
                        }
                        if (text && !edgeOk(textLeft(text), textEdge)) {
                            fail("a founder's Responsibilities text starts at the card's content edge (further right only by a two-digit number)", item, { left: textLeft(text), edge: textEdge });
                        }
                        const lh = parseFloat(getComputedStyle(item).lineHeight) / parseFloat(getComputedStyle(item).fontSize);
                        if (!(lh >= 1.4)) {
                            fail("a founder's list lines have the roomy line height (1.45)", item, { lineHeight: lh });
                        }
                    }
                    for (let at = 1; at < items.length; at++) {
                        const gap = rect(items[at]).top - rect(items[at - 1]).bottom;
                        if (!rules.near(gap, 6, tolerance + 0.5)) {
                            fail("a founder's list items are 6px apart", items[at], { gap });
                        }
                    }
                }
                const roles = [...card.querySelectorAll(".bullet-list-static > li")].filter(visible);
                for (let at = 1; at < roles.length; at++) {
                    const gap = rect(roles[at]).top - rect(roles[at - 1]).bottom;
                    if (!rules.near(gap, 6, tolerance + 0.5)) {
                        fail("a founder's roles are 6px apart", roles[at], { gap });
                    }
                }
                // THE TWO FOLD ARROWS (Responsibilities, Completed) are the STANDARD arrow, one component: the same size
                // (36px, the app's default) and the same reaction (the same classes, so the same hover and focus rules); the
                // GLYPHS (not their boxes) start at the markers' x, as the head number and the bullets do.
                const arrow = card.querySelector(".business-capability-responsibilities-head:not(.business-capability-completed-head) > .strategy-box-toggle");
                const completed = card.querySelector(".business-capability-completed-head > .strategy-box-toggle");
                // (The box does not move when toggled, so the glyph turns about its centre: the closed glyph's left edge is the markers' x, the
                // open one's 3.5px further left.)
                const glyphLeft = (button) => {
                    const closed = button.getAttribute("aria-expanded") !== "true";
                    const glyph = getComputedStyle(button, "::before");
                    const width = closed ? 11 : parseFloat(glyph.width);
                    return rect(button).left + (rect(button).width - width) / 2 + (closed ? 0 : 3.5);
                };
                for (const button of [arrow, completed]) {
                    if (!button) continue;
                    if (!rules.near(rect(button).width, 36, 0.5) || !rules.near(rect(button).height, 36, 0.5)) {
                        fail("a founder's fold arrow keeps the standard 36px size", button, { width: rect(button).width, height: rect(button).height });
                    }
                    if (!edgeOk(glyphLeft(button), hang)) {
                        fail("a founder's fold arrow starts at the markers' x (numbers, bullets)", button, { glyph: glyphLeft(button), marker: hang });
                    }
                    // (Its focus ring, 4px of glow, stays inside the card.)
                    if (rect(button).left - 4 < rect(card).left - 0.5) {
                        fail("a founder's fold arrow keeps its focus ring inside the card", button, { left: rect(button).left, card: rect(card).left });
                    }
                }
                if (arrow && completed) {
                    const one = getComputedStyle(arrow);
                    const other = getComputedStyle(completed);
                    if (arrow.className !== completed.className.replace(/\s+/g, " ") && arrow.className.split(" ")[0] !== completed.className.split(" ")[0]) {
                        fail("a founder's two fold arrows are the same control", completed, { arrow: arrow.className, completed: completed.className });
                    }
                    if (one.borderRadius !== other.borderRadius || one.backgroundColor !== other.backgroundColor) {
                        fail("a founder's two fold arrows are drawn alike", completed, { arrow: [one.borderRadius, one.backgroundColor], completed: [other.borderRadius, other.backgroundColor] });
                    }
                }
                const completedLabel = card.querySelector(".business-capability-completed-head .business-foundation-label");
                if (completedLabel && !edgeOk(textLeft(completedLabel), content)) {
                    fail("a founder's Completed label starts at the card's content edge", completedLabel, { left: textLeft(completedLabel), edge: content });
                }
            }
        }

        // 17e2. THE HEADER STANDS ABOVE THE LAYERS (docs/ai/layout-rules.md, "The header over the layers"): with a dialog or floating card open the app header
        //       is not inert, not covered (the element at its centre is the header's own) and not dimmed.
        {
            const header = document.querySelector(".app-header");
            if (header && document.querySelector(".section-tile-overlay")) {
                const box = header.getBoundingClientRect();
                const at = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2);
                if (header.closest("[inert]")) {
                    fail("the header is never inert", header, {});
                }
                if (!at || !header.contains(at)) {
                    fail("the header is never covered by a layer", header, { covering: at && (at.className || at.tagName) });
                }
            }
        }

        // 17f. THE CONTENT OF A DIALOG IS CENTRED, AT THE TOP (docs/ai/layout-rules.md, "Section tiles and
        //      dialog"): the block of a dialog's content -- a grid of tiles or boxes (its boxes left-aligned
        //      inside the block), the open card, the workspace card, a founder's cards, an empty message --
        //      is centred across the dialog's body (the same room left and right) and starts at the top,
        //      not in the middle of the body's height.
        {
            for (const dialog of [...document.querySelectorAll(".section-tile-dialog")].filter(visible)) {
                const body = dialog.querySelector(".section-tile-dialog-body");
                if (!body) continue;
                const inner = rect(body);
                const left = inner.left + 6;
                const right = inner.right - 6;
                const scrolls = body.scrollHeight > body.clientHeight + 1;
                const blocks = [
                    ...dialog.querySelectorAll(".card-tile-grid, .section-tiles-boxes, .workspace-card, .card-box-open, .founder-row, .section-tile-dialog-body > div > .business-foundation-empty")
                ].filter(visible);
                for (const block of blocks) {
                    // The grids: their tracks (the boxes), not the container the grid fills.
                    const parts = block.matches(".card-tile-grid, .section-tiles-boxes")
                        ? [...block.querySelectorAll(":scope > .section-tile, :scope > .card-tile-slot > .section-tile")].filter(visible)
                        : block.matches(".founder-row") ? [...block.children].filter(visible) : [block];
                    if (parts.length === 0) continue;
                    let first = Math.min(...parts.map(part => rect(part).left));
                    let last = Math.max(...parts.map(part => rect(part).right));
                    if (block.matches(".card-tile-grid, .section-tiles-boxes")) {
                        const columns = getComputedStyle(block).gridTemplateColumns.split(" ").length;
                        const side = rect(parts[0]).width;
                        last = first + columns * side + (columns - 1) * spec.fieldGap;
                    }
                    // (A grid of card tiles stands from the left, as the page's tiles do: it is not centred.)
                    if (!block.matches(".card-tile-grid") && Math.abs((first - left) - (right - last)) > 3) {
                        fail("the content of a dialog is centred across it", block, { left: first - left, right: right - last });
                    }
                    const topGap = Math.min(...parts.map(part => rect(part).top)) - inner.top;
                    if (!scrolls && topGap > 120) {
                        fail("the content of a dialog starts at its top (not in the middle)", block, { fromTop: topGap, body: inner.height });
                    }
                }
            }
        }

        // 17g. TITLE SIZES OF PAGE 3 (docs/ai/layout-rules.md, "Title sizes"): the type scale only, and a
        //      hierarchy -- page title 36, column title 28, dialog title and section heading 24, tile and
        //      box titles, subcategory headings and card names 18 (14 in a card box under 120px).
        {
            const scale = name => parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || null;
            const size = element => parseFloat(getComputedStyle(element).fontSize);
            const h1 = scale("--font-h1") || 36;
            const h2 = scale("--font-h2") || 28;
            const h3 = scale("--font-h3") || 24;
            const body = scale("--font-body") || 18;
            const expect = (elements, wanted, what) => {
                for (const element of elements.filter(visible)) {
                    if (!rules.near(size(element), wanted, 0.5)) {
                        fail(what, element, { size: size(element), wanted });
                    }
                }
            };
            expect([...document.querySelectorAll(".interview-header h1")], h1, "the page title is the h1 size (36)");
            expect([...document.querySelectorAll(".business-capability > .business-foundation-card:not(.section-tile-dialog) .answer-column-label")], h2, "a column title is the h2 size (28)");
            expect([...document.querySelectorAll(".business-capability-tiles-section > .business-engagement-section-head .field-group-title")].filter(title => !title.closest(".column-tiles-page")), h3, "a section heading is the h3 size (24)");
            expect([...document.querySelectorAll(".section-tile-dialog-body > div > .business-engagement-section-head .field-group-title")], h3, "a dialog title is the h3 size (24), never smaller than the tile that opened it");
            expect([...document.querySelectorAll(".section-tile:not(.card-tile):not([data-title-small]) .section-tile-title:not(.card-box-add-words)")].filter(title => !title.closest(".section-tile-add, .section-tile-diagram, .section-tiles-completed[data-squeezed]")), body, "a tile or box title is the body size (18)");
            expect([...document.querySelectorAll(".section-tile[data-title-small] .section-tile-title")], scale("--font-small") || 14, "a title too long for its room is the small size (14), that title only");
            expect([...document.querySelectorAll(".section-tile-list > li, .section-tile-sub")].filter(item => !item.closest(".section-tiles-quad[data-large]")), scale("--font-small") || 14, "a tile's list and a box's one small line are the small size (14)");
            expect([...document.querySelectorAll(".section-tile-empty, .section-tile-add-plus")], h3, "the + of an empty section and of an add box is the h3 size (24)");
            expect([...document.querySelectorAll(".card-box-add-words")], scale("--font-small") || 14, "an add box's words are the small size (14)");
            expect([...document.querySelectorAll(".section-tile-dialog .business-capability-subhead")], body, "a subcategory heading is the body size (18)");
            expect([...document.querySelectorAll(".section-tile-dialog textarea.card-name-input")], body, "a card's name is the body size (18)");
            const columnTitle = document.querySelector(".business-capability > .business-foundation-card:not(.section-tile-dialog) .answer-column-label");
            const sectionHeading = document.querySelector(".business-capability-tiles-section > .business-engagement-section-head .field-group-title");
            const tileTitle = document.querySelector(".section-tile:not(.card-tile) .section-tile-title");
            if (columnTitle && sectionHeading && !(size(columnTitle) > size(sectionHeading))) {
                fail("the column title is larger than a section heading", columnTitle, { column: size(columnTitle), section: size(sectionHeading) });
            }
            if (sectionHeading && tileTitle && !(size(sectionHeading) > size(tileTitle))) {
                fail("a section heading is larger than a tile title", sectionHeading, { section: size(sectionHeading), tile: size(tileTitle) });
            }
        }

        // 17h. THE DIALOG HEADER (docs/ai/layout-rules.md, "The dialog header"): the views opened in a dialog follow the title
        //      on the SAME line, after a slash (8px either side), the names regular and muted; one line high; a fixed
        //      subcategory has no head row of its own (an Other one keeps its name box).
        {
            for (const heading of [...document.querySelectorAll(".section-tile-dialog .dialog-heading")].filter(visible)) {
                const line = heading.querySelector(".dialog-heading-line");
                const title = heading.querySelector(".dialog-heading-title");
                if (!line || !title) continue;
                if (rect(line).height > 1.6 * parseFloat(getComputedStyle(title).fontSize) * 1.3) {
                    fail("a dialog's header is one line (the views follow the title after a slash)", heading, { height: rect(line).height });
                }
                for (const slash of heading.querySelectorAll(".dialog-heading-slash")) {
                    const before = slash.previousElementSibling;
                    const after = slash.nextElementSibling;
                    // (The trail of views is set closer, 6px, so a long trail fits; the root title's slash is 8px.)
                    const gap = slash.closest(".dialog-heading-trail") ? 6 : 8;
                    if (before && !rules.near(rect(slash).left - rect(before).right, gap, tolerance + 0.5)) {
                        fail("a header's slash is " + gap + "px after the name before it", slash, { gap: rect(slash).left - rect(before).right });
                    }
                    if (after && !rules.near(rect(after).left - rect(slash).right, gap, tolerance + 0.5)) {
                        fail("a header's slash is " + gap + "px before the name after it", slash, { gap: rect(after).left - rect(slash).right });
                    }
                }
                for (const sub of heading.querySelectorAll(".dialog-heading-sub")) {
                    if (parseInt(getComputedStyle(sub).fontWeight, 10) > 500) {
                        fail("a header's sub-view name is regular weight", sub, { weight: getComputedStyle(sub).fontWeight });
                    }
                    // (The names after the title are the body size, a size under the root title's: section-tiles.css .dialog-heading-sub.)
                    const bodySize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--font-body")) || 18;
                    if (!rules.near(parseFloat(getComputedStyle(sub).fontSize), bodySize, 0.5)) {
                        fail("a header's sub-view name is the body size (18)", sub, { size: getComputedStyle(sub).fontSize });
                    }
                }
            }
            for (const head of [...document.querySelectorAll(".section-tile-dialog .business-capability-subsection-head")].filter(visible)) {
                if (!head.querySelector("input.business-capability-subsection-name")) {
                    fail("only an added subsection has a head row of its own (a fixed one is named in the header)", head, {});
                }
            }
        }

        // 17i. THE OPENED CARD (docs/ai/layout-rules.md, "The opened card"): 480px at most; nothing stretched -- a currency hugging its code, a
        //      picker hugging its longest option (never across the card); the COST ROW ([Qty] [Price] [currency] ... [Frequency]): the Qty as wide as
        //      its label's column (56px), 12px between Qty, Price and currency, the currency's left edge the side pickers' (Status's, Responsible's),
        //      the Frequency's right edge the name cell's.
        {
            for (const card of [...document.querySelectorAll(".card-box-open > *")].filter(visible)) {
                const box = rect(card);
                const holder = rect(card.parentElement);
                if (box.width > (parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--open-card-width")) || 480) + tolerance) {
                    fail("an opened card is 480px wide at most", card, { width: box.width });
                }
                const content = box.width - 2 * (spec.cardPadding + 1);
                for (const input of card.querySelectorAll("input.interview-input:not([type=checkbox])")) {
                    if (!visible(input)) continue;
                    const label = (input.getAttribute("aria-label") || "").toLowerCase();
                    const width = rect(input).width;
                    if (/ quantity$/.test(label)) {
                        const column = input.closest(".business-foundation-field");
                        if (!rules.near(width, 56, tolerance + 0.5) || (column && !rules.near(width, rect(column).width, tolerance + 0.5))) {
                            fail("a card's Qty is as wide as its label's column (56px)", input, { width, column: column ? rect(column).width : null });
                        }
                        if (column && column.querySelector(".field-label") && column.querySelector(".field-label").textContent.trim() !== "Qty") {
                            fail("a Resource's Qty field is labelled Qty", input, { label: column.querySelector(".field-label").textContent });
                        }
                    }
                }
                for (const picker of card.querySelectorAll(".option-picker")) {
                    if (!visible(picker)) continue;
                    if (picker.getAttribute("data-size") === "full" || (picker.getAttribute("data-size") !== "hug" && rect(picker).width > 0.9 * content)) {
                        fail("a picker in an opened card is not stretched across it", picker, { width: rect(picker).width, size: picker.getAttribute("data-size") });
                    }
                }
                const row = card.querySelector(".business-capability-cost-row");
                if (row && visible(row)) {
                    const name = card.querySelector("textarea.card-name-input") || card.querySelector(".strategy-box-head > .strategy-name-static");
                    const price = row.querySelector("input[aria-label$=' price']");
                    const qty = row.querySelector("input[aria-label$=' quantity']");
                    const currency = row.querySelector(".business-capability-cost-currency .option-picker-trigger");
                    const frequency = [...row.querySelectorAll(".option-picker-trigger")].filter(trigger => /payment frequency/.test(trigger.getAttribute("aria-label") || "")).pop();
                    // The side pickers (Status's, Responsible's) of the card: where the currency's left edge stands.
                    const side = card.querySelector(".business-field-side .option-picker-trigger, .business-field-side .business-capability-automatic");
                    const stacked = frequency && rect(frequency).top > rect(price).bottom + 4;
                    if (name && frequency && !stacked && !rules.near(rect(frequency).right, rect(name).right, tolerance + 0.75)) {
                        fail("the Frequency's right edge is the name cell's", frequency, { frequency: rect(frequency).right, name: rect(name).right });
                    }
                    if (side && currency && !rules.near(rect(currency).left, rect(side).left, tolerance + 0.75)) {
                        fail("the currency's left edge is the side pickers' (Status's, Responsible's)", currency, { currency: rect(currency).left, side: rect(side).left });
                    }
                    if (price && currency && !rules.near(rect(currency).left - rect(price).right, spec.fieldGap, tolerance + 0.75)) {
                        fail("the Price ends 12px before the currency", price, { gap: rect(currency).left - rect(price).right });
                    }
                    if (qty && price && !rules.near(rect(price).left - rect(qty).right, spec.fieldGap, tolerance + 0.75)) {
                        fail("the Price starts 12px after the Qty", price, { gap: rect(price).left - rect(qty).right });
                    }
                    if (name && price && !qty && !rules.near(rect(price).left, rect(name).left, tolerance + 0.75)) {
                        fail("the Price starts at the name cell's left edge", price, { price: rect(price).left, name: rect(name).left });
                    }
                }
                if (!rules.near((box.left + box.right) / 2, (holder.left + holder.right) / 2, tolerance + 1)) {
                    fail("an opened card is centred in its dialog", card, { card: (box.left + box.right) / 2, holder: (holder.left + holder.right) / 2 });
                }
            }
        }

        // 17c. PAGE 3 SCROLLS IN ITS CARDS (docs/ai/layout-rules.md, "Section tiles and dialog"): with the
        //      two cards side by side (a window from 1212px wide, 560px high) the PAGE does not scroll
        //      and its heading, the footer and each card's title row stay put; each card's body
        //      (.card-scroll) scrolls on its own below the title row (its clip edge is under the
        //      title block, nothing shows behind or over the title), the card standing between
        //      the heading's underline (12px under it) and the footer (12px above it). Offering's
        //      Capability needs no bar in a window 900px high or more. Not in a dialog.
        {
            const cards = [...document.querySelectorAll(".business-capability > .business-foundation-card:not(.section-tile-dialog)")].filter(visible);
            const bodies = cards.map(card => card.querySelector(":scope > .card-scroll")).filter(Boolean);
            const fixed = bodies.length > 1 && window.innerWidth >= 1212 && window.innerHeight >= 560 &&
                Math.abs(rect(cards[0]).top - rect(cards[1]).top) <= tolerance;
            if (fixed) {
                const underline = document.querySelector(".interview-divider");
                const footer = document.querySelector(".workspace-footer");
                const root = document.documentElement;
                // (Page 3 GROWS DOWN where its tiles do not fit: the page scrolls and no card scrolls inside -- no rule keeps it to the window.)
                cards.forEach((card, at) => {
                    const body = bodies[at];
                    const block = card.querySelector(":scope > .card-title-block");
                    const style = getComputedStyle(body);
                    if (style.overflowY !== "visible") {
                        fail("a card's body does not scroll on its own (a card grows down)", card, { overflowY: style.overflowY });
                    }
                    if (block && rect(body).top < rect(block).bottom - tolerance) {
                        fail("a card's scrolling body starts under its title row (nothing behind the title)", card, { body: rect(body).top, title: rect(block).bottom });
                    }
                    if (underline && !rules.near(rect(card).top - underline.getBoundingClientRect().bottom, spec.fieldGap, tolerance + 0.5)) {
                        fail("a card starts 12px under the page heading's underline", card, { gap: rect(card).top - underline.getBoundingClientRect().bottom });
                    }
                    if (footer && rect(card).bottom > footer.getBoundingClientRect().top - spec.fieldGap + tolerance + 0.5) {
                        fail("a card ends 12px above the footer at the lowest", card, { bottom: rect(card).bottom, footer: footer.getBoundingClientRect().top });
                    }
                    // (While they are two rows: with six tiles the grey Completed tile makes a third row, and the body scrolls to it.)
                    const rowsOfTiles = new Set([...body.querySelectorAll(".section-tile-slot")].map(slot => slot.getAttribute("data-row"))).size;
                    if (at === 1 && !document.querySelector(".section-tiles-completed") && rowsOfTiles <= 2 && window.innerHeight >= 900 && body.scrollHeight > body.clientHeight + 1) {
                        fail("Offering's Capability shows all its tiles without a bar in a window 900px high or more (two rows of tiles)", card, { scrollHeight: body.scrollHeight, clientHeight: body.clientHeight });
                    }
                });
            }
        }

        // 18. THE ACTIVITY CARD (docs/ai/layout-rules.md, 5a "The Activity card"): the Performer's label and its dropdown on one line, 12px apart, the dropdown
        //     running to the right edge of the name cell above it; the "+" (first row) or the x (the rows after) in the x's column, the x's size
        //     (32px), centred on the dropdown; the Responsible's dropdown at the Performer's x; Completed's tick at the other ticks' x; a child
        //     has no name cell and no x; a finished activity is frozen but for its Completed tick.
        for (const card of [...document.querySelectorAll(".business-capability-activity")].filter(visible)) {
            const name = card.querySelector("textarea.card-name-input") || card.querySelector(".business-capability-child-name");
            const head = card.querySelector(".business-capability-activity-head");
            const remove = head && head.querySelector(".strategy-box-remove");
            const rows = [...card.querySelectorAll(".business-capability-performer:not(.business-capability-resource-row)")].filter(visible);
            const label = card.querySelector(".business-capability-performer-field > .business-foundation-label");
            if (name && rows.length > 0) {
                const picker = rows[0].querySelector(".option-picker");
                // (Where a performer is a partner or a supplier, the row holds the link symbol's place, 8px after the dropdown: the dropdown ends that much earlier, in every row.)
                const linkPlace = rows.map(row => row.querySelector(":scope > .business-link-symbol, :scope > .business-capability-row-spacer")).find(Boolean);
                const wanted = rect(name).right - (linkPlace ? rect(linkPlace).width + 8 : 0);
                if (picker && !rules.near(rect(picker).right, wanted, tolerance + 0.5)) {
                    fail("the Performer's dropdown ends where the name cell ends", picker, { picker: rect(picker).right, name: wanted });
                }
                if (picker && label && !rules.near(rect(picker).left - rect(label).right, spec.fieldGap, tolerance + 0.5)) {
                    fail("the Performer's label and dropdown are 12px apart", picker, { gap: rect(picker).left - rect(label).right });
                }
                const lead = rect(card).right - (parseFloat(getComputedStyle(card).borderRightWidth) || 0) - (parseFloat(getComputedStyle(card).paddingRight) || 0) - 32;
                rows.forEach((row, index) => {
                    const action = row.querySelector(":scope > .plus-box, :scope > .strategy-box-remove");
                    const rowPicker = row.querySelector(".option-picker");
                    if (!rowPicker) return;
                    if (!rules.near(rect(rowPicker).left, rect(picker).left, 0.5) || !rules.near(rect(rowPicker).right, rect(picker).right, 0.5)) {
                        fail("every Performer dropdown has one left and one right edge", rowPicker, { row: index, left: rect(rowPicker).left, first: rect(picker).left });
                    }
                    if (!action) return;
                    const a = rect(action);
                    if (!rules.near(a.width, 32, 0.5) || !rules.near(a.height, 32, 0.5)) {
                        fail("the + or the x beside a Performer is the x's size (32px)", action, { width: a.width, height: a.height });
                    }
                    if (!rules.near(a.left, lead, 0.75) || (remove && !rules.near(a.left, rect(remove).left, 0.75))) {
                        fail("the + or the x beside a Performer stands in the head's x column", action, { left: a.left, x: remove ? rect(remove).left : lead });
                    }
                    if (!rules.near((a.top + a.bottom) / 2, (rect(rowPicker).top + rect(rowPicker).bottom) / 2, 0.75)) {
                        fail("the + or the x beside a Performer is centred on the dropdown", action, { action: (a.top + a.bottom) / 2, picker: (rect(rowPicker).top + rect(rowPicker).bottom) / 2 });
                    }
                    if (index > 0 && !action.classList.contains("strategy-box-remove")) {
                        fail("a further Performer row ends in an x", action, {});
                    }
                    if (index === 0 && action.classList.contains("strategy-box-remove")) {
                        fail("the + stays on the first Performer row", action, {});
                    }
                    if (action.classList.contains("plus-box")) {
                        plusBoxChecks(action, "the Add Performer +", fail, rules);
                    }
                });
                // THE RESOURCES LIST: its dropdowns share one left and one right edge (the units and the link keep their places in every row), and its "+" and x stand in the head's x column.
                const resourceRows = [...card.querySelectorAll(".business-capability-resource-row")].filter(visible);
                resourceRows.forEach((row, index) => {
                    const rowPicker = row.querySelector(".option-picker");
                    const firstPicker = resourceRows[0].querySelector(".option-picker");
                    if (rowPicker && firstPicker && (!rules.near(rect(rowPicker).left, rect(firstPicker).left, 0.5) || !rules.near(rect(rowPicker).right, rect(firstPicker).right, 0.5))) {
                        fail("every Resource dropdown has one left and one right edge", rowPicker, { row: index, left: rect(rowPicker).left, first: rect(firstPicker).left });
                    }
                    const action = row.querySelector(":scope > .plus-box, :scope > .strategy-box-remove");
                    if (action && !rules.near(rect(action).left, lead, 0.75)) {
                        fail("the + or the x beside a Resource stands in the head's x column", action, { left: rect(action).left, x: lead });
                    }
                });
                const resp = [...card.querySelectorAll(".business-foundation-field:has(> .business-foundation-label-info > .business-foundation-tick-inline)")].find(field => /^Responsible/.test(field.textContent.trim()));
                const respControl = resp && resp.querySelector(".option-picker, .business-capability-automatic");
                if (respControl && picker && !rules.near(rect(respControl).left, rect(picker).left, 0.75)) {
                    fail("the Responsible's dropdown starts at the Performer's x", respControl, { responsible: rect(respControl).left, performer: rect(picker).left });
                }
            }
            const ticks = [...card.querySelectorAll(".brand-tick-box")].filter(visible).map(tick => rect(tick).left);
            if (ticks.length > 1 && Math.max(...ticks) - Math.min(...ticks) > 0.75) {
                fail("the Completed tick stands with the other ticks (one x)", card, { ticks });
            }
            const frozen = card.hasAttribute("data-frozen");
            if (frozen !== card.classList.contains("business-capability-activity-completed")) {
                fail("a finished activity is frozen, and only a finished one", card, { frozen });
            }
            if (frozen) {
                const live = [...card.querySelectorAll("input, textarea, button")].filter(control => !control.matches(":disabled") && !control.classList.contains("business-capability-child-name") && !control.classList.contains("info-note-button"));
                if (live.length !== 1 || !live[0].matches(".business-capability-done .brand-tick-box")) {
                    fail("a frozen activity has only its Completed tick live", card, { live: live.map(control => control.getAttribute("aria-label") || control.className) });
                }
                for (const control of card.querySelectorAll(".business-capability-frozen :is(.interview-input, .option-picker-trigger):disabled")) {
                    const ink = rules.parseColor(getComputedStyle(control).color);
                    const ground = rules.parseColor(getComputedStyle(control).backgroundColor);
                    // (An inactive control is exempt from 4.5:1, WCAG 1.4.3; a completed card's text, in the one dimmed grey, still holds 3:1.)
                    if (ink && ground && rules.contrast(ink, ground) < 3) {
                        fail("a frozen activity's text holds 3:1 on its ground", control, { contrast: rules.contrast(ink, ground) });
                        break;
                    }
                }
            }
            const child = card.querySelector(".business-capability-child-head");
            if (child && (card.querySelector("textarea.card-name-input") || card.querySelector(".business-capability-activity-head .strategy-box-remove"))) {
                fail("a child activity has no name cell and no x", card, {});
            }
            if (card.textContent.includes("Follows “")) {
                fail("a child activity has no message under its name", card, {});
            }
        }
        // 18b. The parent's one line under its Status.
        for (const card of [...document.querySelectorAll(".business-capability-slot:not(.business-capability-activity)")].filter(visible)) {
            const lines = card.querySelectorAll(".business-capability-alarm, .business-capability-activity-line");
            if (lines.length > 1 || /Recorded under 2\. Activities/.test(card.textContent)) {
                fail("a parent says ONE thing under its Status: Open Activity “...”", card, { lines: lines.length });
            }
        }
        // 18c. THE OPENED CARD'S COLUMNS (docs/ai/layout-rules.md, 5a "The opened card's columns"): in a Resource / Activity / Partner / Provider card
        //      everything under the head starts at the name cell's LEFT edge (the number stands in the marker column) and ends at its RIGHT edge
        //      (the x column stays right, empty but for an Activity's "+" / x beside a performer); a picker that fills (Status, Responsible, Provider)
        //      and the Description's text box end exactly there; the number stands at the card's padding edge; nothing clips.
        for (const card of [...document.querySelectorAll(".card-box-open > .business-capability-slot:not(.delivery-card)")].filter(visible)) {
            const name = card.querySelector("textarea.card-name-input") || card.querySelector(".business-capability-child-name") || card.querySelector(".strategy-box-head > .strategy-name-static");
            const head = card.querySelector(".strategy-box-head");
            if (!name || !head) continue;
            // A card a Customer Channel made (it says "For channel: ...") is auto-generated: its name is plain text and it has no x.
            if (card.querySelector(".business-capability-channel-line") && (head.querySelector("textarea, input, .strategy-box-remove") || !head.querySelector(".strategy-name-static"))) {
                fail("a channel's card has no name cell and no x: its name is plain text", card, { cell: !!head.querySelector("textarea, input"), x: !!head.querySelector(".strategy-box-remove") });
            }
            const nameBox = rect(name);
            const edge = rect(card);
            const border = parseFloat(getComputedStyle(card).borderLeftWidth) || 0;
            const number = head.querySelector(".strategy-box-number");
            if (number && !rules.near(rect(number).left - edge.left - border, spec.cardPadding, tolerance + 0.5)) {
                fail("a card's number stands at its padding edge (12px in)", number, { gap: rect(number).left - edge.left - border });
            }
            // (The number is drawn INSIDE the name cell, over its left: the name's text starts after it. Only a number outside the cell keeps the 8px.)
            const numberInside = number && rect(number).left >= nameBox.left - 0.5 && rect(number).right <= nameBox.right + 0.5;
            if (number && !numberInside && !rules.near(nameBox.left - rect(number).right, 8, tolerance + 1.5)) {
                fail("a card's number and its name are 8px apart", name, { gap: nameBox.left - rect(number).right });
            }
            const headTop = rect(head).top - edge.top - (parseFloat(getComputedStyle(card).borderTopWidth) || 0);
            if (!rules.near(headTop, spec.cardPadding, tolerance + 0.5)) {
                fail("a card's head is one card padding (12px) from its top", head, { gap: headTop });
            }
            if (card.querySelector(".business-capability-child-head") && number) {
                const textOf = (node) => { const range = document.createRange(); range.selectNodeContents(node); return range.getBoundingClientRect(); };
                const one = textOf(number.querySelector(".list-number")), two = textOf(name);
                if (!rules.near((one.top + one.bottom) / 2, (two.top + two.bottom) / 2, 1)) {
                    fail("a child's number and name text are on one centre line", name, { number: (one.top + one.bottom) / 2, name: (two.top + two.bottom) / 2 });
                }
                if (!rules.near(two.left, nameBox.left, 1)) {
                    fail("a child's name text starts at the name cell's left edge", name, { text: two.left, cell: nameBox.left });
                }
            }
            for (const element of card.querySelectorAll("*")) {
                // (A divider line runs across the whole card, the x column too: rule 18.)
                if (head.contains(element) || element.closest(".option-picker-list") || element.matches(".business-capability-card-rule") || !visible(element)) continue;
                const style = getComputedStyle(element);
                if (style.display === "contents" || style.display === "none") continue;
                const box = rect(element);
                if (box.width === 0 || box.height === 0) continue;
                if (box.left < nameBox.left - 0.75) {
                    fail("under a card's head, nothing starts left of the name cell", element, { left: box.left, name: nameBox.left });
                }
                const inX = element.matches(".strategy-box-remove, .plus-box, .business-capability-performer-slot, .optional-field:has(.business-capability-resource-rows)") || element.querySelector(".strategy-box-remove, .plus-box, .business-capability-performer-slot, .business-capability-resource-rows");
                if (!inX && box.right > nameBox.right + 0.75 && !element.closest(".optional-field:has(.business-capability-resource-rows)")) {
                    fail("under a card's head, nothing ends right of the name cell", element, { right: box.right, name: nameBox.right });
                }
                if (element.matches(".option-picker[data-size=\"fit\"], textarea.business-foundation-note") && !element.closest(".business-capability-performers") && !rules.near(box.right, nameBox.right, 0.75)) {
                    fail("a filling dropdown and the Description's box end at the name cell's right edge", element, { right: box.right, name: nameBox.right });
                }
                if (element.matches(".business-foundation-field, .business-capability-stack, .optional-field-body, label") && element.scrollWidth > element.clientWidth + 1) {
                    fail("nothing in an opened card clips", element, { scroll: element.scrollWidth, client: element.clientWidth });
                }
            }
        }
        // 18d. A Delivery card's order number stands at the card's padding edge too (it was held in a 44px box, right-aligned).
        for (const card of [...document.querySelectorAll(".delivery-card")].filter(visible)) {
            const number = card.querySelector(".strategy-box-head > .strategy-box-number");
            const border = parseFloat(getComputedStyle(card).borderLeftWidth) || 0;
            if (number && !rules.near(rect(number).left - rect(card).left - border, spec.cardPadding, tolerance + 0.5)) {
                fail("a Delivery card's number stands at its padding edge (12px in)", number, { gap: rect(number).left - rect(card).left - border });
            }
            const text = card.querySelector(".strategy-box-number .list-number");
            if (text) {
                const range = document.createRange();
                range.selectNodeContents(text);
                if (!rules.near(range.getBoundingClientRect().left - rect(card).left - border, spec.cardPadding, 1.5)) {
                    fail("a Delivery card's number is left-aligned in its box (no space before it)", text, { text: range.getBoundingClientRect().left - rect(card).left - border });
                }
            }
            if (/\((founder|external)\)/.test(card.textContent)) {
                fail("a Delivery card does not draw '(founder)' or '(external)' after a person", card, {});
            }
        }
        // 18e. AN OPEN DROPDOWN LIST is a card of its own under the cell (or above it): no stroke, exactly the cell's width and left edge.
        for (const list of [...document.querySelectorAll(".option-picker-list")].filter(visible)) {
            const cell = list.parentElement && list.parentElement.querySelector(":scope > .option-picker-trigger");
            if (!cell) continue;
            if (!rules.near(rect(list).width, rect(cell).width, 0.75) || !rules.near(rect(list).left, rect(cell).left, 0.75)) {
                fail("an open dropdown list is exactly its cell's width, from its left edge", list, { list: [rect(list).left, rect(list).width], cell: [rect(cell).left, rect(cell).width] });
            }
            if (parseFloat(getComputedStyle(list).borderTopWidth) !== 0) {
                fail("an open dropdown list has no stroke", list, { border: getComputedStyle(list).borderTopWidth });
            }
        }
        // 18f. NO TRUNCATED PICKER in an opened card: what a picker displays fits its cell (no ellipsis), and the cell is at least as wide as its widest option
        //      (and its placeholder). The one exception is a Status picker, whose longest option (282px of text) is wider than the 264px left beside its label in
        //      the 480px card: it ends in an ellipsis there, the whole text is in its list, option tooltip and the field's accessible name.
        //      The other exception is the supplier / partner cascade's Group and Name pickers (aria-label "... supplier group: ..." / "... supplier: ..."): a group
        //      name ("Property, Vehicles & Facilities", 284px) and a name the user gave ("Hackney Wick Maker Yard (landlord)") can be wider than the 212px beside
        //      the label, so they end in an ellipsis there, the whole text in the list, the tooltip and the accessible name. An activity's Performer pickers
        //      (aria-label "... performer 1: ...") are the same, and a Group picker of a Resource, Partner or Provider card (aria-label "... group: ...", a fixed list whose longest name,
        //      "Landlords, Leasing & Warehouses", is 322px with its padding): a person's name and role, or a partner's, can be wider than the 290px left beside the label.
        const cascadeText = trigger => /(supplier|partner)( group)?:|performer [0-9]+:| group:| category:| cost option:| resource [0-9]+:| rent:/.test(trigger.getAttribute("aria-label") || "");
        for (const trigger of [...document.querySelectorAll(".card-box-open .option-picker-trigger")].filter(visible)) {
            const value = trigger.querySelector(".option-picker-value");
            if (value && value.scrollWidth > value.clientWidth + 1 && !trigger.closest(".business-field-side")?.textContent.startsWith("Status") && !cascadeText(trigger)) {
                fail("a picker shows its whole displayed text", trigger, { scroll: value.scrollWidth, client: value.clientWidth, text: value.textContent });
            }
            if (!trigger.closest(".business-field-side")?.textContent.startsWith("Status") && !cascadeText(trigger)) {
                const style = getComputedStyle(trigger);
                const chrome = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight) + parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth);
                const widest = Math.max(0, ...[...trigger.querySelectorAll(".option-picker-sizer, .option-picker-value")].filter(span => !span.hasAttribute("data-empty")).map(span => { const range = document.createRange(); range.selectNodeContents(span); return range.getBoundingClientRect().width; }));
                if (rect(trigger).width + 1 < widest + chrome && trigger.closest(".business-capability-slot") && !/ payment frequency:/.test(trigger.getAttribute("aria-label") || "")) {
                    fail("a picker is as wide as its widest option", trigger, { width: rect(trigger).width, need: widest + chrome });
                }
            }
        }
        // 18g. THE x IS THE APP'S ONE (remove-button.css): no inset light or shade, no ground of its own, and every x at rest the same as every other (its Legal
        //      Entity card's too): the page-3 edges (inset light / shade) are for the cards, their cells and the Back buttons only.
        {
            const looks = new Map();
            for (const x of [...document.querySelectorAll(".strategy-box-remove")].filter(visible).filter(button => !button.disabled && !button.matches(":hover, :focus-visible"))) {
                const style = getComputedStyle(x);
                if (style.boxShadow !== "none") {
                    fail("the x has no inset light or shade", x, { shadow: style.boxShadow });
                }
                const look = [style.borderTopColor, style.borderLeftColor, style.borderRadius, style.backgroundColor, style.color, style.width, style.height].join("|");
                if (!looks.has(look)) looks.set(look, x);
            }
            if (looks.size > 1) {
                const first = [...looks.values()][0];
                fail("every x looks the same at rest", first, { looks: [...looks.keys()] });
            }
        }
        // 18h. NO SECTION CARD SQUEEZED: a page's section cards (the big cards of every page, Financial's too) are never narrower than 200px or
        //      taller than a few windows of an empty page; the page-3 layout rules are scoped to page 3's own root (.answer-columns.business-capability)
        //      -- the two Financial pages carry .business-capability as well and once had their cards shrunk to 25px by a page-3 rule.
        for (const card of [...document.querySelectorAll(".business-foundation-input.business-foundation-card, .financial-section")].filter(visible)) {
            if (card.closest(".section-tile-overlay, .floating-card-host")) continue;
            if (rect(card).width < 200) {
                fail("a section card is not squeezed (at least 200px wide)", card, { width: rect(card).width, height: rect(card).height });
            }
        }
        // 18i. EVERY TEXT ON PAGE 3 IS ON THE TYPE SCALE (global.css: --font-small 14, --font-body 18, --font-h3 24, --font-h2 28, --font-h1 36); the 0px of a glyph drawn
        //      by shapes (an arrow, an x) is not text.
        if (document.querySelector(".answer-columns.business-capability, .section-tile-overlay.business-capability")) {
            const scale = [14, 18, 24, 28, 36];
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
            const seen = new Set();
            for (let node = walker.nextNode(); node; node = walker.nextNode()) {
                const element = node.parentElement;
                if (!element || !node.textContent.trim() || seen.has(element) || !element.closest(".business-capability, .floating-card-host") || !visible(element)) continue;
                seen.add(element);
                const size = parseFloat(getComputedStyle(element).fontSize);
                if (size > 0 && !scale.some(step => rules.near(size, step, 0.5))) {
                    fail("every text of page 3 is on the type scale (14, 18, 24, 28, 36)", element, { size, text: node.textContent.trim().slice(0, 30) });
                }
            }
        }
        // 19. THE "i" of a coloured card: the ground of its surface (opaque), a stroke and its letter in the darker tint, 3:1 between them, 24px (the library's contract for the "i").
        for (const button of [...document.querySelectorAll(".business-capability .info-note-button, .business-capability.info-note-button")].filter(visible)) {
            const style = getComputedStyle(button);
            const ground = rules.parseColor(style.backgroundColor);
            const ink = rules.parseColor(style.color);
            if (!rules.near(rect(button).width, 24, 0.75) || !rules.near(rect(button).height, 24, 0.75)) {
                fail("an i keeps its size (24px)", button, { width: rect(button).width, height: rect(button).height });
            }
            if (button.getAttribute("aria-expanded") === "true" || button.matches(":hover, :focus-visible")) continue;
            // (An "i" has no background of its own: it stands on the ground of its surface, so that is the ground measured.)
            const surface = rules.effectiveGround(button);
            if (!ink || rules.contrast(ink, surface) < 3) {
                fail("an i holds 3:1 between its letter and its ground", button, { ground: surface.map(Math.round), ink: style.color, contrast: ink ? rules.contrast(ink, surface) : null });
            }
            if (parseFloat(style.borderTopWidth) < 1) {
                fail("an i has its stroke at rest", button, { width: style.borderTopWidth });
            }
        }

        // A remove x never lies on a cell, and keeps 12px from the cell beside it (it stands in the x column): no text box, picker or text area of the same card overlaps it
        // or ends less than 12px before it on its row.
        for (const remove of [...document.querySelectorAll(".strategy-box-remove, .card-remove")].filter(visible)) {
            const box = rect(remove);
            const scope = remove.closest(".business-foundation-card, .legal-entity-card, .business-capability-slot, .business-relationship-block, .strategy-box") ?? remove.parentElement;
            for (const cell of [...scope.querySelectorAll("input.interview-input, textarea.interview-input, .option-picker, .option-picker-trigger")].filter(visible)) {
                if (remove.contains(cell) || cell.contains(remove)) {
                    continue;
                }
                const other = rect(cell);
                const overlapsRow = other.top < box.bottom && other.bottom > box.top;
                if (!overlapsRow) {
                    continue;
                }
                const gap = box.left - other.right;
                const lies = other.left < box.right && other.right > box.left;
                if (lies || (gap >= 0 && gap < 11.5)) {
                    fail("a remove x keeps 12px from the cell beside it and never lies on one", remove, { gap, cell: [other.left, other.right], x: [box.left, box.right] });
                    break;
                }
            }
        }

        return failures;
    }

    /**
     * EVERY SECTION TILE'S DIALOG (docs/ai/layout-rules.md, "Section tiles and
     * dialog"): the sections of 3. Infrastructure & Capability are drawn only
     * while their tile's dialog is open, so the check opens each tile in turn,
     * unfolds everything in the dialog ("Expand all", then any arrow still
     * folded), runs check() with the dialog open, and closes it with its Back
     * button. Returns the failures of the page as drawn (a plain check()) and
     * of every dialog, each naming the tile it was found in. Async:
     *
     *     await window.__layoutProbe.checkWithTiles(spec, { settle: 220, only: null })
     */
    async function checkWithTiles(spec, { settle = 220, only = null } = {}) {
        const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
        const failures = check(spec);
        // (What was opened, for a run's report: root.__layoutProbe.stats.)
        const stats = root.__layoutProbe.stats = { dialogs: 0, boxes: 0 };
        const tiles = [...document.querySelectorAll(".section-tile")].filter(visible);
        for (const tile of tiles) {
            const title = (tile.querySelector(".section-tile-title") || tile).textContent.trim().replace(/\u00a0/g, " ");
            // `only`: the titles to open (a slow window can run a few at a time).
            if (only && !only.includes(title)) {
                continue;
            }
            root.__layoutProbe.openSide = tile.getBoundingClientRect().width;
            tile.click();
            await pause(settle);
            stats.dialogs++;
            const dialog = document.querySelector(".section-tile-dialog");
            // A TILE THAT HOLDS ONE CARD (or none: a blank one is made) opens that card ALONE, floating on its section part (the Workspace: its form, over its
            // group of tiles); no dialog is drawn around it.
            if (!dialog && document.querySelector(".floating-card-host")) {
                stats.floating = (stats.floating || 0) + 1;
                const host = document.querySelector(".floating-card-host");
                const kind = host.classList.contains("floating-card-workspace") ? "workspace" : host.classList.contains("floating-card-founder") ? "founder" : "card";
                failures.push(...checkFloating(spec, title + " (tile)", kind === "workspace" ? tile.closest(".section-tiles-box") : tile.closest(".business-foundation-input"), kind, false));
                failures.push(...check(spec).filter(failure => !/^(a section tile|section tiles|a tile|the tail tile|the first tile rows|a page tile|page tile)/.test(failure.rule)).map(failure => ({ ...failure, tile: title + " (floating card)" })));
                closeCard();
                await pause(settle);
                continue;
            }
            if (!dialog) {
                failures.push({ rule: "a section tile opens its dialog", where: title, detail: "no dialog" });
                continue;
            }
            for (let round = 0; round < 3; round++) {
                for (const button of dialog.querySelectorAll("button.fold-all-toggle, button.strategy-box-toggle[aria-expanded='false'], button.label-arrow[aria-expanded='false']")) {
                    if (button.matches(".fold-all-toggle") && !/^Expand all/.test(button.getAttribute("aria-label") || "")) {
                        continue;
                    }
                    button.click();
                }
                await pause(settle);
            }
            // EVERY dialog has the one frame: the width of the page's card area (at most 92vw), from the
            // page heading's underline to the footer (the CSS fallback without those lines: the least of
            // 92vw and 1400px wide, 88vh high). Its Back button stands at its lower left inside it. Its
            // ground is the shared glass: translucent and blurred, as is the ground of the cards in it.
            {
                const box = dialog.getBoundingClientRect();
                const underline = document.querySelector(".interview-divider");
                const header = document.querySelector(".app-header");
                const footer = document.querySelector(".workspace-footer");
                const card = document.querySelector(".conversation-card");
                const back = dialog.querySelector(".section-tile-back").getBoundingClientRect();
                const most = window.innerWidth * 0.92;
                let width = Math.min(most, 1400);
                let height = window.innerHeight * 0.88;
                let top = (window.innerHeight - height) / 2;
                // A dialog covers the area of the card of its section (its left and right edges, top and height); a page-level dialog keeps the page frame.
                const sectionCard = tile.closest(".section-tiles-completed") ? null : tile.closest(".business-foundation-input");
                const cardBox = sectionCard ? sectionCard.getBoundingClientRect() : null;
                if (cardBox && cardBox.width > 200 && cardBox.height > 200) {
                    width = cardBox.width;
                    height = cardBox.height;
                    top = cardBox.top;
                } else if (underline) {
                    // A page-wide dialog (Inventory, Completed) stands from the top of the page's cards to 12px above the footer.
                    const cardsTop = document.querySelector(".answer-columns.business-capability > .business-foundation-card");
                    const upper = Math.max(cardsTop ? cardsTop.getBoundingClientRect().top : 0, underline.getBoundingClientRect().bottom, header ? header.getBoundingClientRect().bottom : 0);
                    const lower = footer ? footer.getBoundingClientRect().top - 12 : window.innerHeight;
                    if (lower - upper >= 200) {
                        width = Math.min(card ? card.getBoundingClientRect().width : most, most);
                        height = lower - upper;
                        top = upper;
                    }
                }
                if (Math.abs(box.width - width) > 1.5 || box.height < height - 1.5) {
                    failures.push({ rule: "a section dialog is the page card area's width, from the heading's underline to the footer", where: title, detail: { width: box.width, height: box.height, expected: [width, height] } });
                }
                if (Math.abs(box.top - top) > 1.5) {
                    failures.push({ rule: "a section tile's dialog starts at the heading's underline", where: title, detail: { top: box.top, expected: top } });
                }
                if (cardBox && cardBox.width > 200 && cardBox.height > 200) {
                    if (Math.abs(box.left - cardBox.left) > 1.5) {
                        failures.push({ rule: "a section tile's dialog starts at its section card's left edge", where: title, detail: { left: box.left, expected: cardBox.left } });
                    }
                } else if (Math.abs((box.left + box.right) / 2 - window.innerWidth / 2) > 1.5) {
                    failures.push({ rule: "a section tile's dialog is centred across the window", where: title, detail: { centre: (box.left + box.right) / 2, window: window.innerWidth / 2 } });
                }
                if (back.left < box.left || back.bottom > box.bottom || back.left - box.left > 40 || box.bottom - back.bottom > 40) {
                    failures.push({ rule: "a dialog's Back button stands at its lower left", where: title, detail: { left: back.left - box.left, bottom: box.bottom - back.bottom } });
                }
                const alphaOf = (element) => {
                    const colour = getComputedStyle(element).backgroundColor;
                    const found = colour.match(/\/\s*([\d.]+)\s*\)/) || colour.match(/rgba\([^)]*,\s*([\d.]+)\)/);
                    return found ? parseFloat(found[1]) : 1;
                };
                const blurred = (element) => /blur/.test(getComputedStyle(element).backdropFilter || getComputedStyle(element).webkitBackdropFilter || "");
                if (alphaOf(dialog) < 0.99 && !blurred(dialog)) {
                    failures.push({ rule: "a dialog's ground is translucent and blurred (the shared glass)", where: title, detail: { alpha: alphaOf(dialog), blur: getComputedStyle(dialog).backdropFilter } });
                }
                for (const inner of dialog.querySelectorAll(".business-foundation-card")) {
                    if (!visible(inner)) continue;
                    if (alphaOf(inner) >= 0.99 || !blurred(inner)) {
                        failures.push({ rule: "a card in a dialog has the shared glass ground (translucent, blurred)", where: title, detail: { alpha: alphaOf(inner), blur: getComputedStyle(inner).backdropFilter } });
                        break;
                    }
                }
            }
            failures.push(...check(spec).filter(failure => !/^(a section tile|section tiles)/.test(failure.rule)).map(failure => ({ ...failure, tile: title })));
            // The boxes inside the dialog, level by level (docs/ai/layout-rules.md, "Card boxes"): the dialog is only a GRID to choose from
            // (a section's SUBCATEGORY boxes -- Utilities, Workstation, Equipment, Digital Infrastructure, Offering's Partners & Suppliers:
            // every one -- and the CARD boxes of a list: the first three of each). A box that leads to ONE card, or to none (a blank card is
            // made), or a card box, closes the grid and opens that card as a FLOATING card on its section part: it is checked as a floating
            // card, left with Back (which returns to the page), and the grid is reached again by the same route. A box that groups several
            // opens the next grid; Back returns to the level it came from.
            const grid = () => document.querySelector(".section-tile-dialog");
            const labelsOf = () => [...(grid() ? grid().querySelectorAll("[data-opens]") : [])].map(box => box.getAttribute("aria-label") || box.textContent.trim()).join("|");
            const reopen = async (route) => {
                tile.click();
                await pause(settle);
                for (const position of route) {
                    const box = grid() && grid().querySelectorAll("[data-opens]")[position];
                    if (!box) {
                        return false;
                    }
                    box.click();
                    await pause(settle);
                }
                return !!grid();
            };
            const walk = async (path, route) => {
                const level = labelsOf();
                const count = grid().querySelectorAll("[data-opens]").length;
                const limit = grid().querySelector(".section-tiles-boxes") ? 12 : route.length > 0 ? 3 : 2;
                for (let position = 0; position < Math.min(count, limit); position++) {
                    // (The grid is drawn again after Back: the box is found again each time.)
                    const box = grid() && grid().querySelectorAll("[data-opens]")[position];
                    if (!box) {
                        break;
                    }
                    const boxName = (box.getAttribute("aria-label") || box.textContent.trim()).replace(/ /g, " ");
                    stats.boxes++;
                    box.click();
                    await pause(settle);
                    if (document.querySelector(".floating-card-host")) {
                        // The card floats over the view it was opened from, which stays open under it.
                        stats.floating = (stats.floating || 0) + 1;
                        failures.push(...checkFloating(spec, path + " > " + boxName + " (box)", tile.closest(".business-foundation-input") || document.querySelector('[data-anchor="capability-offering-capability"]'), document.querySelector(".floating-card-host.floating-card-workspace") ? "workspace" : "card", false));
                        failures.push(...check(spec).filter(failure => !/^(a section tile|section tiles|a founder|a tile|the tail tile|the first tile rows|a page tile|page tile)/.test(failure.rule)).map(failure => ({ ...failure, tile: path + " > " + boxName })));
                        closeCard();
                        await pause(settle);
                        if (document.querySelector(".floating-card-host") || !grid()) {
                            failures.push({ rule: "A press outside a floating card closes it and returns to the view it was opened from", where: path + " > " + boxName, detail: "still open or the view is gone" });
                            return;
                        }
                        continue;
                    }
                    if (!grid()) {
                        failures.push({ rule: "a box opens a grid or a floating card", where: path + " > " + boxName, detail: "nothing is open" });
                        return;
                    }
                    failures.push(...check(spec).filter(failure => !/^(a section tile|section tiles|a founder)/.test(failure.rule)).map(failure => ({ ...failure, tile: path + " > " + boxName })));
                    if (route.length < 2 && grid().querySelectorAll("[data-opens]").length > 0) {
                        await walk(path + " > " + boxName, [...route, position]);
                    }
                    // Back until the level this box was opened from is drawn again.
                    for (let back = 0; back < 3 && grid() && labelsOf() !== level; back++) {
                        grid().querySelector(".section-tile-back").click();
                        await pause(settle);
                    }
                    if (!grid() || labelsOf() !== level) {
                        failures.push({ rule: "Back from a box returns to the level it was opened from", where: path + " > " + boxName, detail: { level, now: labelsOf() } });
                        return;
                    }
                }
            };
            await walk(title, []);
            for (let back = 0; back < 3 && grid(); back++) {
                grid().querySelector(".section-tile-back").click();
                await pause(settle);
            }
            if (grid()) {
                failures.push({ rule: "Back closes a section tile's dialog", where: title, detail: "still open" });
            }
        }
        // THE FLOATING CARDS (list items and "+" boxes of the page tiles): each tile's first list link and its "+" box are pressed in
        // turn; the card is checked like any card (check) and as a floating card (checkFloating), then left with Back (a blank
        // card added by the "+" is removed again).
        for (const slot of [...document.querySelectorAll(".section-tile-slot")].filter(visible)) {
            const tile = slot.querySelector(":scope > .section-tile");
            const title = (tile.querySelector(".section-tile-title") || tile).textContent.trim().replace(/\u00a0/g, " ");
            if (only && !only.includes(title)) {
                continue;
            }
            const leave = async () => {
                if (document.querySelector(".floating-card-host")) {
                    closeCard();
                    await pause(settle);
                }
                if (document.querySelector(".floating-card-host")) {
                    failures.push({ rule: "Back closes a floating card", where: title, detail: "still open" });
                }
            };
            const link = slot.querySelector(".section-tile-link[data-link]");
            // (An item that names a category of several cards opens the section's view in a dialog, not a card: the dialog is closed again and checked with its tile.)
            let opensDialog = false;
            if (link) {
                slot.scrollIntoView({ block: "nearest" });
                link.click();
                await pause(settle);
                // (An empty category opens its view with a blank card floating over it: the card goes with a press outside it, then the dialog level by level.)
                opensDialog = !!document.querySelector(".section-tile-dialog");
                if (opensDialog && document.querySelector(".floating-card-host")) {
                    closeCard();
                    await pause(settle);
                }
                if (opensDialog) {
                    // (Back goes one level up at a time: until the dialog is gone.)
                    for (let step = 0; step < 4 && document.querySelector(".section-tile-dialog"); step++) {
                        const back = document.querySelector(".section-tile-dialog .section-tile-back");
                        if (back) { back.click(); await pause(settle); }
                    }
                }
                else if (document.querySelector(".floating-card-host")) {
                    closeCard();
                    await pause(settle);
                }
            }
            if (link && !opensDialog && !/^(Utilities|Workstation|Equipment|Digital Infrastructure)$/.test(title)) {
                const group = slot.closest(".section-tiles-box");
                const isWorkspace = title === "Workspace";
                slot.scrollIntoView({ block: "nearest" });
                link.click();
                await pause(settle);
                stats.floating = (stats.floating || 0) + 1;
                const opensWorkspace = !!document.querySelector(".floating-card-host.floating-card-workspace");
                failures.push(...checkFloating(spec, title + " (list item)", isWorkspace || opensWorkspace ? group : (slot.closest(".business-foundation-input") || document.querySelector('[data-anchor="capability-offering-capability"]')), isWorkspace || opensWorkspace ? "workspace" : title === "Founders" ? "founder" : "card", false));
                failures.push(...check(spec).filter(failure => !/^(a section tile|section tiles|a tile|the tail tile|the first tile rows|a page tile|page tile)/.test(failure.rule)).map(failure => ({ ...failure, tile: title + " (floating card)" })));
                // A CHILD ACTIVITY (made by a resource's Status): its name is not the user's to change, it has no x, and its link opens it
                // with its parent: the PARENT ABOVE the CHILD, 12px apart on one centre line, each under its own box name, centred over the page's card.
                const parentLink = document.querySelector(".floating-card-host .business-capability-parent-link .business-capability-link");
                if (parentLink) {
                    const nameBox = document.querySelector(".floating-card-host textarea.card-name-input");
                    if (!nameBox || !nameBox.disabled) {
                        failures.push({ rule: "a child activity's name is not the user's to change (a disabled cell)", where: title, detail: {} });
                    }
                    if (document.querySelector(".floating-card-host .strategy-box-remove")) {
                        failures.push({ rule: "a child activity cannot be deleted (no x)", where: title, detail: {} });
                    }
                    parentLink.click();
                    await pause(settle);
                    stats.pairs = (stats.pairs || 0) + 1;
                    const host = document.querySelector(".floating-card-host[data-pair]");
                    if (!host) {
                        failures.push({ rule: "the link of a child opens it with its parent", where: title, detail: "no pair" });
                    } else {
                        const items = [...host.querySelectorAll(".floating-card-item")];
                        const boxes = items.map(item => item.querySelector(".floating-card-body").getBoundingClientRect());
                        if (items.length !== 2 || boxes[0].bottom > boxes[1].top) {
                            failures.push({ rule: "a parent and its child are stacked, the parent above", where: title, detail: { n: items.length, parent: boxes[0] && boxes[0].bottom, child: boxes[1] && boxes[1].top } });
                        } else {
                            const gap = items[1].getBoundingClientRect().top - boxes[0].bottom;
                            // (The child's box name stands between: 12px under the parent, then the name's height, then 12px over the child.)
                            const caption = items[1].querySelector(".floating-card-caption").getBoundingClientRect();
                            if (Math.abs(gap - 12) > 1.5 && Math.abs(caption.top - boxes[0].bottom - 12) > 1.5) {
                                failures.push({ rule: "the parent and its child are 12px apart", where: title, detail: { gap } });
                            }
                            if (Math.abs((boxes[0].left + boxes[0].right) / 2 - (boxes[1].left + boxes[1].right) / 2) > 1.5 && host.querySelector("[data-kind=workspace]") === null) {
                                failures.push({ rule: "the parent and its child stand on one centre line", where: title, detail: {} });
                            }
                        }
                        failures.push(...checkFloating(spec, title + " (parent and child)", slot.closest(".business-foundation-input"), "card", false).filter(failure => !/a floating card is wholly in the window/.test(failure.rule)));
                        closeCard();
                        await pause(settle);
                    }
                }
                await leave();
            }
            const plus = slot.querySelector(":scope > .section-tile-plus");
            if (plus) {
                const counted = slot.querySelectorAll(".section-tile-list > li").length;
                const column = slot.closest(".business-foundation-input");
                slot.scrollIntoView({ block: "nearest" });
                plus.click();
                await pause(settle);
                stats.floating = (stats.floating || 0) + 1;
                failures.push(...checkFloating(spec, title + " (+ box)", column, "card", false));
                const name = document.querySelector(".floating-card-host textarea.card-name-input");
                const focusOnCard = !name && document.activeElement && document.activeElement.closest(".floating-card-host");
                if (!focusOnCard && (!name || document.activeElement !== name)) {
                    failures.push({ rule: "a card added with the + box takes the focus in its name", where: title, detail: { active: document.activeElement && document.activeElement.tagName } });
                }
                failures.push(...check(spec).filter(failure => !/^(a section tile|section tiles|a tile|the tail tile|the first tile rows|a page tile|page tile)/.test(failure.rule)).map(failure => ({ ...failure, tile: title + " (card added with +)" })));
                await leave();
                // (The same title stands in Infrastructure and in Offering's Capability: look in the card the tile was in.)
                const after = [...(column || document).querySelectorAll(".section-tile-slot")].find(candidate => (candidate.querySelector(".section-tile-title") || {}).textContent === (tile.querySelector(".section-tile-title") || {}).textContent);
                if (after && after.querySelectorAll(".section-tile-list > li").length !== counted) {
                    failures.push({ rule: "a card added with the + box and left blank is removed again", where: title, detail: { before: counted, after: after.querySelectorAll(".section-tile-list > li").length } });
                }
            }
        }
        return failures;
    }

    /**
     * A FLOATING CARD (docs/ai/layout-rules.md, "Floating cards"): one card alone over the dimmed, inert page -- a role=dialog
     * with a drop shadow, a Back button under it, 480px wide (a founder's: the founder card width), centred over its
     * anchor (the page's card area, the card of the page the tile stands in, or the tile's group) and wholly in the window.
     * `anchor` says which. Returns the failures found, each naming `where`.
     */
    // A floating card is closed by a press outside it (the topmost card answers it).
    function closeCard() {
        document.body.dispatchEvent(new MouseEvent("mousedown", { bubbles: true }));
    }

    function checkFloating(spec, where, anchor, kind, bandOnly) {
        const failures = [];
        const tolerance = spec.tolerance;
        const host = document.querySelector(".floating-card-host");
        if (!host) {
            return [{ rule: "a floating card opens", where, detail: "none" }];
        }
        const box = (element) => element.getBoundingClientRect();
        // (The card is the visible box: a wrapper that only carries a hue is looked through.)
        let card = host.querySelector(".floating-card-body > *");
        for (let depth = 0; card && card.firstElementChild && getComputedStyle(card).boxShadow === "none" && depth < 4; depth++) {
            card = card.firstElementChild;
        }
        const overlay = host.closest(".floating-overlay");
        const fail = (rule, detail) => failures.push({ rule, where, detail });
        if (host.getAttribute("role") !== "dialog" || host.getAttribute("aria-modal") !== "true") {
            fail("a floating card is a modal dialog", { role: host.getAttribute("role") });
        }
        if (!card || getComputedStyle(card).boxShadow === "none") {
            fail("a floating card has a drop shadow", { shadow: card && getComputedStyle(card).boxShadow });
        }
        // A FLOATING CARD DOES NOT DARKEN THE PAGE BEHIND IT (docs/ai/tile-and-card-pattern.md).
        if (overlay && !/rgba\(0, 0, 0, 0\)|transparent/.test(getComputedStyle(overlay).backgroundColor) && !document.querySelector(".section-tile-dialog")) {
            fail("a floating card does not darken the page behind it", { background: getComputedStyle(overlay).backgroundColor });
        }
        // THE PAGE BEHIND IT IS ONLY DIMMED: a flat scrim, no blur or lift of brightness on the page; the names above the cards hold 4.5:1
        // on the scrim over the brightest page (white).
        if (overlay) {
            const overlayStyle = getComputedStyle(overlay);
            if (overlayStyle.backdropFilter !== "none" && overlayStyle.backdropFilter !== "") {
                fail("the page behind a floating card has no backdrop filter (a flat scrim only)", { filter: overlayStyle.backdropFilter });
            }
            const scrim = rules.parseColor(overlayStyle.backgroundColor);
            if (scrim && scrim.length > 3) {
                const over = scrim.slice(0, 3).map(channel => channel * scrim[3] + 255 * (1 - scrim[3]));
                for (const caption of host.querySelectorAll(".floating-card-caption")) {
                    const ink = rules.parseColor(getComputedStyle(caption).color);
                    if (ink && rules.contrast(ink, over) < 4.5) {
                        fail("a box name over a floating card holds 4.5:1 on the scrim over a white page", { contrast: rules.contrast(ink, over) });
                    }
                }
            }
        }
        if (host.querySelector(".floating-card-back")) {
            fail("a floating card has no Back button (a press outside it, or Escape, closes it)", {});
        }
        const cardBox = card ? box(card) : box(host);
        // The STACK (the box name above each card, and the cards) is what is centred; the Back button hangs under it.
        const stackEl = host.querySelector(".floating-card-stack");
        const mine = stackEl ? box(stackEl) : cardBox;
        // THE BOX NAME ABOVE EACH CARD (item: "place its box name above the card, centred, not in a cell"): plain title text, centred over its card, 12px above it,
        // outside the card and not inside any cell, box or input.
        for (const item of host.querySelectorAll(".floating-card-item")) {
            const caption = item.querySelector(":scope > .floating-card-caption");
            const body = item.querySelector(":scope > .floating-card-body");
            if (!caption || !body || caption.textContent.trim() === "") {
                fail("every floating card has its box name above it", { caption: caption && caption.textContent });
                continue;
            }
            const c = box(caption);
            const b = box(body);
            if (Math.abs((c.left + c.right) / 2 - (b.left + b.right) / 2) > 1.5) fail("a floating card's box name is centred over the card", { caption: (c.left + c.right) / 2, card: (b.left + b.right) / 2 });
            if (Math.abs(b.top - c.bottom - 12) > 1) fail("a floating card's box name is 12px above the card", { gap: b.top - c.bottom });
            if (body.contains(caption) || caption.closest("input, textarea, button, .option-picker, .business-foundation-card, .section-tile")) fail("a floating card's box name is plain text outside any cell or box", {});
        }
        // (A card taller than the window is wholly in it as far as the window goes: it extends down and scrolls in its host.)
        if (mine.left < 7.5 || mine.top < 7.5 || mine.right > window.innerWidth - 7.5 || (mine.bottom > window.innerHeight - 7.5 && mine.height <= window.innerHeight - 15 && mine.top > 140)) {
            fail("a floating card is wholly in the window", { card: [mine.left, mine.top, mine.right, mine.bottom] });
        }
        const wanted = kind === "founder" ? parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--founder-card-min")) || 297 : parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--open-card-width")) || 480;
        // (A card wide by nature -- the Roadmap, a Goal with its Objectives -- is as wide as that needs.)
        const wide = !!(card && card.closest(".floating-card-body")?.querySelector(".strategy-goal-card, .strategy-roadmap-card"));
        if (kind !== "workspace" && !wide && Math.abs(cardBox.width - Math.min(wanted, window.innerWidth - 16)) > 1.5) {
            fail(kind === "founder" ? "a floating founder's card is the founder card width" : "a floating card is the open card width", { width: cardBox.width, wanted });
        }
        // Centred over its anchor.
        const underline = document.querySelector(".interview-divider");
        const header = document.querySelector(".app-header");
        const footer = document.querySelector(".workspace-footer");
        const bandTop = underline ? Math.max(underline.getBoundingClientRect().bottom, header ? header.getBoundingClientRect().bottom : 0) : 0;
        const bandBottom = footer ? footer.getBoundingClientRect().top : window.innerHeight;
        let centreX = window.innerWidth / 2;
        let centreY = (bandTop + bandBottom) / 2;
        // A card pops up over the OTHER section's column (Infrastructure's over Offering's Capability's and the reverse), at the level of its first row of tiles.
        const columns = [...document.querySelectorAll(".answer-columns.business-capability > .business-foundation-card")];
        if (anchor && columns.length === 2 && columns.includes(anchor)) {
            anchor = columns[columns[0] === anchor ? 1 : 0];
        }
        if (anchor) {
            const a = box(anchor);
            centreX = a.left + a.width / 2;
            if (!bandOnly) {
                const top = Math.max(a.top, bandTop);
                const bottom = Math.min(a.bottom, bandBottom);
                if (bottom - top >= mine.height) centreY = (top + bottom) / 2;
            }
        }
        const x = (mine.left + mine.right) / 2;
        const y = (mine.top + mine.bottom) / 2;
        // (Kept inside the window: the card with its Back button under it is held 8px from every edge.)
        const hostBox = box(host);
        const clampedX = hostBox.left <= 8.5 || hostBox.right >= window.innerWidth - 8.5;
        if (!clampedX && Math.abs(x - centreX) > 2) {
            fail("a floating card is centred horizontally over its anchor", { card: x, anchor: centreX });
        }
        // THE TOP of the first card stands on the top of the first row of tiles of its page's column as the page rests (scrolled up): that row's top now
        // plus how far its body is scrolled. The box name stands above that line.
        void centreY; void y; void bandOnly;
        const firstSlot = anchor ? anchor.querySelector(".section-tile-slot") : null;
        const firstBody = host.querySelector(".floating-card-body");
        if (firstSlot && firstBody) {
            const scrolled = firstSlot.closest(".card-scroll") ? firstSlot.closest(".card-scroll").scrollTop : 0;
            const rowTop = box(firstSlot).top + scrolled;
            // (Where that row is out of view -- the cards stacked, the page scrolled -- the stack stands at the top of the band: under the heading's underline.)
            const offset = box(firstBody).top - box(host).top;
            const wanted = Math.min(Math.max(rowTop - offset, bandTop + 8), Math.max(bandTop + 8, bandBottom - 200)) + offset;
            if (rowTop < window.innerHeight && Math.abs(box(firstBody).top - wanted) > 3) {
                fail("a floating card's top stands on the top of the first row of tiles of its column", { card: box(firstBody).top, row: rowTop, wanted });
            }
            // A stack taller than the room under that top scrolls in itself.
            if (host.hasAttribute("data-tall")) {
                const stack = host.querySelector(".floating-card-stack");
                if (!stack || getComputedStyle(stack).overflowY !== "auto") {
                    fail("a tall floating card scrolls in its stack", { overflowY: stack && getComputedStyle(stack).overflowY });
                }
            }
        }
        return failures;
    }

    root.__layoutProbe = { inventory, check, checkWithTiles, checkFloating, rules };

})(typeof window !== "undefined" ? window : globalThis);

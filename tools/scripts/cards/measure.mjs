/**
 * What the card scanner reads from the page (it runs inside the page, one
 * scope at a time): the surfaces (master tiles, the open tiles inside a dialog,
 * dialogs, floating cards, nested cards), every control by type, the navigation
 * (rails, arrows, chapters, links) and where an open card stands against what
 * opened it. Only numbers and class names are read; nothing is changed.
 */

/** The control types, each with the selector that finds it. A control belongs to the first type that matches. */
export const CONTROLS = [
    ["x", ".strategy-box-remove, .card-remove, .profile-card-remove, .brand-holder-clear, .legal-entity-field-remove"],
    ["plus", ".plus-box, .strategy-add-button, .business-add-button"],
    ["info", ".info-note-button"],
    ["fold arrow", ".strategy-box-toggle"],
    ["label arrow", ".label-arrow"],
    ["dropdown", ".option-picker-trigger"],
    ["tick box", "input[type=checkbox]"],
    ["text area", "textarea.interview-input, textarea"],
    ["number box", "input.interview-input[inputmode], input[type=number]"],
    ["date cell", ".date-cell, input[type=date], .month-picker-trigger"],
    ["text box", "input.interview-input:not([type=checkbox]), input[type=text]"],
    ["label", ".field-label"]
];

/** Runs in the page. `scope` is a CSS selector for the element(s) whose controls are read. */
export function measureScope({ scope, controls, surface }) {
    const px = value => Math.round(parseFloat(value) * 100) / 100;
    const roots = [...document.querySelectorAll(scope)];
    const classOf = element => (element.getAttribute("class") || "").split(/\s+/).filter(Boolean).slice(0, 3).join(".");
    const records = [];
    const seen = new Set();
    for (const root of roots) {
        for (const [type, selector] of controls) {
            for (const element of root.querySelectorAll(selector)) {
                if (seen.has(element)) continue;
                seen.add(element);
                const rect = element.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) continue;
                const style = getComputedStyle(element);
                const parentRect = element.parentElement.getBoundingClientRect();
                records.push({
                    kind: "control",
                    type,
                    cls: classOf(element),
                    w: px(rect.width),
                    h: px(rect.height),
                    fill: Math.abs(rect.width - parentRect.width) <= 1,
                    font: px(style.fontSize),
                    weight: style.fontWeight,
                    radius: style.borderTopLeftRadius,
                    padL: px(style.paddingLeft),
                    padT: px(style.paddingTop),
                    border: px(style.borderTopWidth)
                });
            }
        }
    }
    if (surface) {
        for (const root of roots) {
            const rect = root.getBoundingClientRect();
            const style = getComputedStyle(root);
            records.push({
                kind: "surface",
                type: surface,
                cls: classOf(root),
                w: px(rect.width),
                h: px(rect.height),
                font: px(style.fontSize),
                radius: style.borderTopLeftRadius,
                padL: px(style.paddingLeft),
                padT: px(style.paddingTop),
                padB: px(style.paddingBottom),
                border: px(style.borderTopWidth),
                shadow: /inset/.test(style.boxShadow) ? "inset" : style.boxShadow === "none" ? "none" : "outer"
            });
        }
    }
    return records;
}

/**
 * Runs in the page: the navigation of the page as it stands. The rails (Pages
 * and Sections: their bullets, labels and tab), the page arrows, the carousel
 * arrows and rail of an open dialog or card, the Back buttons, the chapters (the
 * page's frames) and the links inside the scope (what they say, their class).
 */
export function measureNavigation({ scope }) {
    const px = value => Math.round(parseFloat(value) * 100) / 100;
    const rect = element => {
        const r = element.getBoundingClientRect();
        return { x: px(r.left), y: px(r.top), w: px(r.width), h: px(r.height) };
    };
    const classOf = element => (element.getAttribute("class") || "").split(/\s+/).filter(Boolean).slice(0, 3).join(".");
    const out = [];
    for (const rail of document.querySelectorAll(".bullet-rail, .carousel-rail")) {
        const r = rect(rail);
        if (r.w === 0) continue;
        const style = getComputedStyle(rail);
        const dot = rail.querySelector(".bullet-rail-dot");
        out.push({
            kind: "nav", type: rail.matches(".carousel-rail") ? "carousel rail" : "page rail", cls: classOf(rail),
            label: rail.getAttribute("aria-label") || "", ...r,
            items: rail.querySelectorAll(".bullet-rail-item").length,
            lit: [...rail.querySelectorAll(".bullet-rail-item.active .bullet-rail-label, .bullet-rail-item.active .strategy-card-nav-tip")].map(e => e.textContent.trim().slice(0, 30)).join("|"),
            labels: [...rail.querySelectorAll(".bullet-rail-label, .strategy-card-nav-tip")].map(e => e.textContent.trim().slice(0, 24)).slice(0, 8).join("|"),
            tab: /rgba\(0, 0, 0, 0\)|transparent/.test(style.backgroundColor) ? "none" : "tab",
            padding: px(style.paddingTop) + "/" + px(style.paddingLeft),
            bullet: dot ? rect(dot).w + "x" + rect(dot).h : ""
        });
    }
    for (const arrow of document.querySelectorAll(".page-arrow")) {
        const r = rect(arrow);
        if (r.w === 0) continue;
        out.push({ kind: "nav", type: arrow.classList.contains("carousel-arrow") ? "carousel arrow" : "page arrow", cls: classOf(arrow), label: arrow.getAttribute("aria-label") || arrow.getAttribute("data-direction") || "", ...r });
    }
    for (const back of document.querySelectorAll(".section-tile-back, .carousel-rail-back")) {
        const r = rect(back);
        if (r.w === 0) continue;
        out.push({ kind: "nav", type: "back", cls: classOf(back), label: (back.textContent || "").trim(), ...r });
    }
    for (const frame of document.querySelectorAll(".conversation-card .business-foundation-card, .conversation-card > section, .conversation-card .answer-column")) {
        const r = rect(frame);
        if (r.w < 150 || r.h < 60) continue;
        const heading = frame.querySelector(".answer-column-label, .field-group-title, h2, h3");
        out.push({ kind: "nav", type: "chapter frame", cls: classOf(frame), label: (heading ? heading.textContent : "").trim().slice(0, 40), ...r });
    }
    for (const root of document.querySelectorAll(scope)) {
        for (const link of root.querySelectorAll("a, .business-engagement-link, .link-symbol, .card-link, button[class*='link']:not(.section-tile-link)")) {
            const r = rect(link);
            if (r.w === 0) continue;
            out.push({ kind: "nav", type: "link", cls: classOf(link), label: (link.textContent || link.getAttribute("aria-label") || "").trim().slice(0, 40), ...r });
        }
    }
    return out;
}

/**
 * Runs in the page: where an open floating card stands against what opened it:
 * the card's host and caption, the opener's box and its frame's box (read before
 * the press and passed in), the arrows and the rail at its sides, and the window.
 */
export function measurePlacement({ opener, frame }) {
    const px = value => Math.round(parseFloat(value) * 100) / 100;
    const rect = element => {
        if (!element) return null;
        const r = element.getBoundingClientRect();
        return { x: px(r.left), y: px(r.top), w: px(r.width), h: px(r.height) };
    };
    const host = document.querySelector(".floating-card-host");
    if (!host) return null;
    return {
        kind: "placement", type: "floating card placement", cls: host.className.replace("floating-card-host ", ""),
        host: rect(host), body: rect(host.querySelector(".floating-card-body > *")), caption: rect(host.querySelector(".floating-card-caption")),
        opener, frame,
        arrows: [...document.querySelectorAll(".page-arrow.carousel-arrow")].map(rect),
        rail: rect(document.querySelector(".carousel-rail")),
        window: { w: window.innerWidth, h: window.innerHeight, scrollY: Math.round(window.scrollY) },
        cards: host.querySelectorAll(".floating-card-item").length
    };
}

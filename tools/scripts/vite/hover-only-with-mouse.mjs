/**
 * HOVER ONLY WITH A MOUSE (owner, 2026-11-26 17:04 UTC+2, the touch proposal in "Tiles: touch screens and computer screens": "Just check how the other apps
 * work ... and do it!"). A touch screen has no pointer resting over a control, yet its browser keeps a tapped control in :hover until the next tap elsewhere: a
 * tile stays grown, a button stays bold. Material gives a touch screen the pressed look alone; iPadOS draws its hover effects only with a pointer attached.
 *
 * This PostCSS step, run by Vite on every stylesheet, moves each :hover selector into `@media (hover: hover)` -- the place the input can hover --, leaving the
 * rest of its selector list (`:focus-visible`, `.active`) where it stands, in the same order. A selector that names :hover beside other states
 * (`:is(:hover, :focus-visible)`) keeps those states outside; a rest look (`:not(:hover)`) is no hover look and stays as it is. The stylesheets keep their own
 * words; the rule is kept at this one source rather than in each of the app's ~250 hover selectors.
 */
const HOVER_MEDIA = "(hover: hover)";

/** Whether a selector looks at the pointer resting over it (a `:not(:hover)` is the look at rest). */
function hovers(selector) {
    return selector.replace(/:not\(:hover\)/g, "").includes(":hover");
}

/** The selector without its :hover where it is one of several states (`:is(:hover, :focus-visible)` -> `:is(:focus-visible)`); null where it needs the pointer. */
function withoutHover(selector) {
    let lost = false;
    const rewritten = selector.replace(/:(is|where)\(([^()]*)\)/g, (whole, name, list) => {
        const kept = list.split(",").map(part => part.trim()).filter(part => !part.includes(":hover"));
        if (kept.length === 0) {
            lost = true;
            return whole;
        }
        return ":" + name + "(" + kept.join(", ") + ")";
    });
    return lost || hovers(rewritten) ? null : rewritten;
}

function underHoverMedia(node) {
    for (let at = node.parent; at; at = at.parent) {
        if (at.type === "atrule" && at.name === "media" && at.params.includes("hover: hover")) {
            return true;
        }
    }
    return false;
}

export default function hoverOnlyWithMouse() {
    return {
        postcssPlugin: "hover-only-with-mouse",
        Once(root, { AtRule }) {
            const rules = [];
            root.walkRules(rule => {
                if (rule.selectors.some(hovers) && !underHoverMedia(rule) && !(rule.parent?.type === "atrule" && /keyframes$/i.test(rule.parent.name))) {
                    rules.push(rule);
                }
            });
            for (const rule of rules) {
                const hovering = rule.selectors.filter(hovers);
                const rest = rule.selectors.flatMap(selector => !hovers(selector) ? [selector] : (withoutHover(selector) ?? []));
                const media = new AtRule({ name: "media", params: HOVER_MEDIA });
                media.append(rule.clone({ selectors: hovering }));
                if (rest.length > 0) {
                    rule.selectors = rest;
                    rule.after(media);
                } else {
                    rule.replaceWith(media);
                }
            }
        },
    };
}
hoverOnlyWithMouse.postcss = true;

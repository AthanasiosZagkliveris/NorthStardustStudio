import { CSSProperties, HTMLAttributes, forwardRef } from "react";

import { workHue } from "../../../framework/engine/WorkColours.ts";

/**
 * THE CARD'S OUTER BOX, one for every card and section panel of the Business, Brand, Strategy, Identity and Financial pages: the box's own classes (`business-foundation-card`, the input panel's `business-foundation-input`, the engagement page's `business-engagement-input`) are this component's; a place adds only its own class (`className`) and its anchors, rail and hue. `input` and `engagement` are false only for the few boxes that never had those classes; `legal` is the Legal Entity page's own card box (`legal-entity-card`, its own CSS).
 */
const CardShell = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { input?: boolean; engagement?: boolean; legal?: boolean }>(function CardShell({ input = true, engagement = true, legal = false, className, children, style, ...rest }, ref) {
    const classes = legal ? ["legal-entity-card", className].filter(Boolean).join(" ") : [input && "business-foundation-input", "business-foundation-card", engagement && "business-engagement-input", className].filter(Boolean).join(" ");
    // (A Legal Entity card has the label colour of the Legal Entity page's own frames: the hue of its work type.)
    const own = legal ? { "--legal-label-hue": workHue("define"), ...style } as CSSProperties : style;
    return <div ref={ref} className={classes} style={own} {...rest}>{children}</div>;
});

export default CardShell;

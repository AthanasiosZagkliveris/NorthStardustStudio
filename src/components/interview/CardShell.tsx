import { HTMLAttributes, forwardRef } from "react";

/**
 * THE CARD'S OUTER BOX, one for every card and section panel of the Business, Brand, Strategy, Identity and Financial pages: the box's own classes (`business-foundation-card`, the input panel's `business-foundation-input`, the engagement page's `business-engagement-input`) are this component's; a place adds only its own class (`className`) and its anchors, rail and hue. `input` and `engagement` are false only for the few boxes that never had those classes.
 */
const CardShell = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & { input?: boolean; engagement?: boolean }>(function CardShell({ input = true, engagement = true, className, children, ...rest }, ref) {
    const classes = [input && "business-foundation-input", "business-foundation-card", engagement && "business-engagement-input", className].filter(Boolean).join(" ");
    return <div ref={ref} className={classes} {...rest}>{children}</div>;
});

export default CardShell;

import { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

/**
 * THE TEXT LINK: every piece of text in the app that acts when pressed (opens a card, a page or a list, or does something) is drawn by this one component.
 * Its look is one (src/styles/text-links.css, `.text-link`); the extra class a place passes says only where it stands (its spacing, its row), and the older
 * names the stylesheets and tests still use (textLinks.ts). A button unless `as="a"` (a link that leaves for an address).
 */
type TextLinkProps = (ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" }) | (AnchorHTMLAttributes<HTMLAnchorElement> & { as: "a" });

export default function TextLink(props: TextLinkProps & { children?: ReactNode }) {
    const { as, className, ...rest } = props;
    const classes = "text-link" + (className ? " " + className : "");
    if (as === "a") {
        return <a {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)} className={classes} />;
    }
    return <button type="button" {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} className={classes} />;
}

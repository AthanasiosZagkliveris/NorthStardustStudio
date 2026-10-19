import { MouseEventHandler } from "react";

import TextLink from "./TextLink.tsx";
import CardNameInput from "./CardNameInput.tsx";

/**
 * THE NAME CELL: a card's name in its head, one component for the three ways it is shown. Asked (`editing`: the name's box, two rows at most), a link (the name opens another place: `link`) or shown (the name as text, `empty` when there is none). All three stand in the same slot of the head, so a card that refers and a card that answers have the same head.
 */
export default function NameCell({ value, editing, onChange, ariaLabel, placeholder, disabled = false, link, empty }: {
    value: string;
    /** True: the name is asked in its box. False: it is shown (or linked). */
    editing: boolean;
    onChange?: (value: string) => void;
    ariaLabel: string;
    placeholder: string;
    disabled?: boolean;
    link?: { className: string; title: string; ariaLabel?: string; onClick: MouseEventHandler<HTMLButtonElement> };
    /** What a shown name reads when it is empty. */
    empty: string;
}) {
    const text = value.trim();
    if (editing) {
        return <CardNameInput ariaLabel={ariaLabel} placeholder={placeholder} disabled={disabled} value={value} onChange={(next) => onChange?.(next)} />;
    }
    if (link && text.length > 0) {
        return <TextLink type="button" className={link.className} title={link.title} aria-label={link.ariaLabel} onClick={link.onClick}>{text}</TextLink>;
    }
    return <span className="strategy-name-static" title={text || undefined}>{text || empty}</span>;
}

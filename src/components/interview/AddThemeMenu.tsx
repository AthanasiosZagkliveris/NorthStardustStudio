import { KeyboardEvent, useEffect, useRef, useState } from "react";

import { useFloatingPanel } from "../../hooks/useFloatingPanel.ts";

import { consumeKey } from "./consumeKey.ts";

interface AddThemeMenuProps {

    /** The common Themes, in their fixed order. */
    suggestions: { name: string; description: string }[];

    /** Names already used: shown as added, not offered twice. */
    usedNames: string[];

    disabled?: boolean;

    /** A blank Theme, or a suggested one to keep or change. */
    onAdd: (name?: string, description?: string) => void;

}

/**
 * "+ Add Theme": one control for both ways of adding a Theme.
 *
 * The founder's own Theme comes first, because it is the answer the
 * page asks for; the common ones follow as help. Added ones stay in
 * the list, marked, so the list never reorders under the pointer.
 */
export default function AddThemeMenu({ suggestions, usedNames, disabled = false, onAdd }: AddThemeMenuProps) {

    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const { panelRef, panelStyle } = useFloatingPanel(open, buttonRef);

    const used = new Set(usedNames.map(name => name.trim().toLowerCase()));

    /* Closed by a click outside or Escape; focus goes back to the button. */
    useEffect(() => {
        if (!open) {
            return;
        }
        function onPointerDown(event: globalThis.MouseEvent) {
            if (!wrapRef.current?.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        function onKeyDown(event: globalThis.KeyboardEvent) {
            if (event.key === "Escape") {
                consumeKey(event);
                setOpen(false);
                buttonRef.current?.focus();
            }
        }
        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    /* The first option takes focus on opening, for the keyboard. */
    useEffect(() => {
        if (open) {
            panelRef.current?.querySelector<HTMLButtonElement>("[role=menuitem]:not(:disabled)")?.focus();
        }
    }, [open, panelRef]);

    /** Up and down move between the options that can be chosen. */
    function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
            return;
        }
        event.preventDefault();
        const items = [...(panelRef.current?.querySelectorAll<HTMLButtonElement>("[role=menuitem]:not(:disabled)") ?? [])];
        const at = items.indexOf(document.activeElement as HTMLButtonElement);
        const next = event.key === "ArrowDown" ? (at + 1) % items.length : (at - 1 + items.length) % items.length;
        items[next]?.focus();
    }

    function choose(name?: string, description?: string) {
        onAdd(name, description);
        setOpen(false);
        buttonRef.current?.focus();
    }

    return (

        <div className="strategy-add-menu" ref={wrapRef}>

            <button
                ref={buttonRef}
                type="button"
                className="strategy-add-button"
                aria-haspopup="menu"
                aria-expanded={open}
                disabled={disabled}
                onClick={() => setOpen(current => !current)}
            >
                + Add Theme
                <span className="strategy-add-caret" aria-hidden="true" />
            </button>

            {open && (

                <div
                    ref={panelRef}
                    className="strategy-sort-menu strategy-add-menu-panel"
                    style={panelStyle}
                    role="menu"
                    aria-label="Add a Theme"
                    onKeyDown={onMenuKeyDown}
                >

                    <button
                        type="button"
                        className="strategy-sort-option strategy-add-own"
                        role="menuitem"
                        onClick={() => choose()}
                    >
                        Write your own
                    </button>

                    <div role="group" aria-labelledby="strategy-add-menu-heading">

                        <div id="strategy-add-menu-heading" className="strategy-add-menu-heading">or choose one below</div>

                    {suggestions.map(suggestion => {
                        const added = used.has(suggestion.name.toLowerCase());
                        return (
                            <button
                                key={suggestion.name}
                                type="button"
                                className="strategy-sort-option"
                                role="menuitem"
                                disabled={added}
                                title={suggestion.description}
                                onClick={() => choose(suggestion.name, suggestion.description)}
                            >
                                {suggestion.name}
                                {added && <span className="strategy-add-done"> ✓ Added</span>}
                            </button>
                        );
                    })}

                    </div>

                </div>

            )}

        </div>

    );

}

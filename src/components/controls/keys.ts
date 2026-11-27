/**
 * THE APP'S SHORTCUT KEYS, said the way the device says them (docs/design/interface/08-tooltips.md, section 5): Ctrl+K on Windows, Linux and Android, ⌘K on a Mac,
 * an iPad and an iPhone (Apple, Human Interface Guidelines, Keyboards). Every shortcut is a modifier and a key (WCAG 2.2, 2.1.4: no shortcut of a character alone), and
 * none is one the browser or the system keeps for itself.
 */

/** Whether the device names its command key ⌘ (macOS, iPadOS, which reports itself as a Mac, and iOS). */
export function isApple(): boolean {
    if (typeof navigator === "undefined") {
        return false;
    }
    const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.platform || "";
    return /mac|iphone|ipad|ipod/i.test(platform);
}

/** A shortcut's key as a tooltip or a menu row shows it: "Ctrl+K", or "⌘K" on an Apple device. */
export function keyLabel(key: string): string {
    const shown = key.length === 1 ? key.toUpperCase() : key;
    return isApple() ? "⌘" + shown : "Ctrl+" + shown;
}

/** The same key for a screen reader (`aria-keyshortcuts`): both modifiers, as the key answers to both. */
export function keyShortcuts(key: string): string {
    const named = key.length === 1 ? key.toUpperCase() : key;
    return "Control+" + named + " Meta+" + named;
}

/** Whether a key press is the shortcut: Ctrl or ⌘ with the key, and no other modifier. */
export function isShortcut(event: KeyboardEvent, key: string): boolean {
    return (event.ctrlKey || event.metaKey) && !event.altKey && !event.shiftKey && event.key.toLowerCase() === key.toLowerCase();
}

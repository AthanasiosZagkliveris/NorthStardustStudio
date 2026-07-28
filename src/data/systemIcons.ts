/**
 * Maps every Framework System's number to its
 * icon asset URL.
 *
 * Icons live in assets/Icons, one SVG per System,
 * named "<number>. <Name> Icon.svg" (e.g.
 * "07. Product Development Icon.svg"). The leading
 * number is all that's needed to match an icon to
 * a System -- the rest of the filename is just for
 * humans browsing the folder.
 */
const iconFiles = import.meta.glob(
    "../assets/Icons/*.svg",
    {
        eager: true,
        import: "default"
    }
) as Record<string, string>;

const iconsByNumber = new Map<number, string>();

for (const [path, url] of Object.entries(iconFiles)) {

    const filename = path.split("/").pop() ?? "";
    const match = /^(\d{1,2})\./.exec(filename);

    if (!match) {
        continue;
    }

    iconsByNumber.set(Number(match[1]), url);

}

/**
 * Returns the icon URL for a System number, or
 * undefined if no matching icon was bundled.
 */
export function getSystemIcon(systemNumber: number): string | undefined {

    return iconsByNumber.get(systemNumber);

}

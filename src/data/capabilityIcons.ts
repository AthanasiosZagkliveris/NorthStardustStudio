/**
 * Maps every Framework Capability's number to its
 * icon asset URL.
 *
 * Icons live in "assets/Capability Icons", one SVG
 * per Capability, named "<number>. <NAME> Icon.svg"
 * (e.g. "01. FOUNDATION.svg"). The leading number is
 * all that's needed to match an icon to a Capability
 * -- the rest of the filename is just for humans
 * browsing the folder. Mirrors data/systemIcons.ts.
 */
const iconFiles = import.meta.glob(
    "../assets/Capability Icons/*.svg",
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
 * Returns the icon URL for a Capability number, or
 * undefined if no matching icon was bundled.
 */
export function getCapabilityIcon(capabilityNumber: number): string | undefined {

    return iconsByNumber.get(capabilityNumber);

}

/**
 * Parses assets/organization-framework-capabilities.md
 * into one structured description per Capability, so
 * the System Selection page can show a Capability's
 * write-up without re-parsing Markdown at click time.
 */
export interface CapabilityDescription {

    number: string;

    title: string;

    tagline: string;

    paragraphs: string[];

    corePrinciple: string;

}

function firstMarkdown(files: Record<string, string>): string {

    return Object.values(files)[0] ?? "";

}

const raw = firstMarkdown(
    import.meta.glob(
        "../../assets/organization-framework-capabilities.md",
        {
            eager: true,
            import: "default",
            query: "?raw"
        }
    ) as Record<string, string>
);

function parseDescriptions(source: string): CapabilityDescription[] {

    const blocks = source.split(/\n-{3,}\n/);

    const results: CapabilityDescription[] = [];

    for (const block of blocks) {

        const headingMatch = /^##\s+(\d+)\.\s+(.+?)\s*$/m.exec(block);

        if (!headingMatch) {
            continue;
        }

        const [, number, title] = headingMatch;

        const afterHeading = block
            .slice(headingMatch.index + headingMatch[0].length)
            .trim();

        const paragraphs = afterHeading
            .split(/\n\s*\n/)
            .map(paragraph => paragraph.trim())
            .filter(paragraph => paragraph.length > 0);

        let tagline = "";
        let corePrinciple = "";
        const body: string[] = [];

        for (const paragraph of paragraphs) {

            if (!tagline && /^\*[^*].*[^*]\*$/.test(paragraph)) {
                tagline = paragraph.replace(/^\*|\*$/g, "");
                continue;
            }

            if (/^\*\*Core principle:\*\*/.test(paragraph)) {
                corePrinciple = paragraph.replace(/^\*\*Core principle:\*\*\s*/, "");
                continue;
            }

            body.push(paragraph);

        }

        results.push({
            number,
            title,
            tagline,
            paragraphs: body,
            corePrinciple
        });

    }

    return results;

}

const descriptions = parseDescriptions(raw);

/**
 * Finds a Capability's description by its title
 * (e.g. "Deliver Value"), matching the same title
 * strings used in data/capabilities.ts.
 */
export function getCapabilityDescription(
    title: string
): CapabilityDescription | undefined {

    const normalized = title.trim().toLowerCase();

    return descriptions.find(
        description => description.title.trim().toLowerCase() === normalized
    );

}

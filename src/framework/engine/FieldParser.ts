import { FieldDefinition } from "../model/FieldDefinition.ts";
import { FieldOption } from "../model/FieldOption";

/**
 * Parses reusable Framework Fields from
 * Status_Scale_Frequency_Fields.md.
 *
 * Example:
 *
 * ## Status Field
 *
 * **Number of Variants:** 4
 *
 * **Variants:**
 * - Variant 1: Planned
 * - Variant 2: In Progress
 */
export class FieldParser {

    /**
     * Parses every field definition contained
     * within the supplied markdown.
     */
    public parse(
        markdown: string
    ): FieldDefinition[] {

        const fields: FieldDefinition[] = [];

        const sections =
            this.splitSections(markdown);

        for (const section of sections) {

            const field =
                this.parseSection(section);

            if (field) {

                fields.push(field);

            }

        }

        return fields;

    }

    /**
     * Splits the markdown into
     * individual field sections.
     */
    private splitSections(
        markdown: string
    ): string[] {

        return markdown

            .split(/^##\s+/gm)

            .map(section => section.trim())

            .filter(section => section.length > 0);

    }

    /**
     * Parses a single field definition.
     */
    private parseSection(
        section: string
    ): FieldDefinition | undefined {

        const lines =

            section

                .split(/\r?\n/)

                .map(line => line.trim())

                .filter(line => line.length > 0);

        if (lines.length === 0) {

            return undefined;

        }

        //
        // Field Name
        //

        const name =

            lines[0]

                .replace(/Field$/i, "")

                .trim();

        //
        // Allow Custom (optional -- "**Allow Custom:** Yes",
        // see FieldDefinition.allowCustom's own doc comment)
        //

        const allowCustom = lines.some(
            line => /^\*{0,2}Allow Custom:\*{0,2}\s*Yes\s*$/i.test(line)
        );

        //
        // Parse Variants
        //

        const options: FieldOption[] = [];

        const variantPattern =
            /^-\s*Variant\s+\d+\s*:\s*(.+)$/i;

        for (const line of lines) {

            const match =
                line.match(variantPattern);

            if (!match) {

                continue;

            }

            const label =
                match[1].trim();

            options.push({

                id: this.createId(label),

                label

            });

        }

        return {

            id: this.createId(name),

            name,

            type: "select",

            options,

            allowCustom: allowCustom || undefined

        };

    }

    /**
     * Creates a Framework-safe identifier.
     */
    private createId(
        value: string
    ): string {

        return value

            .trim()

            .toLowerCase()

            .replace(/[^\w\s-]/g, "")

            .replace(/\s+/g, "-");

    }

}
import { FieldDefinition } from "../model/FieldDefinition.ts";

/**
 * Stores every reusable Framework Field.
 *
 * The Field Registry acts as the central repository
 * for reusable field definitions (Status, Scale,
 * Frequency, etc.) used throughout the Framework.
 */
export class FieldRegistry {

    /**
     * Registered Framework Fields.
     */
    private readonly fields =
        new Map<string, FieldDefinition>();

    /**
     * Registers a Framework Field.
     *
     * Existing fields with the same id
     * are replaced.
     */
    public register(
        field: FieldDefinition
    ): void {

        this.fields.set(
            this.normalize(field.id),
            field
        );

    }

    /**
     * Registers multiple Framework Fields.
     */
    public registerMany(
        fields: readonly FieldDefinition[]
    ): void {

        for (const field of fields) {

            this.register(field);

        }

    }

    /**
     * Returns true when the specified
     * Framework Field exists.
     */
    public has(
        id: string
    ): boolean {

        return this.fields.has(

            this.normalize(id)

        );

    }

    /**
     * Returns a Framework Field.
     *
     * Throws if the field does not exist.
     */
    public get(
        id: string
    ): FieldDefinition {

        const field =
            this.tryGet(id);

        if (!field) {

            throw new Error(

                `Framework Field "${id}" is not registered.`

            );

        }

        return field;

    }

    /**
     * Attempts to retrieve a Framework Field.
     */
    public tryGet(
        id: string
    ): FieldDefinition | undefined {

        return this.fields.get(

            this.normalize(id)

        );

    }

    /**
     * Returns every registered field.
     */
    public getAll(): readonly FieldDefinition[] {

        return Array.from(

            this.fields.values()

        );

    }

    /**
     * Removes a registered field.
     */
    public unregister(
        id: string
    ): boolean {

        return this.fields.delete(

            this.normalize(id)

        );

    }

    /**
     * Removes every registered field.
     */
    public clear(): void {

        this.fields.clear();

    }

    /**
     * Number of registered fields.
     */
    public getCount(): number {

        return this.fields.size;

    }

    /**
     * Returns true if no fields
     * are currently registered.
     */
    public isEmpty(): boolean {

        return this.fields.size === 0;

    }

    /**
     * Normalizes Framework ids.
     */
    private normalize(
        value: string
    ): string {

        return value
            .trim()
            .toLowerCase();

    }

}
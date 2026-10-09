/**
 * Stores every Organization the user has created as ONE
 * document per Organization -- `{id, name, createdAt, systems,
 * products}` -- instead of the single global Interview slot
 * `StorageService` used to keep. `systems` holds each Framework
 * System's serialized `InterviewSessionState`, keyed by
 * `systemNumber` (as a string), so switching between Systems
 * within the same Organization never overwrites another
 * System's saved answers. `products` is a shared row list used
 * by the Business System's Product Register and the Product
 * Development System's Product Register (see item 7) so the
 * two Sections can read/write the same underlying data.
 *
 * A small separate index (see LocalOrganizationStore) lists every
 * Organization's `{id, name, createdAt}` so the Landing page can
 * render the Organizations list without loading every full
 * document up front.
 */

import { LocalOrganizationStore } from "./LocalOrganizationStore";
import type { SaveState } from "./OrganizationStore";

export interface OrganizationSummary {
    id: string;
    name: string;
    createdAt: number;
}

export interface OrganizationDocument {
    /**
     * The shape this document is saved in (see
     * ORGANIZATION_FORMAT_VERSION). Absent on documents saved before
     * it existed, which read as version 1.
     */
    formatVersion?: number;
    id: string;
    name: string;
    createdAt: number;
    systems: Record<string, unknown>;
    products: unknown[];
    selectedProductId?: string;
    /**
     * Set once the Business and Strategy Systems' saved state has
     * traded places, after the Business System became System 3 and
     * the Strategy System System 4. See
     * StorageService.swapBusinessAndStrategySequence -- which needs
     * a flag rather than a structural test, since re-running the
     * swap would undo it.
     */
    businessStrategySequenceSwapped?: boolean;
    /**
     * Set once the Business System's nine original Sections have
     * been shifted from 1-9 to 2-10, making room for Foundation as
     * Section 1. See
     * StorageService.makeRoomForBusinessFoundationPage -- which must
     * run exactly once, since shifting twice would move every answer
     * two Sections away from its own page.
     */
    businessFoundationPageInserted?: boolean;
    /**
     * Set once the Business System's Sections 2-10 have been
     * shifted to 3-11, making room for Customer Engagement as
     * Section 2. See
     * StorageService.makeRoomForCustomerEngagementPage -- which must
     * run exactly once, for the same reason the Foundation shift
     * above must.
     */
    customerEngagementPageInserted?: boolean;
    /**
     * Set once the Business System's Sections 3-11 have been
     * shifted to 4-12, making room for Infrastructure & Capability
     * as Section 3. See
     * StorageService.insertBusinessSection, which performs all three
     * of these insertions and explains why each needs a flag.
     */
    capabilityPageInserted?: boolean;
    /**
     * Set once Sections 4-12 have been shifted to 5-13, making room
     * for Financial Foundation as Section 4.
     */
    financialFoundationPageInserted?: boolean;
    /**
     * Set once Sections 5-13 have been shifted to 6-14, making room
     * for Financial Sustainability as Section 5.
     */
    financialSustainabilityPageInserted?: boolean;
    /**
     * Set once the Business System's nine original pages (Business
     * Plan to Revenue Roadmap, Sections 6-14) have been retired,
     * leaving the five-page structure. See
     * StorageService.retireLegacyBusinessPages.
     */
    legacyBusinessPagesRetired?: boolean;
    /**
     * What was answered on those nine pages, set aside rather than
     * deleted: out of the Business System's own responses, so a page
     * later given one of their numbers never opens showing them, but
     * still in the Organization's document.
     */
    retiredBusinessResponses?: unknown[];
    /**
     * The Product Development System's Sections 2-7 (Product
     * Validation through Product Review) are answered separately
     * for EACH Product in the shared register, not once per
     * Organization -- keyed first by the Product's name (see
     * `extractProductNames` in Conversation.tsx; Products are
     * matched by name text, not a synthetic id, the same way the
     * shared register itself is), then by Section number.
     */
    productAnswers?: Record<string, Record<string, unknown>>;
    /**
     * The Publishing System's Content Strategy (Section 1),
     * Website System's Website Specification (Section 1), and
     * Social Media System's Audience Profiles (Section 1) all
     * read/write the SAME underlying Target Audience row list per
     * Organization, the same "fully shared, edit anywhere" way
     * `products` already works for the Product Register (see
     * `SHARED_TARGET_AUDIENCE_BINDINGS` in Conversation.tsx) --
     * editing a row from any one of the three updates it in all
     * three immediately. Rows are `{ id, name, description }`;
     * Social Media's own Audience Profiles table additionally
     * carries Interests/Goals/Challenges columns that stay
     * Social-Media-specific and are NOT part of this shared list.
     */
    targetAudiences?: unknown[];
    /**
     * Where the user last worked in this Organization (see
     * setLastPlace), for System Selection's "Continue" line.
     */
    lastPlace?: LastPlace;
    /**
     * Per-task annotations for the Organization Calendar (see
     * OrganizationCalendarPanel.tsx / CalendarTaskService.ts) --
     * the Calendar itself is read-only, auto-discovering its
     * dates straight out of every System's own saved data; this
     * is the ONE thing a person can actually add on top of a
     * discovered task, a time-of-day + a free-text note, keyed by
     * that task's own `taskId` so it survives independently of
     * which date/Section happened to produce it.
     */
    taskAnnotations?: Record<string, CalendarTaskAnnotation>;
}

/**
 * The last place worked: a System, the page open in it (its 0-based
 * index), and, when a field had focus there, the rail id of the
 * section card holding it (its `data-rail` marker).
 */
export interface LastPlace {
    systemNumber: number;
    sectionIndex: number;
    anchor?: string;
}

/**
 * A person-entered time + note layered on top of one auto-
 * discovered Calendar task (see CalendarTaskService.ts) -- never
 * created independently of a task, and removed automatically once
 * both fields are cleared (see `setTaskAnnotation`).
 */
export interface CalendarTaskAnnotation {
    /** "HH:MM", 24-hour. */
    time?: string;
    notes?: string;
}

/**
 * The saved-data format this app writes, into every stored
 * Organization document and every exported Organization file.
 * Version 1 is everything saved before the number existed (no
 * `formatVersion` at all); version 2 is the same document carrying
 * the number; version 3 is the same again with Page 3 in its nine
 * categories (the Page 3 answer carries its own `formatVersion` and an
 * older one is moved to them when it is read). Readers accept all three.
 * A file from a newer app, with a
 * higher number, is refused on import rather than read as though it
 * were this one (see importDocument).
 */
export const ORGANIZATION_FORMAT_VERSION = 3;

/** A document's format version: 1 when it carries none. */
export function organizationFormatVersion(source: { formatVersion?: unknown }): number {

    const version = source.formatVersion;

    return typeof version === "number" && Number.isInteger(version) && version >= 1
        ? version
        : 1;

}

/**
 * Thrown by importDocument for a file saved by a newer version of
 * the app, whose format this one cannot promise to read.
 */
export class UnsupportedFormatVersionError extends Error {

    readonly version: number;

    constructor(version: number) {
        super(`This organization was saved in format version ${version}; this app reads up to version ${ORGANIZATION_FORMAT_VERSION}.`);
        this.name = "UnsupportedFormatVersionError";
        this.version = version;
    }

}

function createOrganizationId(): string {
    return `org-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Where every Organization is kept: this device's localStorage, for
 * now (see OrganizationStore for the seam a server store would take).
 */
const store = new LocalOrganizationStore(
    typeof localStorage !== "undefined" ? localStorage : ({} as Storage)
);

if (typeof window !== "undefined") {
    store.attachToPage(window);
}

export class OrganizationService {

    /**
     * Every Organization's summary, in creation order (the
     * order the Landing page numbers/lists them in).
     */
    static list(): OrganizationSummary[] {

        return store.loadIndex();

    }

    private static saveList(list: OrganizationSummary[]): void {
        store.saveIndex(list);
    }

    static create(name: string): OrganizationSummary {

        const trimmed = name.trim();

        const organization: OrganizationSummary = {
            id: createOrganizationId(),
            name: trimmed.length > 0 ? trimmed : "Untitled Organization",
            createdAt: Date.now()
        };

        const list = this.list();
        list.push(organization);
        this.saveList(list);

        const document: OrganizationDocument = {
            id: organization.id,
            name: organization.name,
            createdAt: organization.createdAt,
            systems: {},
            products: []
        };

        this.saveDocument(document);

        return organization;

    }

    /**
     * Adds an Organization from a document saved elsewhere -- another
     * install, the browser preview, or an example file -- and returns
     * its summary, or null when the file is not an Organization.
     *
     * It always arrives under a NEW id, so importing the same file
     * twice gives two Organizations rather than one silently
     * overwriting the other. Everything else is kept as it was,
     * including the migration flags: an import saved after a
     * migration must not be migrated a second time.
     *
     * Files of format version 1 and 2 are read alike (and saved as
     * 2); a higher version throws UnsupportedFormatVersionError.
     */
    static importDocument(source: unknown): OrganizationSummary | null {

        if (!source || typeof source !== "object" || Array.isArray(source)) {
            return null;
        }

        const imported = source as Partial<OrganizationDocument>;

        const version = organizationFormatVersion(imported);

        if (version > ORGANIZATION_FORMAT_VERSION) {
            throw new UnsupportedFormatVersionError(version);
        }

        if (!imported.systems || typeof imported.systems !== "object") {
            return null;
        }

        const name = typeof imported.name === "string" && imported.name.trim().length > 0
            ? imported.name.trim()
            : "Imported Organization";

        const organization: OrganizationSummary = {
            id: createOrganizationId(),
            name,
            createdAt: Date.now()
        };

        this.saveList([...this.list(), organization]);

        this.saveDocument({
            ...imported,
            id: organization.id,
            name,
            createdAt: organization.createdAt,
            systems: imported.systems,
            products: Array.isArray(imported.products) ? imported.products : []
        } as OrganizationDocument);

        this.flushPendingWrites();

        return organization;

    }

    static rename(organizationId: string, name: string): void {

        const list = this.list().map(organization =>
            organization.id === organizationId
                ? { ...organization, name }
                : organization
        );

        this.saveList(list);

        const document = this.loadDocument(organizationId);

        if (document) {
            document.name = name;
            this.saveDocument(document);
        }

    }

    static remove(organizationId: string): void {

        this.saveList(
            this.list().filter(organization => organization.id !== organizationId)
        );

        store.removeDocument(organizationId);

        if (this.getSelected() === organizationId) {
            this.setSelected(null);
        }

    }

    static getSelected(): string | null {
        return store.getSelectedId();
    }

    static setSelected(organizationId: string | null): void {

        store.setSelectedId(organizationId);

    }

    static getSummary(organizationId: string): OrganizationSummary | null {
        return this.list().find(organization => organization.id === organizationId) ?? null;
    }

    static loadDocument(organizationId: string): OrganizationDocument | null {

        return store.loadDocument(organizationId);

    }

    /** Every write is in the current format, whatever was read. */
    static saveDocument(document: OrganizationDocument): void {
        document.formatVersion = ORGANIZATION_FORMAT_VERSION;
        store.saveDocument(document);
    }

    /**
     * The Organization as an export file carries it: its whole
     * document, stamped with the current format version -- also when
     * it has not been saved since the version was introduced.
     */
    static exportDocument(organizationId: string): OrganizationDocument | null {

        const document = this.loadDocument(organizationId);

        return document
            ? { ...document, formatVersion: ORGANIZATION_FORMAT_VERSION }
            : null;

    }

    /**
     * Immediately writes every not-yet-flushed Organization edit to
     * disk. Call this before anything that could end the current
     * page's lifetime for an Organization being actively edited --
     * navigating away from an interview (see Conversation.tsx) or
     * the Landing page (see Landing.tsx) -- as a belt-and-suspenders
     * companion to the page unload/hide listeners registered above,
     * which only catch the app closing, not an in-app navigation.
     */
    static flushPendingWrites(): void {
        store.flush();
    }

    /** Where saving stands (see SaveState), for the header's saved signal. */
    static getSaveState(): SaveState {
        return store.getSaveState();
    }

    /** Calls `listener` whenever the save state changes; returns the unsubscribe. */
    static subscribeSaveState(listener: () => void): () => void {
        return store.subscribe(listener);
    }

    // -- Per-System Interview state --

    static saveSystemState(organizationId: string, systemNumber: number, state: unknown): void {

        const document = this.loadDocument(organizationId);

        if (!document) {
            return;
        }

        document.systems[String(systemNumber)] = state;
        this.saveDocument(document);

    }

    static loadSystemState(organizationId: string, systemNumber: number): unknown | null {

        const document = this.loadDocument(organizationId);

        if (!document) {
            return null;
        }

        return document.systems[String(systemNumber)] ?? null;

    }

    static listSystemNumbers(organizationId: string): number[] {

        const document = this.loadDocument(organizationId);

        if (!document) {
            return [];
        }

        return Object.keys(document.systems)
            .map(Number)
            .filter(value => !Number.isNaN(value));

    }

    // -- The last place worked --

    static getLastPlace(organizationId: string): LastPlace | null {

        const place = this.loadDocument(organizationId)?.lastPlace;

        return place &&
            Number.isInteger(place.systemNumber) &&
            Number.isInteger(place.sectionIndex)
            ? place
            : null;

    }

    /** Records where the user is working; unchanged places are not re-saved. */
    static setLastPlace(organizationId: string, place: LastPlace): void {

        const document = this.loadDocument(organizationId);

        if (!document) {
            return;
        }

        const previous = document.lastPlace;

        if (
            previous &&
            previous.systemNumber === place.systemNumber &&
            previous.sectionIndex === place.sectionIndex &&
            previous.anchor === place.anchor
        ) {
            return;
        }

        document.lastPlace = place.anchor
            ? { ...place }
            : { systemNumber: place.systemNumber, sectionIndex: place.sectionIndex };

        this.saveDocument(document);

    }

    // -- Shared Product Register (item 7) --

    static getProducts(organizationId: string): unknown[] {
        return this.loadDocument(organizationId)?.products ?? [];
    }

    static saveProducts(organizationId: string, products: unknown[]): void {

        const document = this.loadDocument(organizationId);

        if (!document) {
            return;
        }

        document.products = products;
        this.saveDocument(document);

    }

    // -- Shared Target Audience list --

    static getTargetAudiences(organizationId: string): unknown[] {
        return this.loadDocument(organizationId)?.targetAudiences ?? [];
    }

    static saveTargetAudiences(organizationId: string, targetAudiences: unknown[]): void {

        const document = this.loadDocument(organizationId);

        if (!document) {
            return;
        }

        document.targetAudiences = targetAudiences;
        this.saveDocument(document);

    }

    static getSelectedProductId(organizationId: string): string | undefined {
        return this.loadDocument(organizationId)?.selectedProductId;
    }

    static setSelectedProductId(organizationId: string, productId: string | undefined): void {

        const document = this.loadDocument(organizationId);

        if (!document) {
            return;
        }

        document.selectedProductId = productId;
        this.saveDocument(document);

    }

    // -- Per-Product Section answers (Product Development System, Sections 2-7) --

    static getProductSectionResponse(
        organizationId: string,
        productName: string,
        sectionNumber: number
    ): unknown | null {

        const document = this.loadDocument(organizationId);

        return document?.productAnswers?.[productName]?.[String(sectionNumber)] ?? null;

    }

    static saveProductSectionResponse(
        organizationId: string,
        productName: string,
        sectionNumber: number,
        value: unknown
    ): void {

        const document = this.loadDocument(organizationId);

        if (!document) {
            return;
        }

        if (!document.productAnswers) {
            document.productAnswers = {};
        }

        if (!document.productAnswers[productName]) {
            document.productAnswers[productName] = {};
        }

        document.productAnswers[productName][String(sectionNumber)] = value;

        this.saveDocument(document);

    }

    /**
     * Every Product's saved Section answers in one call -- one
     * `loadDocument` instead of one per (Product, Section) pair.
     * Used by the multi-Product export (see
     * ExportContentBuilder.buildMultiProductExportContent), which
     * would otherwise call `getProductSectionResponse` once per
     * Product times per Section and re-parse the whole Organization
     * document from localStorage every single time.
     */
    static getAllProductSectionResponses(
        organizationId: string
    ): Record<string, Record<string, unknown>> {

        return this.loadDocument(organizationId)?.productAnswers ?? {};

    }

    // -- Organization Calendar task annotations (see
    // OrganizationCalendarPanel.tsx / CalendarTaskService.ts) --

    static getTaskAnnotations(organizationId: string): Record<string, CalendarTaskAnnotation> {
        return this.loadDocument(organizationId)?.taskAnnotations ?? {};
    }

    static getTaskAnnotation(organizationId: string, taskId: string): CalendarTaskAnnotation | null {
        return this.getTaskAnnotations(organizationId)[taskId] ?? null;
    }

    /**
     * Sets (or clears) one task's annotation. An annotation with
     * both fields blank is removed outright rather than kept
     * around as an empty entry -- so a task a person opened,
     * looked at, and left untouched never shows up as "annotated"
     * anywhere.
     */
    static setTaskAnnotation(
        organizationId: string,
        taskId: string,
        annotation: { time?: string; notes?: string }
    ): void {

        const document = this.loadDocument(organizationId);

        if (!document) {
            return;
        }

        const time = (annotation.time ?? "").trim();
        const notes = (annotation.notes ?? "").trim();

        const next = { ...(document.taskAnnotations ?? {}) };

        if (time.length === 0 && notes.length === 0) {
            delete next[taskId];
        } else {
            next[taskId] = {
                time: time.length > 0 ? time : undefined,
                notes: notes.length > 0 ? notes : undefined
            };
        }

        document.taskAnnotations = next;
        this.saveDocument(document);

    }

}

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
 * A small separate index (`ORGANIZATIONS_INDEX_KEY`) lists every
 * Organization's `{id, name, createdAt}` so the Landing page can
 * render the Organizations list without loading every full
 * document up front.
 */

export interface OrganizationSummary {
    id: string;
    name: string;
    createdAt: number;
}

export interface OrganizationDocument {
    id: string;
    name: string;
    createdAt: number;
    systems: Record<string, unknown>;
    products: unknown[];
    selectedProductId?: string;
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

const ORGANIZATIONS_INDEX_KEY = "northstardust-organizations";
const SELECTED_ORGANIZATION_KEY = "northstardust-selected-organization";

function organizationDocumentKey(organizationId: string): string {
    return `northstardust-organization-${organizationId}`;
}

function createOrganizationId(): string {
    return `org-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * How long a burst of writes to the SAME localStorage key (e.g.
 * every keystroke in an interview field, which re-saves that
 * Organization's whole document) is held in memory before actually
 * touching disk. Each new write to the same key restarts this
 * window, so a steady stream of edits collapses into a single
 * `JSON.stringify` + `localStorage.setItem` once typing pauses,
 * instead of one full read-parse-write per keystroke.
 */
const WRITE_DEBOUNCE_MS = 400;

/**
 * Debounces every localStorage WRITE this service makes, while
 * every READ still sees the latest value immediately -- typing
 * stays instant, and nothing an in-progress debounce is holding
 * gets read back stale.
 *
 * Before this existed, every keystroke in an interview field (or an
 * Organization rename) triggered its own full `JSON.parse` +
 * mutate + `JSON.stringify` + `localStorage.setItem` round trip --
 * on a document that grows with every System, Product and answer an
 * Organization accumulates, so typing got slower the longer an
 * Organization had been used. Debouncing the disk write removes
 * that cost from every keystroke while `flushAll()` (called on
 * page unload/hide, and when navigating away from an interview --
 * see Conversation.tsx and Landing.tsx) guarantees a debounced edit
 * is never silently lost if the app closes mid-window.
 */
class DebouncedLocalStorage {

    private readonly pending = new Map<string, { value: unknown; timer: ReturnType<typeof setTimeout> }>();

    /** The latest value queued for `key`, if a write is still pending. */
    peek<T>(key: string): T | undefined {
        return this.pending.get(key)?.value as T | undefined;
    }

    write(key: string, value: unknown): void {

        const existing = this.pending.get(key);

        if (existing) {
            clearTimeout(existing.timer);
        }

        const timer = setTimeout(() => this.flush(key), WRITE_DEBOUNCE_MS);

        this.pending.set(key, { value, timer });

    }

    /** Writes `key`'s pending value to disk immediately, if any. */
    flush(key: string): void {

        const entry = this.pending.get(key);

        if (!entry) {
            return;
        }

        clearTimeout(entry.timer);
        this.pending.delete(key);

        localStorage.setItem(key, JSON.stringify(entry.value));

    }

    /** Flushes every key with a pending write. */
    flushAll(): void {

        for (const key of Array.from(this.pending.keys())) {
            this.flush(key);
        }

    }

    /** Drops `key`'s pending write WITHOUT writing it (e.g. the key was just deleted). */
    discard(key: string): void {

        const entry = this.pending.get(key);

        if (!entry) {
            return;
        }

        clearTimeout(entry.timer);
        this.pending.delete(key);

    }

}

const debouncedStorage = new DebouncedLocalStorage();

if (typeof window !== "undefined") {

    // Best-effort safety net: if the tab/app closes (or is hidden,
    // which is the more reliable signal on mobile/some desktop
    // shells) while a debounced write is still pending, flush
    // everything immediately rather than losing it.
    window.addEventListener("pagehide", () => debouncedStorage.flushAll());
    window.addEventListener("beforeunload", () => debouncedStorage.flushAll());

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
            debouncedStorage.flushAll();
        }
    });

}

export class OrganizationService {

    /**
     * Every Organization's summary, in creation order (the
     * order the Landing page numbers/lists them in).
     */
    static list(): OrganizationSummary[] {

        const pending = debouncedStorage.peek<OrganizationSummary[]>(ORGANIZATIONS_INDEX_KEY);

        if (pending) {
            return pending;
        }

        const raw = localStorage.getItem(ORGANIZATIONS_INDEX_KEY);

        if (!raw) {
            return [];
        }

        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }

    }

    private static saveList(list: OrganizationSummary[]): void {
        debouncedStorage.write(ORGANIZATIONS_INDEX_KEY, list);
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

        // Drop any not-yet-flushed write for this Organization's
        // document FIRST -- otherwise its debounce timer could still
        // fire after the removeItem below and silently resurrect it.
        debouncedStorage.discard(organizationDocumentKey(organizationId));
        localStorage.removeItem(organizationDocumentKey(organizationId));

        if (this.getSelected() === organizationId) {
            this.setSelected(null);
        }

    }

    static getSelected(): string | null {
        return localStorage.getItem(SELECTED_ORGANIZATION_KEY);
    }

    static setSelected(organizationId: string | null): void {

        if (organizationId) {
            localStorage.setItem(SELECTED_ORGANIZATION_KEY, organizationId);
        } else {
            localStorage.removeItem(SELECTED_ORGANIZATION_KEY);
        }

    }

    static getSummary(organizationId: string): OrganizationSummary | null {
        return this.list().find(organization => organization.id === organizationId) ?? null;
    }

    static loadDocument(organizationId: string): OrganizationDocument | null {

        const pending = debouncedStorage.peek<OrganizationDocument>(organizationDocumentKey(organizationId));

        if (pending) {
            return pending;
        }

        const raw = localStorage.getItem(organizationDocumentKey(organizationId));

        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw) as OrganizationDocument;
        } catch {
            return null;
        }

    }

    static saveDocument(document: OrganizationDocument): void {
        debouncedStorage.write(organizationDocumentKey(document.id), document);
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
        debouncedStorage.flushAll();
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

import type { OrganizationDocument, OrganizationSummary } from "./OrganizationService";
import type { OrganizationStore, SaveState } from "./OrganizationStore";

const ORGANIZATIONS_INDEX_KEY = "northstardust-organizations";
const SELECTED_ORGANIZATION_KEY = "northstardust-selected-organization";

function organizationDocumentKey(organizationId: string): string {
    return `northstardust-organization-${organizationId}`;
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
export const WRITE_DEBOUNCE_MS = 400;

/**
 * Why a write failed, in the words the saved signal ends its
 * sentence with ("Not saved: storage is full"). Browsers name a
 * full store differently: QuotaExceededError (Chromium, WebKit),
 * NS_ERROR_DOM_QUOTA_REACHED (older Firefox), or only the legacy
 * codes 22 and 1014.
 */
function writeFailureReason(error: unknown): string {

    const name = error instanceof Error || error instanceof DOMException ? error.name : "";
    const code = error instanceof DOMException ? error.code : 0;

    if (
        name === "QuotaExceededError" ||
        name === "NS_ERROR_DOM_QUOTA_REACHED" ||
        code === 22 ||
        code === 1014
    ) {
        return "storage is full";
    }

    return "storage is unavailable";

}

/**
 * The app's Organizations in this device's localStorage.
 *
 * Debounces every WRITE, while every READ still sees the latest
 * value immediately -- typing stays instant, and nothing an
 * in-progress debounce is holding gets read back stale.
 *
 * Before the debounce existed, every keystroke in an interview field
 * (or an Organization rename) triggered its own full `JSON.parse` +
 * mutate + `JSON.stringify` + `localStorage.setItem` round trip --
 * on a document that grows with every System, Product and answer an
 * Organization accumulates, so typing got slower the longer an
 * Organization had been used. Debouncing the disk write removes
 * that cost from every keystroke while `flush()` (called on page
 * unload/hide, see `attachToPage`, and when navigating away from an
 * interview -- see Conversation.tsx and Landing.tsx) guarantees a
 * debounced edit is never silently lost if the app closes
 * mid-window.
 *
 * A write that fails (the store is full) is kept in memory, so the
 * app goes on showing it, and is tried again with the next write to
 * the same key or the next flush; until one succeeds the save state
 * is `error`.
 */
export class LocalOrganizationStore implements OrganizationStore {

    private readonly pending = new Map<string, { value: unknown; timer: ReturnType<typeof setTimeout> | null }>();

    /** Keys whose last write failed, with the reason. */
    private readonly failures = new Map<string, string>();

    private readonly listeners = new Set<() => void>();

    private state: SaveState = { status: "saved" };

    constructor(
        private readonly storage: Storage,
        private readonly debounceMs = WRITE_DEBOUNCE_MS
    ) {}

    /**
     * Best-effort safety net: if the tab/app closes (or is hidden,
     * which is the more reliable signal on mobile/some desktop
     * shells) while a debounced write is still pending, flush
     * everything immediately rather than losing it.
     */
    attachToPage(target: Window): void {

        target.addEventListener("pagehide", () => this.flush());
        target.addEventListener("beforeunload", () => this.flush());

        target.document.addEventListener("visibilitychange", () => {
            if (target.document.visibilityState === "hidden") {
                this.flush();
            }
        });

    }

    loadIndex(): OrganizationSummary[] {

        const pending = this.peek<OrganizationSummary[]>(ORGANIZATIONS_INDEX_KEY);

        if (pending) {
            return pending;
        }

        const raw = this.storage.getItem(ORGANIZATIONS_INDEX_KEY);

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

    saveIndex(list: OrganizationSummary[]): void {
        this.write(ORGANIZATIONS_INDEX_KEY, list);
    }

    loadDocument(organizationId: string): OrganizationDocument | null {

        const pending = this.peek<OrganizationDocument>(organizationDocumentKey(organizationId));

        if (pending) {
            return pending;
        }

        const raw = this.storage.getItem(organizationDocumentKey(organizationId));

        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw) as OrganizationDocument;
        } catch {
            return null;
        }

    }

    saveDocument(document: OrganizationDocument): void {
        this.write(organizationDocumentKey(document.id), document);
    }

    removeDocument(organizationId: string): void {

        // Drop any not-yet-flushed write for this Organization's
        // document FIRST -- otherwise its debounce timer could still
        // fire after the removeItem below and silently resurrect it.
        this.discard(organizationDocumentKey(organizationId));
        this.storage.removeItem(organizationDocumentKey(organizationId));

    }

    getSelectedId(): string | null {
        return this.storage.getItem(SELECTED_ORGANIZATION_KEY);
    }

    setSelectedId(organizationId: string | null): void {

        if (organizationId) {
            this.storage.setItem(SELECTED_ORGANIZATION_KEY, organizationId);
        } else {
            this.storage.removeItem(SELECTED_ORGANIZATION_KEY);
        }

    }

    /** Flushes every key with a pending write. */
    flush(): void {

        for (const key of Array.from(this.pending.keys())) {
            this.flushKey(key);
        }

    }

    getSaveState(): SaveState {
        return this.state;
    }

    subscribe(listener: () => void): () => void {

        this.listeners.add(listener);

        return () => {
            this.listeners.delete(listener);
        };

    }

    /** The latest value queued for `key`, if a write is still pending. */
    private peek<T>(key: string): T | undefined {
        return this.pending.get(key)?.value as T | undefined;
    }

    private write(key: string, value: unknown): void {

        const existing = this.pending.get(key);

        if (existing?.timer) {
            clearTimeout(existing.timer);
        }

        const timer = setTimeout(() => this.flushKey(key), this.debounceMs);

        this.pending.set(key, { value, timer });

        this.updateState();

    }

    /** Writes `key`'s pending value to disk immediately, if any. */
    private flushKey(key: string): void {

        const entry = this.pending.get(key);

        if (!entry) {
            return;
        }

        if (entry.timer) {
            clearTimeout(entry.timer);
        }

        try {

            this.storage.setItem(key, JSON.stringify(entry.value));

            this.pending.delete(key);
            this.failures.delete(key);

        } catch (error) {

            // Kept, without a timer, for the next write or flush.
            this.pending.set(key, { value: entry.value, timer: null });
            this.failures.set(key, writeFailureReason(error));

        }

        this.updateState();

    }

    /** Drops `key`'s pending write WITHOUT writing it (e.g. the key was just deleted). */
    private discard(key: string): void {

        const entry = this.pending.get(key);

        if (entry?.timer) {
            clearTimeout(entry.timer);
        }

        this.pending.delete(key);
        this.failures.delete(key);

        this.updateState();

    }

    /**
     * A failure outranks a pending write: the signal keeps saying
     * "Not saved" while the new edit waits, until a write succeeds.
     */
    private updateState(): void {

        const reason = this.failures.values().next().value;

        const next: SaveState = reason !== undefined
            ? { status: "error", reason }
            : this.pending.size > 0
                ? { status: "saving" }
                : { status: "saved" };

        const unchanged = next.status === this.state.status &&
            (next.status !== "error" || this.state.status !== "error" || next.reason === this.state.reason);

        if (unchanged) {
            return;
        }

        this.state = next;

        this.listeners.forEach(listener => listener());

    }

}

import type { OrganizationDocument, OrganizationSummary } from "./OrganizationService";

/**
 * Where saving stands, for the header's saved signal (see
 * SaveStatus.tsx). `saving` while a write is still waiting to be
 * made, `saved` once everything has been written, and `error` when a
 * write failed -- with the reason in words ("storage is full").
 */
export type SaveState =
    | { status: "saved" }
    | { status: "saving" }
    | { status: "error"; reason: string };

/**
 * Everything the app keeps about its Organizations, behind one
 * interface: the index the Landing page lists, each Organization's
 * whole document, and which one is selected. OrganizationService
 * (and StorageService, through it) read and write only through this,
 * so the local implementation (LocalOrganizationStore) is the one
 * piece a server-backed store would replace.
 *
 * Reads always see the latest write, even one not yet made durable;
 * `flush` makes every pending write durable now. Every change of
 * save state is reported to subscribers.
 */
export interface OrganizationStore {

    /** Every Organization's summary, in creation order. */
    loadIndex(): OrganizationSummary[];

    saveIndex(list: OrganizationSummary[]): void;

    /**
     * An Organization's document, or null when there is none. The
     * object returned may be the one a pending write holds, so a
     * caller that changes it must save it again.
     */
    loadDocument(organizationId: string): OrganizationDocument | null;

    saveDocument(document: OrganizationDocument): void;

    /** Deletes the document, dropping any write still pending for it. */
    removeDocument(organizationId: string): void;

    getSelectedId(): string | null;

    setSelectedId(organizationId: string | null): void;

    /** Makes every pending write durable now. */
    flush(): void;

    getSaveState(): SaveState;

    /** Calls `listener` on every save-state change; returns the unsubscribe. */
    subscribe(listener: () => void): () => void;

}

/**
 * WHERE THE ORGANIZATIONS ARE KEPT: this device's IndexedDB (2026-11-11, the app-practice review's item 1). localStorage held about
 * 5 MB for every Organization together, blocked the page while it wrote, and could be cleared by the browser under storage pressure;
 * IndexedDB holds far more, writes without blocking, and the app asks for it to be kept (persistent storage).
 *
 * It stands where localStorage stood for LocalOrganizationStore (the same getItem / setItem / removeItem), so the store's debounce,
 * flush and saved signal are unchanged: every value is held in memory, read at once, and written to IndexedDB behind it. A write that
 * fails is reported to `onWrite` with its reason, and the saved signal says "Not saved" until a later write of the key succeeds.
 *
 * AT START (`open`), every Organization key still in localStorage is moved in: an earlier version's data, or an example a tool seeded
 * there (the layout check, the screen snapshot). Each value is written to IndexedDB first and removed from localStorage only once that
 * write is done; the index of Organizations is merged by id, so nothing already kept is dropped. Keys outside the Organizations
 * (the theme, the notes, the preferences) stay in localStorage.
 */
const DATABASE = "northstardust";
const STORE = "organizations";

/** The keys that move from localStorage: the index, the selected Organization, and each Organization's document. */
export const isOrganizationKey = (key: string) =>
    key === "northstardust-organizations" || key === "northstardust-selected-organization" || key.startsWith("northstardust-organization-");

type WriteReport = (key: string, failure: string | null) => void;

function request<T>(req: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
    });
}

function done(tx: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error ?? new DOMException("The write was stopped.", "AbortError"));
    });
}

function failureReason(error: unknown): string {
    const name = error instanceof DOMException || error instanceof Error ? error.name : "";
    return name === "QuotaExceededError" ? "storage is full" : "storage is unavailable";
}

export class IndexedDbStorage implements Storage {

    private readonly values = new Map<string, string>();

    private onWrite: WriteReport = () => undefined;

    private constructor(private readonly db: IDBDatabase) {}

    /** Opens the database, reads every value into memory, and moves in what localStorage still holds. */
    static async open(legacy: Storage | null = typeof localStorage !== "undefined" ? localStorage : null): Promise<IndexedDbStorage> {
        const opening = indexedDB.open(DATABASE, 1);
        opening.onupgradeneeded = () => {
            if (!opening.result.objectStoreNames.contains(STORE)) opening.result.createObjectStore(STORE);
        };
        const storage = new IndexedDbStorage(await request(opening));
        const tx = storage.db.transaction(STORE, "readonly");
        const [keys, values] = await Promise.all([request(tx.objectStore(STORE).getAllKeys()), request(tx.objectStore(STORE).getAll())]);
        keys.forEach((key, index) => storage.values.set(String(key), values[index] as string));
        if (legacy) await storage.moveIn(legacy);
        return storage;
    }

    /** Asks the browser to keep this site's data under storage pressure (granted or not, the app works the same). */
    static async keep(): Promise<boolean> {
        try {
            return (await navigator.storage?.persist?.()) ?? false;
        } catch {
            return false;
        }
    }

    /** Who hears how each write ended (LocalOrganizationStore, for the saved signal). */
    reportWritesTo(report: WriteReport): void {
        this.onWrite = report;
    }

    private async moveIn(legacy: Storage): Promise<void> {
        const keys: string[] = [];
        for (let i = 0; i < legacy.length; i++) {
            const key = legacy.key(i);
            if (key && isOrganizationKey(key)) keys.push(key);
        }
        if (!keys.length) return;
        const incoming = new Map(keys.map(key => [key, legacy.getItem(key) ?? ""]));
        // The index: the Organizations already kept, then any new ones, by id.
        const INDEX = "northstardust-organizations";
        if (incoming.has(INDEX)) {
            const parse = (text: string | undefined) => { try { const list = JSON.parse(text ?? "[]"); return Array.isArray(list) ? list : []; } catch { return []; } };
            const kept = parse(this.values.get(INDEX));
            const ids = new Set(kept.map((entry: { id?: string }) => entry.id));
            incoming.set(INDEX, JSON.stringify([...kept, ...parse(incoming.get(INDEX)).filter((entry: { id?: string }) => !ids.has(entry.id))]));
        }
        const tx = this.db.transaction(STORE, "readwrite");
        incoming.forEach((value, key) => tx.objectStore(STORE).put(value, key));
        await done(tx);
        incoming.forEach((value, key) => this.values.set(key, value));
        keys.forEach(key => legacy.removeItem(key));
    }

    get length(): number {
        return this.values.size;
    }

    key(index: number): string | null {
        return [...this.values.keys()][index] ?? null;
    }

    getItem(key: string): string | null {
        return this.values.has(key) ? (this.values.get(key) as string) : null;
    }

    setItem(key: string, value: string): void {
        this.values.set(key, value);
        this.persist(key, store => store.put(value, key));
    }

    removeItem(key: string): void {
        this.values.delete(key);
        this.persist(key, store => store.delete(key));
    }

    clear(): void {
        this.values.clear();
        this.persist("*", store => store.clear());
    }

    /** Every write that has been started, finished (for a test, or before the window closes). */
    private writes: Promise<void> = Promise.resolve();

    settled(): Promise<void> {
        return this.writes;
    }

    private persist(key: string, change: (store: IDBObjectStore) => void): void {
        let tx: IDBTransaction;
        try {
            tx = this.db.transaction(STORE, "readwrite");
            change(tx.objectStore(STORE));
        } catch (error) {
            this.onWrite(key, failureReason(error));
            return;
        }
        const write = done(tx).then(() => this.onWrite(key, null), error => this.onWrite(key, failureReason(error)));
        this.writes = this.writes.then(() => write);
    }

}

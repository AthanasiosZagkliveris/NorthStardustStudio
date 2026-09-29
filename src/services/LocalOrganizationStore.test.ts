import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { LocalOrganizationStore, WRITE_DEBOUNCE_MS } from "./LocalOrganizationStore";
import type { OrganizationDocument } from "./OrganizationService";

const DOCUMENT_KEY = "northstardust-organization-org-1";

function organization(name: string): OrganizationDocument {
    return { id: "org-1", name, createdAt: 1, systems: {}, products: [] };
}

/** A Storage whose setItem can be made to fail, and counts its writes. */
function memoryStorage() {

    const items = new Map<string, string>();

    let failure: unknown = null;

    const storage = {
        get length() { return items.size; },
        key: (index: number) => Array.from(items.keys())[index] ?? null,
        getItem: (key: string) => items.get(key) ?? null,
        setItem: vi.fn((key: string, value: string) => {
            if (failure) {
                throw failure;
            }
            items.set(key, value);
        }),
        removeItem: (key: string) => { items.delete(key); },
        clear: () => items.clear()
    };

    return {
        storage: storage as unknown as Storage,
        setItem: storage.setItem,
        items,
        failWith(error: unknown) { failure = error; }
    };

}

beforeEach(() => {
    vi.useFakeTimers();
});

afterEach(() => {
    vi.useRealTimers();
});

describe("LocalOrganizationStore", () => {

    it("collapses a burst of writes into one, after the debounce, while reads see the latest at once", () => {

        const { storage, setItem, items } = memoryStorage();
        const store = new LocalOrganizationStore(storage);

        store.saveDocument(organization("A"));
        store.saveDocument(organization("AB"));
        store.saveDocument(organization("ABC"));

        expect(store.loadDocument("org-1")?.name).toBe("ABC");
        expect(setItem).not.toHaveBeenCalled();
        expect(store.getSaveState()).toEqual({ status: "saving" });

        vi.advanceTimersByTime(WRITE_DEBOUNCE_MS - 1);
        expect(setItem).not.toHaveBeenCalled();

        vi.advanceTimersByTime(1);
        expect(setItem).toHaveBeenCalledTimes(1);
        expect(JSON.parse(items.get(DOCUMENT_KEY) ?? "null").name).toBe("ABC");
        expect(store.getSaveState()).toEqual({ status: "saved" });

    });

    it("writes everything pending at once on flush", () => {

        const { storage, items } = memoryStorage();
        const store = new LocalOrganizationStore(storage);

        store.saveIndex([{ id: "org-1", name: "A", createdAt: 1 }]);
        store.saveDocument(organization("A"));
        store.flush();

        expect(items.has("northstardust-organizations")).toBe(true);
        expect(items.has(DOCUMENT_KEY)).toBe(true);
        expect(store.getSaveState()).toEqual({ status: "saved" });

    });

    it("flushes when the page is hidden or left", () => {

        const { storage, items } = memoryStorage();
        const store = new LocalOrganizationStore(storage);
        store.attachToPage(window);

        store.saveDocument(organization("A"));
        window.dispatchEvent(new Event("pagehide"));

        expect(items.has(DOCUMENT_KEY)).toBe(true);

    });

    it("reports saving, then saved, to subscribers", () => {

        const { storage } = memoryStorage();
        const store = new LocalOrganizationStore(storage);
        const seen: string[] = [];

        store.subscribe(() => seen.push(store.getSaveState().status));

        store.saveDocument(organization("A"));
        store.saveDocument(organization("AB"));
        vi.advanceTimersByTime(WRITE_DEBOUNCE_MS);

        expect(seen).toEqual(["saving", "saved"]);

    });

    it("surfaces a full store as an error, keeps the edit, and recovers on the next successful write", () => {

        const storageMock = memoryStorage();
        const store = new LocalOrganizationStore(storageMock.storage);

        storageMock.failWith(new DOMException("The quota has been exceeded.", "QuotaExceededError"));

        store.saveDocument(organization("Too big"));
        vi.advanceTimersByTime(WRITE_DEBOUNCE_MS);

        expect(store.getSaveState()).toEqual({ status: "error", reason: "storage is full" });
        // Nothing lost from view: the edit is still what reads return.
        expect(store.loadDocument("org-1")?.name).toBe("Too big");

        storageMock.failWith(null);
        store.flush();

        expect(store.getSaveState()).toEqual({ status: "saved" });
        expect(JSON.parse(storageMock.items.get(DOCUMENT_KEY) ?? "null").name).toBe("Too big");

    });

    it("names any other failed write as unavailable storage", () => {

        const storageMock = memoryStorage();
        const store = new LocalOrganizationStore(storageMock.storage);

        storageMock.failWith(new Error("denied"));
        store.saveDocument(organization("A"));
        store.flush();

        expect(store.getSaveState()).toEqual({ status: "error", reason: "storage is unavailable" });

    });

    it("never resurrects a removed document from a pending write", () => {

        const { storage, items } = memoryStorage();
        const store = new LocalOrganizationStore(storage);

        store.saveDocument(organization("A"));
        store.removeDocument("org-1");
        vi.advanceTimersByTime(WRITE_DEBOUNCE_MS);

        expect(items.has(DOCUMENT_KEY)).toBe(false);
        expect(store.loadDocument("org-1")).toBeNull();
        expect(store.getSaveState()).toEqual({ status: "saved" });

    });

});

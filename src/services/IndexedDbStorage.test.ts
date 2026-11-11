import "fake-indexeddb/auto";
import { IDBFactory } from "fake-indexeddb";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { IndexedDbStorage } from "./IndexedDbStorage";
import { LocalOrganizationStore } from "./LocalOrganizationStore";

beforeEach(() => {
    // A fresh database for every test.
    globalThis.indexedDB = new IDBFactory();
    localStorage.clear();
});

afterEach(() => localStorage.clear());

describe("the Organizations in IndexedDB", () => {

    it("reads what was written, at once and after the app starts again", async () => {
        const first = await IndexedDbStorage.open(null);
        first.setItem("northstardust-organization-a", "{\"id\":\"a\"}");
        expect(first.getItem("northstardust-organization-a")).toBe("{\"id\":\"a\"}");
        await first.settled();
        const again = await IndexedDbStorage.open(null);
        expect(again.getItem("northstardust-organization-a")).toBe("{\"id\":\"a\"}");
        again.removeItem("northstardust-organization-a");
        await again.settled();
        expect((await IndexedDbStorage.open(null)).getItem("northstardust-organization-a")).toBeNull();
    });

    it("moves an earlier version's Organizations in from localStorage, and leaves the theme and the notes there", async () => {
        localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: "a", name: "A", createdAt: 1 }]));
        localStorage.setItem("northstardust-organization-a", "{\"id\":\"a\"}");
        localStorage.setItem("northstardust-selected-organization", "a");
        localStorage.setItem("northstardust-theme", "dark");
        const storage = await IndexedDbStorage.open(localStorage);
        expect(storage.getItem("northstardust-organization-a")).toBe("{\"id\":\"a\"}");
        expect(storage.getItem("northstardust-selected-organization")).toBe("a");
        expect(localStorage.getItem("northstardust-organization-a")).toBeNull();
        expect(localStorage.getItem("northstardust-organizations")).toBeNull();
        expect(localStorage.getItem("northstardust-theme")).toBe("dark");
    });

    it("adds an Organization seeded in localStorage later to the ones already kept, by id", async () => {
        const first = await IndexedDbStorage.open(null);
        first.setItem("northstardust-organizations", JSON.stringify([{ id: "a", name: "A", createdAt: 1 }]));
        await first.settled();
        localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: "a", name: "A", createdAt: 1 }, { id: "b", name: "B", createdAt: 2 }]));
        localStorage.setItem("northstardust-organization-b", "{\"id\":\"b\"}");
        const storage = await IndexedDbStorage.open(localStorage);
        expect(JSON.parse(storage.getItem("northstardust-organizations") ?? "[]").map((entry: { id: string }) => entry.id)).toEqual(["a", "b"]);
        expect(storage.getItem("northstardust-organization-b")).toBe("{\"id\":\"b\"}");
    });

    it("keeps the store's debounce and saved signal: saving, then saved once IndexedDB has it", async () => {
        const storage = await IndexedDbStorage.open(null);
        const store = new LocalOrganizationStore(localStorage, 0);
        store.useStorage(storage);
        store.saveIndex([{ id: "a", name: "A", createdAt: 1 }]);
        expect(store.getSaveState().status).toBe("saving");
        store.flush();
        await storage.settled();
        expect(store.getSaveState().status).toBe("saved");
        expect(store.loadIndex().map(entry => entry.id)).toEqual(["a"]);
    });

});

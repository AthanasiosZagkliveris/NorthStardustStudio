import { beforeEach, describe, expect, it } from "vitest";

import lumen from "../../docs/examples/lumen-and-loom-studio.json";
import { OrganizationService } from "./OrganizationService";
import { refreshExampleOrganizations } from "./ExampleOrganizations";

const stored = (id: string) => {
    OrganizationService.flushPendingWrites();
    return JSON.parse(localStorage.getItem(`northstardust-organization-${id}`) ?? "null");
};

beforeEach(() => {
    OrganizationService.flushPendingWrites();
    localStorage.clear();
});

describe("Reload refreshes the saved examples", () => {

    it("replaces the copy that has the example's id, keeping its name and creation time", () => {
        const id = (lumen as { id: string }).id;
        localStorage.setItem("northstardust-organizations", JSON.stringify([{ id, name: "My Lumen", createdAt: 5 }]));
        localStorage.setItem(`northstardust-organization-${id}`, JSON.stringify({ id, name: "My Lumen", createdAt: 5, STALE: true, systems: {} }));
        expect(refreshExampleOrganizations()).toEqual([id]);
        const now = stored(id);
        expect(now.STALE).toBeUndefined();
        expect(now.name).toBe("My Lumen");
        expect(now.createdAt).toBe(5);
    });

    it("replaces an imported copy too (a new id, the example's name)", () => {
        const name = (lumen as { name: string }).name;
        localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: "org-imported", name, createdAt: 9 }, { id: "org-other", name: "Other", createdAt: 1 }]));
        localStorage.setItem("northstardust-organization-org-imported", JSON.stringify({ id: "org-imported", name, STALE: true, systems: {} }));
        localStorage.setItem("northstardust-organization-org-other", JSON.stringify({ id: "org-other", name: "Other", KEEP: true, systems: {} }));
        expect(refreshExampleOrganizations()).toEqual(["org-imported"]);
        expect(stored("org-imported").STALE).toBeUndefined();
        expect(stored("org-imported").id).toBe("org-imported");
        expect(stored("org-other").KEEP).toBe(true);
    });

    it("brings back no example that is not among the saved ones", () => {
        expect(refreshExampleOrganizations()).toEqual([]);
    });

});

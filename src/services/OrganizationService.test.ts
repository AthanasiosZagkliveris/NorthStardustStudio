import { beforeEach, describe, expect, it } from "vitest";

import {
    ORGANIZATION_FORMAT_VERSION,
    OrganizationService,
    UnsupportedFormatVersionError,
    organizationFormatVersion
} from "./OrganizationService";

function storedDocument(organizationId: string): Record<string, unknown> {

    OrganizationService.flushPendingWrites();

    return JSON.parse(localStorage.getItem(`northstardust-organization-${organizationId}`) ?? "null");

}

beforeEach(() => {
    OrganizationService.flushPendingWrites();
    localStorage.clear();
});

describe("Organization format version", () => {

    it("reads a document without a version as version 1, and a stamped one as its own", () => {

        expect(organizationFormatVersion({})).toBe(1);
        expect(organizationFormatVersion({ formatVersion: "2" })).toBe(1);
        expect(organizationFormatVersion({ formatVersion: 2 })).toBe(2);
        expect(ORGANIZATION_FORMAT_VERSION).toBe(2);

    });

    it("writes version 2 into every saved document", () => {

        const created = OrganizationService.create("Quillfield");

        expect(storedDocument(created.id).formatVersion).toBe(2);

    });

    it("reads a version 1 document, and saves it back as version 2", () => {

        localStorage.setItem("northstardust-organizations", JSON.stringify([{ id: "org-old", name: "Old", createdAt: 1 }]));
        localStorage.setItem("northstardust-organization-org-old", JSON.stringify({
            id: "org-old", name: "Old", createdAt: 1, systems: { "1": { systemNumber: 1 } }, products: []
        }));

        const loaded = OrganizationService.loadDocument("org-old");

        expect(loaded?.systems["1"]).toEqual({ systemNumber: 1 });
        expect(loaded?.formatVersion).toBeUndefined();

        OrganizationService.rename("org-old", "Renamed");

        expect(storedDocument("org-old")).toMatchObject({ name: "Renamed", formatVersion: 2 });

    });

    it("exports version 2, also for a document last saved as version 1", () => {

        localStorage.setItem("northstardust-organization-org-old", JSON.stringify({
            id: "org-old", name: "Old", createdAt: 1, systems: {}, products: []
        }));

        expect(OrganizationService.exportDocument("org-old")?.formatVersion).toBe(2);
        // The stored document itself is left as it was.
        expect(storedDocument("org-old").formatVersion).toBeUndefined();

    });

    it("imports version 1 and version 2 files, saving both as version 2", () => {

        const fromOne = OrganizationService.importDocument({ name: "One", systems: {}, products: [] });
        const fromTwo = OrganizationService.importDocument({ formatVersion: 2, name: "Two", systems: {}, products: [] });

        expect(fromOne && storedDocument(fromOne.id).formatVersion).toBe(2);
        expect(fromTwo && storedDocument(fromTwo.id).formatVersion).toBe(2);

    });

    it("refuses a file from a newer format with a clear error, and adds nothing", () => {

        expect(() => OrganizationService.importDocument({ formatVersion: 3, name: "Future", systems: {} }))
            .toThrow(UnsupportedFormatVersionError);

        expect(OrganizationService.list()).toEqual([]);

    });

});

describe("The last place worked", () => {

    it("is stored with the organization, and saved only when it changes", () => {

        const created = OrganizationService.create("Quillfield");

        expect(OrganizationService.getLastPlace(created.id)).toBeNull();

        OrganizationService.setLastPlace(created.id, { systemNumber: 3, sectionIndex: 2, anchor: "founders" });

        expect(storedDocument(created.id).lastPlace).toEqual({ systemNumber: 3, sectionIndex: 2, anchor: "founders" });

        const before = localStorage.getItem(`northstardust-organization-${created.id}`);
        OrganizationService.setLastPlace(created.id, { systemNumber: 3, sectionIndex: 2, anchor: "founders" });
        OrganizationService.flushPendingWrites();
        expect(localStorage.getItem(`northstardust-organization-${created.id}`)).toBe(before);

        // No anchor: the field is left out rather than stored empty.
        OrganizationService.setLastPlace(created.id, { systemNumber: 1, sectionIndex: 0, anchor: undefined });
        expect(storedDocument(created.id).lastPlace).toEqual({ systemNumber: 1, sectionIndex: 0 });

    });

});

import { Capability } from "../types/capability";

export const capabilities: Capability[] = [
  {
    id: "foundation",
    title: "Foundation",
    color: "#0F172A",
  },
  {
    id: "deliver-value",
    title: "Deliver Value",
    color: "#0D5929",
  },
  {
    id: "manage-information",
    title: "Manage Information",
    color: "#A45D0A",
  },
  {
    id: "manage-organization",
    title: "Manage the Organization",
    color: "#1C4AB0",
  },
  {
    id: "communicate",
    title: "Communicate",
    color: "#BB4B11",
  },
  {
    id: "measure-improve",
    title: "Measure & Improve",
    color: "#531FAD",
  },
];

/**
 * Looks up a Capability's colour by id, with a
 * safe neutral fallback so an unrecognised
 * Capability id never breaks rendering.
 */
export function getCapabilityColor(capabilityId: string | undefined | null): string {

    const capability = capabilities.find(candidate => candidate.id === capabilityId);

    return capability?.color ?? "#111827";

}
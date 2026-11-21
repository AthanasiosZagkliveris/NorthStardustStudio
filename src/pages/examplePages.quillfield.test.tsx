import { vi } from "vitest";

import { describeExamplePages, EXAMPLES, useExamplesSaved } from "./examplePagesShared";

/* Every page of Quillfield Automation, as it reads today (examplePagesShared.tsx says why). */

vi.mock("../components/calendar/OrganizationCalendarPanel", () => ({ default: () => null }));

useExamplesSaved();
describeExamplePages(EXAMPLES.quillfield);

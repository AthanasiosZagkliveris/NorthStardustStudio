import { beforeAll } from "vitest";
import { preloadPageEditors } from "../components/interview/editors/answer/pageEditors.tsx";

// The page editors load when needed in the app (pageEditors.tsx); the tests fetch them before they run, so a page draws at once.
// (In beforeAll, after the test file's own imports, so a test file's vi.mock of an editor is the one fetched.)
beforeAll(async () => {
    await preloadPageEditors();
});

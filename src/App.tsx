import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import TitleTooltips from "./components/controls/TitleTooltips";

// Loaded lazily, one chunk per page, instead of all four being
// bundled and evaluated together up front. This matters most for
// Conversation -- importing it also runs FrameworkRegistry's
// module-level setup, which eagerly reads the raw Markdown for
// every one of the 24 Systems (~470KB of text) into memory. Before
// this change that happened at app startup even for someone who
// only ever looks at the Landing page; now it only happens once
// the user actually opens an interview.
const Landing = lazy(() => import("./pages/Landing"));
const SystemSelection = lazy(() => import("./pages/SystemSelection"));
const Conversation = lazy(() => import("./pages/Conversation"));
const CapabilityGenerator = lazy(() => import("./pages/CapabilityGenerator"));
const BusinessDocuments = lazy(() => import("./pages/BusinessDocuments"));
const Review = lazy(() => import("./pages/Review"));
const GlobalSettings = lazy(() => import("./pages/GlobalSettings"));

// The asset library's gallery: development only (`npm run dev`), absent from the built app.
const Library = import.meta.env.DEV ? lazy(() => import("./pages/Library")) : null;
const Inventory = import.meta.env.DEV ? lazy(() => import("./pages/Inventory")) : null;
const Looks = import.meta.env.DEV ? lazy(() => import("./pages/Looks")) : null;

export default function App() {

    return (

        <Suspense fallback={null}>

            <TitleTooltips />

            <Routes>

                <Route
                    path="/"
                    element={<Landing />}
                />

                <Route
                    path="/assistant"
                    element={<SystemSelection />}
                />

                <Route
                    path="/introduction"
                    element={<Conversation />}
                />

                <Route
                    path="/conversation"
                    element={<Conversation />}
                />

                <Route
                    path="/documents"
                    element={<BusinessDocuments />}
                />

                <Route
                    path="/review"
                    element={<Review />}
                />

                <Route
                    path="/settings"
                    element={<GlobalSettings />}
                />

                <Route
                    path="/generator"
                    element={<CapabilityGenerator />}
                />

                {Library && <Route path="/library" element={<Library />} />}

                {Inventory && <Route path="/library/inventory" element={<Inventory />} />}

                {Looks && <Route path="/library/looks" element={<Looks />} />}

            </Routes>

        </Suspense>

    );

}

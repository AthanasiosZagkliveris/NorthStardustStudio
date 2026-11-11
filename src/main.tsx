import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

/*
    Inter in every weight the styles use. With only the default
    (400) loaded, the browser drew 500, 600 and 700 as a fake bold,
    which looks blurred.
*/
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

import "./styles/colors.generated.css";
import "./styles/sizes.generated.css";
import "./styles/colors.css";
import "./styles/global.css";
import "./styles/remove-button.css";

import App from "./App";
// (After the App and every stylesheet it brings: the one look of the text links outranks the older rules of the pages.)
import "./styles/text-links.css";
import "./styles/cell-focus.css";
import "./styles/back-button.css";
import { installTextLinkMarquee } from "./components/interview/fields/textLinks.ts";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeService } from "./services/ThemeService";
import { IndexedDbStorage } from "./services/IndexedDbStorage";
import { keepOrganizationsIn } from "./services/OrganizationService";

// The theme is already on <html> (public/theme-init.js, loaded by index.html); from here Auto also
// follows the system's setting while the app is open.
ThemeService.start();
installTextLinkMarquee();

// THE ORGANIZATIONS live in IndexedDB (IndexedDbStorage.ts): opened, read into memory and, the first time, moved in from
// localStorage, before the app draws, so every read after it sees them. Where IndexedDB cannot open, the app stays on localStorage.
async function start() {
    try {
        keepOrganizationsIn(await IndexedDbStorage.open());
        void IndexedDbStorage.keep();
    } catch (error) {
        console.error("The Organizations stay in localStorage: IndexedDB did not open.", error);
    }
    ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
        <React.StrictMode>
            <ErrorBoundary>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </ErrorBoundary>
        </React.StrictMode>
    );
}

void start();
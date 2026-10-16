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
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ThemeService } from "./services/ThemeService";

// The theme is already on <html> (index.html); from here Auto also
// follows the system's setting while the app is open.
ThemeService.start();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
    <React.StrictMode>
        <ErrorBoundary>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </ErrorBoundary>
    </React.StrictMode>
);
import { ReactNode } from "react";
import { useInRouterContext, useLocation, useNavigate } from "react-router-dom";
import TextLink from "./TextLink.tsx";

/**
 * A TEXT LINK TO THE GLOBAL SETTINGS, where a figure read on a page is changed (a subchannel's fees: doc 50, section 1.4). It opens the screen as the header's
 * Settings button does, remembering where it was opened from so Back returns there. (Outside the app's router -- a page drawn on its own -- it is plain words.)
 */
export default function GlobalSettingsLink({ children, className }: { children: ReactNode; className?: string }) {
    return useInRouterContext()
        ? <RoutedLink className={className}>{children}</RoutedLink>
        : <span className={className}>{children}</span>;
}

function RoutedLink({ children, className }: { children: ReactNode; className?: string }) {
    const navigate = useNavigate();
    const location = useLocation();
    return (
        <TextLink className={className} onClick={() => navigate("/settings", { state: { from: { pathname: location.pathname, state: location.state } } })}>
            {children}
        </TextLink>
    );
}

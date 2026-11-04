import { openUrl } from "@tauri-apps/plugin-opener";

import { harvardParts, isAcceptedUrl, type Source } from "../../framework/engine/Sources.ts";
import TextLink from "../interview/fields/TextLink.tsx";

/**
 * Opens a source link in the reader's own browser, never inside the
 * app window: a citation is somewhere to leave to, not a page to
 * navigate the app away from. `openUrl` is the Tauri opener plugin,
 * already a dependency; outside Tauri (a plain browser tab in
 * development, or a test) its `invoke` call rejects, and the
 * `window.open` in the `.catch` stands in. The anchor's own default
 * navigation is always prevented.
 */
export function openExternal(href: string) {
    openUrl(href).catch(() => window.open(href, "_blank", "noreferrer"));
}

/**
 * ONE HARVARD REFERENCE (Sources.ts, `harvardParts`): the authors and
 * year, the title of the work in italics, and its address, which is
 * the link -- opened in the reader's own browser. A source whose
 * address is not on an accepted domain is drawn as plain text, never
 * as a link. Used by the "i" notes and by the References page.
 */
export default function HarvardReference({ source }: { source: Source }) {
    const linked = isAcceptedUrl(source.url);
    return (
        <span className="harvard-reference">
            {harvardParts(source).map((part, at) => part.italic
                ? <em key={at}>{part.text}</em>
                : part.link && linked
                    ? (
                        <TextLink as="a" key={at}
                            className="business-engagement-link info-note-link harvard-reference-url"
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => {
                                event.preventDefault();
                                openExternal(source.url);
                            }}
                        >
                            {part.text}
                        </TextLink>
                    )
                    : part.link
                        ? <span key={at} className="harvard-reference-url">{part.text}</span>
                        : <span key={at}>{part.text}</span>)}
        </span>
    );
}

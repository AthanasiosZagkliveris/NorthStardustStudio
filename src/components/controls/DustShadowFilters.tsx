/**
 * THE DUST SHADOW (owner, 2026-11-10: "I want the shadows short and smooth, spread as dust noise, not as bands around defined forms"; "let's try it").
 * Two SVG filters, drawn once for the whole app (App.tsx) and named by global.css:
 *  - `#dust-shadow`: what a box casts -- its own shape blurred and set a little lower, sprinkled with fine noise, under the box itself (menus, funnel
 *    windows, a tile grown under the pointer);
 *  - `#dust-grain`: the same noise over a band that is already a soft gradient (the header's).
 * The noise takes away part of the shade grain by grain, so the shadow thins out as dust rather than as a band round the box's outline.
 */
export default function DustShadowFilters() {
    return (
        <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}>
            <defs>
                <filter id="dust-shadow" x="-30%" y="-30%" width="160%" height="175%" colorInterpolationFilters="sRGB">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="7" result="blurred" />
                    <feOffset in="blurred" dy="5" result="lowered" />
                    <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" stitchTiles="stitch" result="noise" />
                    <feComposite in="lowered" in2="noise" operator="in" result="grained" />
                    <feColorMatrix in="grained" type="matrix" values="0 0 0 0 0.067  0 0 0 0 0.094  0 0 0 0 0.153  0 0 0 0.5 0" result="shade" />
                    <feMerge>
                        <feMergeNode in="shade" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
                <filter id="dust-grain" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
                    <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="7" stitchTiles="stitch" result="noise" />
                    <feComposite in="SourceGraphic" in2="noise" operator="in" />
                </filter>
            </defs>
        </svg>
    );
}

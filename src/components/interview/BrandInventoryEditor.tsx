import { CSSProperties, DragEvent, ReactNode, useRef, useState } from "react";
import InfoNote, { InfoPoint, InfoText } from "./InfoNote.tsx";

import {
    BRAND_IMAGE_MAX,
    BRAND_IMAGE_MIN,
    BRAND_INVENTORY_SECTIONS,
    BrandAssetValue,
    BrandInventoryAnswerValue,
    asBrandInventoryValue
} from "../../framework/engine/AnswerUtils.ts";
import { railId } from "./rails/railItems.ts";

interface BrandInventoryEditorProps {

    value: unknown;

    onChange: (value: BrandInventoryAnswerValue) => void;

    disabled?: boolean;

    /** See BrandStyleEditor.startNumber -- this page starts at 8. */
    /** A page numbered under its own number ("2" gives 2.1, 2.2): see AnswerDefinition.nestedNumbering. */
    numberPrefix?: string;

    startNumber?: number;

    /** See BrandStyleEditor.columnsDivider. */
    columnsDivider?: ReactNode;

    /**
     * Whether the bullet guidance above the progress line shows.
     * Toggled by the Help button the page renders just above that
     * line -- see AnswerRendererProps.showInstructions.
     */
    showInstructions?: boolean;

}

// Everything this app saves goes into localStorage as JSON, and an
// image embedded as a data URL costs ~33% more than its raw bytes
// (base64). Measured headroom is around 12MB for the WHOLE origin --
// every Organization, all 24 Systems -- so an Inventory page holding
// up to 9 images needs a hard per-image ceiling, or one photo
// straight off a phone would exhaust the quota and break saving for
// everything else, not just this page.
const MAX_IMAGE_EDGE = 1400;
const RASTER_QUALITY = 0.82;

// Per-slot upload ceilings, checked BEFORE any processing so an
// oversized file is refused immediately rather than after a slow
// decode. Icons and logos are marks, not photographs, so they get
// the smaller budget; brand images are photographic and get the
// larger one.
//
// Worth knowing what a full page now costs: 4 marks at 50kB plus
// 5 images at 500kB is ~2.7MB of file, and base64 inflates that
// to ~3.6MB in localStorage -- roughly a quarter of the ~12.8MB
// measured headroom for the WHOLE origin (every Organization, all
// 24 Systems). Three or four Organizations filling this page to
// the limit would exhaust the quota and break saving app-wide.
const MAX_MARK_BYTES = 50 * 1024;
const MAX_BRAND_IMAGE_BYTES = 500 * 1024;

// Hard ceiling per stored asset, checked AFTER downscaling. An SVG
// is text and is stored as-is, so it gets the same ceiling to stop a
// pathological one doing the same damage.
const MAX_ASSET_BYTES = 900 * 1024;

const SVG_TYPE = "image/svg+xml";

function formatBytes(bytes: number): string {
    return bytes >= 1024 * 1024
        ? `${Math.round(bytes / (1024 * 1024))}MB`
        : `${Math.round(bytes / 1024)}KB`;
}

function readAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(new Error("Could not read the file."));
        reader.readAsDataURL(file);
    });
}

/**
 * Roughly how many bytes a data URL occupies once stored. base64
 * encodes 3 bytes as 4 characters, so the payload is ~3/4 of the
 * string's length; the small header is ignored.
 */
function approximateBytes(dataUrl: string): number {
    const payload = dataUrl.slice(dataUrl.indexOf(",") + 1);
    return Math.round(payload.length * 0.75);
}

/**
 * Downscales a raster image so its longest edge fits MAX_IMAGE_EDGE
 * and re-encodes it as JPEG. SVGs pass through untouched -- they're
 * already small, and rasterizing a vector logo would defeat the
 * point of uploading one.
 */
async function prepareImage(file: File, rasterize: boolean): Promise<string> {

    const dataUrl = await readAsDataUrl(file);

    if (file.type === SVG_TYPE) {
        return dataUrl;
    }

    // An icon or logo is stored byte-for-byte. Two reasons: it is
    // already capped at 10kB so there is nothing to save, and
    // re-encoding a PNG as JPEG would flatten its transparency onto
    // black -- which is exactly wrong for a mark meant to sit on any
    // background.
    if (!rasterize) {
        return dataUrl;
    }

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const element = new Image();
        element.onload = () => resolve(element);
        element.onerror = () => reject(new Error("Could not read that image."));
        element.src = dataUrl;
    });

    const longest = Math.max(image.width, image.height);
    const scale = longest > MAX_IMAGE_EDGE ? MAX_IMAGE_EDGE / longest : 1;

    if (scale === 1 && approximateBytes(dataUrl) <= MAX_ASSET_BYTES) {
        return dataUrl;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);

    const context = canvas.getContext("2d");

    if (!context) {
        return dataUrl;
    }

    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg", RASTER_QUALITY);

}

/**
 * The Brand System's Inventory page (see AnswerType.BrandInventory).
 *
 * Same above/below-the-line arrangement as the Style page and the
 * Identity System's columns: headings and bullet guidance sit above
 * the progress line, the upload controls below it.
 *
 * Uploads are downscaled and embedded as data URLs rather than
 * written to disk, because this app has no filesystem access. An
 * upload that would still be too large after downscaling is REFUSED
 * with a message rather than stored, so a single oversized file can
 * never exhaust the quota and silently break saving across the app.
 */
/* ---------- Help: how to choose (the column "i"s) ---------- */

const SHAPE_ASSOCIATIONS: InfoPoint[] = [
    { title: "Circle", text: "unity, community, harmony and continuity." },
    { title: "Square", text: "stability, structure, reliability and balance." },
    { title: "Rectangle", text: "order, practicality, structure and professionalism." },
    { title: "Triangle", text: "direction, progress, strength and movement." },
    { title: "Hexagon", text: "balance, connection, efficiency and structure." },
    { title: "Organic shapes", text: "natural, friendly, creative and approachable." },
    { title: "Abstract shapes", text: "distinctive, conceptual and open to interpretation." },
    "These are common visual associations rather than fixed meanings."
];

const IMAGE_TYPES: InfoPoint[] = [
    { title: "Product", text: "shows what the organisation creates or offers." },
    { title: "People", text: "communicates human connection and relationships." },
    { title: "Environment", text: "establishes place, atmosphere and context." },
    { title: "Process", text: "shows making, working or craft." },
    { title: "Lifestyle", text: "shows how the brand fits into people's lives." },
    { title: "Detail", text: "highlights materials, textures, patterns or distinctive features." },
    { title: "Abstract", text: "communicates mood, ideas or visual character without a literal subject." },
    { title: "Editorial", text: "creates a considered and distinctive visual direction." }
];

export default function BrandInventoryEditor({

    value,

    onChange,

    disabled = false,

    startNumber = 1,

    numberPrefix,

    columnsDivider,

    showInstructions = true

}: BrandInventoryEditorProps) {

    const inventory = asBrandInventoryValue(value);

    const [error, setError] = useState<string>("");

    async function acceptFile(
        file: File | undefined,
        expected: "png" | "svg" | "any",
        apply: (asset: BrandAssetValue) => void
    ) {

        if (!file) {
            return;
        }

        setError("");

        if (expected === "svg" && file.type !== SVG_TYPE) {
            setError(`"${file.name}" is not an SVG.`);
            return;
        }

        if (expected === "png" && file.type !== "image/png") {
            setError(`"${file.name}" is not a PNG.`);
            return;
        }

        if (expected === "any" && !file.type.startsWith("image/")) {
            setError(`"${file.name}" is not an image.`);
            return;
        }

        const cap = expected === "any" ? MAX_BRAND_IMAGE_BYTES : MAX_MARK_BYTES;

        if (file.size > cap) {
            setError(
                `"${file.name}" is ${formatBytes(file.size)}. ` +
                `The limit is ${formatBytes(cap)}.`
            );
            return;
        }

        try {

            const dataUrl = await prepareImage(file, expected === "any");

            if (approximateBytes(dataUrl) > cap) {
                setError(
                    `"${file.name}" is still over ${formatBytes(cap)} ` +
                    "after resizing. Please use a smaller file."
                );
                return;
            }

            apply({ dataUrl, fileName: file.name });

        } catch {

            setError(`"${file.name}" could not be read as an image.`);

        }

    }

    function setMark(
        mark: "icon" | "logo",
        format: "png" | "svg",
        asset: BrandAssetValue | undefined
    ) {
        onChange({ ...inventory, [mark]: { ...inventory[mark], [format]: asset } });
    }

    function updateImage(index: number, patch: Partial<BrandInventoryAnswerValue["images"][number]>) {
        onChange({
            ...inventory,
            images: inventory.images.map(
                (image, position) => position === index ? { ...image, ...patch } : image
            )
        });
    }

    /**
     * The control sits in the corner of the holder, so it removes
     * the IMAGE -- not the slot, and not the Name and Short
     * description typed beside it. Those are the user's own words
     * and survive swapping or dropping the picture they were
     * written about; deleting them was never asked for and cannot
     * be undone.
     *
     * The one case where the slot itself goes is when it would be
     * left completely empty -- no image, no text -- and the page
     * is above the two slots it always shows. That is the only way
     * a slot added for a third, fourth or fifth image can be given
     * back, and it destroys nothing, because there is nothing left
     * in it to destroy.
     */
    function removeImage(index: number) {

        const image = inventory.images[index];

        const wouldBeEmpty = !image.name.trim() && !image.description.trim();

        if (wouldBeEmpty && inventory.images.length > BRAND_IMAGE_MIN) {

            onChange({
                ...inventory,
                images: inventory.images.filter((_other, position) => position !== index)
            });

            return;

        }

        updateImage(index, { dataUrl: "", fileName: "" });

    }

    function heading(offset: number) {
        return (
            <h3 className="answer-column-label brand-section-heading">
                <span className="answer-column-label-number">
                    {numberPrefix ? numberPrefix + "." + (offset + 1) : (startNumber + offset) + "."}
                </span>
                <span className="answer-column-label-text">
                    {BRAND_INVENTORY_SECTIONS[offset]}
                </span>
            </h3>
        );
    }

    function bullets(lines: ReactNode[]) {
        // Nothing at all when the page's Help button has hidden
        // the guidance -- an empty block would still take a grid
        // track and its gap.
        if (!showInstructions) {
            return null;
        }

        return (
            <div className="answer-column-questions">
                {lines.map((line, index) => (
                    <span key={index} className="answer-question-line answer-question-line-bullet">
                        {"• "}{line}
                    </span>
                ))}
            </div>
        );
    }

    function renderMarkSlot(mark: "icon" | "logo", format: "png" | "svg") {

        const label = `${mark === "icon" ? "Icon" : "Logo"} ${format.toUpperCase()}`;
        const asset = inventory[mark][format];

        return (

            <DropZone
                key={label}
                label={label}
                accept={format === "svg" ? SVG_TYPE : "image/png"}
                disabled={disabled}
                asset={asset}
                onFile={(file) => acceptFile(file, format, (next) => setMark(mark, format, next))}
                onClear={() => setMark(mark, format, undefined)}
            />

        );

    }

    return (

        <div
            className="brand-inventory"
            style={{ "--answer-column-count": 2 } as CSSProperties}
        >

            {/*
                Row 1 -- headings, above the line.

                The guidance deliberately does NOT repeat what the
                page already shows: the holders say "Drag or click"
                themselves, and the fields carry Name / Short
                description placeholders. Only the size limits are
                stated here, because nothing else surfaces them until
                an upload is refused.
            */}
            <div className="brand-style-head">
                {heading(0)}
                {bullets([
                    `Upload your icon and logo in both PNG and SVG formats, with a maximum file size of ${MAX_MARK_BYTES / 1024} KB each.`,
                    <>
                        <InfoText text="Choose an icon and logo that represent your organisation clearly and consistently.">
                            <InfoNote label="Shape characteristics & common associations" points={SHAPE_ASSOCIATIONS} fullList />
                        </InfoText>
                    </>,
                    "Icon vs Logo: the icon should remain recognisable at small sizes, while the logo can combine the icon with the organisation name."
                ])}
            </div>

            <div className="brand-style-head">
                {heading(1)}
                {bullets([
                    `Upload ${BRAND_IMAGE_MIN}–${BRAND_IMAGE_MAX} images that represent the visual character of your brand, with a maximum file size of ${MAX_BRAND_IMAGE_BYTES / 1024} KB each.`,
                    <>
                        <InfoText text="Choose images that consistently communicate your brand's visual character, atmosphere and subject matter.">
                            <InfoNote label="Image types & common purposes" points={IMAGE_TYPES} fullList />
                        </InfoText>
                    </>,
                    "Image selection: choose images with a recognisable visual character through subject matter, composition, lighting, colour, texture or atmosphere.",
                    "Variety: use different subjects or perspectives while maintaining enough consistency for the collection to feel like one brand."
                ])}
            </div>

            {/* Row 2 -- the progress line, spanning both columns */}
            {columnsDivider && (
                <div className="answer-columns-divider">{columnsDivider}</div>
            )}

            {/* Row 3 -- the uploads, below the line */}
            {error && (
                <p className="brand-inventory-error" role="alert">{error}</p>
            )}

            <div className="brand-style-body" data-rail={railId(BRAND_INVENTORY_SECTIONS[0])}>

                {/*
                    Two sub-columns: ICON on the left at 150px
                    wide, LOGO on the right at 600px, each with
                    SVG above PNG. The two share one row grid so
                    the SVG holders sit level with each other and
                    the PNG holders below them do too.
                */}
                <div className="brand-mark-columns">

                    <div className="brand-mark-column brand-mark-column-icon">
                        {renderMarkSlot("icon", "svg")}
                        {renderMarkSlot("icon", "png")}
                    </div>

                    <div className="brand-mark-column brand-mark-column-logo">
                        {renderMarkSlot("logo", "svg")}
                        {renderMarkSlot("logo", "png")}
                    </div>

                </div>

            </div>

            <div className="brand-style-body" data-rail={railId(BRAND_INVENTORY_SECTIONS[1])}>

                {/*
                    Rendered through the SAME DropZone the Icon and
                    Logo slots use, so an image's label, holder and
                    Replace/Remove buttons sit exactly where theirs
                    do. Its `aside` carries the Name and Short
                    Description fields, which sit beside the holder
                    and are on screen from the start -- an empty slot
                    shows them just as a filled one does, so nothing
                    has to be uploaded before the page reveals what
                    it will ask for.
                */}
                {inventory.images.map((image, index) => (

                    <DropZone
                        key={index}
                        label={`Image ${index + 1}`}
                        accept="image/*"
                        disabled={disabled}
                        asset={image.dataUrl ? image : undefined}
                        onFile={(file) => acceptFile(file, "any", (asset) => updateImage(index, asset))}
                        onClear={() => removeImage(index)}
                        aside={
                            <>
                                <input
                                    type="text"
                                    className="interview-input"
                                    aria-label={`Image ${index + 1} name`}
                                    placeholder="Name"
                                    disabled={disabled}
                                    value={image.name}
                                    onChange={(event) => updateImage(index, { name: event.target.value })}
                                />

                                {/*
                                    Two lines rather than one, which
                                    is both what a short description
                                    actually needs and what makes the
                                    field stack end level with the
                                    bottom of the holder beside it.
                                */}
                                <textarea
                                    rows={2}
                                    className="interview-input brand-image-note"
                                    aria-label={`Image ${index + 1} description`}
                                    placeholder="Short description"
                                    disabled={disabled}
                                    value={image.description}
                                    onChange={(event) => updateImage(index, { description: event.target.value })}
                                />
                            </>
                        }
                    />

                ))}

                {/*
                    The way to go past the two default slots. Held
                    back until both of those are actually filled --
                    otherwise it would sit there as a third empty
                    holder next to two empty ones, which reads as
                    clutter rather than an invitation.
                */}
                {inventory.images.every((image) => image.dataUrl) &&
                 inventory.images.length < BRAND_IMAGE_MAX && (

                    <DropZone
                        label={`Image ${inventory.images.length + 1}`}
                        accept="image/*"
                        disabled={disabled}
                        asset={undefined}
                        onFile={(file) => acceptFile(file, "any", (asset) => onChange({
                            ...inventory,
                            images: [...inventory.images, { ...asset, name: "", description: "" }]
                        }))}
                    />

                )}

            </div>

        </div>

    );

}

/**
 * One upload slot: a preview that doubles as a drop target, plus a
 * button that opens the file dialog.
 *
 * The whole slot accepts a drag-and-drop, but the BUTTON is what
 * carries the accessible name and keyboard operation -- a drop
 * target alone is unreachable without a pointer, so the button is
 * the equivalent path rather than a nicety.
 */
function DropZone({

    label,

    accept,

    disabled,

    asset,

    onFile,

    onClear,

    aside

}: {

    label: string;

    accept: string;

    disabled: boolean;

    asset: BrandAssetValue | undefined;

    onFile: (file: File | undefined) => void;

    onClear?: () => void;

    /**
     * Extra controls placed BESIDE the holder rather than under it
     * -- the Brand Images section's Name and Short Description
     * fields. Omitted by the Icon and Logo slots, which have
     * nothing beside their holder.
     */
    aside?: ReactNode;

}) {

    const inputRef = useRef<HTMLInputElement | null>(null);

    const [dragging, setDragging] = useState(false);

    function handleDrop(event: DragEvent<HTMLElement>) {

        event.preventDefault();

        setDragging(false);

        if (disabled) {
            return;
        }

        onFile(event.dataTransfer.files?.[0]);

    }

    return (

        <div className="brand-asset-slot">

            <div className="brand-slot-label">{label}</div>

            <div className={aside ? "brand-slot-split" : "brand-slot-single"}>

            <div className="brand-slot-main">

            {/*
                The holder IS the upload control -- a real <button>,
                not a clickable div, so it is reachable by Tab and
                operable with Enter/Space like any other control.
                That removes the need for a separate Upload/Replace
                button beside it.

                Removal stays available as a small control in the
                holder's own corner rather than a button in a row
                below: without it there would be no way to clear a
                wrong logo or drop an image back below the minimum.
            */}
            <div className="brand-holder-wrap">

                <button
                    type="button"
                    className={
                        "brand-asset-preview brand-dropzone brand-holder-button" +
                        (dragging ? " brand-dropzone-active" : "")
                    }
                    aria-label={asset ? `Replace ${label}` : `Upload ${label}`}
                    disabled={disabled}
                    onClick={() => inputRef.current?.click()}
                    onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                >

                    {asset
                        ? <img src={asset.dataUrl} alt="" />
                        : <span className="brand-asset-empty" aria-hidden="true">
                            {dragging ? "Drop to upload" : "Drag or click"}
                          </span>}

                </button>

                {asset && onClear && (
                    <button
                        type="button"
                        className="brand-holder-clear"
                        aria-label={`Remove ${label}`}
                        disabled={disabled}
                        onClick={onClear}
                    >
                        ×
                    </button>
                )}

            </div>

            {/*
                The file input is the only thing left here -- kept
                visually hidden and out of the tab order, since the
                holder button above is what opens it.
            */}
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                className="brand-file-input"
                tabIndex={-1}
                aria-hidden="true"
                onChange={(event) => {
                    onFile(event.target.files?.[0]);
                    // Cleared so picking the SAME file again still
                    // fires a change event.
                    event.target.value = "";
                }}
            />

            </div>

            {/*
                Anything beside the holder -- the Brand Images
                section's Name and Short Description fields. Absent
                for Icon and Logo, whose slot is holder-and-buttons
                only.
            */}
            {aside && (
                <div className="brand-image-fields">{aside}</div>
            )}

            </div>

        </div>

    );

}

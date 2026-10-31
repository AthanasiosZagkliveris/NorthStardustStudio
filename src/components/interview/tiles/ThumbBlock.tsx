import { useEffect, useRef, useState, type HTMLAttributes } from "react";

/** The longest edge of a block's picture where its size is not known: a little over twice the largest a block is drawn. */
const THUMB_EDGE = 480;

/** The block grows by a tenth under the pointer: its picture is made for that size, so the largest it is shown at is not larger than the picture. */
const GROWN = 1.1;

const made = new Map<string, string>();

/**
 * A PICTURE FOR A SMALL BLOCK. An uploaded image can be several times larger than the block that shows it; the browser then picks a few of its pixels for
 * each pixel of the block, and a fine weave or a row of thin stripes shows a different pattern at each size of the block (a tile and the same tile under
 * the pointer, which is a tenth larger, did not look alike). The picture is therefore brought down first, by halves, with the canvas's own smoothing, to
 * about twice the block's size, and the block shows that: at every size it is the same picture, only larger. Where the canvas is not available (a test), or the
 * picture is not a raster, or it cannot be read, the picture itself is shown.
 */
export function useThumbnail(dataUrl: string, edge: number = THUMB_EDGE): string {
    const key = dataUrl + "@" + edge;
    const [thumb, setThumb] = useState(() => made.get(key) ?? dataUrl);
    useEffect(() => {
        const done = made.get(key);
        if (done !== undefined) {
            setThumb(done);
            return;
        }
        if (!/^data:image\/(png|jpe?g|webp|gif)/i.test(dataUrl) || typeof document === "undefined") {
            setThumb(dataUrl);
            return;
        }
        let live = true;
        const picture = new Image();
        picture.onload = () => {
            try {
                const longest = Math.max(picture.naturalWidth, picture.naturalHeight);
                if (!live || longest <= edge) {
                    made.set(key, dataUrl);
                    return;
                }
                let source: CanvasImageSource = picture;
                let width = picture.naturalWidth;
                let height = picture.naturalHeight;
                const scale = edge / longest;
                const targetWidth = Math.max(1, Math.round(picture.naturalWidth * scale));
                const targetHeight = Math.max(1, Math.round(picture.naturalHeight * scale));
                let canvas = document.createElement("canvas");
                // Halve until the next halving would pass the target, then draw to the target.
                while (width / 2 >= targetWidth && height / 2 >= targetHeight) {
                    width = Math.round(width / 2);
                    height = Math.round(height / 2);
                    canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const half = canvas.getContext("2d");
                    if (!half) {
                        throw new Error("no canvas");
                    }
                    half.imageSmoothingQuality = "high";
                    half.drawImage(source, 0, 0, width, height);
                    source = canvas;
                }
                const last = document.createElement("canvas");
                last.width = targetWidth;
                last.height = targetHeight;
                const context = last.getContext("2d");
                if (!context) {
                    throw new Error("no canvas");
                }
                context.imageSmoothingQuality = "high";
                context.drawImage(source, 0, 0, targetWidth, targetHeight);
                const url = last.toDataURL(/^data:image\/jpe?g/i.test(dataUrl) ? "image/jpeg" : "image/png", 0.92);
                made.set(key, url);
                if (live) {
                    setThumb(url);
                }
            } catch {
                made.set(key, dataUrl);
            }
        };
        picture.onerror = () => { made.set(key, dataUrl); };
        picture.src = dataUrl;
        return () => { live = false; };
    }, [dataUrl, edge, key]);
    return thumb;
}

/**
 * A block of the Brand Images tile: its picture covers it (background-size cover, in the stylesheet), drawn from the picture brought down to the block's own size
 * on this screen (its width, by the device's pixels, by the tenth it grows under the pointer), so that at rest and under the pointer it is one picture, a tenth larger.
 */
export default function ThumbBlock({ dataUrl, style, ...rest }: { dataUrl: string } & HTMLAttributes<HTMLSpanElement>) {
    const block = useRef<HTMLSpanElement | null>(null);
    const [edge, setEdge] = useState(THUMB_EDGE);
    useEffect(() => {
        const node = block.current;
        if (!node || typeof ResizeObserver === "undefined") {
            return;
        }
        const measure = () => {
            const width = node.offsetWidth;
            if (width > 0) {
                // (In steps of 32 so a window being resized does not make a picture for every pixel.)
                setEdge(Math.max(64, Math.ceil(width * (window.devicePixelRatio || 1) * GROWN / 32) * 32));
            }
        };
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(node);
        return () => observer.disconnect();
    }, []);
    const thumb = useThumbnail(dataUrl, edge);
    return <span {...rest} ref={block} style={{ ...style, ...(dataUrl ? { backgroundImage: "url(" + thumb + ")" } : {}) }} />;
}

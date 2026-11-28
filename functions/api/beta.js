/*
    THE BETA QUESTIONNAIRE'S RECEIVER (Research 8, section 8.3): a Cloudflare Pages Function at POST /api/beta on
    app.northstardust.studio, beside the app (Cloudflare Pages runs every file of functions/ as a route; nothing here is in
    the app's build). It keeps each sent questionnaire as one row of the D1 database bound as BETA_DB (Research 8,
    section 8.4) and replies with a receipt, which opens the document downloads on the founder's device.

    What it keeps: the questionnaire's version, the answers, the email only where its permission was ticked, and the date.
    No address, no device, no Organisation. With the secret TURNSTILE_SECRET set, a Cloudflare Turnstile token is required.
*/

/** The most a questionnaire's answers may weigh: well above a full one with long texts. */
const MOST_BYTES = 64 * 1024;

const reply = (status, body) => new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
});

/** Whether Cloudflare Turnstile accepts the token (only checked once its secret is set). */
async function humanChecked(env, token, ip) {
    if (!env.TURNSTILE_SECRET) {
        return true;
    }
    if (typeof token !== "string" || token === "") {
        return false;
    }
    const form = new FormData();
    form.append("secret", env.TURNSTILE_SECRET);
    form.append("response", token);
    if (ip) {
        form.append("remoteip", ip);
    }
    const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
    const outcome = await result.json().catch(() => ({}));
    return outcome.success === true;
}

export async function onRequestPost({ request, env }) {
    if (!env.BETA_DB) {
        return reply(503, { error: "The receiver is not set up yet." });
    }
    const text = await request.text();
    if (text.length > MOST_BYTES) {
        return reply(413, { error: "Too long." });
    }
    let sent;
    try {
        sent = JSON.parse(text);
    } catch {
        return reply(400, { error: "Not JSON." });
    }
    if (!sent || typeof sent !== "object" || !Number.isInteger(sent.version) || !sent.answers || typeof sent.answers !== "object" || Array.isArray(sent.answers)) {
        return reply(400, { error: "Not a questionnaire." });
    }
    // (Question 1, the consent to use the answers, is required: without it nothing is kept.)
    if (sent.answers["1"] !== true) {
        return reply(400, { error: "No consent." });
    }
    if (!(await humanChecked(env, sent.token, request.headers.get("CF-Connecting-IP")))) {
        return reply(403, { error: "The check did not pass." });
    }
    const email = typeof sent.email === "string" && sent.answers["2"] === true ? sent.email.slice(0, 254) : null;
    const receipt = crypto.randomUUID();
    await env.BETA_DB.prepare("CREATE TABLE IF NOT EXISTS answers (receipt TEXT PRIMARY KEY, received TEXT NOT NULL, version INTEGER NOT NULL, answers TEXT NOT NULL, email TEXT)").run();
    await env.BETA_DB
        .prepare("INSERT INTO answers (receipt, received, version, answers, email) VALUES (?1, ?2, ?3, ?4, ?5)")
        .bind(receipt, new Date().toISOString(), sent.version, JSON.stringify(sent.answers), email)
        .run();
    return reply(200, { receipt });
}

/* Reviews service (reusable, one copy per site).
   Visitor posts a review -> it is saved as PENDING and emailed to the owner with an Approve button.
   Owner taps Approve (works on any phone) -> review is published. Nothing shows until then.
   Config comes from wrangler.jsonc "vars": SITE_NAME, FROM_EMAIL, LANGS ("ro,en" or "en").
   Bindings: REVIEWS (KV), MAIL (send_email), optional ASSETS (static site). Secret/var OWNER_EMAIL (verified destination).
   Optional vars: ALLOW_ORIGIN (site that calls this from another domain), HOME_URL. */
import { EmailMessage } from "cloudflare:email";

const T = {
  en: {
    subject: (s, n) => `New review for your website: ${s} ${n}`,
    intro: "Someone left a review. It is NOT on your website yet.",
    btn: "Approve and publish",
    ignore: "If you do not want it on the site, just ignore this email.",
    q: "Show this review on the website?", yes: "Yes, publish it", no: "No, don't publish",
    done: "Done! It is on the website now.", declined: "OK, it will not be published.",
    gone: "This link has already been used or has expired.", home: "Back to the website",
    rm: "Changed your mind? Take it off the website", rmq: "Take this review off the website?", rmyes: "Yes, remove it", rmdone: "Done. It is off the website."
  },
  ro: {
    subject: (s, n) => `Recenzie nouă pentru site: ${s} ${n}`,
    intro: "Cineva a lăsat o recenzie. Încă NU apare pe site.",
    btn: "Aprobă și publică",
    ignore: "Dacă nu vrei să apară pe site, ignoră acest email.",
    q: "Să apară această recenzie pe site?", yes: "Da, publică", no: "Nu o publica",
    done: "Gata! Recenzia apare acum pe site.", declined: "Bine, nu va fi publicată.",
    gone: "Linkul a fost deja folosit sau a expirat.", home: "Înapoi la site",
    rm: "Te-ai răzgândit? Scoate-o de pe site", rmq: "Să scoatem această recenzie de pe site?", rmyes: "Da, scoate-o", rmdone: "Gata. Recenzia nu mai apare pe site."
  }
};
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const hex = n => { const a = new Uint8Array(n); crypto.getRandomValues(a); return [...a].map(b => b.toString(16).padStart(2, "0")).join(""); };
const same = (a, b) => { a = String(a); b = String(b); if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; };
let CORS = {};
const json = (o, s = 200, h = {}) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store", ...CORS, ...h } });
const html = (b, s = 200) => new Response(b, { status: s, headers: { "content-type": "text/html;charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" } });
const langs = env => (env.LANGS || "en").split(",").map(x => x.trim()).filter(x => T[x]);
const stars = n => "★".repeat(n) + "☆".repeat(5 - n);

const b64 = s => { const bin = unescape(encodeURIComponent(s)); return btoa(bin).replace(/.{1,76}/g, "$&\r\n"); };
const encHeader = s => `=?UTF-8?B?${btoa(unescape(encodeURIComponent(s)))}?=`;

function page(env, body) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(env.SITE_NAME)}</title><style>body{margin:0;font:19px/1.5 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:#f1f7f8;color:#0d3b52;padding:20px}main{max-width:520px;margin:30px auto;background:#fff;border-radius:22px;padding:26px;box-shadow:0 10px 30px #0d3b5222}h1{font-size:1.4rem;margin:0 0 10px}.st{color:#f2b01e;font-size:1.5rem;letter-spacing:3px}blockquote{margin:14px 0;padding:14px;background:#eaf7f9;border-radius:14px}button,a.b{display:block;width:100%;text-align:center;box-sizing:border-box;font:700 1.1rem system-ui;padding:16px;border-radius:40px;border:0;margin-top:12px;text-decoration:none;cursor:pointer}.y{background:#1796a8;color:#fff}.n{background:#fff;color:#0d3b52;box-shadow:inset 0 0 0 2px #cfe3e8}small{color:#5b7f8c}</style></head><body><main>${body}</main></body></html>`;
}

async function sendMail(env, to, subject, text, htmlBody) {
  const from = env.FROM_EMAIL, bd = "b" + hex(8);
  const raw = [
    `From: ${encHeader(env.SITE_NAME)} <${from}>`, `To: <${to}>`, `Subject: ${encHeader(subject)}`,
    `Message-ID: <${hex(12)}@${from.split("@")[1]}>`, `Date: ${new Date().toUTCString()}`, "MIME-Version: 1.0",
    `Content-Type: multipart/alternative; boundary="${bd}"`, "",
    `--${bd}`, 'Content-Type: text/plain; charset="UTF-8"', "Content-Transfer-Encoding: base64", "", b64(text),
    `--${bd}`, 'Content-Type: text/html; charset="UTF-8"', "Content-Transfer-Encoding: base64", "", b64(htmlBody),
    `--${bd}--`, ""
  ].join("\r\n");
  await env.MAIL.send(new EmailMessage(from, to, raw));
}

async function viaFormSubmit(env, subject, fields) {
  const o = env.ALLOW_ORIGIN || "https://example.com";
  const r = await fetch(env.FORMSUBMIT_URL || "https://formsubmit.co/ajax/" + env.OWNER_EMAIL, {
    method: "POST",
    headers: { "content-type": "application/json", accept: "application/json", origin: o, referer: o + "/" },
    body: JSON.stringify({ _subject: subject, _captcha: "false", _template: "box", ...fields })
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || String(j.success) === "false") throw new Error("formsubmit " + r.status + " " + String(j.message || ""));
}

async function viaResend(env, subject, text, html) {
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "content-type": "application/json", authorization: "Bearer " + env.RESEND_API_KEY },
    body: JSON.stringify({ from: (env.SITE_NAME || "Reviews") + " <onboarding@resend.dev>", to: [env.OWNER_EMAIL], subject, text, html })
  });
  if (!r.ok) throw new Error("resend " + r.status + " " + (await r.text().catch(() => "")).slice(0, 200));
}

async function submit(request, env, url) {
  const origin = request.headers.get("origin");
  if (origin && origin !== url.origin && origin !== env.ALLOW_ORIGIN) return json({ ok: false }, 403);
  const raw = await request.text();
  if (raw.length > 6000) return json({ ok: false }, 413);
  let d; try { d = JSON.parse(raw); } catch { return json({ ok: false }, 400); }
  if (d._honey) return json({ ok: true });                         // bots: pretend it worked
  const rating = parseInt(d.stars, 10), name = String(d.name || "").trim(), role = String(d.role || "").trim(), text = String(d.text || "").trim();
  if (!(rating >= 1 && rating <= 5) || !name || name.length > 80 || role.length > 80 || text.length < 4 || text.length > 1500 || d.ok !== true) return json({ ok: false }, 400);
  const ip = request.headers.get("cf-connecting-ip") || "x";
  if (await env.REVIEWS.get("rl:" + ip)) return json({ ok: false, error: "slow" }, 429);
  await env.REVIEWS.put("rl:" + ip, "1", { expirationTtl: 60 });
  const id = hex(8), t = hex(16);
  await env.REVIEWS.put("pend:" + id, JSON.stringify({ name, role, text, rating, t, date: new Date().toISOString() }), { expirationTtl: 60 * 60 * 24 * 30 });
  const link = `${url.origin}/api/decide?id=${id}&t=${t}`, rlink = `${url.origin}/api/remove?id=${id}&t=${t}`;
  const L = langs(env);
  const intro = L.map(l => T[l].intro).join("\n");
  const textBody = `${intro}\n\n${stars(rating)}\n${name}${role ? " (" + role + ")" : ""}\n"${text}"\n\n${L.map(l => T[l].btn + ": " + link).join("\n")}\n\n${L.map(l => T[l].ignore).join("\n")}\n\n${L.map(l => T[l].rm + ": " + rlink).join("\n")}\n`;
  const htmlBody = `<div style="font:18px/1.5 system-ui,Arial,sans-serif;color:#0d3b52;max-width:520px">${L.map(l => `<p>${esc(T[l].intro)}</p>`).join("")}<p style="font-size:26px;color:#f2b01e;margin:6px 0">${stars(rating)}</p><p><b>${esc(name)}</b>${role ? " (" + esc(role) + ")" : ""}</p><blockquote style="margin:0;padding:14px;background:#eaf7f9;border-radius:12px">${esc(text).replace(/\n/g, "<br>")}</blockquote><p style="margin:22px 0"><a href="${link}" style="display:block;text-align:center;background:#1796a8;color:#fff;font-weight:bold;font-size:20px;padding:18px;border-radius:40px;text-decoration:none">${esc(T[L[0]].btn)}</a></p>${L.slice(1).map(l => `<p style="text-align:center"><a href="${link}">${esc(T[l].btn)}</a></p>`).join("")}<p style="color:#5b7f8c;font-size:15px">${L.map(l => esc(T[l].ignore)).join("<br>")}</p><p style="font-size:15px">${L.map(l => `<a href="${rlink}" style="color:#5b7f8c">${esc(T[l].rm)}</a>`).join("<br>")}</p></div>`;
  try {
    if (env.MAIL_MODE === "resend") await viaResend(env, T[L[0]].subject(stars(rating), name), textBody, htmlBody);
    else if (env.MAIL_MODE === "formsubmit") await viaFormSubmit(env, T[L[0]].subject(stars(rating), name), { Stars: stars(rating), Name: name + (role ? " (" + role + ")" : ""), Review: text, "TAP THIS LINK TO APPROVE": link, Note: "Not on your website until you approve it. Ignore this email to leave it off." });
    else await sendMail(env, env.OWNER_EMAIL, T[L[0]].subject(stars(rating), name), textBody, htmlBody);
  } catch (e) {
    await env.REVIEWS.delete("pend:" + id);
    return json({ ok: false, error: "mail" }, 502);
  }
  return json({ ok: true });
}

async function decide(request, env, url) {
  const L = langs(env), tt = T[L[0]];
  const f = request.method === "POST" ? await request.formData() : url.searchParams;
  const id = String(f.get("id") || "").replace(/[^a-f0-9]/g, ""), t = String(f.get("t") || "");
  const rec = id && await env.REVIEWS.get("pend:" + id, "json");
  if (!rec && id) {   // already approved: offer to take it down again
    const ap = ((await env.REVIEWS.get("approved", "json")) || []).find(r => r.id === id);
    if (ap && (!ap.t || same(ap.t, t))) return html(page(env, `<h1>${L.map(l => esc(T[l].done)).join("<br>")}</h1><p><a href="${url.origin}/api/remove?id=${id}&t=${esc(t)}">${L.map(l => esc(T[l].rm)).join(" / ")}</a></p><a class="b y" href="${esc(env.HOME_URL || "/")}">${esc(tt.home)}</a>`));
  }
  if (!rec || !same(rec.t, t)) return html(page(env, `<h1>${L.map(l => esc(T[l].gone)).join("<br>")}</h1><a class="b n" href="${esc(env.HOME_URL || "/")}">${esc(tt.home)}</a>`), 404);
  if (request.method === "POST") {
    const act = f.get("a");
    if (act === "yes") {
      const list = (await env.REVIEWS.get("approved", "json")) || [];
      list.unshift({ id, t, name: rec.name, role: rec.role, rating: rec.rating, text: rec.text, date: rec.date });
      await env.REVIEWS.put("approved", JSON.stringify(list.slice(0, 200)));
    }
    await env.REVIEWS.delete("pend:" + id);
    const m = act === "yes" ? "done" : "declined";
    const rmLink = act === "yes" ? `<p><a href="${url.origin}/api/remove?id=${id}&t=${esc(t)}">${L.map(l => esc(T[l].rm)).join(" / ")}</a></p>` : "";
    return html(page(env, `<h1>${L.map(l => esc(T[l][m])).join("<br>")}</h1><a class="b y" href="${esc(env.HOME_URL || "/")}">${esc(tt.home)}</a>${rmLink}`));
  }
  return html(page(env, `<h1>${L.map(l => esc(T[l].q)).join("<br>")}</h1><div class="st">${stars(rec.rating)}</div><blockquote><b>${esc(rec.name)}</b>${rec.role ? " (" + esc(rec.role) + ")" : ""}<br>${esc(rec.text).replace(/\n/g, "<br>")}</blockquote><form method="post"><input type="hidden" name="id" value="${id}"><input type="hidden" name="t" value="${esc(t)}"><button class="y" name="a" value="yes">${L.map(l => esc(T[l].yes)).join(" / ")}</button><button class="n" name="a" value="no">${L.map(l => esc(T[l].no)).join(" / ")}</button></form>`));
}

async function remove(request, env, url) {
  const L = langs(env), tt = T[L[0]];
  const f = request.method === "POST" ? await request.formData() : url.searchParams;
  const id = String(f.get("id") || "").replace(/[^a-f0-9]/g, ""), t = String(f.get("t") || "");
  const list = (await env.REVIEWS.get("approved", "json")) || [];
  const rec = id && list.find(r => r.id === id);
  // older reviews have no stored token: the unguessable id from the owner's email is enough for those
  if (!rec || (rec.t && !same(rec.t, t))) return html(page(env, `<h1>${L.map(l => esc(T[l].gone)).join("<br>")}</h1><a class="b n" href="${esc(env.HOME_URL || "/")}">${esc(tt.home)}</a>`), 404);
  if (request.method === "POST") {
    await env.REVIEWS.put("approved", JSON.stringify(list.filter(r => r.id !== id)));
    return html(page(env, `<h1>${L.map(l => esc(T[l].rmdone)).join("<br>")}</h1><a class="b y" href="${esc(env.HOME_URL || "/")}">${esc(tt.home)}</a>`));
  }
  return html(page(env, `<h1>${L.map(l => esc(T[l].rmq)).join("<br>")}</h1><div class="st">${stars(rec.rating)}</div><blockquote><b>${esc(rec.name)}</b>${rec.role ? " (" + esc(rec.role) + ")" : ""}<br>${esc(rec.text).replace(/\n/g, "<br>")}</blockquote><form method="post"><input type="hidden" name="id" value="${id}"><input type="hidden" name="t" value="${esc(t)}"><button class="n" name="a" value="remove">${L.map(l => esc(T[l].rmyes)).join(" / ")}</button></form>`));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    CORS = env.ALLOW_ORIGIN ? { "access-control-allow-origin": env.ALLOW_ORIGIN, "vary": "Origin" } : {};
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: { ...CORS, "access-control-allow-methods": "GET,POST", "access-control-allow-headers": "content-type", "access-control-max-age": "86400" } });
    if (url.pathname === "/api/reviews" && request.method === "GET") {
      const list = (await env.REVIEWS.get("approved", "json")) || [];
      return json(list.map(({ name, role, rating, text, date }) => ({ name, role, rating, text, date })), 200, { "cache-control": "public, max-age=30" });
    }
    if (url.pathname === "/api/selftest" && (env.MAIL_MODE === "formsubmit" || env.MAIL_MODE === "resend")) {   // temporary diagnostic
      try { if (env.MAIL_MODE === "resend") await viaResend(env, "Reviews self-test", "Self-test from the reviews Worker. Ignore.", "<p>Self-test from the reviews Worker. Ignore.</p>"); else await viaFormSubmit(env, "Reviews self-test", { Note: "Self-test from the reviews Worker. Ignore." }); return new Response("OK: the test email was accepted. Check your inbox.", { headers: { "content-type": "text/plain" } }); }
      catch (e) { return new Response("FAILED: " + (e && e.message || e), { status: 500, headers: { "content-type": "text/plain" } }); }
    }
    if (url.pathname === "/api/review" && request.method === "POST") return submit(request, env, url);
    if (url.pathname === "/api/remove" && (request.method === "GET" || request.method === "POST")) return remove(request, env, url);
    if (url.pathname === "/api/decide" && (request.method === "GET" || request.method === "POST")) return decide(request, env, url);
    if (url.pathname.startsWith("/api/")) return json({ ok: false }, 404);
    return env.ASSETS ? env.ASSETS.fetch(request) : json({ ok: false }, 404);
  }
};

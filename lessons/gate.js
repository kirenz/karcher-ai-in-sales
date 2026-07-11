/* Stage-1 access gate: Google sign-in via Firebase Auth, Kärcher accounts only.
   Client-side gate (keeps casual visitors and crawlers out; content is not
   confidential by design). Allowed: @karcher.com plus the maintainer accounts.
   Pages load with <html data-gate> (body hidden via inline style); this script
   reveals the page after a successful check. Handbook pages load this same
   file via ../lessons/gate.js. */
// Local preview (make lessons + http.server) stays ungated — the gate is for the hosted site.
if (["localhost", "127.0.0.1"].includes(location.hostname)) {
  document.body.style.visibility = "visible";
} else {
  main();
}

async function main() {
const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js");
const {
  getAuth, onAuthStateChanged, signInWithPopup, signInWithRedirect,
  GoogleAuthProvider, signOut
} = await import("https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js");
/* import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithPopup, signInWithRedirect,
  GoogleAuthProvider, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"; */

const ALLOWED_DOMAIN = "karcher.com";
const ALLOWED_EMAILS = ["j.kirenz@gmail.com", "jan.kirenz@kirenz.de"];

const app = initializeApp({
  apiKey: "AIzaSyBCa35CY5s0pv3ZrOhztvu9Y7CRuOeXnjE",
  authDomain: "karcher-ai-sales.firebaseapp.com",
  projectId: "karcher-ai-sales"
});
const auth = getAuth(app);

function allowed(user) {
  const mail = (user && user.email || "").toLowerCase();
  return mail.endsWith("@" + ALLOWED_DOMAIN) || ALLOWED_EMAILS.includes(mail);
}

function overlay(inner) {
  let el = document.getElementById("gate");
  if (!el) {
    el = document.createElement("div");
    el.id = "gate";
    el.style.cssText = "position:fixed;inset:0;z-index:9999;background:#fff;" +
      "display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif";
    document.documentElement.appendChild(el);
  }
  el.innerHTML = '<div style="width:min(430px,88vw)">' +
    '<div style="display:flex;align-items:center;gap:20px;margin-bottom:44px">' +
      '<img src="data:image/png;base64,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" width="60" height="60" alt="" style="display:block">' +
      '<div style="font-weight:700;font-size:30px;color:#1a1a1a">AI in Sales</div>' +
    '</div>' + inner + "</div>";
}

const G_LOGO = '<svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">' +
  '<path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>' +
  '<path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>' +
  '<path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>' +
  '<path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';

function showSignIn(message) {
  overlay((message ? '<p style="font-size:15px;color:#b00020;margin:0 0 16px">' + message + "</p>" : "") +
    '<p style="font-size:20px;color:#5f6368;margin:0 0 16px">Sign in with:</p>' +
    '<button id="gate-btn" style="display:flex;align-items:center;gap:16px;width:100%;background:#fff;' +
    'border:1px solid #dadce0;border-radius:8px;padding:14px 18px;font-family:Arial,sans-serif;' +
    'font-size:17px;color:#1a1a1a;cursor:pointer;text-align:left">' + G_LOGO + "Google</button>" +
    '<p style="font-size:14px;color:#5f6368;margin:20px 0 0">For K&auml;rcher employees &mdash; ' +
    "sign in with your K&auml;rcher Google account.</p>");
  document.getElementById("gate-btn").onclick = function () {
    signInWithPopup(auth, new GoogleAuthProvider()).catch(function () {
      signInWithRedirect(auth, new GoogleAuthProvider());
    });
  };
}

onAuthStateChanged(auth, function (user) {
  if (!user) { showSignIn(""); return; }
  if (!allowed(user)) {
    signOut(auth);
    showSignIn("This training is for K&auml;rcher employees. Please sign in with your K&auml;rcher account.");
    return;
  }
  const g = document.getElementById("gate");
  if (g) g.remove();
  document.body.style.visibility = "visible";
});
}

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
      '<div><div style="font-weight:900;font-size:56px;line-height:.82;color:#1a1a1a">K</div>' +
      '<div style="width:38px;height:13px;background:#ffed00;margin-top:5px"></div></div>' +
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

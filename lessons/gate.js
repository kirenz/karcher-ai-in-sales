/* Stage-1 access gate: Google sign-in via Firebase Auth, Kärcher accounts only.
   Client-side gate (keeps casual visitors and crawlers out; content is not
   confidential by design). Allowed: @karcher.com plus the maintainer accounts.
   Pages load with <html data-gate> (body hidden via inline style); this script
   reveals the page after a successful check. Handbook pages load this same
   file via ../lessons/gate.js. */
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getAuth, onAuthStateChanged, signInWithPopup, signInWithRedirect,
  GoogleAuthProvider, signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
    el.style.cssText = "position:fixed;inset:0;z-index:9999;background:#f4f4f4;" +
      "display:flex;align-items:center;justify-content:center;font-family:Arial,sans-serif";
    document.documentElement.appendChild(el);
  }
  el.innerHTML = '<div style="background:#fff;border:1px solid #e3e3e0;border-radius:12px;' +
    'padding:34px 30px;max-width:360px;text-align:center">' +
    '<div style="font-weight:700;letter-spacing:.12em;font-size:14px;margin-bottom:4px">K&Auml;RCHER</div>' +
    '<div style="font-weight:700;letter-spacing:.1em;font-size:12px;color:#b5a000;margin-bottom:18px">AI IN SALES</div>' +
    inner + "</div>";
}

function showSignIn(message) {
  overlay((message ? '<p style="font-size:14px;color:#666;margin:0 0 14px">' + message + "</p>" : "") +
    '<button id="gate-btn" style="background:#ffed00;border:none;border-radius:6px;padding:13px 22px;' +
    'font-weight:700;letter-spacing:.08em;text-transform:uppercase;font-size:14px;cursor:pointer">' +
    "Sign in with Google</button>" +
    '<p style="font-size:12px;color:#999;margin:14px 0 0">For K&auml;rcher employees &mdash; use your K&auml;rcher Google account.</p>');
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

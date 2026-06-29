// Simple client-side password gate (same pattern as gemini-de/password.js).
// Note: this is a soft gate, not real security — the content is still in the
// page source and anyone can bypass it via dev tools. It only keeps casual
// visitors out.

function protectContent() {
    // Already unlocked in this browser? (own key, separate from other
    // kirenz.github.io sites that share the same origin)
    if (!localStorage.getItem('karcherAccessGranted')) {
        const password = prompt('Bitte Passwort eingeben:');
        const allowedPasswords = ['karcher-26'];
        if (allowedPasswords.includes(password)) {
            localStorage.setItem('karcherAccessGranted', true);
        } else {
            document.body.innerHTML = 'Falsches Passwort';
        }
    }
}

// Run as soon as the DOM is ready.
document.addEventListener('DOMContentLoaded', protectContent);

// =============================================================
// auth.js – Authentication Manager
// =============================================================
// PURPOSE: Controls who can access the AI Learning Hub.
// - Shows a login form if the user is NOT logged in
// - Hides the login form and shows the app if they ARE logged in
// - Handles login, logout and session persistence
//
// HOW IT WORKS:
// 1. On page load, it checks if a Supabase session exists
// 2. If no session → shows login overlay, hides main content
// 3. If session exists → hides login overlay, shows main content
// 4. Supabase automatically remembers the session in localStorage
// =============================================================

import { supabase } from './supabase.js';

// --- UI Elements ---
const loginOverlay = document.getElementById('login-overlay');
const mainContent = document.getElementById('main-content');
const mainHeader = document.querySelector('.main-header');
const mainNav = document.querySelector('.module-nav');
const mainFooter = document.querySelector('.main-footer');

// --- Show/Hide helpers ---
function showApp() {
    if (loginOverlay) loginOverlay.style.display = 'none';
    if (mainContent) mainContent.style.display = '';
    if (mainHeader) mainHeader.style.display = '';
    if (mainNav) mainNav.style.display = '';
    if (mainFooter) mainFooter.style.display = '';

    // Force re-render of dynamic admin parts now that we know user is logged in
    if (window.loadAdminUnlockButtons) window.loadAdminUnlockButtons();
}

function showLogin() {
    if (loginOverlay) loginOverlay.style.display = 'flex';
    if (mainContent) mainContent.style.display = 'none';
    if (mainHeader) mainHeader.style.display = 'none';
    if (mainNav) mainNav.style.display = 'none';
    if (mainFooter) mainFooter.style.display = 'none';
}

// --- Create profile on first login (upsert = create if not exists) ---
// This runs every login but only creates a new row the very first time.
// On subsequent logins it does nothing (ignoreDuplicates: true).
async function ensureProfile(user) {
    const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name || '',
        plan: 'full_access'   // All users have full access (no course_access table needed)
    }, { onConflict: 'id', ignoreDuplicates: true });

    if (error) console.error('Profile upsert error:', error.message);
    else console.log('✅ Profile ready for:', user.email);
}

// --- Listen for auth state changes (login/logout/initial) ---
let initialLoadDone = false;

supabase.auth.onAuthStateChange(async (event, session) => {
    if (session) {
        window.currentUser = session.user;

        // Kör ensureProfile i bakgrunden — UTAN await.
        // Att awaita här håller Supabase auth-locken öppen och orsakar 5s fördröjning.
        if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
            ensureProfile(session.user).catch(e => console.warn('ensureProfile error:', e));
        }

        // Render application state direkt — auth-locken hålls inte längre!
        showApp();
        initialLoadDone = true;
    } else {
        window.currentUser = null;
        showLogin();
        initialLoadDone = true;
    }
});

// --- Login function (called by the login form button) ---
window.handleLogin = async () => {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');

    if (!email || !password) {
        errorMsg.textContent = 'Fyll i e-post och lösenord.';
        return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
        errorMsg.textContent = 'Fel e-post eller lösenord. Försök igen.';
    }
    // If success, onAuthStateChange above handles the rest
};

// --- Logout function (called by logout button in the app) ---
window.handleLogout = async () => {
    // Om Supabase har låst sig och signOut hänger, tvinga utloggning efter 2 sekunder
    const timeoutId = setTimeout(() => {
        if (window.currentUser) {
            console.warn("Utloggning tog för lång tid (deadlock). Tvingar rensning...");
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
        }
    }, 2000);

    try {
        await supabase.auth.signOut();
        clearTimeout(timeoutId);
    } catch (err) {
        console.error("SignOut misslyckades:", err);
        clearTimeout(timeoutId);
        localStorage.clear();
        sessionStorage.clear();
        window.location.reload();
    }
    // onAuthStateChange handles showing the login screen naturally
};

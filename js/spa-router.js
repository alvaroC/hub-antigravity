// js/spa-router.js
// SPA Router for SwedAI Academy
// Preserves Gemini Live WebSocket connection across page navigation
// by loading sub-pages into the index.html shell without full reloads.

(function () {
    'use strict';

    // Pages that the SPA router handles
    const SPA_ROUTES = new Set([
        'ai-assistent.html',
        'ai-konsult.html',
        'bygg-ai.html',
        'profile.html'
    ]);

    // CSS files already loaded from index.html
    const loadedCSS = new Set(['css/styles.css']);

    // Scripts already loaded from index.html (patterns to match against src)
    const SKIP_SCRIPTS = [
        'supabase.js', 'auth.js', 'data.js', 'course_data.js',
        'app.js', 'live.js', 'spa-router.js',
        'mermaid', 'markmap', 'marked.min.js',
        'elevenlabs', 'convai-widget'
    ];

    let currentRoute = 'dashboard';

    // ──────────────────────────────────────────────
    // INIT
    // ──────────────────────────────────────────────
    function init() {
        console.log('[SPA Router] Initialized – WebSocket-safe navigation active');

        // Set initial history state
        history.replaceState({ route: 'dashboard' }, '', window.location.href);

        // Global click interceptor (capture phase to beat other handlers)
        document.addEventListener('click', onLinkClick, true);

        // Back / Forward browser buttons
        window.addEventListener('popstate', onPopState);

        // Expose a programmatic navigate function for other scripts
        window.spaNavigate = function (url) {
            const filename = extractFilename(url);
            if (SPA_ROUTES.has(filename)) {
                goToPage(filename);
                return true;
            }
            if (filename === 'index.html') {
                goToDashboard();
                return true;
            }
            return false;
        };
    }

    // ──────────────────────────────────────────────
    // HELPERS
    // ──────────────────────────────────────────────
    function extractFilename(href) {
        return (href || '').split('/').pop().split('?')[0].split('#')[0];
    }

    // ──────────────────────────────────────────────
    // LINK CLICK HANDLER
    // ──────────────────────────────────────────────
    function onLinkClick(e) {
        // 1. Dashboard button
        const dashBtn = e.target.closest('button[data-module="dashboard"]');
        if (dashBtn && currentRoute !== 'dashboard') {
            e.preventDefault();
            e.stopImmediatePropagation();
            goToDashboard();
            return;
        }

        // 2. Anchor links
        const link = e.target.closest('a[href]');
        if (!link) return;

        const href = link.getAttribute('href');
        if (!href || link.target === '_blank') return;

        const filename = extractFilename(href);

        // SPA sub-page?
        if (SPA_ROUTES.has(filename)) {
            e.preventDefault();
            e.stopImmediatePropagation();
            goToPage(filename);
            return;
        }


    }

    // ──────────────────────────────────────────────
    // NAVIGATE TO SUB-PAGE
    // ──────────────────────────────────────────────
    async function goToPage(pageName, pushState = true) {
        if (currentRoute === pageName) return;

        console.log(`[SPA Router] → ${pageName}`);

        const viewport = document.getElementById('spa-viewport');
        if (!viewport) { window.location.href = pageName; return; }

        // Loading indicator
        viewport.innerHTML = `
            <main id="main-content" class="container">
                <div class="loading"><div class="spinner"></div><p>Laddar...</p></div>
            </main>`;

        try {
            // 1. Fetch the page
            const resp = await fetch(pageName);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            const html = await resp.text();

            // 2. Parse as DOM
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // 3. Load page-specific CSS
            doc.querySelectorAll('link[rel="stylesheet"]').forEach(linkEl => {
                const href = linkEl.getAttribute('href');
                if (href && !href.includes('fonts.googleapis') && !href.includes('cdnjs.cloudflare')) {
                    ensureCSS(href);
                }
            });

            // 4. Extract content (everything between nav and footer, skip shell elements)
            const contentHTML = extractContent(doc);

            // 5. Inject into viewport
            viewport.innerHTML = contentHTML;

            // 6. Remove previously injected SPA scripts
            document.querySelectorAll('script[data-spa-injected]').forEach(s => s.remove());

            // 7. Execute the page's inline and external scripts
            await executeScripts(doc);

            // 8. Update nav active state
            updateNav(pageName);

            // 9. Update document title
            const pageTitle = doc.querySelector('title');
            if (pageTitle) document.title = pageTitle.textContent;

            // 10. Push browser history
            if (pushState) {
                history.pushState({ route: pageName }, '', pageName);
            }

            currentRoute = pageName;
            window.scrollTo(0, 0);

        } catch (err) {
            console.error('[SPA Router] Navigation failed:', err);
            window.location.href = pageName; // Hard fallback
        }
    }

    // ──────────────────────────────────────────────
    // NAVIGATE BACK TO DASHBOARD
    // ──────────────────────────────────────────────
    function goToDashboard(pushState = true) {
        if (currentRoute === 'dashboard') return;

        console.log('[SPA Router] → Dashboard');

        const viewport = document.getElementById('spa-viewport');
        if (!viewport) return;

        // Recreate the main-content element that app.js expects
        viewport.innerHTML = `
            <main id="main-content" class="container">
                <div class="loading"><div class="spinner"></div><p>Laddar lärandemoduler...</p></div>
            </main>`;

        // Remove SPA-injected scripts
        document.querySelectorAll('script[data-spa-injected]').forEach(s => s.remove());

        // Re-trigger app.js dashboard rendering
        if (window.selectCourse) {
            setTimeout(() => {
                window.selectCourse(window.currentCourseId || 'chatgpt-mastery');
            }, 50);
        }

        updateNav('dashboard');
        document.title = 'AI Learning Hub | SwedAI Academy';

        if (pushState) {
            history.pushState({ route: 'dashboard' }, '', 'index.html');
        }

        currentRoute = 'dashboard';
        window.scrollTo(0, 0);
    }

    // ──────────────────────────────────────────────
    // CONTENT EXTRACTION
    // Skip header, nav, footer, login-overlay, scripts
    // ──────────────────────────────────────────────
    function extractContent(doc) {
        let html = '';

        for (const child of doc.body.children) {
            const tag = child.tagName.toLowerCase();
            if (['header', 'nav', 'footer', 'script'].includes(tag)) continue;
            if (child.id === 'login-overlay') continue;
            // Skip inline style elements (page-specific styles in <head>)
            if (tag === 'style') continue;

            html += child.outerHTML;
        }

        return html;
    }

    // ──────────────────────────────────────────────
    // CSS LOADING
    // ──────────────────────────────────────────────
    function ensureCSS(href) {
        if (loadedCSS.has(href)) return;
        if (document.querySelector(`link[href="${href}"]`)) {
            loadedCSS.add(href);
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = href;
        link.dataset.spaCSS = 'true';
        document.head.appendChild(link);
        loadedCSS.add(href);
        console.log(`[SPA Router] Loaded CSS: ${href}`);
    }

    // ──────────────────────────────────────────────
    // SCRIPT EXECUTION
    // ──────────────────────────────────────────────
    async function executeScripts(doc) {
        const bodyScripts = doc.querySelectorAll('body script');

        for (const oldScript of bodyScripts) {
            const src = oldScript.getAttribute('src');

            // --- External scripts ---
            if (src) {
                const shouldSkip = SKIP_SCRIPTS.some(p => src.includes(p));
                if (shouldSkip) continue;

                // Load if not already present
                if (!document.querySelector(`script[src="${src}"]`)) {
                    await loadExternalScript(src, oldScript.type);
                }
                continue;
            }

            // --- Inline scripts ---
            let content = oldScript.textContent.trim();
            if (!content) continue;

            // Skip duplicate mermaid.initialize calls
            if (content.includes('mermaid.initialize') && !content.includes('function')) continue;

            // Patch DOMContentLoaded listeners → execute immediately via setTimeout
            // This works because addEventListener('DOMContentLoaded', fn) is replaced with
            // setTimeout(fn, 0) which runs the callback in the current (already-loaded) DOM.
            content = content.replace(
                /document\.addEventListener\(\s*['"]DOMContentLoaded['"]\s*,\s*/g,
                'setTimeout('
            );

            const newScript = document.createElement('script');
            newScript.dataset.spaInjected = 'true';
            if (oldScript.type) newScript.type = oldScript.type;
            newScript.textContent = content;
            document.body.appendChild(newScript);
        }
    }

    function loadExternalScript(src, type) {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.dataset.spaInjected = 'true';
            if (type) script.type = type;
            script.onload = resolve;
            script.onerror = () => {
                console.warn(`[SPA Router] Failed to load: ${src}`);
                resolve();
            };
            document.body.appendChild(script);
        });
    }

    // ──────────────────────────────────────────────
    // NAV ACTIVE STATE
    // ──────────────────────────────────────────────
    function updateNav(routeKey) {
        const nav = document.querySelector('.module-nav');
        if (!nav) return;

        // Clear all active states
        nav.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

        if (routeKey === 'dashboard') {
            const dashBtn = nav.querySelector('[data-module="dashboard"]');
            if (dashBtn) dashBtn.classList.add('active');
        } else {
            // Find link whose href ends with the route key
            const link = nav.querySelector(`a[href="${routeKey}"]`);
            if (link) link.classList.add('active');
        }
    }

    // ──────────────────────────────────────────────
    // POPSTATE (Browser Back / Forward)
    // ──────────────────────────────────────────────
    function onPopState(e) {
        if (!e.state || !e.state.route) return;

        if (e.state.route === 'dashboard') {
            goToDashboard(false);
        } else {
            goToPage(e.state.route, false);
        }
    }

    // ──────────────────────────────────────────────
    // BOOTSTRAP
    // ──────────────────────────────────────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

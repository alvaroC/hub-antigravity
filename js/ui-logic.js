/**
 * UI Layout Logic for SwedAI Academy
 * Manages major page layouts and structure.
 */

import { renderers } from './renderers.js';

export const PageManager = {
    // Dashboard Layout — 4 columns, centered
    renderDashboard: (currentCourseId) => {
        const catalog = window.COURSE_CATALOG || (typeof COURSE_CATALOG !== 'undefined' ? COURSE_CATALOG : {});
        const courseEntry = catalog[currentCourseId];
        const courseName = courseEntry ? courseEntry.name : 'Laddar...';

        return `
        <div class="swedai-grid-4">
            <div class="dashboard-left">
                ${renderers.classroomPanel(currentCourseId)}
            </div>

            <div class="dashboard-middle">
                ${renderers.digitalHjarnaPanel()}
            </div>

            <div class="dashboard-right">
               ${renderers.mentorPanel(courseName)}
            </div>

            <div class="dashboard-wiki">
               ${renderers.wikiPanel()}
            </div>
        </div>
        ${renderers.artefakter()}`;
    },

    // AI-Konsult Layout (Nivå 5)
    renderAIKonsult: () => `
        <div class="konsult-master-container">
            <!-- Sidebar -->
            <aside class="strategy-sidebar">
                <div class="sidebar-info-card">
                    <h2>DIN AI-PARTNER</h2>
                    <div class="inner-padding">
                        <p style="color: rgba(255,255,255,0.7); font-size: 0.85rem; line-height: 1.6;">
                            Aurelius är tränad på hela SwedAI Academys ekosystem. Han hjälper dig att syntetisera kunskaper från alla kurser till en sammanhängande affärsstrategi.
                        </p>
                        <ul style="padding-left: 1.2rem; margin-top: 1rem; color: rgba(255,255,255,0.6); font-size: 0.8rem;">
                            <li>Diagnos av affärsproblem</li>
                            <li>Strategisk syntes</li>
                            <li>Konkreta handlingsplaner</li>
                        </ul>
                    </div>
                </div>
                <div class="sidebar-info-card" style="margin-top: 1rem; border-color: rgba(59,130,246,0.3);">
                    <h2 style="color: #60a5fa;">Gå till Nivå 6</h2>
                    <div class="inner-padding">
                        <p style="font-size: 0.8rem; margin-bottom: 1rem;">När strategin är klar är det dags att bygga.</p>
                        <button class="nav-btn" onclick="window.spaNavigate('bygg-ai.html')" style="width:100%; justify-content:center; background:#1e293b;">
                           <i class="fas fa-building"></i> Bygg AI Förmåga
                        </button>
                    </div>
                </div>
            </aside>

            <!-- Main Chat Area -->
            <section class="chat-main-suite">
                <div class="aurelius-intro-hub">
                    <div class="consultant-header-profile">
                        <div class="consultant-avatar-glow">AU</div>
                        <div class="profile-text">
                            <span class="lvl-tag">Nivå 5: Strategisk Konsult</span>
                            <h3>Aurelius</h3>
                        </div>
                    </div>
                    <h2 class="help-prompt" style="color: #fbbf24; margin-top: 1.5rem; text-align:center;">Hur kan jag hjälpa dig idag?</h2>
                </div>

                <div id="konsult-messages" class="konsult-messages">
                    <div class="message system-intro">
                        <div class="intro-branding">
                            <span class="intro-icon">💼</span>
                            <h2>AI-STRATEG</h2>
                        </div>
                        <div class="intro-text">
                            Hej! Jag heter <strong>Aurelius</strong>. Berätta om den affärsutmaning du vill att vi analyserar tillsammans.
                        </div>
                    </div>
                </div>

                <div class="konsult-input-zone">
                    <div class="input-flex-layout">
                        <div class="suite-input-wrapper">
                            <textarea id="konsult-chat-input" placeholder="Beskriv din affärsutmaning..." rows="1" onkeypress="if(event.key==='Enter' && !event.shiftKey) { event.preventDefault(); window.sendMessage('consultant'); }"></textarea>
                            <button class="suite-send-btn" onclick="window.sendMessage('consultant')">
                                <span class="send-text">Analysera</span>
                                <i class="fas fa-paper-plane"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>`
};

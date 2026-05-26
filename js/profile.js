// =============================================================
// profile.js – Personal Student Dashboard (Skill Tree)
// =============================================================
// Denna fil är den lättviktiga logiken ("hjärnan") som styr
// Utbildningsträdet på Min Profil.
// Den läser bara in On/Off-värden från Supabase (user_milestones).
// =============================================================

import { supabase } from './supabase.js';

// Wait for auth.js to set window.currentUser (it runs async)
async function waitForUser(maxWaitMs = 5000) {
    const start = Date.now();
    while (!window.currentUser) {
        if (Date.now() - start > maxWaitMs) return null;
        await new Promise(r => setTimeout(r, 100));
    }
    return window.currentUser;
}

// ── RENDER: Profile hero (Namn & Plan) ────────────────────────
function renderProfileInfo(profile, user) {
    const name = profile?.full_name || user.email.split('@')[0];
    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');
    const planEl = document.getElementById('profile-plan');

    if (nameEl) nameEl.textContent = name;
    if (emailEl) emailEl.textContent = user.email;
    if (planEl) planEl.textContent = (profile?.plan || 'student').replace('_', ' ').toUpperCase();
}

// ── RENDER: Skill Tree (Nivå-mätare) ──────────────────────────
function renderSkillTree(milestones) {
    // 1. Dölj alla hårkodade 'Låst/Pågår/Klar'-klasser från HTML:n först, så vi startar rent.
    const allNodes = document.querySelectorAll('.course-node');
    allNodes.forEach(node => {
        // Enklast är att låta de vara "låsta" från start om inget annat sägs
        node.classList.remove('in-progress', 'completed');
        node.classList.add('locked');

        const badge = node.querySelector('.status-badge');
        if (badge) {
            badge.className = 'status-badge locked';
            badge.innerHTML = '<i class="fas fa-lock"></i> Låst';
        }

        // Återställ alla nivå-prickar
        const dots = node.querySelectorAll('.level-dot');
        dots.forEach(dot => {
            dot.className = 'level-dot';
            dot.innerHTML = dot.textContent; // återställ ev. ikon till siffra
        });
    });

    // Vi måste veta om Kalle klarat alla kurser (6 * 4 = 24 nivåer) för att låsa upp Mastery.
    let totalCompletedLevels = 0;
    const requiredLevelsForMastery = 24; // 6 kurser x 4 nivåer

    // 2. Loopa över de milstolpar Supabase gett oss
    milestones.forEach(m => {
        const node = document.querySelector(`.course-node[data-course-id="${m.course_id}"]`);
        if (!node) return;

        let levelsDoneInThisCourse = 0;
        const dots = node.querySelectorAll('.level-dot');
        const maxLevels = dots.length; // Automatiskt 3 för Intro, 4 för resten

        // Om Inte kursen är aktiverad (Nivå 1 = false), förblir den låst som i HTML-koden
        if (!m.level_1_done) {
            return; // Låst, hoppa över!
        }

        // Gå igenom Nivå 1 till maxLevels
        for (let i = 1; i <= maxLevels; i++) {
            let isDone = false;
            if (i === 2) {
                // Nivå 2 krav: alla fyra måste vara true
                isDone = m.level_2_audio && m.level_2_video && m.level_2_quiz && m.level_2_flashcard;
            } else {
                isDone = m[`level_${i}_done`];
            }

            const dot = dots[i - 1]; // NodeList är 0-indexerad

            if (isDone) {
                levelsDoneInThisCourse++;
                totalCompletedLevels++;
                if (dot) {
                    dot.classList.add('done');
                    dot.innerHTML = '<i class="fas fa-check"></i>';
                }
            } else if (levelsDoneInThisCourse === i - 1 && i <= maxLevels) {
                // Den absolut nästa nivån som INTE är klar, blir "Aktiv" (lyser blått)
                if (dot) {
                    dot.classList.add('active');
                }
            }
        }

        // 3. Uppdatera Kortets Huvud-status (Pågår / Completed / Låst)
        node.classList.remove('locked');
        const badge = node.querySelector('.status-badge');

        if (levelsDoneInThisCourse === maxLevels) {
            node.classList.add('completed');
            if (badge) {
                badge.className = 'status-badge completed';
                badge.textContent = 'Slutförd';
            }
        } else {
            node.classList.add('in-progress');
            if (badge) {
                badge.className = 'status-badge in-progress';
                badge.textContent = 'Pågår';
            }

            // Justera Tracker-genomskinligheten
            const tracker = node.querySelector('.levels-tracker');
            if (tracker) tracker.style.opacity = '1';
        }
    });

    // 4. BORTTAGET: Intro till AI styrs nu helt av databasen (precis som de andra)


    // 5. Ultimate Mastery Goal Logic (Nivå 5 & 6)
    const masteryGoal = document.querySelector('.mastery-goal');
    if (masteryGoal) {
        if (totalCompletedLevels >= requiredLevelsForMastery) {
            masteryGoal.classList.add('unlocked');
            const btn = masteryGoal.querySelector('.mastery-button');
            if (btn) {
                btn.textContent = 'Lås upp AI-Konsult';
                btn.href = 'ai-konsult.html';
                // Enable click
                btn.style.cursor = 'pointer';
            }
        }
    }
}

// ── MAIN: Start the Engine ────────────────────────────────────
async function loadProfileData() {
    const user = await waitForUser();
    if (!user) {
        return; // auth.js takes care of redirection
    }

    // Ladda ner Supabase data rekordsnabbt i parallell
    const [profileRes, milestonesRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_milestones').select('*').eq('user_id', user.id)
    ]);

    // Rendera
    renderProfileInfo(profileRes.data, user);
    renderSkillTree(milestonesRes.data || []);
}

// Kör!
loadProfileData();

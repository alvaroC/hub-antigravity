import { supabase } from './supabase.js';
import { renderers } from './renderers.js';
import { PageManager } from './ui-logic.js';
import { initGraph } from './graph.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- GEMINI LIVE ROUTER INTERCEPTOR ---
    window.addEventListener('app:nav', (e) => {
        const level = e.detail.level;
        console.log(`[Gemini AI] Routing till nivå: ${level}`);
        // Visual feedback
        const el = document.createElement('div');
        el.style = 'position:fixed;top:20px;left:50%;transform:translateX(-50%);background:#8b5cf6;color:white;padding:10px 20px;border-radius:20px;z-index:9999;font-weight:bold;box-shadow:0 4px 12px rgba(0,0,0,0.2);';
        el.innerHTML = `<i class="fas fa-robot"></i> Gemini navigerar dig till Nivå ${level}...`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 4000);

        if (level == 4) { if (!window.spaNavigate || !window.spaNavigate('ai-assistent.html')) window.location.href = 'ai-assistent.html'; }
        else if (level == 5) { if (!window.spaNavigate || !window.spaNavigate('ai-konsult.html')) window.location.href = 'ai-konsult.html'; }
        else if (level == 6) { if (!window.spaNavigate || !window.spaNavigate('bygg-ai.html')) window.location.href = 'bygg-ai.html'; }
        else console.warn(`Ingen direkt länk för Nivå ${level} ännu.`);
    });

    // --- BLOCK 1: STATE (The Memory) ---
    const appContent = document.getElementById('main-content'); // Fixed: was 'app-content'
    const navButtons = document.querySelectorAll('.nav-btn');
    const data = window.notebookData;

    // Current App State    
    let currentCourseId = 'chatgpt-mastery';
    let currentByggCourseId = 'system-processer';

    let userScore = 0;

    // Renderers and PageManager are now imported from separate modules.

    // --- BLOCK 4: CONTROLLER LOGIC (The Director) ---    

    // COURSES: Manage relationship between both Dropdown menus
    window.selectCourse = (courseId) => {
        console.log("🎬 selectCourse triggered for:", courseId);

        currentCourseId = courseId;
        window.currentCourseId = courseId; // Expose for SPA router

        if (!window.notebookData || !window.notebookData[courseId]) {
            console.error("❌ Warehouse Error: No data found for", courseId);
            return;
        }

        // UPDATED: Use 'main-content' to match your HTML
        const mainContainer = document.getElementById('main-content');
        if (mainContainer) {
            // Pass the course name to fix the "undefined" AI-Mentor label
            mainContainer.innerHTML = PageManager.renderDashboard(currentCourseId);

            // Ladda kalendern (om containern finns)
            if (document.getElementById('booking-calendar-container')) {
                new window.BookingCalendar('booking-calendar-container');
            }

            // initGraph(); // Pausad – Digital Hjärna visar platshållarbild
        }

        const grid = document.getElementById('gallery-grid');
        if (grid) {
            grid.innerHTML = `
            <div style="text-align: center; padding: 25px 15px; color: #64748b; grid-column: 1 / -1;">
                <h4 style="font-size: 1.15rem; font-weight: 600; margin-bottom: 0.4rem; color: #334155;">👋 Välkommen till ${COURSE_CATALOG[courseId].name}</h4>
                <p style="font-size: 0.85rem; margin: 0; color: #64748b;">Välj ett material i menyn ovan för att börja.</p>                
            </div>`;
        }
    };

    window.filterGallery = async (contentType) => {
        if (contentType === 'exercises') {
            if (!window.spaNavigate || !window.spaNavigate('ai-assistent.html')) window.location.href = 'ai-assistent.html';
            return;
        }

        const grid = document.getElementById('gallery-grid');
        if (!grid) return;

        // Clear the grid before rendering new content
        grid.innerHTML = "";
        const courseData = window.notebookData[currentCourseId];

        // --- "Kommer snart" fallback for empty courses ---
        if (!courseData || Object.keys(courseData).length === 0) {
            grid.innerHTML = `
            <div class="coming-soon-suite" style="text-align: center; padding: 60px 40px; grid-column: 1 / -1; background: rgba(255,255,255,0.05); border-radius: 20px; border: 1px dashed rgba(0,0,0,0.1);">
                <div style="font-size: 50px; margin-bottom: 20px; opacity: 0.6;">🎯</div>
                <h3 style="font-size: 1.6rem; margin-bottom: 10px; color: #1e293b;">Innehåll under utveckling</h3>
                <p style="color: #64748b; max-width: 450px; margin: 0 auto; line-height: 1.6;">
                    Vi fyller just nu på med expertmaterial för <strong>${COURSE_CATALOG[currentCourseId].name}</strong>. 
                    Snart hittar du rapporter, podcasts och interaktiva quiz här!
                </p>
                <div style="margin-top: 30px; display: flex; justify-content: center; gap: 15px;">
                    <span class="roadmap-badge">Syllabus ✅</span>
                    <span class="roadmap-badge">Kursplan ✅</span>
                    <span class="roadmap-badge" style="opacity:0.5;">Material ⏳</span>
                </div>
            </div>`;
            return;
        }

        // Connection between the dropdown menu and the AI Mentor
        // 1. Update the Mentor's Header Text
        const mentorTitle = document.querySelector('.ai-mentor-card h2');
        if (mentorTitle && courseData) {
            mentorTitle.innerHTML = `AI-Mentor: ${courseData.title}`;
        }

        // --- THE CRITICAL FIX: for...of loop allows 'await' to work ---
        // We loop through the keys and check if they match the selected content type
        const keys = Object.keys(courseData);

        for (const key of keys) {
            if (contentType === 'all' || contentType === key) {
                // Check if we have a renderer for this type (e.g., 'table' or 'quiz')
                if (renderers[key]) {
                    try {
                        // We 'await' the renderer here so it finishes the 'fetch'
                        let artifactHtml = await renderers[key](courseData[key]);

                        // Enkelt formulär efter varje kursmaterial
                        const isCourseMaterial = !['title', 'exercises', 'updates'].includes(key);

                        if (isCourseMaterial) {
                            const leadFormHtml = `
                            <div class="premium-lead-gen">
                                <h3>Vill du ha en AI Learning Hub?</h3>
                                <p>Vi söker tre företag. Skriv din e-mail</p>
                                <form class="lead-gen-inline-form" onsubmit="window.submitLeadForm(event, this)">
                                    <input type="email" name="email" required placeholder="Din e-post" />
                                    <button type="submit">
                                        Skicka
                                    </button>
                                </form>
                            </div>
                            `;

                            artifactHtml = `
                            <div style="display:flex; flex-direction:column; width:100%; height:100%;">
                                <div style="flex-grow:1;">
                                    ${artifactHtml}
                                </div>
                                <div>
                                    ${leadFormHtml}
                                </div>
                            </div>
                            `;
                        }

                        // Lägg till HTML
                        grid.insertAdjacentHTML('beforeend', artifactHtml);
                    } catch (error) {
                        console.error(`Error rendering artifact "${key}":`, error);
                    }
                }
            }
        }

        // --- EXTERNAL LIBRARIES TRIGGER ---
        // Handle Mermaid diagrams if present
        if (window.mermaid) {
            await mermaid.run();
        }

        // Handle Markmap auto-loading
        if (window.markmap && window.markmap.autoLoader) {
            window.markmap.autoLoader.renderAll();
        }

        // --- PROGRESS TRACKING BORTTAGET ---
        // Vi tar bort den automatiska trackningen. Nu sparar vi BARA i databasen
        // när eleven aktivt klickar på "Markera som utförd" knappen!

    };

    // --- LEAD GENERATION FORM ---
    window.submitLeadForm = async (event, formElement) => {
        event.preventDefault();

        const input = formElement.querySelector('input[type="email"]');
        const button = formElement.querySelector('button[type="submit"]');
        const email = input.value;

        const originalBtnText = button.innerHTML;
        button.innerHTML = "Skickar...";
        button.disabled = true;

        try {
            // Skicka data till n8n Webhook
            const n8nWebhookUrl = "https://ai-business-lab-v2-n8n.u7ysvb.easypanel.host/webhook/get_leads";

            const response = await fetch(n8nWebhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email })
            });

            if (!response.ok) {
                console.error("Webhook error:", response.statusText);
                alert("Ett fel uppstod när din e-post skulle skickas. Försök igen!");
                button.innerHTML = originalBtnText;
                button.disabled = false;
            } else {
                // Visuell feedback vid lyckad lagring
                button.innerHTML = "✅ Skickad!";
                button.style.backgroundColor = "#10b981"; // Grön
                button.style.borderColor = "#10b981";
                formElement.reset();

                // Återställ knappen efter 4 sekunder
                setTimeout(() => {
                    button.innerHTML = originalBtnText;
                    button.disabled = false;
                    button.style.backgroundColor = "";
                    button.style.borderColor = "";
                }, 4000);
            }
        } catch (err) {
            console.error("Nätverksfel:", err);
            alert("Kunde inte skicka e-posten pga nätverksfel.");
            button.innerHTML = originalBtnText;
            button.disabled = false;
        }
    };

    // Mentor panel chat
    // --- Updated Mentor Chat Logic with Markdown Support ---
    window.sendMessage = async (source = 'default') => {
        // 1. Determine input and output based on source
        let inputId = 'user-input';
        let outputId = 'chat-window';

        if (source === 'consultant') {
            inputId = 'konsult-chat-input';
            outputId = 'konsult-messages';
        } else if (source === 'mentor') {
            // Correctly set the IDs to match your Lambda Renderer
            inputId = 'mentor-chat-input';
            outputId = 'mentor-chat-messages';
        }

        const input = document.getElementById(inputId);
        const chatWindow = document.getElementById(outputId);

        // 2. Validation
        if (!input || !chatWindow) {
            console.error("❌ Chat elements not found for source:", source);
            return;
        }

        const message = input.value.trim();
        if (!message) return;

        // 3. Display User Message
        const userDiv = document.createElement('div');
        userDiv.className = 'message user';
        userDiv.innerText = message;
        chatWindow.appendChild(userDiv);

        input.value = '';
        chatWindow.scrollTop = chatWindow.scrollHeight;

        // --- PROGRESS TRACKING: NIVÅ 3 (triggas automatiskt när eleven chattar med AI-Mentor) ---
        if (source === 'mentor' && window.currentUser && currentCourseId) {
            supabase
                .from('user_milestones')
                .upsert({
                    user_id: window.currentUser.id,
                    course_id: currentCourseId,
                    level_3_done: true,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id, course_id' })
                .then(({ error }) => {
                    if (error) console.error('Nivå 3 upsert-fel:', error.message);
                    else console.log('✅ Nivå 3 aktiverad för:', currentCourseId);
                });
        }

        // 4. Create Typing Indicator
        let indicator = document.createElement('div');
        indicator.className = 'message ai typing';
        indicator.innerText = source === 'consultant' ? 'Consultant tänker...' : 'Mentorn läser materialet...';
        chatWindow.appendChild(indicator);

        // 5. Fetch from LLM Wiki Backend Server
        try {
            const response = await fetch('http://localhost:3000/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message
                })
            });

            const data = await response.json();

            // Remove Indicator
            if (indicator) indicator.remove();

            // 6. Display AI Response with Markdown Rendering
            const aiDiv = document.createElement('div');
            aiDiv.className = 'message ai';
            const formattedAnswer = marked.parse(data.reply || "Jag kunde tyvärr inte svara på det just nu.");
            aiDiv.innerHTML = `
            <span class="message-icon">🤖</span> 
            <div class="markdown-body">${formattedAnswer}</div>
        `;
            chatWindow.appendChild(aiDiv);

            // 7. Save conversation to Supabase chat_history
            if (window.currentUser) {
                const chatRows = [
                    { user_id: window.currentUser.id, course_id: currentCourseId, role: 'user', message: message },
                    { user_id: window.currentUser.id, course_id: currentCourseId, role: 'assistant', message: data.reply || '' }
                ];
                const { error } = await supabase.from('chat_history').insert(chatRows);
                if (error) console.error('Chat save error:', error.message);
                else console.log('💬 Chat saved to Supabase');
            }

        } catch (error) {
            console.error("Fetch Error:", error);
            if (indicator) indicator.remove();

            const errDiv = document.createElement('div');
            errDiv.className = 'message ai error';
            errDiv.innerHTML = `<span class="message-icon">⚠️</span> <em>(Kunde inte nå AI-bryggan)</em>`;
            chatWindow.appendChild(errDiv);
        } finally {
            chatWindow.scrollTop = chatWindow.scrollHeight;
        }
    };

    // -------------------------------------------------------
    // RIGHT COLUMN – Bygg AI Förmåga
    // -------------------------------------------------------
    window.selectByggCourse = function (courseId) {
        currentByggCourseId = courseId;
        const byggGrid = document.getElementById('bygg-gallery');
        if (byggGrid) {
            byggGrid.innerHTML = `
        <div class="dark-welcome-msg">
            <span style="font-size:1.6rem;">👋</span>
            <span>Välkommen!</span>
            <span style="font-size:0.82rem;opacity:0.55;">Välj material i menyn ovan för att börja.</span>
        </div>`;
        }
        const filterDrop = document.getElementById('bygg-filter-dropdown');
        if (filterDrop) filterDrop.value = 'all';
    }


    //Artefact: Start Quiz    
    window.loadActiveQuiz = async () => {
        const courseData = window.notebookData[currentCourseId];

        // FIX 1: Look inside the .quiz object as defined in your data.js
        const quizInfo = courseData ? courseData.quiz : null;

        if (!quizInfo || !quizInfo.quizUrl) {
            console.error("❌ No quiz URL found for course:", currentCourseId);
            return;
        } // FIX 2: Correctly close the IF block here so the try/catch can run

        try {
            console.log("📥 Loading quiz from:", quizInfo.quizUrl);
            const response = await fetch(quizInfo.quizUrl);
            const quizData = await response.json();

            window.activeQuizModules = quizData.modules;
            window.renderQuizQuestion(0, 0);

        } catch (error) {
            console.error("❌ Failed to load quiz JSON:", error);
        }
    };

    window.renderQuizQuestion = (mIdx, qIdx) => {
        const module = window.activeQuizModules[mIdx];
        const question = module.questions[qIdx];

        // FIX: Target the container that actually exists on your screen
        let displayArea = document.querySelector('.quiz-container');

        // Fallback: If quiz-container isn't found, try a generic classroom container
        if (!displayArea) {
            displayArea = document.querySelector('.artifact-display') || document.getElementById('quiz-area');
        }

        if (!displayArea) {
            console.error("❌ Still no container! Ensure your HTML has a <div class='quiz-container'>.");
            return;
        }

        // Now proceed to draw the question
        displayArea.innerHTML = `
        <div class="quiz-active-card">
            <div class="quiz-header">
                <span class="module-name">${module.module_name}</span>
                <span class="progress">Fråga ${qIdx + 1} av ${module.questions.length}</span>
            </div>
            <h2 class="quiz-question-text">${question.question}</h2>
            <div class="quiz-options-grid">
                ${question.options.map((opt, i) => `
                    <button class="quiz-option-btn" onclick="window.submitQuizAnswer(${mIdx}, ${qIdx}, ${i})">
                        ${opt}
                    </button>
                `).join('')}
            </div>
            <div id="quiz-feedback"></div>
        </div>`;
    };

    // Quiz score tracker – reset when a new quiz starts
    window.activeQuizModules = [];
    window.quizScore = 0;
    window.quizTotal = 0;

    window.loadActiveQuiz = async function () {
        const courseData = window.notebookData ? window.notebookData[currentCourseId] : null;
        const quizInfo = courseData ? courseData.quiz : null;
        if (!quizInfo || !quizInfo.quizUrl) { alert('Quiz-filen saknas.'); return; }

        try {
            const resp = await fetch(quizInfo.quizUrl);
            const quizData = await resp.json();

            let modules = [];
            if (quizData.modules) {
                modules = quizData.modules;
            } else if (quizData.quiz) {
                // Treat all questions as a single continuous module so they flow in order of ID
                const questions = quizData.quiz.map(q => {
                    const optKeys = Object.keys(q.options || {});
                    const optArray = optKeys.map(k => q.options[k]);
                    const correctIndex = optKeys.indexOf(q.correct_answer);

                    return {
                        question: q.question,
                        category: q.category || 'Quiz',
                        options: optArray,
                        correct_answer_index: correctIndex >= 0 ? correctIndex : 0,
                        explanation: q.explanation
                    };
                });
                modules = [{
                    module_name: 'Quiz',
                    questions: questions
                }];
            }

            window.activeQuizModules = modules;
            window.quizScore = 0;
            window.quizTotal = 0;

            if (modules.length > 0 && modules[0].questions.length > 0) {
                window.renderQuizQuestion(0, 0);
            } else {
                console.error('Quiz data saknar frågor eller moduler.', quizData);
            }
        } catch (e) { console.error('Quiz load error:', e); }
    };

    window.renderQuizQuestion = function (mIdx, qIdx) {
        const module = window.activeQuizModules[mIdx];
        const question = module.questions[qIdx];
        const area = document.querySelector('.quiz-container') || document.getElementById('quiz-area');
        if (!area) return;

        area.innerHTML = `
    <div class="quiz-active-card">
        <div class="quiz-header">
            <span class="module-name">${question.category || module.module_name}</span>
            <span class="progress">Fråga ${qIdx + 1} av ${module.questions.length}</span>
        </div>
        <h2 class="quiz-question-text">${question.question}</h2>
        <div class="quiz-options-grid">
            ${question.options.map((opt, i) => `
                <button class="quiz-option-btn" onclick="submitQuizAnswer(${mIdx},${qIdx},${i})">${opt}</button>
            `).join('')}
        </div>
        <div id="quiz-feedback" style="margin-top:0.8rem;"></div>
    </div>`;
    };

    window.submitQuizAnswer = function (mIdx, qIdx, selectedIdx) {
        const module = window.activeQuizModules[mIdx];
        const question = module.questions[qIdx];
        const fb = document.getElementById('quiz-feedback');
        const isCorrect = selectedIdx === question.correct_answer_index;

        if (fb.getAttribute('data-answered') === 'true') return;

        window.quizTotal++;

        if (isCorrect) {
            window.quizScore++;
            fb.setAttribute('data-answered', 'true');

            let html = `<p style="color:#059669;font-weight:600;font-size:0.9rem;margin-bottom:0.5rem;">✅ Rätt svar!</p>`;

            if (question.explanation) {
                html += `<div style="background:#f8fafc; border-left:4px solid #059669; padding:0.75rem; border-radius:4px; margin-bottom:1rem; text-align:left;">
                        <strong style="color:#059669;font-size:0.85rem;text-transform:uppercase;">Förklaring</strong>
                        <p style="color:#334155;font-size:0.95rem;margin-top:0.3rem;">${question.explanation}</p>
                     </div>`;
            }

            html += `<button class="nav-btn active" onclick="window.nextQuizQuestion(${mIdx}, ${qIdx})" style="padding:0.6rem 1.2rem;">Nästa →</button>`;
            fb.innerHTML = html;

            const optionsGrid = fb.previousElementSibling;
            if (optionsGrid) {
                const btns = optionsGrid.querySelectorAll('.quiz-option-btn');
                btns.forEach((btn, idx) => {
                    btn.style.pointerEvents = 'none';
                    if (idx === selectedIdx) {
                        btn.style.backgroundColor = '#d1fae5';
                        btn.style.borderColor = '#059669';
                        btn.style.color = '#065f46';
                    } else {
                        btn.style.opacity = '0.5';
                    }
                });
            }
        } else {
            fb.innerHTML = `<p style="color:#ef4444;font-weight:600;font-size:0.9rem;">❌ Fel svar – försök igen!</p>`;
        }
    }

    window.nextQuizQuestion = function (mIdx, qIdx) {
        const module = window.activeQuizModules[mIdx];
        if (qIdx + 1 < module.questions.length) {
            renderQuizQuestion(mIdx, qIdx + 1);
        } else if (mIdx + 1 < window.activeQuizModules.length) {
            renderQuizQuestion(mIdx + 1, 0);
        } else {
            const area = document.querySelector('.quiz-active-card');
            if (area) area.innerHTML = `
            <div style="text-align:center;padding:2rem 0.5rem;">
                <div style="font-size:3rem;margin-bottom:0.8rem;">🎉</div>
                <h2 style="font-size:1.2rem;">Quiz slutfört!</h2>
                <p style="font-size:1rem;margin:0.8rem 0;">Du fick <strong>${window.quizScore} av ${window.quizTotal}</strong> rätt</p>
                <button class="btn-primary" onclick="loadActiveQuiz()" style="margin-top:0.8rem;">Försök igen</button>
            </div>`;
            window.quizScore = 0;
            window.quizTotal = 0;
        }
    };

    //Zoom Infographic
    window.openLightbox = (src) => {
        // Create the overlay container
        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox-overlay';

        // Set the internal HTML
        lightbox.innerHTML = `
        <div class="lightbox-content">
            <span class="lightbox-close">&times;</span>
            <img src="${src}" class="lightbox-image">
        </div>`;

        // Append to body
        document.body.appendChild(lightbox);

        // Close logic
        lightbox.onclick = () => {
            document.body.removeChild(lightbox);
        };
    };

    // Video Overlay Toggle
    window.toggleMainVideo = (btn, url) => {
        // Create the overlay container
        const lightbox = document.createElement('div');
        lightbox.id = 'lightbox-overlay';

        // Set the internal HTML with a wider width and a video tag
        lightbox.innerHTML = `
        <div class="lightbox-content" style="max-width: 900px; width: 95%;">
            <span class="lightbox-close">&times;</span>
            <video controls autoplay style="width: 100%; border-radius: 8px;">
                <source src="${url}" type="video/mp4">
            </video>
        </div>`;

        // Append to body
        document.body.appendChild(lightbox);

        // Close logic
        lightbox.onclick = (e) => {
            if (e.target === lightbox || e.target.className === 'lightbox-close') {
                document.body.removeChild(lightbox);
            }
        };
    };

    // =====================================================
    // PROGRAM CAROUSEL (window.emma)
    // Bilder lagras lokalt under assets/media/images/programs/
    // Lägg till bilder i rätt mapp och uppdatera listan nedan.
    // =====================================================
    const PROGRAM_IMAGES = {
        'ChatGPT-Mastery': [
            'assets/ui/carusell/slide0.png',
            'assets/ui/carusell/slide1.png',
            'assets/ui/carusell/slide2.png',
            'assets/ui/carusell/slide3.png',
            'assets/ui/carusell/slide4.png',
            'assets/ui/carusell/slide5.png',
            'assets/ui/carusell/slide6.png',
            'assets/ui/carusell/slide7.png',
            'assets/ui/carusell/slide8.png'

        ],
        'AI-Konsult': [
            'assets/media/images/programs/ai-konsult/slide1.png',
            'assets/media/images/programs/ai-konsult/slide2.png',
            'assets/media/images/programs/ai-konsult/slide3.png',
        ],
        'Bygg-AI-Förmåga': [
            'assets/media/images/programs/bygg-ai-formaga/slide1.png',
            'assets/media/images/programs/bygg-ai-formaga/slide2.png',
            'assets/media/images/programs/bygg-ai-formaga/slide3.png',
        ]
    };

    let _carouselIndex = 0;
    let _carouselImages = [];

    function _renderCarousel() {
        const wrapper = document.getElementById('carouselWrapper');
        if (!wrapper) return;
        const total = _carouselImages.length;
        if (total === 0) {
            wrapper.innerHTML = `<p style="color:#aaa; font-size:0.9rem; margin-top:10px;">Inga bilder hittades. Lägg till bilder i mappen.</p>`;
            return;
        }
        wrapper.innerHTML = `
            <div style="position:relative; margin-top:14px; border-radius:12px; overflow:hidden; background:#e0f2fe; border:1px solid rgba(14,165,233,0.2);">
                <img id="carousel-img" src="${_carouselImages[_carouselIndex]}"
                    alt="Program bild ${_carouselIndex + 1}"
                    style="width:100%; max-height:300px; object-fit:contain; display:block;">
                <div style="display:flex; align-items:center; justify-content:space-between; padding:10px 12px; background:rgba(0,0,0,0.06);">
                    <button onclick="window.emma.prevSlide()" style="background:rgba(0,0,0,0.1); border:none; color:#333; padding:6px 14px; border-radius:6px; cursor:pointer; font-size:1.1rem;">&#8592;</button>
                    <span style="color:#444; font-size:0.85rem; font-weight:600;">${_carouselIndex + 1} / ${total}</span>
                    <button onclick="window.emma.nextSlide()" style="background:rgba(0,0,0,0.1); border:none; color:#333; padding:6px 14px; border-radius:6px; cursor:pointer; font-size:1.1rem;">&#8594;</button>
                </div>
            </div>`;
    }

    window.emma = {
        handleCategoryChange(programKey) {
            _carouselIndex = 0;
            _carouselImages = PROGRAM_IMAGES[programKey] || [];
            _renderCarousel();
        },
        nextSlide() {
            if (_carouselImages.length === 0) return;
            _carouselIndex = (_carouselIndex + 1) % _carouselImages.length;
            _renderCarousel();
        },
        prevSlide() {
            if (_carouselImages.length === 0) return;
            _carouselIndex = (_carouselIndex - 1 + _carouselImages.length) % _carouselImages.length;
            _renderCarousel();
        },
        sendMessage() {
            // Behåll gammal chat-funktion om den behövs
            window.sendMessage('consultant');
        }
    };


    // -------------------------------------------------------
    // RIGHT COLUMN – Bygg AI Förmåga (ported for bygg-ai.html)
    // -------------------------------------------------------
    window.selectByggCourse = function (courseId) {
        currentByggCourseId = courseId;
        const byggGrid = document.getElementById('bygg-gallery');
        if (byggGrid) {
            byggGrid.innerHTML = `
            <div style="text-align: center; margin-top: 2.5rem; color: rgba(255,255,255,0.5); font-size: 0.9rem;">
                <span style="font-size: 1.5rem; display: block; margin-bottom: 0.5rem;">👋</span>
                Välkommen till din kurs!<br>Välj material i menyn ovan för att börja.
            </div>`;
        }
        const filterDrop = document.getElementById('bygg-filter-dropdown');
        if (filterDrop) filterDrop.value = 'all';
    }

    window.filterByggGallery = async function (contentType) {
        const grid = document.getElementById('bygg-gallery');
        if (!grid) return;

        grid.innerHTML = '';

        const courseData = window.notebookData ? window.notebookData[currentByggCourseId] : null;

        if (!courseData || Object.keys(courseData).length === 0) {
            grid.innerHTML = `
            <div style="text-align: center; padding: 60px 40px; background: rgba(255,255,255,0.05); border-radius: 20px;">
                <div style="font-size: 2.5rem; opacity: 0.4;">🎯</div>
                <span style="display:block;margin-top:10px;color:rgba(255,255,255,0.7);">Material under utveckling – kom tillbaka snart!</span>
            </div>`;
            return;
        }

        const keysToSkip = ['title', 'updates', 'exercises'];
        const keys = Object.keys(courseData).filter(k => !keysToSkip.includes(k));
        let hasContent = false;

        for (const key of keys) {
            if (contentType !== 'all' && contentType !== key) continue;
            if (!renderers[key]) continue;
            try {
                const html = await renderers[key](courseData[key]);
                grid.insertAdjacentHTML('beforeend', html);
                hasContent = true;
            } catch (e) {
                console.error(`Bygg render error for "${key}":`, e);
            }
        }

        if (!hasContent) {
            grid.innerHTML = `
            <div style="text-align: center; margin-top: 2rem; color: rgba(255,255,255,0.6);">
                <span style="font-size:1.8rem;">🔍</span><br>
                Inget material av typen <strong>${contentType}</strong> hittades.
            </div>`;
        }

        if (window.mermaid) await window.mermaid.run();
        if (window.markmap && window.markmap.autoLoader) window.markmap.autoLoader.renderAll();
    };

    // INITIALIZATION (Call this directly!)

    if (!window.location.pathname.includes('resurs.html')) {
        console.log("🚀 DOM is ready. Initializing Hub...");
        window.selectCourse(currentCourseId); // This removes the "Laddar" screen
    } else {
        console.log("📍 Resurs page - skipping auto-initialization");
    }


}); // <--- FINAL CLOSING of DOMContentLoaded

// <--- alvcla

// --- LJUDLOGIK ---
window.toggleAudio = function () {
    const audio = document.getElementById("myAudio");
    if (!audio) {
        console.error("Hittade inget ljud-element med id 'myAudio'");
        return;
    }

    if (audio.paused) {
        audio.play();
        console.log("Ljud startat");
    } else {
        audio.pause();
        audio.currentTime = 0;
        console.log("Ljud stoppat och nollställt");
    }
};
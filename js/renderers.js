/**
 * Renderers for SwedAI Academy
 * Contains functions that generate HTML for various artifact types and UI panels.
 */

export function artifactHead({ icon, label, title, subtitle, gradient, titleColor, subtitleColor }) {
    return `
    <div class="artifact-head" style="background:${gradient};">
        <div class="artifact-head-icon">${icon}</div>
        <div class="artifact-head-label">${label}</div>
        <h2 class="artifact-head-title" style="color:${titleColor};">${title}</h2>
        <p class="artifact-head-subtitle" style="color:${subtitleColor};">${subtitle}</p>
    </div>`;
}

export const renderers = {

    // --- ARTEFAKTER ---
    classroomPanel: (currentCourseId) => {
        // Find the catalog in the global scope (handle window or direct global)
        const catalog = window.COURSE_CATALOG || (typeof COURSE_CATALOG !== 'undefined' ? COURSE_CATALOG : {});
        const courseEntry = catalog[currentCourseId];
        const courseName = courseEntry ? courseEntry.name : 'Välj kurs';

        return `
        
        <div class="column-header level-header lvl-brain" style="margin-top: 1.5rem;">
            <h3 class="column-title opacity">📚 ARTEFKTER</h3>
            <p class="column-description">Utforska kursmaterial: klicka på rullgardins menyer nedan</p>
        </div>

        <div class="content-section" style="margin-bottom: 20px;">
            <div class="section-header">
                <span class="section-icon">🎓</span>
                <h3 class="section-title">Select Course</h3>
            </div>
            <select class="light-select" id="course-selector" onchange="window.selectCourse(this.value)">
                ${Object.values(catalog).map(c =>
            `<option value="${c.id}" ${c.id === currentCourseId ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
        </div>

        <div class="light-control-box" style="margin-top:1.25rem; margin-bottom: 20px;">
            <div class="control-row">
                <span class="control-icon icon-orange">📂</span>
                <h3 class="light-control-label">Course Material: <span id="active-course-name">${courseName}</span></h3>
            </div>
            
            <select class="light-select" id="content-filter-dropdown" onchange="window.filterGallery(this.value)">
                <option value="all">Show All Material</option>                        
                <option value="podcast">🎙️ Podcast</option>                                
                <option value="video">🎥 Video</option>                                                             
                <option value="presentation">📽️ Presentation</option>     
                <option value="infographic">📊 Infographics</option>                                                                                 
                <option value="report">📝 Reports</option>
                <option value="flashcards">🃏 Flashcards</option>
                <option value="quiz">📝 Quiz</option>                                    
            </select>   

            <div class="gallery-grid" id="gallery-grid" style="margin-top: 1.5rem;">
                <div class="welcome-msg">Välj material för att börja lära dig!</div>
            </div>                      

        </div>`;
    },

    // --- AI GUIDE (Mitten kolumn) ---
    digitalHjarnaPanel: () => `
        <div class="column-header level-header lvl-1" style="margin-top: 1.5rem;">                    
            <h3 class="column-title opacity"> AI GUIDE</h3>
            <p class="column-description">Navigerar en webbplatsen med hjälp av naturligt språk. Se video</p>
        </div>
        <div class="video-container">
            <video width="100%" height="auto" controls class="custom-video">
                <source src="assets/ui/ai-guide.mp4" type="video/mp4">
                Din webbläsare stödjer inte video-taggen.
            </video>          
        </div>`,

    // --- AI VOICE AGENT Panel (Höger kolumn) ---
    mentorPanel: () => `
    <div class="admin-page-wrapper">
            <!-- HÖGER KOLUMN: Admin Profil & Program -->
            <div class="admin-column dashboard-right">
                <div class="column-header level-header lvl-3">                    
                    <h3 class="column-title opacity">AI VOICE AGENT</h3>
                    <p class="column-description">Din personliga support</p>
                </div>

                <div class="dashboard-section voice-agent-zone">
                    <div class="admin-profile">
                        <img src="assets/ui/malin.png" class="admin-avatar-img" alt="Admin Profil">
                        <h4 class="admin-name">Mitt namn är Malin: Hur kan jag hjälpa dig? Klicka på "Start a Call" nedan för att prata med mig.</h4>                        
                    </div>

                    <div class="voice-agent">

                        <img src="assets/ui/voice_agent.png" alt="Starta/Stoppa ljud" onclick="toggleAudio()">
                        <audio id="myAudio">
                           <source src="assets/ui/audio_voice.m4a" type="audio/mp4">
                        </audio>

                    </div>        
                </div>

                <div class="content-section">
                    <div class="section-header">
                        <span class="section-icon">📚</span>
                        <h3 class="section-title">Our Programs</h3>
                    </div>
                    <select id="productSelector" class="category-selector"
                        onchange="window.emma.handleCategoryChange(this.value)">
                        <option value="" selected disabled>Select Program</option>
                        <option value="ChatGPT-Mastery">🎓 ChatGPT Mastery</option>
                        <option value="AI-Konsult">🎓 AI-Konsult</option>
                        <option value="Bygg-AI-Förmåga">🎓 Bygg AI Förmåga</option>
                    </select>
                    <div id="carouselWrapper"></div>
                </div>
            </div>           
        </div>`,

    // --- AI WIKI Panel ---
    wikiPanel: () => `
        <div class="column-header level-header lvl-wiki" style="margin-top: 1.5rem;">                    
            <h3 class="column-title opacity">📚 AI-Wiki</h3>
            <p class="column-description">Företagets intelligenta informationslager</p>
        </div>
        <div class="wiki-container-body">
            <figure>
                <img src="assets/ui/wiki-graf.png" width="350px" height="150px"  alt="AI Wiki">            
                <figcaption class="fig-caption"><strong>AI-Wiki: visualisering av ett advokatbyrås kunskapsnätverk</strong></figcaption>    
            </figure>
            <p> <strong>AI-Wiki för juridik:</strong> avtal, klausuler, juridiska begrepp, processer och expertis kopplas samman i ett intelligent kunskapsnätverk som gör det 
              enklare att hitta information, förstå samband och återanvända erfarenheter.</p>
        </div>`,


    // --- Flera Artefakter ---
    artefakter: () => `
    </br>
    <div class="center-fig">
        <a href="artefakter.html"
            style="background: linear-gradient(135deg, #7f1d1d 0%, #b91c1c 40%, #ef4444 100%) !important; padding:8px 16px; border-radius:8px; text-decoration:none; color:#fff; font-weight:600;">
              FÖR ATT SE FLERA ARTEFAKTER EXEMPEL, KLICKA HÄR!
        </a>                   

    </div> `,

    // 1. Podcast
    podcast: (data) => `
    <div class="artifact-card-new">
        ${artifactHead({
        icon: '<i class="fas fa-microphone-alt"></i>',
        label: 'PODCAST',
        title: data.title,
        subtitle: data.description || 'Lyssna på veckans avsnitt',
        gradient: 'linear-gradient(135deg, #0f2c4a 0%, #1a5276 50%, #117a8b 100%)',
        titleColor: '#ffffff',
        subtitleColor: 'rgba(180,230,255,0.85)'
    })}
        <div class="artifact-body">
            <audio controls src="${data.url}" preload="auto"></audio>
        </div>
    </div>`,

    // 2. Infographic                      
    infographic: (data) => `
    <div class="artifact-card-new">
        ${artifactHead({
        icon: '<i class="fas fa-chart-bar"></i>',
        label: 'INFOGRAFIK',
        title: data.title,
        subtitle: data.summary || 'Klicka på bilden för att zooma',
        gradient: 'linear-gradient(135deg, #6b1a4b 0%, #c0392b 50%, #e74c3c 100%)',
        titleColor: '#ffffff',
        subtitleColor: 'rgba(255,200,200,0.85)'
    })}
        <div class="artifact-body">
            <div style="cursor:zoom-in;" onclick="window.openLightbox('${data.imageUrl}')">
                <img src="${data.imageUrl}" alt="${data.title}"
                     style="width:100%;height:auto;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.12);">
                <p style="text-align:center;font-size:0.75rem;color:#94a3b8;margin-top:8px;">🔍 Klicka för att zooma</p>
            </div>
        </div>
    </div>`,

    // 3. Video
    video: (data) => `
    <div class="artifact-card-new">
        ${artifactHead({
        icon: '<i class="fas fa-film"></i>',
        label: 'VIDEO',
        title: data.title,
        subtitle: data.description || 'Titta på kursvideo',
        gradient: 'linear-gradient(135deg, #2d1b69 0%, #5b2d8e 50%, #8e44ad 100%)',
        titleColor: '#ffffff',
        subtitleColor: 'rgba(220,190,255,0.85)'
    })}
        <div class="artifact-body">
            <video controls width="100%" src="${data.url}" style="border-radius:8px;"></video>
        </div>
    </div>`,

    // 4. Mindmap
    mindmap: (data) => `
    <div class="artifact-card-new">
        ${artifactHead({
        icon: '<i class="fas fa-brain"></i>',
        label: 'MIND MAP',
        title: data.title,
        subtitle: 'Interaktiv kunskapsöversikt',
        gradient: 'linear-gradient(135deg, #0b3d2e 0%, #1a7a50 50%, #27ae60 100%)',
        titleColor: '#ffffff',
        subtitleColor: 'rgba(160,255,200,0.85)'
    })}
        <div class="artifact-body artifact-body-mindmap">
            <div class="markmap">
                <script type="text/template">${data.content}</script>
            </div>
        </div>
    </div>`,

    // 5. Quiz
    quiz: (data) => `
    <div class="artifact-card-new quiz-container" id="quiz-area">
        ${artifactHead({
        icon: '<i class="fas fa-question-circle"></i>',
        label: 'QUIZ',
        title: data.title,
        subtitle: 'Testa dina kunskaper',
        gradient: 'linear-gradient(135deg, #7d3c00 0%, #d35400 50%, #e67e22 100%)',
        titleColor: '#ffffff',
        subtitleColor: 'rgba(255,220,160,0.85)'
    })}
        <div class="artifact-body" style="text-align:center;">
            <button class="nav-btn active" onclick="loadActiveQuiz()" style="margin:0 auto;display:inline-flex;">Starta Quiz</button>
        </div>
    </div>`,

    // 7. Report       
    report: (data) => `
    <div class="artifact-card-new">
        ${artifactHead({
        icon: '<i class="fas fa-file-alt"></i>',
        label: 'RAPPORT / E-BOOK',
        title: data.title,
        subtitle: data.summary || 'Fördjupa din kunskap',
        gradient: 'linear-gradient(135deg, #1c2b3a 0%, #2c3e50 50%, #34495e 100%)',
        titleColor: '#ffffff',
        subtitleColor: 'rgba(180,210,240,0.85)'
    })}
        <div class="artifact-body">
            <div class="report-preview-box">
                <h3 style="font-size:0.78rem;text-transform:uppercase;letter-spacing:0.5px;color:#64748b;margin-bottom:0.6rem;">Innehåll i rapporten:</h3>
                <ul class="report-chapter-list">
                    ${data.chapters.map(c => `<li>${c}</li>`).join('')}
                </ul>
            </div>
            <div class="report-actions" style="margin-top: 15px;">
                <a href="${data.fileUrl}" download class="download-btn">
                    <span>📥</span> Ladda ned (PDF)
                </a>
            </div>
        </div>
    </div>`,

    // 8. Table                
    table: async (tableConfig) => {
        try {
            const response = await fetch(tableConfig.sourceFile);
            const fullData = await response.json();
            return `
            <div class="artifact-card-new">
                ${artifactHead({
                icon: '<i class="fas fa-table"></i>',
                label: 'JÄMFÖRELSETABELL',
                title: fullData.titel,
                subtitle: 'Strukturerad kunskapsöversikt',
                gradient: 'linear-gradient(135deg, #1a3a5c 0%, #1a6fa8 50%, #2980b9 100%)',
                titleColor: '#ffffff',
                subtitleColor: 'rgba(180,220,255,0.85)'
            })}
                <div class="artifact-body artifact-body-table">
                    <table class="comparison-grid">
                        <thead>
                            <tr>
                                <th style="width:40%">BESKRIVNING</th>
                                <th style="width:30%">ANALOGI</th>
                                <th style="width:30%">EXEMPEL</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${fullData.grenar.map(gren => `
                                <tr class="branch-header-row"><td colspan="3"><h4 style="margin:0">${gren.typ}</h4></td></tr>
                                <tr class="branch-content-row">
                                    <td><p>${gren.beskrivning}</p></td>
                                    <td><span class="analogi-text">"${gren.analogi}"</span></td>
                                    <td><ul class="example-list">${gren.exempel.map(ex => `<li>${ex}</li>`).join('')}</ul></td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
        } catch (e) {
            return `<div class="artifact-card-new"><div class="artifact-body" style="text-align:center;padding:1.5rem;color:#ef4444;">Kunde inte ladda tabellen.</div></div>`;
        }
    },

    flashcards: async (data) => {
        let cards = data.cards;
        let title = data.title;

        if (data.flashcardsUrl) {
            try {
                const response = await fetch(data.flashcardsUrl);
                const loadedData = await response.json();
                cards = loadedData.cards;
                title = loadedData.title || title;
            } catch (e) {
                return `<div class="artifact-card-new"><div class="artifact-body" style="text-align:center;padding:1.5rem;color:#ef4444;">Kunde inte ladda flashcards.</div></div>`;
            }
        }

        if (!cards || cards.length === 0) {
            return `<div class="artifact-card-new"><div class="artifact-body" style="text-align:center;padding:1.5rem;color:#ef4444;">Inga flashcards hittades.</div></div>`;
        }

        let currentIndex = 0;
        let isShowingAnswer = false;

        window.refreshFlashcard = () => {
            const cardText = document.getElementById('fc-display-text');
            const actionBtn = document.getElementById('fc-action-btn');
            const counter = document.getElementById('fc-counter-text');
            if (!cardText) return;

            if (isShowingAnswer) {
                cardText.innerHTML = `<div class="answer-reveal"><strong>SVAR:</strong><br>${cards[currentIndex].a}</div>`;
                actionBtn.innerText = "Nästa kort →";
                actionBtn.onclick = () => {
                    currentIndex = (currentIndex + 1) % cards.length;
                    isShowingAnswer = false;
                    window.refreshFlashcard();
                };
            } else {
                cardText.innerHTML = `<div class="question-view">${cards[currentIndex].q}</div>`;
                actionBtn.innerText = "Visa Svar";
                actionBtn.onclick = () => { isShowingAnswer = true; window.refreshFlashcard(); };
            }
            counter.innerText = `Kort ${currentIndex + 1} av ${cards.length}`;
        };

        return `
        <div class="artifact-card-new">
            ${artifactHead({
            icon: '<i class="fas fa-clone"></i>',
            label: 'FLASHCARDS',
            title: title,
            subtitle: `${cards.length} kort – testa ditt minne`,
            gradient: 'linear-gradient(135deg, #5c3d00 0%, #b7770d 50%, #f0a500 100%)',
            titleColor: '#ffffff',
            subtitleColor: 'rgba(255,240,180,0.9)'
        })}
            <div class="artifact-body">
                <div class="fc-header" style="margin-bottom:0.8rem;justify-content:flex-end;">
                    <span id="fc-counter-text" class="badge">Laddar...</span>
                </div>
                <div id="fc-display-text" class="fc-content-area">${cards[0].q}</div>
                <div class="fc-footer" style="margin-top:1rem;">
                    <button id="fc-action-btn" onclick="window.refreshFlashcard()">Visa Svar</button>
                </div>
            </div>
        </div>
        <script>setTimeout(window.refreshFlashcard, 50);<\/script>`;
    },

    // 10. Presentation
    presentation: (data) => {
        let currentSlide = 0;

        window.refreshPresentation = () => {
            const img = document.getElementById('pres-img');
            const counter = document.getElementById('pres-counter');
            const nextBtn = document.getElementById('pres-next-btn');
            if (!img) return;
            img.src = data.slides[currentSlide];
            counter.innerText = `Slide ${currentSlide + 1} av ${data.slides.length}`;
            nextBtn.innerText = (currentSlide === data.slides.length - 1) ? "Börja om" : "Nästa →";
        };

        window.changeSlide = (step) => {
            currentSlide = (currentSlide + step + data.slides.length) % data.slides.length;
            window.refreshPresentation();
        };

        return `
        <div class="artifact-card-new">
            ${artifactHead({
            icon: '<i class="fas fa-tv"></i>',
            label: 'PRESENTATION',
            title: data.title,
            subtitle: `${data.slides.length} slides – klicka dig igenom`,
            gradient: 'linear-gradient(135deg, #3d0066 0%, #7b1fa2 50%, #ab47bc 100%)',
            titleColor: '#ffffff',
            subtitleColor: 'rgba(230,180,255,0.85)'
        })}
            <div class="artifact-body">
                <div class="fc-header" style="margin-bottom:0.8rem;justify-content:flex-end;">
                    <span id="pres-counter" class="badge">Laddar...</span>
                </div>
                <div class="pres-viewer">
                    <img id="pres-img" src="${data.slides[0]}" alt="Slide">
                </div>
                <div class="fc-footer" style="margin-top:1rem;">
                    <button class="nav-btn" onclick="changeSlide(-1)">← Föregående</button>
                    <button id="pres-next-btn" class="fc-red-btn" onclick="changeSlide(1)">Nästa →</button>
                </div>
            </div>
        </div>
        <script>setTimeout(window.refreshPresentation, 50);<\/script>`;
    },


    // 11. Exercises
    exercises: (data) => {
        return `
        <div class="artifact-card" style="text-align: center; padding: 50px;">
            <div class="icon" style="font-size: 50px; margin-bottom: 20px;">🛠️</div>
              <h3>Dina Övningar väntar i Notion</h3>
            <p>Klicka på knappen nedan för att öppna uppgifterna i en ny flik.</p>
            <a href="${data.url}" target="_blank" class="nav-button" style="display: inline-block; background: #eb5757; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">
                Öppna Notion ↗
            </a>
        </div>`;
    },

    // 12. Tutor (Universal AI Interface)
    tutor: (config) => `
        <div class="chat-section">
            <div class="chat-header">
                <span class="chat-icon">${config.icon || '🤖'}</span>
                <h3>${config.title}</h3>
            </div>
            <div class="chat-content">
                <div id="${config.target}-chat-messages" class="agent-response">
                    <i class="fas fa-robot"></i> ${config.greeting}
                </div>
                <div class="input-group">
                    <textarea id="${config.target}-chat-input" class="chat-input" placeholder="Fråga AI..." rows="1"></textarea>
                    <button class="send-button" onclick="window.sendMessage('${config.target}')">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>`
};

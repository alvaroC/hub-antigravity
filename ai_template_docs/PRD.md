# Product Requirements Document (PRD) - Dashboard / Learning Portal Mall

## 1. Produktöversikt
Denna applikation är en modern, interaktiv och responsiv webbportal byggd som en inlärningsplattform eller instrumentpanel (dashboard). Målet är att erbjuda en premium, app-liknande upplevelse direkt i webbläsaren med tydlig navigering och strukturerat innehåll.

## 2. Tekniskt Stack & Arkitektur
- **Märkspråk:** HTML5 (Semantisk struktur)
- **Styling:** Vanilla CSS (Inga ramverk som Tailwind eller Bootstrap). Använder ett skalbart system med CSS-variabler (Custom Properties) för färgpaletter och typografi.
- **Logik:** Vanilla JavaScript (ES6+). Inga tunga bibliotek som React eller Vue.
- **Ikoner:** FontAwesome (via CDN).
- **Typografi:** Google Fonts - 'Inter' för brödtext och 'Outfit' för rubriker.

## 3. Design & Användarupplevelse (UX/UI)
- **Tema:** Dark mode by default ("dark-theme"). Svarta/mörkgrå bakgrunder (t.ex. `#0f172a`, `#1e293b`) för att ge en "hacker/utvecklar"-känsla i kombination med starka, levande accentfärger.
- **Accentfärger:** Moderna "tech"-färger som lila (`#8b5cf6`), rosa (`#ec4899`) och neon-blå (`#3b82f6`). Används i knappar, ikoner och avdelare.
- **Komponenter:**
  - **Navigering:** En sidomeny (sidebar) eller toppmeny med ikoner för varje sektion och utmärkande knappar (t.ex. med nivå-indikatorer "NIVÅ 4").
  - **Notion-liknande Toggles:** Utfällbara sektioner (dragspel/accordion) för att spara utrymme och strukturera information.
  - **Kort (Cards):** Innehåll presenteras i avrundade boxar (`border-radius: 12px/16px`) med en subtil hover-effekt eller svag border (`border: 1px solid rgba(255,255,255,0.1)`).
  - **Responsivitet:** Fullt responsiv design via CSS Flexbox och Grid. Anpassar sig elegant till mobila skärmar.

## 4. Nyckelfunktioner
1. **Modulär Navigering:** Enkelhet att hoppa mellan olika vyer/moduler.
2. **Interaktivt Innehåll:** Uppgifter, övningar och flashcards som användaren kan markera som "slutförda".
3. **Visuell Feedback:** Hover-effekter, mjuka transitioner och tydliga "Call to Action" (CTA)-knappar.
4. **Datahantering (Valfritt):** Möjlighet att läsa in innehåll från statiska `.js` eller `.json`-filer (t.ex. `course_data.js`) för att enkelt kunna uppdatera innehåll utan att röra layouten.

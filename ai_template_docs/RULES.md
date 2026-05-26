# Development Rules (eg. .cursorrules)

När du (AI-assistenten) ska bygga nya sidor eller modifiera denna mall, MÅSTE du följa nedanstående regler för att bevara designen och arkitekturen.

## Globala Regler
1. **Språk:** All text för användaren ska vara på Svenska (såvida inget annat anges). Variabler och filnamn på engelska är okej.
2. **Inga tunga ramverk:** Använd INTE Tailwind CSS, React, Vue, eller Bootstrap om det inte uttryckligen efterfrågas. Använd enbart HTML, Vanilla CSS och Vanilla JavaScript.
3. **Ingen överkomplicering:** Håll koden ren, välkommenterad och modulär.
4. **Separation of Concerns:** HTML, CSS och JavaScript **måste** ligga i separata filer. Undvik styling via `<style>`-taggar och logik via `<script>`-taggar direkt i HTML-filen (inline-stylings och små `<script>`-block ska undvikas så långt det går). All styling och logik länkas istället in via `<link rel="stylesheet" ...>` och `<script src="..." defer></script>`.

## HTML Strukturella Regler
- Använd alltid semantisk HTML (t.ex. `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`).
- Inkludera alltid biblioteken i `<head>`:
  - Google Fonts (Inter och Outfit)
  - FontAwesome 6.5.1
- Sätt klassen `dark-theme` på `<body>` taggen automatiskt.

## CSS & Design (Styling Guidelines)
- **Färgpalett (exempel att följa):**
  - Bakgrunder: `#0f172a`, `#1e293b`
  - Textfärger: Vit för rubriker, `#94a3b8` eller `#cbd5e1` för brödtext.
  - Primär accent: `#8b5cf6` (Lila), `#ec4899` (Rosa), `#3b82f6` (Blå).
- **Glassmorphism:** Använd svaga rgba-färger för bakgrunder på element (ex: `background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px);`).
- **Typografi:** 
  - Rubriker (`H1` - `H6`): 'Outfit', sans-serif, bold.
  - Brödtext (`p`, `span`, `li`): 'Inter', sans-serif, regular/medium.
- **Micro-interaktioner:** Alla klickbara element måste ha cursor pointer och en hover-effekt (t.ex. `transform: translateY(-2px); transition: all 0.2s ease;`).
- Använd `rem` eller `%` i första hand för marginaler/padding så layouten förblir responsiv, Undvik hårdkodade pixlar för layouter.

## JavaScript Regler
- All JS ska vara ES6+ (använd `const`, `let`, Arrow functions).
- Kommunicera med DOM:en effektivt genom att använda `document.querySelector` eller element-ID:n.
- Om datadrivet innehåll krävs (ex. quizfrågor), lägg det i ett externt JS/JSON-objekt (som `course_data.js`) och mappa ut det med JS för att separera data från presentation.
- Hantera event listeners dynamiskt och var noga med att de inte sätts flera gånger på samma element.

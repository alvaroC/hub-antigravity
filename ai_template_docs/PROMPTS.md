# Prompt Templates / Mega Prompts

Dessa prompts är utformade för att du (eller din AI-assistent) snabbt ska kunna generera nya funktioner, sidor eller klona applikationen.

## 1. Skapa en ny vy/sida (Mallsida)
När du startar ett nytt projekt eller skapar en helt ny del av plattformen, använd denna prompt:

**Prompt:**
> "Agera som en Expert Frontend Utvecklare. Jag vill skapa en ny sida för min utbildningsplattform. Sidan ska heta `[NAMNET PÅ SIDAN].html`. Läs instruktionerna i `PRD.md` och reglerna i `RULES.md`. Bygg sidan i dokumentet med Navbar till vänster (eller i toppen om responsivt) och en flexibel layout för innehåll. Använd klasserna `container`, `card`, och `dark-theme`. Skriv ut den kompletta HTML-strukturen och referera the CSS i `css/styles.css`."

## 2. Skapa ett "Task Card" (Innehållskort)
För att snabbt fylla ut en sida med uppgifter och visuella block:

**Prompt:**
> "Skapa 3 nya uppgiftskort (Task Cards) i HTML som ska in i elementet `<div class="tasks-container">`. Följ SwedAI Academy's designmall för task-cards (t.ex. `task-card`, `task-icon` och `task-info`).
> - Kort 1: Ikon "fa-brain", Titel "[KORT 1 TITEL]", Innehåll "[KORT 1 BESKRIVNING]"
> - Kort 2: Ikon "fa-file-alt", Titel "[KORT 2 TITEL]", Innehåll "[KORT 2 BESKRIVNING]"
> - Kort 3: Ikon "fa-bullseye", Titel "[KORT 3 TITEL]", Innehåll "[KORT 3 BESKRIVNING]"
> Färgkoda ikonerna med Tailwind-liknande hex-koder (t.ex. `#f472b6` för rosa, `#60a5fa` för blå). Returnera endast HTML:en."

## 3. Generera data till kursen (JSON/JS)
Om du behöver mycket text eller quiz-frågor och inte vill skräpa ner din HTML, be AI bygga ett data-objekt.

**Prompt:**
> "Agera som ämnesexpert inom `[ÄMNE, ex: Prompt Engineering]`. Generera ett JavaScript-objekt kallat `moduleData` som innehåller 5 sektioner. 
> Varje sektion måste ha:
> 1. `title` (Sträng)
> 2. `description` (Sträng)
> 3. `tasks` (Array av objekt som innehåller `taskTitle`, `taskIcon`, och `taskContent` i HTML-format).
> Output ska vara exakt strukturerat och redo att loopas ut via Vanilla JavaScript enligt reglerna i `RULES.md`."

## 4. Lägg in Notion-Toggles (Dragspel)
För att rendera utfällbara sektioner:

**Prompt:**
> "Kolla på strukturen jag har för `.notion-toggle` i min kodstruktur. Vänligen generera en ny sådan toggle med rubriken `[RUBRIK]`. Inuti toggle-innehållet vill jag ha ett avsnitt med videospelare (eller placeholder) och en text-summary."

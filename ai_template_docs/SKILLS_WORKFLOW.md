# Skills & Workflows för Applikationen

Dessa arbetsflöden stakar ut den exakta vägen för hur du underhåller och bygger ut denna applikationsmall (SwedAI Academy klon) steg för steg.

## Workflow 1: Att Klona en ny applikation (Initial Setup)
När du ska använda denna mall för en hel app:
1. **Kopiera Kärnfiler:** Skapa din nya mapp och kopiera in `css/styles.css` och baskomponenten `index.html`.
2. **Global Konfigurering:** Uppdatera färgvariablerna i root i CSS om projektet kräver en annan brand-färg (ex. byta lila mot grön).
3. **Importera ramverk per automatik:** Säkerställ att FontAwesome och Google Fonts är inlagda i `<head>`.
4. **Skapa Navigationen:** Använd existerande Navbar-kod ( `<nav class="module-nav">` ) men byt ut länkarna per projektets behov.

## Workflow 2: Arbetsflöde för ny funktionalitet (Skrivmall)
Om användaren (du) vill bygga en helt ny funktion ska du följa dessa steg för att veta var och hur du redigerar:

1. **Analysera Behovet (PRD)**
   - Vad är det för typ av modul? (Är det ett formulär, en Dashboard, läsmaterial?)
   - Kolla i `RULES.md` för att hålla rätt design-språk.
   
2. **Skriv HTML (Filosofi: Struktur före stil)**
   - Börja i HTML. Lägg modulen inom `<main class="page-layout container">`.
   - Lägg upp sektioner (`<section>`) och dela upp det i kolumner om det behövs: flex för rader, grid för kort-samlingar.
   - Använd befintliga CSS-klasser (`task-card`, `toggle-header`) för att minimera ny kod.

3. **Styling**
   - Faller inte befintliga klasser in naturlig? Öppna rätt CSS-fil (T.ex. `css/assistent.css`)
   - Använd existerande färgvariabler (t.ex. `var(--primary-color)` etc.). Skapa inte nya hårdkodade hexkoder inuti filen om en variabel kan användas.

4. **JavaScript funktionalitet**
   - Inkludera ny logik längst ner i body (`<script>`) eller i den refererade JS-filen.
   - Exempel arbetsflöde för knappar:
     - Koppla en eventListener till knappen (`document.getElementById`).
     - Uppdatera UI:t (ex. `element.classList.add('active')`).
     - Spara temporär data om det efterfrågas (t.ex. `localStorage` för slutförda uppgifter).

## AI Skills: Specifika funktioner AI:n ska klara
För att effektivt generera innehåll förverktyget måste du ha / träna följande "Skills":
- **Notion-UI Skill:** Kunna skriva rekursiva, utfällbara moduler (Toggles i HTML).
- **Glassmorphism CSS Skill:** Förstå hur man designar moderna transparenta boxar (`backdrop-filter: blur()`, `rgba`).
- **Data-extraction Skill:** Extrahera uppgifter från en prompt eller textfil och snabbt paketera det till ett flertal HTML-kort (`class="task-card"`) med passande ikoner från FontAwesome.

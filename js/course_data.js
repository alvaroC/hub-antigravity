// --- COURSE CATALOG (CONFIGURATION) ---

window.COURSE_CATALOG = {
    'chatgpt-mastery': { id: 'chatgpt-mastery', name: 'ChatGPT Mastery Program', notebookId: 'd37bea15-1131-4781-8aeb-ca0a814d8f04' },
    'intro-ai': { id: 'intro-ai', name: 'Introduktion till AI', notebookId: '36c94dfd-016c-45be-a27a-4eada7ead593' },
    'prompt-eng': { id: 'prompt-eng', name: 'ChatGPT Prompt Engineering', notebookId: 'a75f0f5c-ccd9-4ebb-b424-3725e018ffec' },
    'deep-research': { id: 'deep-research', name: 'ChatGPT Deep Research', notebookId: 'c73de72f-be49-401c-8d95-47bb287b6e06' },
    'agent-läge': { id: 'agent-läge', name: 'ChatGPT Agentläge', notebookId: '768fa453-9d84-41ae-9ca7-4e1ce2d13737' },
    'gpt': { id: 'gpt', name: 'Skapa GPTs', notebookId: 'cdd5addd-6a11-46a4-ae07-df63b19e3aca' },
    'agent-builder': { id: 'agent-builder', name: 'ChatGPT Agent Builder', notebookId: '9e51ebda-3f78-42c0-bec4-3edfdb95864c' }
};

var COURSE_CATALOG = window.COURSE_CATALOG; // Use var to ensure global scope in non-modules

//'appar': { id: 'appar', name: 'ChatGPT Appar', notebookId: '67791935-df8f-4887-b0b3-60854c7ee533' },
//'atlas': { id: 'atlas', name: 'ChatGPT Atlas', notebookId: '011bf9d2-ab59-43d9-a0e8-755d21aa27df' },
//'bygg-ai.förmåga': { id: 'bygg-ai.förmåga', name: 'Bygg AI förmåga', notebookId: '430716db-6060-4635-9cfc-9312866f3f0a' }


// --- COURSE CONTENT DATA ---
// This file contains all the text, links, and data for the 8 courses.

window.COURSE_CONTENT = {

    "intro-ai": {
        "title": "Introduktion till AI",
        "artifacts": [
            { "id": "podcast", "label": "Podcast", "type": "audio" },
            { "id": "infographic", "label": "Infografik", "type": "image" },
            { "id": "report", "label": "Rapport", "type": "pdf" },
            { "id": "quiz", "label": "Quiz", "type": "json" },
            { "id": "table", "label": "Jämförelsetabell", "type": "json" },
            { "id": "flashcards", "label": "Flashcards", "type": "flashcards" },
            { "id": "presentation", "label": "Presentation", "type": "slides" },
            { "id": "video", "label": "Video", "type": "video" }
        ]
    },
    'prompt-eng': {
        "title": "ChatGPT Prompt Engineering",
        "artifacts": [
            { "id": "podcast", "label": "Podcast", "type": "audio" },
            { "id": "infographic", "label": "Infografik", "type": "image" },
            { "id": "report", "label": "Rapport", "type": "pdf" },
            { "id": "quiz", "label": "Quiz", "type": "json" },
            { "id": "table", "label": "Jämförelsetabell", "type": "json" },
            { "id": "flashcards", "label": "Flashcards", "type": "flashcards" },
            { "id": "presentation", "label": "Presentation", "type": "slides" },
            { "id": "video", "label": "Video", "type": "video" }
        ]
    },
    'deep-research': {},
    'agent-läge': {},
    'gpt': {},
    'agent-builder': {},
    'appar': {},
    'atlas': {}
};

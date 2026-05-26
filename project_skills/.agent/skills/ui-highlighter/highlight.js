/**This script will be executed in your browser's context by the Antigravity runtime when Gemini calls the skill.**/

export function highlightElement(selector) {
    const el = document.querySelector(selector);
    if (!el) return `Error: ${selector} not found.`;
    el.style.outline = "4px solid #4285F4"; // Google Blue
    el.style.boxShadow = "0 0 20px #4285F4";
    el.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => { el.style.outline = el.style.boxShadow = "none"; }, 3000);
    return `Highlighted ${selector}`;
}


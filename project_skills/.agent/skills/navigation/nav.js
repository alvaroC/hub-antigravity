/** Contains the logic to dispatch the app:nav event to your web app router **/

export function MapsToLevel(levelNumber) {
    // Logic to interact with your Web App router (e.g., React Router or Next.js)
    window.dispatchEvent(new CustomEvent('app:nav', { detail: { level: levelNumber } }));
    return `Successfully navigated user to Level ${levelNumber}`;
}

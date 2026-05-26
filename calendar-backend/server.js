require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Google OAuth2 konfiguration
const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    // Redirect URI (används inte aktivt här eftersom vi redan har en refresh token)
    'http://localhost' 
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

// ---------------------------------------------------------
// ROUTE 1: Hämta tillgängliga tider (kollar mot kalendern)
// ---------------------------------------------------------
app.post('/api/availability', async (req, res) => {
    try {
        const { date } = req.body; // Förväntar format: "YYYY-MM-DD"
        
        if (!date) return res.status(400).json({ error: "Ett datum måste anges" });

        const timeMin = new Date(`${date}T00:00:00Z`).toISOString();
        const timeMax = new Date(`${date}T23:59:59Z`).toISOString();

        // Standardarbetstider (kan anpassas) - 09:00 till 17:00, 1h möten
        const workHours = [];
        for (let i = 9; i <= 16; i++) {
            workHours.push(`${i.toString().padStart(2, '0')}:00`);
        }

        // Hämta händelser från Google Kalender för vald dag
        const response = await calendar.events.list({
            calendarId: process.env.GOOGLE_CALENDAR_ID,
            timeMin: timeMin,
            timeMax: timeMax,
            singleEvents: true,
            orderBy: 'startTime',
        });

        const events = response.data.items;
        
        // Hitta vilka tider som är upptagna
        const busyHours = events.map(event => {
            if (event.start.dateTime) {
                const start = new Date(event.start.dateTime);
                // Konvertera till lokal tid (Sverige) eller UTC beroende på behov
                // Här förenklar vi genom att ta timmen
                return `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')}`;
            }
            return null;
        }).filter(Boolean);

        // Filtrera bort upptagna tider från tillgängliga tider
        const availableSlots = workHours.filter(time => !busyHours.includes(time));

        res.json({ availableSlots });

    } catch (error) {
        console.error('Fel vid hämtning av tillgänglighet:', error);
        res.status(500).json({ error: "Internt serverfel" });
    }
});

// ---------------------------------------------------------
// ROUTE 2: Skapa ny bokning (generera Google Calendar-event)
// ---------------------------------------------------------
app.post('/api/book', async (req, res) => {
    try {
        const { name, email, reason, date, time } = req.body;

        if (!name || !email || !date || !time) {
            return res.status(400).json({ error: "Fyll i alla obligatoriska fält." });
        }

        // Skapa datetime objekt. Ex: tid "10:00", datum "2026-05-20"
        const startDateTime = new Date(`${date}T${time}:00`);
        
        // Möte längd = 1 timme
        const endDateTime = new Date(startDateTime);
        endDateTime.setHours(endDateTime.getHours() + 1);

        const event = {
            summary: `Bokning: ${name} (${reason})`,
            description: `Bokning gjord av ${name}\\nE-post: ${email}\\nAnledning: ${reason}`,
            start: {
                dateTime: startDateTime.toISOString(),
                timeZone: 'Europe/Stockholm', 
            },
            end: {
                dateTime: endDateTime.toISOString(),
                timeZone: 'Europe/Stockholm',
            },
            attendees: [
                { email: email } // Skickar inbjudan till kunden
            ],
            // Skicka ppling till kunden om att mötet skapats
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 10 },
                ],
            },
        };

        const response = await calendar.events.insert({
            calendarId: process.env.GOOGLE_CALENDAR_ID,
            resource: event,
            sendUpdates: 'all', // Meddelar gästerna via e-post
        });

        res.json({ success: true, eventLink: response.data.htmlLink });

    } catch (error) {
        console.error('Fel vid bokning:', error);
        res.status(500).json({ error: "Kunde inte genomföra bokningen. Kolla kalender-konfigurationen." });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Bokning-kalender backend körs på http://localhost:${PORT}`);
});

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// Din Resend API-nyckel kommer att hämtas från Supabase hemliga miljövariabler
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  try {
    // 1. Läs in datan som Supabase skickar till funktionen
    const payload = await req.json()
    
    // Payload.record innehåller raden som precis lades in i databasen
    const { email } = payload.record
    
    // 2. Kontrollera att vi fick en e-postadress
    if (!email) {
       return new Response(JSON.stringify({ error: "Ingen e-post hittades." }), { status: 400 })
    }

    // 3. Skicka e-posten via Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        // Byt ut domänen nedan mot din godkända domän i Resend!
        from: 'SwedAI Academy <support@aibusinesslab.se>', 
        to: email, // Skickar till den som just skrev in sig
        subject: 'Tack för ditt intresse för AI Learning Hub!',
        html: `
          <h2>Välkommen!</h2>
          <p>Tack för att du lämnade din e-post. Vi letar just nu efter företag att samarbeta med för vår nya AI Learning Hub.</p>
          <p>Vi hör av oss till dig inom kort med mer information!</p>
          <br>
          <p>Trevlig dag,<br>SwedAI Academy Teamet</p>
        `,
      }),
    })

    const data = await res.json()

    // 4. Returnera ett lyckat svar
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

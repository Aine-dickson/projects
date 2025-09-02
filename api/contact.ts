// Serverless function for Vercel / Netlify style environments.
// Expects environment variables:
//   RESEND_API_KEY  (Your Resend secret API key)
//   CONTACT_TO      (Destination inbox email address)
//   CONTACT_FROM    (Verified Resend from address e.g. "Portfolio <contact@yourdomain.tld>")
// NOTE: Do NOT expose the API key to the client. This function runs server-side.

/**
 * Basic email validation (very light) to avoid obviously malformed input.
 */
function isValidEmail (email) {
  return /.+@.+\..+/.test(email)
}

export default async function handler (req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Method not allowed' })
  }

  let payload
  try {
    payload = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' })
  }

  const { name, email, message, honeypot } = payload || {}

  // Honeypot (bot) trap: if filled, silently accept
  if (honeypot) {
    return res.json({ ok: true })
  }

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' })
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' })
  }
  if (String(message).length > 5000) {
    return res.status(400).json({ error: 'Message too long' })
  }

  try {
    await fetch("https://snowym-ail-7a70.ainedixon03.workers.dev", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({message, name, email})
    })
    return res.json({ ok: true })
  } catch (e) {
    console.error('Resend error', e)
    return res.status(500).json({ error: 'Failed to send' })
  }
}

// subject: `Portfolio contact: ${name}`,
// text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,

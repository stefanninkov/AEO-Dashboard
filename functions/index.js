const { onDocumentCreated } = require('firebase-functions/v2/firestore')
const { initializeApp } = require('firebase-admin/app')

initializeApp()

/**
 * Waitlist Confirmation Email — Firestore onCreate trigger
 *
 * Fires when a new document is created in the `waitlist` collection.
 * Currently a STUB that logs to console. To go live:
 *   1. npm install resend (already in package.json)
 *   2. Set the Resend API key: firebase functions:secrets:set RESEND_API_KEY
 *   3. Uncomment the Resend code below
 *   4. Deploy: firebase deploy --only functions
 */
exports.onWaitlistSignup = onDocumentCreated('waitlist/{docId}', async (event) => {
  const snap = event.data
  if (!snap) return

  const data = snap.data()
  const { email, name } = data

  if (!email) {
    console.warn('[EMAIL] No email found in waitlist document:', event.params.docId)
    return
  }

  // ── STUB: Log to console ──
  console.log(`[EMAIL STUB] New waitlist signup: ${email} (${name || 'no name'})`)
  console.log(`[EMAIL STUB] Document ID: ${event.params.docId}`)
  console.log('[EMAIL STUB] To send real emails, configure Resend API key and uncomment below.')

  // ── UNCOMMENT WHEN READY ──
  // const { Resend } = require('resend')
  // const resend = new Resend(process.env.RESEND_API_KEY)
  //
  // await resend.emails.send({
  //   from: 'AEO Dashboard <noreply@yourdomain.com>',
  //   to: email,
  //   subject: `Welcome to AEO Dashboard, ${name || 'there'}!`,
  //   html: `
  //     <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; max-width: 36rem; margin: 0 auto; padding: 2rem;">
  //       <h1 style="color: #0F1419; font-size: 1.5rem; margin-bottom: 1rem;">
  //         You're on the list! 🎉
  //       </h1>
  //       <p style="color: #536471; font-size: 0.875rem; line-height: 1.6;">
  //         Hi ${name || 'there'},
  //       </p>
  //       <p style="color: #536471; font-size: 0.875rem; line-height: 1.6;">
  //         Thanks for joining the AEO Dashboard waitlist. We'll notify you as soon as
  //         early access opens.
  //       </p>
  //       <p style="color: #536471; font-size: 0.875rem; line-height: 1.6;">
  //         In the meantime, your AEO readiness score and personalized recommendations
  //         are saved — you'll be able to pick up right where you left off.
  //       </p>
  //       <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #E5E7EB;">
  //         <p style="color: #8899A6; font-size: 0.75rem;">
  //           AEO Dashboard — Optimize your website for AI search engines
  //         </p>
  //       </div>
  //     </div>
  //   `,
  // })
  //
  // // Mark the document as notified
  // const { getFirestore } = require('firebase-admin/firestore')
  // await getFirestore().doc(`waitlist/${event.params.docId}`).update({
  //   notified: true,
  //   notifiedAt: new Date(),
  // })
  //
  // console.log(`[EMAIL] Confirmation sent to: ${email}`)
})

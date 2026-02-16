import logger from './logger'

/**
 * Send email via EmailJS REST API (no SDK needed).
 * Free tier: 200 emails/month at https://emailjs.com
 *
 * Template must include these variables:
 *   {{to_email}}, {{subject}}, {{message}}
 */
export async function sendEmail(to, subject, body) {
  const config = getEmailConfig()

  if (!config.serviceId || !config.templateId || !config.publicKey) {
    throw new Error('Email service not configured. Set up EmailJS credentials in Settings.')
  }

  const payload = {
    service_id: config.serviceId,
    template_id: config.templateId,
    user_id: config.publicKey,
    template_params: {
      to_email: to,
      subject,
      message: body,
    },
  }

  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const errorText = await response.text()
    logger.error('EmailJS error:', errorText)
    throw new Error(`Email failed: ${errorText}`)
  }

  logger.info('Email sent via EmailJS')
  return true
}

/**
 * Get stored EmailJS configuration.
 */
export function getEmailConfig() {
  try {
    return JSON.parse(localStorage.getItem('emailjs-config') || '{}')
  } catch {
    return {}
  }
}

/**
 * Save EmailJS configuration.
 */
export function saveEmailConfig(config) {
  localStorage.setItem('emailjs-config', JSON.stringify(config))
}

/**
 * Check if EmailJS is configured.
 */
export function isEmailConfigured() {
  const config = getEmailConfig()
  return !!(config.serviceId && config.templateId && config.publicKey)
}

import logger from './logger'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_API_VERSION = '2023-06-01'
const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514'

/** Status codes that should NOT be retried */
const NON_RETRYABLE = new Set([400, 401, 403, 404, 422])

/**
 * Call the Anthropic Messages API with automatic retry + exponential backoff.
 *
 * @param {Object} options
 * @param {string} options.apiKey - Anthropic API key
 * @param {Array}  options.messages - Messages array for the API
 * @param {string} [options.system] - Optional system prompt
 * @param {number} [options.maxTokens=4000] - Max tokens
 * @param {string} [options.model] - Override model
 * @param {number} [options.retries=2] - Number of retry attempts
 * @param {Object} [options.extraBody] - Additional body fields (tools, mcp_servers, etc.)
 * @returns {Promise<Object>} Parsed JSON response body
 */
export async function callAnthropicApi({
  apiKey,
  messages,
  system,
  maxTokens = 4000,
  model = ANTHROPIC_MODEL,
  retries = 2,
  extraBody,
}) {
  const body = {
    model,
    max_tokens: maxTokens,
    messages,
    ...extraBody,
  }
  if (system) body.system = system

  let lastError = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(ANTHROPIC_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': ANTHROPIC_API_VERSION,
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')

        // Don't retry client errors (bad request, auth, etc.)
        if (NON_RETRYABLE.has(response.status)) {
          throw new Error(`API error ${response.status}: ${errorText}`)
        }

        // Retryable server error
        throw new Error(`API error ${response.status}: ${errorText}`)
      }

      return await response.json()
    } catch (err) {
      lastError = err

      // Don't retry non-retryable errors
      if (err.message?.startsWith('API error 4')) {
        const statusCode = parseInt(err.message.match(/API error (\d+)/)?.[1])
        if (NON_RETRYABLE.has(statusCode)) {
          throw err
        }
      }

      if (attempt < retries) {
        const delay = Math.min(1000 * 2 ** attempt, 8000) // 1s, 2s, 4s, max 8s
        logger.warn(`API call failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms...`, err.message)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

export { ANTHROPIC_API_URL, ANTHROPIC_API_VERSION, ANTHROPIC_MODEL }

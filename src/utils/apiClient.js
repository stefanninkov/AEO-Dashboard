import logger from './logger'
import { getActiveProvider, getApiKey, getModel, getProviderConfig } from './aiProvider'
import { callOpenAiApi } from './openaiClient'
import { trackUsage } from './usageTracker'

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

/**
 * Provider-agnostic AI call wrapper.
 *
 * Reads the active provider + API key from localStorage (via aiProvider.js),
 * routes to the appropriate client, normalizes the response, and tracks usage.
 *
 * @param {Object} options
 * @param {Array}  options.messages - Messages array
 * @param {string} [options.system] - Optional system prompt
 * @param {number} [options.maxTokens=4000] - Max tokens
 * @param {string} [options.model] - Override model (defaults to provider's selected model)
 * @param {number} [options.retries=2] - Number of retry attempts
 * @param {Object} [options.extraBody] - Additional body fields (tools, etc.)
 * @returns {Promise<{text: string, raw: Object, usage: {inputTokens: number, outputTokens: number}, provider: string, model: string}>}
 */
export async function callAI({
  messages,
  system,
  maxTokens = 4000,
  model,
  retries = 2,
  extraBody,
} = {}) {
  const provider = getActiveProvider()
  const apiKey = getApiKey(provider)
  if (!apiKey) {
    const config = getProviderConfig(provider)
    throw new Error(`No API key set for ${config.name}. Please add your API key in Settings → API & Usage.`)
  }

  const config = getProviderConfig(provider)
  const resolvedModel = model || getModel(provider)

  // Filter unsupported tools for this provider
  let filteredBody = extraBody
  if (!config.supportsWebSearch && extraBody?.tools) {
    filteredBody = {
      ...extraBody,
      tools: extraBody.tools.filter(t =>
        t.type !== 'web_search_20250305' && t.name !== 'web_search'
      ),
    }
    if (filteredBody.tools.length === 0) {
      const { tools, ...rest } = filteredBody
      filteredBody = Object.keys(rest).length > 0 ? rest : undefined
    }
  }

  const startTime = Date.now()
  let result

  if (provider === 'openai') {
    result = await callOpenAiApi({
      apiKey,
      messages,
      system,
      maxTokens,
      model: resolvedModel,
      retries,
      extraBody: filteredBody,
    })
  } else {
    result = await callAnthropicApi({
      apiKey,
      messages,
      system,
      maxTokens,
      model: resolvedModel,
      retries,
      extraBody: filteredBody,
    })
  }

  // Normalize response into a consistent shape
  const normalized = {
    text: provider === 'openai'
      ? (result.choices?.[0]?.message?.content || '')
      : (result.content?.find(b => b.type === 'text')?.text || ''),
    raw: result,
    usage: provider === 'openai'
      ? { inputTokens: result.usage?.prompt_tokens || 0, outputTokens: result.usage?.completion_tokens || 0 }
      : { inputTokens: result.usage?.input_tokens || 0, outputTokens: result.usage?.output_tokens || 0 },
    provider,
    model: resolvedModel,
  }

  // Track usage (fire-and-forget, never blocks)
  try {
    trackUsage({
      provider,
      model: resolvedModel,
      inputTokens: normalized.usage.inputTokens,
      outputTokens: normalized.usage.outputTokens,
      durationMs: Date.now() - startTime,
    })
  } catch {
    // Usage tracking should never break API calls
  }

  return normalized
}

export { ANTHROPIC_API_URL, ANTHROPIC_API_VERSION, ANTHROPIC_MODEL }

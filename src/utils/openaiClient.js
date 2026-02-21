/**
 * OpenAI Chat Completions API client.
 *
 * Mirrors the callAnthropicApi interface so callers can swap transparently.
 * Called exclusively through the callAI() wrapper in apiClient.js.
 */
import logger from './logger'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
const DEFAULT_MODEL = 'gpt-4o'

/** Status codes that should NOT be retried */
const NON_RETRYABLE = new Set([400, 401, 403, 404, 422])

/**
 * Call the OpenAI Chat Completions API with automatic retry + exponential backoff.
 *
 * @param {Object} options
 * @param {string} options.apiKey - OpenAI API key
 * @param {Array}  options.messages - Messages array (Anthropic format → converted internally)
 * @param {string} [options.system] - Optional system prompt
 * @param {number} [options.maxTokens=4000] - Max tokens
 * @param {string} [options.model] - Override model
 * @param {number} [options.retries=2] - Number of retry attempts
 * @param {Object} [options.extraBody] - Additional body fields (tools, etc.)
 * @returns {Promise<Object>} Parsed JSON response body (OpenAI format)
 */
export async function callOpenAiApi({
  apiKey,
  messages,
  system,
  maxTokens = 4000,
  model = DEFAULT_MODEL,
  retries = 2,
  extraBody,
}) {
  // Convert messages from Anthropic format to OpenAI format
  const openAiMessages = convertMessages(messages, system)

  // Build request body
  const body = {
    model,
    max_tokens: maxTokens,
    messages: openAiMessages,
  }

  // Merge extra body fields, converting Anthropic tools to OpenAI format if needed
  if (extraBody) {
    const { tools, tool_choice, ...rest } = extraBody
    Object.assign(body, rest)

    if (tools && tools.length > 0) {
      // Filter out Anthropic-specific tools (web_search)
      const convertedTools = tools
        .filter(t => t.type !== 'web_search_20250305' && t.name !== 'web_search')
        .map(convertToolDefinition)
        .filter(Boolean)

      if (convertedTools.length > 0) {
        body.tools = convertedTools
        if (tool_choice) body.tool_choice = tool_choice
      }
    }
  }

  let lastError = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error')

        // Don't retry client errors
        if (NON_RETRYABLE.has(response.status)) {
          throw new Error(`OpenAI API error ${response.status}: ${errorText}`)
        }

        throw new Error(`OpenAI API error ${response.status}: ${errorText}`)
      }

      return await response.json()
    } catch (err) {
      lastError = err

      // Don't retry non-retryable errors
      if (err.message?.includes('API error 4')) {
        const statusCode = parseInt(err.message.match(/API error (\d+)/)?.[1])
        if (NON_RETRYABLE.has(statusCode)) {
          throw err
        }
      }

      if (attempt < retries) {
        const delay = Math.min(1000 * 2 ** attempt, 8000)
        logger.warn(`OpenAI API call failed (attempt ${attempt + 1}/${retries + 1}), retrying in ${delay}ms...`, err.message)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

/* ── Message Format Conversion ── */

/**
 * Convert Anthropic-format messages to OpenAI format.
 * Anthropic: [{ role: 'user'|'assistant', content: string|array }]
 * OpenAI:    [{ role: 'system'|'user'|'assistant', content: string }]
 */
function convertMessages(messages, system) {
  const result = []

  // System prompt becomes a system message
  if (system) {
    result.push({ role: 'system', content: system })
  }

  for (const msg of messages) {
    // Handle string content directly
    if (typeof msg.content === 'string') {
      result.push({ role: msg.role, content: msg.content })
      continue
    }

    // Handle array content (Anthropic's content blocks)
    if (Array.isArray(msg.content)) {
      // Extract text blocks and combine
      const textParts = msg.content
        .filter(block => block.type === 'text')
        .map(block => block.text)

      if (textParts.length > 0) {
        result.push({ role: msg.role, content: textParts.join('\n') })
      }
    }
  }

  return result
}

/**
 * Convert Anthropic tool definition to OpenAI function format.
 * Only supports basic tool definitions — web_search and other Anthropic-specific tools are filtered out before this.
 */
function convertToolDefinition(tool) {
  // Skip Anthropic-specific tools
  if (tool.type === 'web_search_20250305' || tool.type === 'computer_20250124') {
    return null
  }

  // Convert custom tool definition
  if (tool.name && tool.input_schema) {
    return {
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description || '',
        parameters: tool.input_schema,
      },
    }
  }

  return null
}

export { OPENAI_API_URL, DEFAULT_MODEL }

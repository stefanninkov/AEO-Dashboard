/**
 * AI Provider abstraction layer.
 *
 * Manages multi-provider support (Anthropic + OpenAI) with localStorage-backed
 * configuration for API keys, active provider, and model selection.
 */

/* ── Provider Registry ── */
const PROVIDERS = {
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    keyPrefix: 'sk-ant-',
    keyPlaceholder: 'sk-ant-...',
    storageKey: 'anthropic-api-key',         // backward-compat key name
    modelStorageKey: 'anthropic-model',
    defaultModel: 'claude-sonnet-4-20250514',
    models: [
      { id: 'claude-sonnet-4-20250514', label: 'Claude Sonnet 4', default: true },
      { id: 'claude-haiku-4-20250414', label: 'Claude Haiku 4', fast: true },
    ],
    supportsWebSearch: true,
    costPer1M: {
      'claude-sonnet-4-20250514': { input: 3, output: 15 },
      'claude-haiku-4-20250414': { input: 0.25, output: 1.25 },
    },
  },
  openai: {
    id: 'openai',
    name: 'OpenAI (GPT)',
    keyPrefix: 'sk-',
    keyPlaceholder: 'sk-...',
    storageKey: 'openai-api-key',
    modelStorageKey: 'openai-model',
    defaultModel: 'gpt-4o',
    models: [
      { id: 'gpt-4o', label: 'GPT-4o', default: true },
      { id: 'gpt-4o-mini', label: 'GPT-4o Mini', fast: true },
    ],
    supportsWebSearch: false,
    costPer1M: {
      'gpt-4o': { input: 2.5, output: 10 },
      'gpt-4o-mini': { input: 0.15, output: 0.6 },
    },
  },
}

const PROVIDER_STORAGE_KEY = 'ai-provider'

/* ── Provider Selection ── */

/** Get the currently active provider ID. Defaults to 'anthropic'. */
export function getActiveProvider() {
  const stored = localStorage.getItem(PROVIDER_STORAGE_KEY)
  return stored && PROVIDERS[stored] ? stored : 'anthropic'
}

/** Set the active provider. */
export function setActiveProvider(providerId) {
  if (!PROVIDERS[providerId]) throw new Error(`Unknown provider: ${providerId}`)
  localStorage.setItem(PROVIDER_STORAGE_KEY, providerId)
}

/** Get the full config object for a provider. Defaults to active provider. */
export function getProviderConfig(providerId) {
  const id = providerId || getActiveProvider()
  return PROVIDERS[id] || PROVIDERS.anthropic
}

/** Get all provider configs as an array. */
export function getAllProviders() {
  return Object.values(PROVIDERS)
}

/* ── API Key Management ── */

/** Get the API key for a provider. Defaults to active provider. */
export function getApiKey(providerId) {
  const config = getProviderConfig(providerId)
  return localStorage.getItem(config.storageKey) || ''
}

/** Set the API key for a provider. */
export function setApiKey(providerId, key) {
  const config = getProviderConfig(providerId)
  if (key && key.trim()) {
    localStorage.setItem(config.storageKey, key.trim())
  } else {
    localStorage.removeItem(config.storageKey)
  }
}

/** Check if an API key is set for a provider. Defaults to active provider. */
export function hasApiKey(providerId) {
  return getApiKey(providerId).trim().length > 0
}

/* ── Model Selection ── */

/** Get the selected model for a provider. Defaults to active provider's default model. */
export function getModel(providerId) {
  const config = getProviderConfig(providerId)
  const stored = localStorage.getItem(config.modelStorageKey)
  // Validate stored model exists in provider's model list
  if (stored && config.models.some(m => m.id === stored)) return stored
  return config.defaultModel
}

/** Set the selected model for a provider. */
export function setModel(providerId, modelId) {
  const config = getProviderConfig(providerId)
  if (!config.models.some(m => m.id === modelId)) {
    throw new Error(`Unknown model ${modelId} for provider ${providerId}`)
  }
  localStorage.setItem(config.modelStorageKey, modelId)
}

/** Get the "fast" model for a provider (used for help chat, etc.). */
export function getFastModel(providerId) {
  const config = getProviderConfig(providerId)
  const fast = config.models.find(m => m.fast)
  return fast ? fast.id : config.defaultModel
}

/* ── Cost Estimation ── */

/**
 * Estimate the cost ($) for a given number of tokens.
 * @param {string} model - Model ID
 * @param {number} inputTokens
 * @param {number} outputTokens
 * @returns {number} Estimated cost in dollars
 */
export function estimateCost(model, inputTokens, outputTokens) {
  // Find which provider owns this model
  for (const provider of Object.values(PROVIDERS)) {
    const rates = provider.costPer1M[model]
    if (rates) {
      return (inputTokens / 1_000_000) * rates.input + (outputTokens / 1_000_000) * rates.output
    }
  }
  // Fallback: rough estimate
  return (inputTokens / 1_000_000) * 3 + (outputTokens / 1_000_000) * 15
}

/** Get cost rates for a model. */
export function getCostRates(model) {
  for (const provider of Object.values(PROVIDERS)) {
    if (provider.costPer1M[model]) return provider.costPer1M[model]
  }
  return { input: 3, output: 15 }
}

export { PROVIDERS }

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { callAnthropicApi, ANTHROPIC_API_URL, ANTHROPIC_API_VERSION, ANTHROPIC_MODEL } from '../apiClient'

describe('apiClient', () => {
  let fetchSpy

  beforeEach(() => {
    vi.useFakeTimers()
    fetchSpy = vi.fn()
    globalThis.fetch = fetchSpy
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  const defaultOpts = {
    apiKey: 'test-key',
    messages: [{ role: 'user', content: 'Hello' }],
  }

  it('exports API constants', () => {
    expect(ANTHROPIC_API_URL).toBe('https://api.anthropic.com/v1/messages')
    expect(ANTHROPIC_API_VERSION).toBe('2023-06-01')
    expect(typeof ANTHROPIC_MODEL).toBe('string')
    expect(ANTHROPIC_MODEL.length).toBeGreaterThan(0)
  })

  it('sends correct headers and body on success', async () => {
    const mockResponse = { id: 'msg_1', content: [{ text: 'Hi' }] }
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse),
    })

    const result = await callAnthropicApi(defaultOpts)

    expect(fetchSpy).toHaveBeenCalledOnce()
    const [url, options] = fetchSpy.mock.calls[0]
    expect(url).toBe(ANTHROPIC_API_URL)
    expect(options.method).toBe('POST')
    expect(options.headers['x-api-key']).toBe('test-key')
    expect(options.headers['anthropic-version']).toBe(ANTHROPIC_API_VERSION)
    expect(options.headers['Content-Type']).toBe('application/json')

    const body = JSON.parse(options.body)
    expect(body.messages).toEqual(defaultOpts.messages)
    expect(body.max_tokens).toBe(4000)
    expect(result).toEqual(mockResponse)
  })

  it('includes system prompt when provided', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'msg_2' }),
    })

    await callAnthropicApi({ ...defaultOpts, system: 'You are helpful.' })

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body)
    expect(body.system).toBe('You are helpful.')
  })

  it('omits system prompt when not provided', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'msg_3' }),
    })

    await callAnthropicApi(defaultOpts)

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body)
    expect(body.system).toBeUndefined()
  })

  it('merges extraBody fields', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'msg_4' }),
    })

    await callAnthropicApi({ ...defaultOpts, extraBody: { temperature: 0.5 } })

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body)
    expect(body.temperature).toBe(0.5)
  })

  it('throws immediately on non-retryable 401 error', async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 401,
      text: () => Promise.resolve('Unauthorized'),
    })

    await expect(callAnthropicApi(defaultOpts)).rejects.toThrow('API error 401')
    // Should NOT retry — only 1 fetch call
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('throws immediately on non-retryable 400 error', async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve('Bad Request'),
    })

    await expect(callAnthropicApi(defaultOpts)).rejects.toThrow('API error 400')
    expect(fetchSpy).toHaveBeenCalledTimes(1)
  })

  it('retries on 500 server error with exponential backoff', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    fetchSpy
      .mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve('Server Error') })
      .mockResolvedValueOnce({ ok: false, status: 500, text: () => Promise.resolve('Server Error') })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ id: 'msg_ok' }) })

    const promise = callAnthropicApi({ ...defaultOpts, retries: 2 })

    // First retry after 1s
    await vi.advanceTimersByTimeAsync(1000)
    // Second retry after 2s
    await vi.advanceTimersByTimeAsync(2000)

    const result = await promise
    expect(result).toEqual({ id: 'msg_ok' })
    expect(fetchSpy).toHaveBeenCalledTimes(3)
  })

  it('throws after exhausting all retries', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.useRealTimers()

    fetchSpy.mockResolvedValue({
      ok: false,
      status: 502,
      text: () => Promise.resolve('Bad Gateway'),
    })

    // Use retries: 0 so there is no retry delay and no dangling promises
    await expect(callAnthropicApi({ ...defaultOpts, retries: 0 })).rejects.toThrow('API error 502')
    expect(fetchSpy).toHaveBeenCalledTimes(1)

    vi.useFakeTimers()
  })

  it('uses custom model and maxTokens', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ id: 'msg_custom' }),
    })

    await callAnthropicApi({
      ...defaultOpts,
      model: 'claude-3-haiku-20240307',
      maxTokens: 1000,
    })

    const body = JSON.parse(fetchSpy.mock.calls[0][1].body)
    expect(body.model).toBe('claude-3-haiku-20240307')
    expect(body.max_tokens).toBe(1000)
  })
})

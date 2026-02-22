import { describe, it, expect } from 'vitest'
import { isSafeUrl, safeHref, isValidWebhookUrl } from '../sanitizeUrl'

describe('isSafeUrl', () => {
  it('accepts http and https URLs', () => {
    expect(isSafeUrl('https://example.com')).toBe(true)
    expect(isSafeUrl('http://example.com')).toBe(true)
    expect(isSafeUrl('https://example.com/path?q=1#hash')).toBe(true)
  })

  it('accepts mailto URLs', () => {
    expect(isSafeUrl('mailto:user@example.com')).toBe(true)
  })

  it('rejects javascript: URLs (case variations)', () => {
    expect(isSafeUrl('javascript:alert(1)')).toBe(false)
    expect(isSafeUrl('JAVASCRIPT:alert(1)')).toBe(false)
    expect(isSafeUrl('JavaScript:void(0)')).toBe(false)
  })

  it('rejects data: URLs', () => {
    expect(isSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false)
  })

  it('rejects vbscript: and file: URLs', () => {
    expect(isSafeUrl('vbscript:MsgBox("xss")')).toBe(false)
    expect(isSafeUrl('file:///etc/passwd')).toBe(false)
  })

  it('rejects null, undefined, empty string', () => {
    expect(isSafeUrl(null)).toBe(false)
    expect(isSafeUrl(undefined)).toBe(false)
    expect(isSafeUrl('')).toBe(false)
  })

  it('rejects non-string values', () => {
    expect(isSafeUrl(123)).toBe(false)
    expect(isSafeUrl({})).toBe(false)
  })
})

describe('safeHref', () => {
  it('returns the URL for safe URLs', () => {
    expect(safeHref('https://example.com')).toBe('https://example.com')
  })

  it('returns # for unsafe URLs', () => {
    expect(safeHref('javascript:alert(1)')).toBe('#')
    expect(safeHref(null)).toBe('#')
    expect(safeHref('')).toBe('#')
  })
})

describe('isValidWebhookUrl', () => {
  it('accepts valid HTTPS URLs', () => {
    expect(isValidWebhookUrl('https://hooks.slack.com/services/T/B/x')).toEqual({ valid: true })
    expect(isValidWebhookUrl('https://api.example.com/webhook')).toEqual({ valid: true })
  })

  it('rejects HTTP URLs', () => {
    const result = isValidWebhookUrl('http://example.com/webhook')
    expect(result.valid).toBe(false)
    expect(result.reason).toContain('HTTPS')
  })

  it('rejects empty/null URLs', () => {
    expect(isValidWebhookUrl(null).valid).toBe(false)
    expect(isValidWebhookUrl('').valid).toBe(false)
  })

  it('rejects invalid URL format', () => {
    expect(isValidWebhookUrl('not a url').valid).toBe(false)
  })

  it('rejects localhost', () => {
    expect(isValidWebhookUrl('https://localhost:3000/hook').valid).toBe(false)
    expect(isValidWebhookUrl('https://127.0.0.1/hook').valid).toBe(false)
  })

  it('rejects private IP ranges', () => {
    expect(isValidWebhookUrl('https://10.0.0.1/hook').valid).toBe(false)
    expect(isValidWebhookUrl('https://192.168.1.1/hook').valid).toBe(false)
    expect(isValidWebhookUrl('https://172.16.0.1/hook').valid).toBe(false)
    expect(isValidWebhookUrl('https://172.31.255.255/hook').valid).toBe(false)
    expect(isValidWebhookUrl('https://169.254.1.1/hook').valid).toBe(false)
  })

  it('allows public IPs', () => {
    expect(isValidWebhookUrl('https://8.8.8.8/hook')).toEqual({ valid: true })
    expect(isValidWebhookUrl('https://1.1.1.1/hook')).toEqual({ valid: true })
  })

  it('rejects .local and .internal hostnames', () => {
    expect(isValidWebhookUrl('https://myserver.local/hook').valid).toBe(false)
    expect(isValidWebhookUrl('https://myserver.internal/hook').valid).toBe(false)
  })
})

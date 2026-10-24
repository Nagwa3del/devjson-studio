import { describe, expect, it } from 'vitest'
import {
  analyzeJson,
  formatJsonError,
  formatJson,
  minifyJson,
  tokenizeJson,
  SAMPLE_JSON,
} from './jsonTools'

describe('analyzeJson', () => {
  it('returns empty status for blank input', () => {
    expect(analyzeJson('')).toEqual({ status: 'empty', error: null })
    expect(analyzeJson('   \n\t ')).toEqual({ status: 'empty', error: null })
  })

  it('reports valid for well-formed JSON', () => {
    expect(analyzeJson('{"ok": true}')).toEqual({ status: 'valid', error: null })
  })

  it('reports invalid with a message for malformed JSON', () => {
    const result = analyzeJson('{"broken": }')
    expect(result.status).toBe('invalid')
    expect(result.error).not.toBeNull()
    expect(result.error?.message).toMatch(/JSON/i)
  })

  it('computes line and column for an error on a later line', () => {
    const result = analyzeJson('{\n  "a": 1,\n  "b": ]\n}')
    expect(result.status).toBe('invalid')
    expect(result.error?.line).toBeGreaterThan(1)
  })
})

describe('formatJson', () => {
  it('pretty-prints with 2-space indent by default', () => {
    expect(formatJson('{"a":1,"b":[2,3]}')).toBe('{\n  "a": 1,\n  "b": [\n    2,\n    3\n  ]\n}')
  })

  it('honors a custom indent size', () => {
    expect(formatJson('{"a":1}', 4)).toBe('{\n    "a": 1\n}')
  })

  it('round-trips minified JSON back to formatted output', () => {
    const minified = minifyJson(SAMPLE_JSON)
    expect(formatJson(minified)).toBe(formatJson(SAMPLE_JSON))
  })

  it('throws the engine SyntaxError for invalid input without modifying the message', () => {
    expect(() => formatJson('nope')).toThrow(SyntaxError)
    try {
      formatJson('nope')
    } catch (err) {
      expect((err as Error).message).not.toMatch(/line \d+, column \d+\)$/)
    }
  })
})

describe('minifyJson', () => {
  it('strips insignificant whitespace', () => {
    expect(minifyJson('{\n  "a" : 1,\n  "b": [ 2 , 3 ]\n}')).toBe('{"a":1,"b":[2,3]}')
  })

  it('preserves whitespace inside strings', () => {
    expect(minifyJson('{"a": "hello world"}')).toBe('{"a":"hello world"}')
  })

  it('handles nested structures and literal types', () => {
    const minified = minifyJson(SAMPLE_JSON)
    expect(minified).toContain('"offline":true')
    expect(minified).toContain('"contributors":null')
  })

  it('throws for empty input', () => {
    expect(() => minifyJson('')).toThrow(SyntaxError)
  })
})

describe('formatJsonError', () => {
  it('strips the engine-embedded "at position/line" tail so location is never duplicated', () => {
    // V8 style message for missing comma: {"a": 1 "b": 2}
    const outcome = analyzeJson('{"a": 1 "b": 2}')
    expect(outcome.status).toBe('invalid')
    expect(outcome.error).not.toBeNull()
    const formatted = formatJsonError(outcome.error as NonNullable<typeof outcome.error>)
    expect(formatted.approximate).toBe(false)
    expect(formatted.message).toMatch(/Expected/i)
    expect(formatted.message).not.toMatch(/position\s+\d+/i)
    expect(formatted.message.toLowerCase()).not.toContain('line')
    expect(formatted.locationText).toMatch(/^Line \d+ · Column \d+$/)
  })

  it('marks heuristic fallback locations as approximate', () => {
    const outcome = analyzeJson('{\n  "a": 1,\n  "b": ]\n}')
    expect(outcome.status).toBe('invalid')
    const formatted = formatJsonError(outcome.error as NonNullable<typeof outcome.error>)
    expect(formatted.approximate).toBe(true)
    expect(formatted.locationText).toMatch(/^Line 3 · Column \d+$/)
  })

  it('cleans legacy parenthesised "(line X, column Y)" suffixes', () => {
    const formatted = formatJsonError({
      message: 'Unexpected end of JSON input (line 2, column 5)',
      line: 2,
      column: 5,
      approximate: false,
    })
    expect(formatted.message).toBe('Unexpected end of JSON input')
    expect(formatted.locationText).toBe('Line 2 · Column 5')
    expect(formatted.message).not.toContain('column')
  })

  it('returns an empty location chip when even the approximate position is unknown', () => {
    const formatted = formatJsonError({
      message: 'Unexpected end of JSON input',
      line: 1,
      column: 1,
      approximate: true,
    })
    expect(formatted.locationText).toBe('')
    expect(formatted.message).toBe('Unexpected end of JSON input')
  })
})

describe('tokenizeJson', () => {
  it('classifies keys, strings, numbers, booleans and null', () => {
    const tokens = tokenizeJson('{ "k": "v", "n": 1.5, "t": true, "x": null }')
    const byValue = Object.fromEntries(tokens.filter((t) => t.value.trim()).map((t) => [t.value, t.type]))
    expect(byValue['"k"']).toBe('key')
    expect(byValue['"v"']).toBe('string')
    expect(byValue['1.5']).toBe('number')
    expect(byValue['true']).toBe('boolean')
    expect(byValue['null']).toBe('null')
  })

  it('preserves whitespace between tokens', () => {
    const tokens = tokenizeJson('{\n  "a": 1\n}')
    expect(tokens.some((t) => t.value === '\n  ')).toBe(true)
  })

  it('treats braces and colons as punctuation', () => {
    const tokens = tokenizeJson('{"a":1}')
    const types = new Set(tokens.map((t) => t.type))
    expect(types.has('punctuation')).toBe(true)
  })
})

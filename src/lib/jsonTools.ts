import type { FormattedJsonError, JsonError, JsonToken, TokenType, ValidationOutcome } from './types'

export type { FormattedJsonError, JsonError, JsonToken, TokenType, ValidationOutcome } from './types'

const POSITION_PATTERN = /position\s+(\d+)/i

const FALLBACK_SCAN_LIMIT = 20000

type ErrorCategory =
  | 'truncation'
  | 'expect-colon'
  | 'expect-comma-or-close'
  | 'expect-property-name'
  | 'genuine'

function categorizeMessage(message: string): ErrorCategory {
  if (/end of json input|unterminated string/i.test(message)) return 'truncation'
  if (/expected ':' after property name/i.test(message)) return 'expect-colon'
  if (/expected ',' or '\}' after property value/i.test(message)) return 'expect-comma-or-close'
  if (/expected (double-quoted )?property name or '\}'|expected double-quoted property name/i.test(message))
    return 'expect-property-name'
  return 'genuine'
}

function nextMeaningfulChar(text: string, from: number): string {
  for (let i = from; i < text.length; i++) {
    const ch = text[i]
    if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t') continue
    return ch
  }
  return ''
}

/** A prefix-parse error is a truncation artifact if the remaining text could legally continue the parse */
function isTruncationArtifact(category: ErrorCategory, next: string, atEnd: boolean): boolean {
  switch (category) {
    case 'truncation':
      return !atEnd
    case 'expect-colon':
      return next === ':'
    case 'expect-comma-or-close':
      return next === ',' || next === '}'
    case 'expect-property-name':
      return next === '"'
    default:
      return false
  }
}

function lineColFromPosition(text: string, position: number): { line: number; column: number } {
  const clamped = Math.max(0, Math.min(position, text.length))
  const upto = text.slice(0, clamped)
  const line = upto.split('\n').length
  const lastNewline = upto.lastIndexOf('\n')
  const column = clamped - lastNewline
  return { line, column }
}

/**
 * V8 often omits "position N" (e.g. "Unexpected token ']' ... is not valid JSON").
 * Fallback heuristic: walk prefixes, skipping slice errors that the remaining
 * text could legally continue (truncation artifacts); the first non-continuable
 * slice error marks the real offender (±1 char).
 */
function findProblemPosition(text: string): number {
  if (text.length > FALLBACK_SCAN_LIMIT) return 0
  for (let i = 1; i <= text.length; i++) {
    let message = ''
    try {
      JSON.parse(text.slice(0, i))
      continue
    } catch (err) {
      message = err instanceof Error ? err.message : String(err)
    }
    const category = categorizeMessage(message)
    const next = nextMeaningfulChar(text, i)
    if (!isTruncationArtifact(category, next, i === text.length)) {
      return i
    }
  }
  return 0
}

function locateParseError(text: string, message: string): JsonError {
  const match = POSITION_PATTERN.exec(message)
  if (match) {
    const position = Number.parseInt(match[1], 10)
    const { line, column } = lineColFromPosition(text, position)
    return { message, line, column, approximate: false }
  }
  const fallbackPosition = findProblemPosition(text)
  const { line, column } = lineColFromPosition(text, fallbackPosition)
  return { message, line, column, approximate: true }
}

/** Matches V8's "… in JSON at position 10 (line 2 column 9)" tail */
const ATTACHED_LOCATION_TAILS = [
  / in JSON at position \d+(?: \(line \d+ column \d+\))?$/i,
  / in JSON at position \d+$/i,
  /\s*\(\s*line \d+,\s*column \d+\s*\)$/i,
  /\s*\(\s*line \d+ column \d+\s*\)$/i,
]

/** Renders a JsonError as a short message plus a separate location chip, never duplicating location info */
export function formatJsonError(error: JsonError): FormattedJsonError {
  let message = error.message
  for (const pattern of ATTACHED_LOCATION_TAILS) {
    message = message.replace(pattern, '')
  }
  const locationKnown = !(error.approximate && error.line === 1 && error.column === 1)
  return {
    message: message.trim(),
    locationText: locationKnown ? `Line ${error.line} · Column ${error.column}` : '',
    approximate: error.approximate ?? false,
  }
}

/** Placeholder location for errors that carry no position information at all */
export const EMPTY_LOCATION = { locationText: '', approximate: false }

/** Validates JSON text; status is 'empty' for blank input */
export function analyzeJson(input: string): ValidationOutcome {
  if (input.trim() === '') {
    return { status: 'empty', error: null }
  }
  try {
    JSON.parse(input)
    return { status: 'valid', error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    return { status: 'invalid', error: locateParseError(input, message) }
  }
}

/** Pretty-prints JSON with the given indent (2 spaces by default). Throws the engine's untampered SyntaxError. */
export function formatJson(input: string, indentSize: number = 2): string {
  return JSON.stringify(JSON.parse(input), null, indentSize)
}

/** Removes all insignificant whitespace from JSON. Throws the engine's untampered SyntaxError. */
export function minifyJson(input: string): string {
  return JSON.stringify(JSON.parse(input))
}

const TOKEN_PATTERN =
  /("(?:\\.|[^"\\])*")|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|(\btrue\b|\bfalse\b)|(\bnull\b)|([{}[\],:])/g

/** Tokenizes JSON text for syntax highlighting */
export function tokenizeJson(text: string): JsonToken[] {
  const tokens: JsonToken[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  TOKEN_PATTERN.lastIndex = 0
  while ((match = TOKEN_PATTERN.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ value: text.slice(lastIndex, match.index), type: 'plain' })
    }
    tokens.push({
      value: match[0],
      type: classifyToken(match, text, match.index + match[0].length),
    })
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    tokens.push({ value: text.slice(lastIndex), type: 'plain' })
  }

  return tokens
}

function nextNonWhitespaceIsColon(text: string, from: number): boolean {
  for (let i = from; i < text.length; i++) {
    const ch = text[i]
    if (ch === ' ' || ch === '\n' || ch === '\r' || ch === '\t') continue
    return ch === ':'
  }
  return false
}

function classifyToken(match: RegExpExecArray, text: string, end: number): TokenType {
  if (match[1] !== undefined) {
    return nextNonWhitespaceIsColon(text, end) ? 'key' : 'string'
  }
  if (match[2] !== undefined) return 'number'
  if (match[3] !== undefined) return 'boolean'
  if (match[4] !== undefined) return 'null'
  return 'punctuation'
}

export const SAMPLE_JSON = `{
  "name": "DevJSON Studio",
  "version": "1.0.0",
  "description": "A premium, privacy-first JSON toolkit",
  "features": [
    { "id": "formatter", "enabled": true, "priority": 1 },
    { "id": "validator", "enabled": true, "priority": 2 },
    { "id": "minifier", "enabled": true, "priority": 3 }
  ],
  "engine": {
    "language": "TypeScript",
    "runtime": "browser",
    "keywords": ["JSON", "Vite", "React"],
    "offline": true
  },
  "contributors": null,
  "downloads": 128500,
  "rating": 4.87
}`

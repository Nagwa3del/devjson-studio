export interface JsonError {
  message: string
  line: number
  column: number
  /** true when position came from the heuristic fallback and may be ±1 char off */
  approximate?: boolean
}

export interface FormattedJsonError {
  /** short, human-readable message with all embedded location info stripped */
  message: string
  /** "Line 3 · Column 9" chip text, or '' when the location is unknown */
  locationText: string
  approximate: boolean
}

export type ValidationStatus = 'valid' | 'invalid' | 'empty'

export interface ValidationOutcome {
  status: ValidationStatus
  error: JsonError | null
}

export type TokenType =
  | 'key'
  | 'string'
  | 'number'
  | 'boolean'
  | 'null'
  | 'punctuation'
  | 'plain'

export interface JsonToken {
  value: string
  type: TokenType
}

export const TOKEN_COLOR_CLASS: Record<TokenType, string> = {
  key: 'text-sky-600 dark:text-sky-300',
  string: 'text-emerald-700 dark:text-emerald-300',
  number: 'text-amber-700 dark:text-amber-300',
  boolean: 'text-purple-700 dark:text-purple-300',
  null: 'text-rose-700 dark:text-rose-400',
  punctuation: 'text-slate-500 dark:text-slate-500',
  plain: 'text-slate-800 dark:text-slate-300',
}

export const VALID_STATE: Record<ValidationStatus, { label: string; className: string }> = {
  valid: {
    label: 'Valid JSON',
    className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
  },
  invalid: {
    label: 'Invalid JSON',
    className: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300',
  },
  empty: {
    label: 'Empty',
    className: 'bg-slate-200/80 text-slate-700 dark:bg-slate-500/20 dark:text-slate-300',
  },
}

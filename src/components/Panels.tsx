import {
  AlertTriangle,
  Braces,
  Check,
  ClipboardCopy,
  Download,
} from 'lucide-react'
import { VALID_STATE, type JsonError, type JsonToken, type ValidationStatus } from '../lib/types'
import { formatJsonError, type FormattedJsonError } from '../lib/jsonTools'
import {
  ACTION_BUTTON,
  SHARED_TOOLBAR,
  SHORTCUT_BADGE,
  TOOLBAR_BUTTONS,
  type ToolbarAction,
} from './workspaceMeta'

function ToolbarButton({
  action,
  onAction,
}: {
  action: ToolbarAction
  onAction: (action: ToolbarAction) => void
}) {
  const { label, hint, Icon } = TOOLBAR_BUTTONS[action]
  return (
    <button
      type="button"
      className={ACTION_BUTTON}
      onClick={() => onAction(action)}
      title={`${label} (${hint})`}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {label}
      <kbd className={SHORTCUT_BADGE}>{hint}</kbd>
    </button>
  )
}

/** Shared action bar rendered above both panels: transforms on the left, export on the right */
export function WorkspaceToolbar({
  onAction,
  onCopy,
  onDownload,
  outputReady,
  copied,
}: {
  onAction: (action: ToolbarAction) => void
  onCopy: () => void
  onDownload: () => void
  outputReady: boolean
  copied: boolean
}) {
  return (
    <div className={SHARED_TOOLBAR} aria-label="JSON tools">
      <div className="flex flex-wrap items-center gap-1.5">
        {(Object.keys(TOOLBAR_BUTTONS) as ToolbarAction[]).map((action) => (
          <ToolbarButton key={action} action={action} onAction={onAction} />
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          className={ACTION_BUTTON}
          onClick={onCopy}
          disabled={!outputReady}
          title="Copy output (Ctrl+Shift+C)"
        >
          <ClipboardCopy className="h-3.5 w-3.5 shrink-0" />
          {copied ? 'Copied' : 'Copy'}
          {copied ? (
            <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          ) : (
            <kbd className={SHORTCUT_BADGE}>Ctrl+Shift+C</kbd>
          )}
        </button>
        <button
          type="button"
          className={ACTION_BUTTON}
          onClick={onDownload}
          disabled={!outputReady}
          title="Download .json (Ctrl+Shift+S)"
        >
          <Download className="h-3.5 w-3.5 shrink-0" />
          Download
          <kbd className={SHORTCUT_BADGE}>Ctrl+Shift+S</kbd>
        </button>
      </div>
    </div>
  )
}

function ErrorLocationChip({ formatted }: { formatted: FormattedJsonError }) {
  if (!formatted.locationText) return null
  return (
    <span
      className="inline-flex items-center gap-1 rounded bg-rose-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-rose-700 dark:bg-rose-500/15 dark:text-rose-300"
      title={formatted.approximate ? 'Approximate error location (±1 character)' : 'Exact error location'}
      data-testid="error-location"
    >
      <span aria-hidden="true">{formatted.approximate ? '≈' : '↳'}</span>
      {formatted.locationText}
    </span>
  )
}

export function InlineErrorBanner({ error }: { error: FormattedJsonError }) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2.5 border-t border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300"
    >
      <span aria-hidden="true" className="mt-0.5">
        ✕
      </span>
      <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <span data-testid="transform-error">{error.message}</span>
        <ErrorLocationChip formatted={error} />
      </span>
    </div>
  )
}

export function StatusBar({
  status,
  error,
  charCount,
  lineCount,
  outputSize,
}: {
  status: ValidationStatus
  error: JsonError | null
  charCount: number
  lineCount: number
  outputSize: number
}) {
  const cfg = VALID_STATE[status]
  return (
    <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-6 py-2.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-semibold shadow-sm ${cfg.className}`}
        >
          {status === 'invalid' ? (
            <AlertTriangle className="h-3 w-3" aria-hidden="true" />
          ) : (
            <Check className="h-3 w-3" aria-hidden="true" />
          )}
          {cfg.label}
        </span>
        {status === 'invalid' && error && <ErrorLocationChip formatted={formatJsonError(error)} />}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px]">
        <span>{charCount} chars in</span>
        <span>{lineCount} lines</span>
        <span>{outputSize} chars out</span>
      </div>
    </footer>
  )
}

export function EmptyOutput({ tokens }: { tokens: JsonToken[] }) {
  if (tokens.length > 0) return null
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2.5 px-6 text-center text-slate-500 dark:text-slate-400">
      <Braces className="h-10 w-10 text-slate-400 dark:text-slate-500" aria-hidden="true" />
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">Formatted output appears here</p>
      <p className="text-xs">Run Format, Minify, or Sample to get started</p>
    </div>
  )
}

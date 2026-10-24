import type { LucideIcon } from 'lucide-react'
import { Check, Eraser, FileJson, Minimize2, WrapText } from 'lucide-react'

export type ToolbarAction = 'format' | 'minify' | 'validate' | 'sample' | 'clear'

export const TOOLBAR_BUTTONS: Record<
  ToolbarAction,
  { id: ToolbarAction; label: string; hint: string; Icon: LucideIcon }
> = {
  format: { id: 'format', label: 'Format', hint: 'Ctrl+Shift+F', Icon: WrapText },
  minify: { id: 'minify', label: 'Minify', hint: 'Ctrl+Shift+M', Icon: Minimize2 },
  validate: { id: 'validate', label: 'Validate', hint: 'Ctrl+Shift+V', Icon: Check },
  sample: { id: 'sample', label: 'Sample', hint: 'Ctrl+Shift+J', Icon: FileJson },
  clear: { id: 'clear', label: 'Clear', hint: 'Ctrl+Shift+X', Icon: Eraser },
}

export const PANEL_CARD =
  'flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xl shadow-slate-900/5 backdrop-blur transition-colors focus-within:border-indigo-300 dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-black/30 dark:focus-within:border-indigo-500'

export const PANEL_LABEL =
  'flex min-h-[44px] items-center justify-between gap-3 border-b border-slate-200/80 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:border-slate-700/70 dark:text-slate-300'

export const ACTION_BUTTON =
  'inline-flex h-8 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300'

export const SHORTCUT_BADGE =
  'hidden rounded border border-slate-200 bg-slate-50 px-1.5 py-px font-mono text-[10px] font-medium text-slate-500 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-400 xl:inline'

export const SHARED_TOOLBAR =
  'flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white/80 px-3 py-2 shadow-xl shadow-slate-900/5 backdrop-blur dark:border-slate-700/70 dark:bg-slate-900/80 dark:shadow-black/30'

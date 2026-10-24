import { Moon, Sun } from 'lucide-react'

const toggleClass =
  'inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300'

export function Header({ theme, onToggleTheme }: { theme: 'light' | 'dark'; onToggleTheme: () => void }) {
  return (
    <header className="flex items-center justify-between gap-4 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-white"
            aria-hidden="true"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            DevJSON Studio
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Format · Validate · Minify — all local, nothing leaves your browser
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onToggleTheme}
        className={toggleClass}
        aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        title={theme === 'dark' ? 'Switch to light mode (Ctrl+Shift+L)' : 'Switch to dark mode (Ctrl+Shift+L)'}
      >
        {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        {theme === 'dark' ? 'Light' : 'Dark'}
      </button>
    </header>
  )
}

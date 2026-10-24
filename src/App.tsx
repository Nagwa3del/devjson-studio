import { useCallback, useEffect, useMemo, useState } from 'react'
import { Header } from './components/Header'
import { EmptyOutput, InlineErrorBanner, StatusBar, WorkspaceToolbar } from './components/Panels'
import { PANEL_CARD, PANEL_LABEL } from './components/workspaceMeta'
import { HighlightedJson } from './components/HighlightedJson'
import {
  analyzeJson,
  EMPTY_LOCATION,
  formatJson,
  formatJsonError,
  minifyJson,
  SAMPLE_JSON,
  tokenizeJson,
} from './lib/jsonTools'
import type { FormattedJsonError } from './lib/types'
import { TOOLBAR_BUTTONS, type ToolbarAction } from './components/workspaceMeta'

type Theme = 'light' | 'dark'

function readInitialTheme(): Theme {
  if (typeof document === 'undefined') return 'dark'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export default function App() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [outputMode, setOutputMode] = useState<'formatted' | 'minified' | null>(null)
  const [copied, setCopied] = useState(false)
  const [theme, setTheme] = useState<Theme>(readInitialTheme)
  const [transformError, setTransformError] = useState<FormattedJsonError | null>(null)

  const validation = useMemo(() => analyzeJson(input), [input])
  const tokens = useMemo(() => tokenizeJson(output), [output])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    try {
      localStorage.setItem('devjson-theme', theme)
    } catch {
      /* storage unavailable - ignore */
    }
  }, [theme])

  const runTransform = useCallback(
    (mode: 'formatted' | 'minified') => {
      if (input.trim() === '') {
        setTransformError({
          message: 'Add some JSON first — use Sample to load example data.',
          locationText: '',
          approximate: false,
        })
        setOutput('')
        setOutputMode(null)
        return
      }
      try {
        setOutput(mode === 'formatted' ? formatJson(input) : minifyJson(input))
        setOutputMode(mode)
        setTransformError(null)
      } catch (err) {
        const outcome = analyzeJson(input)
        setTransformError(
          outcome.error
            ? formatJsonError(outcome.error)
            : { message: err instanceof Error ? err.message : String(err), ...EMPTY_LOCATION },
        )
        setOutput('')
        setOutputMode(null)
      }
    },
    [input],
  )

  const handleAction = useCallback(
    (action: ToolbarAction) => {
      switch (action) {
        case 'format':
          runTransform('formatted')
          break
        case 'minify':
          runTransform('minified')
          break
        case 'validate':
          setTransformError(null)
          break
        case 'sample':
          setInput(SAMPLE_JSON)
          setOutput(formatJson(SAMPLE_JSON))
          setOutputMode('formatted')
          setTransformError(null)
          break
        case 'clear':
          setInput('')
          setOutput('')
          setOutputMode(null)
          setTransformError(null)
          break
      }
    },
    [runTransform],
  )

  const copyOutput = useCallback(async () => {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
    } catch {
      const legacy = document.createElement('textarea')
      legacy.value = output
      document.body.appendChild(legacy)
      legacy.select()
      document.execCommand('copy')
      document.body.removeChild(legacy)
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }, [output])

  const downloadOutput = useCallback(() => {
    if (!output) return
    const blob = new Blob([output], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'data.json'
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
  }, [output])

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (!event.ctrlKey || !event.shiftKey) return
      const key = event.key.toLowerCase()
      const stop = () => {
        event.preventDefault()
        event.stopPropagation()
      }
      switch (key) {
        case 'f':
          stop()
          runTransform('formatted')
          break
        case 'm':
          stop()
          runTransform('minified')
          break
        case 'v':
          stop()
          handleAction('validate')
          break
        case 'j':
          stop()
          handleAction('sample')
          break
        case 'x':
          stop()
          handleAction('clear')
          break
        case 'c':
          stop()
          void copyOutput()
          break
        case 's':
          stop()
          downloadOutput()
          break
        case 'l':
          stop()
          setTheme((t) => (t === 'dark' ? 'light' : 'dark'))
          break
      }
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [runTransform, handleAction, copyOutput, downloadOutput])

  const panelDot = 'h-2 w-2 shrink-0 rounded-full'

  return (
    <div className="flex min-h-dvh flex-col bg-gradient-to-br from-slate-100 via-indigo-50/60 to-slate-200 text-slate-900 transition-colors dark:from-slate-950 dark:via-indigo-950/40 dark:to-slate-900 dark:text-slate-100">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-indigo-600 focus:px-3 focus:py-2 focus:text-white"
      >
        Skip to workspace
      </a>
      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
        <Header theme={theme} onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))} />

        <main id="main" className="flex flex-1 flex-col gap-4 px-6 pb-4">
          <WorkspaceToolbar
            onAction={handleAction}
            onCopy={() => void copyOutput()}
            onDownload={downloadOutput}
            outputReady={!!output}
            copied={copied}
          />
          <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
            {/* Input panel */}
            <section className={`${PANEL_CARD} flex-1 basis-1/2`} aria-label="Input JSON">
              <div className={`${PANEL_LABEL} pr-2.5`}>
                <span className="flex items-center gap-2">
                  <span className={`${panelDot} bg-indigo-500`} aria-hidden="true" />
                  Input
                </span>
                <span
                  className={
                    'rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-semibold tracking-normal text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }
                >
                  {input.length} chars
                </span>
              </div>
              <label className="sr-only" htmlFor="input-json">
                Input JSON
              </label>
              <textarea
                id="input-json"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                spellCheck={false}
                placeholder={'Paste JSON here…\n\nCtrl+Shift+J loads a sample · Ctrl+Shift+F formats it.'}
                className="min-h-[320px] flex-1 resize-none bg-transparent px-5 py-4 font-mono text-[13px] leading-relaxed text-slate-800 caret-indigo-500 outline-none placeholder:text-slate-400 dark:min-h-[440px] dark:text-slate-200 dark:placeholder:text-slate-500"
                data-testid="input-textarea"
              />
              {transformError && <InlineErrorBanner error={transformError} />}
            </section>

            {/* Output panel */}
            <section className={`${PANEL_CARD} flex-1 basis-1/2`} aria-label="Output JSON">
              <div className={`${PANEL_LABEL} pr-2.5`}>
                <span className="flex items-center gap-2">
                  <span className={`${panelDot} bg-violet-500`} aria-hidden="true" />
                  Output
                </span>
                {outputMode && (
                  <span
                    className={
                      'rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300'
                    }
                  >
                    {outputMode}
                  </span>
                )}
              </div>
              <div
                className="min-h-[320px] flex-1 overflow-hidden bg-slate-50/60 dark:min-h-[440px] dark:bg-slate-950/40"
                data-testid="output-area"
              >
                {output ? <HighlightedJson tokens={tokens} /> : <EmptyOutput tokens={tokens} />}
              </div>
            </section>
          </div>
        </main>

        <StatusBar
          status={validation.status}
          error={validation.error}
          charCount={input.length}
          lineCount={input === '' ? 0 : input.split('\n').length}
          outputSize={output.length}
        />

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-slate-200/70 px-6 py-3 text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:text-slate-400">
          <span className="font-semibold text-slate-700 dark:text-slate-300">Shortcuts:</span>
          {(
            ['format', 'minify', 'validate', 'sample', 'clear'] as ToolbarAction[]
          ).map((key) => (
            <span key={key} className="font-mono text-slate-600 dark:text-slate-400">
              {TOOLBAR_BUTTONS[key].hint} — {TOOLBAR_BUTTONS[key].label}
            </span>
          ))}
          <span className="font-mono text-slate-600 dark:text-slate-400">Ctrl+Shift+C — Copy</span>
          <span className="font-mono text-slate-600 dark:text-slate-400">Ctrl+Shift+S — Download</span>
          <span className="font-mono text-slate-600 dark:text-slate-400">Ctrl+Shift+L — Theme</span>
        </div>
      </div>
    </div>
  )
}

import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { SAMPLE_JSON } from './lib/jsonTools'
import type { JsonToken } from './lib/types'
import { HighlightedJson } from './components/HighlightedJson'

describe('App', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      ...navigator,
      clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
    })
    URL.createObjectURL = vi.fn(() => 'blob:mock')
    URL.revokeObjectURL = vi.fn()
  })

  it('renders header and empty state on first load', () => {
    render(<App />)
    const headings = screen.getAllByText('DevJSON Studio')
    expect(headings.length).toBeGreaterThan(0)
    expect(screen.getByText(/Formatted output appears here/i)).toBeInTheDocument()
    expect(screen.getByTestId('input-textarea')).toHaveValue('')
  })

  it('formats input into highlighted output', async () => {
    render(<App />)
    fireEvent.change(screen.getByTestId('input-textarea'), {
      target: { value: '{"name":"DevJSON","version":1}' },
    })
    fireEvent.click(screen.getByRole('button', { name: /format/i }))
    expect(screen.getByTestId('output-code').textContent).toContain('"name": "DevJSON"')
  })

  it('loads the sample JSON via the Sample button', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /sample/i }))
    expect(screen.getByTestId('input-textarea')).toHaveValue(SAMPLE_JSON)
    expect(screen.getByTestId('output-code').textContent).toContain('"rating": 4.87')
  })

  it('shows an error banner and clears output when invalid input is formatted', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /sample/i }))
    fireEvent.change(screen.getByTestId('input-textarea'), { target: { value: '{bad json}' } })
    fireEvent.click(screen.getByRole('button', { name: /format/i }))
    expect(screen.getByTestId('transform-error')).toBeInTheDocument()
    expect(screen.queryByText(/Formatted output appears here/i)).not.toBeNull()
  })

  it('clears input and output with the Clear button', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /sample/i }))
    fireEvent.click(screen.getByRole('button', { name: /clear/i }))
    expect(screen.getByTestId('input-textarea')).toHaveValue('')
    expect(screen.getByText(/Formatted output appears here/i)).toBeInTheDocument()
  })

  it('copies the output to the clipboard', async () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /sample/i }))
    fireEvent.click(screen.getByRole('button', { name: /copy/i }))
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(expect.stringContaining('"rating": 4.87'))
    })
  })

  it('toggles dark and light theme from the header button', () => {
    render(<App />)
    const toggle = screen.getByRole('button', { name: /switch to (light|dark) mode/i })
    const before = document.documentElement.classList.contains('dark')
    fireEvent.click(toggle)
    expect(document.documentElement.classList.contains('dark')).toBe(!before)
  })
})

describe('HighlightedJson', () => {
  it('renders token values with their classes and escapes nothing visually', () => {
    const tokens: JsonToken[] = [
      { value: '{', type: 'punctuation' },
      { value: '"k"', type: 'key' },
      { value: ': ', type: 'plain' },
      { value: '1', type: 'number' },
      { value: '}', type: 'punctuation' },
    ]
    render(<HighlightedJson tokens={tokens} />)
    expect(screen.getByTestId('output-code').textContent).toBe('{"k": 1}')
  })
})

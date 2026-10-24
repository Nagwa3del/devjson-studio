import { TOKEN_COLOR_CLASS as tokenColorClasses, type JsonToken } from '../lib/types'

export function HighlightedJson({ tokens }: { tokens: JsonToken[] }) {
  return (
    <pre
      className="h-full overflow-auto p-5 font-mono text-[13px] leading-relaxed whitespace-pre"
      data-testid="output-code"
    >
      <code>
        {tokens.map((token, index) => (
          <span key={index} className={tokenColorClasses[token.type]}>
            {token.value}
          </span>
        ))}
      </code>
    </pre>
  )
}

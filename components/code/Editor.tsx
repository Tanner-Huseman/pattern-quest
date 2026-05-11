'use client'

import dynamic from 'next/dynamic'
import { useRef } from 'react'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false })

type Props = {
  value: string
  onChange?: (val: string) => void
  readOnly?: boolean
  height?: string
}

const CUSTOM_THEME = {
  base: 'vs-dark' as const,
  inherit: true,
  rules: [
    { token: 'keyword', foreground: '06B6D4', fontStyle: 'bold' },
    { token: 'string', foreground: 'F59E0B' },
    { token: 'comment', foreground: '475569', fontStyle: 'italic' },
    { token: 'number', foreground: 'EC4899' },
    { token: 'type', foreground: '84CC16' },
    { token: 'delimiter', foreground: '84CC16' },
    { token: 'variable', foreground: 'F8FAFC' },
    { token: 'identifier', foreground: 'F8FAFC' },
    { token: 'function', foreground: '06B6D4' },
  ],
  colors: {
    'editor.background': '#0F172A',
    'editor.foreground': '#F8FAFC',
    'editorLineNumber.foreground': '#334155',
    'editorLineNumber.activeForeground': '#6D28D9',
    'editor.lineHighlightBackground': '#1E293B',
    'editor.selectionBackground': '#6D28D940',
    'editorCursor.foreground': '#06B6D4',
    'editorWhitespace.foreground': '#1E293B',
    'editorIndentGuide.background': '#1E293B',
    'editorIndentGuide.activeBackground': '#334155',
    'scrollbarSlider.background': '#6D28D940',
    'scrollbarSlider.hoverBackground': '#6D28D960',
  },
}

export default function Editor({ value, onChange, readOnly = false, height = '280px' }: Props) {
  return (
    <div className="rounded-xl overflow-hidden border border-ink/30" style={{ height }}>
      <MonacoEditor
        height={height}
        language="python"
        value={value}
        theme="pq-dark"
        options={{
          fontSize: 13,
          fontFamily: 'var(--font-jetbrains-mono), "JetBrains Mono", monospace',
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          lineNumbers: 'on',
          renderLineHighlight: 'line',
          padding: { top: 12, bottom: 12 },
          readOnly,
          tabSize: 4,
          insertSpaces: true,
          automaticLayout: true,
          cursorBlinking: 'smooth',
          smoothScrolling: true,
          contextmenu: false,
          suggest: {
            showKeywords: true,
          },
        }}
        onChange={(val) => onChange?.(val ?? '')}
        beforeMount={(monaco) => {
          monaco.editor.defineTheme('pq-dark', CUSTOM_THEME)
        }}
        onMount={(editor) => {
          editor.updateOptions({ fontFamily: 'var(--font-jetbrains-mono), "JetBrains Mono", monospace' })
        }}
      />
    </div>
  )
}

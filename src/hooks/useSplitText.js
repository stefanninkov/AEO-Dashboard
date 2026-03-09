import { useRef, useEffect } from 'react'

/**
 * Splits text content of an element into individual <span> wrappers
 * for character-level, word-level, or line-level animation.
 *
 * Returns a ref to attach to the text element, and arrays of
 * created span elements after mount.
 */
export function useSplitText(mode = 'chars') {
  const ref = useRef(null)
  const spans = useRef({ chars: [], words: [], lines: [] })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const text = el.textContent || ''
    el.textContent = ''
    el.style.overflow = 'hidden'

    if (mode === 'chars' || mode === 'both') {
      const words = text.split(' ')
      words.forEach((word, wi) => {
        const wordSpan = document.createElement('span')
        wordSpan.style.display = 'inline-block'
        wordSpan.style.whiteSpace = 'nowrap'

        ;[...word].forEach((char) => {
          const charSpan = document.createElement('span')
          charSpan.textContent = char
          charSpan.style.display = 'inline-block'
          charSpan.className = 'split-char'
          wordSpan.appendChild(charSpan)
          spans.current.chars.push(charSpan)
        })

        spans.current.words.push(wordSpan)
        el.appendChild(wordSpan)

        if (wi < words.length - 1) {
          const space = document.createElement('span')
          space.innerHTML = '&nbsp;'
          space.style.display = 'inline-block'
          el.appendChild(space)
        }
      })
    } else if (mode === 'words') {
      const words = text.split(' ')
      words.forEach((word, wi) => {
        const wordSpan = document.createElement('span')
        wordSpan.textContent = word
        wordSpan.style.display = 'inline-block'
        wordSpan.className = 'split-word'
        spans.current.words.push(wordSpan)
        el.appendChild(wordSpan)

        if (wi < words.length - 1) {
          const space = document.createElement('span')
          space.innerHTML = '&nbsp;'
          space.style.display = 'inline-block'
          el.appendChild(space)
        }
      })
    } else if (mode === 'lines') {
      // Lines mode: wrap each line in a span
      // For simplicity, treat each sentence or '\n' as a line
      const lines = text.split('\n')
      lines.forEach((line) => {
        const lineSpan = document.createElement('span')
        lineSpan.textContent = line
        lineSpan.style.display = 'block'
        lineSpan.className = 'split-line'
        spans.current.lines.push(lineSpan)
        el.appendChild(lineSpan)
      })
    }

    return () => {
      spans.current = { chars: [], words: [], lines: [] }
      if (el) el.textContent = text
    }
  }, [mode])

  return { ref, spans }
}

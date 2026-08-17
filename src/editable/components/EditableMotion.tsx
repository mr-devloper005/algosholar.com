'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ArrowUp, Check, Link2, Search, X } from 'lucide-react'

/*
  Presentation-only interactivity for the Crimson Deco system.

  Nothing here fetches data or changes routing — these components only enhance
  what the server already rendered: scroll reveals, a reading progress rule, a
  back-to-top control, a copy-link button, and an instant client-side filter
  that hides/shows already-rendered cards.
*/

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/* ------------------------------------------------------------------ *
   Scroll reveal — adds .is-visible to every .deco-reveal in the page
 * ------------------------------------------------------------------ */
export function EditableScrollReveal() {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.deco-reveal'))
    if (!nodes.length) return
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      nodes.forEach((node) => node.classList.add('is-visible'))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          const el = entry.target as HTMLElement
          const delay = Number(el.dataset.revealDelay || 0)
          window.setTimeout(() => el.classList.add('is-visible'), delay)
          observer.unobserve(el)
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    )
    nodes.forEach((node) => observer.observe(node))
    return () => observer.disconnect()
  }, [])

  return null
}

/* ------------------------------------------------------------------ *
   Back to top
 * ------------------------------------------------------------------ */
export function EditableBackToTop() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 720)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' })}
      className={`fixed bottom-6 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full border border-[var(--slot4-line)] bg-[var(--slot4-surface-bg)]/90 text-[var(--slot4-accent)] backdrop-blur-md transition duration-500 hover:border-[var(--slot4-accent)] hover:shadow-[0_0_28px_rgba(225,18,53,0.45)] sm:bottom-8 sm:right-8 ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-4 opacity-0'
      }`}
    >
      <ArrowUp className="h-4.5 w-4.5" />
    </button>
  )
}

/* ------------------------------------------------------------------ *
   Reading progress rule (article detail)
 * ------------------------------------------------------------------ */
export function EditableReadingProgress() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const update = () => {
      const doc = document.documentElement
      const total = doc.scrollHeight - doc.clientHeight
      setProgress(total > 0 ? Math.min(100, Math.max(0, (doc.scrollTop / total) * 100)) : 0)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent" aria-hidden="true">
      <div
        className="h-full bg-[linear-gradient(90deg,var(--slot4-accent-deep),var(--slot4-accent),var(--slot4-accent-bright))] shadow-[0_0_16px_rgba(225,18,53,0.7)] transition-[width] duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

/* ------------------------------------------------------------------ *
   Copy link
 * ------------------------------------------------------------------ */
export function EditableCopyLink({ label = 'Copy link', className = '' }: { label?: string; className?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      /* clipboard unavailable — no-op */
    }
  }, [])

  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex items-center gap-2 border border-[var(--tk-line,var(--slot4-line))] px-4 py-2.5 deco-label deco-label-sm text-[var(--tk-muted,var(--slot4-muted-text))] transition duration-500 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)] ${className}`}
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
      {copied ? 'Copied' : label}
    </button>
  )
}

/* ------------------------------------------------------------------ *
   Instant filter — hides/shows already-rendered cards by keyword.
   Works on any container whose items carry data-filter-key.
 * ------------------------------------------------------------------ */
export function EditableInstantFilter({
  targetId,
  placeholder = 'Filter what is on this page…',
  emptyMessage = 'Nothing on this page matches that.',
}: {
  targetId: string
  placeholder?: string
  emptyMessage?: string
}) {
  const [term, setTerm] = useState('')
  const [visible, setVisible] = useState<number | null>(null)
  const frame = useRef<number | null>(null)

  useEffect(() => {
    const container = document.getElementById(targetId)
    if (!container) return
    const items = Array.from(container.querySelectorAll<HTMLElement>('[data-filter-key]'))
    if (!items.length) return

    const apply = () => {
      const needle = term.trim().toLowerCase()
      let shown = 0
      items.forEach((item) => {
        const hit = !needle || (item.dataset.filterKey || '').includes(needle)
        item.style.display = hit ? '' : 'none'
        if (hit) shown += 1
      })
      setVisible(needle ? shown : null)
    }

    if (frame.current) cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(apply)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [term, targetId])

  // Restore every card when this control unmounts.
  useEffect(() => {
    return () => {
      const container = document.getElementById(targetId)
      container?.querySelectorAll<HTMLElement>('[data-filter-key]').forEach((item) => {
        item.style.display = ''
      })
    }
  }, [targetId])

  return (
    <div className="w-full sm:max-w-sm">
      <label className="flex items-center gap-3 border border-[var(--tk-line,var(--slot4-line))] bg-[var(--tk-surface,var(--slot4-surface-bg))] px-4 py-3 transition focus-within:border-[var(--slot4-accent)]">
        <Search className="h-4 w-4 shrink-0 text-[var(--slot4-accent)]" />
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm outline-none"
          aria-label={placeholder}
        />
        {term ? (
          <button type="button" onClick={() => setTerm('')} aria-label="Clear filter" className="text-[var(--tk-muted,var(--slot4-muted-text))] transition hover:text-[var(--slot4-accent)]">
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </label>
      {visible !== null ? (
        <p className="mt-2 deco-label deco-label-sm text-[var(--tk-muted,var(--slot4-muted-text))]">
          {visible > 0 ? `${visible} shown on this page` : emptyMessage}
        </p>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ *
   Rotating headline word — small kinetic touch for the hero
 * ------------------------------------------------------------------ */
export function EditableRotatingWord({ words, className = '' }: { words: string[]; className?: string }) {
  const pool = useMemo(() => (words.length ? words : ['clarity']), [words])
  const [index, setIndex] = useState(0)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    if (pool.length < 2 || prefersReducedMotion()) return
    const id = window.setInterval(() => {
      setFading(true)
      window.setTimeout(() => {
        setIndex((value) => (value + 1) % pool.length)
        setFading(false)
      }, 380)
    }, 3200)
    return () => window.clearInterval(id)
  }, [pool.length])

  return (
    <span
      className={`inline-block transition duration-[380ms] ${fading ? 'translate-y-1 opacity-0' : 'translate-y-0 opacity-100'} ${className}`}
    >
      {pool[index]}
    </span>
  )
}

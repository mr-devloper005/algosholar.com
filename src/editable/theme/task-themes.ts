import type { CSSProperties } from 'react'
import type { TaskKey } from '@/lib/site-config'

/*
  Crimson Deco task surfaces.

  Every task (archive + detail) shares one identity: a near-black canvas with a
  red under-tone, hairline crimson rules, and a high-contrast display serif.
  Per-task copy (kicker / note) keeps a little voice, and a few tasks shift the
  raised surface slightly so gallery and document pages feel distinct without
  breaking the system. Tokens are delivered as CSS variables (`--tk-*`).
*/

export type TaskTheme = {
  /** short flavour word shown as an eyebrow kicker */
  kicker: string
  /** one-line mood note for the page intro */
  note: string
  dark: boolean
  fontDisplay: string
  fontBody: string
  bg: string
  surface: string
  raised: string
  text: string
  muted: string
  line: string
  accent: string
  accentSoft: string
  onAccent: string
  glow: string
  radius: string
}

const DISPLAY = "'Bodoni Moda', 'Times New Roman', serif"
const BODY = "'Outfit', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif"

const base = {
  dark: true,
  fontDisplay: DISPLAY,
  fontBody: BODY,
  bg: '#0a0206',
  surface: '#16060c',
  raised: '#1f0912',
  text: '#efe6e0',
  muted: '#b39a9d',
  line: 'rgba(225,18,53,0.26)',
  accent: '#e11235',
  accentSoft: 'rgba(225,18,53,0.13)',
  onAccent: '#fff4f5',
  glow: 'rgba(225,18,53,0.22)',
  radius: '0px',
} satisfies Omit<TaskTheme, 'kicker' | 'note'>

export const taskThemes: Record<TaskKey, TaskTheme> = {
  article: { ...base, kicker: 'The Reading Room', note: 'Long-form guides, analysis and field notes worth the time.' },
  listing: { ...base, kicker: 'The Directory', note: 'Verified operators, services and spaces, filed and comparable.' },
  classified: { ...base, kicker: 'The Notice Board', note: 'Fast-moving offers and announcements, posted as they land.' },
  image: { ...base, surface: '#12040a', kicker: 'The Gallery', note: 'A visual index of standout frames and collections.' },
  sbm: { ...base, kicker: 'The Shelf', note: 'Curated links and references kept close at hand.' },
  pdf: { ...base, raised: '#1b080f', kicker: 'The Archive', note: 'Downloadable reports, guides and reference material.' },
  profile: { ...base, kicker: 'The Register', note: 'People, studios and operators behind the work.' },
}

export function getTaskTheme(task: TaskKey): TaskTheme {
  return taskThemes[task] || taskThemes.article
}

/** All `--tk-*` tokens + font overrides for a task surface, ready for `style`. */
export function taskThemeStyle(task: TaskKey): CSSProperties {
  const t = getTaskTheme(task)
  return {
    '--tk-bg': t.bg,
    '--tk-surface': t.surface,
    '--tk-raised': t.raised,
    '--tk-text': t.text,
    '--tk-muted': t.muted,
    '--tk-line': t.line,
    '--tk-accent': t.accent,
    '--tk-accent-soft': t.accentSoft,
    '--tk-on-accent': t.onAccent,
    '--tk-glow': t.glow,
    '--tk-radius': t.radius,
    // Re-point the shared article-body accent vars so post HTML (headings,
    // links) inherits this task's accent instead of the global site accent.
    '--slot4-accent': t.accent,
    '--slot4-accent-fill': t.accent,
    '--editable-font-display': t.fontDisplay,
    '--editable-font-body': t.fontBody,
    fontFamily: t.fontBody,
  } as CSSProperties
}

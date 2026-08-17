import type { CSSProperties } from 'react'

/*
  "Crimson Deco" design contract.

  A dark, high-contrast editorial system: near-black canvas with a red under-tone,
  a single vivid crimson accent, hairline ornamental frames, and a high-contrast
  display serif. Everything visual is driven by the CSS variables below, so the
  whole site re-skins from this one object.
*/

export const editableRootStyle = {
  '--slot4-page-bg': '#0a0206',
  '--slot4-page-text': '#efe6e0',
  '--slot4-panel-bg': '#12040a',
  '--slot4-surface-bg': '#16060c',
  '--slot4-raised-bg': '#1f0912',
  '--slot4-muted-text': '#b39a9d',
  '--slot4-soft-muted-text': '#8a6f74',
  '--slot4-accent': '#e11235',
  '--slot4-accent-fill': '#e11235',
  '--slot4-accent-bright': '#ff3b5c',
  '--slot4-accent-deep': '#7d0a1e',
  '--slot4-accent-soft': 'rgba(225,18,53,0.13)',
  '--slot4-on-accent': '#fff4f5',
  '--slot4-line': 'rgba(225,18,53,0.30)',
  '--slot4-line-faint': 'rgba(225,18,53,0.14)',
  '--slot4-dark-bg': '#080104',
  '--slot4-dark-text': '#f6efec',
  '--slot4-media-bg': '#1a070d',
  '--slot4-cream': '#16060c',
  '--slot4-warm': '#12040a',
  '--slot4-lavender': '#16060c',
  '--slot4-gray': '#12040a',
  '--slot4-body-gradient':
    'radial-gradient(90% 55% at 50% 0%, rgba(125,10,30,0.30), transparent 60%), linear-gradient(180deg, #0d0308 0%, #0a0206 45%, #080104 100%)',
  '--editable-page-bg': '#0a0206',
  '--editable-page-text': '#efe6e0',
  '--editable-container': '1360px',
  '--editable-border': 'rgba(225,18,53,0.24)',
  '--editable-nav-bg': 'rgba(9,2,6,0.86)',
  '--editable-nav-text': '#efe6e0',
  '--editable-nav-active': '#e11235',
  '--editable-nav-active-text': '#fff4f5',
  '--editable-cta-bg': '#e11235',
  '--editable-cta-text': '#fff4f5',
  '--editable-search-bg': 'rgba(255,255,255,0.03)',
  '--editable-footer-bg': '#080104',
  '--editable-footer-text': '#efe6e0',
} as CSSProperties

export const editablePalette = {
  pageBg: 'bg-[var(--slot4-page-bg)]',
  pageText: 'text-[var(--slot4-page-text)]',
  panelBg: 'bg-[var(--slot4-panel-bg)]',
  panelText: 'text-[var(--slot4-page-text)]',
  surfaceBg: 'bg-[var(--slot4-surface-bg)]',
  surfaceText: 'text-[var(--slot4-page-text)]',
  raisedBg: 'bg-[var(--slot4-raised-bg)]',
  mutedText: 'text-[var(--slot4-muted-text)]',
  softMutedText: 'text-[var(--slot4-soft-muted-text)]',
  accentText: 'text-[var(--slot4-accent)]',
  accentBg: 'bg-[var(--slot4-accent-fill)]',
  accentSoftBg: 'bg-[var(--slot4-accent-soft)]',
  accentSoftText: 'text-[var(--slot4-accent-bright)]',
  onAccentText: 'text-[var(--slot4-on-accent)]',
  darkBg: 'bg-[var(--slot4-dark-bg)]',
  darkText: 'text-[var(--slot4-dark-text)]',
  mediaBg: 'bg-[var(--slot4-media-bg)]',
  creamBg: 'bg-[var(--slot4-cream)]',
  warmBg: 'bg-[var(--slot4-warm)]',
  lavenderBg: 'bg-[var(--slot4-lavender)]',
  grayBg: 'bg-[var(--slot4-gray)]',
  border: 'border-[var(--slot4-line)]',
  faintBorder: 'border-[var(--slot4-line-faint)]',
  darkBorder: 'border-white/10',
  shadow: 'shadow-[0_18px_50px_rgba(0,0,0,0.55)]',
  shadowStrong: 'shadow-[0_30px_90px_rgba(0,0,0,0.7)]',
  overlay: 'bg-[linear-gradient(180deg,rgba(8,1,4,0.05),rgba(8,1,4,0.92))]',
} as const

export const editableDesignContract = {
  shell: {
    page: `min-h-screen ${editablePalette.pageBg} ${editablePalette.pageText}`,
    section: 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8',
    sectionY: 'py-16 sm:py-20 lg:py-24',
  },
  layout: {
    safeGrid: 'grid gap-6 md:grid-cols-2 xl:grid-cols-3',
    featureGrid: 'grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center',
    rail: 'flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
    minRailCard: 'w-[268px] shrink-0 snap-start sm:w-[310px]',
  },
  type: {
    eyebrow: 'deco-label text-[var(--slot4-accent)]',
    heroTitle: 'text-[2.75rem] font-semibold leading-[0.94] tracking-[-0.02em] sm:text-6xl lg:text-[4.5rem]',
    sectionTitle: 'text-3xl font-semibold leading-[1.05] tracking-[-0.02em] sm:text-[2.6rem]',
    body: 'text-base leading-[1.85]',
  },
  surface: {
    card: `border ${editablePalette.border} ${editablePalette.surfaceBg} ${editablePalette.shadow}`,
    soft: `border ${editablePalette.faintBorder} ${editablePalette.panelBg}`,
    dark: `${editablePalette.darkBg} ${editablePalette.darkText} border ${editablePalette.border} ${editablePalette.shadowStrong}`,
  },
  button: {
    primary:
      'inline-flex items-center justify-center gap-2.5 rounded-full bg-[var(--slot4-accent-fill)] px-7 py-3.5 deco-label text-[var(--slot4-on-accent)] shadow-[0_0_32px_rgba(225,18,53,0.35)] transition duration-500 hover:shadow-[0_0_46px_rgba(225,18,53,0.6)] hover:brightness-110 active:scale-[0.98]',
    secondary:
      'inline-flex items-center justify-center gap-2.5 rounded-full border border-[var(--slot4-line)] bg-transparent px-7 py-3.5 deco-label text-[var(--slot4-page-text)] transition duration-500 hover:border-[var(--slot4-accent)] hover:bg-[var(--slot4-accent-soft)] active:scale-[0.98]',
    accent:
      'inline-flex items-center justify-center gap-2.5 rounded-full bg-[var(--slot4-accent-soft)] px-7 py-3.5 deco-label text-[var(--slot4-accent-bright)] transition duration-500 hover:bg-[var(--slot4-accent-fill)] hover:text-[var(--slot4-on-accent)] active:scale-[0.98]',
    ghost:
      'inline-flex items-center gap-2 deco-label text-[var(--slot4-muted-text)] transition duration-500 hover:text-[var(--slot4-accent)]',
  },
  media: {
    frame: `relative overflow-hidden ${editablePalette.mediaBg}`,
    ratio: 'aspect-[4/5]',
  },
  motion: {
    lift: 'deco-lift',
    fade: 'transition duration-500 hover:opacity-85',
    zoom: 'transition duration-[900ms] group-hover:scale-[1.06]',
  },
} as const

/** I, II, III … used for the deco numeral tabs on cards and sections. */
export function toRomanNumeral(value: number): string {
  const table: Array<[number, string]> = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ]
  let n = Math.max(1, Math.floor(value || 1))
  let out = ''
  for (const [num, sym] of table) {
    while (n >= num) {
      out += sym
      n -= num
    }
  }
  return out
}

export const aiLayoutRules = [
  'Change the full site color palette in editableRootStyle first; all sections consume those CSS variables.',
  'Keep page structure in src/editable/sections/HomeSections.tsx so the whole home experience can be redesigned in one file.',
  'Cards must vary: featured, compact, horizontal, editorial list, and image-first variants all exist in cards/PostCards.tsx.',
  'Use the deco-frame / deco-corners / deco-rule primitives from editable-global.css instead of inventing new borders.',
  'Keep dynamic post fetching intact; do not replace posts with mock arrays.',
  'Use postHref() for all post links so task-specific routes keep working.',
] as const

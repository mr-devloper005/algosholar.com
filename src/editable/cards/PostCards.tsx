import Link from 'next/link'
import { ArrowUpRight, Clock3 } from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { TaskKey } from '@/lib/site-config'
import { editableDesignContract as dc, editablePalette as pal, toRomanNumeral } from '@/editable/layouts/design-contract'

export function getEditablePostImage(post?: SitePost | null) {
  const media = Array.isArray(post?.media) ? post?.media : []
  const mediaUrl = media.find((item) => typeof item?.url === 'string' && item.url)?.url
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const images = Array.isArray(content.images) ? content.images : []
  const contentImage = images.find((url): url is string => typeof url === 'string' && Boolean(url))
  const logo = typeof content.logo === 'string' ? content.logo : ''
  return mediaUrl || contentImage || logo || '/placeholder.svg?height=900&width=1400'
}

// Reduce any content payload — rich HTML, entity-encoded HTML, or already-plain text — to
// a clean plain-text card summary. Card excerpts must never show raw markup regardless of
// what the content API sends. Two tag-strip passes (before + after entity decode) also catch
// entity-encoded markup like &lt;p&gt;.
export function toPlainText(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getEditableExcerpt(post?: SitePost | null, limit = 150) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const raw =
    (typeof content.description === 'string' && content.description) ||
    (typeof content.summary === 'string' && content.summary) ||
    (typeof post?.summary === 'string' && post.summary) ||
    (typeof content.body === 'string' && content.body) ||
    (typeof content.excerpt === 'string' && content.excerpt) ||
    ''
  const clean = toPlainText(raw)
  return clean.length > limit ? `${clean.slice(0, limit).trim()}...` : clean
}

export function getEditableCategory(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  return (typeof content.category === 'string' && content.category) || post?.tags?.[0] || 'Featured'
}

export function postHref(task: TaskKey, post: SitePost, route = `/${task}`) {
  return `${route}/${post.slug}`
}

/** Rough reading time from whatever text the post carries. Always ≥ 1 min. */
export function getEditableReadTime(post?: SitePost | null) {
  const content = post?.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
  const source = toPlainText(
    (typeof content.body === 'string' && content.body) ||
    (typeof content.description === 'string' && content.description) ||
    (typeof post?.summary === 'string' && post.summary) ||
    '',
  )
  const words = source ? source.split(/\s+/).length : 0
  return Math.max(1, Math.round(words / 210))
}

/** Lower-cased haystack used by the client-side instant filter. */
export function getEditableFilterKey(post?: SitePost | null) {
  return [post?.title, getEditableCategory(post), getEditableExcerpt(post, 200), (post?.tags || []).join(' ')]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
}

/* ------------------------------------------------------------------ *
   Shared ornaments
 * ------------------------------------------------------------------ */

/** Roman-numeral tab that sits on a card's top edge. */
export function DecoNumeralTab({ index, label }: { index: number; label?: string }) {
  return (
    <span className="absolute -top-px left-1/2 z-10 -translate-x-1/2">
      <span className="flex min-w-[54px] items-center justify-center border border-[var(--slot4-line)] border-t-0 bg-[var(--slot4-page-bg)] px-3 py-1.5 editable-display text-xs uppercase tracking-[0.24em] text-[var(--slot4-accent)]">
        {label || toRomanNumeral(index + 1)}
      </span>
    </span>
  )
}

function CategoryChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center border border-[var(--slot4-line-faint)] bg-[var(--slot4-accent-soft)] px-3 py-1 deco-label deco-label-sm text-[var(--slot4-accent-bright)]">
      {children}
    </span>
  )
}

function ReadCue({ label = 'Read' }: { label?: string }) {
  return (
    <span className="inline-flex items-center gap-2 deco-label deco-label-sm text-[var(--slot4-accent)]">
      {label}
      <ArrowUpRight className="h-3.5 w-3.5 transition duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </span>
  )
}

/* ------------------------------------------------------------------ *
   1 — Featured card: full-bleed image, framed, numeral tab
 * ------------------------------------------------------------------ */
export function EditorialFeatureCard({ post, href, label = 'Featured read' }: { post: SitePost; href: string; label?: string }) {
  return (
    <Link
      href={href}
      data-filter-key={getEditableFilterKey(post)}
      className={`group deco-frame deco-corners deco-sweep relative block min-w-0 overflow-hidden ${pal.darkBg} ${dc.motion.lift}`}
    >
      <div className="relative min-h-[480px] p-8 sm:p-10 lg:min-h-[600px] lg:p-12">
        <img
          src={getEditablePostImage(post)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-40 grayscale-[35%] transition duration-[1200ms] group-hover:scale-105 group-hover:opacity-55 group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-[linear-gradient(175deg,rgba(8,1,4,0.35),rgba(8,1,4,0.72)_45%,rgba(8,1,4,0.96))]" />
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_100%,rgba(225,18,53,0.28),transparent_65%)]" />
        <span className="deco-sweep-beam" />

        <div className="relative z-10 flex h-full min-h-[420px] flex-col justify-end lg:min-h-[540px]">
          <span className={`${dc.type.eyebrow}`}>{label}</span>
          <div className="deco-rule mt-5 max-w-[180px]">
            <span className="deco-diamond" />
          </div>
          <h3 className="editable-display mt-6 max-w-3xl text-4xl font-semibold leading-[0.98] tracking-[-0.02em] text-white sm:text-5xl lg:text-6xl">
            {post.title}
          </h3>
          <p className="mt-6 max-w-2xl text-[15px] leading-8 text-white/70 sm:text-base">{getEditableExcerpt(post, 190)}</p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <CategoryChip>{getEditableCategory(post)}</CategoryChip>
            <span className="inline-flex items-center gap-2 deco-label deco-label-sm text-white/55">
              <Clock3 className="h-3.5 w-3.5" /> {getEditableReadTime(post)} min
            </span>
            <ReadCue label="Open story" />
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------ *
   2 — Rail card: portrait poster with numeral tab (used in scrollers)
 * ------------------------------------------------------------------ */
export function RailPostCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link
      href={href}
      data-filter-key={getEditableFilterKey(post)}
      className={`group ${dc.layout.minRailCard} deco-frame deco-corners relative block overflow-hidden ${pal.surfaceBg} ${dc.motion.lift}`}
    >
      <DecoNumeralTab index={index} />
      <div className={`${dc.media.frame} ${dc.media.ratio} mt-0`}>
        <img
          src={getEditablePostImage(post)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-[900ms] group-hover:scale-[1.06] group-hover:opacity-95"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,2,6,0.55),rgba(10,2,6,0.15)_45%,rgba(10,2,6,0.9))]" />
      </div>
      <div className="p-6">
        <p className={`${dc.type.eyebrow} truncate`}>{getEditableCategory(post)}</p>
        <h3 className="editable-display mt-3 line-clamp-3 text-[1.6rem] font-semibold leading-[1.08] tracking-[-0.02em]">{post.title}</h3>
        <p className={`mt-3 line-clamp-3 text-sm leading-7 ${pal.mutedText}`}>{getEditableExcerpt(post, 120)}</p>
        <div className="mt-6 border-t border-[var(--slot4-line-faint)] pt-4">
          <ReadCue />
        </div>
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------ *
   3 — Compact card: numeral + title only, dense index blocks
 * ------------------------------------------------------------------ */
export function CompactIndexCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link
      href={href}
      data-filter-key={getEditableFilterKey(post)}
      className={`group relative block min-w-0 border ${pal.faintBorder} ${pal.panelBg} p-6 transition duration-500 hover:border-[var(--slot4-accent)] hover:bg-[var(--slot4-surface-bg)]`}
    >
      <div className="flex items-start gap-5">
        <span className="editable-display shrink-0 text-2xl leading-none text-[var(--slot4-accent)] opacity-70 transition duration-500 group-hover:opacity-100">
          {toRomanNumeral(index + 1)}
        </span>
        <div className="min-w-0">
          <p className={`flex items-center gap-2 deco-label deco-label-sm ${pal.softMutedText}`}>
            <Clock3 className="h-3 w-3" /> {getEditableReadTime(post)} min · {getEditableCategory(post)}
          </p>
          <h3 className="editable-display mt-2.5 line-clamp-2 text-xl font-semibold leading-[1.15] tracking-[-0.01em] transition duration-500 group-hover:text-[var(--slot4-accent)]">
            {post.title}
          </h3>
          <p className={`mt-2.5 line-clamp-2 text-sm leading-6 ${pal.softMutedText}`}>{getEditableExcerpt(post, 100)}</p>
        </div>
      </div>
      <span className="absolute bottom-0 left-0 h-px w-0 bg-[var(--slot4-accent)] transition-all duration-700 group-hover:w-full" />
    </Link>
  )
}

/* ------------------------------------------------------------------ *
   4 — Horizontal record card: image left, meta right
 * ------------------------------------------------------------------ */
export function ArticleListCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link
      href={href}
      data-filter-key={getEditableFilterKey(post)}
      className={`group grid min-w-0 gap-0 overflow-hidden border ${pal.border} ${pal.surfaceBg} ${dc.motion.lift} sm:grid-cols-[260px_minmax(0,1fr)]`}
    >
      <div className={`${dc.media.frame} aspect-[16/11] sm:aspect-auto sm:min-h-[230px]`}>
        <img
          src={getEditablePostImage(post)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-75 transition duration-[900ms] group-hover:scale-[1.05] group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,2,6,0.2),rgba(10,2,6,0.75))] sm:bg-[linear-gradient(90deg,rgba(10,2,6,0.1),rgba(10,2,6,0.6))]" />
        <span className="absolute left-4 top-4 editable-display text-lg text-[var(--slot4-accent)] drop-shadow-[0_0_12px_rgba(225,18,53,0.7)]">
          {toRomanNumeral(index + 1)}
        </span>
      </div>
      <div className="min-w-0 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <CategoryChip>{getEditableCategory(post)}</CategoryChip>
          <span className={`deco-label deco-label-sm ${pal.softMutedText}`}>{getEditableReadTime(post)} min read</span>
        </div>
        <h2 className="editable-display mt-4 line-clamp-3 text-2xl font-semibold leading-[1.1] tracking-[-0.02em] transition duration-500 group-hover:text-[var(--slot4-accent)] sm:text-3xl">
          {post.title}
        </h2>
        <p className={`mt-4 line-clamp-3 text-sm leading-7 ${pal.mutedText}`}>{getEditableExcerpt(post, 190)}</p>
        <div className="mt-6 flex items-center gap-4 border-t border-[var(--slot4-line-faint)] pt-5">
          <ReadCue label="Open record" />
        </div>
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------ *
   5 — Image-first card: media dominant, text as overlay caption
 * ------------------------------------------------------------------ */
export function ImageFirstCard({ post, href, tall = false }: { post: SitePost; href: string; tall?: boolean }) {
  return (
    <Link
      href={href}
      data-filter-key={getEditableFilterKey(post)}
      className={`group deco-frame relative block overflow-hidden ${pal.mediaBg} ${dc.motion.lift}`}
    >
      <div className={`relative ${tall ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img
          src={getEditablePostImage(post)}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-[1100ms] group-hover:scale-[1.07] group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_35%,rgba(8,1,4,0.92))]" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <p className={`${dc.type.eyebrow} truncate`}>{getEditableCategory(post)}</p>
          <h3 className="editable-display mt-2.5 line-clamp-2 text-xl font-semibold leading-[1.12] tracking-[-0.01em] text-white sm:text-2xl">
            {post.title}
          </h3>
          <span className="mt-4 inline-flex items-center gap-2 deco-label deco-label-sm text-white/60 transition duration-500 group-hover:text-[var(--slot4-accent-bright)]">
            View <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/* ------------------------------------------------------------------ *
   6 — Editorial list row: typographic, no media
 * ------------------------------------------------------------------ */
export function EditorialListRow({ post, href, index }: { post: SitePost; href: string; index: number }) {
  return (
    <Link
      href={href}
      data-filter-key={getEditableFilterKey(post)}
      className="group grid min-w-0 grid-cols-[auto_minmax(0,1fr)] items-baseline gap-5 border-b border-[var(--slot4-line-faint)] py-6 transition duration-500 hover:border-[var(--slot4-accent)] sm:grid-cols-[80px_minmax(0,1fr)_auto] sm:gap-8"
    >
      <span className="editable-display text-lg text-[var(--slot4-accent)] opacity-60 transition duration-500 group-hover:opacity-100 sm:text-2xl">
        {toRomanNumeral(index + 1)}
      </span>
      <div className="min-w-0">
        <h3 className="editable-display line-clamp-2 text-xl font-semibold leading-[1.15] tracking-[-0.01em] transition duration-500 group-hover:translate-x-1 group-hover:text-[var(--slot4-accent)] sm:text-2xl">
          {post.title}
        </h3>
        <p className={`mt-2 line-clamp-2 text-sm leading-6 ${pal.softMutedText}`}>{getEditableExcerpt(post, 130)}</p>
        <p className={`mt-3 deco-label deco-label-sm ${pal.softMutedText} sm:hidden`}>{getEditableCategory(post)}</p>
      </div>
      <span className="hidden shrink-0 items-center gap-2 deco-label deco-label-sm text-[var(--slot4-muted-text)] transition duration-500 group-hover:text-[var(--slot4-accent)] sm:inline-flex">
        {getEditableCategory(post)}
        <ArrowUpRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  )
}

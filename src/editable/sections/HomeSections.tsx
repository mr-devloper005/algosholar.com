import Link from 'next/link'
import {
  ArrowRight, ArrowUpRight, Bookmark, Building2, Compass, FileText, Image as ImageIcon,
  Layers, Megaphone, Search, UserRound,
} from 'lucide-react'
import type { SitePost } from '@/lib/site-connector'
import type { HomeTimeSection } from '@/lib/task-data'
import type { TaskKey } from '@/lib/site-config'
import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import {
  ArticleListCard, CompactIndexCard, EditorialFeatureCard, EditorialListRow, ImageFirstCard,
  RailPostCard, getEditableCategory, getEditableExcerpt, getEditablePostImage, getEditableReadTime, postHref,
} from '@/editable/cards/PostCards'
import { toRomanNumeral } from '@/editable/layouts/design-contract'
import { EditableHeroCollage } from '@/editable/sections/EditableHeroCollage'
import { EditableRotatingWord } from '@/editable/components/EditableMotion'

type HomeSectionProps = {
  primaryTask: TaskKey
  primaryRoute: string
  posts: SitePost[]
  timeSections: HomeTimeSection[]
}

const container = 'mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8'

const taskIcon: Record<TaskKey, typeof FileText> = {
  article: FileText,
  listing: Building2,
  classified: Megaphone,
  image: ImageIcon,
  sbm: Bookmark,
  pdf: Layers,
  profile: UserRound,
}

function taskLabel(task: TaskKey) {
  return SITE_CONFIG.tasks.find((item) => item.key === task)?.label || task
}

// Merge the primary feed with the time-window feeds so home always has content,
// even when one source comes back empty for this site.
function dedupePosts(posts: SitePost[]) {
  const seen = new Set<string>()
  const out: SitePost[] = []
  for (const post of posts) {
    const key = post.slug || post.id || post.title
    if (!key || seen.has(key)) continue
    seen.add(key)
    out.push(post)
  }
  return out
}

// Latest posts' real images (newest first, deduped, placeholders dropped).
function latestPostImages(posts: SitePost[], max = 8) {
  const seen = new Set<string>()
  const out: string[] = []
  for (const post of posts) {
    const img = getEditablePostImage(post)
    if (!img || img.includes('placeholder') || seen.has(img)) continue
    seen.add(img)
    out.push(img)
    if (out.length >= max) break
  }
  return out
}

/** Distinct category names pulled from real post data. */
function topicsOf(posts: SitePost[], max = 10) {
  const seen = new Map<string, number>()
  for (const post of posts) {
    const label = (getEditableCategory(post) || '').trim()
    if (!label) continue
    seen.set(label, (seen.get(label) || 0) + 1)
  }
  return Array.from(seen.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([label, count]) => ({ label, count }))
}

function SectionHead({
  eyebrow,
  title,
  description,
  href,
  linkLabel = 'View all',
  align = 'left',
}: {
  eyebrow: string
  title: string
  description?: string
  href?: string
  linkLabel?: string
  align?: 'left' | 'center'
}) {
  const centred = align === 'center'
  return (
    <div className={`deco-reveal flex flex-col gap-6 ${centred ? 'items-center text-center' : 'sm:flex-row sm:items-end sm:justify-between'}`}>
      <div className={centred ? 'max-w-2xl' : 'max-w-2xl'}>
        <p className="deco-label text-[var(--slot4-accent)]">{eyebrow}</p>
        <div className={`deco-rule mt-4 ${centred ? 'mx-auto max-w-[240px]' : 'max-w-[200px]'}`}>
          <span className="deco-diamond" />
        </div>
        <h2 className="editable-display mt-5 text-3xl font-semibold leading-[1.04] tracking-[-0.02em] sm:text-[2.7rem]">{title}</h2>
        {description ? <p className="mt-4 text-[15px] leading-8 text-[var(--slot4-muted-text)]">{description}</p> : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-2 border border-[var(--slot4-line)] px-5 py-3 deco-label deco-label-sm text-[var(--slot4-page-text)] transition duration-500 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
        >
          {linkLabel}
          <ArrowUpRight className="h-3.5 w-3.5 transition duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ *
   Hero — the framed title card
 * ------------------------------------------------------------------ */
export function EditableHomeHero({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const heroImages = latestPostImages(pool)
  const heroTitle = pagesContent.home.hero.title?.join(' ') || `Inside ${SITE_CONFIG.name}`
  const sections = SITE_CONFIG.tasks.filter((task) => task.enabled).slice(0, 6)
  const marquee = pool.slice(0, 10).map((post) => post.title).filter(Boolean)
  const preview = pool.slice(0, 3)

  return (
    <section className="relative px-3 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-10 lg:px-8">
      {/* Framed stage */}
      <div className="deco-frame deco-corners relative mx-auto w-full max-w-[var(--editable-container)] overflow-hidden bg-[var(--slot4-dark-bg)]">
        <div className="absolute inset-0 opacity-[0.30]">
          <EditableHeroCollage images={heroImages} />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_0%,rgba(125,10,30,0.45),transparent_62%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,1,4,0.72),rgba(8,1,4,0.86)_55%,rgba(8,1,4,0.97))]" />

        <div className="relative flex flex-col items-center px-5 py-16 text-center sm:px-10 sm:py-24 lg:py-28">
          <p className="deco-label text-[var(--slot4-accent)] deco-flicker">
            {pagesContent.home.hero.badge || `${SITE_CONFIG.name} presents`}
          </p>

          <h1 className="editable-display deco-glow mt-8 max-w-5xl text-balance text-[2.5rem] font-semibold uppercase leading-[0.9] tracking-[-0.01em] text-[var(--slot4-accent)] sm:text-6xl lg:text-[5.2rem]">
            {heroTitle}
          </h1>

          <div className="deco-rule mt-9 w-full max-w-md">
            <span className="deco-diamond" />
          </div>

          <p className="mt-8 max-w-2xl text-base leading-8 text-[var(--slot4-page-text)]/78 sm:text-lg">
            {pagesContent.home.hero.description}
          </p>

          <p className="mt-5 deco-label deco-label-sm text-[var(--slot4-muted-text)]">
            Built for{' '}
            <EditableRotatingWord
              words={['owners', 'operators', 'founders', 'teams']}
              className="text-[var(--slot4-accent-bright)]"
            />
          </p>

          {/* Search */}
          <form action="/search" className="mt-10 flex w-full max-w-2xl flex-col gap-3 sm:flex-row">
            <label className="flex min-w-0 flex-1 items-center gap-3 border border-[var(--slot4-line)] bg-[var(--slot4-surface-bg)]/70 px-5 py-4 backdrop-blur-sm transition focus-within:border-[var(--slot4-accent)] focus-within:shadow-[0_0_30px_rgba(225,18,53,0.22)]">
              <Search className="h-4.5 w-4.5 shrink-0 text-[var(--slot4-accent)]" />
              <input
                name="q"
                placeholder={pagesContent.home.hero.searchPlaceholder}
                className="min-w-0 flex-1 bg-transparent text-sm outline-none sm:text-base"
                aria-label="Search this site"
              />
            </label>
            <button className="shrink-0 bg-[var(--slot4-accent)] px-8 py-4 deco-label text-[var(--editable-cta-text)] shadow-[0_0_34px_rgba(225,18,53,0.4)] transition duration-500 hover:brightness-110">
              Search
            </button>
          </form>

          {/* Section chips */}
          {sections.length ? (
            <div className="mt-8 flex flex-wrap justify-center gap-2.5">
              {sections.map((task) => {
                const Icon = taskIcon[task.key as TaskKey] || FileText
                return (
                  <Link
                    key={task.key}
                    href={task.route}
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--slot4-line-faint)] px-4 py-2 deco-label deco-label-sm text-[var(--slot4-muted-text)] transition duration-500 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
                  >
                    <Icon className="h-3.5 w-3.5" /> {task.label}
                  </Link>
                )
              })}
            </div>
          ) : null}
        </div>

        {/* Preview cards peeking from the bottom edge, like the title-card deck */}
        {preview.length ? (
          <div className="relative grid gap-px border-t border-[var(--slot4-line-faint)] bg-[var(--slot4-line-faint)] sm:grid-cols-3">
            {preview.map((post, index) => (
              <Link
                key={post.id || post.slug}
                href={postHref(primaryTask, post, primaryRoute)}
                className="group flex min-w-0 items-start gap-4 bg-[var(--slot4-dark-bg)] px-6 py-6 transition duration-500 hover:bg-[var(--slot4-surface-bg)]"
              >
                <span className="editable-display shrink-0 text-xl text-[var(--slot4-accent)] opacity-70 transition group-hover:opacity-100">
                  {toRomanNumeral(index + 1)}
                </span>
                <span className="min-w-0">
                  <span className="block deco-label deco-label-sm text-[var(--slot4-soft-muted-text)]">{getEditableCategory(post)}</span>
                  <span className="editable-display mt-2 block line-clamp-2 text-base font-semibold leading-snug transition duration-500 group-hover:text-[var(--slot4-accent)]">
                    {post.title}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      {/* Running headline ticker */}
      {marquee.length ? (
        <div className="deco-marquee mx-auto mt-8 w-full max-w-[var(--editable-container)] overflow-hidden border-y border-[var(--slot4-line-faint)] py-3.5">
          <div className="deco-marquee-track">
            {[...marquee, ...marquee].map((title, index) => (
              <span key={`${title}-${index}`} className="inline-flex items-center gap-10 deco-label deco-label-sm text-[var(--slot4-soft-muted-text)]">
                <span className="deco-diamond opacity-60" />
                <span className="max-w-[420px] truncate">{title}</span>
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mx-auto mt-8 w-full max-w-[var(--editable-container)] border-y border-[var(--slot4-line-faint)] py-3.5 text-center deco-label deco-label-sm text-[var(--slot4-soft-muted-text)]">
          {taskLabel(primaryTask)} · Updated continuously
        </div>
      )}
    </section>
  )
}

/* ------------------------------------------------------------------ *
   Lead story + index rail
 * ------------------------------------------------------------------ */
export function EditableStoryRail({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  if (!pool.length) return null

  const lead = pool[0]
  const index = pool.slice(1, 6)

  return (
    <section className="relative py-16 sm:py-20">
      <div className={container}>
        <SectionHead
          eyebrow="The lead"
          title="What is worth your attention right now"
          description="One story out front, with the running index beside it. Everything here comes from the newest published posts."
          href={primaryRoute}
          linkLabel={`All ${taskLabel(primaryTask).toLowerCase()}`}
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[1.35fr_minmax(0,1fr)]">
          <div className="deco-reveal min-w-0">
            <EditorialFeatureCard post={lead} href={postHref(primaryTask, lead, primaryRoute)} label="Lead story" />
          </div>

          {index.length ? (
            <div className="deco-reveal min-w-0" data-reveal-delay="120">
              <div className="flex items-center justify-between border-b border-[var(--slot4-line)] pb-4">
                <p className="deco-label text-[var(--slot4-accent)]">The index</p>
                <span className="deco-label deco-label-sm text-[var(--slot4-soft-muted-text)]">{index.length} entries</span>
              </div>
              <div className="mt-2 grid">
                {index.map((post, i) => (
                  <EditorialListRow key={post.id || post.slug} post={post} href={postHref(primaryTask, post, primaryRoute)} index={i + 1} />
                ))}
              </div>
              <Link
                href={primaryRoute}
                className="group mt-7 inline-flex items-center gap-2 deco-label deco-label-sm text-[var(--slot4-accent)]"
              >
                Continue the index <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ *
   Topic blocks + section directory
 * ------------------------------------------------------------------ */
export function EditableMagazineSplit({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  const pool = dedupePosts([...posts, ...timeSections.flatMap((section) => section.posts)])
  const topics = topicsOf(pool)
  const sections = SITE_CONFIG.tasks.filter((task) => task.enabled)
  const gallery = pool.slice(6, 12)
  if (!pool.length) return null

  return (
    <>
      {/* Section directory */}
      <section className="relative border-y border-[var(--slot4-line-faint)] bg-[var(--slot4-panel-bg)] py-16 sm:py-20">
        <div className={container}>
          <SectionHead
            eyebrow="The directory"
            title="Choose a room and start reading"
            description="Each section keeps its own rhythm — long reads, verified records, and reference material, filed where you expect to find them."
            align="center"
          />

          <div className="mt-12 grid gap-px bg-[var(--slot4-line-faint)] sm:grid-cols-2 lg:grid-cols-3">
            {sections.map((task, index) => {
              const Icon = taskIcon[task.key as TaskKey] || FileText
              return (
                <Link
                  key={task.key}
                  href={task.route}
                  data-reveal-delay={index * 70}
                  className="deco-reveal group relative flex min-w-0 flex-col bg-[var(--slot4-page-bg)] p-8 transition duration-500 hover:bg-[var(--slot4-surface-bg)]"
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center border border-[var(--slot4-line)] text-[var(--slot4-accent)] transition duration-500 group-hover:bg-[var(--slot4-accent-soft)] group-hover:shadow-[0_0_26px_rgba(225,18,53,0.3)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="editable-display text-lg text-[var(--slot4-accent)] opacity-45 transition group-hover:opacity-90">
                      {toRomanNumeral(index + 1)}
                    </span>
                  </div>
                  <h3 className="editable-display mt-7 text-2xl font-semibold tracking-[-0.01em] transition duration-500 group-hover:text-[var(--slot4-accent)]">
                    {task.label}
                  </h3>
                  <p className="mt-3 flex-1 text-sm leading-7 text-[var(--slot4-muted-text)]">{task.description}</p>
                  <span className="mt-6 inline-flex items-center gap-2 deco-label deco-label-sm text-[var(--slot4-accent)]">
                    Enter <ArrowUpRight className="h-3.5 w-3.5 transition duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </span>
                  <span className="absolute inset-x-0 bottom-0 h-px w-0 bg-[var(--slot4-accent)] transition-all duration-700 group-hover:w-full" />
                </Link>
              )
            })}
          </div>

          {topics.length ? (
            <div className="deco-reveal mt-12 flex flex-wrap items-center justify-center gap-2.5">
              <span className="deco-label deco-label-sm text-[var(--slot4-soft-muted-text)]">Topics</span>
              {topics.map((topic) => (
                <Link
                  key={topic.label}
                  href={`/search?q=${encodeURIComponent(topic.label)}`}
                  className="group inline-flex items-center gap-2 border border-[var(--slot4-line-faint)] px-4 py-2 text-sm text-[var(--slot4-muted-text)] transition duration-500 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
                >
                  {topic.label}
                  <span className="deco-label deco-label-sm opacity-50 group-hover:opacity-100">{String(topic.count).padStart(2, '0')}</span>
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* Image-first discovery band */}
      {gallery.length ? (
        <section className="relative py-16 sm:py-20">
          <div className={container}>
            <SectionHead
              eyebrow="In pictures"
              title="A visual pass through the archive"
              description="The same posts, read through their imagery — useful when you would rather browse than search."
              href={primaryRoute}
              linkLabel="Browse all"
            />
            <div className="deco-reveal mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((post, index) => (
                <ImageFirstCard
                  key={post.id || post.slug}
                  post={post}
                  href={postHref(primaryTask, post, primaryRoute)}
                  tall={index % 5 === 0}
                />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}

/* ------------------------------------------------------------------ *
   Time-window collections — alternating layouts
 * ------------------------------------------------------------------ */
const sectionCopy: Record<string, { eyebrow: string; title: string; description: string }> = {
  spotlight: {
    eyebrow: 'This week',
    title: 'Filed in the last seven days',
    description: 'The freshest entries, straight off the press.',
  },
  browse: {
    eyebrow: 'This month',
    title: 'Reading widely this month',
    description: 'Posts that have been drawing the most attention lately.',
  },
  index: {
    eyebrow: 'From the archive',
    title: 'Older, and still worth it',
    description: 'Evergreen material that holds up long after publication.',
  },
}

export function EditableTimeCollections({ primaryTask, primaryRoute, posts, timeSections }: HomeSectionProps) {
  // Use the real time windows; fall back to slicing posts so the page stays full.
  const sections =
    timeSections.length > 0
      ? timeSections
      : ([
          { key: 'spotlight', posts: posts.slice(0, 8), href: primaryRoute },
          { key: 'browse', posts: posts.slice(8, 16), href: primaryRoute },
          { key: 'index', posts: posts.slice(16, 24), href: primaryRoute },
        ] as Pick<HomeTimeSection, 'key' | 'posts' | 'href'>[])

  const visible = sections.filter((section) => section.posts.length)
  if (!visible.length) return null

  return (
    <>
      {visible.map((section, index) => {
        const copy = sectionCopy[section.key] || {
          eyebrow: 'More',
          title: 'Further reading',
          description: 'Additional posts from across the site.',
        }
        const variant = index % 3
        const items = section.posts.slice(0, variant === 1 ? 6 : 8)

        return (
          <section
            key={section.key}
            className={`relative py-16 sm:py-20 ${index % 2 === 1 ? 'border-y border-[var(--slot4-line-faint)] bg-[var(--slot4-panel-bg)]' : ''}`}
          >
            <div className={container}>
              <SectionHead
                eyebrow={copy.eyebrow}
                title={copy.title}
                description={copy.description}
                href={section.href || primaryRoute}
                linkLabel="See all"
              />

              {/* Variant A — horizontal rail of poster cards */}
              {variant === 0 ? (
                <div className="deco-reveal mt-12">
                  <div className="flex snap-x gap-5 overflow-x-auto pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {items.map((post, i) => (
                      <RailPostCard
                        key={post.id || post.slug}
                        post={post}
                        href={postHref(primaryTask, post, primaryRoute)}
                        index={i}
                      />
                    ))}
                  </div>
                  <p className="mt-3 deco-label deco-label-sm text-[var(--slot4-soft-muted-text)] lg:hidden">Swipe for more →</p>
                </div>
              ) : null}

              {/* Variant B — stacked horizontal record cards */}
              {variant === 1 ? (
                <div className="deco-reveal mt-12 grid gap-5">
                  {items.map((post, i) => (
                    <ArticleListCard
                      key={post.id || post.slug}
                      post={post}
                      href={postHref(primaryTask, post, primaryRoute)}
                      index={i}
                    />
                  ))}
                </div>
              ) : null}

              {/* Variant C — dense compact index grid */}
              {variant === 2 ? (
                <div className="deco-reveal mt-12 grid gap-px bg-[var(--slot4-line-faint)] sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((post, i) => (
                    <CompactIndexCard
                      key={post.id || post.slug}
                      post={post}
                      href={postHref(primaryTask, post, primaryRoute)}
                      index={i}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </section>
        )
      })}
    </>
  )
}

/* ------------------------------------------------------------------ *
   Closing CTA
 * ------------------------------------------------------------------ */
export function EditableHomeCta() {
  const cta = pagesContent.home.cta
  return (
    <section id="get-app" className="scroll-mt-24 px-3 pb-16 pt-8 sm:px-6 sm:pb-20 lg:px-8">
      <div className={`deco-frame deco-corners relative mx-auto w-full max-w-[var(--editable-container)] overflow-hidden bg-[var(--slot4-dark-bg)]`}>
        <div className="absolute inset-0 bg-[radial-gradient(70%_100%_at_50%_100%,rgba(225,18,53,0.28),transparent_65%)]" />
        <div className="relative flex flex-col items-center px-6 py-16 text-center sm:px-12 sm:py-24">
          <p className="deco-label text-[var(--slot4-accent)]">{cta.badge}</p>
          <div className="deco-rule mt-6 w-full max-w-[280px]">
            <span className="deco-diamond deco-pulse" />
          </div>
          <h2 className="editable-display mt-8 max-w-3xl text-balance text-3xl font-semibold leading-[1.02] tracking-[-0.02em] sm:text-5xl">
            {cta.title}
          </h2>
          <p className="mt-6 max-w-xl text-[15px] leading-8 text-[var(--slot4-muted-text)] sm:text-base">{cta.description}</p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href={cta.primaryCta.href}
              className="inline-flex items-center gap-2.5 bg-[var(--slot4-accent)] px-8 py-4 deco-label text-[var(--editable-cta-text)] shadow-[0_0_34px_rgba(225,18,53,0.4)] transition duration-500 hover:brightness-110"
            >
              <Compass className="h-4 w-4" /> {cta.primaryCta.label}
            </Link>
            <Link
              href={cta.secondaryCta.href}
              className="inline-flex items-center gap-2.5 border border-[var(--slot4-line)] px-8 py-4 deco-label text-[var(--slot4-page-text)] transition duration-500 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
            >
              {cta.secondaryCta.label} <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ *
   Editor's note — a quiet typographic band between feeds
 * ------------------------------------------------------------------ */
export function EditableEditorsNote({ posts }: { posts: SitePost[] }) {
  const pick = posts[1] || posts[0]
  if (!pick) return null
  return (
    <section className="relative border-y border-[var(--slot4-line-faint)] bg-[var(--slot4-panel-bg)] py-16 sm:py-20">
      <div className={`${container} deco-reveal`}>
        <div className="grid gap-10 lg:grid-cols-[0.9fr_minmax(0,1.1fr)] lg:items-center">
          <div>
            <p className="deco-label text-[var(--slot4-accent)]">Editor&rsquo;s note</p>
            <div className="deco-rule mt-4 max-w-[180px]">
              <span className="deco-diamond" />
            </div>
            <p className="editable-read mt-7 text-2xl leading-[1.55] text-[var(--slot4-page-text)]/88 sm:text-[1.7rem]">
              &ldquo;{getEditableExcerpt(pick, 190) || pick.title}&rdquo;
            </p>
            <p className="mt-6 deco-label deco-label-sm text-[var(--slot4-soft-muted-text)]">
              On &ldquo;{pick.title}&rdquo; · {getEditableReadTime(pick)} min read
            </p>
          </div>
          <div className="grid grid-cols-3 gap-px bg-[var(--slot4-line-faint)]">
            {[
              ['Sections', String(SITE_CONFIG.tasks.filter((task) => task.enabled).length).padStart(2, '0')],
              ['Posts', String(posts.length).padStart(2, '0')],
              ['Updated', 'Daily'],
            ].map(([label, value]) => (
              <div key={label} className="bg-[var(--slot4-page-bg)] px-4 py-8 text-center">
                <p className="editable-display text-3xl font-semibold text-[var(--slot4-accent)] sm:text-4xl">{value}</p>
                <p className="mt-3 deco-label deco-label-sm text-[var(--slot4-soft-muted-text)]">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

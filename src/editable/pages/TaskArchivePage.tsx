import Link from 'next/link'
import { ArrowUpRight, BriefcaseBusiness, ChevronDown, ChevronLeft, ChevronRight, Download, FileText, Globe, MapPin, Phone, SearchX, UserRound } from 'lucide-react'
import { buildTaskMetadata } from '@/lib/seo'
import { CATEGORY_OPTIONS, normalizeCategory } from '@/lib/categories'
import { fetchPaginatedTaskPosts, buildPostUrl } from '@/lib/task-data'
import { getTaskConfig, type TaskKey } from '@/lib/site-config'
import type { SiteFeedPagination, SitePost } from '@/lib/site-connector'
import { taskPageMetadata } from '@/config/site.content'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableInstantFilter } from '@/editable/components/EditableMotion'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { toRomanNumeral } from '@/editable/layouts/design-contract'

export const revalidate = 3

export const taskMetadata = (task: TaskKey, path: string) =>
  buildTaskMetadata(task, {
    path,
    title: taskPageMetadata[task]?.title,
    description: taskPageMetadata[task]?.description,
  })

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const image = asText(content.image) || asText(content.featuredImage) || asText(content.thumbnail)
  const logo = asText(content.logo)
  return [...media, ...images, ...(isUrl(image) ? [image] : []), ...(isUrl(logo) ? [logo] : [])].filter(Boolean).slice(0, 8)
}

const placeholder = '/placeholder.svg?height=900&width=1200'
const getImage = (post: SitePost) => getImages(post)[0] || placeholder
const getCategory = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
// Reduce any content payload — rich HTML, entity-encoded HTML, or plain text — to a clean
// plain-text card summary. Two tag-strip passes (before + after entity decode) also catch
// entity-encoded markup like &lt;p&gt; so category/archive cards never show raw markup.
const stripHtml = (value: string) => value
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
const getSummary = (post: SitePost) => stripHtml(post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || asText(getContent(post).body))
const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}
const cleanDomain = (value: string) => value.replace(/^https?:\/\//, '').replace(/\/$/, '')
const readTime = (post: SitePost) => {
  const words = getSummary(post).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 210))
}
/** Haystack consumed by the client-side instant filter. */
const filterKey = (post: SitePost) => [post.title, getCategory(post, ''), getSummary(post), (post.tags || []).join(' ')].filter(Boolean).join(' ').toLowerCase()

function pageHref(basePath: string, category: string, page: number) {
  const params = new URLSearchParams()
  if (category && category !== 'all') params.set('category', category)
  if (page > 1) params.set('page', String(page))
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

const taskGrid: Record<TaskKey, string> = {
  article: 'grid gap-6 lg:grid-cols-2',
  listing: 'grid gap-5 xl:grid-cols-2',
  classified: 'grid gap-5 sm:grid-cols-2 xl:grid-cols-3',
  image: 'columns-1 gap-5 [column-fill:_balance] sm:columns-2 xl:columns-3',
  sbm: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
  pdf: 'grid gap-5 md:grid-cols-2 xl:grid-cols-3',
  profile: 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
}

// Shared deco surface: hairline crimson frame, inset second rule, bloom on hover.
const cardBase = 'group deco-frame deco-lift relative block bg-[var(--tk-surface)]'

export async function EditableTaskArchiveRoute({
  task,
  searchParams,
  basePath,
}: {
  task: TaskKey
  searchParams?: Promise<{ category?: string; page?: string }>
  basePath?: string
}) {
  const resolved = (await searchParams) || {}
  const page = Math.max(1, Math.floor(Number(resolved.page) || 1))
  const category = resolved.category ? normalizeCategory(resolved.category) : 'all'
  const taskConfig = getTaskConfig(task)
  const { posts, pagination } = await fetchPaginatedTaskPosts(task, { page, limit: 24, category })
  return <TaskArchiveView task={task} posts={posts} pagination={pagination} category={category} basePath={basePath || taskConfig?.route || `/${task}`} />
}

export function TaskArchiveView({ task, posts, pagination, category, basePath }: { task: TaskKey; posts: SitePost[]; pagination: SiteFeedPagination; category: string; basePath: string }) {
  const taskConfig = getTaskConfig(task)
  const voice = taskPageVoices[task]
  const theme = getTaskTheme(task)
  const page = pagination.page || 1
  const label = taskConfig?.label || task
  const categoryLabel = category === 'all' ? 'All categories' : CATEGORY_OPTIONS.find((item) => item.slug === category)?.name || category
  const lead = posts[0]
  const rest = lead ? posts.slice(1) : posts

  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen text-[var(--tk-text)]">
        {/* ---------- Framed masthead ---------- */}
        <header className="px-3 pt-6 sm:px-6 sm:pt-10 lg:px-8">
          <div className="deco-frame deco-corners relative mx-auto w-full max-w-[var(--editable-container)] overflow-hidden bg-[var(--slot4-dark-bg)]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_0%,var(--tk-glow),transparent_65%)]" />
            <div className="relative px-6 py-16 sm:px-12 sm:py-20 lg:py-24">
              <div className="flex flex-wrap items-center gap-3 deco-label text-[var(--tk-accent)]">
                <span>{theme.kicker}</span>
                <span className="deco-diamond h-1.5 w-1.5" />
                <span className="text-[var(--tk-muted)]">{label}</span>
              </div>

              <h1 className="editable-display deco-glow-soft mt-7 max-w-4xl text-balance text-[2.35rem] font-semibold leading-[0.98] tracking-[-0.02em] sm:text-5xl lg:text-6xl">
                {voice?.headline || `Browse ${label}`}
              </h1>

              <div className="deco-rule mt-8 max-w-lg">
                <span className="deco-diamond" />
              </div>

              <p className="mt-8 max-w-2xl text-base leading-8 text-[var(--tk-muted)]">{voice?.description || theme.note}</p>

              {voice?.chips?.length ? (
                <div className="mt-8 flex flex-wrap gap-2.5">
                  {voice.chips.map((chip) => (
                    <span key={chip} className="border border-[var(--tk-line)] px-4 py-2 deco-label deco-label-sm text-[var(--tk-muted)]">
                      {chip}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>

            {/* Control bar */}
            <div className="relative grid gap-6 border-t border-[var(--tk-line)] px-6 py-6 sm:px-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                <p className="deco-label deco-label-sm text-[var(--tk-muted)]">
                  <span className="editable-display mr-2 text-lg text-[var(--tk-accent)]">{String(posts.length).padStart(2, '0')}</span>
                  {posts.length === 1 ? 'entry' : 'entries'} · {categoryLabel}
                </p>
                <EditableInstantFilter targetId="task-archive-grid" placeholder={`Filter these ${label.toLowerCase()}…`} />
              </div>

              <form action={basePath} className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[200px] flex-1">
                  <select
                    name="category"
                    defaultValue={category}
                    className="h-12 w-full appearance-none border border-[var(--tk-line)] bg-[var(--tk-surface)] pl-4 pr-10 text-sm text-[var(--tk-text)] outline-none transition focus:border-[var(--tk-accent)]"
                    aria-label={voice?.filterLabel || 'Filter category'}
                  >
                    <option value="all">All categories</option>
                    {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tk-muted)]" />
                </div>
                <button className="inline-flex h-12 items-center bg-[var(--tk-accent)] px-7 deco-label deco-label-sm text-[var(--tk-on-accent)] shadow-[0_0_28px_rgba(225,18,53,0.32)] transition hover:brightness-110">
                  Apply
                </button>
              </form>
            </div>
          </div>
        </header>

        {/* ---------- Lead entry ---------- */}
        {lead && task !== 'image' ? (
          <section className="mx-auto w-full max-w-[var(--editable-container)] px-4 pt-14 sm:px-6 lg:px-8 lg:pt-20">
            <LeadArchiveCard post={lead} href={`${basePath}/${lead.slug}`} task={task} />
          </section>
        ) : null}

        {/* ---------- Grid ---------- */}
        <section className="mx-auto w-full max-w-[var(--editable-container)] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          {posts.length ? (
            <>
              <div className="deco-rule mb-10">
                <span className="deco-diamond" />
              </div>
              <div id="task-archive-grid" className={taskGrid[task]}>
                {(task === 'image' ? posts : rest).map((post, index) => (
                  <ArchivePostCard key={post.id || post.slug} post={post} task={task} basePath={basePath} index={index} />
                ))}
              </div>
            </>
          ) : (
            <div className="deco-frame deco-corners mx-auto max-w-xl bg-[var(--tk-surface)] px-8 py-16 text-center">
              <SearchX className="mx-auto h-8 w-8 text-[var(--tk-accent)]" />
              <h2 className="editable-display mt-6 text-2xl font-semibold tracking-[-0.02em]">Nothing filed here yet</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--tk-muted)]">
                Try another category, or check back once new {label.toLowerCase()} are published.
              </p>
              <Link href="/" className="mt-8 inline-flex items-center gap-2 border border-[var(--tk-line)] px-5 py-3 deco-label deco-label-sm text-[var(--tk-text)] transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]">
                Back to home <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          )}

          {/* ---------- Pagination ---------- */}
          {posts.length ? (
            <nav className="mt-16 flex flex-wrap items-center justify-center gap-3">
              {pagination.hasPrevPage ? (
                <Link href={pageHref(basePath, category, page - 1)} className="inline-flex items-center gap-2 border border-[var(--tk-line)] px-5 py-3 deco-label deco-label-sm transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]">
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </Link>
              ) : null}
              <span className="inline-flex items-center gap-3 border border-[var(--tk-line)] bg-[var(--tk-surface)] px-6 py-3 deco-label deco-label-sm text-[var(--tk-muted)]">
                <span className="editable-display text-base text-[var(--tk-accent)]">{toRomanNumeral(page)}</span>
                of {pagination.totalPages || 1}
              </span>
              {pagination.hasNextPage ? (
                <Link href={pageHref(basePath, category, page + 1)} className="inline-flex items-center gap-2 border border-[var(--tk-line)] px-5 py-3 deco-label deco-label-sm transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]">
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              ) : null}
            </nav>
          ) : null}
        </section>
      </main>
    </EditableSiteShell>
  )
}

/* ------------------------------------------------------------------ *
   Lead entry — wide hero card above the grid
 * ------------------------------------------------------------------ */
function LeadArchiveCard({ post, href, task }: { post: SitePost; href: string; task: TaskKey }) {
  const image = getImages(post)[0]
  return (
    <Link href={href} className="group deco-frame deco-corners deco-sweep relative grid overflow-hidden bg-[var(--tk-surface)] transition duration-500 hover:border-[var(--tk-accent)] lg:grid-cols-[1.1fr_minmax(0,1fr)]">
      <span className="deco-sweep-beam" />
      <div className="relative min-h-[260px] overflow-hidden bg-[var(--tk-raised)] lg:min-h-[420px]">
        {image ? (
          <img src={image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-70 transition duration-[1100ms] group-hover:scale-[1.05] group-hover:opacity-95" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"><FileText className="h-10 w-10 text-[var(--tk-muted)]" /></div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,1,4,0.3),rgba(8,1,4,0.8))]" />
      </div>
      <div className="relative flex flex-col justify-center p-8 sm:p-12">
        <p className="deco-label text-[var(--tk-accent)]">Latest entry</p>
        <h2 className="editable-display mt-5 line-clamp-3 text-3xl font-semibold leading-[1.04] tracking-[-0.02em] transition duration-500 group-hover:text-[var(--tk-accent)] sm:text-[2.6rem]">
          {post.title}
        </h2>
        <p className="mt-5 line-clamp-3 text-[15px] leading-8 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-[var(--tk-line)] pt-6">
          <span className="border border-[var(--tk-line)] bg-[var(--tk-accent-soft)] px-3 py-1 deco-label deco-label-sm text-[var(--tk-accent)]">
            {getCategory(post, task === 'listing' ? 'Business' : 'Feature')}
          </span>
          <span className="deco-label deco-label-sm text-[var(--tk-muted)]">{readTime(post)} min read</span>
          <span className="ml-auto inline-flex items-center gap-2 deco-label deco-label-sm text-[var(--tk-accent)]">
            Open <ArrowUpRight className="h-3.5 w-3.5 transition duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

function ArchivePostCard({ post, task, basePath, index }: { post: SitePost; task: TaskKey; basePath: string; index: number }) {
  const href = `${basePath}/${post.slug}` || buildPostUrl(task, post.slug)
  if (task === 'listing') return <ListingArchiveCard post={post} href={href} index={index} />
  if (task === 'classified') return <ClassifiedArchiveCard post={post} href={href} index={index} />
  if (task === 'image') return <ImageArchiveCard post={post} href={href} index={index} />
  if (task === 'sbm') return <BookmarkArchiveCard post={post} href={href} index={index} />
  if (task === 'pdf') return <PdfArchiveCard post={post} href={href} index={index} />
  if (task === 'profile') return <ProfileArchiveCard post={post} href={href} />
  return <ArticleArchiveCard post={post} href={href} index={index} />
}

function CardArrow({ label }: { label: string }) {
  return (
    <span className="mt-6 inline-flex items-center gap-2 deco-label deco-label-sm text-[var(--tk-accent)]">
      {label}
      <ArrowUpRight className="h-3.5 w-3.5 transition duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </span>
  )
}

function Numeral({ index }: { index: number }) {
  return (
    <span className="editable-display text-lg text-[var(--tk-accent)] opacity-55 transition duration-500 group-hover:opacity-100">
      {toRomanNumeral(index + 2)}
    </span>
  )
}

/* --- Article: alternating image-top / text-only editorial cards --- */
function ArticleArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  const category = getCategory(post, 'Article')
  // Every third card drops the image and reads as a pure typographic entry.
  const textOnly = index % 3 === 2

  if (textOnly) {
    return (
      <Link href={href} data-filter-key={filterKey(post)} className={`${cardBase} flex flex-col justify-between p-8 sm:p-10`}>
        <div>
          <div className="flex items-center justify-between">
            <span className="deco-label deco-label-sm text-[var(--tk-accent)]">{category}</span>
            <Numeral index={index} />
          </div>
          <h2 className="editable-display mt-6 line-clamp-3 text-[1.9rem] font-semibold leading-[1.08] tracking-[-0.02em] transition duration-500 group-hover:text-[var(--tk-accent)]">
            {post.title}
          </h2>
          <p className="editable-read mt-5 line-clamp-4 text-[1.05rem] leading-[1.8] text-[var(--tk-muted)]">{getSummary(post)}</p>
        </div>
        <div className="mt-8 flex items-center justify-between border-t border-[var(--tk-line)] pt-5">
          <span className="deco-label deco-label-sm text-[var(--tk-muted)]">{readTime(post)} min read</span>
          <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)] transition duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </Link>
    )
  }

  return (
    <Link href={href} data-filter-key={filterKey(post)} className={`${cardBase} overflow-hidden`}>
      <div className="relative aspect-[16/9] overflow-hidden bg-[var(--tk-raised)]">
        <img src={image} alt="" className="h-full w-full object-cover opacity-75 transition duration-[1000ms] group-hover:scale-[1.05] group-hover:opacity-100" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(8,1,4,0.85))]" />
        <span className="absolute left-5 top-5 border border-[var(--tk-line)] bg-[var(--slot4-dark-bg)]/80 px-3 py-1 deco-label deco-label-sm text-[var(--tk-accent)] backdrop-blur-sm">
          {category}
        </span>
      </div>
      <div className="p-7 sm:p-8">
        <div className="flex items-center justify-between">
          <span className="deco-label deco-label-sm text-[var(--tk-muted)]">{readTime(post)} min read</span>
          <Numeral index={index} />
        </div>
        <h2 className="editable-display mt-4 line-clamp-3 text-2xl font-semibold leading-[1.1] tracking-[-0.02em] transition duration-500 group-hover:text-[var(--tk-accent)]">
          {post.title}
        </h2>
        <p className="mt-4 line-clamp-2 text-[15px] leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <CardArrow label="Read article" />
      </div>
    </Link>
  )
}

/* --- Listing: horizontal directory record --- */
function ListingArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const logo = getImages(post)[0]
  const location = getField(post, ['location', 'address', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const website = getField(post, ['website', 'url'])
  return (
    <Link href={href} data-filter-key={filterKey(post)} className={`${cardBase} flex items-stretch gap-0 overflow-hidden`}>
      <div className="relative w-28 shrink-0 overflow-hidden bg-[var(--tk-raised)] sm:w-36">
        {logo ? (
          <img src={logo} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80 transition duration-[900ms] group-hover:scale-105 group-hover:opacity-100" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center"><BriefcaseBusiness className="h-8 w-8 text-[var(--tk-muted)]" /></div>
        )}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,1,4,0.15),rgba(8,1,4,0.6))]" />
      </div>
      <div className="min-w-0 flex-1 p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <h2 className="editable-display line-clamp-2 text-xl font-semibold leading-tight tracking-[-0.02em] transition duration-500 group-hover:text-[var(--tk-accent)] sm:text-2xl">
            {post.title}
          </h2>
          <Numeral index={index} />
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-[var(--tk-line)] pt-4 deco-label deco-label-sm text-[var(--tk-muted)]">
          {location ? <span className="inline-flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> <span className="max-w-[180px] truncate">{location}</span></span> : null}
          {phone ? <span className="inline-flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {phone}</span> : null}
          {website ? <span className="inline-flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {cleanDomain(website).slice(0, 24)}</span> : null}
          {!location && !phone && !website ? <span>{getCategory(post, 'Business')}</span> : null}
        </div>
      </div>
    </Link>
  )
}

/* --- Classified: price-forward notice --- */
function ClassifiedArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'type', 'availability'])
  return (
    <Link href={href} data-filter-key={filterKey(post)} className={`${cardBase} flex flex-col p-7 sm:p-8`}>
      <div className="flex items-start justify-between gap-4">
        <span className="editable-display text-3xl font-semibold tracking-[-0.03em] text-[var(--tk-accent)]">{price || 'Open offer'}</span>
        {condition ? <span className="border border-[var(--tk-line)] bg-[var(--tk-accent-soft)] px-3 py-1 deco-label deco-label-sm text-[var(--tk-accent)]">{condition}</span> : <Numeral index={index} />}
      </div>
      <h2 className="editable-display mt-6 line-clamp-2 text-xl font-semibold leading-snug tracking-[-0.02em] transition duration-500 group-hover:text-[var(--tk-accent)]">{post.title}</h2>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <div className="mt-7 flex items-center justify-between border-t border-[var(--tk-line)] pt-4 deco-label deco-label-sm text-[var(--tk-muted)]">
        <span className="inline-flex items-center gap-1.5">{location ? <><MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {location}</> : 'Details inside'}</span>
        <ArrowUpRight className="h-4 w-4 text-[var(--tk-accent)] transition duration-500 group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

/* --- Image: masonry tile --- */
function ImageArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const image = getImage(post)
  return (
    <Link href={href} data-filter-key={filterKey(post)} className="group deco-frame deco-lift mb-5 block break-inside-avoid overflow-hidden bg-[var(--tk-surface)]">
      <div className={`relative overflow-hidden ${index % 3 === 0 ? 'aspect-[3/4]' : 'aspect-[4/3]'}`}>
        <img src={image} alt="" className="h-full w-full object-cover opacity-80 transition duration-[1000ms] group-hover:scale-[1.05] group-hover:opacity-100" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_42%,rgba(8,1,4,0.88))]" />
        <div className="absolute inset-x-0 bottom-0 p-6">
          <p className="deco-label deco-label-sm text-[var(--tk-accent)]">{getCategory(post, 'Frame')}</p>
          <h2 className="editable-display mt-2 line-clamp-2 text-lg font-semibold leading-snug tracking-[-0.02em] text-white">{post.title}</h2>
          <span className="mt-3 inline-flex items-center gap-1.5 deco-label deco-label-sm text-white/55 transition group-hover:text-[var(--tk-accent)]">
            View <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

/* --- Bookmark: shelf entry --- */
function BookmarkArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <Link href={href} data-filter-key={filterKey(post)} className={`${cardBase} flex gap-5 p-7`}>
      <div className="flex h-12 w-12 shrink-0 items-center justify-center border border-[var(--tk-line)] text-[var(--tk-accent)] transition duration-500 group-hover:bg-[var(--tk-accent-soft)]">
        <Globe className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <span className="deco-label deco-label-sm text-[var(--tk-muted)]">Saved</span>
          <Numeral index={index} />
        </div>
        <h2 className="editable-display mt-2.5 line-clamp-2 text-lg font-semibold leading-snug tracking-[-0.02em] transition duration-500 group-hover:text-[var(--tk-accent)]">{post.title}</h2>
        <p className="mt-2.5 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
        {website ? <p className="mt-4 truncate deco-label deco-label-sm text-[var(--tk-accent)]">{cleanDomain(website)}</p> : null}
      </div>
    </Link>
  )
}

/* --- PDF: archive slip --- */
function PdfArchiveCard({ post, href, index }: { post: SitePost; href: string; index: number }) {
  const category = getCategory(post, 'Document')
  return (
    <Link href={href} data-filter-key={filterKey(post)} className={`${cardBase} flex flex-col p-7 sm:p-8`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-12 w-12 items-center justify-center border border-[var(--tk-line)] text-[var(--tk-accent)] transition duration-500 group-hover:bg-[var(--tk-accent-soft)]"><FileText className="h-5 w-5" /></div>
        <div className="flex items-center gap-3">
          <span className="border border-[var(--tk-line)] px-3 py-1 deco-label deco-label-sm text-[var(--tk-muted)]">{category}</span>
          <Numeral index={index} />
        </div>
      </div>
      <h2 className="editable-display mt-7 line-clamp-2 text-xl font-semibold leading-snug tracking-[-0.02em] transition duration-500 group-hover:text-[var(--tk-accent)]">{post.title}</h2>
      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-7 text-[var(--tk-muted)]">{getSummary(post)}</p>
      <span className="mt-7 inline-flex items-center gap-2 deco-label deco-label-sm text-[var(--tk-accent)]">Open document <Download className="h-3.5 w-3.5" /></span>
    </Link>
  )
}

/* --- Profile: register portrait --- */
function ProfileArchiveCard({ post, href }: { post: SitePost; href: string }) {
  const avatar = getImages(post)[0]
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  return (
    <Link href={href} data-filter-key={filterKey(post)} className={`${cardBase} flex flex-col items-center p-8 text-center`}>
      <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)] transition duration-500 group-hover:border-[var(--tk-accent)] group-hover:shadow-[0_0_28px_rgba(225,18,53,0.35)]">
        {avatar ? <img src={avatar} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-10 w-10 text-[var(--tk-muted)]" />}
      </div>
      <h2 className="editable-display mt-6 line-clamp-2 text-lg font-semibold tracking-[-0.02em] transition duration-500 group-hover:text-[var(--tk-accent)]">{post.title}</h2>
      {role ? <p className="mt-2 deco-label deco-label-sm text-[var(--tk-accent)]">{role}</p> : null}
      <p className="mt-4 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{getSummary(post)}</p>
    </Link>
  )
}

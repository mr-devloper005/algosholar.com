import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, Bookmark, Building2, Camera, CheckCircle2, Clock3, Download, ExternalLink, FileText, Globe2, Mail, MapPin, Phone, Tag, UserRound } from 'lucide-react'
import { buildPostMetadata, buildTaskMetadata } from '@/lib/seo'
import { fetchArticleComments, fetchTaskPostBySlug, fetchTaskPosts } from '@/lib/task-data'
import { getTaskConfig, SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import type { SitePost } from '@/lib/site-connector'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { EditableArticleComments } from '@/editable/components/EditableArticleComments'
import { EditableCopyLink, EditableReadingProgress } from '@/editable/components/EditableMotion'
import { getTaskTheme, taskThemeStyle } from '@/editable/theme/task-themes'
import { toRomanNumeral } from '@/editable/layouts/design-contract'

export const revalidate = 3

export async function generateEditableDetailMetadata(task: TaskKey, params: Promise<{ slug?: string; username?: string }>) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  return post ? await buildPostMetadata(task, post) : await buildTaskMetadata(task)
}

export async function EditableTaskDetailRoute({ task, params }: { task: TaskKey; params: Promise<{ slug?: string; username?: string }> }) {
  const resolved = await params
  const slug = resolved.slug || resolved.username || ''
  const post = await fetchTaskPostBySlug(task, slug)
  if (!post) notFound()
  const related = (await fetchTaskPosts(task, 7)).filter((item) => item.slug !== post.slug).slice(0, 4)
  const comments = task === 'article' ? await fetchArticleComments(post.slug, 50) : []
  return <TaskDetailView task={task} post={post} related={related} comments={comments} />
}

const getContent = (post: SitePost) => post.content && typeof post.content === 'object' ? post.content as Record<string, unknown> : {}
const asText = (value: unknown) => typeof value === 'string' ? value.trim() : ''
const isUrl = (value: string) => value.startsWith('/') || /^https?:\/\//i.test(value)

const getField = (post: SitePost, keys: string[]) => {
  const content = getContent(post)
  for (const key of keys) {
    const value = asText(content[key])
    if (value) return value
  }
  return ''
}

const getImages = (post: SitePost) => {
  const content = getContent(post)
  const media = Array.isArray(post.media) ? post.media.map((item) => item?.url).filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const images = Array.isArray(content.images) ? content.images.filter((url): url is string => typeof url === 'string' && isUrl(url)) : []
  const singleImages = ['image', 'featuredImage', 'thumbnail', 'logo', 'avatar'].map((key) => asText(content[key])).filter((url) => url && isUrl(url))
  return [...media, ...images, ...singleImages].filter(Boolean).slice(0, 12)
}

const getBody = (post: SitePost) => {
  const content = getContent(post)
  return asText(content.body) || asText(content.description) || asText(content.details) || post.summary || 'Details will appear here once available.'
}

const escapeHtml = (value: string) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#39;')

const safeUrl = (value: string) => /^https?:\/\//i.test(value) ? value : '#'

const linkifyMarkdown = (value: string) => value
  .replace(/\[([^\]]+)]\((https?:\/\/[^\s)]+)\)/gi, (_match, label, url) => `<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${label}</a>`)

const linkifyText = (value: string) => linkifyMarkdown(value)
  .replace(/(^|[\s(>])((https?:\/\/)[^\s<)]+)/gi, (_match, prefix, url) => `${prefix}<a href="${safeUrl(url)}" target="_blank" rel="nofollow noopener noreferrer">${url}</a>`)

const hardenLinks = (html: string) => html.replace(/<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi, (_match, attrs) => {
  let next = String(attrs).replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  if (!/\starget=/i.test(next)) next += ' target="_blank"'
  if (!/\srel=/i.test(next)) next += ' rel="nofollow noopener noreferrer"'
  return `<a ${next}>`
})

const sanitizeHtml = (html: string) => hardenLinks(html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
  .replace(/<(iframe|object|embed)[^>]*>[\s\S]*?<\/\1>/gi, '')
  .replace(/\s+on\w+=("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
  .replace(/(href|src)=(['"])javascript:[\s\S]*?\2/gi, '$1="#"'))

const formatPlainText = (raw: string) => {
  const value = raw.trim()
  if (!value) return ''
  if (/<[a-z][\s\S]*>/i.test(value)) return sanitizeHtml(linkifyMarkdown(value))
  return value
    .split(/\n{2,}/)
    .map((part) => `<p>${linkifyText(escapeHtml(part).replace(/\n/g, '<br />'))}</p>`)
    .join('')
}

const summaryText = (post: SitePost) => post.summary || asText(getContent(post).description) || asText(getContent(post).excerpt) || ''
const stripHtml = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
// Plain-text lead intro, but only when it isn't just a duplicate of the body
// (some posts store the full HTML body in `summary`, which would render twice).
const leadText = (post: SitePost) => {
  const summary = summaryText(post)
  if (!summary) return ''
  const lead = stripHtml(summary)
  return lead && lead !== stripHtml(getBody(post)) ? lead : ''
}
const categoryOf = (post: SitePost, fallback: string) => asText(getContent(post).category) || post.tags?.[0] || fallback
const readMinutes = (post: SitePost) => {
  const words = stripHtml(getBody(post)).split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.round(words / 210))
}
const mapSrcFor = (post: SitePost) => {
  const address = getField(post, ['address', 'location', 'city'])
  const lat = getField(post, ['lat', 'latitude'])
  const lng = getField(post, ['lng', 'lon', 'longitude'])
  if (lat && lng) return `https://maps.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=14&output=embed`
  if (address) return `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=13&output=embed`
  return ''
}

export function TaskDetailView({ task, post, related, comments = [] }: { task: TaskKey; post: SitePost; related: SitePost[]; comments?: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  return (
    <EditableSiteShell>
      <main style={taskThemeStyle(task)} className="min-h-screen text-[var(--tk-text)]">
        <EditableReadingProgress />
        {task === 'listing' ? <ListingDetail post={post} related={related} /> : null}
        {task === 'classified' ? <ClassifiedDetail post={post} related={related} /> : null}
        {task === 'image' ? <ImageDetail post={post} related={related} /> : null}
        {task === 'sbm' ? <BookmarkDetail post={post} related={related} /> : null}
        {task === 'pdf' ? <PdfDetail post={post} related={related} /> : null}
        {task === 'profile' ? <ProfileDetail post={post} related={related} /> : null}
        {task === 'article' ? <ArticleDetail post={post} related={related} comments={comments} /> : null}
      </main>
    </EditableSiteShell>
  )
}

/* ------------------------------------------------------------------ *
   Shared chrome
 * ------------------------------------------------------------------ */

function Kicker({ task, children }: { task: TaskKey; children: React.ReactNode }) {
  const theme = getTaskTheme(task)
  return (
    <div className="flex flex-wrap items-center gap-3 deco-label text-[var(--tk-accent)]">
      <span>{theme.kicker}</span>
      <span className="deco-diamond h-1.5 w-1.5" />
      <span className="text-[var(--tk-muted)]">{children}</span>
    </div>
  )
}

function BackLink({ task }: { task: TaskKey }) {
  const taskConfig = getTaskConfig(task)
  return (
    <Link
      href={taskConfig?.route || '/'}
      className="group inline-flex items-center gap-2 border border-[var(--tk-line)] px-4 py-2.5 deco-label deco-label-sm text-[var(--tk-muted)] transition duration-500 hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]"
    >
      <ArrowLeft className="h-3.5 w-3.5 transition duration-500 group-hover:-translate-x-0.5" /> {taskConfig?.label || 'Posts'}
    </Link>
  )
}

function MetaLine({ post, category, center = false }: { post: SitePost; category?: string; center?: boolean }) {
  return (
    <div className={`mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 deco-label deco-label-sm text-[var(--tk-muted)] ${center ? 'justify-center' : ''}`}>
      <span className="text-[var(--tk-accent)]">{SITE_CONFIG.name}</span>
      <span className="deco-diamond h-1.5 w-1.5 opacity-60" />
      <span className="inline-flex items-center gap-1.5"><Clock3 className="h-3.5 w-3.5" /> {readMinutes(post)} min read</span>
      {category ? (
        <>
          <span className="deco-diamond h-1.5 w-1.5 opacity-60" />
          <span>{category}</span>
        </>
      ) : null}
    </div>
  )
}

function Divider() {
  return (
    <div className="deco-rule my-12">
      <span className="deco-diamond" />
    </div>
  )
}

function BodyContent({ post, compact = false, lede = false }: { post: SitePost; compact?: boolean; lede?: boolean }) {
  return (
    <div
      className={`article-content mt-10 max-w-none ${lede ? 'article-content--lede' : ''} ${compact ? 'text-[1.02rem] leading-[1.75]' : ''}`}
      dangerouslySetInnerHTML={{ __html: formatPlainText(getBody(post)) }}
    />
  )
}

/* ------------------------------------------------------------------ *
   Article — a framed masthead over a centred reading column
 * ------------------------------------------------------------------ */
function ArticleDetail({ post, related, comments }: { post: SitePost; related: SitePost[]; comments: Array<{ id: string; name: string; comment: string; createdAt: string }> }) {
  const images = getImages(post)
  const category = categoryOf(post, 'Article')

  return (
    <>
      {/* Masthead */}
      <header className="px-3 pt-6 sm:px-6 sm:pt-10 lg:px-8">
        <div className="deco-frame deco-corners relative mx-auto w-full max-w-[var(--editable-container)] overflow-hidden bg-[var(--slot4-dark-bg)]">
          {images[0] ? (
            <>
              <img src={images[0]} alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,1,4,0.7),rgba(8,1,4,0.92))]" />
            </>
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_0%,var(--tk-glow),transparent_65%)]" />

          <div className="relative mx-auto max-w-4xl px-6 py-16 text-center sm:px-10 sm:py-24">
            <p className="deco-label text-[var(--tk-accent)]">{category}</p>
            <h1 className="editable-display deco-glow-soft mt-7 text-balance text-[2.35rem] font-semibold leading-[1] tracking-[-0.02em] sm:text-5xl lg:text-[3.6rem]">
              {post.title}
            </h1>
            <div className="deco-rule mx-auto mt-9 max-w-sm">
              <span className="deco-diamond" />
            </div>
            <div className="flex justify-center">
              <MetaLine post={post} />
            </div>
          </div>
        </div>
      </header>

      {/* Reading column */}
      <article className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-6 sm:py-20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackLink task="article" />
          <EditableCopyLink />
        </div>

        {leadText(post) ? (
          <p className="editable-read mt-10 border-l-2 border-[var(--tk-accent)] pl-6 text-xl leading-[1.7] text-[var(--tk-text)]/85 sm:text-[1.35rem]">
            {leadText(post)}
          </p>
        ) : null}

        {images[0] ? (
          <figure className="mt-10">
            <div className="deco-frame overflow-hidden">
              <img src={images[0]} alt="" className="aspect-[16/9] w-full object-cover" />
            </div>
            <figcaption className="mt-3 deco-label deco-label-sm text-[var(--tk-muted)]">{category}</figcaption>
          </figure>
        ) : null}

        <BodyContent post={post} lede={!leadText(post)} />

        {images.length > 1 ? <ImageStrip images={images.slice(1)} label="More from this story" /> : null}

        <Divider />
        <EditableArticleComments slug={post.slug} comments={comments} />
      </article>

      <RelatedStrip task="article" related={related} />
    </>
  )
}

/* ------------------------------------------------------------------ *
   Listing — a directory record with a sticky action rail
 * ------------------------------------------------------------------ */
function ListingDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const logo = images[0]
  const address = getField(post, ['address', 'location', 'city'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])
  const mapSrc = mapSrcFor(post)

  return (
    <>
      <header className="px-3 pt-6 sm:px-6 sm:pt-10 lg:px-8">
        <div className="deco-frame deco-corners relative mx-auto w-full max-w-[var(--editable-container)] overflow-hidden bg-[var(--slot4-dark-bg)]">
          {logo ? (
            <>
              <img src={logo} alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,1,4,0.75),rgba(8,1,4,0.94))]" />
            </>
          ) : null}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_0%,var(--tk-glow),transparent_65%)]" />

          <div className="relative flex flex-col gap-8 px-6 py-14 sm:flex-row sm:items-center sm:px-12 sm:py-20">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden border border-[var(--tk-line)] bg-[var(--tk-raised)]">
              {logo ? <img src={logo} alt="" className="h-full w-full object-cover" /> : <Building2 className="h-12 w-12 text-[var(--tk-muted)]" />}
            </div>
            <div className="min-w-0">
              <Kicker task="listing">{categoryOf(post, 'Business listing')}</Kicker>
              <h1 className="editable-display mt-5 text-balance text-[2.1rem] font-semibold leading-[1.02] tracking-[-0.02em] sm:text-5xl">{post.title}</h1>
              <MetaLine post={post} category={address || undefined} />
            </div>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[var(--editable-container)] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackLink task="listing" />
          <EditableCopyLink />
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px]">
          <article className="min-w-0">
            {leadText(post) ? (
              <p className="editable-read border-l-2 border-[var(--tk-accent)] pl-6 text-xl leading-[1.7] text-[var(--tk-text)]/85">{leadText(post)}</p>
            ) : null}
            <InfoGrid items={[['Location', address, MapPin], ['Phone', phone, Phone], ['Email', email, Mail], ['Website', website, Globe2]]} />
            <Divider />
            <BodyContent post={post} />
            <ImageStrip images={images.slice(1)} label="Showcase" />
          </article>

          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {mapSrc ? <MapBox src={mapSrc} label={address || post.title} /> : null}
            <ContactAction website={website} phone={phone} email={email} />
            <RelatedPanel task="listing" post={post} related={related} />
          </aside>
        </div>
      </section>
    </>
  )
}

/* ------------------------------------------------------------------ *
   Classified — price-forward notice
 * ------------------------------------------------------------------ */
function ClassifiedDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const price = getField(post, ['price', 'amount', 'budget'])
  const location = getField(post, ['location', 'address', 'city'])
  const condition = getField(post, ['condition', 'availability', 'type'])
  const phone = getField(post, ['phone', 'telephone', 'mobile'])
  const email = getField(post, ['email'])
  const website = getField(post, ['website', 'url'])

  return (
    <>
      <section className="mx-auto grid w-full max-w-[var(--editable-container)] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[380px_minmax(0,1fr)] lg:px-8 lg:py-20">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <BackLink task="classified" />
          <div className="deco-frame deco-corners mt-7 bg-[var(--tk-surface)] p-8">
            <Kicker task="classified">Notice</Kicker>
            <h1 className="editable-display mt-5 text-2xl font-semibold leading-tight tracking-[-0.02em]">{post.title}</h1>
            <p className="editable-display mt-7 text-4xl font-semibold tracking-[-0.03em] text-[var(--tk-accent)] deco-glow-soft">{price || 'Open offer'}</p>
            <div className="mt-7 space-y-2.5">
              {condition ? <BadgeLine label="Condition" value={condition} /> : null}
              {location ? <BadgeLine label="Location" value={location} /> : null}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 bg-[var(--tk-accent)] px-5 py-3 deco-label deco-label-sm text-[var(--tk-on-accent)] transition hover:brightness-110"><Phone className="h-3.5 w-3.5" /> Call</a> : null}
              {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 border border-[var(--tk-line)] px-5 py-3 deco-label deco-label-sm transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]"><Mail className="h-3.5 w-3.5" /> Email</a> : null}
            </div>
            <div className="mt-6"><EditableCopyLink /></div>
          </div>
        </aside>

        <article className="min-w-0">
          <ImageStrip images={images} label="Offer images" large />
          <BodyContent post={post} />
          <div className="mt-10"><ContactAction website={website} phone={phone} email={email} /></div>
        </article>
      </section>
      <RelatedStrip task="classified" related={related} />
    </>
  )
}

/* ------------------------------------------------------------------ *
   Image — gallery-led canvas
 * ------------------------------------------------------------------ */
function ImageDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const gallery = images.length ? images : ['/placeholder.svg?height=900&width=1200']
  return (
    <>
      <section className="mx-auto w-full max-w-[var(--editable-container)] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackLink task="image" />
          <EditableCopyLink />
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_0.6fr]">
          <div className="columns-1 gap-5 [column-fill:_balance] sm:columns-2">
            {gallery.map((image, index) => (
              <figure key={`${image}-${index}`} className="deco-frame mb-5 break-inside-avoid overflow-hidden bg-[var(--tk-surface)]">
                <img src={image} alt="" className="w-full object-cover transition duration-[900ms] hover:scale-[1.02]" />
              </figure>
            ))}
          </div>
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="inline-flex items-center gap-2 border border-[var(--tk-line)] px-4 py-2 deco-label deco-label-sm text-[var(--tk-muted)]">
              <Camera className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> Image story
            </div>
            <h1 className="editable-display mt-7 text-[2.1rem] font-semibold leading-[1.02] tracking-[-0.02em] sm:text-4xl">{post.title}</h1>
            <MetaLine post={post} category={categoryOf(post, '')} />
            {leadText(post) ? <p className="editable-read mt-7 text-lg leading-[1.75] text-[var(--tk-muted)]">{leadText(post)}</p> : null}
            <BodyContent post={post} compact />
          </aside>
        </div>
      </section>
      <RelatedStrip task="image" related={related} />
    </>
  )
}

/* ------------------------------------------------------------------ *
   Bookmark — single curated resource
 * ------------------------------------------------------------------ */
function BookmarkDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const website = getField(post, ['website', 'url', 'link'])
  return (
    <>
      <article className="mx-auto w-full max-w-3xl px-5 py-14 sm:px-6 sm:py-20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackLink task="sbm" />
          <EditableCopyLink />
        </div>
        <div className="mt-12 flex h-16 w-16 items-center justify-center border border-[var(--tk-line)] text-[var(--tk-accent)]">
          <Bookmark className="h-6 w-6" />
        </div>
        <div className="mt-7"><Kicker task="sbm">Saved resource</Kicker></div>
        <h1 className="editable-display mt-5 text-[2.1rem] font-semibold leading-[1.02] tracking-[-0.02em] sm:text-5xl">{post.title}</h1>
        <MetaLine post={post} category={categoryOf(post, '')} />
        {leadText(post) ? <p className="editable-read mt-8 text-lg leading-[1.75] text-[var(--tk-muted)]">{leadText(post)}</p> : null}
        {website ? (
          <Link href={website} target="_blank" rel="noreferrer" className="mt-9 inline-flex items-center gap-2 bg-[var(--tk-accent)] px-6 py-3.5 deco-label deco-label-sm text-[var(--tk-on-accent)] transition hover:brightness-110">
            Open resource <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        ) : null}
        <BodyContent post={post} />
      </article>
      <RelatedStrip task="sbm" related={related} />
    </>
  )
}

/* ------------------------------------------------------------------ *
   PDF — document workspace
 * ------------------------------------------------------------------ */
function PdfDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const fileUrl = getField(post, ['fileUrl', 'pdfUrl', 'documentUrl', 'url'])
  return (
    <section className="mx-auto w-full max-w-[var(--editable-container)] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <BackLink task="pdf" />
        <EditableCopyLink />
      </div>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_340px]">
        <article className="min-w-0">
          <div className="flex items-center gap-6">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center border border-[var(--tk-line)] text-[var(--tk-accent)]"><FileText className="h-8 w-8" /></div>
            <div className="min-w-0">
              <Kicker task="pdf">{categoryOf(post, 'Document')}</Kicker>
              <h1 className="editable-display mt-4 text-3xl font-semibold leading-[1.04] tracking-[-0.02em] sm:text-4xl">{post.title}</h1>
            </div>
          </div>
          <BodyContent post={post} />
          {fileUrl ? (
            <div className="deco-frame mt-12 overflow-hidden bg-[var(--tk-surface)]">
              <div className="flex items-center justify-between gap-3 border-b border-[var(--tk-line)] p-5">
                <span className="deco-label deco-label-sm text-[var(--tk-muted)]">Document preview</span>
                <Link href={fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[var(--tk-accent)] px-4 py-2.5 deco-label deco-label-sm text-[var(--tk-on-accent)] transition hover:brightness-110">
                  Download <Download className="h-3.5 w-3.5" />
                </Link>
              </div>
              <iframe src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=0`} title={post.title} className="h-[78vh] w-full bg-[var(--tk-raised)]" />
            </div>
          ) : null}
        </article>

        <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
          {fileUrl ? (
            <div className="deco-frame bg-[var(--tk-surface)] p-7">
              <p className="deco-label deco-label-sm text-[var(--tk-accent)]">Get this document</p>
              <p className="mt-4 text-sm leading-7 text-[var(--tk-muted)]">Open or download the full file in a new tab.</p>
              <Link href={fileUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex w-full items-center justify-center gap-2 bg-[var(--tk-accent)] px-5 py-3.5 deco-label deco-label-sm text-[var(--tk-on-accent)] transition hover:brightness-110">
                Download <Download className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : null}
          <RelatedPanel task="pdf" post={post} related={related} />
        </aside>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ *
   Profile — identity-first
 * ------------------------------------------------------------------ */
function ProfileDetail({ post, related }: { post: SitePost; related: SitePost[] }) {
  const images = getImages(post)
  const role = getField(post, ['role', 'designation', 'company', 'location'])
  const website = getField(post, ['website', 'url'])
  const email = getField(post, ['email'])

  return (
    <>
      <section className="mx-auto w-full max-w-[var(--editable-container)] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <BackLink task="profile" />
          <EditableCopyLink />
        </div>

        <div className="mt-10 grid gap-12 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="deco-frame deco-corners bg-[var(--tk-surface)] p-9 text-center">
              <div className="mx-auto flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border border-[var(--tk-line)] bg-[var(--tk-raised)]">
                {images[0] ? <img src={images[0]} alt="" className="h-full w-full object-cover" /> : <UserRound className="h-14 w-14 text-[var(--tk-muted)]" />}
              </div>
              <h1 className="editable-display mt-7 text-2xl font-semibold tracking-[-0.02em]">{post.title}</h1>
              {role ? <p className="mt-3 deco-label deco-label-sm text-[var(--tk-accent)]">{role}</p> : null}
              <div className="deco-rule mt-6">
                <span className="deco-diamond" />
              </div>
              <ContactAction website={website} email={email} bare />
            </div>
          </aside>

          <article className="min-w-0">
            <Kicker task="profile">Profile</Kicker>
            <BodyContent post={post} />
            <ImageStrip images={images.slice(1)} label="Gallery" />
          </article>
        </div>
      </section>
      <RelatedStrip task="profile" related={related} />
    </>
  )
}

/* ------------------------------------------------------------------ *
   Shared building blocks
 * ------------------------------------------------------------------ */
function InfoGrid({ items }: { items: Array<[string, string, typeof MapPin]> }) {
  const visible = items.filter(([, value]) => value)
  if (!visible.length) return null
  return (
    <div className="mt-10 grid gap-px bg-[var(--tk-line)] sm:grid-cols-2">
      {visible.map(([label, value, Icon]) => (
        <div key={label} className="bg-[var(--tk-surface)] p-5">
          <div className="flex items-center gap-2 deco-label deco-label-sm text-[var(--tk-muted)]">
            <Icon className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> {label}
          </div>
          <p className="mt-3 break-words text-sm leading-6 text-[var(--tk-text)]">{value}</p>
        </div>
      ))}
    </div>
  )
}

function ImageStrip({ images, label, large = false }: { images: string[]; label: string; large?: boolean }) {
  if (!images.length) return null
  return (
    <section className="mt-12">
      <p className="deco-label deco-label-sm text-[var(--tk-accent)]">{label}</p>
      <div className={`mt-5 grid gap-3 ${large ? 'sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        {images.slice(0, large ? 4 : 8).map((image, index) => (
          <div key={`${image}-${index}`} className="deco-frame overflow-hidden">
            <img src={image} alt="" className="aspect-[4/3] w-full object-cover transition duration-[900ms] hover:scale-105" />
          </div>
        ))}
      </div>
    </section>
  )
}

function MapBox({ src, label }: { src: string; label: string }) {
  return (
    <div className="deco-frame overflow-hidden bg-[var(--tk-surface)]">
      <div className="flex items-center gap-2 border-b border-[var(--tk-line)] p-5 deco-label deco-label-sm text-[var(--tk-muted)]">
        <MapPin className="h-3.5 w-3.5 text-[var(--tk-accent)]" /> <span className="truncate">{label || 'Map location'}</span>
      </div>
      <iframe src={src} title="Map" loading="lazy" className="h-72 w-full border-0 grayscale-[35%]" />
    </div>
  )
}

function ContactAction({ website, phone, email, bare = false }: { website?: string; phone?: string; email?: string; bare?: boolean }) {
  if (!website && !phone && !email) return null
  const buttons = (
    <div className={`flex flex-wrap gap-2.5 ${bare ? 'justify-center' : ''}`}>
      {website ? <Link href={website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-[var(--tk-accent)] px-4 py-2.5 deco-label deco-label-sm text-[var(--tk-on-accent)] transition hover:brightness-110">Website <ExternalLink className="h-3.5 w-3.5" /></Link> : null}
      {phone ? <a href={`tel:${phone}`} className="inline-flex items-center gap-2 border border-[var(--tk-line)] px-4 py-2.5 deco-label deco-label-sm transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]"><Phone className="h-3.5 w-3.5" /> Call</a> : null}
      {email ? <a href={`mailto:${email}`} className="inline-flex items-center gap-2 border border-[var(--tk-line)] px-4 py-2.5 deco-label deco-label-sm transition hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]"><Mail className="h-3.5 w-3.5" /> Email</a> : null}
    </div>
  )
  if (bare) return <div className="mt-7">{buttons}</div>
  return (
    <div className="deco-frame bg-[var(--tk-surface)] p-7">
      <p className="deco-label deco-label-sm text-[var(--tk-accent)]">Quick actions</p>
      <div className="mt-5">{buttons}</div>
    </div>
  )
}

function BadgeLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border border-[var(--tk-line)] bg-[var(--tk-raised)] px-4 py-3">
      <span className="deco-label deco-label-sm text-[var(--tk-muted)]">{label}</span>
      <span className="text-sm font-medium text-[var(--tk-text)]">{value}</span>
    </div>
  )
}

function RelatedPanel({ task, post, related }: { task: TaskKey; post: SitePost; related: SitePost[] }) {
  const taskConfig = getTaskConfig(task)
  return (
    <div className="space-y-6">
      <div className="deco-frame bg-[var(--tk-surface)] p-7">
        <p className="deco-label deco-label-sm text-[var(--tk-accent)]">About this entry</p>
        <div className="mt-5 grid gap-3 text-sm text-[var(--tk-muted)]">
          <p className="inline-flex items-center gap-2"><Tag className="h-4 w-4 text-[var(--tk-accent)]" /> {taskConfig?.label || task}</p>
          <p className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--tk-accent)]" /> {SITE_CONFIG.name}</p>
          <p className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-[var(--tk-accent)]" /> {readMinutes(post)} min read</p>
        </div>
      </div>
      {related.length ? (
        <div className="deco-frame bg-[var(--tk-surface)] p-7">
          <div className="flex items-center justify-between gap-3">
            <h2 className="editable-display text-lg font-semibold tracking-[-0.02em]">More like this</h2>
            <Link href={taskConfig?.route || '/'} className="deco-label deco-label-sm text-[var(--tk-accent)]">All</Link>
          </div>
          <div className="mt-6 grid gap-3">
            {related.map((item) => <RelatedCard key={item.id || item.slug} task={task} post={item} />)}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function RelatedStrip({ task, related }: { task: TaskKey; related: SitePost[] }) {
  if (!related.length) return null
  const taskConfig = getTaskConfig(task)
  return (
    <section className="border-t border-[var(--tk-line)] bg-[var(--slot4-panel-bg)]">
      <div className="mx-auto w-full max-w-[var(--editable-container)] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="deco-label text-[var(--tk-accent)]">Keep reading</p>
            <h2 className="editable-display mt-4 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
              More {(taskConfig?.label || 'posts').toLowerCase()}
            </h2>
          </div>
          <Link
            href={taskConfig?.route || '/'}
            className="group inline-flex items-center gap-2 border border-[var(--tk-line)] px-5 py-3 deco-label deco-label-sm transition duration-500 hover:border-[var(--tk-accent)] hover:text-[var(--tk-accent)]"
          >
            View all <ArrowUpRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {related.map((item, index) => <RelatedCard key={item.id || item.slug} task={task} post={item} grid index={index} />)}
        </div>
      </div>
    </section>
  )
}

function RelatedCard({ task, post, grid = false, index = 0 }: { task: TaskKey; post: SitePost; grid?: boolean; index?: number }) {
  const image = getImages(post)[0]
  // Build the detail URL from the task route (e.g. /listing/<slug>) — the same
  // base the archive cards use. buildPostUrl() can fall back to /posts when the
  // task isn't in the enabled taskViews map, which 404s.
  const href = `${getTaskConfig(task)?.route || `/${task}`}/${post.slug}`

  if (grid) {
    return (
      <Link href={href} className="group deco-frame deco-lift block overflow-hidden bg-[var(--tk-surface)]">
        <div className="relative aspect-[16/10] overflow-hidden bg-[var(--tk-raised)]">
          {image ? (
            <img src={image} alt="" className="h-full w-full object-cover opacity-75 transition duration-[900ms] group-hover:scale-[1.05] group-hover:opacity-100" />
          ) : (
            <div className="flex h-full items-center justify-center"><FileText className="h-7 w-7 text-[var(--tk-muted)]" /></div>
          )}
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(8,1,4,0.8))]" />
          <span className="absolute left-4 top-4 editable-display text-base text-[var(--tk-accent)] drop-shadow-[0_0_10px_rgba(225,18,53,0.6)]">
            {toRomanNumeral(index + 1)}
          </span>
        </div>
        <div className="p-6">
          <h3 className="editable-display line-clamp-2 text-base font-semibold leading-snug tracking-[-0.01em] transition duration-500 group-hover:text-[var(--tk-accent)]">{post.title}</h3>
          <p className="mt-2.5 line-clamp-2 text-sm leading-6 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
        </div>
      </Link>
    )
  }

  return (
    <Link href={href} className="group flex gap-4 border border-[var(--tk-line)] p-3 transition duration-500 hover:border-[var(--tk-accent)] hover:bg-[var(--tk-raised)]">
      {image && task !== 'sbm' ? (
        <img src={image} alt="" className="h-16 w-16 shrink-0 object-cover opacity-80 transition group-hover:opacity-100" />
      ) : (
        <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-[var(--tk-raised)]"><FileText className="h-5 w-5 text-[var(--tk-muted)]" /></div>
      )}
      <div className="min-w-0">
        <h3 className="editable-display line-clamp-2 text-sm font-semibold leading-snug transition duration-500 group-hover:text-[var(--tk-accent)]">{post.title}</h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-[var(--tk-muted)]">{stripHtml(summaryText(post))}</p>
      </div>
    </Link>
  )
}

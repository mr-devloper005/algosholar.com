import Link from 'next/link'
import { ArrowRight, ChevronLeft } from 'lucide-react'
import type { SitePost, SiteFeedPagination } from '@/lib/site-connector'
import { CATEGORY_OPTIONS } from '@/lib/categories'
import { taskPageVoices } from '@/editable/content/task-pages.content'
import { pagesContent } from '@/editable/content/pages.content'
import { editableDesignContract as dc, editablePalette as pal, toRomanNumeral } from '@/editable/layouts/design-contract'
import { ArticleListCard, postHref } from '@/editable/cards/PostCards'

export function EditableArticleArchive({ posts, pagination, category = 'all', basePath = '/article' }: { posts: SitePost[]; pagination: SiteFeedPagination; category?: string; basePath?: string }) {
  const voice = taskPageVoices.article
  const page = pagination.page || 1
  const pageHref = (nextPage: number) => `${basePath}?${new URLSearchParams({ ...(category && category !== 'all' ? { category } : {}), page: String(nextPage) }).toString()}`
  return (
    <main className={dc.shell.page}>
      <section className={`${dc.shell.section} pt-12 sm:pt-16 lg:pt-20`}>
        <div className="deco-frame deco-corners bg-[var(--slot4-surface-bg)] p-7 sm:p-10 lg:p-14">
          <p className="deco-label deco-label-sm text-[var(--slot4-accent)]">{voice.eyebrow}</p>
          <div className="deco-rule mx-0 mt-6 max-w-[200px]"><span className="deco-diamond" /></div>
          <h1 className="editable-display mt-6 max-w-5xl text-5xl font-semibold tracking-[-0.02em] sm:text-6xl deco-glow">{voice.headline}</h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-[var(--slot4-muted-text)] sm:text-lg">{voice.description}</p>
          <form action={basePath} className="mt-8 flex max-w-xl flex-col gap-3 sm:flex-row">
            <select name="category" defaultValue={category || 'all'} className="min-w-0 flex-1 border border-[var(--slot4-line)] bg-[var(--slot4-page-bg)] px-5 py-3 text-sm font-medium text-[var(--slot4-page-text)] outline-none">
              <option value="all">All categories</option>
              {CATEGORY_OPTIONS.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
            </select>
            <button className="bg-[var(--slot4-accent)] px-6 py-3 deco-label deco-label-sm text-[var(--slot4-on-accent,#fff4f5)] transition hover:brightness-110">Filter</button>
          </form>
        </div>
      </section>

      <section className={`${dc.shell.section} ${dc.shell.sectionY}`}>
        {posts.length ? (
          <div className="grid gap-5">
            {posts.map((post, index) => <ArticleListCard key={post.id} post={post} href={postHref('article', post, basePath)} index={index + (page - 1) * pagination.limit} />)}
          </div>
        ) : (
          <div className="border border-dashed border-[var(--slot4-line)] bg-transparent p-8 text-center">
            <h2 className="editable-display text-3xl font-semibold">No articles found</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">Try another category or return to all articles.</p>
          </div>
        )}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {pagination.hasPrevPage ? <Link href={pageHref(page - 1)} className="border border-[var(--slot4-line)] px-5 py-3 deco-label deco-label-sm text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]">Previous</Link> : null}
          <span className="bg-[var(--slot4-accent)] px-5 py-3 deco-label deco-label-sm text-[var(--slot4-on-accent,#fff4f5)]">Page {toRomanNumeral(page)} of {toRomanNumeral(pagination.totalPages || 1)}</span>
          {pagination.hasNextPage ? <Link href={pageHref(page + 1)} className="border border-[var(--slot4-line)] px-5 py-3 deco-label deco-label-sm text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]">Next</Link> : null}
        </div>
      </section>
    </main>
  )
}

export function EditableArticleDetailShell({ slug, post }: { slug: string; post: SitePost | null }) {
  const voice = taskPageVoices.article
  return (
    <main className={dc.shell.page}>
      <section className={`${dc.shell.section} pt-10 sm:pt-14 lg:pt-16`}>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="deco-frame deco-corners bg-[var(--slot4-surface-bg)] p-6 sm:p-10">
            <Link href="/article" className="inline-flex items-center gap-2 border border-[var(--slot4-line)] px-4 py-2 deco-label deco-label-sm text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"><ChevronLeft className="h-4 w-4" /> Articles</Link>
            <p className="deco-label deco-label-sm mt-8 text-[var(--slot4-accent)]">{voice.eyebrow}</p>
            <h1 className="editable-display mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.02em] sm:text-5xl lg:text-6xl deco-glow">{post?.title || pagesContent.detailPages.article.fallbackTitle}</h1>
          </div>
          <aside className="border border-[var(--slot4-line)] bg-[var(--slot4-surface-bg)] p-6">
            <p className="deco-label deco-label-sm text-[var(--slot4-accent)]">Reading note</p>
            <p className="mt-4 text-sm leading-7 text-[var(--slot4-muted-text)]">{voice.secondaryNote}</p>
            <Link href="/contact" className="mt-6 inline-flex items-center gap-2 border border-[var(--slot4-line)] px-5 py-3 deco-label deco-label-sm text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]">Contact <ArrowRight className="h-3.5 w-3.5" /></Link>
          </aside>
        </div>
      </section>
      <section className="mx-auto w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pb-24">
        <div className="border border-[var(--slot4-line)] bg-[var(--slot4-surface-bg)] p-6 sm:p-8 lg:p-10">
          <p className="editable-read text-[1.05rem] leading-[1.85] text-[var(--slot4-muted-text)]">{post?.summary || `Article detail content for ${slug} will render through the editable detail page.`}</p>
        </div>
      </section>
    </main>
  )
}

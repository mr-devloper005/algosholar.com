import { SITE_CONFIG } from '@/lib/site-config'
import { pagesContent } from '@/editable/content/pages.content'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'

export default function AboutPage() {
  return (
    <EditableSiteShell>
      <main className="px-4 py-14 sm:px-6 lg:px-8">
        <section className="mx-auto grid max-w-[var(--editable-container)] gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="deco-frame deco-corners bg-[var(--slot4-surface-bg)] p-8 lg:p-12">
            <p className="deco-label deco-label-sm text-[var(--slot4-accent)]">{pagesContent.about.badge}</p>
            <div className="deco-rule mx-0 mt-6 max-w-[180px]"><span className="deco-diamond" /></div>
            <h1 className="editable-display mt-8 text-5xl font-semibold tracking-[-0.02em]">About {SITE_CONFIG.name}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-[var(--slot4-muted-text)]">{pagesContent.about.description}</p>
            <div className="mt-8 space-y-4 text-sm leading-8 text-[var(--slot4-muted-text)]">
              {pagesContent.about.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
          </article>
          <aside className="grid gap-px bg-[var(--slot4-line-faint)]">
            {pagesContent.about.values.map((value, index) => (
              <div key={value.title} className="bg-[var(--slot4-surface-bg)] p-6">
                <span className="editable-display text-sm text-[var(--slot4-accent)] opacity-40">{String(index + 1).padStart(2, '0')}</span>
                <h2 className="editable-display mt-3 text-xl font-semibold">{value.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--slot4-muted-text)]">{value.description}</p>
              </div>
            ))}
          </aside>
        </section>
      </main>
    </EditableSiteShell>
  )
}

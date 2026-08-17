'use client'

import { FormEvent, useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, ArrowUpRight, CheckCircle2, FileText, ImageIcon, Lock, PlusCircle, Send, Sparkles } from 'lucide-react'
import { SITE_CONFIG, type TaskKey } from '@/lib/site-config'
import { EditableSiteShell } from '@/editable/shell/EditableSiteShell'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'
import { pagesContent } from '@/editable/content/pages.content'

type DraftPost = {
  id: string
  task: TaskKey
  title: string
  category: string
  summary: string
  url: string
  image: string
  body: string
  createdAt: string
}

const STORE_KEY = 'slot4:created-posts'

const taskIcon: Record<string, typeof FileText> = {
  article: FileText,
  listing: Sparkles,
  classified: PlusCircle,
  image: ImageIcon,
  profile: Sparkles,
  pdf: FileText,
  sbm: ArrowRight,
}

const fieldClass = 'w-full border border-[var(--slot4-line)] bg-[var(--slot4-page-bg)] px-4 py-3 text-sm font-medium text-[var(--slot4-page-text)] outline-none transition placeholder:text-[var(--slot4-muted-text)] focus:border-[var(--slot4-accent)] focus:shadow-[0_0_24px_rgba(225,18,53,0.18)]'

const saveDraft = (draft: DraftPost) => {
  try {
    const existing = JSON.parse(window.localStorage.getItem(STORE_KEY) || '[]')
    const list = Array.isArray(existing) ? existing : []
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft, ...list].slice(0, 50)))
  } catch {
    window.localStorage.setItem(STORE_KEY, JSON.stringify([draft]))
  }
}

export default function CreatePage() {
  const { session } = useEditableLocalAuthSession()
  const enabledTasks = useMemo(() => SITE_CONFIG.tasks.filter((task) => task.enabled), [])
  const [task, setTask] = useState<TaskKey>((enabledTasks[0]?.key || 'article') as TaskKey)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [summary, setSummary] = useState('')
  const [url, setUrl] = useState('')
  const [image, setImage] = useState('')
  const [body, setBody] = useState('')
  const [created, setCreated] = useState<DraftPost | null>(null)

  const activeTask = enabledTasks.find((item) => item.key === task) || enabledTasks[0]

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const draft: DraftPost = {
      id: `draft-${Date.now()}`,
      task,
      title: title.trim(),
      category: category.trim() || 'uncategorized',
      summary: summary.trim(),
      url: url.trim(),
      image: image.trim(),
      body: body.trim(),
      createdAt: new Date().toISOString(),
    }
    saveDraft(draft)
    setCreated(draft)
    setTitle('')
    setCategory('')
    setSummary('')
    setUrl('')
    setImage('')
    setBody('')
  }

  if (!session) {
    return (
      <EditableSiteShell>
        <main className="min-h-screen px-4 py-16 sm:px-6 lg:px-8">
          <section className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[0.9fr_1.1fr]">
            <div className="flex h-full min-h-72 items-center justify-center border border-[var(--slot4-line)] bg-[var(--slot4-surface-bg)]">
              <Lock className="h-20 w-20 text-[var(--slot4-accent)] opacity-40" />
            </div>
            <div className="self-center">
              <p className="deco-label deco-label-sm text-[var(--slot4-accent)]">{pagesContent.create.locked.badge}</p>
              <div className="deco-rule mx-0 mt-6 max-w-[160px]"><span className="deco-diamond" /></div>
              <h1 className="editable-display mt-6 text-5xl font-semibold tracking-[-0.02em] sm:text-6xl">{pagesContent.create.locked.title}</h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-[var(--slot4-muted-text)]">{pagesContent.create.locked.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/login" className="inline-flex items-center gap-2 bg-[var(--slot4-accent)] px-6 py-3.5 deco-label deco-label-sm text-[var(--slot4-on-accent,#fff4f5)] transition hover:brightness-110">Login <ArrowUpRight className="h-3.5 w-3.5" /></Link>
                <Link href="/signup" className="inline-flex items-center gap-2 border border-[var(--slot4-line)] px-6 py-3.5 deco-label deco-label-sm text-[var(--slot4-page-text)] transition hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]">Sign up</Link>
              </div>
            </div>
          </section>
        </main>
      </EditableSiteShell>
    )
  }

  return (
    <EditableSiteShell>
      <main className="min-h-screen">
        <section className="mx-auto max-w-[var(--editable-container)] px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
            <aside>
              <p className="deco-label deco-label-sm text-[var(--slot4-accent)]">{pagesContent.create.hero.badge}</p>
              <div className="deco-rule mx-0 mt-6 max-w-[160px]"><span className="deco-diamond" /></div>
              <h1 className="editable-display mt-6 text-5xl font-semibold tracking-[-0.02em] sm:text-6xl">{pagesContent.create.hero.title}</h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-[var(--slot4-muted-text)]">{pagesContent.create.hero.description}</p>
              <div className="mt-8 grid gap-px bg-[var(--slot4-line-faint)] sm:grid-cols-2">
                {enabledTasks.map((item) => {
                  const Icon = taskIcon[item.key] || FileText
                  const active = item.key === task
                  return (
                    <button key={item.key} type="button" onClick={() => setTask(item.key)} className={`p-4 text-left transition ${active ? 'bg-[var(--slot4-accent)] text-[var(--slot4-on-accent,#fff4f5)]' : 'bg-[var(--slot4-surface-bg)] hover:bg-[var(--slot4-raised-bg,#1e0a12)]'}`}>
                      <Icon className="h-5 w-5" />
                      <span className="mt-3 block deco-label deco-label-sm">{item.label}</span>
                      <span className="mt-1 block text-xs opacity-65">{item.description}</span>
                    </button>
                  )
                })}
              </div>
            </aside>

            <form onSubmit={submit} className="deco-frame deco-corners bg-[var(--slot4-surface-bg)] p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="deco-label deco-label-sm text-[var(--slot4-muted-text)]">Create {activeTask?.label || 'post'}</p>
                  <h2 className="editable-display mt-2 text-3xl font-semibold tracking-[-0.02em]">{pagesContent.create.formTitle}</h2>
                </div>
                <span className="border border-[var(--slot4-line)] px-4 py-2 deco-label deco-label-sm text-[var(--slot4-accent)]">{session.name}</span>
              </div>

              <div className="mt-6 grid gap-4">
                <input className={fieldClass} value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Post title" required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <input className={fieldClass} value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Category" />
                  <input className={fieldClass} value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Website or source URL" />
                </div>
                <input className={fieldClass} value={image} onChange={(event) => setImage(event.target.value)} placeholder="Featured image URL" />
                <textarea className={`${fieldClass} min-h-24 resize-y py-3`} value={summary} onChange={(event) => setSummary(event.target.value)} placeholder="Short summary" required />
                <textarea className={`${fieldClass} min-h-48 resize-y py-3`} value={body} onChange={(event) => setBody(event.target.value)} placeholder="Main content, details, notes, or description" required />
              </div>

              {created ? (
                <div className="mt-5 border border-emerald-800/50 bg-emerald-950/30 p-4 text-emerald-300">
                  <p className="flex items-center gap-2 text-sm font-semibold"><CheckCircle2 className="h-5 w-5" /> {pagesContent.create.successTitle}</p>
                  <p className="mt-1 text-sm opacity-80">{created.title}</p>
                </div>
              ) : null}

              <button type="submit" className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 bg-[var(--slot4-accent)] px-6 deco-label deco-label-sm text-[var(--slot4-on-accent,#fff4f5)] transition hover:brightness-110 active:scale-[0.98]">
                <Send className="h-3.5 w-3.5" /> {pagesContent.create.submitLabel}
              </button>
            </form>
          </div>
        </section>
      </main>
    </EditableSiteShell>
  )
}

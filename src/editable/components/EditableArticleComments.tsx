'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { MessageCircle, Send } from 'lucide-react'

type Comment = { id: string; name: string; comment: string; createdAt: string }

const storageKey = (slug: string) => `editable:article-comments:${slug}`

function timeAgo(value?: string) {
  if (!value) return ''
  const then = new Date(value).getTime()
  if (Number.isNaN(then)) return ''
  const mins = Math.max(1, Math.floor((Date.now() - then) / 60000))
  if (mins < 60) return `${mins} min ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} ${days === 1 ? 'day' : 'days'} ago`
  return new Date(then).toLocaleDateString()
}

function initial(name: string) {
  return (name.trim()[0] || 'G').toUpperCase()
}

export function EditableArticleComments({ slug, comments = [] }: { slug: string; comments?: Comment[] }) {
  const [stored, setStored] = useState<Comment[]>([])
  const [name, setName] = useState('')
  const [text, setText] = useState('')

  // Load this article's comments after mount (initial render stays in sync with
  // the server so there's no hydration mismatch).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey(slug))
      setStored(raw ? (JSON.parse(raw) as Comment[]) : [])
    } catch {
      setStored([])
    }
  }, [slug])

  const persist = (next: Comment[]) => {
    setStored(next)
    try {
      window.localStorage.setItem(storageKey(slug), JSON.stringify(next))
    } catch {
      /* storage unavailable — keep the in-memory list */
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const body = text.trim()
    if (!body) return
    const entry: Comment = {
      id: `c-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim() || 'Guest',
      comment: body,
      createdAt: new Date().toISOString(),
    }
    persist([entry, ...stored])
    setText('')
  }

  // User comments (newest first) sit above any existing comments.
  const all = useMemo(() => [...stored, ...comments], [stored, comments])

  const fieldClass =
    'w-full border border-[var(--tk-line,var(--slot4-line))] bg-[var(--tk-bg,var(--slot4-page-bg))] px-4 text-sm text-[var(--tk-text,var(--slot4-page-text))] outline-none transition focus:border-[var(--tk-accent,var(--slot4-accent))] focus:shadow-[0_0_24px_rgba(225,18,53,0.18)]'

  return (
    <section className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-4 w-4 text-[var(--tk-accent,var(--slot4-accent))]" />
          <p className="deco-label text-[var(--tk-accent,var(--slot4-accent))]">Discussion</p>
        </div>
        <span className="deco-label deco-label-sm text-[var(--tk-muted,var(--slot4-muted-text))]">
          {String(all.length).padStart(2, '0')} {all.length === 1 ? 'reply' : 'replies'}
        </span>
      </div>

      <form onSubmit={submit} className="deco-frame mt-7 bg-[var(--tk-surface,var(--slot4-surface-bg))] p-6 sm:p-7">
        <label className="block deco-label deco-label-sm text-[var(--tk-muted,var(--slot4-muted-text))]" htmlFor={`comment-name-${slug}`}>
          Your name
        </label>
        <input
          id={`comment-name-${slug}`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Optional"
          maxLength={60}
          className={`${fieldClass} mt-3 h-12`}
        />
        <label className="mt-6 block deco-label deco-label-sm text-[var(--tk-muted,var(--slot4-muted-text))]" htmlFor={`comment-body-${slug}`}>
          Your thoughts
        </label>
        <textarea
          id={`comment-body-${slug}`}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Add to the conversation…"
          rows={4}
          maxLength={1500}
          className={`${fieldClass} mt-3 resize-y py-3.5 leading-7`}
        />
        <div className="mt-6 flex items-center justify-between gap-4">
          <span className="deco-label deco-label-sm text-[var(--tk-muted,var(--slot4-muted-text))]">
            {text.length}/1500
          </span>
          <button
            type="submit"
            disabled={!text.trim()}
            className="inline-flex items-center gap-2 bg-[var(--tk-accent,var(--slot4-accent))] px-7 py-3.5 deco-label deco-label-sm text-[var(--tk-on-accent,#fff4f5)] transition duration-500 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" /> Post
          </button>
        </div>
      </form>

      <div className="mt-7 grid gap-px bg-[var(--tk-line,var(--slot4-line-faint))]">
        {all.map((comment, index) => (
          <div key={comment.id} className="bg-[var(--tk-surface,var(--slot4-surface-bg))] p-6">
            <div className="flex items-center gap-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--tk-line,var(--slot4-line))] editable-display text-sm text-[var(--tk-accent,var(--slot4-accent))]">
                {initial(comment.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="editable-display truncate text-base font-semibold">{comment.name || 'Guest'}</p>
                {comment.createdAt ? (
                  <p className="mt-1 deco-label deco-label-sm text-[var(--tk-muted,var(--slot4-muted-text))]">{timeAgo(comment.createdAt)}</p>
                ) : null}
              </div>
              <span className="editable-display shrink-0 text-sm text-[var(--tk-accent,var(--slot4-accent))] opacity-40">
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
            <p className="editable-read mt-4 whitespace-pre-line text-[1.05rem] leading-[1.75] text-[var(--tk-text,var(--slot4-page-text))]/85">
              {comment.comment}
            </p>
          </div>
        ))}
        {!all.length ? (
          <div className="border border-dashed border-[var(--tk-line,var(--slot4-line))] bg-transparent px-6 py-12 text-center">
            <p className="deco-label deco-label-sm text-[var(--tk-muted,var(--slot4-muted-text))]">No replies yet — start the thread</p>
          </div>
        ) : null}
      </div>
    </section>
  )
}

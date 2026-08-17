import Link from 'next/link'
import { ArrowUpRight, SearchX } from 'lucide-react'
import { cn } from '@/lib/utils'

type EmptyStateProps = {
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  className?: string
}

export function EmptyState({
  title = 'Nothing filed here yet',
  description = 'New posts appear in this section automatically as soon as they are published.',
  actionLabel = 'Back to home',
  actionHref = '/',
  className,
}: EmptyStateProps) {
  return (
    <section className={cn('deco-frame deco-corners bg-[var(--slot4-surface-bg)] px-8 py-16 text-center', className)}>
      <div className="mx-auto flex h-14 w-14 items-center justify-center border border-[var(--slot4-line)] text-[var(--slot4-accent)]">
        <SearchX className="h-5 w-5" />
      </div>
      <div className="deco-rule mx-auto mt-8 max-w-[220px]">
        <span className="deco-diamond" />
      </div>
      <h2 className="editable-display mt-8 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">{title}</h2>
      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-[var(--slot4-muted-text)]">{description}</p>
      <Link
        href={actionHref}
        className="group mt-9 inline-flex items-center gap-2 border border-[var(--slot4-line)] px-6 py-3.5 deco-label deco-label-sm text-[var(--slot4-page-text)] transition duration-500 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
      >
        {actionLabel}
        <ArrowUpRight className="h-3.5 w-3.5 transition duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </Link>
    </section>
  )
}

export function TaskEmptyState({ taskLabel = 'posts', className }: { taskLabel?: string; className?: string }) {
  return (
    <EmptyState
      className={className}
      title={`No ${taskLabel} available yet`}
      description={`This section is ready and waiting — published ${taskLabel} will show up here as soon as they land.`}
      actionLabel="Explore the site"
      actionHref="/"
    />
  )
}

export function ContactSuccessState({ className }: { className?: string }) {
  return (
    <EmptyState
      className={className}
      title="Message received"
      description="Thanks for reaching out. Your note has been logged and will be picked up shortly."
      actionLabel="Return home"
      actionHref="/"
    />
  )
}

'use client'

import Link from 'next/link'
import { ArrowUpRight, Mail } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableFooter() {
  const taskLinks = SITE_CONFIG.tasks.filter((task) => task.enabled)
  const year = new Date().getFullYear()
  const { session, logout } = useEditableLocalAuthSession()

  const columns: Array<{ title: string; links: Array<[string, string]> }> = [
    {
      title: 'Sections',
      links: taskLinks.map((task) => [task.label, task.route] as [string, string]),
    },
    {
      title: 'Site',
      links: [
        ['About', '/about'],
        ['Contact', '/contact'],
        ['Search', '/search'],
        ...(session ? ([['Publish', '/create']] as Array<[string, string]>) : ([['Sign in', '/login'], ['Join', '/signup']] as Array<[string, string]>)),
      ],
    },
  ]

  return (
    <footer className="relative mt-auto border-t border-[var(--slot4-line-faint)] bg-[var(--editable-footer-bg)] text-[var(--editable-footer-text)]">
      <div className="h-px bg-[linear-gradient(90deg,transparent,var(--slot4-accent),transparent)] opacity-60" />

      <div className="mx-auto w-full max-w-[var(--editable-container)] px-4 sm:px-6 lg:px-8">
        {/* Masthead band */}
        <div className="grid gap-10 border-b border-[var(--slot4-line-faint)] py-14 lg:grid-cols-[1.3fr_repeat(2,minmax(0,0.7fr))_1fr]">
          <div className="min-w-0">
            <Link href="/" className="inline-flex flex-col">
              <span className="deco-label deco-label-sm text-[var(--slot4-accent)]">{globalContent.footer?.tagline || SITE_CONFIG.tagline}</span>
              <span className="editable-display mt-2 text-3xl font-semibold uppercase tracking-[0.05em]">{SITE_CONFIG.name}</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-[var(--slot4-muted-text)]">
              {globalContent.footer?.description || SITE_CONFIG.description}
            </p>
            <div className="deco-rule mt-7 max-w-[220px]">
              <span className="deco-diamond" />
            </div>
          </div>

          {columns.map((column) => (
            <div key={column.title} className="min-w-0">
              <h3 className="deco-label deco-label-sm text-[var(--slot4-accent)]">{column.title}</h3>
              <div className="mt-5 grid gap-3">
                {column.links.map(([label, href]) => (
                  <Link
                    key={`${column.title}-${href}`}
                    href={href}
                    className="group inline-flex items-center gap-1.5 text-sm text-[var(--slot4-muted-text)] transition duration-500 hover:text-[var(--slot4-page-text)]"
                  >
                    {label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition duration-500 group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                ))}
                {session && column.title === 'Site' ? (
                  <button type="button" onClick={logout} className="text-left text-sm text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)]">
                    Sign out
                  </button>
                ) : null}
              </div>
            </div>
          ))}

          <div className="min-w-0">
            <h3 className="deco-label deco-label-sm text-[var(--slot4-accent)]">Get in touch</h3>
            <p className="mt-5 text-sm leading-7 text-[var(--slot4-muted-text)]">
              Questions, corrections or a story worth covering — the door is open.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-flex items-center gap-2 border border-[var(--slot4-line)] px-5 py-3 deco-label deco-label-sm text-[var(--slot4-page-text)] transition duration-500 hover:border-[var(--slot4-accent)] hover:text-[var(--slot4-accent)]"
            >
              <Mail className="h-3.5 w-3.5" /> Contact
            </Link>
          </div>
        </div>

        {/* Colophon */}
        <div className="flex flex-col items-center gap-4 py-7 text-center sm:flex-row sm:justify-between sm:text-left">
          <p className="deco-label deco-label-sm text-[var(--slot4-soft-muted-text)]">
            © {year} {SITE_CONFIG.name}
          </p>
          <p className="deco-label deco-label-sm text-[var(--slot4-soft-muted-text)]">
            {globalContent.footer?.bottomNote || 'Published independently'}
          </p>
          <div className="flex items-center gap-3">
            <span className="deco-diamond opacity-70" />
            <span className="editable-display text-sm uppercase tracking-[0.28em] text-[var(--slot4-accent)]">{SITE_CONFIG.domain}</span>
            <span className="deco-diamond opacity-70" />
          </div>
        </div>
      </div>
    </footer>
  )
}

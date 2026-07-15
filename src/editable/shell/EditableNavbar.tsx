'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, Search, UserPlus, LogIn, X, PlusCircle, UserRound } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()
  const navItems = useMemo(
    () => SITE_CONFIG.tasks.filter((task) => task.enabled && task.key !== 'article').map((task) => ({ label: task.label, href: task.route })),
    []
  )

  return (
    <header className="sticky top-0 z-50 border-b border-[#5E244E] bg-[var(--editable-nav-bg)]/95 text-[var(--editable-nav-text)] shadow-[0_12px_50px_rgba(0,0,0,.45)] backdrop-blur-xl">
      <nav className="mx-auto flex min-h-[76px] w-full max-w-[var(--editable-container)] items-center gap-5 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex shrink-0 items-center gap-3 border-r border-[var(--editable-border)] pr-5">
          <span className="flex h-14 w-14 items-center justify-center overflow-hidden border border-[var(--slot4-accent)]/45 bg-[var(--slot4-surface-bg)] transition group-hover:border-[var(--slot4-accent)]">
            <img src="/favicon.png?v=20260413" alt={`${SITE_CONFIG.name} logo`} className="h-12 w-12 scale-[2.15] object-contain transition duration-300 group-hover:scale-[2.3]" />
          </span>
          <span className="hidden min-w-0 md:block">
            <span className="editable-display block max-w-[200px] truncate text-xl font-black uppercase leading-none tracking-[0.03em] text-[#FFE8B4]">{SITE_CONFIG.name}</span>
            <span className="mt-1 block max-w-[200px] truncate text-[10px] font-medium uppercase tracking-[0.26em] text-[var(--slot4-muted-text)]">
              {globalContent.nav?.tagline || SITE_CONFIG.tagline}
            </span>
          </span>
        </Link>

        <div className="hidden items-stretch gap-0 lg:flex">
          {navItems.slice(0, 5).map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex items-center px-4 text-[11px] font-semibold uppercase tracking-[0.22em] transition ${
                  active ? 'text-[var(--slot4-accent)]' : 'text-[var(--slot4-muted-text)] hover:text-[var(--slot4-page-text)]'
                }`}
              >
                {item.label}
                {active ? <span className="absolute inset-x-3 bottom-0 h-[2px] bg-[var(--slot4-accent)]" /> : null}
              </Link>
            )
          })}
        </div>

        <form action="/search" className="mx-auto hidden min-w-0 flex-1 justify-center md:flex">
          <label className="flex w-full max-w-md items-center gap-2 border-b border-[var(--slot4-accent)]/30 pb-2 transition focus-within:border-[var(--slot4-accent)]">
            <Search className="h-4 w-4 shrink-0 text-[var(--slot4-accent)]" />
            <input
              name="q"
              type="search"
              placeholder="Search posts"
              className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-[var(--slot4-muted-text)]"
            />
          </label>
        </form>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          {session ? (
            <>
              <span className="hidden max-w-32 items-center gap-2 truncate text-xs font-bold text-[#FFE8B4] md:inline-flex"><UserRound className="h-4 w-4" />{session.name}</span>
              <Link
                href="/create"
                className="hidden items-center gap-2 rounded-lg border border-[#E68457] bg-[linear-gradient(180deg,#AA1C41,#5E244E)] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#FFE8B4] shadow-[0_0_18px_rgba(230,132,87,.28)] transition hover:-translate-y-0.5 sm:inline-flex"
              >
                <PlusCircle className="h-3.5 w-3.5" /> Create
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden items-center gap-2 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-page-text)] sm:inline-flex"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden items-center gap-2 border border-[var(--editable-border)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--slot4-muted-text)] transition hover:border-[var(--slot4-accent)]/40 hover:text-[var(--slot4-page-text)] sm:inline-flex"
              >
                <LogIn className="h-3.5 w-3.5" /> Login
              </Link>
              <Link
                href="/signup"
                className="hidden items-center gap-2 border border-[var(--slot4-accent)] bg-[var(--editable-cta-bg)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--editable-cta-text)] transition hover:opacity-90 sm:inline-flex"
              >
                <UserPlus className="h-3.5 w-3.5" /> Sign up
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="border border-[var(--editable-border)] bg-[var(--slot4-surface-bg)] p-2 lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      <div className="h-px bg-[var(--editable-border)]" />

      {open ? (
        <div className="border-t border-[var(--editable-border)] bg-[var(--editable-nav-bg)] px-4 py-5 lg:hidden">
          <form action="/search" className="mb-5 flex items-center gap-2 border-b border-[var(--slot4-accent)]/30 pb-2">
            <Search className="h-4 w-4 text-[var(--slot4-accent)]" />
            <input name="q" type="search" placeholder="Search posts" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[var(--slot4-muted-text)]" />
          </form>
          <div className="grid gap-1">
            {session ? <p className="mb-2 flex items-center gap-2 border-b border-[var(--editable-border)] px-4 pb-4 text-sm font-bold text-[#FFE8B4]"><UserRound className="h-4 w-4" /> {session.name}</p> : null}
            {[{ label: 'Home', href: '/' }, ...navItems, { label: 'Contact', href: '/contact' }, ...(session ? [{ label: 'Create', href: '/create' }] : [{ label: 'Login', href: '/login' }, { label: 'Sign up', href: '/signup' }])].map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`border-l-2 px-4 py-3 text-sm font-semibold uppercase tracking-[0.16em] ${
                    active
                      ? 'border-[var(--slot4-accent)] bg-[var(--slot4-surface-bg)] text-[var(--slot4-accent)]'
                      : 'border-transparent text-[var(--slot4-muted-text)] hover:border-[var(--slot4-accent)]/40 hover:bg-[var(--slot4-surface-bg)]'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
            {session ? <button type="button" onClick={() => { logout(); setOpen(false) }} className="border-l-2 border-transparent px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.16em] text-[var(--slot4-muted-text)] hover:border-[var(--slot4-accent)] hover:text-white">Logout</button> : null}
          </div>
        </div>
      ) : null}
    </header>
  )
}

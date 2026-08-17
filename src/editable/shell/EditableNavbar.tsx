'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogIn, Menu, PenLine, Search, UserPlus, X } from 'lucide-react'
import { SITE_CONFIG } from '@/lib/site-config'
import { globalContent } from '@/editable/content/global.content'
import { useEditableLocalAuthSession } from '@/editable/components/EditableLocalAuthForms'

/*
  Crimson Deco navbar.

  Left: circular ornament controls (about + search toggle).
  Centre: the wordmark under a letterspaced presenter line.
  Right: an outlined pill action, exactly like the framed title card treatment.
*/

export function EditableNavbar() {
  const [open, setOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const pathname = usePathname()
  const { session, logout } = useEditableLocalAuthSession()

  const navItems = useMemo(
    () => SITE_CONFIG.tasks.filter((task) => task.enabled).map((task) => ({ label: task.label, href: task.route })),
    [],
  )

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close the overlays whenever the route changes.
  useEffect(() => {
    setOpen(false)
    setSearchOpen(false)
  }, [pathname])

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <header
      className={`sticky top-0 z-50 text-[var(--editable-nav-text)] transition-[background-color,box-shadow] duration-500 ${
        scrolled ? 'bg-[var(--editable-nav-bg)] shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      <div className="h-px bg-[linear-gradient(90deg,transparent,var(--slot4-accent),transparent)] opacity-70" />

      <nav className="mx-auto flex min-h-[84px] w-full max-w-[var(--editable-container)] items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo + Wordmark */}
        <Link href="/" className="group flex min-w-0 flex-1 items-center gap-3 lg:flex-none">
          <img src="/favicon.png" alt={SITE_CONFIG.name} className="h-10 w-10 shrink-0 object-contain" />
          <div className="flex min-w-0 flex-col">
            <span className="deco-label deco-label-sm text-[var(--slot4-accent)] opacity-90">
              {globalContent.nav?.tagline || SITE_CONFIG.tagline}
            </span>
            <span className="editable-display mt-1 block max-w-[240px] truncate text-2xl font-semibold uppercase leading-none tracking-[0.06em] transition duration-500 group-hover:text-[var(--slot4-accent)] sm:max-w-none">
              {SITE_CONFIG.name}
            </span>
          </div>
        </Link>

        {/* Primary links */}
        <div className="mx-auto hidden items-center gap-1 lg:flex">
          {[{ label: 'Home', href: '/' }, ...navItems.slice(0, 4), { label: 'About', href: '/about' }].map((item) => {
            const active = item.href === '/' ? pathname === '/' : isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 deco-label deco-label-sm transition duration-500 ${
                  active ? 'text-[var(--slot4-accent)]' : 'text-[var(--slot4-muted-text)] hover:text-[var(--slot4-page-text)]'
                }`}
              >
                {item.label}
                <span
                  className={`absolute inset-x-3 bottom-0 h-px bg-[var(--slot4-accent)] transition-transform duration-500 ${
                    active ? 'scale-x-100' : 'scale-x-0'
                  }`}
                />
              </Link>
            )
          })}
        </div>

        {/* Right actions */}
        <div className="ml-auto flex shrink-0 items-center gap-2">
          {session ? (
            <>
              <Link
                href="/create"
                className="hidden items-center gap-2 rounded-full border border-[var(--slot4-accent)] px-5 py-2.5 deco-label deco-label-sm text-[var(--slot4-accent)] transition duration-500 hover:bg-[var(--slot4-accent)] hover:text-[var(--editable-cta-text)] hover:shadow-[0_0_26px_rgba(225,18,53,0.45)] sm:inline-flex"
              >
                <PenLine className="h-3.5 w-3.5" /> Publish
              </Link>
              <button
                type="button"
                onClick={logout}
                className="hidden px-3 py-2 deco-label deco-label-sm text-[var(--slot4-muted-text)] transition hover:text-[var(--slot4-accent)] sm:inline-flex"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden items-center gap-2 px-3 py-2 deco-label deco-label-sm text-[var(--slot4-muted-text)] transition duration-500 hover:text-[var(--slot4-accent)] md:inline-flex"
              >
                <LogIn className="h-3.5 w-3.5" /> Sign in
              </Link>
              <Link
                href="/signup"
                className="hidden items-center gap-2 rounded-full border border-[var(--slot4-accent)] px-5 py-2.5 deco-label deco-label-sm text-[var(--slot4-accent)] transition duration-500 hover:bg-[var(--slot4-accent)] hover:text-[var(--editable-cta-text)] hover:shadow-[0_0_26px_rgba(225,18,53,0.45)] sm:inline-flex"
              >
                <UserPlus className="h-3.5 w-3.5" /> Join
              </Link>
            </>
          )}
          <button
            type="button"
            onClick={() => setSearchOpen((value) => !value)}
            aria-label="Toggle search"
            className="hidden h-10 w-10 shrink-0 items-center justify-center border border-[var(--slot4-line)] text-[var(--slot4-accent)] transition duration-500 hover:border-[var(--slot4-accent)] hover:shadow-[0_0_22px_rgba(225,18,53,0.35)] sm:flex lg:flex"
          >
            {searchOpen ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex h-10 w-10 shrink-0 items-center justify-center border border-[var(--slot4-line)] text-[var(--slot4-accent)] transition duration-500 hover:border-[var(--slot4-accent)] hover:shadow-[0_0_22px_rgba(225,18,53,0.35)] lg:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4.5 w-4.5" /> : <Menu className="h-4.5 w-4.5" />}
          </button>
        </div>
      </nav>

      {/* Slide-down search */}
      <div className={`overflow-hidden border-[var(--slot4-line-faint)] transition-[max-height,opacity] duration-500 ${searchOpen ? 'max-h-32 border-t opacity-100' : 'max-h-0 opacity-0'}`}>
        <form action="/search" className="mx-auto flex w-full max-w-[var(--editable-container)] items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
          <Search className="h-4 w-4 shrink-0 text-[var(--slot4-accent)]" />
          <input
            name="q"
            type="search"
            placeholder="Search articles, businesses and guides"
            className="min-w-0 flex-1 bg-transparent py-1 text-base outline-none"
          />
          <button className="rounded-full bg-[var(--slot4-accent)] px-5 py-2.5 deco-label deco-label-sm text-[var(--editable-cta-text)] transition hover:brightness-110">
            Search
          </button>
        </form>
      </div>

      <div className="h-px bg-[var(--slot4-line-faint)]" />

      {/* Mobile drawer */}
      {open ? (
        <div className="border-t border-[var(--slot4-line-faint)] bg-[var(--slot4-panel-bg)]/97 px-4 py-6 backdrop-blur-xl lg:hidden">
          <form action="/search" className="mb-6 flex items-center gap-3 border border-[var(--slot4-line)] px-4 py-3">
            <Search className="h-4 w-4 text-[var(--slot4-accent)]" />
            <input name="q" type="search" placeholder="Search this site" className="min-w-0 flex-1 bg-transparent text-sm outline-none" />
          </form>
          <div className="grid gap-px bg-[var(--slot4-line-faint)]">
            {[
              { label: 'Home', href: '/' },
              ...navItems,
              { label: 'About', href: '/about' },
              { label: 'Contact', href: '/contact' },
              ...(session ? [{ label: 'Publish', href: '/create' }] : [{ label: 'Sign in', href: '/login' }, { label: 'Join', href: '/signup' }]),
            ].map((item, index) => {
              const active = item.href === '/' ? pathname === '/' : isActive(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between bg-[var(--slot4-page-bg)] px-4 py-4 deco-label deco-label-sm transition ${
                    active ? 'text-[var(--slot4-accent)]' : 'text-[var(--slot4-muted-text)] hover:text-[var(--slot4-page-text)]'
                  }`}
                >
                  {item.label}
                  <span className="editable-display text-xs opacity-45">{String(index + 1).padStart(2, '0')}</span>
                </Link>
              )
            })}
          </div>
          {session ? (
            <button type="button" onClick={logout} className="mt-5 w-full border border-[var(--slot4-line)] px-4 py-3 deco-label deco-label-sm text-[var(--slot4-muted-text)]">
              Sign out
            </button>
          ) : null}
        </div>
      ) : null}
    </header>
  )
}

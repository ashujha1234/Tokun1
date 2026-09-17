










  




 











import { Suspense, lazy, useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Brain,
  ChevronDown,
  ExternalLink,
  Facebook,
  FileText,
  Instagram,
  LayoutDashboard,
  Linkedin,
  LogOut,
  MessageSquarePlus,
  Gift,
  Bookmark,
  ShoppingBag,
  Store,
  X,
  CheckCircle2,
  Mouse,
  Package,
  Play,
  Sparkles,
  Star,
  TrendingUp,
  Twitter,
  User as UserIcon,
  Users,
  Wallet,
  Zap,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useIsMobile } from '@/hooks/use-mobile'
import { useFreelancerMenu } from '@/hooks/useFreelancerMenu'
// The shared footer. This file used to define a private `Footer()` of its own
// further down, which shadowed this import — so any link added to the real
// footer (Refund Policy, Report Policy) never showed up on the landing page.
import Footer from '@/components/Footer'
import CookieConsentBanner from '@/components/CookieConsentBanner'
import CanvasErrorBoundary from '@/components/CanvasErrorBoundary'
/* The site bar, shared with every other page — see the note on LandingNav
   below. TokunLogo comes from there too, so the mark is one component. */
import SiteNav, { TokunLogo } from '@/components/SiteNav'
import { prefetchLandingRoutes } from '@/lib/prefetchRoutes'
import { useMode } from '@/contexts/ModeContext'
import { MODE_UI_ENABLED } from '@/lib/mode'
import './landing-page.css'

// Original mark — see the note in components/SiteNav.tsx.
const TOKUN_LOGO_SRC = '/icons/Tokun.png'
const API_BASE = ((import.meta as any).env?.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '')

/* Routes — apni app ke hisaab se yahan badal sakte ho */
const ROUTES = {
  login: '/login',
  signup: '/signup',
  app: '/app',
  promptLibrary: '/prompt-library',
  smartgen: '/smartgen',
  optimizer: '/prompt-optimization',
  marketplace: '/prompt-marketplace',
  findCreators: '/find-creators',
  dashboard: '/self-dash',
}

/* ============================================================
   Shared motion variant
   ============================================================ */

/* Scroll reveal.
 *
 * Every section of this page starts invisible and animates in when it reaches
 * the viewport, and the old numbers made that read as the page still loading:
 * a card waited until it was 60px INSIDE the view (see REVEAL_VIEWPORT below),
 * then waited out a stagger of up to 0.6s, then took another 0.65s to fade —
 * so at a normal scroll speed you arrived at blank space and watched it fill in
 * behind you.
 *
 * Same effect, retimed to finish before you get there: it starts well above the
 * fold, the per-card stagger is short and capped, and the fade is quick. The
 * travel is smaller too, since a 36px slide is what makes a late reveal read as
 * "jumping into place".
 */
/**
 * `style={}` when it carries CSS custom properties.
 *
 * React's CSSProperties has no index signature for `--*`, so every
 * `style={{ '--foo': x }}` on this page was an excess-property error — nine of
 * them, and this file animates almost entirely through custom properties.
 *
 * Spread rather than casting the whole style object, so the REAL properties
 * beside them stay type-checked: `{ left, top, ...cssVars({ '--token-delay': x }) }`
 * still catches a typo in `left`, where `{ left, '--token-delay': x } as
 * React.CSSProperties` would silence that too.
 */
const cssVars = (vars: Record<string, string | number>) => vars as React.CSSProperties

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.38,
      // Capped: a six-card grid used to spend 0.6s on the stagger alone, so the
      // last card in a row appeared long after the first.
      delay: Math.min(i, 3) * 0.05,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
}

/* Positive rootMargin — the reveal is armed 260px BEFORE the element scrolls
   into view, which is roughly a scroll-wheel notch of lead time. The values
   here were negative ('-40px' … '-80px'), which does the opposite: it shrinks
   the trigger box so the element has to be well inside the screen first. That
   single sign is most of what made the page feel like it was loading as you
   went down it. */
const REVEAL_VIEWPORT = { once: true, margin: '260px 0px 260px 0px' }

/* ============================================================
   Hooks
   ============================================================ */

function useIsInViewport(ref, { rootMargin = '0px' } = {}) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { rootMargin }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, rootMargin])

  return isVisible
}

function usePageVisible() {
  const [visible, setVisible] = useState(
    typeof document === 'undefined' ? true : document.visibilityState === 'visible'
  )

  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  return visible
}

/* ============================================================
   TokunLogo (image with text fallback)
   ============================================================ */

/* TokunLogo now lives in components/SiteNav.tsx and is imported at the top of
   this file — the landing bar and the bar on every other page are one component,
   so the mark has to be one component too.

   It also lost its animations there: a hover spring plus a permanent float, both
   writing `transform` on the same element the scroll-condense scales, which made
   the logo grow and slide right when you hovered it after scrolling. The hover
   glow (a filter, in landing-page.css) is what's left. */

/* ============================================================
   HeroAccountMenu — logged-in user ka naam + dropdown
   (naye Promptverse design ke hisaab se, self-contained)
   ============================================================ */

function HeroAccountMenu() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  // Shared with Header.tsx's account dropdown, which is the other copy of this
  // menu. `modals` is rendered below the panel rather than inside it, so closing
  // the menu doesn't take the wizard with it.
  const freelancerMenu = useFreelancerMenu()

  // Which half of the app this menu is being read in — the other copy of this
  // menu splits its items the same way, so both have to ask.
  const { mode, setMode, canShowToggle, shows } = useMode()

  const toTitleCase = (value: string) =>
    value
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')

  const fullName = user?.name?.trim()
    ? toTitleCase(user.name.trim())
    : (user?.email ? user.email.split('@')[0] : 'User')

  /* Two letters on a phone, the greeting everywhere else.
     This button is inline-flex with whiteSpace: nowrap and no width limit, so
     "Hello, Ashutosh Kumar Jha" simply grew until it pushed out of the header
     and over the page. components/Header.tsx already solves this by collapsing
     to initials; this is the landing page's own copy of that menu, and it never
     got the same treatment.
     Initials from the name's first two words, falling back to the first two
     characters of a single word or an email local-part — so there are always
     two, which is what keeps the pill a predictable size. */
  const initials = useMemo(() => {
    const source = user?.name?.trim() || user?.email?.split('@')[0] || 'User'
    const words = source.split(/[\s._-]+/).filter(Boolean)
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
    }
    return source.slice(0, 2).toUpperCase()
  }, [user?.name, user?.email])

  const isPhone = useIsMobile()
  const plan = user?.plan || 'free'

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const go = (path) => {
    setOpen(false)
    navigate(path)
  }

  const handleLogout = () => {
    setOpen(false)
    logout()
    navigate('/login')
  }

  const planGradient =
    plan === 'pro'
      ? 'linear-gradient(90deg,#a855f7,#38bdf8)'
      : plan === 'enterprise'
      ? 'linear-gradient(90deg,#FACC15,#CA8A04)'
      : null

  const primaryItems = [
    // "Set up profile" read like an unfinished chore even for someone whose
    // profile was long since complete. Same wording as the Header's account
    // menu: this is simply where your account lives.
    {
      label: 'My Account',
      icon: UserIcon,
      onClick: () => {
        /* Both spellings, because they come from different places: the auth
           context types `_id`, while some endpoints hand back `id`. The cast
           names that rather than leaving `.id` as a property error. */
        const id = user?._id || (user as { id?: string } | null)?.id
        go(id ? `/profile/${id}` : '/profile')
      },
    },
    // Same entry as the Header's account menu, from the same hook — its label
    // tracks whether the user has no profile, a draft, or a live one. Dropped
    // once the profile is ACTIVE, because then it only points back at My
    // Account and the menu looks like it holds two profiles.
    ...(freelancerMenu.status === 'ACTIVE'
      ? []
      : [
          {
            label: freelancerMenu.label,
            icon: Briefcase,
            onClick: () => {
              setOpen(false)
              freelancerMenu.open()
            },
          },
        ]),
    /* "My Wallet" was here too — this menu is a second copy of the Header's
       account menu, so it has to be kept in step or the same dropdown shows
       different items depending on which page you opened it from. Hidden for
       the same reason: payments settle through Razorpay and seller earnings go
       to a linked account, so there is no balance to manage day to day. */
    /* The mode switch, same row the Header's menu carries. Without it the
       landing page is the one place you cannot change mode from the menu —
       and the pill in the bar hides its labels on a narrow screen, so on a
       phone this row IS the switch. */
    ...(MODE_UI_ENABLED && canShowToggle
      ? [{
          // Capitalised to match the pill and the Header's copy of this menu.
          label: mode === 'creator' ? 'Switch to Buyer mode' : 'Switch to Creator mode',
          icon: mode === 'creator' ? ShoppingBag : Store,
          onClick: () => {
            setOpen(false)
            setMode(mode === 'creator' ? 'buyer' : 'creator')
          },
        }]
      : []),
    ...(shows('sellerDashboard') || !MODE_UI_ENABLED
      ? [{ label: 'Dashboard', icon: LayoutDashboard, onClick: () => go('/self-dash') }]
      : []),
    /* Kept in step with the Header's account menu — one page, two sub-tabs,
       two names. This still said "My Products" and pointed at the purchased
       half while the Header had already split them, so the same dropdown
       named the same destination differently depending on where you opened
       it from. */
    ...(!MODE_UI_ENABLED
      ? [{ label: 'My Products', icon: Package, onClick: () => go('/self-dash?tab=prompts&p=purchased') }]
      : [
          // Purchases in both modes; listings only where there is a selling
          // half. Same as the Header's copy of this menu.
          { label: 'My Purchases', icon: Package, onClick: () => go('/self-dash?tab=prompts&p=purchased') },
          ...(shows('listings')
            ? [{ label: 'My Listings', icon: Package, onClick: () => go('/self-dash?tab=prompts&p=uploaded') }]
            : []),
        ]),
    /* Saved. In BOTH modes and on every page that has this menu — you save
       products and you save creators, and neither stops being worth keeping
       because you switched which half of the app you are looking at. It was
       missing here entirely: the Header grew it when the mode pill took its
       slot in the action row, and this copy never got it. */
    { label: 'Saved', icon: Bookmark, onClick: () => go('/saved') },
    // Kept in step with the Header's account menu — same entry, same target.
    { label: 'Refer & Earn', icon: Gift, onClick: () => go('/refer') },
  ]

  const secondaryItems = [
    // Buyer-side, matching the Header's menu — feedback and refunds are things
    // you left or asked for as a buyer.
    ...(shows('feedback') ? [{ label: 'My Feedback', onClick: () => go('/my-feedback') }] : []),
    // Kept in step with the Header's account menu — this is a second copy of the
    // same menu, so anything added there has to be added here too or the landing
    // page quietly falls behind (the footer had exactly this problem).
    ...(shows('refunds') ? [{ label: 'My Refunds', onClick: () => go('/my-refunds') }] : []),
    { label: 'Pricing', onClick: () => go('/subscription') },
    { label: 'Support', onClick: () => go('/support') },
  ]

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          height: 40,
          padding: '0 8px 0 16px',
          borderRadius: 999,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          color: '#fff',
          cursor: 'pointer',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 600,
          fontSize: 14,
          whiteSpace: 'nowrap',
        }}
      >
        {planGradient ? (
          <span
            style={{
              background: planGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {isPhone ? initials : `Hello, ${fullName}`}
          </span>
        ) : (
          <>
            <span>{isPhone ? initials : `Hello, ${fullName}`}</span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 6,
                background: 'rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.75)',
              }}
            >
              FREE
            </span>
          </>
        )}
        <span
          style={{
            display: 'grid',
            placeItems: 'center',
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: '#fff',
          }}
        >
          <ChevronDown size={14} color="#000" />
        </span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 10px)',
            width: 230,
            padding: 8,
            borderRadius: 16,
            background: 'rgba(20,18,30,0.92)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.10)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
            zIndex: 100,
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* An email has no spaces in it, so there is nothing for the browser to
              break on: `anandapadmanabhan.s@techverse.world` is wider than this
              230px card and simply ran out the side of it, over the page.

              `overflowWrap: anywhere` lets it break mid-word onto a second line,
              which keeps the whole address readable — the point of showing it is
              so somebody can tell WHICH account they're signed in as, and half an
              address with an ellipsis often can't answer that. The name is capped
              at one line with an ellipsis instead, since a long name stays
              recognisable from its start, and `title` still gives the full one on
              hover. */}
          <div style={{ padding: '8px 10px 12px', minWidth: 0 }}>
            <div
              title={fullName}
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: '#fff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {fullName}
            </div>
            <div
              title={user?.email || ''}
              style={{
                fontSize: 12,
                color: 'rgba(255,255,255,0.55)',
                overflowWrap: 'anywhere',
                lineHeight: 1.35,
                marginTop: 2,
              }}
            >
              {user?.email || ''}
            </div>
          </div>

          {primaryItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 10px',
                borderRadius: 10,
                background: 'transparent',
                border: 'none',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 14,
                textAlign: 'left',
                transition: 'background 0.18s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(270.19deg, #1A73E8 0.16%, #FF14EF 99.84%)'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
              }}
            >
              <item.icon size={16} />
              {item.label}
            </button>
          ))}

          <div style={{ height: 1, background: 'rgba(255,255,255,0.08)', margin: '6px 4px' }} />

          {secondaryItems.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={item.onClick}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '9px 10px',
                borderRadius: 10,
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.85)',
                cursor: 'pointer',
                fontSize: 14,
                transition: 'background 0.18s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(270.19deg, #1A73E8 0.16%, #FF14EF 99.84%)'
                e.currentTarget.style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
              }}
            >
              {item.label}
            </button>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '10px 10px',
              marginTop: 4,
              borderRadius: 10,
              background: 'transparent',
              border: 'none',
              color: '#ff6b6b',
              cursor: 'pointer',
              fontSize: 14,
              textAlign: 'left',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,107,107,0.08)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}

      {/* Outside the `open &&` panel above on purpose: the panel is unmounted
          when the menu closes, and clicking the freelancer item closes it. */}
      {freelancerMenu.modals}
    </div>
  )
}

/* ============================================================
   TokunAiAura
   ============================================================ */

const TITLE_ORBIT_RINGS = [
  { radius: 118, duration: 28, reverse: false, nodes: 3, offset: 0 },
  { radius: 142, duration: 36, reverse: true, nodes: 4, offset: 45 },
  { radius: 168, duration: 44, reverse: false, nodes: 3, offset: 90 },
]

const PAGE_ORBIT_RINGS = [
  { radius: 160, duration: 32, reverse: false, nodes: 4, offset: 0 },
  { radius: 200, duration: 40, reverse: true, nodes: 5, offset: 36 },
  { radius: 240, duration: 48, reverse: false, nodes: 4, offset: 72 },
]

const SYNAPSES = [
  { x1: '12%', y1: '22%', x2: '88%', y2: '28%' },
  { x1: '88%', y1: '28%', x2: '94%', y2: '62%' },
  { x1: '94%', y1: '62%', x2: '72%', y2: '88%' },
  { x1: '72%', y1: '88%', x2: '28%', y2: '88%' },
  { x1: '28%', y1: '88%', x2: '6%', y2: '62%' },
  { x1: '6%', y1: '62%', x2: '12%', y2: '22%' },
  { x1: '50%', y1: '10%', x2: '50%', y2: '90%' },
  { x1: '12%', y1: '22%', x2: '72%', y2: '88%' },
  { x1: '88%', y1: '28%', x2: '28%', y2: '88%' },
]

const TITLE_FLOATING_TOKENS = [
  { text: '{product}', x: '4%', y: '18%', delay: 0 },
  { text: '01', x: '90%', y: '14%', delay: 1.2 },
  { text: 'λ', x: '92%', y: '72%', delay: 0.6 },
  { text: '⟨AI⟩', x: '2%', y: '68%', delay: 1.8 },
  { text: 'token', x: '78%', y: '90%', delay: 2.4 },
  { text: '◇', x: '18%', y: '92%', delay: 3 },
]

const PAGE_FLOATING_TOKENS = [
  { text: '{product}', x: '6%', y: '14%', delay: 0 },
  { text: '01', x: '88%', y: '10%', delay: 1.2 },
  { text: 'λ', x: '94%', y: '38%', delay: 0.6 },
  { text: '⟨AI⟩', x: '3%', y: '42%', delay: 1.8 },
  { text: 'token', x: '82%', y: '62%', delay: 2.4 },
  { text: '◇', x: '10%', y: '72%', delay: 3 },
]

const AMBIENT_SYNAPSES = SYNAPSES.slice(0, 5)

function buildDataBits(count, scale = 1) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360
    const radius = (95 + (i % 4) * 18) * scale
    const r2 = radius + 12 * scale
    const toXY = (deg, r) => ({
      x: Math.cos((deg * Math.PI) / 180) * r,
      y: Math.sin((deg * Math.PI) / 180) * r * 0.45,
    })
    const p0 = toXY(angle, radius)
    const p1 = toXY(angle + 40, r2)
    const p2 = toXY(angle + 80, radius)
    return {
      id: i,
      duration: 3 + (i % 5) * 0.8,
      delay: i * 0.25,
      char: i % 2 === 0 ? '1' : '0',
      p0,
      p1,
      p2,
    }
  })
}

const TITLE_DATA_BITS = buildDataBits(16)
const PAGE_DATA_BITS = buildDataBits(28, 1.65)
const AMBIENT_DATA_BITS = buildDataBits(12, 1.5)

function OrbitRing({ radius, duration, reverse, nodes, offset }) {
  return (
    <div
      className={`tokun-ai-aura__ring${reverse ? ' tokun-ai-aura__ring--reverse' : ''}`}
      style={cssVars({ '--orbit-duration': `${duration}s` })}
    >
      {Array.from({ length: nodes }).map((_, i) => {
        const angle = offset + (360 / nodes) * i
        return (
          <div
            key={i}
            className="tokun-ai-aura__orbit-node"
            style={{ transform: `rotate(${angle}deg) translateY(-${radius}px)` }}
          >
            <span
              className="tokun-ai-aura__node-core"
              style={cssVars({ '--node-delay': `${i * 0.3}s` })}
            />
          </div>
        )
      })}
    </div>
  )
}

function TokunAiAura({ variant = 'title' }) {
  const rootRef = useRef(null)
  const isVisible = useIsInViewport(rootRef, { rootMargin: '80px' })
  const gradId = useId()

  const isPage = variant === 'page'
  const isAmbient = variant === 'ambient'
  const isSpread = isPage || isAmbient

  const orbitRings = isPage ? PAGE_ORBIT_RINGS : isAmbient ? [] : TITLE_ORBIT_RINGS
  const floatingTokens = isSpread ? PAGE_FLOATING_TOKENS : TITLE_FLOATING_TOKENS
  const dataBits = isPage ? PAGE_DATA_BITS : isAmbient ? AMBIENT_DATA_BITS : TITLE_DATA_BITS
  const synapses = isAmbient ? AMBIENT_SYNAPSES : SYNAPSES
  const showOrbits = !isAmbient && orbitRings.length > 0
  const showScan = !isAmbient

  return (
    <div
      ref={rootRef}
      className={`tokun-ai-aura tokun-ai-aura--${variant}${isVisible ? '' : ' tokun-ai-aura--paused'}`}
      aria-hidden="true"
    >
      <div className="tokun-ai-aura__pulse" />

      <svg className="tokun-ai-aura__synapses" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(56, 189, 248, 0)" />
            <stop offset="50%" stopColor="rgba(168, 85, 247, 0.8)" />
            <stop offset="100%" stopColor="rgba(244, 114, 182, 0)" />
          </linearGradient>
        </defs>
        {synapses.map((line, i) => (
          <line
            key={i}
            className="tokun-ai-aura__synapse"
            x1={line.x1}
            y1={line.y1}
            x2={line.x2}
            y2={line.y2}
            stroke={`url(#${gradId})`}
            strokeWidth="0.15"
            vectorEffect="non-scaling-stroke"
            strokeDasharray="2 4"
            style={cssVars({ '--synapse-delay': `${i * 0.15}s` })}
          />
        ))}
        {!isAmbient && (
          <circle className="tokun-ai-aura__core" cx="50" cy="50" r="1.2" fill="rgba(168, 85, 247, 0.6)" />
        )}
      </svg>

      {showOrbits && (
        <div className="tokun-ai-aura__orbits">
          {orbitRings.map((ring, i) => (
            <OrbitRing key={i} {...ring} />
          ))}
        </div>
      )}

      <div className="tokun-ai-aura__bits">
        {dataBits.map((bit) => (
          <span
            key={bit.id}
            className="tokun-ai-aura__bit"
            style={cssVars({
              '--bit-duration': `${bit.duration}s`,
              '--bit-delay': `${bit.delay}s`,
              '--bit-x0': `${bit.p0.x}px`,
              '--bit-y0': `${bit.p0.y}px`,
              '--bit-x1': `${bit.p1.x}px`,
              '--bit-y1': `${bit.p1.y}px`,
              '--bit-x2': `${bit.p2.x}px`,
              '--bit-y2': `${bit.p2.y}px`,
            })}
          >
            {bit.char}
          </span>
        ))}
      </div>

      {floatingTokens.map((token) => (
        <span
          key={token.text + token.x}
          className="tokun-ai-aura__token"
          style={{ left: token.x, top: token.y, ...cssVars({ '--token-delay': `${token.delay}s` }) }}
        >
          {token.text}
        </span>
      ))}

      {showScan && <div className="tokun-ai-aura__scan" />}
    </div>
  )
}

/* ============================================================
   TokunTitle (letter gradients + aura)
   ============================================================ */

const TITLE_LETTERS = [
  { char: 'T', className: 'tokun-title__letter--t' },
  { char: 'O', className: 'tokun-title__letter--o' },
  { char: 'K', className: 'tokun-title__letter--k' },
  { char: 'U', className: 'tokun-title__letter--u' },
  { char: 'N', className: 'tokun-title__letter--n' },
]

function TokunTitle() {
  return (
    <div className="tokun-title">
      <div className="tokun-title__stage">
        <TokunAiAura />
        <h1 className="tokun-title__word" aria-label="TOKUN">
          {TITLE_LETTERS.map(({ char, className }, i) => (
            <span key={char + i} className={`tokun-title__letter ${className}`}>
              {char}
            </span>
          ))}
        </h1>
      </div>
    </div>
  )
}

/* ============================================================
   TypingSubtitle
   ============================================================ */

const QUIET = 'Enter the'
const ACCENT = 'Productverse'
const FULL_TEXT = `${QUIET} ${ACCENT}`

const TYPE_MS = 85
const DELETE_MS = 45
const PAUSE_TYPED_MS = 2200
const PAUSE_EMPTY_MS = 600

function TypingSubtitle() {
  const [count, setCount] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const handler = (e) => setReducedMotion(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (reducedMotion) return

    const isComplete = count === FULL_TEXT.length
    const isEmpty = count === 0

    let delay
    if (!deleting && !isComplete) delay = TYPE_MS
    else if (!deleting && isComplete) delay = PAUSE_TYPED_MS
    else if (deleting && !isEmpty) delay = DELETE_MS
    else delay = PAUSE_EMPTY_MS

    const timer = setTimeout(() => {
      if (!deleting && !isComplete) setCount((c) => c + 1)
      else if (!deleting && isComplete) setDeleting(true)
      else if (deleting && !isEmpty) setCount((c) => c - 1)
      else setDeleting(false)
    }, delay)

    return () => clearTimeout(timer)
  }, [count, deleting, reducedMotion])

  const effectiveCount = reducedMotion ? FULL_TEXT.length : count
  const visible = FULL_TEXT.slice(0, effectiveCount)

  let quietPart = ''
  let showSpace = false
  let accentPart = ''

  if (visible.length <= QUIET.length) {
    quietPart = visible
  } else {
    quietPart = QUIET
    showSpace = visible.length > QUIET.length
    accentPart = visible.slice(QUIET.length + 1)
  }

  return (
    <span className="typing-subtitle" aria-label={FULL_TEXT}>
      {quietPart && <span className="hero__subtitle-quiet">{quietPart}</span>}
      {showSpace && (
        <span className="typing-subtitle__space" aria-hidden="true">
          {' '}
        </span>
      )}
      {accentPart && <span className="hero__subtitle-accent">{accentPart}</span>}
      {!reducedMotion && <span className="typing-subtitle__cursor" aria-hidden="true" />}
    </span>
  )
}

/* ============================================================
   AnimatedCounter
   ============================================================ */

function parseStatValue(value) {
  if (!/^[\d.]+/.test(value)) return null
  const match = value.match(/^([\d.]+)(.*)$/)
  if (!match) return null
  return { num: parseFloat(match[1]), suffix: match[2] }
}

function AnimatedCounter({ value, duration = 2 }) {
  const ref = useRef(null)
  /* Positive margin, for the same reason as REVEAL_VIEWPORT: at '-50px' the
     count only started once the number was already on screen, so a 2s count-up
     was still running long after the reader had passed it — the stat read as
     stuck on 0 while the rest of the row had settled. */
  const isInView = useInView(ref, { once: true, margin: '260px' })
  const parsed = parseStatValue(value)
  const motionValue = useMotionValue(0)
  const spring = useSpring(motionValue, { duration: duration * 1000, bounce: 0 })

  useEffect(() => {
    if (isInView && parsed) motionValue.set(parsed.num)
  }, [isInView, motionValue, parsed])

  useEffect(() => {
    if (!parsed) return
    const el = ref.current
    if (!el) return

    return spring.on('change', (v) => {
      const formatted = Number.isInteger(parsed.num) ? Math.round(v) : v.toFixed(1)
      el.textContent = `${formatted}${parsed.suffix}`
    })
  }, [spring, parsed])

  const initial = parsed ? `0${parsed.suffix}` : value

  return <span ref={ref}>{initial}</span>
}

/* ============================================================
   HeroBackground
   ============================================================ */

const WAVES = [
  'M0,200 Q200,120 400,200 T800,200 T1200,200',
  'M0,220 Q250,140 500,220 T1000,220 T1500,220',
  'M0,240 Q300,160 600,240 T1200,240 T1800,240',
  'M0,260 Q350,180 700,260 T1400,260 T2100,260',
  'M0,280 Q400,200 800,280 T1600,280 T2400,280',
]

const PARTICLES_FULL = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: 15 + Math.random() * 70,
  y: 20 + Math.random() * 60,
  size: 1.5 + Math.random() * 2.5,
  delay: Math.random() * 4,
  duration: 3 + Math.random() * 4,
}))

const PARTICLES_SUBTLE = Array.from({ length: 8 }, (_, i) => ({
  id: i,
  x: 20 + (i * 9) % 60,
  y: 15 + (i * 11) % 50,
  size: 1.5 + (i % 2),
  delay: i * 0.6,
  duration: 5 + (i % 3),
}))

function HeroBackground({ variant = 'full' }) {
  const isSubtle = variant === 'subtle'
  const particles = isSubtle ? PARTICLES_SUBTLE : PARTICLES_FULL
  const waves = isSubtle ? WAVES.slice(0, 2) : WAVES
  const rootRef = useRef(null)
  const isVisible = useIsInViewport(rootRef, { rootMargin: '100px' })
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 })
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 })

  const blob1X = useTransform(springX, [-1, 1], [-30, 30])
  const blob1Y = useTransform(springY, [-1, 1], [-20, 20])
  const blob2X = useTransform(springX, [-1, 1], [20, -20])
  const blob2Y = useTransform(springY, [-1, 1], [15, -15])

  useEffect(() => {
    if (!isVisible || isSubtle) return

    let frame = 0
    let pendingX = 0
    let pendingY = 0

    const handleMove = (e) => {
      pendingX = (e.clientX / window.innerWidth) * 2 - 1
      pendingY = (e.clientY / window.innerHeight) * 2 - 1
      if (frame) return
      frame = requestAnimationFrame(() => {
        mouseX.set(pendingX)
        mouseY.set(pendingY)
        frame = 0
      })
    }

    window.addEventListener('mousemove', handleMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', handleMove)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [isVisible, isSubtle, mouseX, mouseY])

  return (
    <div
      ref={rootRef}
      className={`hero-bg hero-bg--${variant}${isVisible ? '' : ' hero-bg--paused'}`}
      aria-hidden="true"
    >
      <div className="hero-bg__gradient" />

      <motion.div
        className="hero-bg__blob-wrap hero-bg__blob-wrap--1"
        style={{ x: isVisible && !isSubtle ? blob1X : 0, y: isVisible && !isSubtle ? blob1Y : 0 }}
      >
        <div className="hero-bg__blob hero-bg__blob--1" />
      </motion.div>
      <motion.div
        className="hero-bg__blob-wrap hero-bg__blob-wrap--2"
        style={{ x: isVisible && !isSubtle ? blob2X : 0, y: isVisible && !isSubtle ? blob2Y : 0 }}
      >
        <div className="hero-bg__blob hero-bg__blob--2" />
      </motion.div>
      {!isSubtle && <div className="hero-bg__blob hero-bg__blob--3" />}

      <svg className="hero-bg__waves" viewBox="0 0 1440 400" preserveAspectRatio="none">
        <defs>
          <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(168, 85, 247, 0)" />
            <stop offset="30%" stopColor="rgba(168, 85, 247, 0.15)" />
            <stop offset="70%" stopColor="rgba(56, 189, 248, 0.15)" />
            <stop offset="100%" stopColor="rgba(56, 189, 248, 0)" />
          </linearGradient>
        </defs>
        {waves.map((d, i) => (
          <motion.path
            key={i}
            d={d}
            fill="none"
            stroke="url(#waveGrad)"
            strokeWidth={0.8}
            initial={isSubtle ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: isSubtle ? 0.18 : 0.4 + i * 0.05 }}
            transition={
              isSubtle
                ? { duration: 0 }
                : { duration: 2.5, delay: 0.3 + i * 0.15, ease: 'easeOut' }
            }
          />
        ))}
      </svg>

      <div className="hero-bg__particles">
        {particles.map((p) => (
          <span
            key={p.id}
            className="hero-bg__particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              ...cssVars({
                '--particle-duration': `${p.duration}s`,
                '--particle-delay': `${p.delay}s`,
              }),
            }}
          />
        ))}
      </div>

      <div className="hero-bg__grid" />
    </div>
  )
}

/* ============================================================
   ShaderBackground (WebGL plasma grid)
   ============================================================ */

const VS_SOURCE = `
  attribute vec4 aVertexPosition;
  void main() {
    gl_Position = aVertexPosition;
  }
`

const FS_SOURCE = `
  precision highp float;
  uniform vec2 iResolution;
  uniform float iTime;

  const float overallSpeed = 0.14;
  const float gridSmoothWidth = 0.015;
  const float axisWidth = 0.05;
  const float majorLineWidth = 0.025;
  const float minorLineWidth = 0.0125;
  const float majorLineFrequency = 5.0;
  const float minorLineFrequency = 1.0;
  const float scale = 5.0;
  const vec4 lineColor = vec4(0.55, 0.32, 0.95, 1.0);
  const float minLineWidth = 0.01;
  const float maxLineWidth = 0.18;
  const float lineSpeed = 1.0 * overallSpeed;
  const float lineAmplitude = 0.85;
  const float lineFrequency = 0.2;
  const float warpSpeed = 0.18 * overallSpeed;
  const float warpFrequency = 0.5;
  const float warpAmplitude = 0.9;
  const float offsetFrequency = 0.5;
  const float offsetSpeed = 1.33 * overallSpeed;
  const float minOffsetSpread = 0.6;
  const float maxOffsetSpread = 2.0;
  const int linesPerGroup = 12;

  #define drawCircle(pos, radius, coord) smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))
  #define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))
  #define drawCrispLine(pos, halfWidth, t) smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))
  #define drawPeriodicLine(freq, width, t) drawCrispLine(freq / 2.0, width, abs(mod(t, freq) - (freq) / 2.0))

  float random(float t) {
    return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;
  }

  float getPlasmaY(float x, float horizontalFade, float offset) {
    return random(x * lineFrequency + iTime * lineSpeed) * horizontalFade * lineAmplitude + offset;
  }

  void main() {
    vec2 fragCoord = gl_FragCoord.xy;
    vec2 uv = fragCoord.xy / iResolution.xy;
    vec2 space = (fragCoord - iResolution.xy / 2.0) / iResolution.x * 2.0 * scale;

    float horizontalFade = 1.0 - (cos(uv.x * 6.28) * 0.5 + 0.5);
    float verticalFade = 1.0 - (cos(uv.y * 6.28) * 0.5 + 0.5);

    space.y += random(space.x * warpFrequency + iTime * warpSpeed) * warpAmplitude * (0.5 + horizontalFade);
    space.x += random(space.y * warpFrequency + iTime * warpSpeed + 2.0) * warpAmplitude * horizontalFade;

    vec4 lines = vec4(0.0);

    for (int l = 0; l < linesPerGroup; l++) {
      float normalizedLineIndex = float(l) / float(linesPerGroup);
      float offsetTime = iTime * offsetSpeed;
      float offsetPosition = float(l) + space.x * offsetFrequency;
      float rand = random(offsetPosition + offsetTime) * 0.5 + 0.5;
      float halfWidth = mix(minLineWidth, maxLineWidth, rand * horizontalFade) / 2.0;
      float offset = random(offsetPosition + offsetTime * (1.0 + normalizedLineIndex)) * mix(minOffsetSpread, maxOffsetSpread, horizontalFade);
      float linePosition = getPlasmaY(space.x, horizontalFade, offset);
      float line = drawSmoothLine(linePosition, halfWidth, space.y) / 2.0 + drawCrispLine(linePosition, halfWidth * 0.15, space.y);

      float circleX = mod(float(l) + iTime * lineSpeed, 25.0) - 12.0;
      vec2 circlePosition = vec2(circleX, getPlasmaY(circleX, horizontalFade, offset));
      float circle = drawCircle(circlePosition, 0.01, space) * 3.0;

      line = line + circle;
      lines += line * lineColor * rand;
    }

    vec4 fragColor = lines * 0.9;
    fragColor.rgb *= mix(0.35, 1.0, verticalFade * horizontalFade + 0.25);
    fragColor.a = clamp(length(fragColor.rgb) * 1.4, 0.0, 0.85);

    gl_FragColor = fragColor;
  }
`

function loadShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function initShaderProgram(gl, vertexSource, fragmentSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()
  gl.attachShader(program, vertexShader)
  gl.attachShader(program, fragmentShader)
  gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Shader program link error:', gl.getProgramInfoLog(program))
    return null
  }
  return program
}

function ShaderBackground({ className = '' }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const glRef = useRef(null)
  const programInfoRef = useRef(null)
  const positionBufferRef = useRef(null)
  const startTimeRef = useRef(Date.now())
  const isInView = useIsInViewport(containerRef, { rootMargin: '120px' })
  const pageVisible = usePageVisible()
  const shouldRender = isInView && pageVisible

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false })
    if (!gl) {
      console.warn('WebGL not supported.')
      return
    }

    const shaderProgram = initShaderProgram(gl, VS_SOURCE, FS_SOURCE)
    if (!shaderProgram) return

    glRef.current = gl
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const positionBuffer = gl.createBuffer()
    positionBufferRef.current = positionBuffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    )

    programInfoRef.current = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
      },
      uniformLocations: {
        resolution: gl.getUniformLocation(shaderProgram, 'iResolution'),
        time: gl.getUniformLocation(shaderProgram, 'iTime'),
      },
    }

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      const w = Math.max(1, Math.floor(width))
      const h = Math.max(1, Math.floor(height))
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      gl.viewport(0, 0, canvas.width, canvas.height)
    }

    const observer = new ResizeObserver(resize)
    observer.observe(container)
    resize()
    startTimeRef.current = Date.now()

    return () => {
      observer.disconnect()
      cancelAnimationFrame(rafRef.current)
      glRef.current = null
      programInfoRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!shouldRender) {
      cancelAnimationFrame(rafRef.current)
      return
    }

    const canvas = canvasRef.current
    const gl = glRef.current
    const programInfo = programInfoRef.current
    const positionBuffer = positionBufferRef.current
    if (!canvas || !gl || !programInfo || !positionBuffer) return

    const render = () => {
      const currentTime = (Date.now() - startTimeRef.current) / 1000
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.useProgram(programInfo.program)
      gl.uniform2f(programInfo.uniformLocations.resolution, canvas.width, canvas.height)
      gl.uniform1f(programInfo.uniformLocations.time, currentTime)
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
      gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0)
      gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
      rafRef.current = requestAnimationFrame(render)
    }

    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [shouldRender])

  return (
    <div ref={containerRef} className={`shader-background ${className}`.trim()} aria-hidden="true">
      <canvas ref={canvasRef} className="shader-background__canvas" />
    </div>
  )
}

/* ============================================================
   GradientButton (hero)
   ============================================================ */

function GradientButton({ children, variant = 'primary', className = '', to }) {
  const navigate = useNavigate()
  return (
    <motion.button
      type="button"
      onClick={() => to && navigate(to)}
      className={`hero-btn hero-btn--${variant} ${className}`}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
    >
      {variant === 'primary' && (
        <span className="hero-btn__motion-lines" aria-hidden="true">
          <span /><span /><span />
        </span>
      )}
      <span className="hero-btn__text">{children}</span>
      {variant !== 'ghost' && (
        <span className="hero-btn__icon">
          <ArrowRight size={16} />
        </span>
      )}
    </motion.button>
  )
}

/* ============================================================
   Landing nav
   ============================================================

   Same scroll behaviour as the app header in components/Header.tsx, and
   deliberately the same CLASSES — `.site-header*` in index.css owns the panel,
   the column ladder and the travel, so the two bars can't drift apart. At the
   top it's fully transparent so the hero reads as full-bleed; past the
   threshold a frosted panel fades in and both ends pull towards the middle,
   leaving a rounded island floating over the page.

   Two differences from the app header, both landing-only and both in
   landing-page.css:
     - `fixed`, not `sticky` — see the note on .landing-nav for why a bar in
       flow put a black band above the hero.
     - the panel inset and the on-scroll logo scale are tuned for this bar's
       much taller logo (110px against the app's 56–88px).

   Contents stay just the two things: the mark, and the account dropdown (or
   the signed-out pair). None of the app header's icon rail belongs here.

   It lives OUTSIDE <Hero>: `.hero` sets `contain: layout`, which makes it the
   containing block for fixed children — a bar inside it would be anchored to
   the hero and scroll away with it, which is exactly what the old jump-to-CTA
   button did.
   ============================================================ */

/* Mirrors the app header's scroll state. Two thresholds, not one: a scroll
   that hovers on a single line flips the state every frame and the panel
   strobes. The gap between them is the dead zone. */
/* The bar itself is components/SiteNav.tsx now, floating variant, and the same
   component every other page renders (docked). Its markup, its scroll state and
   the signed-out Login / Get Started pair all used to be duplicated here, which
   is how the landing bar and the app bar ended up looking like two different
   products' headers.

   The one thing that stays landing-only is the signed-in slot: here it's the
   hero account dropdown, while the rest of the app has the full app header.
   SiteNav takes that as children. */
function LandingNav() {
  const { isAuthenticated } = useAuth()

  return <SiteNav>{isAuthenticated ? <HeroAccountMenu /> : undefined}</SiteNav>
}

/* ============================================================
   Hero
   ============================================================ */

const STATS = [
  { label: 'Products Optimized', value: '50k' },
  { label: 'Token Reduction', value: '60%' },
  { label: 'User Rating', value: '4.9', icon: Star },
  { label: 'Support', value: '24/7' },
]

const heroFadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] },
  }),
}

/**
 * The scroll cue's own click handler.
 *
 * It was a bare `href="#what-we-offer"`, which the browser answers by JUMPING
 * — the hero is gone and What We Offer is simply there, with no sense of having
 * moved between them. Worse, the anchor jump puts the section's top flush with
 * the viewport top, and the landing nav is FIXED over that, so the "Capabilities"
 * eyebrow and part of the heading landed underneath the bar.
 *
 * So: glide there, and stop below the nav (the offset is `scroll-margin-top` on
 * the section, in landing-page.css, so it applies to a hash-link arrival too).
 * The href stays as-is — it's still the correct link if JS hasn't loaded, and
 * middle-click still works.
 */
function scrollToWhatWeOffer(e: React.MouseEvent<HTMLAnchorElement>) {
  const target = document.getElementById('what-we-offer')
  if (!target) return // let the browser follow the href

  e.preventDefault()
  target.scrollIntoView({
    // Honoured, not assumed: a smooth 100vh glide is exactly what someone with
    // vestibular sensitivity turned this setting off for.
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? 'auto'
      : 'smooth',
    block: 'start',
  })
}

function Hero() {
  return (
    <section className="hero">
      <HeroBackground />

      <div className="hero__content">
        <motion.div
          className="hero__title-wrap"
          initial="hidden"
          animate="visible"
          variants={heroFadeUp}
          custom={0}
        >
          <TokunTitle />
        </motion.div>

        <motion.h2
          className="hero__subtitle"
          initial="hidden"
          animate="visible"
          variants={heroFadeUp}
          custom={1}
        >
          <span className="hero__subtitle-line" aria-hidden="true" />
          <span className="hero__subtitle-text">
            <TypingSubtitle />
          </span>
          <span className="hero__subtitle-line" aria-hidden="true" />
        </motion.h2>

        <motion.p
          className="hero__description"
          initial="hidden"
          animate="visible"
          variants={heroFadeUp}
          custom={2}
        >
          Optimize your LLM products, generate better outcomes, and monetize your
          best products—all in one place.
        </motion.p>

        <motion.div
          className="hero__ctas"
          initial="hidden"
          animate="visible"
          variants={heroFadeUp}
          custom={3}
        >
          {/* The two halves of the marketplace, together: what's for sale, and
              who makes it. They used to be Try Smartgen + Productverse, which
              put a tool and a storefront side by side and left Find Creators —
              the other half of the same destination — unmentioned above the
              fold. The tools moved to the rail on the left (ToolRail below),
              where they stay reachable from anywhere on the page instead of
              only from the top of it. */}
          <GradientButton variant="primary" to={ROUTES.marketplace}>Productverse</GradientButton>
          <Link to={ROUTES.findCreators} className="hero-btn hero-btn--ghost">
            <span className="hero-btn__text">Find Creators</span>
          </Link>
        </motion.div>

        <motion.div
          className="hero__stats"
          initial="hidden"
          animate="visible"
          variants={heroFadeUp}
          custom={4}
        >
          {STATS.map((stat, i) => (
            <div key={stat.label} className="hero__stat">
              {i > 0 && <span className="hero__stat-divider" />}
              <span className="hero__stat-label">{stat.label}</span>
              <span className="hero__stat-value">
                {stat.icon && <stat.icon size={18} className="hero__stat-star" />}
                <AnimatedCounter value={stat.value} />
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        className="hero__scroll"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <a
          href="#what-we-offer"
          className="hero__scroll-link"
          onClick={scrollToWhatWeOffer}
        >
          <div className="hero__scroll-inner">
            <Mouse size={20} strokeWidth={1.5} />
            <span>Scroll down</span>
            <ChevronDown size={16} />
          </div>
        </a>
      </motion.div>

      {/* The round "→" jump-to-CTA used to sit here, bottom-right. It read as a
          floating action button but never behaved like one: `.hero` sets
          `contain: layout`, which makes it the containing block for fixed
          children, so the FAB was anchored to the hero rather than the viewport
          and slid up out of view the moment you scrolled. The hero already has
          two CTAs and the scroll cue, so it's gone rather than re-anchored. */}
    </section>
  )
}

/* ============================================================
   WhatWeOffer
   ============================================================ */

const OFFERS = [
  {
    num: '01',
    icon: Zap,
    iconSrc: '/icons/prompt-optimization.svg',
    title: 'Prompt Optimiser',
    description:
      'Reduce token usage by up to 60% while maintaining meaning and effectiveness across all LLM platforms.',
    accent: '#38bdf8',
    href: ROUTES.optimizer,
  },
  {
    num: '02',
    icon: Sparkles,
    iconSrc: '/icons/smartgen.svg',
    title: 'Smartgen',
    description:
      'Transform simple ideas into powerful, optimized products with our AI-powered generation system.',
    accent: '#a855f7',
    href: ROUTES.smartgen,
  },
  {
    num: '03',
    icon: TrendingUp,
    title: 'Productverse',
    description:
      'Built a great product? Trade it. Monetize your creativity and earn from your best product innovations.',
    accent: '#ec4899',
    href: ROUTES.marketplace,
  },
  {
    // Replaced Prompt Library here. The library is a signed-in tool — it shows
    // you prompts you already have access to — so it had nothing to offer the
    // visitor this section is written for. Find Creators does: it's the half of
    // the product a logged-out reader can act on immediately.
    num: '04',
    icon: Users,
    title: 'Find Creators',
    description:
      'Hire the people behind the products. Browse verified creators, see their work, and book them with payment held safely.',
    accent: '#22d3ee',
    href: ROUTES.findCreators,
  },
]

function WhatWeOffer() {
  return (
    <section id="what-we-offer" className="what-we-offer">
      <div className="what-we-offer__shader-wrap">
        <ShaderBackground />
      </div>
      <div className="what-we-offer__bg-grid" aria-hidden="true" />

      <div className="what-we-offer__inner">
        <motion.div
          className="what-we-offer__header"
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          variants={fadeUp}
        >
          <span className="what-we-offer__eyebrow">Capabilities</span>
          <h2 className="what-we-offer__title">What We Offer</h2>
          <p className="what-we-offer__lead">
            Everything you need to craft, optimize, and monetize products in the
            age of AI.
          </p>
        </motion.div>

        <div className="what-we-offer__grid">
          {OFFERS.map((offer, i) => (
            <motion.article
              key={offer.num}
              className="offer-card"
              style={cssVars({ '--card-accent': offer.accent })}
              initial="hidden"
              whileInView="visible"
              viewport={REVEAL_VIEWPORT}
              variants={fadeUp}
              custom={i + 1}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              <div className="offer-card__body">
                <div className="offer-card__top">
                  {/* The two tools that have a mark of their own use it; the
                      rest fall back to a lucide glyph. Same files the signed-in
                      nav and the tool rail render, so all three places name a
                      tool with one picture — see TOOL_TABS. */}
                  <span className="offer-card__icon">
                    {offer.iconSrc ? (
                      <img loading="lazy" decoding="async"
                        src={offer.iconSrc}
                        alt=""
                        aria-hidden="true"
                        width={18}
                        height={18}
                        style={{ display: 'block' }}
                      />
                    ) : (
                      <offer.icon size={18} strokeWidth={2} />
                    )}
                  </span>
                  <span className="offer-card__num">{offer.num}</span>
                </div>

                <h3 className="offer-card__title">{offer.title}</h3>
                <p className="offer-card__desc">{offer.description}</p>

                {/* Driven by the offer's own `href` rather than a title match,
                    so adding a card is one entry in OFFERS.

                    All four now carry one. The Optimiser and Smartgen cards used
                    to fall through to the #explore branch below — an anchor with
                    no element of that name anywhere on the page, so "Explore" was
                    a button that did nothing at all. They were left that way
                    because both pages need a sign-in, but that is what RequireAuth
                    is for: it sends a signed-out visitor to /login instead of the
                    card silently ignoring the click.

                    The #explore fallback stays only to catch a future card added
                    without an href — it should not be reached today. */}
                {offer.href ? (
                  <Link to={offer.href} className="offer-card__link">
                    Explore
                    <span className="offer-card__link-icon">
                      <ArrowRight size={14} />
                    </span>
                  </Link>
                ) : (
                  <a href="#explore" className="offer-card__link">
                    Explore
                    <span className="offer-card__link-icon">
                      <ArrowRight size={14} />
                    </span>
                  </a>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ============================================================
   LaptopDemo
   ============================================================ */

/* The mock UI's tab strip. "Product Library" was the fourth one and is gone —
   the library is a signed-in tool and is already hidden from the app nav and the
   footer, so advertising it here sent people to something they can't see.

   ACTIVE_TAB is named rather than compared inline because the tab that was
   removed was ALSO the highlighted one: dropping it from this array left the
   strip with nothing active at all, and the next person to edit the list would
   have hit the same thing. */
const TABS = ['Smartgen', 'Prompt Optimiser', 'Productverse']
const ACTIVE_TAB = 'Productverse'

const SAVED_ITEMS = [
  { title: 'SEO Blog Writer', tag: 'Marketing', tokens: '-42%' },
  { title: 'React Component Gen', tag: 'Coding', tokens: '-38%' },
  { title: 'Product Launch Email', tag: 'Marketing', tokens: '-51%' },
]

function LaptopDemo() {
  return (
    <div className="laptop-demo">
      <div className="laptop-demo__ambient" aria-hidden="true" />

      <div className="laptop-demo__stage">
        <div className="laptop-demo__frame">
          <div className="laptop-demo__chrome">
            <div className="laptop-demo__dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <div className="laptop-demo__url">
              <span className="laptop-demo__lock" aria-hidden="true" />
              app.tokun.world
            </div>
            <div className="laptop-demo__chrome-spacer" aria-hidden="true" />
          </div>

          <div className="laptop-demo__viewport">
            <div className="laptop-ui">
              <header className="laptop-ui__nav">
                <div className="laptop-ui__brand">
                  <span className="laptop-ui__brand-dot" />
                  TOKUN.WORLD
                </div>
                <div className="laptop-ui__actions">
                  <button type="button" className="laptop-ui__btn laptop-ui__btn--ghost">
                    + Post a prompt
                  </button>
                  <button type="button" className="laptop-ui__btn laptop-ui__btn--pro">
                    Get Pro
                  </button>
                  <span className="laptop-ui__user">Hello, Ashutosh</span>
                </div>
              </header>

              <h3 className="laptop-ui__title">Saved Items</h3>

              <div className="laptop-ui__tabs">
                {TABS.map((tab) => (
                  <span
                    key={tab}
                    className={`laptop-ui__tab${tab === ACTIVE_TAB ? ' laptop-ui__tab--active' : ''}`}
                  >
                    {tab}
                  </span>
                ))}
              </div>

              <div className="laptop-ui__list">
                {SAVED_ITEMS.map((item) => (
                  <div key={item.title} className="laptop-ui__row">
                    <div>
                      <p className="laptop-ui__row-title">{item.title}</p>
                      <span className="laptop-ui__row-tag">{item.tag}</span>
                    </div>
                    <span className="laptop-ui__row-stat">{item.tokens}</span>
                  </div>
                ))}
              </div>
            </div>

            <button type="button" className="laptop-demo__play" aria-label="Play product demo">
              <Play size={22} fill="currentColor" strokeWidth={0} />
            </button>
          </div>
        </div>

        <div className="laptop-demo__reflection" aria-hidden="true">
          <div className="laptop-demo__reflection-inner" />
        </div>
      </div>
    </div>
  )
}

/* ============================================================
   HowItWorks
   ============================================================ */

const STEPS = [
  { num: '01', icon: MessageSquarePlus, title: 'Input Idea', description: 'Share your concept or requirement', accent: '#38bdf8' },
  { num: '02', icon: Sparkles, title: 'SmartGen', description: 'AI generates optimized products', accent: '#a855f7' },
  { num: '03', icon: Zap, title: 'Optimize', description: 'Reduce tokens, improve quality', accent: '#818cf8' },
  { num: '04', icon: BarChart3, title: 'Save or Sale', description: 'Store in library or marketplace', accent: '#ec4899' },
  { num: '05', icon: Wallet, title: 'Earn', description: 'Monetize your best products', accent: '#f472b6' },
]

/* ============================================================
   SmartgenShowcase
   ============================================================ */

/* A direct port of the supplied reference design, which was written in Tailwind
 * against a Material 3 token set. This page is plain CSS, so the tokens are
 * re-declared as custom properties scoped to `.sg-show` in landing-page.css —
 * the values are copied exactly, not approximated, so the two cannot drift.
 *
 * Two things in the reference are deliberately NOT carried over:
 *
 *   its <header> — the landing page already has <LandingNav>, and a second
 *   fixed bar would sit on top of it.
 *
 *   Material Symbols — a whole icon webfont for four glyphs, when this app
 *   already ships lucide-react. The nearest lucide equivalents are used:
 *   arrow_forward -> ArrowRight, picture_as_pdf/description -> FileText,
 *   open_in_new -> ExternalLink, psychology -> Brain.
 *
 * The artwork is the reference's own image, saved to public/icons rather than
 * hotlinked from lh3.googleusercontent.com. Two reasons, both hard: those URLs
 * are temporary and stop resolving, and the host is not on the img-src
 * allowlist (see frontend/SECURITY-HEADERS.md) so the browser would refuse it
 * outright. A file under public/ is same-origin, which 'self' already covers.
 */
/* Both tiles go to SmartGen and open its file chooser — nothing more.
 *
 * They used to be bare links to /smartgen, so neither did what its label said:
 * you arrived at the tool and still had to find the paperclip yourself.
 *
 * `?attach=1` is read by SmarterPrompt, which opens the chooser on arrival.
 * What follows is SmartGen's own flow, unchanged: pick a file, and the same
 * popup that a click on the paperclip produces asks whether you want Markdown,
 * a prompt, or both. The tiles are a shortcut INTO that flow, not a second
 * version of it — one place decides what happens to a document, and it is the
 * tool, not the landing page.
 *
 * The parameter survives the sign-in redirect: /smartgen is behind RequireAuth,
 * which sends the whole location, query included, as `next` (lib/nextPath.ts),
 * so a logged-out visitor lands where a logged-in one does. */
const SG_FEATURES = [
  { label: 'PDF to Smart Prompt', to: `${ROUTES.smartgen}?attach=1` },
  { label: 'PDF to MD File', to: `${ROUTES.smartgen}?attach=1` },
]

/* Its own reveal rather than the shared `fadeUp`, and the reason is a type
   error rather than a design difference.

   `fadeUp` is an untyped object literal, so its `ease: [0.22, 1, 0.36, 1]`
   widens to number[] — and framer-motion's Variants wants a four-number TUPLE.
   Every motion element in this file that uses fadeUp carries that error; there
   are eleven of them, and the typecheck ratchet in CI counts them.

   Annotating this one `: Variants` gives the array a contextual type, so it
   narrows to the tuple and no twelfth error is added. `fadeUp` and
   `heroFadeUp` now carry the same annotation, which is what this note asked
   for — so this one is no longer special, and the next reveal added to this
   page should just use `fadeUp`. */
const SG_REVEAL: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, delay: 0.05, ease: [0.22, 1, 0.36, 1] },
  },
}

function SmartgenShowcase() {
  return (
    <motion.section
      className="sg-show"
      aria-labelledby="sg-show-title"
      initial="hidden"
      whileInView="visible"
      viewport={REVEAL_VIEWPORT}
      variants={SG_REVEAL}
    >
      <div className="sg-show__circuit" aria-hidden="true" />

      <div className="sg-show__inner">
        {/* ── left: copy ── */}
        <div className="sg-show__copy">
          <div className="sg-show__status">
            <span className="sg-show__status-dot" aria-hidden="true" />
            <span className="sg-show__status-text">Engine v2.0 Online</span>
          </div>

          <h2 className="sg-show__title" id="sg-show-title">
            Our ultimate <br className="sg-show__title-br" />
            <span className="sg-show__title-accent">Smart Prompt Generator</span>
          </h2>

          <p className="sg-show__lead">
            Leverage advanced context parsing to generate complex, nuanced prompts tailored to
            your specific architectural or narrative needs. Experience the next evolution of AI
            interaction.
          </p>

          <div className="sg-show__ctas">
            <Link to={ROUTES.smartgen} className="sg-show__cta sg-show__cta--primary">
              Try Now
              <ArrowRight size={16} strokeWidth={2.4} aria-hidden="true" />
            </Link>
            <Link to={ROUTES.smartgen} className="sg-show__cta sg-show__cta--ghost">
              See details
            </Link>
          </div>

          <div className="sg-show__features">
            {SG_FEATURES.map((f) => (
              <Link key={f.label} to={f.to} className="sg-show__feature">
                <span className="sg-show__feature-icon" aria-hidden="true">
                  <FileText size={20} strokeWidth={1.7} />
                </span>
                <span className="sg-show__feature-label">{f.label}</span>
                <ExternalLink
                  size={14}
                  strokeWidth={2}
                  className="sg-show__feature-out"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>

          <div className="sg-show__stats">
            <p className="sg-show__stat">Upto 60% token reduction</p>
          </div>
        </div>

        {/* ── right: visual ── */}
        <div className="sg-show__visual">
          <div className="sg-show__ambient" aria-hidden="true" />

          <div className="sg-show__frame">
            <div className="sg-show__art">
              <div className="sg-show__art-ring" aria-hidden="true" />
              <img
                src="/icons/smartgen-hero.jpg"
                alt=""
                className="sg-show__art-img"
                loading="lazy"
                decoding="async"
                width={512}
                height={512}
              />
            </div>

            <div className="sg-show__badge">
              <span className="sg-show__badge-icon" aria-hidden="true">
                <Brain size={18} strokeWidth={1.8} />
              </span>
              <span className="sg-show__badge-body">
                <span className="sg-show__badge-label">Context Parsed</span>
                <span className="sg-show__badge-value">99.8% Accuracy</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
}

/* ============================================================
   EcosystemHierarchy
   ============================================================ */

/* Port of the supplied "Creator vs Supercreator" reference, with one change the
 * brief asked for: the portrait that sat in a 256px circle now fills the whole
 * card. That is why the spinning orbit rings around it are gone — they framed a
 * circle and have nothing to orbit once the image is full-bleed — and why each
 * card carries a bottom-up gradient scrim: white text over an arbitrary photo is
 * unreadable without one, and these two photos are bright in the upper half.
 *
 * ── The interaction ────────────────────────────────────────────────────────
 *
 * HOVER a card and it is explained ON THE OTHER CARD. Point at Creator and the
 * Supercreator card turns into "Creator Capabilities"; point at Supercreator
 * and the Creator card turns into "Supercreator Capabilities". It reads as a
 * comparison rather than two independent tooltips, which is the point of
 * putting them side by side, and hovering costs the reader nothing — they can
 * sweep across both and see the whole picture without committing to a click.
 *
 * Hover cannot be the only way in, so three things drive the same state:
 *
 *   pointer   onPointerEnter / onPointerLeave, mouse pointerType only
 *   keyboard  onFocus / onBlur on the button that covers it
 *   touch     onClick, which toggles — there is no hover on a phone, and
 *             without this the section would be inert there
 *
 * The Close button stays for that last case: a tap has no "moving away", so a
 * touch reader needs something to dismiss with. On a pointer device it is
 * almost never needed, because leaving the card already clears it.
 *
 * The reference drove this with `onclick` attributes and classList toggling on
 * ids. Here it is one piece of state, because ids do not survive a component
 * being rendered twice and inline handlers are exactly what the page's CSP
 * forbids.
 */
const EC_CARDS = [
  {
    id: 'creator' as const,
    name: 'CREATOR',
    badge: 'Digital Product Seller',
    image: '/icons/creator.jpg',
    /* Deliberately alt="" — decorative. The card's meaning is carried by the
       heading and badge beside it, and a screen reader announcing a stock desk
       photo adds nothing. */
    heading: 'Creator Capabilities',
    body:
      'Creators are the foundational architects of TOKUN.WORLD. They build, share and evolve digital assets across the marketplace, establishing the core rhythms of the ecosystem.',
    perks: ['Asset Gen', 'Node Access'],
  },
  {
    id: 'supercreator' as const,
    name: 'SUPERCREATOR',
    badge: 'Product Seller and Available for Hire',
    image: '/icons/supercreator.jpg',
    heading: 'Supercreator Capabilities',
    body:
      'Supercreators have achieved peak influence. They sell products AND take paid work, set their own rates, and are surfaced first to clients browsing for creators to hire.',
    /* The reference left these two labels EMPTY — a literal `<br>` where the
       text should be, next to an admin badge and a hub icon. Filled in from
       what the tier actually is on this platform rather than shipping two
       unlabelled icons. */
    perks: ['Full Access', 'Hire Ready'],
  },
]

function EcosystemHierarchy() {
  /* null = neither picked. Holds the id of the card the reader chose, and every
     other visual state on this section is derived from it. */
  const [picked, setPicked] = useState<'creator' | 'supercreator' | null>(null)

  return (
    <motion.section
      className="ec-hier"
      aria-labelledby="ec-hier-title"
      initial="hidden"
      whileInView="visible"
      viewport={REVEAL_VIEWPORT}
      variants={SG_REVEAL}
    >
      <div className="ec-hier__aura" aria-hidden="true" />

      <div className="ec-hier__inner">
        <div className="ec-hier__header">
          <h2 className="ec-hier__title" id="ec-hier-title">
            Ecosystem <span className="ec-hier__title-accent">Hierarchy</span>
          </h2>
          <p className="ec-hier__lead">
            Two ways to earn on TOKUN. Select a tier to see what it unlocks.
          </p>
        </div>

        <div className="ec-hier__grid">
          <div className="ec-hier__divider" aria-hidden="true" />

          {EC_CARDS.map((card, i) => {
            /* Each card shows its OWN identity until the OTHER card is picked —
               see the note above. `other` is that other card. */
            const other = EC_CARDS[1 - i]
            const explaining = picked === other.id
            const isActive = picked === card.id

            return (
              <div
                key={card.id}
                className={[
                  'ec-card',
                  isActive ? 'ec-card--active' : '',
                  explaining ? 'ec-card--explaining' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                /* Pointer events with an explicit `mouse` check, not
                   onMouseEnter — and that check is the whole reason nothing
                   happened when you tapped one of these on a phone.

                   A tap on a touchscreen fires a COMPATIBILITY mouse sequence:
                   mouseenter, then click. So the tap set `picked` to this card
                   on the way in, and the click that followed found isActive
                   already true and toggled it straight back off. The card lit
                   up and went dark inside one tap, which looks exactly like a
                   dead control.

                   pointerenter carries pointerType, so mouse hover can be told
                   apart from a finger. Touch is ignored here and handled by the
                   click below, which is the only sensible trigger on a device
                   with no hover state at all. */
                onPointerEnter={(e) => {
                  if (e.pointerType === 'mouse') setPicked(card.id)
                }}
                onPointerLeave={(e) => {
                  if (e.pointerType === 'mouse') setPicked(null)
                }}
              >
                <img src={card.image} alt="" className="ec-card__bg" loading="lazy" decoding="async" />
                <div className="ec-card__scrim" aria-hidden="true" />

                {/* A real <button> covering the card, rather than handlers on
                    the wrapper alone: that gets keyboard focus and Enter/Space
                    for free. It sits UNDER the content, which is
                    pointer-events:none, so a pointer anywhere on the card
                    reaches it.

                    Always rendered, unlike the click-only version this replaced.
                    Removing it once something was picked meant a keyboard reader
                    lost the element they were focused on mid-interaction, and a
                    touch reader had nothing left to tap to dismiss. */}
                <button
                  type="button"
                  className="ec-card__hit"
                  onFocus={() => setPicked(card.id)}
                  onBlur={() => setPicked(null)}
                  onClick={() => setPicked(isActive ? null : card.id)}
                  aria-expanded={isActive}
                >
                  <span className="sr-only">{`Show what a ${card.name.toLowerCase()} can do`}</span>
                </button>

                {isActive && (
                  <button
                    type="button"
                    className="ec-card__close"
                    onClick={() => setPicked(null)}
                    aria-label="Clear selection"
                  >
                    <X size={18} strokeWidth={2.2} aria-hidden="true" />
                  </button>
                )}

                {/* Identity */}
                <div className="ec-card__identity" aria-hidden={explaining}>
                  <h3 className="ec-card__name">{card.name}</h3>
                  <span className="ec-card__badge">{card.badge}</span>
                </div>

                {/* Explanation — of the OTHER card */}
                <div className="ec-card__explain" aria-hidden={!explaining}>
                  <h3 className="ec-card__explain-title">{other.heading}</h3>
                  <p className="ec-card__explain-body">{other.body}</p>
                  <ul className="ec-card__perks">
                    {other.perks.map((p) => (
                      <li key={p} className="ec-card__perk">
                        <CheckCircle2 size={16} strokeWidth={2} aria-hidden="true" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </motion.section>
  )
}

/* ============================================================
   HowItWorks
   ============================================================ */

function HowItWorks() {
  return (
    <section id="how-it-works" className="how-it-works">
      <div className="how-it-works__grid-bg" aria-hidden="true" />

      <div className="how-it-works__inner">
        <motion.div
          className="how-it-works__header"
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          variants={fadeUp}
        >
          <span className="how-it-works__badge">Process</span>
          <h2 className="how-it-works__title">How It Works</h2>
        </motion.div>

        <div className="how-it-works__steps">
          {STEPS.map((step, i) => (
            <motion.article
              key={step.num}
              className="how-step"
              style={cssVars({ '--step-accent': step.accent })}
              initial="hidden"
              whileInView="visible"
              viewport={REVEAL_VIEWPORT}
              variants={fadeUp}
              custom={i + 1}
              whileHover={{ y: -4 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            >
              <div className="how-step__top">
                <span className="how-step__icon">
                  <step.icon size={20} strokeWidth={1.75} />
                </span>
                <span className="how-step__num">{step.num}</span>
              </div>
              <h3 className="how-step__title">{step.title}</h3>
              <p className="how-step__desc">{step.description}</p>
            </motion.article>
          ))}
        </div>

        <SmartgenShowcase />
        <EcosystemHierarchy />

        <motion.div
          className="how-it-works__demo"
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          variants={fadeUp}
          custom={6}
        >
          <h3 className="how-it-works__demo-title">Product Demo</h3>
          <p className="how-it-works__demo-lead">Video demonstration of earn feature</p>
          <LaptopDemo />
        </motion.div>
      </div>
    </section>
  )
}

/* ============================================================
   CtaSection
   ============================================================ */

function CtaSection() {
  const navigate = useNavigate()
  return (
    <section id="cta" className="cta-section">
      <div className="cta-section__inner">
        <motion.div
          className="cta-section__header"
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          variants={fadeUp}
        >
          <span className="cta-section__badge">Reach out any time</span>
          <h2 className="cta-section__title">Ready to optimize your products?</h2>
          <p className="cta-section__lead">
            Join thousands of developers who are already saving costs and
            improving efficiency with TOKUN.
          </p>
        </motion.div>

        <motion.div
          className="cta-section__action"
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          variants={fadeUp}
          custom={2}
        >
          <div className="cta-section__btn-glow" aria-hidden="true" />
          {/* To the Optimiser, which is what the button says it does.

              It pointed at ROUTES.app — and /app renders THIS PAGE again, in its
              signed-in variant (see pages/AppPage.tsx). So "Start Optimizing Now"
              scrolled you back to a landing page that looks identical to the one
              you were already on, which reads as a button that does nothing at
              all rather than one that navigated. */}
          <motion.button
            type="button"
            className="cta-btn"
            onClick={() => navigate(ROUTES.optimizer)}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <span className="cta-btn__text">Start Optimizing Now</span>
            <span className="cta-btn__icon">
              <ArrowRight size={18} strokeWidth={2.5} />
            </span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}

/* ============================================================
   Testimonials (marquee)
   ============================================================ */

const TESTIMONIALS = [
  { name: 'Shivani', role: 'AI ML Developer', initial: 'S', accent: '#38bdf8', quote: "Tokun's optimization is a game-changer. I used to get 10x slower inference; now it's 3x faster with fewer tokens." },
  { name: 'Marcus Chen', role: 'Staff Engineer', initial: 'M', accent: '#a855f7', quote: 'SmartGen saved our team hours every week. The marketplace is where we discover products that work in production.' },
  { name: 'Elena Rodriguez', role: 'Product Lead', initial: 'E', accent: '#ec4899', quote: 'We cut API costs by 40% without sacrificing output quality. TOKUN feels like a senior product engineer on the team.' },
  { name: 'Bilal Ahmed', role: 'IT Manager', initial: 'B', accent: '#818cf8', quote: 'Implementing TOKUN was smooth and quick. The team adapted fast and our product workflows are noticeably cleaner.' },
  { name: 'Priya Nair', role: 'Product Engineer', initial: 'P', accent: '#f472b6', quote: 'The token reduction alone paid for itself in the first month. Optimization quality is consistently impressive.' },
  { name: 'James Okonkwo', role: 'Founder', initial: 'J', accent: '#38bdf8', quote: 'Our startup runs lean. TOKUN helps us ship AI features without burning through our inference budget.' },
  { name: 'Sofia Laurent', role: 'Data Scientist', initial: 'S', accent: '#a855f7', quote: 'I love how the library keeps our best products organized. Sharing across the team has never been this easy.' },
  { name: 'Arjun Patel', role: 'DevOps Lead', initial: 'A', accent: '#ec4899', quote: 'Reliable, fast, and beautifully designed. TOKUN slots right into our stack without any friction.' },
  { name: 'Nina Kowalski', role: 'Content Strategist', initial: 'N', accent: '#4ade80', quote: 'My marketing products went from bloated to razor-sharp. Output quality improved while costs dropped.' },
]


const ACCENT_COLORS = ['#38bdf8', '#a855f7', '#ec4899', '#818cf8', '#f472b6', '#4ade80', '#fb923c', '#34d399', '#f87171']

function TestimonialCard({ item }) {
  return (
    <article className="t-marquee-card" style={{ '--card-accent': item.accent } as any}>
      {item.rating > 0 && (
        <div className="t-marquee-card__stars">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} style={{ color: i < item.rating ? '#facc15' : 'rgba(255,255,255,0.2)', fontSize: 13 }}>★</span>
          ))}
        </div>
      )}
      <p className="t-marquee-card__quote">{item.quote}</p>
      <footer className="t-marquee-card__author">
        {item.profilePicture ? (
          <img loading="lazy" decoding="async"
            src={`${API_BASE}${item.profilePicture}`}
            alt={item.name}
            className="t-marquee-card__avatar"
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <span className="t-marquee-card__avatar">{item.initial}</span>
        )}
        <div>
          <cite className="t-marquee-card__name">{item.name}</cite>
          <p className="t-marquee-card__role">{item.role}</p>
        </div>
      </footer>
    </article>
  )
}

function MarqueeColumn({ items, duration, delay }: { items: any[], duration: number, delay: number }) {
  return (
    <div
      className="marquee-col"
      style={{ '--marquee-duration': `${duration}s`, '--marquee-delay': `${delay}s` } as any}
    >
      <div className="marquee-col__track">
        <div className="marquee-col__group">
          {items.map((item, i) => (
            <TestimonialCard key={`a-${i}`} item={item} />
          ))}
        </div>
        <div className="marquee-col__group" aria-hidden="true">
          {items.map((item, i) => (
            <TestimonialCard key={`b-${i}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Testimonials() {
  const sectionRef = useRef(null)
  const isVisible = useIsInViewport(sectionRef, { rootMargin: '100px' })
  const [liveItems, setLiveItems] = useState(TESTIMONIALS)

  useEffect(() => {
    fetch(`${API_BASE}/api/feedback/top`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.feedbacks?.length >= 1) {
          const mapped = data.feedbacks.map((f: any, i: number) => ({
            name: f.name,
            role: f.role || 'Tokun User',
            initial: (f.name?.[0] || 'U').toUpperCase(),
            accent: ACCENT_COLORS[i % ACCENT_COLORS.length],
            quote: f.experience,
            profilePicture: f.profilePicture || null,
            rating: Number(f.rating) || 0,
          }))
          // Fill up to 9 with hardcoded fallback if needed
          const combined = mapped.length >= 9
            ? mapped
            : [...mapped, ...TESTIMONIALS.slice(0, 9 - mapped.length)]
          setLiveItems(combined)
        }
      })
      .catch(() => {})
  }, [])

  const columns = [
    { items: liveItems.filter((_: any, i: number) => i % 3 === 0), duration: 32, delay: 0 },
    { items: liveItems.filter((_: any, i: number) => i % 3 === 1), duration: 38, delay: -12 },
    { items: liveItems.filter((_: any, i: number) => i % 3 === 2), duration: 35, delay: -22 },
  ]

  return (
    <section
      id="testimonials"
      ref={sectionRef}
      className={`testimonials${isVisible ? '' : ' testimonials--paused'}`}
    >
      <div className="testimonials__grid-bg" aria-hidden="true" />

      <div className="testimonials__inner">
        <motion.div
          className="testimonials__header"
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          variants={fadeUp}
        >
          <span className="testimonials__badge">Wall of Love</span>
          <h2 className="testimonials__title">What our users say</h2>
          <p className="testimonials__lead">See what our customers have to say about us</p>
        </motion.div>

        <motion.div
          className="testimonials__marquee"
          initial="hidden"
          whileInView="visible"
          viewport={REVEAL_VIEWPORT}
          variants={fadeUp}
          custom={2}
        >
          <div className="testimonials__fade testimonials__fade--top" aria-hidden="true" />
          <div className="testimonials__fade testimonials__fade--bottom" aria-hidden="true" />

          <div className="testimonials__columns">
            {columns.map((col, i) => (
              <MarqueeColumn key={i} items={col.items} duration={col.duration} delay={col.delay} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ============================================================
   GlobeSection (3D globe + rotating reviews)
   ============================================================ */

const GLOBE_USERS = [
  { lat: 35.6, lon: 139.7, flag: '🇯🇵', name: 'Yuki Tanaka', city: 'Tokyo, Japan', msg: 'I love SmartGen! Saves me hours every day ✨' },
  { lat: 51.5, lon: -0.1, flag: '🇬🇧', name: 'James Harper', city: 'London, UK', msg: 'Cut my GPT-4 costs by 58% with Tokun!' },
  { lat: 37.7, lon: -122.4, flag: '🇺🇸', name: 'Sarah Chen', city: 'San Francisco, USA', msg: 'Best product tool on the market 🔥' },
  { lat: 48.8, lon: 2.3, flag: '🇫🇷', name: 'Léa Moreau', city: 'Paris, France', msg: 'Tokun marketplace made me ₹800 this month! 💰' },
  { lat: 28.6, lon: 77.2, flag: '🇮🇳', name: 'Arjun Sharma', city: 'New Delhi, India', msg: 'SmartGen is a total game changer for AI devs!' },
  { lat: -23.5, lon: -46.6, flag: '🇧🇷', name: 'Lucas Oliveira', city: 'São Paulo, Brazil', msg: 'Melhor ferramenta de products! 🚀' },
  { lat: 1.4, lon: 103.8, flag: '🇸🇬', name: 'Wei Liang', city: 'Singapore', msg: 'Our whole team switched to Tokun. No regrets!' },
  { lat: 55.7, lon: 37.6, flag: '🇷🇺', name: 'Dmitri Volkov', city: 'Moscow, Russia', msg: 'Token optimization is genuinely impressive 👏' },
  { lat: -33.8, lon: 151.2, flag: '🇦🇺', name: 'Emma Wilson', city: 'Sydney, Australia', msg: 'Love the product library! Saves so much time ⚡' },
  { lat: 52.5, lon: 13.4, flag: '🇩🇪', name: 'Klaus Weber', city: 'Berlin, Germany', msg: 'Tokun API integrates perfectly with our stack!' },
  { lat: 19.0, lon: 72.8, flag: '🇮🇳', name: 'Priya Nair', city: 'Mumbai, India', msg: 'SmartGen wrote a better product than me 😂❤️' },
  { lat: 40.7, lon: -74.0, flag: '🇺🇸', name: 'Alex Rivera', city: 'New York, USA', msg: '50K products on Tokun already? So deserved!' },
  { lat: 31.2, lon: 121.5, flag: '🇨🇳', name: 'Li Wei', city: 'Shanghai, China', msg: 'Supports every LLM I use. Perfect tool!' },
  { lat: -1.3, lon: 36.8, flag: '🇰🇪', name: 'Amara Osei', city: 'Nairobi, Kenya', msg: 'Tokun is growing our AI startup faster 🌍' },
  { lat: 59.3, lon: 18.1, flag: '🇸🇪', name: 'Erik Lindqvist', city: 'Stockholm, Sweden', msg: 'Elegant, fast, support is amazing 🙌' },
  { lat: 25.2, lon: 55.3, flag: '🇦🇪', name: 'Farah Al-Nasser', city: 'Dubai, UAE', msg: 'Product marketplace is a brilliant idea! 💡' },
  { lat: 41.0, lon: 29.0, flag: '🇹🇷', name: 'Ceren Yilmaz', city: 'Istanbul, Turkey', msg: 'Tokun helped me 10x my freelance AI work!' },
]

const REVIEW_POSITIONS_DESKTOP = [
  { left: '18%', top: '22%', lineTo: 'bottom' },
  { left: '76%', top: '20%', lineTo: 'bottom' },
  { left: '86%', top: '49%', lineTo: 'left' },
  { left: '64%', top: '80%', lineTo: 'top' },
  { left: '24%', top: '80%', lineTo: 'top' },
  { left: '8%', top: '49%', lineTo: 'right' },
]

const REVIEW_POSITIONS_MOBILE = [
  { left: '50%', top: '12%', lineTo: 'bottom' },
  { left: '78%', top: '31%', lineTo: 'left' },
  { left: '78%', top: '64%', lineTo: 'left' },
  { left: '50%', top: '86%', lineTo: 'top' },
  { left: '22%', top: '64%', lineTo: 'right' },
  { left: '22%', top: '31%', lineTo: 'right' },
]

// three / drei / the 7.8 MB globe model all live in this chunk. It is fetched
// only when the globe is about to enter the viewport — see GlobeSection below.
const LandingGlobeCanvas = lazy(() => import('./LandingGlobeCanvas'))

/* What sits in the globe's place while its chunk and its 7.8 MB model load.
   This was a transparent box, so on a slow connection the section rendered its
   heading and then a hole — indistinguishable from something that had failed.
   A ring that is visibly waiting is not faster, but it is honest, and it stops
   people staring at a gap wondering whether to reload. */
/* `waiting` is the difference between "not here yet" and "not coming".
   The globe is skipped outright when the browser has no WebGL, and shown by the
   error boundary when it fails — in both of those it is never going to arrive, so
   a pulsing "LOADING GLOBE" would sit there lying about it forever. Same artwork,
   honest label, and no aria-busy on a thing that has stopped waiting. */
function GlobeFallback({ waiting = true }: { waiting?: boolean }) {
  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '1 / 1',
        display: 'grid',
        placeItems: 'center',
      }}
      aria-busy={waiting || undefined}
      aria-label={waiting ? 'Loading the 3D globe' : 'Global community'}
    >
      <div
        style={{
          width: '62%',
          aspectRatio: '1 / 1',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.10)',
          background:
            'radial-gradient(circle at 50% 40%, rgba(124,58,237,0.14) 0%, rgba(37,99,235,0.06) 55%, transparent 72%)',
          display: 'grid',
          placeItems: 'center',
          animation: waiting ? 'globeFallbackPulse 1.8s ease-in-out infinite' : 'none',
        }}
      >
        <span style={{ fontSize: 11, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)' }}>
          {waiting ? 'LOADING GLOBE' : 'TOKUN.WORLD'}
        </span>
      </div>
    </div>
  )
}

function ReviewCard({ user, pos, cardKey, isMobile }) {
  const cardWidth = isMobile ? 110 : 170
  const titleFont = isMobile ? 8 : 10
  const subFont = isMobile ? 6 : 8
  const msgFont = isMobile ? 7 : 9

  const lineLen = isMobile ? 28 : 42
  const elbowLen = isMobile ? 24 : 34
  const sideLineLen = isMobile ? 28 : 30
  const gap = isMobile ? 4 : 6

  const cardLeft = Number.parseFloat(pos.left)
  const bendInward = cardLeft > 50 ? 'left' : 'right'
  const dashDown = 'repeating-linear-gradient(to bottom, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)'
  const dashUp = 'repeating-linear-gradient(to top, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)'
  const dashRight = 'repeating-linear-gradient(to right, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)'
  const dashLeft = 'repeating-linear-gradient(to left, rgba(255,20,239,0.9) 0px, rgba(255,20,239,0.9) 4px, transparent 4px, transparent 9px)'
  const dot = { width: 7, height: 7, borderRadius: '9999px', background: '#FF14EF', boxShadow: '0 0 10px rgba(255,20,239,0.7)' }

  return (
    <motion.div
      key={cardKey}
      initial={{ opacity: 0, scale: 0.94, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: -8 }}
      transition={{ duration: 0.35 }}
      style={{ position: 'absolute', left: pos.left, top: pos.top, transform: 'translate(-50%, -50%)', width: cardWidth, zIndex: 20, pointerEvents: 'none' }}
    >
      <div
        style={{
          position: 'relative',
          background: 'rgba(23,23,26,0.94)',
          border: '1px solid rgba(255,20,239,0.26)',
          borderRadius: isMobile ? 8 : 12,
          padding: isMobile ? '5px 6px' : '8px 10px',
          boxShadow: '0 0 24px rgba(255,20,239,0.12), 0 8px 24px rgba(0,0,0,0.42)',
          backdropFilter: 'blur(8px)',
          color: 'white',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap, marginBottom: isMobile ? 4 : 5 }}>
          <span style={{ fontSize: isMobile ? 12 : 13 }}>{user.flag}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: titleFont, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.name}</div>
            <div style={{ fontSize: subFont, color: 'rgba(255,255,255,0.55)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.city}</div>
          </div>
        </div>

        <p style={{ fontSize: msgFont, lineHeight: isMobile ? 1.35 : 1.5, color: 'rgba(255,255,255,0.76)', margin: 0 }}>"{user.msg}"</p>

        {pos.lineTo === 'bottom' && (
          <>
            <div style={{ position: 'absolute', left: '50%', top: '100%', transform: 'translateX(-50%)', width: 2, height: lineLen, background: dashDown }} />
            {bendInward === 'right' ? (
              <>
                <div style={{ position: 'absolute', left: '50%', top: `calc(100% + ${lineLen}px)`, width: elbowLen, height: 2, background: dashRight }} />
                <div style={{ position: 'absolute', left: `calc(50% + ${elbowLen - 4}px)`, top: `calc(100% + ${lineLen - 4}px)`, ...dot }} />
              </>
            ) : (
              <>
                <div style={{ position: 'absolute', right: '50%', top: `calc(100% + ${lineLen}px)`, width: elbowLen, height: 2, background: dashLeft }} />
                <div style={{ position: 'absolute', right: `calc(50% + ${elbowLen - 4}px)`, top: `calc(100% + ${lineLen - 4}px)`, ...dot }} />
              </>
            )}
          </>
        )}

        {pos.lineTo === 'top' && (
          <>
            <div style={{ position: 'absolute', left: '50%', bottom: '100%', transform: 'translateX(-50%)', width: 2, height: lineLen, background: dashUp }} />
            {bendInward === 'right' ? (
              <>
                <div style={{ position: 'absolute', left: '50%', bottom: `calc(100% + ${lineLen}px)`, width: elbowLen, height: 2, background: dashRight }} />
                <div style={{ position: 'absolute', left: `calc(50% + ${elbowLen - 4}px)`, bottom: `calc(100% + ${lineLen - 4}px)`, ...dot }} />
              </>
            ) : (
              <>
                <div style={{ position: 'absolute', right: '50%', bottom: `calc(100% + ${lineLen}px)`, width: elbowLen, height: 2, background: dashLeft }} />
                <div style={{ position: 'absolute', right: `calc(50% + ${elbowLen - 4}px)`, bottom: `calc(100% + ${lineLen - 4}px)`, ...dot }} />
              </>
            )}
          </>
        )}

        {pos.lineTo === 'left' && (
          <>
            <div style={{ position: 'absolute', right: '100%', top: '50%', transform: 'translateY(-50%)', width: sideLineLen, height: 2, background: dashLeft }} />
            <div style={{ position: 'absolute', right: `calc(100% + ${sideLineLen - 4}px)`, top: '50%', transform: 'translateY(-50%)', ...dot }} />
          </>
        )}

        {pos.lineTo === 'right' && (
          <>
            <div style={{ position: 'absolute', left: '100%', top: '50%', transform: 'translateY(-50%)', width: sideLineLen, height: 2, background: dashRight }} />
            <div style={{ position: 'absolute', left: `calc(100% + ${sideLineLen - 4}px)`, top: '50%', transform: 'translateY(-50%)', ...dot }} />
          </>
        )}
      </div>
    </motion.div>
  )
}

function GlobeSection() {
  const [activeUser, setActiveUser] = useState(null)
  const [userIndex, setUserIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // The 3D chunk + model are only worth fetching once the reader is heading
  // here. 300px of margin gives the download a head start so the globe is
  // usually already there by the time the section is on screen.
  const canvasHostRef = useRef(null)
  /* 1200px of lead — roughly a screen and a half.
     It was 300px, which at scrolling speed is a fraction of a second, and what
     starts then is a 7.8 MB model file. On a phone that download is the whole
     wait: the chunk is already warm (see the idle prefetch below), so the only
     thing left to buy is time, and this buys about four times as much. */
  const globeNear = useInView(canvasHostRef, { once: true, margin: '1200px' })

  /* Can this browser actually give us a WebGL context?

     Asked once, and asked HERE rather than discovered by the renderer throwing
     inside the canvas. A context is refused more often than it sounds: Chrome
     caps how many one process may hold at around sixteen, so somebody with
     enough tabs open gets nothing; hardware acceleration may be off; a driver
     may be blocklisted. The probe context is thrown away immediately (`loseContext`)
     so the check itself doesn't spend one of that budget.
     `useState` with an initialiser, not an effect, so the first render already
     knows and we never mount a canvas we're about to tear down. */
  const [webglOk] = useState(() => {
    if (typeof document === 'undefined') return false
    try {
      const canvas = document.createElement('canvas')
      const gl =
        canvas.getContext('webgl2') ||
        canvas.getContext('webgl') ||
        canvas.getContext('experimental-webgl')
      if (!gl) return false
      ;(gl as any).getExtension?.('WEBGL_lose_context')?.loseContext?.()
      return true
    } catch {
      return false
    }
  })

  /* Fetch and parse the 3D chunk during idle time, long before the reader gets
     here — the render itself still waits for `globeNear`, so no WebGL context
     is created early.
     300px of margin is a fraction of a second at scrolling speed, and this
     chunk is the largest on the site (three.js). Starting it at that point
     meant the download AND the parse landed while the section was sliding into
     view, and parsing blocks the main thread — that was a real stall in the
     middle of the scroll, not just a late reveal. Idle time is free: the
     reader is looking at the hero.
     Skipped on Save-Data, where a megabyte of optional 3D is the wrong call. */
  useEffect(() => {
    /* Save-Data is the Network Information API, which lib.dom does not
       declare — it is Chromium-only, which is also why the access stays
       optional. Narrowed here rather than globally so the assertion sits with
       the one use. */
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
    if (connection?.saveData) return
    // Nothing to warm up if the globe is never going to mount.
    if (!webglOk) return

    const warm = () => {
      import('./LandingGlobeCanvas').catch(() => {
        // A failed prefetch is not an error worth surfacing — the Suspense
        // boundary will request it again when the section is actually reached.
      })
    }

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(warm, { timeout: 3000 })
      return () => window.cancelIdleCallback?.(id)
    }

    const timer = window.setTimeout(warm, 1500)
    return () => window.clearTimeout(timer)
  }, [webglOk])

  useEffect(() => {
    const sync = () => setIsMobile(window.innerWidth <= 640)
    sync()
    window.addEventListener('resize', sync)
    return () => window.removeEventListener('resize', sync)
  }, [])

  useEffect(() => {
    setActiveUser(GLOBE_USERS[0])
    const interval = setInterval(() => {
      setUserIndex((prev) => {
        const next = (prev + 1) % GLOBE_USERS.length
        setActiveUser(GLOBE_USERS[next])
        return next
      })
    }, 3500)
    return () => clearInterval(interval)
  }, [])

  const positions = isMobile ? REVIEW_POSITIONS_MOBILE : REVIEW_POSITIONS_DESKTOP
  const activeReviewPos = positions[userIndex % positions.length]

  return (
    <div className="globe-section">
      <div className="globe-section__badge">
        <span>Global Community</span>
      </div>

      <h2 className="globe-section__title">Loved across the globe</h2>
      <p className="globe-section__lead">
        Thousands of product engineers from every corner of the world trust Tokun.WORLD daily.
      </p>

      <div className="globe-wrap" style={{ maxWidth: isMobile ? 320 : 460 }}>
        <div className="globe-wrap__glow" />

        <div className="globe-canvas-box" ref={canvasHostRef}>
          {/* Two guards, and they catch different things.

              The boundary catches a throw from anywhere in the 3D subtree — a
              context that couldn't be created, a model that wouldn't parse, an
              HDR that didn't arrive — and swaps in the same artwork the loading
              state uses. Without it, React had no boundary above this point and
              a failed globe unmounted the entire page from here down: FAQ, CTA,
              testimonials, footer, all of it, leaving a black screen.

              `webglOk` stops us even getting that far when the browser has no
              context to give — which also spares those visitors the ~600 KB of
              three.js and the 8 MB model they could never have rendered.

              Suspense stays for what it is actually for: the lazy chunk and the
              model still loading. */}
          <CanvasErrorBoundary label="LandingGlobe" fallback={<GlobeFallback waiting={false} />}>
            <Suspense fallback={<GlobeFallback />}>
              {globeNear && webglOk ? (
                <LandingGlobeCanvas isMobile={isMobile} />
              ) : (
                <GlobeFallback waiting={webglOk} />
              )}
            </Suspense>
          </CanvasErrorBoundary>

          <AnimatePresence mode="wait">
            {activeUser && (
              <ReviewCard
                user={activeUser}
                pos={activeReviewPos}
                cardKey={`${activeUser.name}-${userIndex}`}
                isMobile={isMobile}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="globe-stats">
        {[['120+', 'Countries'], ['10K+', 'Active Users'], ['50K+', 'Prompts Created']].map(([num, label]) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div className="globe-stat__num">{num}</div>
            <div className="globe-stat__label">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================================================
   FAQSection
   ============================================================ */

/* The answers are the product's actual behaviour, and they were not.
 *
 * What was here promised a Stripe/PayPal monthly payout, an 80% revenue share,
 * a production API with a 99.9% SLA and "10,000 API calls/month" on Pro, and
 * SOC2 Type II compliance. None of those exist: payouts run through Razorpay
 * per sale, there is no public API to have an SLA, and a compliance claim we
 * cannot evidence is the most expensive sentence on the page. A FAQ is the one
 * part of a landing page a buyer reads as a commitment rather than as
 * marketing, so it has to be the part that is true.
 *
 * Half of it had also been through a find-and-replace of "prompt" -> "product"
 * that hit the sentences too — "rewrites products to be semantically
 * equivalent", "we never train our models on your products" — which reads as
 * machine-written, on the section that exists to sound like a person.
 *
 * ── WHY THERE ARE ALMOST NO NUMBERS HERE ────────────────────────────────────
 *
 * Deliberate, and it is the second thing to know before editing this list.
 * Commission rates, plan prices and token allowances all live server-side and
 * are env-configurable (TOKUN_PROMPT_SELLER_COMMISSION_PERCENT,
 * server/config/plans.js), and this is static marketing copy that cannot read
 * them — so every figure written here is a promise that silently goes stale the
 * day someone changes the real one. Pricing has its own page, which is
 * generated from those values; this section says what you can do, and sends
 * anyone asking "how much" to the place that knows.
 *
 * The one figure that stayed is the 24-hour refund window (REFUND_WINDOW_HOURS),
 * because a deadline a buyer has to act inside is not useful as "soon after you
 * buy". If that env value changes, this is the other place to edit.
 */
const FAQ_ITEMS = [
  {
    q: 'What can I actually do on Tokun?',
    a: 'Four things. SmartGen turns a document or a rough brief into a finished, structured prompt — drop in a PDF, Word file, spreadsheet or deck and it reads the whole thing first. The Optimizer takes a prompt you already have and cuts what it costs to run. The Marketplace is where you buy prompts other people have built, or sell your own. And Super Creator is for when you would rather hire the person than buy the prompt — with the payment held safely until the work is delivered.',
  },
  {
    q: 'Do I need to know prompt engineering?',
    a: 'No — that is most of the point. Describe what you want in your own words, or hand SmartGen the document you already have, and it writes the prompt for you. If you have written one yourself and it nearly works, the Optimizer will tighten it. And if you would rather not write anything at all, the Marketplace is full of prompts built by people who do this every day.',
  },
  {
    q: 'What can I put into SmartGen?',
    a: 'A PDF, a Word document, a spreadsheet, a slide deck, an OpenDocument file, a CSV or plain text — and it reads the whole file, keeping headings, tables and lists intact rather than skimming the first page. You can also skip the file entirely and just type what you need. If all you want is the document itself in a clean, readable form, SmartGen will hand you Markdown and stop there.',
  },
  {
    q: 'How does hiring a creator work?',
    a: 'You find a creator, agree what the work is, and both of you sign an NDA before a single file or brief changes hands. Your payment then goes to Tokun rather than to them — it sits there, untouched, while the work is done, and is released when you approve the delivery. Revisions are agreed before anything starts, and if the two of you cannot settle something, either side can bring it to us while the money is still being held.',
  },
  {
    q: 'How do I earn money on the marketplace?',
    a: 'List a prompt you have written, set your own price, and you are selling. Connect your payout account once, before your listings go on sale, and your earnings from each sale reach that account on their own — there is nothing to withdraw and no payout day to wait for. If you would rather be hired than sell off the shelf, a Super Creator profile puts you in front of clients looking for exactly that.',
  },
  {
    q: 'What if a product is not what I expected?',
    a: 'You have 24 hours from the purchase to ask for a refund, straight from the order, and you tell us what went wrong in your own words rather than picking from a list. Free products are never charged for in the first place, so there is nothing to undo. Hired work is covered differently — the payment is held, not paid out, until you have seen the delivery and approved it.',
  },
  {
    q: 'Is my work private?',
    a: 'Yes, and by default. Everything you generate is yours and visible only to you until you choose to list it. Tokun does not train any model on your prompts. A prompt listed for sale shows its title, description and preview publicly — never the prompt text itself, which only ever reaches someone who has bought it.',
  },
]

function FAQSection() {
  const [openIdx, setOpenIdx] = useState(null)
  const toggle = (i) => setOpenIdx((prev) => (prev === i ? null : i))

  return (
    <div className="faq">
      <div className="faq__badge-wrap">
        <div className="faq__badge"><span>FAQ</span></div>
      </div>

      <h2 className="faq__title">Got questions?</h2>
      <p className="faq__lead">Everything you need to know about Tokun.WORLD</p>

      <div className="faq__list">
        {FAQ_ITEMS.map((item, i) => {
          const isOpen = openIdx === i
          return (
            <div key={i} className={`faq__item${isOpen ? ' faq__item--open' : ''}`}>
              <button type="button" className="faq__q" onClick={() => toggle(i)}>
                <span className="faq__q-text">{item.q}</span>
                <span className="faq__toggle">
                  <ChevronDown size={15} color="#fff" />
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p className="faq__a">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ============================================================
   Footer — see the `import Footer from '@/components/Footer'` at the top of
   this file. The local copy that used to live here has been removed: it
   duplicated the shared footer's markup with its own hardcoded link list, so
   the two drifted apart and the landing page silently missed new links.
   ============================================================ */

/* ============================================================
   LoadingScreen
   ============================================================ */

const PROMPT_STEPS = [
  'Initializing product engine…',
  'Analyzing token patterns…',
  'Optimizing neural pathways…',
  'Compressing context window…',
  'Entering the Productverse…',
]

// How long the curtain is guaranteed to stay up. It's a floor, not a timer —
// the curtain also waits for window 'load', so on a slow connection it stays
// longer. On a repeat visit within the same tab the bundle and images are
// already cached, so sitting through the full intro again is just a delay.
const MIN_LOAD_MS_FIRST = 1600
const MIN_LOAD_MS_REPEAT = 450
const SEEN_CURTAIN_KEY = 'tokun:seen-curtain'
const HOLD_AT_100_MS = 120
const CURTAIN_LIFT_S = 0.68

const NEURAL_LINKS = [
  [100, 36, 48, 72],
  [100, 36, 152, 72],
  [48, 72, 100, 120],
  [152, 72, 100, 120],
  [48, 72, 36, 148],
  [152, 72, 164, 148],
  [100, 120, 72, 162],
  [100, 120, 128, 162],
]

const NEURAL_NODES = [
  [100, 36],
  [48, 72],
  [152, 72],
  [100, 120],
  [36, 148],
  [164, 148],
  [72, 162],
  [128, 162],
]

function LoadingScreen({ onComplete }) {
  const [progress, setProgress] = useState(0)
  const [stepIndex, setStepIndex] = useState(0)
  const [phase, setPhase] = useState('loading')
  const onCompleteRef = useRef(onComplete)
  const phaseRef = useRef(phase)

  onCompleteRef.current = onComplete
  phaseRef.current = phase

  useEffect(() => {
    document.body.classList.add('is-loading')
    return () => document.body.classList.remove('is-loading')
  }, [])

  useEffect(() => {
    let seen = false
    try {
      seen = sessionStorage.getItem(SEEN_CURTAIN_KEY) === '1'
      sessionStorage.setItem(SEEN_CURTAIN_KEY, '1')
    } catch {
      // private mode / storage disabled — just treat it as a first visit
    }
    const minLoadMs = seen ? MIN_LOAD_MS_REPEAT : MIN_LOAD_MS_FIRST

    const start = performance.now()
    let raf = 0
    let finished = false
    let current = 0
    let pageReady = document.readyState === 'complete'

    const onLoad = () => {
      pageReady = true
    }
    window.addEventListener('load', onLoad)

    let progressDone = false

    const startCurtainLift = () => {
      if (finished) return
      finished = true
      cancelAnimationFrame(raf)

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (reduced) {
        onCompleteRef.current?.()
        return
      }

      setTimeout(() => setPhase('lifting'), HOLD_AT_100_MS)
    }

    const complete = () => {
      if (progressDone) return
      progressDone = true
      const from = current
      const begin = performance.now()

      const runEnd = (now) => {
        const t = Math.min((now - begin) / 420, 1)
        const eased = 1 - (1 - t) ** 3
        const val = Math.round(from + (100 - from) * eased)
        current = val
        setProgress(val)

        if (t < 1) {
          requestAnimationFrame(runEnd)
        } else {
          startCurtainLift()
        }
      }

      requestAnimationFrame(runEnd)
    }

    const tick = (now) => {
      const elapsed = now - start
      const timeRatio = Math.min(elapsed / minLoadMs, 1)
      const eased = 1 - (1 - timeRatio) ** 2.2
      const next = Math.min(92, Math.floor(eased * 92))

      if (next > current) {
        current = next
        setProgress(next)
      }

      if (pageReady && elapsed >= minLoadMs) {
        complete()
      } else {
        raf = requestAnimationFrame(tick)
      }
    }

    raf = requestAnimationFrame(tick)
    const safety = setTimeout(complete, minLoadMs + 2000)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(safety)
      window.removeEventListener('load', onLoad)
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((i) => (i + 1) % PROMPT_STEPS.length)
    }, 900)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className={`loading-screen${phase === 'lifting' ? ' loading-screen--lifting' : ''}`}
      initial={{ y: '0%' }}
      animate={{ y: phase === 'lifting' ? '-100%' : '0%' }}
      transition={{ duration: CURTAIN_LIFT_S, ease: [0.76, 0, 0.24, 1] }}
      onAnimationComplete={() => {
        if (phaseRef.current === 'lifting') onCompleteRef.current?.()
      }}
      aria-live="polite"
      aria-busy={phase === 'loading'}
      aria-label="Loading TOKUN"
    >
      <div className="loading-screen__folds" aria-hidden="true" />
      <div className="loading-screen__grid" aria-hidden="true" />
      <div className="loading-screen__glow" aria-hidden="true" />

      <motion.div
        className="loading-screen__content"
        animate={{ opacity: phase === 'lifting' ? 0 : 1, y: phase === 'lifting' ? -24 : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="loading-screen__logo">
          <TokunLogo />
        </div>

        <div className="loading-screen__visual" aria-hidden="true">
          <svg className="loading-screen__neural" viewBox="0 0 200 200">
            <defs>
              <linearGradient id="loadLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="50%" stopColor="#a855f7" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
            </defs>
            {NEURAL_LINKS.map(([x1, y1, x2, y2], i) => (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className="loading-screen__link"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
            {NEURAL_NODES.map(([cx, cy], i) => (
              <circle
                key={`n-${i}`}
                cx={cx}
                cy={cy}
                r={i === 0 ? 5 : 4}
                className="loading-screen__node"
                style={{ animationDelay: `${i * 0.12}s` }}
              />
            ))}
          </svg>

          <div className="loading-screen__core">
            <Sparkles size={28} strokeWidth={1.75} />
          </div>

          <div className="loading-screen__tokens">
            {['{prompt}', '</>', 'tokens', 'AI'].map((token, i) => (
              <span
                key={token}
                className="loading-screen__token"
                style={cssVars({ '--token-i': i })}
              >
                {token}
              </span>
            ))}
          </div>
        </div>

        <div className="loading-screen__prompt" key={stepIndex}>
          <span className="loading-screen__prompt-prefix">&gt;</span>
          {PROMPT_STEPS[stepIndex]}
          <span className="loading-screen__cursor" />
        </div>

        <div className="loading-screen__bar-wrap">
          <div className="loading-screen__bar-track">
            <motion.div
              className="loading-screen__bar-fill"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.35 }}
            />
          </div>
          <span className="loading-screen__percent">{progress}%</span>
        </div>
      </motion.div>

      <div className="loading-screen__hem" aria-hidden="true" />
      <div className="loading-screen__rod" aria-hidden="true" />
    </motion.div>
  )
}

/* ============================================================
   Edge tabs — the rail on the left, Feedback on the right
   ============================================================ */

/** A media query, answered on the FIRST render rather than in an effect. */
function useMediaQuery(query: string, serverFallback: boolean) {
  /* Starting at a fixed value and correcting in an effect is what made the
     feedback tab paint the desktop-sized slab and swap it for the compact one a
     frame later — a visible jump from big to small, on the phone where it is
     most obviously wrong. */
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? serverFallback : window.matchMedia(query).matches
  )

  useEffect(() => {
    const mq = window.matchMedia(query)
    const sync = () => setMatches(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [query])

  return matches
}

/**
 * The two things every edge tab needs to know. Both edges ask, so it is asked
 * once here.
 *
 * `isCompact` — the tab is sized for a desktop edge: 18px of vertical padding
 * around a tracked-out vertical word and a 32px icon tile come to a ~130px slab
 * down the side of a 390px screen.
 *
 * `hasPointer` — whether this is a real mouse, and NOT the same question. The
 * feedback tab's hover animation was gated on `isCompact`, whose query is an OR,
 * so a wide screen reporting `hover: none` still got hover and a phone whose
 * browser claims `hover: hover` (some Android builds do) got it too. On a touch
 * screen hover fires on tap and never leaves: the tab sat at 1.02 scale, then
 * 0.95 on the next press, then back — that is the size flapping between
 * presses. This is the test that actually means "a mouse".
 */
function useEdgeTabMode() {
  return {
    isCompact: useMediaQuery('(max-width: 640px), (hover: none)', false),
    hasPointer: useMediaQuery('(hover: hover) and (pointer: fine)', true),
  }
}

/* The tools, in the order they're used: generate, then tighten.
   The icons are the app's own marks — the same two files the signed-in nav
   renders (components/AppNavigation.tsx maps `id` to `/icons/<id>.<ext>`).
   These were lucide stand-ins, Sparkles and Zap, so the landing page named the
   same two tools with different pictures than the product does: someone who
   clicked "SmartGen" here arrived at a nav item they had no reason to recognise.
   Both files are drawn in white, which is what the tile below needs. */
const TOOL_TABS = [
  {
    label: 'SmartGen',
    to: ROUTES.smartgen,
    iconSrc: '/icons/smartgen.svg',
    gradient: 'linear-gradient(160deg, #d946ef 0%, #a855f7 45%, #7c3aed 100%)',
    glow: 'rgba(168,85,247,0.55)',
  },
  {
    label: 'Optimiser',
    to: ROUTES.optimizer,
    iconSrc: '/icons/prompt-optimization.svg',
    gradient: 'linear-gradient(160deg, #2563eb 0%, #1d4ed8 45%, #1e3a8a 100%)',
    glow: 'rgba(37,99,235,0.55)',
  },
] as const

/**
 * SmartGen and the Optimiser, pinned to the left edge.
 *
 * Same object as the Feedback tab on the other side, mirrored — the radii, the
 * highlight and the vertical label all match, because two edge tabs that don't
 * match read as two unrelated bits of furniture stuck to the same page.
 *
 * Links rather than buttons: middle-click and open-in-new-tab both work, which
 * is what people do with a tool they're about to use on something they already
 * have open.
 */
function ToolRail() {
  const { isCompact, hasPointer } = useEdgeTabMode()

  return (
    /* Anchoring lives in .tool-rail (landing-page.css) because it needs a
       `top: 50%` → `top: 50svh` fallback pair, and an inline style can only hold
       one value per property — on a browser without svh the declaration is
       simply dropped and the rail loses its position entirely. */
    <div className="tool-rail">
      {TOOL_TABS.map((tab) => (
        <motion.div
          key={tab.label}
          initial={false}
          whileHover={hasPointer ? { x: 5, scale: 1.02 } : undefined}
          /* Pointer-only, like Feedback's: a tap that turns into a scroll leaves
             framer waiting on a pointerup it never gets on some mobile browsers,
             so the tab stays shrunk mid-scroll — which reads as the thing
             resizing on its own. */
          whileTap={hasPointer ? { scale: 0.95 } : undefined}
        >
          <Link
            to={tab.to}
            aria-label={tab.label}
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: isCompact ? 7 : 10,
              // Mirrored: the rounded corners face the page, the flat edge the
              // screen edge.
              borderRadius: isCompact ? '0 11px 11px 0' : '0 14px 14px 0',
              background: tab.gradient,
              paddingTop: isCompact ? 11 : 18,
              paddingBottom: isCompact ? 11 : 18,
              paddingLeft: isCompact ? 7 : 11,
              paddingRight: isCompact ? 7 : 11,
              boxShadow: isCompact
                ? `2px 0 16px ${tab.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`
                : `4px 0 32px ${tab.glow}, 1px 0 0 rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.15)`,
              textDecoration: 'none',
            }}
          >
            {/* Shiny top-left highlight */}
            <span
              aria-hidden
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '45%',
                borderRadius: isCompact ? '0 11px 0 0' : '0 14px 0 0',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, transparent 100%)',
                pointerEvents: 'none',
              }}
            />

            {/* The icon leads on this edge — it is the first thing the eye
                reaches coming in from the left. On a phone it is all there is:
                two labelled slabs plus Feedback is more furniture than a 390px
                screen has room for. */}
            <span
              style={{
                width: isCompact ? 24 : 32,
                height: isCompact ? 24 : 32,
                borderRadius: isCompact ? 7 : 9,
                background: 'rgba(255,255,255,0.18)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              <img loading="lazy" decoding="async"
                src={tab.iconSrc}
                alt=""
                aria-hidden="true"
                width={isCompact ? 13 : 16}
                height={isCompact ? 13 : 16}
                style={{ display: 'block' }}
              />
            </span>

            {!isCompact && (
              /* vertical-rl, and no rotation: on this edge the label should read
                 downwards. Feedback's rotate(180deg) is what makes its label
                 read upwards on the right, which is correct there and wrong
                 here. */
              <span
                style={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  color: '#fff',
                  fontSize: 11.5,
                  fontWeight: 800,
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                  textShadow: '0 1px 4px rgba(0,0,0,0.3)',
                }}
              >
                {tab.label}
              </span>
            )}
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

/* ============================================================
   FeedbackButton — floating feedback tab on the right side
   ============================================================ */

const fbInputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 10,
  padding: '10px 14px',
  color: '#f3f4f6',
  fontSize: 13.5,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
  transition: 'border-color 0.2s, background 0.2s',
  backdropFilter: 'blur(6px)',
}

const fbLabelStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.4)',
  fontSize: 11,
  fontWeight: 700,
  display: 'block',
  marginBottom: 6,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
}

function FeedbackButton() {
  /* Both of these used to be four state-and-effect blocks right here, and the
     tool rail on the other edge needed the same two answers. The reasoning for
     each — why they're read on the first render, and why "compact" and "has a
     mouse" are not the same question — moved with them; see useEdgeTabMode. */
  const { isCompact, hasPointer } = useEdgeTabMode()

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [rating, setRating] = useState(0)
  const [hoverStar, setHoverStar] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [experience, setExperience] = useState('')
  const [role, setRole] = useState('')
  const [screenshots, setScreenshots] = useState<File[]>([])
  const [issue, setIssue] = useState('')
  // What that note is. The field was labelled "Any Issue?" and nothing else, so
  // anyone with an idea rather than a bug had to file it as a bug.
  const [noteType, setNoteType] = useState<'issue' | 'suggestion'>('issue')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [otpSending, setOtpSending] = useState(false)
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const reset = () => {
    setRating(0); setHoverStar(0); setName(''); setEmail(''); setExperience('')
    setRole(''); setScreenshots([]); setIssue(''); setNoteType('issue')
    setError(''); setSubmitted(false); setStep('form'); setOtp('')
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(reset, 400)
  }

  const handleSendOtp = async () => {
    setError('')
    if (!name.trim()) { setError('Name is required'); return }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { setError('Valid email is required'); return }
    if (!experience.trim()) { setError('Please share your experience'); return }
    if (rating === 0) { setError('Please give a rating'); return }

    setOtpSending(true)
    try {
      const res = await fetch(`${API_BASE}/api/feedback/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), name: name.trim() }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.error || 'Failed to send OTP'); setOtpSending(false); return }
      setStep('otp')
    } catch {
      setError('Network error. Please try again.')
    }
    setOtpSending(false)
  }

  const handleSubmit = async () => {
    setError('')
    if (otp.trim().length !== 6) { setError('Enter the 6-digit OTP'); return }

    setSubmitting(true)
    try {
      // Verify OTP
      const vRes = await fetch(`${API_BASE}/api/feedback/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      })
      const vData = await vRes.json()
      if (!vData.success) {
        const msg: Record<string,string> = { otp_invalid: 'Incorrect OTP.', otp_expired: 'OTP expired. Go back and resend.', otp_not_found: 'OTP not found. Go back and resend.' }
        setError(msg[vData.error] || 'OTP verification failed')
        setSubmitting(false)
        return
      }

      // Submit feedback
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('email', email.trim())
      formData.append('experience', experience.trim())
      formData.append('rating', String(rating))
      if (role.trim()) formData.append('role', role.trim())
      if (issue.trim()) {
        formData.append('issue', issue.trim())
        formData.append('noteType', noteType)
      }
      screenshots.forEach(f => formData.append('screenshots', f))

      const res = await fetch(`${API_BASE}/api/feedback`, { method: 'POST', body: formData })
      const data = await res.json()

      if (!data.success) { setError(data.error || 'Something went wrong'); setSubmitting(false); return }

      setSubmitted(true)
      setTimeout(handleClose, 2800)
    } catch {
      setError('Network error. Please try again.')
      setSubmitting(false)
    }
  }

  const canProceed = name.trim().length > 0 && /\S+@\S+\.\S+/.test(email) && experience.trim().length > 0 && rating > 0

  const focusBorder = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'rgba(167,139,250,0.6)'
    e.currentTarget.style.background = 'rgba(139,92,246,0.1)'
    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.15)'
  }
  const blurBorder = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
    e.currentTarget.style.boxShadow = 'none'
  }

  const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']

  return (
    <>
      {/* ── Floating tab button ── */}
      <motion.button
        onClick={() => setOpen(true)}
        aria-label="Share feedback"
        initial={false}
        whileHover={hasPointer ? { x: -5, scale: 1.02 } : undefined}
        /* Also pointer-only. A tap that turns into a scroll leaves framer
           waiting on a pointerup it never gets on some mobile browsers, so the
           tab stays shrunk mid-scroll — which reads as the thing resizing on
           its own. The button still gives feedback: it opens the panel. */
        whileTap={hasPointer ? { scale: 0.95 } : undefined}
        /* Anchoring lives in .feedback-tab (landing-page.css) because it needs
           a `top: 38%` → `top: 38svh` fallback pair, and an inline style can
           only hold one value per property: on a browser without svh the
           declaration is simply dropped and the tab loses its position
           entirely. See that rule for why svh matters here. */
        className="feedback-tab"
        style={{
          cursor: 'pointer',
          border: 'none',
          padding: 0,
          background: 'linear-gradient(160deg, #7c3aed 0%, #4f46e5 40%, #2563eb 100%)',
          borderRadius: isCompact ? '11px 0 0 11px' : '14px 0 0 14px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: isCompact ? 7 : 10,
          paddingTop: isCompact ? 11 : 18,
          paddingBottom: isCompact ? 11 : 18,
          paddingLeft: isCompact ? 7 : 11,
          paddingRight: isCompact ? 7 : 11,
          boxShadow: isCompact
            ? '-2px 0 16px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.15)'
            : '-4px 0 32px rgba(124,58,237,0.55), -1px 0 0 rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.15)',
        }}
      >
        {/* Shiny top-left highlight */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '45%',
          borderRadius: isCompact ? '11px 0 0 0' : '14px 0 0 0',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        <span style={{
          writingMode: 'vertical-lr',
          transform: 'rotate(180deg)',
          textOrientation: 'mixed',
          color: '#fff',
          fontSize: isCompact ? 9.5 : 11.5,
          fontWeight: 800,
          /* The tracking is what actually made this tall — 0.14em over eight
             letters adds most of a character's height on its own. */
          letterSpacing: isCompact ? '0.06em' : '0.14em',
          textTransform: 'uppercase',
          lineHeight: 1,
          textShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }}>
          Feedback
        </span>
        <div style={{
          width: isCompact ? 24 : 32,
          height: isCompact ? 24 : 32,
          borderRadius: isCompact ? 7 : 9,
          background: 'rgba(255,255,255,0.18)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: '0 2px 8px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
        }}>
          <MessageSquarePlus size={isCompact ? 12 : 15} color="#fff" style={{ transform: 'scaleX(-1)' }} />
        </div>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="fb-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={handleClose}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(6px)',
                zIndex: 1001,
              }}
            />

            {/* Panel — fixed top+bottom so it never overflows */}
            <motion.div
              key="fb-panel"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 34 }}
              style={{
                position: 'fixed',
                right: 0,
                top: 16,
                bottom: 16,
                zIndex: 1002,
                width: 370,
                display: 'flex',
                flexDirection: 'column',
                background: 'rgba(10, 10, 20, 0.55)',
                backdropFilter: 'blur(28px) saturate(180%)',
                WebkitBackdropFilter: 'blur(28px) saturate(180%)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRight: 'none',
                borderRadius: '22px 0 0 22px',
                boxShadow: '-16px 0 70px rgba(124,58,237,0.3), 0 0 0 1px rgba(139,92,246,0.12) inset',
                overflow: 'hidden',
              }}
            >
              {/* Rainbow gradient top bar */}
              <div style={{
                height: 3,
                background: 'linear-gradient(90deg, #a855f7, #6366f1, #3b82f6, #06b6d4)',
                flexShrink: 0,
              }} />

              {/* Glass inner glow layer */}
              <div style={{
                position: 'absolute',
                top: 3, left: 0, right: 0,
                height: 120,
                background: 'linear-gradient(180deg, rgba(139,92,246,0.12) 0%, transparent 100%)',
                pointerEvents: 'none',
                borderRadius: '22px 0 0 0',
              }} />

              {/* Scrollable content */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '22px 24px 24px',
                scrollbarWidth: 'none',
                position: 'relative',
              }}>
                {submitted ? (
                  /* ── Success ── */
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 300, textAlign: 'center', gap: 12 }}>
                    <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }} style={{ fontSize: 56 }}>🎉</motion.div>
                    <p style={{ color: '#c4b5fd', fontWeight: 800, fontSize: 18, margin: 0 }}>Thanks, {name}!</p>
                    <p style={{ color: '#4b5563', fontSize: 13, margin: 0, lineHeight: 1.5 }}>Your feedback helps us build<br />a better Tokun.</p>
                  </div>
                ) : step === 'otp' ? (
                  /* ── Step 2: OTP ── */
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        <h3 style={{ color: '#f9fafb', fontWeight: 800, fontSize: 18, margin: 0 }}>Verify Email</h3>
                        <p style={{ color: '#4b5563', fontSize: 12.5, margin: '5px 0 0' }}>OTP sent to <span style={{ color: '#a78bfa' }}>{email}</span></p>
                      </div>
                      <button onClick={handleClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, lineHeight: 1 }}>×</button>
                    </div>
                    <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', margin: '16px 0' }} />

                    <div style={{ marginBottom: 20 }}>
                      <label style={fbLabelStyle}>6-digit OTP <span style={{ color: '#7c3aed' }}>*</span></label>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        value={otp}
                        onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter OTP"
                        style={{ ...fbInputStyle, letterSpacing: '0.3em', fontSize: 22, textAlign: 'center', fontWeight: 700 }}
                        onFocus={focusBorder}
                        onBlur={blurBorder}
                        autoFocus
                      />
                      <p style={{ color: '#6b7280', fontSize: 11.5, margin: '8px 0 0' }}>OTP expires in 5 minutes.</p>
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ color: '#f87171', fontSize: 12, marginBottom: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8 }}>⚠ {error}</motion.p>
                      )}
                    </AnimatePresence>

                    <button onClick={handleSubmit} disabled={submitting || otp.length !== 6} style={{ width: '100%', padding: '12px', background: otp.length === 6 ? 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)' : 'rgba(255,255,255,0.04)', border: otp.length === 6 ? 'none' : '1px solid rgba(255,255,255,0.06)', borderRadius: 12, color: otp.length === 6 ? '#fff' : '#374151', fontWeight: 700, fontSize: 14, cursor: submitting || otp.length !== 6 ? 'not-allowed' : 'pointer', transition: 'background 0.2s', letterSpacing: '0.02em', boxShadow: otp.length === 6 ? '0 4px 20px rgba(124,58,237,0.4)' : 'none' }}>
                      {submitting ? 'Verifying…' : 'Verify & Submit →'}
                    </button>
                    <button onClick={() => { setStep('form'); setError(''); setOtp('') }} style={{ width: '100%', marginTop: 10, padding: '10px', background: 'none', border: 'none', color: '#6b7280', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>← Go back & resend OTP</button>
                  </>
                ) : (
                  /* ── Step 1: Form ── */
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                      <div>
                        <h3 style={{ color: '#f9fafb', fontWeight: 800, fontSize: 18, margin: 0, letterSpacing: '-0.01em' }}>Share Feedback</h3>
                        <p style={{ color: '#4b5563', fontSize: 12.5, margin: '5px 0 0', lineHeight: 1.4 }}>Tell us how Tokun is working for you</p>
                      </div>
                      <button onClick={handleClose} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.55)', cursor: 'pointer', width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 19, lineHeight: 1, flexShrink: 0, marginLeft: 10, backdropFilter: 'blur(4px)', transition: 'background 0.15s' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.14)')} onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}>×</button>
                    </div>
                    <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)', margin: '16px 0' }} />

                    {/* Name */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={fbLabelStyle}>Name <span style={{ color: '#7c3aed' }}>*</span></label>
                      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" style={fbInputStyle} onFocus={focusBorder} onBlur={blurBorder} />
                    </div>

                    {/* Email */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={fbLabelStyle}>Email <span style={{ color: '#7c3aed' }}>*</span></label>
                      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" style={fbInputStyle} onFocus={focusBorder} onBlur={blurBorder} />
                    </div>

                    {/* Rating */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={fbLabelStyle}>Rating <span style={{ color: '#7c3aed' }}>*</span></label>
                      <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 6, backdropFilter: 'blur(6px)' }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} onClick={() => setRating(star)} onMouseEnter={() => setHoverStar(star)} onMouseLeave={() => setHoverStar(0)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontSize: 28, color: star <= (hoverStar || rating) ? '#fbbf24' : '#1f2937', transition: 'color 0.12s, transform 0.12s', transform: star <= (hoverStar || rating) ? 'scale(1.2)' : 'scale(1)', lineHeight: 1, filter: star <= (hoverStar || rating) ? 'drop-shadow(0 0 6px rgba(251,191,36,0.5))' : 'none' }}>★</button>
                        ))}
                        {(hoverStar || rating) > 0 && <span style={{ marginLeft: 6, color: '#8b5cf6', fontSize: 12, fontWeight: 600 }}>{ratingLabels[hoverStar || rating]}</span>}
                      </div>
                    </div>

                    {/* Experience */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={fbLabelStyle}>Your Experience <span style={{ color: '#7c3aed' }}>*</span></label>
                      <textarea value={experience} onChange={e => setExperience(e.target.value)} placeholder="What do you love? What could be better?" rows={4} style={{ ...fbInputStyle, resize: 'none' }} onFocus={focusBorder} onBlur={blurBorder} />
                    </div>

                    {/* Profession */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={fbLabelStyle}>Profession</label>
                      <input type="text" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Developer, Designer, Student…" style={fbInputStyle} onFocus={focusBorder} onBlur={blurBorder} />
                    </div>

                    {/* Issue or suggestion — one field, two meanings */}
                    <div style={{ marginBottom: 16 }}>
                      <label style={fbLabelStyle}>
                        Anything to tell us? <span style={{ color: '#6b7280', fontWeight: 400 }}>(optional)</span>
                      </label>

                      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                        {([['issue', 'Report an issue'], ['suggestion', 'Suggest an idea']] as const).map(([key, label]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => setNoteType(key)}
                            style={{
                              padding: '6px 14px',
                              borderRadius: 999,
                              fontSize: 12,
                              fontFamily: 'inherit',
                              cursor: 'pointer',
                              transition: 'background 0.2s, border-color 0.2s, color 0.2s',
                              background: noteType === key ? 'rgba(167,139,250,0.16)' : 'rgba(255,255,255,0.05)',
                              border: `1px solid ${noteType === key ? 'rgba(167,139,250,0.7)' : 'rgba(255,255,255,0.12)'}`,
                              color: noteType === key ? '#c4b5fd' : '#9ca3af',
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>

                      <input
                        type="text"
                        value={issue}
                        onChange={e => setIssue(e.target.value)}
                        placeholder={noteType === 'suggestion'
                          ? 'What would you like us to build or change?'
                          : 'Describe any issue you faced…'}
                        style={fbInputStyle}
                        onFocus={focusBorder}
                        onBlur={blurBorder}
                      />
                    </div>

                    {/* Screenshots */}
                    <div style={{ marginBottom: 20 }}>
                      <label style={fbLabelStyle}>Screenshots <span style={{ color: '#6b7280', fontWeight: 400 }}>(optional, max 5)</span></label>
                      <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => { const files = Array.from(e.target.files || []).slice(0, 5); setScreenshots(files) }} />
                      <button type="button" onClick={() => fileInputRef.current?.click()} style={{ width: '100%', padding: '10px 14px', background: 'rgba(255,255,255,0.06)', border: `1px dashed ${screenshots.length ? 'rgba(167,139,250,0.7)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 10, color: screenshots.length ? '#c4b5fd' : '#6b7280', fontSize: 13, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'border-color 0.2s, color 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>🖼️</span>
                        {screenshots.length ? `${screenshots.length} file${screenshots.length > 1 ? 's' : ''} selected` : 'Upload screenshots (optional)'}
                      </button>
                      {screenshots.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                          {screenshots.map((f, i) => <span key={i} style={{ fontSize: 11, padding: '3px 8px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 6, color: '#c4b5fd', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>)}
                        </div>
                      )}
                    </div>

                    <AnimatePresence>
                      {error && (
                        <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ color: '#f87171', fontSize: 12, marginBottom: 12, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8 }}>⚠ {error}</motion.p>
                      )}
                    </AnimatePresence>

                    <button onClick={handleSendOtp} disabled={otpSending || !canProceed} style={{ width: '100%', padding: '12px', background: canProceed ? 'linear-gradient(135deg, #7c3aed 0%, #2563eb 100%)' : 'rgba(255,255,255,0.04)', border: canProceed ? 'none' : '1px solid rgba(255,255,255,0.06)', borderRadius: 12, color: canProceed ? '#fff' : '#374151', fontWeight: 700, fontSize: 14, cursor: otpSending || !canProceed ? 'not-allowed' : 'pointer', transition: 'background 0.2s, box-shadow 0.2s', letterSpacing: '0.02em', boxShadow: canProceed ? '0 4px 20px rgba(124,58,237,0.4)' : 'none' }}>
                      {otpSending ? 'Sending OTP…' : 'Send OTP →'}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

/* ============================================================
   LandingPage — the single page that ties it all together
   ============================================================ */

export default function LandingPage() {
  const [showCurtain, setShowCurtain] = useState(true)
  const [belowFold, setBelowFold] = useState(false)

  const handleComplete = () => {
    setShowCurtain(false)
    // 2 rAF gap — curtain unmount ke baad paint clear hone do, tab heavy sections mount ho
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setBelowFold(true)
        // Landing is settled; spend the idle time pulling in the chunks for the
        // pages people click through to, so those navigations feel instant.
        prefetchLandingRoutes()
      })
    )
  }

  return (
    <>
      <div className="app-shell">
        {/* Landing's own bar: logo, and either the account dropdown or the two
            sign-in buttons. Transparent all the way down — no panel, no blur.

            Outside <Hero> because `.hero` sets `contain: layout`, which makes
            it the containing block for sticky children — a bar inside it would
            pin to the hero instead of the viewport. */}
        <LandingNav />

        {/* Above-fold — always ready, curtain ke peeche bhi render hota hai */}
        <Hero />
        <WhatWeOffer />
        <HowItWorks />

        {/* Below-fold — curtain hat ne ke baad mount hote hain, GPU free rehti hai */}
        {belowFold && (
          <>
            <GlobeSection />
            <FAQSection />
            <CtaSection />
            <Testimonials />
            <Footer />
          </>
        )}
      </div>

      {/* The two edge rails. Outside `.app-shell` for the same reason the nav
          is outside `.hero`: a fixed child of a container with `contain: layout`
          anchors to that container, not the viewport. */}
      <ToolRail />
      <FeedbackButton />
      {showCurtain && <LoadingScreen onComplete={handleComplete} />}
      {!showCurtain && <CookieConsentBanner />}
    </>
  )
}
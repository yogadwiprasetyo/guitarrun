import { Link, NavLink, Outlet } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'

function NavItem({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        [
          'relative font-serif italic text-[17px] px-1 py-3 transition-colors',
          isActive ? 'text-ink' : 'text-ink-40 hover:text-ink-60',
        ].join(' ')
      }
    >
      {({ isActive }) => (
        <>
          {children}
          <span
            aria-hidden="true"
            className={[
              'absolute left-0 right-0 -bottom-[1px] h-[2px] transition-colors',
              isActive ? 'bg-accent' : 'bg-transparent',
            ].join(' ')}
          />
        </>
      )}
    </NavLink>
  )
}

export default function App() {
  return (
    <div className="min-h-full flex flex-col bg-paper text-ink">
      <header className="sticky top-0 z-20 bg-paper/90 backdrop-blur border-b border-ink-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 h-14 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-baseline gap-0" aria-label="GuitarRun home">
            <span className="font-serif italic text-[22px] leading-none text-ink">guitar</span>
            <span className="font-serif text-[22px] font-semibold leading-none text-accent">run</span>
          </Link>
          <nav className="flex items-end gap-7" aria-label="Main navigation">
            <NavItem to="/">Songs</NavItem>
            <NavItem to="/tuner">Tuner</NavItem>
            <NavItem to="/chords">Chords</NavItem>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
      <footer className="border-t border-ink-20 py-8">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-serif italic text-[15px] text-ink-60">
            Built for guitarists who just want to play. No signup, no ads.
          </p>
          <Link
            to="/design"
            className="text-[11px] uppercase tracking-eyebrow text-ink-40 hover:text-ink-60 transition-colors"
          >
            Design explorations
          </Link>
        </div>
      </footer>
    </div>
  )
}

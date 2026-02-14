import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';

export default function Layout() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/contact', label: 'Contact' },
    { to: '/privacy', label: 'Privacy' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-bg-primary/80 backdrop-blur-xl'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Lusus" className="h-7 w-auto" />
              <span className="text-lg font-bold tracking-tight text-text-primary">Lusus</span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    location.pathname === link.to
                      ? 'text-accent'
                      : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden relative w-8 h-8 flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <div className="flex flex-col gap-[5px]">
                <span
                  className={`block w-5 h-[1.5px] bg-text-primary transition-all duration-300 origin-center ${
                    mobileMenuOpen ? 'rotate-45 translate-y-[3.25px]' : ''
                  }`}
                />
                <span
                  className={`block w-5 h-[1.5px] bg-text-primary transition-all duration-300 ${
                    mobileMenuOpen ? '-rotate-45 -translate-y-[3.25px]' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            mobileMenuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-6 pb-4 bg-bg-primary/95 backdrop-blur-xl border-b border-border">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`block px-4 py-3 text-sm font-medium transition-colors ${
                  location.pathname === link.to
                    ? 'text-accent'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-bg-secondary">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Brand */}
            <div className="md:col-span-5">
              <Link to="/" className="flex items-center gap-2.5">
                <img src="/logo.png" alt="Lusus" className="h-6 w-auto" />
                <span className="text-base font-bold text-text-primary">Lusus</span>
              </Link>
              <p className="mt-3 text-sm text-text-muted leading-relaxed max-w-sm">
                The reverse memory game that flips the script. Memorize, find the odd one out, 
                and build your streak against the clock.
              </p>
            </div>

            {/* Links */}
            <div className="md:col-span-3 md:col-start-8">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">
                Pages
              </h4>
              <ul className="space-y-2.5">
                {navLinks.map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-sm text-text-secondary hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="md:col-span-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">
                Get in touch
              </h4>
              <a
                href="mailto:play@collinsadi.xyz"
                className="text-sm text-text-secondary hover:text-accent transition-colors"
              >
                play@collinsadi.xyz
              </a>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-text-muted">
              &copy; {new Date().getFullYear()} Lusus. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/privacy" className="text-xs text-text-muted hover:text-text-secondary transition-colors">
                Privacy Policy
              </Link>
              <Link to="/contact" className="text-xs text-text-muted hover:text-text-secondary transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

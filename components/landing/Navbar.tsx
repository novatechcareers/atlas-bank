'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const navigationLinks = [
  { href: '/personal', label: 'Personal' },
  { href: '/business', label: 'Business' },
  { href: '/security', label: 'Security' },
  { href: '/about', label: 'About' },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem('atlas-theme');
    if (storedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    window.localStorage.setItem('atlas-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const openMenu = () => setMenuOpen(true);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="topbar">
      <Link className="brand" href="/" onClick={closeMenu}>
        <Image
          src={darkMode ? '/logos/atlas-logo-dark.jpg' : '/logos/atlas-logo-light.jpg'}
          alt="Atlas Bank logo"
          width={180}
          height={48}
          priority
        />
        <span className="brand-name">ATLAS BANK</span>
      </Link>

      <div className="desktop-nav" aria-label="Desktop navigation">
        <nav className="desktop-nav-links" aria-label="Primary navigation">
          {navigationLinks.map((item) => (
            <Link key={item.label} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setDarkMode((current) => !current)}
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
          <Link className="nav-link sign-in" href="/auth/login">
            Sign In
          </Link>
          <Link className="nav-link open-account" href="/auth/open-account">
            Open Account
          </Link>
        </div>
      </div>

      <button
        className="mobile-toggle"
        type="button"
        onClick={openMenu}
        aria-label="Open navigation menu"
        aria-expanded={menuOpen}
      >
        <span aria-hidden="true">☰</span>
      </button>

      {menuOpen ? (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <div className="mobile-menu-header">
            <Link className="brand mobile-brand" href="/" onClick={closeMenu}>
              <Image
                src={darkMode ? '/logos/atlas-logo-dark.jpg' : '/logos/atlas-logo-light.jpg'}
                alt="Atlas Bank logo"
                width={150}
                height={40}
                priority
              />
              <span className="brand-name">ATLAS BANK</span>
            </Link>
            <button
              className="mobile-close"
              type="button"
              onClick={closeMenu}
              aria-label="Close navigation menu"
            >
              ×
            </button>
          </div>

          <nav className="mobile-nav-links" aria-label="Mobile navigation">
            {navigationLinks.map((item) => (
              <Link key={item.label} href={item.href} onClick={closeMenu}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="nav-actions mobile-actions">
            <button
              className="theme-toggle"
              type="button"
              onClick={() => setDarkMode((current) => !current)}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <Link className="nav-link sign-in" href="/auth/login" onClick={closeMenu}>
              Sign In
            </Link>
            <Link className="nav-link open-account" href="/auth/open-account" onClick={closeMenu}>
              Open Account
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  );
}

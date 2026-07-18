"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import AuthCard from "@/components/auth/AuthCard";

type AuthLayoutProps = {
  title?: string;
  description?: string;
  children?: React.ReactNode;
};

export default function AuthLayout({
  title,
  description,
  children,
}: AuthLayoutProps) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("atlas-theme");
    if (storedTheme === "dark") {
      setDarkMode(true);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", darkMode ? "dark" : "light");
    window.localStorage.setItem("atlas-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <main className="auth-layout">
      <div className="auth-shell">
        <div className="auth-topbar">
          <div className="auth-logo" aria-label="Atlas Bank home">
            <Image
              src={darkMode ? "/logos/atlas-logo-dark.jpg" : "/logos/atlas-logo-light.jpg"}
              alt="Atlas Bank logo"
              width={140}
              height={36}
              priority
            />
            <span>ATLAS BANK</span>
          </div>

          <button
            className="theme-toggle"
            type="button"
            onClick={() => setDarkMode((current) => !current)}
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
        </div>

        <AuthCard title={title} description={description}>
          {children}
        </AuthCard>
      </div>
    </main>
  );
}

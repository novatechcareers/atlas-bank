'use client';

import { SUPPORT_EMAIL } from '@/lib/auth';

export function CustomerCareButton() {
  return (
    <a
      href={SUPPORT_EMAIL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center justify-center rounded-2xl border border-[color:var(--primary-gold)]/50 px-4 py-2 text-sm font-semibold text-[color:var(--primary-gold)] transition hover:bg-[color:var(--primary-gold)]/10"
    >
      Customer care
    </a>
  );
}

'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SUBJECTS } from '@/lib/shared/subjects';

export default function SiteHeader(){
  const path = usePathname();
  return (
    <header className="site-head">
      <Link href="/" className="brand">
        <div className="logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M9 3h6M10 3v6L4.5 18.5A2 2 0 0 0 6.2 21.5h11.6a2 2 0 0 0 1.7-3L14 9V3" stroke="#2b2140" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M6.5 16h11l1.2 2.3a1.5 1.5 0 0 1-1.3 2.2H6.6a1.5 1.5 0 0 1-1.3-2.2z" fill="#3fa9ff"/>
          </svg>
        </div>
        <div>
          <h1>Learn Science</h1>
          <p>Belajar sains dengan bereksperimen!</p>
        </div>
      </Link>
      <nav className="tabs">
        {SUBJECTS.map(s => (
          <Link key={s.href} href={s.href} className={`tab ${path.startsWith(s.href) ? 'on' : ''}`}>
            {s.icon} {s.name}{!s.ready && <small>segera</small>}
          </Link>
        ))}
      </nav>
    </header>
  );
}

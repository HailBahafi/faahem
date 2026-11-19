import Link from "next/link";
import AccountLink from "./AccountLink";
import ReviewLink from "./ReviewLink";

export function Logo() {
  return (
    <span className="flex items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden>
        <rect x="2" y="6" width="10" height="16" rx="3" fill="none" stroke="var(--accent)" strokeWidth="2.2" />
        <rect x="16" y="6" width="10" height="16" rx="3" fill="var(--accent)" />
        <circle cx="7" cy="14" r="2" fill="var(--accent)" />
      </svg>
      <span className="text-xl font-bold tracking-tight">فاهم</span>
    </span>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/roadmap" className="rounded-lg px-3 py-2 text-muted hover:bg-surface-2 hover:text-fg">
            خارطة الطريق
          </Link>
          <Link href="/visualize" className="hidden rounded-lg px-3 py-2 text-muted hover:bg-surface-2 hover:text-fg sm:block">
            المتتبّع
          </Link>
          <ReviewLink />
          <AccountLink />
          <Link
            href="/learn/bits"
            className="rounded-lg bg-accent px-3 py-2 font-semibold text-accent-fg hover:opacity-90"
          >
            ابدأ التعلّم
          </Link>
        </nav>
      </div>
    </header>
  );
}

import Logo from "./Logo";
import DownloadButton from "./DownloadButton";
import LevelGauge from "./LevelGauge";
import GithubLink, { GithubMark } from "./GithubLink";

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#faq", label: "FAQ" },
  { href: "#support", label: "Support" },
];

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-night/72 backdrop-blur-xl backdrop-saturate-150">
      <nav aria-label="Main" className="wrap flex h-[var(--nav-h)] items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2.5 rounded-lg font-display text-[1.15rem] font-extrabold tracking-[-0.02em]">
          <Logo />
          TankiAlert
        </a>
        <div className="flex items-center gap-1 sm:gap-6">
          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="whitespace-nowrap rounded-lg px-2.5 py-2 text-[0.95rem] font-medium text-mist transition-colors duration-200 hover:text-ink"
                >
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <LevelGauge />
          <GithubLink
            location="nav"
            kind="star"
            className="inline-flex h-10 items-center gap-2 rounded-[10px] border border-line-strong px-2.5 text-[0.95rem] font-semibold text-mist transition-colors duration-200 hover:border-aqua hover:text-ink sm:px-3"
          >
            <GithubMark />
            <span className="hidden sm:inline">Star</span>
            <span className="sr-only sm:hidden">Star TankiAlert on GitHub</span>
          </GithubLink>
          <DownloadButton location="nav" size="sm" />
        </div>
      </nav>
    </header>
  );
}

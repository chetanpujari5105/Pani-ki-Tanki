import Logo from "./Logo";
import { MAKER } from "@/lib/config";
import GithubLink, { GithubMark } from "./GithubLink";
import { PortfolioLink, SocialIcons } from "./Socials";

const footerLink =
  "inline-flex items-center gap-2 rounded text-mist underline decoration-line-strong transition-colors duration-200 hover:text-aqua hover:decoration-aqua";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-night">
      <div className="wrap flex flex-col gap-8 py-12 md:flex-row md:items-end md:justify-between">
        <div className="flex flex-col gap-5">
          <a href="#top" className="inline-flex w-fit items-center gap-2.5 rounded-lg font-display text-[1.15rem] font-extrabold tracking-[-0.02em]">
            <Logo />
            TankiAlert
          </a>
          <p className="-mt-2 max-w-[40ch] text-mist">
            Made with chai in {MAKER.place} by <span className="font-semibold text-ink">{MAKER.name}</span>, an
            independent AI educator and builder.
          </p>
          <nav aria-label={`${MAKER.name} on social media`}>
            <SocialIcons size="sm" />
          </nav>
        </div>
        <ul className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Links">
          <li>
            <GithubLink location="footer" kind="source" className={footerLink}>
              <GithubMark size={16} />
              View source on GitHub
            </GithubLink>
          </li>
          <li>
            <GithubLink location="footer" kind="star" className={footerLink}>
              ★ Star on GitHub
            </GithubLink>
          </li>
          <li>
            <PortfolioLink location="footer" className={footerLink}>
              Portfolio
              <span className="sr-only">(opens in a new tab)</span>
            </PortfolioLink>
          </li>
        </ul>
      </div>
      <div className="wrap flex flex-col gap-2 border-t border-line py-6 text-[0.85rem] text-haze">
        <p>Privacy-friendly analytics. No cookies.</p>
        <p>
          © 2026 {MAKER.name}. TankiAlert is not affiliated with Apple. Mac, MacBook and macOS are trademarks of Apple
          Inc. Open source under the MIT licence.
        </p>
      </div>
    </footer>
  );
}

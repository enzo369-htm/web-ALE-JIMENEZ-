import Link from "next/link";

const NAV = [
  { href: "/projects", label: "Projects" },
  { href: "/paintings", label: "Paintings" },
  { href: "/about", label: "About" },
] as const;

export default function SiteHeader({
  activeHref,
  showBrand = true,
}: {
  activeHref?: string;
  showBrand?: boolean;
}) {
  return (
    <header className="site-container flex items-start justify-between gap-8 py-8 md:py-10">
      {showBrand ? (
        <Link href="/" className="text-2xl md:text-3xl leading-none tracking-tight">
          Alejandra Jimenez
        </Link>
      ) : (
        <span />
      )}
      <nav className="font-mono-ui text-[11px] md:text-xs tracking-wide uppercase">
        <ul className="flex flex-wrap justify-end gap-x-4 gap-y-2">
          {NAV.map((item) => {
            const active = activeHref === item.href;
            return (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-accent transition-colors">
                  <span className="text-muted">[</span>
                  {active ? " • " : " "}
                  {item.label}
                  <span className="text-muted"> ]</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}

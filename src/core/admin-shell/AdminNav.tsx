"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "../supabase/client";

export type AdminNavLink = {
  href: string;
  label: string;
};

export type AdminNavProps = {
  links: AdminNavLink[];
  loginPath?: string;
  logoutLabel?: string;
};

export function AdminNav({
  links,
  loginPath = "/admin/login",
  logoutLabel = "Sign out",
}: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(loginPath);
    router.refresh();
  }

  return (
    <nav className="border-b border-gray-200 mb-8">
      <div className="flex items-center justify-between py-4">
        <ul className="flex gap-6">
          {links.map((link) => {
            const active =
              pathname === link.href ||
              (link.href !== links[0]?.href &&
                pathname.startsWith(link.href));
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`text-sm ${
                    active
                      ? "font-medium text-black"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-black"
        >
          {logoutLabel}
        </button>
      </div>
    </nav>
  );
}

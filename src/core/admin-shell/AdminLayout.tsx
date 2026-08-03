import type { ReactNode } from "react";
import { AdminNav, type AdminNavLink } from "./AdminNav";

export type AdminLayoutProps = {
  children: ReactNode;
  links: AdminNavLink[];
  loginPath?: string;
  maxWidthClassName?: string;
};

/** Server-friendly shell: wraps children with nav. */
export function AdminLayout({
  children,
  links,
  loginPath,
  maxWidthClassName = "max-w-5xl",
}: AdminLayoutProps) {
  return (
    <div className={`min-h-screen bg-white ${maxWidthClassName} mx-auto px-6 py-8`}>
      <AdminNav links={links} loginPath={loginPath} />
      {children}
    </div>
  );
}

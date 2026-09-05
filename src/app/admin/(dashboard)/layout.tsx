import { AdminLayout } from "@/core/admin-shell";

const links = [
  { href: "/admin", label: "Home" },
  { href: "/admin/hero", label: "Hero" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/paintings", label: "Paintings" },
  { href: "/admin/texts", label: "Texts" },
  { href: "/admin/about", label: "About" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout links={links}>{children}</AdminLayout>;
}

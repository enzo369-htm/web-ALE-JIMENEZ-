import { AdminLayout } from "@/core/admin-shell";

const links = [
  { href: "/admin", label: "Home" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/paintings", label: "Paintings" },
  { href: "/admin/texts", label: "Texts" },
  { href: "/admin/sounds", label: "Sounds" },
  { href: "/admin/about", label: "About" },
  { href: "/admin/canvas", label: "Canvas demo" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout links={links}>{children}</AdminLayout>;
}

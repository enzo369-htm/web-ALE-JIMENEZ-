import Link from "next/link";

const LINKS = [
  {
    href: "/admin/hero",
    label: "Hero",
    blurb: "Left and right photos for the landing hero",
  },
  {
    href: "/admin/projects",
    label: "Projects",
    blurb: "CRUD projects, works, Design A canvas, Design B notes",
  },
  {
    href: "/admin/paintings",
    label: "Paintings",
    blurb: "Year groups with free-canvas positioning (same as Projects Design A)",
  },
  {
    href: "/admin/texts",
    label: "Texts",
    blurb: "Publish writings: title, short text, full text",
  },
  {
    href: "/admin/about",
    label: "About",
    blurb: "Bio, contact, and portrait",
  },
];

export default function AdminHomePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-medium">Alejandra Jimenez — Admin</h1>
        <p className="mt-2 max-w-xl text-sm text-gray-600">
          Edit images and text for the public site. Free-canvas positioning for
          Design A lives inside each project. Kit modules stay in{" "}
          <code className="text-xs">src/core/</code>.
        </p>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block border border-gray-200 p-4 hover:border-black transition-colors"
            >
              <p className="font-medium">{link.label}</p>
              <p className="mt-1 text-sm text-gray-500">{link.blurb}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

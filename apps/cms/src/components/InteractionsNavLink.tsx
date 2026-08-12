"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function InteractionsNavLink() {
  const pathname = usePathname();
  const active = pathname === "/admin/interactions";

  return (
    <Link className={`nav__link${active ? " nav__link--active" : ""}`} href="/admin/interactions">
      站点互动
    </Link>
  );
}

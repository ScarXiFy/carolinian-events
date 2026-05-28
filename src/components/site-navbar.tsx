import Link from "next/link";
import { UserCircle } from "lucide-react";

import { auth } from "@/auth";
import { logout } from "@/app/auth-actions";

type SiteNavbarProps = {
  showUserMenu?: boolean;
};

export async function SiteNavbar({ showUserMenu = false }: SiteNavbarProps) {
  const session = await auth();
  const userName = session?.user?.name || session?.user?.email || "Account";

  return (
    <nav className="navbar" id="navbar">
      <div className="nav-container">
        <Link href="/" className="brand">
          Carolinian<span>Events</span>
        </Link>
        <div className="nav-links">
          <Link href="/">Home</Link>
          <a href="/#features">Features</a>
          <Link href="/events">Events Dashboard</Link>
          {showUserMenu && session ? (
            <details className="navbar-user-menu">
              <summary aria-label="Open account menu">
                <UserCircle size={24} aria-hidden="true" />
              </summary>
              <div className="navbar-user-dropdown">
                <p>{userName}</p>
                <form action={logout}>
                  <button type="submit">Log out</button>
                </form>
              </div>
            </details>
          ) : null}
        </div>
      </div>
    </nav>
  );
}

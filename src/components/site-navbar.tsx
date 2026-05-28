import Link from "next/link";
import { UserCircle } from "lucide-react";

import { auth } from "@/auth";
import { logout } from "@/app/auth-actions";
import { requestOrganizerAccess } from "@/app/account-actions";
import { canApproveOrganizers, ROLES } from "@/lib/permissions.mjs";

type SiteNavbarProps = {
  showUserMenu?: boolean;
};

export async function SiteNavbar({ showUserMenu = false }: SiteNavbarProps) {
  const session = await auth();
  const userName = session?.user?.name || session?.user?.email || "Account";
  const role = session?.user?.role || ROLES.STUDENT;

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
                <span className="navbar-user-role">{role}</span>
                {canApproveOrganizers(role) ? (
                  <Link href="/admin">Admin</Link>
                ) : null}
                {role === ROLES.STUDENT ? (
                  <form action={requestOrganizerAccess}>
                    <button type="submit">Request organizer access</button>
                  </form>
                ) : null}
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

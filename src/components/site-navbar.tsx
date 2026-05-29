"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, UserCircle } from "lucide-react";

import { logout } from "@/app/auth-actions";
import { requestOrganizerAccess } from "@/app/account-actions";
import { ROLES } from "@/lib/permissions.mjs";

type SiteNavbarProps = {
  showUserMenu?: boolean;
  isLoggedIn?: boolean;
  userName?: string;
  role?: string;
  isAdmin?: boolean;
};

export function SiteNavbar({
  showUserMenu = false,
  isLoggedIn = false,
  userName = "Account",
  role = ROLES.STUDENT,
  isAdmin = false,
}: SiteNavbarProps) {
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close both dropdowns when clicking anywhere outside the navbar icons
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setUserOpen(false);
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleUser() {
    setUserOpen((v) => !v);
    setNotifOpen(false);
  }

  function toggleNotif() {
    setNotifOpen((v) => !v);
    setUserOpen(false);
  }

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

          {showUserMenu && isLoggedIn && (
            <div className="navbar-icons-group" ref={navRef}>
              {/* Notification Icon */}
              <div className="navbar-notification-menu">
                <button
                  type="button"
                  aria-label="Open notifications"
                  aria-expanded={notifOpen}
                  className="navbar-icon-btn"
                  onClick={toggleNotif}
                >
                  <Bell size={20} aria-hidden="true" />
                </button>
                {notifOpen && (
                  <div className="navbar-user-dropdown navbar-notif-dropdown">
                    <p className="notif-empty">No notifications yet.</p>
                  </div>
                )}
              </div>

              {/* Avatar / User Menu */}
              <div className="navbar-user-menu">
                <button
                  type="button"
                  aria-label="Open account menu"
                  aria-expanded={userOpen}
                  className="navbar-icon-btn"
                  onClick={toggleUser}
                >
                  <UserCircle size={24} aria-hidden="true" />
                </button>
                {userOpen && (
                  <div className="navbar-user-dropdown">
                    <p>{userName}</p>
                    <span className="navbar-user-role">{role}</span>
                    {isAdmin && <Link href="/admin">Admin</Link>}
                    {role === ROLES.STUDENT && (
                      <form action={requestOrganizerAccess}>
                        <button type="submit">Request organizer access</button>
                      </form>
                    )}
                    <form action={logout}>
                      <button type="submit">Log out</button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

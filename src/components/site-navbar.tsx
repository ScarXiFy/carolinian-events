"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import { Bell, UserCircle } from "lucide-react";

import { logout } from "@/app/auth-actions";
import { requestOrganizerAccess } from "@/app/account-actions";
import { ROLES } from "@/lib/permissions.mjs";

type SiteNavbarProps = {
  isLoggedIn?: boolean;
  userName?: string;
  role?: string;
  isAdmin?: boolean;
};

export function SiteNavbar({
  isLoggedIn = false,
  userName = "Account",
  role = ROLES.STUDENT,
  isAdmin = false,
}: SiteNavbarProps) {
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;

      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setNotifOpen(false);
      }

      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setUserOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setUserOpen(false);
        setNotifOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
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
          <Link href="/#features">Features</Link>
          <Link href="/events">Events Dashboard</Link>

          {isLoggedIn && (
            <div className="navbar-icons-group">
              <NotificationMenu
                isOpen={notifOpen}
                onToggle={toggleNotif}
                menuRef={notificationRef}
              />
              <UserMenu
                isOpen={userOpen}
                onToggle={toggleUser}
                menuRef={userMenuRef}
                userName={userName}
                role={role}
                isAdmin={isAdmin}
              />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function NotificationMenu({
  isOpen,
  onToggle,
  menuRef,
}: {
  isOpen: boolean;
  onToggle: () => void;
  menuRef: RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="navbar-notification-menu" ref={menuRef}>
      <button
        type="button"
        aria-label="Open notifications"
        aria-expanded={isOpen}
        className="navbar-icon-btn"
        onClick={onToggle}
      >
        <Bell size={20} aria-hidden="true" />
      </button>
      {isOpen && (
        <div className="navbar-user-dropdown navbar-notif-dropdown" role="status">
          <p className="notif-empty">No notifications yet.</p>
        </div>
      )}
    </div>
  );
}

function UserMenu({
  isOpen,
  onToggle,
  menuRef,
  userName,
  role,
  isAdmin,
}: {
  isOpen: boolean;
  onToggle: () => void;
  menuRef: RefObject<HTMLDivElement | null>;
  userName: string;
  role: string;
  isAdmin: boolean;
}) {
  return (
    <div className="navbar-user-menu" ref={menuRef}>
      <button
        type="button"
        aria-label="Open account menu"
        aria-expanded={isOpen}
        className="navbar-icon-btn"
        onClick={onToggle}
      >
        <UserCircle size={24} aria-hidden="true" />
      </button>
      {isOpen && (
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
  );
}

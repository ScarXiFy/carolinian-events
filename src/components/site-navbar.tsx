"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import Link from "next/link";
import { Bell, UserCircle } from "lucide-react";

import { logout } from "@/app/auth-actions";
import { requestOrganizerAccess } from "@/app/account-actions";
import { markMyNotificationsRead } from "@/app/notification-actions";
import { ROLES } from "@/lib/permissions.mjs";

type SiteNavbarProps = {
  isLoggedIn?: boolean;
  userName?: string;
  role?: string;
  isAdmin?: boolean;
  notifications?: NotificationItem[];
  unreadNotificationCount?: number;
};

type NotificationItem = {
  id: number;
  title: string;
  message: string;
  eventId?: number | null;
  readAt?: string | null;
  createdAt?: string | null;
};

export function SiteNavbar({
  isLoggedIn = false,
  userName = "Account",
  role = ROLES.STUDENT,
  isAdmin = false,
  notifications = [],
  unreadNotificationCount = 0,
}: SiteNavbarProps) {
  const [userOpen, setUserOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [visibleUnreadCount, setVisibleUnreadCount] = useState(unreadNotificationCount);
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
    const nextOpen = !notifOpen;

    setNotifOpen(nextOpen);
    setUserOpen(false);

    if (nextOpen && visibleUnreadCount > 0) {
      setVisibleUnreadCount(0);
      void markMyNotificationsRead();
    }
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
                notifications={notifications}
                unreadNotificationCount={visibleUnreadCount}
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
  notifications,
  unreadNotificationCount,
}: {
  isOpen: boolean;
  onToggle: () => void;
  menuRef: RefObject<HTMLDivElement | null>;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
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
        {unreadNotificationCount > 0 ? (
          <span className="navbar-notification-badge">
            {unreadNotificationCount > 9 ? "9+" : unreadNotificationCount}
          </span>
        ) : null}
      </button>
      {isOpen && (
        <div className="navbar-user-dropdown navbar-notif-dropdown" role="status">
          {notifications.length === 0 ? (
            <p className="notif-empty">No notifications yet.</p>
          ) : (
            <div className="notif-list">
              {notifications.map((notification) => {
                const content = (
                  <>
                    <strong>{notification.title}</strong>
                    <span>{notification.message}</span>
                  </>
                );

                return notification.eventId ? (
                  <Link
                    href={`/events/${notification.eventId}`}
                    className={`notif-item ${notification.readAt ? "" : "notif-item-unread"}`}
                    key={notification.id}
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    className={`notif-item ${notification.readAt ? "" : "notif-item-unread"}`}
                    key={notification.id}
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          )}
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

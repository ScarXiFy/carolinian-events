import { auth } from "@/auth";
import { canApproveOrganizers, ROLES } from "@/lib/permissions.mjs";
import { SiteNavbar } from "@/components/site-navbar";
import {
  getUnreadNotificationCount,
  listNotifications,
} from "@/lib/notifications.mjs";

type SiteNavbarServerProps = {
  showUserMenu?: boolean;
};

export async function SiteNavbarServer(_props: SiteNavbarServerProps = {}) {
  void _props;

  const session = await auth();
  const userName = session?.user?.name || session?.user?.email || "Account";
  const role = session?.user?.role || ROLES.STUDENT;
  const isLoggedIn = Boolean(session);
  const isAdmin = canApproveOrganizers(role);
  const notifications = session?.user?.id
    ? await listNotifications(session.user.id)
    : [];
  const unreadNotificationCount = session?.user?.id
    ? await getUnreadNotificationCount(session.user.id)
    : 0;

  return (
    <SiteNavbar
      isLoggedIn={isLoggedIn}
      userName={userName}
      role={role}
      isAdmin={isAdmin}
      notifications={notifications}
      unreadNotificationCount={unreadNotificationCount}
    />
  );
}

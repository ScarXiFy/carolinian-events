import { auth } from "@/auth";
import { canApproveOrganizers, ROLES } from "@/lib/permissions.mjs";
import { SiteNavbar } from "@/components/site-navbar";

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

  return (
    <SiteNavbar
      isLoggedIn={isLoggedIn}
      userName={userName}
      role={role}
      isAdmin={isAdmin}
    />
  );
}

export const ROLES = {
  STUDENT: "Student",
  ORGANIZER: "Organizer",
  ADMIN: "Admin",
};

export function isAdmin(role) {
  return role === ROLES.ADMIN;
}

export function isOrganizer(role) {
  return role === ROLES.ORGANIZER;
}

export function canJoinEvents(role) {
  return role === ROLES.STUDENT || role === ROLES.ORGANIZER || role === ROLES.ADMIN;
}

export function canCreateEvents(role) {
  return role === ROLES.ORGANIZER || role === ROLES.ADMIN;
}

export function canManageOwnEvents(role) {
  return role === ROLES.ORGANIZER || role === ROLES.ADMIN;
}

export function canManageAllEvents(role) {
  return role === ROLES.ADMIN;
}

export function canApproveOrganizers(role) {
  return role === ROLES.ADMIN;
}

export function canManageEvent(role, userId, event) {
  if (canManageAllEvents(role)) return true;
  if (!canManageOwnEvents(role)) return false;

  return Boolean(userId && event?.createdByUserId && event.createdByUserId === userId);
}

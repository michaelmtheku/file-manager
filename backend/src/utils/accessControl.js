export function hasReadAccess(userId, file) {
  if (!file) return false;
  if (file.ownerId === userId) return true;
  return (file.sharedWith || []).some((s) => s.userId === userId);
}

export function hasWriteAccess(userId, file) {
  if (!file) return false;
  // Only owner can write for now. Extend later for collaborator write access.
  return file.ownerId === userId;
}

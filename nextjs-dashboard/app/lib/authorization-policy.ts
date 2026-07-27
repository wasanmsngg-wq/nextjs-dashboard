type SessionLike = {
  user?: {
    role?: string;
  };
} | null;

export function canManageHospitals(session: SessionLike) {
  return session?.user?.role === 'admin';
}

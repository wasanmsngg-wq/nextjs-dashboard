import { auth } from '@/auth';
import { canManageHospitals } from '@/app/lib/authorization-policy';

export { canManageHospitals };

export async function isHospitalAdmin() {
  return canManageHospitals(await auth());
}

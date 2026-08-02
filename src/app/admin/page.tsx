import { cookies } from 'next/headers';
import LuxeLoomApp from '@/features/luxe-loom/LuxeLoomApp';
import { ADMIN_COOKIE_NAME, isAdminSessionValid } from '@/lib/admin-auth';
import AdminLogin from './AdminLogin';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const cookieStore = await cookies();
  const authenticated = isAdminSessionValid(cookieStore.get(ADMIN_COOKIE_NAME)?.value);
  return authenticated ? <LuxeLoomApp adminMode /> : <AdminLogin />;
}

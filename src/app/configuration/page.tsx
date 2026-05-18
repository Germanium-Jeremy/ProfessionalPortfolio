import { getAdminProfile } from '@/lib/repositories/profileRepository';

export default async function AdminDashboard() {
  const profile = await getAdminProfile();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">Welcome back</h2>
          <p className="text-slate-500">{profile?.fullName || 'Admin'}</p>
        </div>
      </div>
    </div>
  );
}

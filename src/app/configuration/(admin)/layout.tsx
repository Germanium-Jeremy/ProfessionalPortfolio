import { requireSession } from '@/lib/auth';
import { getAdminProfile } from '@/lib/repositories/profileRepository';
import Link from 'next/link';
import { LayoutDashboard, User, Briefcase, GraduationCap, Settings, LogOut, Wrench, Quote, Contact } from 'lucide-react';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireSession();
  const profile = await getAdminProfile();

  const navItems = [
    { href: '/configuration', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/configuration/profile', label: 'Profile', icon: User },
    { href: '/configuration/projects', label: 'Projects', icon: Briefcase },
    { href: '/configuration/experience', label: 'Experience', icon: GraduationCap },
    { href: '/configuration/skills', label: 'Skills', icon: Wrench },
    { href: '/configuration/testimonials', label: 'Testimonials', icon: Quote },
    { href: '/configuration/contacts', label: 'Contacts', icon: Contact },
    { href: '/configuration/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-xl font-bold">Admin CMS</h1>
          {profile && <p className="text-sm text-slate-500 mt-1">{profile.fullName}</p>}
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <form action="/api/configuration/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>
      
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}

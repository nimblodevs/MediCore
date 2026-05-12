import { useState } from 'react'
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Command,
  LogOut,
  Menu,
  Settings,
  Search,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import Input from './ui/Input'

const sectionTitles = {
  dashboard: 'Dashboard',
  patients: 'Patient Registry',
  'patient-registration': 'Patient Registration',
  appointments: 'Appointments',
  consultation: 'Consultation',
  admissions: 'Admissions',
  pharmacy: 'Pharmacy',
  laboratory: 'Laboratory',
  reports: 'Reports',
}

const Navbar = ({ activeSection = 'dashboard', onMenuClick }) => {
  const [profileOpen, setProfileOpen] = useState(false)
  const sectionTitle = sectionTitles[activeSection] ?? 'Dashboard'
  const iconButtonClasses =
    'inline-flex size-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-all duration-200 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:text-cyan-700 hover:shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-500/25'

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 shadow-md backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="flex min-h-18 items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          aria-label="Open sidebar"
          className={`${iconButtonClasses} lg:hidden`}
          onClick={onMenuClick}
        >
          <Menu className="size-5" />
        </button>

        <div className="min-w-0 flex-1 py-3">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold uppercase tracking-[0.14em] text-cyan-700">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3.5" />
              Clinical workspace
            </span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
            <span className="hidden text-slate-500 sm:inline">MediCore HMS</span>
          </div>
          <h1 className="mt-1 truncate text-lg font-bold text-slate-950 sm:text-xl">
            {sectionTitle}
          </h1>
        </div>

        <div className="hidden min-w-72 max-w-md flex-1 md:block">
          <Input
            type="search"
            aria-label="Search patients, visits, invoices"
            placeholder="Search patients, visits, invoices..."
            leftIcon={<Search className="size-4" />}
            inputClassName="bg-slate-50 focus:bg-white transition-colors"
            rightElement={
              <span className="hidden items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-400 xl:inline-flex">
                <Command className="size-3.5" /> K
              </span>
            }
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-cyan-200 hover:bg-gradient-to-r hover:from-cyan-50 hover:to-cyan-100/50 hover:text-cyan-800 hover:shadow-md focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-500/25 xl:inline-flex"
          >
            <CalendarDays className="size-4 text-cyan-600" />
            Mon, 11 May 2026 - 16:01:00
          </button>

          <button
            type="button"
            className={`${iconButtonClasses} md:hidden`}
            aria-label="Search"
          >
            <Search className="size-5" />
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className={`${iconButtonClasses} relative`}
          >
            <Bell className="size-5" />
            <span className="absolute right-2 top-2 size-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 ring-2 ring-white shadow-sm" />
            <span className="absolute -right-0.5 -top-0.5 hidden min-w-5 rounded-full bg-gradient-to-r from-slate-900 to-slate-800 px-1.5 text-center text-[10px] font-bold leading-5 text-white shadow-sm sm:block">
              3
            </span>
          </button>

          <div className="relative">
            {profileOpen && (
              <button
                type="button"
                aria-label="Close profile menu"
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setProfileOpen(false)}
              />
            )}

            <div className="relative z-50">
              <button
                type="button"
                aria-expanded={profileOpen}
                aria-haspopup="menu"
                onClick={() => setProfileOpen((open) => !open)}
                className="group flex h-10 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-2.5 text-left shadow-sm transition-all duration-200 hover:border-cyan-200 hover:bg-gradient-to-r hover:from-cyan-50/60 hover:to-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-500/25"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-600 to-cyan-500 text-white shadow-md shadow-cyan-500/20">
                  <UserRound className="size-4.5" />
                </span>
                <span className="hidden min-w-0 sm:block">
                  <span className="block truncate text-sm font-bold text-slate-950">
                    Dr. Amina
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    Administrator
                  </span>
                </span>
                <ChevronDown
                  className={[
                    'hidden size-4 text-slate-400 transition-all duration-200 sm:block',
                    profileOpen ? 'rotate-180 text-cyan-600' : '',
                  ].join(' ')}
                />
              </button>

              <div
                role="menu"
                className={[
                  'absolute right-0 top-12 z-50 min-w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl outline-none',
                  profileOpen ? 'block' : 'hidden',
                ].join(' ')}
              >
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 outline-none transition-colors hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:text-slate-950 focus:bg-slate-50 focus:text-slate-950"
                >
                  <UserRound className="size-4 text-slate-400" />
                  Profile
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 outline-none transition-colors hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 hover:text-slate-950 focus:bg-slate-50 focus:text-slate-950"
                >
                  <Settings className="size-4 text-slate-400" />
                  Settings
                </button>
                <div className="my-1.5 h-px bg-slate-200" />
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-red-600 outline-none transition-colors hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
                >
                  <LogOut className="size-4" />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Navbar

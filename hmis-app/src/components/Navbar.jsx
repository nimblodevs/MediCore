import { useState } from "react";
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
} from "lucide-react";
import Input from "./ui/Input";

const sectionTitles = {
  dashboard: "Dashboard",
  patients: "Patient Registry",
  "patient-registration": "Patient Registration",
  appointments: "Appointments",
  consultation: "Consultation",
  admissions: "Admissions",
  pharmacy: "Pharmacy",
  laboratory: "Laboratory",
  reports: "Reports",
};

const Navbar = ({ activeSection = "dashboard", onMenuClick }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  const sectionTitle = sectionTitles[activeSection] ?? "Dashboard";
  const iconButtonClasses =
    "inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-500/25";

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/85">
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
            <span className="hidden text-slate-500 sm:inline">
              MediCore HMS
            </span>
          </div>
          <h1 className="mt-1 truncate text-lg font-semibold text-slate-950 sm:text-xl">
            {sectionTitle}
          </h1>
        </div>

        <div className="hidden min-w-72 max-w-md flex-1 md:block">
          <Input
            type="search"
            aria-label="Search patients, visits, invoices"
            placeholder="Search patients, visits, invoices..."
            leftIcon={<Search className="size-4" />}
            inputClassName="bg-slate-50 focus:bg-white"
            rightElement={
              <span className="hidden items-center gap-1 rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[11px] font-medium text-slate-400 xl:inline-flex">
                <Command className="size-3" /> K
              </span>
            }
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="hidden h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-xs transition-colors hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-800 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-500/25 xl:inline-flex"
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
            <span className="absolute right-2 top-2 size-2 rounded-full bg-cyan-500 ring-2 ring-white" />
            <span className="absolute -right-0.5 -top-0.5 hidden min-w-5 rounded-full bg-slate-950 px-1 text-center text-[10px] font-bold leading-5 text-white sm:block">
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
                className="group flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 text-left shadow-xs transition-colors hover:border-cyan-200 hover:bg-cyan-50/60 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-500/25"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                  <UserRound className="size-4" />
                </span>
                <span className="hidden min-w-0 sm:block">
                  <span className="block truncate text-sm font-semibold text-slate-950">
                    Dr. Amina
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    Administrator
                  </span>
                </span>
                <ChevronDown
                  className={[
                    "hidden size-4 text-slate-400 transition-transform sm:block",
                    profileOpen ? "rotate-180" : "",
                  ].join(" ")}
                />
              </button>

              <div
                role="menu"
                className={[
                  "absolute right-0 top-12 z-50 min-w-48 rounded-md border border-slate-200 bg-white p-1 shadow-lg outline-none",
                  profileOpen ? "block" : "hidden",
                ].join(" ")}
              >
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm text-slate-700 outline-none hover:bg-slate-100 hover:text-slate-950 focus:bg-slate-100 focus:text-slate-950"
                >
                  <UserRound className="size-4" />
                  Profile
                </button>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm text-slate-700 outline-none hover:bg-slate-100 hover:text-slate-950 focus:bg-slate-100 focus:text-slate-950"
                >
                  <Settings className="size-4" />
                  Settings
                </button>
                <div className="my-1 h-px bg-slate-200" />
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-center gap-2 rounded-sm px-2 py-2 text-left text-sm text-red-600 outline-none hover:bg-red-50 hover:text-red-700 focus:bg-red-50 focus:text-red-700"
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
  );
};

export default Navbar;

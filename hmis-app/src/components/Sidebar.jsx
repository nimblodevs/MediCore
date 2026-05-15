import {
  Activity,
  Bed,
  CalendarDays,
  ClipboardPlus,
  ChevronDown,
  ChevronRight,
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Pill,
  Settings,
  Stethoscope,
  Users,
  X,
} from "lucide-react";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard, badge: 0 },
  {
    key: "patients",
    label: "Patients",
    icon: Users,
    badge: 12,
    children: [
      {
        key: "patient-list",
        label: "Patient Registry",
        icon: FileText,
      },
      {
        key: "patient-registration",
        label: "Registration",
        icon: ClipboardPlus,
      },
      {
        key: "patient-report-summary",
        label: "Patient Reports — Summary",
        icon: FileText,
      },
      {
        key: "patient-report-visits",
        label: "Patient Reports — Visits",
        icon: CalendarDays,
      },
      {
        key: "patient-report-lab",
        label: "Patient Reports — Laboratory",
        icon: FileText,
      },
      {
        key: "patient-report-billing",
        label: "Patient Reports — Billing",
        icon: FileText,
      },
    ],
  },
  { key: "appointments", label: "Appointments", icon: CalendarDays, badge: 5 },
  { key: "consultation", label: "Consultation", icon: Stethoscope, badge: 0 },
  { key: "admissions", label: "Admissions", icon: Bed, badge: 3 },
  { key: "pharmacy", label: "Pharmacy", icon: Pill, badge: 0 },
  { key: "laboratory", label: "Laboratory", icon: Activity, badge: 8 },
  { key: "reports", label: "Reports", icon: FileText, badge: 0 },
];

const Sidebar = ({
  currentKey = "dashboard",
  isMobile = false,
  onClose,
  onNavigate,
}) => {
  const handleNav = (key) => {
    onNavigate?.(key);
    if (isMobile) {
      onClose?.();
    }
  };

  return (
    <aside className="flex h-dvh w-full shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white text-slate-900 shadow-sm lg:h-screen lg:w-72">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-sm shadow-cyan-900/10">
            <Home size={20} strokeWidth={2.4} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-bold tracking-tight">
              MediCore
            </p>
            <p className="truncate text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
              HMS v3.0
            </p>
          </div>
        </div>
        {isMobile && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className="inline-flex size-9 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-500/25"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <div className="border-b border-slate-200 px-4 py-4">
        <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cyan-700">
              MFL 13104
            </p>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">
              Online
            </span>
          </div>
          <p className="mt-1 text-sm font-semibold text-slate-800">
            Nairobi, Kenya
          </p>
          <p className="mt-1 text-xs text-slate-500">
            General outpatient facility
          </p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          Modules
        </p>
        <div className="space-y-1">
          {navItems.map((item) => {
            const hasChildren = item.children?.length > 0;
            const childActive = item.children?.some(
              (child) => child.key === currentKey
            );
            const active = currentKey === item.key || childActive;
            const Icon = item.icon;

            return (
              <div key={item.key}>
                <button
                  type="button"
                  onClick={() => handleNav(item.key)}
                  className={[
                    "group relative flex h-11 w-full items-center gap-3 rounded-lg px-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-500/20",
                    active
                      ? "bg-cyan-50 font-semibold text-cyan-800 shadow-xs"
                      : "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-950",
                  ].join(" ")}
                >
                  {active && (
                    <span className="absolute left-0 top-2 h-7 w-1 rounded-r-full bg-cyan-600" />
                  )}
                  <span
                    className={[
                      "flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                      active
                        ? "bg-cyan-600 text-white"
                        : "bg-slate-100 text-slate-500 group-hover:bg-white group-hover:text-slate-800",
                    ].join(" ")}
                  >
                    <Icon size={17} />
                  </span>
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.badge > 0 && (
                    <span
                      className={[
                        "min-w-6 rounded-full px-2 py-0.5 text-center text-xs font-semibold",
                        active
                          ? "bg-cyan-600 text-white"
                          : "bg-slate-200 text-slate-700",
                      ].join(" ")}
                    >
                      {item.badge}
                    </span>
                  )}
                  {hasChildren ? (
                    <ChevronDown
                      size={15}
                      className={[
                        "shrink-0 transition-transform",
                        active ? "rotate-180 text-cyan-700" : "text-slate-300",
                      ].join(" ")}
                    />
                  ) : (
                    <ChevronRight
                      size={15}
                      className={[
                        "shrink-0 transition-opacity",
                        active
                          ? "text-cyan-700 opacity-100"
                          : "text-slate-300 opacity-0 group-hover:opacity-100",
                      ].join(" ")}
                    />
                  )}
                </button>

                {hasChildren && active && (
                  <div className="ml-6 mt-1 space-y-1 border-l border-cyan-100 pl-3">
                    {item.children.map((child) => {
                      const childSelected = currentKey === child.key;
                      const ChildIcon = child.icon;

                      return (
                        <button
                          key={child.key}
                          type="button"
                          onClick={() => handleNav(child.key)}
                          className={[
                            "flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-500/20",
                            childSelected
                              ? "bg-white font-semibold text-cyan-800 shadow-xs ring-1 ring-cyan-100"
                              : "font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900",
                          ].join(" ")}
                        >
                          <ChildIcon size={16} className="shrink-0" />
                          <span className="min-w-0 flex-1 truncate">
                            {child.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-slate-200 bg-slate-50/80 p-3">
        <div className="mb-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <p className="truncate text-sm font-semibold text-slate-900">
            Night shift
          </p>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            12 active staff on duty
          </p>
        </div>
        <button
          type="button"
          className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-white hover:text-slate-950 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-cyan-500/20"
        >
          <Settings size={18} />
          <span className="min-w-0 flex-1 truncate text-left">Settings</span>
        </button>
        <button
          type="button"
          className="mt-1 flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-slate-600 transition-colors hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-red-500/15"
        >
          <LogOut size={18} />
          <span className="min-w-0 flex-1 truncate text-left">Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

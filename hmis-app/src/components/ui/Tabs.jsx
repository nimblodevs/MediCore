import { useState } from "react";

const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="relative">
      {/* Tab list container */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-xl bg-slate-100/80 p-1.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onChange(tab.id)}
              className={[
                "group relative flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 whitespace-nowrap",
                isActive
                  ? "bg-white text-cyan-700 shadow-sm ring-1 ring-cyan-200"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-800",
              ].join(" ")}
            >
              {isActive && (
                <span className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/5 to-transparent" />
              )}
              <Icon
                className={[
                  "size-4 transition-colors",
                  isActive ? "text-cyan-600" : "text-slate-400 group-hover:text-slate-600",
                ].join(" ")}
              />
              <span className="relative">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Tabs;

import React, { useState } from "react";

const SidebarSection = ({ title, icon, children, color = "blue", collapsible = false, defaultExpanded = true, badge = null }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const colorClasses = {
    blue: {
      header: "from-blue-500 to-blue-600",
      border: "border-blue-200",
      bg: "bg-blue-50",
    },
    purple: {
      header: "from-purple-500 to-purple-600",
      border: "border-purple-200",
      bg: "bg-purple-50",
    },
    green: {
      header: "from-green-500 to-green-600",
      border: "border-green-200",
      bg: "bg-green-50",
    },
    orange: {
      header: "from-orange-500 to-orange-600",
      border: "border-orange-200",
      bg: "bg-orange-50",
    },
    gray: {
      header: "from-gray-500 to-gray-600",
      border: "border-gray-200",
      bg: "bg-gray-50",
    },
    red: {
      header: "from-red-500 to-red-600",
      border: "border-red-200",
      bg: "bg-red-50",
    },
  };

  const colors = colorClasses[color];

  return (
    <div className={`rounded-xl border ${colors.border} overflow-hidden shadow-sm`}>
      <div
        className={`
          flex items-center justify-between px-4 py-3 
          bg-gradient-to-r ${colors.header} text-white
          ${collapsible ? "cursor-pointer hover:opacity-95" : ""}
        `}
        onClick={collapsible ? () => setIsExpanded(!isExpanded) : undefined}
      >
        <div className="flex items-center gap-3">
          <span className="font-semibold">{title}</span>
          {badge !== null && <span className="px-2 py-0.5 bg-white/25 rounded-full text-xs font-bold">{badge}</span>}
        </div>

        {collapsible && (
          <svg className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>

      <div
        className={`
          transition-all duration-200 overflow-hidden
          ${!collapsible || isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className={`p-4 ${colors.bg}`}>{children}</div>
      </div>
    </div>
  );
};

export const Divider = ({ text }) => (
  <div className="flex items-center gap-3 my-3">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
    {text && <span className="text-xs text-gray-400 font-medium">{text}</span>}
    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
  </div>
);

export default SidebarSection;

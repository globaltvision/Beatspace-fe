import React from "react";

const StatCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  label,
  className = "",
}) => {
  return (
    <div
      className={`relative bg-[#2F2E24] border-0 border  border-[#B5B387]/30 p-2 min-h-[90px] overflow-hidden rounded-none ${className}`}
    >
      {/* Corner Accents */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-[#F6F4D3] z-20"></div>
      <div className="absolute top-0 right-0 w-2 h-2 bg-[#F6F4D3] z-20"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#F6F4D3] z-20"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#F6F4D3] z-20"></div>

      {/* Content */}
      <div className="relative pixel alexandria-font  z-10 h-full flex flex-col justify-between">
        <div className="flex justify-between items-start">
          <div className="p-2 border border-[#F6F4D3]/20">
            <Icon className="text-[#F6F4D3] text-xl" />
          </div>
          <span className="text-[#F6F4D3] text-[10px] uppercase font-bold tracking-widest opacity-60">
            {title}
          </span>
        </div>

        <div className="mt-4">
          <div className="text-[#F6F4D3] text-xs font-medium uppercase opacity-80 mb-1">
            {label}
          </div>
          <div className="text-3xl font-bold text-[#F6F4D3] mb-1 tracking-tight">
            {value}
          </div>

          {subtitle && (
            <div className="text-[#F6F4D3] text-[11px] opacity-60">
              {subtitle}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatCard;

import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  DashboardIcon,
  BeatmakerIcon,
  BeatIcon,
  MerchIcon,
  ComicsIcon,
  GamesIcon,
  DonationsIcon,
  AssessmentIcon,
  SettingsIcon,
} from "../../customIcons";

const adminMenu = [
  {
    id: 1,
    label: "Dashboard",
    link: "/admin/dashboard",
    type: "route",
    icon: DashboardIcon,
  },
  {
    id: 2,
    label: "Beatmaker",
    link: "/admin/beatmaker",
    type: "route",
    icon: BeatmakerIcon,
  },
  // {
  //   id: 3,
  //   label: "Beat",
  //   link: "/admin/beat",
  //   type: "route",
  //   icon: BeatIcon,
  // },
  {
    id: 4,
    label: "Merch Management",
    link: "/admin/merch-management",
    type: "route",
    icon: MerchIcon,
  },
  {
    id: 7,
    label: "Orders & Donations",
    link: "/admin/orders",
    type: "route",
    icon: DonationsIcon,
  },
  {
    id: 5,
    label: "Comics Management",
    // Fix route to match router path
    link: "/admin/comic-management",
    type: "route",
    icon: ComicsIcon,
  },
  {
    id: 6,
    label: "Games",
    link: "/admin/games",
    type: "route",
    icon: GamesIcon,
  },

  {
    id: 8,
    label: "Asset Management",
    link: "/admin/asset-management",
    type: "route",
    icon: AssessmentIcon,
  },
  {
    id: 9,
    label: "Settings",
    link: "/admin/settings",
    type: "route",
    icon: SettingsIcon,
  },
];

const Sidebar = ({ opened, toggle }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="h-screen overflow-hidden bg-[#CBC895] flex flex-col relative">
      {/* Logo Section */}
      <div className="p-6 border-b border-[#B8A882]">
        <div className="flex items-center justify-start">
          <img
            src="/assets/logo1.png"
            alt="Global Vision Logo"
            className="hidden md:inline h-20 w-auto object-contain"
          />
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-6 relative z-10 overflow-y-auto custom-scrollbar">
        <nav className="space-y-2">
          {adminMenu.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.link)}
                className={`w-full text-left px-4 py-3 transition-colors duration-200 alexandria-font flex items-center gap-3 ${
                  isActive(item.link)
                    ? "bg-[#191A22] text-[#C1BE91] font-semibold"
                    : "text-[#25262F] hover:bg-[#C4B594] hover:text-[#25262F]"
                }`}
              >
                <div className="flex-shrink-0">
                  <IconComponent
                    color={isActive(item.link) ? "#C1BE91" : "#25262F"}
                  />
                </div>
                <span className="md:inline hidden">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="absolute bottom-0 z-0 left-0 right-0 w-60 pointer-events-none opacity-50">
        <img
          src="/assets/beatssss.png"
          alt="Global Vision Logo"
          className="hidden md:inline object-contain"
        />
      </div>
    </div>
  );
};

export default Sidebar;

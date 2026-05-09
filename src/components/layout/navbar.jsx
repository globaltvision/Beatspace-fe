import React, { useState, useRef, useEffect } from "react";
import { FaSignOutAlt, FaUser, FaCog } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logoutAction } from "../../store/actions/authActions";
import NotificationPanel from "./NotificationPanel";
import { useNotifications } from "../../contexts/NotificationContext";


const Navbar = ({ opened, toggle }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { unreadCount } = useNotifications();
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);


  // Get current date
  const getCurrentDate = () => {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "2-digit",
    };
    return now.toLocaleDateString("en-US", options);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    };

    if (isDropdownOpen || isNotifOpen) {

      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleOpenDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    setIsNotifOpen(false);
  };

  const handleOpenNotif = () => {
    setIsNotifOpen(!isNotifOpen);
    setIsDropdownOpen(false);
  };


  const handleLogout = async () => {
    try {
      await dispatch(logoutAction());
      setIsDropdownOpen(false);
      navigate("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  const CornerAccents = () => (
    <>
      <div className="absolute top-0 left-0 w-2 h-2 bg-[#8B8966] z-20 opacity-50"></div>
      <div className="absolute top-0 right-0 w-2 h-2 bg-[#8B8966] z-20 opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 bg-[#8B8966] z-20 opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-2 h-2 bg-[#8B8966] z-20 opacity-50"></div>
    </>
  );

  return (
    <div className="bg-[#CBC895] border border-[#8B8966]/40 px-4 py-4 md:px-8 md:py-6 relative shadow-lg">
      <CornerAccents />
      <div className="flex flex-col w-full lg:flex-row justify-between md:gap-3 items-center relative z-10">
        {/* Left side - Title and subtitle */}
        <div className="flex flex-col items-center lg:items-start lg:translate-x-0 w-full lg:w-auto">
          <h1 className="font-bold text-[#191A22] pixel-font mb-1 !text-[14px] md:!text-[18px] tracking-widest uppercase">
            ADMIN DASHBOARD
          </h1>
          <p className="text-[#191A22]/70 pixel-font !text-[8px] md:!text-[10px] uppercase font-bold">
            SYSTEM CONTROL INTERFACE • {getCurrentDate()}
          </p>
        </div>

        {/* Right side - User controls */}
        <div
          className="flex items-center space-x-2 lg:space-x-4"
          ref={dropdownRef}
        >
          {/* Notification Icon */}
          <div className="relative flex items-center" ref={notifRef}>
            <button
              onClick={handleOpenNotif}
              className="transition-opacity hover:opacity-80 relative flex items-center justify-center"
            >
              <svg
                className="!h-7 md:!h-9"
                width="38"
                height="39"
                viewBox="0 0 38 39"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="0.75"
                  y="1.25"
                  width="36.5"
                  height="36.5"
                  fill="#191A22"
                  fill-opacity="0.12"
                />
                <rect
                  x="0.75"
                  y="1.25"
                  width="36.5"
                  height="36.5"
                  stroke="#191A22"
                  stroke-width="1.5"
                />
                <path
                  d="M22 27.5V29.5H21V30.5H17V29.5H16V27.5H22ZM29 24.5V25.5H28V26.5H10V25.5H9V24.5H10V23.5H11V21.5H12V15.5H13V13.5H14V12.5H15V11.5H17V10.5H18V8.5H20V10.5H21V11.5H23V12.5H24V13.5H25V15.5H26V21.5H27V23.5H28V24.5H29Z"
                  fill="#191A22"
                />
              </svg>
              {/* Notification Badge */}
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 bg-red-600 border-2 border-[#CBC895] rounded-full shadow-lg z-20">
                  <span className="text-[10px] alexandria-font font-bold text-white leading-none">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                </div>
              )}
            </button>
            <NotificationPanel
              isOpen={isNotifOpen}
              onClose={() => setIsNotifOpen(false)}
            />
          </div>

          <button className="transition-opacity hover:opacity-80 flex items-center justify-center">
            <svg
              className="!h-7 md:!h-9"
              width="38"
              height="39"
              viewBox="0 0 38 39"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="0.75"
                y="1.25"
                width="36.5"
                height="36.5"
                fill="#191A22"
                fill-opacity="0.12"
              />
              <rect
                x="0.75"
                y="1.25"
                width="36.5"
                height="36.5"
                stroke="#191A22"
                stroke-width="1.5"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M19.0001 8.98535C18.3421 8.98535 17.7701 9.40635 16.6271 10.2494L14.9061 11.5184C14.7261 11.6514 14.6361 11.7174 14.5391 11.7734C14.4421 11.8294 14.3391 11.8734 14.1341 11.9634L12.1751 12.8194C10.8731 13.3894 10.2221 13.6734 9.89308 14.2424C9.56408 14.8114 9.64308 15.5184 9.80208 16.9304L10.0401 19.0554C10.0651 19.2774 10.0771 19.3884 10.0771 19.5004C10.0771 19.6124 10.0651 19.7234 10.0401 19.9454L9.80208 22.0704C9.64408 23.4824 9.56508 24.1884 9.89308 24.7584C10.2231 25.3284 10.8731 25.6124 12.1751 26.1814L14.1351 27.0374C14.3391 27.1274 14.4421 27.1714 14.5391 27.2274C14.6351 27.2833 14.7261 27.3494 14.9061 27.4824L16.6261 28.7514C17.7711 29.5944 18.3431 30.0154 19.0001 30.0154C19.6571 30.0154 20.2301 29.5944 21.3731 28.7514L23.0941 27.4824C23.2741 27.3494 23.3641 27.2833 23.4611 27.2274C23.5581 27.1714 23.6611 27.1274 23.8661 27.0374L25.8251 26.1814C27.1271 25.6114 27.7781 25.3274 28.1071 24.7584C28.4361 24.1894 28.3571 23.4824 28.1971 22.0704L27.9601 19.9454C27.9351 19.7234 27.9221 19.6124 27.9221 19.5004C27.9221 19.3884 27.9351 19.2774 27.9601 19.0554L28.1981 16.9304C28.3561 15.5184 28.4351 14.8124 28.1071 14.2424C27.7771 13.6724 27.1271 13.3884 25.8251 12.8194L23.8651 11.9634C23.727 11.9076 23.5921 11.8442 23.4611 11.7734C23.3341 11.6953 23.2116 11.6101 23.0941 11.5184L21.3741 10.2494C20.2281 9.40635 19.6561 8.98535 19.0001 8.98535ZM19.0001 23.5004C20.0609 23.5004 21.0784 23.0789 21.8285 22.3288C22.5787 21.5786 23.0001 20.5612 23.0001 19.5004C23.0001 18.4395 22.5787 17.4221 21.8285 16.6719C21.0784 15.9218 20.0609 15.5004 19.0001 15.5004C17.9392 15.5004 16.9218 15.9218 16.1717 16.6719C15.4215 17.4221 15.0001 18.4395 15.0001 19.5004C15.0001 20.5612 15.4215 21.5786 16.1717 22.3288C16.9218 23.0789 17.9392 23.5004 19.0001 23.5004Z"
                fill="#191A22"
              />
            </svg>
          </button>
          <button
            onClick={handleOpenDropdown}
            className="transition-opacity hover:opacity-80 relative z-10 flex items-center justify-center"
          >
            <svg
              className="!h-7 md:!h-9"
              width="38"
              height="39"
              viewBox="0 0 38 39"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="0.75"
                y="1.25"
                width="36.5"
                height="36.5"
                fill="#191A22"
                fill-opacity="0.12"
              />
              <rect
                x="0.75"
                y="1.25"
                width="36.5"
                height="36.5"
                stroke="#191A22"
                stroke-width="1.5"
              />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M15 14.5C15 13.4391 15.4214 12.4217 16.1716 11.6716C16.9217 10.9214 17.9391 10.5 19 10.5C20.0609 10.5 21.0783 10.9214 21.8284 11.6716C22.5786 12.4217 23 13.4391 23 14.5C23 15.5609 22.5786 16.5783 21.8284 17.3284C21.0783 18.0786 20.0609 18.5 19 18.5C17.9391 18.5 16.9217 18.0786 16.1716 17.3284C15.4214 16.5783 15 15.5609 15 14.5ZM15 20.5C13.6739 20.5 12.4021 21.0268 11.4645 21.9645C10.5268 22.9021 10 24.1739 10 25.5C10 26.2956 10.3161 27.0587 10.8787 27.6213C11.4413 28.1839 12.2044 28.5 13 28.5H25C25.7956 28.5 26.5587 28.1839 27.1213 27.6213C27.6839 27.0587 28 26.2956 28 25.5C28 24.1739 27.4732 22.9021 26.5355 21.9645C25.5979 21.0268 24.3261 20.5 23 20.5H15Z"
                fill="#191A22"
              />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full right-0 mt-2 w-56 bg-[#131319] border border-[#CBC895]/30 rounded-sm shadow-2xl overflow-hidden z-50 transition-all duration-200 ease-out">
              <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-[#CBC895]"></div>
              <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#CBC895]"></div>
              <div className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-[#CBC895]"></div>
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#CBC895]"></div>

              {/* Dropdown Items */}
              <div className="py-2">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left flex items-center space-x-3 text-[#F6F4D3] hover:bg-[#CBC895]/10 transition-all duration-200 group alexandria-font"
                >
                  <FaSignOutAlt className="text-base text-[#CBC895] group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-bold text-xs uppercase tracking-widest">
                    Logout
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;

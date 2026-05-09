import React from "react";
import { FaBell, FaShoppingCart, FaHeart, FaCloudDownloadAlt, FaInfoCircle, FaCheck } from "react-icons/fa";
import { MdDoneAll } from "react-icons/md";
import { useNotifications } from "../../contexts/NotificationContext";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

const NotificationPanel = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  if (!isOpen) return null;

  const displayNotifications = notifications.filter(n => !n.isRead);

  const getIcon = (type) => {
    switch (type) {
      case "order":
        return <FaShoppingCart className="text-green-500" />;
      case "donation":
        return <FaHeart className="text-pink-500" />;
      case "download":
        return <FaCloudDownloadAlt className="text-blue-500" />;
      default:
        return <FaInfoCircle className="text-[#CBC895]" />;
    }
  };

  return (
    <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-[#131319] border border-[#CBC895]/30 rounded-sm shadow-2xl overflow-hidden z-50 animate-fadeIn">
      {/* Aesthetic Accents */}
      <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-[#CBC895]"></div>
      <div className="absolute top-0 right-0 w-1.5 h-1.5 bg-[#CBC895]"></div>
      <div className="absolute bottom-0 left-0 w-1.5 h-1.5 bg-[#CBC895]"></div>
      <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-[#CBC895]"></div>

      {/* Header */}
      <div className="px-4 py-3 border-b border-[#CBC895]/20 flex justify-between items-center bg-[#CBC895]/5">
        <div className="flex items-center gap-2">
          <FaBell className="text-[#CBC895] text-sm" />
          <h3 className="alexandria-font font-bold !text-[10px] text-[#CBC895] uppercase tracking-wider">
            Notifications ({unreadCount})
          </h3>
        </div>
        <button 
          onClick={markAllAsRead}
          className="p-1.5 hover:bg-[#CBC895]/10 rounded-full transition-all group relative"
          title="Mark all as read"
        >
          <MdDoneAll className="text-[#CBC895] text-lg group-hover:text-[#F6F4D3]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#CBC895] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#CBC895]"></span>
            </span>
          )}
        </button>
      </div>

      {/* Notification List */}
      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {displayNotifications.length > 0 ? (
          displayNotifications.map((notif) => (
            <div
              key={notif._id}
              className="px-4 py-4 border-b border-[#CBC895]/10 hover:bg-[#CBC895]/5 transition-all duration-200 cursor-pointer relative group bg-[#CBC895]/3"
            >
              <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-[#CBC895] transition-all group-hover:w-1"></div>
              
              <div className="flex gap-4 items-start">
                <div className="mt-1 flex-shrink-0 bg-[#CBC895]/5 p-2 rounded-sm border border-[#CBC895]/10">
                  {getIcon(notif.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <h4 className="alexandria-font font-bold text-[11px] text-[#F6F4D3] leading-tight truncate">
                      {notif.title}
                    </h4>
                    <span className="alexandria-font text-[9px] text-[#CBC895]/30 whitespace-nowrap mt-0.5">
                      {dayjs(notif.createdAt).fromNow()}
                    </span>
                  </div>
                  <p className="alexandria-font text-[10px] text-[#CBC895]/60 leading-relaxed line-clamp-2">
                    {notif.message}
                  </p>
                </div>
                
                <div className="flex-shrink-0 flex items-center h-full self-center">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      markAsRead(notif._id);
                    }}
                    className="w-5 h-5 flex items-center justify-center rounded-full bg-[#CBC895]/10 border border-[#CBC895]/20 hover:bg-[#CBC895] hover:border-[#CBC895] transition-all duration-300 group/btn relative overflow-hidden"
                    title="Mark as read"
                  >
                    {/* Unread Dot (shown by default) */}
                    <div className="w-1.5 h-1.5 bg-[#CBC895] rounded-full group-hover/btn:opacity-0 transition-opacity"></div>
                    {/* Check Icon (shown on hover) */}
                    <FaCheck className="absolute text-[#131319] text-[8px] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-10 text-center">
            <FaBell className="text-[#CBC895]/20 text-4xl mx-auto mb-3" />
            <p className="alexandria-font !text-[8px] text-[#CBC895]/40 uppercase">
              No new notifications
            </p>
          </div>
        )}
      </div>

    </div>
  );
};

export default NotificationPanel;

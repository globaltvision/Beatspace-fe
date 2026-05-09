import React, { createContext, useContext, useState, useEffect } from "react";
import { io } from "socket.io-client";
import custAxios, { baseURL } from "../configs/axios.config";

const NotificationContext = createContext();

// baseURL is something like "http://localhost:8000/api"
// Socket needs the base URL "http://localhost:8000"
const SOCKET_URL = baseURL.replace(/\/api$/, "");

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      console.log("Fetching initial notifications from:", `${baseURL}/notfs`);
      const response = await custAxios.get("/notfs", { withCredentials: true });
      const fetchedNotifications = response.data.data || [];
      setNotifications(fetchedNotifications);
      setUnreadCount(fetchedNotifications.filter(n => !n.isRead).length);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    console.log("Connecting to Socket.io at:", SOCKET_URL);
    const socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'] // Ensure compatibility
    });

    socket.on("connect", () => {
        console.log("Connected to Socket.io server with ID:", socket.id);
    });

    socket.on("connect_error", (error) => {
        console.error("Socket.io connection error:", error);
    });

    socket.on("new-notification", (notification) => {
      console.log("Received new notification via socket:", notification);
      setNotifications((prev) => [notification, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });

    return () => {
        console.log("Disconnecting from Socket.io");
        socket.disconnect();
    };
  }, []);

  const markAsRead = async (id) => {
    try {
      await custAxios.patch(`/notfs/${id}`, {}, { withCredentials: true });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await custAxios.patch("/notfs/mark-all-read", {}, { withCredentials: true });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);

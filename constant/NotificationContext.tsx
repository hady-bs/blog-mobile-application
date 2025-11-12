import * as Notifications from "expo-notifications";
import React, { createContext, useContext, useEffect } from "react";

interface NotificationContextType {
  scheduleNotification: (title: string, body: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  scheduleNotification: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  useEffect(() => {
    // Request permissions
    const requestPermissions = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        console.log("Notification permissions not granted");
      }
    };

    requestPermissions();

    // Set notification handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }, []);

  const scheduleNotification = async (title: string, body: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
      },
      trigger: null, // Show immediately
    });
  };

  return (
    <NotificationContext.Provider value={{ scheduleNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

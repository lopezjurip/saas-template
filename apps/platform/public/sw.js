/**
 * Service Worker for handling push notifications.
 */
self.addEventListener("push", (event) => {
  const data = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(data["title"] ?? "Notification", {
      body: data["body"],
      icon: data["icon"] ?? "/icon",
      data: { url: data["url"] ?? "/" },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data["url"]));
});

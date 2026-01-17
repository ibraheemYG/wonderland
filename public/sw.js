// Service Worker للإشعارات
const CACHE_NAME = 'wonderland-admin-v1';

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

// تفعيل Service Worker
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// استقبال الإشعارات
self.addEventListener('push', (event) => {
  console.log('Push notification received', event);
  
  let data = {
    title: 'Wonderland Admin',
    body: 'لديك إشعار جديد',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    tag: 'notification',
    data: {}
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/icon-192.png',
    tag: data.tag || 'notification',
    vibrate: [200, 100, 200],
    requireInteraction: true,
    actions: [
      { action: 'open', title: 'فتح' },
      { action: 'close', title: 'إغلاق' }
    ],
    data: data.data || {}
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// النقر على الإشعار
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked', event);
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // فتح التطبيق أو التركيز عليه
  const urlToOpen = event.notification.data?.url || '/admin-app';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // إذا كان التطبيق مفتوح، ركز عليه
      for (const client of clientList) {
        if (client.url.includes('/admin') && 'focus' in client) {
          return client.focus();
        }
      }
      // وإلا افتح نافذة جديدة
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// إغلاق الإشعار
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed', event);
});

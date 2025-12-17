self.addEventListener('push', function (event) {
    if (!event.data) return;

    const data = event.data.json();
    const title = data.title || '新着情報';
    const options = {
        body: data.body || '新しい商品が追加されました！',
        icon: '/icon.png', // Ensure this icon exists or use logo
        badge: '/icon.png',
        data: {
            url: data.url || '/'
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (clientList) {
            const url = event.notification.data.url;

            // Allow opening the URL in an existing tab if possible, otherwise new tab
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === url && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});

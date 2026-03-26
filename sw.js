const CACHE_NAME = 'offline-cache';
const OFFLINE_URL = '/off/index.html';

self.addEventListener('push', event =>
{
    const data = event.data ? event.data.json() : {};

    const title = data.title;
    const options =
    {
        body: data.body,
        icon: "/assets/kro/favicon-96x96.png",
        badge: "/assets/kro/badge.png",
        image: data.image || '',
        timestamp: Date.now(),
        data:
        {
            url: data.url || "index.html"
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', event =>
{
    event.notification.close();

    const url = event.notification.data.url || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList =>
        {
            for (const client of clientList)
            {
                if (client.url === url && 'focus' in client)
                    return client.focus();
            }
            if (clients.openWindow)
                return clients.openWindow(url);
        })
    );
});

self.addEventListener('notificationclose', event =>
{
    console.log('Notification fermée :', event.notification);
});

self.addEventListener('install', (event) =>
{
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll([OFFLINE_URL]))
            .catch(err => console.error('Erreur lors du cache offline', err))
    );    
    self.skipWaiting();
});

self.addEventListener('activate', (event) =>
{
    event.waitUntil(
    (async () =>
    {
        let uuid = null;
        let balance = null;

        try
        {
            const allClients = await clients.matchAll({ includeUncontrolled: true });
            if (allClients.length > 0)
            {
                allClients.forEach(client => client.postMessage({ type: 'GET_UUID' }));
                allClients.forEach(client => client.postMessage({ type: 'GET_BALANCE' }));
            }
        }
        catch (e)
        {
            console.error('Erreur récupération uuid', e);
        }

        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(name => 
            {
                if (name != CACHE_NAME) caches.delete(name);
            }));

        if (uuid)
            allClients.forEach(client => client.postMessage({ type: 'SET_UUID', uuid }));
        if (balance)
            allClients.forEach(client => client.postMessage({ type: 'SET_BALANCE', balance }));

        self.clients.claim();
    })());
});

self.addEventListener('fetch', event =>
{
    if (event.request.url.includes('.php'))
        return;
    
    event.respondWith(
        (
        async () =>
        {
            try
            {
                return await fetch(event.request);
            }
            catch (error)
            {
                if (event.request.mode === 'navigate' || event.request.destination === 'document')
                {
                    const cachedResponse = await caches.match(OFFLINE_URL);
                    if (cachedResponse) return cachedResponse;
                }

                return new Response('', { status: 503, statusText: 'Service Unavailable' });
            }
        })()
    );
});
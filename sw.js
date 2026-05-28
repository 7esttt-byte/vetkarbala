/* ═══════════════════════════════════════════════
   SAIS Service Worker v3 — relative paths + network-first
   Works in any subfolder (github.io/finger/, vercel, root)
═══════════════════════════════════════════════ */
const CACHE = 'sais-v3-' + '20260524';

/* Relative paths — resolved against the SW scope, so they work
   whether the app lives at /, /finger/, /epi/ or anywhere else */
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

/* INSTALL — cache shell, activate immediately */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

/* ACTIVATE — delete ALL old caches, take control now */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* FETCH — network-first for HTML (always fresh), cache-first for assets */
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = req.url;

  /* Never touch API or font requests */
  if (url.includes('n8n.cloud') || url.includes('fonts.googleapis.com') || url.includes('fonts.gstatic.com')) return;

  /* HTML / navigation → network-first (so updates always show) */
  const isHTML = req.mode === 'navigate' || req.destination === 'document' || url.endsWith('.html') || url.endsWith('/');
  if (isHTML) {
    e.respondWith(
      fetch(req)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  /* Other assets → cache-first, then network */
  e.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(req, clone));
      }
      return res;
    }).catch(() => cached))
  );
});

/* Allow page to trigger immediate update */
self.addEventListener('message', e => {
  if (e.data === 'skipWaiting') self.skipWaiting();
});

/* ─── NOTIFICATION CLICK HANDLER ─── */
self.addEventListener('notificationclick', e => {
  const notification = e.notification;
  notification.close();
  
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
      // Find a window client that is already open and focus it
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes('index.html') && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow('./index.html');
      }
    })
  );
});

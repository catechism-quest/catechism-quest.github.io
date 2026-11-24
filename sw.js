// Offline support for the installed app. Bump VERSION whenever any app file changes.
const VERSION = 'cq-v25';
const SHELL = ['./', 'index.html', 'catechisms.js', 'manifest.webmanifest', 'css/style.css',
  'js/sprites.js', 'js/songs.js', 'js/helpers.js', 'js/scenes.js', 'js/state.js', 'js/sound.js', 'js/rewards.js', 'js/progress.js', 'js/views.js', 'js/games.js', 'js/journey.js', 'js/wb/art.js', 'js/wb/catalog.js', 'js/wb/world.js', 'js/wb/sim.js', 'js/wb/engine.js', 'js/wb/ui.js', 'js/actions.js',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // Google Fonts: serve the saved copy, refresh it in the background.
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.open(VERSION + '-fonts').then(async c => {
      const hit = await c.match(req);
      const net = fetch(req).then(r => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  if (url.origin !== location.origin) return;
  // App files: fresh copy when online (so updates show up right away), saved copy when offline.
  // no-cache: always check with the server, so a deploy never mixes old and new files.
  e.respondWith(fetch(req, { cache: 'no-cache' }).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(VERSION).then(c => c.put(req, copy)); }
    return r;
  }).catch(() => caches.match(req, { ignoreSearch: true })
    .then(hit => hit || (req.mode === 'navigate' ? caches.match('index.html') : undefined))));
});

/* ============================================================
   sw.js · Offline-Betrieb

   Das Schul-WLAN fällt aus, der Unterricht nicht.
   76 Einheiten, 9 Warm-up-Pools und die Programmdateien liegen vollständig im Cache.

   WICHTIG: Nach jeder inhaltlichen Änderung VERSION hochzählen.
   Sonst sehen die Geräte weiter die alte Fassung.
   ============================================================ */

const VERSION = 'chemie710-v6-themenwissen-videos';

/* ---------- Was NICHT ins Offlinepaket gehört ----------
   Bis v2 lud jedes Schülergerät bei der Installation auch das
   Lehrerdashboard mit: dashboard/index.html, dashboard.js, dashboard.css
   und seit v3 zusätzlich beamer.*. Zusammen rund 19 KB gzip, die kein
   Kind je öffnet.

   Offline nützt das Dashboard ohnehin nichts — es ist eine Live-Ansicht
   auf Supabase und braucht in jedem Fall Netz. Für die Lehrkraft ändert
   sich dadurch nichts Wesentliches: Der Fetch-Handler unten legt jede
   abgerufene Datei weiterhin im Cache ab, das Dashboard steht nach dem
   ersten Öffnen also genauso zur Verfügung wie vorher.

   Ebenso fehlt hier dev-tools.js: Das Entwicklermenü wird von
   dev-boot.js nur bei devMode nachgeladen und hat auf einem
   Schülergerät nichts verloren.

   Maßgeblich ist die Frage, für die diese Liste da ist: Was muss auf dem
   Gerät liegen, damit der Unterricht ohne Netz weiterläuft? */

const SCHALE = [
  './',
  'index.html',
  'einheit.html',
  'warmup.html',
  'pruefung.html',
  'arbeitsblatt.html',
  'matrix.html',
  'animationen.html',
  'uebungen.html',
  'version.json',
  'pruefung-sets.json',
  'schema/fehlvorstellungen-kategorien.json',
  'assets/js/dev-boot.js',
  'units/index.json',
  'spiral/plan.json',
  'assets/css/app.css',
  'assets/css/anim.css',
  'assets/css/buch.css',
  'assets/css/rechner.css',
  'assets/js/store.js',
  'assets/js/weiterlernen.js',
  'assets/js/supabase-config.js',
  'assets/js/student-login.js',
  'assets/js/zeichnen.js',
  'assets/js/animationen.js',
  'assets/js/animationen-7.js',
  'assets/js/animationen-8.js',
  'assets/js/animationen-9.js',
  'assets/js/animationen-seite.js',
  'assets/js/uebungen-seite.js',
  'assets/js/tracker.js',
  'assets/js/lernmodus.js',
  'assets/js/uebungsrahmen.js',
  'assets/js/engine.js',
  'assets/js/taschenrechner.js',
  'assets/js/buch.js',
  'assets/js/ausdruck.js',
  'assets/js/spiral.js',
  'assets/js/pruefung.js',
  'assets/js/arbeitsblatt.js',
  'assets/js/matrix.js'
];

const EINHEITEN = [
  'units/fc/fc-01/tasks.json',
  'units/fc/fc-02/tasks.json',
  'units/fc/fc-03/tasks.json',
  'units/fc/fc-04/tasks.json',
  'units/fc/fc-05/tasks.json',
  'units/fc/fc-06/tasks.json',
  'units/fc/fc-07/tasks.json',
  'units/fc/fc-08/tasks.json',
  'units/ps/ps-01/tasks.json',
  'units/ps/ps-02/tasks.json',
  'units/ps/ps-03/tasks.json',
  'units/ps/ps-04/tasks.json',
  'units/ps/ps-05/tasks.json',
  'units/ps/ps-06/tasks.json',
  'units/ps/ps-07/tasks.json',
  'units/ps/ps-08/tasks.json',
  'units/ga/ga-01/tasks.json',
  'units/ga/ga-02/tasks.json',
  'units/ga/ga-03/tasks.json',
  'units/ga/ga-04/tasks.json',
  'units/ga/ga-05/tasks.json',
  'units/wa/wa-01/tasks.json',
  'units/wa/wa-02/tasks.json',
  'units/wa/wa-03/tasks.json',
  'units/wa/wa-04/tasks.json',
  'units/wa/wa-05/tasks.json',
  'units/wa/wa-06/tasks.json',
  'units/sz/sz-01/tasks.json',
  'units/sz/sz-02/tasks.json',
  'units/sz/sz-03/tasks.json',
  'units/sz/sz-04/tasks.json',
  'units/sz/sz-05/tasks.json',
  'units/me/me-01/tasks.json',
  'units/me/me-02/tasks.json',
  'units/me/me-03/tasks.json',
  'units/me/me-04/tasks.json',
  'units/me/me-05/tasks.json',
  'units/me/me-06/tasks.json',
  'units/me/me-07/tasks.json',
  'units/qb/qb-01/tasks.json',
  'units/qb/qb-02/tasks.json',
  'units/qb/qb-03/tasks.json',
  'units/qb/qb-04/tasks.json',
  'units/qb/qb-05/tasks.json',
  'units/sl/sl-01/tasks.json',
  'units/sl/sl-02/tasks.json',
  'units/sl/sl-03/tasks.json',
  'units/sl/sl-04/tasks.json',
  'units/sl/sl-05/tasks.json',
  'units/sl/sl-06/tasks.json',
  'units/sl/sl-07/tasks.json',
  'units/kw/kw-01/tasks.json',
  'units/kw/kw-02/tasks.json',
  'units/kw/kw-03/tasks.json',
  'units/kw/kw-04/tasks.json',
  'units/kw/kw-05/tasks.json',
  'units/kw/kw-06/tasks.json',
  'units/kw/kw-07/tasks.json',
  'units/al/al-01/tasks.json',
  'units/al/al-02/tasks.json',
  'units/al/al-03/tasks.json',
  'units/al/al-04/tasks.json',
  'units/al/al-05/tasks.json',
  'units/al/al-06/tasks.json',
  'units/al/al-07/tasks.json',
  'units/os/os-01/tasks.json',
  'units/os/os-02/tasks.json',
  'units/os/os-03/tasks.json',
  'units/os/os-04/tasks.json',
  'units/os/os-05/tasks.json',
  'units/es/es-01/tasks.json',
  'units/es/es-02/tasks.json',
  'units/es/es-03/tasks.json',
  'units/es/es-04/tasks.json',
  'units/es/es-05/tasks.json',
  'units/es/es-06/tasks.json'
];

const SPIRAL = [
  'spiral/k-sich.json',
  'spiral/k-stof.json',
  'spiral/k-reak.json',
  'spiral/k-atom.json',
  'spiral/k-bind.json',
  'spiral/k-redox.json',
  'spiral/k-quant.json',
  'spiral/k-sl.json',
  'spiral/k-org.json'
];

const ALLES = [...SCHALE, ...EINHEITEN, ...SPIRAL];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const c = await caches.open(VERSION);
    try {
      await Promise.all(ALLES.map(u => c.add(new Request(u, { cache: 'reload' }))));
    } catch (error) {
      await caches.delete(VERSION);
      throw error;
    }
    /* Bewusst KEIN skipWaiting: Eine neue Fassung, die mitten in einer
       Aufgabe übernimmt, kann alte und neue Dateien mischen. Die Seite
       fragt stattdessen nach (siehe aktualisierungBeobachten in store.js)
       und schickt dann die Nachricht „uebernehmen". */
  })());
});

self.addEventListener('message', e => {
  if (e.data && e.data.typ === 'uebernehmen') self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const namen = await caches.keys();
    await Promise.all(namen.filter(n => n.startsWith('chemie710-') && n !== VERSION).map(n => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  /* Fremde Hosts (Fonts, Supabase) nie aus dem Cache bedienen. */
  if (url.origin !== location.origin) return;

  e.respondWith((async () => {
    const cache = await caches.open(VERSION);
    /* Queryparameter wie ?u=pz-05 gehören zur Navigation, nicht zu einer
       eigenen Datei. Offline muss deshalb einheit.html aus dem vorab
       gefüllten Cache gefunden werden, auch wenn die konkrete URL noch nie
       online geöffnet wurde. */
    const cacheKey = new Request(url.origin + url.pathname, { method: 'GET' });

    /* Programmcode und Inhalte: online immer die aktuelle Fassung laden,
       offline auf den vollständigen Cache zurückfallen. Das verhindert nach
       größeren Updates gemischte Versionen von engine.js und zeichnen.js. */
    const istAktualitaetskritisch =
      url.pathname.endsWith('.json') ||
      url.pathname.endsWith('.html') ||
      url.pathname.endsWith('.js') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('/');

    if (istAktualitaetskritisch) {
      try {
        const netz = await fetch(e.request, { cache: 'no-store' });
        if (netz.ok) cache.put(cacheKey, netz.clone());
        return netz;
      } catch {
        const c = await cache.match(cacheKey, { ignoreSearch: true });
        if (c) return c;
        return new Response('Offline und nicht im Cache', { status: 503 });
      }
    }

    /* Sonstige lokale Ressourcen: Cache zuerst, Netz als Rückfall. */
    const c = await cache.match(cacheKey, { ignoreSearch: true });
    if (c) return c;

    try {
      const netz = await fetch(e.request);
      if (netz.ok) cache.put(cacheKey, netz.clone());
      return netz;
    } catch {
      return new Response('Offline', { status: 503 });
    }
  })());
});

/* ============================================================
   animationen.js · Bewegte Visualisierungen zur Chemie 7–10
   — niveaudifferenziert (A Basis · B Standard · C Vertiefung)

   Chemie hat zwei Ebenen: was man sieht (der Stoff im Reagenzglas) und
   was man denkt (die Teilchen). Genau zwischen diesen beiden Ebenen
   scheitert das Verstehen. Ein Standbild zeigt immer nur eine davon —
   deshalb sind die Animationen hier fast alle Ebenenwechsel: oben der
   Vorgang, unten dieselbe Sache in Teilchen.

   Eigenständig und datengetrieben: geladen NACH zeichnen.js, meldet sich
   als window.ANIM an. zeichnen.js ruft ANIM.block(v) für den Bildtyp
   "animation" auf. Fehlt diese Datei, zeigt zeichnen.js einen Platzhalter.

   Einbinden in Lernkarte oder Aufgabe — mit passender Niveaustufe:
     "visual": { "type": "animation", "name": "aggregat", "stufe": "A" }
   Ohne "stufe" wird B (Standard) angenommen.

   Aufgeteilt: Hier steht nur der Rahmen (Schleife, Steuerung, Registry,
   Werkzeugkasten). Die Animationen selbst liegen nach Jahrgängen getrennt
   in animationen-7.js, -8.js und -9.js und werden beim ersten Zugriff
   nachgeladen. Die Tabelle MODUL weiter unten sagt, welche wo steht;
   pruefen.js hält sie gegen die tatsächlichen Registrierungen.

   Jede Animation ist reines Inline-SVG + Vanilla-JS: lädt sofort, offline
   nutzbar, druckt das Standbild, stylt sich selbst. „Bewegung reduzieren“
   (Systemeinstellung) wird respektiert: kein Autostart, nur ein Standbild.
   ============================================================ */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- Palette ----------
     Zwei Sätze mit denselben Rollen. Läuft das Gerät im dunklen Modus,
     blieben die SVG-Flächen sonst weiß in dunkler Umgebung. FARBE ist
     bewusst dasselbe Objekt (die Animationen lesen es beim Bauen aus) —
     beim Umschalten werden die Werte ersetzt und die Bilder neu gebaut. */
  const HELL = {
    ink: '#15233A', weich: '#4A5A70', faint: '#687789', gitter: '#DDE3E8',
    a: '#1F6849', b: '#205B9C', c: '#6B3FA0', korr: '#A8231C', ok: '#1F6849',
    paper: '#F3F5F4', weiss: '#FFFFFF', gelb: '#C98A12', neutral: '#C8D2D8'
  };
  const DUNKEL = {
    ink: '#E7EDF3', weich: '#B0BDC9', faint: '#8595A3', gitter: '#2E3A47',
    a: '#5CBE92', b: '#6FA8E8', c: '#B08CE0', korr: '#F08A82', ok: '#5CBE92',
    paper: '#212B36', weiss: '#1A222C', gelb: '#E3B14C', neutral: '#46545F'
  };
  const FARBE = {};
  const STUFE_NAME = { A: 'Basis', B: 'Standard', C: 'Vertiefung' };
  const STUFE_FARBE = {};
  const mqDunkel = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  function paletteSetzen(dunkel) {
    Object.assign(FARBE, dunkel ? DUNKEL : HELL);
    STUFE_FARBE.A = FARBE.a; STUFE_FARBE.B = FARBE.b; STUFE_FARBE.C = FARBE.c;
  }
  paletteSetzen(!!(mqDunkel && mqDunkel.matches));

  /* ---------- Eigene Bewegungseinstellung ----------
     Die Systemeinstellung „Bewegung reduzieren" kennen viele nicht und
     finden sie auf einem Schulgerät auch nicht. Deshalb gibt es zusätzlich
     einen sichtbaren Schalter in der Formelkarte. Er kann Bewegung nur
     abschalten, nie erzwingen: Wer sie im System abgestellt hat, bekommt
     sie hier nicht zurück. */
  const AUTOSTART_SCHLUESSEL = 'chemie710.autostart';
  function autostartErlaubt() {
    try {
      if (typeof Speicher !== 'undefined') return Speicher.lies(AUTOSTART_SCHLUESSEL, true) !== false;
      return localStorage.getItem(AUTOSTART_SCHLUESSEL) !== 'false';
    } catch { return true; }
  }

  const REDUCED = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Helfer ---------- */
  function fmt(x) { const g = Math.round(x * 100) / 100; return String(g).replace('.', ','); }
  function el(name, attrs, text) {
    const e = document.createElementNS(NS, name);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (text != null) e.textContent = text;
    return e;
  }
  function h(name, cls, text) {
    const e = document.createElement(name);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function osz(t, p) { const u = (t % p) / p; return u < 0.5 ? u * 2 : 2 - u * 2; }
  function stufeVon(o) { return (o && o.stufe ? String(o.stufe) : 'B').toUpperCase().charAt(0); }

  /* Diese Bilder erzählen langsame Vorgänge — 25 Bilder je Sekunde reichen
     dafür vollkommen. Bei 60 Hz würde ein Schulgerät dieselbe Zeichnung
     mehr als doppelt so oft erneuern, ohne dass jemand es sieht. */
  const BILDABSTAND = 1 / 25;

  function Loop(step) {
    let raf = null, last = 0, elapsed = 0, gezeigt = -1, running = false;
    function frame(ts) {
      if (!running) return;
      if (!last) last = ts;
      elapsed += (ts - last) / 1000; last = ts;
      if (gezeigt < 0 || elapsed - gezeigt >= BILDABSTAND) { gezeigt = elapsed; step(elapsed); }
      raf = requestAnimationFrame(frame);
    }
    return {
      play() { if (running) return; running = true; last = 0; raf = requestAnimationFrame(frame); },
      pause() { running = false; if (raf) cancelAnimationFrame(raf); },
      reset() { this.pause(); elapsed = 0; gezeigt = -1; step(0); },
      toggle() { running ? this.pause() : this.play(); },
      get running() { return running; }
    };
  }

  /* ---------- Bedienleiste + Regler + Stufenabzeichen ---------- */
  function steuerleiste(loop, opt) {
    opt = opt || {};
    const bar = h('div', 'anim-steuer');
    const play = h('button', 'anim-btn anim-play');
    play.type = 'button';
    play.dataset.rolle = 'play';
    const setL = () => { const on = loop.running; play.textContent = on ? '⏸ Pause' : '▶ Abspielen'; play.setAttribute('aria-pressed', on ? 'true' : 'false'); };
    play.addEventListener('click', () => { loop.toggle(); setL(); });
    bar.appendChild(play);
    if (opt.reset !== false) { const rb = h('button', 'anim-btn anim-reset', '↺ Zurück'); rb.type = 'button'; rb.addEventListener('click', () => { loop.reset(); setL(); }); bar.appendChild(rb); }
    bar._sync = setL; setL(); return bar;
  }
  function regler(opt) {
    const wrap = h('label', 'anim-regler');
    wrap.appendChild(h('span', 'anim-regler-txt', opt.label));
    const inp = document.createElement('input');
    inp.type = 'range'; inp.min = opt.min; inp.max = opt.max; inp.step = opt.step ?? 1; inp.value = opt.wert;
    inp.addEventListener('input', () => opt.onInput(parseFloat(inp.value)));
    wrap.appendChild(inp); wrap._input = inp; return wrap;
  }
  function abzeichen(host, st) {
    const b = h('div', 'anim-stufe anim-stufe-' + st.toLowerCase());
    b.style.color = STUFE_FARBE[st] || FARBE.ink;
    b.textContent = 'Stufe ' + st + ' · ' + (STUFE_NAME[st] || '');
    host.appendChild(b);
  }

  /* ---------- Vorhersagefragen ----------
     Wer einer Animation nur zusieht, prüft nichts. Eine kurze Frage vor
     dem Start macht aus dem Zuschauen ein Nachschauen: erst tippen, dann
     läuft das Bild. Zentral hinterlegt statt in 40 Definitionen verstreut;
     eine Animation ohne Eintrag startet wie bisher sofort. */
  const FRAGEN = {
    aggregat: { text: 'Eis schmilzt zu Wasser. Was passiert mit den Teilchen selbst?',
      optionen: ['Sie bleiben gleich, nur ihre Anordnung ändert sich', 'Sie werden größer', 'Sie werden weniger'], antwort: 0 },
    feuerdreieck: { text: 'Du deckst eine brennende Kerze mit einem Glas ab. Warum geht sie aus?',
      optionen: ['Der Sauerstoff fehlt', 'Der Brennstoff ist alle', 'Es wird zu kalt'], antwort: 0 },
    massenerhaltung: { text: 'Eisenwolle verbrennt. Was zeigt die Waage danach?',
      optionen: ['Mehr Masse — Sauerstoff kommt dazu', 'Weniger Masse', 'Genau dasselbe'], antwort: 0 },
    brennerflamme: { text: 'Du öffnest die Luftzufuhr am Brenner. Was passiert mit der Flamme?',
      optionen: ['Sie wird heißer und blau', 'Sie wird kälter und gelb', 'Sie geht aus'], antwort: 0 },
    atombau: { text: 'Die Ordnungszahl steigt um 1. Was kommt dazu?',
      optionen: ['Ein Proton und ein Elektron', 'Nur ein Neutron', 'Eine ganze Schale'], antwort: 0 },
    streuversuch: { text: 'Fast alle Teilchen fliegen glatt durch die Goldfolie. Was heißt das?',
      optionen: ['Das Atom ist fast leer', 'Gold ist sehr dünn', 'Die Teilchen sind zu schnell'], antwort: 0 },
    oktettregel: { text: 'Zwei Wasserstoffatome nähern sich. Was tun sie mit ihren Elektronen?',
      optionen: ['Sie teilen sich ein Paar', 'Eines gibt ab, eines nimmt auf', 'Nichts'], antwort: 0 },
    nachweise: { text: 'Ein glimmender Holzspan flammt im Gas auf. Welches Gas ist es?',
      optionen: ['Sauerstoff', 'Wasserstoff', 'Kohlenstoffdioxid'], antwort: 0 },
    elektrolyse: { text: 'Wasser wird zerlegt. In welchem Verhältnis entstehen die Gase?',
      optionen: ['2 Teile Wasserstoff zu 1 Teil Sauerstoff', '1 zu 1', '1 zu 2'], antwort: 0 },
    ausgleichen: { text: 'Beim Ausgleichen einer Gleichung — was darfst du ändern?',
      optionen: ['Nur die Zahlen vor den Formeln', 'Auch die kleinen Indexzahlen', 'Alles'], antwort: 0 },
    dipol: { text: 'Ein geladener Stab nähert sich einem dünnen Wasserstrahl. Was passiert?',
      optionen: ['Der Strahl wird abgelenkt', 'Nichts', 'Der Strahl reißt ab'], antwort: 0 },
    loesen: { text: 'Kochsalz löst sich in Wasser. Was passiert mit den Ionen?',
      optionen: ['Sie werden von Wassermolekülen umhüllt', 'Sie verschwinden', 'Sie werden zu Atomen'], antwort: 0 },
    ionenbildung: { text: 'Natrium reagiert mit Chlor. Was tut das Natriumatom?',
      optionen: ['Es gibt ein Elektron ab', 'Es nimmt ein Elektron auf', 'Es teilt ein Elektronenpaar'], antwort: 0 },
    ionengitter: { text: 'Festes Kochsalz leitet keinen Strom, gelöstes schon. Warum?',
      optionen: ['Im Gitter sind die Ionen nicht beweglich', 'Im Gitter fehlen die Ionen', 'Wasser leitet allein'], antwort: 0 },
    elektronengas: { text: 'Warum lässt sich ein Metall verbiegen und zerbricht nicht?',
      optionen: ['Die Schichten verschieben sich, die Bindung bleibt', 'Metall ist weich', 'Es hat keine Bindung'], antwort: 0 },
    redox: { text: 'Ein Eisennagel liegt in Kupfersulfat-Lösung. Was gibt Elektronen ab?',
      optionen: ['Das Eisen', 'Das Kupfer', 'Das Wasser'], antwort: 0 },
    mol: { text: '1 mol Eisen und 1 mol Schwefel — was ist gleich?',
      optionen: ['Die Teilchenzahl', 'Die Masse', 'Das Volumen'], antwort: 0 },
    phwert: { text: 'Du verdünnst Säure mit viel Wasser. Wohin geht der pH-Wert?',
      optionen: ['Näher an 7', 'Weiter weg von 7', 'Er bleibt gleich'], antwort: 0 },
    protolyse: { text: 'Chlorwasserstoff kommt ins Wasser. Was gibt er ab?',
      optionen: ['Ein Proton', 'Ein Elektron', 'Ein Neutron'], antwort: 0 },
    neutralisation: { text: 'Säure und Lauge werden zusammengegeben. Was entsteht immer?',
      optionen: ['Wasser', 'Ein Gas', 'Ein Metall'], antwort: 0 },
    homologereihe: { text: 'Ein Alkan bekommt ein C-Atom mehr. Was kommt dazu?',
      optionen: ['CH₂', 'CH₃', 'C₂H₆'], antwort: 0 },
    isomerie: { text: 'Zwei Stoffe haben dieselbe Summenformel. Sind sie derselbe Stoff?',
      optionen: ['Nein, der Bau kann anders sein', 'Ja, immer', 'Nur bei kurzen Ketten'], antwort: 0 },
    siedekurve: { text: 'Die Alkankette wird länger. Was wird aus der Siedetemperatur?',
      optionen: ['Sie steigt', 'Sie sinkt', 'Sie bleibt gleich'], antwort: 0 },
    funktionellegruppe: { text: 'Ein primärer Alkohol wird oxidiert. Was entsteht zuerst?',
      optionen: ['Ein Alkanal', 'Ein Alkanon', 'Eine Säure'], antwort: 0 },
    veresterung: { text: 'Säure und Alkohol reagieren. Welcher Stoff entsteht nebenbei?',
      optionen: ['Wasser', 'Kohlenstoffdioxid', 'Wasserstoff'], antwort: 0 },
    seife: { text: 'Ein Seifenteilchen hat zwei Enden. Welches steckt im Fett?',
      optionen: ['Der lange unpolare Schwanz', 'Der geladene Kopf', 'Beide'], antwort: 0 }
  };

  /* ---------- Registry ---------- */
  const LISTE = [], NACH_ID = {};
  function register(def) {
    if (FRAGEN[def.id] && !def.frage) def.frage = FRAGEN[def.id];
    LISTE.push(def); NACH_ID[def.id] = def;
  }

  /* ---------- Rahmen für die Fachteile öffnen ----------
     Die Animationen liegen in animationen-7.js, -8.js und -9.js und
     laufen dort in eigenen IIFEs. Sie brauchen Schleife, Steuerleiste
     und register() aus dieser Datei. Der Unterstrich sagt: Das ist
     nicht für Seiten gedacht, sondern nur für die Fachteile. */
  window.ANIM = window.ANIM || {};
  window.ANIM._intern = {
    Loop, steuerleiste, regler, abzeichen, register, LISTE, NACH_ID,
    FARBE, STUFE_NAME, STUFE_FARBE, fmt, osz, h, el, stufeVon, REDUCED,
    mqDunkel, paletteSetzen, autostartErlaubt, AUTOSTART_SCHLUESSEL
  };
  window.ANIM.liste = LISTE;

  /* ============================================================
     Öffentliche API
     ============================================================ */
  /* Eine Animation, die niemand sieht, muss auch nicht laufen. Auf der
     Einheitenseite standen bisher mehrere Endlosschleifen gleichzeitig im
     Speicher — das kostet Akku und zieht die Aufmerksamkeit von der Aufgabe
     ab, an der gerade gearbeitet wird. Wer selbst auf Pause drückt oder die
     Vorhersagefrage noch offen hat, wird nicht automatisch gestartet. */
  function nurSichtbarLaufen(fig, ctrl) {
    if (!ctrl || typeof ctrl.play !== 'function') return () => {};
    const sync = () => { const b = fig.querySelector('.anim-steuer'); if (b && b._sync) b._sync(); };
    let vomNutzerGestoppt = false;
    const btn = fig.querySelector('[data-rolle="play"]');
    const nutzerKlick = () => {
      vomNutzerGestoppt = !ctrl.running;
      /* Beim bewussten Anhalten den aktuellen Stand einmal vorlesen lassen —
         der laufende Text darunter ist für Screenreader stumm geschaltet. */
      if (!ctrl.running) vorlesen(fig);
    };
    if (btn) btn.addEventListener('click', nutzerKlick);

    let io = null;
    if (!REDUCED && autostartErlaubt() && window.IntersectionObserver) {
      io = new IntersectionObserver(eintraege => {
        eintraege.forEach(e => {
          if (e.isIntersecting) {
            if (!vomNutzerGestoppt && !fig.dataset.wartet && !ctrl.running) { ctrl.play(); sync(); }
          } else if (ctrl.running) { ctrl.pause(); sync(); }
        });
      }, { threshold: 0.2 });
      io.observe(fig);
    } else if (!REDUCED && !autostartErlaubt() && typeof ctrl.pause === 'function') {
      /* Autostart abgewählt: Das Bild steht still, bis jemand abspielt. */
      ctrl.pause(); sync();
    }

    return () => {
      if (btn) btn.removeEventListener('click', nutzerKlick);
      if (io) io.disconnect();
      if (typeof ctrl.pause === 'function') ctrl.pause();
      sync();
    };
  }

  /* ---------- Zugänglichkeit ----------
     Die Zeile unter dem Bild ändert sich fortlaufend. Als Live-Region wäre
     sie eine Flut, ohne Auszeichnung unsichtbar. Deshalb: die laufende
     Zeile ausblenden, dafür eine feste Beschreibung und eine ruhige
     Statuszeile, die nur auf Pause und im Endzustand spricht. */
  function barrierefreiMachen(fig, def, stufe) {
    fig.querySelectorAll('.anim-ables, .anim-rechnung').forEach(n => n.setAttribute('aria-hidden', 'true'));
    if (def && def.kurz) {
      const fest = h('p', 'anim-sr', def.titel + '. ' + def.kurz);
      fig.appendChild(fest);
    }
    const status = h('p', 'anim-sr');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    status.dataset.rolle = 'status';
    fig.appendChild(status);
    textfassungEinbauen(fig, def, stufe);
  }

  /* ---------- Die Animation in Worten ----------
     Kein Lernziel darf allein an einer Bewegung hängen. Wer nicht sieht,
     wer die Bewegung abgeschaltet hat, wer sie zu schnell findet oder das
     Blatt ausdruckt, bekommt hier dieselbe Aussage als Text — aufklappbar,
     damit sie das Bild nicht verdrängt.

     Die Sätze stehen als `text: { A: [...], B: [...], C: [...] }` an der
     Animationsdefinition. Fehlt die Stufe, wird der Kurztext verwendet;
     fehlt auch der, bleibt der Block weg statt eine Hülse zu zeigen. */
  function textfassungEinbauen(fig, def, stufe) {
    const st = (stufe || 'B').toUpperCase().charAt(0);
    const saetze = (def && def.text && (def.text[st] || def.text.B))
      || (def && def.kurz ? [def.kurz] : null);
    if (!saetze || !saetze.length) return;

    const box = h('details', 'anim-text');
    const kopf = h('summary', null, 'Als Text lesen');
    box.appendChild(kopf);
    const liste = h('ol', 'anim-text-liste');
    saetze.forEach(s => liste.appendChild(h('li', null, s)));
    box.appendChild(liste);
    /* Beim Drucken ist das Bild ein Standbild — dann gehört der Text
       aufgeklappt daneben. */
    box.classList.add('anim-text-druck');
    fig.appendChild(box);
  }
  function vorlesen(fig) {
    const status = fig.querySelector('[data-rolle="status"]');
    const quelle = fig.querySelector('.anim-ables');
    if (status && quelle) status.textContent = quelle.textContent.trim();
  }

  /* ---------- Vorhersage vor dem Start ---------- */
  function vorhersageEinbauen(fig, def, ctrl) {
    const f = def.frage;
    const box = h('div', 'anim-frage');
    box.appendChild(h('span', 'anim-frage-text', f.text));
    const wahl = h('div', 'anim-frage-wahl');
    const echo = h('div', 'anim-frage-echo');
    const optionen = f.optionen.map((text, original) => ({ text, richtig: original === f.antwort }));
    for (let i = optionen.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [optionen[i], optionen[j]] = [optionen[j], optionen[i]];
    }
    let beantwortet = false;
    optionen.forEach(o => {
      const b = h('button', 'anim-tipp-btn', o.text);
      b.type = 'button'; b.setAttribute('aria-pressed', 'false');
      b.addEventListener('click', () => {
        if (beantwortet) return;
        beantwortet = true;
        wahl.querySelectorAll('.anim-tipp-btn').forEach(x => {
          x.setAttribute('aria-pressed', String(x === b));
          x.disabled = true;
        });
        echo.textContent = (o.richtig ? 'Genau — ' : 'Schau genau hin — ')
          + 'die Animation zeigt es dir jetzt.';
        try {
          if (typeof Tracker !== 'undefined' && Tracker?.track) {
            Tracker.track('animation_prediction', {
              animation: def.id,
              correct: o.richtig,
              level: fig.querySelector('.anim-stufe')?.textContent || null
            });
          }
        } catch { /* Tracking darf die Animation nie blockieren. */ }
        delete fig.dataset.wartet;
        ctrl.play();
        const bar = fig.querySelector('.anim-steuer');
        if (bar && bar._sync) bar._sync();
      });
      wahl.appendChild(b);
    });
    box.appendChild(wahl); box.appendChild(echo);
    fig.insertBefore(box, fig.firstChild);
    fig.dataset.wartet = '1';
  }

  /* Gebaute Bilder pro Host merken. So lassen sich alte RAF-Schleifen und
     IntersectionObserver zuverlässig beenden, bevor eine Animation ersetzt
     oder eine Seite verlassen wird. */
  const GEBAUT = new Map();

  function hostAufraeumen(host) {
    const gebaut = GEBAUT.get(host);
    if (!gebaut) return;
    try { gebaut.cleanup?.(); } catch (error) { console.warn('[Chemie710 Animation Cleanup]', error); }
    GEBAUT.delete(host);
  }

  function bereichAufraeumen(root) {
    if (!root) return;
    [...GEBAUT.entries()].forEach(([host]) => {
      if (host === root || (typeof root.contains === 'function' && root.contains(host))) hostAufraeumen(host);
    });
  }

  function fehlerIn(host, id, error) {
    console.error('[Chemie710 Animation]', id, error);
    host.replaceChildren();
    const box = h('div', 'anim-fehlt', 'Die Animation konnte nicht geladen werden. Die Erklärung bleibt nutzbar.');
    if (window.CHEMIE710_SUPABASE?.devMode === true) {
      box.appendChild(h('small', 'anim-fehlt-detail', 'Technischer Hinweis: ' + (error?.message || String(error))));
    }
    host.appendChild(box);
  }

  function baueIn(id, host, opts) {
    if (!host) return null;
    hostAufraeumen(host);
    host.replaceChildren();
    const def = NACH_ID[id];
    if (!def) {
      host.appendChild(h('div', 'anim-fehlt', 'Animation „' + id + '“ nicht gefunden.'));
      return null;
    }

    const fig = h('figure', 'anim');
    let ctrl = null;
    try {
      ctrl = def.bauen(fig, opts || {});
      host.appendChild(fig);
      barrierefreiMachen(fig, def, (opts || {}).stufe);
      if (def.frage && !REDUCED && ctrl && typeof ctrl.pause === 'function') {
        ctrl.pause();
        vorhersageEinbauen(fig, def, ctrl);
        const bar = fig.querySelector('.anim-steuer');
        if (bar && bar._sync) bar._sync();
      }
      const sichtbarCleanup = nurSichtbarLaufen(fig, ctrl);
      const cleanup = () => {
        sichtbarCleanup();
        if (ctrl && typeof ctrl.pause === 'function') ctrl.pause();
      };
      GEBAUT.set(host, { host, id, opts: { ...(opts || {}) }, ctrl, cleanup });
      return ctrl;
    } catch (error) {
      try { ctrl?.pause?.(); } catch { /* best effort */ }
      fehlerIn(host, id, error);
      return null;
    }
  }

  /* Systemfarben umgestellt: alle noch eingehängten Bilder neu aufbauen,
     damit Zeichnung und Rahmen zusammen hell oder zusammen dunkel sind. */
  if (mqDunkel && mqDunkel.addEventListener) {
    mqDunkel.addEventListener('change', e => {
      paletteSetzen(e.matches);
      const kopie = [...GEBAUT.values()].map(g => ({ host: g.host, id: g.id, opts: g.opts }));
      kopie.forEach(g => { if (g.host && g.host.isConnected) baueIn(g.id, g.host, g.opts); else hostAufraeumen(g.host); });
    });
  }

  window.ANIM.block = function (v) {
    const box = h('div', 'bild anim-bild');
    box.dataset.animation = String(v?.name || '');
    /* Ist der Fachteil noch nicht da, wird er geholt und danach gebaut. */
    if (v && v.name && !NACH_ID[v.name] && MODUL[v.name]) {
      window.ANIM.sicherstellen(v.name).then(ok => {
        if (ok && box.isConnected) baueIn(v.name, box, v);
      });
      return box;
    }
    /* Das ganze visual-Objekt durchreichen: manche Animationen bedienen
       mehrere Einheiten und brauchen dafür ein „thema" oder eine „form"
       (z. B. dieselbe Rückwärts-Animation für Pyramide und Kegel). */
    requestAnimationFrame(() => {
      if (!box.isConnected) return;
      baueIn(v.name, box, v);
    });
    return box;
  };

  /* ---------- Fachteile nachladen ----------
     budget.json hat diesen Fall vorhergesehen: Eine einzige Datei mit allen
     37 Animationen laedt auf jeder Einheitenseite mit, auch wenn dort genau
     eine gebraucht wird. Deshalb liegen die Fachteile in drei Dateien, und
     der Rahmen holt die passende beim ersten Zugriff nach.

     Die Tabelle ist der Preis dafuer: Sie muss zur Registrierung passen.
     pruefen.js vergleicht beides und meldet jede Abweichung. */
  const MODUL = {
    aggregat: 7, brennerflamme: 7, feuerdreieck: 7, massenerhaltung: 7,
    atombau: 7, streuversuch: 7, oktettregel: 7, nachweise: 7,
    elektrolyse: 8, ausgleichen: 8, dipol: 8, ionenbildung: 8,
    ionengitter: 8, elektronengas: 8, redox: 8, loesen: 8, isomerie: 8,
    mol: 9, phwert: 9, protolyse: 9, neutralisation: 9, homologereihe: 9,
    siedekurve: 9, funktionellegruppe: 9, veresterung: 9, seife: 9,
    signalwoerter: 9
  };
  const geladen = new Map();
  function modulLaden(nr) {
    if (geladen.has(nr)) return geladen.get(nr);
    const p = new Promise((fertig, fehler) => {
      const s = document.createElement('script');
      s.src = 'assets/js/animationen-' + nr + '.js';
      s.onload = () => fertig(true);
      /* Fällt das Nachladen aus, bleibt die Seite bedienbar: zeichnen.js
         zeigt dann seinen Platzhalter statt eines leeren Kastens. */
      s.onerror = () => fehler(new Error('animationen-' + nr + '.js nicht ladbar'));
      document.head.appendChild(s);
    });
    geladen.set(nr, p);
    return p;
  }
  window.ANIM.modulFuer = name => MODUL[name] || null;
  window.ANIM.sicherstellen = async function (name) {
    if (NACH_ID[name]) return true;
    const nr = MODUL[name];
    if (!nr) return false;
    try { await modulLaden(nr); } catch { return false; }
    return Boolean(NACH_ID[name]);
  };
  /* Die Galerie braucht alle Animationen auf einmal. allSettled statt all:
     Fällt ein Jahrgang aus, soll die Galerie die anderen trotzdem zeigen
     statt leer zu bleiben. */
  window.ANIM.alleLaden = () => Promise.allSettled([7, 8, 9].map(modulLaden));

  window.ANIM.einbetten = baueIn;
  window.ANIM.aufraeumen = bereichAufraeumen;

  /* Die Seite baut den sichtbaren Schalter; hier liegt nur der Wert und
     das Neuaufbauen der bereits eingehängten Bilder. */
  window.ANIM.autostart = {
    an: autostartErlaubt,
    setzen(an) {
      try {
        if (typeof Speicher !== 'undefined') Speicher.schreib(AUTOSTART_SCHLUESSEL, !!an);
        else localStorage.setItem(AUTOSTART_SCHLUESSEL, String(!!an));
      } catch { /* Speicher gesperrt — dann gilt es für diese Sitzung */ }
      [...GEBAUT.entries()].forEach(([host, gebaut]) => {
        if (host && host.isConnected && gebaut.id) baueIn(gebaut.id, host, gebaut.opts);
      });
    }
  };
  window.ANIM.pausieren = function (root) {
    [...GEBAUT.values()].forEach(g => {
      if (g.host === root || (root?.contains && root.contains(g.host))) {
        try { g.ctrl?.pause?.(); } catch { /* optional */ }
        const bar = g.host.querySelector('.anim-steuer');
        if (bar && bar._sync) bar._sync();
      }
    });
  };
  window.addEventListener('pagehide', () => bereichAufraeumen(document));

  window.ANIM.posterHtml = function (v) {
    const def = NACH_ID[v.name];
    const st = stufeVon(v);
    return '<div class="bild anim-poster">▶ Animation: ' + (def ? def.titel : v.name) + ' · Stufe ' + st + '</div>';
  };

  // Galerie: jede Animation als Karte mit A/B/C-Umschalter.
  const BEREICH_NAME = {
    FC: 'Faszination Chemie', PS: 'Das Periodensystem', GA: 'Gase',
    WA: 'Wasser', SZ: 'Salze', ME: 'Metalle', QB: 'Quantitative Betrachtungen',
    SL: 'Säuren und Laugen', KW: 'Kohlenwasserstoffe', AL: 'Alkohole',
    OS: 'Organische Säuren', ES: 'Ester und Makromoleküle'
  };
  window.ANIM.galerie = async function (host, opts) {
    opts = opts || {};
    await window.ANIM.alleLaden();
    // nach Lernbereich (Präfix des bezug) gruppieren; Reihenfolge wie in LISTE
    const gruppen = [];
    LISTE.forEach(def => {
      if (opts.bereich && !def.bezug.startsWith(opts.bereich)) return;
      const pre = def.bezug.split('-')[0];
      let g = gruppen.find(x => x.pre === pre);
      if (!g) { g = { pre, defs: [] }; gruppen.push(g); }
      g.defs.push(def);
    });
    gruppen.forEach(g => {
      if (!opts.bereich) host.appendChild(h('h2', 'anim-gruppe', BEREICH_NAME[g.pre] || g.pre));
      const gitter = h('div', 'anim-galerie'); host.appendChild(gitter);
      g.defs.forEach(def => baueKarte(def, gitter, opts));
    });
  };
  function baueKarte(def, host, opts) {
    {
      const karte = h('section', 'anim-karte');
      const kopf = h('div', 'anim-karte-kopf');
      kopf.appendChild(h('span', 'anim-bezug', def.bezug));
      kopf.appendChild(h('h2', 'anim-karte-titel', def.titel));
      karte.appendChild(kopf);
      karte.appendChild(h('p', 'anim-karte-kurz', def.kurz));

      const schalter = h('div', 'anim-schalter', null);
      const buehne = h('div', 'anim-buehne');
      let aktiv = 'B';
      const knoepfe = {};
      ['A', 'B', 'C'].forEach(s => {
        const btn = h('button', 'anim-schalt anim-schalt-' + s.toLowerCase(), STUFE_NAME[s]);
        btn.type = 'button';
        btn.addEventListener('click', () => { aktiv = s; setzeAktiv(); requestAnimationFrame(() => baueIn(def.id, buehne, { stufe: s, breite: opts.breite || 360 })); });
        knoepfe[s] = btn; schalter.appendChild(btn);
      });
      const setzeAktiv = () => Object.keys(knoepfe).forEach(s => knoepfe[s].setAttribute('aria-pressed', s === aktiv ? 'true' : 'false'));
      setzeAktiv();
      karte.appendChild(schalter);
      karte.appendChild(buehne);

      const fuss = h('div', 'anim-karte-fuss');
      const code = h('code', 'anim-code'); code.textContent = '"visual": { "type": "animation", "name": "' + def.id + '", "stufe": "A" }';
      fuss.appendChild(code);
      karte.appendChild(fuss);

      host.appendChild(karte);
      requestAnimationFrame(() => baueIn(def.id, buehne, { stufe: aktiv, breite: opts.breite || 360 }));
    }
  }
})();

/* ============================================================
   animationen.js · Teil 3 — Werkzeugkasten Chemie

   Chemie zeichnet keine Geraden, sondern Teilchen. Deshalb steht hier
   eine kleine Bühne mit Kugeln, Bindungen und Pfeilen: Szene() ist für
   die Fachteile das, was ein Koordinatensystem für die Mathematik wäre.
   ============================================================ */
(function () {
  'use strict';
  const I = window.ANIM._intern;
  const { FARBE, el } = I;

  /* Elementfarben. Bewusst feste Werte: Sauerstoff ist im Schulbuch rot
     und soll es im dunklen Modus bleiben. Der Rand sorgt dafür, dass
     Weiß auf hellem Grund trotzdem sichtbar bleibt. */
  const EL = {
    H: '#F2F4F7', C: '#3C4650', O: '#C43B32', N: '#2F6BB5', S: '#D9A227',
    Cl: '#4E9A51', Na: '#8E6BC4', K: '#7C5AB8', Ca: '#5E8C7B', Mg: '#6FA37F',
    Fe: '#A2643C', Cu: '#B5732F', Zn: '#7E8B99', Al: '#93A0AC', Ag: '#9AA6B2',
    He: '#7FB6C9', Ar: '#7FB6C9', Ne: '#7FB6C9'
  };
  const DUNKELTEXT = { H: true, He: true, Ne: true, Ar: true };
  const elFarbe = s => EL[s] || '#7E8B99';
  const elText = s => (DUNKELTEXT[s] ? '#15233A' : '#FFFFFF');

  /* ---------- Bühne ---------- */
  function Szene(opt) {
    opt = opt || {};
    const W = opt.breite || 340, H = opt.hoehe || 200;
    const svg = el('svg', {
      viewBox: `0 0 ${W} ${H}`, class: 'anim-svg', preserveAspectRatio: 'xMidYMid meet',
      role: 'img', 'aria-label': opt.alt || 'Bewegtes Teilchenbild.'
    });
    const hinten = el('g'), mitte = el('g'), vorn = el('g');
    svg.appendChild(hinten); svg.appendChild(mitte); svg.appendChild(vorn);

    return {
      svg, W, H,
      add(e, ebene) { (ebene === 'hinten' ? hinten : ebene === 'vorn' ? vorn : mitte).appendChild(e); return e; },

      /* Ein Teilchen ist eine Gruppe aus Kugel und Symbol. Zusammen
         verschoben bleibt die Beschriftung an der Kugel, auch wenn sie
         über das ganze Bild wandert. */
      teilchen(x, y, symbol, o) {
        o = o || {};
        const r = o.r || 15;
        const g = el('g', { transform: `translate(${x} ${y})` });
        g.appendChild(el('circle', {
          cx: 0, cy: 0, r, fill: o.fill || elFarbe(symbol),
          stroke: o.stroke || FARBE.ink, 'stroke-width': o.rand ?? 1.4
        }));
        if (symbol && o.beschriftet !== false) g.appendChild(el('text', {
          x: 0, y: r * 0.34, 'text-anchor': 'middle', 'font-family': 'inherit',
          'font-size': Math.max(9, r * 0.76), 'font-weight': 700,
          fill: o.textfarbe || elText(symbol)
        }, o.label ?? symbol));
        return this.add(g, o.ebene);
      },
      setPos(g, x, y) { g.setAttribute('transform', `translate(${x} ${y})`); },
      setLabel(g, s) { const t = g.querySelector('text'); if (t) t.textContent = s; },
      setFuell(g, sym) {
        const c = g.querySelector('circle'), t = g.querySelector('text');
        if (c) c.setAttribute('fill', elFarbe(sym));
        if (t) t.setAttribute('fill', elText(sym));
      },
      setOpacity(g, v) { g.setAttribute('opacity', v); },

      bindung(x1, y1, x2, y2, o) {
        o = o || {};
        const e = el('line', {
          x1, y1, x2, y2, stroke: o.farbe || FARBE.ink,
          'stroke-width': o.breite || 3, 'stroke-linecap': 'round'
        });
        if (o.dash) e.setAttribute('stroke-dasharray', o.dash);
        return this.add(e, o.ebene || 'hinten');
      },
      setBindung(e, x1, y1, x2, y2) {
        e.setAttribute('x1', x1); e.setAttribute('y1', y1);
        e.setAttribute('x2', x2); e.setAttribute('y2', y2);
      },

      pfeil(x1, y1, x2, y2, o) {
        o = o || {};
        const uid = 'p' + Math.random().toString(36).slice(2, 7);
        const defs = el('defs');
        const mk = el('marker', { id: uid, viewBox: '0 0 8 8', refX: 7, refY: 4, markerWidth: 5, markerHeight: 5, orient: 'auto' });
        mk.appendChild(el('path', { d: 'M0,0 L8,4 L0,8 z', fill: o.farbe || FARBE.weich }));
        defs.appendChild(mk); svg.appendChild(defs);
        return this.add(el('line', {
          x1, y1, x2, y2, stroke: o.farbe || FARBE.weich,
          'stroke-width': o.breite || 2, 'marker-end': `url(#${uid})`
        }), o.ebene || 'vorn');
      },

      text(x, y, s, o) {
        o = o || {};
        return this.add(el('text', {
          x, y, 'text-anchor': o.anchor || 'middle',
          'font-family': o.mono ? 'monospace' : 'inherit',
          'font-size': o.size || 12, 'font-weight': o.weight || 400,
          fill: o.farbe || FARBE.ink
        }, s), o.ebene || 'vorn');
      },

      kasten(x, y, w, hh, o) {
        o = o || {};
        return this.add(el('rect', {
          x, y, width: w, height: hh, rx: o.rx ?? 8,
          fill: o.fill || FARBE.weiss, stroke: o.stroke || FARBE.faint,
          'stroke-width': o.breite || 1.5
        }), o.ebene || 'hinten');
      }
    };
  }

  /* Reproduzierbarer Zufall. Ein Gas, das nach jedem Umschalten anders
     aussieht, erschwert genau den Vergleich, um den es geht. */
  function Wuerfel(saat) {
    let s = saat || 7;
    return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
  }

  const SYM = ['', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
    'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca'];
  /* Schulische Besetzungsregel bis Calcium. Weiter trägt das
     Schalenmodell in Klasse 7 bis 10 nicht — und wo es nicht trägt,
     soll es auch nichts behaupten. */
  function schalenFuer(z) {
    const max = [2, 8, 8, 2], s = [];
    let rest = z;
    for (let i = 0; i < max.length && rest > 0; i++) { const n = Math.min(rest, max[i]); s.push(n); rest -= n; }
    return s;
  }

  window.ANIM._chem = { Szene, Wuerfel, EL, elFarbe, elText, SYM, schalenFuer };
})();

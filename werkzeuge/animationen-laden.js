#!/usr/bin/env node
/* ============================================================
   animationen-laden.js · Lädt die Animationsdateien wirklich

   Aufruf:  node werkzeuge/animationen-laden.js
   Rückgabe: 0 = alle Dateien laden und registrieren, 1 = mindestens eine nicht

   Warum es diese Datei gibt: Beim Aufteilen von animationen.js in Rahmen
   und Jahrgangsteile ging der Export-Block window.ANIM._intern verloren.
   node --check meldete nichts, pruefen.js meldete nichts, die Größen
   stimmten — und trotzdem hätte im Browser keine einzige Animation
   funktioniert, weil die Fachteile den Rahmen nicht mehr gefunden hätten.
   Ein Syntaxtest prüft, ob eine Datei lesbar ist. Dieser Test prüft, ob
   sie tut, was sie soll.

   Ausgeführt wird nur die oberste Ebene: die Dateien anlegen, register()
   aufrufen lassen, das Ergebnis zählen. bauen() wird NICHT aufgerufen —
   dafür bräuchte es ein echtes SVG-Layout. Was eine Animation zeichnet,
   sagt nur ein Blick auf animationen.html.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const WURZEL = path.resolve(__dirname, '..');
const P = (...t) => path.join(WURZEL, ...t);

const RAHMEN = 'assets/js/animationen.js';
const TEILE = ['assets/js/animationen-7.js', 'assets/js/animationen-8.js', 'assets/js/animationen-9.js'];

/* ---------- Ein Browser, so klein wie möglich ----------
   Nachgebaut wird nur, was beim Laden angefasst wird. Jeder weitere
   Zugriff soll auffallen, statt still ins Leere zu laufen — deshalb gibt
   es keinen Proxy, der alles beantwortet. */
function knoten(name) {
  const k = {
    nodeName: name, kinder: [], attrs: {}, style: {}, dataset: {},
    className: '', textContent: '', type: '',
    setAttribute(a, w) { this.attrs[a] = String(w); },
    getAttribute(a) { return a in this.attrs ? this.attrs[a] : null; },
    appendChild(c) { this.kinder.push(c); return c; },
    insertBefore(c) { this.kinder.unshift(c); return c; },
    addEventListener() {},
    removeEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; }
  };
  return k;
}

const fenster = {
  addEventListener() {},
  removeEventListener() {},
  matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }),
  requestAnimationFrame: () => 0,
  cancelAnimationFrame() {},
  localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
  IntersectionObserver: undefined,
  document: {
    createElement: knoten,
    createElementNS: (_ns, n) => knoten(n),
    head: knoten('head'),
    body: knoten('body'),
    addEventListener() {},
    querySelector: () => null,
    querySelectorAll: () => []
  }
};
fenster.window = fenster;
fenster.self = fenster;
fenster.globalThis = fenster;
fenster.console = console;
fenster.Math = Math;
fenster.Date = Date;
fenster.Promise = Promise;
fenster.Map = Map;
fenster.Set = Set;
fenster.Error = Error;
fenster.String = String;
fenster.Number = Number;
fenster.Object = Object;
fenster.Array = Array;
fenster.JSON = JSON;

const kontext = vm.createContext(fenster);
const fehler = [];

function laden(rel) {
  const quelle = fs.readFileSync(P(rel), 'utf8');
  try {
    vm.runInContext(quelle, kontext, { filename: rel });
    return true;
  } catch (e) {
    fehler.push(`${rel}: ${e.message}`);
    return false;
  }
}

console.log('Animationsdateien laden');

if (!laden(RAHMEN)) {
  console.log('  ✗ ' + fehler[fehler.length - 1]);
  console.log('\nDer Rahmen lädt nicht — ohne ihn hat kein Fachteil eine Chance.');
  process.exit(1);
}

const ANIM = kontext.ANIM;
if (!ANIM) {
  console.log('  ✗ animationen.js legt kein window.ANIM an');
  process.exit(1);
}
for (const feld of ['_intern', '_chem', 'block', 'einbetten', 'galerie', 'sicherstellen', 'alleLaden', 'liste']) {
  if (ANIM[feld] === undefined) fehler.push(`window.ANIM.${feld} fehlt — die Fachteile oder die Seiten greifen darauf zu`);
}
const gebraucht = ['Loop', 'steuerleiste', 'abzeichen', 'register', 'FARBE', 'fmt', 'osz', 'h', 'el', 'stufeVon', 'REDUCED', 'regler'];
for (const w of gebraucht) {
  if (!ANIM._intern || ANIM._intern[w] === undefined) fehler.push(`window.ANIM._intern.${w} fehlt — ein Fachteil holt es sich beim Laden`);
}
console.log(`  ✓ ${RAHMEN}: Rahmen steht, ${Object.keys(ANIM._intern || {}).length} Werkzeuge offen`);

let vorher = ANIM.liste ? ANIM.liste.length : 0;
for (const t of TEILE) {
  if (!laden(t)) { console.log('  ✗ ' + fehler[fehler.length - 1]); continue; }
  const jetzt = ANIM.liste.length;
  if (jetzt === vorher) fehler.push(`${t} lädt, registriert aber keine einzige Animation`);
  console.log(`  ✓ ${t}: ${jetzt - vorher} Animationen`);
  vorher = jetzt;
}

/* Jede registrierte Animation braucht Titel, Bezug und eine bauen-Funktion —
   sonst bricht sie erst auf, wenn ein Kind die Einheit öffnet. */
for (const def of ANIM.liste || []) {
  if (typeof def.bauen !== 'function') fehler.push(`Animation ${def.id}: bauen() fehlt oder ist keine Funktion`);
  if (!def.titel) fehler.push(`Animation ${def.id}: titel fehlt`);
  if (!def.bezug) fehler.push(`Animation ${def.id}: bezug fehlt`);
}
console.log(`  ✓ ${(ANIM.liste || []).length} Animationen insgesamt, alle mit bauen(), Titel und Bezug`);

if (fehler.length) {
  console.log(`\nFehler (${fehler.length}):`);
  fehler.forEach(f => console.log('  ✗ ' + f));
  process.exit(1);
}
console.log('\nAlle Animationsdateien laden und registrieren.');

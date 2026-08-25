#!/usr/bin/env node
/* ============================================================
   Abschlussquiz je Einheit erzeugen

   Das Quiz verwendet drei über den Lernweg verteilte Aufgaben: Einstieg,
   Mitte und Transfer/Abschluss. Die Auswahl wird in tasks.json festgehalten,
   damit ein gespeichertes Ergebnis immer auf denselben Fragenstand zeigt.

   Zusätzlich entsteht der Datenbankschlüsselblock. Die Datenbank prüft die
   Antworten selbst; ein vom Browser behaupteter Punktestand wird nie
   übernommen.
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const UNITS = path.join(ROOT, 'units');
const VERSION = 1;

function jsonDateien() {
  const aus = [];
  for (const bereich of fs.readdirSync(UNITS, { withFileTypes: true })) {
    if (!bereich.isDirectory()) continue;
    const ordner = path.join(UNITS, bereich.name);
    for (const einheit of fs.readdirSync(ordner, { withFileTypes: true })) {
      if (!einheit.isDirectory()) continue;
      const datei = path.join(ordner, einheit.name, 'tasks.json');
      if (fs.existsSync(datei)) aus.push(datei);
    }
  }
  return aus.sort();
}

function auswahl(aufgaben) {
  if (aufgaben.length < 3) throw new Error('Ein Lernweg braucht mindestens drei Aufgaben.');
  const positionen = [0, Math.floor((aufgaben.length - 1) / 2), aufgaben.length - 1];
  return positionen.map(i => aufgaben[i]);
}

function erwartung(aufgabe) {
  if (aufgabe.type === 'multi') return aufgabe.fields.map(f => f.answer);
  return aufgabe.answer;
}

function sqlText(value) {
  return "'" + String(value).replace(/'/g, "''") + "'";
}

const schluessel = [];
let einheiten = 0;

for (const datei of jsonDateien()) {
  const daten = JSON.parse(fs.readFileSync(datei, 'utf8'));
  const frageIds = {};

  for (const pfad of ['A', 'B', 'C']) {
    const kandidaten = daten.tasks.filter(t => t.path === pfad);
    const gewaehlt = auswahl(kandidaten);
    frageIds[pfad] = gewaehlt.map(t => t.id);
    gewaehlt.forEach((t, index) => {
      schluessel.push({
        unit: daten.unit.toLowerCase(),
        pfad,
        version: VERSION,
        id: t.id,
        reihenfolge: index + 1,
        antwort: erwartung(t)
      });
    });
  }

  daten.abschlussquiz = {
    version: VERSION,
    anzahl: 3,
    hinweis: 'Beantworte alle drei Fragen ohne Tipps. Erst nach dem Abgeben siehst du dein Ergebnis.',
    frage_ids: frageIds
  };
  fs.writeFileSync(datei, JSON.stringify(daten, null, 2) + '\n', 'utf8');
  einheiten++;
}

const values = schluessel.map(k =>
  `  (${sqlText(k.unit)}, ${sqlText(k.pfad)}, ${k.version}, ${sqlText(k.id)}, ${k.reihenfolge}, ${sqlText(JSON.stringify(k.antwort))}::jsonb)`
).join(',\n');

const seed = `-- Automatisch erzeugt durch werkzeuge/abschlussquiz_erzeugen.js\n` +
  `insert into public.chemie710_quiz_schluessel\n` +
  `  (unit, pfad, quiz_version, frage_id, reihenfolge, antwort)\nvalues\n${values}\n` +
  `on conflict (unit, pfad, quiz_version, frage_id) do update set\n` +
  `  reihenfolge = excluded.reihenfolge,\n  antwort = excluded.antwort;\n`;

fs.writeFileSync(path.join(ROOT, 'supabase', 'quiz-schluessel.generated.sql'), seed, 'utf8');

const template = fs.readFileSync(path.join(ROOT, 'supabase', 'quiz-module.template.sql'), 'utf8');
if (!template.includes('-- __QUIZ_KEYS__')) throw new Error('Quizmarker fehlt im SQL-Template.');
const modul = template.replace('-- __QUIZ_KEYS__', seed.trimEnd());
const migrationDir = path.join(ROOT, 'supabase', 'migrations');
fs.mkdirSync(migrationDir, { recursive: true });
fs.writeFileSync(
  path.join(migrationDir, '20260825120000_einheitenquiz.sql'),
  modul.trimEnd() + '\n',
  'utf8'
);

/* setup.sql bleibt der vollständige Weg für eine frische Installation.
   Der erzeugte Block wird bei jedem Lauf ersetzt, nicht doppelt angehängt. */
const setupDatei = path.join(ROOT, 'supabase', 'setup.sql');
const start = '-- BEGIN GENERATED EINHEITENQUIZ';
const ende = '-- END GENERATED EINHEITENQUIZ';
let setup = fs.readFileSync(setupDatei, 'utf8');
const block = `${start}\n${modul.trimEnd()}\n${ende}\n`;
const rx = new RegExp(`${start}[\\s\\S]*?${ende}\\r?\\n?`);
setup = rx.test(setup) ? setup.replace(rx, block) : setup.trimEnd() + '\n\n' + block;
fs.writeFileSync(setupDatei, setup, 'utf8');

console.log(`${einheiten} Einheiten · ${schluessel.length} Quizfragen · Version ${VERSION}`);

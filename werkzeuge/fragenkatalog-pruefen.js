#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const P = (...x) => path.join(ROOT, ...x);
const read = f => JSON.parse(fs.readFileSync(P(f), 'utf8'));
const plain = s => String(s || '').replace(/\s+/g, ' ').replace(/\s+([,.;:])/g, '$1').trim();
const errors = [];

const bank = read('fragenkatalog/questions.json');
const bankById = new Map(bank.map(q => [q.id, q]));
const mapping = read('fragenkatalog/zuordnung.json').zuordnungen || [];
const mappingKey = new Map(mapping.map(x => [`${x.einheit}-${x.lernweg}`, x]));
const found = [];
const officialTitles = new Map([
  [1,'Sicherheit im Chemieunterricht'], [2,'Stoffe und Stoffeigenschaften'],
  [3,'Stoffgemische und Trennverfahren'], [4,'Luft und Verbrennungen'],
  [5,'Die chemische Reaktion'], [6,'Wasser'], [7,'Metalle und Redoxreaktionen'],
  [8,'Elemente und ihre Ordnung'], [9,'Chemische Bindungen'],
  [10,'Säuren, Laugen, Salze'], [12,'Kohlenwasserstoffe'],
  [13,'Alkohole und organische Säuren'], [14,'Kunststoffe'],
  [15,'Nahrung, Seife, Waschmittel']
]);

for (const series of fs.readdirSync(P('units')).filter(x => /^[a-z]{2}$/.test(x))) {
  for (const unit of fs.readdirSync(P('units', series)).filter(x => /^[a-z]{2}-\d{2}$/.test(x))) {
    const data = read(path.posix.join('units', series, unit, 'tasks.json'));
    const tasks = data.tasks.filter(t => (t.tags || []).includes('fragenkatalog'));
    if (tasks.length > 3) errors.push(`${unit}: mehr als drei Katalogaufgaben`);
    if (new Set(tasks.map(t => t.path)).size !== tasks.length) errors.push(`${unit}: ein Lernweg enthält mehrere Katalogaufgaben`);
    const repeated = Object.values(Object.groupBy(data.tasks, t => plain(t.prompt)))
      .filter(group => new Set(group.map(t => t.path)).size > 1);
    if (repeated.length) errors.push(`${unit}: ${repeated.length} wortgleiche Frage(n) in mehreren Lernwegen`);
    if (!data.lehrbuch || !data.lehrbuch.abschnitt) errors.push(`${unit}: konkrete Lehrbuchstelle fehlt`);
    if (data.lehrbuch && officialTitles.get(data.lehrbuch.kapitel) !== data.lehrbuch.titel) errors.push(`${unit}: falscher Lehrbuch-Kapiteltitel`);
    if (data.lehrbuch && data.lehrbuch.seiten_bis - data.lehrbuch.seiten_von > 21) errors.push(`${unit}: Lehrbuchbereich ist nicht konkret genug`);
    for (const task of tasks) {
      found.push(task);
      const link = mappingKey.get(`${data.unit}-${task.path}`);
      if (!link) { errors.push(`${unit}/${task.path}: fehlt in zuordnung.json`); continue; }
      const source = bankById.get(link.katalog_id);
      if (!source) { errors.push(`${unit}/${task.path}: unbekannte Katalog-ID ${link.katalog_id}`); continue; }
      if (plain(task.prompt) !== plain(source.prompt)) errors.push(`${unit}/${task.path}: Fragetext weicht von ${source.id} ab`);
      if (task.type !== 'choice') errors.push(`${unit}/${task.path}: Katalogaufgabe ist nicht choice`);
      if (!Array.isArray(task.options) || task.options.length < 2) errors.push(`${unit}/${task.path}: zu wenige Optionen`);
      if (task.path === 'A' && task.options.length > 3) errors.push(`${unit}/A: mehr als drei Optionen`);
      if (!Number.isInteger(task.answer) || task.answer < 0 || task.answer >= task.options.length) errors.push(`${unit}/${task.path}: ungültiger Antwortindex`);
      if (new Set(task.options.map(plain)).size !== task.options.length) errors.push(`${unit}/${task.path}: doppelte Antwortoption`);
      if (!String(task.herkunft || '').includes(source.id)) errors.push(`${unit}/${task.path}: Herkunft nennt ${source.id} nicht`);
      if (!String(task.herkunft || '').includes(`S. ${data.lehrbuch.seiten_von}–${data.lehrbuch.seiten_bis}`)) errors.push(`${unit}/${task.path}: Lehrbuchseiten fehlen in Herkunft`);
    }
  }
}

if (found.length !== mapping.length) errors.push(`Aufgaben/Zuordnungen: ${found.length}/${mapping.length}`);

const plan = read('spiral/plan.json');
const validCategories = new Set(plan.kategorien || []);
const validUnits = new Set((plan.reihen || []).flatMap(r => r.einheiten || []));
const warmupPrompts = new Map();
if (validCategories.size !== 9 || [...validCategories].some(x => !x.startsWith('K-'))) errors.push('plan.json: erwartet neun K-Chemiekategorien');
for (const code of validCategories) {
  const pool = read(path.posix.join('spiral', code.toLowerCase() + '.json'));
  for (const level of ['A', 'B', 'C']) {
    const questions = (pool.fragen || []).filter(q => q.level === level);
    if (questions.length < 5) errors.push(`${code}/${level}: nur ${questions.length} Warm-up-Fragen`);
    for (const q of questions) {
      if (!bankById.has(q.katalog_id)) errors.push(`${code}/${level}: unbekannte Katalog-ID ${q.katalog_id}`);
      if (!validUnits.has(q.ab_einheit)) errors.push(`${q.id}: ungültige Einführungs-Einheit ${q.ab_einheit}`);
      if (!Array.isArray(q.options) || new Set(q.options.map(plain)).size !== q.options.length) errors.push(`${q.id}: ungültige Optionen`);
      if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= q.options.length) errors.push(`${q.id}: ungültiger Antwortindex`);
      if (level === 'A' && q.options.length > 3) errors.push(`${q.id}: A hat mehr als drei Optionen`);
      const prompt = plain(q.prompt);
      if (warmupPrompts.has(prompt)) errors.push(`${q.id}: Warm-up-Frage bereits in ${warmupPrompts.get(prompt)}`);
      else warmupPrompts.set(prompt, `${code}/${level}`);
    }
  }
}

const oldPools = fs.readdirSync(P('spiral')).filter(f => /^w-.*\.json$/.test(f));
if (oldPools.length) errors.push(`Alte Warm-up-Pools vorhanden: ${oldPools.join(', ')}`);

const noMathFiles = [
  'assets/js/engine.js', 'assets/js/ausdruck.js', 'assets/js/zeichnen.js',
  'werkzeuge/uebungsblatt-pruefen.js', 'werkzeuge/uebungsblaetter.js'
];
const mathRemnants = /Grundwert|Brötchen|Zinsen|Mathematikprojekt|Mathe-Projekt|:\s*€/i;
for (const file of noMathFiles) {
  if (mathRemnants.test(fs.readFileSync(P(file), 'utf8'))) errors.push(`${file}: fachfremder Mathe-Rest`);
}

if (errors.length) {
  console.error(`Fragenkatalog-Prüfung: ${errors.length} Fehler`);
  errors.forEach(e => console.error('  ✗ ' + e));
  process.exit(1);
}
console.log(`Fragenkatalog-Prüfung: ${found.length} kuratierte Aufgaben in ${new Set(mapping.map(x => x.einheit)).size} Einheiten, ${warmupPrompts.size} eindeutige Warm-ups — alles stimmig.`);

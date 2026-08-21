#!/usr/bin/env node
/* ============================================================
   videos-online-pruefen.js · Videoquellen und Lumi-Zuordnung

   Aufruf: node werkzeuge/videos-online-pruefen.js

   Die Prüfung beantwortet zwei technische Fragen:
     - Ist das Originalvideo über YouTube oEmbed erreichbar und einbettbar?
     - Lädt die zugeordnete Lumi-H5P-Seite und enthält sie dieselbe Video-ID?

   Eine erfolgreiche HTTP-Antwort ist kein Ersatz für die fachliche Prüfung
   oder einen Wiedergabetest im Browser. Insbesondere können Fehler in einer
   externen H5P-Laufzeit erst beim Abspielen auftreten.
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');

const WURZEL = path.resolve(__dirname, '..');
const ZEITGRENZE = 15000;
const PARALLEL = 6;
const YOUTUBE = /^https:\/\/www\.youtube\.com\/watch\?v=([A-Za-z0-9_-]{11})$/;
const LUMI_EMBED = /^https:\/\/app\.lumi\.education\/api\/v1\/run\/[A-Za-z0-9_-]{4,32}\/embed$/;
const YOUTUBE_EMBED = /^https:\/\/www\.youtube-nocookie\.com\/embed\/([A-Za-z0-9_-]{11})$/;

function einheiten() {
  const dateien = [];
  const basis = path.join(WURZEL, 'units');
  for (const bereich of fs.readdirSync(basis)) {
    const ordner = path.join(basis, bereich);
    if (!fs.statSync(ordner).isDirectory()) continue;
    for (const einheit of fs.readdirSync(ordner)) {
      const datei = path.join(ordner, einheit, 'tasks.json');
      if (fs.existsSync(datei)) dateien.push(datei);
    }
  }
  return dateien;
}

function fundstellen() {
  const eintraege = [];
  for (const datei of einheiten()) {
    const daten = JSON.parse(fs.readFileSync(datei, 'utf8'));
    const kurz = path.relative(WURZEL, datei).replace(/\\/g, '/');
    for (const [art, liste] of [['Erklärvideo', daten.videos], ['Experiment', daten.experimente]]) {
      for (const video of liste || []) {
        eintraege.push({
          art,
          datei: kurz,
          titel: video.titel,
          url: video.url,
          embed: video.embed || '',
          id: (String(video.url || '').match(YOUTUBE) || [])[1] || ''
        });
      }
    }
  }
  return eintraege;
}

async function laden(url, textErwartet = false) {
  const steuerung = new AbortController();
  const uhr = setTimeout(() => steuerung.abort(), ZEITGRENZE);
  try {
    const antwort = await fetch(url, {
      redirect: 'follow',
      signal: steuerung.signal,
      headers: { 'user-agent': 'chh-Chemie-Linkpruefung/1.0' }
    });
    return {
      status: antwort.status,
      text: textErwartet && antwort.ok ? await antwort.text() : ''
    };
  } catch (fehler) {
    return { fehler: fehler.name === 'AbortError' ? 'Zeitüberschreitung' : fehler.message };
  } finally {
    clearTimeout(uhr);
  }
}

async function parallel(aufgaben) {
  const ergebnisse = new Map();
  let cursor = 0;
  async function worker() {
    while (cursor < aufgaben.length) {
      const aufgabe = aufgaben[cursor++];
      ergebnisse.set(aufgabe.schluessel, await aufgabe.laden());
    }
  }
  await Promise.all(Array.from({ length: Math.min(PARALLEL, aufgaben.length) }, worker));
  return ergebnisse;
}

(async () => {
  const eintraege = fundstellen();
  const youtube = new Map();
  const lumi = new Map();
  const befunde = [];

  for (const eintrag of eintraege) {
    if (!eintrag.id) {
      befunde.push({ ...eintrag, befund: 'ungültige YouTube-Adresse' });
      continue;
    }
    if (!youtube.has(eintrag.url)) youtube.set(eintrag.url, eintrag);
    if (eintrag.embed) {
      const direkt = eintrag.embed.match(YOUTUBE_EMBED);
      if (direkt && direkt[1] !== eintrag.id) {
        befunde.push({ ...eintrag, befund: 'direkte Einbettadresse verwendet eine andere YouTube-ID' });
      } else if (direkt) {
        continue;
      } else if (!LUMI_EMBED.test(eintrag.embed)) {
        befunde.push({ ...eintrag, befund: 'ungültige Lumi-Einbettadresse' });
      } else if (!lumi.has(eintrag.embed)) {
        lumi.set(eintrag.embed, eintrag);
      }
    }
  }

  const youtubeAufgaben = [...youtube].map(([url]) => ({
    schluessel: url,
    laden: () => laden(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`)
  }));
  const youtubeErgebnisse = await parallel(youtubeAufgaben);
  for (const [url, eintrag] of youtube) {
    const erg = youtubeErgebnisse.get(url);
    if (erg.fehler) befunde.push({ ...eintrag, befund: `YouTube nicht erreichbar: ${erg.fehler}` });
    else if (erg.status !== 200) befunde.push({ ...eintrag, befund: `YouTube oEmbed: HTTP ${erg.status}` });
  }

  const lumiAufgaben = [...lumi].map(([url]) => ({
    schluessel: url,
    laden: () => laden(url, true)
  }));
  const lumiErgebnisse = await parallel(lumiAufgaben);
  for (const [url, eintrag] of lumi) {
    const erg = lumiErgebnisse.get(url);
    if (erg.fehler) {
      befunde.push({ ...eintrag, befund: `Lumi nicht erreichbar: ${erg.fehler}` });
    } else if (erg.status !== 200) {
      befunde.push({ ...eintrag, befund: `Lumi: HTTP ${erg.status}` });
    } else if (!erg.text.includes('H5PIntegration')) {
      befunde.push({ ...eintrag, befund: 'Lumi liefert keine erkennbare H5P-Einbettung' });
    } else if (!erg.text.includes(eintrag.id)) {
      befunde.push({ ...eintrag, befund: 'Lumi verweist nicht auf dieselbe YouTube-ID' });
    }
  }

  const erklaervideos = eintraege.filter(e => e.art === 'Erklärvideo').length;
  const experimente = eintraege.filter(e => e.art === 'Experiment').length;
  console.log(`${erklaervideos} Erklärvideos und ${experimente} Experimentiervideos eingelesen.`);
  console.log(`${youtube.size} unterschiedliche YouTube-Videos und ${lumi.size} Lumi-Einbettungen angefragt.`);

  if (!befunde.length) {
    console.log('Keine technischen Auffälligkeiten bei Erreichbarkeit und Zuordnung.');
    console.log('Hinweis: Die Wiedergabe externer Player muss zusätzlich im Browser geprüft werden.');
    return;
  }

  console.log(`\n${befunde.length} technische Auffälligkeiten:\n`);
  for (const b of befunde) {
    console.log(`  ${b.datei}\n    ${b.art}: „${b.titel}“\n    → ${b.befund}\n`);
  }
  process.exitCode = 2;
})();

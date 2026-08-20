/* ============================================================
   spiral.js · Warm-up „Altes Wissen"
   Fünf Aufgaben zu Beginn der Stunde, drei am Ende.

   Drei Besonderheiten gegenüber engine.js:

   1. Aufgaben werden aus Generatoren erzeugt, nicht einzeln geschrieben.
      Getrackt wird die FÄHIGKEIT (die Generator-ID), nicht die Zahl.
      „Kann 10 % im Kopf" ist die Information — nicht „kann 10 % von 200".

   2. Wiederholt wird, was ZURÜCKLIEGT. Maßgeblich ist die Unterrichtsreihe
      der Einheit, zu der aufgewärmt wird: Alles, was in früheren Reihen
      erarbeitet wurde, ist Wiederholungsstoff — und zwar aus allen früheren
      Reihen, nicht nur aus der letzten. Was noch nicht dran war, kommt auch
      nicht dran. Bis V30 zog das Warm-up aus allen acht Kategorien; in der
      zweiten Schulwoche der siebten Klasse standen deshalb Aufgaben zur
      organischen Chemie auf dem Schirm. Das war kein Wiederholen, sondern
      Raten. Die Reihenfolge der Reihen steht in spiral/plan.json.

   3. Zwei Betriebsarten, gesteuert vom selben Schalter wie der Rest der
      Anwendung (chemie710_unterricht):

        Übungsmodus     Außerhalb der Unterrichtszeit. Freiwillig, so oft
                        wie gewollt, ohne Folgen für die Note.
        Bewertungsmodus Während des Unterrichts. Verpflichtend vor der
                        Einheit; das Ergebnis geht an Supabase und zählt.
                        Gewertet wird genau der erste Lauf des Tages —
                        sonst wäre die Note eine Frage der Anzahl der
                        Versuche.

      Ob am Ende die Einzelergebnisse oder der individuelle Lernfortschritt
      zur Note führen, entscheidet die Lehrkraft je Kind im Dashboard. Die
      Anwendung liefert nur die Zahlen; die Umrechnung steht in der
      Datenbank (chemie710_warmup_uebersicht).
   ============================================================ */

const TAG_MS = 86400000;
const $$ = (s, w = document) => w.querySelector(s);

const SP = {
  plan: null,
  kategorien: {},     // code → { kategorie, titel, generatoren: [] }
  reihe: [],
  index: 0,
  richtig: 0,
  aufgabe: null,
  versuche: 0,
  start: 0,
  beginn: 0,          // Startzeitpunkt des ganzen Laufs
  level: 'B',
  einheit: null,
  /* Die Unterrichtsreihe, zu der aufgewärmt wird, und die Reihen davor. */
  aktuelleReihe: null,
  quellenReihen: [],
  kategorieReihe: {}, // Kategoriecode → Reihe, in der sie erarbeitet wurde
  /* Pflichtlauf im Unterricht? Wird beim Start aus dem Lernmodus gelesen. */
  pflicht: false,
  gemeldet: false
};

/* ============================================================
   1 bis 3 · Ausdrucksauswertung, Formatierung und Generatoren
   liegen seit V30 in assets/js/ausdruck.js — dieselbe Datei berechnet in
   Node die Lösungen der gedruckten Übungsblätter. Sie muss VOR spiral.js
   geladen werden.
   ============================================================ */

/* ============================================================
   4 · Leitner-Kartei
   ============================================================ */

function kartei() { return Speicher.lies('chemie710.spiral', {}); }

function karteiSchreib(k) { Speicher.schreib('chemie710.spiral', k); }

function notiere(genId, richtig) {
  const k = kartei();
  const e = k[genId] || { box: 1, faellig: 0, gesehen: 0, falsch: 0 };
  const iv = SP.plan.intervalle_tage;
  if (richtig) {
    e.box = Math.min(e.box + 1, iv.length - 1);
  } else {
    e.box = 1;
    e.falsch++;
  }
  e.gesehen++;
  e.faellig = Date.now() + iv[e.box] * TAG_MS;
  k[genId] = e;
  karteiSchreib(k);
}

/* ============================================================
   5 · Welche Reihe ist dran, und was liegt davor?
   ============================================================ */

function reiheZuCode(code) {
  const c = String(code || '').toLowerCase();
  return (SP.plan.reihen || []).find(r => r.code === c) || null;
}

function reiheZuEinheit(einheit) {
  return reiheZuCode(String(einheit || '').split('-')[0]);
}

/* Ohne Einheit im Aufruf — also beim freien Üben von der Startseite —
   richtet sich das Warm-up danach, wie weit das Kind gekommen ist.
   Maßgeblich ist die WEITESTE Reihe, in der es schon gearbeitet hat, nicht
   die zuletzt geöffnete: Wer nach der Reihe „Salze" noch einmal in
   „Faszination Chemie" nachschlägt, hat deswegen nicht vergessen, was
   dazwischen lag.

   Findet sich gar kein Stand, gilt die ERSTE Reihe. Das ist die vorsichtige
   Richtung: Einem Kind der siebten Klasse organische Chemie vorzulegen ist
   der Fehler, den dieses Warm-up gerade abstellen soll. Umgekehrt bekommt
   ein Zehntklässler auf einem frischen Gerät zunächst Grundlagen — das ist
   nach der ersten bearbeiteten Einheit von selbst wieder vorbei. */
function reiheAusStand() {
  const reihen = SP.plan.reihen || [];
  if (!reihen.length) return null;
  let weiteste = null;
  try {
    const praefix = 'chemie710.stand.' + Stand.kennung() + '.';
    for (let i = 0; i < localStorage.length; i++) {
      const schluessel = localStorage.key(i);
      if (!schluessel || !schluessel.startsWith(praefix)) continue;
      const r = reiheZuEinheit(schluessel.slice(praefix.length));
      if (r && (!weiteste || r.nummer > weiteste.nummer)) weiteste = r;
    }
  } catch { /* gesperrter Speicher */ }
  return weiteste || reihen[0];
}

/* Die Reihen, aus denen wiederholt wird, und die Kategorien, die sie
   liefern. In der ersten Reihe gibt es nichts Früheres — dann wird
   innerhalb der eigenen Reihe wiederholt, sonst stünde das Warm-up leer. */
function quellenBestimmen() {
  const reihen = SP.plan.reihen || [];
  SP.aktuelleReihe = reiheZuEinheit(SP.einheit) || reiheAusStand();

  if (!reihen.length || !SP.aktuelleReihe) {
    SP.quellenReihen = reihen;
    return null;                                    // keine Einschränkung
  }

  const nummer = SP.aktuelleReihe.nummer;
  const frueher = reihen.filter(r => r.nummer < nummer);
  SP.quellenReihen = frueher.length ? frueher : [SP.aktuelleReihe];

  const erlaubt = new Set();
  SP.kategorieReihe = {};
  for (const r of SP.quellenReihen) {
    for (const k of r.grundwissen || []) {
      erlaubt.add(k);
      /* Zugeordnet wird die früheste Reihe, in der die Kategorie vorkommt —
         dort wurde sie erarbeitet. Für die Zeile „Aus: …" über der Aufgabe. */
      if (!SP.kategorieReihe[k]) SP.kategorieReihe[k] = r;
    }
  }
  return erlaubt;
}

/* ============================================================
   6 · Auswahl: Was kommt heute dran?
   ============================================================ */

function boostKategorien() {
  const boost = new Set();
  /* a) Verzahnung: Was braucht die heutige Einheit? */
  if (SP.einheit && SP.plan.verzahnung[SP.einheit]) {
    SP.plan.verzahnung[SP.einheit].forEach(k => boost.add(k));
  }
  /* b) Fehlerprofil: Was ging zuletzt schief? */
  const gruende = new Map();
  for (const f of fehlerProfil(14)) {
    const kat = SP.plan.fehlerprofil[f.id];
    if (kat) {
      boost.add(kat);
      gruende.set(kat, (gruende.get(kat) || 0) + f.anzahl);
    }
  }
  return { boost, gruende };
}

function waehle(anzahl = 5) {
  const jetzt = Date.now();
  const k = kartei();
  const { boost } = boostKategorien();
  const erlaubt = quellenBestimmen();

  const kandidaten = [];
  for (const kat of Object.values(SP.kategorien)) {
    /* Was noch nicht dran war, kommt nicht dran. Diese eine Zeile ist der
       ganze Unterschied zwischen „wiederholen" und „raten". */
    if (erlaubt && !erlaubt.has(kat.kategorie)) continue;
    for (const g of kat.generatoren) {
      if (g.level !== SP.level) continue;
      const e = k[g.id];
      let punkte = Math.random() * 2;                       // Losentscheid bei Gleichstand
      if (!e) punkte += 20;                                 // noch nie dran
      else {
        const ueberfaellig = (jetzt - e.faellig) / TAG_MS;
        if (ueberfaellig >= 0) punkte += Math.min(ueberfaellig, 30);
        else punkte -= 50;                                  // noch nicht fällig
        punkte += (6 - e.box) * 3;                          // niedrige Box = wackelig
        punkte += Math.min(e.falsch, 5) * 4;                // wiederholt falsch
      }
      if (boost.has(g.kategorie)) punkte += 100;
      kandidaten.push({ gen: g, punkte });
    }
  }
  kandidaten.sort((a, b) => b.punkte - a.punkte);

  /* Höchstens 3 aus derselben Kategorie — sonst wird das Warm-up einseitig */
  const gewaehlt = [];
  const proKat = {};
  for (const c of kandidaten) {
    if (gewaehlt.length >= anzahl) break;
    const kat = c.gen.kategorie;
    if ((proKat[kat] || 0) >= 3) continue;
    proKat[kat] = (proKat[kat] || 0) + 1;
    gewaehlt.push(c.gen);
  }

  /* Mindestens eine Aufgabe aus einer weiter zurückliegenden Reihe, wenn es
     eine gibt. Ohne diese Regel gewinnt fast immer die zuletzt behandelte
     Reihe — sie ist am häufigsten verzahnt und steht in der Kartei am
     weitesten unten. Genau das Ältere verblasst aber zuerst. */
  if (SP.quellenReihen.length > 1 && gewaehlt.length >= 2) {
    const aeltere = SP.quellenReihen.slice(0, -1);
    const alteKats = new Set(aeltere.flatMap(r => r.grundwissen || []));
    const hatAltes = gewaehlt.some(g => alteKats.has(g.kategorie));
    if (!hatAltes) {
      const ersatz = kandidaten.find(c => alteKats.has(c.gen.kategorie)
        && !gewaehlt.includes(c.gen));
      if (ersatz) gewaehlt[gewaehlt.length - 1] = ersatz.gen;
    }
  }

  /* Falls die Kategorie-Grenze zu streng war: auffüllen */
  for (const c of kandidaten) {
    if (gewaehlt.length >= anzahl) break;
    if (!gewaehlt.includes(c.gen)) gewaehlt.push(c.gen);
  }
  return gewaehlt;
}

/* ============================================================
   7 · Ablauf
   ============================================================ */

async function starte() {
  const p = new URLSearchParams(location.search);
  SP.einheit = p.get('u');
  SP.level = Speicher.lies('chemie710.pfad', 'B');
  SP.beginn = Date.now();

  try {
    SP.plan = await (await fetch('spiral/plan.json', { cache: 'no-cache' })).json();
    for (const code of SP.plan.kategorien) {
      const datei = 'spiral/' + code.toLowerCase() + '.json';
      const antwort = await fetch(datei, { cache: 'no-cache' });
      if (!antwort.ok) continue;                 // Kategorie noch nicht gebaut
      const d = await antwort.json();
      /* Die Dateien sind deutsch beschriftet (kategorie/generatoren). Bis
         V30 las diese Stelle die englischen Namen und warf bei jedem Start
         eine Ausnahme — das Warm-up lud nie. */
      const liste = d.generatoren || d.generators || [];
      const kat = d.kategorie || d.category;
      liste.forEach(g => { g.kategorie = kat; });
      SP.kategorien[kat] = { kategorie: kat, titel: d.titel || d.title || kat, generatoren: liste };
    }
  } catch (e) {
    $$('#buehne').innerHTML = `<div class="fehler">
      <strong>Das Warm-up konnte nicht geladen werden.</strong>
      <p>${e.message}. Starte im Projektordner <code>python -m http.server 8000</code>
      und öffne die Seite über <code>http://localhost:8000</code>.</p></div>`;
    return;
  }

  document.documentElement.style.setProperty('--pfad', `var(--${SP.level.toLowerCase()})`);
  document.documentElement.style.setProperty('--pfad-bg', `var(--${SP.level.toLowerCase()}-bg)`);

  /* Pflicht oder Übung? Das entscheidet der Server, nicht das Gerät. Kommt
     die Antwort nicht (kein Netz, keine Anmeldung), bleibt es beim Üben —
     der Rückfall ist der offene Zustand, nicht der strenge. */
  if (window.Lernmodus) {
    try {
      const zustand = await Lernmodus.starten(SP.einheit ? String(SP.einheit).toLowerCase() : null);
      SP.pflicht = (zustand?.modus === 'bewertung');
    } catch (e) {
      console.warn('[Chemie710 Warm-up] Lernmodus nicht abrufbar:', e.message);
    }
  }

  Tracker.setContext({ page: 'warmup', unit: 'WARMUP', path: SP.level, progress: 0 });
  /* Standard sind fünf Aufgaben zu Stundenbeginn. Am Stundenende ruft die
     Einheitenseite dieselbe Auswahl mit ?n=3 auf — verteiltes Wiederholen
     wirkt besser als geballtes, und drei Aufgaben passen ans Ende.
     Im Pflichtlauf sind es immer fünf: Eine Bewertungsgrundlage, deren
     Umfang von einem Parameter in der Adresszeile abhängt, wäre keine. */
  const gewuenscht = SP.pflicht
    ? 5
    : Math.min(8, Math.max(1, parseInt(p.get('n'), 10) || 5));
  SP.reihe = waehle(gewuenscht).map(g => baue(g, SP.level));
  if (!SP.reihe.length) {
    $$('#buehne').innerHTML = `<div class="karte"><p class="frage">Für Pfad ${SP.level}
      sind aus den zurückliegenden Reihen noch keine Wiederholungsaufgaben
      hinterlegt.</p></div>`;
    return;
  }
  kopfBeschriften();
  zeige();
}

/* Der Kopf sagt, worum es geht: welche Reihen wiederholt werden und ob der
   Lauf zählt. Beides gehört vor die erste Aufgabe, nicht dahinter. */
function kopfBeschriften() {
  const code = $$('.einheit-code');
  const titel = $$('.einheit-titel');
  if (code) {
    code.textContent = SP.pflicht
      ? 'WARM-UP · PFLICHT IM UNTERRICHT'
      : 'WARM-UP · ALTES WISSEN';
  }
  if (titel) {
    titel.textContent = SP.pflicht
      ? `${SP.reihe.length} Aufgaben — sie zählen`
      : `${SP.reihe.length} zum Aufwärmen`;
  }

  const buehne = $$('#buehne');
  if (!buehne || !SP.quellenReihen.length) return;
  const kasten = document.createElement('p');
  kasten.className = 'warmup-herkunft';
  const namen = SP.quellenReihen.map(r => r.titel);
  const liste = namen.length > 3
    ? `${namen.slice(0, 2).join(', ')} und ${namen.length - 2} weiteren Reihen`
    : namen.join(' · ');
  kasten.textContent = SP.quellenReihen[0] === SP.aktuelleReihe
    ? `Wiederholt wird aus dieser Reihe: ${liste}.`
    : `Wiederholt wird aus: ${liste}.`;
  buehne.before(kasten);
}

function zeige() {
  const b = $$('#buehne');
  b.innerHTML = '';
  const anteil = Math.round(SP.index / SP.reihe.length * 100);
  $$('#fuell').style.width = anteil + '%';
  $$('#zaehler').textContent = `${SP.index} von ${SP.reihe.length}`;
  $$('.streifen').setAttribute('aria-valuenow', anteil);

  if (SP.index >= SP.reihe.length) { fertig(); return; }

  const a = SP.reihe[SP.index];
  SP.aufgabe = a;
  SP.versuche = 0;
  SP.start = Date.now();
  Tracker.setContext({ unit: 'WARMUP', path: SP.level, task: a.id, progress: Math.round(SP.index / (SP.reihe.length || 1) * 100) });
  Tracker.track('task_view', {
    category: a.kategorie, skill: a.skill, index: SP.index + 1, total: SP.reihe.length,
    source: 'warmup', pflicht: SP.pflicht, reihe: SP.aktuelleReihe?.code || null
  });

  const zeile = document.createElement('div');
  zeile.className = 'stufe-zeile';
  /* Woher stammt die Aufgabe? Ein Kind, das weiß, dass die Frage aus der
     Reihe „Salze" von vor drei Monaten kommt, wertet ein Danebenliegen
     anders — und schlägt notfalls dort nach. */
  const herkunft = SP.kategorieReihe[a.kategorie];
  zeile.innerHTML = `<span class="stufe-pill">${a.kategorie}</span><span>${a.skill}</span>`
    + (herkunft ? `<span class="warmup-reihe">aus: ${herkunft.titel} · Klasse ${herkunft.klasse}</span>` : '');
  b.append(zeile);

  const karte = document.createElement('div');
  karte.className = 'karte';
  karte.innerHTML = `
    <p class="frage">${a.prompt}</p>
    <div class="eingabe-zeile">
      <input class="zahl-feld" type="text" inputmode="decimal" enterkeyhint="done"
             autocomplete="off" aria-label="Ergebnis eingeben">
      ${a.unit_label ? `<span class="einheit-label">${a.unit_label}</span>` : ''}
    </div>
    <div class="aktionen">
      <button class="btn btn-haupt" id="pruefen">Prüfen</button>
      ${a.hint ? '<button class="btn btn-neben" id="tipp">Tipp</button>' : ''}
    </div>
    <div id="rueck"></div>`;
  b.append(karte);

  $$('#pruefen').addEventListener('click', pruefe);
  $$('.zahl-feld').addEventListener('keydown', e => { if (e.key === 'Enter') pruefe(); });
  if ($$('#tipp')) $$('#tipp').addEventListener('click', () => {
    melde('tipp', `<b>Tipp:</b> ${a.hint}`);
    $$('#tipp').disabled = true;
  });
  $$('.zahl-feld').focus({ preventScroll: true });
}

function melde(art, html) {
  const d = document.createElement('div');
  d.className = 'rueck ' + art;
  d.innerHTML = html;
  $$('#rueck').append(d);
}

function pruefe() {
  const a = SP.aufgabe;
  const roh = $$('.zahl-feld').value.trim();
  if (roh === '') return;
  SP.versuche++;

  const k = lesarten(roh).filter(z => !Number.isNaN(z));
  if (!k.length) { melde('nope', 'Das ist keine Zahl. Schreib nur das Ergebnis.'); return; }

  const richtig = k.some(z => Math.abs(z - a.answer) <= a.tolerance);
  let mis = null;
  if (!richtig) {
    for (const z of k) {
      const m = a.misconceptions.find(m => Math.abs(z - m.value) <= a.tolerance);
      if (m) { mis = m; break; }
    }
  }
  if (mis) merkeFehler(mis.id);

  track({
    unit: 'WARMUP', task: a.genId, path: SP.level, step: 0,
    correct: richtig, misconception: mis ? mis.id : null,
    hints_used: $$('#tipp') && $$('#tipp').disabled ? 1 : 0,
    attempts: SP.versuche, duration_ms: Date.now() - SP.start,
    pflicht: SP.pflicht
  });

  if (richtig) {
    if (SP.versuche === 1) SP.richtig++;
    notiere(a.genId, SP.versuche === 1);
    melde('ok', '<b>Richtig.</b>' + (a.solution ? `<div class="rechenweg">${a.solution}</div>` : ''));
    weiterKnopf();
    return;
  }

  if (mis) melde('nope', `<b>Fast.</b> ${mis.feedback}`);
  else if (SP.versuche === 1) melde('nope', 'Noch nicht. Versuch es nochmal.');

  if (SP.versuche >= 2) {
    notiere(a.genId, false);
    const wert = a.unit_label === '€' ? fmtGeld(a.answer) : fmt(a.answer);
    melde('tipp', `<b>Die Lösung:</b> ${wert} ${a.unit_label}` +
      (a.solution ? `<div class="rechenweg">${a.solution}</div>` : ''));
    weiterKnopf();
  }
}

function weiterKnopf() {
  const alt = $$('#pruefen');
  const neu = alt.cloneNode(false);
  neu.className = 'btn btn-haupt';
  neu.id = 'pruefen';
  neu.textContent = 'Weiter';
  alt.replaceWith(neu);
  neu.addEventListener('click', () => { SP.index++; zeige(); });
  if ($$('#tipp')) $$('#tipp').disabled = true;
  $$('.zahl-feld').disabled = true;
  neu.focus();
}

/* ============================================================
   8 · Abschluss und Meldung
   ============================================================ */

/* Gemeldet wird genau einmal je Lauf. Ob das Ergebnis für die Note zählt,
   entscheidet die Datenbank — nicht dieses Gerät. Hier steht nur, was
   passiert ist. */
async function ergebnisMelden() {
  if (SP.gemeldet) return null;
  SP.gemeldet = true;
  const kategorien = [...new Set(SP.reihe.map(a => a.kategorie))];
  const nutzlast = {
    p_aufgaben: SP.reihe.length,
    p_richtig: SP.richtig,
    p_reihe: SP.aktuelleReihe?.code || null,
    p_unit: SP.einheit || null,
    p_pfad: SP.level,
    p_dauer_s: Math.round((Date.now() - SP.beginn) / 1000),
    p_kategorien: kategorien
  };
  Tracker.track('warmup_abgeschlossen', {
    aufgaben: SP.reihe.length, richtig: SP.richtig,
    pflicht: SP.pflicht, reihe: nutzlast.p_reihe, kategorien
  });
  try {
    return await (window.Lernmodus?.warmupMelden?.(nutzlast) ?? null);
  } catch (e) {
    console.warn('[Chemie710 Warm-up] Ergebnis nicht gemeldet:', e.message);
    return null;
  }
}

function fertig() {
  const b = $$('#buehne');
  const karte = document.createElement('div');
  karte.className = 'karte';
  const ziel = SP.einheit ? `einheit.html?u=${SP.einheit}` : 'index.html';

  karte.innerHTML = `
    <p class="frage">Aufgewärmt. <b>${SP.richtig} von ${SP.reihe.length}</b> auf Anhieb richtig.</p>
    <p>Was heute schiefging, kommt morgen wieder. Was saß, erst in ein paar Wochen.</p>
    <p class="warmup-meldung" id="warmup-meldung">Das Ergebnis wird gesichert …</p>
    <div class="aktionen">
      <a class="btn btn-haupt" href="${ziel}" style="text-decoration:none">
        ${SP.einheit ? 'Weiter zur Stunde' : 'Zur Übersicht'}</a>
      ${SP.pflicht ? '' : '<button class="btn btn-neben" id="nochmal">Noch fünf</button>'}
    </div>`;
  b.append(karte);

  if ($$('#nochmal')) $$('#nochmal').addEventListener('click', () => {
    SP.reihe = waehle(5).map(g => baue(g, SP.level));
    SP.index = 0; SP.richtig = 0; SP.beginn = Date.now(); SP.gemeldet = false;
    zeige();
  });

  const meldung = $$('#warmup-meldung');
  ergebnisMelden().then(antwort => {
    if (!meldung) return;
    if (antwort && antwort.gewertet) {
      meldung.className = 'warmup-meldung warmup-gewertet';
      meldung.textContent = 'Dieser Lauf ist der Pflichtlauf des Tages und geht in die '
        + 'Bewertung ein. Weitere Läufe heute zählen als Übung.';
    } else if (SP.pflicht) {
      meldung.className = 'warmup-meldung';
      meldung.textContent = 'Der Pflichtlauf für heute liegt bereits vor — dieser Lauf '
        + 'zählt als Übung und verändert die Bewertung nicht.';
    } else if (antwort) {
      meldung.className = 'warmup-meldung';
      meldung.textContent = 'Übungslauf gesichert. Außerhalb des Unterrichts zählt '
        + 'nichts davon für die Note.';
    } else {
      meldung.className = 'warmup-meldung';
      meldung.textContent = 'Das Ergebnis konnte gerade nicht gesichert werden. '
        + 'Geübt hast du trotzdem.';
    }
  });
}

/* Auch dann starten, wenn dieses Skript erst nach DOMContentLoaded
   nachgeladen wurde — der Prüfungstrainer lädt engine.js dynamisch. */
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', starte);
else starte();

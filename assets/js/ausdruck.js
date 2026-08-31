/* ============================================================
   ausdruck.js · Aufgabengeneratoren: auswerten, formatieren, würfeln

   Dieselbe Datei läuft im Browser (Warm-up) UND in Node
   (werkzeuge/uebungsblaetter.js). Das ist Absicht: Die Lösungen auf den
   gedruckten Übungsblättern werden damit von genau demselben Code
   berechnet, der sie in der Anwendung prüft. Zwei Implementierungen
   wären zwei Gelegenheiten, sich zu verrechnen — und ein gedrucktes
   Blatt lässt sich nicht nachträglich korrigieren.

   Lag bis V30 als Block 1 bis 3 in spiral.js.
   ============================================================ */

/* ============================================================
   1 · Ausdrucksauswertung ohne eval
   Grammatik: vergleich → ausdruck → term → faktor → primär
   Erlaubt: + - * / ( ) Zahlen, Variablennamen, < > <= >= == !=
   ============================================================ */

function tokenisiere(s) {
  /* Zahlen sind gültige Ausdrücke. Wer "value": 4 statt "value": "4"
     schreibt, soll keine Fehlermeldung über ein zu früh endendes
     Token bekommen — die sagt nichts über den eigentlichen Fehler. */
  s = String(s);
  const t = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      t.push({ art: 'zahl', wert: parseFloat(s.slice(i, j)) });
      i = j; continue;
    }
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < s.length && /[A-Za-z0-9_]/.test(s[j])) j++;
      t.push({ art: 'name', wert: s.slice(i, j) });
      i = j; continue;
    }
    const zwei = s.slice(i, i + 2);
    if (['<=', '>=', '==', '!='].includes(zwei)) { t.push({ art: 'op', wert: zwei }); i += 2; continue; }
    if ('+-*/()<>,'.includes(c)) { t.push({ art: 'op', wert: c }); i++; continue; }
    throw new Error('Unerwartetes Zeichen: ' + c);
  }
  return t;
}

/* Eine kleine, feste Funktionsliste. Sie ist der Grund, warum die
   Bedingungen der Übungsblätter überhaupt formulierbar sind: „Das Ergebnis
   muss bei zwei Nachkommastellen aufgehen" heißt ganz(x * 100). Ohne diese
   Prüfung landen 33,333… auf einem gedruckten Blatt, und das Kind kann
   seine Rechnung nicht mit der Lösung vergleichen.

   Bewusst kein Zugriff auf Math von außen: Nur diese Namen sind erlaubt,
   und jeder rechnet mit Zahlen. */
const FUNKTIONEN = {
  ganz: x => (Math.abs(x - Math.round(x)) < 1e-9 ? 1 : 0),
  runde: (x, k = 0) => Math.round(x * 10 ** k) / 10 ** k,
  betrag: x => Math.abs(x),
  wurzel: x => Math.sqrt(x),
  min: (...a) => Math.min(...a),
  max: (...a) => Math.max(...a)
};

function werteAus(ausdruck, vars) {
  const t = tokenisiere(ausdruck);
  let i = 0;
  const schau = () => t[i];
  const nimm = () => t[i++];

  function primaer() {
    const k = nimm();
    if (!k) throw new Error('Ausdruck endet zu früh');
    if (k.art === 'zahl') return k.wert;
    if (k.art === 'name') {
      /* Funktionsaufruf: Name direkt gefolgt von einer Klammer. */
      if (schau() && schau().wert === '(' && FUNKTIONEN[k.wert]) {
        nimm();
        const args = [];
        if (schau() && schau().wert !== ')') {
          args.push(vergleich());
          while (schau() && schau().wert === ',') { nimm(); args.push(vergleich()); }
        }
        const zu = nimm();
        if (!zu || zu.wert !== ')') throw new Error('Klammer nach ' + k.wert + ' nicht geschlossen');
        return FUNKTIONEN[k.wert](...args);
      }
      if (!(k.wert in vars)) throw new Error('Unbekannte Variable: ' + k.wert);
      return vars[k.wert];
    }
    if (k.wert === '(') {
      const v = vergleich();
      const zu = nimm();
      if (!zu || zu.wert !== ')') throw new Error('Klammer nicht geschlossen');
      return v;
    }
    throw new Error('Unerwartet: ' + k.wert);
  }
  function faktor() {
    if (schau() && schau().wert === '-') { nimm(); return -faktor(); }
    if (schau() && schau().wert === '+') { nimm(); return faktor(); }
    return primaer();
  }
  function term() {
    let v = faktor();
    while (schau() && (schau().wert === '*' || schau().wert === '/')) {
      const op = nimm().wert;
      const r = faktor();
      v = op === '*' ? v * r : v / r;
    }
    return v;
  }
  function ausdr() {
    let v = term();
    while (schau() && (schau().wert === '+' || schau().wert === '-')) {
      const op = nimm().wert;
      const r = term();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  }
  function vergleich() {
    const l = ausdr();
    const k = schau();
    if (k && ['<', '>', '<=', '>=', '==', '!='].includes(k.wert)) {
      nimm();
      const r = ausdr();
      switch (k.wert) {
        case '<':  return l <  r ? 1 : 0;
        case '>':  return l >  r ? 1 : 0;
        case '<=': return l <= r ? 1 : 0;
        case '>=': return l >= r ? 1 : 0;
        case '==': return Math.abs(l - r) < 1e-9 ? 1 : 0;
        case '!=': return Math.abs(l - r) >= 1e-9 ? 1 : 0;
      }
    }
    return l;
  }

  const v = vergleich();
  if (i < t.length) throw new Error('Rest im Ausdruck: ' + t[i].wert);
  return v;
}

/* ============================================================
   2 · Zahlen deutsch formatieren
   ============================================================ */

function fmt(x) {
  if (typeof x !== 'number' || !isFinite(x)) return String(x);
  const g = Math.round(x * 1e6) / 1e6;
  let s = Number.isInteger(g) ? String(g) : String(g).replace('.', ',');
  const [ganz, rest] = s.split(',');
  const mitTrenner = ganz.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  /* Typografisches Minus (−), nicht der Bindestrich (-). */
  return (rest ? mitTrenner + ',' + rest : mitTrenner).replace('-', '\u2212');
}

/* Vorzeichenbehaftetes Anhängen, etwa für Oxidationszahlen. */
function fmtVorzeichen(x) {
  return (x < 0 ? '\u2212 ' : '+ ') + fmt(Math.abs(x));
}

/* Platzhalter dürfen rechnen: {m} genauso wie {m/M}.
   Mit :± wird ein Vorzeichen fachgerecht gesetzt. */
/* {name$} setzt dagegen einen TEXT ein, keinen Rechenwert. Chemie braucht
   das: „Welche Ordnungszahl hat Natrium (Na)?“ ist eine Zahlenaufgabe mit
   einem Stoffnamen darin. Ohne Texte müsste jeder Generator entweder auf
   den Stoff verzichten — oder es gäbe je Stoff einen eigenen Generator, und
   dann stünde in der Leitner-Kartei „kann Natrium“ statt „kann die
   Ordnungszahl ablesen“. Getrackt wird die Generator-ID; also muss die
   Variation in den Generator hinein, nicht in seinen Namen. */
function fuelle(vorlage, vars, texte) {
  return String(vorlage)
    .replace(/\{([A-Za-z_][A-Za-z0-9_]*)\$\}/g, (ganz, name) =>
      (texte && name in texte) ? texte[name] : ganz)
    .replace(/\{([^{}:$]+)(?::(\u00b1))?\}/g, (ganz, ausdruck, flagge) => {
    try {
      const w = werteAus(ausdruck, vars);
      if (flagge === '\u00b1') return fmtVorzeichen(w);
      return fmt(w);
    } catch { return ganz; }
  });
}

/* ============================================================
   3 · Aus einem Generator eine konkrete Aufgabe würfeln
   ============================================================ */

function zufallVar(def) {
  if (def.aus) return def.aus[Math.floor(Math.random() * def.aus.length)];
  const schritt = def.schritt || 1;
  const n = Math.floor((def.bis - def.von) / schritt) + 1;
  return def.von + Math.floor(Math.random() * n) * schritt;
}

/* Eine Zeile aus gen.tabelle ziehen. Zahlenspalten werden zu Variablen,
   Textspalten zu Platzhaltern. So bleibt ein Generator EIN Generator,
   auch wenn er zwanzig Stoffe abfragt. */
function zufallZeile(tabelle) {
  return tabelle[Math.floor(Math.random() * tabelle.length)];
}

/* ---------- Niveaustufe auf einen Generator anwenden ----------
   Ein Generator beschreibt die Aufgabe, "stufen" beschreibt die Abweichung
   für einen Lernweg: meist engere oder unbequemere Zahlenbereiche, eine
   kürzere Stoffliste oder eine andere Rundung. Ohne Eintrag bleibt der
   Generator, wie er ist — Stufe B ist deshalb überall der geprüfte Bestand.

   Zusammengeführt wird flach, "vars" und "berechnet" aber je Eintrag: Wer
   nur die Stoffmenge ändern will, soll die molare Masse nicht noch einmal
   hinschreiben müssen. "tabelle" wird dagegen ganz ersetzt — eine Stoffliste
   für den Basisweg ist eine andere Liste, keine ergänzte. */
function fuerStufe(gen, stufe) {
  const abw = gen && gen.stufen && stufe ? gen.stufen[stufe] : null;
  if (!abw) return gen;
  return {
    ...gen,
    ...abw,
    vars: { ...(gen.vars || {}), ...(abw.vars || {}) },
    berechnet: { ...(gen.berechnet || {}), ...(abw.berechnet || {}) },
    stufen: undefined
  };
}

function baue(gen, stufe) {
  gen = fuerStufe(gen, stufe);
  let vars = null, texte = null;
  for (let versuch = 0; versuch < 200; versuch++) {
    const v = {};
    const tx = {};
    if (gen.tabelle && gen.tabelle.length) {
      const zeile = zufallZeile(gen.tabelle);
      for (const [name, wert] of Object.entries(zeile)) {
        if (typeof wert === 'number') v[name] = wert; else tx[name] = String(wert);
      }
    }
    for (const [name, def] of Object.entries(gen.vars || {})) v[name] = zufallVar(def);
    for (const [name, ausdruck] of Object.entries(gen.berechnet || {})) {
      v[name] = werteAus(ausdruck, v);
    }
    if (gen.bedingung && !werteAus(gen.bedingung, v)) continue;
    vars = v; texte = tx; break;
  }
  if (!vars) throw new Error(`Generator ${gen.id}: Bedingung nie erfüllt`);

  const roh = werteAus(gen.answer, vars);
  const stellen = gen.round ?? 2;
  const antwort = Math.round(roh * 10 ** stellen) / 10 ** stellen;
  vars.ergebnis = antwort;

  const mis = (gen.misconceptions || []).map(m => ({
    id: m.id,
    value: Math.round(werteAus(m.value, vars) * 10 ** stellen) / 10 ** stellen,
    feedback: fuelle(m.feedback, vars, texte)
  })).filter(m => Math.abs(m.value - antwort) > (gen.tolerance ?? 0.005));

  return {
    genId: gen.id,
    kategorie: gen.kategorie,
    skill: gen.skill,
    /* Die gewürfelten Werte bleiben am Ergebnis hängen. Der Prüfer der
       Übungsblätter rechnet damit nach, ob die gedruckte Lösung bei der
       angegebenen Rundung überhaupt exakt ist. Getrackt wird das Feld nie —
       die Anwendung sendet ausdrücklich nur Kategorie und Fähigkeit. */
    vars: { ...vars },
    prompt: fuelle(gen.template, vars, texte),
    answer: antwort,
    unit_label: gen.unit_label || '',
    tolerance: gen.tolerance ?? 0.005,
    hint: gen.hint ? fuelle(gen.hint, vars, texte) : null,
    solution: gen.solution ? fuelle(gen.solution, vars, texte) : null,
    misconceptions: mis
  };
}

/* Im Browser hängen die Funktionen am globalen Objekt (spiral.js nutzt sie
   direkt), in Node werden sie exportiert. Kein Build-Step, kein Modulformat,
   das der eine oder andere nicht versteht. */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    tokenisiere, werteAus, fmt, fmtVorzeichen, fuelle, zufallVar, zufallZeile, baue, fuerStufe
  };
}

/* ============================================================
   zeichnen.js · Aufgabenbilder Chemie

   Alle Bilder sind Inline-SVG. Warum nicht PhET, Molview oder ein
   Applet je Aufgabe? Dagegen sprechen drei Gründe:

   1. Fremde IDs und Adressen verschwinden. Was heute lädt, ist in zwei
      Schuljahren ein leerer Kasten.
   2. Der Service Worker cached fremde Hosts nicht. Fällt das WLAN aus,
      wäre die halbe Einheit weg — genau in der Stunde, in der du sie
      brauchst.
   3. Ein Applet je Aufgabe lädt auf 28 Schulgeräten spürbar.

   Die SVGs laden sofort, funktionieren offline, drucken in Graustufen
   und folgen dem dunklen Modus, weil sie die Farbtoken aus app.css
   verwenden statt eigener Hexwerte.

   Bildtypen
     teilchen    Teilchenmodell: Aggregatzustand, Element/Verbindung/Gemisch
     atom        Schalenmodell nach Bohr, mit Kernangabe
     pse         Ausschnitt des Periodensystems, Felder hervorhebbar
     lewis       Lewis-Formel kleiner Moleküle (fester Satz)
     struktur    Strukturformel unverzweigter organischer Moleküle
     energie     Energiediagramm exotherm/endotherm, mit Katalysator
     phskala     pH-Skala mit Marke
     apparatur   schematischer Versuchsaufbau
     anteil      Anteilsbalken (Luftzusammensetzung, Massenanteile)
     diagramm    Messwertdiagramm mit Achsen (Siedekurven, Löslichkeit)
     animation   wird an animationen.js durchgereicht
   ============================================================ */

let _uid = 0;

/* Farben. Tokens aus app.css, damit dunkler Modus und Druck stimmen.
   Die Elementfarben sind bewusst feste Werte: Sauerstoff ist im
   Schulbuch rot, und das soll er im dunklen Modus auch bleiben.
   Jede Kugel bekommt zusätzlich einen Rand, damit Weiß auf hellem und
   Dunkelgrau auf dunklem Grund nicht verschwindet. */
const INK = 'var(--ink, #15233A)';
const SOFT = 'var(--ink-soft, #4A5A70)';
const FAINT = 'var(--ink-faint, #687789)';
const LINIE = 'var(--linie-kraeftig, #C8D2D8)';
const FLAECHE = 'var(--flaeche, #EDF1F3)';
const PAPIER = 'var(--paper-hi, #FFFFFF)';

const ELEMENTFARBE = {
  H: '#F2F4F7', C: '#3C4650', O: '#C43B32', N: '#2F6BB5', S: '#D9A227',
  Cl: '#4E9A51', Na: '#8E6BC4', K: '#7C5AB8', Ca: '#5E8C7B', Mg: '#6FA37F',
  Fe: '#A2643C', Cu: '#B5732F', Zn: '#7E8B99', Al: '#93A0AC', Ag: '#9AA6B2',
  He: '#7FB6C9', Ar: '#7FB6C9', Ne: '#7FB6C9', Br: '#8E4A2E', I: '#6B3FA0',
  P: '#D2762A', Pb: '#6B7480'
};
const TEXTAUF = { H: '#15233A', He: '#15233A', Ne: '#15233A', Ar: '#15233A' };

function elFarbe(el) { return ELEMENTFARBE[el] || '#7E8B99'; }
function elText(el) { return TEXTAUF[el] || '#FFFFFF'; }

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function svgRahmen(w, h, alt, body, maxBreite) {
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" style="max-width:${maxBreite || 320}px"
    role="img" aria-label="${esc(alt)}" preserveAspectRatio="xMidYMid meet">${body}</svg>`;
}

function txt(x, y, s, opt) {
  if (s === undefined || s === null || s === '') return '';
  const o = opt || {};
  return `<text x="${x}" y="${y}" text-anchor="${o.anchor || 'middle'}"
    font-family="${o.mono ? 'JetBrains Mono, ui-monospace, monospace' : 'Atkinson Hyperlegible, system-ui, sans-serif'}"
    font-size="${o.size || 13}" font-weight="${o.fett ? 700 : 400}"
    fill="${o.farbe || INK}">${o.roh ? s : esc(s)}</text>`;
}

/* Tiefgestellte Zahlen in Formeln: H2O → H₂O. Die Engine bekommt die
   Formeln als schlichten Text; hier werden sie lesbar gesetzt. */
const TIEF = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };
const HOCH = { 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹', '+': '⁺', '-': '⁻' };

function formelSchoen(f) {
  return String(f || '')
    /* Ladung am Ende: Na+ · SO4 2- */
    .replace(/(\d*)([+-])(?=\s|$|\))/g, (m, z, v) => (z ? z.split('').map(c => HOCH[c]).join('') : '') + HOCH[v])
    /* Indizes nach Elementsymbol oder Klammer */
    .replace(/([A-Za-z)\]])(\d+)/g, (m, a, z) => a + z.split('').map(c => TIEF[c]).join(''));
}

/* ============================================================
   1 · Teilchenmodell
   "visual": { "type": "teilchen", "zustand": "fest",
               "art": "verbindung", "alt": "…" }
   zustand: fest | fluessig | gas          art: element | verbindung |
   gemisch | legierung | ionen             teilchen: eigene Liste
   ============================================================ */
function teilchenSvg(v) {
  const W = 300, H = 190;
  const kasten = { x: 20, y: 24, w: 260, h: 140 };
  const id = ++_uid;
  let body = `<rect x="${kasten.x}" y="${kasten.y}" width="${kasten.w}" height="${kasten.h}"
    rx="8" fill="${FLAECHE}" stroke="${LINIE}" stroke-width="1.5"/>`;

  /* Reproduzierbare Streuung: gleiches Bild bei gleichem Aufruf.
     Eine echte Zufallslage würde bei jedem Neuzeichnen springen und
     wäre auf Papier eine andere als am Gerät. */
  let saat = (v.zustand || '') .length * 31 + (v.art || '').length * 7 + 13;
  const rnd = () => { saat = (saat * 1103515245 + 12345) % 2147483648; return saat / 2147483648; };

  const zustand = v.zustand || 'gas';
  const art = v.art || 'element';
  const r = 11;

  /* Welche Teilchen? */
  let sorten;
  if (v.teilchen) sorten = v.teilchen;
  else if (art === 'verbindung') sorten = [{ el: 'O', partner: ['H', 'H'] }];
  else if (art === 'gemisch') sorten = [{ el: 'N' }, { el: 'O' }];
  else if (art === 'legierung') sorten = [{ el: 'Cu' }, { el: 'Zn' }];
  else if (art === 'ionen') sorten = [{ el: 'Na', ladung: '+' }, { el: 'Cl', ladung: '−' }];
  else sorten = [{ el: 'Fe' }];

  const kugel = (x, y, s, rr) => {
    const rad = rr || r;
    let g = `<circle cx="${x}" cy="${y}" r="${rad}" fill="${elFarbe(s.el)}"
      stroke="${INK}" stroke-width="1.2" opacity="0.95"/>`;
    g += txt(x, y + 4, s.el + (s.ladung || ''), { size: rad > 9 ? 11 : 9, farbe: elText(s.el), fett: true });
    return g;
  };

  /* Ein Molekülchen: Zentralteilchen mit angehängten Partnern. */
  const molekuel = (x, y, s) => {
    let g = '';
    (s.partner || []).forEach((p, i) => {
      const w = (i === 0 ? -0.75 : 0.75) * Math.PI * 0.55 - Math.PI / 2;
      const px = x + Math.cos(w) * 15, py = y + Math.sin(w) * 15;
      g += `<line x1="${x}" y1="${y}" x2="${px}" y2="${py}" stroke="${INK}" stroke-width="2.4"/>`;
      g += kugel(px, py, { el: p }, 7.5);
    });
    return kugel(x, y, s) + g;
  };

  const zeichne = (x, y, s) => (s.partner ? molekuel(x, y, s) : kugel(x, y, s));

  if (zustand === 'fest') {
    /* Gitter: feste Plätze, dicht, geordnet. Genau das ist die Aussage. */
    const sp = 5, ze = 4, dx = kasten.w / (sp + 1), dy = kasten.h / (ze + 1);
    for (let j = 1; j <= ze; j++) for (let i = 1; i <= sp; i++) {
      const s = sorten[(i + j) % sorten.length];
      body += zeichne(kasten.x + i * dx, kasten.y + j * dy, s);
    }
  } else if (zustand === 'fluessig') {
    /* Dicht, aber ohne feste Plätze — und nur der untere Teil ist gefüllt. */
    const plaetze = [];
    for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++)
      plaetze.push([kasten.x + 26 + i * 42 + (j % 2 ? 16 : 0) + (rnd() - 0.5) * 9,
                    kasten.y + 62 + j * 34 + (rnd() - 0.5) * 8]);
    plaetze.forEach((p, k) => { if (p[0] < kasten.x + kasten.w - 16) body += zeichne(p[0], p[1], sorten[k % sorten.length]); });
  } else {
    /* Gas: weit auseinander, unregelmäßig, mit Bewegungspfeilen. */
    const n = 7;
    for (let k = 0; k < n; k++) {
      const x = kasten.x + 30 + rnd() * (kasten.w - 60);
      const y = kasten.y + 26 + rnd() * (kasten.h - 52);
      const w = rnd() * Math.PI * 2;
      body += `<line x1="${x + Math.cos(w) * 16}" y1="${y + Math.sin(w) * 16}"
        x2="${x + Math.cos(w) * 27}" y2="${y + Math.sin(w) * 27}"
        stroke="${FAINT}" stroke-width="1.6" marker-end="url(#tp${id})"/>`;
      body += zeichne(x, y, sorten[k % sorten.length]);
    }
    body = `<defs><marker id="tp${id}" viewBox="0 0 8 8" refX="7" refY="4"
      markerWidth="5" markerHeight="5" orient="auto">
      <path d="M0,0 L8,4 L0,8 z" fill="${FAINT}"/></marker></defs>` + body;
  }

  const namen = { fest: 'fest', fluessig: 'flüssig', gas: 'gasförmig' };
  if (v.beschriftung !== false) body += txt(W / 2, 16, v.titel || namen[zustand], { fett: true, size: 13 });
  if (v.fusszeile) body += txt(W / 2, H - 6, v.fusszeile, { size: 12, farbe: SOFT });

  return svgRahmen(W, H, v.alt || `Teilchenmodell, Zustand ${namen[zustand]}.`, body, 320);
}

/* ============================================================
   2 · Schalenmodell
   "visual": { "type": "atom", "z": 11, "symbol": "Na", "neutronen": 12 }
   Ohne z lassen sich die Schalen auch direkt vorgeben:
   "schalen": [2, 8, 1]
   ============================================================ */
const SYMBOLE = ['', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne',
  'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca'];

function schalenFuer(z) {
  /* Schulische Besetzungsregel bis Calcium: 2, 8, 8, 2.
     Weiter geht das Schalenmodell in Klasse 7 bis 10 nicht — und wo es
     nicht mehr trägt, soll es auch nichts behaupten. */
  const max = [2, 8, 8, 2];
  const s = [];
  let rest = z;
  for (let i = 0; i < max.length && rest > 0; i++) {
    const n = Math.min(rest, max[i]);
    s.push(n); rest -= n;
  }
  return s;
}

function atomSvg(v) {
  const z = v.z;
  const schalen = v.schalen || (z ? schalenFuer(z) : [2, 8, 1]);
  const symbol = v.symbol || (z ? SYMBOLE[z] : '') || '';
  const W = 280, H = 250, cx = 140, cy = 124;
  let body = '';

  const radien = [30, 52, 74, 96];
  schalen.forEach((n, i) => {
    const R = radien[i] || 30 + i * 22;
    body += `<circle cx="${cx}" cy="${cy}" r="${R}" fill="none"
      stroke="${LINIE}" stroke-width="1.3"/>`;
    const aussen = i === schalen.length - 1;
    for (let k = 0; k < n; k++) {
      /* Außenelektronen paarweise, wie im Unterricht gezeichnet. */
      const w = -Math.PI / 2 + (k / n) * Math.PI * 2;
      const ex = cx + Math.cos(w) * R, ey = cy + Math.sin(w) * R;
      body += `<circle cx="${ex}" cy="${ey}" r="5.4"
        fill="${aussen && v.aussen !== false ? 'var(--b, #205B9C)' : SOFT}"
        stroke="${PAPIER}" stroke-width="1.4"/>`;
    }
  });

  /* Kern */
  body += `<circle cx="${cx}" cy="${cy}" r="20" fill="${FLAECHE}" stroke="${INK}" stroke-width="1.6"/>`;
  if (v.kernangabe !== false && z) {
    body += txt(cx, cy - 2, `${z} p⁺`, { size: 11, mono: true, roh: false });
    if (v.neutronen !== undefined) body += txt(cx, cy + 11, `${v.neutronen} n`, { size: 11, mono: true });
  } else if (symbol) {
    body += txt(cx, cy + 5, symbol, { size: 15, fett: true });
  }

  if (symbol) body += txt(W / 2, 20, `${symbol}${z ? '  (Z = ' + z + ')' : ''}`, { fett: true, size: 14 });
  const aussenzahl = schalen[schalen.length - 1];
  if (v.legende !== false)
    body += txt(W / 2, H - 12, `${schalen.join(' · ')}   —   ${aussenzahl} Außenelektron${aussenzahl === 1 ? '' : 'en'}`,
      { size: 12, farbe: SOFT, mono: true });

  return svgRahmen(W, H, v.alt || `Schalenmodell von ${symbol || 'einem Atom'} mit den Schalen ${schalen.join(', ')}.`, body, 290);
}

/* ============================================================
   3 · Periodensystem-Ausschnitt
   "visual": { "type": "pse", "markiert": ["Na", "Cl"], "perioden": 3 }
   ============================================================ */
const PSE_ZEILEN = [
  ['H', '', '', '', '', '', '', 'He'],
  ['Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne'],
  ['Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar'],
  ['K', 'Ca', '', '', '', '', 'Br', 'Kr']
];
const PSE_Z = { H: 1, He: 2, Li: 3, Be: 4, B: 5, C: 6, N: 7, O: 8, F: 9, Ne: 10, Na: 11, Mg: 12, Al: 13, Si: 14, P: 15, S: 16, Cl: 17, Ar: 18, K: 19, Ca: 20, Br: 35, Kr: 36 };

function pseSvg(v) {
  const zeilen = PSE_ZEILEN.slice(0, v.perioden || 4);
  const mark = new Set(v.markiert || []);
  const Z = 34, ab = 4, x0 = 22, y0 = 34;
  const W = x0 * 2 + 8 * (Z + ab), H = y0 + zeilen.length * (Z + ab) + 26;
  let body = '';

  /* Gruppennummern */
  const gruppen = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
  gruppen.forEach((g, i) => {
    body += txt(x0 + i * (Z + ab) + Z / 2, y0 - 8, g, { size: 11, farbe: FAINT, mono: true });
  });

  zeilen.forEach((zeile, j) => {
    body += txt(12, y0 + j * (Z + ab) + Z / 2 + 4, String(j + 1), { size: 11, farbe: FAINT, anchor: 'middle', mono: true });
    zeile.forEach((el, i) => {
      if (!el) return;
      const x = x0 + i * (Z + ab), y = y0 + j * (Z + ab);
      const hin = mark.has(el);
      body += `<rect x="${x}" y="${y}" width="${Z}" height="${Z}" rx="4"
        fill="${hin ? 'var(--b-bg, #E2EBF6)' : PAPIER}"
        stroke="${hin ? 'var(--b, #205B9C)' : LINIE}" stroke-width="${hin ? 2.2 : 1.2}"/>`;
      body += txt(x + Z / 2, y + 13, String(PSE_Z[el]), { size: 8.5, farbe: FAINT, mono: true });
      body += txt(x + Z / 2, y + 26, el, { size: 13, fett: hin, farbe: INK });
    });
  });

  if (v.legende) body += txt(W / 2, H - 8, v.legende, { size: 11.5, farbe: SOFT });
  return svgRahmen(W, H, v.alt || 'Ausschnitt des Periodensystems der ersten Perioden.', body, 400);
}

/* ============================================================
   4 · Lewis-Formeln
   "visual": { "type": "lewis", "molekuel": "h2o" }
   Fester Satz statt freier Eingabe: Eine automatische Anordnung
   freier Elektronenpaare, die manchmal danebenliegt, wäre in einer
   Aufgabe zur Oktettregel schlimmer als kein Bild.
   ============================================================ */
const LEWIS = {
  h2: { atome: [['H', -34, 0], ['H', 34, 0]], bindungen: [[0, 1, 1]], paare: [] },
  cl2: { atome: [['Cl', -40, 0], ['Cl', 40, 0]], bindungen: [[0, 1, 1]], paare: [[0, 'lou'], [0, 'lod'], [0, 'l'], [1, 'rou'], [1, 'rod'], [1, 'r']] },
  o2: { atome: [['O', -36, 0], ['O', 36, 0]], bindungen: [[0, 1, 2]], paare: [[0, 'l'], [0, 'lou'], [1, 'r'], [1, 'rou']] },
  n2: { atome: [['N', -36, 0], ['N', 36, 0]], bindungen: [[0, 1, 3]], paare: [[0, 'l'], [1, 'r']] },
  hcl: { atome: [['H', -38, 0], ['Cl', 34, 0]], bindungen: [[0, 1, 1]], paare: [[1, 'r'], [1, 'rou'], [1, 'rod']] },
  h2o: { atome: [['O', 0, 10], ['H', -44, -26], ['H', 44, -26]], bindungen: [[0, 1, 1], [0, 2, 1]], paare: [[0, 'd'], [0, 'du']] },
  nh3: { atome: [['N', 0, 8], ['H', -46, -22], ['H', 46, -22], ['H', 0, 52]], bindungen: [[0, 1, 1], [0, 2, 1], [0, 3, 1]], paare: [[0, 'u']] },
  ch4: { atome: [['C', 0, 0], ['H', -50, 0], ['H', 50, 0], ['H', 0, -44], ['H', 0, 44]], bindungen: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]], paare: [] },
  co2: { atome: [['O', -54, 0], ['C', 0, 0], ['O', 54, 0]], bindungen: [[0, 1, 2], [1, 2, 2]], paare: [[0, 'lou'], [0, 'lod'], [2, 'rou'], [2, 'rod']] }
};

function lewisSvg(v) {
  const m = LEWIS[(v.molekuel || '').toLowerCase()];
  const W = 260, H = 180, cx = W / 2, cy = H / 2 - 4;
  if (!m) {
    return svgRahmen(W, 90, 'Unbekanntes Molekül.',
      txt(cx, 50, `Kein Lewis-Bild für „${esc(v.molekuel || '')}"`, { size: 12, farbe: FAINT }), 280);
  }
  let body = '';
  const P = m.atome.map(a => [cx + a[1], cy + a[2]]);

  /* Bindungsstriche: einfach, doppelt, dreifach */
  m.bindungen.forEach(([a, b, n]) => {
    const [x1, y1] = P[a], [x2, y2] = P[b];
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy);
    const ux = dx / L, uy = dy / L;             // Richtung
    const nx = -uy, ny = ux;                    // Normale
    const kurz = 15;                            // Symbol freihalten
    for (let k = 0; k < n; k++) {
      const off = (k - (n - 1) / 2) * 5;
      body += `<line x1="${x1 + ux * kurz + nx * off}" y1="${y1 + uy * kurz + ny * off}"
        x2="${x2 - ux * kurz + nx * off}" y2="${y2 - uy * kurz + ny * off}"
        stroke="${INK}" stroke-width="2"/>`;
    }
  });

  /* Freie Elektronenpaare als Doppelpunkt bzw. Strich */
  const RICHT = {
    u: [0, -1], d: [0, 1], l: [-1, 0], r: [1, 0],
    lou: [-0.8, -0.7], lod: [-0.8, 0.7], rou: [0.8, -0.7], rod: [0.8, 0.7]
  };
  (m.paare || []).forEach(([i, wo]) => {
    const [rx, ry] = RICHT[wo] || [0, -1];
    const [x, y] = P[i];
    const L = Math.hypot(rx, ry), ux = rx / L, uy = ry / L;
    const px = x + ux * 20, py = y + uy * 20;
    const nx = -uy * 4, ny = ux * 4;
    body += `<circle cx="${px + nx}" cy="${py + ny}" r="2.4" fill="${INK}"/>`;
    body += `<circle cx="${px - nx}" cy="${py - ny}" r="2.4" fill="${INK}"/>`;
  });

  /* Elementsymbole zuletzt, mit Papierscheibe darunter */
  m.atome.forEach((a, i) => {
    const [x, y] = P[i];
    body += `<circle cx="${x}" cy="${y}" r="12" fill="${PAPIER}"/>`;
    body += txt(x, y + 6, a[0], { size: 17, fett: true });
  });

  if (v.formel !== false) {
    const f = v.formel || (v.molekuel || '').replace(/(\d)/g, '$1');
    body += txt(cx, H - 8, formelSchoen(v.formel || v.molekuel.toUpperCase().replace(/([A-Z])([A-Z])/g, '$1$2')), { size: 13, mono: true, farbe: SOFT });
  }
  return svgRahmen(W, H, v.alt || `Lewis-Formel von ${v.molekuel}.`, body, 280);
}

/* ============================================================
   5 · Strukturformel organischer Moleküle
   "visual": { "type": "struktur", "kette": 3, "gruppe": "oh",
               "position": 2, "alt": "…" }
   kette:    Zahl der Kohlenstoffatome (1 bis 8)
   gruppe:   keine | oh | cooh | cho | co | ester | doppel | dreifach
   position: an welchem C-Atom die Gruppe sitzt (1-basiert)
   halb:     true zeichnet die Halbstrukturformel als Text
   ============================================================ */
function strukturSvg(v) {
  const n = Math.max(1, Math.min(8, v.kette || 1));
  const gruppe = (v.gruppe || 'keine').toLowerCase();
  const pos = Math.max(1, Math.min(n, v.position || (gruppe === 'cooh' || gruppe === 'cho' ? 1 : 1)));
  const dx = 52, x0 = 40, cy = 96;
  const W = x0 * 2 + (n - 1) * dx + (gruppe === 'cooh' || gruppe === 'ester' ? 66 : 30);
  const H = 176;
  let body = '';

  const X = i => x0 + i * dx;
  const bindung = (x1, y1, x2, y2, fach) => {
    let g = '';
    const dxx = x2 - x1, dyy = y2 - y1, L = Math.hypot(dxx, dyy);
    const nx = -dyy / L, ny = dxx / L;
    const k = 13;
    const ux = dxx / L, uy = dyy / L;
    for (let j = 0; j < (fach || 1); j++) {
      const off = (j - ((fach || 1) - 1) / 2) * 5;
      g += `<line x1="${x1 + ux * k + nx * off}" y1="${y1 + uy * k + ny * off}"
        x2="${x2 - ux * k + nx * off}" y2="${y2 - uy * k + ny * off}"
        stroke="${INK}" stroke-width="2"/>`;
    }
    return g;
  };
  const symbol = (x, y, s, size) => `<circle cx="${x}" cy="${y}" r="${(size || 16) * 0.62}" fill="${PAPIER}"/>`
    + txt(x, y + (size || 16) * 0.35, s, { size: size || 16, fett: true });

  /* Kohlenstoffkette */
  for (let i = 0; i < n - 1; i++) {
    let fach = 1;
    if (gruppe === 'doppel' && i === pos - 1) fach = 2;
    if (gruppe === 'dreifach' && i === pos - 1) fach = 3;
    body += bindung(X(i), cy, X(i + 1), cy, fach);
  }

  /* Wasserstoffatome: oben und unten je nach freien Valenzen */
  for (let i = 0; i < n; i++) {
    let frei = 4;
    frei -= (i > 0 ? 1 : 0) + (i < n - 1 ? 1 : 0);
    if (gruppe === 'doppel' && (i === pos - 1 || i === pos)) frei -= 1;
    if (gruppe === 'dreifach' && (i === pos - 1 || i === pos)) frei -= 2;
    const traegtGruppe = (i === pos - 1) && ['oh', 'cooh', 'cho', 'co', 'ester'].includes(gruppe);
    if (traegtGruppe) frei -= (gruppe === 'co' ? 2 : gruppe === 'cho' ? 2 : gruppe === 'cooh' ? 3 : 1);
    frei = Math.max(0, frei);

    if (frei >= 1) { body += bindung(X(i), cy, X(i), cy - 44, 1); body += symbol(X(i), cy - 44, 'H', 15); }
    if (frei >= 2) { body += bindung(X(i), cy, X(i), cy + 44, 1); body += symbol(X(i), cy + 44, 'H', 15); }
    if (frei >= 3) { body += bindung(X(i), cy, X(i) - 36, cy + 30, 1); body += symbol(X(i) - 36, cy + 30, 'H', 15); }
    body += symbol(X(i), cy, 'C', 17);
  }

  /* Funktionelle Gruppe */
  const gx = X(pos - 1);
  if (gruppe === 'oh') {
    body += bindung(gx, cy, gx, cy - 44, 1);
    body += symbol(gx, cy - 44, 'O', 16);
    body += bindung(gx, cy - 44, gx + 34, cy - 44, 1);
    body += symbol(gx + 34, cy - 44, 'H', 15);
  } else if (gruppe === 'co') {
    body += bindung(gx, cy, gx, cy - 44, 2);
    body += symbol(gx, cy - 44, 'O', 16);
  } else if (gruppe === 'cho' || gruppe === 'cooh' || gruppe === 'ester') {
    body += bindung(gx, cy, gx, cy - 44, 2);
    body += symbol(gx, cy - 44, 'O', 16);
    if (gruppe === 'cho') {
      body += bindung(gx, cy, gx + 34, cy + 34, 1);
      body += symbol(gx + 34, cy + 34, 'H', 15);
    } else {
      body += bindung(gx, cy, gx + 40, cy, 1);
      body += symbol(gx + 40, cy, 'O', 16);
      body += bindung(gx + 40, cy, gx + 40, cy + 40, 1);
      body += symbol(gx + 40, cy + 40, gruppe === 'ester' ? 'R' : 'H', 15);
    }
  }

  if (v.name) body += txt(W / 2, 20, v.name, { fett: true, size: 14 });
  if (v.formel) body += txt(W / 2, H - 8, formelSchoen(v.formel), { size: 13, mono: true, farbe: SOFT });
  return svgRahmen(W, H, v.alt || `Strukturformel mit ${n} Kohlenstoffatomen.`, body, Math.min(420, W * 1.3));
}

/* ============================================================
   6 · Energiediagramm
   "visual": { "type": "energie", "verlauf": "exotherm",
               "katalysator": true, "edukt": "…", "produkt": "…" }
   ============================================================ */
function energieSvg(v) {
  const W = 320, H = 220, l = 46, r = W - 20, o = 34, u = H - 40;
  const exo = (v.verlauf || 'exotherm') !== 'endotherm';
  let body = '';

  body += `<line x1="${l}" y1="${u}" x2="${r}" y2="${u}" stroke="${SOFT}" stroke-width="1.6"/>`;
  body += `<line x1="${l}" y1="${u}" x2="${l}" y2="${o - 6}" stroke="${SOFT}" stroke-width="1.6"/>`;
  body += txt(l - 6, o + 4, 'E', { anchor: 'end', size: 13, fett: true });
  body += txt(r, u + 18, 'Reaktionsverlauf', { anchor: 'end', size: 11.5, farbe: FAINT });

  const yE = exo ? u - 96 : u - 52;      // Edukte
  const yP = exo ? u - 46 : u - 116;     // Produkte
  const yA = Math.min(yE, yP) - 42;      // Gipfel ohne Katalysator
  const xE = l + 24, xP = r - 36, xM = (xE + xP) / 2;

  const kurve = (gipfel, klasse, gestrichelt) =>
    `<path d="M ${xE} ${yE} C ${xE + 46} ${yE} ${xM - 30} ${gipfel} ${xM} ${gipfel}
       C ${xM + 30} ${gipfel} ${xP - 46} ${yP} ${xP} ${yP}"
       fill="none" stroke="${klasse}" stroke-width="2.6"
       ${gestrichelt ? 'stroke-dasharray="6 4"' : ''} stroke-linecap="round"/>`;

  if (v.katalysator) body += kurve(yA, FAINT, true);
  body += kurve(v.katalysator ? yA + 26 : yA, 'var(--b, #205B9C)', false);

  /* Niveaulinien */
  body += `<line x1="${l}" y1="${yE}" x2="${xE + 10}" y2="${yE}" stroke="${LINIE}" stroke-dasharray="4 3"/>`;
  body += `<line x1="${l}" y1="${yP}" x2="${xP}" y2="${yP}" stroke="${LINIE}" stroke-dasharray="4 3"/>`;

  /* Reaktionsenergie */
  const xd = xP + 14;
  body += `<line x1="${xd}" y1="${yE}" x2="${xd}" y2="${yP}" stroke="${exo ? 'var(--korr, #A8231C)' : 'var(--a, #1F6849)'}" stroke-width="2"/>`;
  body += txt(xd + 5, (yE + yP) / 2 + 4, exo ? '−ΔE' : '+ΔE', { anchor: 'start', size: 12, mono: true, farbe: exo ? 'var(--korr, #A8231C)' : 'var(--a, #1F6849)' });

  body += txt(xE + 4, yE - 10, v.edukt || 'Edukte', { anchor: 'start', size: 12 });
  body += txt(xP - 6, yP + (exo ? 18 : -10), v.produkt || 'Produkte', { anchor: 'end', size: 12 });
  body += txt(W / 2, 18, v.titel || (exo ? 'exotherme Reaktion' : 'endotherme Reaktion'), { fett: true, size: 13.5 });
  if (v.katalysator) body += txt(W / 2, H - 8, 'gestrichelt: ohne Katalysator', { size: 11, farbe: FAINT });

  return svgRahmen(W, H, v.alt || `Energiediagramm einer ${exo ? 'exothermen' : 'endothermen'} Reaktion.`, body, 340);
}

/* ============================================================
   7 · pH-Skala
   "visual": { "type": "phskala", "wert": 3, "stoff": "Zitronensaft" }
   marken: mehrere Stoffe gleichzeitig
   ============================================================ */
function phSvg(v) {
  const W = 330, H = v.marken ? 150 : 118, l = 18, r = W - 18, y = 58, hoehe = 26;
  let body = '';
  const X = p => l + (p / 14) * (r - l);

  /* Farbverlauf wie der Universalindikator: rot – grün – blau */
  const id = ++_uid;
  body += `<defs><linearGradient id="ph${id}" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#C43B32"/><stop offset="0.22" stop-color="#E08A2E"/>
    <stop offset="0.42" stop-color="#D9C22B"/><stop offset="0.5" stop-color="#4E9A51"/>
    <stop offset="0.62" stop-color="#2F8F9B"/><stop offset="0.8" stop-color="#2F6BB5"/>
    <stop offset="1" stop-color="#6B3FA0"/></linearGradient></defs>`;
  body += `<rect x="${l}" y="${y}" width="${r - l}" height="${hoehe}" rx="5"
    fill="url(#ph${id})" stroke="${INK}" stroke-width="1.2"/>`;

  for (let p = 0; p <= 14; p++) {
    body += `<line x1="${X(p)}" y1="${y + hoehe}" x2="${X(p)}" y2="${y + hoehe + (p % 7 === 0 ? 8 : 4)}"
      stroke="${SOFT}" stroke-width="1.2"/>`;
    if (p % 2 === 0 || p === 7) body += txt(X(p), y + hoehe + 20, String(p), { size: 11, mono: true });
  }
  body += txt(X(0) + 4, y - 8, 'sauer', { anchor: 'start', size: 12, farbe: SOFT });
  body += txt(X(7), y - 8, 'neutral', { size: 12, farbe: SOFT });
  body += txt(X(14) - 4, y - 8, 'alkalisch', { anchor: 'end', size: 12, farbe: SOFT });

  const marken = v.marken || (v.wert !== undefined ? [{ wert: v.wert, stoff: v.stoff }] : []);
  marken.forEach((m, i) => {
    const x = X(m.wert);
    const yy = y + hoehe + 30 + i * 20;
    body += `<path d="M ${x} ${y - 2} l -6 -9 l 12 0 z" fill="${INK}"/>`;
    body += `<line x1="${x}" y1="${y}" x2="${x}" y2="${y + hoehe}" stroke="${INK}" stroke-width="2"/>`;
    if (m.stoff) body += txt(x, yy + 8, `${m.stoff} · pH ${String(m.wert).replace('.', ',')}`,
      { size: 12, fett: true, anchor: x > W - 80 ? 'end' : x < 80 ? 'start' : 'middle' });
  });

  return svgRahmen(W, H, v.alt || 'Eine pH-Skala von 0 bis 14 mit Marke.', body, 360);
}

/* ============================================================
   8 · Versuchsaufbau
   "visual": { "type": "apparatur", "aufbau": "destillation" }
   aufbau: reagenzglas · gasbrenner · filtration · destillation ·
           elektrolyse · pneumatisch · titration · waage
   ============================================================ */
function apparaturSvg(v) {
  const W = 300, H = 220;
  const glas = `fill="${PAPIER}" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"`;
  const fl = `fill="#9CC3E8" stroke="${INK}" stroke-width="1.4"`;
  const stativ = `fill="none" stroke="${SOFT}" stroke-width="3"`;
  let body = '';
  const a = v.aufbau || 'reagenzglas';

  const brenner = (x, y) => `
    <path d="M ${x - 20} ${y} L ${x + 20} ${y} L ${x + 13} ${y - 8} L ${x - 13} ${y - 8} Z" ${glas}/>
    <rect x="${x - 6}" y="${y - 48}" width="12" height="40" ${glas}/>
    <path d="M ${x} ${y - 84} C ${x + 11} ${y - 66} ${x + 8} ${y - 52} ${x} ${y - 48}
             C ${x - 8} ${y - 52} ${x - 11} ${y - 66} ${x} ${y - 84} Z"
      fill="#3E7FC1" opacity="0.85" stroke="none"/>
    <path d="M ${x} ${y - 68} C ${x + 5} ${y - 60} ${x + 4} ${y - 52} ${x} ${y - 49}
             C ${x - 4} ${y - 52} ${x - 5} ${y - 60} ${x} ${y - 68} Z" fill="#D9C22B" opacity="0.9"/>`;

  if (a === 'gasbrenner') {
    body += brenner(150, 190);
    body += txt(214, 108, 'Flamme', { anchor: 'start', size: 12, farbe: SOFT });
    body += `<line x1="168" y1="112" x2="208" y2="106" stroke="${FAINT}" stroke-width="1.2"/>`;
    body += txt(214, 150, 'Luftregler', { anchor: 'start', size: 12, farbe: SOFT });
    body += `<line x1="160" y1="152" x2="208" y2="148" stroke="${FAINT}" stroke-width="1.2"/>`;
    body += `<circle cx="150" cy="152" r="9" fill="none" stroke="${INK}" stroke-width="1.6"/>`;
  } else if (a === 'reagenzglas') {
    body += `<path d="M 128 30 L 128 150 A 22 22 0 0 0 172 150 L 172 30" ${glas}/>`;
    body += `<path d="M 128 100 L 128 150 A 22 22 0 0 0 172 150 L 172 100 Z" ${fl}/>`;
    body += `<line x1="120" y1="30" x2="180" y2="30" stroke="${INK}" stroke-width="2.4"/>`;
    body += txt(150, 200, v.beschriftung || 'Reagenzglas', { size: 12, farbe: SOFT });
  } else if (a === 'filtration') {
    body += `<path d="M 96 44 L 204 44 L 150 132 Z" ${glas}/>`;
    body += `<path d="M 110 58 L 190 58 L 150 122 Z" fill="${FLAECHE}" stroke="${SOFT}" stroke-width="1.2"/>`;
    body += `<rect x="118" y="132" width="64" height="8" ${glas}/>`;
    body += `<path d="M 112 148 L 112 196 L 188 196 L 188 148" ${glas}/>`;
    body += `<rect x="112" y="176" width="76" height="20" ${fl}/>`;
    body += txt(212, 62, 'Filterpapier', { anchor: 'start', size: 11.5, farbe: SOFT });
    body += txt(212, 190, 'Filtrat', { anchor: 'start', size: 11.5, farbe: SOFT });
    body += txt(60, 62, 'Trichter', { anchor: 'end', size: 11.5, farbe: SOFT });
  } else if (a === 'destillation') {
    body += `<path d="M 34 132 L 34 178 A 24 24 0 0 0 82 178 L 82 132" ${glas}/>`;
    body += `<rect x="34" y="160" width="48" height="30" ${fl}/>`;
    body += `<path d="M 46 132 L 46 96 L 70 96 L 70 132" ${glas}/>`;
    body += `<line x1="70" y1="102" x2="176" y2="128" stroke="${INK}" stroke-width="1.8"/>`;
    body += `<line x1="70" y1="92" x2="182" y2="118" stroke="${INK}" stroke-width="1.8"/>`;
    body += `<rect x="88" y="94" width="86" height="34" rx="6" transform="rotate(13 131 111)"
      fill="none" stroke="${SOFT}" stroke-width="2"/>`;
    body += `<path d="M 190 128 L 190 178 A 20 20 0 0 0 230 178 L 230 128" ${glas}/>`;
    body += `<rect x="190" y="172" width="40" height="18" ${fl}/>`;
    body += brenner(58, 214).replace(/y="?190"?/g, '');
    body += txt(131, 74, 'Kühler', { size: 11.5, farbe: SOFT });
    body += txt(210, 118, 'Destillat', { size: 11.5, farbe: SOFT, anchor: 'middle' });
    body += txt(58, 214, 'Sumpf', { size: 11.5, farbe: SOFT });
  } else if (a === 'elektrolyse') {
    body += `<path d="M 60 60 L 60 190 L 240 190 L 240 60" ${glas}/>`;
    body += `<rect x="60" y="96" width="180" height="94" ${fl}/>`;
    body += `<rect x="104" y="70" width="10" height="104" fill="${SOFT}" stroke="${INK}" stroke-width="1.2"/>`;
    body += `<rect x="186" y="70" width="10" height="104" fill="${SOFT}" stroke="${INK}" stroke-width="1.2"/>`;
    [0, 1].forEach(k => {
      const x = k ? 191 : 109;
      for (let i = 0; i < 4; i++)
        body += `<circle cx="${x + (i % 2 ? 12 : -12)}" cy="${112 + i * 17}" r="4.6"
          fill="none" stroke="${INK}" stroke-width="1.3"/>`;
    });
    body += `<line x1="109" y1="70" x2="109" y2="40" stroke="${INK}" stroke-width="2"/>`;
    body += `<line x1="191" y1="70" x2="191" y2="40" stroke="${INK}" stroke-width="2"/>`;
    body += `<line x1="109" y1="40" x2="134" y2="40" stroke="${INK}" stroke-width="2"/>`;
    body += `<line x1="166" y1="40" x2="191" y2="40" stroke="${INK}" stroke-width="2"/>`;
    body += `<line x1="140" y1="30" x2="140" y2="50" stroke="${INK}" stroke-width="2.6"/>`;
    body += `<line x1="150" y1="34" x2="150" y2="46" stroke="${INK}" stroke-width="2.6"/>`;
    body += txt(109, 30, '−', { size: 17, fett: true });
    body += txt(191, 30, '+', { size: 17, fett: true });
    body += txt(150, 208, v.beschriftung || 'Elektrolyse', { size: 12, farbe: SOFT });
  } else if (a === 'pneumatisch') {
    body += `<path d="M 40 120 L 40 194 L 260 194 L 260 120" ${glas}/>`;
    body += `<rect x="40" y="140" width="220" height="54" ${fl}/>`;
    body += `<path d="M 124 34 L 124 150 A 24 24 0 0 0 172 150 L 172 34" ${glas}/>`;
    body += `<rect x="124" y="76" width="48" height="74" ${fl}/>`;
    body += `<rect x="124" y="34" width="48" height="42" fill="${FLAECHE}" stroke="none"/>`;
    body += txt(148, 26, 'aufgefangenes Gas', { size: 11.5, farbe: SOFT });
    body += `<path d="M 232 140 C 232 120 210 118 196 130" fill="none" stroke="${INK}" stroke-width="1.8"/>`;
    for (let i = 0; i < 3; i++)
      body += `<circle cx="${170 - i * 8}" cy="${138 - i * 4}" r="4" fill="none" stroke="${INK}" stroke-width="1.2"/>`;
  } else if (a === 'titration') {
    body += `<rect x="140" y="20" width="20" height="112" rx="3" ${glas}/>`;
    body += `<rect x="140" y="44" width="20" height="88" fill="#C9A2DA" stroke="none"/>`;
    body += `<path d="M 140 132 L 150 148 L 160 132 Z" ${glas}/>`;
    body += `<circle cx="150" cy="140" r="5" fill="${SOFT}"/>`;
    for (let i = 0; i < 6; i++)
      body += `<line x1="160" y1="${34 + i * 16}" x2="170" y2="${34 + i * 16}" stroke="${SOFT}" stroke-width="1.1"/>`;
    body += `<path d="M 116 168 L 150 168 M 150 168 L 184 168" stroke="none"/>`;
    body += `<path d="M 150 160 L 106 208 L 194 208 Z" ${glas}/>`;
    body += `<path d="M 128 186 L 172 186 L 194 208 L 106 208 Z" fill="#F0B7B2" stroke="${INK}" stroke-width="1.2"/>`;
    body += txt(196, 40, 'Bürette', { anchor: 'start', size: 11.5, farbe: SOFT });
    body += txt(216, 200, 'Vorlage', { anchor: 'end', size: 11.5, farbe: SOFT });
  } else if (a === 'waage') {
    body += `<rect x="50" y="150" width="200" height="34" rx="6" ${glas}/>`;
    body += `<rect x="96" y="156" width="108" height="22" rx="3" fill="${FLAECHE}" stroke="${LINIE}"/>`;
    body += txt(150, 173, v.anzeige || '—', { size: 15, mono: true, fett: true });
    body += `<rect x="96" y="138" width="108" height="12" rx="3" ${glas}/>`;
    body += `<path d="M 120 138 L 120 66 A 30 30 0 0 0 180 66 L 180 138 Z" ${glas}/>`;
    body += `<rect x="120" y="100" width="60" height="38" ${fl}/>`;
    body += `<rect x="120" y="56" width="60" height="12" rx="4" fill="${SOFT}"/>`;
    body += txt(150, 44, v.beschriftung || 'geschlossenes Gefäß', { size: 11.5, farbe: SOFT });
  } else {
    body += txt(150, 108, `Unbekannter Aufbau „${esc(a)}"`, { size: 12, farbe: FAINT });
  }

  if (v.titel) body += txt(W / 2, 14, v.titel, { fett: true, size: 13 });
  return svgRahmen(W, H, v.alt || `Schematischer Versuchsaufbau: ${a}.`, body, 320);
}

/* ============================================================
   9 · Anteilsbalken
   "visual": { "type": "anteil", "segmente": [
       { "anteil": 78, "label": "N₂" }, { "anteil": 21, "label": "O₂" } ] }
   Dieselbe Darstellung wie der Fortschrittsbalken im Kopf: Ein Balken
   bedeutet im ganzen Projekt dasselbe.
   ============================================================ */
function anteilSvg(v) {
  const seg = v.segmente || [{ anteil: 100, label: '' }];
  const W = 320, H = 40 + seg.length * 20 + (v.titel ? 20 : 0);
  const l = 14, r = W - 14, y = v.titel ? 30 : 12, h = 30;
  const summe = seg.reduce((s, x) => s + x.anteil, 0) || 100;
  const paletten = ['var(--b, #205B9C)', 'var(--a, #1F6849)', 'var(--c, #6B3FA0)', '#D9A227', '#C43B32', '#7E8B99'];
  let body = '', x = l;

  seg.forEach((s, i) => {
    const w = (s.anteil / summe) * (r - l);
    body += `<rect x="${x}" y="${y}" width="${Math.max(w, 0.8)}" height="${h}"
      fill="${s.farbe || paletten[i % paletten.length]}" stroke="${PAPIER}" stroke-width="1"/>`;
    if (w > 42) body += txt(x + w / 2, y + h / 2 + 4.5, s.label, { size: 12, fett: true, farbe: '#FFFFFF' });
    x += w;
  });
  body += `<rect x="${l}" y="${y}" width="${r - l}" height="${h}" rx="4"
    fill="none" stroke="${INK}" stroke-width="1.4"/>`;

  seg.forEach((s, i) => {
    const ly = y + h + 18 + i * 20;
    body += `<rect x="${l}" y="${ly - 9}" width="12" height="12" rx="2"
      fill="${s.farbe || paletten[i % paletten.length]}" stroke="${INK}" stroke-width="0.8"/>`;
    body += txt(l + 20, ly + 1, `${s.label}  ${String(s.anteil).replace('.', ',')} ${v.einheit || '%'}`,
      { anchor: 'start', size: 12 });
  });
  if (v.titel) body += txt(W / 2, 16, v.titel, { fett: true, size: 13 });
  return svgRahmen(W, H, v.alt || 'Ein Balken, in Anteile geteilt.', body, 340);
}

/* ============================================================
   10 · Messwertdiagramm
   "visual": { "type": "diagramm", "xtitel": "Zahl der C-Atome",
               "ytitel": "Siedetemperatur in °C",
               "punkte": [[1,-162],[2,-89]], "linie": true }
   ============================================================ */
function diagrammSvg(v) {
  const W = 320, H = 230, l = 52, r = W - 16, o = 26, u = H - 44;
  const P = v.punkte || [];
  const xs = P.map(p => p[0]), ys = P.map(p => p[1]);
  const xmin = v.xmin ?? Math.min(...xs, 0), xmax = v.xmax ?? Math.max(...xs, 1);
  const ymin = v.ymin ?? Math.min(...ys, 0), ymax = v.ymax ?? Math.max(...ys, 1);
  const X = x => l + ((x - xmin) / (xmax - xmin || 1)) * (r - l);
  const Y = y => u - ((y - ymin) / (ymax - ymin || 1)) * (u - o);
  let body = '';

  /* Gitter in glatten Schritten — sonst wird aus 140 Linien eine Fläche. */
  const schritt = spanne => {
    const roh = spanne / 5;
    const p = Math.pow(10, Math.floor(Math.log10(roh)));
    return [1, 2, 5, 10].map(f => f * p).find(s => s >= roh) || p * 10;
  };
  const sx = v.xschritt || schritt(xmax - xmin), sy = v.yschritt || schritt(ymax - ymin);
  for (let x = Math.ceil(xmin / sx) * sx; x <= xmax + 1e-9; x += sx) {
    body += `<line x1="${X(x)}" y1="${o}" x2="${X(x)}" y2="${u}" stroke="${LINIE}" stroke-width="0.8"/>`;
    body += txt(X(x), u + 16, String(+x.toFixed(4)).replace('.', ','), { size: 10.5, mono: true, farbe: FAINT });
  }
  for (let y = Math.ceil(ymin / sy) * sy; y <= ymax + 1e-9; y += sy) {
    body += `<line x1="${l}" y1="${Y(y)}" x2="${r}" y2="${Y(y)}" stroke="${LINIE}" stroke-width="0.8"/>`;
    body += txt(l - 6, Y(y) + 3.5, String(+y.toFixed(4)).replace('.', ','), { size: 10.5, mono: true, anchor: 'end', farbe: FAINT });
  }

  body += `<line x1="${l}" y1="${u}" x2="${r}" y2="${u}" stroke="${SOFT}" stroke-width="1.6"/>`;
  body += `<line x1="${l}" y1="${u}" x2="${l}" y2="${o}" stroke="${SOFT}" stroke-width="1.6"/>`;

  if (v.linie !== false && P.length > 1)
    body += `<polyline points="${P.map(p => `${X(p[0])},${Y(p[1])}`).join(' ')}"
      fill="none" stroke="var(--b, #205B9C)" stroke-width="2.4" stroke-linejoin="round"/>`;
  P.forEach(p => {
    body += `<circle cx="${X(p[0])}" cy="${Y(p[1])}" r="4.2" fill="var(--b, #205B9C)" stroke="${PAPIER}" stroke-width="1.4"/>`;
    if (p[2]) body += txt(X(p[0]), Y(p[1]) - 10, p[2], { size: 10.5, farbe: SOFT });
  });

  if (v.xtitel) body += txt((l + r) / 2, H - 8, v.xtitel, { size: 11.5, farbe: SOFT });
  if (v.ytitel) body += `<text x="${-(o + u) / 2}" y="12" transform="rotate(-90)" text-anchor="middle"
    font-family="Atkinson Hyperlegible, system-ui, sans-serif" font-size="11.5" fill="${SOFT}">${esc(v.ytitel)}</text>`;
  if (v.titel) body += txt((l + r) / 2, 14, v.titel, { fett: true, size: 12.5 });

  return svgRahmen(W, H, v.alt || 'Ein Diagramm mit Messwerten.', body, 360);
}

/* ---------- Verteiler ---------- */

/* Statisch — für den Druck und für arbeitsblatt.html. */
function visualHtml(v) {
  if (!v) return '';
  const huelle = s => `<div class="bild">${s}</div>`;
  if (v.type === 'teilchen') return huelle(teilchenSvg(v));
  if (v.type === 'atom') return huelle(atomSvg(v));
  if (v.type === 'pse') return huelle(pseSvg(v));
  if (v.type === 'lewis') return huelle(lewisSvg(v));
  if (v.type === 'struktur') return huelle(strukturSvg(v));
  if (v.type === 'energie') return huelle(energieSvg(v));
  if (v.type === 'phskala') return huelle(phSvg(v));
  if (v.type === 'apparatur') return huelle(apparaturSvg(v));
  if (v.type === 'anteil') return huelle(anteilSvg(v));
  if (v.type === 'diagramm') return huelle(diagrammSvg(v));
  if (v.type === 'animation') return (window.ANIM && window.ANIM.posterHtml)
    ? window.ANIM.posterHtml(v)
    : '<div class="bild">[Animation — nur am Gerät]</div>';
  return '';
}

/* Interaktiv — für den Bildschirm. */
function visualBlock(v) {
  if (!v) return document.createDocumentFragment();

  /* Bewegte Visualisierung. animationen.js meldet sich als window.ANIM an;
     fehlt die Datei, greift der Platzhalter. */
  if (v.type === 'animation') {
    if (window.ANIM && window.ANIM.block) return window.ANIM.block(v);
    const p = document.createElement('div');
    p.className = 'bild';
    p.textContent = '[Animation — animationen.js nicht geladen]';
    return p;
  }

  const d = document.createElement('div');
  d.innerHTML = visualHtml(v);
  const block = d.firstElementChild;
  if (!block) return document.createDocumentFragment();

  /* Regler am Schalenmodell: Ordnungszahl schieben, Schalen füllen sich.
     Genau das ist die Aussage von PS-07 — die Außenelektronen wiederholen
     sich, die Schalen nicht. */
  if (v.type === 'atom' && v.regler) {
    const stand = { z: v.z || 1 };
    const r = document.createElement('div');
    r.className = 'k-regler';
    r.innerHTML = `<label>Ordnungszahl
      <input type="range" id="r-z${++_uid}" min="1" max="20" step="1" value="${stand.z}"></label>
      <div class="k-ablesung" id="r-out"></div>`;
    const feld = r.querySelector('input');
    const neu = () => {
      const s = schalenFuer(stand.z);
      block.innerHTML = atomSvg({ ...v, z: stand.z, symbol: SYMBOLE[stand.z], neutronen: undefined });
      r.querySelector('#r-out').innerHTML =
        `${SYMBOLE[stand.z]} · Schalen ${s.join(' · ')} · <b>${s[s.length - 1]} Außenelektron${s[s.length - 1] === 1 ? '' : 'en'}</b>`;
    };
    feld.addEventListener('input', e => { stand.z = +e.target.value; neu(); });
    const h = document.createElement('div');
    h.append(block, r);
    neu();
    return h;
  }

  return block;
}

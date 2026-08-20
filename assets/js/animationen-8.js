/* ============================================================
   animationen-8.js · Klasse 8 (WA · SZ · ME) und Nachträge
   Nachgeladen von animationen.js. Der Rahmen (Feld, Loop, Szene,
   register) steht dort; hier stehen nur die Fachteile.
   ============================================================ */
/* ============================================================
   animationen.js · Teil 5 — Klasse 8 (WA · SZ · ME)
   ============================================================ */
(function () {
  'use strict';
  const I = window.ANIM._intern, C = window.ANIM._chem;
  const { Loop, steuerleiste, regler, abzeichen, register, FARBE, fmt, osz, h, el, stufeVon, REDUCED } = I;
  const { Szene, Wuerfel, elFarbe } = C;

  /* ---------- 9 · Elektrolyse von Wasser (WA-02) ---------- */
  register({
    id: 'elektrolyse', titel: 'Wasser wird zerlegt', bezug: 'WA-02',
    kurz: 'A: zwei Gase entstehen · B: doppelt so viel Wasserstoff · C: das Verhältnis steckt in der Formel.',
    text: {
      A: ['Durch das Wasser fließt Strom.', 'An beiden Elektroden entsteht ein Gas.', 'Auf einer Seite ist es doppelt so viel.'],
      B: ['Am Minuspol entsteht Wasserstoff, am Pluspol Sauerstoff.', 'Das Verhältnis der Volumen ist 2 : 1.', 'Damit ist Wasser eine Verbindung, kein Element.'],
      C: ['2 H₂O → 2 H₂ + O₂ — das Volumenverhältnis 2 : 1 steht direkt in der Gleichung.', 'Die Rückreaktion ist die Knallgasreaktion. Bildung und Zerlegung sind Umkehrungen voneinander.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 330, hoehe: 224, alt: 'Ein Hofmannscher Wasserzersetzer, in dessen Schenkeln sich Gas im Verhältnis zwei zu eins sammelt.' });
      const ables = h('div', 'anim-ables');
      const cx = S.W / 2, links = cx - 62, rechts = cx + 62;
      const oben = 30, unten = 152, hoehe = unten - oben;

      S.add(el('path', { d: `M ${links - 22} ${unten} L ${rechts + 22} ${unten} L ${rechts + 22} ${unten + 34} L ${links - 22} ${unten + 34} Z`, fill: '#DCE7F2', stroke: FARBE.ink, 'stroke-width': 1.8 }), 'hinten');
      [links, rechts].forEach(x => {
        S.add(el('rect', { x: x - 17, y: oben, width: 34, height: hoehe, fill: '#DCE7F2', stroke: FARBE.ink, 'stroke-width': 1.8 }), 'hinten');
        S.add(el('rect', { x: x - 3, y: unten - 44, width: 6, height: 60, fill: FARBE.weich, stroke: FARBE.ink, 'stroke-width': 1 }), 'hinten');
      });
      const gasL = S.add(el('rect', { x: links - 17, y: oben, width: 34, height: 0.001, fill: FARBE.paper }), 'mitte');
      const gasR = S.add(el('rect', { x: rechts - 17, y: oben, width: 34, height: 0.001, fill: FARBE.paper }), 'mitte');
      S.text(links, 22, 'H₂', { size: 13, weight: 700, farbe: FARBE.b });
      S.text(rechts, 22, 'O₂', { size: 13, weight: 700, farbe: FARBE.korr });
      S.text(links, unten + 52, '−', { size: 18, weight: 700 });
      S.text(rechts, unten + 52, '+', { size: 18, weight: 700 });
      const blasen = [];
      for (let i = 0; i < 8; i++) blasen.push(S.teilchen(0, 0, 'x', { r: 4, fill: FARBE.weiss, stroke: FARBE.weich, beschriftet: false, ebene: 'vorn' }));

      const setz = u => {
        const hL = Math.min(hoehe - 8, u * (hoehe - 8));
        const hR = hL / 2;
        gasL.setAttribute('height', Math.max(0.001, hL)); gasL.setAttribute('y', oben);
        gasR.setAttribute('height', Math.max(0.001, hR)); gasR.setAttribute('y', oben);
        blasen.forEach((b, i) => {
          const seite = i < 5 ? links : rechts;
          const p = ((u * 3 + i * 0.17) % 1);
          S.setPos(b, seite + (i % 2 ? 7 : -7), unten - 10 - p * (hoehe - 30));
          S.setOpacity(b, p < 0.9 ? 0.85 : 0);
        });
        const vL = Math.round(hL / (hoehe - 8) * 20), vR = Math.round(hR / (hoehe - 8) * 20);
        ables.innerHTML = st === 'A'
          ? `Links ist <b>doppelt so viel</b> Gas wie rechts.`
          : `Wasserstoff <b>${vL} mL</b> · Sauerstoff <b>${vR} mL</b> → Verhältnis <b>2 : 1</b>`
            + (st === 'C' ? '<br><span class="anim-formel">2 H₂O → 2 H₂ + O₂</span>' : '');
      };
      setz(0);

      const loop = Loop(t => setz(Math.min(1, (t % 8) / 6)));
      const bar = steuerleiste(loop);
      host.appendChild(S.svg); host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });

  /* ---------- 10 · Reaktionsgleichung ausgleichen (WA-03) ---------- */
  register({
    id: 'ausgleichen', titel: 'Eine Gleichung ausgleichen', bezug: 'WA-03',
    kurz: 'A: links und rechts gleich viele Atome · B: Schritt für Schritt · C: nur Koeffizienten, nie die Indizes.',
    text: {
      A: ['Links und rechts müssen gleich viele Atome jeder Sorte stehen.', 'Es geht kein Atom verloren.'],
      B: ['Zähle jede Atomsorte auf beiden Seiten.', 'Setze Zahlen vor die Formeln, bis es passt.', 'Prüfe zum Schluss noch einmal alle Sorten.'],
      C: ['Nur die Zahl vor der Formel darf geändert werden — der Koeffizient.', 'Die kleine Zahl in der Formel gehört zum Stoff. Wer sie ändert, erfindet einen anderen Stoff.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 340, hoehe: 190, alt: 'Eine Reaktionsgleichung, deren Atome links und rechts gezählt und ausgeglichen werden.' });
      const ables = h('div', 'anim-ables');

      /* H₂ + O₂ → H₂O ausgleichen zu 2 H₂ + O₂ → 2 H₂O */
      const schritte = [
        { k: [1, 1, 1], text: 'So aufgeschrieben stimmt es noch nicht.' },
        { k: [1, 1, 2], text: 'Rechts 2 H₂O — jetzt stimmt der Sauerstoff.' },
        { k: [2, 1, 2], text: 'Links 2 H₂ — jetzt stimmt auch der Wasserstoff.' }
      ];
      const zeile = S.text(S.W / 2, 46, '', { size: 16, weight: 700, mono: true });
      const kopfH = S.text(S.W * 0.3, 96, '', { size: 13, mono: true });
      const kopfO = S.text(S.W * 0.3, 122, '', { size: 13, mono: true });
      S.text(S.W * 0.3 - 66, 96, 'H-Atome', { anchor: 'start', size: 12, farbe: FARBE.weich });
      S.text(S.W * 0.3 - 66, 122, 'O-Atome', { anchor: 'start', size: 12, farbe: FARBE.weich });
      const haken = S.text(S.W / 2, 160, '', { size: 14, weight: 700 });

      const zeige = i => {
        const s = schritte[Math.min(i, schritte.length - 1)];
        const [a, b, c] = s.k;
        const vor = n => (n === 1 ? '' : n + ' ');
        zeile.textContent = `${vor(a)}H₂ + ${vor(b)}O₂ → ${vor(c)}H₂O`;
        const hL = a * 2, hR = c * 2, oL = b * 2, oR = c * 1;
        kopfH.textContent = `${hL}  ${hL === hR ? '=' : '≠'}  ${hR}`;
        kopfO.textContent = `${oL}  ${oL === oR ? '=' : '≠'}  ${oR}`;
        kopfH.setAttribute('fill', hL === hR ? FARBE.ok : FARBE.korr);
        kopfO.setAttribute('fill', oL === oR ? FARBE.ok : FARBE.korr);
        const fertig = hL === hR && oL === oR;
        haken.textContent = fertig ? '✓ ausgeglichen' : '';
        haken.setAttribute('fill', FARBE.ok);
        ables.innerHTML = s.text + (st === 'C' && !fertig ? '<br>Nur die Zahl <b>vor</b> der Formel darf sich ändern.' : '');
      };
      zeige(0);

      const loop = Loop(t => zeige(Math.floor(t / 2.2) % (schritte.length + 1)));
      const bar = steuerleiste(loop);
      host.appendChild(S.svg); host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });

  /* ---------- 11 · Dipol und Wasserstrahl (WA-04) ---------- */
  register({
    id: 'dipol', titel: 'Das Wassermolekül ist ein Dipol', bezug: 'WA-04',
    kurz: 'A: der Strahl wird abgelenkt · B: zwei Ladungsschwerpunkte · C: Elektronegativität erklärt warum.',
    text: {
      A: ['Ein geriebener Stab wird an einen dünnen Wasserstrahl gehalten.', 'Der Strahl wird abgelenkt.'],
      B: ['Das Wassermolekül ist gewinkelt.', 'Am Sauerstoff sitzt eine negative Teilladung, an den Wasserstoffatomen eine positive.', 'Solche Moleküle heißen Dipole.'],
      C: ['Sauerstoff zieht die bindenden Elektronen stärker an als Wasserstoff — er hat die höhere Elektronegativität.', 'Wäre das Molekül gestreckt statt gewinkelt, hoben sich die Teilladungen auf. Der Bau entscheidet, nicht nur die Bindung.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 330, hoehe: 208, alt: 'Ein Wasserstrahl wird von einem geladenen Stab abgelenkt; daneben ein Wassermolekül mit Teilladungen.' });
      const ables = h('div', 'anim-ables');

      /* links: Strahl, rechts: Molekül */
      const sx = 62;
      S.add(el('rect', { x: sx - 12, y: 20, width: 24, height: 12, rx: 3, fill: FARBE.weich }), 'hinten');
      const strahl = S.add(el('path', { d: '', fill: 'none', stroke: '#6FA8E8', 'stroke-width': 4, 'stroke-linecap': 'round' }), 'mitte');
      const stab = S.add(el('rect', { x: sx + 44, y: 92, width: 46, height: 9, rx: 4, fill: '#B08CE0', stroke: FARBE.ink, 'stroke-width': 1 }), 'vorn');
      const stabT = S.text(sx + 67, 86, '', { size: 12, weight: 700, farbe: FARBE.c });

      const mx = S.W - 82, my = 96;
      const oA = S.teilchen(mx, my, 'O', { r: 20 });
      const h1 = S.teilchen(mx - 34, my + 26, 'H', { r: 13 });
      const h2 = S.teilchen(mx + 34, my + 26, 'H', { r: 13 });
      S.bindung(mx, my, mx - 34, my + 26, { breite: 3 });
      S.bindung(mx, my, mx + 34, my + 26, { breite: 3 });
      const dm = S.text(mx, my - 30, '', { size: 12, weight: 700, farbe: FARBE.korr });
      const dp1 = S.text(mx - 50, my + 34, '', { size: 12, weight: 700, farbe: FARBE.b });
      const dp2 = S.text(mx + 50, my + 34, '', { size: 12, weight: 700, farbe: FARBE.b });
      const pfeil = S.add(el('line', { x1: mx, y1: my + 40, x2: mx, y2: my - 12, stroke: FARBE.c, 'stroke-width': 2.4, opacity: 0 }), 'vorn');

      const setz = u => {
        const geladen = u > 0.35;
        const ab = geladen ? Math.min(1, (u - 0.35) * 3) * 26 : 0;
        strahl.setAttribute('d', `M ${sx} 32 C ${sx} 90 ${sx + ab * 0.6} 120 ${sx + ab} 186`);
        stab.setAttribute('opacity', geladen ? 1 : 0.25);
        stabT.textContent = geladen ? 'geladen' : '';
        if (st !== 'A') {
          dm.textContent = 'δ−'; dp1.textContent = 'δ+'; dp2.textContent = 'δ+';
        }
        pfeil.setAttribute('opacity', st === 'C' ? 1 : 0);
        ables.innerHTML = st === 'A'
          ? (geladen ? 'Der Strahl wird <b>abgelenkt</b>.' : 'Ohne Ladung fällt der Strahl gerade.')
          : st === 'B'
            ? 'Der Sauerstoff trägt δ−, die Wasserstoffatome tragen δ+. Das Molekül ist ein <b>Dipol</b>.'
            : 'ΔEN(O−H) ≈ 1,4 → polare Elektronenpaarbindung. Weil das Molekül <b>gewinkelt</b> ist, addieren sich die Teilladungen zu einem Gesamtdipol.';
      };
      setz(0);

      const loop = Loop(t => setz(osz(t, 6)));
      const bar = steuerleiste(loop);
      host.appendChild(S.svg); host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });

  /* ---------- 12 · Ionenbildung (SZ-01) ---------- */
  register({
    id: 'ionenbildung', titel: 'Aus Atomen werden Ionen', bezug: 'SZ-01',
    kurz: 'A: eines gibt ab, eines nimmt auf · B: Ladung und Edelgaszustand · C: warum gerade diese Zahl.',
    text: {
      A: ['Natrium gibt ein Elektron ab.', 'Chlor nimmt es auf.', 'Beide sind danach geladen.'],
      B: ['Wer Elektronen abgibt, wird positiv geladen: Na⁺.', 'Wer aufnimmt, wird negativ geladen: Cl⁻.', 'Ungleiche Ladungen ziehen sich an.'],
      C: ['Beide erreichen die Außenelektronenzahl des nächsten Edelgases.', 'Die Zahl der abgegebenen oder aufgenommenen Elektronen steht in der Hauptgruppe — deshalb ist die Ionenladung vorhersagbar.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 330, hoehe: 190, alt: 'Ein Natriumatom gibt ein Elektron an ein Chloratom ab; beide werden zu Ionen.' });
      const ables = h('div', 'anim-ables');
      const cy = 88, lx = S.W * 0.27, rx = S.W * 0.73;

      const na = S.teilchen(lx, cy, 'Na', { r: 28 });
      const cl = S.teilchen(rx, cy, 'Cl', { r: 32 });
      const e = S.teilchen(lx + 28, cy - 26, 'x', { r: 6, fill: FARBE.b, beschriftet: false, ebene: 'vorn' });
      const lad1 = S.text(lx + 30, cy - 26, '', { size: 15, weight: 700, farbe: FARBE.korr });
      const lad2 = S.text(rx + 34, cy - 26, '', { size: 15, weight: 700, farbe: FARBE.b });
      const formel = S.text(S.W / 2, 168, '', { size: 15, weight: 700, mono: true });

      const setz = u => {
        const p = Math.min(1, u * 1.6);
        S.setPos(e, lx + 28 + p * (rx - lx - 60), cy - 26 - Math.sin(p * Math.PI) * 20);
        S.setOpacity(e, p < 1 ? 1 : 0);
        const fertig = p >= 1;
        S.setLabel(na, fertig ? 'Na⁺' : 'Na');
        S.setLabel(cl, fertig ? 'Cl⁻' : 'Cl');
        na.querySelector('circle').setAttribute('r', fertig ? 20 : 28);
        cl.querySelector('circle').setAttribute('r', fertig ? 38 : 32);
        lad1.textContent = fertig ? '+' : '';
        lad2.textContent = fertig ? '−' : '';
        formel.textContent = fertig ? 'Na⁺  +  Cl⁻' : '';
        ables.innerHTML = !fertig
          ? 'Das Elektron wandert vom Natrium zum Chlor …'
          : st === 'A' ? 'Natrium ist jetzt <b>positiv</b>, Chlor <b>negativ</b>.'
            : st === 'B' ? 'Na⁺ und Cl⁻ ziehen sich an. Aus zwei Atomen sind zwei <b>Ionen</b> geworden.'
              : 'Na erreicht die Konfiguration von Neon, Cl die von Argon.<br>Das Natrium-Ion ist deutlich <b>kleiner</b> als das Atom, das Chlorid-Ion deutlich größer — eine Schale weniger bzw. mehr Abstoßung in der Hülle.';
      };
      setz(0);

      const loop = Loop(t => setz((t % 5) / 3.4));
      const bar = steuerleiste(loop);
      host.appendChild(S.svg); host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });

  /* ---------- 13 · Ionengitter und Leitfähigkeit (SZ-02 / SZ-04) ---------- */
  register({
    id: 'ionengitter', titel: 'Gitter, Lösen und Leitfähigkeit', bezug: 'SZ-02',
    kurz: 'A: Kristall und Lösung · B: nur bewegliche Ionen leiten · C: Hydrathülle und Gitterenergie.',
    text: {
      A: ['Im festen Salz sitzen die Ionen auf festen Plätzen.', 'In Wasser können sie sich bewegen.'],
      B: ['Festes Salz leitet keinen Strom — die Ionen sind im Gitter gefangen.', 'Gelöstes oder geschmolzenes Salz leitet, weil die Ionen frei beweglich sind.'],
      C: ['Wassermoleküle lagern sich mit ihren Teilladungen um jedes Ion — die Hydrathülle.', 'Nur wenn die Hydratationsenergie die Gitterenergie annähernd ausgleicht, löst sich ein Salz gut.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 330, hoehe: 216, alt: 'Ein Ionengitter löst sich in Wasser auf; die Lampe im Stromkreis leuchtet erst danach.' });
      const ables = h('div', 'anim-ables');
      const kx = 22, ky = 46, kw = S.W - 44, kh = 128;
      S.kasten(kx, ky, kw, kh, { fill: '#EAF1F8' });

      const rnd = Wuerfel(23);
      const ionen = [];
      const sp = 4, ze = 4;
      for (let j = 0; j < ze; j++) for (let i = 0; i < sp; i++) {
        const pos = i % 2 === j % 2;
        ionen.push({
          g: S.teilchen(0, 0, pos ? 'Na' : 'Cl', { r: pos ? 12 : 15, label: pos ? '+' : '−' }),
          gitter: [kx + kw / 2 - 54 + i * 36, ky + 26 + j * 30],
          frei: [kx + 24 + rnd() * (kw - 48), ky + 20 + rnd() * (kh - 40)]
        });
      }
      /* Lampe */
      const lampe = S.add(el('circle', { cx: S.W / 2, cy: 22, r: 11, fill: FARBE.neutral, stroke: FARBE.ink, 'stroke-width': 1.4 }), 'vorn');
      S.text(S.W / 2 + 22, 26, 'Lampe', { anchor: 'start', size: 11.5, farbe: FARBE.weich });

      const setz = u => {
        ionen.forEach((io, i) => {
          const p = Math.max(0, Math.min(1, u * 1.4 - i * 0.02));
          const [ax, ay] = io.gitter, [bx, by] = io.frei;
          S.setPos(io.g, ax + (bx - ax) * p, ay + (by - ay) * p);
        });
        lampe.setAttribute('fill', u > 0.75 ? '#F0D36A' : FARBE.neutral);
        ables.innerHTML = u < 0.25
          ? (st === 'A' ? 'Festes Salz: die Ionen sitzen fest.' : 'Im Gitter sind die Ionen <b>nicht beweglich</b> — die Lampe bleibt dunkel.')
          : u > 0.75
            ? (st === 'A' ? 'Gelöst: die Ionen bewegen sich, die Lampe leuchtet.'
              : st === 'B' ? 'Gelöst sind die Ionen <b>frei beweglich</b> — der Strom fließt.'
                : 'Jedes Ion trägt eine Hydrathülle aus Wassermolekülen.<br>Erst wenn die Hydratationsenergie die <b>Gitterenergie</b> weitgehend ausgleicht, löst sich das Salz gut.')
            : 'Das Gitter löst sich auf …';
      };
      setz(0);

      const loop = Loop(t => setz(osz(t, 8)));
      const bar = steuerleiste(loop);
      host.appendChild(S.svg); host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });

  /* ---------- 14 · Elektronengas (ME-02) ---------- */
  register({
    id: 'elektronengas', titel: 'Metallbindung: das Elektronengas', bezug: 'ME-02',
    kurz: 'A: Metalle leiten und lassen sich biegen · B: Rümpfe und frei bewegliche Elektronen · C: Schichten verschieben sich ohne Bruch.',
    text: {
      A: ['Metalle leiten Strom.', 'Metalle lassen sich biegen, ohne zu zerbrechen.'],
      B: ['Im Metall geben die Atome ihre Außenelektronen ab.', 'Zurück bleiben positive Atomrümpfe in einem Gitter.', 'Die Elektronen bewegen sich frei dazwischen — das Elektronengas.'],
      C: ['Verschieben sich zwei Schichten, treffen wieder Rümpfe auf das Elektronengas — die Bindung bleibt bestehen.', 'Im Ionengitter träfen dagegen gleiche Ladungen aufeinander: Der Kristall springt. Genau das ist der Unterschied zwischen Metall und Salz.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 330, hoehe: 200, alt: 'Ein Metallgitter aus Atomrümpfen mit frei beweglichen Elektronen; zwei Schichten verschieben sich.' });
      const ables = h('div', 'anim-ables');
      const kx = 24, ky = 34, kw = S.W - 48, kh = 122;
      S.kasten(kx, ky, kw, kh, { fill: FARBE.paper });

      const sp = 5, ze = 4, dx = kw / (sp + 0.6), dy = kh / (ze + 0.6);
      const ruempfe = [];
      for (let j = 0; j < ze; j++) for (let i = 0; i < sp; i++) {
        ruempfe.push({ g: S.teilchen(0, 0, 'Cu', { r: 13, label: '+' }), i, j });
      }
      const rnd = Wuerfel(41);
      const elektronen = [];
      for (let i = 0; i < 14; i++) elektronen.push({
        g: S.teilchen(0, 0, 'x', { r: 4.4, fill: FARBE.b, stroke: FARBE.weiss, rand: 1.1, beschriftet: false, ebene: 'vorn' }),
        ph: rnd() * Math.PI * 2, r0: rnd()
      });

      const setz = (t, schub) => {
        ruempfe.forEach(r => {
          const versatz = (st !== 'A' && r.j < 2) ? schub * dx : 0;
          S.setPos(r.g, kx + dx * 0.55 + r.i * dx + versatz, ky + dy * 0.55 + r.j * dy);
        });
        elektronen.forEach((e, i) => {
          const x = kx + 16 + ((e.r0 * kw + t * 40 * (i % 2 ? 1 : -1)) % (kw - 32) + (kw - 32)) % (kw - 32);
          const y = ky + 20 + (Math.sin(t * 1.6 + e.ph) * 0.5 + 0.5) * (kh - 40);
          S.setPos(e.g, x, y);
        });
        ables.innerHTML = st === 'A'
          ? 'Die kleinen blauen Teilchen sind frei beweglich. Deshalb <b>leitet</b> ein Metall.'
          : st === 'B'
            ? 'Positive <b>Atomrümpfe</b> im Gitter, dazwischen das frei bewegliche <b>Elektronengas</b>.'
            : (schub > 0.25
              ? 'Die Schichten sind verschoben — und die Bindung hält, weil überall wieder Rümpfe im Elektronengas liegen.'
              : 'Gleich verschieben sich die oberen beiden Schichten.');
      };
      setz(0, 0);

      const loop = Loop(t => setz(t, st === 'A' ? 0 : Math.max(0, Math.min(1, (osz(t, 7) - 0.3) * 2)) * 0.5));
      const bar = steuerleiste(loop);
      host.appendChild(S.svg); host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });

  /* ---------- 15 · Redoxreaktion (ME-05) ---------- */
  register({
    id: 'redox', titel: 'Elektronen wechseln die Seite', bezug: 'ME-05',
    kurz: 'A: der Nagel wird kupferfarben · B: wer gibt ab, wer nimmt auf · C: Teilgleichungen und Redoxreihe.',
    text: {
      A: ['Ein Eisennagel liegt in blauer Kupfersulfat-Lösung.', 'Der Nagel wird kupferfarben.', 'Die blaue Farbe wird schwächer.'],
      B: ['Das Eisen gibt Elektronen ab: Es wird oxidiert.', 'Das Kupfer-Ion nimmt sie auf: Es wird reduziert.', 'Beides passiert gleichzeitig — eine Redoxreaktion.'],
      C: ['Oxidation: Fe → Fe²⁺ + 2 e⁻ · Reduktion: Cu²⁺ + 2 e⁻ → Cu', 'Das unedlere Metall gibt ab. Umgekehrt läuft es nicht: Ein Kupferblech in Eisensulfat-Lösung bleibt unverändert.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 330, hoehe: 208, alt: 'Ein Eisennagel in Kupfersulfat-Lösung überzieht sich mit Kupfer, während die Lösung entfärbt.' });
      const ables = h('div', 'anim-ables');
      const cx = S.W / 2;

      const loesung = S.add(el('rect', { x: cx - 66, y: 66, width: 132, height: 96, fill: '#5B8FD0' }), 'hinten');
      S.add(el('path', { d: `M ${cx - 66} 46 L ${cx - 66} 162 L ${cx + 66} 162 L ${cx + 66} 46`, fill: 'none', stroke: FARBE.ink, 'stroke-width': 2 }), 'mitte');
      const nagel = S.add(el('rect', { x: cx - 9, y: 56, width: 18, height: 96, rx: 3, fill: '#7E8B99', stroke: FARBE.ink, 'stroke-width': 1.2 }), 'mitte');
      const e1 = S.teilchen(cx + 14, 100, 'x', { r: 5, fill: FARBE.b, beschriftet: false, ebene: 'vorn' });
      const e2 = S.teilchen(cx + 14, 126, 'x', { r: 5, fill: FARBE.b, beschriftet: false, ebene: 'vorn' });
      const ion = S.teilchen(cx + 46, 113, 'Cu', { r: 14, label: 'Cu²⁺', ebene: 'vorn' });
      const gl1 = S.text(cx, 182, '', { size: 12, mono: true, farbe: FARBE.a });
      const gl2 = S.text(cx, 198, '', { size: 12, mono: true, farbe: FARBE.c });

      const setz = u => {
        const p = Math.min(1, u * 1.3);
        S.setPos(e1, cx + 14 + p * 30, 100);
        S.setPos(e2, cx + 14 + p * 30, 126);
        S.setOpacity(e1, p < 1 ? 1 : 0); S.setOpacity(e2, p < 1 ? 1 : 0);
        S.setPos(ion, cx + 46 - p * 34, 113);
        S.setLabel(ion, p >= 1 ? 'Cu' : 'Cu²⁺');
        ion.querySelector('circle').setAttribute('fill', p >= 1 ? '#B5732F' : '#5E90CE');
        nagel.setAttribute('fill', p >= 1 ? '#B5732F' : '#7E8B99');
        loesung.setAttribute('fill', `rgb(${Math.round(91 + p * 90)}, ${Math.round(143 + p * 70)}, ${Math.round(208 - p * 20)})`);
        if (st === 'C') { gl1.textContent = 'Fe → Fe²⁺ + 2 e⁻   (Oxidation)'; gl2.textContent = 'Cu²⁺ + 2 e⁻ → Cu   (Reduktion)'; }
        ables.innerHTML = p < 1
          ? (st === 'A' ? 'Etwas wandert vom Nagel zum blauen Teilchen …' : 'Zwei Elektronen wandern vom Eisen zum Kupfer-Ion …')
          : st === 'A' ? 'Der Nagel ist <b>kupferfarben</b>, die Lösung heller.'
            : st === 'B' ? 'Eisen wurde <b>oxidiert</b>, Kupfer <b>reduziert</b> — beides zugleich.'
              : 'Das unedlere Eisen gibt ab. Umgekehrt läuft es nicht — die Redoxreihe gibt die Richtung vor.';
      };
      setz(0);

      const loop = Loop(t => setz((t % 5) / 3.2));
      const bar = steuerleiste(loop);
      host.appendChild(S.svg); host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });
})();

/* ============================================================
   animationen.js · Teil 7 — Nachträge

   Zwei Animationen, auf die Einheiten verweisen: das Lösen eines Salzes
   (WA-05, SZ-04) und die Isomerie (KW-04).
   ============================================================ */
(function () {
  'use strict';
  const I = window.ANIM._intern, C = window.ANIM._chem;
  const { Loop, steuerleiste, abzeichen, register, FARBE, fmt, osz, h, el, stufeVon, REDUCED } = I;
  const { Szene, Wuerfel } = C;

  /* ---------- Lösen eines Salzes (WA-05 / SZ-04) ---------- */
  register({
    id: 'loesen', titel: 'Wie sich ein Salz löst', bezug: 'WA-05',
    kurz: 'A: das Salz verschwindet nicht · B: Wasserdipole lösen die Ionen heraus · C: Hydrathülle und Energiebilanz.',
    text: {
      A: ['Salz gibt man in Wasser.', 'Es sieht aus, als wäre es weg.', 'Das Wasser schmeckt trotzdem salzig.'],
      B: ['Die Wassermoleküle sind Dipole.', 'Mit ihrem negativen Ende ziehen sie die positiven Ionen an, mit dem positiven Ende die negativen.', 'So werden die Ionen einzeln aus dem Gitter gelöst und umhüllt.'],
      C: ['Das Auseinandernehmen des Gitters kostet Energie — die Gitterenergie.', 'Beim Umhüllen der Ionen wird Energie frei — die Hydratationsenergie.', 'Sind beide etwa gleich groß, löst sich das Salz gut. Überwiegt die Gitterenergie deutlich, bleibt es ungelöst — deshalb ist Bariumsulfat praktisch unlöslich.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 340, hoehe: 210, alt: 'Ein Salzgitter löst sich; Wassermoleküle umhüllen die einzelnen Ionen.' });
      const ables = h('div', 'anim-ables');
      const kx = 20, ky = 30, kw = S.W - 40, kh = 140;
      S.kasten(kx, ky, kw, kh, { fill: '#EAF1F8' });

      const rnd = Wuerfel(97);
      /* Vier Ionen im Gitter, die sich herauslösen. */
      const ionen = [];
      for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
        const pos = (i + j) % 2 === 0;
        ionen.push({
          g: S.teilchen(0, 0, pos ? 'Na' : 'Cl', { r: pos ? 13 : 16, label: pos ? '+' : '−', ebene: 'mitte' }),
          gitter: [kx + kw / 2 - 20 + i * 40, ky + 42 + j * 40],
          frei: [kx + 40 + rnd() * (kw - 80), ky + 26 + rnd() * (kh - 52)],
          pos
        });
      }
      /* Wassermoleküle, die sich anlagern. */
      const wasser = [];
      for (let k = 0; k < 12; k++) {
        wasser.push({
          g: S.teilchen(0, 0, 'O', { r: 6.5, beschriftet: false, ebene: 'hinten' }),
          ion: k % ionen.length, winkel: (Math.floor(k / ionen.length) / 3) * Math.PI * 2 + rnd()
        });
      }

      const setz = u => {
        const p = Math.max(0, Math.min(1, u * 1.4));
        ionen.forEach((io, k) => {
          const q = Math.max(0, Math.min(1, p * 1.3 - k * 0.06));
          const [ax, ay] = io.gitter, [bx, by] = io.frei;
          S.setPos(io.g, ax + (bx - ax) * q, ay + (by - ay) * q);
          io._x = ax + (bx - ax) * q; io._y = ay + (by - ay) * q;
        });
        wasser.forEach(w => {
          const io = ionen[w.ion];
          const r = 26 + (1 - p) * 40;               /* erst weit weg, dann eng am Ion */
          S.setPos(w.g, io._x + Math.cos(w.winkel) * r, io._y + Math.sin(w.winkel) * r);
          S.setOpacity(w.g, st === 'A' ? 0 : Math.min(1, p * 1.6));
        });

        ables.innerHTML = p < 0.25
          ? (st === 'A' ? 'Das Salz liegt noch als Kristall vor.' : 'Im Gitter sitzen die Ionen auf festen Plätzen.')
          : p > 0.85
            ? (st === 'A' ? 'Die Teilchen sind im Wasser verteilt — <b>nicht verschwunden</b>.'
              : st === 'B' ? 'Jedes Ion trägt jetzt eine <b>Hydrathülle</b> aus Wassermolekülen.'
                : 'Aufgewendet wurde die <b>Gitterenergie</b>, frei wurde die <b>Hydratationsenergie</b>.<br>Ihr Verhältnis entscheidet, ob sich ein Salz überhaupt löst.')
            : 'Die Wasserdipole ziehen die Ionen aus dem Gitter …';
      };
      setz(0);

      const loop = Loop(t => setz(osz(t, 9)));
      const bar = steuerleiste(loop);
      host.appendChild(S.svg); host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });

  /* ---------- Isomerie (KW-04) ---------- */
  register({
    id: 'isomerie', titel: 'Gleiche Formel, anderer Bau', bezug: 'KW-04',
    kurz: 'A: zwei Anordnungen derselben Atome · B: Hauptkette und Seitenkette · C: warum sie verschieden sieden.',
    text: {
      A: ['Vier Kohlenstoffatome lassen sich auf zwei Arten verknüpfen.', 'Beide haben dieselbe Summenformel.', 'Trotzdem sind es zwei Stoffe.'],
      B: ['Butan ist eine gerade Kette aus vier C-Atomen.', 'Bei 2-Methylpropan bilden drei C-Atome die Hauptkette, das vierte hängt als Seitenkette daran.', 'Die Zahl der Atome ist in beiden Fällen gleich: C₄H₁₀.'],
      C: ['Das gestreckte Molekül berührt seine Nachbarn auf großer Fläche — die van-der-Waals-Kräfte sind stark.', 'Das verzweigte ist kompakter und berührt weniger — die Anziehung ist schwächer.', 'Deshalb siedet Butan bei −0,5 °C, das verzweigte Isomer schon bei −11,7 °C. Gleiche Masse, andere Gestalt, andere Eigenschaft.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 340, hoehe: 210, alt: 'Zwei Isomere mit der Summenformel C4H10: eine gerade und eine verzweigte Kette.' });
      const ables = h('div', 'anim-ables');
      const cy = 104;

      /* Vier C-Atome; ihre Lage wechselt zwischen gerade und verzweigt. */
      const gerade = [[-66, 0], [-22, 0], [22, 0], [66, 0]];
      const verzweigt = [[-52, 12], [0, 12], [52, 12], [0, -36]];
      const bindGerade = [[0, 1], [1, 2], [2, 3]];
      const bindVerzweigt = [[0, 1], [1, 2], [1, 3]];

      const bind = [];
      for (let i = 0; i < 3; i++) bind.push(S.bindung(0, 0, 0, 0, { breite: 3, ebene: 'hinten' }));
      const kohlen = [];
      for (let i = 0; i < 4; i++) kohlen.push(S.teilchen(0, cy, 'C', { r: 16 }));
      const name = S.text(S.W / 2, 26, '', { size: 15, weight: 700 });
      const formel = S.text(S.W / 2, 182, 'C₄H₁₀', { size: 14, mono: true, farbe: FARBE.weich });
      const sied = S.text(S.W / 2, 200, '', { size: 12, farbe: FARBE.weich });

      const setz = u => {
        /* u = 0 gerade, u = 1 verzweigt; dazwischen wird überblendet. */
        const mitte = S.W / 2;
        for (let i = 0; i < 4; i++) {
          const [ax, ay] = gerade[i], [bx, by] = verzweigt[i];
          S.setPos(kohlen[i], mitte + ax + (bx - ax) * u, cy + ay + (by - ay) * u);
          kohlen[i]._px = mitte + ax + (bx - ax) * u;
          kohlen[i]._py = cy + ay + (by - ay) * u;
        }
        const paare = u > 0.5 ? bindVerzweigt : bindGerade;
        bind.forEach((b, i) => {
          const [a, c] = paare[i];
          S.setBindung(b, kohlen[a]._px, kohlen[a]._py, kohlen[c]._px, kohlen[c]._py);
        });

        const verzweigtJetzt = u > 0.5;
        name.textContent = verzweigtJetzt ? '2-Methylpropan' : 'Butan';
        sied.textContent = st === 'A' ? '' : (verzweigtJetzt ? 'Siedepunkt −11,7 °C' : 'Siedepunkt −0,5 °C');
        ables.innerHTML = st === 'A'
          ? `<b>${verzweigtJetzt ? '2-Methylpropan' : 'Butan'}</b> — dieselben Atome, andere Anordnung.`
          : st === 'B'
            ? (verzweigtJetzt
              ? 'Hauptkette aus <b>drei</b> C-Atomen, eine Methyl-Gruppe als Seitenkette.'
              : 'Gerade Hauptkette aus <b>vier</b> C-Atomen.')
            : (verzweigtJetzt
              ? 'Kompakt gebaut → kleinere Kontaktfläche → schwächere van-der-Waals-Kräfte → <b>−11,7 °C</b>.'
              : 'Gestreckt gebaut → große Kontaktfläche → stärkere van-der-Waals-Kräfte → <b>−0,5 °C</b>.');
      };
      setz(0);

      const loop = Loop(t => setz(osz(t, 6) > 0.5 ? 1 : 0));
      const bar = steuerleiste(loop);
      host.appendChild(S.svg);
      if (st !== 'A') {
        const leiste = h('div', 'anim-schalter');
        [['Butan', 0], ['2-Methylpropan', 1]].forEach(([n, v]) => {
          const b = h('button', 'anim-schalt', n);
          b.type = 'button';
          b.addEventListener('click', () => { loop.pause(); bar._sync(); setz(v); });
          leiste.appendChild(b);
        });
        host.appendChild(leiste);
      }
      host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });
})();

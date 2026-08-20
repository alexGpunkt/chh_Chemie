/* ============================================================
   animationen-9.js · Klassen 9 und 10 (QB · SL · KW · AL · OS · ES)
   Nachgeladen von animationen.js. Der Rahmen (Feld, Loop, Szene,
   register) steht dort; hier stehen nur die Fachteile.
   ============================================================ */
/* ============================================================
   animationen.js · Teil 6 — Klassen 9 und 10 (QB · SL · KW · AL · OS · ES)
   ============================================================ */
(function () {
  'use strict';
  const I = window.ANIM._intern, C = window.ANIM._chem;
  const { Loop, steuerleiste, regler, abzeichen, register, FARBE, fmt, osz, h, el, stufeVon, REDUCED } = I;
  const { Szene, Wuerfel, elFarbe } = C;

  /* ---------- 16 · Das Mol (QB-02 / QB-03) ---------- */
  register({
    id: 'mol', titel: 'Masse, Stoffmenge, Teilchenzahl', bezug: 'QB-02',
    kurz: 'A: gleiche Anzahl, andere Masse · B: n = m : M · C: das Dreieck in alle drei Richtungen.',
    text: {
      A: ['1 mol ist immer dieselbe Anzahl Teilchen.', 'Die Masse ist trotzdem verschieden.'],
      B: ['Die molare Masse M steht im Periodensystem, in g/mol.', 'n = m : M rechnet von der Masse zur Stoffmenge.', 'm = n · M rechnet zurück.'],
      C: ['1 mol enthält 6,022 · 10²³ Teilchen — die Avogadro-Konstante.', 'Aus jeder zwei der drei Größen m, n und M folgt die dritte. Welche gesucht ist, entscheidet die Einheit in der Frage.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 330, hoehe: 210, alt: 'Zwei Waagschalen mit je einem Mol verschiedener Stoffe.' });
      const ables = h('div', 'anim-ables');

      const stoffe = [
        { name: 'Kohlenstoff', formel: 'C', M: 12 }, { name: 'Eisen', formel: 'Fe', M: 56 },
        { name: 'Wasser', formel: 'H₂O', M: 18 }, { name: 'Schwefel', formel: 'S', M: 32 }
      ];
      let n = 1, idx = 0;

      const bx = S.W / 2, by = 96;
      const haufen = S.add(el('ellipse', { cx: bx, cy: by, rx: 40, ry: 22, fill: '#7E8B99', stroke: FARBE.ink, 'stroke-width': 1.3 }), 'mitte');
      S.add(el('rect', { x: bx - 74, y: by + 24, width: 148, height: 10, rx: 3, fill: FARBE.neutral, stroke: FARBE.ink, 'stroke-width': 1.2 }), 'hinten');
      S.add(el('rect', { x: bx - 62, y: by + 40, width: 124, height: 28, rx: 5, fill: FARBE.weiss, stroke: FARBE.ink, 'stroke-width': 1.6 }), 'hinten');
      const anzeige = S.text(bx, by + 59, '', { mono: true, size: 15, weight: 700 });
      const kopf = S.text(bx, 26, '', { size: 14, weight: 700 });
      const teilchen = S.text(bx, by + 92, '', { size: 12, mono: true, farbe: FARBE.weich });

      const zeige = () => {
        const s = stoffe[idx], m = n * s.M;
        haufen.setAttribute('rx', 18 + Math.cbrt(m) * 5.5);
        haufen.setAttribute('ry', 10 + Math.cbrt(m) * 3);
        haufen.setAttribute('fill', elFarbe(s.formel.replace(/[₀-₉]/g, '')) || '#7E8B99');
        kopf.textContent = `${s.name} (${s.formel}) · M = ${s.M} g/mol`;
        anzeige.textContent = `${fmt(m)} g`;
        teilchen.textContent = st === 'C' ? `${fmt(n)} mol · ${fmt(n * 6.022)} · 10²³ Teilchen` : '';
        ables.innerHTML = st === 'A'
          ? `<b>${fmt(n)} mol</b> ${s.name} wiegen <b>${fmt(m)} g</b>. Die Teilchenzahl ist bei jedem Stoff dieselbe.`
          : `m = n · M = ${fmt(n)} mol · ${s.M} g/mol = <b>${fmt(m)} g</b>`
            + (st === 'C' ? `<br>umgekehrt: n = m : M = ${fmt(m)} g : ${s.M} g/mol = ${fmt(n)} mol` : '');
      };
      zeige();

      const loop = Loop(t => { idx = Math.floor(t / 2.6) % stoffe.length; zeige(); });
      const bar = steuerleiste(loop);
      host.appendChild(S.svg);
      if (st !== 'A') host.appendChild(regler({
        label: 'Stoffmenge n in mol', min: 0.5, max: 3, step: 0.5, wert: 1,
        onInput: v => { n = v; zeige(); }
      }));
      host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });

  /* ---------- 17 · pH-Wert und Verdünnen (SL-02) ---------- */
  register({
    id: 'phwert', titel: 'Die pH-Skala', bezug: 'SL-02',
    kurz: 'A: sauer, neutral, alkalisch · B: Alltagsstoffe einordnen · C: eine Stufe ist der Faktor 10.',
    text: {
      A: ['Unter 7 ist sauer.', 'Genau 7 ist neutral.', 'Über 7 ist alkalisch.'],
      B: ['Der Indikator zeigt den pH-Wert als Farbe an.', 'Zitronensaft liegt bei etwa 2, Seifenlauge bei etwa 10.'],
      C: ['Eine pH-Stufe entspricht dem Faktor 10 bei der Konzentration der Oxonium-Ionen.', 'Zehnfaches Verdünnen verschiebt den pH-Wert um genau eine Stufe Richtung 7 — weiter als bis 7 geht es dabei nie.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 340, hoehe: 176, alt: 'Eine pH-Skala mit einer wandernden Marke und Alltagsstoffen.' });
      const ables = h('div', 'anim-ables');
      const l = 20, r = S.W - 20, y = 62, hh = 28;
      const X = p => l + (p / 14) * (r - l);

      const uid = 'g' + Math.random().toString(36).slice(2, 7);
      const defs = el('defs');
      const grad = el('linearGradient', { id: uid, x1: 0, y1: 0, x2: 1, y2: 0 });
      [[0, '#C43B32'], [0.22, '#E08A2E'], [0.42, '#D9C22B'], [0.5, '#4E9A51'],
       [0.62, '#2F8F9B'], [0.8, '#2F6BB5'], [1, '#6B3FA0']].forEach(([off, c]) =>
        grad.appendChild(el('stop', { offset: off, 'stop-color': c })));
      defs.appendChild(grad); S.svg.appendChild(defs);
      S.add(el('rect', { x: l, y, width: r - l, height: hh, rx: 5, fill: `url(#${uid})`, stroke: FARBE.ink, 'stroke-width': 1.2 }), 'hinten');
      for (let p = 0; p <= 14; p++) {
        S.add(el('line', { x1: X(p), y1: y + hh, x2: X(p), y2: y + hh + (p % 7 === 0 ? 8 : 4), stroke: FARBE.weich, 'stroke-width': 1.2 }), 'mitte');
        if (p % 2 === 0) S.text(X(p), y + hh + 20, String(p), { size: 11, mono: true });
      }
      S.text(X(0) + 4, y - 10, 'sauer', { anchor: 'start', size: 12, farbe: FARBE.weich });
      S.text(X(7), y - 10, 'neutral', { size: 12, farbe: FARBE.weich });
      S.text(X(14) - 4, y - 10, 'alkalisch', { anchor: 'end', size: 12, farbe: FARBE.weich });

      const marke = S.add(el('line', { x1: X(2), y1: y - 4, x2: X(2), y2: y + hh + 4, stroke: FARBE.ink, 'stroke-width': 3 }), 'vorn');
      const stoffT = S.text(X(2), 34, '', { size: 13, weight: 700 });

      const stoffe = [['Magensäure', 1], ['Zitronensaft', 2], ['Regenwasser', 5.6], ['reines Wasser', 7],
        ['Seifenlauge', 10], ['Rohrreiniger', 13]];
      let verd = 0;

      const zeige = (pH, name) => {
        const x = X(pH);
        marke.setAttribute('x1', x); marke.setAttribute('x2', x);
        stoffT.setAttribute('x', Math.max(l + 30, Math.min(r - 30, x)));
        stoffT.textContent = name ? `${name} · pH ${fmt(pH)}` : `pH ${fmt(pH)}`;
        ables.innerHTML = st === 'A'
          ? `pH ${fmt(pH)} — <b>${pH < 7 ? 'sauer' : pH > 7 ? 'alkalisch' : 'neutral'}</b>`
          : st === 'B'
            ? `${name || 'Lösung'} · pH ${fmt(pH)} — ${pH < 7 ? 'saure' : pH > 7 ? 'alkalische' : 'neutrale'} Lösung`
            : `pH ${fmt(pH)} · c(H₃O⁺) = 10<sup>−${fmt(pH)}</sup> mol/l — jede Stufe ist der <b>Faktor 10</b>.`;
      };

      let loop;
      if (st === 'C') {
        /* Verdünnungsreihe: jede Stufe ein Zehntel. */
        loop = Loop(t => {
          verd = Math.floor(t / 1.6) % 5;
          const pH = Math.min(7, 1 + verd);
          zeige(pH, `${verd}× zehnfach verdünnt`);
          ables.innerHTML = `Start pH 1 · ${verd}-mal zehnfach verdünnt → <b>pH ${fmt(pH)}</b><br>`
            + 'Jede Verdünnung um den Faktor 10 verschiebt den pH-Wert um genau eine Stufe — aber nie über 7 hinaus.';
        });
        zeige(1, 'Start');
      } else {
        loop = Loop(t => { const k = Math.floor(t / 2) % stoffe.length; zeige(stoffe[k][1], stoffe[k][0]); });
        zeige(stoffe[0][1], stoffe[0][0]);
      }
      const bar = steuerleiste(loop);
      host.appendChild(S.svg); host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });

  /* ---------- 18 · Protolyse (SL-03) ---------- */
  register({
    id: 'protolyse', titel: 'Eine Säure gibt ein Proton ab', bezug: 'SL-03',
    kurz: 'A: im Wasser entstehen Ionen · B: das Proton wechselt · C: Donator und Akzeptor.',
    text: {
      A: ['Chlorwasserstoff wird in Wasser gegeben.', 'Es entstehen geladene Teilchen.', 'Die Lösung ist sauer.'],
      B: ['Das Molekül gibt ein Proton — ein H⁺-Ion — an das Wasser ab.', 'Es entstehen ein Oxonium-Ion H₃O⁺ und ein Chlorid-Ion Cl⁻.', 'H₃O⁺ macht die Lösung sauer.'],
      C: ['HCl ist der Protonendonator, Wasser der Protonenakzeptor.', 'Reines HCl-Gas färbt trockenes Indikatorpapier nicht — erst das Wasser macht aus der Säure eine saure Lösung.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 330, hoehe: 190, alt: 'Ein Chlorwasserstoff-Molekül gibt ein Proton an ein Wassermolekül ab.' });
      const ables = h('div', 'anim-ables');
      const cy = 92, lx = S.W * 0.26, rx = S.W * 0.72;

      const cl = S.teilchen(lx + 22, cy, 'Cl', { r: 22 });
      const hp = S.teilchen(lx - 12, cy, 'H', { r: 13, ebene: 'vorn' });
      const bind = S.bindung(lx - 12, cy, lx + 22, cy, { breite: 2.6 });
      const oW = S.teilchen(rx, cy, 'O', { r: 20 });
      const w1 = S.teilchen(rx - 28, cy + 24, 'H', { r: 12 });
      const w2 = S.teilchen(rx + 28, cy + 24, 'H', { r: 12 });
      S.bindung(rx, cy, rx - 28, cy + 24, { breite: 2.6 });
      S.bindung(rx, cy, rx + 28, cy + 24, { breite: 2.6 });
      const ladung1 = S.text(lx + 46, cy - 20, '', { size: 14, weight: 700, farbe: FARBE.b });
      const ladung2 = S.text(rx + 26, cy - 22, '', { size: 14, weight: 700, farbe: FARBE.korr });
      const gl = S.text(S.W / 2, 168, '', { size: 13, weight: 700, mono: true });

      const setz = u => {
        const p = Math.min(1, u * 1.4);
        const x = lx - 12 + p * (rx - 14 - (lx - 12));
        const yy = cy - Math.sin(p * Math.PI) * 26;
        S.setPos(hp, x, yy);
        S.setBindung(bind, p < 1 ? x : rx, p < 1 ? yy : cy - 22, lx + 22, cy);
        bind.setAttribute('opacity', p < 1 ? 1 - p * 0.9 : 0);
        const fertig = p >= 1;
        if (fertig) S.setPos(hp, rx, cy - 26);
        S.setLabel(cl, fertig ? 'Cl' : 'Cl');
        ladung1.textContent = fertig ? '−' : '';
        ladung2.textContent = fertig ? '+' : '';
        gl.textContent = fertig ? 'HCl + H₂O → H₃O⁺ + Cl⁻' : '';
        ables.innerHTML = !fertig
          ? 'Das Proton wandert zum Wassermolekül …'
          : st === 'A' ? 'Es sind zwei <b>geladene Teilchen</b> entstanden. Die Lösung ist sauer.'
            : st === 'B' ? 'Entstanden sind <b>H₃O⁺</b> (Oxonium-Ion) und <b>Cl⁻</b> (Chlorid-Ion).'
              : 'HCl ist der <b>Protonendonator</b>, H₂O der <b>Protonenakzeptor</b>.<br>Ohne Wasser gibt es keine saure Lösung — trockenes Indikatorpapier bleibt farblos.';
      };
      setz(0);

      const loop = Loop(t => setz((t % 5) / 3.2));
      const bar = steuerleiste(loop);
      host.appendChild(S.svg); host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });

  /* ---------- 19 · Neutralisation und Titration (SL-06) ---------- */
  register({
    id: 'neutralisation', titel: 'Neutralisation', bezug: 'SL-06',
    kurz: 'A: Farbumschlag · B: H₃O⁺ und OH⁻ werden zu Wasser · C: der Äquivalenzpunkt.',
    text: {
      A: ['Zu einer sauren Lösung wird Lauge gegeben.', 'Der Indikator schlägt um.'],
      B: ['H₃O⁺ und OH⁻ reagieren zu Wasser.', 'Die übrigen Ionen bilden ein Salz.', 'Am Ende ist die Lösung neutral.'],
      C: ['Am Äquivalenzpunkt sind H₃O⁺ und OH⁻ in genau gleicher Stoffmenge umgesetzt.', 'Ein Tropfen zu viel kippt den pH-Wert weit — deshalb steigt die Titrationskurve dort so steil.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 330, hoehe: 226, alt: 'Eine Titration mit Farbumschlag und Titrationskurve.' });
      const ables = h('div', 'anim-ables');
      const cx = S.W * 0.28;

      S.add(el('rect', { x: cx - 10, y: 16, width: 20, height: 78, rx: 3, fill: FARBE.weiss, stroke: FARBE.ink, 'stroke-width': 1.6 }), 'hinten');
      const buerette = S.add(el('rect', { x: cx - 10, y: 16, width: 20, height: 60, fill: '#C9A2DA' }), 'hinten');
      S.add(el('path', { d: `M ${cx} 108 L ${cx - 46} 168 L ${cx + 46} 168 Z`, fill: 'none', stroke: FARBE.ink, 'stroke-width': 2 }), 'mitte');
      const inhalt = S.add(el('path', { d: `M ${cx - 26} 142 L ${cx - 46} 168 L ${cx + 46} 168 L ${cx + 26} 142 Z`, fill: '#F0B7B2' }), 'hinten');
      const tropfen = S.teilchen(cx, 100, 'x', { r: 4, fill: '#C9A2DA', beschriftet: false, ebene: 'vorn' });

      /* Titrationskurve rechts */
      const gx = S.W * 0.58, gy = 30, gw = S.W - gx - 16, gh = 130;
      S.add(el('line', { x1: gx, y1: gy + gh, x2: gx + gw, y2: gy + gh, stroke: FARBE.weich, 'stroke-width': 1.4 }), 'hinten');
      S.add(el('line', { x1: gx, y1: gy + gh, x2: gx, y2: gy, stroke: FARBE.weich, 'stroke-width': 1.4 }), 'hinten');
      S.text(gx - 4, gy + 6, 'pH', { anchor: 'end', size: 10.5, farbe: FARBE.weich });
      S.text(gx + gw, gy + gh + 14, 'V(Lauge)', { anchor: 'end', size: 10.5, farbe: FARBE.weich });
      const kurve = S.add(el('path', { d: '', fill: 'none', stroke: FARBE.b, 'stroke-width': 2.4 }), 'mitte');
      const punkt = S.teilchen(gx, gy + gh, 'x', { r: 4, fill: FARBE.c, beschriftet: false, ebene: 'vorn' });
      const aequi = S.add(el('line', { x1: gx + gw * 0.5, y1: gy, x2: gx + gw * 0.5, y2: gy + gh, stroke: FARBE.faint, 'stroke-width': 1.2, 'stroke-dasharray': '4 3', opacity: 0 }), 'hinten');

      const pHvon = v => 1 + 12 / (1 + Math.exp(-(v - 0.5) * 22));
      const kurvePunkte = [];
      for (let v = 0; v <= 1.001; v += 0.02) kurvePunkte.push([gx + v * gw, gy + gh - (pHvon(v) / 14) * gh]);
      kurve.setAttribute('d', 'M ' + kurvePunkte.map(p => p.join(' ')).join(' L '));
      kurve.setAttribute('opacity', st === 'C' ? 1 : 0.25);
      aequi.setAttribute('opacity', st === 'C' ? 1 : 0);

      const setz = u => {
        const pH = pHvon(u);
        S.setPos(tropfen, cx, 100 + ((u * 700) % 40));
        buerette.setAttribute('height', Math.max(2, 60 * (1 - u)));
        buerette.setAttribute('y', 16 + 60 * u);
        const farbe = pH < 6.5 ? '#F0B7B2' : pH < 8.5 ? '#E7C9DE' : '#C9A2DA';
        inhalt.setAttribute('fill', farbe);
        S.setPos(punkt, gx + u * gw, gy + gh - (pH / 14) * gh);
        ables.innerHTML = st === 'A'
          ? (pH < 6.5 ? 'noch <b>sauer</b>' : pH < 8.5 ? '<b>Umschlag!</b>' : 'jetzt <b>alkalisch</b>')
          : st === 'B'
            ? `pH ${fmt(pH)} · <span class="anim-formel">H₃O⁺ + OH⁻ → 2 H₂O</span>`
            : `pH ${fmt(pH)} · ${Math.abs(u - 0.5) < 0.06 ? '<b>Äquivalenzpunkt</b> — ein Tropfen entscheidet' : 'vor bzw. nach dem Äquivalenzpunkt ändert sich der pH-Wert kaum'}`;
      };
      setz(0);

      const loop = Loop(t => setz(Math.min(1, (t % 7) / 5.5)));
      const bar = steuerleiste(loop);
      host.appendChild(S.svg); host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });

  /* ---------- 20 · Homologe Reihe (KW-02 / AL-02 / OS-02) ---------- */
  register({
    id: 'homologereihe', titel: 'Die homologe Reihe', bezug: 'KW-02',
    kurz: 'A: die Kette wächst · B: immer CH₂ mehr · C: Name, Summenformel und Eigenschaften laufen mit.',
    text: {
      A: ['Die Kette wird um ein C-Atom länger.', 'Der Name ändert sich mit.'],
      B: ['Von einem Glied zum nächsten kommt immer eine CH₂-Gruppe dazu.', 'Für Alkane gilt die allgemeine Formel CₙH₂ₙ₊₂.'],
      C: ['Gleiche Bauweise, gleiche Reaktionen — nur die Kettenlänge ändert sich.', 'Deshalb ändern sich Schmelz- und Siedetemperatur regelmäßig, nicht sprunghaft: eine Reihe, keine Sammlung von Einzelfällen.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const gruppe = (o && o.gruppe) || 'alkan';   // alkan | alkanol | alkansaeure
      const S = Szene({ breite: o.breite || 340, hoehe: 200, alt: 'Eine Kohlenstoffkette, die Glied für Glied wächst.' });
      const ables = h('div', 'anim-ables');
      const cy = 96;

      const namen = ['Meth', 'Eth', 'Prop', 'But', 'Pent', 'Hex'];
      const endung = { alkan: 'an', alkanol: 'anol', alkansaeure: 'ansäure' }[gruppe];
      const maxN = 6;
      const kohlen = [], bind = [], wasser = [];
      for (let i = 0; i < maxN; i++) kohlen.push(S.teilchen(0, cy, 'C', { r: 15 }));
      for (let i = 0; i < maxN - 1; i++) bind.push(S.bindung(0, cy, 0, cy, { breite: 2.6 }));
      for (let i = 0; i < maxN * 3; i++) wasser.push(S.teilchen(0, 0, 'H', { r: 9 }));
      const gruppeKugel = S.teilchen(0, cy - 40, 'O', { r: 13, ebene: 'vorn' });
      const gruppeBind = S.bindung(0, cy, 0, cy - 40, { breite: 2.6 });
      const nameT = S.text(S.W / 2, 26, '', { size: 15, weight: 700 });
      const formelT = S.text(S.W / 2, 176, '', { size: 14, mono: true, weight: 700 });

      const zeige = n => {
        const dx = Math.min(48, (S.W - 80) / Math.max(1, n - 1) * (n > 1 ? 1 : 0) || 48);
        const x0 = S.W / 2 - (n - 1) * dx / 2;
        kohlen.forEach((k, i) => {
          S.setOpacity(k, i < n ? 1 : 0);
          S.setPos(k, x0 + i * dx, cy);
        });
        bind.forEach((b, i) => {
          b.setAttribute('opacity', i < n - 1 ? 1 : 0);
          S.setBindung(b, x0 + i * dx, cy, x0 + (i + 1) * dx, cy);
        });
        let w = 0;
        for (let i = 0; i < n; i++) {
          const frei = 4 - (i > 0 ? 1 : 0) - (i < n - 1 ? 1 : 0) - (gruppe !== 'alkan' && i === 0 ? 1 : 0);
          for (let k = 0; k < frei && w < wasser.length; k++, w++) {
            const winkel = [-Math.PI / 2, Math.PI / 2, Math.PI][k] ?? Math.PI;
            S.setOpacity(wasser[w], 1);
            S.setPos(wasser[w], x0 + i * dx + Math.cos(winkel) * 30, cy + Math.sin(winkel) * 30);
          }
        }
        for (; w < wasser.length; w++) S.setOpacity(wasser[w], 0);

        const zeigGruppe = gruppe !== 'alkan';
        S.setOpacity(gruppeKugel, zeigGruppe ? 1 : 0);
        gruppeBind.setAttribute('opacity', zeigGruppe ? 1 : 0);
        if (zeigGruppe) {
          S.setPos(gruppeKugel, x0, cy - 40);
          S.setBindung(gruppeBind, x0, cy, x0, cy - 40);
          S.setLabel(gruppeKugel, gruppe === 'alkanol' ? 'OH' : 'COOH');
        }

        const summ = gruppe === 'alkan' ? `C${n === 1 ? '' : sub(n)}H${sub(2 * n + 2)}`
          : gruppe === 'alkanol' ? `C${n === 1 ? '' : sub(n)}H${sub(2 * n + 1)}OH`
            : `C${n === 1 ? '' : sub(n)}H${sub(2 * n + 1)}COOH`;
        nameT.textContent = namen[n - 1] + endung;
        formelT.textContent = summ;
        ables.innerHTML = st === 'A'
          ? `<b>${namen[n - 1] + endung}</b> hat <b>${n}</b> Kohlenstoffatom${n === 1 ? '' : 'e'}.`
          : st === 'B'
            ? `<b>${namen[n - 1] + endung}</b> · ${summ} — von Glied zu Glied kommt <b>CH₂</b> dazu.`
            : `<b>${namen[n - 1] + endung}</b> · ${summ}` + (gruppe === 'alkan' ? ' · allgemeine Formel C<sub>n</sub>H<sub>2n+2</sub>' : '')
              + '<br>Gleicher Bau, gleiche Reaktionen — nur die Kettenlänge unterscheidet die Glieder.';
      };
      const sub = z => String(z).split('').map(c => '₀₁₂₃₄₅₆₇₈₉'[+c]).join('');
      zeige(1);

      let reg = null;
      const loop = Loop(t => { const n = 1 + Math.floor((t / 1.4) % maxN); if (reg) reg._input.value = n; zeige(n); });
      reg = regler({ label: 'Zahl der C-Atome', min: 1, max: maxN, step: 1, wert: 1, onInput: v => { loop.pause(); bar._sync(); zeige(v); } });
      const bar = steuerleiste(loop);
      host.appendChild(S.svg); host.appendChild(reg); host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });

  /* ---------- 21 · Siedetemperatur und van-der-Waals (KW-05) ---------- */
  register({
    id: 'siedekurve', titel: 'Warum längere Ketten später sieden', bezug: 'KW-05',
    kurz: 'A: längere Kette, höhere Temperatur · B: Werte ablesen · C: van-der-Waals-Kräfte als Ursache.',
    text: {
      A: ['Je länger die Kette, desto höher die Siedetemperatur.'],
      B: ['Methan siedet bei −162 °C, Butan bei −0,5 °C, Octan bei 126 °C.', 'Ab fünf C-Atomen sind Alkane bei Zimmertemperatur flüssig.'],
      C: ['Zwischen den Molekülen wirken van-der-Waals-Kräfte.', 'Je länger die Kette, desto größer die Berührungsfläche und desto stärker diese Kräfte — und desto mehr Energie braucht das Sieden.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 340, hoehe: 216, alt: 'Ein Diagramm der Siedetemperaturen der Alkane über der Zahl der Kohlenstoffatome.' });
      const ables = h('div', 'anim-ables');
      const gx = 46, gy = 26, gw = S.W - gx - 16, gh = 130;
      const daten = [[1, -162, 'Methan'], [2, -89, 'Ethan'], [3, -42, 'Propan'], [4, -0.5, 'Butan'],
        [5, 36, 'Pentan'], [6, 69, 'Hexan'], [7, 98, 'Heptan'], [8, 126, 'Octan']];
      const X = n => gx + (n - 1) / 7 * gw;
      const Y = T => gy + gh - (T + 180) / 330 * gh;

      S.add(el('line', { x1: gx, y1: gy + gh, x2: gx + gw, y2: gy + gh, stroke: FARBE.weich, 'stroke-width': 1.4 }), 'hinten');
      S.add(el('line', { x1: gx, y1: gy + gh, x2: gx, y2: gy, stroke: FARBE.weich, 'stroke-width': 1.4 }), 'hinten');
      [-150, -50, 50, 150].forEach(T => {
        S.add(el('line', { x1: gx, y1: Y(T), x2: gx + gw, y2: Y(T), stroke: FARBE.gitter, 'stroke-width': 1 }), 'hinten');
        S.text(gx - 5, Y(T) + 3.5, String(T), { anchor: 'end', size: 10, mono: true, farbe: FARBE.weich });
      });
      S.add(el('line', { x1: gx, y1: Y(20), x2: gx + gw, y2: Y(20), stroke: FARBE.korr, 'stroke-width': 1.2, 'stroke-dasharray': '5 4' }), 'hinten');
      S.text(gx + gw, Y(20) - 5, 'Zimmertemperatur', { anchor: 'end', size: 10, farbe: FARBE.korr });
      S.text(gx + gw / 2, gy + gh + 22, 'Zahl der C-Atome', { size: 11, farbe: FARBE.weich });
      S.text(gx - 6, gy - 8, '°C', { anchor: 'end', size: 10.5, farbe: FARBE.weich });
      daten.forEach(d => S.text(X(d[0]), gy + gh + 12, String(d[0]), { size: 10, mono: true, farbe: FARBE.weich }));

      const linie = S.add(el('polyline', { points: '', fill: 'none', stroke: FARBE.b, 'stroke-width': 2.4 }), 'mitte');
      const punkte = daten.map(d => S.teilchen(X(d[0]), Y(d[1]), 'x', { r: 4.2, fill: FARBE.b, stroke: FARBE.weiss, rand: 1.4, beschriftet: false, ebene: 'vorn' }));
      const marke = S.text(0, 0, '', { size: 11.5, weight: 700 });

      const zeige = k => {
        linie.setAttribute('points', daten.slice(0, k + 1).map(d => `${X(d[0])},${Y(d[1])}`).join(' '));
        punkte.forEach((p, i) => S.setOpacity(p, i <= k ? 1 : 0.12));
        const d = daten[k];
        marke.setAttribute('x', Math.min(gx + gw - 30, X(d[0]) + 8));
        marke.setAttribute('y', Y(d[1]) - 9);
        marke.textContent = st === 'A' ? '' : `${d[2]} · ${fmt(d[1])} °C`;
        ables.innerHTML = st === 'A'
          ? 'Je <b>länger</b> die Kette, desto <b>höher</b> die Siedetemperatur.'
          : st === 'B'
            ? `<b>${d[2]}</b> (C${d[0]}) siedet bei <b>${fmt(d[1])} °C</b> — ${d[1] < 20 ? 'bei Zimmertemperatur gasförmig' : 'bei Zimmertemperatur flüssig'}.`
            : `<b>${d[2]}</b> · ${fmt(d[1])} °C<br>Längere Ketten berühren einander auf größerer Fläche. Die <b>van-der-Waals-Kräfte</b> nehmen zu, und damit die zum Sieden nötige Energie.`;
      };
      zeige(0);

      const loop = Loop(t => zeige(Math.floor(t / 1.1) % daten.length));
      const bar = steuerleiste(loop);
      host.appendChild(S.svg); host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });

  /* ---------- 22 · Oxidationsreihe der Alkohole (AL-05) ---------- */
  register({
    id: 'funktionellegruppe', titel: 'Vom Alkohol zur Säure', bezug: 'AL-05',
    kurz: 'A: aus einem Stoff wird ein anderer · B: Alkohol → Alkanal → Säure · C: primär, sekundär, tertiär.',
    text: {
      A: ['Ein Alkohol wird oxidiert.', 'Dabei entsteht ein neuer Stoff.'],
      B: ['Ein primärer Alkohol wird erst zum Alkanal, dann zur Alkansäure.', 'Die funktionelle Gruppe entscheidet über die Stoffklasse.'],
      C: ['Primäre Alkohole werden zu Alkanalen und weiter zu Alkansäuren.', 'Sekundäre werden zu Alkanonen und dann nicht weiter.', 'Tertiäre Alkohole lassen sich gar nicht oxidieren — dem C-Atom fehlt das nötige Wasserstoffatom.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 340, hoehe: 200, alt: 'Eine funktionelle Gruppe wandelt sich von der Hydroxylgruppe über die Aldehyd- zur Carboxygruppe.' });
      const ables = h('div', 'anim-ables');
      const cy = 96, cx = S.W / 2;

      const c1 = S.teilchen(cx - 40, cy, 'C', { r: 16 });
      const c2 = S.teilchen(cx + 16, cy, 'C', { r: 16 });
      S.bindung(cx - 40, cy, cx + 16, cy, { breite: 2.6 });
      const oben = S.teilchen(cx + 16, cy - 44, 'O', { r: 14 });
      const bindOben = S.bindung(cx + 16, cy, cx + 16, cy - 44, { breite: 2.6 });
      const bindOben2 = S.add(el('line', { x1: cx + 22, y1: cy - 14, x2: cx + 22, y2: cy - 30, stroke: FARBE.ink, 'stroke-width': 2.6, opacity: 0 }), 'hinten');
      const rechts = S.teilchen(cx + 62, cy, 'H', { r: 12 });
      const bindRechts = S.bindung(cx + 16, cy, cx + 62, cy, { breite: 2.6 });
      const ohH = S.teilchen(cx + 52, cy - 44, 'H', { r: 11 });
      const bindOh = S.bindung(cx + 16, cy - 44, cx + 52, cy - 44, { breite: 2.4 });
      const klasse = S.text(cx, 26, '', { size: 15, weight: 700 });
      const formel = S.text(cx, 176, '', { size: 13, mono: true });

      const stufen = [
        { name: 'Alkohol (Alkanol)', gruppe: '–OH', f: 'CH₃–CH₂–OH', doppel: false, oh: true, hrechts: true },
        { name: 'Alkanal', gruppe: '–CHO', f: 'CH₃–CHO', doppel: true, oh: false, hrechts: true },
        { name: 'Alkansäure', gruppe: '–COOH', f: 'CH₃–COOH', doppel: true, oh: true, hrechts: false }
      ];

      const zeige = k => {
        const s = stufen[k];
        bindOben2.setAttribute('opacity', s.doppel ? 1 : 0);
        S.setOpacity(ohH, s.oh ? 1 : 0);
        bindOh.setAttribute('opacity', s.oh ? 1 : 0);
        if (!s.hrechts && s.oh && s.doppel) { S.setPos(ohH, cx + 62, cy); S.setBindung(bindOh, cx + 16, cy, cx + 62, cy); S.setLabel(ohH, 'OH'); }
        else { S.setPos(ohH, cx + 52, cy - 44); S.setBindung(bindOh, cx + 16, cy - 44, cx + 52, cy - 44); S.setLabel(ohH, 'H'); }
        S.setOpacity(rechts, s.hrechts ? 1 : 0);
        bindRechts.setAttribute('opacity', s.hrechts ? 1 : 0);
        klasse.textContent = s.name + '  ' + s.gruppe;
        formel.textContent = s.f;
        ables.innerHTML = st === 'A'
          ? `Aus dem Alkohol ist <b>${s.name}</b> geworden.`
          : st === 'B'
            ? `<b>${s.name}</b> · funktionelle Gruppe <b>${s.gruppe}</b>` + (k < 2 ? ' — Oxidation geht weiter' : ' — hier endet die Reihe')
            : `<b>${s.name}</b> ${s.gruppe}<br>Nur <b>primäre</b> Alkohole durchlaufen diese Reihe. Sekundäre enden beim Alkanon, tertiäre lassen sich gar nicht oxidieren.`;
      };
      zeige(0);

      const loop = Loop(t => zeige(Math.floor(t / 2.4) % 3));
      const bar = steuerleiste(loop);
      host.appendChild(S.svg); host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });

  /* ---------- 23 · Veresterung (ES-01) ---------- */
  register({
    id: 'veresterung', titel: 'Säure und Alkohol werden zum Ester', bezug: 'ES-01',
    kurz: 'A: zwei Stoffe, zwei Produkte · B: woher das Wasser kommt · C: Gleichgewicht und Katalyse.',
    text: {
      A: ['Eine Säure und ein Alkohol reagieren.', 'Es entstehen ein Ester und Wasser.'],
      B: ['Aus der Säure stammt die OH-Gruppe, aus dem Alkohol das H-Atom.', 'Zusammen ergeben sie das Wassermolekül.', 'Der Rest bleibt als Ester verbunden.'],
      C: ['Die Veresterung ist eine Kondensationsreaktion und stellt sich als Gleichgewicht ein.', 'Konzentrierte Schwefelsäure wirkt als Katalysator und entzieht zugleich Wasser — dadurch verschiebt sich das Gleichgewicht zum Ester.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 340, hoehe: 206, alt: 'Aus einer Carbonsäure und einem Alkohol entstehen ein Ester und ein Wassermolekül.' });
      const ables = h('div', 'anim-ables');
      const cy = 90;
      const saeureX = S.W * 0.26, alkoX = S.W * 0.74;

      const sC = S.teilchen(saeureX, cy, 'C', { r: 16 });
      const sO = S.teilchen(saeureX, cy - 40, 'O', { r: 13 });
      S.bindung(saeureX, cy, saeureX, cy - 40, { breite: 2.6 });
      const sOH = S.teilchen(saeureX + 42, cy, 'O', { r: 13, ebene: 'vorn' });
      const sOHb = S.bindung(saeureX, cy, saeureX + 42, cy, { breite: 2.6 });
      const sH = S.teilchen(saeureX + 42, cy + 34, 'H', { r: 10, ebene: 'vorn' });
      const sHb = S.bindung(saeureX + 42, cy, saeureX + 42, cy + 34, { breite: 2.2 });

      const aO = S.teilchen(alkoX - 42, cy, 'O', { r: 13 });
      const aC = S.teilchen(alkoX, cy, 'C', { r: 16 });
      S.bindung(alkoX - 42, cy, alkoX, cy, { breite: 2.6 });
      const aH = S.teilchen(alkoX - 42, cy - 34, 'H', { r: 10, ebene: 'vorn' });
      const aHb = S.bindung(alkoX - 42, cy, alkoX - 42, cy - 34, { breite: 2.2 });

      const bruecke = S.bindung(saeureX, cy, alkoX - 42, cy, { breite: 2.6 });
      bruecke.setAttribute('opacity', 0);
      const wasserO = S.teilchen(S.W / 2, 170, 'O', { r: 13, ebene: 'vorn' });
      const wasserT = S.text(S.W / 2 + 34, 175, '', { anchor: 'start', size: 13, weight: 700 });
      const kopfL = S.text(saeureX, 26, 'Carbonsäure', { size: 12, farbe: FARBE.weich });
      const kopfR = S.text(alkoX, 26, 'Alkohol', { size: 12, farbe: FARBE.weich });

      const setz = u => {
        const p = Math.min(1, Math.max(0, (u - 0.2) * 1.8));
        /* OH von der Säure und H vom Alkohol treffen sich unten in der Mitte */
        S.setPos(sOH, saeureX + 42 + p * (S.W / 2 - saeureX - 42), cy + p * (170 - cy));
        S.setPos(sH, saeureX + 42 + p * (S.W / 2 - 26 - saeureX - 42), cy + 34 + p * (170 - cy - 34));
        S.setPos(aH, alkoX - 42 + p * (S.W / 2 + 26 - alkoX + 42), cy - 34 + p * (170 - cy + 34));
        [sOHb, sHb, aHb].forEach(b => b.setAttribute('opacity', 1 - p));
        bruecke.setAttribute('opacity', p);
        S.setBindung(bruecke, saeureX, cy, alkoX - 42, cy);
        S.setOpacity(wasserO, 0);
        wasserT.textContent = p > 0.9 ? 'H₂O' : '';
        kopfL.textContent = p > 0.9 ? 'Ester' : 'Carbonsäure';
        kopfR.textContent = p > 0.9 ? '' : 'Alkohol';
        ables.innerHTML = p < 0.9
          ? (st === 'A' ? 'Zwei Teile lösen sich ab …' : 'Aus der Säure löst sich <b>OH</b>, aus dem Alkohol <b>H</b> …')
          : st === 'A' ? 'Fertig: ein <b>Ester</b> und ein Molekül <b>Wasser</b>.'
            : st === 'B' ? '<span class="anim-formel">R–COOH + HO–R\' ⇌ R–COO–R\' + H₂O</span><br>Das Wasser stammt aus <b>beiden</b> Molekülen.'
              : 'Die Reaktion stellt sich als <b>Gleichgewicht</b> ein.<br>Konzentrierte Schwefelsäure katalysiert und entzieht Wasser — das verschiebt das Gleichgewicht zum Ester.';
      };
      setz(0);

      const loop = Loop(t => setz((t % 6) / 4));
      const bar = steuerleiste(loop);
      host.appendChild(S.svg); host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });

  /* ---------- 24 · Seife (ES-04) ---------- */
  register({
    id: 'seife', titel: 'Wie Seife wirkt', bezug: 'ES-04',
    kurz: 'A: Fett wird abgelöst · B: Kopf und Schwanz · C: Micelle und Emulsion.',
    text: {
      A: ['Wasser allein löst Fett nicht.', 'Mit Seife geht es.'],
      B: ['Ein Seifenteilchen hat zwei Enden.', 'Der geladene Kopf mag Wasser.', 'Der lange Schwanz mag Fett.'],
      C: ['Die Schwänze stecken im Fetttropfen, die Köpfe zeigen ins Wasser — es entsteht eine Micelle.', 'Nach außen ist der Tropfen dadurch geladen. Die Tropfen stoßen sich ab, statt wieder zusammenzufließen: eine stabile Emulsion.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 330, hoehe: 210, alt: 'Seifenteilchen umlagern einen Fetttropfen und bilden eine Micelle.' });
      const ables = h('div', 'anim-ables');
      const cx = S.W / 2, cy = 106;

      S.kasten(18, 30, S.W - 36, 150, { fill: '#EAF1F8' });
      const fett = S.add(el('circle', { cx, cy, r: 30, fill: '#E3C46A', stroke: FARBE.ink, 'stroke-width': 1.3 }), 'mitte');
      const N = 10, koepfe = [], schwaenze = [];
      for (let i = 0; i < N; i++) {
        schwaenze.push(S.bindung(0, 0, 0, 0, { farbe: '#C98A12', breite: 3, ebene: 'mitte' }));
        koepfe.push(S.teilchen(0, 0, 'x', { r: 7, fill: FARBE.b, beschriftet: false, ebene: 'vorn' }));
      }

      const setz = u => {
        const p = Math.min(1, u * 1.5);
        for (let i = 0; i < N; i++) {
          const w = (i / N) * Math.PI * 2;
          const rStart = 82, rInnen = 22 + (rStart - 22) * (1 - p);
          const rAussen = rInnen + 24;
          const ix = cx + Math.cos(w) * rInnen, iy = cy + Math.sin(w) * rInnen;
          const ax = cx + Math.cos(w) * rAussen, ay = cy + Math.sin(w) * rAussen;
          S.setBindung(schwaenze[i], ix, iy, ax, ay);
          S.setPos(koepfe[i], ax, ay);
        }
        ables.innerHTML = p < 0.9
          ? 'Die Seifenteilchen wandern zum Fetttropfen …'
          : st === 'A' ? 'Das Fett ist von Seifenteilchen <b>umhüllt</b> und lässt sich abspülen.'
            : st === 'B' ? 'Die <b>Schwänze</b> stecken im Fett, die geladenen <b>Köpfe</b> zeigen ins Wasser.'
              : 'Es ist eine <b>Micelle</b> entstanden.<br>Nach außen trägt der Tropfen gleiche Ladungen — die Tropfen stoßen sich ab und fließen nicht wieder zusammen.';
      };
      setz(0);

      const loop = Loop(t => setz(osz(t, 7)));
      const bar = steuerleiste(loop);
      host.appendChild(S.svg); host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });

  /* ---------- 25 · Signalwörter (Prüfungseinheiten) ----------
     Die Prüfungseinheiten sind keine Themeneinheiten. Ihr erster Schritt
     ist immer derselbe: Was ist überhaupt gefragt? Genau das übt diese
     Animation — ein Signalwort erscheint, der passende Kasten leuchtet. */
  register({
    id: 'signalwoerter', titel: 'Signalwörter erkennen', bezug: 'FC-08',
    kurz: 'Welche Frage steckt in der Aufgabe? Ein Signalwort erscheint, der passende Weg leuchtet auf.',
    text: {
      A: ['Lies zuerst, was gefragt ist.', 'Das Fragewort verrät dir den Weg.'],
      B: ['„Nenne" verlangt eine Aufzählung, „erkläre" einen Zusammenhang.', '„Berechne" verlangt einen Rechenweg mit Einheit.'],
      C: ['Die Operatoren sind im Rahmenlehrplan festgelegt und in Prüfungen verbindlich.', 'Wer auf „begründe" nur beschreibt, verliert Punkte für Wissen, das er hat.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const bereich = (o && o.bereich) || 'allgemein';
      const S = Szene({ breite: o.breite || 330, hoehe: 190, alt: 'Ein Signalwort erscheint, der passende Antworttyp leuchtet auf.' });
      const ables = h('div', 'anim-ables');

      const ziele = ['aufzählen', 'beschreiben', 'erklären', 'berechnen'];
      const worte = {
        allgemein: [['Nenne …', 0], ['Beobachte und beschreibe …', 1], ['Erkläre, warum …', 2], ['Berechne die Masse …', 3],
          ['Gib die Formel an …', 0], ['Begründe deine Wahl …', 2], ['Bestimme die Stoffmenge …', 3], ['Stelle die Gleichung auf …', 1]]
      };
      const liste = worte[bereich] || worte.allgemein;

      const kaesten = ziele.map((z, i) => {
        const x = 18 + i * ((S.W - 36) / 4), w = (S.W - 36) / 4 - 8;
        const r = S.add(el('rect', { x, y: 96, width: w, height: 52, rx: 7, fill: FARBE.weiss, stroke: FARBE.faint, 'stroke-width': 1.5 }), 'hinten');
        S.text(x + w / 2, 126, z, { size: 11.5 });
        return r;
      });
      const wort = S.text(S.W / 2, 56, '', { size: 17, weight: 700 });

      const hinweis = ['eine Liste ohne Erklärung', 'in ganzen Sätzen, was zu sehen ist', 'Ursache und Wirkung verbinden', 'Ansatz, Rechnung, Einheit'];
      const zeige = k => {
        const [w, ziel] = liste[k % liste.length];
        wort.textContent = w;
        kaesten.forEach((r, i) => {
          r.setAttribute('fill', i === ziel ? FARBE.paper : FARBE.weiss);
          r.setAttribute('stroke', i === ziel ? FARBE.b : FARBE.faint);
          r.setAttribute('stroke-width', i === ziel ? 2.6 : 1.5);
        });
        ables.innerHTML = `<b>${w}</b> → ${ziele[ziel]}`
          + (st === 'A' ? '' : ` — ${hinweis[ziel]}`);
      };
      zeige(0);

      let stand = 0;
      const loop = Loop(t => { stand = Math.floor(t / 2.4); zeige(stand); });
      const bar = steuerleiste(loop);
      const weiter = h('button', 'anim-btn', 'Nächstes Wort');
      weiter.type = 'button';
      weiter.addEventListener('click', () => { loop.pause(); bar._sync(); zeige(++stand); });
      host.appendChild(S.svg); host.appendChild(weiter); host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });
})();

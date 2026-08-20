/* ============================================================
   animationen-7.js · Klasse 7 (FC · PS · GA)
   Nachgeladen von animationen.js. Der Rahmen (Feld, Loop, Szene,
   register) steht dort; hier stehen nur die Fachteile.
   ============================================================ */
/* ============================================================
   animationen.js · Teil 4 — Klasse 7 (FC · PS · GA)
   ============================================================ */
(function () {
  'use strict';
  const I = window.ANIM._intern, C = window.ANIM._chem;
  const { Loop, steuerleiste, regler, abzeichen, register, FARBE, fmt, osz, h, el, stufeVon, REDUCED } = I;
  const { Szene, Wuerfel, elFarbe, elText, SYM, schalenFuer } = C;

  /* ---------- 1 · Aggregatzustände (FC-03) ---------- */
  register({
    id: 'aggregat', titel: 'Fest, flüssig, gasförmig', bezug: 'FC-03',
    kurz: 'A: Was man sieht · B: dieselben Teilchen, andere Anordnung · C: Energie und Teilchenbewegung.',
    text: {
      A: ['Eis ist fest. Wasser ist flüssig. Wasserdampf ist gasförmig.', 'Es ist immer derselbe Stoff.'],
      B: ['Die Teilchen bleiben dieselben. Nur ihre Anordnung ändert sich.', 'Fest: feste Plätze. Flüssig: dicht, aber beweglich. Gasförmig: weit auseinander.'],
      C: ['Beim Erwärmen nehmen die Teilchen Energie auf und bewegen sich stärker.', 'Am Schmelz- und am Siedepunkt bleibt die Temperatur stehen: Die Energie löst dort die Anziehungskräfte, statt zu erwärmen.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 340, hoehe: 200, alt: 'Teilchen wechseln vom festen über den flüssigen in den gasförmigen Zustand.' });
      const ables = h('div', 'anim-ables');
      const kx = 20, ky = 32, kw = S.W - 40, kh = 132;
      S.kasten(kx, ky, kw, kh, { fill: FARBE.paper });

      const rnd = Wuerfel(11);
      const N = 12, kugeln = [];
      for (let i = 0; i < N; i++) kugeln.push(S.teilchen(0, 0, 'x', { r: 11, fill: FARBE.b, beschriftet: false }));

      const festLage = i => [kx + 44 + (i % 4) * (kw - 96) / 3, ky + 34 + Math.floor(i / 4) * 34];
      const fluessigLage = i => [kx + 32 + (i % 5) * (kw - 74) / 4 + (Math.floor(i / 5) % 2) * 14, ky + 60 + Math.floor(i / 5) * 30];
      const gasLage = [];
      for (let i = 0; i < N; i++) gasLage.push([kx + 22 + rnd() * (kw - 44), ky + 20 + rnd() * (kh - 40)]);
      const lage = (z, i) => (z === 0 ? festLage(i) : z === 1 ? fluessigLage(i) : gasLage[i]);

      const namen = ['fest', 'flüssig', 'gasförmig'];
      const tempo = ['Schwingen am festen Platz', 'Gleiten aneinander vorbei', 'freies Fliegen, weite Abstände'];
      const titel = S.text(S.W / 2, 20, 'fest', { weight: 700, size: 14 });

      const zeichne = (z, mix, zittern) => {
        const jetzt = mix > 0.5 ? Math.min(2, z + 1) : z;
        for (let i = 0; i < N; i++) {
          const [ax, ay] = lage(z, i);
          const [bx, by] = lage(Math.min(2, z + 1), i);
          const amp = zittern ? (jetzt === 0 ? 2 : jetzt === 1 ? 4 : 7) : 0;
          S.setPos(kugeln[i],
            ax + (bx - ax) * mix + (rnd() - 0.5) * amp,
            ay + (by - ay) * mix + (rnd() - 0.5) * amp);
        }
        titel.textContent = namen[jetzt];
        ables.innerHTML = st === 'A'
          ? `<b>${namen[jetzt]}</b>`
          : `<b>${namen[jetzt]}</b> — ${tempo[jetzt]}`
            + (st === 'C' ? '<br>Während des Übergangs steigt die Temperatur nicht: Die Energie trennt die Teilchen voneinander.' : '');
      };
      zeichne(0, 0, false);

      const loop = Loop(t => {
        const u = (t / 3.2) % 2;
        const z = Math.floor(u);
        zeichne(z, Math.min(1, Math.max(0, (u - z - 0.25) * 2)), true);
      });
      const bar = steuerleiste(loop);
      host.appendChild(S.svg);
      if (st !== 'A') host.appendChild(regler({
        label: 'Zustand wählen', min: 0, max: 2, step: 1, wert: 0,
        onInput: v => { loop.pause(); bar._sync(); zeichne(v, 0, false); }
      }));
      host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });

  /* ---------- 2 · Brennerflamme (FC-02) ---------- */
  register({
    id: 'brennerflamme', titel: 'Die Brennerflamme einstellen', bezug: 'FC-02',
    kurz: 'A: gelb und blau unterscheiden · B: Luftregler und Temperatur · C: Flammenzonen und vollständige Verbrennung.',
    text: {
      A: ['Ist die Luftzufuhr zu, ist die Flamme gelb.', 'Ist sie offen, ist die Flamme blau.', 'Die blaue Flamme ist heißer.'],
      B: ['Der Luftregler mischt dem Gas Sauerstoff bei.', 'Wenig Luft: gelbe, rußende Flamme, rund 600 °C.', 'Viel Luft: blaue, rauschende Flamme, über 1400 °C.'],
      C: ['Die gelbe Farbe stammt von glühenden Rußteilchen — das Gas verbrennt unvollständig.', 'Bei offener Luftzufuhr verbrennt es vollständig zu Kohlenstoffdioxid und Wasser.', 'Die heißeste Stelle liegt dicht über der Spitze des inneren blauen Kegels.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 320, hoehe: 234, alt: 'Ein Gasbrenner, dessen Flamme sich mit dem Luftregler von gelb nach blau ändert.' });
      const ables = h('div', 'anim-ables');
      const cx = S.W / 2, boden = 208;

      S.add(el('path', { d: `M ${cx - 26} ${boden} L ${cx + 26} ${boden} L ${cx + 16} ${boden - 10} L ${cx - 16} ${boden - 10} Z`, fill: FARBE.neutral, stroke: FARBE.ink, 'stroke-width': 1.6 }), 'hinten');
      S.add(el('rect', { x: cx - 8, y: boden - 62, width: 16, height: 52, fill: FARBE.weiss, stroke: FARBE.ink, 'stroke-width': 1.6 }), 'hinten');
      S.add(el('circle', { cx, cy: boden - 26, r: 11, fill: 'none', stroke: FARBE.ink, 'stroke-width': 2 }), 'mitte');
      const marke = S.add(el('line', { x1: cx, y1: boden - 26, x2: cx, y2: boden - 37, stroke: FARBE.ink, 'stroke-width': 2.4 }), 'mitte');

      const aussen = S.add(el('path', { d: '', fill: '#D9C22B' }), 'mitte');
      const innen = S.add(el('path', { d: '', fill: '#3E7FC1' }), 'vorn');
      const heiss = S.add(el('circle', { cx, cy: 0, r: 4.5, fill: FARBE.korr, opacity: 0 }), 'vorn');
      const beschr = S.text(cx + 30, 60, '', { anchor: 'start', size: 11.5, farbe: FARBE.weich });

      const setz = luft => {
        const y0 = boden - 62;
        const hoehe = 60 + luft * 52, breite = 20 - luft * 6;
        aussen.setAttribute('d', `M ${cx} ${y0 - hoehe} C ${cx + breite} ${y0 - hoehe * 0.55} ${cx + breite * 0.8} ${y0 - 14} ${cx} ${y0} C ${cx - breite * 0.8} ${y0 - 14} ${cx - breite} ${y0 - hoehe * 0.55} ${cx} ${y0 - hoehe} Z`);
        aussen.setAttribute('fill', luft < 0.35 ? '#D9C22B' : '#5E90CE');
        aussen.setAttribute('opacity', luft < 0.35 ? 0.92 : 0.55);
        const ih = hoehe * (0.15 + luft * 0.4), ib = breite * 0.45;
        innen.setAttribute('d', `M ${cx} ${y0 - ih} C ${cx + ib} ${y0 - ih * 0.5} ${cx + ib} ${y0 - 8} ${cx} ${y0} C ${cx - ib} ${y0 - 8} ${cx - ib} ${y0 - ih * 0.5} ${cx} ${y0 - ih} Z`);
        innen.setAttribute('opacity', luft < 0.3 ? 0 : 0.95);
        marke.setAttribute('transform', `rotate(${-120 + luft * 240} ${cx} ${boden - 26})`);
        const zeigHeiss = st === 'C' && luft > 0.6;
        heiss.setAttribute('cy', y0 - ih - 6);
        heiss.setAttribute('opacity', zeigHeiss ? 1 : 0);
        beschr.textContent = zeigHeiss ? 'heißeste Stelle' : '';
        beschr.setAttribute('y', y0 - ih - 2);

        const temp = Math.round(600 + luft * 900);
        ables.innerHTML = st === 'A'
          ? (luft < 0.35 ? 'Luft zu → <b>gelbe Flamme</b>' : 'Luft offen → <b>blaue Flamme</b>')
          : `Luftzufuhr <b>${Math.round(luft * 100)} %</b> · ${luft < 0.35 ? 'gelb, rußend' : 'blau, rauschend'} · rund <b>${temp} °C</b>`
            + (st === 'C' ? `<br>${luft < 0.35 ? 'unvollständige Verbrennung — glühender Ruß leuchtet gelb' : 'vollständige Verbrennung zu CO₂ und H₂O'}` : '');
      };
      setz(0.1);

      let reg = null;
      const loop = Loop(t => { const u = osz(t, 7); if (reg) reg._input.value = Math.round(u * 100); setz(u); });
      reg = regler({ label: 'Luftzufuhr', min: 0, max: 100, step: 1, wert: 10, onInput: v => { loop.pause(); bar._sync(); setz(v / 100); } });
      const bar = steuerleiste(loop);
      host.appendChild(S.svg); host.appendChild(reg); host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });

  /* ---------- 3 · Feuerdreieck (FC-06) ---------- */
  register({
    id: 'feuerdreieck', titel: 'Das Feuerdreieck', bezug: 'FC-06',
    kurz: 'A: drei Dinge müssen da sein · B: eines wegnehmen genügt · C: Löschmethoden zuordnen.',
    text: {
      A: ['Zum Brennen braucht es drei Dinge: Brennstoff, Sauerstoff und Wärme.', 'Fehlt eines, geht das Feuer aus.'],
      B: ['Nimm eine Seite weg, und die Flamme erlischt.', 'Ein Glas über der Kerze nimmt den Sauerstoff. Wasser nimmt die Wärme.'],
      C: ['Jede Löschmethode entfernt genau eine Seite des Dreiecks.', 'Deshalb löscht Wasser einen Fettbrand nicht: Es verdampft schlagartig und reißt das brennende Fett mit.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 320, hoehe: 214, alt: 'Ein Dreieck aus Brennstoff, Sauerstoff und Wärme; wird eine Seite entfernt, erlischt die Flamme.' });
      const ables = h('div', 'anim-ables');
      const cx = S.W / 2, cy = 108, R = 70;
      const ecken = [[cx, cy - R], [cx - R * 0.92, cy + R * 0.6], [cx + R * 0.92, cy + R * 0.6]];
      const namen = ['Brennstoff', 'Sauerstoff', 'Wärme'];
      const weg = [
        'Brennstoff entfernt — es ist nichts mehr da, was brennen kann',
        'Sauerstoff entfernt — ersticken, etwa mit Glas oder Löschdecke',
        'Wärme entfernt — kühlen, etwa mit Wasser'
      ];

      const seiten = [];
      for (let i = 0; i < 3; i++) {
        const a = ecken[i], b = ecken[(i + 1) % 3];
        seiten.push(S.bindung(a[0], a[1], b[0], b[1], { farbe: FARBE.korr, breite: 5, ebene: 'mitte' }));
      }
      const label = ecken.map((p, i) => S.text(p[0], p[1] + (i === 0 ? -12 : 20), namen[i], { size: 12.5, weight: 700 }));
      const flamme = S.add(el('path', {
        d: `M ${cx} ${cy - 22} C ${cx + 15} ${cy - 4} ${cx + 11} ${cy + 12} ${cx} ${cy + 18} C ${cx - 11} ${cy + 12} ${cx - 15} ${cy - 4} ${cx} ${cy - 22} Z`,
        fill: '#E08A2E'
      }), 'vorn');

      const zeige = k => {
        seiten.forEach((s, i) => {
          s.setAttribute('opacity', k === i ? 0.15 : 1);
          s.setAttribute('stroke-dasharray', k === i ? '6 6' : 'none');
        });
        label.forEach((l, i) => l.setAttribute('opacity', k === i ? 0.35 : 1));
        flamme.setAttribute('opacity', k < 0 ? 1 : 0.08);
        ables.innerHTML = k < 0 ? 'Alle drei sind da — <b>es brennt</b>.' : `<b>${weg[k]}</b><br>Die Flamme erlischt.`;
      };
      zeige(-1);

      const folge = [-1, 0, -1, 1, -1, 2];
      const loop = Loop(t => zeige(folge[Math.floor(t / 1.9) % folge.length]));
      const bar = steuerleiste(loop);
      host.appendChild(S.svg);
      if (st !== 'A') {
        const leiste = h('div', 'anim-schalter');
        ['alles da', 'ohne Brennstoff', 'ohne Sauerstoff', 'ohne Wärme'].forEach((n, i) => {
          const b = h('button', 'anim-schalt', n);
          b.type = 'button';
          b.addEventListener('click', () => { loop.pause(); bar._sync(); zeige(i - 1); });
          leiste.appendChild(b);
        });
        host.appendChild(leiste);
      }
      host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });

  /* ---------- 4 · Erhaltung der Masse (FC-08) ---------- */
  register({
    id: 'massenerhaltung', titel: 'Erhaltung der Masse', bezug: 'FC-08',
    kurz: 'A: geschlossen bleibt gleich · B: offen scheint es sich zu ändern · C: die Teilchen erklären, warum es nur so scheint.',
    text: {
      A: ['Im geschlossenen Gefäß bleibt die Masse gleich.', 'Es geht nichts verloren.'],
      B: ['Verbrennt Eisenwolle offen, zeigt die Waage mehr an: Sauerstoff aus der Luft wird gebunden.', 'Verbrennt eine Kerze offen, zeigt sie weniger: Gase entweichen unbeachtet.'],
      C: ['Die Masse ändert sich nie. Zu eng war nur die Grenze, innerhalb derer gewogen wurde.', 'Bei einer chemischen Reaktion werden Atome umgeordnet, nicht vermehrt und nicht vernichtet.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 330, hoehe: 204, alt: 'Eine Waage mit einem Gefäß vor und nach einer Verbrennung.' });
      const ables = h('div', 'anim-ables');
      const cx = S.W / 2;

      S.add(el('rect', { x: cx - 92, y: 148, width: 184, height: 30, rx: 6, fill: FARBE.weiss, stroke: FARBE.ink, 'stroke-width': 1.8 }), 'hinten');
      const anzeige = S.text(cx, 169, '—', { mono: true, size: 15, weight: 700 });
      S.add(el('rect', { x: cx - 52, y: 136, width: 104, height: 12, rx: 3, fill: FARBE.neutral, stroke: FARBE.ink, 'stroke-width': 1.4 }), 'hinten');
      S.add(el('path', { d: `M ${cx - 36} 136 L ${cx - 36} 64 A 36 30 0 0 1 ${cx + 36} 64 L ${cx + 36} 136 Z`, fill: 'none', stroke: FARBE.ink, 'stroke-width': 2 }), 'hinten');
      const deckel = S.add(el('rect', { x: cx - 34, y: 48, width: 68, height: 10, rx: 4, fill: FARBE.weich }), 'mitte');
      const stoff = S.add(el('rect', { x: cx - 20, y: 108, width: 40, height: 24, rx: 4, fill: '#7E8B99', stroke: FARBE.ink, 'stroke-width': 1.2 }), 'mitte');

      const gase = [];
      for (let i = 0; i < 5; i++) gase.push(S.teilchen(cx - 24 + i * 12, 96, 'O', { r: 7, beschriftet: false }));

      const setz = (u, offen) => {
        deckel.setAttribute('opacity', offen ? 0 : 1);
        const m = 50 + (offen ? 2.4 : 0) * u;
        anzeige.textContent = fmt(m) + ' g';
        stoff.setAttribute('fill', u > 0.5 ? '#3C4650' : '#7E8B99');
        gase.forEach((g, i) => {
          S.setPos(g, cx - 24 + i * 12, offen ? 98 - u * (52 + i * 5) : 98 - u * 22);
          S.setOpacity(g, offen ? Math.max(0.15, 1 - u * 0.7) : 1);
        });
        ables.innerHTML = offen
          ? `offenes Gefäß · <b>${fmt(m)} g</b> — der gebundene Sauerstoff aus der Luft wird mitgewogen`
          : `geschlossenes Gefäß · <b>${fmt(m)} g</b> — vorher wie nachher`;
        if (st === 'C') ables.innerHTML += '<br>Die Zahl der Atome ändert sich in keinem der beiden Fälle. Verschieden weit gezogen war nur die Bilanzgrenze.';
      };
      setz(0, false);

      const loop = Loop(t => setz(Math.min(1, (t % 4) / 2.6), st === 'A' ? false : Math.floor(t / 4) % 2 === 1));
      const bar = steuerleiste(loop);
      host.appendChild(S.svg); host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });

  /* ---------- 5 · Schalen füllen sich (PS-05 / PS-07) ---------- */
  register({
    id: 'atombau', titel: 'Schalen füllen sich', bezug: 'PS-05',
    kurz: 'A: Elektronen zählen · B: Schalen der Reihe nach füllen · C: Außenelektronen wiederholen sich — daher die Gruppen.',
    text: {
      A: ['Ein Atom hat einen Kern und Elektronen um ihn herum.', 'Die Zahl der Elektronen ist so groß wie die Ordnungszahl.'],
      B: ['Die Elektronen sitzen auf Schalen.', 'Die erste Schale fasst 2, die zweite 8, die dritte 8.', 'Erst wenn eine Schale voll ist, beginnt die nächste.'],
      C: ['In einer Periode steigt die Zahl der Außenelektronen und beginnt danach von vorn.', 'Genau deshalb stehen Elemente mit gleicher Außenelektronenzahl in derselben Hauptgruppe — und reagieren ähnlich.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 320, hoehe: 254, alt: 'Ein Schalenmodell, dessen Schalen sich mit steigender Ordnungszahl füllen.' });
      const ables = h('div', 'anim-ables');
      const cx = S.W / 2, cy = 126, radien = [30, 54, 78, 100];
      const ringe = radien.map(r => S.add(el('circle', { cx, cy, r, fill: 'none', stroke: FARBE.gitter, 'stroke-width': 1.3 }), 'hinten'));
      S.add(el('circle', { cx, cy, r: 20, fill: FARBE.weiss, stroke: FARBE.ink, 'stroke-width': 1.6 }), 'mitte');
      const kernText = S.text(cx, cy + 4, '1 p⁺', { mono: true, size: 11 });
      const symbol = S.text(cx, 22, 'H', { size: 14, weight: 700 });
      const elektronen = [];
      for (let i = 0; i < 20; i++) elektronen.push(S.teilchen(cx, cy, 'x', { r: 5.4, fill: FARBE.b, stroke: FARBE.weiss, rand: 1.4, beschriftet: false, ebene: 'vorn' }));

      const gruppe = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'];
      const zeige = z => {
        const sch = schalenFuer(z);
        kernText.textContent = z + ' p⁺';
        symbol.textContent = `${SYM[z]}   (Z = ${z})`;
        let k = 0;
        sch.forEach((n, si) => {
          const R = radien[si];
          for (let i = 0; i < n; i++, k++) {
            const w = -Math.PI / 2 + (i / n) * Math.PI * 2;
            S.setPos(elektronen[k], cx + Math.cos(w) * R, cy + Math.sin(w) * R);
            S.setOpacity(elektronen[k], 1);
            elektronen[k].querySelector('circle').setAttribute('fill', si === sch.length - 1 ? FARBE.b : FARBE.weich);
          }
        });
        for (; k < elektronen.length; k++) S.setOpacity(elektronen[k], 0);
        ringe.forEach((r, i) => r.setAttribute('opacity', i < sch.length ? 1 : 0.22));

        const aussen = sch[sch.length - 1];
        ables.innerHTML = st === 'A'
          ? `<b>${SYM[z]}</b> hat <b>${z}</b> Elektron${z === 1 ? '' : 'en'}.`
          : `<b>${SYM[z]}</b> · Schalen ${sch.join(' · ')} · <b>${aussen} Außenelektron${aussen === 1 ? '' : 'en'}</b>`
            + (st === 'C' ? `<br>Hauptgruppe ${z === 2 ? 'VIII' : gruppe[aussen - 1]} — gleiche Außenelektronenzahl, ähnliche Reaktionen.` : '');
      };
      zeige(1);

      let reg = null;
      const grenze = st === 'A' ? 10 : 20;
      const loop = Loop(t => { const z = 1 + Math.floor((t / 1.1) % grenze); if (reg) reg._input.value = z; zeige(z); });
      reg = regler({ label: 'Ordnungszahl Z', min: 1, max: grenze, step: 1, wert: 1, onInput: v => { loop.pause(); bar._sync(); zeige(v); } });
      const bar = steuerleiste(loop);
      host.appendChild(S.svg); host.appendChild(reg); host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });

  /* ---------- 6 · Streuversuch (PS-04) ---------- */
  register({
    id: 'streuversuch', titel: 'Der Streuversuch', bezug: 'PS-04',
    kurz: 'A: die meisten fliegen durch · B: wenige werden abgelenkt · C: der Schluss auf den Kern.',
    text: {
      A: ['Sehr kleine Teilchen werden auf eine dünne Goldfolie geschossen.', 'Fast alle fliegen glatt hindurch.'],
      B: ['Wenige Teilchen werden abgelenkt.', 'Ganz wenige kommen sogar zurück.'],
      C: ['Aus „fast alle fliegen durch" folgt: Das Atom ist fast leer.', 'Aus „einige prallen zurück" folgt: Es gibt einen sehr kleinen, sehr schweren, positiv geladenen Kern.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 340, hoehe: 196, alt: 'Teilchen fliegen auf eine Goldfolie zu; die meisten fliegen hindurch, wenige werden abgelenkt.' });
      const ables = h('div', 'anim-ables');
      const folieX = S.W * 0.56;

      S.add(el('rect', { x: folieX - 4, y: 26, width: 8, height: 142, fill: '#D9A227', opacity: 0.35 }), 'hinten');
      S.text(folieX, 18, 'Goldfolie', { size: 11.5, farbe: FARBE.weich });
      for (let i = 0; i < 4; i++) S.add(el('circle', { cx: folieX, cy: 46 + i * 34, r: 3.4, fill: FARBE.korr }), 'mitte');

      const bahnen = [{ y: 62, ab: 0 }, { y: 96, ab: 0 }, { y: 130, ab: 0 }, { y: 81, ab: 32 }, { y: 47.5, ab: -180 }]
        .slice(0, st === 'A' ? 3 : 5);
      const kugeln = bahnen.map(() => S.teilchen(0, 0, 'x', { r: 5, fill: FARBE.c, beschriftet: false, ebene: 'vorn' }));
      const spuren = bahnen.map(b => S.bindung(10, b.y, 10, b.y, { farbe: FARBE.gitter, breite: 1.4, dash: '3 3' }));

      const setz = u => bahnen.forEach((b, i) => {
        const p = (u + i * 0.13) % 1;
        const xs = 10 + p * (S.W - 20);
        let x = xs, y = b.y;
        if (xs > folieX && b.ab) {
          const d = xs - folieX;
          if (b.ab === -180) { x = folieX - d; y = b.y - d * 0.5; }
          else { const w = b.ab * Math.PI / 180; x = folieX + d * Math.cos(w); y = b.y + d * Math.sin(w); }
        }
        S.setPos(kugeln[i], x, y);
        S.setBindung(spuren[i], 10, b.y, Math.min(xs, folieX), b.y);
      });
      setz(0.2);

      ables.innerHTML = st === 'C'
        ? 'Von etwa 8000 Teilchen kommt eines zurück. Der Kern ist rund zehntausendmal kleiner als das Atom — und trägt fast die ganze Masse.'
        : st === 'B' ? 'Die meisten fliegen durch. Wenige werden abgelenkt, ganz wenige kommen zurück.'
          : 'Fast alle fliegen glatt hindurch. Das Atom muss fast leer sein.';

      const loop = Loop(t => setz((t / 4) % 1));
      const bar = steuerleiste(loop);
      host.appendChild(S.svg); host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });

  /* ---------- 7 · Elektronenpaarbindung (GA-03) ---------- */
  register({
    id: 'oktettregel', titel: 'Zwei Atome teilen ein Elektronenpaar', bezug: 'GA-03',
    kurz: 'A: aus zwei mach eins · B: das gemeinsame Paar zählt für beide · C: Doppel- und Dreifachbindung.',
    text: {
      A: ['Zwei Wasserstoffatome kommen zusammen.', 'Jedes bringt ein Elektron mit.', 'Beide teilen sich das Paar.'],
      B: ['Das gemeinsame Elektronenpaar gehört beiden Atomen gleichzeitig.', 'So erreicht jedes Atom die Außenelektronenzahl, die es anstrebt.', 'Ein Strich in der Formel bedeutet ein gemeinsames Paar.'],
      C: ['Fehlen zwei Elektronen, entsteht eine Doppelbindung, fehlen drei, eine Dreifachbindung.', 'Alle Atome außer Wasserstoff streben acht Außenelektronen an — das ist die Oktettregel.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 330, hoehe: 186, alt: 'Zwei Atome nähern sich und bilden gemeinsame Elektronenpaare.' });
      const ables = h('div', 'anim-ables');
      const cy = 88, mitte = S.W / 2;

      const paare = st === 'C'
        ? [['N', 3, 'N₂'], ['O', 2, 'O₂'], ['H', 1, 'H₂']]
        : [[st === 'A' ? 'H' : 'Cl', 1, st === 'A' ? 'H₂' : 'Cl₂']];
      let idx = 0;

      const striche = [], punkte = [];
      for (let i = 0; i < 3; i++) striche.push(S.bindung(0, 0, 0, 0, { farbe: FARBE.ink, breite: 2.6, ebene: 'mitte' }));
      for (let i = 0; i < 6; i++) punkte.push(S.teilchen(0, 0, 'x', { r: 4, fill: FARBE.b, beschriftet: false, ebene: 'vorn' }));
      const links = S.teilchen(0, cy, 'H', { r: 22, ebene: 'mitte' });
      const rechts = S.teilchen(0, cy, 'H', { r: 22, ebene: 'mitte' });
      const formel = S.text(mitte, 162, '', { size: 16, weight: 700, mono: true });

      const setz = naeh => {
        const [sym, fach, name] = paare[idx];
        S.setLabel(links, sym); S.setLabel(rechts, sym);
        S.setFuell(links, sym); S.setFuell(rechts, sym);

        const d = 118 - naeh * 56;
        S.setPos(links, mitte - d / 2, cy);
        S.setPos(rechts, mitte + d / 2, cy);
        const verbunden = naeh > 0.85;

        striche.forEach((s, i) => {
          s.setAttribute('opacity', verbunden && i < fach ? 1 : 0);
          const off = (i - (fach - 1) / 2) * 6;
          S.setBindung(s, mitte - d / 2 + 24, cy + off, mitte + d / 2 - 24, cy + off);
        });
        punkte.forEach((p, i) => {
          const seite = i % 2 === 0 ? -1 : 1, nr = Math.floor(i / 2);
          S.setOpacity(p, !verbunden && nr < fach ? 1 : 0);
          S.setPos(p, mitte + seite * (d / 2 - 26), cy + (nr - (fach - 1) / 2) * 8);
        });

        formel.textContent = verbunden ? name : '';
        ables.innerHTML = verbunden
          ? (st === 'A'
            ? `Beide teilen sich das Paar. Fertig ist <b>${name}</b>.`
            : `<b>${name}</b> · ${fach === 1 ? 'ein gemeinsames Elektronenpaar — Einfachbindung' : fach === 2 ? 'zwei gemeinsame Paare — Doppelbindung' : 'drei gemeinsame Paare — Dreifachbindung'}`
              + (st === 'C' ? `<br>Jedes ${sym}-Atom kommt so auf ${sym === 'H' ? 'zwei' : 'acht'} Außenelektronen.` : ''))
          : 'Die Atome nähern sich …';
      };
      setz(0);

      const dauer = 4.2;
      const loop = Loop(t => {
        idx = Math.floor(t / dauer) % paare.length;
        setz(Math.min(1, (t % dauer) / (dauer * 0.55)));
      });
      const bar = steuerleiste(loop);
      host.appendChild(S.svg); host.appendChild(ables); host.appendChild(bar);
      if (!REDUCED) loop.play(), bar._sync();
      return loop;
    }
  });

  /* ---------- 8 · Die drei Nachweise (GA-02) ---------- */
  register({
    id: 'nachweise', titel: 'Die drei Nachweise', bezug: 'GA-02',
    kurz: 'A: was man sieht · B: Nachweis und Gas zuordnen · C: die Reaktion dahinter.',
    text: {
      A: ['Der Glimmspan flammt auf: Sauerstoff.', 'Es macht pfeifend „plopp": Wasserstoff.', 'Das Kalkwasser wird trüb: Kohlenstoffdioxid.'],
      B: ['Jedes der drei Gase hat einen eigenen Nachweis.', 'Ein Nachweis muss eindeutig sein — sonst weißt du hinterher nicht mehr als vorher.'],
      C: ['Glimmspanprobe: Sauerstoff unterhält die Verbrennung, der Span brennt weiter.', 'Knallgasprobe: 2 H₂ + O₂ → 2 H₂O, sehr schnell.', 'Kalkwasserprobe: CO₂ + Ca(OH)₂ → CaCO₃ + H₂O — das schwerlösliche Calciumcarbonat trübt.']
    },
    bauen(host, o) {
      const st = stufeVon(o); abzeichen(host, st);
      const S = Szene({ breite: o.breite || 330, hoehe: 204, alt: 'Drei Nachweisreaktionen: Glimmspan, Knallgasprobe und Kalkwasser.' });
      const ables = h('div', 'anim-ables');
      const cx = S.W / 2;

      S.add(el('path', { d: `M ${cx - 24} 44 L ${cx - 24} 146 A 24 24 0 0 0 ${cx + 24} 146 L ${cx + 24} 44`, fill: FARBE.weiss, stroke: FARBE.ink, 'stroke-width': 2 }), 'hinten');
      const fluessig = S.add(el('rect', { x: cx - 24, y: 100, width: 48, height: 66, fill: '#DCE7F2', opacity: 0 }), 'hinten');
      const span = S.add(el('rect', { x: cx - 3, y: 18, width: 6, height: 58, fill: '#A2643C', rx: 2, opacity: 0 }), 'mitte');
      const glut = S.add(el('circle', { cx, cy: 76, r: 6, fill: '#E08A2E', opacity: 0 }), 'vorn');
      const knall = S.text(cx, 80, '', { size: 21, weight: 700, farbe: FARBE.korr });
      const titel = S.text(cx, 190, '', { size: 13, weight: 700 });

      const proben = [
        { gas: 'Sauerstoff', name: 'Glimmspanprobe', zeichen: 'Der glimmende Span flammt hell auf.' },
        { gas: 'Wasserstoff', name: 'Knallgasprobe', zeichen: 'Es knallt kurz und pfeifend.' },
        { gas: 'Kohlenstoffdioxid', name: 'Kalkwasserprobe', zeichen: 'Das klare Kalkwasser wird milchig trüb.' }
      ];
      const gleich = ['O₂ unterhält die Verbrennung', '2 H₂ + O₂ → 2 H₂O', 'CO₂ + Ca(OH)₂ → CaCO₃ + H₂O'];

      const zeige = (k, u) => {
        const p = proben[k];
        span.setAttribute('opacity', k === 0 ? 1 : 0);
        glut.setAttribute('opacity', k === 0 ? (u > 0.5 ? 1 : 0.45) : 0);
        glut.setAttribute('r', k === 0 && u > 0.5 ? 6 + (u - 0.5) * 24 : 6);
        knall.textContent = k === 1 && u > 0.55 ? 'plopp!' : '';
        fluessig.setAttribute('opacity', k === 2 ? 1 : 0);
        fluessig.setAttribute('fill', k === 2 && u > 0.5 ? '#E4E9ED' : '#DCE7F2');
        titel.textContent = p.name;
        ables.innerHTML = `<b>${p.gas}</b> · ${p.zeichen}`
          + (st === 'C' ? `<br><span class="anim-formel">${gleich[k]}</span>` : '');
      };
      zeige(0, 0);

      const loop = Loop(t => zeige(Math.floor(t / 3) % 3, (t % 3) / 3));
      const bar = steuerleiste(loop);
      host.appendChild(S.svg);
      if (st !== 'A') {
        const leiste = h('div', 'anim-schalter');
        proben.forEach((p, i) => {
          const b = h('button', 'anim-schalt', p.gas);
          b.type = 'button';
          b.addEventListener('click', () => { loop.pause(); bar._sync(); zeige(i, 1); });
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

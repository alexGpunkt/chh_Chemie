/* ============================================================
   animationen-seite.js · Galerie der Animationen aufbauen

   Lag bis V28 als Inline-Skript in animationen.html. Ausgelagert, damit
   die Content-Security-Policy ohne 'unsafe-inline' für Skripte auskommt:
   Sonst wäre jede eingeschleuste <script>-Zeile genauso erlaubt wie diese.
   ============================================================ */
'use strict';

(() => {
  const bereich = new URLSearchParams(location.search).get('bereich');
  const namen = {
    FC: 'Faszination Chemie in Bewegung',
    PS: 'Das Periodensystem der Elemente in Bewegung',
    GA: 'Gase in Bewegung',
    WA: 'Wasser — eine Verbindung in Bewegung',
    SZ: 'Salze in Bewegung',
    ME: 'Metalle in Bewegung',
    QB: 'Quantitative Betrachtungen in Bewegung',
    SL: 'Säuren und Laugen in Bewegung',
    KW: 'Kohlenwasserstoffe in Bewegung',
    AL: 'Alkohole in Bewegung',
    OS: 'Organische Säuren in Bewegung',
    ES: 'Ester und Makromoleküle in Bewegung'
  };
  if (namen[bereich]) {
    document.getElementById('anim-titel').textContent = namen[bereich];
    document.title = namen[bereich] + ' · Chemie 7–10';
  }
  ANIM.galerie(document.getElementById('galerie'), {
    breite: 360,
    bereich: ["FC", "PS", "GA", "WA", "SZ", "ME", "QB", "SL", "KW", "AL", "OS", "ES"].includes(bereich) ? bereich : null
  });
})();

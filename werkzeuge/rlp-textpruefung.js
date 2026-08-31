#!/usr/bin/env node
/* Prüft die verbindlichen Themenfelder 3.1–3.12 des RLP Chemie 7–10
   ausschließlich in den erklärenden Textquellen der Anwendung. Aufgaben,
   Videos und Lösungsfelder zählen bewusst nicht: Ein Thema gilt erst dann
   als abgedeckt, wenn es vor dem Üben nachgelesen werden kann. */
'use strict';
const fs = require('fs');
const path = require('path');

const PFLICHT = {
  fc: [
    ['chemische Reaktion', /chemische reaktion/], ['Teilchenebene', /teilchen/],
    ['Reaktionsenergie', /reaktionsenergie|endotherm|exotherm/], ['Aktivierungsenergie', /aktivierungsenergie/],
    ['Massenerhaltung', /massenerhaltung|erhaltung der masse/], ['Oxidation', /oxidation/],
    ['Metall- und Nichtmetalloxide', /metalloxid.*nichtmetalloxid|nichtmetalloxid.*metalloxid/],
    ['Wortgleichung', /wortgleichung/], ['Edukt und Produkt', /edukt.*produkt|produkt.*edukt/],
    ['Brenner', /brenner/], ['Sicherheitsunterweisung', /betriebsanweisung.*notfall|notfall.*betriebsanweisung/]
  ],
  ps: [
    ['chemische Symbole', /symbol/], ['Kern-Hülle-Modell', /kern.*hülle|hülle.*kern/],
    ['Proton, Neutron, Elektron', /proton.*neutron.*elektron|proton.*elektron.*neutron/],
    ['strukturierte Atomhülle', /schalenmodell|energiestufe/], ['Lewis-Schreibweise', /lewis/],
    ['Ordnungsprinzipien PSE', /periode.*hauptgruppe|hauptgruppe.*periode/]
  ],
  ga: [
    ['Eigenschaften und Verwendung O2/H2/CO2', /sauerstoff.*wasserstoff.*kohlenstoffdioxid|wasserstoff.*sauerstoff.*kohlenstoffdioxid/],
    ['Gasnachweise', /glimmspan.*knallgas.*kalkwasser|knallgas.*glimmspan.*kalkwasser/],
    ['Luftbestandteile', /stickstoff.*sauerstoff/], ['Elektronenpaarbindung', /elektronenpaarbindung|atombindung/],
    ['Oktettregel', /oktettregel/], ['Moleküle und Lewis', /molekül.*lewis|lewis.*molekül/]
  ],
  wa: [
    ['Eigenschaften von Wasser', /eigenschaft/], ['Wasser als Lösungsmittel', /lösungsmittel/],
    ['quantitative Analyse', /2\s*:\s*1|volumenverhältnis|quantitative analyse/], ['Bildung und Zerlegung', /zerleg.*wasser|wasser.*zerleg/],
    ['Umkehrbarkeit', /umkehrbar/], ['Reaktionsgleichung', /reaktionsgleichung/], ['Molekülbau', /molekül/],
    ['Elektronegativität', /elektronegativität/], ['polare Bindung und Dipol', /polar.*dipol|dipol.*polar/],
    ['Wassernachweis', /wassernachweis|watesmo|kupfersulfat/]
  ],
  sz: [
    ['Ionenbildung', /ionenbildung|elektronen.*abg|elektronen.*aufn/],
    ['Bildung, Vorkommen und Verwendung', /salzbildung|salz.*vorkommen|salz.*verwendung/],
    ['Ionenkristall und Gitter', /ionenkristall|ionengitter|kristallgitter/], ['Ionenbindung', /ionenbindung/],
    ['Verhältnisformel und Wertigkeit', /verhältnisformel|wertigkeit/], ['Leitfähigkeit', /leitfähigkeit/],
    ['Löslichkeit', /löslichkeit/], ['Flammenfärbung', /flammenfärbung/]
  ],
  me: [
    ['Eigenschaften und Verwendung', /eigenschaft.*verwendung|verwendung.*eigenschaft/], ['Legierungen', /legierung/],
    ['Gewinnung', /gewinnung|hochofen/], ['edle und unedle Metalle', /edel.*unedel|unedel.*edel/],
    ['Metallbindung und Elektronengas', /metallbindung|elektronengas/], ['Reaktionsgleichung', /reaktionsgleichung/],
    ['Reduktion und Redox', /reduktion.*redox|redox.*reduktion/], ['Sauerstoffaffinität', /affinität.*sauerstoff|sauerstoff.*affinität/]
  ],
  qb: [
    ['Stoffmenge', /stoffmenge/], ['Atommasse und molare Masse', /atommasse.*molare masse|molare masse.*atommasse/],
    ['stöchiometrisches Rechnen', /stöchiometr/], ['Massenberechnung', /masse.*reaktion|reaktion.*masse/],
    ['Stoffmengenkonzentration', /stoffmengenkonzentration|c\s*=\s*n\s*[:/]\s*v|mol\/l/]
  ],
  sl: [
    ['Indikatoren', /indikator/], ['pH-Wert', /ph-wert|ph-skala/], ['Säure-Base-Begriff', /säure.*base|base.*säure/],
    ['saure und alkalische Lösungen', /saure lösung.*alkalische lösung|alkalische lösung.*saure lösung|laugen.*entsteh/],
    ['Neutralisation', /neutralisation/], ['Oxide mit Wasser', /oxid.*wasser/],
    ['Säure mit Metall und Carbonat', /metall.*carbonat|carbonat.*metall/]
  ],
  kw: [
    ['Vorkommen und Verwendung', /vorkommen|verwendung|erdöl/],
    ['gesättigte Kohlenwasserstoffe und homologe Reihe', /gesättigt.*homolog|homolog.*gesättigt/],
    ['Isomerie', /isomer/], ['Van-der-Waals-Kräfte', /van.der.waals|london/], ['Nomenklatur', /nomenklatur|benenn/],
    ['Verbrennung', /verbrennung/], ['ungesättigte Kohlenwasserstoffe', /ungesättigt|alken|alkin/],
    ['Alkane als Lösungsmittel', /alkan.*lösungsmittel|lösungsmittel.*alkan/]
  ],
  al: [
    ['Herstellung von Methanol und Ethanol', /herstellung.*methanol|herstellung.*ethanol|methanol.*herstell|ethanol.*herstell/],
    ['Struktur und Nomenklatur der Alkanole', /alkanol.*nomenklatur|nomenklatur.*alkanol|alkanol.*benenn/],
    ['funktionelle Gruppe', /funktionelle gruppe/],
    ['homologe Reihe und Hydrophilie', /homolog.*hydrophil|hydrophil.*homolog|wasserlöslichkeit.*kettenlänge/],
    ['physiologische Wirkung', /physiolog|giftig|blutalkohol/], ['Glycerin', /glycerin|propan-1,2,3-triol/],
    ['Alkanale und Aldehyd', /alkanal|aldehyd/], ['Gärung', /gärung|vergärung/],
    ['Alkohol als Lösungsmittel', /alkohol.*lösungsmittel|lösungsmittel.*alkohol/],
    ['Oxidation von Alkanolen', /oxidation.*alkanol|alkanol.*oxidation|alkohol.*oxidation/],
    ['Aldehydnachweis', /fehling|silberspiegel|aldehyd.*nachweis/]
  ],
  os: [
    ['Herstellung von Alkansäuren', /herstellung.*alkansäure|alkansäure.*herstell|essig.*herstell/],
    ['Struktur und Carboxygruppe', /carboxygruppe/], ['Eigenschaften und Verwendung', /eigenschaft.*verwendung|verwendung.*eigenschaft/],
    ['homologe Reihe', /homolog/], ['Aminosäuren', /aminosäure/], ['Essigherstellung', /essig.*herstell|herstellung.*essig/],
    ['organische und anorganische Säuren', /organisch.*anorganisch|anorganisch.*organisch/]
  ],
  es: [
    ['Eigenschaften und Verwendung von Estern und Fetten', /ester.*fett|fett.*ester/],
    ['lipophil und lipophob', /lipophil.*lipophob|lipophob.*lipophil|hydrophob/], ['Estergruppe', /estergruppe/],
    ['Synthese und Analyse', /synthese.*analyse|analyse.*synthese|veresterung.*hydrolyse/],
    ['Kondensation, Hydrolyse und Umkehrbarkeit', /kondensation.*hydrolyse|hydrolyse.*kondensation/],
    ['Fettsäuren und Salze', /fettsäure.*salz|salz.*fettsäure|seife/], ['Seifenherstellung', /seifenherstellung|verseifung/],
    ['Ester als Lösungsmittel', /ester.*lösungsmittel|lösungsmittel.*ester/]
  ]
};

function normalisiere(wert) {
  return JSON.stringify(wert).toLocaleLowerCase('de-DE').replace(/\s+/g, ' ');
}

function pruefeRlpText(wurzel) {
  const index = JSON.parse(fs.readFileSync(path.join(wurzel, 'units', 'index.json'), 'utf8'));
  const fehler = [];
  let pruefungen = 0;
  for (const bereich of index.bereiche || []) {
    const daten = (bereich.einheiten || []).map(einheit => JSON.parse(fs.readFileSync(
      path.join(wurzel, 'units', bereich.code, einheit.id, 'tasks.json'), 'utf8')));
    for (const pfad of ['A', 'B', 'C']) {
      const text = normalisiere(daten.map(d => ({
        lernkarte: d.lernkarten?.[pfad],
        ziel: d.can_do?.[pfad],
        wortspeicher: d.wortspeicher,
        worterklaerungen: d.worterklaerungen,
        formelkarte: d.formelkarte,
        sicherheitskurs: d.sicherheitskurs
      })));
      for (const [inhalt, muster] of PFLICHT[bereich.code] || []) {
        pruefungen++;
        if (!muster.test(text)) fehler.push(`${bereich.code.toUpperCase()} · Pfad ${pfad}: „${inhalt}“ fehlt im Erklärungstext`);
      }
    }
  }
  return { fehler, pruefungen, themenfelder: Object.keys(PFLICHT).length };
}

if (require.main === module) {
  const wurzel = path.resolve(process.argv[2] || path.join(__dirname, '..'));
  const ergebnis = pruefeRlpText(wurzel);
  if (ergebnis.fehler.length) {
    console.error(ergebnis.fehler.map(f => `✗ ${f}`).join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`✓ ${ergebnis.themenfelder} RLP-Themenfelder auf A, B und C schriftlich abgedeckt (${ergebnis.pruefungen} Inhaltsprüfungen)`);
  }
}

module.exports = { pruefeRlpText, PFLICHT };

#!/usr/bin/env node
'use strict';

/*
 * Spielt den gelieferten Chemie-Fragenkatalog reproduzierbar in die
 * Lernwege und in das Warm-up ein. Die Auswahl wird nicht per Zufall,
 * sondern anhand von Lehrbuchkapitel, Klassenstufe und Schwierigkeit
 * getroffen. Der Lauf ist idempotent: Eine erneute Ausführung ersetzt
 * genau die bereits erzeugten Katalogaufgaben.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BANK = path.resolve(ROOT, '..', '..', 'fragenbank', 'chemie-fragenbank-github', 'data', 'questions.json');
const P = (...parts) => path.join(ROOT, ...parts);
const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const writeJson = (file, value) => fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8');

if (!fs.existsSync(BANK)) throw new Error(`Fragenkatalog fehlt: ${BANK}`);
const questions = readJson(BANK);
const warmupOnly = process.argv.includes('--warmup-only');
const unitsOnly = process.argv.includes('--units-only');

const CATEGORY = {
  'K-SICH': { title: 'Sicher arbeiten', topics: [
    'sicherheit-im-fachraum', 'labor-sicherheit', 'gefahrstoffkennzeichnung-ghs',
    'laborgeraete', 'experimente-im-unterricht', 'wie-chemiker-denken-und-arbeiten'
  ] },
  'K-STOF': { title: 'Stoffe und Trennverfahren', topics: [
    'stoffe-eigenschaften', 'aggregatzustaende', 'teilchenmodell', 'stoffgemische',
    'stoffe-gemische-trennverfahren', 'stoffe-trennverfahren', 'trennverfahren',
    'physikalisch-oder-chemisch', 'wasser-loesungen'
  ] },
  'K-REAK': { title: 'Chemische Reaktionen', topics: [
    'chemische-reaktion', 'die-chemische-reaktion-und-energetik', 'energetik',
    'luft-verbrennung', 'nachweisreaktionen',
    'formelsprache-nomenklatur-reaktionsgleichungen', 'reaktionsgleichungen'
  ] },
  'K-ATOM': { title: 'Teilchen, Atome und Periodensystem', topics: [
    'teilchenmodell', 'elemente-verbindungen', 'atombau',
    'atombau-und-periodensystem', 'atombau-energiestufen-periodensystem',
    'periodensystem', 'nachschlagetabellen'
  ] },
  'K-BIND': { title: 'Bindungen und Stoffstruktur', topics: [
    'ionenbindung', 'molekuelbau', 'molekulare-verbindungen-und-molekuelstruktur',
    'metalle-salze', 'metalle-salze-und-ihre-bindungen', 'wechselwirkungen',
    'wechselwirkungskonzept', 'formelsprache-nomenklatur-reaktionsgleichungen'
  ] },
  'K-REDOX': { title: 'Metalle, Redox und Elektrochemie', topics: [
    'redox', 'redoxreaktionen-mit-oxidationszahlen',
    'elektronenuebergaenge-redoxreaktionen-und-elektrochemie', 'elektrochemie',
    'metalle-salze-und-ihre-bindungen'
  ] },
  'K-QUANT': { title: 'Stoffmenge und Stöchiometrie', topics: [
    'quantitative-chemie-und-stoechiometrie', 'stoechiometrie',
    'rechen-und-anwendungsaufgaben', 'werkzeugkaesten-schritt-fuer-schritt'
  ] },
  'K-SL': { title: 'Säuren, Basen und Salze', topics: [
    'saeure-base', 'saeuren-basen-ph-wert-titration', 'titration',
    'wasser-loesungen', 'nachweisreaktionen', 'metalle-salze-und-ihre-bindungen'
  ] },
  'K-ORG': { title: 'Organische Chemie', topics: [
    'organik', 'funktionelle-gruppen-einstieg',
    'kohlenwasserstoffe-und-reaktionsmechanismen',
    'sauerstoffhaltige-organische-verbindungen-und-ester', 'ester',
    'biomolekuele', 'biomolekuele-und-tenside', 'proteine', 'tenside',
    'wechselwirkungskonzept'
  ] }
};

const U = {
  'fc-01': ['sicherheit-im-fachraum', 'labor-sicherheit', 'gefahrstoffkennzeichnung-ghs'],
  'fc-02': ['labor-sicherheit', 'laborgeraete', 'experimente-im-unterricht', 'wie-chemiker-denken-und-arbeiten'],
  'fc-03': ['stoffe-eigenschaften', 'aggregatzustaende', 'teilchenmodell'],
  'fc-04': ['stoffgemische', 'stoffe-gemische-trennverfahren', 'stoffe-trennverfahren', 'trennverfahren'],
  'fc-05': ['physikalisch-oder-chemisch', 'chemische-reaktion', 'die-chemische-reaktion-und-energetik'],
  'fc-06': ['luft-verbrennung', 'energetik', 'labor-sicherheit'],
  'fc-07': ['luft-verbrennung', 'chemische-reaktion', 'die-chemische-reaktion-und-energetik'],
  'fc-08': ['chemische-reaktion', 'formelsprache-nomenklatur-reaktionsgleichungen', 'reaktionsgleichungen'],
  'ps-01': ['periodensystem', 'atombau-und-periodensystem', 'atombau-energiestufen-periodensystem'],
  'ps-02': ['wie-chemiker-denken-und-arbeiten', 'teilchenmodell'],
  'ps-03': ['teilchenmodell', 'atombau', 'atombau-und-periodensystem'],
  'ps-04': ['atombau', 'atombau-und-periodensystem', 'atombau-energiestufen-periodensystem'],
  'ps-05': ['atombau', 'atombau-und-periodensystem', 'atombau-energiestufen-periodensystem'],
  'ps-06': ['atombau-und-periodensystem', 'atombau-energiestufen-periodensystem', 'nachschlagetabellen'],
  'ps-07': ['atombau-und-periodensystem', 'atombau-energiestufen-periodensystem', 'periodensystem'],
  'ps-08': ['periodensystem', 'atombau-und-periodensystem', 'atombau-energiestufen-periodensystem'],
  'ga-01': ['luft-verbrennung', 'stoffgemische'],
  'ga-02': ['nachweisreaktionen', 'luft-verbrennung'],
  'ga-03': ['molekuelbau', 'molekulare-verbindungen-und-molekuelstruktur', 'wechselwirkungskonzept'],
  'ga-04': ['luft-verbrennung', 'energetik', 'wechselwirkungskonzept'],
  'ga-05': ['luft-verbrennung', 'nachweisreaktionen', 'chemische-reaktion'],
  'wa-01': ['wasser-loesungen', 'stoffe-eigenschaften', 'wechselwirkungskonzept'],
  'wa-02': ['chemische-reaktion', 'wasser-loesungen', 'formelsprache-nomenklatur-reaktionsgleichungen'],
  'wa-03': ['reaktionsgleichungen', 'formelsprache-nomenklatur-reaktionsgleichungen', 'chemische-reaktion'],
  'wa-04': ['molekuelbau', 'molekulare-verbindungen-und-molekuelstruktur', 'wechselwirkungskonzept'],
  'wa-05': ['wasser-loesungen', 'wechselwirkungskonzept', 'stoffgemische'],
  'wa-06': ['wasser-loesungen', 'molekulare-verbindungen-und-molekuelstruktur', 'reaktionsgleichungen'],
  'sz-01': ['ionenbindung', 'metalle-salze-und-ihre-bindungen', 'atombau-und-periodensystem', 'atombau-energiestufen-periodensystem'],
  'sz-02': ['ionenbindung', 'metalle-salze-und-ihre-bindungen', 'wechselwirkungskonzept'],
  'sz-03': ['metalle-salze-und-ihre-bindungen', 'formelsprache-nomenklatur-reaktionsgleichungen'],
  'sz-04': ['metalle-salze-und-ihre-bindungen', 'wasser-loesungen', 'wechselwirkungskonzept'],
  'sz-05': ['metalle-salze-und-ihre-bindungen', 'ionenbindung', 'wasser-loesungen'],
  'me-01': ['metalle-salze-und-ihre-bindungen', 'stoffe-eigenschaften'],
  'me-02': ['metalle-salze-und-ihre-bindungen', 'wechselwirkungskonzept'],
  'me-03': ['redox', 'elektronenuebergaenge-redoxreaktionen-und-elektrochemie'],
  'me-04': ['metalle-salze-und-ihre-bindungen', 'stoffe-eigenschaften'],
  'me-05': ['redox', 'redoxreaktionen-mit-oxidationszahlen', 'elektronenuebergaenge-redoxreaktionen-und-elektrochemie'],
  'me-06': ['redox', 'redoxreaktionen-mit-oxidationszahlen', 'elektronenuebergaenge-redoxreaktionen-und-elektrochemie'],
  'me-07': ['redox', 'redoxreaktionen-mit-oxidationszahlen', 'metalle-salze-und-ihre-bindungen'],
  'qb-01': ['quantitative-chemie-und-stoechiometrie', 'nachschlagetabellen'],
  'qb-02': ['quantitative-chemie-und-stoechiometrie', 'stoechiometrie'],
  'qb-03': ['quantitative-chemie-und-stoechiometrie', 'stoechiometrie', 'rechen-und-anwendungsaufgaben'],
  'qb-04': ['quantitative-chemie-und-stoechiometrie', 'rechen-und-anwendungsaufgaben'],
  'qb-05': ['stoechiometrie', 'rechen-und-anwendungsaufgaben', 'werkzeugkaesten-schritt-fuer-schritt'],
  'sl-01': ['saeure-base', 'saeuren-basen-ph-wert-titration', 'labor-sicherheit'],
  'sl-02': ['saeure-base', 'saeuren-basen-ph-wert-titration', 'nachweisreaktionen'],
  'sl-03': ['saeure-base', 'saeuren-basen-ph-wert-titration', 'formelsprache-nomenklatur-reaktionsgleichungen'],
  'sl-04': ['saeure-base', 'saeuren-basen-ph-wert-titration', 'metalle-salze-und-ihre-bindungen'],
  'sl-05': ['saeuren-basen-ph-wert-titration', 'chemische-reaktion'],
  'sl-06': ['saeuren-basen-ph-wert-titration', 'titration', 'metalle-salze-und-ihre-bindungen'],
  'sl-07': ['saeuren-basen-ph-wert-titration', 'titration', 'werkzeugkaesten-schritt-fuer-schritt'],
  'kw-01': ['organik', 'funktionelle-gruppen-einstieg'],
  'kw-02': ['kohlenwasserstoffe-und-reaktionsmechanismen', 'organik'],
  'kw-03': ['kohlenwasserstoffe-und-reaktionsmechanismen', 'molekulare-verbindungen-und-molekuelstruktur', 'formelsprache-nomenklatur-reaktionsgleichungen'],
  'kw-04': ['kohlenwasserstoffe-und-reaktionsmechanismen', 'molekulare-verbindungen-und-molekuelstruktur', 'organik'],
  'kw-05': ['kohlenwasserstoffe-und-reaktionsmechanismen', 'wechselwirkungskonzept'],
  'kw-06': ['kohlenwasserstoffe-und-reaktionsmechanismen', 'chemische-reaktion'],
  'kw-07': ['kohlenwasserstoffe-und-reaktionsmechanismen', 'organik', 'werkzeugkaesten-schritt-fuer-schritt'],
  'al-01': ['funktionelle-gruppen-einstieg', 'sauerstoffhaltige-organische-verbindungen-und-ester'],
  'al-02': ['sauerstoffhaltige-organische-verbindungen-und-ester', 'organik'],
  'al-03': ['sauerstoffhaltige-organische-verbindungen-und-ester', 'wechselwirkungskonzept'],
  'al-04': ['sauerstoffhaltige-organische-verbindungen-und-ester', 'biomolekuele-und-tenside'],
  'al-05': ['sauerstoffhaltige-organische-verbindungen-und-ester', 'redoxreaktionen-mit-oxidationszahlen', 'rechen-und-anwendungsaufgaben'],
  'al-06': ['sauerstoffhaltige-organische-verbindungen-und-ester', 'rechen-und-anwendungsaufgaben'],
  'al-07': ['sauerstoffhaltige-organische-verbindungen-und-ester', 'organik', 'werkzeugkaesten-schritt-fuer-schritt'],
  'os-01': ['funktionelle-gruppen-einstieg', 'sauerstoffhaltige-organische-verbindungen-und-ester'],
  'os-02': ['sauerstoffhaltige-organische-verbindungen-und-ester', 'organik'],
  'os-03': ['sauerstoffhaltige-organische-verbindungen-und-ester', 'saeure-base', 'wechselwirkungskonzept'],
  'os-04': ['sauerstoffhaltige-organische-verbindungen-und-ester', 'biomolekuele-und-tenside', 'proteine'],
  'os-05': ['sauerstoffhaltige-organische-verbindungen-und-ester', 'organik', 'werkzeugkaesten-schritt-fuer-schritt'],
  'es-01': ['ester', 'sauerstoffhaltige-organische-verbindungen-und-ester'],
  'es-02': ['ester', 'sauerstoffhaltige-organische-verbindungen-und-ester'],
  'es-03': ['biomolekuele', 'biomolekuele-und-tenside', 'sauerstoffhaltige-organische-verbindungen-und-ester'],
  'es-04': ['tenside', 'biomolekuele-und-tenside', 'sauerstoffhaltige-organische-verbindungen-und-ester'],
  'es-05': ['biomolekuele-und-tenside', 'sauerstoffhaltige-organische-verbindungen-und-ester'],
  'es-06': ['ester', 'biomolekuele-und-tenside', 'sauerstoffhaltige-organische-verbindungen-und-ester']
};

const ASSET_OPTIONAL = new Set(['ext-004']);

/* Ausschließlich diese redaktionell geprüften Katalogfragen ersetzen eine
   Originalaufgabe. Ein fehlender Eintrag bedeutet bewusst: Die vorhandene
   Aufgabe ist passender als jede nur oberflächlich verwandte Katalogfrage.
   Dieselbe Frage wird nie in mehreren Lernwegen derselben Einheit benutzt. */
const CURATED = {
  'fc-01': { A: 'ext-002', C: 'src-a2-3' },
  'fc-02': { A: 'ext-005', B: 'ext-004' },
  'fc-03': { A: 'ext-014', B: 'ext-010', C: 'ext-017' },
  'fc-04': { A: 'ext-020', B: 'ext-022', C: 'ext-053' },
  'fc-05': { A: 'ext-027', B: 'ext-026', C: 'src-b2-2' },
  'fc-06': { B: 'ext-041' }, 'fc-07': { A: 'ext-039' },
  'fc-08': { B: 'ext-030', C: 'ext-054' },
  'ps-01': { A: 'src-b3-3' },
  'ps-02': { A: 'ext-012', B: 'ext-015', C: 'src-a3-1' },
  'ps-05': { B: 'ext-061', C: 'src-b3-2' },
  'ps-06': { A: 'src-c1-4' },
  'ps-07': { A: 'src-c1-7', B: 'src-c1-2', C: 'ext-058' },
  'ps-08': { A: 'src-b3-5', C: 'ext-058' },
  'ga-01': { A: 'ext-036' }, 'ga-02': { B: 'src-f-1' },
  'ga-03': { B: 'src-c3-2' },
  'ga-05': { A: 'ext-037', B: 'ext-041', C: 'ext-054' },
  'wa-03': { B: 'src-b5-6' },
  'wa-04': { A: 'src-c4-1', C: 'ext-067' },
  'wa-05': { A: 'ext-044', B: 'ext-045' },
  'wa-06': { A: 'ext-042', B: 'ext-045' },
  'sz-01': { A: 'src-b3-6' }, 'sz-02': { A: 'src-b4-5' },
  'sz-03': { A: 'src-b5-1', C: 'src-b5-5' },
  'sz-04': { A: 'src-b4-5' }, 'sz-05': { A: 'src-b4-5' },
  'me-01': { B: 'src-b4-1', C: 'src-b4-4' },
  'me-02': { B: 'src-b4-4' }, 'me-03': { B: 'ext-064' },
  'me-05': { B: 'ext-063' }, 'me-07': { B: 'ext-063' },
  'qb-01': { A: 'src-b6-4' },
  'qb-02': { A: 'src-b6-2', B: 'ext-055', C: 'ext-056' },
  'qb-03': { A: 'src-b6-2', B: 'ext-055' },
  'qb-04': { A: 'src-b6-5', C: 'src-h-2' },
  'qb-05': { A: 'src-e-2', B: 'src-e-5' },
  'sl-02': { A: 'src-d1-4', B: 'ext-071', C: 'ext-070' },
  'sl-03': { B: 'ext-069' },
  'sl-04': { A: 'src-d1-14', C: 'ext-069' },
  'sl-06': { A: 'src-d1-10', B: 'src-d1-9', C: 'src-d1-12' },
  'sl-07': { A: 'src-d1-1', B: 'src-d1-10' },
  'kw-02': { B: 'ext-074' }, 'kw-04': { A: 'src-c3-8' },
  'kw-05': { B: 'src-c4-5' },
  'kw-06': { B: 'src-d3-7', C: 'src-d3-8' },
  'kw-07': { B: 'ext-074', C: 'src-d3-8' },
  'al-01': { C: 'src-d4-1' }, 'al-05': { C: 'src-d2-8' },
  'al-07': { B: 'src-d4-1' },
  'os-01': { A: 'src-d4-3', C: 'src-d4-2' },
  'os-02': { A: 'src-d4-3' }, 'os-03': { B: 'src-d4-8' },
  'os-04': { C: 'src-d5-11' }, 'os-05': { A: 'src-d4-3' },
  'es-01': { A: 'src-d4-5', B: 'ext-077' },
  'es-03': { A: 'src-d5-3', B: 'src-d5-2' },
  'es-04': { B: 'src-d5-4' },
  'es-06': { A: 'src-d4-5', B: 'src-d5-2' }
};

/* Konkrete PDF-Seiten statt eines pauschalen Kapitelblocks. `abschnitt`
   benennt die tatsächlich zu lesende Lehrbuchstelle. Bei Querschnitts-
   einheiten stehen ergänzende Fundstellen in `weitere_stellen`. */
const BOOK_REF = {
  'fc-01':[1,'Sicherheit im Chemieunterricht',8,10,'Sicher experimentieren im Fachraum','Sicherheitsregel'],
  'fc-02':[1,'Sicherheit im Chemieunterricht',10,12,'Gasbrenner und Laborgeräte','Gasbrenner'],
  'fc-03':[2,'Stoffe und Stoffeigenschaften',13,27,'Stoffeigenschaften, Teilchen und Zustände','Stoffeigenschaft'],
  'fc-04':[3,'Stoffgemische und Trennverfahren',28,37,'Stoffgemische trennen','Trennverfahren'],
  'fc-05':[5,'Die chemische Reaktion',53,57,'Chemische Reaktionen und Stoffumwandlung','chemische Reaktion'],
  'fc-06':[4,'Luft und Verbrennungen',43,46,'Brände und Brandbekämpfung','Verbrennungsdreieck'],
  'fc-07':[4,'Luft und Verbrennungen',41,44,'Verbrennungen und Oxide','Oxid'],
  'fc-08':[5,'Die chemische Reaktion',58,65,'Reaktionsgleichungen und Berechnungen','Massenerhaltung'],
  'ps-01':[8,'Elemente und ihre Ordnung',92,96,'Periodensystem, Perioden und Gruppen','Periodensystem'],
  'ps-02':[2,'Stoffe und Stoffeigenschaften',23,27,'Teilchenmodell und Modellvorstellungen','Modell'],
  'ps-03':[5,'Die chemische Reaktion',52,57,'Daltons Atom-Molekül-Modell','Dalton'],
  'ps-04':[8,'Elemente und ihre Ordnung',97,99,'Rutherfords Streuversuch und Kern-Hülle-Modell','Atomkern'],
  'ps-05':[8,'Elemente und ihre Ordnung',98,101,'Protonen, Neutronen, Elektronen und Ordnungszahl','Ordnungszahl'],
  'ps-06':[8,'Elemente und ihre Ordnung',100,102,'Isotope und relative Atommasse','Atommasse'],
  'ps-07':[8,'Elemente und ihre Ordnung',100,102,'Schalen- und Energiestufenmodell','Außenelektron'],
  'ps-08':[8,'Elemente und ihre Ordnung',92,102,'Elementfamilien und Ordnung im Periodensystem','Elementfamilie'],
  'ga-01':[4,'Luft und Verbrennungen',38,41,'Zusammensetzung der Luft','Luftzusammensetzung'],
  'ga-02':[4,'Luft und Verbrennungen',38,42,'Sauerstoff und Gasnachweise','Nachweisreaktion'],
  'ga-03':[9,'Chemische Bindungen',106,109,'Atombindung und Elektronenpaarbindung','Elektronenpaarbindung'],
  'ga-04':[4,'Luft und Verbrennungen',47,50,'Luftverschmutzung und Treibhauseffekt','Treibhausgas'],
  'ga-05':[4,'Luft und Verbrennungen',38,50,'Luft, Gase und Verbrennungen - Zusammenfassung','Gasnachweis'],
  'wa-01':[6,'Wasser',73,76,'Eigenschaften und Anomalien des Wassers','Dichteanomalie'],
  'wa-02':[6,'Wasser',76,79,'Zerlegung und Bildung von Wasser','Analyse'],
  'wa-03':[5,'Die chemische Reaktion',58,60,'Von der Wort- zur Reaktionsgleichung','Reaktionsgleichung'],
  'wa-04':[9,'Chemische Bindungen',108,110,'Wassermoleküle sind Dipole','Elektronegativität'],
  'wa-05':[9,'Chemische Bindungen',110,113,'Wasser löst Salze und molekulare Stoffe','Lösungsmittel'],
  'wa-06':[6,'Wasser',73,79,'Eigenschaften, Zerlegung und Bildung des Wassers','Wasser'],
  'sz-01':[9,'Chemische Bindungen',103,105,'Bildung von Ionen','Ion'],
  'sz-02':[9,'Chemische Bindungen',103,106,'Ionenbindung und Ionengitter','Ionengitter'],
  'sz-03':[9,'Chemische Bindungen',103,106,'Ionenladungen und Verhältnisformeln','Verhältnisformel'],
  'sz-04':[9,'Chemische Bindungen',104,113,'Eigenschaften und Lösen von Salzen','Löslichkeit'],
  'sz-05':[9,'Chemische Bindungen',103,113,'Salze - Bildung, Gitter und Eigenschaften','Salz'],
  'me-01':[7,'Metalle und Redoxreaktionen',80,83,'Metalle und ihre Eigenschaften','Metalleigenschaft'],
  'me-02':[9,'Chemische Bindungen',110,112,'Metallbindung und Elektronengas','Metallbindung'],
  'me-03':[7,'Metalle und Redoxreaktionen',80,85,'Edle und unedle Metalle','Redoxreihe'],
  'me-04':[7,'Metalle und Redoxreaktionen',86,90,'Gebrauchsmetalle und Legierungen','Legierung'],
  'me-05':[7,'Metalle und Redoxreaktionen',83,86,'Oxidation und Reduktion','Elektronenübergang'],
  'me-06':[7,'Metalle und Redoxreaktionen',87,90,'Vom Eisenerz zum Stahl','Hochofen'],
  'me-07':[7,'Metalle und Redoxreaktionen',80,90,'Metalle und Redoxreaktionen - Zusammenfassung','Redoxreaktion'],
  'qb-01':[5,'Die chemische Reaktion',60,62,'Teilchenmengen und molare Masse','molare Masse'],
  'qb-02':[5,'Die chemische Reaktion',60,62,'Stoffmenge und Mol','Stoffmenge'],
  'qb-03':[5,'Die chemische Reaktion',60,62,'Rechnen mit Stoffmenge und molarer Masse','n = m : M'],
  'qb-04':[5,'Die chemische Reaktion',61,63,'Molares Volumen von Gasen','molares Volumen'],
  'qb-05':[5,'Die chemische Reaktion',58,65,'Reaktionsgleichungen und stöchiometrische Berechnungen','Stöchiometrie'],
  'sl-01':[10,'Säuren, Laugen, Salze',115,121,'Saure Lösungen und sicherer Umgang','Säure'],
  'sl-02':[10,'Säuren, Laugen, Salze',115,118,'Indikatoren und pH-Wert','Indikator'],
  'sl-03':[10,'Säuren, Laugen, Salze',118,123,'Säuren und saure Lösungen','Protolyse'],
  'sl-04':[10,'Säuren, Laugen, Salze',125,130,'Laugen und Basen','Hydroxid-Ion'],
  'sl-05':[10,'Säuren, Laugen, Salze',119,124,'Säuren und Laugen aus Oxiden','Nichtmetalloxid'],
  'sl-06':[10,'Säuren, Laugen, Salze',132,135,'Neutralisation und Titration','Neutralisation'],
  'sl-07':[10,'Säuren, Laugen, Salze',115,136,'Säuren, Laugen und Salze - Zusammenfassung','Säure-Base-Reaktion'],
  'kw-01':[12,'Kohlenwasserstoffe',147,150,'Der Weg zur organischen Chemie','organisch'],
  'kw-02':[12,'Kohlenwasserstoffe',150,152,'Homologe Reihe der Alkane','Alkan'],
  'kw-03':[12,'Kohlenwasserstoffe',150,152,'Formeln der Alkane','Strukturformel'],
  'kw-04':[12,'Kohlenwasserstoffe',152,153,'Isomerie und Benennung der Alkane','Konstitutionsisomer'],
  'kw-05':[12,'Kohlenwasserstoffe',153,155,'Eigenschaften der Alkane','van-der-Waals-Kraft'],
  'kw-06':[12,'Kohlenwasserstoffe',154,157,'Verbrennung und Nutzung von Kohlenwasserstoffen','vollständige Verbrennung'],
  'kw-07':[12,'Kohlenwasserstoffe',147,158,'Kohlenwasserstoffe - Zusammenfassung','homologe Reihe'],
  'al-01':[13,'Alkohole und organische Säuren',159,161,'Ethanol und die Hydroxylgruppe','Alkohol'],
  'al-02':[13,'Alkohole und organische Säuren',160,162,'Homologe Reihe der Alkanole','Alkanol'],
  'al-03':[13,'Alkohole und organische Säuren',161,163,'Eigenschaften der Alkanole','Wasserstoffbrücke'],
  'al-04':[13,'Alkohole und organische Säuren',162,163,'Alkanole mit mehreren OH-Gruppen','mehrwertiger Alkohol'],
  'al-05':[13,'Alkohole und organische Säuren',163,164,'Oxidation von Alkanolen','primärer Alkohol'],
  'al-06':[13,'Alkohole und organische Säuren',159,161,'Alkoholische Gärung und Ethanol','alkoholische Gärung'],
  'al-07':[13,'Alkohole und organische Säuren',159,164,'Alkanole - Zusammenfassung','Hydroxylgruppe'],
  'os-01':[13,'Alkohole und organische Säuren',164,166,'Organische Säuren im Alltag','Carboxygruppe'],
  'os-02':[13,'Alkohole und organische Säuren',164,166,'Alkansäuren und ihre Benennung','Alkansäure'],
  'os-03':[13,'Alkohole und organische Säuren',164,167,'Eigenschaften und Salze der Alkansäuren','Carboxylat'],
  'os-04':[15,'Nahrung, Seife, Waschmittel',184,186,'Aminosäuren und Eiweiße','Aminosäure'],
  'os-05':[13,'Alkohole und organische Säuren',164,167,'Organische Säuren - Zusammenfassung','Carboxygruppe'],
  'es-01':[13,'Alkohole und organische Säuren',166,169,'Esterbildung und Esternamen','Veresterung'],
  'es-02':[13,'Alkohole und organische Säuren',166,169,'Ester als Duft- und Aromastoffe','Aromastoff'],
  'es-03':[15,'Nahrung, Seife, Waschmittel',182,186,'Fette als Bestandteile unserer Nahrung','Fett'],
  'es-04':[15,'Nahrung, Seife, Waschmittel',187,190,'Seife und Tenside','Verseifung'],
  'es-05':[14,'Kunststoffe',174,179,'Polyester, Makromoleküle und Recycling','Makromolekül'],
  'es-06':[13,'Alkohole und organische Säuren',166,169,'Ester - Bildung, Eigenschaften und Verwendung','Veresterung']
};

const EXTRA_BOOK_REF = {
  'os-04': [{ kapitel: 13, titel: 'Alkohole und organische Säuren', seiten_von: 164, seiten_bis: 166, abschnitt: 'Frucht- und Dicarbonsäuren' }],
  'es-06': [
    { kapitel: 14, titel: 'Kunststoffe', seiten_von: 174, seiten_bis: 179, abschnitt: 'Polyester und Recycling' },
    { kapitel: 15, titel: 'Nahrung, Seife, Waschmittel', seiten_von: 182, seiten_bis: 190, abschnitt: 'Fette, Verseifung und Tenside' }
  ]
};

/* Früheste Einheit, nach der eine Katalogfrage wirklich Wiederholungsstoff
   ist. Breite Katalogthemen werden weiter unten anhand des Fragetextes
   präzisiert, damit zum Beispiel Ester nicht schon bei den Alkanen kommen. */
const TOPIC_START = {
  'sicherheit-im-fachraum':'fc-01', 'labor-sicherheit':'fc-01',
  'gefahrstoffkennzeichnung-ghs':'fc-01', 'laborgeraete':'fc-02',
  'experimente-im-unterricht':'fc-02', 'wie-chemiker-denken-und-arbeiten':'ps-02',
  'stoffe-eigenschaften':'fc-03', 'aggregatzustaende':'fc-03', 'teilchenmodell':'fc-03',
  'stoffgemische':'fc-04', 'stoffe-gemische-trennverfahren':'fc-04',
  'stoffe-trennverfahren':'fc-04', 'trennverfahren':'fc-04',
  'physikalisch-oder-chemisch':'fc-05', 'chemische-reaktion':'fc-05',
  'die-chemische-reaktion-und-energetik':'fc-05', 'energetik':'fc-05',
  'luft-verbrennung':'fc-06', 'nachweisreaktionen':'ga-02',
  'formelsprache-nomenklatur-reaktionsgleichungen':'fc-08', 'reaktionsgleichungen':'fc-08',
  'elemente-verbindungen':'ps-03', 'atombau':'ps-03',
  'atombau-und-periodensystem':'ps-05', 'atombau-energiestufen-periodensystem':'ps-07',
  'periodensystem':'ps-01', 'nachschlagetabellen':'ps-01',
  'molekuelbau':'ga-03', 'molekulare-verbindungen-und-molekuelstruktur':'ga-03',
  'ionenbindung':'sz-01', 'metalle-salze':'sz-01', 'metalle-salze-und-ihre-bindungen':'sz-01',
  'wechselwirkungen':'wa-04', 'wechselwirkungskonzept':'wa-04',
  'wasser-loesungen':'wa-05', 'redox':'me-03',
  'redoxreaktionen-mit-oxidationszahlen':'me-05',
  'elektronenuebergaenge-redoxreaktionen-und-elektrochemie':'me-05', 'elektrochemie':'me-05',
  'quantitative-chemie-und-stoechiometrie':'qb-01', 'stoechiometrie':'qb-02',
  'rechen-und-anwendungsaufgaben':'qb-03', 'werkzeugkaesten-schritt-fuer-schritt':'qb-05',
  'saeure-base':'sl-01', 'saeuren-basen-ph-wert-titration':'sl-02', 'titration':'sl-06',
  'organik':'kw-01', 'kohlenwasserstoffe-und-reaktionsmechanismen':'kw-02',
  'funktionelle-gruppen-einstieg':'al-01',
  'sauerstoffhaltige-organische-verbindungen-und-ester':'al-01', 'ester':'es-01',
  'biomolekuele':'es-03', 'biomolekuele-und-tenside':'es-03',
  'proteine':'os-04', 'tenside':'es-04'
};

const OUT_OF_SCOPE = /\b(orbital|e\/?z-isomer|mesomer|formalladung|nukleophil|elektrophil|radikalische substitution|dichromat|permanganat)\b/i;

function introUnitFor(question) {
  const text = `${plain(question.prompt)} ${plain(question.answer && question.answer.text)}`;
  if (/polyester|polymer|kunststoff|makromolekül/i.test(text)) return 'es-05';
  if (/verseif|seife|tensid|micell/i.test(text)) return 'es-04';
  if (/fett|glycerid|omega-3|fettsäure/i.test(text)) return 'es-03';
  if (/aminosäure|zwitterion|protein/i.test(text)) return 'os-04';
  if (/ester|veresterung|aromastoff/i.test(text)) return 'es-01';
  if (/carbox|alkansäure|carbonsäure|essigsäure|ethansäure/i.test(text)) return 'os-01';
  if (/alkohol|alkanol|hydroxygruppe|ethanol|propanol/i.test(text)) return 'al-01';
  if (/oxidationszahl/i.test(text)) return 'me-05';
  if (/hochofen|eisenerz|roheisen/i.test(text)) return 'me-06';
  if (/metallbindung|elektronengas/i.test(text)) return 'me-02';
  if (/ionengitter|salzkristall|verhältnisformel|salzformel/i.test(text)) return 'sz-02';
  if (/titration/i.test(text)) return 'sl-06';
  if (/protolyse|säure-base-paar|ampholyt|autoprotolyse/i.test(text)) return 'sl-03';
  if (/indikator|pH/i.test(text)) return 'sl-02';
  if (/isomer|van-der-waals|alkan|kohlenwasserstoff/i.test(text)) return 'kw-02';
  return TOPIC_START[question.topicSlug] || null;
}

function warmupLevel(question) {
  const prompt = plain(question.prompt);
  if (question.difficulty >= 3 || /\b(begründe|beurteile|bewerte|leite|korrigiere|mehrschritt|vergleiche)\b/i.test(prompt)) return 'C';
  if (question.difficulty >= 2 || /\b(erkläre|berechne|stelle|formuliere|beschreibe|unterscheide)\b/i.test(prompt)) return 'B';
  return 'A';
}

const UNIT_CATEGORY = {
  fc: ['K-SICH', 'K-SICH', 'K-STOF', 'K-STOF', 'K-REAK', 'K-REAK', 'K-REAK', 'K-REAK'],
  ps: Array(8).fill('K-ATOM'), ga: ['K-REAK', 'K-REAK', 'K-BIND', 'K-REAK', 'K-REAK'],
  wa: ['K-STOF', 'K-REAK', 'K-REAK', 'K-BIND', 'K-STOF', 'K-REAK'],
  sz: Array(5).fill('K-BIND'), me: ['K-BIND', 'K-BIND', 'K-REDOX', 'K-BIND', 'K-REDOX', 'K-REDOX', 'K-REDOX'],
  qb: Array(5).fill('K-QUANT'), sl: Array(7).fill('K-SL'), kw: Array(7).fill('K-ORG'),
  al: Array(7).fill('K-ORG'), os: Array(5).fill('K-ORG'), es: Array(6).fill('K-ORG')
};

/* Fachwörter, die eine Frage wirklich mit dem konkreten Stundenthema
   verbinden. Die Katalog-Themen sind teilweise sehr breit (etwa
   „Rechen- und Anwendungsaufgaben“); ohne diesen zweiten Filter könnte
   eine pH-Rechnung in einer Mol-Stunde landen. */
const FOCUS = {
  'fc-01': ['sicher', 'gefahr', 'schutz', 'fachraum'], 'fc-02': ['brenner', 'reagenzglas', 'erhitzen', 'versuch'],
  'fc-03': ['stoffeigenschaft', 'aggregatzustand', 'dichte', 'schmelz', 'siede'], 'fc-04': ['gemisch', 'trenn', 'filtr', 'destill', 'chromat'],
  'fc-05': ['chemische reaktion', 'stoffumwandlung', 'physikalisch'], 'fc-06': ['verbrennung', 'feuer', 'löschen', 'zünd'],
  'fc-07': ['oxid', 'verbrennung', 'sauerstoff'], 'fc-08': ['wortgleichung', 'reaktionsgleichung', 'massenerhaltung'],
  'ps-01': ['periodensystem', 'periode', 'hauptgruppe'], 'ps-02': ['modell', 'hypothese', 'beobachtung'],
  'ps-03': ['dalton', 'atommodell', 'teilchenmodell'], 'ps-04': ['kern', 'hülle', 'streuversuch'],
  'ps-05': ['proton', 'neutron', 'elektron', 'ordnungszahl'], 'ps-06': ['atommasse', 'massenzahl', 'isotop'],
  'ps-07': ['schale', 'energiestufe', 'valenzelektron'], 'ps-08': ['hauptgruppe', 'elementfamilie', 'alkalimetall', 'halogen', 'edelgas'],
  'ga-01': ['luft', 'gasgemisch', 'stickstoff', 'sauerstoff'], 'ga-02': ['glimmspan', 'knallgas', 'kalkwasser', 'sauerstoff, wasserstoff und kohlenstoffdioxid'],
  'ga-03': ['elektronenpaarbindung', 'oktett', 'valenzstrich', 'chlor-molekül'], 'ga-04': ['treibhaus', 'luftschad', 'edelgas', 'atmosphäre'],
  'ga-05': ['luft', 'gas', 'nachweis', 'verbrennung'],
  'wa-01': ['wasser', 'dichteanomalie', 'oberflächenspannung'], 'wa-02': ['wasser', 'elektrolyse', 'analyse', 'synthese'],
  'wa-03': ['reaktionsgleichung', 'wortgleichung', 'koeffizient'], 'wa-04': ['elektronegativität', 'polar', 'dipol'],
  'wa-05': ['lösung', 'lösen', 'löslichkeit', 'wasser'], 'wa-06': ['wasser', 'dipol', 'lösung', 'elektrolyse'],
  'sz-01': ['ion', 'kation', 'anion', 'elektronenabgabe'], 'sz-02': ['ionengitter', 'ionenbindung', 'salzkristall'],
  'sz-03': ['verhältnisformel', 'salzformel', 'ionenladung'], 'sz-04': ['salz', 'löslichkeit', 'leitfähigkeit', 'kristall'],
  'sz-05': ['salz', 'ion', 'verhältnisformel', 'löslichkeit'],
  'me-01': ['metall', 'leitfähigkeit', 'verformbar'], 'me-02': ['metallbindung', 'elektronengas'],
  'me-03': ['edel', 'unedel', 'spannungsreihe'], 'me-04': ['legierung', 'gebrauchsmetall'],
  'me-05': ['grundprinzip von redoxreaktionen', 'salzbildungsgleichung', 'zn + cu', 'redoxgleichung', 'elektronenübergang'], 'me-06': ['erz', 'hochofen', 'eisenoxid', 'kohlenstoffmonoxid'],
  'me-07': ['metall', 'redox', 'oxidation', 'reduktion'],
  'qb-01': ['atommasse', 'molekülmasse', 'molare masse'], 'qb-02': ['stoffmenge', 'avogadro', ' mol'],
  'qb-03': ['stoffmenge', 'molare masse', 'n = m', 'm / m'], 'qb-04': ['molares volumen', 'gasvolumen', 'normbedingungen'],
  'qb-05': ['stöchiometr', 'stoffmengenverhältnis', 'reaktionsgleichung'],
  'sl-01': ['säure', 'ätzend', 'sicherheit'], 'sl-02': ['indikator', 'ph'],
  'sl-03': ['protolyse', 'oxonium', 'säure'], 'sl-04': ['lauge', 'hydroxid', 'base'],
  'sl-05': ['oxid', 'säure', 'lauge'], 'sl-06': ['neutralisation', 'salzbildung', 'titration'],
  'sl-07': ['säure', 'base', 'ph', 'neutralisation'],
  'kw-01': ['organisch', 'kohlenstoff', 'erdöl'], 'kw-02': ['homologe reihe', 'alkan', 'methan', 'ethan'],
  'kw-03': ['summenformel', 'strukturformel', 'halbstrukturformel'], 'kw-04': ['konstitutionsisomerie', 'e/z-isomerie', 'isomer', 'buten', 'nomenklatur', 'iupac'],
  'kw-05': ['siedetemperatur', 'van-der-waals', 'dispersions'], 'kw-06': ['verbrennung', 'kohlenwasserstoff', 'kohlenstoffdioxid'],
  'kw-07': ['alkan', 'isomer', 'kohlenwasserstoff'],
  'al-01': ['hydroxygruppe', 'funktionell', 'ethanol', 'alkohole gut wasserlöslich'], 'al-02': ['alkanol', 'trivialnamen', 'homologe reihe', 'nomenklatur'],
  'al-03': ['alkohol', 'wasserstoffbrücke', 'löslichkeit', 'siedetemperatur'], 'al-04': ['mehrwertig', 'glycerin', 'glycol'],
  'al-05': ['primärer alkohol', 'sekundärer alkohol', 'aldehyd', 'keton', 'ethanol', 'propanal', 'propanon'], 'al-06': ['gärung', 'destillation', 'ethanol'],
  'al-07': ['alkohol', 'alkanol', 'ethanol', 'hydroxygruppe'],
  'os-01': ['carboxygruppe', 'carbonsäure', 'ethansäure', 'propansäure', 'essigsäure'], 'os-02': ['alkansäure', 'trivialnamen', 'homologe reihe', 'nomenklatur'],
  'os-03': ['carbonsäure', 'carboxylat', 'salz', 'löslichkeit'], 'os-04': ['fruchtsäure', 'dicarbonsäure', 'aminosäure'],
  'os-05': ['carbonsäure', 'carboxygruppe', 'alkansäure'],
  'es-01': ['veresterung', 'ester', 'säure und alkohol'], 'es-02': ['ester', 'aroma', 'lösungsmittel'],
  'es-03': ['fett', 'glycerid', 'fettsäure'], 'es-04': ['verseifung', 'seife', 'tensid', 'micelle'],
  'es-05': ['polyester', 'polymer', 'kunststoff', 'makromolekül'], 'es-06': ['ester', 'fett', 'seife', 'polyester']
};

const OLD_TO_NEW = {
  'W-STOF': 'K-STOF', 'W-TEIL': 'K-ATOM', 'W-SYMB': 'K-BIND',
  'W-GLEI': 'K-REAK', 'W-RECH': 'K-QUANT', 'W-EINH': 'K-QUANT',
  'W-LOES': 'K-SL', 'W-ORG': 'K-ORG'
};

const hash = s => [...String(s)].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
const plain = s => String(s || '').replace(/\s+/g, ' ').replace(/\s+([,.;:])/g, '$1').trim();

function shortAnswer(question, max = 235) {
  const text = plain(question.answer && question.answer.text);
  if (text.length <= max) return text;
  const cut = text.slice(0, max + 1);
  const stops = [...cut.matchAll(/[.!?;](?=\s|$)/g)].map(m => m.index + 1).filter(i => i >= 70);
  if (stops.length) return cut.slice(0, stops[stops.length - 1]);
  const space = cut.lastIndexOf(' ');
  return cut.slice(0, space > 80 ? space : max).trim() + ' …';
}

function categoryOf(question) {
  return Object.keys(CATEGORY).find(code => CATEGORY[code].topics.includes(question.topicSlug)) || null;
}

function shuffled(values, seed) {
  const a = values.slice();
  let state = hash(seed) || 1;
  for (let i = a.length - 1; i > 0; i--) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const j = state % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function choiceFor(question, level, allowedTopics, seed) {
  if (question.type === 'multiple_choice' && Array.isArray(question.choices) && Number.isInteger(question.correctChoice)) {
    let options = question.choices.map(plain);
    let correct = question.correctChoice;
    if (level === 'A' && options.length > 3) {
      const entfernbar = options.map((_, index) => index).filter(index => index !== correct);
      const weg = entfernbar[hash(seed) % entfernbar.length];
      options = options.filter((_, index) => index !== weg);
      if (weg < correct) correct--;
    }
    return { options, answer: correct };
  }
  if (question.type === 'true_false') {
    const correct = /^falsch\b/i.test(plain(question.answer.text)) ? 1 : 0;
    return { options: ['Richtig', 'Falsch'], answer: correct };
  }

  const correct = shortAnswer(question);
  const count = level === 'A' ? 3 : 4;
  const ownCategory = categoryOf(question);
  const candidate = questions.filter(q => q.id !== question.id && !(q.assets || []).length)
    .filter(q => plain(q.answer && q.answer.text))
    .map(q => ({ q, text: shortAnswer(q) }))
    .filter(x => x.text !== correct)
    .map(x => {
      let score = 0;
      const sameTopic = x.q.topicSlug === question.topicSlug;
      const sameCategory = categoryOf(x.q) === ownCategory;
      if (level === 'A') score += sameCategory ? 35 : 0;
      if (level === 'B') score += sameCategory ? 45 : 0;
      if (level === 'C') score += sameTopic ? 80 : (sameCategory ? 50 : 0);
      if ((allowedTopics || []).includes(x.q.topicSlug)) score += level === 'A' ? 5 : 30;
      score -= Math.abs(x.text.length - correct.length) / (level === 'C' ? 12 : 20);
      score += (hash(seed + x.q.id) % 1000) / 10000;
      return { ...x, score };
    })
    .sort((a, b) => b.score - a.score);

  const distractors = [];
  const seen = new Set([correct]);
  for (const item of candidate) {
    if (seen.has(item.text)) continue;
    seen.add(item.text);
    distractors.push(item.text);
    if (distractors.length === count - 1) break;
  }
  if (distractors.length !== count - 1) throw new Error(`Zu wenige Antwortoptionen für ${question.id}`);
  const options = shuffled([correct, ...distractors], seed);
  return { options, answer: options.indexOf(correct) };
}

function eligible(question, topics, grade, level) {
  if ((question.assets || []).length) return false;
  if (!topics.includes(question.topicSlug)) return false;
  if (!plain(question.prompt) || !plain(question.answer && question.answer.text)) return false;
  if (level === 'A') return question.difficulty === 1;
  if (level === 'B') return question.difficulty === 1 || question.difficulty === 2;
  return question.difficulty === 2 || question.difficulty === 3;
}

const usage = new Map();
function selectQuestion(unit, grade, level, already) {
  const preferredId = PREFERRED[unit] && PREFERRED[unit][level];
  if (preferredId) {
    const preferred = questions.find(q => q.id === preferredId);
    if (!preferred) throw new Error(`${unit}/${level}: bevorzugte Frage ${preferredId} fehlt`);
    usage.set(preferred.id, (usage.get(preferred.id) || 0) + 1);
    return preferred;
  }
  const topics = U[unit];
  const ideal = level === 'A' ? 1 : level === 'B' ? 2 : 3;
  const basis = questions.filter(q => (!(q.assets || []).length || ASSET_OPTIONAL.has(q.id)) && topics.includes(q.topicSlug)
    && plain(q.prompt) && plain(q.answer && q.answer.text) && !already.has(q.id));
  const basisMitWiederholung = questions.filter(q => (!(q.assets || []).length || ASSET_OPTIONAL.has(q.id)) && topics.includes(q.topicSlug)
    && plain(q.prompt) && plain(q.answer && q.answer.text));
  const focus = FOCUS[unit] || [];
  const keywordPasst = (text, word) => {
    const w = word.trim();
    if (w.length <= 3) {
      const sicher = w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return new RegExp(`(^|[^a-z0-9äöüß])${sicher}(?=[^a-z0-9äöüß]|$)`, 'i').test(text);
    }
    return text.includes(w);
  };
  const passt = q => {
    const text = plain(q.prompt).toLocaleLowerCase('de');
    return focus.some(word => keywordPasst(text, word));
  };
  const mitFokus = basis.filter(passt);
  const fokusMitWiederholung = basisMitWiederholung.filter(passt);
  const niveau = q => level === 'A' ? q.difficulty === 1
    : level === 'B' ? q.difficulty <= 2 : q.difficulty >= 2;
  let pool = mitFokus.filter(niveau);
  if (!pool.length) pool = mitFokus;       // Passung schlägt eine bloße Schwierigkeitszahl
  if (!pool.length) pool = fokusMitWiederholung.filter(niveau);
  if (!pool.length) pool = fokusMitWiederholung;
  if (!pool.length) pool = basis.filter(niveau);
  const ranked = pool
    .map(q => {
      let score = 100;
      if ((q.grades || []).includes(grade)) score += 35;
      score -= Math.abs(q.difficulty - ideal) * 12;
      score -= (usage.get(q.id) || 0) * 18;
      if (q.type === 'multiple_choice' || q.type === 'true_false') score += 6;
      const text = plain(q.prompt).toLocaleLowerCase('de');
      score += focus.filter(word => keywordPasst(text, word)).length * 28;
      score += (hash(`${unit}-${level}-${q.id}`) % 1000) / 10000;
      return { q, score };
    }).sort((a, b) => b.score - a.score);
  if (!ranked.length) throw new Error(`${unit}/${level}: keine passende Katalogfrage`);
  const q = ranked[0].q;
  usage.set(q.id, (usage.get(q.id) || 0) + 1);
  return q;
}

function unitFiles() {
  const out = [];
  for (const series of fs.readdirSync(P('units')).filter(x => /^[a-z]{2}$/.test(x))) {
    for (const unit of fs.readdirSync(P('units', series)).filter(x => /^[a-z]{2}-\d{2}$/.test(x))) {
      const file = P('units', series, unit, 'tasks.json');
      if (fs.existsSync(file)) out.push({ series, unit, file });
    }
  }
  return out.sort((a, b) => a.unit.localeCompare(b.unit));
}

const assignment = [];
for (const entry of warmupOnly ? [] : unitFiles()) {
  let data = readJson(entry.file);
  const topics = U[entry.unit];
  if (!topics) throw new Error(`Themenzuordnung fehlt: ${entry.unit}`);
  const nr = Number(entry.unit.slice(-2));
  const category = UNIT_CATEGORY[entry.series][nr - 1];

  /* Zuerst jede frühere automatische Katalogersetzung auf die redaktionell
     geschriebene Originalaufgabe zurücksetzen. So bleiben auch Einheiten
     ohne geeignete Katalogfrage vollständig und fachlich sauber. */
  const rel = path.posix.join('units', entry.series, entry.unit, 'tasks.json');
  const baseline = JSON.parse(execFileSync('git', ['show', `HEAD:${rel}`], { cwd: ROOT, encoding: 'utf8' }));
  const original = new Map(baseline.tasks.map(task => [`${task.path}/${task.step}`, task]));
  data.tasks = data.tasks.map(task => {
    if (!(Array.isArray(task.tags) && task.tags.includes('fragenkatalog'))) return task;
    return structuredClone(original.get(`${task.path}/${task.step}`) || task);
  });

  const ref = BOOK_REF[entry.unit];
  if (!ref) throw new Error(`Lehrbuchstelle fehlt: ${entry.unit}`);
  data.lehrbuch = {
    kapitel: ref[0], titel: ref[1], seiten_von: ref[2], seiten_bis: ref[3],
    abschnitt: ref[4], bezugswort: ref[5], quelle: 'Lehrbuch_Chemie.pdf'
  };
  if (EXTRA_BOOK_REF[entry.unit]) data.lehrbuch.weitere_stellen = EXTRA_BOOK_REF[entry.unit];

  data.tasks.forEach(task => {
    if (Array.isArray(task.spiral)) task.spiral = [...new Set(task.spiral.map(x => OLD_TO_NEW[x] || x))];
  });

  for (const [level, questionId] of Object.entries(CURATED[entry.unit] || {})) {
    const q = questions.find(item => item.id === questionId);
    if (!q) throw new Error(`${entry.unit}/${level}: kuratierte Frage ${questionId} fehlt`);
    const candidates = data.tasks.filter(t => t.path === level);
    const old = candidates[candidates.length - 1];
    const index = data.tasks.indexOf(old);
    const choice = choiceFor(q, level, topics, `${entry.unit}-${level}-${q.id}`);
    const task = {
      id: `${entry.unit.replace('-', '').toUpperCase()}-${level}${old.step}-KAT`,
      path: level,
      step: old.step,
      type: 'choice',
      prompt: plain(q.prompt),
      options: choice.options,
      answer: choice.answer,
      hints: level === 'A'
        ? [`Lies den Abschnitt „${data.lehrbuch.abschnitt}“.`, 'Streiche Antworten, die nicht genau zur Frage passen.']
        : [`Prüfe jede Aussage mit dem Abschnitt „${data.lehrbuch.abschnitt}“ (PDF-S. ${data.lehrbuch.seiten_von}–${data.lehrbuch.seiten_bis}).`],
      solution: plain(q.answer.text),
      tags: ['fragenkatalog', q.topicSlug, `niveau-${level.toLowerCase()}`],
      spiral: [category],
      herkunft: `Chemie-Fragenkatalog ${q.id} · Lehrbuch PDF-S. ${data.lehrbuch.seiten_von}–${data.lehrbuch.seiten_bis}`
    };
    data.tasks[index] = task;
    assignment.push({
      einheit: data.unit, titel: data.title, klasse: data.klasse, lernweg: level,
      lehrbuch_seiten: `${data.lehrbuch.seiten_von}–${data.lehrbuch.seiten_bis}`,
      katalog_id: q.id, katalog_thema: q.topic, katalog_schwierigkeit: q.difficulty,
      kategorie: category
    });
  }
  writeJson(entry.file, data);
}

/* Warm-up-Fragen: dieselben Fachquellen, aber als eigenständige Pools. */
if (!warmupOnly) {
  fs.mkdirSync(P('fragenkatalog'), { recursive: true });
  writeJson(P('fragenkatalog', 'questions.json'), questions);
  writeJson(P('fragenkatalog', 'zuordnung.json'), {
    hinweis: 'Nur redaktionell geprüfte Katalogfragen ersetzen eine Originalaufgabe. Fehlende Lernwege behalten ihre einheitsspezifische Aufgabe; dieselbe Frage wird innerhalb einer Einheit nicht mehrfach verwendet.',
    quelle: 'chemie-fragenbank-github.zip',
    lehrbuch: 'Lehrbuch_Chemie.pdf',
    zuordnungen: assignment
  });
}

for (const [code, config] of Object.entries(unitsOnly ? {} : CATEGORY)) {
  const items = [];
  const seenPrompts = new Set();
  const kandidaten = questions
    .filter(x => categoryOf(x) === code && !(x.assets || []).length)
    .filter(q => {
      const prompt = plain(q.prompt);
      if (!prompt || OUT_OF_SCOPE.test(`${prompt} ${plain(q.answer && q.answer.text)}`)) return false;
      if (seenPrompts.has(prompt)) return false;
      seenPrompts.add(prompt);
      return !!introUnitFor(q);
    })
    .map(q => {
      const prompt = plain(q.prompt);
      const operator = /\b(begründe|beurteile|bewerte|leite|korrigiere|vergleiche)\b/i.test(prompt) ? 45
        : /\b(erkläre|berechne|stelle|formuliere|beschreibe|unterscheide)\b/i.test(prompt) ? 20 : 0;
      return { q, score: q.difficulty * 100 + operator + Math.min(plain(q.answer.text).length, 500) / 20 };
    })
    .sort((a, b) => a.score - b.score || a.q.id.localeCompare(b.q.id));

  const endeA = Math.max(1, Math.floor(kandidaten.length * 0.35));
  const endeB = Math.ceil(kandidaten.length * 0.65);
  for (const [index, eintrag] of kandidaten.entries()) {
    const q = eintrag.q;
    const prompt = plain(q.prompt);
    const abEinheit = introUnitFor(q);
    const level = index < endeA ? 'A' : index < endeB ? 'B' : 'C';
    const choice = choiceFor(q, level, config.topics, `warmup-${code}-${level}-${q.id}`);
    items.push({
      id: `KAT-${q.id}-${level}`,
      level,
      kategorie: code,
      skill: q.topic,
      type: 'choice',
      prompt,
      options: choice.options,
      answer: choice.answer,
      solution: plain(q.answer.text),
      katalog_id: q.id,
      schwierigkeit: q.difficulty,
      ab_einheit: abEinheit
    });
  }
  writeJson(P('spiral', code.toLowerCase() + '.json'), {
    kategorie: code, titel: config.title,
    hinweis: 'Fragen aus dem gelieferten Chemie-Fragenkatalog; jede Frage gehört genau einem Niveau und erscheint erst nach ihrer Einführungs-Einheit.',
    fragen: items
  });
}

const planFile = P('spiral', 'plan.json');
const plan = readJson(planFile);
plan._hinweis = 'Das Warm-up wiederholt ausschließlich Chemiefragen aus dem gelieferten Katalog und folgt der Lehrbuchreihenfolge.';
plan._warmup = 'Jede Frage besitzt eine Einführungs-Einheit (ab_einheit) und wird erst in späteren Einheiten freigeschaltet. Nur FC-01 nutzt die eigenen Sicherheitsregeln als Einstieg.';
plan.kategorien = Object.keys(CATEGORY);
const seriesKnowledge = {
  fc: ['K-SICH', 'K-STOF', 'K-REAK'], ps: ['K-ATOM'], ga: ['K-REAK', 'K-BIND'],
  wa: ['K-STOF', 'K-BIND', 'K-REAK'], sz: ['K-BIND', 'K-SL'],
  me: ['K-REDOX', 'K-BIND'], qb: ['K-QUANT'], sl: ['K-SL'],
  kw: ['K-ORG'], al: ['K-ORG'], os: ['K-ORG'], es: ['K-ORG']
};
for (const row of plan.reihen) row.grundwissen = seriesKnowledge[row.code];
plan.verzahnung = {};
for (const unit of Object.keys(U)) {
  const series = unit.slice(0, 2);
  const nr = Number(unit.slice(-2));
  plan.verzahnung[unit] = [UNIT_CATEGORY[series][nr - 1]];
}
for (const key of Object.keys(plan.fehlerprofil || {})) {
  plan.fehlerprofil[key] = OLD_TO_NEW[plan.fehlerprofil[key]] || plan.fehlerprofil[key];
}
if (!unitsOnly) writeJson(planFile, plan);

if (!warmupOnly) console.log(`${assignment.length} Katalogfragen in ${new Set(assignment.map(x => x.einheit)).size} Einheiten eingespielt.`);
for (const code of unitsOnly ? [] : Object.keys(CATEGORY)) {
  const pool = readJson(P('spiral', code.toLowerCase() + '.json'));
  const counts = ['A', 'B', 'C'].map(level => pool.fragen.filter(q => q.level === level).length);
  console.log(`${code}: A/B/C = ${counts.join('/')}`);
}

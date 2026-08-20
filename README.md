# Chemie 7–10 · Campus Hannah Höch

Differenzierte Lernwege für die Jahrgänge 7 bis 10, Campus Hannah Höch.
Statische Website, keine Abhängigkeiten, kein Build-Step.

**76 Einheiten à 45 Minuten · 1064 Aufgaben · Hefteintrag je Lernweg.**
**Warm-up-Pool: 120 Generatoren in 8 Kategorien für „Altes Wissen“ —**
**kumulativ über die zurückliegenden Reihen, im Unterricht Pflicht.**
**168 eingebettete Lernvideos mit Zwischenfragen (Lumi),**
**197 externe Übungen, 228 gedruckte Übungsblätter (je Lernweg eines).**
**Prüfungstrainer, Taschenrechner, Beameransicht, Kompetenzmatrix, Offline-Betrieb.**

Das Projekt ist das Schwesterprojekt zu `chh_Mathe_Klasse_9` und übernimmt
dessen Architektur unverändert: dieselbe Aufgaben-Engine, dasselbe
Warm-up-Prinzip, dieselben Betriebs- und Prüfwerkzeuge. Ausgetauscht sind alle
fachlichen Schichten — Inhalt, Aufgabenbilder, Animationen, Denkfehler-Kategorien.

## Grundlage

Zwei Dokumente bestimmen den Aufbau:

- das **schulinterne Curriculum Chemie 7–10** mit seinen zwölf
  Unterrichtsreihen und deren Stundenzahlen,
- der **Rahmenlehrplan 1–10 Berlin/Brandenburg, Teil C Chemie** mit den
  Themenfeldern 3.1 bis 3.12, den vier Basiskonzepten und den
  Kompetenzbereichen.

Die zwölf Lernbereiche entsprechen eins zu eins den zwölf Unterrichtsreihen.
Die Zahl der Einheiten je Bereich folgt den Stundenzahlen des SchiC; jeder
Bereich schließt mit einer Einheit, die anwendet und auf die Prüfung vorbereitet.

| Bereich | Titel | Klasse | Themenfeld | Einheiten | Aufgaben |
|---|---|---|---|---|---|
| **FC** | Faszination Chemie | 7 | 3.1 | 8 | 112 |
| **PS** | Das Periodensystem der Elemente | 7 | 3.2 | 8 | 112 |
| **GA** | Gase | 7 | 3.3 | 5 | 70 |
| **WA** | Wasser — eine Verbindung | 8 | 3.4 | 6 | 84 |
| **SZ** | Salze | 8 | 3.5 | 5 | 70 |
| **ME** | Metalle | 8 | 3.6 | 7 | 98 |
| **QB** | Quantitative Betrachtungen | 9 | 3.7 | 5 | 70 |
| **SL** | Säuren und Laugen | 9 | 3.8 | 7 | 98 |
| **KW** | Kohlenwasserstoffe | 9 | 3.9 | 7 | 98 |
| **AL** | Alkohole | 10 | 3.10 | 7 | 98 |
| **OS** | Organische Säuren | 10 | 3.11 | 5 | 70 |
| **ES** | Ester und Makromoleküle | 10 | 3.12 | 6 | 84 |

Jede Einheit: 4 Aufgaben Basis · 6 Standard · 4 Vertiefung, jeweils über die
Stufen Einstieg → Geführt → Frei → Transfer. Alle mit gestuften Tipps,
vollständigem Lösungsweg und hinterlegten Fehlvorstellungen.

## Die vier roten Fäden

Der Rahmenlehrplan nennt vier Basiskonzepte. Sie stehen in jeder `tasks.json`
im Feld `leitidee` und ziehen sich durch alle vier Jahrgänge:

| Code | Basiskonzept | Beispiel für den Bogen über die Jahrgänge |
|---|---|---|
| `B1` | Stoff-Teilchen-Konzept | Aggregatzustand (FC-03) → Atombau (PS-05) → Stoffmenge (QB-02) |
| `B2` | Struktur-Eigenschafts-Konzept | Ionengitter (SZ-02) → Wasserdipol (WA-04) → Kettenlänge (KW-05) |
| `B3` | Konzept der chemischen Reaktion | Massenerhaltung (FC-08) → Redox (ME-05) → Veresterung (ES-01) |
| `B4` | Energie-Konzept | Brennerflamme (FC-02) → Feuerdreieck (FC-06) → Hochofen (ME-06) |

Die letzte Einheit des Curriculums (ES-06) greift diesen Bogen ausdrücklich auf.
Das ist kein Schmuck: Wer nach vier Jahren nicht sagen kann, was Chemie
zusammenhält, hat 76 Einzelstunden erlebt und keinen Zusammenhang.

## Aufgabenbilder (`zeichnen.js`)

Elf Typen, alle über das Feld `visual` an jeder Aufgabe und an jeder Lernkarte:

```jsonc
"visual": { "type": "teilchen", "zustand": "fest", "art": "verbindung",
            "alt": "Teilchenmodell einer Verbindung im festen Zustand." }

"visual": { "type": "atom", "z": 11, "symbol": "Na", "neutronen": 12,
            "regler": true, "alt": "Schalenmodell von Natrium." }

"visual": { "type": "pse", "markiert": ["Na", "Cl"], "perioden": 3,
            "legende": "…", "alt": "…" }

"visual": { "type": "lewis", "molekuel": "h2o", "alt": "…" }

"visual": { "type": "struktur", "kette": 3, "gruppe": "oh", "position": 2,
            "name": "Propan-2-ol", "alt": "…" }

"visual": { "type": "energie", "verlauf": "exotherm", "katalysator": true, "alt": "…" }

"visual": { "type": "phskala", "marken": [{ "wert": 2, "stoff": "Zitronensaft" }], "alt": "…" }

"visual": { "type": "apparatur", "aufbau": "destillation", "alt": "…" }

"visual": { "type": "anteil", "segmente": [{ "anteil": 78, "label": "N₂" }], "alt": "…" }

"visual": { "type": "diagramm", "xtitel": "…", "ytitel": "…",
            "punkte": [[1, -162], [2, -89]], "alt": "…" }

"visual": { "type": "animation", "name": "aggregat", "stufe": "B" }
```

`alt` ist bei jedem Bildtyp Pflicht — es steht im Schema und `pruefen.js` setzt
es durch.

Alle Bilder sind Inline-SVG und verwenden die Farbtoken aus `app.css`. Damit
folgen sie dem dunklen Modus und drucken in Graustufen. Ausnahme sind die
Elementfarben: Sauerstoff ist im Schulbuch rot und bleibt es auch im dunklen
Modus, deshalb feste Hexwerte mit zusätzlichem Rand.

### Warum ein fester Satz Lewis-Formeln

Der Typ `lewis` kennt neun Moleküle und keine freie Eingabe. Eine automatische
Anordnung freier Elektronenpaare, die gelegentlich danebenliegt, wäre in einer
Aufgabe zur Oktettregel schlimmer als gar kein Bild. Für organische Moleküle
gibt es stattdessen `struktur`, das unverzweigte Ketten mit funktioneller Gruppe
korrekt konstruiert.

### Warum kein eingebettetes Fremdmaterial

Die Bilder sind selbst gezeichnet statt von PhET, Molview oder ähnlichem
eingebunden — aus denselben drei Gründen, aus denen das Mathematikprojekt kein
GeoGebra einbettet: fremde Adressen verschwinden, der Service Worker cached
fremde Hosts nicht, und ein Applet je Aufgabe lädt auf 28 Schulgeräten spürbar.

## Interaktive Animationen

**27 Animationen**, jede in drei Niveaustufen, insgesamt **205 Verweise** aus den
Einheiten. Die Bilder zeigen fast alle einen **Ebenenwechsel**: oben der Vorgang,
unten dieselbe Sache in Teilchen. Genau zwischen diesen beiden Ebenen scheitert
das Verstehen in der Chemie, und ein Standbild kann immer nur eine davon zeigen.

Aufruf über `animationen.html?bereich=FC` … `?bereich=ES`.

**26 der 27 Animationen tragen eine Vorhersagefrage** über dem Bild („Eis schmilzt zu
Wasser. Was passiert mit den Teilchen selbst?"). Das Bild startet erst nach der
Antwort — wer nur zusieht, prüft nichts. Die Fragen stehen zentral in der
Tabelle `FRAGEN` in `animationen.js`.

Ein `IntersectionObserver` startet jede Animation beim Einscrollen und pausiert
sie beim Verlassen. `prefers-reduced-motion` gilt vorrangig: dann kein
Autostart, nur ein Standbild.

## Warm-up „Altes Wissen“ (`warmup.html`)

5 Aufgaben zu Beginn jeder Stunde aus einem eigenen Pool — nicht aus dem
aktuellen Thema. Kein Countdown auf dem Schülergerät.

| Code | Titel | Generatoren |
|---|---|---|
| `W-STOF` | Stoffe, Eigenschaften, Trennverfahren | 15 |
| `W-TEIL` | Atombau und Periodensystem | 15 |
| `W-SYMB` | Symbole und Formeln lesen | 15 |
| `W-GLEI` | Reaktionsgleichungen | 15 |
| `W-RECH` | Chemisches Rechnen | 15 |
| `W-EINH` | Einheiten und Größen | 15 |
| `W-LOES` | Lösungen, Konzentration, pH | 15 |
| `W-ORG` | Organische Chemie | 15 |

### Kumulativ: nur, was zurückliegt (seit v4)

Maßgeblich ist die **Unterrichtsreihe** der Einheit, zu der aufgewärmt wird.
Wiederholt wird das Grundwissen **aller** früheren Reihen — was noch nicht dran
war, kommt nicht dran. Vorher zog das Warm-up aus allen acht Kategorien; in der
zweiten Schulwoche der siebten Klasse standen deshalb Aufgaben zur organischen
Chemie auf dem Schirm. Das war kein Wiederholen, sondern Raten.

Die zwölf Reihen und das Grundwissen, das jede liefert, stehen in
`spiral/plan.json` unter `reihen` (erzeugt von
`werkzeuge/warmup_reihen_bauen.py`). Über jeder Aufgabe steht, aus welcher
Reihe sie stammt. In der ersten Reihe gibt es nichts Früheres — dort wird
innerhalb der eigenen Reihe wiederholt. Eine Zusatzregel sorgt dafür, dass
nicht immer nur die zuletzt behandelte Reihe gewinnt: Mindestens eine Aufgabe
kommt aus einer weiter zurückliegenden.

Ohne `?u=` — also beim freien Üben von der Startseite — richtet sich die
Auswahl nach dem zuletzt bearbeiteten Ort.

### Pflicht im Unterricht, Übung danach (seit v4)

Denselben Schalter wie der Rest der Anwendung: `chemie710_unterricht`.

| Modus | Warm-up |
|---|---|
| Übungsmodus | freiwillig, beliebig oft, ohne Folgen für die Note |
| Bewertungsmodus | verpflichtend **vor** der Einheit; das Ergebnis zählt |

Im Bewertungsmodus zeigt die Einheitenseite bis zum absolvierten Warm-up die
Aufforderung samt Knopf; die Startseite markiert die Kachel als Pflicht.
Gewertet wird **der erste Pflichtlauf eines Tages** — sonst entschiede die Zahl
der Versuche über die Note. Die Regel steht als eindeutiger Index in
`chemie710_warmup_ergebnisse`, nicht nur in der Anwendung. Gespeichert werden
Zählwerte, keine Antworten.

### Zwei Wege zur Note, je Kind einstellbar (seit v4)

Im Dashboard, Tafel „Warm-up und Bewertung", neben jedem Namen:

| Einstellung | Rechnung |
|---|---|
| **Einzelnoten** | Mittel aller gewerteten Läufe |
| **Lernfortschritt** | Stand der zweiten Hälfte des Zeitraums **plus** Verbesserung gegenüber der ersten, gedeckelt bei 100 % |

Wer schwach anfängt und stark endet, wird nach dem Ende bewertet; wer gleich
stark bleibt, verliert dadurch nichts. Gerechnet wird beides in
`chemie710_warmup_uebersicht()` und die Umsetzung in eine Note folgt der
Berliner Sekundarstufenskala — eine Notenskala gehört an eine Stelle und nicht
in jeden Client. Sie liefert eine **Grundlage für** eine Bewertung, keine
Zeugnisnote: Fünf Aufgaben an einem Tag messen einen Tag. Was vorher in der
Fachkonferenz zu beschließen ist, steht in `DATENSCHUTZ.md`, Abschnitt 5.

### Textplatzhalter — die eine Erweiterung der Engine

Der Generator-Parser rechnet mit Zahlen. Chemie braucht aber Aufgaben wie
„Welche Ordnungszahl hat Natrium (Na)?" — eine Zahlenaufgabe mit einem
Stoffnamen darin. Dafür kennt `ausdruck.js` jetzt eine Tabelle und den
Platzhalter `{name$}`:

```jsonc
{
  "id": "WTEIL-A-ordnungszahl",
  "level": "A",
  "skill": "Ordnungszahl ablesen",
  "tabelle": [
    { "name": "Wasserstoff", "symbol": "H", "z": 1 },
    { "name": "Natrium",     "symbol": "Na", "z": 11 }
  ],
  "template": "Welche Ordnungszahl hat {name$} ({symbol$})?",
  "answer": "z", "round": 0
}
```

Zahlenspalten werden zu Variablen, Textspalten zu Platzhaltern. **Ohne diese
Erweiterung stünde je Stoff ein eigener Generator in der Leitner-Kartei** — und
getrackt würde dann „kann Natrium" statt „kann die Ordnungszahl ablesen".
Getrackt wird die Generator-ID; also muss die Variation in den Generator hinein,
nicht in seinen Namen.

Alle 120 Generatoren werden vor jedem Push 300-mal durchgerechnet
(`werkzeuge/uebungsblatt-pruefen.js` und der Prüflauf in `pruefen.js`).

## Sicherheit im Aufgabenpool

Chemie unterscheidet sich vom Mathematikunterricht an einer Stelle grundsätzlich:
Ein Fehler kann hier mehr kosten als Punkte. Deshalb trägt `tasks.json` ein
eigenes Feld:

```jsonc
"sicherheit": [
  "Im Chemieraum wird nichts angefasst, gerochen oder geschmeckt, bevor die Lehrkraft es sagt.",
  "Schutzbrille auf, sobald erhitzt wird — auch beim Zusehen."
]
```

Die Hinweise stehen dort, wo der Versuch geplant wird, nicht in einem separaten
Dokument, das niemand aufschlägt. Zwölf Einheiten führen ein solches Feld.

In den Denkfehler-Kategorien steht `sicherheit` bewusst **an erster Stelle**:
Greift dieses Muster, soll es greifen, bevor eine allgemeinere Kategorie
zuschlägt.

## Das wichtigste Feld

`misconceptions`. Ohne dieses Feld sagt die App „noch nicht richtig" — das hilft
niemandem. Mit dem Feld sagt sie, **welcher Denkfehler** passiert ist, und das
Dashboard kann auszählen, welcher Fehler in der Klasse gehäuft auftritt.

Im Pool werden **124 verschiedene Fehlvorstellungs-IDs** verwendet, alle einer
der 13 Kategorien in `schema/fehlvorstellungen-kategorien.json` zugeordnet.
Die häufigsten:

| Häufigkeit | ID | Bedeutung |
|---:|---|---|
| 20× | `masse_verschwindet` | Gase nicht mitgewogen, Bilanzgrenze zu eng gezogen |
| 15× | `summenformel_falsch_gelesen` | Index, Klammer oder Koeffizient übersehen |
| 13× | `funktionelle_gruppe_verwechselt` | OH, COOH und CHO gegeneinander vertauscht |
| 12× | `nomenklatur_falsch` | Namensregel falsch angewendet |
| 11× | `teilchen_traegt_stoffeigenschaft` | dem einzelnen Teilchen eine Stoffeigenschaft zugeschrieben |
| 10× | `nachweis_verwechselt` | Nachweisreaktion dem falschen Stoff zugeordnet |
| 10× | `ion_und_atom_verwechselt` | Eigenschaften des Elements auf sein Ion übertragen |

Die beiden häufigsten sind keine Zufälle: `masse_verschwindet` und
`teilchen_traegt_stoffeigenschaft` sind die beiden konzeptionellen Hürden, an
denen der Chemieunterricht der Mittelstufe regelmäßig scheitert. Sie tauchen
deshalb bewusst quer durch alle vier Jahrgänge auf.

## Handschriftliche Übungsblätter

Der digitale Weg prüft Ergebnisse, nicht Rechenwege. Deshalb steht am Ende jeder
Einheit ein Blatt zum Ausdrucken: gleiches Thema, andere Zahlen.

**Je Lernweg ein eigenes Blatt** — `uebungsblatt-a.pdf`, `-b.pdf`, `-c.pdf`,
zusammen 228 PDFs. Die Einheitenseite verlinkt das Blatt zum gerade gewählten
Lernweg; beim Wechsel wird die Karte neu gebaut. Unterschieden wird über
`stufen` im Generator: A nimmt den unteren Teil des Zahlenbereichs und die
kürzere, glattere Stoffliste, C den oberen. Neue Werte kommen dabei nicht dazu —
gewählt wird nur aus dem, was schon im Generator steht.

```bash
node werkzeuge/uebungsblatt-pruefen.js   # 304 Generatoren × 300 Proben je Lernweg
node werkzeuge/uebungsblaetter.js        # erzeugt die 228 PDFs
node werkzeuge/uebungsblaetter.js sz-03  # nur eine Einheit (alle drei Stufen)
python werkzeuge/uebungsblaetter_bauen.py  # Generatoren neu erzeugen
```

Die Generatoren stehen in `uebungsblaetter/{fc,ps,ga,…}.json`. Erzeugt werden
sie von `werkzeuge/uebungsblaetter_bauen.py` aus **parametrisierten Mustern**:
Die Rechenlogik — molare Masse, Anteil, Verhältnis, Stoffmenge, Gasvolumen —
steht einmal, die fachliche Füllung je Einheit. Von Hand geschriebene Blätter
(derzeit FC-01 bis FC-04) bleiben bei einem erneuten Lauf erhalten.

**Die Lösung wird gerechnet, nicht geschrieben.** `assets/js/ausdruck.js` wertet
`answer` aus — dieselbe Datei, die im Browser das Warm-up prüft. Zwei
Implementierungen wären zwei Gelegenheiten, sich zu verrechnen, und ein
gedrucktes Blatt lässt sich nicht nachträglich korrigieren.

Unten auf jedem Blatt stehen alle richtigen Lösungen, gemischt mit ebenso vielen
falschen. Die falschen sind keine Zufallszahlen, sondern die hinterlegten
Fehlvorstellungen: Wer „das kommt hin" denkt, findet dort genau sein Ergebnis
wieder und muss noch einmal hinsehen.

## Prüfungstrainer (`pruefung.html`)

Kein eigener Aufgabenbestand — eine Sicht auf den vorhandenen Pool.

| Set | Pfad | Filter | Umfang | Ziel | Tipps |
|---|---|---|---|---|---|
| Sockel | A | Stufe ≥ 3 | 8 | 5 | ja |
| BBR / eBBR | B | Tag `bbr` | 10 | 7 | nein |
| MSA | C | Tag `msa` | 10 | 7 | nein |
| Gemischt | aktueller | Stufe ≥ 3 | 10 | 7 | nein |

**345 Aufgaben tragen den Tag `bbr`, 397 den Tag `msa`.** Wie im
Mathematikprojekt trägt keine A-Aufgabe den Tag `bbr`: Pfad A liegt auf
Niveaustufe D–E, ein BBR-Satz auf E–F. A-Aufgaben nachträglich zu taggen wäre
eine Lüge über ihr Niveau. Deshalb heißt das A-Set **Sockel** und zieht über die
Bearbeitungsstufe.

Die Formelkarte in `pruefung-sets.json` deckt alle vier Jahrgänge ab — von der
Dichte bis zur Veresterung.

## Lernvideos mit Zwischenfragen (seit v4 eingebettet)

**168 Videos** in allen 76 Einheiten, aus fünf freigegebenen Kanälen:
**musstewissen Chemie**, **Chemie – simpleclub**, **Biologie und Chemie
Schule**, **Chemistry@home** und **Studyflix**. Gezeigt wird die mit **Lumi**
angereicherte Fassung: derselbe Film, aber er hält an und stellt
Zwischenfragen.

**Sie laufen in der Seite.** Niemand verlässt die Anwendung mehr. Der Rahmen
wird trotzdem leer ausgeliefert und trägt nur einen Knopf — die Adresse wird
erst beim Klick gesetzt. Damit bleibt der gute Grund erhalten, aus dem die
Videos bis v3 bloße Links waren: Wer nicht zusehen will, löst auch keine
Anfrage bei einem Dritten aus. `frame-src` nennt `app.lumi.education`
ausdrücklich, auf allen zehn Seiten identisch.

**Je Lernweg genau ein empfohlenes Video.** Das Feld `stufe` ist der
*Mindest*lernweg (nicht wie das frühere `pfad` eine feste Bindung): `A`
erscheint überall, `C` nur auf dem Vertiefungsweg. Angezeigt wird das
speziellste Video, das zum gewählten Lernweg noch passt; die übrigen stehen
zugeklappt darunter. Sonst hätte ein Kind auf C drei Filme vor der ersten
Aufgabe.

```json
{ "titel": "Aggregatzustände: fest, flüssig, gasförmig",
  "url":   "https://www.youtube.com/watch?v=kEFx1X5F2fU",
  "quelle": "musstewissen Chemie",
  "lumi":  "https://app.lumi.education/run/COj8nc",
  "embed": "https://app.lumi.education/api/v1/run/COj8nc/embed",
  "stufe": "A", "dauer_s": 332 }
```

`dauer_s` ist die echte Laufzeit aus der letzten Zeitmarke des Transkripts und
die Grundlage des 45-Minuten-Plans. `url` wird nicht mehr aufgerufen — sie
bleibt als Herkunftsangabe stehen.

Ein Kanal ist an drei Stellen einzutragen, und zwar mit Absicht:

| Ort | wofür |
|---|---|
| `schema/tasks.schema.json` | erlaubte Werte für `quelle` |
| `VIDEOQUELLEN` in `engine.js` | was tatsächlich angezeigt wird |
| `videos-quellen.csv` | Herkunftsnachweis, alle 1032 Videos der Kanäle |

`pruefen.js` hält die drei gegeneinander und prüft zusätzlich, dass Lauf- und
Einbettadresse auf dieselbe Lumi-Kennung zeigen und dass jede Einheit ein
Video auf Lernweg A hat.

**Die Titel sind nicht die YouTube-Titel.** Ein Teil der Kanäle liefert
automatisch übersetzte Titel; eingetragen ist deshalb, was das Video zeigt.

**Inhalt und Niveau sind geprüft.** Alle Verweise wurden gegen die deutschen
Transkripte gehalten — auf inhaltliche Passung zur Einheit und auf die
Klassenstufe. `VIDEO_PRUEFBERICHT.md` nennt Verfahren, Befunde und die drei
entfernten sowie acht auf den Vertiefungsweg verschobenen Videos, einschließlich
des einen Falls, der offen geblieben ist.

## Externe Übungen (seit v4)

**197 Verweise, zwei bis vier je Einheit, von vier Plattformen.** Sie öffnen
in einem Rahmen **innerhalb** der Anwendung — der Rahmen entsteht erst auf
Klick, vorher gibt es keine Verbindung. „In neuem Tab öffnen“ bleibt daneben
stehen, falls doch etwas klemmt.

| Plattform | Verweise | wofür |
|---|---:|---|
| LearningApps | 152 | Grundstock, zwei je Einheit |
| Schlaukopf | 23 | Themenquiz je Klassenstufe |
| allgemeinbildung.ch | 11 | Auswahl-, Zuordnungs- und Rätselübungen |
| Serlo | 11 | „Aufgaben zu …“-Seiten mit Lösungsweg |

Aufgenommen wird nur, was drei Bedingungen erfüllt:

1. **Der Anbieter erlaubt das Einbetten.** Geprüft wird das nicht am
   Wohlwollen, sondern im Browser: Seite in einen Rahmen laden und nachsehen,
   ob Inhalt erscheint. `apps.zum.de` (`frame-ancestors`) und `leifichemie.de`
   (`X-Frame-Options`) verbieten es — von dort steht deshalb nichts im
   Projekt, auch nicht über `offenes-lernen.de`, das die ZUM-Übungen nur
   einbindet.
2. **Es ist eine Übung**, keine Erklärseite und kein Wiki-Artikel. Daran
   scheitern `msa-berlin.de`, `chemistryathome.de` und
   `stoteinfachchemie.at`.
3. **Die Adresse lässt sich einzeln nachprüfen.**

```jsonc
"uebungslinks": [
  { "titel": "Salzformeln", "url": "https://learningapps.org/view1930535",
    "typ": "app", "quelle": "LearningApps" },
  { "titel": "Salze und Verhältnisformeln", "url": "https://learningapps.org/view1471442",
    "typ": "sammlung", "quelle": "LearningApps", "pfade": ["B", "C"] }
]
```

`typ: "sammlung"` sind Mappen mit mehreren Apps darin. Sie stehen nur auf B
und C: Auf dem Basisweg müsste ein Kind sie erst sortieren. `pruefen.js`
stellt sicher, dass jede Einheit mindestens eine Übung hat, die auf dem
Basisweg sichtbar ist, und hält das Feld `quelle` gegen den Host der Adresse.

**Eingetragen wird der Titel, den die Seite selbst nennt.** Das ist keine
Förmlichkeit: LearningApps liefert für eine nicht vergebene Kennung eine Seite
mit Status 200, aber ohne Titel — der Statuscode allein taugt also nicht als
Nachweis, dass es die Übung gibt. `werkzeuge/uebungslinks_einspielen.py` ruft
deshalb bei jedem Lauf jede Kennung ab und verwirft, was keinen Titel trägt.

## Versuchsvideos und Lehrbuchbezug (seit v4)

Zwei Felder je Einheit, beide in `tasks.json`, beide vom Schema erzwungen.

**`experimente[]`** trägt die 52 geprüften Experimentiervideos. Zwei Formen:

| | Videos | Feld | Was das Kind tut |
| --- | --- | --- | --- |
| mit Lumi | 28 | `protokoll: true`, `lumi` | Das Video hält viermal an: Materialien, Aufbau, Durchführung, Beobachtung — jedes Mal ins Heft |
| ohne Lumi | 24 | `protokoll: false`, `beobachtung` | Das Video läuft durch; der Auftrag steht **darüber** und wird vorher gelesen |

Die Anordnung ist der Punkt: Wer erst nach dem Abspann erfährt, worauf zu
achten war, hat es nicht gesehen. `experimentkarteBauen()` in `engine.js`
setzt den Auftrag deshalb vor den Rahmen, nicht dahinter.

`beobachtung` ist dreifach formuliert (`A`, `B`, `C`) nach den Operatoren des
Lehrbuchs: beschreiben — erklären — begründen und beurteilen.

**`lehrbuch`** nennt Kapitel, Titel und Seitenbereich; `lehrbuchAuftrag()`
baut daraus den Arbeitsauftrag der Stufe. Die Seitenzahlen sind die der
**PDF-Fassung** — die gedruckte Paginierung steht nicht verlässlich in der
OCR-Ebene, und geraten wäre schlechter als ausgewiesen.

### Kopiervorlagen aus dem Eduki-Bestand

Zu 52 Einheiten gibt es passendes gekauftes Material. Es liegt bewusst
**nicht** im Repository: Eduki-Lizenzen decken die eigene Lerngruppe, nicht
die Veröffentlichung — und dieses Projekt geht auf GitHub Pages. Das
Dashboard zeigt unter „Kopiervorlagen zur Einheit", was passt, für welche
Stufe und wo es liegt; gedruckt wird aus `Eduki/Chemie/Schüler/`.

Die Liste erzeugt `Eduki/zuordnung_projekt.py` neu
(→ `dashboard/eduki-material.json` und `Eduki/zuordnung_projekt.csv`). Neue
Downloads erst mit `Eduki/eduki_sortieren.py` einsortieren, dann die
Zuordnungstabelle im Skript ergänzen — es bricht ab, wenn ein Eintrag auf
keinen oder mehrere Ordner passt.

## Zeitplan und Hefteintrag (seit v4)

**Eine Einheit dauert ohne das Warm-up 45 Minuten.** Das steht nicht nur als
Absicht in der Dokumentation, sondern als `zeitplan` in jeder `tasks.json` —
je Lernweg eigene Werte, Summe genau 45. Die Leiste über der Bühne zeigt sie
als Balken, dessen Breite den Minuten entspricht. `pruefen.js` rechnet jede
Summe nach.

**Am Ende jeder Reihe liegt ein Skript auf Papier.** Das Feld `mitschrift`
diktiert den Hefteintrag Punkt für Punkt: Überschrift, Merksatz, Fachwörter,
Beispiel — auf B zusätzlich Erklärung in eigenen Worten und Regeln, auf C
zusätzlich Formeln, voller Wortspeicher und eine eigene Begründung. Der Aufbau
ist auf allen Lernwegen gleich, der Umfang nicht; so passen die Hefte am Ende
trotzdem zusammen. Abgehakt wird lokal — bewertet wird das Heft, nicht der
Haken. Am Ende der Einheit steht der Skript-Check.

Beides erzeugt `werkzeuge/mitschrift_zeitplan_bauen.py` aus den übrigen
Feldern derselben Datei. Es wird nichts erfunden, nur ausgewählt und geordnet.

**In den Daten stehen nur Verweise, kein Text.** Ein Punkt sieht so aus:
`{"art": "fachwoerter", "anzahl": 4}` — `engine.js` setzt daraus beim
Anzeigen die ersten vier Einträge des Wortspeichers samt Worterklärungen
zusammen und zählt gleich den Umfang im Heft aus. Denselben Satz zweimal zu
speichern hätte das Offlinepaket um eine halbe Megabyte wachsen lassen, und
die zweite Fassung wäre ab der ersten Änderung an der Lernkarte falsch
gewesen, ohne dass es jemand merkt. Aus demselben Grund enthält der
`zeitplan` nur Minuten: Die Phasennamen sind für alle 76 Einheiten dieselben
und stehen in `ZEITPLAN_PHASEN`.

## Taschenrechner

Vollbildrechner in Einheit, Warm-up und Prüfung — Taste `R`, `Alt+R` oder `F2`,
`Esc` schließt. Bei geöffnetem Rechner bleibt nur die zuletzt gewählte Aufgabe
samt Eingabefeld stehen; gescrollt wird nicht, die Aufgabe wird notfalls
verkleinert. Das Ergebnis lässt sich in das aktive Antwortfeld übernehmen.

Gerechnet wird mit einem eigenen Parser, nicht mit `eval` — die
Inhaltssicherheitsregel der Seiten verbietet `unsafe-eval`. Für die Chemie
reicht der vorhandene Tastensatz: `6,022 · 10^23` ist eingebbar, für `n = m : M`
genügen Punkt-vor-Strich und Klammern.

## Beameransicht (`dashboard/beamer.html`)

Alle Lernenden als Strichmännchen auf einer Geraden — wahlweise entlang der
ganzen Unterrichtsreihe oder der aktuellen Einheit. Grün heißt: der letzte Ping
ist da. Rot: er fehlt. Rot blinkend: einer der beiden Grenzwerte ist
überschritten.

Die Ansicht holt ihre Daten **nicht selbst**, sondern bekommt sie per
`BroadcastChannel` aus dem Lehrerdashboard. Zwei Gründe: Das Sitzungstoken der
Lehrkraft bleibt in genau einem Fenster — und das eine hängt oft an einem Beamer
in einem Raum, den man kurz verlässt. Und beide Ansichten zeigen garantiert
denselben Stand; zwei unabhängige Abrufe im Fünfsekundentakt tun das nicht.

Damit sich die Männchen bewegen, meldet `tracker.js` den Fortschritt bei jedem
Aufgabenwechsel, bei jedem Fehlversuch und zusätzlich alle 20 Sekunden. Der Takt
läuft nur bei sichtbarer Seite: Ein Strichmännchen, das für ein weggelegtes
Gerät weiterläuft, wäre eine Falschaussage.

## Aufgabentypen

Der Pool nutzt alle vier Typen der Engine:

| Typ | Anzahl | wofür |
|---|---:|---|
| `choice` | 728 | Begründungen, Einordnungen, Bewertungen |
| `numeric` | 190 | Rechnungen mit Einheit |
| `multi` | 97 | mehrschrittige Rechnungen und Tabellen |
| `assign` | 49 | Zuordnungen (Symbol ↔ Nachweis ↔ Eigenschaft) |

Der hohe Anteil an `choice` ist fachlich begründet: Der Rahmenlehrplan verlangt
in den Kompetenzbereichen Kommunizieren und Bewerten ausdrücklich Begründungen
und Urteile. Diese lassen sich digital nur über wohlgesetzte Alternativen
prüfen — mit dem Unterschied, dass jede falsche Option eine benannte
Fehlvorstellung trägt und deshalb rückmeldbar ist.

## Starten

> **Zum ersten Mal einrichten?** `ANLEITUNG-GitHub-und-Supabase.pdf` im
> Projektordner führt Schritt für Schritt durch beides — Veröffentlichen mit
> GitHub Desktop (ohne Kommandozeile) und die Supabase-Einbindung, mit
> Prüfliste und einer Tabelle der häufigsten Fehlermeldungen.

**Auf GitHub Pages:** Repo pushen, unter *Settings → Pages* die Quelle auf
`master / (root)` stellen. Vorher `devMode: false` setzen — auf `master`
bricht die Prüfung sonst ab.

**Lokal:** Doppelklick funktioniert nicht — der Browser blockiert dann das Laden
der JSON-Dateien. Stattdessen im Projektordner:

```bash
python -m http.server 8000
```

## Aufbau

```
Für Schülerinnen und Schüler
  index.html                Übersicht (erzeugt aus units/index.json)
  einheit.html              Einheitenseite            → ?u=sz-03
  warmup.html               Warm-up „Altes Wissen"    → ?u=sz-03 (optional)
  pruefung.html             Prüfungstrainer           → ?set=bbr
  animationen.html          Animationsgalerie         → ?bereich=SL
  uebungen.html             externe Übungen

Für die Lehrkraft
  arbeitsblatt.html         Arbeitsblatt mit Lösungsanhang
  matrix.html               Kompetenzmatrix pro Kind
  dashboard/index.html      Freigaben, Lernzeit, Diagnose
  dashboard/beamer.html     Beameransicht für die Leinwand

Code
  assets/css/app.css        ein Stylesheet, inkl. Druckansicht
  assets/css/rechner.css    Vollbild-Taschenrechner
  assets/js/store.js        Speicher, Zahlenparser, Fehlerprofil, SW-Registrierung
  assets/js/dev-boot.js     Entwicklereinstellungen; lädt dev-tools.js nur bei devMode
  assets/js/taschenrechner.js  Taschenrechner mit eigenem Parser (kein eval)
  assets/js/zeichnen.js     Aufgabenbilder (11 Typen)
  assets/js/animationen.js  Animationsrahmen: Schleife, Steuerung, Registry
  assets/js/animationen-7.js  8 Animationen Klasse 7   (bei Bedarf geladen)
  assets/js/animationen-8.js  9 Animationen Klasse 8   (bei Bedarf geladen)
  assets/js/animationen-9.js 10 Animationen Klasse 9/10 (bei Bedarf geladen)
  assets/js/ausdruck.js     Generatoren auswerten (Browser UND Node)
  assets/js/engine.js       Aufgabenlogik der Einheiten
  assets/js/spiral.js       Warm-up: Generatoren, Leitner-Kartei, Auswahl
  sw.js                     Service Worker (Offline)

Inhalt
  units/index.json          Liste aller Bereiche und Einheiten
  units/sz/sz-03/tasks.json Inhalt einer Einheit
  spiral/plan.json          Intervalle, Verzahnung, Fehlerprofil
  spiral/w-teil.json        Generatoren einer Wiederholungskategorie
  uebungsblaetter/sz.json   Generatoren der gedruckten Blätter (mit stufen A/C)
  pruefung-sets.json        Prüfungssets + Formelkarte
  videos-quellen.csv        alle 1032 Videos der fünf freigegebenen Kanäle

Erzeuger (Python, kein Build-Step für die Anwendung)
  werkzeuge/einheiten_basis.py       Konstruktoren für tasks.json
  werkzeuge/einheiten_<bereich>*.py  der Fachinhalt, ein Bereich je Datei
  werkzeuge/spiral_bauen.py          die 120 Warm-up-Generatoren
  werkzeuge/uebungsblaetter_bauen.py die 304 Blatt-Generatoren
  werkzeuge/index_bauen.py           index.html aus units/index.json
```

`store.js` muss vor `engine.js` und `spiral.js` geladen werden — dort stehen
der Speicher, der Zahlenparser und das Fehlerprofil, die sich beide teilen.

### Warum die Inhalte aus Python-Dateien erzeugt werden

Die Anwendung liest ausschließlich JSON und braucht keinen Build-Step. Die
`tasks.json` von Hand zu pflegen wäre trotzdem ein Fehler: Ein Nachweis, ein
Trennverfahren, eine molare Masse taucht in mehreren Einheiten auf und soll dort
dasselbe heißen. Gemeinsame Tabellen an einer Stelle verhindern, dass in FC-01
„ätzend" und in FC-06 „korrosiv" steht.

Wer eine einzelne Aufgabe ändern will, kann die `tasks.json` direkt bearbeiten —
solange der zugehörige Erzeuger nicht erneut läuft. Für dauerhafte Änderungen
gehört die Änderung in die Python-Datei.

## Neue Einheit anlegen

1. Ordner `units/sz/sz-06/` anlegen
2. `tasks.json` hineinlegen (oder einen Erzeuger in `werkzeuge/` ergänzen)
3. In `units/index.json` eintragen
4. `python werkzeuge/index_bauen.py` — die Startseite wird neu erzeugt
5. In `sw.js` bei `EINHEITEN` ergänzen und `VERSION` hochzählen

Schritt 3 genügt, damit Prüfungstrainer, Arbeitsblatt und Kompetenzmatrix die
Einheit kennen — die drei lesen alle denselben Index. `einheit.html` und
`engine.js` bleiben unangetastet.

## Prüfen vor dem Push

```bash
node werkzeuge/pruefen.js         # Schema, IDs, Animationen, Cache, CSP, Bilder, Syntax, SQL, Videos
node werkzeuge/animationen-laden.js  # lädt die Animationsdateien wirklich aus
node werkzeuge/a11y-pruefen.js    # statisch prüfbare Barrierefreiheit
node werkzeuge/budget-pruefen.js  # Performancebudget für günstige Smartphones
node werkzeuge/uebungsblatt-pruefen.js             # 304 Generatoren × 300 Proben je Lernweg
node werkzeuge/aufbau-pruefen.js                   # sechs didaktische Phasen je Einheit
node werkzeuge/fehlvorstellungen-sichten.js --offen  # Denkfehler ohne Kategorie
node werkzeuge/nachfass-luecken.js FC              # Arbeitsliste Nachfassaufgaben
```

Der Prüfer liest den Sollumfang aus `units/index.json`, nicht aus einer
festen Zahl im Code. Im Mathematikprojekt standen an zwei Stellen 54 — beim
Übertragen fiel auf, dass eine Zahl, die an zwei Orten steht, an einem davon
irgendwann falsch ist.

## Was noch fehlt

Ehrlich benannt, damit es nicht übersehen wird:

- **Die Lernvideos sind gegen die Transkripte geprüft, nicht angesehen.** Seit
  v4 wurde jeder Verweis auf inhaltliche Passung und Klassenstufe geprüft —
  Verfahren und Befunde stehen in `VIDEO_PRUEFBERICHT.md`. Ein Transkript sagt
  aber nichts über Bild, Tempo und Ton, und über die Qualität der
  Lumi-Zwischenfragen sagt es gar nichts. Vor dem Einsatz in einer Stunde
  einmal selbst durchklicken. Ein Befund ist ausdrücklich offen geblieben: Der
  Erdölfilm in KW-06 handelt von der Gewinnung, nicht von der Verbrennung.
- **Der Bewertungsmodus des Warm-ups ist eine pädagogische Entscheidung, keine
  technische.** Solange die Fachkonferenz nicht beschlossen hat, dass und wie
  die Warm-up-Ergebnisse in die Note eingehen, gehört er ausgeschaltet — die
  Läufe werden dann als Übung geführt und zählen nicht. Siehe `DATENSCHUTZ.md`,
  Abschnitt 5.
- **Die Auftragsverarbeitung für Lumi ist ungeklärt.** Der Rahmen lädt zwar
  erst auf Klick, aber im Unterricht ist dieser Klick nicht wirklich
  freiwillig.
- **Die 45 Minuten sind gerechnet, nicht gestoppt.** Videolaufzeit plus
  Zuschlag plus Erfahrungswerte; ob eine Klasse tatsächlich in dieser Zeit
  durchkommt, entscheidet die erste Stunde.
- **Die externen Übungen sind nicht einzeln durchgespielt.** Seit v4 sind 197
  Verweise eingetragen (siehe unten); jede Adresse wurde beim Eintragen gegen
  die Plattform geprüft und trägt den Titel, den die Seite selbst nennt.
  Wie gut die Aufgabe darin ist, sagt das nicht. Vor dem Einsatz einmal
  öffnen — die Karte sagt das den Lernenden auch.
- **Die Übungsblätter unterscheiden sich in den Werten, nicht im Umfang.** Alle
  drei Lernwege tragen vier Aufgaben. Das Feld `pfade` im Generator ist
  vorhanden und wirkt — wer zusätzliche Vertiefungsaufgaben schreibt, trägt sie
  ohne Codeänderung nach (siehe `CHANGELOG.md`, v3).
- **Supabase ungeprüft.** `supabase/setup.sql` wurde übernommen und umbenannt,
  aber in keinem Testprojekt ausgeführt. Vor produktiver Nutzung nachholen —
  siehe `MIGRATION.md`.
- **Nicht im Unterricht erprobt.** Die fachliche Richtigkeit wurde beim
  Schreiben geprüft, die Passung zu einer konkreten Lerngruppe nicht. Das
  entscheidet die erste Stunde, nicht das Repository.

Alle Fassungen mit Änderungen und Einschränkungen stehen in `CHANGELOG.md`.

Cache-Version: `chemie710-v4-lumi-warmup-skript`.

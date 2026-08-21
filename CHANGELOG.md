# Änderungen

## v6 — Schriftliches Kernwissen und zuverlässige Videos

Jede der 76 Einheiten zeigt nun dauerhaft einen Abschnitt „Kurz erklärt“.
Er enthält je Lernweg eine eigene Einleitung, die wichtigsten Aussagen, einen
Merksatz und das Lernziel. Die 228 Arbeitsblatt-PDFs übernehmen denselben
niveaugerechten Fachtext vor die Aufgaben; chemische Indizes und Reaktionspfeile
werden im eingeschränkten PDF-Zeichensatz lesbar umgeschrieben.

Die Lumi-H5P-Einbettung lieferte bei YouTube-Inhalten trotz erreichbarer
H5P-Seite eine schwarze Videofläche. Ursache ist ein JavaScript-Fehler in der
extern ausgelieferten H5P-YouTube-Bibliothek. Zusätzlich sperren einzelne
Anbieter die Wiedergabe ihrer Videos in fremden Seiten. Der geprüfte
YouTube-Direktlink ist deshalb jetzt die Hauptaktion; YouTube-nocookie und die
interaktive Lumi-Fassung bleiben als optionale Alternativen erhalten.

## v5 — Lehrbuchgerechte Chemiefragen und neue Warm-ups

Die Lernwege greifen jetzt auf den gelieferten Chemie-Fragenkatalog zurück:
98 redaktionell geprüfte Aufgaben sind 59 fachlich passenden Einheiten
zugeordnet. Eine Katalogfrage erscheint innerhalb einer Einheit nur in einem
Lernweg; wo keine passende Frage vorliegt, bleibt die stärkere Originalaufgabe
erhalten. Herkunft, Katalog-ID und konkrete PDF-Seiten bleiben nachvollziehbar.

Das Warm-up besteht nun aus 224 eindeutigen Fragen in neun Chemiebereichen.
Jede Frage gehört genau einem Niveau und besitzt eine Einführungs-Einheit;
dadurch erscheinen Ester, Titration oder Metallbindung erst, nachdem sie im
Lehrgang erarbeitet wurden. Auswahlfragen funktionieren mit Tastatur, Touch
und Screenreader.

Die reproduzierbare Zuordnung liegt unter `fragenkatalog/zuordnung.json`;
`werkzeuge/fragenkatalog-pruefen.js` kontrolliert Quellen, Lernwege,
Antworten, Warm-up-Mindestumfang und das Fehlen der alten Mathe-Pools.

## v4 — Ruhigere Lernoberfläche

Die Einheitsseite führt jetzt sichtbar durch die drei Phasen Verstehen,
Üben und Sichern. Größere Schrift, klarere Karten, großzügigere Touchziele
und eine begrenzte Lesebreite erleichtern die Orientierung. Der umfangreiche
Hefteintrag ist zunächst geschlossen und wird erst in der Sicherungsphase
gebraucht. Die responsive Arbeitsfläche nutzt am Desktop eine feste
Orientierungsspalte, am Tablet eine kompakte Doppelübersicht und auf dem
Smartphone eine reduzierte Fokusansicht. Kontostatus, Formelschublade,
Rechner und Seitennavigation sind getrennt angeordnet und überdecken den
Lerninhalt nicht mehr.

## v4 — Lernvideos mit Lumi, externe Übungen, 45-Minuten-Einheit, Hefteintrag und ein Warm-up, das zählt

Fünf Dinge, die zusammengehören: Die Videos verlassen die Anwendung nicht
mehr und fragen zwischendurch nach. Die Karte „Üben & Wiederholen" ist
nicht mehr leer. Eine Einheit hat einen Zeitplan, der aufgeht. Was gelernt
wird, landet von Hand im Heft. Und das Warm-up wiederholt endlich das, was
tatsächlich zurückliegt — im Unterricht verpflichtend und als
Bewertungsgrundlage.

### Erklärvideos: eingebettet statt verlinkt

Bis v3 war jedes Video ein Link auf YouTube. Das hatte einen guten Grund
(ein eingebettetes Fenster lädt bei allen, auch bei denen, die gar nicht
zusehen wollen) und einen Preis: Das Kind war aus der Anwendung heraus,
der Film lief ohne jede Rückfrage durch, und was hängen blieb, wusste
niemand.

Jetzt läuft die mit Lumi angereicherte Fassung desselben Films **in der
Seite**. Sie hält an und stellt Zwischenfragen. Der gute Grund bleibt
gewahrt: Der Rahmen wird leer ausgeliefert und trägt nur einen Knopf; die
Adresse wird erst beim Klick gesetzt. Der Klick bleibt damit die
Entscheidung des Kindes, genau wie der Link es war — nur führt er nicht
mehr weg. `frame-src` nennt `app.lumi.education` jetzt ausdrücklich, auf
allen zehn Seiten identisch.

**Neue Felder je Video:** `lumi` (Ausweichweg im eigenen Fenster),
`embed` (die einzige Adresse, die in den Rahmen geht), `dauer_s`
(Laufzeit aus der letzten Zeitmarke des Transkripts) und `stufe`.

**`pfad` ist durch `stufe` ersetzt.** `pfad` sperrte ein Video auf genau
einen Lernweg ein; `stufe` ist der Mindestlernweg. Angezeigt wird je
Lernweg **genau ein empfohlenes Video** — das speziellste, das noch
passt; die übrigen stehen zugeklappt darunter. Ohne diese Trennung hätte
ein Kind auf dem Vertiefungsweg drei Filme vor der ersten Aufgabe und die
45 Minuten wären weg, bevor gerechnet wird.

**Alle 171 Verweise wurden gegen die deutschen Transkripte geprüft.** Das
Ergebnis steht vollständig in `VIDEO_PRUEFBERICHT.md`, hier die
Kurzfassung: drei Videos entfernt (zwei ohne angereicherte Fassung, eines
— die säurekatalysierte Hydratisierung in AL-06 — inhaltlich
Sekundarstufe II und am Thema der Einheit vorbei), acht auf den
Vertiefungsweg verschoben, weil sie über der Klassenstufe liegen (unter
anderem das Massenspektrometer in PS-06, die Autoprotolyse in SL-04 und
die sp²-Hybridisierung in KW-07). Ein Befund bleibt offen und steht als
solcher im Bericht: Der Erdölfilm in KW-06 handelt von der Gewinnung,
nicht von der Verbrennung; er trägt den Einstieg und steht auf dem
Basisweg, aber die Einheit hätte ein besseres verdient.

Bestand danach: **168 Videos**, Verteilung nach Mindestlernweg
A 76 · B 61 · C 31. Jede Einheit hat mindestens ein Video auf dem
Basisweg — `werkzeuge/pruefen.js` bricht ab, wenn das einmal nicht mehr
stimmt.

### Externe Übungen: 152 Verweise statt einer leeren Karte

Die Karte „Üben & Wiederholen" war seit v1 gebaut, die Freigabeliste der
Plattformen stand in `engine.js`, das Feld `uebungslinks` im Schema — und
es war **kein einziger Verweis eingetragen**. Jetzt sind es 152, zwei je
Einheit, alle von LearningApps.org.

Warum nur diese eine der sieben freigegebenen Plattformen: Die Übungen
öffnen in einem Rahmen innerhalb der Anwendung, und das funktioniert nur,
wenn der Anbieter das Einbetten erlaubt. LearningApps ist dafür gebaut,
liefert Aufgaben statt Erklärseiten und hat stabile Adressen, die sich
einzeln nachprüfen lassen.

**Jede Kennung wurde beim Eintragen abgerufen**, und eingetragen ist der
Titel, den die Seite selbst nennt — nicht der aus der Trefferliste. Das
ist nötig, weil LearningApps für eine nicht vergebene Kennung eine Seite
mit Status 200, aber ohne Titel liefert: Der Statuscode allein beweist
nichts. Von 152 Kennungen wurde keine verworfen.

**Nachgelegt: drei weitere Plattformen, 45 Verweise.** Vorgeschlagen
waren neun Seiten; die Bedingung „läuft in der Anwendung, nicht in einem
neuen Tab" entscheidet aber der Server der Gegenseite, nicht der
Geschmack. Geprüft wurde jede im echten Browser — Seite in einen Rahmen
laden und nachsehen, ob Inhalt erscheint:

| Seite | Ergebnis |
| --- | --- |
| allgemeinbildung.ch, schlaukopf.de, de.serlo.org | läuft — aufgenommen |
| apps.zum.de (und damit alle H5P-Übungen von offenes-lernen.de, das sie nur einbindet) | `frame-ancestors 'self' *.zum.de …` — der Browser zeigt sie hier nicht an |
| leifichemie.de | `X-Frame-Options: SAMEORIGIN` — dasselbe |
| msa-berlin.de | Erklärtexte; verweist für Übungen selbst auf testedich.de und GoConqr |
| chemistryathome.de | Erklärung, Video, Übungs-PDF — nichts zum Lösen auf der Seite |
| stoteinfachchemie.at | beschreibt einen Generator, der auf der Seite nicht liegt |

Die beiden ersten sind bitter, weil das Material dort gut ist. Ein
Verweis, der ein leeres Fenster öffnet, ist aber schlechter als keiner.

Bestand jetzt: **197 Verweise** — LearningApps 152, Schlaukopf 23,
allgemeinbildung.ch 11, Serlo 11; zwei bis vier je Einheit. Die
Freigabe einer Plattform steht an fünf Stellen und musste überall
nachgezogen werden: `frame-src` auf allen zehn Seiten, `UEBUNGSQUELLEN`
in `engine.js`, `ERLAUBTE_HOSTS` in `uebungsrahmen.js`, die Prüfliste in
`pruefen.js` und das Enum im Schema.

**Ein Befund für die Datenschutzseite:** Schlaukopf legt beim ersten
Aufruf ohne Rückfrage ein pseudonymes Gastkonto an und speichert die
Kennung (`elearning_userId`) zwei Jahre im Browser. LearningApps misst
mit Matomo. allgemeinbildung.ch setzt **gar nichts**. Das steht jetzt als
Tabelle in `DATENSCHUTZ.md` — wer die Schlaukopf-Verweise nicht will,
nimmt sie heraus; jede Einheit behält dann mindestens zwei Übungen.

Neun Verweise sind Sammlungen mehrerer Apps; sie stehen nur auf den
Lernwegen B und C, weil ein Kind sie auf dem Basisweg erst sortieren
müsste. `pruefen.js` prüft neu: freigegebene Plattform, keine Dublette
innerhalb einer Einheit, Feld `quelle` passend zum Host der Adresse, und
je Einheit mindestens eine Übung, die auf dem Basisweg sichtbar ist.

Das Offlinebudget ist dabei von 2200 auf 2300 KB angehoben worden —
mit Begründung in `werkzeuge/budget.json` und dem Hinweis, dass bei der
nächsten Erweiterung nicht die Grenze zu erhöhen ist, sondern die
Aufgabendaten je Bereich nachgeladen statt vorinstalliert werden sollten.

### Die Einheit dauert 45 Minuten — und das steht jetzt dran

Neu in jeder `tasks.json`: `zeitplan`, je Lernweg eigene Werte, Summe
genau 45 Minuten ohne das Warm-up davor. Die Videominute ist die echte
Laufzeit plus Zuschlag für die Zwischenfragen; die Aufgabenzeit ist der
Rest. Auf dem Vertiefungsweg ist mehr zu schreiben und weniger Zeit zum
Rechnen, auf dem Basisweg umgekehrt.

Die Leiste über der Bühne zeigt das als Balken, dessen Breite den Minuten
entspricht. `werkzeuge/pruefen.js` rechnet jede Summe nach — ein Plan,
dessen Summe nicht stimmt, ist schlimmer als keiner: Er sieht aus wie
eine Zusage.

### Hefteintrag: am Ende der Reihe liegt ein Skript auf Papier

Neu in jeder `tasks.json`: `mitschrift`, je Lernweg gekürzt, im Aufbau
aber gleich — Überschrift, Merksatz, Fachwörter, Beispiel; auf B
zusätzlich die Erklärung in eigenen Worten und die Regeln, auf C
zusätzlich alle Formeln, der volle Wortspeicher und eine eigene
Begründung. Erzeugt aus den übrigen Feldern derselben Datei; erfunden
wird nichts, nur ausgewählt und in die Reihenfolge des Hefteintrags
gebracht.

Die Karte „Ins Heft" diktiert den Eintrag Punkt für Punkt, mit
Zeilenangabe je Punkt. Abgehakt wird lokal — was zählt, ist das Heft. Am
Ende der Einheit steht der Skript-Check: wie viele Punkte noch fehlen.
Das Video trägt denselben Hinweis: *Stift bereitlegen. Halte das Video
an, wenn du schreibst.*

`werkzeuge/pruefen.js` prüft, dass jeder Lernweg einen Eintrag hat (sonst
hätte ein Kind am Ende der Reihe eine Lücke im Skript, die niemand
bemerkt), dass kein Verweis ins Leere zeigt und dass der Umfang zum
höheren Lernweg hin wächst.

**In den Daten stehen nur Verweise.** Der erste Entwurf schrieb den
Hefteintrag als Text aus — und ließ das Offlinepaket von 1990 auf
2531 KB wachsen, weit über die Grenze von 2200. Ein Punkt ist deshalb
`{"art": "fachwoerter", "anzahl": 4}`; den Text setzt `engine.js` beim
Anzeigen aus den übrigen Feldern derselben Datei zusammen und zählt
gleich den Umfang im Heft aus. Das ist nicht nur kleiner, sondern auch
richtiger: Eine ausgeschriebene zweite Fassung wäre ab der ersten
Änderung an der Lernkarte falsch gewesen, ohne dass es jemand merkt. Aus
demselben Grund enthält der Zeitplan nur Minuten und keine Phasennamen —
die sind für alle 76 Einheiten dieselben und stehen in
`ZEITPLAN_PHASEN`. Offlinepaket danach: **2183 KB**, wieder unter der
alten Grenze; mit den 152 Übungsverweisen dann 2211 KB, wofür die Grenze
bewusst auf 2300 angehoben wurde (siehe oben).

### Warm-up: kumulativ, im Unterricht Pflicht, als Note verwendbar

**Es lud vorher gar nicht.** `spiral.js` las `d.generators` und
`d.category`, die Dateien in `spiral/` heißen aber `generatoren` und
`kategorie`. Jeder Start lief in die Ausnahmebehandlung und zeigte „Das
Warm-up konnte nicht geladen werden." Ebenfalls repariert: `.map(baue)`
übergab den Schleifenindex als Lernwegstufe, wodurch die
stufenspezifischen Varianten der Generatoren nie griffen.

**Kumulativ.** Wiederholt wird das Grundwissen **aller** zurückliegenden
Reihen. Maßgeblich ist die Unterrichtsreihe der Einheit, zu der
aufgewärmt wird; was noch nicht dran war, kommt nicht dran. Vorher zog
das Warm-up aus allen acht Kategorien — in der zweiten Schulwoche der
siebten Klasse standen deshalb Aufgaben zur organischen Chemie auf dem
Schirm. Das war kein Wiederholen, sondern Raten. Die Reihenfolge der
zwölf Reihen und das Grundwissen, das jede liefert, stehen in
`spiral/plan.json`; über der Aufgabe steht jetzt, aus welcher Reihe sie
stammt. Eine Regel sorgt dafür, dass nicht immer nur die zuletzt
behandelte Reihe gewinnt: Mindestens eine Aufgabe kommt aus einer weiter
zurückliegenden — genau das Ältere verblasst zuerst.

**Pflicht im Unterricht, Übung danach.** Im Bewertungsmodus steht das
Warm-up vor der Einheit; die Einheitenseite zeigt bis dahin die
Aufforderung samt Knopf. Außerhalb der Unterrichtszeit hält niemanden
etwas auf. Neu: `chemie710_warmup_ergebnisse` mit
`chemie710_warmup_melden()`. Gewertet wird **der erste Pflichtlauf eines
Tages** — sonst entschiede die Zahl der Versuche über die Note; die Regel
steht als eindeutiger Index in der Datenbank, nicht nur in der Anwendung.
Gespeichert werden Zählwerte, keine Antworten.

**Zwei Wege zur Note, je Kind einstellbar.** Neu:
`chemie710_students.bewertungsart` (`note` oder `fortschritt`) und
`chemie710_bewertungsart_setzen()`. Im Dashboard steht das als
Auswahlfeld in der neuen Tafel „Warm-up und Bewertung" neben jedem Namen.
*Einzelnoten* mittelt alle gewerteten Läufe. *Lernfortschritt* bewertet
die zweite Hälfte des Zeitraums und rechnet die Verbesserung gegenüber
der ersten hinzu — wer schwach anfängt und stark endet, wird nach dem
Ende bewertet; wer gleich stark bleibt, verliert dadurch nichts.
Gerechnet wird beides in `chemie710_warmup_uebersicht()`: Eine Notenskala
gehört an eine Stelle und nicht in jeden Client. Die Tafel zeigt
zusätzlich die Entwicklung als Zahlenpaar („48 % → 71 %") und die
Wissenskategorien, in denen es wackelt.

`chemie710_lernmodus()` liefert dafür drei neue Felder (`warmup_pflicht`,
`warmup_heute`, `bewertungsart`) und musste dafür neu angelegt werden —
`create or replace` kann den Rückgabetyp nicht ändern. `setup.sql`
erledigt das selbst.

### Versuchsvideos: 52 Experimente, der Auftrag steht darüber

Die 52 geprüften Experimentiervideos sind eingebunden — 28 in der
Lumi-Fassung mit Haltepunkten, die 24 übrigen über
`www.youtube-nocookie.com`. Beide stehen in `experimente[]` der Einheit.

Für die 28 mit Lumi trägt das Video selbst durch das Protokoll: Es hält an
den vier Stellen an, an denen Materialien, Aufbau, Durchführung und
Beobachtung ins Heft gehören (`protokoll: true`).

Die 24 ohne Lumi halten nicht an. Sie bekommen deshalb einen
Beobachtungsauftrag, und der steht **über** dem Rahmen, nicht darunter. Wer
erst nach dem Abspann erfährt, worauf zu achten war, hat es nicht gesehen —
das ist der ganze Grund für die Anordnung. Der Auftrag ist dreifach
formuliert, nach den Operatoren des Lehrbuchs: beschreiben (A), erklären
(B), begründen und beurteilen (C). Formuliert ist er am Vorgang und nicht
am Film, er lässt sich also am Demonstrationsversuch genauso stellen.

Das Schema erzwingt beides: `protokoll: false` verlangt `beobachtung`,
`protokoll: true` verlangt `lumi`. Ein Video ohne Haltepunkte und ohne
Auftrag kommt damit nicht durch die Prüfung.

### Lehrbuchbezug in allen 76 Einheiten

Jede Einheit nennt jetzt Kapitel, Titel und Seitenbereich im
Unterrichtslehrbuch und stellt daraus einen Arbeitsauftrag — je nach
Lernweg einen Merksatz abschreiben, eine Zusammenfassung anlegen oder einen
Auftrag des Buches ausführen. Die Karte „Im Lehrbuch" steht in `einheit.html`,
gebaut wird sie von `lehrbuchAuftrag()` in `engine.js`.

**Zu den Seitenzahlen:** Angegeben sind die **Seiten der PDF-Fassung**, nicht
die gedruckten Seitenzahlen. Die OCR-Ebene des Buches enthält die gedruckte
Paginierung nicht verlässlich; sie zu raten wäre schlimmer als sie
auszuweisen. Wer mit dem gedruckten Buch arbeitet, prüft den Versatz einmal
und rechnet ihn hinzu.

### Übungsblätter: eine Aufgabe, die nicht gerechnet wird

Die 228 Blätter bestanden aus vier Rechenaufgaben und sonst nichts. Damit
fragte jedes Blatt auf jeder Stufe dasselbe ab — Anforderungsbereich I und
II — und der Unterschied zwischen Basis und Vertiefung lag allein in den
Zahlen und Stoffen. Das Lehrbuch stuft dagegen über den Operator.

Jedes Blatt schließt deshalb mit einer Aufgabe ohne Rechnung: A beschreibt,
was gerechnet wurde, und benennt die Formel; B erklärt einer Mitschülerin
den Weg durch Aufgabe 2; C prüft zwei Ergebnisse auf Plausibilität und
beurteilt, welche Aufgabe die meisten Fehlerquellen trägt. Sie steht vor dem
Selbstkontrollkasten und ist eigens beschriftet — auf sie gibt es keine Zahl
als Antwort.

Dazu trägt jedes Blatt jetzt den Lehrbuchbezug im Kopf. Das Blatt wird zu
Hause bearbeitet; dort steht das Buch daneben und der Rechner womöglich nicht.

### Kopiervorlagen aus dem Eduki-Bestand — als Verweis, nicht als Kopie

`Eduki/downloads` ist nach Fach und Zielgruppe sortiert (216 Pakete,
`Eduki/eduki_sortieren.py`, Protokoll in `Eduki/sortierung.csv`). Von den 140
Schülerpaketen im Fach Chemie sind **131 einer Einheit zugeordnet**, mit
Niveaustufe und Einsatzhinweis; 9 sind mit Begründung ausgelassen (Abitur,
Grundschule, Deko). Die Zuordnung ist von Hand entschieden — bei
Unterrichtsmaterial trennt kein Stichwortabgleich „Chemie der Kerze —
Aggregatzustände" von „Chemie der Kerzenflamme — Brandbekämpfung".

Die Dateien bleiben, wo sie sind. Eduki-Material ist gekauft und für die
eigene Lerngruppe lizenziert, nicht für die Weitergabe; dieses Projekt liegt
auf GitHub Pages. Eine Kopie nach `units/` wäre eine Veröffentlichung, keine
Einbindung. Das Dashboard zeigt stattdessen je Einheit, was passt und wo es
liegt — gedruckt wird vom Rechner der Lehrkraft.

### Datenschutz

`DATENSCHUTZ.md` ist an drei Stellen fortgeschrieben: der Wechsel des
aufgerufenen Anbieters von YouTube auf Lumi, die neue Tabelle mit
Bewertungsbezug, und zwei neue offene Punkte — die Auftragsverarbeitung
für Lumi und der Beschluss der Fachkonferenz zur Verwendung der
Warm-up-Ergebnisse für die Notengebung. Ohne diesen Beschluss gehört der
Bewertungsmodus ausgeschaltet; die Läufe werden dann als Übung geführt
und zählen nicht.

### Neue Werkzeuge

| Datei | Zweck |
| --- | --- |
| `werkzeuge/videos_lumi_einspielen.py` | trägt Lumi-Adressen, Laufzeit und Mindestlernweg ein; enthält die Befunde der Transkriptprüfung als nachlesbare Entscheidungen |
| `werkzeuge/mitschrift_zeitplan_bauen.py` | erzeugt Hefteintrag und 45-Minuten-Plan aus den vorhandenen Feldern |
| `werkzeuge/warmup_reihen_bauen.py` | trägt die zwölf Unterrichtsreihen und ihr Grundwissen in `spiral/plan.json` nach |
| `werkzeuge/videobericht_bauen.py` | schreibt `VIDEO_PRUEFBERICHT.md` |
| `werkzeuge/experimente_einspielen.py` | trägt die 52 Versuchsvideos, die 24 Beobachtungsaufträge und den Lehrbuchbezug in alle 76 Einheiten ein |
| `werkzeuge/lehrbuchseiten_finden.py` | sucht die Kapitelgrenzen über die OCR-Ebene des Lehrbuchs |
| `Eduki/eduki_sortieren.py` | sortiert die Downloads nach Fach und Zielgruppe |
| `Eduki/zuordnung_projekt.py` | ordnet die Schülermaterialien den Einheiten zu und schreibt die Liste fürs Dashboard |


## v3 — Übernahme der Mathematik-Anpassungen V32–V35, Erklärvideos

Das Schwesterprojekt `chh_Mathe_Klasse_9` hat zwischen dem 14. und dem
16. August die Fassungen V32 bis V35 bekommen. Diese Fassung überträgt
sie auf die Chemie und schließt gleichzeitig die größte bekannte Lücke
aus v1: die fehlenden Erklärvideos.

### Erklärvideos — 171 Verweise in allen 76 Einheiten

In v1 stand unter „Bekannte Einschränkungen": *Keine Erklärvideos
hinterlegt. Das Schema erlaubt sie und nennt vier freigegebene Kanäle;
die Auswahl steht noch aus.* Die Auswahl ist jetzt getroffen.

Grundlage sind fünf vollständige Kanallisten (`Chemie/Videos/`), zusammen
1032 Videos. Davon sind 168 verschiedene ausgewählt und 171-mal
eingetragen; drei Videos stehen in zwei Einheiten, keines in mehr als
zwei. Jede Einheit hat auf **jedem** Lernweg mindestens ein Video — das
ist nachgerechnet, nicht angenommen.

Ein Video wurde nachträglich wieder ausgetragen: `weVa4QH6238` stand in
FC-08 als *Einfache Reaktionsgleichungen aufstellen*, der deutsche
Untertiteltrack behandelt aber Elektronenkonfiguration und Orbitale —
kein einziger Treffer für „Reaktionsgleichung", „Edukt" oder „Produkt",
dafür 22-mal „Orbital". Aufgefallen ist das erst bei der Auswertung der
Transkripte für die Lernvideo-Fragen. Der Titel aus der Kanalliste
beschreibt das Video also nicht. FC-08 behält seine beiden übrigen
Videos. In `videos-quellen.csv` bleibt der Eintrag stehen: Diese Datei
ist der Herkunftsnachweis des Kanalbestands, nicht die Auswahl.

| Kanal | Verweise |
| --- | ---: |
| Chemie – simpleclub | 94 |
| Chemistry@home | 32 |
| musstewissen Chemie | 26 |
| Biologie und Chemie Schule | 12 |
| Studyflix | 8 |

Drei Dinge waren dabei zu entscheiden:

**Die Titel sind nicht die YouTube-Titel.** Ein Teil der Listen liegt
automatisch ins Englische übersetzt vor. „Deletion methods – How do I
delete something?" ist auf dem Kanal ein Video über das Löschen eines
Brandes; unter diesem Titel klickt kein Kind darauf. Eingetragen ist
deshalb, was das Video zeigt. Das Schema hat das von Anfang an so
vorgesehen — jetzt gibt es auch den Grund dafür.

**Die Kanalliste im Schema stimmte nicht.** Sie nannte `Lehrerschmidt`
und `TheSimpleChemics`; vorhanden sind fünf andere Kanäle. Das Enum
nennt jetzt die fünf, die es wirklich gibt.

**`VIDEOQUELLEN` in `engine.js` kannte nur `Lehrerschmidt`** — ein Rest
aus dem Mathematikprojekt. Ohne diese Korrektur wären alle Verweise
still verworfen worden: Die Karte wäre leer geblieben, ohne Fehler, ohne
Meldung. Ein Kanal steht jetzt an drei Stellen (Schema, `engine.js`,
`videos-quellen.csv`), und `pruefen.js` hält sie gegeneinander. Das ist
Absicht: Ein Video, das niemand angesehen hat, soll nicht durch eine
einzelne vergessene Zeile in den Unterricht rutschen.

`videos-quellen.csv` enthält alle 1032 Videos der fünf Kanäle, nicht nur
die ausgewählten. Damit ist später nachvollziehbar, **wonach** ausgewählt
wurde und was zur Wahl stand.

### Ein Übungsblatt je Lernweg — 228 PDFs statt 76

Wie in der Mathematik (V33) gibt es jetzt `uebungsblatt-a.pdf`, `-b.pdf`
und `-c.pdf`. Die alten `uebungsblatt.pdf` sind gelöscht; `pruefen.js`
meldet es, falls doch eine übrig bleibt.

Die Unterscheidung entsteht über `stufen` in den Generatoren: A rechnet
mit dem unteren Teil des Zahlenbereichs und der kürzeren, glatteren
Stoffliste, C mit dem oberen. 300 der 304 Generatoren liefern dadurch je
Lernweg andere Aufgaben; bei vier Generatoren war der Zahlenraum zu klein
für eine sinnvolle Teilung, dort steht auf allen drei Blättern dasselbe.

**Kein neuer Wert kommt hinzu.** Die Stufen wählen nur aus dem aus, was
schon im Generator stand — eine molare Masse, die niemand geprüft hat,
soll nicht dadurch entstehen, dass ein Werkzeug einen Bereich nach oben
verlängert. Erzeugt wurde die Aufteilung maschinell und anschließend mit
400 Proben je Stufe nachgerechnet; fünf Vorschläge sind dabei
durchgefallen (eine engere Stoffliste machte `ganz(m / M * 1000)`
unerfüllbar) und wurden verworfen statt nachgebessert.

**Unterschied zur Mathematik:** Dort trägt A vier, B fünf und C sechs
Aufgaben, weil V33 zusätzlich 54 neue Vertiefungsaufgaben gebracht hat.
Hier bleibt es bei vier Aufgaben je Blatt; die Blätter unterscheiden sich
in den Werten, nicht im Umfang. Zwei zusätzliche Generatoren je Einheit
wären 152 neue Chemieaufgaben — das ist fachliche Arbeit und keine
Übernahme, und ohne Prüfung durch eine Lehrkraft gehört sie nicht auf ein
Blatt, das ausgeteilt wird. Das Feld `pfade` ist vorhanden und wirkt; wer
die Aufgaben schreibt, trägt sie ohne Codeänderung nach.

`uebungsblatt-pruefen.js` rechnet jetzt **jede Stufe einzeln** durch, nicht
mehr nur B. Das ist die Prüfung, die es in der Mathematik nicht gibt: Dort
werden die A- und C-Zahlenbereiche nie durchgerechnet.

### Taschenrechner

Vollbildrechner in Einheit, Warm-up und Prüfung (`R`, `Alt+R`, `F2`,
`Esc`). Eigener Parser ohne `eval`, weil die Inhaltssicherheitsregel
`unsafe-eval` verbietet. Übernommen ist der korrigierte V35-Stand:
`-2^2 = -4`, und eine Ziffer nach `=` beginnt eine neue Rechnung, während
ein Operator mit dem Ergebnis weiterrechnet.

Für die Chemie ist er ohne Änderung brauchbar: `6,022 · 10^23` lässt sich
mit den vorhandenen Tasten eingeben, für molare Massen und `n = m : M`
reichen Punkt-vor-Strich und Klammern.

### Beameransicht und Dauerfortschritt

`dashboard/beamer.html` zeigt alle Lernenden als Strichmännchen auf einer
Geraden — wahlweise entlang der ganzen Unterrichtsreihe oder der aktuellen
Einheit. Versorgt wird sie per `BroadcastChannel` aus dem Lehrerdashboard,
damit das Lehrer-Token in genau einem Fenster bleibt.

Damit sich die Männchen überhaupt bewegen, meldet `tracker.js` den
Fortschritt jetzt durchgehend: bei jedem Aufgabenwechsel, bei jedem
Fehlversuch und zusätzlich alle 20 Sekunden. Vorher ging nur bei einer
richtigen Antwort etwas raus — wer zehn Minuten an derselben Aufgabe saß,
stand im Dashboard mit einem zehn Minuten alten Stand.

Die beiden V35-Korrekturen sind mit übernommen: `letzterKontakt` und
`letzterHeartbeat` sind getrennte Zeitreihen (sonst fällt der Fehlerzähler
auf null, sobald nach einem Heartbeat eine normale Antwort ankommt), und
der Pfad für Kinder ohne Fortschrittszeile benutzt dieselbe Variable wie
alle anderen.

### Entwicklerwerkzeuge nur noch bei devMode

Neu ist `assets/js/dev-boot.js`. Es steht auf jeder Seite und enthält nur,
was **vor** den übrigen Skripten laufen muss: die CONFIG-Überschreibungen
und den Testschüler. Das Menü (`dev-tools.js`, 9 KB gzip) wird von dort
nachgeladen — und nur, wenn `devMode` an ist. Auf `master` fordert es
niemand mehr an.

Nebenbei gefunden: `dev-tools.js` suchte den Lernbereich noch mit
`/^#(?:bereich-)?(pz|lf|kp|sk)$/` und fiel auf `pz` zurück. Das sind die
Mathematikbereiche; in der Chemie hat die Bereichsnavigation deshalb nie
den richtigen Ausgangspunkt getroffen.

### Was das Performancebudget jetzt zählt

`budget-pruefen.js` zählt nur noch, was ein **Schülergerät** lädt: die
Vorabliste aus `sw.js`, alles aus einem `<script src>` oder `<link href>`
der Seiten im Hauptverzeichnis, plus `sw.js` selbst. Damit fallen
Lehrerdashboard, Beameransicht und `dev-tools.js` heraus — sie kommen auf
keinem Schülergerät an.

Das ist keine Buchhaltung, sondern die Begründung der Grenze selbst: Sie
schützt die Erstinstallation des Service Workers im Schul-WLAN. Was dort
nie ankommt, gehört nicht in die Summe. Die nicht gezählten Dateien stehen
namentlich im Bericht, damit die Entscheidung sichtbar bleibt.

| Messung | v2 | v3 | Grenze |
| --- | ---: | ---: | ---: |
| JavaScript je Seite | 99 KB | 101 KB | 120 KB |
| JavaScript gesamt | 149 KB | 141 KB | 155 KB |
| CSS gesamt | 18 KB | 19 KB | 25 KB |
| größte Einzeldatei | 76 KB | 78 KB | 200 KB |
| Offlinepaket | 1,95 MB | 1,92 MB | 2,2 MB |

Die 228 PDFs liegen bewusst **nicht** im Offlinepaket. Gedruckt wird dort,
wo es Netz gibt.

### Neue und erweiterte Prüfungen

- `werkzeuge/aufbau-pruefen.js` (neu) prüft jede Einheit gegen die sechs
  didaktischen Phasen aus `Aufbau_Lernabschnitte_allgemein.txt`.
- `a11y-pruefen.js` erfasst jetzt auch `dashboard/beamer.html` sowie
  `rechner.css`, `dashboard.css` und `beamer.css` — zehn Seiten, 320
  Bilder.
- `pruefen.js` kontrolliert das vollständige Supabase-Sollinventar (10
  Tabellen mit RLS, 18 Funktionen, Entzug des alten Login-RPCs) und dass
  `supabase/abgleich-readonly.sql` streng lesend bleibt.
- Touchziele im Lehrerdashboard von 34–42 px auf mindestens 44 px.

### Supabase

Neu ist `supabase/abgleich-readonly.sql`: ausschließlich `SELECT`, für
einen älteren oder unvollständigen Datenbankstand ausgelegt, ohne
Schülerdaten in der Ausgabe. `setup.sql` ist **nicht** verändert und in
diesem Schritt **nicht** gegen eine reale Datenbank ausgeführt worden.
Der Ablauf bleibt der aus V35: erst lesend erfassen, dann in einem
separaten Testprojekt migrieren, dann mit echten Browserrollen testen.

### Nicht geprüft

Der HTTP-basierte Playwright-Durchlauf konnte hier nicht laufen. Der neu
übernommene Test `tests/smoke/rechner-beamer.spec.js` ist auf die
Chemieeinheiten `qb-03` und `sl-02` umgestellt, aber noch nicht
ausgeführt.

## v2 — Animationen aufgeteilt, Reste des Mathematikprojekts entfernt

Das Performancebudget war gerissen: Die Einheitenseite lud 123 KB gzip an
JavaScript bei einer Grenze von 120. `werkzeuge/budget.json` hatte den Fall
vorhergesagt und auch gesagt, was zu tun ist — die Animationen aufteilen.

### Aufgeteilt

`assets/js/animationen.js` enthält jetzt nur noch den Rahmen: Bildschleife,
Bedienleiste, Registry, Werkzeugkasten. Die Animationen selbst liegen nach
Jahrgängen getrennt in `animationen-7.js` (8), `animationen-8.js` (9) und
`animationen-9.js` (10 für die Jahrgänge 9 und 10). Der Rahmen lädt den
passenden Teil beim ersten Zugriff nach; die Galerie holt alle drei.

Damit fällt die Einheitenseite von 123 auf 110 KB gzip und die größte
Einzeldatei von 178 auf 77 KB. Für den Offlinebetrieb liegen alle drei Teile
weiterhin im Installationspaket des Service Workers — sie werden erst bei
Bedarf ausgeführt, müssen aber verfügbar sein, bevor ein Kind ohne Netz eine
Einheit öffnet.

Die Zuordnung Animation → Datei steht in der Tabelle `MODUL` und ist damit
eine zweite Wahrheit neben der Registrierung. `pruefen.js` hält beide
gegeneinander; eine Animation, die in der Tabelle fehlt, würde sonst nie
nachgeladen und erst im Unterricht auffallen.

### Entfernt

Zehn Animationen aus dem Mathematikprojekt standen noch im Rahmen — Steigung,
Achsenabschnitt, Nullstelle, Schnittpunkt und weitere. Keine Chemieeinheit hat
sie je aufgerufen, ausgeliefert und mitgeparst wurden sie trotzdem. Mit ihnen
gingen `Feld()` und `nettSchritt()`, die Koordinatensysteme für lineare
Funktionen zeichnen, sowie zwei Vorhersagefragen ohne zugehörige Animation.

Die tatsächliche Zahl der Animationen ist damit **27**, nicht 37. In v1 stand
die falsche Zahl in README und CHANGELOG, weil die zehn Mathematikanimationen
mitgezählt wurden.

### Neu: werkzeuge/animationen-laden.js

Beim Aufteilen ging der Export-Block `window.ANIM._intern` verloren. Alle
bestehenden Prüfungen blieben grün: Die Syntax stimmte, die Dateigrößen
stimmten, die Zahl der Animationen stimmte. Im Browser hätte trotzdem keine
einzige Animation funktioniert, weil die Fachteile den Rahmen nicht mehr
gefunden hätten.

Das neue Werkzeug lädt die vier Dateien in einem minimalen Browser-Nachbau
wirklich aus und prüft, was danach da ist: `window.ANIM`, die Werkzeuge in
`_intern`, die Zahl der registrierten Animationen je Datei und dass jede von
ihnen `bauen()`, Titel und Bezug hat. Es läuft in der CI direkt nach
`pruefen.js`.

Was es nicht prüft: was eine Animation zeichnet. Dafür braucht es ein echtes
SVG-Layout und einen Blick auf `animationen.html`.

### Kurz angehoben, dann zurückgenommen

`js_gesamt_gzip_kb` stand für die Dauer eines Prüflaufs auf 170, weil die
Gesamtsumme mit 160 KB über der Grenze von 150 lag und die Aufteilung daran
nichts ändert. Das war der falsche Schritt: Nach dem Entfernen der zehn
Mathematikanimationen liegt der Wert bei 149 KB, also unter dem ursprünglichen
Stand. Die Grenze steht jetzt auf 155 — sechs Kilobyte Luft, damit der nächste
Zuwachs wieder auffällt.

Der Merksatz steht in `werkzeuge/budget.json`: erst nach totem Code suchen,
dann über die Grenze reden. Ein gerissenes Budget ist zuerst eine Frage, keine
Zahl, die man anpasst.

### Zahlen nach dem Umbau

| Messung                  |     v1 |     v2 | Grenze |
| ------------------------ | -----: | -----: | -----: |
| JavaScript je Seite      | 123 KB |  99 KB | 120 KB |
| JavaScript gesamt        | 156 KB | 149 KB | 155 KB |
| größte Einzeldatei       | 178 KB |  76 KB | 200 KB |
| Offlinepaket             | 1,99 MB| 1,95 MB| 2,2 MB |

Alle Werte gzip-komprimiert außer der Einzeldatei und dem Offlinepaket.

## v1 — Aufbau des Chemieprojekts

Erste vollständige Fassung. Das Projekt entstand als Schwesterprojekt zu
`chh_Mathe_Klasse_9` und übernimmt dessen Architektur: dieselbe Aufgaben-Engine,
dasselbe Warm-up-Prinzip, dieselben Betriebs- und Prüfwerkzeuge. Ausgetauscht
wurden alle fachlichen Schichten.

### Inhalt

- **76 Einheiten à 60 Minuten** in zwölf Themenfeldern, aufgeteilt auf die
  Jahrgänge 7 bis 10. Grundlage sind das schulinterne Curriculum Chemie 7–10
  und der Rahmenlehrplan 1–10 Berlin/Brandenburg, Teil C Chemie.
- **1064 Aufgaben**, je Einheit 4 Basis · 6 Standard · 4 Vertiefung über die
  Stufen Einstieg → Geführt → Frei → Transfer, mit gestuften Tipps,
  vollständigem Lösungsweg und hinterlegten Fehlvorstellungen.
- **124 verschiedene Fehlvorstellungs-IDs**, alle einer der 13 Kategorien in
  `schema/fehlvorstellungen-kategorien.json` zugeordnet.
- **120 Warm-up-Generatoren** in acht Wiederholungskategorien.
- **304 Generatoren für die gedruckten Übungsblätter**, je Einheit vier.
- **27 interaktive Animationen**, jede in drei Niveaustufen. (In v1 stand hier
  irrtümlich 37 — siehe oben.)

### Neu gegenüber dem Mathematikprojekt

- **Chemiespezifische Aufgabenbilder** (`assets/js/zeichnen.js`): Teilchenmodell,
  Schalenmodell, PSE-Ausschnitt, Lewis-Formel, Strukturformel, Energiediagramm,
  pH-Skala, Versuchsaufbau, Anteilsbalken und Messwertdiagramm. Alle als
  Inline-SVG mit den Farbtoken aus `app.css`, damit dunkler Modus und Druck
  stimmen.
- **Textplatzhalter in den Generatoren** (`assets/js/ausdruck.js`): `{name$}`
  setzt einen Text statt eines Rechenwerts ein. Chemie braucht das — „Welche
  Ordnungszahl hat Natrium?" ist eine Zahlenaufgabe mit einem Stoffnamen darin.
  Ohne diese Erweiterung stünde je Stoff ein eigener Generator in der
  Leitner-Kartei, und getrackt würde „kann Natrium" statt „kann die Ordnungszahl
  ablesen".
- **Feld `sicherheit`** in `tasks.json`: Gefahrenhinweise, die vor dem
  Experimentieren gelesen werden. Sie stehen dort, wo der Versuch geplant wird,
  nicht in einem separaten Dokument.
- **Basiskonzepte statt Leitideen**: `leitidee` trägt jetzt B1 bis B4
  (Stoff-Teilchen, Struktur-Eigenschaft, chemische Reaktion, Energie),
  `standards` die Kompetenzbereiche K1 bis K4 nach Teil C, Kapitel 2.

### Entkoppelt

Zwei Stellen im Prüfer waren auf 54 Einheiten festgelegt. Beide lesen die Zahl
jetzt aus `units/index.json` — zwei Wahrheiten wären eine zu viel gewesen.

### Bekannte Einschränkungen

- **Keine Erklärvideos hinterlegt.** Das Schema erlaubt sie und nennt vier
  freigegebene Kanäle; die Auswahl steht noch aus. Solange keine Verweise
  eingetragen sind, meldet `pruefen.js` nur einen Hinweis auf die fehlende
  Quellliste `videos-quellen.csv`.
- **Keine externen Übungsverweise hinterlegt.** `uebungen.html` zeigt die
  Themenfelder und ist bereit; die Verweise gehören in die jeweilige
  `tasks.json` unter `uebungslinks`.
- **Supabase-Anbindung ungeprüft.** `supabase/setup.sql` wurde aus dem
  Mathematikprojekt übernommen und auf die neuen Namen umgestellt, aber in
  keinem Testprojekt ausgeführt. Vor einer produktiven Nutzung ist das
  nachzuholen.
- **Die Aufgaben sind nicht im Unterricht erprobt.** Fachliche Richtigkeit wurde
  beim Schreiben geprüft, die Passung zu einer konkreten Lerngruppe nicht.

# Prüfbericht: Lernvideos mit Lumi-Lernaktivitäten

Stand der Umstellung von verlinkten YouTube-Videos auf die mit Lumi
angereicherten, eingebetteten Fassungen — und was die Prüfung gegen die
Transkripte ergeben hat.

## Was geprüft wurde

Grundlage sind die 167 deutschen Transkripte in
`VideoTranskripte/TRANSSKRIPTE_CHEMIE_VIDEOS` und die Zuordnungstabelle
`lernvideos_chemie_mit_lumi_links.csv`. Drei Fragen, drei Verfahren:

1. **Gibt es zu jedem eingebundenen Video eine angereicherte Fassung?**
   Abgleich über die YouTube-Kennung. Ergebnis: 168 von ursprünglich 171
   Verweisen haben eine; drei hatten keine oder fielen inhaltlich durch
   (siehe unten).

2. **Passt der Inhalt zur Einheit?**
   Jedes Transkript wurde gegen die Wortprofile aller 76 Einheiten gehalten
   (tf-idf-gewichtet). Landete die eigene Einheit nicht unter den ersten
   Plätzen, wurde das Transkript gelesen und entschieden. Die reine Kennzahl
   war dafür nicht brauchbar: Bei breit angelegten Einheiten liegt die
   Wortschatzüberdeckung eines einzelnen Films naturgemäß niedrig, ohne dass
   etwas nicht passt. Die Rangfolge über alle Einheiten hat dagegen genau die
   Fälle gefunden, die wirklich woandershin gehören.

3. **Passt das Niveau zum Lernweg?**
   Aus jedem Transkript wurde ein Schwierigkeitsindex berechnet
   (Dichte fachlicher Marker nach curricularer Stufe, Anteil langer
   Komposita, Typ-Token-Verhältnis). Innerhalb jeder Einheit ordnet er die
   Videos; das leichteste trägt den Basisweg, das schwerste geht auf den
   Vertiefungsweg, wenn der Abstand das rechtfertigt. Wo der Index gegen die
   curriculare Einordnung stand, hat die Einordnung entschieden — nachzulesen
   in `werkzeuge/videos_lumi_einspielen.py` unter `STUFE_FEST`.

## Was sich in den Daten geändert hat

Das Feld `pfad` (nur auf genau diesem Lernweg zeigen) ist ersetzt durch
`stufe` (ab diesem Lernweg zeigen). Dazu kommen `lumi`, `embed` und `dauer_s`.
Die Laufzeit stammt aus der letzten Zeitmarke des Transkripts und ist die
Grundlage des 45-Minuten-Plans.

Angezeigt wird je Lernweg **genau ein empfohlenes Video** — das speziellste,
das noch passt. Die übrigen stehen zugeklappt darunter. Ohne diese Trennung
hätte ein Kind auf dem Vertiefungsweg drei Filme vor der ersten Aufgabe.

## Befunde

| Einheit | Video | Entscheidung | Begründung |
|---|---|---|---|
| FC-02 | Die blaue Flamme — Experiment zur Brennerflamme | **entfernt** | Weder eine mit Lumi angereicherte Fassung noch ein Transkript vorhanden. Der verbliebene Gasbrennerfilm deckt den Lernstoff der Einheit ab. |
| SZ-05 | Flammenfärbung — Nachweis von Alkali- und Erdalkalimetallen | **entfernt** | Weder eine angereicherte Fassung noch ein Transkript vorhanden. |
| AL-06 | Alkoholherstellung durch säurekatalysierte Hydratisierung | **entfernt** | Das Transkript behandelt die Hydratisierung von Alkenen und nennt die Grignard-Reaktion. Das ist Sekundarstufe II und hat mit Gärung, Destillation und Promillerechnung — dem Thema der Einheit — nichts zu tun. Auch auf dem Vertiefungsweg der 10. Klasse wäre es fehl am Platz. |
| FC-08 | Reaktionsgleichungen ausgleichen — Grundlagen | **auf Lernweg C** | Das Video arbeitet mit Summenformeln, Indizes und Koeffizienten (Fe₂O₃ + CO). Die Einheit steht in Klasse 7 und behandelt Wortgleichungen; Formelgleichungen kommen erst in WA-03 (Klasse 8). Für den Basis- und Standardweg ist das zu früh, als Ausblick auf dem Vertiefungsweg tragbar. |
| PS-06 | Das Massenspektrometer — wie Atommassen gemessen werden | **auf Lernweg C** | Inhaltlich genau richtig — so werden Atommassen tatsächlich bestimmt. Sprachlich und begrifflich (Ionisierung, Ablenkung im Magnetfeld, Detektor) liegt es deutlich über dem, was die Einheit in Klasse 7 verlangt. |
| ME-07 | Rost mit Zitronensäure entfernen — die Theorie | **auf Lernweg C** | Die Erklärung läuft über Komplexbildung (24 Nennungen im Transkript). Das Experiment passt zur Einheit, die Begründung liegt über Klasse 8. |
| OS-04 | Rost mit Zitronensäure entfernen — die Theorie | **auf Lernweg C** | Dasselbe Video, dieselbe Begründung. In OS-04 (Fruchtsäuren) ist der Bezug enger, das Niveau bleibt aber Vertiefung. |
| SL-04 | Autoprotolyse des Wassers — pH- und pOH-Wert | **auf Lernweg C** | pOH-Wert und Ionenprodukt gehen über „Laugen enthalten Hydroxid-Ionen“ hinaus. Für den Vertiefungsweg ist es die passende Fortsetzung. |
| SL-05 | Ammoniak — was ist das? | **auf Lernweg C** | Ammoniak ist kein Oxid und damit streng genommen die Ausnahme zur Regel der Einheit (Nichtmetalloxide → Säuren, Metalloxide → Laugen). Als Erweiterung auf dem Vertiefungsweg sinnvoll, als Regelbeispiel irreführend. Das Transkript beginnt zudem mit Natriumelektrid — reine Neugierchemie. |
| KW-07 | Alkene und Alkine in der organischen Chemie | **auf Lernweg C** | sp²-Hybridisierung, cis/trans-Isomerie, Carbokationen. Der zweite Film der Einheit („Alkene, Alkine und Co.“) deckt dasselbe Thema auf dem Niveau der 9. Klasse ab und trägt jetzt den Basisweg. |
| AL-03 | Organische Sauerstoffverbindungen im Überblick | **auf Lernweg C** | Eine Übersicht über Ester, Carbonsäuren und Aldehyde — Stoff, der in AL-03 (Struktur und Eigenschaften der Alkohole) noch nicht dran ist. Als Vorausschau auf dem Vertiefungsweg brauchbar. |
| OS-03 | Chemische Reaktionen der Carbonylgruppe | **auf Lernweg C** | Das Video behandelt Aldehyde, Ketone und Zucker; die Einheit behandelt Struktur, Eigenschaften und Salze der Carbonsäuren. Die Nähe reicht für den Vertiefungsweg, für den Basisweg trägt es am Thema vorbei. |
| KW-06 | Wie wird Erdöl gefördert? | **bleibt, mit Vorbehalt** | Der Film handelt von der Gewinnung, nicht von der Verbrennung. Er trägt den Einstieg der Einheit (wozu verbrennen wir Kohlenwasserstoffe, was folgt daraus für das Klima) und steht deshalb auf dem Basisweg. Die Verbrennungsgleichung selbst kommt aus dem zweiten Film der Einheit. Wer die Einheit später umbaut, sollte hier ein Video zur vollständigen und unvollständigen Verbrennung suchen. |

Alle übrigen Verweise wurden geprüft und für passend befunden. Auffällig
niedrige Wortschatzquoten ohne inhaltlichen Befund — etwa bei
Übungsvideos zur Nomenklatur, die naturgemäß den Wortschatz der
Nomenklatureinheit tragen und nicht den der Anwendungseinheit — sind
bewusst nicht als Mangel gewertet.

## Bestand

- **168 eingebettete Videos** in 76 Einheiten
- Verteilung nach Mindestlernweg: **A 76 · B 61 · C 31**
- Gesamtlaufzeit: **15 h 11 min**
- Jede Einheit hat mindestens ein Video auf Lernweg A — `werkzeuge/pruefen.js`
  bricht ab, wenn das einmal nicht mehr stimmt.

## Vollständige Zuordnung

### FC · Faszination Chemie · Klasse 7

| Einheit | Video | Quelle | ab Lernweg | Länge | Transkript |
|---|---|---|---|---|---|
| FC-01 | Gefahrenhinweise und Sicherheitsregeln im Labor | Chemie - simpleclub | A | 5:47 | ja |
|  | Verhalten im Chemieraum — was man nicht tun darf | Chemie - simpleclub | B | 5:32 | ja |
| FC-02 | Gasbrenner sicher anzünden und bedienen | Biologie und Chemie Schule | A | 5:15 | ja |
| FC-03 | Dichte — was ist das? | Chemie - simpleclub | A | 4:55 | ja |
|  | Aggregatzustände: fest, flüssig, gasförmig | musstewissen Chemie | B | 4:28 | ja |
|  | Siede- und Schmelztemperatur als Stoffeigenschaft | Chemie - simpleclub | B | 4:04 | ja |
| FC-04 | Reinstoffe und Stoffgemische unterscheiden | Chemie - simpleclub | A | 2:46 | ja |
|  | Homogene und heterogene Gemische | Studyflix | B | 5:05 | ja |
|  | Trennverfahren im Überblick | Chemie - simpleclub | B | 3:40 | ja |
| FC-05 | Eisen und Schwefel reagieren — Kennzeichen einer chemischen Reaktion | Biologie und Chemie Schule | A | 6:35 | ja |
|  | Chemische Reaktion oder physikalischer Vorgang? | musstewissen Chemie | B | 4:36 | ja |
| FC-06 | Löschmethoden — wie man ein Feuer richtig löscht | Chemie - simpleclub | A | 4:14 | ja |
|  | Die Kerzenflamme — was dort verbrennt | Chemie - simpleclub | B | 2:41 | ja |
| FC-07 | Sauerstoff und Verbrennungen | musstewissen Chemie | A | 7:11 | ja |
|  | Oxidation im Alltag | musstewissen Chemie | B | 4:12 | ja |
|  | Metall wird verbrannt — Wortgleichung aufstellen | Biologie und Chemie Schule | B | 2:34 | ja |
| FC-08 | Reaktionsgleichungen ausgleichen — Grundlagen | Chemistry@home | A | 3:38 | ja |
|  | Metall reagiert mit Schwefel — Wortgleichung aufstellen | Biologie und Chemie Schule | B | 1:51 | ja |

### PS · Das Periodensystem der Elemente · Klasse 7

| Einheit | Video | Quelle | ab Lernweg | Länge | Transkript |
|---|---|---|---|---|---|
| PS-01 | Periodensystem der Elemente — Perioden und Gruppen | musstewissen Chemie | A | 9:19 | ja |
|  | Wie ist das Periodensystem aufgebaut? | Chemie - simpleclub | C | 6:06 | ja |
| PS-02 | Was sind Teilchen? — der Teilchenbegriff | Chemie - simpleclub | A | 2:56 | ja |
|  | Das Teilchenmodell einfach erklärt | Chemie - simpleclub | B | 2:44 | ja |
| PS-03 | Atome und Stoffe im Modell von John Dalton | musstewissen Chemie | A | 6:06 | ja |
|  | Die Entwicklung der Atommodelle | Chemie - simpleclub | B | 3:42 | ja |
| PS-04 | Das Atommodell nach Niels Bohr | musstewissen Chemie | A | 7:42 | ja |
|  | Rutherfords Streuversuch — der Kern wird entdeckt | Chemie - simpleclub | B | 4:04 | ja |
| PS-05 | Atome, Moleküle und Ionen — die Bausteine | Chemie - simpleclub | A | 5:23 | ja |
|  | Symbolschreibweise und Isotope am Periodensystem | Chemistry@home | B | 8:08 | ja |
| PS-06 | Die Masse von Atomen | musstewissen Chemie | A | 6:20 | ja |
|  | Relative Atommasse — warum sie keine Einheit hat | Chemie - simpleclub | B | 6:28 | ja |
|  | Das Massenspektrometer — wie Atommassen gemessen werden | Studyflix | C | 5:06 | ja |
| PS-07 | Atombau, Stellung im Periodensystem und Schalenmodell | Biologie und Chemie Schule | A | 22:40 | ja |
|  | Das Energiestufenmodell einfach erklärt | Chemistry@home | B | 11:34 | ja |
| PS-08 | Alkalimetalle — die 1. Hauptgruppe | musstewissen Chemie | A | 10:46 | ja |
|  | Halogene — die 7. Hauptgruppe | musstewissen Chemie | B | 5:59 | ja |
|  | Edelgase — die 8. Hauptgruppe | Chemie - simpleclub | C | 3:05 | ja |

### GA · Gase · Klasse 7

| Einheit | Video | Quelle | ab Lernweg | Länge | Transkript |
|---|---|---|---|---|---|
| GA-01 | Zusammensetzung der Luft | musstewissen Chemie | A | 6:12 | ja |
|  | Luft — woraus sie besteht | Chemie - simpleclub | B | 3:40 | ja |
| GA-02 | Knallgasprobe — Nachweis von Wasserstoff | Biologie und Chemie Schule | A | 1:44 | ja |
|  | Glimmspanprobe — Nachweis von Sauerstoff | Biologie und Chemie Schule | B | 1:19 | ja |
|  | Kalkwasserprobe — Nachweis von Kohlenstoffdioxid | Biologie und Chemie Schule | B | 1:29 | ja |
| GA-03 | Valenzstrichformeln aufstellen — Tipps | Chemistry@home | A | 11:49 | ja |
|  | Elektronenpaarbindung — die kovalente Bindung | Chemie - simpleclub | B | 4:49 | ja |
|  | Oktettregel und Edelgaskonfiguration | musstewissen Chemie | B | 6:40 | ja |
| GA-04 | Kohlenstoffdioxid und die Erderwärmung | Chemie - simpleclub | A | 3:28 | ja |
|  | Stickstoffdioxid aus Autoabgasen | Chemie - simpleclub | B | 2:15 | ja |
|  | Kohlenstoffmonoxid — das unsichtbare Giftgas | Chemie - simpleclub | C | 2:51 | ja |
| GA-05 | Was sind Gase und wie beschreibt man sie? | musstewissen Chemie | A | 8:06 | ja |
|  | Nachweisreaktionen für Kohlenstoffdioxid und Wasser | Chemie - simpleclub | B | 3:43 | ja |

### WA · Wasser — eine Verbindung · Klasse 8

| Einheit | Video | Quelle | ab Lernweg | Länge | Transkript |
|---|---|---|---|---|---|
| WA-01 | Wasser — Grundlage des Lebens | Chemie - simpleclub | A | 2:53 | ja |
|  | Wasserstoffbrückenbindungen | musstewissen Chemie | C | 7:49 | ja |
| WA-02 | Reaktionsgleichung: Wasserstoff und Sauerstoff reagieren zu Wasser | Chemistry@home | A | 2:56 | ja |
|  | Wie wird Wasserstoff hergestellt? | Chemie - simpleclub | B | 5:02 | ja |
| WA-03 | Reaktionsgleichung: Kupfer(II)-oxid und Kohlenstoff reagieren zu Kupfer und CO₂ | Chemistry@home | A | 1:11 | ja |
|  | Reaktionsgleichungen ausgleichen — Übungen | Chemie - simpleclub | C | 5:50 | ja |
| WA-04 | Dipol-Dipol-Wechselwirkungen | Chemie - simpleclub | A | 4:59 | ja |
|  | Elektronegativität und Polarität von Molekülen | Chemistry@home | B | 13:38 | ja |
|  | Elektronegativität | Chemie - simpleclub | C | 4:32 | ja |
| WA-05 | Löslichkeit von Stoffen | musstewissen Chemie | A | 5:51 | ja |
|  | Löslichkeit einfach erklärt | Chemie - simpleclub | B | 4:21 | ja |
| WA-06 | Watesmopapier — Nachweis von Wasser | Biologie und Chemie Schule | A | 1:05 | ja |
|  | Wasserstoffbrückenbindungen — Wiederholung | Chemie - simpleclub | C | 3:38 | ja |

### SZ · Salze · Klasse 8

| Einheit | Video | Quelle | ab Lernweg | Länge | Transkript |
|---|---|---|---|---|---|
| SZ-01 | Ionen und Salze — Einführung | musstewissen Chemie | A | 10:48 | ja |
|  | Wie werden Ionen gebildet? | Chemie - simpleclub | C | 4:42 | ja |
| SZ-02 | Ionengitter und Gitterenergie | Chemie - simpleclub | A | 3:55 | ja |
|  | Salze — Eigenschaften und Aufbau der Ionenbindung | Biologie und Chemie Schule | B | 3:17 | ja |
| SZ-03 | Grundlagen der Salzbildung | Chemistry@home | A | 12:30 | ja |
|  | Benennung binärer Metall-Nichtmetall-Verbindungen | Chemistry@home | B | 7:38 | ja |
|  | Übung: Salzbildung aus Strontium und Chlor | Chemistry@home | B | 1:42 | ja |
| SZ-04 | Kristallisation und Löslichkeit — Kristalle züchten | Chemie - simpleclub | A | 5:22 | ja |
|  | Natriumchlorid — unser Kochsalz | Chemie - simpleclub | C | 2:54 | ja |
| SZ-05 | Metalle, Salze und Moleküle unterscheiden | Chemistry@home | A | 5:30 | ja |

### ME · Metalle · Klasse 8

| Einheit | Video | Quelle | ab Lernweg | Länge | Transkript |
|---|---|---|---|---|---|
| ME-01 | Metalle und Halbmetalle im Periodensystem | Chemie - simpleclub | A | 5:28 | ja |
|  | Metalle — Eigenschaften und Aufbau | Biologie und Chemie Schule | B | 2:49 | ja |
| ME-02 | Die Metallbindung und das Elektronengas | Chemie - simpleclub | A | 4:23 | ja |
|  | Metallbindungen einfach erklärt | musstewissen Chemie | B | 6:13 | ja |
| ME-03 | Übung: Eisennagel in Kupfer(II)-sulfat-Lösung | Chemistry@home | A | 2:44 | ja |
|  | Die elektrochemische Spannungsreihe der Metalle | Chemie - simpleclub | B | 6:43 | ja |
|  | Natrium in Wasser — die Erklärung | Chemie - simpleclub | B | 3:15 | ja |
| ME-04 | Wie wird Stahl hergestellt? | Chemie - simpleclub | A | 4:06 | ja |
|  | Münzen vergolden und Legierungen — die Theorie | Chemie - simpleclub | B | 3:36 | ja |
| ME-05 | Oxidation und Reduktion als Elektronenübergang | Chemie - simpleclub | A | 4:22 | ja |
|  | Was sind Redoxreaktionen? | musstewissen Chemie | B | 6:57 | ja |
|  | Redoxreaktionen aufstellen | Chemistry@home | B | 14:36 | ja |
| ME-06 | Reaktionsgleichung: Eisen(III)-oxid und Kohlenstoffmonoxid im Hochofen | Chemistry@home | A | 2:46 | ja |
|  | Eisen — mehr als nur Nägel | Chemie - simpleclub | B | 2:05 | ja |
| ME-07 | Korrosion — wie Metall zerstört wird | musstewissen Chemie | A | 7:49 | ja |
|  | Rost mit Zitronensäure entfernen — die Theorie | Chemie - simpleclub | C | 7:38 | ja |

### QB · Quantitative Betrachtungen · Klasse 9

| Einheit | Video | Quelle | ab Lernweg | Länge | Transkript |
|---|---|---|---|---|---|
| QB-01 | Molare Masse und molares Volumen | musstewissen Chemie | A | 7:18 | ja |
|  | Mol und molare Masse | Chemie - simpleclub | C | 6:26 | ja |
| QB-02 | Das Mol und die molare Masse | Chemie - simpleclub | A | 4:02 | ja |
|  | Teilchenzahl und Stoffmenge | musstewissen Chemie | B | 8:24 | ja |
| QB-03 | Quantitative Chemie — Stoffmenge und Stöchiometrie | Chemistry@home | A | 11:20 | ja |
|  | Rechnen mit molaren Größen | musstewissen Chemie | B | 7:15 | ja |
|  | Berechnungen in der Chemie — Stoffmenge und Konzentration | Chemie - simpleclub | C | 9:05 | ja |
| QB-04 | Die ideale Gasgleichung | Chemie - simpleclub | A | 4:10 | ja |
|  | Molares Volumen — was ist das? | Chemie - simpleclub | C | 4:22 | ja |
| QB-05 | Übung: Quantitative Chemie an der Ammoniaksynthese | Chemistry@home | A | 3:01 | ja |
|  | Stöchiometrisches Rechnen am Beispiel einer Explosion | Chemie - simpleclub | B | 6:31 | ja |

### SL · Säuren und Laugen · Klasse 9

| Einheit | Video | Quelle | ab Lernweg | Länge | Transkript |
|---|---|---|---|---|---|
| SL-01 | Erst das Wasser, dann die Säure — und warum | Chemie - simpleclub | A | 3:00 | ja |
|  | Salzsäure — wirklich ätzend | Chemie - simpleclub | B | 2:56 | ja |
| SL-02 | Was ist eigentlich ein pH-Wert? | Chemie - simpleclub | A | 4:25 | ja |
|  | Der Rotkohlindikator — wie er funktioniert | Chemie - simpleclub | B | 3:19 | ja |
|  | pH-Wert experimentell bestimmen | Chemie - simpleclub | B | 4:34 | ja |
| SL-03 | Säure-Base-Paare | Chemie - simpleclub | A | 4:58 | ja |
|  | Die Säure-Theorie nach Brønsted | musstewissen Chemie | B | 9:44 | ja |
| SL-04 | Was sind eigentlich Basen? | musstewissen Chemie | A | 7:34 | ja |
|  | Autoprotolyse des Wassers — pH- und pOH-Wert | Chemie - simpleclub | C | 5:06 | ja |
| SL-05 | Ammoniak — was ist das? | Chemie - simpleclub | A | 2:39 | ja |
|  | Schwefelsäure — die stärkste Säure? | Chemie - simpleclub | B | 3:37 | ja |
| SL-06 | Was ist Neutralisation? | musstewissen Chemie | A | 8:32 | ja |
|  | Neutralisationsgleichungen aufstellen | Chemistry@home | B | 7:39 | ja |
|  | Neutralisation — was neutral heißt | Chemie - simpleclub | B | 8:54 | ja |
| SL-07 | Übung: Titration von Salpetersäure mit Natronlauge | Chemistry@home | A | 3:09 | ja |
|  | Titration — was man dabei tut | Chemie - simpleclub | B | 3:46 | ja |
|  | Der pKs-Wert und die Säurestärke | Studyflix | C | 4:34 | ja |

### KW · Kohlenwasserstoffe · Klasse 9

| Einheit | Video | Quelle | ab Lernweg | Länge | Transkript |
|---|---|---|---|---|---|
| KW-01 | Kohlenwasserstoffe — Überblick | Chemie - simpleclub | A | 5:11 | ja |
|  | Kohlenstoff — nicht nur für Holzkohle wichtig | Chemie - simpleclub | B | 1:43 | ja |
| KW-02 | Die homologe Reihe der Alkane | Chemistry@home | A | 9:34 | ja |
|  | Welche Eigenschaften haben Alkane? | Chemie - simpleclub | B | 4:30 | ja |
|  | Alkane und Cycloalkane | Studyflix | C | 9:00 | ja |
| KW-03 | Strukturformeln einfach erklärt | musstewissen Chemie | A | 6:59 | ja |
|  | Strukturformeln lesen und Alkane benennen | Chemie - simpleclub | B | 5:11 | ja |
|  | Lewis-Formeln zeichnen | Studyflix | C | 5:22 | ja |
| KW-04 | IUPAC-Nomenklatur der Alkane | Chemie - simpleclub | A | 5:28 | ja |
|  | Was sind Alkane und Isomere? | Chemie - simpleclub | B | 4:58 | ja |
|  | Übung: die Isomere des Pentans | Chemistry@home | C | 3:40 | ja |
| KW-05 | Van-der-Waals-Kräfte | Chemie - simpleclub | A | 4:49 | ja |
|  | London-Dispersion, Dipol-Dipol und Wasserstoffbrücken im Vergleich | Chemistry@home | C | 14:47 | ja |
| KW-06 | Wie wird Erdöl gefördert? | Chemie - simpleclub | A | 4:10 | ja |
|  | Reaktionsgleichung: Butan verbrennt zu Wasser und Kohlenstoffdioxid | Chemistry@home | B | 2:18 | ja |
| KW-07 | Alkene, Alkine und Co. — ungesättigte Kohlenwasserstoffe | Chemie - simpleclub | A | 4:24 | ja |
|  | Alkene und Alkine in der organischen Chemie | Studyflix | C | 7:36 | ja |

### AL · Alkohole · Klasse 10

| Einheit | Video | Quelle | ab Lernweg | Länge | Transkript |
|---|---|---|---|---|---|
| AL-01 | Alkohole — die Grundlagen | Chemie - simpleclub | A | 5:07 | ja |
|  | Funktionelle Gruppen im Überblick | Studyflix | C | 5:16 | ja |
| AL-02 | Übung: Benennung von Alkoholen nach IUPAC | Chemistry@home | A | 4:35 | ja |
|  | Benennung der Alkohole nach IUPAC | Chemistry@home | B | 5:23 | ja |
| AL-03 | Organische Sauerstoffverbindungen im Überblick | Chemie - simpleclub | A | 4:04 | ja |
|  | Wasserstoffbrücken zwischen Alkoholmolekülen | Chemie - simpleclub | C | 4:13 | ja |
| AL-04 | Alkohole und ihre Reaktionen | Chemie - simpleclub | A | 4:41 | ja |
| AL-05 | Alkohole oxidieren — primär, sekundär, tertiär | Chemie - simpleclub | A | 3:45 | ja |
|  | Alkanale und Alkanone — die Oxidationsprodukte | Chemie - simpleclub | B | 4:58 | ja |
|  | Oxidation von Alkoholen zu Aldehyden oder Ketonen | Chemistry@home | C | 11:26 | ja |
| AL-06 | Wie wird Bier gebraut? — Gärung im Alltag | Chemie - simpleclub | A | 3:09 | ja |
| AL-07 | Übung: Nomenklatur der Alkohole nach IUPAC | Chemistry@home | A | 3:40 | ja |
|  | Alkohole und ihre Reaktionen — Überblick | Chemie - simpleclub | B | 4:41 | ja |

### OS · Organische Säuren · Klasse 10

| Einheit | Video | Quelle | ab Lernweg | Länge | Transkript |
|---|---|---|---|---|---|
| OS-01 | Carbonsäuren — was sind das? | Chemie - simpleclub | A | 4:59 | ja |
|  | Funktionelle Gruppen im Überblick | Studyflix | B | 5:16 | ja |
| OS-02 | Benennung von Aldehyden, Ketonen und Carbonsäuren nach IUPAC | Chemistry@home | A | 9:42 | ja |
|  | Übung: Benennung von Carbonylverbindungen nach IUPAC | Chemistry@home | C | 4:51 | ja |
| OS-03 | Chemische Reaktionen der Carbonylgruppe | Chemie - simpleclub | A | 6:08 | ja |
|  | Mesomerie der Carboxylat-Ionen | Chemie - simpleclub | C | 3:03 | ja |
| OS-04 | Proteine — aus Aminosäuren aufgebaut | Chemie - simpleclub | A | 4:29 | ja |
|  | Rost mit Zitronensäure entfernen — die Theorie | Chemie - simpleclub | C | 7:38 | ja |
| OS-05 | Aspirin — eine Carbonsäure im Medikamentenschrank | Chemie - simpleclub | A | 3:20 | ja |
|  | Oxidation und Reduktion von Carbonylverbindungen | Chemie - simpleclub | C | 4:55 | ja |

### ES · Ester und Makromoleküle · Klasse 10

| Einheit | Video | Quelle | ab Lernweg | Länge | Transkript |
|---|---|---|---|---|---|
| ES-01 | Veresterung — aus Säure und Alkohol wird Ester | Chemie - simpleclub | A | 4:07 | ja |
|  | Benennung der Carbonsäureester nach IUPAC | Chemistry@home | C | 10:34 | ja |
| ES-02 | Carbonsäureester benennen — einfach erklärt | Chemistry@home | A | 9:10 | ja |
|  | Übung: Carbonsäureester benennen | Chemistry@home | B | 3:31 | ja |
| ES-03 | Veresterung — die Reaktion hinter den Fetten | Chemie - simpleclub | A | 3:52 | ja |
| ES-04 | Waschmittel und Seifen — Chemie pur | Chemie - simpleclub | A | 3:30 | ja |
| ES-05 | Polyaddition — Kunststoffherstellung | Chemie - simpleclub | A | 3:33 | ja |
|  | Polykondensation — so entstehen Polyester | Chemie - simpleclub | B | 3:32 | ja |
|  | Polymerisation — Kunststoffherstellung | Chemie - simpleclub | C | 4:06 | ja |
| ES-06 | Recycling von Kunststoffen | Chemie - simpleclub | A | 5:19 | ja |
|  | Thermoplaste — ein Kunststofftyp genauer betrachtet | Chemie - simpleclub | B | 3:33 | ja |
|  | Wie werden Kunststoffe hergestellt? | Chemie - simpleclub | C | 4:50 | ja |

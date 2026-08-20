# Datenschutz · Chemie 7–10

Dieses Dokument beschreibt, welche Daten die Anwendung verarbeitet, wie lange
sie bleiben und wie sie gelöscht werden. Es ist die technische Grundlage für
das Verarbeitungsverzeichnis — **es ersetzt keine schulische Freigabe.** Vor
dem Regelbetrieb müssen Schulleitung und behördlicher Datenschutz zustimmen.

## 1 · Was wo liegt

Die Anwendung kennt drei getrennte Ablagen. Nur eine davon verlässt das Gerät.

### 1.1 Auf dem Gerät (localStorage), verlässt es nie

| Schlüssel | Inhalt | Zweck |
|---|---|---|
| `chemie710.pfad` | A, B oder C | zuletzt gewählte Niveaustufe |
| `chemie710.stand.<kennung>.<einheit>` | Position, gelöste Aufgaben-IDs, getippte Zwischenwerte, Selbsteinschätzung | Weiterlernen nach Neuladen |
| `chemie710.stand.<kennung>.zuletzt` | zuletzt bearbeitete Einheit | Kachel „Weiterlernen“ |
| `chemie710.fehler.<kennung>` | Fehlvorstellungs-IDs mit Anzahl und Datum | Auswahl der Warm-up-Kategorien |
| `chemie710.spiral` | Leitner-Boxen der Warm-up-Generatoren | verteiltes Wiederholen |
| `chemie710.matrix.<name>` | Häkchen der Kompetenzmatrix | Lehrkraftwerkzeug |
| `chemie710.autostart` | ein/aus | Bewegungseinstellung |
| `chemie710.lesezeichen.<kennung>` | Einheitskürzel | Buchmodus |
| `chemie710.token` | Sitzungstoken der Anmeldung, mit Ablaufzeit | Schreibrecht gegenüber der Datenbank |

**Keine Klarnamen, keine Aufgabentexte, keine Antworten.** Der Bearbeitungsstand
speichert getippte Zahlen — sie gehören zu genau einer Aufgabe und gehen nicht
über das Gerät hinaus.

**Löschung:** Entwicklermenü → „Offlinecache löschen“ entfernt den Cache;
Browserdaten löschen entfernt zusätzlich den localStorage. Der Bearbeitungsstand
verfällt außerdem nach **45 Tagen** von selbst (`HALTBAR_TAGE` in `store.js`).

> **Gemeinschaftsgerät:** Der Stand hängt an der Schülerkennung, liegt aber im
> selben Browserprofil. Beim Abmelden fragt die Anwendung deshalb: **„Nur
> abmelden"** oder **„Abmelden und meine lokalen Lernstände löschen"**. Die
> zweite Wahl entfernt Bearbeitungsstände, Fehlerprofil, Lesezeichen und
> Warm-up-Kartei dieses Kindes und entwertet das Sitzungstoken sofort.

### 1.2 Auf dem Server (Supabase), nur bei eingeschaltetem Tracking

Ohne `enabled: true` in `assets/js/supabase-config.js` verlässt **nichts** das
Gerät. Ist es eingeschaltet, entstehen drei Tabellen:

| Tabelle | Inhalt |
|---|---|
| `chemie710_students` | Anmeldename, Anzeigename, Lerngruppe, aktiv/gesperrt |
| `chemie710_events` | ein Datensatz je Ereignis: Typ, Schülerkennung, Gerät, Sitzung, Lerngruppe, Seite, Einheit, Pfad, Aufgabe, Zeitstempel, Nutzlast |
| `chemie710_progress` | zusammengefasster Stand je Schüler, Einheit und Pfad |

Die **Nutzlast** enthält je nach Ereignis: richtig/falsch, Fehlvorstellungs-ID,
Anzahl Tipps, Anzahl Versuche, Bearbeitungsdauer, Aufgaben-Sitzungs-ID,
Vorhersage zur Animation. **Nicht enthalten:** eingegebene Zahlen, Aufgaben- und
Rückmeldetexte, Freitext.

Dazu kommen zwei Protokolltabellen, die **keine** Daten von Lernenden
enthalten:

| Tabelle | Inhalt | Warum |
|---|---|---|
| `chemie710_wartung_laeufe` | Zeitpunkt, Erfolg, Fehlermeldung und Anzahl gelöschter Zeilen je Aufräumlauf | Ohne Protokoll ist nicht belegbar, dass die Fristen unten tatsächlich wirken |
| `chemie710_teacher_audit` | wer wann welche Lehrkraft freigeschaltet oder gesperrt hat | „Wer durfte die Daten aller Lernenden sehen, seit wann?" muss beantwortbar sein |

Beide sind für freigeschaltete Lehrkräfte lesbar und werden ausschließlich von
den Datenbankfunktionen geschrieben. `chemie710_wartung_laeufe` wird nach 400
Tagen selbst bereinigt; das Freigabeprotokoll bleibt bewusst stehen — es
dokumentiert einen Berechtigungsvorgang, kein Lernverhalten.

Seit V30 kommen zwei personenbezogene Tabellen dazu:

| Tabelle | Inhalt | Frist |
|---|---|---|
| `chemie710_freigaben` | welche Einheit für wen freigegeben ist, wann und von wem | mit dem Schülerdatensatz (`ON DELETE CASCADE`) |
| `chemie710_lernzeit` | aktive Lernzeit je Person, Tag und Einheit — nur Sekunden, keine Inhalte | wie der Fortschritt: **ein Schuljahr** |

Zur Lernzeit gehört eine ehrliche Einordnung: Sie ist eine **Anwesenheits-
und Tätigkeitsangabe**, kein Leistungsmaß. Gezählt wird nur, was sichtbar,
aktiv und beim Server angekommen ist; Leerlauf zählt nicht. Was in einer
eingebetteten fremden Übung geschieht, ist von hier aus nicht sichtbar — dort
gilt „Rahmen offen und Seite sichtbar" als Arbeit. Wer daraus Noten ableiten
will, misst etwas anderes, als er glaubt.

Beide Tabellen stehen in `chemie710_person_export` und verschwinden mit
`chemie710_person_loeschen`.

Seit V31 kommt eine weitere personenbezogene Tabelle dazu — und zwar die
einzige, aus der unmittelbar eine **Note** entstehen kann:

| Tabelle | Inhalt | Frist |
|---|---|---|
| `chemie710_warmup_ergebnisse` | je Warm-up-Lauf: Datum, Unterrichtsreihe, Einheit, Lernweg, Anzahl Aufgaben, Anzahl auf Anhieb richtig, Dauer, abgefragte Wissenskategorien, ob Pflichtlauf, ob gewertet | wie der Fortschritt: **ein Schuljahr** |

Dazu die Spalte `chemie710_students.bewertungsart` (`note` oder
`fortschritt`) — die Entscheidung der Lehrkraft, wonach diese Person bewertet
wird.

Das verlangt eine klare Einordnung, weil hier zum ersten Mal Daten dieser
Anwendung in eine Bewertung eingehen:

- **Gewertet wird nur der erste Pflichtlauf eines Tages.** Weitere Läufe
  werden gespeichert und als Übung geführt; sie verändern die Bewertung
  weder nach oben noch nach unten. Sonst entschiede die Zahl der Versuche
  über die Note. Die Regel steht als eindeutiger Index in der Datenbank,
  nicht nur in der Anwendung.
- **Außerhalb der Unterrichtszeit zählt nichts.** Wer zuhause übt, riskiert
  nichts — das ist die Voraussetzung dafür, dass geübt wird.
- **Gespeichert werden Zählwerte, keine Antworten.** Welche Zahl eingetippt
  wurde, steht nirgends; nur „3 von 5 auf Anhieb" und welche
  Wissenskategorien vorkamen.
- Die Umrechnung in eine Note (Berliner Sekundarstufenskala) geschieht in
  `chemie710_warmup_uebersicht` und ist damit an genau einer Stelle
  nachlesbar. Sie ist eine **Grundlage für** eine Bewertung, keine
  Zeugnisnote: Fünf Aufgaben an einem Tag messen einen Tag.
- Die Tabelle steht in `chemie710_person_export`. Wer nach ihr benotet wird,
  darf sie sehen — das ist kein Zugeständnis, sondern der Zweck des
  Auskunftsrechts.

### 1.2b Verweise auf fremde Seiten (Übungen und Erklärvideos)

Jede Einheit kann auf externe Übungen verweisen und bindet ein Erklärvideo
ein. Beides erreicht einen fremden Anbieter — aber erst auf Klick:

- Solange niemand klickt, wird **keine** Verbindung zu LearningApps, Serlo
  oder Lumi aufgebaut. Der Rahmen wird leer ausgeliefert und trägt nur einen
  Knopf; die Adresse wird erst beim Klick gesetzt. Ein Video, das beim Öffnen
  der Einheit von selbst lädt, träfe auch alle, die es gar nicht ansehen
  wollen.
- Die Content-Security-Policy führt die erlaubten Rahmenquellen einzeln auf
  (`frame-src`); alles andere wird vom Browser abgelehnt. Das ist keine
  Einstellung, sondern eine Regel, die `werkzeuge/pruefen.js` auf allen zehn
  Seiten identisch durchsetzt.
- **Seit V30 öffnen sich die Übungen in einem Rahmen innerhalb der
  Anwendung**, damit die Lernzeit weiterläuft. Ein Rahmen ist **nicht
  harmloser** als ein neuer Tab — er ist genauso ein Aufruf beim fremden
  Anbieter, nur ohne den Verlust des Rückwegs. Der Rahmen läuft mit
  `sandbox` ohne `allow-top-navigation` und mit `referrerpolicy="no-referrer"`.
- **Seit V4 sind 197 Übungen eingetragen, von vier Plattformen.** Alle vier
  erlauben das Einbetten; Seiten, die es verbieten, stehen bewusst nicht im
  Projekt (siehe unten). Was beim Öffnen einer Übung tatsächlich passiert,
  unterscheidet sich erheblich — das gehört vor die erste Stunde, nicht in
  eine Fußnote:

  | Plattform | Betreiber | Sitz | was sie beim Öffnen setzt |
  |---|---|---|---|
  | **LearningApps** (152) | Verein *LearningApps – interaktive Lernbausteine* | CH-4658 Däniken | Reichweitenmessung mit Matomo (`_pk_id`, `_pk_ses`) |
  | **Schlaukopf** (23) | Digitalwerk eG, Bachstr. 6 | 72810 Gomaringen (DE) | **dauerhafte Kennung** `elearning_userId`, Laufzeit zwei Jahre |
  | **allgemeinbildung.ch** (11) | allgemeinbildung.ch | Schweiz | **nichts** — keine Cookies, keine Messung |
  | **Serlo** (11) | Serlo Education e. V. | München (DE) | Sitzungsdaten der freien Lernplattform |

  Die Schweiz ist ein Drittland, für das ein **Angemessenheitsbeschluss** der
  EU-Kommission vorliegt; eine Übermittlung dorthin braucht deshalb keine
  zusätzlichen Garantien.

  **Schlaukopf verdient einen eigenen Blick.** Die Seite legt beim ersten
  Aufruf ohne Rückfrage ein pseudonymes Gastkonto an (sichtbar als
  `gast123456@schlaukopf.de`) und speichert die Kennung zwei Jahre lang im
  Browser. Nach der Datenschutzerklärung des Anbieters werden die Daten nach
  365 Tagen Inaktivität gelöscht und nicht mit anderen Quellen
  zusammengeführt. Trotzdem ist das mehr, als die anderen drei tun — wer das
  vermeiden will, nimmt die 23 Schlaukopf-Verweise aus den `tasks.json`; die
  Einheiten bleiben dann mit mindestens zwei Übungen versorgt.

  Was in einer eingebetteten Übung geschieht, erreicht diese Anwendung nicht.
  Protokolliert wird nur, **dass** ein Verweis geöffnet wurde
  (`external_practice_open`) mit Titel und Plattform. Die Einheit funktioniert
  vollständig, wenn die Karte „Üben & Wiederholen" zubleibt.

- **Nicht aufgenommen — und warum.** Fünf weitere vorgeschlagene Seiten
  stehen nicht im Projekt. Der Grund ist in drei Fällen technisch und in zwei
  Fällen inhaltlich, und beides wurde geprüft, nicht vermutet:

  | Seite | Grund |
  |---|---|
  | `apps.zum.de` (und damit alle H5P-Übungen von `offenes-lernen.de`, das sie nur einbindet) | sendet `Content-Security-Policy: frame-ancestors 'self' *.zum.de …` — der Browser weigert sich, die Seite hier anzuzeigen |
  | `leifichemie.de` | sendet `X-Frame-Options: SAMEORIGIN` — dasselbe |
  | `msa-berlin.de` | Erklärtexte; für Übungen verweist die Seite selbst auf testedich.de und GoConqr |
  | `chemistryathome.de` | Erklärung, Video und Übungs-PDF, keine Aufgaben zum Lösen auf der Seite |
  | `stoteinfachchemie.at` | beschreibt einen Aufgabengenerator, der auf der Seite nicht liegt |

  Die beiden ersten sind besonders bitter, weil das Material dort gut ist —
  aber ein Verweis, der ein leeres Fenster öffnet, ist schlechter als keiner,
  und die Vorgabe lautet: in der Anwendung, nicht in einem neuen Tab.

**Was sich mit V31 bei den Videos geändert hat.** Bis V30 waren die Videos
Links auf YouTube: Wer klickte, verließ die Anwendung und landete bei Google,
mit Werbung und Empfehlungen daneben. Seit V31 wird stattdessen die mit Lumi
angereicherte Fassung desselben Films eingebettet — sie hält an und stellt
Zwischenfragen. Für den Datenschutz heißt das:

- Aufgerufen wird beim Klick **`app.lumi.education`**, nicht mehr
  `youtube.com`. Lumi ist ein Angebot der Lumi Education UG (Deutschland);
  die Auftragsverarbeitung ist vor dem Einsatz mit der Schule zu klären —
  siehe Abschnitt 5.
- Die YouTube-Adresse bleibt in `tasks.json` stehen, wird aber **nicht mehr
  aufgerufen**. Sie ist nur noch Herkunftsangabe für den Abgleich mit
  `videos-quellen.csv`.
- Der Rahmen bekommt `referrerpolicy="no-referrer"` und wird erst durch den
  Klick erzeugt.
- Protokolliert wird bei aktivem Tracking nur, **dass** ein Video gestartet
  wurde (Ereignis `video_start` mit Kanal, Titel, Einheit, Lernweg und Form
  `lumi_embed`). Wie im Video geantwortet wurde, erreicht diese Anwendung
  nicht — die Zwischenfragen laufen bei Lumi und kommen hier nicht an. Für
  die Bewertung zählen sie deshalb auch nicht.

Für den Unterricht heißt das: Der Weg aus der Anwendung heraus entfällt, der
Aufruf bei einem Dritten nicht. Wer ein Video im Klassenraum einsetzt, sollte
es vorher selbst geöffnet haben.

**Zweiter Anbieter seit den Versuchsvideos: `youtube-nocookie.com`.** Von den
52 Experimentiervideos liegen 28 in einer Lumi-Fassung vor, 24 nicht. Für
diese 24 gibt es keinen dritten Weg: Entweder sie entfallen, oder sie kommen
von YouTube. Sie kommen von YouTube, aber über
**`www.youtube-nocookie.com`** — den erweiterten Datenschutzmodus. Der setzt
beim bloßen Laden keine Cookies und beginnt erst mit dem Abspielen zu
protokollieren. Ein Aufruf bei Google Ireland Ltd. bleibt es trotzdem, mit
Übertragung der IP-Adresse; ganz ohne Kontakt geht es nur ohne Film.

Es gilt dieselbe Vorsichtsregel wie bei Lumi: Der Rahmen wird leer
ausgeliefert und trägt nur einen Knopf, die Adresse wird erst beim Klick
gesetzt, `referrerpolicy="no-referrer"` ist gesetzt. Wer den Kontakt ganz
vermeiden will, lässt diese 24 Videos aus. Der Beobachtungsauftrag darüber
ist bewusst am Vorgang formuliert und nicht am Film („Beschreibe, was mit der
Seifenblase geschieht"), lässt sich also am Demonstrationsversuch im Fachraum
genauso stellen — vorausgesetzt, es wird derselbe Versuch gezeigt.

`frame-src` nennt `www.youtube-nocookie.com` seither ausdrücklich, auf allen
Seiten identisch.

### 1.2c Gekaufte Kopiervorlagen (Eduki) — bewusst außerhalb

Zu 52 der 76 Einheiten gibt es passendes Material aus dem Eduki-Bestand der
Lehrkraft. Es liegt **nicht** im Projekt und darf auch nicht hinein.

Der Grund ist die Lizenz, nicht der Datenschutz: Eduki-Material ist gekauft
und für den Einsatz in der eigenen Lerngruppe lizenziert, nicht für die
Weitergabe. Dieses Projekt ist für GitHub Pages gebaut — was im Repository
liegt, ist nach dem nächsten Push öffentlich abrufbar. Eine Kopie nach
`units/` wäre deshalb keine Einbindung, sondern eine Veröffentlichung.

Eingebunden ist stattdessen der Verweis: Das Lehrer-Dashboard zeigt unter
„Kopiervorlagen zur Einheit", welches Paket zu welcher Einheit gehört, für
welche Niveaustufe es taugt und worauf beim Einsatz zu achten ist. Gedruckt
wird aus `Eduki/Chemie/Schüler/` auf dem Rechner der Lehrkraft. Die Liste
selbst (`dashboard/eduki-material.json`) enthält nur Titel, Einheit, Stufe
und einen Hinweissatz — Inhalte stehen nicht darin.

Die Schüleransicht kennt diese Liste nicht: Das Offlinepaket enthält das
Dashboard nicht, also lädt sie kein Schülergerät. Auf dem Rechner der
Lehrkraft legt der Fetch-Handler sie nach dem ersten Öffnen im Laufzeitcache
ab — wie jede andere abgerufene Datei des Dashboards auch.

### 1.3 Im Offlinecache

Nur die Programm- und Aufgabendateien des Projekts. Keine personenbezogenen
Daten. Die Eduki-Liste des Dashboards gehört ausdrücklich nicht dazu.

## 2 · Wer was sehen darf

| Rolle | Zugriff | technisch durchgesetzt durch |
|---|---|---|
| Schülerin/Schüler | schreibt nur für sich, liest nichts | kurzlebiges Sitzungstoken (`x-chemie710-token`), serverseitig geprüft |
| Lehrkraft | Dashboard, nur nach Freigabe | Eintrag in `chemie710_teachers` oder Claim `role = teacher` |
| Administration | Datenbankzugang | Supabase-Projektrechte |

**Zwei Änderungen gegenüber dem ersten Entwurf, beide sicherheitsrelevant:**

1. Nicht mehr jeder angemeldete Supabase-Nutzer ist Lehrkraft. Freigeschaltet
   wird einzeln:

   ```sql
   select public.chemie710_lehrkraft_freischalten('lehrerin@schule.de');
   ```

   **Solange die Liste leer ist, sieht niemand Dashboarddaten.** Das ist der
   beabsichtigte Ausgangszustand.

2. Die Anwendung kann nicht mehr im Namen beliebiger Kinder schreiben. Die
   Anmeldung stellt ein Token aus (`chemie710_student_anmelden`), das höchstens
   24 Stunden gilt und nur als Hash gespeichert wird. Beim Abmelden wird es
   sofort entwertet.

Die Regeln stehen in `supabase/setup.sql`. **Vor dem Regelbetrieb prüfen, dass
die Policies wirklich greifen** — ein Dashboard ohne Anmeldung wäre ein
Datenleck, kein Komfortmerkmal.

## 3 · Aufbewahrung und Löschung

| Daten | Frist | Begründung |
|---|---|---|
| Rohereignisse `chemie710_events` | **90 Tage** | Rückmeldung im Unterricht braucht Wochen, nicht Jahre |
| `chemie710_progress` | **1 Schuljahr** | Fortschritt über die Einheiten hinweg |
| `chemie710_students` | bis zum Verlassen der Lerngruppe | Zuordnung der Anmeldung |
| Bearbeitungsstand auf dem Gerät | 45 Tage | automatisch in `store.js` |

Die Fristen setzt `supabase/setup.sql` als Funktion `chemie710_aufraeumen()` um.
Das Skript richtet den wöchentlichen Lauf **selbst ein**, sobald `pg_cron` im
Projekt verfügbar ist (sonntags 03:17 UTC, Auftrag `chemie710-aufraeumen`). Ist
die Erweiterung nicht vorhanden, meldet das Skript das beim Ausführen und der
Aufruf bleibt ein Handgriff:

```sql
-- Prüfen, ob der Auftrag läuft
select jobname, schedule, active from cron.job where jobname = 'chemie710-aufraeumen';

-- Ersatzweise von Hand, wöchentlich
select public.chemie710_aufraeumen();
```

Ohne diesen Lauf löscht niemand etwas — das ist der häufigste stille Fehler
bei Aufbewahrungsfristen. Seit V29 muss man dafür nicht mehr nachsehen: Jeder
Lauf schreibt eine Zeile nach `chemie710_wartung_laeufe`, und das Dashboard
zeigt unter „Betrieb und Datenpflege" eine Warnung, sobald der letzte
erfolgreiche Lauf über zehn Tage zurückliegt.

```sql
-- Zustand in einer Zeile
select * from public.chemie710_wartung_status();
```

## 4 · Auskunft, Export und Löschung einzelner Personen

- **Auskunft/Export:** `select * from chemie710_events where student_id = …`
  zusammen mit `chemie710_progress`. Ergebnis als CSV aushändigen.
- **Löschung einer Person:** `select chemie710_person_loeschen('<student_id>');`
  Die Funktion entfernt Ereignisse, Fortschritt und den Eintrag in der
  Freigabeliste.
- **Gerät:** zusätzlich lokal die Browserdaten löschen — der Server erreicht
  den localStorage nicht.

## 5 · Was noch zu klären ist

- [ ] Einwilligung beziehungsweise Rechtsgrundlage schriftlich festhalten
- [ ] Auftragsverarbeitungsvertrag mit dem Supabase-Betreiber prüfen
- [ ] Serverstandort und Drittlandübermittlung klären
- [ ] Eintrag im Verarbeitungsverzeichnis der Schule
- [ ] Information an Eltern und Lernende in verständlicher Sprache
- [ ] `chemie710_aufraeumen()`: prüfen, ob der pg_cron-Auftrag wirklich läuft
      (seit V29 zeigt das Dashboard es an)
- [ ] mindestens eine Lehrkraft freischalten — sonst bleibt das Dashboard leer
- [ ] Lehrkraftliste regelmäßig durchsehen:
      `select * from public.chemie710_lehrkraft_uebersicht();` — Konten mit
      `pruefen = true` waren ein halbes Jahr nicht angemeldet
- [ ] Migration zuerst in einem Testprojekt fahren (siehe `MIGRATION.md`)
- [ ] Prüfen, ob pseudonyme Kürzel statt Klarnamen genügen
- [ ] **Lumi (V31):** Auftragsverarbeitung für `app.lumi.education` klären.
      Erst danach die Videos im Unterricht einsetzen — der Rahmen lädt zwar
      nur auf Klick, aber der Klick ist Teil des Unterrichts und damit nicht
      wirklich freiwillig.
- [ ] **Warm-up-Bewertung (V31):** Die Verwendung der Warm-up-Ergebnisse für
      die Notengebung gehört in die Leistungsbewertungskonzeption der
      Fachkonferenz und muss Lernenden und Eltern **vorher** bekannt sein.
      Ohne diesen Beschluss den Bewertungsmodus nicht einschalten: Die Läufe
      werden dann als Übung geführt und zählen nicht.
- [ ] **Bewertungsart je Person (V31):** Wird zwischen Einzelnoten und
      Lernfortschritt unterschieden, ist das eine pädagogische Entscheidung
      mit Begründungspflicht. Die Anwendung protokolliert nur die Einstellung,
      nicht den Grund — der gehört in die Schülerakte, nicht hierher.

Solange diese Punkte offen sind, gehört das Tracking **ausgeschaltet**
(`enabled: false`). Die Anwendung funktioniert vollständig ohne es; es fehlt
dann allein das Lehrerdashboard.

# -*- coding: utf-8 -*-
"""Erzeugt VIDEO_PRUEFBERICHT.md aus den Einheiten und den Transkripten.

Der Bericht haelt fest, was bei der Umstellung auf die mit Lumi angereicherten
Fassungen inhaltlich geprueft wurde - und mit welchem Ergebnis. Er ist ein
Rechenschaftsbericht, kein Werbetext: Wo die Pruefung eine Schwaeche gefunden
hat, steht sie drin, auch wenn sie geblieben ist.

Aufruf:  python werkzeuge/videobericht_bauen.py
"""
import io
import json
import os
import re
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HIER)
TRANS = os.path.abspath(os.path.join(
    PROJ, "..", "..", "VideoTranskripte", "TRANSSKRIPTE_CHEMIE_VIDEOS"))

# Die Befunde der Sichtung. Jede Zeile ist eine Entscheidung, die sich am
# Transkript belegen laesst - die Kennzahlen haben nur die Kandidaten
# eingegrenzt.
BEFUNDE = [
    ("fc-02", "Die blaue Flamme — Experiment zur Brennerflamme", "entfernt",
     "Weder eine mit Lumi angereicherte Fassung noch ein Transkript vorhanden. "
     "Der verbliebene Gasbrennerfilm deckt den Lernstoff der Einheit ab."),
    ("sz-05", "Flammenfärbung — Nachweis von Alkali- und Erdalkalimetallen", "entfernt",
     "Weder eine angereicherte Fassung noch ein Transkript vorhanden."),
    ("al-06", "Alkoholherstellung durch säurekatalysierte Hydratisierung", "entfernt",
     "Das Transkript behandelt die Hydratisierung von Alkenen und nennt die "
     "Grignard-Reaktion. Das ist Sekundarstufe II und hat mit Gärung, "
     "Destillation und Promillerechnung — dem Thema der Einheit — nichts zu tun. "
     "Auch auf dem Vertiefungsweg der 10. Klasse wäre es fehl am Platz."),

    ("fc-08", "Reaktionsgleichungen ausgleichen — Grundlagen", "auf Lernweg C",
     "Das Video arbeitet mit Summenformeln, Indizes und Koeffizienten "
     "(Fe₂O₃ + CO). Die Einheit steht in Klasse 7 und behandelt Wortgleichungen; "
     "Formelgleichungen kommen erst in WA-03 (Klasse 8). Für den Basis- und "
     "Standardweg ist das zu früh, als Ausblick auf dem Vertiefungsweg tragbar."),
    ("ps-06", "Das Massenspektrometer — wie Atommassen gemessen werden", "auf Lernweg C",
     "Inhaltlich genau richtig — so werden Atommassen tatsächlich bestimmt. "
     "Sprachlich und begrifflich (Ionisierung, Ablenkung im Magnetfeld, Detektor) "
     "liegt es deutlich über dem, was die Einheit in Klasse 7 verlangt."),
    ("me-07", "Rost mit Zitronensäure entfernen — die Theorie", "auf Lernweg C",
     "Die Erklärung läuft über Komplexbildung (24 Nennungen im Transkript). "
     "Das Experiment passt zur Einheit, die Begründung liegt über Klasse 8."),
    ("os-04", "Rost mit Zitronensäure entfernen — die Theorie", "auf Lernweg C",
     "Dasselbe Video, dieselbe Begründung. In OS-04 (Fruchtsäuren) ist der "
     "Bezug enger, das Niveau bleibt aber Vertiefung."),
    ("sl-04", "Autoprotolyse des Wassers — pH- und pOH-Wert", "auf Lernweg C",
     "pOH-Wert und Ionenprodukt gehen über „Laugen enthalten Hydroxid-Ionen“ "
     "hinaus. Für den Vertiefungsweg ist es die passende Fortsetzung."),
    ("sl-05", "Ammoniak — was ist das?", "auf Lernweg C",
     "Ammoniak ist kein Oxid und damit streng genommen die Ausnahme zur Regel "
     "der Einheit (Nichtmetalloxide → Säuren, Metalloxide → Laugen). Als "
     "Erweiterung auf dem Vertiefungsweg sinnvoll, als Regelbeispiel irreführend. "
     "Das Transkript beginnt zudem mit Natriumelektrid — reine Neugierchemie."),
    ("kw-07", "Alkene und Alkine in der organischen Chemie", "auf Lernweg C",
     "sp²-Hybridisierung, cis/trans-Isomerie, Carbokationen. Der zweite Film "
     "der Einheit („Alkene, Alkine und Co.“) deckt dasselbe Thema auf dem "
     "Niveau der 9. Klasse ab und trägt jetzt den Basisweg."),
    ("al-03", "Organische Sauerstoffverbindungen im Überblick", "auf Lernweg C",
     "Eine Übersicht über Ester, Carbonsäuren und Aldehyde — Stoff, der in "
     "AL-03 (Struktur und Eigenschaften der Alkohole) noch nicht dran ist. "
     "Als Vorausschau auf dem Vertiefungsweg brauchbar."),
    ("os-03", "Chemische Reaktionen der Carbonylgruppe", "auf Lernweg C",
     "Das Video behandelt Aldehyde, Ketone und Zucker; die Einheit behandelt "
     "Struktur, Eigenschaften und Salze der Carbonsäuren. Die Nähe reicht für "
     "den Vertiefungsweg, für den Basisweg trägt es am Thema vorbei."),

    ("kw-06", "Wie wird Erdöl gefördert?", "bleibt, mit Vorbehalt",
     "Der Film handelt von der Gewinnung, nicht von der Verbrennung. Er trägt "
     "den Einstieg der Einheit (wozu verbrennen wir Kohlenwasserstoffe, was "
     "folgt daraus für das Klima) und steht deshalb auf dem Basisweg. Die "
     "Verbrennungsgleichung selbst kommt aus dem zweiten Film der Einheit. "
     "Wer die Einheit später umbaut, sollte hier ein Video zur vollständigen "
     "und unvollständigen Verbrennung suchen."),
]

RANG = {"A": 0, "B": 1, "C": 2}


def laufzeiten():
    aus = {}
    for f in os.listdir(TRANS):
        m = re.search(r"\[([A-Za-z0-9_-]{11})\]", f)
        if m:
            aus[m.group(1)] = True
    return aus


def minsek(s):
    s = int(s or 0)
    return f"{s // 60}:{s % 60:02d}"


def main():
    idx = json.load(io.open(os.path.join(PROJ, "units", "index.json"), encoding="utf-8"))
    hat_transkript = laufzeiten()

    zeilen, gesamt, gesamt_s = [], 0, 0
    proStufe = {"A": 0, "B": 0, "C": 0}
    for b in idx["bereiche"]:
        zeilen.append(f'\n### {b["code"].upper()} · {b["title"]} · Klasse {b["klasse"]}\n')
        zeilen.append("| Einheit | Video | Quelle | ab Lernweg | Länge | Transkript |")
        zeilen.append("|---|---|---|---|---|---|")
        for e in b["einheiten"]:
            d = json.load(io.open(os.path.join(PROJ, "units", b["code"], e["id"],
                                               "tasks.json"), encoding="utf-8"))
            vids = sorted(d.get("videos", []), key=lambda v: RANG.get(v.get("stufe", "A"), 0))
            for i, v in enumerate(vids):
                gesamt += 1
                gesamt_s += v.get("dauer_s") or 0
                proStufe[v.get("stufe", "A")] = proStufe.get(v.get("stufe", "A"), 0) + 1
                kennung = v["url"].rsplit("v=", 1)[-1]
                zeilen.append(
                    f'| {e["id"].upper() if i == 0 else ""} | {v["titel"]} | {v["quelle"]} | '
                    f'{v.get("stufe", "A")} | {minsek(v.get("dauer_s"))} | '
                    f'{"ja" if kennung in hat_transkript else "—"} |')

    kopf = f"""# Prüfbericht: Lernvideos mit Lumi-Lernaktivitäten

Stand der Umstellung von verlinkten YouTube-Videos auf die mit Lumi
angereicherten, eingebetteten Fassungen — und was die Prüfung gegen die
Transkripte ergeben hat.

## Was geprüft wurde

Grundlage sind die {len(hat_transkript)} deutschen Transkripte in
`VideoTranskripte/TRANSSKRIPTE_CHEMIE_VIDEOS` und die Zuordnungstabelle
`lernvideos_chemie_mit_lumi_links.csv`. Drei Fragen, drei Verfahren:

1. **Gibt es zu jedem eingebundenen Video eine angereicherte Fassung?**
   Abgleich über die YouTube-Kennung. Ergebnis: {gesamt} von ursprünglich 171
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
"""
    for einheit, video, aktion, grund in BEFUNDE:
        kopf += f"| {einheit.upper()} | {video} | **{aktion}** | {grund} |\n"

    kopf += f"""
Alle übrigen Verweise wurden geprüft und für passend befunden. Auffällig
niedrige Wortschatzquoten ohne inhaltlichen Befund — etwa bei
Übungsvideos zur Nomenklatur, die naturgemäß den Wortschatz der
Nomenklatureinheit tragen und nicht den der Anwendungseinheit — sind
bewusst nicht als Mangel gewertet.

## Bestand

- **{gesamt} eingebettete Videos** in 76 Einheiten
- Verteilung nach Mindestlernweg: **A {proStufe['A']} · B {proStufe['B']} · C {proStufe['C']}**
- Gesamtlaufzeit: **{gesamt_s // 3600} h {(gesamt_s % 3600) // 60} min**
- Jede Einheit hat mindestens ein Video auf Lernweg A — `werkzeuge/pruefen.js`
  bricht ab, wenn das einmal nicht mehr stimmt.

## Vollständige Zuordnung
"""
    ziel = os.path.join(PROJ, "VIDEO_PRUEFBERICHT.md")
    io.open(ziel, "w", encoding="utf-8").write(kopf + "\n".join(zeilen) + "\n")
    print(f"VIDEO_PRUEFBERICHT.md geschrieben: {gesamt} Videos, "
          f"A {proStufe['A']} / B {proStufe['B']} / C {proStufe['C']}")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()

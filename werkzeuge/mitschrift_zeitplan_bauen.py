# -*- coding: utf-8 -*-
"""Erzeugt je Einheit den Mitschriftteil und den 45-Minuten-Plan.

Warum ueberhaupt handschriftlich?

Am Ende einer Unterrichtsreihe soll jede und jeder ein vollstaendiges Skript
auf Papier haben - nicht als Zusatz, sondern als das eigentliche Ergebnis.
Wer abschreibt, liest zweimal und formuliert einmal selbst; das ist der
Unterschied zwischen "angesehen" und "gelernt". Die Anwendung ersetzt das
Heft also nicht, sie diktiert es.

Gekuerzt wird nach Lernweg, nicht nach Beliebigkeit:

  A  Ueberschrift, Merksatz, vier Fachwoerter, ein durchgerechnetes Beispiel.
  B  zusaetzlich die Erklaerung in eigenen Worten und die Merksaetze der
     Formelkarte.
  C  zusaetzlich alle Formeln, der volle Wortspeicher und eine Begruendung
     zur Koennensaussage.


Warum hier nur VERWEISE stehen und kein Text

Der Hefteintrag besteht vollstaendig aus Inhalten, die in derselben Datei
schon stehen: Merksatz, Wortspeicher, Beispiel, Formelkarte, Koennensaussage.
Sie ein zweites Mal auszuschreiben kostete rund eine halbe Megabyte im
Offlinepaket - und die zweite Fassung waere ab der ersten Aenderung an der
Lernkarte falsch, ohne dass es jemand merkt.

Deshalb steht hier je Punkt nur, WORAUS er sich speist ("art") und WIE VIEL
davon ("anzahl"). Den Text setzt engine.js beim Anzeigen zusammen und zaehlt
dabei auch gleich den Umfang im Heft aus. Aus demselben Grund enthaelt der
Zeitplan nur Minuten und keine Phasennamen: Die sind fuer alle 76 Einheiten
dieselben.


Der 45-Minuten-Plan

Vorgabe: Eine Einheit dauert ohne das Warm-up etwa 45 Minuten. Die Videozeit
kommt aus der tatsaechlichen Laufzeit (Feld dauer_s), zuzueglich eines
Zuschlags fuer die Zwischenfragen der Lumi-Fassung. Die Aufgabenzeit ist der
Rest - so bleibt die Summe genau 45 Minuten, und wenn der Rest zu klein
wird, meldet das Werkzeug es, statt es zu verschweigen.

Aufruf:  python werkzeuge/mitschrift_zeitplan_bauen.py [--trocken]
"""
import argparse
import io
import json
import math
import os
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HIER)

GESAMT_MIN = 45
LESEN_MIN = {"A": 5, "B": 6, "C": 7}
MITSCHRIFT_MIN = {"A": 5, "B": 6, "C": 8}
BLATT_MIN = {"A": 6, "B": 6, "C": 6}
AUFGABEN_MIN_MINDEST = 12
# Zuschlag fuer die Lernaktivitaeten im Video: Anhalten, antworten, weiter.
LUMI_ZUSCHLAG = 1.45
VIDEO_MAX = {"A": 10, "B": 11, "C": 12}

RANG = {"A": 0, "B": 1, "C": 2}

# Wie viel Wortspeicher und wie viele Erklaerungsabsaetze je Lernweg.
# 0 heisst "alles".
FACHWOERTER = {"A": 4, "B": 6, "C": 0}
ABSAETZE = {"B": 2, "C": 3}


def video_fuer(videos, pfad):
    """Das Video, das auf diesem Lernweg gezeigt wird: das speziellste,
    dessen Mindeststufe den Lernweg nicht uebersteigt."""
    passend = [v for v in videos if RANG.get(v.get("stufe", "A"), 0) <= RANG[pfad]]
    if not passend:
        return None
    return max(passend, key=lambda v: RANG.get(v.get("stufe", "A"), 0))


def punkt(art, anzahl=None):
    """Ein Punkt ist ein Verweis, sonst nichts. Auch der Umfang im Heft steht
    nicht hier: engine.js zaehlt ihn aus dem fertig zusammengesetzten Text.
    Eine gespeicherte Zeilenzahl waere ab der ersten Aenderung an der
    Lernkarte falsch."""
    return {"art": art, "anzahl": anzahl} if anzahl else {"art": art}


def mitschrift_bauen(d):
    """Baut die Verweisliste je Lernweg."""
    ws = d.get("wortspeicher", []) or []
    formeln = (d.get("formelkarte") or {}).get("formeln") or []
    saetze = (d.get("formelkarte") or {}).get("saetze") or []
    out = {}

    for pfad in "ABC":
        lk = (d.get("lernkarten") or {}).get(pfad) or {}
        punkte = []

        if lk.get("merke"):
            punkte.append(punkt("merksatz"))

        if ws:
            punkte.append(punkt("fachwoerter", FACHWOERTER[pfad] or None))

        bsp = lk.get("beispiel") or {}
        if bsp.get("aufgabe") or bsp.get("schritte"):
            punkte.append(punkt("beispiel"))

        if pfad in ("B", "C"):
            if lk.get("erklaerung"):
                punkte.append(punkt("eigene_worte", ABSAETZE[pfad]))
            if saetze:
                punkte.append(punkt("regel", 2 if pfad == "B" else None))

        if pfad == "C" and formeln:
            punkte.append(punkt("formeln"))

        if (d.get("can_do") or {}).get(pfad):
            punkte.append(punkt("pruefsatz"))

        out[pfad] = {"punkte": punkte}
    return out


def zeitplan_bauen(d):
    plan = {"gesamt_min": GESAMT_MIN,
            "_hinweis": "Ohne Warm-up. Die Videozeit ist die tatsaechliche "
                        "Laufzeit zuzueglich Zuschlag fuer die Zwischenfragen."}
    warnungen = []
    for pfad in "ABC":
        v = video_fuer(d.get("videos", []), pfad)
        dauer = (v or {}).get("dauer_s") or 0
        video = min(VIDEO_MAX[pfad], max(4, math.ceil(dauer * LUMI_ZUSCHLAG / 60))) if dauer else 0
        lesen = LESEN_MIN[pfad]
        mitschrift = MITSCHRIFT_MIN[pfad]
        blatt = BLATT_MIN[pfad]
        aufgaben = GESAMT_MIN - (lesen + video + mitschrift + blatt)
        while aufgaben < AUFGABEN_MIN_MINDEST and video > 4:
            video -= 1
            aufgaben += 1
        while aufgaben < AUFGABEN_MIN_MINDEST and mitschrift > 4:
            mitschrift -= 1
            aufgaben += 1
        if aufgaben < AUFGABEN_MIN_MINDEST:
            warnungen.append(f'{d["unit"]} {pfad}: nur {aufgaben} min fuer die Aufgaben')

        # Nur die Minuten. Die Beschriftung der Phasen ist fuer alle 76
        # Einheiten dieselbe und steht deshalb in engine.js, nicht 228-mal
        # in den Daten - das waren allein 90 KB im Offlinepaket.
        schritte = {"lernkarte": lesen}
        if video:
            schritte["video"] = video
        schritte["aufgaben"] = aufgaben
        schritte["mitschrift"] = mitschrift
        schritte["blatt"] = blatt
        plan[pfad] = schritte
        summe = sum(schritte.values())
        if summe != GESAMT_MIN:
            warnungen.append(f'{d["unit"]} {pfad}: Summe {summe} statt {GESAMT_MIN}')
    return plan, warnungen


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--trocken", action="store_true")
    args = ap.parse_args()

    idx = json.load(io.open(os.path.join(PROJ, "units", "index.json"), encoding="utf-8"))
    geaendert, alleWarnungen = 0, []
    for bereich in idx["bereiche"]:
        for e in bereich["einheiten"]:
            pfad = os.path.join(PROJ, "units", bereich["code"], e["id"], "tasks.json")
            d = json.load(io.open(pfad, encoding="utf-8"))
            alt = json.dumps(d, ensure_ascii=False, sort_keys=True)
            d["mitschrift"] = mitschrift_bauen(d)
            d["zeitplan"], warn = zeitplan_bauen(d)
            alleWarnungen += warn
            if json.dumps(d, ensure_ascii=False, sort_keys=True) != alt:
                geaendert += 1
                if not args.trocken:
                    io.open(pfad, "w", encoding="utf-8").write(
                        json.dumps(d, ensure_ascii=False, indent=2) + "\n")

    print(f"{geaendert} Einheiten geaendert" + (" (trocken)" if args.trocken else ""))
    if alleWarnungen:
        print(f"{len(alleWarnungen)} Hinweise:")
        for w in alleWarnungen:
            print("  " + w)
    else:
        print("Alle Zeitplaene ergeben genau 45 Minuten.")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()

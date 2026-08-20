# -*- coding: utf-8 -*-
"""Sucht zu jeder Einheit die passende Seite im Lehrbuch.

Das Lehrbuch liegt als Scan mit Texterkennung vor (232 Seiten). Die
Erkennung ist stellenweise schlecht - "Schwefelsaure" statt
"Schwefelsäure", "Stote" statt "Stoffe". Fuer eine Volltextsuche reicht
das trotzdem, wenn man drei Dinge beachtet:

  1. Umlaute und ss/ß werden vor dem Vergleich vereinheitlicht.
  2. Gesucht wird mit mehreren Begriffen je Einheit; ein einzelner Treffer
     entscheidet nichts.
  3. Ausgegeben werden die drei besten Seiten mit ihrer Punktzahl, damit
     ein Mensch die Wahl nachvollziehen und korrigieren kann.

Gedruckte Seitenzahlen stehen NICHT in der Textebene - die Fusszeilen sind
bei der Erkennung verlorengegangen. Verwiesen wird deshalb auf die Seite
der PDF-Datei. Das ist eindeutig und nachpruefbar; wer die Datei oeffnet,
findet die Stelle. Eine erfundene Buchseitenzahl waere schlimmer.

Aufruf:  python werkzeuge/lehrbuchseiten_finden.py
"""
import io
import json
import os
import re
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HIER)
BUCH = os.path.abspath(os.path.join(PROJ, "..", "Lehrbuch_Chemie.pdf"))
AUS = os.path.join(HIER, "lehrbuchseiten.json")


def normieren(t):
    t = t.lower()
    for a, b in (("ä", "a"), ("ö", "o"), ("ü", "u"), ("ß", "ss"),
                 ("á", "a"), ("é", "e"), ("è", "e")):
        t = t.replace(a, b)
    return re.sub(r"[^a-z0-9 ]+", " ", t)


# Der Rueckteil des Buches - Loesungen, Glossar, Abbildungsnachweis -
# enthaelt jedes Fachwort mehrfach und wuerde jede Suche gewinnen.
# STRATEGIEN (201-206) sind Methodenseiten, keine Themenseiten.
ERSTE_INHALTSSEITE = 6
LETZTE_INHALTSSEITE = 200


def begriffe_der_einheit(d):
    """Suchbegriffe: Titel, Wortspeicher und die Merksaetze der Lernkarten.
    Ohne Artikel und ohne zu kurze Woerter - kurze Woerter treffen im
    OCR-Rauschen zu oft."""
    roh = [d["title"]] + list(d.get("wortspeicher", []))
    roh += [(d.get("lernkarten", {}).get(s, {}) or {}).get("merke", "") for s in "ABC"]
    roh += list((d.get("worterklaerungen") or {}).keys())
    out = set()
    for w in roh:
        w = re.sub(r"^(der|die|das)\s+", "", w.strip(), flags=re.I)
        for teil in re.split(r"[ ,;:()/–—-]+", w):
            teil = normieren(teil).strip()
            if len(teil) >= 6:
                out.add(teil)
    return sorted(out)


def main():
    if not os.path.exists(BUCH):
        raise SystemExit("Lehrbuch nicht gefunden: " + BUCH)
    import fitz

    buch = fitz.open(BUCH)
    seiten = [normieren(" ".join(buch[i].get_text().split()))
              for i in range(buch.page_count)]
    print("Lehrbuch gelesen: %d Seiten, %d davon mit Text"
          % (len(seiten), sum(1 for s in seiten if len(s) > 80)))

    idx = json.load(io.open(os.path.join(PROJ, "units", "index.json"), encoding="utf-8"))
    ergebnis, ohne = {}, []
    for b in idx["bereiche"]:
        for e in b["einheiten"]:
            pfad = os.path.join(PROJ, "units", b["code"], e["id"], "tasks.json")
            d = json.load(io.open(pfad, encoding="utf-8"))
            begriffe = begriffe_der_einheit(d)

            punkte = []
            for nr, text in enumerate(seiten, 1):
                if len(text) < 80 or not (ERSTE_INHALTSSEITE <= nr <= LETZTE_INHALTSSEITE):
                    continue
                treffer = [w for w in begriffe if w in text]
                if not treffer:
                    continue
                # Ein Begriff, der auf vielen Seiten steht, sagt wenig.
                wert = sum(1.0 / (1 + sum(1 for s in seiten if w in s) / 12.0)
                           for w in treffer)
                punkte.append((round(wert, 2), nr, treffer[:6]))
            punkte.sort(reverse=True)
            if not punkte or punkte[0][0] < 1.0:
                ohne.append(e["id"])
                ergebnis[e["id"]] = None
                continue
            ergebnis[e["id"]] = [{"seite": p[1], "punkte": p[0], "treffer": p[2]}
                                 for p in punkte[:3]]

    json.dump(ergebnis, io.open(AUS, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    print("geschrieben:", AUS)
    print()
    for uid, treffer in ergebnis.items():
        if not treffer:
            print("  %-7s —  keine Seite sicher zuzuordnen" % uid)
            continue
        best = treffer[0]
        print("  %-7s S.%-4d (%.1f)  %s" % (uid, best["seite"], best["punkte"],
                                            ", ".join(best["treffer"])))
    print()
    print("%d von %d Einheiten ohne sichere Seite" % (len(ohne), len(ergebnis)))


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()

# -*- coding: utf-8 -*-
"""Traegt die Unterrichtsreihen und ihr Grundwissen in spiral/plan.json nach.

Bis V30 zog das Warm-up aus allen acht Wissenskategorien, gleich in welcher
Reihe die Klasse gerade steckte. In der zweiten Woche des siebten Jahrgangs
kamen deshalb Aufgaben zur organischen Chemie vor - Stoff aus Klasse 10, den
niemand haben konnte. Das ist kein Wiederholen, das ist Raten.

Ab V31 gilt: Wiederholt wird das Grundwissen der zurueckliegenden Reihen,
und zwar aller. Die neue Angabe "reihen" haelt deren Reihenfolge fest, und
"grundwissen" sagt je Reihe, welche Kategorien dort erarbeitet werden. Was
noch nicht dran war, kommt nicht dran.

Die Zuordnung ist eine fachdidaktische Entscheidung und steht deshalb hier
ausgeschrieben - nicht als Rechnung aus der Verzahnungstabelle. Die naemlich
sagt, was eine Einheit BRAUCHT; hier geht es darum, was eine Reihe LIEFERT.

Aufruf:  python werkzeuge/warmup_reihen_bauen.py
"""
import io
import json
import os
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HIER)

# Reihe -> Kategorien, die dort zum ersten Mal tragfaehig erarbeitet werden.
GRUNDWISSEN = {
    "fc": ["W-STOF", "W-EINH"],
    "ps": ["W-TEIL", "W-SYMB"],
    "ga": ["W-GLEI"],
    "wa": ["W-GLEI", "W-TEIL"],
    "sz": ["W-SYMB", "W-LOES"],
    "me": ["W-GLEI", "W-RECH"],
    "qb": ["W-RECH", "W-EINH"],
    "sl": ["W-LOES"],
    "kw": ["W-ORG"],
    "al": ["W-ORG"],
    "os": ["W-ORG"],
    "es": ["W-ORG"],
}


def main():
    idx = json.load(io.open(os.path.join(PROJ, "units", "index.json"), encoding="utf-8"))
    planpfad = os.path.join(PROJ, "spiral", "plan.json")
    plan = json.load(io.open(planpfad, encoding="utf-8"))

    reihen = []
    for i, b in enumerate(idx["bereiche"]):
        code = b["code"]
        if code not in GRUNDWISSEN:
            raise SystemExit(f"Reihe {code} hat kein Grundwissen hinterlegt.")
        reihen.append({
            "code": code,
            "titel": b["title"],
            "klasse": b["klasse"],
            "nummer": i + 1,
            "einheiten": [e["id"] for e in b["einheiten"]],
            "grundwissen": GRUNDWISSEN[code],
        })

    plan["_warmup"] = (
        "Das Warm-up wiederholt das Grundwissen ALLER zurueckliegenden Reihen. "
        "Massgeblich ist die Reihe der gerade bearbeiteten Einheit: Alles, was in "
        "frueheren Reihen erarbeitet wurde, ist Wiederholungsstoff; was noch nicht "
        "dran war, kommt nicht vor. In der ersten Reihe gibt es nichts Frueheres - "
        "dort wiederholt das Warm-up innerhalb der eigenen Reihe."
    )
    plan["reihen"] = reihen

    # Reihenfolge der Schluessel stabil halten: erst die Steuerangaben,
    # dann die grossen Tabellen.
    ordnung = ["_hinweis", "_warmup", "kategorien", "reihen", "geplant",
               "intervalle_tage", "verzahnung", "fehlerprofil"]
    neu = {k: plan[k] for k in ordnung if k in plan}
    for k, v in plan.items():
        neu.setdefault(k, v)

    io.open(planpfad, "w", encoding="utf-8").write(
        json.dumps(neu, ensure_ascii=False, indent=2) + "\n")

    print(f"{len(reihen)} Unterrichtsreihen eingetragen.")
    kumuliert = set()
    for r in reihen:
        vorher = sorted(kumuliert) or ["(nichts — erste Reihe)"]
        print(f'  {r["nummer"]:2d}. {r["code"]} Kl.{r["klasse"]} {r["titel"][:32]:34s} '
              f'wiederholt: {", ".join(vorher)}')
        kumuliert.update(r["grundwissen"])


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()

# -*- coding: utf-8 -*-
"""Gemeinsames Grundmodul für alle Bereichsdateien einheiten_*.py.

Hier stehen die Konstruktoren für Lernkarte, Aufgabe und Fehlvorstellung
sowie das Schreiben der tasks.json. Jede Bereichsdatei importiert von hier
und enthält danach nur noch Fachinhalt — nicht noch einmal dieselben
zwanzig Zeilen Gerüst.
"""
import io, json, os

WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def karte(titel, hin, erkl, merke, beispiel=None, visual=None, bild_oben=None):
    k = {"titel": titel, "hinfuehrung": hin, "erklaerung": erkl, "merke": merke}
    if beispiel:
        k["beispiel"] = beispiel
    if visual:
        k["visual"] = visual
    if bild_oben is not None:
        k["bild_oben"] = bild_oben
    return k


def fv(fid, wert, text, konzept=None, absatz=None):
    """Fehlvorstellung. `wert` ist die falsche Antwort — bei choice der
    Index, bei numeric die Zahl. Ohne diese Angabe kann die Engine den
    Denkfehler nicht erkennen und sagt nur „noch nicht richtig“."""
    d = {"id": fid, "value": wert, "feedback": text}
    if konzept:
        d["konzeptfehler"] = konzept
    if absatz is not None:
        d["verweis"] = {"absatz": absatz}
    return d


def aufgabe(aid, pfad, stufe, typ, prompt, **kw):
    a = {"id": aid, "path": pfad, "step": stufe, "type": typ, "prompt": prompt}
    a.update(kw)
    return a


def anim(name, stufe, **kw):
    v = {"type": "animation", "name": name, "stufe": stufe}
    v.update(kw)
    return v


def schreiben(bereich, einheiten, ueberschrift=None):
    if ueberschrift:
        print(ueberschrift)
    for e in einheiten:
        uid = e["unit"].lower()
        ordner = os.path.join(WURZEL, "units", bereich, uid)
        os.makedirs(ordner, exist_ok=True)
        with io.open(os.path.join(ordner, "tasks.json"), "w", encoding="utf-8", newline="\n") as f:
            json.dump(e, f, ensure_ascii=False, indent=2)
            f.write("\n")
        v = {}
        for t in e["tasks"]:
            v[t["path"]] = v.get(t["path"], 0) + 1
        marke = "  " if (v.get("A"), v.get("B"), v.get("C")) == (4, 6, 4) else "! "
        print(f"{marke}{e['unit']}  {len(e['tasks'])} Aufgaben  A/B/C = "
              f"{v.get('A', 0)}/{v.get('B', 0)}/{v.get('C', 0)}")

# -*- coding: utf-8 -*-
"""Spielt die mit Lumi angereicherten Videofassungen in die Einheiten ein.

Was diese Datei tut und warum sie existiert:

Die Erklaervideos lagen bisher als reine YouTube-Verweise in den tasks.json.
Sie fuehrten aus der Anwendung heraus und waren blosses Zusehen. Ersetzt
werden sie durch die in Lumi mit Lernaktivitaeten angereicherten Fassungen -
dieselben Filme, aber mit Zwischenfragen im Video. Diese laufen eingebettet
in der Seite; die Lernenden verlassen die Anwendung nicht mehr.

Drei Angaben je Video kommen dazu:

  lumi      Die Adresse der angereicherten Fassung (zum Oeffnen im Tab,
            falls das Einbetten am Geraet scheitert).
  embed     Die Einbettadresse. Nur sie wird in den Rahmen geladen.
  dauer_s   Die tatsaechliche Laufzeit, aus der letzten Zeitmarke des
            Transkripts. Ohne sie laesst sich kein 45-Minuten-Plan rechnen,
            der stimmt.
  stufe     Ab welchem Lernweg das Video sinnvoll ist (A, B oder C). Ersetzt
            das bisherige Feld "pfad", das ein Video auf genau einen Lernweg
            einsperrte. Die Zuordnung entsteht aus dem Schwierigkeitsindex
            der Transkripte, korrigiert um die Befunde der inhaltlichen
            Pruefung (siehe VIDEO_PRUEFBERICHT.md).

Aufruf:  python werkzeuge/videos_lumi_einspielen.py [--trocken]
"""
import argparse
import csv
import io
import json
import os
import re
import sys

HIER = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HIER)
DATEN = os.path.abspath(os.path.join(PROJ, "..", "..", "VideoTranskripte"))
TRANS = os.path.join(DATEN, "TRANSSKRIPTE_CHEMIE_VIDEOS")
CSVD = os.path.join(DATEN, "lernvideos_chemie_mit_lumi_links.csv")

LUMI_RUN = re.compile(r"^https://app\.lumi\.education/run/[A-Za-z0-9_-]{4,32}$")
LUMI_EMBED = re.compile(r"^https://app\.lumi\.education/api/v1/run/[A-Za-z0-9_-]{4,32}/embed$")


# ------------------------------------------------------------------
# Befunde der inhaltlichen Pruefung gegen die Transkripte.
# Jeder Eintrag ist eine Entscheidung, keine Rechnung: Der Index sagt nur,
# wie schwer gesprochen wird - ob der Inhalt zur Einheit und zur Klassen-
# stufe gehoert, entscheidet die Sichtung des Transkripts.
# ------------------------------------------------------------------
ENTFERNEN = {
    # (Einheit, YouTube-Kennung): Begruendung
    ("fc-02", "WLSnLP5MhUU"):
        "Keine mit Lumi angereicherte Fassung vorhanden und kein Transkript; "
        "der Gasbrennerfilm der Einheit deckt den Lernstoff vollstaendig ab.",
    ("sz-05", "DvmpybyTWF8"):
        "Keine mit Lumi angereicherte Fassung vorhanden und kein Transkript.",
    ("al-06", "-u9Z7dl5Jek"):
        "Saeurekatalysierte Hydratisierung von Alkenen mit Grignard-Ausblick. "
        "Das ist Sekundarstufe II und hat mit Gaerung und Destillation - dem "
        "Thema der Einheit - nichts zu tun.",
}

STUFE_FEST = {
    # Einheit, Kennung -> Stufe (Mindestlernweg) mit Begruendung im Bericht
    ("fc-08", "4fwq_1q81v8"): "C",   # Indizes/Koeffizienten: Klasse 8, hier Klasse 7
    ("ps-06", "uErU_yQeGA0"): "C",   # Massenspektrometer
    ("me-07", "76VIa7wfXOA"): "C",   # Komplexbildung
    ("os-04", "76VIa7wfXOA"): "C",   # dieselbe Begruendung
    ("sl-04", "6L_vSyIGdMk"): "C",   # Autoprotolyse, pOH
    ("sl-05", "s1IPcb15JZQ"): "C",   # Ammoniak ist kein Oxid - Erweiterung
    ("kw-07", "9lJuCtlSBdY"): "C",   # sp2-Hybridisierung, cis/trans
    ("al-03", "wn5iOsH5H90"): "C",   # Uebersicht ueber alle Sauerstoffverbindungen
    ("os-03", "aotREnfrF_0"): "C",   # Carbonylchemie, nicht Carbonsaeuresalze
    ("kw-06", "TT31JjjXnVc"): "A",   # Erdoelgewinnung als Einstiegskontext
}


def srt_dauer(pfad):
    """Laufzeit in Sekunden aus der letzten Zeitmarke des Transkripts."""
    roh = io.open(pfad, encoding="utf-8", errors="replace").read()
    marken = re.findall(r"(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*"
                        r"(\d{2}):(\d{2}):(\d{2})[,.](\d{3})", roh)
    if not marken:
        return None
    h, m, s, _ = marken[-1][4:]
    return int(h) * 3600 + int(m) * 60 + int(s)


MARKER3 = ["mesomerie", "hybridisier", "orbital", "massenwirkungsgesetz", "enthalpie",
           "entropie", "titrationskurve", "aequivalenzpunkt", "standardpotential",
           "nukleophil", "elektrophil", "markownikow", "carbokation", "enantiomer"]
MARKER2 = ["oxidationszahl", "redoxreaktion", "pks", "poh", "autoprotolyse",
           "gleichgewicht", "molare masse", "avogadro", "elektronegativitaet",
           "van-der-waals", "wasserstoffbrueck", "komplex", "isomer", "iupac",
           "nomenklatur", "polymerisation", "polykondensation", "polyaddition",
           "veresterung", "verseifung", "titration", "katalysator", "elektrolyse"]


def normtext(t):
    t = t.lower()
    for a, b in (("ä", "ae"), ("ö", "oe"), ("ü", "ue"), ("ß", "ss")):
        t = t.replace(a, b)
    return t


def srt_klartext(pfad):
    roh = io.open(pfad, encoding="utf-8", errors="replace").read().replace("\r\n", "\n")
    zeilen = []
    for z in roh.split("\n"):
        z = re.sub(r"<[^>]+>", "", z.strip())
        if not z or z.isdigit() or "-->" in z:
            continue
        if z not in zeilen[-3:]:
            zeilen.append(z)
    return normtext(" ".join(zeilen))


def schwierigkeit(txt):
    ws = re.findall(r"[a-z][a-z-]{3,}", txt)
    n = max(1, len(ws))
    m3 = sum(txt.count(m) for m in MARKER3)
    m2 = sum(txt.count(m) for m in MARKER2)
    lang = sum(1 for w in ws if len(w) >= 12) / n
    vielfalt = len(set(ws)) / n
    return 1000 * (3 * m3 + m2) / n + 40 * lang + 20 * vielfalt


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--trocken", action="store_true", help="nur berichten, nichts schreiben")
    args = ap.parse_args()

    transkripte = {}
    for f in os.listdir(TRANS):
        m = re.search(r"\[([A-Za-z0-9_-]{11})\]", f)
        if m:
            transkripte[m.group(1)] = os.path.join(TRANS, f)

    lumi = {}
    for r in csv.DictReader(io.open(CSVD, encoding="utf-8-sig"), delimiter=";"):
        kennung = r["youtube_url"].rsplit("v=", 1)[-1]
        run, embed = r["lumi_url"].strip(), r["lumi_embed_url"].strip()
        if not LUMI_RUN.match(run) or not LUMI_EMBED.match(embed):
            raise SystemExit(f"Unbrauchbare Lumi-Adresse fuer {kennung}: {run} / {embed}")
        lumi[kennung] = {"lumi": run, "embed": embed}

    idx = json.load(io.open(os.path.join(PROJ, "units", "index.json"), encoding="utf-8"))
    bericht, geaendert = [], 0

    for bereich in idx["bereiche"]:
        for e in bereich["einheiten"]:
            pfad = os.path.join(PROJ, "units", bereich["code"], e["id"], "tasks.json")
            d = json.load(io.open(pfad, encoding="utf-8"))
            alt = json.dumps(d, ensure_ascii=False, sort_keys=True)
            neu = []
            for v in d.get("videos", []):
                kennung = v["url"].rsplit("v=", 1)[-1]
                schl = (e["id"], kennung)
                if schl in ENTFERNEN:
                    bericht.append({"einheit": e["id"], "video": v["titel"], "kennung": kennung,
                                    "aktion": "entfernt", "grund": ENTFERNEN[schl]})
                    continue
                if kennung not in lumi:
                    raise SystemExit(f"{e['id']}: keine Lumi-Fassung fuer {kennung}")
                v.pop("pfad", None)
                v.update(lumi[kennung])
                t = transkripte.get(kennung)
                v["dauer_s"] = srt_dauer(t) if t else None
                v["_index"] = schwierigkeit(srt_klartext(t)) if t else 0.0
                neu.append(v)

            # Lernwegzuordnung: leichtestes Video traegt die Einheit, das
            # schwerste geht nur auf C, wenn der Abstand das rechtfertigt.
            geordnet = sorted(neu, key=lambda x: x["_index"])
            for i, v in enumerate(geordnet):
                if i == 0:
                    v["stufe"] = "A"
                elif i == len(geordnet) - 1 and len(geordnet) >= 2:
                    spanne = geordnet[-1]["_index"] - geordnet[0]["_index"]
                    v["stufe"] = "C" if spanne >= 6 else "B"
                else:
                    v["stufe"] = "B"
            for v in neu:
                fest = STUFE_FEST.get((e["id"], v["url"].rsplit("v=", 1)[-1]))
                if fest:
                    v["stufe"] = fest
            # Ohne ein Video auf A saehe der Basisweg gar keines.
            if neu and not any(v["stufe"] == "A" for v in neu):
                min(neu, key=lambda x: x["_index"])["stufe"] = "A"

            for v in neu:
                v.pop("_index", None)
                # feste Feldreihenfolge, damit die Dateien lesbar bleiben
                geordnet_v = {k: v[k] for k in
                              ("titel", "url", "quelle", "lumi", "embed", "stufe", "dauer_s")
                              if k in v}
                v.clear()
                v.update(geordnet_v)

            d["videos"] = neu
            if json.dumps(d, ensure_ascii=False, sort_keys=True) != alt:
                geaendert += 1
                if not args.trocken:
                    io.open(pfad, "w", encoding="utf-8").write(
                        json.dumps(d, ensure_ascii=False, indent=2) + "\n")
            for v in neu:
                bericht.append({"einheit": e["id"], "video": v["titel"],
                                "kennung": v["url"].rsplit("v=", 1)[-1],
                                "aktion": "eingebettet", "stufe": v["stufe"],
                                "dauer_s": v["dauer_s"]})

    print(f"{geaendert} Einheiten geaendert" + (" (trocken)" if args.trocken else ""))
    entfernt = [b for b in bericht if b["aktion"] == "entfernt"]
    print(f"{len(bericht) - len(entfernt)} Videos eingebettet, {len(entfernt)} entfernt")
    for b in entfernt:
        print(f"  entfernt {b['einheit']}: {b['video']}")
    ohne = [b for b in bericht if b["aktion"] == "eingebettet" and not b.get("dauer_s")]
    for b in ohne:
        print(f"  ohne Laufzeit: {b['einheit']} {b['video']}")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()

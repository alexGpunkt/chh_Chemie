# -*- coding: utf-8 -*-
"""Ergaenzt die externen Uebungen um drei weitere Plattformen.

Vorgeschichte

Vorgeschlagen waren neun Seiten. Die harte Bedingung lautete: Die Uebung
muss IN der Anwendung laufen, nicht in einem neuen Tab. Das entscheidet
nicht der Geschmack, sondern der Server der Gegenseite. Geprueft wurde
jede Seite in einem echten Browser, indem sie in einen Rahmen geladen und
nachgesehen wurde, ob Inhalt erscheint:

  laeuft im Rahmen        allgemeinbildung.ch, schlaukopf.de, de.serlo.org
  verbietet das Einbetten apps.zum.de (frame-ancestors 'self' *.zum.de ...)
                          und damit alle H5P-Uebungen von offenes-lernen.de,
                          das sie nur einbindet;
                          leifichemie.de (X-Frame-Options: SAMEORIGIN)
  keine eigenen Uebungen  msa-berlin.de (Erklaertexte, verweist fuer
                          Uebungen auf testedich.de und GoConqr),
                          chemistryathome.de (Erklaerung, Video, PDF),
                          stoteinfachchemie.at (Beschreibung eines
                          Generators, der auf der Seite nicht liegt)

Was nicht eingebettet werden kann, ist hier nicht eingetragen. Ein Verweis,
der ein leeres Fenster oeffnet, ist schlechter als keiner.

Geprueft wird wie beim ersten Durchgang: Jede Adresse wird abgerufen und
der Titel aus der Seite selbst uebernommen.

Aufruf:  python werkzeuge/uebungslinks_zusatz.py [--trocken]
"""
import argparse
import html
import io
import json
import os
import re
import sys
import time
import urllib.request

HIER = os.path.dirname(os.path.abspath(__file__))
PROJ = os.path.dirname(HIER)
KOPF = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) chh-Chemie-Linkpruefung"}

AB = "https://allgemeinbildung.ch/fach=che/%s.htm"
SK = "https://www.schlaukopf.de/realschule/klasse%s/chemie/%s"
SE = "https://de.serlo.org/chemie/%s"

# Einheit -> Liste von (Adresse, typ)
ZUSATZ = {
    "fc-01": [(AB % "Gefahrensymbole_01a", "app"), (AB % "Gefahrensymbole_02k", "app")],
    "fc-03": [(SK % ("8", "stoffe"), "app"), (SE % "26111/aufgaben-zu-aggregatzustaende", "app")],
    "fc-04": [(SK % ("8", "trennverfahren"), "app")],
    "fc-05": [(SK % ("8", "chemischereaktion"), "app"), (SE % "243879/aufgabengruppe", "app")],
    "fc-07": [(SK % ("8", "oxidationreduktion"), "app")],
    "fc-08": [(SK % ("8", "grundwissen"), "app")],

    "ps-01": [(AB % "Periodensystem-Struktur_01s", "app"), (SK % ("9", "periodensystem"), "app")],
    "ps-05": [(SK % ("8", "atombau"), "app")],
    "ps-07": [(SK % ("9", "atombau"), "app")],
    "ps-08": [(AB % "Alkalimetalle_01k", "app"), (SK % ("8", "elementfamilien"), "app")],

    "ga-01": [(SK % ("8", "luft"), "app")],
    "ga-03": [(SK % ("8", "chemischebindungen"), "app"), (SE % "155751/aufgaben-zu-chemischen-bindungen", "app")],
    "ga-04": [(AB % "Element_Neon_04a", "app")],
    "ga-05": [(SK % ("9", "halogene"), "app")],

    "wa-01": [(SK % ("8", "wasser"), "app")],
    "wa-03": [(SK % ("8", "chemischeformeln"), "app")],
    "wa-04": [(SK % ("9", "molekuele"), "app")],

    "sz-02": [(SE % "155751/aufgaben-zu-chemischen-bindungen", "app")],
    "sz-05": [(SK % ("9", "salze"), "app")],

    "me-01": [(SK % ("9", "elementfamilien"), "app"), (AB % "Element_Eisen_04a", "app")],
    "me-04": [(SK % ("9", "werkstoffe"), "app"), (AB % "Element_Kupfer_04a", "app")],
    "me-05": [(SE % "146481/aufgaben-zu-redox-reaktionen", "app")],
    "me-06": [(SK % ("8", "hochofen"), "app")],

    "sl-01": [(AB % "Saeuren_Basen_01a", "app"), (SK % ("9", "saurenlaugen"), "app")],
    "sl-02": [(AB % "pH-Wert_01s", "app")],
    "sl-04": [(AB % "Saeuren_Basen_03w", "app")],
    "sl-07": [(AB % "Saeuren_Basen_02k", "app")],

    "kw-01": [(SK % ("9", "kohlenstoff"), "app"), (SE % "155782/aufgaben-zur-organischen-chemie", "app")],
    "kw-02": [(SK % ("9", "kohlenwasserstoffe"), "app"), (SE % "155780/alkane-alkene-alkine", "sammlung")],
    "kw-06": [(SK % ("8", "umwelt"), "app")],
    "kw-07": [(SE % "155791/aufgaben-zu-alkanen-alkenen-und-alkinen", "app")],

    "al-01": [(SE % "128714/alkohole", "sammlung")],
    "al-07": [(SE % "18887/organische-chemie", "sammlung")],

    "es-05": [(SE % "23270/kunststoffe", "sammlung")],
}

TITEL = re.compile(r"<title>(.*?)</title>", re.S | re.I)

# Die Buchstaben hinter der Nummer benennen bei allgemeinbildung.ch die
# Aufgabenform. Ausgeschrieben ist das fuer Lernende brauchbar, "03s" nicht.
AB_FORM = {"a": "Auswahl", "e": "Einsetzen", "k": "Kreuzworträtsel", "s": "Zuordnen",
           "v": "Verbinden", "w": "Wortsuche", "g": "Gitterrätsel", "q": "Quizfragen"}


def seitentitel(url):
    an = urllib.request.Request(url, headers=KOPF)
    with urllib.request.urlopen(an, timeout=30) as r:
        text = r.read().decode("utf-8", "replace")
    m = TITEL.search(text)
    if not m:
        return ""
    return html.unescape(re.sub(r"\s+", " ", m.group(1))).strip()


def aufbereiten(url, roh):
    """Aus dem Seitentitel einen Titel machen, der in der Karte etwas sagt."""
    if "allgemeinbildung.ch" in url:
        kopf = roh.split("|")[0].strip()                       # "Gefahrensymbole : 01a"
        m = re.match(r"^(.*?)\s*:\s*(\d+)([a-z])$", kopf)
        if not m:
            return kopf
        thema, _, code = m.groups()
        form = AB_FORM.get(code)
        return f"{thema} — {form}" if form else thema
    if "schlaukopf.de" in url:
        thema = roh.split(":")[0].strip()
        klasse = "8" if "/klasse8/" in url else "9"
        return f"{thema} — Quiz Klasse {klasse}"
    if "serlo.org" in url:
        return re.sub(r"\s*[–-]\s*(Grundlagen & Übungen|lernen mit Serlo!)\s*$", "", roh).strip()
    return roh


def quelle_fuer(url):
    if "allgemeinbildung.ch" in url:
        return "allgemeinbildung.ch"
    if "schlaukopf.de" in url:
        return "Schlaukopf"
    if "serlo.org" in url:
        return "Serlo"
    raise SystemExit("Unbekannte Plattform: " + url)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--trocken", action="store_true")
    args = ap.parse_args()

    idx = json.load(io.open(os.path.join(PROJ, "units", "index.json"), encoding="utf-8"))
    geaendert, ergaenzt, verworfen = 0, 0, []

    for bereich in idx["bereiche"]:
        for e in bereich["einheiten"]:
            eid = e["id"]
            if eid not in ZUSATZ:
                continue
            pfad = os.path.join(PROJ, "units", bereich["code"], eid, "tasks.json")
            d = json.load(io.open(pfad, encoding="utf-8"))
            alt = json.dumps(d, ensure_ascii=False, sort_keys=True)

            vorhanden = {l["url"] for l in d.get("uebungslinks", [])}
            links = list(d.get("uebungslinks", []))
            for url, typ in ZUSATZ[eid]:
                if url in vorhanden:
                    continue
                try:
                    roh = seitentitel(url)
                except Exception as fehler:
                    verworfen.append((eid, url, "nicht erreichbar: %s" % fehler))
                    continue
                time.sleep(0.3)
                if not roh:
                    verworfen.append((eid, url, "Seite ohne Titel"))
                    continue
                eintrag = {
                    "titel": aufbereiten(url, roh),
                    "url": url,
                    "typ": typ,
                    "quelle": quelle_fuer(url),
                }
                if typ == "sammlung":
                    eintrag["pfade"] = ["B", "C"]
                links.append(eintrag)
                ergaenzt += 1

            d["uebungslinks"] = links
            if json.dumps(d, ensure_ascii=False, sort_keys=True) != alt:
                geaendert += 1
                if not args.trocken:
                    io.open(pfad, "w", encoding="utf-8").write(
                        json.dumps(d, ensure_ascii=False, indent=2) + "\n")
            print("  %-7s jetzt %d Verweise" % (eid, len(links)))

    print("\n%d Einheiten ergaenzt%s, %d Verweise dazu"
          % (geaendert, " (trocken)" if args.trocken else "", ergaenzt))
    for eid, url, grund in verworfen:
        print("  verworfen %-7s %s — %s" % (eid, url, grund))


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()

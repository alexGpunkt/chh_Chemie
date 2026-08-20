# -*- coding: utf-8 -*-
"""Traegt die externen Uebungen in die Einheiten ein - und prueft sie nach.

Warum LearningApps und nur LearningApps

Freigegeben sind sieben Plattformen (siehe UEBUNGSQUELLEN in engine.js).
Genommen wird bis auf Weiteres nur LearningApps, und dafuer gibt es drei
Gruende, die zusammen den Ausschlag geben:

  1. Die Uebungen oeffnen in einem Rahmen INNERHALB der Anwendung. Das
     funktioniert nur, wenn der Anbieter das Einbetten erlaubt.
     LearningApps ist genau dafuer gebaut; andere Anbieter setzen teils
     X-Frame-Options und liefern dann ein leeres Fenster.
  2. Eine Uebung ist eine Uebung - keine Erklaerseite, kein Wiki-Artikel.
     Wer nach der Lernkarte noch einmal ueben will, braucht Aufgaben.
  3. Stabile Adressen der Form /viewNNNNNNNN, die sich einzeln nachpruefen
     lassen. Genau das tut dieses Werkzeug bei jedem Lauf.

Was geprueft wird

Zu jeder Kennung wird die Seite abgerufen und ihr <title> gelesen. Eine
nicht vergebene Kennung liefert bei LearningApps eine Seite MIT Status 200,
aber OHNE Titel - der Statuscode allein taugt also nicht als Nachweis.
Eingetragen wird der Titel, den die Seite selbst nennt; abweichende
Schreibweisen aus der Suchliste werden dabei gemeldet und verworfen.

Aufruf:  python werkzeuge/uebungslinks_einspielen.py [--trocken]
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

# Einheit -> [(Kennung, typ, Kurzbeschreibung des Aufgabenformats)]
#
# Der angezeigte Titel kommt NICHT aus dieser Tabelle, sondern von der
# Seite selbst. Hier steht nur, was ohne Abruf nicht zu erfahren ist:
# ob es eine einzelne Uebung ("app") oder eine Sammlung mehrerer Uebungen
# ("sammlung") ist. Sammlungen werden auf die Lernwege B und C beschraenkt -
# auf dem Basisweg muesste ein Kind sie erst sortieren.
AUSWAHL = {
    "fc-01": [("8924785", "app"), ("20670947", "app")],
    "fc-02": [("1196893", "app"), ("18175826", "app")],
    "fc-03": [("8482715", "app"), ("4366462", "app")],
    "fc-04": [("1710567", "app"), ("1407786", "app")],
    "fc-05": [("11984078", "app"), ("13091408", "app")],
    "fc-06": [("16288185", "app"), ("16480931", "app")],
    "fc-07": [("21237132", "app"), ("16492305", "app")],
    "fc-08": [("16357788", "app"), ("33864691", "app")],

    "ps-01": [("2751962", "app"), ("10586610", "app")],
    "ps-02": [("11199441", "app"), ("15262869", "app")],
    "ps-03": [("1754492", "app"), ("18008340", "app")],
    "ps-04": [("8103304", "app"), ("8103208", "app")],
    "ps-05": [("17307588", "app"), ("14434018", "app")],
    "ps-06": [("10799630", "app"), ("17849461", "app")],
    "ps-07": [("12679168", "app"), ("13591778", "app")],
    "ps-08": [("12729050", "app"), ("1709725", "app")],

    "ga-01": [("17071511", "app"), ("1728111", "app")],
    "ga-02": [("3905927", "app"), ("16293379", "app")],
    "ga-03": [("10070124", "app"), ("9901388", "app")],
    "ga-04": [("16852904", "app"), ("28165007", "app")],
    "ga-05": [("9304669", "app"), ("13496828", "sammlung")],

    "wa-01": [("10134695", "app"), ("17494147", "app")],
    "wa-02": [("23026276", "app"), ("9438148", "app")],
    "wa-03": [("1323263", "app"), ("10100010", "app")],
    "wa-04": [("6317701", "app"), ("11514992", "app")],
    "wa-05": [("23550549", "app"), ("1804705", "app")],
    "wa-06": [("10127114", "app"), ("1424674", "app")],

    "sz-01": [("1716021", "app"), ("4897580", "app")],
    "sz-02": [("22660444", "app"), ("11061299", "app")],
    "sz-03": [("1800494", "app"), ("1800701", "app")],
    "sz-04": [("12320435", "app"), ("19984054", "app")],
    "sz-05": [("1930535", "app"), ("1471442", "sammlung")],

    "me-01": [("1752642", "app"), ("15972967", "app")],
    "me-02": [("16805093", "app"), ("12868549", "app")],
    "me-03": [("12629373", "app"), ("18387201", "app")],
    "me-04": [("21822157", "app"), ("2348798", "app")],
    "me-05": [("10966969", "app"), ("11114108", "app")],
    "me-06": [("4991152", "app"), ("16825405", "app")],
    "me-07": [("7226678", "app"), ("4520689", "app")],

    "qb-01": [("18193374", "app"), ("18359168", "app")],
    "qb-02": [("16064197", "app"), ("20660307", "app")],
    "qb-03": [("15076630", "app"), ("10778593", "sammlung")],
    "qb-04": [("28492973", "app"), ("19996033", "app")],
    "qb-05": [("4908419", "app"), ("5353709", "app")],

    "sl-01": [("3680812", "app"), ("573173", "app")],
    "sl-02": [("9636489", "app"), ("2012921", "app")],
    "sl-03": [("7376357", "app"), ("6048602", "app")],
    "sl-04": [("5394584", "app"), ("1441655", "app")],
    "sl-05": [("39434794", "app"), ("25408943", "app")],
    "sl-06": [("16330421", "app"), ("6732499", "app")],
    "sl-07": [("6785951", "app"), ("16330575", "sammlung")],

    "kw-01": [("25284731", "app"), ("10970017", "app")],
    "kw-02": [("3758268", "app"), ("13630497", "app")],
    "kw-03": [("28346253", "app"), ("15658759", "app")],
    "kw-04": [("5903454", "app"), ("9590957", "app")],
    "kw-05": [("5922285", "app"), ("7698245", "app")],
    "kw-06": [("19166432", "app"), ("35520243", "app")],
    "kw-07": [("5631633", "app"), ("5291762", "app")],

    "al-01": [("7110013", "app"), ("13434025", "app")],
    "al-02": [("8644276", "app"), ("7594661", "app")],
    "al-03": [("7698245", "app"), ("5722717", "app")],
    "al-04": [("23161801", "app"), ("19492106", "app")],
    "al-05": [("4763958", "app"), ("5744771", "app")],
    "al-06": [("9754673", "app"), ("9122603", "app")],
    "al-07": [("15967647", "app"), ("27007266", "app")],

    "os-01": [("10312285", "app"), ("13234889", "sammlung")],
    "os-02": [("26068196", "app"), ("12011968", "app")],
    "os-03": [("26068452", "app"), ("17516522", "app")],
    "os-04": [("17315062", "app"), ("7793319", "app")],
    "os-05": [("18687521", "app"), ("23111629", "app")],

    "es-01": [("11001545", "app"), ("16344854", "app")],
    "es-02": [("12753938", "app"), ("13434066", "app")],
    "es-03": [("24208992", "app"), ("24208709", "app")],
    "es-04": [("2170958", "app"), ("24785435", "app")],
    "es-05": [("6084309", "app"), ("1286639", "app")],
    "es-06": [("1294402", "app"), ("22671007", "app")],
}

TITEL = re.compile(r"<title>(.*?)</title>", re.S | re.I)


def seitentitel(kennung):
    """Der Titel, den LearningApps selbst fuer diese Kennung nennt.
    Leer heisst: Die Kennung ist nicht (mehr) vergeben."""
    url = "https://learningapps.org/view%s" % kennung
    an = urllib.request.Request(url, headers=KOPF)
    with urllib.request.urlopen(an, timeout=25) as r:
        text = r.read().decode("utf-8", "replace")
    m = TITEL.search(text)
    if not m:
        return ""
    titel = html.unescape(re.sub(r"\s+", " ", m.group(1))).strip()
    # Die Startseite traegt den Namen der Plattform - das ist kein App-Titel.
    if titel.lower().startswith("learningapps.org"):
        return ""
    return titel


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--trocken", action="store_true")
    args = ap.parse_args()

    idx = json.load(io.open(os.path.join(PROJ, "units", "index.json"), encoding="utf-8"))
    geaendert, eingetragen, verworfen = 0, 0, []

    for bereich in idx["bereiche"]:
        for e in bereich["einheiten"]:
            eid = e["id"]
            if eid not in AUSWAHL:
                verworfen.append((eid, "-", "keine Auswahl hinterlegt"))
                continue
            pfad = os.path.join(PROJ, "units", bereich["code"], eid, "tasks.json")
            d = json.load(io.open(pfad, encoding="utf-8"))
            alt = json.dumps(d, ensure_ascii=False, sort_keys=True)

            links = []
            for kennung, typ in AUSWAHL[eid]:
                try:
                    titel = seitentitel(kennung)
                except Exception as fehler:
                    verworfen.append((eid, kennung, "nicht erreichbar: %s" % fehler))
                    continue
                time.sleep(0.25)
                if not titel:
                    verworfen.append((eid, kennung, "Kennung nicht vergeben"))
                    continue
                eintrag = {
                    "titel": titel,
                    "url": "https://learningapps.org/view%s" % kennung,
                    "typ": typ,
                    "quelle": "LearningApps",
                }
                if typ == "sammlung":
                    eintrag["pfade"] = ["B", "C"]
                links.append(eintrag)
                eingetragen += 1

            d["uebungslinks"] = links
            if json.dumps(d, ensure_ascii=False, sort_keys=True) != alt:
                geaendert += 1
                if not args.trocken:
                    io.open(pfad, "w", encoding="utf-8").write(
                        json.dumps(d, ensure_ascii=False, indent=2) + "\n")
            print("  %-7s %d Verweise" % (eid, len(links)))

    print("\n%d Einheiten geaendert%s, %d Verweise eingetragen"
          % (geaendert, " (trocken)" if args.trocken else "", eingetragen))
    if verworfen:
        print("\n%d verworfen:" % len(verworfen))
        for eid, kennung, grund in verworfen:
            print("  %-7s %-10s %s" % (eid, kennung, grund))


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()

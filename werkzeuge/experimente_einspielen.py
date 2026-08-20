# -*- coding: utf-8 -*-
"""Spielt die 52 Experimentiervideos und den Lehrbuchbezug in die Einheiten.

Zwei neue Felder je tasks.json:

  experimente[]  Versuchsvideos zum Zusehen. Getrennt von videos[], weil
                 sie etwas anderes sind: Das Erklaervideo traegt den Stoff,
                 der Versuch zeigt ihn. Waeren beide in einem Feld, wuerde
                 der Versuch das empfohlene Erklaervideo verdraengen und
                 der 45-Minuten-Plan nicht mehr stimmen.

  lehrbuch       Kapitel, Seitenbereich und je Lernweg ein Arbeitsauftrag.

Zwei Arten von Versuchsvideos

  28 liegen als H5P-Fassung bei Lumi. Sie halten von selbst an und fuehren
  durch das Versuchsprotokoll (Materialien, Aufbau, Durchfuehrung,
  Beobachtung). Dort braucht es keinen zusaetzlichen Auftrag.

  24 gibt es nur als Film. Sie laufen ueber youtube-nocookie.com in einem
  Rahmen der Seite - kein neuer Tab, keine Empfehlungen daneben. Damit sie
  nicht zum Zusehen verkommen, steht UEBER dem Video ein
  Beobachtungsauftrag als Hefteintrag, dreifach differenziert.

Die drei Stufen folgen den Operatoren des Lehrbuchs

  A  Nenne, Gib an, Benenne, Beschreibe, Zeichne        (Reproduktion)
  B  Erklaere, Erlaeutere, Vergleiche, Ordne, Berechne  (Reorganisation)
  C  Begruende, Beurteile, Bewerte, Entwickle, Pruefe   (Transfer)

Ausgezaehlt aus dem Lehrbuch: 26x Beschreibe und 10x Nenne gegenueber
30x Erklaere und 18x Erlaeutere gegenueber 19x Begruende und 5x Beurteile.
Die Aufgaben hier verwenden dieselben Woerter - ein Kind, das im Buch
"Begruende" liest, soll nicht hier "Denk mal drueber nach" finden.

Aufruf:  python werkzeuge/experimente_einspielen.py [--trocken]
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
DATEN = os.path.abspath(os.path.join(PROJ, "..", "..", "neue_Transkripte"))
VORSCHLAG = os.path.join(DATEN, "vorschlag_neue_videos.csv")
LUMI = os.path.join(DATEN, "experimentiervideos_mit_lumi_links.csv")

LUMI_EMBED = re.compile(r"^https://app\.lumi\.education/api/v1/run/[A-Za-z0-9_-]{4,32}/embed$")

# ------------------------------------------------------------------
# Kapitel des Lehrbuchs (Seiten der PDF-Datei Lehrbuch_Chemie.pdf).
# Ermittelt aus den Kopfzeilen, siehe werkzeuge/lehrbuchseiten_finden.py.
# Gedruckte Buchseiten stehen nicht in der Textebene des Scans; verwiesen
# wird deshalb auf die Seite der Datei.
# ------------------------------------------------------------------
KAPITEL = {
    1: ("Sicherheit im Chemieunterricht", 8, 12),
    2: ("Stoffe und Stoffeigenschaften", 13, 27),
    3: ("Gemische und Trennverfahren", 28, 37),
    4: ("Luft und Verbrennungen", 38, 57),
    5: ("Die chemische Reaktion", 58, 65),
    6: ("Wasser", 66, 82),
    7: ("Metalle und Redoxreaktionen", 83, 96),
    8: ("Atombau und Ordnung der Elemente", 97, 108),
    9: ("Chemische Bindungen", 109, 114),
    10: ("Säuren, Laugen, Salze", 115, 142),
    12: ("Der Weg zur organischen Chemie", 147, 162),
    13: ("Organische Säuren", 163, 172),
    14: ("Kunststoffe", 173, 183),
    15: ("Naturstoffe", 184, 193),
}

EINHEIT_KAPITEL = {
    "fc-01": 1, "fc-02": 1, "fc-03": 2, "fc-04": 3, "fc-05": 5,
    "fc-06": 4, "fc-07": 4, "fc-08": 5,
    "ps-01": 8, "ps-02": 2, "ps-03": 8, "ps-04": 8,
    "ps-05": 8, "ps-06": 8, "ps-07": 8, "ps-08": 8,
    "ga-01": 4, "ga-02": 4, "ga-03": 9, "ga-04": 4, "ga-05": 4,
    "wa-01": 6, "wa-02": 6, "wa-03": 5, "wa-04": 9, "wa-05": 6, "wa-06": 6,
    "sz-01": 9, "sz-02": 9, "sz-03": 10, "sz-04": 10, "sz-05": 10,
    "me-01": 7, "me-02": 9, "me-03": 7, "me-04": 7,
    "me-05": 7, "me-06": 7, "me-07": 7,
    "qb-01": 5, "qb-02": 5, "qb-03": 5, "qb-04": 5, "qb-05": 5,
    "sl-01": 10, "sl-02": 10, "sl-03": 10, "sl-04": 10,
    "sl-05": 10, "sl-06": 10, "sl-07": 10,
    "kw-01": 12, "kw-02": 12, "kw-03": 12, "kw-04": 12,
    "kw-05": 12, "kw-06": 12, "kw-07": 12,
    "al-01": 13, "al-02": 13, "al-03": 13, "al-04": 13,
    "al-05": 13, "al-06": 13, "al-07": 13,
    "os-01": 13, "os-02": 13, "os-03": 13, "os-04": 15, "os-05": 13,
    "es-01": 13, "es-02": 13, "es-03": 15, "es-04": 15, "es-05": 14, "es-06": 14,
}

# ------------------------------------------------------------------
# Beobachtungsauftraege fuer die 24 Videos ohne H5P-Fassung.
# Schluessel ist die YouTube-Kennung.
# ------------------------------------------------------------------
BEOBACHTUNG = {
    # FC-03 Stoffe und ihre Eigenschaften
    "NYb2iTNFCsI": {
        "A": "Schreibe die vier Stoffe untereinander ins Heft. Notiere hinter jedem, ob er im Video geschmolzen ist oder nicht.",
        "B": "Lege eine Tabelle mit den Spalten „Stoff“ und „Schmilzt bei schwacher Hitze?“ an. Erkläre danach in einem Satz, warum die Schmelztemperatur eine Stoffeigenschaft ist.",
        "C": "Ordne die vier Stoffe nach steigender Schmelztemperatur. Begründe die Reihenfolge mit den Kräften zwischen den Teilchen.",
    },
    "h3EWYrxrsns": {
        "A": "Zeichne das Becherglas mit dem Kohlenstoffdioxid und der Seifenblase. Beschrifte, wo das Gas liegt.",
        "B": "Beschreibe, was mit der Seifenblase geschieht, und erkläre die Beobachtung mit der Dichte der beiden Gase.",
        "C": "Begründe, warum Kohlenstoffdioxid eine größere Dichte hat als Luft. Beurteile, was das für einen Feuerlöscher bedeutet.",
    },
    # FC-06 Feuerdreieck
    "sfzn-Ry7HSo": {
        "A": "Notiere, was schneller brennt: flüssiges Ethanol oder Ethanoldampf.",
        "B": "Erkläre den Unterschied mit dem Zerteilungsgrad. Nenne dazu die drei Bedingungen des Feuerdreiecks.",
        "C": "Begründe, warum ein Brand mit zerteiltem Brennstoff gefährlicher ist. Beurteile, welche Löschmaßnahme hier wirkt.",
    },
    # FC-07 Oxidation
    "J6JxiNwN2D0": {
        "A": "Schreibe die Wortgleichung der Reaktion ins Heft: Magnesium + Sauerstoff → …",
        "B": "Beschreibe die Beobachtung (Licht, Farbe des Produkts) und erkläre, warum das Produkt ein Oxid ist.",
        "C": "Begründe anhand der Massenerhaltung, warum das weiße Pulver schwerer sein muss als das eingesetzte Magnesium.",
    },
    "csdiBIIEkWA": {
        "A": "Notiere, welches der beiden Metalle heftiger reagiert.",
        "B": "Vergleiche beide Verbrennungen in einer Tabelle: Flamme, Geschwindigkeit, Produkt.",
        "C": "Begründe den Unterschied mit der Reaktionsfähigkeit der beiden Metalle.",
    },
    # FC-08 Massenerhaltung
    "ext_RVNhkqM": {
        "A": "Notiere die Masse vor und nach der Reaktion.",
        "B": "Erkläre, warum sich die Masse nicht ändert, obwohl ein neuer Stoff entsteht.",
        "C": "Begründe, warum der Versuch in einem geschlossenen Gefäß laufen muss. Beurteile, was ein offenes Gefäß am Ergebnis ändern würde.",
    },
    # PS-07 Schalenmodell
    "955snB6HLB4": {
        "A": "Notiere, welche Farben du im Spektrum siehst.",
        "B": "Erkläre, warum jedes Element ein eigenes Linienspektrum hat.",
        "C": "Begründe mit dem Schalenmodell, warum nur bestimmte Farben auftreten und nicht alle.",
    },
    # PS-08 Elementfamilien
    "oqMN3y8k9So": {
        "A": "Notiere drei Beobachtungen: Was passiert mit dem Kalium auf dem Wasser?",
        "B": "Vergleiche die Reaktion mit der von Natrium. Ordne Lithium, Natrium und Kalium nach steigender Reaktionsfähigkeit.",
        "C": "Begründe die Zunahme der Reaktionsfähigkeit innerhalb der 1. Hauptgruppe mit dem Atombau.",
    },
    # GA-02 Nachweise
    "h30h4Il8P28": {
        "A": "Notiere, womit Wasser nachgewiesen wird und welche Farbe dabei entsteht.",
        "B": "Beschreibe den Nachweis vollständig: Reagenz, Durchführung, Farbwechsel.",
        "C": "Beurteile, ob der Nachweis eindeutig ist. Begründe, warum ein Nachweis eindeutig sein muss.",
    },
    # WA-02 Analyse
    "QYxusV3LRKg": {
        "A": "Zeichne den Aufbau. Beschrifte, an welchem Pol welches Gas entsteht.",
        "B": "Notiere das Volumenverhältnis der beiden Gase und erkläre, was es über die Formel des Wassers aussagt.",
        "C": "Begründe, warum dieser Versuch eine Analyse ist. Entwickle einen Vorschlag, wie man beide Gase nachweisen könnte.",
    },
    # WA-05 Lösungsmittel
    "LHJjBJar93U": {
        "A": "Notiere je zwei Flüssigkeiten, die sich mischen, und zwei, die sich nicht mischen.",
        "B": "Erkläre die Beobachtung mit den Begriffen polar und unpolar.",
        "C": "Begründe die Regel „Ähnliches löst sich in Ähnlichem“ mit dem Bau der Teilchen.",
    },
    "1kr_E71vNzw": {
        "A": "Notiere, ob sich bei höherer Temperatur mehr oder weniger Feststoff löst.",
        "B": "Beschreibe den Zusammenhang zwischen Temperatur und Löslichkeit und erkläre ihn auf Teilchenebene.",
        "C": "Beurteile, ob die Aussage „Wärme löst immer besser“ für alle Stoffe gilt. Begründe deine Antwort.",
    },
    "xJhjdFEHDv8": {
        "A": "Fasse das Becherglas an und notiere, was du fühlst: Wird es wärmer oder kälter?",
        "B": "Erkläre, warum sich die Lösung abkühlt, obwohl kein Eis zugegeben wurde.",
        "C": "Begründe mit der Gitterenergie und der Hydratationsenergie, warum dieser Lösungsvorgang Energie aufnimmt.",
    },
    # SZ-04 Leitfähigkeit
    "Hr3evtDvo_A": {
        "A": "Notiere, welche der beiden Lösungen den Strom leitet.",
        "B": "Erkläre den Unterschied mit den Teilchen, die in der jeweiligen Lösung vorliegen.",
        "C": "Begründe, warum die Leitfähigkeit ein Nachweis für Ionen ist. Beurteile, ob destilliertes Wasser leiten müsste.",
    },
    # ME-04 Legierungen
    "JI9qKbQCukg": {
        "A": "Notiere, was mit dem Löffel im heißen Wasser geschieht.",
        "B": "Erkläre, warum die Legierung einen niedrigeren Schmelzpunkt hat als die reinen Metalle.",
        "C": "Beurteile, wofür sich eine solche Legierung im Alltag eignet — und wofür nicht. Begründe.",
    },
    # ME-05 Redox
    "Bxqd6k03eIQ": {
        "A": "Notiere, welches Metall sich auflöst und welches sich abscheidet.",
        "B": "Schreibe die beiden Teilgleichungen auf: Wer gibt Elektronen ab, wer nimmt sie auf?",
        "C": "Begründe mit der Redoxreihe, warum die Reaktion in dieser Richtung abläuft und nicht umgekehrt.",
    },
    "fcGkEtpMjw8": {
        "A": "Notiere die Ausgangsstoffe und das Produkt der Thermitreaktion.",
        "B": "Erkläre, welcher Stoff oxidiert und welcher reduziert wird.",
        "C": "Begründe, warum Aluminium das Eisenoxid reduzieren kann. Beurteile, warum dieser Versuch nur als Demonstration gezeigt wird.",
    },
    # ME-06 Hochofen
    "HrS7ENLxoIc": {
        "A": "Notiere die Farbe vor und nach dem Erhitzen.",
        "B": "Stelle die Reaktionsgleichung auf und kennzeichne Oxidation und Reduktion.",
        "C": "Übertrage das Prinzip auf den Hochofen: Begründe, welche Rolle der Koks dort übernimmt.",
    },
    # SL-02 Indikatoren
    "FeeM8R29blU": {
        "A": "Male die Farbskala des Universalindikators ins Heft und beschrifte sauer, neutral, alkalisch.",
        "B": "Ordne die geprüften Lösungen nach steigendem pH-Wert und erkläre, woran du sauer und alkalisch erkennst.",
        "C": "Beurteile, warum ein Universalindikator einem einzelnen Indikator überlegen ist. Begründe.",
    },
    # SL-04 Laugen
    "AP79_srafmE": {
        "A": "Notiere, welcher Stoff entsteht und wie er nachgewiesen wird.",
        "B": "Stelle die Reaktionsgleichung auf und erkläre, warum die Lösung alkalisch reagiert.",
        "C": "Begründe, warum Metalloxide mit Wasser Laugen bilden. Beurteile, ob das für alle Metalloxide gilt.",
    },
    # SL-05 Oxide
    "z95ATFrLue0": {
        "A": "Lege eine Tabelle an: Oxid — Farbe des Indikators — sauer oder basisch.",
        "B": "Ordne die vier Oxide in Metalloxide und Nichtmetalloxide und erkläre den Zusammenhang zur Indikatorfarbe.",
        "C": "Begründe die Regel „Nichtmetalloxide bilden Säuren, Metalloxide bilden Laugen“ und beurteile ihre Reichweite.",
    },
    "PPxYIRX6elo": {
        "A": "Notiere, welches Gas den sauren Regen verursacht und wie sich der Indikator färbt.",
        "B": "Stelle die Reaktionsgleichung von Stickstoffdioxid mit Wasser auf und erkläre die Entstehung des sauren Regens.",
        "C": "Beurteile Gegenmaßnahmen gegen sauren Regen. Begründe, welche am wirksamsten ist.",
    },
    # KW-06 Verbrennung
    "sJNXhC6Nfrc": {
        "A": "Notiere drei Fraktionen des Erdöls und je eine Verwendung.",
        "B": "Ordne die Fraktionen nach steigender Siedetemperatur und erkläre den Zusammenhang zur Kettenlänge.",
        "C": "Begründe, warum die Fraktionen unterschiedlich zähflüssig sind. Beurteile, welche Fraktion als Kraftstoff am wertvollsten ist.",
    },
    # ES-01 Veresterung
    "hAKktgM4WQ8": {
        "A": "Notiere die beiden Ausgangsstoffe und das Produkt.",
        "B": "Stelle die Reaktionsgleichung der Veresterung auf und benenne die Rolle der Schwefelsäure.",
        "C": "Begründe, warum ein Überschuss eines Ausgangsstoffs die Ausbeute erhöht. Beurteile das Verfahren im Hinblick auf das Gleichgewicht.",
    },
}


def kennung(url):
    return url.rsplit("v=", 1)[-1]


def lehrbuch_bezugswort(d):
    """Das eine Fachwort, an dem der Auftrag auf Lernweg B haengt.
    Der Satz selbst steht in engine.js - 76-mal dieselbe Vorlage in die
    Daten zu schreiben hat das Offlinepaket um 57 KB wachsen lassen, und
    eine Aenderung an der Formulierung haette 76 Dateien betroffen."""
    ws = d.get("wortspeicher", []) or []
    return re.sub(r"^(der|die|das)\s+", "", ws[0], flags=re.I) if ws else d["title"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--trocken", action="store_true")
    args = ap.parse_args()

    vorschlag = list(csv.DictReader(io.open(VORSCHLAG, encoding="utf-8-sig"), delimiter=";"))
    lumi = {kennung(z["youtube_url"]): z
            for z in csv.DictReader(io.open(LUMI, encoding="utf-8-sig"), delimiter=";")}

    proEinheit = {}
    for z in vorschlag:
        proEinheit.setdefault(z["einheit"].lower(), []).append(z)

    idx = json.load(io.open(os.path.join(PROJ, "units", "index.json"), encoding="utf-8"))
    geaendert, mitH5P, ohneH5P, fehlend = 0, 0, 0, []

    for b in idx["bereiche"]:
        for e in b["einheiten"]:
            uid = e["id"]
            pfad = os.path.join(PROJ, "units", b["code"], uid, "tasks.json")
            d = json.load(io.open(pfad, encoding="utf-8"))
            alt = json.dumps(d, ensure_ascii=False, sort_keys=True)

            # ---------- Versuchsvideos ----------
            experimente = []
            for z in sorted(proEinheit.get(uid, []), key=lambda x: x["ab_lernweg"]):
                k = kennung(z["url"])
                eintrag = {
                    "titel": z["titel_vorschlag"],
                    "url": z["url"],
                    "quelle": z["kanal"],
                    "stufe": z["ab_lernweg"],
                    "rolle": z["rolle"],
                }
                if k in lumi:
                    einbett = lumi[k]["lumi_embed_url"].strip()
                    if not LUMI_EMBED.match(einbett):
                        fehlend.append((uid, k, "unbrauchbare Lumi-Adresse"))
                        continue
                    eintrag["lumi"] = lumi[k]["lumi_url"].strip()
                    eintrag["embed"] = einbett
                    eintrag["protokoll"] = True
                    mitH5P += 1
                else:
                    # Ohne H5P-Fassung: der Film laeuft ueber die
                    # cookiefreie Einbettadresse von YouTube in der Seite.
                    eintrag["embed"] = "https://www.youtube-nocookie.com/embed/" + k
                    eintrag["protokoll"] = False
                    auftrag = BEOBACHTUNG.get(k)
                    if not auftrag:
                        fehlend.append((uid, k, "kein Beobachtungsauftrag hinterlegt"))
                        continue
                    eintrag["beobachtung"] = auftrag
                    ohneH5P += 1
                experimente.append(eintrag)

            if experimente:
                d["experimente"] = experimente
            elif "experimente" in d:
                del d["experimente"]

            # ---------- Lehrbuchbezug ----------
            kap = EINHEIT_KAPITEL[uid]
            titel, von, bis = KAPITEL[kap]
            d["lehrbuch"] = {
                "kapitel": kap,
                "titel": titel,
                "seiten_von": von,
                "seiten_bis": bis,
                "quelle": "Lehrbuch_Chemie.pdf",
                "bezugswort": lehrbuch_bezugswort(d),
            }

            if json.dumps(d, ensure_ascii=False, sort_keys=True) != alt:
                geaendert += 1
                if not args.trocken:
                    io.open(pfad, "w", encoding="utf-8").write(
                        json.dumps(d, ensure_ascii=False, indent=2) + "\n")

    print("%d Einheiten geändert%s" % (geaendert, " (trocken)" if args.trocken else ""))
    print("%d Versuchsvideos mit H5P-Protokoll, %d mit Beobachtungsauftrag"
          % (mitH5P, ohneH5P))
    print("Lehrbuchbezug in allen 76 Einheiten")
    if fehlend:
        print("\n%d nicht eingetragen:" % len(fehlend))
        for u, k, g in fehlend:
            print("   %-7s %-13s %s" % (u, k, g))


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main()

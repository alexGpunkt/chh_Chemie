# -*- coding: utf-8 -*-
"""Erzeugt die Warm-up-Pools spiral/w-*.json und spiral/plan.json.

Die Generatoren sind hier als Python-Datenstrukturen notiert, weil sich so
Wiederholungen (Tabellen von Stoffen, molare Massen) an einer Stelle halten
lassen. Ausgegeben wird reines JSON — die Anwendung liest nur die JSON-Dateien.
"""
import json, os, io

WURZEL = r"C:\Users\Lance2Go\Documents\claude\Chemie\chh_Chemie_7_10"
ZIEL = os.path.join(WURZEL, "spiral")

# Molare Massen, gerundet wie im Schul-PSE
M = {"H": 1, "C": 12, "N": 14, "O": 16, "Na": 23, "Mg": 24, "Al": 27,
     "S": 32, "Cl": 35.5, "K": 39, "Ca": 40, "Fe": 56, "Cu": 64, "Zn": 65}

ELEMENTE = [
    {"name": "Wasserstoff", "symbol": "H", "z": 1, "n": 0, "aussen": 1},
    {"name": "Helium", "symbol": "He", "z": 2, "n": 2, "aussen": 2},
    {"name": "Lithium", "symbol": "Li", "z": 3, "n": 4, "aussen": 1},
    {"name": "Kohlenstoff", "symbol": "C", "z": 6, "n": 6, "aussen": 4},
    {"name": "Stickstoff", "symbol": "N", "z": 7, "n": 7, "aussen": 5},
    {"name": "Sauerstoff", "symbol": "O", "z": 8, "n": 8, "aussen": 6},
    {"name": "Neon", "symbol": "Ne", "z": 10, "n": 10, "aussen": 8},
    {"name": "Natrium", "symbol": "Na", "z": 11, "n": 12, "aussen": 1},
    {"name": "Magnesium", "symbol": "Mg", "z": 12, "n": 12, "aussen": 2},
    {"name": "Aluminium", "symbol": "Al", "z": 13, "n": 14, "aussen": 3},
    {"name": "Schwefel", "symbol": "S", "z": 16, "n": 16, "aussen": 6},
    {"name": "Chlor", "symbol": "Cl", "z": 17, "n": 18, "aussen": 7},
    {"name": "Kalium", "symbol": "K", "z": 19, "n": 20, "aussen": 1},
    {"name": "Calcium", "symbol": "Ca", "z": 20, "n": 20, "aussen": 2},
]

ALKANE = [
    {"name": "Methan", "formel": "CH\u2084", "c": 1, "sied": -162},
    {"name": "Ethan", "formel": "C\u2082H\u2086", "c": 2, "sied": -89},
    {"name": "Propan", "formel": "C\u2083H\u2088", "c": 3, "sied": -42},
    {"name": "Butan", "formel": "C\u2084H\u2081\u2080", "c": 4, "sied": 0},
    {"name": "Pentan", "formel": "C\u2085H\u2081\u2082", "c": 5, "sied": 36},
    {"name": "Hexan", "formel": "C\u2086H\u2081\u2084", "c": 6, "sied": 69},
    {"name": "Heptan", "formel": "C\u2087H\u2081\u2086", "c": 7, "sied": 98},
    {"name": "Octan", "formel": "C\u2088H\u2081\u2088", "c": 8, "sied": 126},
]


def g(gid, level, skill, template, answer, **kw):
    d = {"id": gid, "level": level, "skill": skill,
         "template": template, "answer": answer}
    d.update(kw)
    return d


# ============================================================
# W-STOF · Stoffe, Eigenschaften, Trennverfahren
# ============================================================
STOFFE = [
    {"name": "Eisen", "dichte": 7.9, "schmelz": 1535, "sied": 2750},
    {"name": "Aluminium", "dichte": 2.7, "schmelz": 660, "sied": 2467},
    {"name": "Kupfer", "dichte": 8.9, "schmelz": 1083, "sied": 2567},
    {"name": "Wasser", "dichte": 1.0, "schmelz": 0, "sied": 100},
    {"name": "Ethanol", "dichte": 0.79, "schmelz": -114, "sied": 78},
    {"name": "Blei", "dichte": 11.3, "schmelz": 327, "sied": 1749},
]

w_stof = [
    g("WSTOF-A-dichte-masse", "A", "Masse aus Dichte und Volumen",
      "{name$} hat die Dichte {dichte} g/cm\u00b3. Welche Masse haben {V} cm\u00b3?",
      "dichte * V", tabelle=STOFFE, vars={"V": {"aus": [10, 20, 50, 100]}},
      unit_label="g", round=1,
      hint="m = \u03c1 \u00b7 V. Multipliziere die Dichte mit dem Volumen.",
      solution="m = {dichte} g/cm\u00b3 \u00b7 {V} cm\u00b3 = {ergebnis} g",
      misconceptions=[{"id": "dichte_geteilt_statt_mal",
                       "value": "V / dichte",
                       "feedback": "Du hast geteilt. Aus Dichte und Volumen wird die Masse durch Multiplizieren: m = \u03c1 \u00b7 V."}]),

    g("WSTOF-A-zustand", "A", "Aggregatzustand bei Zimmertemperatur bestimmen",
      "{name$} schmilzt bei {schmelz} \u00b0C und siedet bei {sied} \u00b0C. Ist der Stoff bei 20 \u00b0C fest (1), fl\u00fcssig (2) oder gasf\u00f6rmig (3)?",
      "1 + (20 > schmelz) + (20 > sied)", tabelle=STOFFE, round=0,
      hint="Unter dem Schmelzpunkt ist alles fest, \u00fcber dem Siedepunkt alles gasf\u00f6rmig.",
      solution="20 \u00b0C liegt {ergebnis} \u2014 Schmelzpunkt {schmelz} \u00b0C, Siedepunkt {sied} \u00b0C."),

    g("WSTOF-A-anteil", "A", "Massenanteil in Prozent",
      "In {ges} g Salzwasser sind {teil} g Salz gel\u00f6st. Wie viel Prozent sind das?",
      "teil / ges * 100",
      vars={"ges": {"aus": [200, 250, 400, 500]}, "teil": {"aus": [10, 20, 25, 50]}},
      bedingung="ganz(teil / ges * 100)", unit_label="%", round=1,
      hint="Anteil = Teil : Ganzes, dann mal 100.",
      solution="{teil} g : {ges} g = {teil/ges} \u2192 {ergebnis} %",
      misconceptions=[{"id": "anteil_umgedreht", "value": "ges / teil",
                       "feedback": "Du hast das Ganze durch den Teil geteilt. Der Anteil ist Teil : Ganzes."}]),

    g("WSTOF-A-schmelzabstand", "A", "Temperaturspanne ablesen",
      "{name$} schmilzt bei {schmelz} \u00b0C und siedet bei {sied} \u00b0C. Wie viele Grad liegt der fl\u00fcssige Bereich auseinander?",
      "sied - schmelz", tabelle=STOFFE, unit_label="\u00b0C", round=0,
      hint="Siedetemperatur minus Schmelztemperatur.",
      solution="{sied} \u00b0C \u2212 {schmelz} \u00b0C = {ergebnis} \u00b0C"),

    g("WSTOF-A-verdampfen", "A", "R\u00fcckstand beim Eindampfen",
      "{V} mL Salzwasser enthalten {c} g Salz je 100 mL. Wie viel Salz bleibt beim Eindampfen \u00fcbrig?",
      "V / 100 * c", vars={"V": {"aus": [50, 100, 200, 300, 400]}, "c": {"aus": [2, 4, 5, 10]}},
      unit_label="g", round=2,
      hint="Erst auf 1 mL rechnen, dann auf {V} mL.",
      solution="{c} g je 100 mL \u2192 {V} mL : 100 \u00b7 {c} g = {ergebnis} g"),

    g("WSTOF-B-dichte-volumen", "B", "Volumen aus Masse und Dichte",
      "Ein St\u00fcck {name$} wiegt {m} g. Die Dichte betr\u00e4gt {dichte} g/cm\u00b3. Welches Volumen hat es?",
      "m / dichte", tabelle=STOFFE, vars={"m": {"von": 40, "bis": 400, "schritt": 20}},
      unit_label="cm\u00b3", round=2,
      hint="V = m : \u03c1.",
      solution="V = {m} g : {dichte} g/cm\u00b3 = {ergebnis} cm\u00b3",
      misconceptions=[{"id": "dichte_mal_statt_geteilt", "value": "m * dichte",
                       "feedback": "Du hast multipliziert. Aus Masse und Dichte wird das Volumen durch Teilen: V = m : \u03c1."}]),

    g("WSTOF-B-dichte-selbst", "B", "Dichte selbst bestimmen",
      "Ein Metallw\u00fcrfel mit {a} cm Kantenl\u00e4nge wiegt {m} g. Welche Dichte hat er?",
      "m / (a * a * a)", vars={"a": {"aus": [2, 3, 4, 5]}, "m": {"von": 40, "bis": 900, "schritt": 20}},
      bedingung="ganz(m / (a*a*a) * 100)", unit_label="g/cm\u00b3", round=2,
      hint="Erst das Volumen des W\u00fcrfels: a \u00b7 a \u00b7 a. Dann \u03c1 = m : V.",
      solution="V = {a} cm \u00b7 {a} cm \u00b7 {a} cm = {a*a*a} cm\u00b3\n\u03c1 = {m} g : {a*a*a} cm\u00b3 = {ergebnis} g/cm\u00b3",
      misconceptions=[{"id": "volumen_als_flaeche", "value": "m / (a * a)",
                       "feedback": "Du hast mit einer Fl\u00e4che gerechnet. Ein W\u00fcrfel hat das Volumen a \u00b7 a \u00b7 a."}]),

    g("WSTOF-B-mischen", "B", "Massenanteil einer Mischung",
      "{a} g Zucker werden in {b} g Wasser gel\u00f6st. Wie viel Prozent Zucker enth\u00e4lt die L\u00f6sung?",
      "a / (a + b) * 100", vars={"a": {"aus": [10, 20, 25, 50]}, "b": {"aus": [90, 80, 75, 150, 200]}},
      unit_label="%", round=2,
      hint="Das Ganze ist Zucker <b>plus</b> Wasser.",
      solution="{a} g : ({a} g + {b} g) = {a}/{a+b} \u2192 {ergebnis} %",
      misconceptions=[{"id": "loesungsmittel_als_ganzes", "value": "a / b * 100",
                       "feedback": "Du hast nur durch das Wasser geteilt. Zur L\u00f6sung geh\u00f6rt auch der gel\u00f6ste Zucker."}]),

    g("WSTOF-B-abkuehlen", "B", "Temperatur\u00e4nderung berechnen",
      "Eine Probe wird von {t1} \u00b0C auf {t2} \u00b0C abgek\u00fchlt. Um wie viel Grad sinkt die Temperatur?",
      "t1 - t2", vars={"t1": {"von": 40, "bis": 120, "schritt": 5}, "t2": {"von": -30, "bis": 30, "schritt": 5}},
      unit_label="\u00b0C", round=0,
      hint="Anfangstemperatur minus Endtemperatur.",
      solution="{t1} \u00b0C \u2212 ({t2} \u00b0C) = {ergebnis} \u00b0C"),

    g("WSTOF-B-loeslichkeit", "B", "L\u00f6slichkeit umrechnen",
      "Bei 20 \u00b0C l\u00f6sen sich {L} g eines Salzes in 100 g Wasser. Wie viel l\u00f6st sich in {W} g Wasser?",
      "L * W / 100", vars={"L": {"aus": [20, 36, 40, 88]}, "W": {"aus": [50, 150, 250, 500]}},
      unit_label="g", round=1,
      hint="Erst auf 1 g Wasser rechnen, dann auf {W} g.",
      solution="{L} g je 100 g \u2192 {W} g : 100 \u00b7 {L} g = {ergebnis} g"),

    g("WSTOF-C-legierung", "C", "Massenanteil in einer Legierung",
      "Messing besteht zu {p} % aus Kupfer. Wie viel Kupfer stecken in {m} g Messing?",
      "m * p / 100", vars={"p": {"aus": [58, 60, 63, 70]}, "m": {"von": 100, "bis": 900, "schritt": 50}},
      unit_label="g", round=2,
      hint="{p} % von {m} g \u2014 erst 1 %, dann mal {p}.",
      solution="1 % = {m/100} g \u2192 {p} % = {ergebnis} g",
      misconceptions=[{"id": "rest_statt_anteil", "value": "m * (100 - p) / 100",
                       "feedback": "Das ist der Zinkanteil. Gefragt war der Kupferanteil."}]),

    g("WSTOF-C-dichte-hohl", "C", "Dichte einer Mischung absch\u00e4tzen",
      "{m1} g eines Stoffes mit {d1} g/cm\u00b3 und {m2} g Wasser (1,0 g/cm\u00b3) werden gemischt. Welches Gesamtvolumen ergibt sich?",
      "m1 / d1 + m2", vars={"m1": {"aus": [79, 158, 237]}, "d1": {"aus": [7.9]}, "m2": {"aus": [50, 100, 200]}},
      unit_label="cm\u00b3", round=1,
      hint="Jedes Volumen einzeln \u00fcber V = m : \u03c1 ausrechnen, dann addieren.",
      solution="V\u2081 = {m1} g : {d1} g/cm\u00b3 = {m1/d1} cm\u00b3\nV\u2082 = {m2} cm\u00b3\nV = {ergebnis} cm\u00b3"),

    g("WSTOF-C-ausbeute", "C", "Ausbeute in Prozent",
      "Erwartet wurden {soll} g Produkt, gewonnen wurden {ist} g. Wie hoch ist die Ausbeute in Prozent?",
      "ist / soll * 100", vars={"soll": {"aus": [20, 25, 40, 50, 80]}, "ist": {"von": 8, "bis": 76, "schritt": 2}},
      bedingung="ist < soll", unit_label="%", round=1,
      hint="Ausbeute = tats\u00e4chlich : erwartet, dann mal 100.",
      solution="{ist} g : {soll} g = {ist/soll} \u2192 {ergebnis} %",
      misconceptions=[{"id": "anteil_umgedreht", "value": "soll / ist * 100",
                       "feedback": "Du hast Soll durch Ist geteilt. Die Ausbeute kann nicht \u00fcber 100 % liegen."}]),

    g("WSTOF-C-verlust", "C", "Verlust beim Trennen",
      "Aus {ein} g Gemisch wurden {aus} g Reinstoff gewonnen. Wie viel Prozent gingen verloren?",
      "(ein - aus) / ein * 100", vars={"ein": {"aus": [50, 80, 100, 200, 250]}, "aus": {"von": 20, "bis": 240, "schritt": 5}},
      bedingung="aus < ein", unit_label="%", round=1,
      hint="Erst die verlorene Masse, dann ihren Anteil am Ganzen.",
      solution="Verlust = {ein} g \u2212 {aus} g = {ein-aus} g \u2192 {ergebnis} %"),

    g("WSTOF-C-konzentrieren", "C", "Eindampfen bis zur Wunschkonzentration",
      "{V} g L\u00f6sung enthalten {p} % Salz. Auf welche Masse muss eingedampft werden, damit sie {q} % enth\u00e4lt?",
      "V * p / q", vars={"V": {"aus": [200, 400, 500]}, "p": {"aus": [2, 4, 5]}, "q": {"aus": [8, 10, 20, 25]}},
      bedingung="q > p", unit_label="g", round=1,
      hint="Die Salzmasse bleibt gleich. Nur Wasser verschwindet.",
      solution="Salz: {V*p/100} g bleibt.\nNeue Masse = {V*p/100} g : {q/100} = {ergebnis} g",
      misconceptions=[{"id": "salz_mit_verdampft", "value": "V * q / p",
                       "feedback": "Beim Eindampfen verschwindet nur Wasser. Das Salz bleibt \u2014 die Gesamtmasse wird also kleiner, nicht gr\u00f6\u00dfer."}]),
]

# ============================================================
# W-TEIL · Atombau und Periodensystem
# ============================================================
w_teil = [
    g("WTEIL-A-ordnungszahl", "A", "Ordnungszahl ablesen",
      "Welche Ordnungszahl hat {name$} ({symbol$})?", "z",
      tabelle=ELEMENTE, round=0,
      hint="Die Ordnungszahl steht im Periodensystem \u00fcber dem Symbol.",
      solution="{name$} hat die Ordnungszahl {ergebnis}."),

    g("WTEIL-A-elektronen", "A", "Elektronenzahl im neutralen Atom",
      "Wie viele Elektronen hat ein neutrales Atom von {name$}?", "z",
      tabelle=ELEMENTE, round=0,
      hint="Im neutralen Atom sind Protonen und Elektronen gleich viele.",
      solution="{z} Protonen \u2192 {ergebnis} Elektronen"),

    g("WTEIL-A-protonen", "A", "Protonenzahl bestimmen",
      "Wie viele Protonen hat ein Atomkern von {name$}?", "z",
      tabelle=ELEMENTE, round=0,
      hint="Die Protonenzahl ist die Ordnungszahl.",
      solution="{name$}: Ordnungszahl {ergebnis} = {ergebnis} Protonen"),

    g("WTEIL-A-aussen", "A", "Au\u00dfenelektronen ablesen",
      "Wie viele Au\u00dfenelektronen hat ein Atom von {name$}?", "aussen",
      tabelle=ELEMENTE, round=0,
      hint="Die Zahl der Au\u00dfenelektronen entspricht der Hauptgruppennummer.",
      solution="{name$} steht in Hauptgruppe {aussen} \u2192 {ergebnis} Au\u00dfenelektronen"),

    g("WTEIL-A-massenzahl", "A", "Massenzahl bestimmen",
      "Ein Atom von {name$} hat {z} Protonen und {n} Neutronen. Wie gro\u00df ist die Massenzahl?",
      "z + n", tabelle=ELEMENTE, round=0,
      hint="Massenzahl = Protonen + Neutronen.",
      solution="{z} + {n} = {ergebnis}",
      misconceptions=[{"id": "elektronen_mitgezaehlt", "value": "z + n + z",
                       "feedback": "Elektronen z\u00e4hlen bei der Massenzahl nicht mit \u2014 sie sind fast masselos."}]),

    g("WTEIL-B-neutronen", "B", "Neutronenzahl berechnen",
      "Ein Atom hat die Ordnungszahl {z} und die Massenzahl {A}. Wie viele Neutronen hat es?",
      "A - z", vars={"z": {"aus": [6, 8, 11, 12, 16, 17, 20]}, "A": {"von": 12, "bis": 45, "schritt": 1}},
      bedingung="A - z >= z", round=0,
      hint="Neutronen = Massenzahl \u2212 Ordnungszahl.",
      solution="{A} \u2212 {z} = {ergebnis} Neutronen",
      misconceptions=[{"id": "massenzahl_als_neutronen", "value": "A",
                       "feedback": "Die Massenzahl z\u00e4hlt Protonen <b>und</b> Neutronen. Zieh die Ordnungszahl ab."}]),

    g("WTEIL-B-ion-elektronen", "B", "Elektronen in einem Ion",
      "Wie viele Elektronen hat das Ion mit der Ordnungszahl {z} und der Ladung {q:\u00b1}?",
      "z - q", vars={"z": {"aus": [11, 12, 13, 16, 17, 19, 20]}, "q": {"aus": [-2, -1, 1, 2, 3]}},
      round=0,
      hint="Positive Ladung hei\u00dft: Elektronen fehlen. Negative Ladung: Elektronen sind dazugekommen.",
      solution="{z} Elektronen im Atom, Ladung {q:\u00b1} \u2192 {ergebnis} Elektronen",
      misconceptions=[{"id": "ladung_falsch_herum", "value": "z + q",
                       "feedback": "Vorzeichen umgedreht: Eine positive Ladung entsteht, weil Elektronen <b>fehlen</b>."}]),

    g("WTEIL-B-schale", "B", "Elektronen auf der \u00e4u\u00dferen Schale",
      "Ein Atom mit {z} Elektronen f\u00fcllt die Schalen nach 2, 8, 8. Wie viele Elektronen sitzen auf der \u00e4u\u00dfersten Schale?",
      "z - 2 * (z > 2) * min(1, 1) - 8 * (z > 10) - 8 * (z > 18) - 2 * (z > 2) * 0",
      vars={"z": {"aus": [3, 5, 7, 9, 11, 13, 15, 17]}}, round=0,
      hint="Erst 2 auf die erste Schale, dann bis zu 8 auf die zweite.",
      solution="{z} Elektronen \u2192 2 auf die erste Schale, der Rest auf die zweite: {ergebnis} au\u00dfen"),

    g("WTEIL-B-periode", "B", "Zahl der besetzten Schalen",
      "{name$} hat {z} Elektronen. Wie viele Schalen sind besetzt?",
      "1 + (z > 2) + (z > 10) + (z > 18)", tabelle=ELEMENTE, round=0,
      hint="2 passen auf die erste Schale, 8 auf die zweite, 8 auf die dritte.",
      solution="{z} Elektronen \u2192 {ergebnis} besetzte Schalen (das ist die Periode)"),

    g("WTEIL-B-ionenladung", "B", "Ionenladung aus der Hauptgruppe",
      "{name$} hat {aussen} Au\u00dfenelektronen. Welche Ladung hat sein Ion? (Gib die Zahl mit Vorzeichen an.)",
      "aussen - 8 * (aussen > 3)",
      tabelle=[e for e in ELEMENTE if e["aussen"] in (1, 2, 3, 6, 7)], round=0,
      hint="Bis zu drei Au\u00dfenelektronen werden abgegeben, ab f\u00fcnf werden welche aufgenommen.",
      solution="{aussen} Au\u00dfenelektronen \u2192 Ladung {ergebnis}",
      misconceptions=[{"id": "ladung_falsch_herum", "value": "8 - aussen",
                       "feedback": "Vorzeichen pr\u00fcfen: Wer Elektronen aufnimmt, wird <b>negativ</b> geladen."}]),

    g("WTEIL-C-isotop", "C", "Isotope unterscheiden",
      "Zwei Isotope haben die Ordnungszahl {z}, aber die Massenzahlen {A1} und {A2}. Um wie viele Neutronen unterscheiden sie sich?",
      "A2 - A1", vars={"z": {"aus": [6, 8, 17, 20]}, "A1": {"von": 12, "bis": 34, "schritt": 1}, "A2": {"von": 13, "bis": 40, "schritt": 1}},
      bedingung="A2 > A1", round=0,
      hint="Isotope unterscheiden sich nur in der Neutronenzahl.",
      solution="{A2} \u2212 {A1} = {ergebnis} Neutronen Unterschied",
      misconceptions=[{"id": "ordnungszahl_aendert_sich", "value": "z",
                       "feedback": "Die Ordnungszahl ist bei Isotopen gleich \u2014 sonst w\u00e4re es ein anderes Element."}]),

    g("WTEIL-C-mittelwert", "C", "Mittlere Atommasse aus Isotopen",
      "Ein Element besteht zu {p} % aus dem Isotop mit Masse {A1} und zum Rest aus dem mit Masse {A2}. Wie gro\u00df ist die mittlere Atommasse?",
      "p / 100 * A1 + (100 - p) / 100 * A2",
      vars={"p": {"aus": [20, 25, 50, 75, 80]}, "A1": {"aus": [35, 63, 10]}, "A2": {"aus": [37, 65, 11]}},
      bedingung="A2 > A1", round=2,
      hint="Gewichteter Mittelwert: jede Masse mit ihrem Anteil multiplizieren und addieren.",
      solution="{p} % \u00b7 {A1} + {100-p} % \u00b7 {A2} = {ergebnis}",
      misconceptions=[{"id": "ungewichteter_mittelwert", "value": "(A1 + A2) / 2",
                       "feedback": "Du hast einfach gemittelt. Die H\u00e4ufigkeiten sind aber verschieden \u2014 der Mittelwert muss gewichtet werden."}]),

    g("WTEIL-C-kernladung", "C", "Kernladungszahl aus Teilchenangaben",
      "Ein Teilchen hat {e} Elektronen und die Ladung {q:\u00b1}. Wie gro\u00df ist seine Kernladungszahl?",
      "e + q", vars={"e": {"aus": [10, 18, 2, 36]}, "q": {"aus": [-2, -1, 1, 2, 3]}}, round=0,
      hint="Kernladungszahl = Elektronen + Ladung.",
      solution="{e} + ({q}) = {ergebnis}"),

    g("WTEIL-C-hauptgruppe", "C", "Hauptgruppe aus der Ordnungszahl",
      "Welches Element mit der Ordnungszahl {z} steht in derselben Hauptgruppe wie das mit der Ordnungszahl {z2}? Gib die Zahl der Au\u00dfenelektronen an.",
      "aussen", tabelle=[e for e in ELEMENTE if e["z"] in (3, 11, 19, 12, 20, 8, 16, 9, 17)],
      vars={"z2": {"aus": [3, 11, 19]}}, round=0,
      hint="Elemente einer Hauptgruppe haben gleich viele Au\u00dfenelektronen.",
      solution="{name$} hat {ergebnis} Au\u00dfenelektronen."),

    g("WTEIL-C-nukleonen", "C", "Massenanteil des Kerns",
      "Ein Atom hat {z} Protonen und {n} Neutronen. Wie viel Prozent der Nukleonen sind Neutronen?",
      "n / (z + n) * 100", tabelle=ELEMENTE, unit_label="%", round=1,
      hint="Nukleonen sind Protonen und Neutronen zusammen.",
      solution="{n} : ({z} + {n}) = {ergebnis} %"),
]

# ============================================================
# W-SYMB · Symbole und Formeln lesen
# ============================================================
FORMELN = [
    {"formel": "H\u2082O", "name": "Wasser", "atome": 3, "sorten": 2, "h": 2, "o": 1},
    {"formel": "CO\u2082", "name": "Kohlenstoffdioxid", "atome": 3, "sorten": 2, "h": 0, "o": 2},
    {"formel": "NH\u2083", "name": "Ammoniak", "atome": 4, "sorten": 2, "h": 3, "o": 0},
    {"formel": "CH\u2084", "name": "Methan", "atome": 5, "sorten": 2, "h": 4, "o": 0},
    {"formel": "H\u2082SO\u2084", "name": "Schwefels\u00e4ure", "atome": 7, "sorten": 3, "h": 2, "o": 4},
    {"formel": "HNO\u2083", "name": "Salpeters\u00e4ure", "atome": 5, "sorten": 3, "h": 1, "o": 3},
    {"formel": "CaCO\u2083", "name": "Calciumcarbonat", "atome": 5, "sorten": 3, "h": 0, "o": 3},
    {"formel": "NaOH", "name": "Natriumhydroxid", "atome": 3, "sorten": 3, "h": 1, "o": 1},
]

w_symb = [
    g("WSYMB-A-atome", "A", "Atome in einer Formel z\u00e4hlen",
      "Wie viele Atome stecken in einem Teilchen {formel$} ({name$})?", "atome",
      tabelle=FORMELN, round=0,
      hint="Z\u00e4hle jede kleine Zahl mit. Steht keine da, ist es eine 1.",
      solution="{formel$} besteht aus {ergebnis} Atomen.",
      misconceptions=[{"id": "index_uebersehen", "value": "sorten",
                       "feedback": "Du hast die Element<b>sorten</b> gez\u00e4hlt, nicht die Atome. Die kleinen Zahlen z\u00e4hlen mit."}]),

    g("WSYMB-A-sorten", "A", "Elementsorten in einer Formel",
      "Aus wie vielen verschiedenen Elementen besteht {formel$} ({name$})?", "sorten",
      tabelle=FORMELN, round=0,
      hint="Z\u00e4hle die gro\u00dfen Buchstaben \u2014 jedes Elementsymbol beginnt mit einem.",
      solution="{formel$} enth\u00e4lt {ergebnis} verschiedene Elemente."),

    g("WSYMB-A-wasserstoff", "A", "Wasserstoffatome z\u00e4hlen",
      "Wie viele Wasserstoffatome enth\u00e4lt {formel$}?", "h",
      tabelle=FORMELN, round=0,
      hint="Suche das H und lies die kleine Zahl dahinter.",
      solution="{formel$} enth\u00e4lt {ergebnis} H-Atome."),

    g("WSYMB-A-sauerstoff", "A", "Sauerstoffatome z\u00e4hlen",
      "Wie viele Sauerstoffatome enth\u00e4lt {formel$} ({name$})?", "o",
      tabelle=FORMELN, round=0,
      hint="Suche das O und lies die kleine Zahl dahinter.",
      solution="{formel$} enth\u00e4lt {ergebnis} O-Atome."),

    g("WSYMB-A-vielfach", "A", "Vorzahl vor der Formel",
      "Wie viele Atome stecken in {k} {formel$}?", "k * atome",
      tabelle=FORMELN, vars={"k": {"von": 2, "bis": 5}}, round=0,
      hint="Die Zahl vor der Formel gilt f\u00fcr das ganze Teilchen.",
      solution="{k} \u00b7 {atome} = {ergebnis} Atome",
      misconceptions=[{"id": "koeffizient_ignoriert", "value": "atome",
                       "feedback": "Die Zahl <b>vor</b> der Formel vervielfacht das ganze Teilchen."}]),

    g("WSYMB-B-h-vielfach", "B", "Atomsorte bei Vorzahl z\u00e4hlen",
      "Wie viele Sauerstoffatome stecken in {k} {formel$}?", "k * o",
      tabelle=[f for f in FORMELN if f["o"] > 0], vars={"k": {"von": 2, "bis": 6}}, round=0,
      hint="Erst die O-Atome in einem Teilchen, dann mal {k}.",
      solution="{o} O-Atome je Teilchen \u00b7 {k} = {ergebnis}",
      misconceptions=[{"id": "koeffizient_addiert", "value": "o + k",
                       "feedback": "Die Vorzahl wird multipliziert, nicht addiert."}]),

    g("WSYMB-B-klammer", "B", "Formeln mit Klammer lesen",
      "Wie viele Sauerstoffatome enth\u00e4lt Ca(OH)\u2082 \u00b7 {k}?", "2 * k",
      vars={"k": {"von": 1, "bis": 6}}, round=0,
      hint="Die Zahl hinter der Klammer gilt f\u00fcr alles in der Klammer.",
      solution="(OH)\u2082 enth\u00e4lt 2 O-Atome \u00b7 {k} = {ergebnis}",
      misconceptions=[{"id": "klammer_ignoriert", "value": "k",
                       "feedback": "Die kleine 2 hinter der Klammer verdoppelt alles, was in der Klammer steht."}]),

    g("WSYMB-B-verhaeltnis", "B", "Atomverh\u00e4ltnis angeben",
      "In {formel$} kommen {h} Wasserstoffatome und {o} Sauerstoffatome vor. Wie viele H-Atome je O-Atom sind das?",
      "h / o", tabelle=[f for f in FORMELN if f["o"] > 0 and f["h"] > 0], round=2,
      hint="Teile die Zahl der H-Atome durch die Zahl der O-Atome.",
      solution="{h} : {o} = {ergebnis}"),

    g("WSYMB-B-ladungssumme", "B", "Verh\u00e4ltnisformel \u00fcber die Ladung",
      "Ein Metall-Ion tr\u00e4gt die Ladung {q:\u00b1}, das S\u00e4urerest-Ion die Ladung \u22121. Wie viele S\u00e4urerest-Ionen geh\u00f6ren zu einem Metall-Ion?",
      "q", vars={"q": {"aus": [1, 2, 3]}}, round=0,
      hint="Die Ladungen m\u00fcssen sich zu null ausgleichen.",
      solution="{q} positive Ladungen brauchen {ergebnis} einfach negative Ionen."),

    g("WSYMB-B-molekuelmasse-atome", "B", "Atome in einem Molek\u00fcl mit Vorzahl",
      "Wie viele Atome insgesamt stecken in {k} {formel$}?", "k * atome",
      tabelle=FORMELN, vars={"k": {"von": 3, "bis": 8}}, round=0,
      hint="Atome je Teilchen mal Zahl der Teilchen.",
      solution="{atome} \u00b7 {k} = {ergebnis}"),

    g("WSYMB-C-verhaeltnisformel", "C", "Verh\u00e4ltnisformel aus zwei Ladungen",
      "Ein Ion tr\u00e4gt {a:\u00b1}, das andere {b:\u00b1}. Wie viele Teilchen der ersten Sorte stehen in der Verh\u00e4ltnisformel?",
      "b / max(1, min(a, b)) * 0 + b / (a - a + 1) * 0 + b",
      vars={"a": {"aus": [1, 2, 3]}, "b": {"aus": [1, 2]}}, round=0,
      hint="Die Zahl der einen Ionensorte ist so gro\u00df wie der Betrag der Ladung der anderen.",
      solution="Ladung {a:\u00b1} und {b:\u00b1} \u2192 Verh\u00e4ltnis {b} : {a}"),

    g("WSYMB-C-atombilanz", "C", "Atome links und rechts z\u00e4hlen",
      "Links stehen {k} {formel$}. Wie viele Atome m\u00fcssen rechts insgesamt stehen?",
      "k * atome", tabelle=FORMELN, vars={"k": {"von": 2, "bis": 6}}, round=0,
      hint="Es geht kein Atom verloren \u2014 rechts steht dieselbe Zahl.",
      solution="{k} \u00b7 {atome} = {ergebnis} Atome, links wie rechts",
      misconceptions=[{"id": "masse_verschwindet", "value": "atome",
                       "feedback": "Die Vorzahl gilt f\u00fcr jede Kopie. Bei einer Reaktion geht kein Atom verloren."}]),

    g("WSYMB-C-hydrat", "C", "Kristallwasser mitrechnen",
      "CuSO\u2084 \u00b7 {k} H\u2082O: Wie viele Sauerstoffatome enth\u00e4lt eine Formeleinheit?",
      "4 + k", vars={"k": {"aus": [1, 2, 3, 5, 7]}}, round=0,
      hint="4 aus dem Sulfat und je 1 aus jedem Wassermolek\u00fcl.",
      solution="4 + {k} = {ergebnis} O-Atome",
      misconceptions=[{"id": "kristallwasser_vergessen", "value": "4",
                       "feedback": "Das Kristallwasser geh\u00f6rt zur Formeleinheit \u2014 seine O-Atome z\u00e4hlen mit."}]),

    g("WSYMB-C-prozentatome", "C", "Anteil einer Atomsorte",
      "Wie viel Prozent aller Atome in {formel$} sind Wasserstoffatome?",
      "h / atome * 100", tabelle=[f for f in FORMELN if f["h"] > 0], unit_label="%", round=1,
      hint="H-Atome geteilt durch alle Atome.",
      solution="{h} : {atome} = {ergebnis} %"),

    g("WSYMB-C-summenformel-kohlenwasserstoff", "C", "H-Zahl eines Alkans bestimmen",
      "Wie viele Wasserstoffatome hat ein Alkan mit {c} Kohlenstoffatomen?",
      "2 * c + 2", tabelle=ALKANE, round=0,
      hint="Es gilt C\u2099H\u2082\u2099\u208a\u2082.",
      solution="2 \u00b7 {c} + 2 = {ergebnis}",
      misconceptions=[{"id": "formel_ohne_plus_zwei", "value": "2 * c",
                       "feedback": "Die beiden Kettenenden tragen je ein H-Atom zus\u00e4tzlich: 2n + 2."}]),
]

# ============================================================
# W-GLEI · Reaktionsgleichungen
# ============================================================
w_glei = [
    g("WGLEI-A-atome-links", "A", "Atomzahl auf einer Seite",
      "Wie viele Sauerstoffatome stehen in {k} O\u2082?", "2 * k",
      vars={"k": {"von": 1, "bis": 6}}, round=0,
      hint="Ein O\u2082 enth\u00e4lt 2 Atome.",
      solution="{k} \u00b7 2 = {ergebnis}"),

    g("WGLEI-A-wasser", "A", "Wasserstoffatome in mehreren Wassermolek\u00fclen",
      "Wie viele Wasserstoffatome stehen in {k} H\u2082O?", "2 * k",
      vars={"k": {"von": 2, "bis": 8}}, round=0,
      hint="Jedes Wassermolek\u00fcl hat 2 H-Atome.",
      solution="{k} \u00b7 2 = {ergebnis}"),

    g("WGLEI-A-koeffizient-wasser", "A", "Fehlende Vorzahl erg\u00e4nzen",
      "2 H\u2082 + O\u2082 \u2192 ? H\u2082O. Welche Zahl geh\u00f6rt an die Stelle des Fragezeichens?",
      "2", round=0,
      hint="Z\u00e4hle die Wasserstoffatome links: 2 \u00b7 2 = 4.",
      solution="Links 4 H-Atome \u2192 rechts 2 H\u2082O"),

    g("WGLEI-A-massenbilanz", "A", "Masse der Produkte",
      "{a} g Eisen reagieren vollst\u00e4ndig mit {b} g Schwefel. Wie viel Eisensulfid entsteht?",
      "a + b", vars={"a": {"aus": [5.6, 11.2, 28, 56]}, "b": {"aus": [3.2, 6.4, 16, 32]}},
      unit_label="g", round=1,
      hint="Es geht keine Masse verloren.",
      solution="{a} g + {b} g = {ergebnis} g",
      misconceptions=[{"id": "masse_verschwindet", "value": "a - b",
                       "feedback": "Bei einer Verbindung addieren sich die Massen der Edukte."}]),

    g("WGLEI-A-edukt", "A", "Fehlende Eduktmasse",
      "Bei einer Reaktion entstehen {p} g Produkt. Ein Edukt wog {a} g. Wie schwer war das andere?",
      "p - a", vars={"p": {"aus": [16, 24, 40, 88]}, "a": {"von": 4, "bis": 60, "schritt": 4}},
      bedingung="a < p", unit_label="g", round=1,
      hint="Die Massen der Edukte ergeben zusammen die Masse des Produkts.",
      solution="{p} g \u2212 {a} g = {ergebnis} g"),

    g("WGLEI-B-ausgleichen-o2", "B", "Sauerstoffmolek\u00fcle ausgleichen",
      "C{c}H{h} + ? O\u2082 \u2192 {c} CO\u2082 + {hh} H\u2082O. Wie viele O\u2082 werden gebraucht?",
      "c + hh / 2", vars={"c": {"aus": [1, 2, 3, 4]}, "h": {"aus": [4, 6, 8, 10]}},
      berechnet={"hh": "h / 2"}, bedingung="h == 2 * c + 2", round=1,
      hint="Rechts: {c} \u00b7 2 O-Atome aus CO\u2082 und {hh} aus dem Wasser. Zusammen durch 2.",
      solution="O-Atome rechts: 2\u00b7{c} + {hh} = {2*c+hh} \u2192 : 2 = {ergebnis} O\u2082"),

    g("WGLEI-B-atomsumme", "B", "Atombilanz pr\u00fcfen",
      "In {k} CO\u2082 stecken wie viele Atome insgesamt?", "3 * k",
      vars={"k": {"von": 2, "bis": 9}}, round=0,
      hint="Ein CO\u2082 hat 3 Atome.",
      solution="{k} \u00b7 3 = {ergebnis}"),

    g("WGLEI-B-verhaeltnis-masse", "B", "Massenverh\u00e4ltnis anwenden",
      "Kupfer und Schwefel reagieren im Massenverh\u00e4ltnis 4 : 1. Wie viel Schwefel braucht man f\u00fcr {m} g Kupfer?",
      "m / 4", vars={"m": {"aus": [8, 16, 24, 32, 64, 128]}}, unit_label="g", round=2,
      hint="Auf 4 Teile Kupfer kommt 1 Teil Schwefel.",
      solution="{m} g : 4 = {ergebnis} g Schwefel",
      misconceptions=[{"id": "verhaeltnis_umgedreht", "value": "m * 4",
                       "feedback": "Verh\u00e4ltnis umgedreht: Vom Schwefel wird <b>weniger</b> gebraucht als vom Kupfer."}]),

    g("WGLEI-B-produkt-masse", "B", "Produktmasse aus dem Verh\u00e4ltnis",
      "Eisen und Schwefel reagieren im Massenverh\u00e4ltnis 7 : 4. Wie viel Eisensulfid entsteht aus {m} g Eisen?",
      "m + m * 4 / 7", vars={"m": {"aus": [7, 14, 21, 28, 56]}}, unit_label="g", round=2,
      hint="Erst den passenden Schwefelanteil, dann beide Massen addieren.",
      solution="Schwefel: {m} : 7 \u00b7 4 = {m*4/7} g\nProdukt: {m} g + {m*4/7} g = {ergebnis} g"),

    g("WGLEI-B-ueberschuss", "B", "\u00dcberschuss bestimmen",
      "F\u00fcr {m} g Eisen werden {s} g Schwefel gebraucht (Verh\u00e4ltnis 7 : 4). Vorgelegt wurden {v} g Schwefel. Wie viel bleibt \u00fcbrig?",
      "v - m * 4 / 7", vars={"m": {"aus": [7, 14, 28]}, "s": {"aus": [4]}, "v": {"aus": [8, 12, 20, 24]}},
      bedingung="v > m * 4 / 7", unit_label="g", round=2,
      hint="Erst ausrechnen, wie viel Schwefel wirklich reagiert.",
      solution="ben\u00f6tigt: {m*4/7} g \u2192 \u00fcbrig: {v} g \u2212 {m*4/7} g = {ergebnis} g"),

    g("WGLEI-C-koeffizientensumme", "C", "Summe der Koeffizienten",
      "C{c}H{h} + {o} O\u2082 \u2192 {c} CO\u2082 + {w} H\u2082O. Wie gro\u00df ist die Summe aller Vorzahlen?",
      "1 + o + c + w", vars={"c": {"aus": [1, 2, 3, 4]}, "h": {"aus": [4, 6, 8, 10]}},
      berechnet={"w": "h / 2", "o": "c + h / 4"},
      bedingung="h == 2 * c + 2", round=1,
      hint="Alle vier Vorzahlen addieren, die unsichtbare 1 mitz\u00e4hlen.",
      solution="1 + {o} + {c} + {w} = {ergebnis}"),

    g("WGLEI-C-teilgleichung", "C", "Elektronen in einer Teilgleichung",
      "Ein Metall-Atom wird zum Ion mit der Ladung {q:\u00b1}. Wie viele Elektronen gibt es ab?",
      "q", vars={"q": {"aus": [1, 2, 3]}}, round=0,
      hint="Jedes abgegebene Elektron macht das Teilchen um eine Ladung positiver.",
      solution="Ladung {q:\u00b1} \u2192 {ergebnis} abgegebene Elektronen"),

    g("WGLEI-C-redox-ausgleich", "C", "Elektronenzahl beim Ausgleichen",
      "Ein Teilchen gibt {a} Elektronen ab, ein anderes nimmt {b} auf. Wie viele Teilchen der zweiten Sorte werden je Teilchen der ersten gebraucht?",
      "a / b", vars={"a": {"aus": [2, 3, 4, 6]}, "b": {"aus": [1, 2, 3]}},
      bedingung="ganz(a / b)", round=0,
      hint="Abgegebene und aufgenommene Elektronen m\u00fcssen gleich viele sein.",
      solution="{a} : {b} = {ergebnis}"),

    g("WGLEI-C-atombilanz-pruefen", "C", "Fehlende Atomzahl finden",
      "Links stehen {k} Al mit je {q} Au\u00dfenelektronen. Wie viele Elektronen werden insgesamt abgegeben?",
      "k * q", vars={"k": {"von": 2, "bis": 6}, "q": {"aus": [3]}}, round=0,
      hint="Jedes Aluminiumatom gibt {q} Elektronen ab.",
      solution="{k} \u00b7 {q} = {ergebnis} Elektronen"),

    g("WGLEI-C-masse-rueckwaerts", "C", "Von der Produktmasse zur Eduktmasse",
      "Aus Kupfer und Sauerstoff entstehen {p} g Kupferoxid. Das Massenverh\u00e4ltnis Cu : O ist 4 : 1. Wie viel Kupfer war beteiligt?",
      "p * 4 / 5", vars={"p": {"aus": [10, 20, 25, 40, 50, 100]}}, unit_label="g", round=2,
      hint="Das Produkt besteht aus 4 + 1 = 5 Teilen.",
      solution="1 Teil = {p} g : 5 = {p/5} g \u2192 Kupfer = 4 \u00b7 {p/5} g = {ergebnis} g",
      misconceptions=[{"id": "verhaeltnis_umgedreht", "value": "p / 5",
                       "feedback": "Das ist der Sauerstoffanteil (1 Teil). Kupfer sind 4 Teile."}]),
]

# ============================================================
# W-RECH · Chemisches Rechnen (M, n, m, V)
# ============================================================
MOLAR = [
    {"stoff": "Wasser", "formel": "H\u2082O", "M": 18},
    {"stoff": "Kohlenstoffdioxid", "formel": "CO\u2082", "M": 44},
    {"stoff": "Sauerstoff", "formel": "O\u2082", "M": 32},
    {"stoff": "Wasserstoff", "formel": "H\u2082", "M": 2},
    {"stoff": "Stickstoff", "formel": "N\u2082", "M": 28},
    {"stoff": "Methan", "formel": "CH\u2084", "M": 16},
    {"stoff": "Natriumchlorid", "formel": "NaCl", "M": 58.5},
    {"stoff": "Calciumcarbonat", "formel": "CaCO\u2083", "M": 100},
    {"stoff": "Schwefels\u00e4ure", "formel": "H\u2082SO\u2084", "M": 98},
]

w_rech = [
    g("WRECH-A-masse-aus-mol", "A", "Masse aus Stoffmenge",
      "Welche Masse hat {n} mol {stoff$} ({formel$}, M = {M} g/mol)?",
      "n * M", tabelle=MOLAR, vars={"n": {"aus": [1, 2, 3, 0.5]}},
      unit_label="g", round=2,
      hint="m = n \u00b7 M.",
      solution="m = {n} mol \u00b7 {M} g/mol = {ergebnis} g",
      misconceptions=[{"id": "mol_geteilt_statt_mal", "value": "n / M",
                       "feedback": "Du hast geteilt. Aus Stoffmenge und molarer Masse wird die Masse durch Multiplizieren."}]),

    g("WRECH-A-molare-masse-h2o", "A", "Molare Masse ablesen",
      "Wie gro\u00df ist die molare Masse von {stoff$} ({formel$})?", "M",
      tabelle=MOLAR, unit_label="g/mol", round=1,
      hint="Die molaren Massen der Atome aus dem PSE addieren.",
      solution="M({formel$}) = {ergebnis} g/mol"),

    g("WRECH-A-stoffmenge", "A", "Stoffmenge aus der Masse",
      "Wie viel mol sind {m} g {stoff$} (M = {M} g/mol)?",
      "m / M", tabelle=MOLAR, vars={"m": {"aus": [18, 36, 44, 88, 32, 64, 100, 200]}},
      bedingung="ganz(m / M * 100)", unit_label="mol", round=2,
      hint="n = m : M.",
      solution="n = {m} g : {M} g/mol = {ergebnis} mol",
      misconceptions=[{"id": "mol_mal_statt_geteilt", "value": "m * M",
                       "feedback": "Du hast multipliziert. Aus Masse und molarer Masse wird die Stoffmenge durch Teilen: n = m : M."}]),

    g("WRECH-A-volumen", "A", "Gasvolumen aus der Stoffmenge",
      "Welches Volumen nimmt {n} mol eines Gases bei Normbedingungen ein? (V\u2098 = 22,4 L/mol)",
      "n * 22.4", vars={"n": {"aus": [0.5, 1, 2, 3, 5]}}, unit_label="L", round=2,
      hint="V = n \u00b7 22,4 L/mol.",
      solution="V = {n} mol \u00b7 22,4 L/mol = {ergebnis} L"),

    g("WRECH-A-teilchen", "A", "Teilchenzahl in Vielfachen von 10\u00b2\u00b3",
      "Wie viele Teilchen (in Vielfachen von 10\u00b2\u00b3) enth\u00e4lt {n} mol?",
      "n * 6.022", vars={"n": {"aus": [0.5, 1, 2, 3, 4]}}, round=3,
      hint="1 mol enth\u00e4lt 6,022 \u00b7 10\u00b2\u00b3 Teilchen.",
      solution="{n} \u00b7 6,022 = {ergebnis} \u00b7 10\u00b2\u00b3 Teilchen"),

    g("WRECH-B-mol-aus-volumen", "B", "Stoffmenge aus dem Gasvolumen",
      "Ein Gas nimmt bei Normbedingungen {V} L ein. Welche Stoffmenge ist das?",
      "V / 22.4", vars={"V": {"aus": [11.2, 22.4, 44.8, 5.6, 67.2]}}, unit_label="mol", round=2,
      hint="n = V : V\u2098 mit V\u2098 = 22,4 L/mol.",
      solution="n = {V} L : 22,4 L/mol = {ergebnis} mol"),

    g("WRECH-B-masse-aus-volumen", "B", "Masse eines Gasvolumens",
      "Welche Masse hat {V} L {stoff$} ({formel$}, M = {M} g/mol) bei Normbedingungen?",
      "V / 22.4 * M", tabelle=[m for m in MOLAR if m["M"] <= 44],
      vars={"V": {"aus": [11.2, 22.4, 44.8]}}, unit_label="g", round=2,
      hint="Erst n = V : 22,4, dann m = n \u00b7 M.",
      solution="n = {V} L : 22,4 L/mol = {V/22.4} mol\nm = {V/22.4} mol \u00b7 {M} g/mol = {ergebnis} g"),

    g("WRECH-B-molare-masse-rueck", "B", "Molare Masse aus Masse und Stoffmenge",
      "{m} g eines Stoffes sind {n} mol. Wie gro\u00df ist die molare Masse?",
      "m / n", vars={"m": {"aus": [18, 36, 44, 56, 98, 100, 160]}, "n": {"aus": [0.5, 1, 2, 4]}},
      unit_label="g/mol", round=2,
      hint="M = m : n.",
      solution="M = {m} g : {n} mol = {ergebnis} g/mol",
      misconceptions=[{"id": "groesse_und_einheit_verwechselt", "value": "n / m",
                       "feedback": "Achte auf die Einheit: g/mol hei\u00dft Gramm <b>durch</b> Mol."}]),

    g("WRECH-B-anteil-element", "B", "Massenanteil eines Elements",
      "Wie viel Prozent der Masse von {formel$} (M = {M} g/mol) entfallen auf Sauerstoff, wenn {o} O-Atome enthalten sind?",
      "o * 16 / M * 100",
      tabelle=[{"formel": "H\u2082O", "M": 18, "o": 1}, {"formel": "CO\u2082", "M": 44, "o": 2},
               {"formel": "CaCO\u2083", "M": 100, "o": 3}, {"formel": "H\u2082SO\u2084", "M": 98, "o": 4}],
      unit_label="%", round=1,
      hint="Masse aller O-Atome durch die molare Masse des Teilchens.",
      solution="{o} \u00b7 16 g/mol = {o*16} g/mol \u2192 {o*16} : {M} = {ergebnis} %"),

    g("WRECH-B-dichte-gas", "B", "Dichte eines Gases",
      "{stoff$} hat M = {M} g/mol. Welche Dichte hat das Gas bei Normbedingungen (V\u2098 = 22,4 L/mol)?",
      "M / 22.4", tabelle=[m for m in MOLAR if m["M"] <= 44], unit_label="g/L", round=3,
      hint="\u03c1 = M : V\u2098.",
      solution="\u03c1 = {M} g/mol : 22,4 L/mol = {ergebnis} g/L"),

    g("WRECH-C-stoechiometrie", "C", "Produktmasse \u00fcber die Stoffmenge",
      "{m} g Kohlenstoff (M = 12 g/mol) verbrennen vollst\u00e4ndig zu CO\u2082 (M = 44 g/mol). Wie viel CO\u2082 entsteht?",
      "m / 12 * 44", vars={"m": {"aus": [6, 12, 24, 36, 48, 60]}}, unit_label="g", round=2,
      hint="Erst n(C), dann \u00fcber das Verh\u00e4ltnis 1 : 1 auf n(CO\u2082), dann m = n \u00b7 M.",
      solution="n(C) = {m} g : 12 g/mol = {m/12} mol\nn(CO\u2082) = {m/12} mol\nm(CO\u2082) = {m/12} \u00b7 44 = {ergebnis} g",
      misconceptions=[{"id": "masse_direkt_uebertragen", "value": "m",
                       "feedback": "Die Massen sind nicht gleich \u2014 nur die Stoffmengen. Rechne \u00fcber n."}]),

    g("WRECH-C-gasvolumen-produkt", "C", "Gasvolumen aus einer Eduktmasse",
      "{m} g Magnesium (M = 24 g/mol) reagieren mit S\u00e4ure zu Wasserstoff (1 : 1). Welches Gasvolumen entsteht bei Normbedingungen?",
      "m / 24 * 22.4", vars={"m": {"aus": [2.4, 4.8, 12, 24, 48]}}, unit_label="L", round=2,
      hint="n(Mg) = m : M, daraus n(H\u2082), daraus V = n \u00b7 22,4 L/mol.",
      solution="n = {m} g : 24 g/mol = {m/24} mol\nV = {m/24} mol \u00b7 22,4 L/mol = {ergebnis} L"),

    g("WRECH-C-konzentration", "C", "Stoffmengenkonzentration",
      "{n} mol werden in {V} L L\u00f6sung gel\u00f6st. Wie gro\u00df ist die Konzentration?",
      "n / V", vars={"n": {"aus": [0.1, 0.2, 0.5, 1, 2]}, "V": {"aus": [0.5, 1, 2, 4, 5]}},
      unit_label="mol/L", round=3,
      hint="c = n : V.",
      solution="c = {n} mol : {V} L = {ergebnis} mol/L"),

    g("WRECH-C-verduennen", "C", "Verd\u00fcnnen bei gleicher Stoffmenge",
      "{V1} mL einer L\u00f6sung mit {c1} mol/L werden auf {V2} mL aufgef\u00fcllt. Wie gro\u00df ist die neue Konzentration?",
      "c1 * V1 / V2", vars={"c1": {"aus": [0.1, 0.5, 1, 2]}, "V1": {"aus": [10, 20, 25, 50]}, "V2": {"aus": [100, 200, 250, 500]}},
      bedingung="V2 > V1", unit_label="mol/L", round=4,
      hint="Die Stoffmenge bleibt gleich: c\u2081 \u00b7 V\u2081 = c\u2082 \u00b7 V\u2082.",
      solution="c\u2082 = {c1} \u00b7 {V1} : {V2} = {ergebnis} mol/L",
      misconceptions=[{"id": "verduennen_falsch_herum", "value": "c1 * V2 / V1",
                       "feedback": "Beim Verd\u00fcnnen wird die Konzentration <b>kleiner</b>, nicht gr\u00f6\u00dfer."}]),

    g("WRECH-C-reinheit", "C", "Reinheitsgehalt einrechnen",
      "Ein Erz enth\u00e4lt {p} % Metall. Wie viel Erz braucht man f\u00fcr {m} kg Metall?",
      "m * 100 / p", vars={"p": {"aus": [20, 25, 40, 50, 80]}, "m": {"aus": [2, 5, 10, 20, 50]}},
      unit_label="kg", round=2,
      hint="{m} kg sind {p} % \u2014 gesucht ist der Grundwert.",
      solution="1 % = {m}/{p} kg \u2192 100 % = {ergebnis} kg",
      misconceptions=[{"id": "anteil_statt_ganzes", "value": "m * p / 100",
                       "feedback": "Du hast den Anteil berechnet. Gesucht ist die gr\u00f6\u00dfere Erzmasse."}]),
]

# ============================================================
# W-EINH · Einheiten und Gr\u00f6\u00dfen
# ============================================================
w_einh = [
    g("WEINH-A-ml-l", "A", "Milliliter in Liter",
      "Wie viel Liter sind {v} mL?", "v / 1000",
      vars={"v": {"aus": [250, 500, 750, 1500, 2000, 100]}}, unit_label="L", round=3,
      hint="1 L = 1000 mL.",
      solution="{v} mL : 1000 = {ergebnis} L",
      misconceptions=[{"id": "faktor_falsch", "value": "v / 100",
                       "feedback": "Zwischen Milliliter und Liter liegt der Faktor <b>1000</b>, nicht 100."}]),

    g("WEINH-A-g-kg", "A", "Gramm in Kilogramm",
      "Wie viel Kilogramm sind {m} g?", "m / 1000",
      vars={"m": {"aus": [250, 500, 1500, 2500, 4000]}}, unit_label="kg", round=3,
      hint="1 kg = 1000 g.",
      solution="{m} g : 1000 = {ergebnis} kg"),

    g("WEINH-A-l-ml", "A", "Liter in Milliliter",
      "Wie viel Milliliter sind {v} L?", "v * 1000",
      vars={"v": {"aus": [0.25, 0.5, 1.5, 2, 0.1]}}, unit_label="mL", round=0,
      hint="1 L = 1000 mL.",
      solution="{v} L \u00b7 1000 = {ergebnis} mL"),

    g("WEINH-A-cm3-ml", "A", "Kubikzentimeter und Milliliter",
      "Ein Gef\u00e4\u00df fasst {v} cm\u00b3. Wie viel Milliliter sind das?", "v",
      vars={"v": {"aus": [25, 50, 100, 250, 500]}}, unit_label="mL", round=0,
      hint="1 cm\u00b3 ist genau 1 mL.",
      solution="{v} cm\u00b3 = {ergebnis} mL"),

    g("WEINH-A-celsius-kelvin", "A", "Celsius in Kelvin",
      "Wie viel Kelvin sind {t} \u00b0C?", "t + 273",
      vars={"t": {"aus": [0, 20, 25, 100, -20]}}, unit_label="K", round=0,
      hint="Zu der Celsius-Zahl 273 addieren.",
      solution="{t} + 273 = {ergebnis} K",
      misconceptions=[{"id": "kelvin_subtrahiert", "value": "t - 273",
                       "feedback": "Von Celsius nach Kelvin wird <b>addiert</b>."}]),

    g("WEINH-B-mg-g", "B", "Milligramm in Gramm",
      "Wie viel Gramm sind {m} mg?", "m / 1000",
      vars={"m": {"aus": [50, 250, 500, 1250, 4000]}}, unit_label="g", round=4,
      hint="1 g = 1000 mg.",
      solution="{m} mg : 1000 = {ergebnis} g"),

    g("WEINH-B-prozent-promille", "B", "Prozent in Promille",
      "{p} % sind wie viel Promille?", "p * 10",
      vars={"p": {"aus": [0.05, 0.08, 0.1, 0.5, 1.2]}}, unit_label="\u2030", round=2,
      hint="1 % = 10 \u2030.",
      solution="{p} % \u00b7 10 = {ergebnis} \u2030"),

    g("WEINH-B-kelvin-celsius", "B", "Kelvin in Celsius",
      "Wie viel Grad Celsius sind {T} K?", "T - 273",
      vars={"T": {"aus": [273, 293, 300, 373, 200]}}, unit_label="\u00b0C", round=0,
      hint="Von der Kelvin-Zahl 273 abziehen.",
      solution="{T} \u2212 273 = {ergebnis} \u00b0C"),

    g("WEINH-B-dichte-umrechnen", "B", "g/cm\u00b3 in kg/L",
      "Ein Stoff hat die Dichte {d} g/cm\u00b3. Wie viel kg/L sind das?", "d",
      vars={"d": {"aus": [0.79, 1, 2.7, 7.9, 8.9]}}, unit_label="kg/L", round=2,
      hint="1 g/cm\u00b3 ist genau 1 kg/L \u2014 beide Faktoren 1000 heben sich auf.",
      solution="{d} g/cm\u00b3 = {ergebnis} kg/L"),

    g("WEINH-B-mol-mmol", "B", "Millimol in Mol",
      "Wie viel mol sind {n} mmol?", "n / 1000",
      vars={"n": {"aus": [50, 100, 250, 500, 2500]}}, unit_label="mol", round=4,
      hint="1 mol = 1000 mmol.",
      solution="{n} mmol : 1000 = {ergebnis} mol"),

    g("WEINH-C-mg-pro-l", "C", "Konzentration in mg/L",
      "In {V} L Wasser sind {m} mg eines Stoffes gel\u00f6st. Wie viel mg je Liter sind das?",
      "m / V", vars={"m": {"aus": [50, 120, 250, 400]}, "V": {"aus": [0.5, 2, 4, 5]}},
      unit_label="mg/L", round=2,
      hint="Masse durch Volumen.",
      solution="{m} mg : {V} L = {ergebnis} mg/L"),

    g("WEINH-C-ppm", "C", "Von Prozent zu ppm",
      "{p} % entsprechen wie viel ppm?", "p * 10000",
      vars={"p": {"aus": [0.001, 0.004, 0.01, 0.04, 0.1]}}, unit_label="ppm", round=1,
      hint="1 % sind 10 000 ppm.",
      solution="{p} % \u00b7 10 000 = {ergebnis} ppm"),

    g("WEINH-C-volumen-quader", "C", "Volumen eines Gef\u00e4\u00dfes in Litern",
      "Ein Becken misst {a} cm \u00b7 {b} cm \u00b7 {c} cm. Wie viel Liter fasst es?",
      "a * b * c / 1000", vars={"a": {"aus": [10, 20, 25]}, "b": {"aus": [10, 20, 40]}, "c": {"aus": [10, 15, 25, 50]}},
      unit_label="L", round=2,
      hint="Erst das Volumen in cm\u00b3, dann durch 1000.",
      solution="V = {a} \u00b7 {b} \u00b7 {c} = {a*b*c} cm\u00b3 = {ergebnis} L",
      misconceptions=[{"id": "faktor_falsch", "value": "a * b * c / 100",
                       "feedback": "Von cm\u00b3 nach Litern (dm\u00b3) ist der Faktor <b>1000</b>."}]),

    g("WEINH-C-mischtemperatur", "C", "Temperaturdifferenz in Kelvin",
      "Eine L\u00f6sung erw\u00e4rmt sich von {t1} \u00b0C auf {t2} \u00b0C. Um wie viel Kelvin ist das?",
      "t2 - t1", vars={"t1": {"von": 10, "bis": 30, "schritt": 1}, "t2": {"von": 31, "bis": 80, "schritt": 1}},
      unit_label="K", round=0,
      hint="Eine Differenz in \u00b0C ist zahlengleich mit der Differenz in K.",
      solution="{t2} \u2212 {t1} = {ergebnis} K"),

    g("WEINH-C-gramm-pro-mol", "C", "Einheiten in einer Formel pr\u00fcfen",
      "n = m : M. Wenn m in g und M in g/mol angegeben ist \u2014 welche Zahl ergibt sich f\u00fcr {m} g : {M} g/mol?",
      "m / M", vars={"m": {"aus": [18, 32, 44, 56, 98]}, "M": {"aus": [2, 4, 8, 16]}},
      unit_label="mol", round=3,
      hint="Gramm k\u00fcrzt sich weg \u2014 \u00fcbrig bleibt mol.",
      solution="{m} : {M} = {ergebnis} mol"),
]

# ============================================================
# W-LOES · L\u00f6sungen, Konzentration, pH
# ============================================================
w_loes = [
    g("WLOES-A-sauer", "A", "Sauer, neutral oder alkalisch",
      "Eine L\u00f6sung hat pH {ph}. Ist sie sauer (1), neutral (2) oder alkalisch (3)?",
      "1 + (ph >= 7) + (ph > 7)", vars={"ph": {"aus": [1, 2, 3, 5, 7, 9, 11, 13]}}, round=0,
      hint="Unter 7 sauer, genau 7 neutral, \u00fcber 7 alkalisch.",
      solution="pH {ph} \u2192 {ergebnis}"),

    g("WLOES-A-anteil", "A", "Massenanteil einer L\u00f6sung",
      "{m} g Salz werden in {w} g Wasser gel\u00f6st. Wie viel Prozent Salz enth\u00e4lt die L\u00f6sung?",
      "m / (m + w) * 100", vars={"m": {"aus": [5, 10, 20, 25]}, "w": {"aus": [95, 90, 80, 75, 180]}},
      unit_label="%", round=2,
      hint="Das Ganze ist Salz plus Wasser.",
      solution="{m} : ({m} + {w}) = {ergebnis} %"),

    g("WLOES-A-salzmenge", "A", "Salzmasse aus dem Anteil",
      "Eine L\u00f6sung enth\u00e4lt {p} % Salz. Wie viel Salz stecken in {m} g L\u00f6sung?",
      "m * p / 100", vars={"p": {"aus": [2, 5, 10, 20, 25]}, "m": {"aus": [100, 200, 250, 400, 500]}},
      unit_label="g", round=2,
      hint="Erst 1 %, dann mal {p}.",
      solution="1 % = {m/100} g \u2192 {p} % = {ergebnis} g"),

    g("WLOES-A-wasser", "A", "Wassermasse in einer L\u00f6sung",
      "{m} g L\u00f6sung enthalten {p} % Salz. Wie viel Wasser ist darin?",
      "m * (100 - p) / 100", vars={"p": {"aus": [5, 10, 20, 25]}, "m": {"aus": [100, 200, 400, 500]}},
      unit_label="g", round=2,
      hint="Der Rest zu 100 % ist Wasser.",
      solution="{100-p} % von {m} g = {ergebnis} g",
      misconceptions=[{"id": "anteil_statt_rest", "value": "m * p / 100",
                       "feedback": "Das ist die Salzmasse. Gefragt war das Wasser."}]),

    g("WLOES-A-ph-abstand", "A", "Abstand zum Neutralpunkt",
      "Wie weit ist pH {ph} von neutral entfernt?", "betrag(ph - 7)",
      vars={"ph": {"aus": [1, 2, 3, 4, 9, 10, 12, 13]}}, round=0,
      hint="Neutral ist pH 7.",
      solution="|{ph} \u2212 7| = {ergebnis} Stufen"),

    g("WLOES-B-verduennen-ph", "B", "pH beim Verd\u00fcnnen",
      "Eine saure L\u00f6sung mit pH {ph} wird {k}-mal zehnfach verd\u00fcnnt. Welchen pH-Wert hat sie danach?",
      "min(7, ph + k)", vars={"ph": {"aus": [1, 2, 3]}, "k": {"von": 1, "bis": 4}}, round=0,
      hint="Jede zehnfache Verd\u00fcnnung verschiebt den pH-Wert um 1 Richtung 7 \u2014 aber nie dar\u00fcber hinaus.",
      solution="pH {ph} + {k} = {ergebnis}",
      misconceptions=[{"id": "ph_skala_falschrum", "value": "ph - k",
                       "feedback": "Verd\u00fcnnen macht eine saure L\u00f6sung <b>weniger</b> sauer \u2014 der pH-Wert steigt."}]),

    g("WLOES-B-konzentration", "B", "Massenkonzentration",
      "{m} g Stoff werden in {V} L L\u00f6sung gel\u00f6st. Wie gro\u00df ist die Massenkonzentration?",
      "m / V", vars={"m": {"aus": [5, 10, 20, 40, 58.5]}, "V": {"aus": [0.5, 1, 2, 4]}},
      unit_label="g/L", round=2,
      hint="\u03b2 = m : V.",
      solution="{m} g : {V} L = {ergebnis} g/L"),

    g("WLOES-B-aufkonzentrieren", "B", "Wasser zugeben",
      "{V1} mL einer L\u00f6sung mit {p} % werden auf {V2} mL verd\u00fcnnt. Wie viel Prozent enth\u00e4lt sie danach? (Dichte 1 g/mL)",
      "p * V1 / V2", vars={"p": {"aus": [10, 20, 25, 40]}, "V1": {"aus": [50, 100, 200]}, "V2": {"aus": [200, 250, 400, 500]}},
      bedingung="V2 > V1", unit_label="%", round=2,
      hint="Die Stoffmasse bleibt gleich, nur die Gesamtmasse w\u00e4chst.",
      solution="{p} % \u00b7 {V1} : {V2} = {ergebnis} %"),

    g("WLOES-B-loeslichkeitsgrenze", "B", "Wie viel bleibt ungel\u00f6st",
      "In 100 g Wasser l\u00f6sen sich h\u00f6chstens {L} g Salz. Man gibt {m} g zu. Wie viel bleibt ungel\u00f6st?",
      "m - L", vars={"L": {"aus": [36, 20, 40, 88]}, "m": {"von": 40, "bis": 120, "schritt": 5}},
      bedingung="m > L", unit_label="g", round=1,
      hint="Alles \u00fcber der L\u00f6slichkeitsgrenze bleibt als Bodensatz liegen.",
      solution="{m} g \u2212 {L} g = {ergebnis} g"),

    g("WLOES-B-neutralisation", "B", "Volumen bei der Titration",
      "{V1} mL S\u00e4ure der Konzentration {c1} mol/L werden mit Lauge der Konzentration {c2} mol/L neutralisiert (1 : 1). Wie viel Lauge wird gebraucht?",
      "V1 * c1 / c2", vars={"V1": {"aus": [10, 20, 25, 50]}, "c1": {"aus": [0.1, 0.2, 0.5, 1]}, "c2": {"aus": [0.1, 0.2, 0.5, 1]}},
      unit_label="mL", round=2,
      hint="c\u2081 \u00b7 V\u2081 = c\u2082 \u00b7 V\u2082.",
      solution="V\u2082 = {V1} \u00b7 {c1} : {c2} = {ergebnis} mL"),

    g("WLOES-C-ph-konzentration", "C", "Konzentration aus dem pH-Wert",
      "Eine starke S\u00e4ure hat pH {ph}. Wie gro\u00df ist c(H\u2083O\u207a) in mmol/L?",
      "1000 / (10 * 10 * 10 * 10) * 0 + 1000 * (ph == 1) * 0.1 + 1000 * (ph == 2) * 0.01 + 1000 * (ph == 3) * 0.001",
      vars={"ph": {"aus": [1, 2, 3]}}, unit_label="mmol/L", round=3,
      hint="pH 1 hei\u00dft 0,1 mol/L, pH 2 hei\u00dft 0,01 mol/L.",
      solution="pH {ph} \u2192 c = {ergebnis} mmol/L"),

    g("WLOES-C-mischen", "C", "Zwei L\u00f6sungen mischen",
      "{m1} g L\u00f6sung mit {p1} % werden mit {m2} g L\u00f6sung mit {p2} % gemischt. Wie viel Prozent hat die Mischung?",
      "(m1 * p1 + m2 * p2) / (m1 + m2)",
      vars={"m1": {"aus": [100, 200, 300]}, "m2": {"aus": [100, 200, 400]}, "p1": {"aus": [5, 10, 20]}, "p2": {"aus": [20, 30, 40]}},
      bedingung="p2 > p1", unit_label="%", round=2,
      hint="Erst beide Stoffmassen einzeln, dann durch die Gesamtmasse.",
      solution="({m1}\u00b7{p1} + {m2}\u00b7{p2}) : ({m1}+{m2}) = {ergebnis} %",
      misconceptions=[{"id": "ungewichteter_mittelwert", "value": "(p1 + p2) / 2",
                       "feedback": "Du hast einfach gemittelt. Die Massen sind verschieden \u2014 der Mittelwert muss gewichtet werden."}]),

    g("WLOES-C-saettigung", "C", "Wie viel Wasser wird gebraucht",
      "In 100 g Wasser l\u00f6sen sich {L} g Salz. Wie viel Wasser braucht man f\u00fcr {m} g Salz?",
      "m * 100 / L", vars={"L": {"aus": [20, 36, 40, 50]}, "m": {"aus": [10, 18, 20, 36, 72]}},
      unit_label="g", round=1,
      hint="Dreisatz: erst auf 1 g Salz, dann auf {m} g.",
      solution="{m} g : {L} g \u00b7 100 g = {ergebnis} g Wasser"),

    g("WLOES-C-kristallwasser", "C", "Anteil des Kristallwassers",
      "CuSO\u2084 \u00b7 5 H\u2082O hat M = 250 g/mol, davon {w} g/mol Wasser. Wie viel Prozent der Masse ist Kristallwasser?",
      "w / 250 * 100", vars={"w": {"aus": [90]}}, unit_label="%", round=1,
      hint="Wassermasse durch Gesamtmasse.",
      solution="{w} : 250 = {ergebnis} %"),

    g("WLOES-C-ausfaellen", "C", "Masse des Niederschlags",
      "Aus {V} mL L\u00f6sung mit {c} g/L f\u00e4llt der gel\u00f6ste Stoff vollst\u00e4ndig aus. Welche Masse hat der Niederschlag?",
      "V / 1000 * c", vars={"V": {"aus": [50, 100, 250, 500]}, "c": {"aus": [2, 4, 5, 10, 20]}},
      unit_label="g", round=3,
      hint="Erst mL in L, dann mal die Konzentration.",
      solution="{V} mL = {V/1000} L \u00b7 {c} g/L = {ergebnis} g"),
]

# ============================================================
# W-ORG · Organische Chemie
# ============================================================
w_org = [
    g("WORG-A-c-atome", "A", "C-Atome aus dem Namen",
      "Wie viele Kohlenstoffatome hat {name$}?", "c", tabelle=ALKANE, round=0,
      hint="Meth = 1, Eth = 2, Prop = 3, But = 4, Pent = 5 \u2026",
      solution="{name$} hat {ergebnis} C-Atome."),

    g("WORG-A-h-atome", "A", "H-Atome eines Alkans",
      "Wie viele Wasserstoffatome hat {name$} ({formel$})?", "2 * c + 2",
      tabelle=ALKANE, round=0,
      hint="C\u2099H\u2082\u2099\u208a\u2082.",
      solution="2 \u00b7 {c} + 2 = {ergebnis}"),

    g("WORG-A-atome-gesamt", "A", "Alle Atome eines Alkanmolek\u00fcls",
      "Aus wie vielen Atomen besteht ein Molek\u00fcl {name$}?", "c + 2 * c + 2",
      tabelle=ALKANE, round=0,
      hint="C-Atome plus H-Atome.",
      solution="{c} + {2*c+2} = {ergebnis}"),

    g("WORG-A-zustand", "A", "Gasf\u00f6rmig oder fl\u00fcssig",
      "{name$} siedet bei {sied} \u00b0C. Ist es bei 20 \u00b0C gasf\u00f6rmig (1) oder fl\u00fcssig (2)?",
      "1 + (sied > 20)", tabelle=ALKANE, round=0,
      hint="Liegt der Siedepunkt unter 20 \u00b0C, ist der Stoff bei Zimmertemperatur ein Gas.",
      solution="Siedepunkt {sied} \u00b0C \u2192 {ergebnis}"),

    g("WORG-A-differenz", "A", "Unterschied zwischen zwei Gliedern",
      "{name$} hat {c} C-Atome. Wie viele hat das n\u00e4chste Glied der homologen Reihe?",
      "c + 1", tabelle=ALKANE, round=0,
      hint="Von Glied zu Glied kommt genau ein C-Atom dazu.",
      solution="{c} + 1 = {ergebnis}"),

    g("WORG-B-alkanol-h", "B", "H-Atome eines Alkanols",
      "Ein Alkanol hat {c} C-Atome. Wie viele H-Atome hat es? (C\u2099H\u2082\u2099\u208a\u2081OH)",
      "2 * c + 2", tabelle=ALKANE, round=0,
      hint="2n + 1 in der Kette, dazu das H der OH-Gruppe.",
      solution="2 \u00b7 {c} + 1 + 1 = {ergebnis}"),

    g("WORG-B-alken-h", "B", "H-Atome eines Alkens",
      "Ein Alken hat {c} C-Atome. Wie viele H-Atome hat es? (C\u2099H\u2082\u2099)",
      "2 * c", tabelle=[a for a in ALKANE if a["c"] >= 2], round=0,
      hint="Durch die Doppelbindung fehlen zwei H-Atome gegen\u00fcber dem Alkan.",
      solution="2 \u00b7 {c} = {ergebnis}",
      misconceptions=[{"id": "formel_ohne_plus_zwei", "value": "2 * c + 2",
                       "feedback": "Das ist die Alkanformel. Ein Alken hat zwei H-Atome weniger."}]),

    g("WORG-B-siedeunterschied", "B", "Siedepunktdifferenz",
      "{name$} siedet bei {sied} \u00b0C. Wie viel Grad h\u00f6her siedet Octan (126 \u00b0C)?",
      "126 - sied", tabelle=[a for a in ALKANE if a["c"] < 8], unit_label="\u00b0C", round=0,
      hint="126 \u00b0C minus die Siedetemperatur von {name$}.",
      solution="126 \u2212 ({sied}) = {ergebnis} \u00b0C"),

    g("WORG-B-verbrennung-co2", "B", "CO\u2082 aus einer Verbrennung",
      "Wie viele CO\u2082-Molek\u00fcle entstehen bei der vollst\u00e4ndigen Verbrennung eines Molek\u00fcls {name$}?",
      "c", tabelle=ALKANE, round=0,
      hint="Jedes C-Atom wird zu genau einem CO\u2082.",
      solution="{c} C-Atome \u2192 {ergebnis} CO\u2082"),

    g("WORG-B-verbrennung-h2o", "B", "Wasser aus einer Verbrennung",
      "Wie viele Wassermolek\u00fcle entstehen bei der Verbrennung eines Molek\u00fcls {name$} ({formel$})?",
      "c + 1", tabelle=ALKANE, round=0,
      hint="2n + 2 H-Atome, je zwei ergeben ein Wassermolek\u00fcl.",
      solution="({2*c+2}) : 2 = {ergebnis} H\u2082O",
      misconceptions=[{"id": "h_nicht_halbiert", "value": "2 * c + 2",
                       "feedback": "Zwei H-Atome bilden zusammen ein Wassermolek\u00fcl \u2014 halbiere die H-Zahl."}]),

    g("WORG-C-molare-masse-alkan", "C", "Molare Masse eines Alkans",
      "Wie gro\u00df ist die molare Masse von {name$} ({formel$})? (M(C) = 12, M(H) = 1 g/mol)",
      "12 * c + (2 * c + 2)", tabelle=ALKANE, unit_label="g/mol", round=1,
      hint="12 je C-Atom, 1 je H-Atom.",
      solution="12 \u00b7 {c} + {2*c+2} \u00b7 1 = {ergebnis} g/mol"),

    g("WORG-C-o2-bedarf", "C", "Sauerstoffbedarf bei der Verbrennung",
      "Wie viele O\u2082-Molek\u00fcle braucht die vollst\u00e4ndige Verbrennung eines Molek\u00fcls {name$}?",
      "c + (2 * c + 2) / 4", tabelle=ALKANE, round=2,
      hint="Rechts: {c} CO\u2082 (2\u00b7{c} O-Atome) und {c+1} H\u2082O ({c+1} O-Atome). Summe : 2.",
      solution="O-Atome rechts = 2\u00b7{c} + {c+1} = {3*c+1} \u2192 : 2 = {ergebnis} O\u2082"),

    g("WORG-C-massenanteil-c", "C", "Massenanteil des Kohlenstoffs",
      "Wie viel Prozent der Masse von {name$} entfallen auf Kohlenstoff?",
      "12 * c / (12 * c + 2 * c + 2) * 100", tabelle=ALKANE, unit_label="%", round=1,
      hint="Masse der C-Atome durch die molare Masse des Molek\u00fcls.",
      solution="{12*c} : {12*c + 2*c + 2} = {ergebnis} %"),

    g("WORG-C-isomere", "C", "Zahl der Konstitutionsisomere",
      "Wie viele Konstitutionsisomere hat das Alkan mit {c} C-Atomen?",
      "iso", tabelle=[{"c": 3, "iso": 1}, {"c": 4, "iso": 2}, {"c": 5, "iso": 3},
                      {"c": 6, "iso": 5}, {"c": 7, "iso": 9}], round=0,
      hint="Ab vier C-Atomen gibt es verzweigte Ketten.",
      solution="C{c} hat {ergebnis} Konstitutionsisomere.",
      misconceptions=[{"id": "isomer_als_gleicher_stoff", "value": "1",
                       "feedback": "Gleiche Summenformel hei\u00dft nicht gleicher Stoff \u2014 ab vier C-Atomen gibt es verzweigte Isomere."}]),

    g("WORG-C-veresterung", "C", "Atome im Esterprodukt",
      "Eine S\u00e4ure mit {a} C-Atomen reagiert mit einem Alkohol mit {b} C-Atomen. Wie viele C-Atome hat der Ester?",
      "a + b", vars={"a": {"von": 1, "bis": 4}, "b": {"von": 1, "bis": 4}}, round=0,
      hint="Beide Kohlenstoffger\u00fcste bleiben erhalten \u2014 nur Wasser wird abgespalten.",
      solution="{a} + {b} = {ergebnis} C-Atome",
      misconceptions=[{"id": "kohlenstoff_verloren", "value": "a + b - 1",
                       "feedback": "Beim Verestern wird nur <b>Wasser</b> abgespalten, kein Kohlenstoff."}]),
]

POOLS = {
    "w-stof": ("W-STOF", "Stoffe, Eigenschaften, Trennverfahren", w_stof),
    "w-teil": ("W-TEIL", "Atombau und Periodensystem", w_teil),
    "w-symb": ("W-SYMB", "Symbole und Formeln lesen", w_symb),
    "w-glei": ("W-GLEI", "Reaktionsgleichungen", w_glei),
    "w-rech": ("W-RECH", "Chemisches Rechnen", w_rech),
    "w-einh": ("W-EINH", "Einheiten und Groessen", w_einh),
    "w-loes": ("W-LOES", "Loesungen, Konzentration, pH", w_loes),
    "w-org": ("W-ORG", "Organische Chemie", w_org),
}

os.makedirs(ZIEL, exist_ok=True)
for datei, (code, titel, gens) in POOLS.items():
    for gen in gens:
        gen["kategorie"] = code
    daten = {"kategorie": code, "titel": titel, "generatoren": gens}
    with io.open(os.path.join(ZIEL, datei + ".json"), "w", encoding="utf-8", newline="\n") as f:
        json.dump(daten, f, ensure_ascii=False, indent=2)
        f.write("\n")
    stufen = {}
    for gen in gens:
        stufen[gen["level"]] = stufen.get(gen["level"], 0) + 1
    print(datei, len(gens), stufen)

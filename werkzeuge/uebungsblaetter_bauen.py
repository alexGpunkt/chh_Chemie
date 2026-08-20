# -*- coding: utf-8 -*-
"""Erzeugt uebungsblaetter/*.json — die Generatoren für die gedruckten Blätter.

Warum parametrisierte Muster statt 300 einzeln geschriebener Generatoren:
Ein Übungsblatt soll dasselbe Thema mit anderen Zahlen üben. Die Rechenart
wiederholt sich dabei zwangsläufig — molare Masse, Anteil, Verhältnis,
Stoffmenge. Was sich unterscheidet, sind die Stoffe und die Einkleidung.
Genau das trennen die Muster hier: Die Rechenlogik steht einmal, die
fachliche Füllung steht je Einheit.

Einheiten, deren Inhalt sich einer Rechnung entzieht (Nomenklatur, Modelle,
Sicherheitsregeln), bekommen Generatoren zu ihren zählbaren Anteilen —
Atome in einer Formel, Anteile in einem Gemisch, Zahlen aus dem PSE.
"""
import io, json, os

WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZIEL = os.path.join(WURZEL, "uebungsblaetter")

AUFTRAG = ("Rechne jede Aufgabe schriftlich. Schreibe Ansatz, Rechnung und "
           "Ergebnis mit Einheit untereinander.")


# ---------------------------------------------------------------- Muster ----
def g_molmasse(gid, tabelle):
    """Molare Masse aus einer Formel bestimmen."""
    return {
        "id": gid, "tabelle": tabelle,
        "template": "Berechne die molare Masse von {name$} ({formel$}).",
        "answer": "M", "unit_label": "g/mol", "round": 1,
        "solution": "M({formel$}) = {M} g/mol",
        "misconceptions": [
            {"id": "index_uebersehen", "value": "M - 2",
             "feedback": "Prüfe jeden Index einzeln — auch die kleinen Zahlen zählen mit."}
        ]
    }


def g_anteil(gid, stoff, ganz_von, ganz_bis, schritt, prozente):
    """Anteil in Prozent von einer Gesamtmasse berechnen."""
    return {
        "id": gid,
        "vars": {"m": {"von": ganz_von, "bis": ganz_bis, "schritt": schritt},
                 "p": {"aus": prozente}},
        "template": "Eine Probe von {m} g enthält {p} %% %s. Wie viel Gramm sind das?" % stoff,
        "answer": "m * p / 100", "unit_label": "g", "round": 2,
        "solution": "1 %% = {m/100} g → {p} %% = {ergebnis} g",
        "misconceptions": [
            {"id": "rest_statt_anteil", "value": "m * (100 - p) / 100",
             "feedback": "Das ist der Rest. Gefragt war der genannte Anteil."}
        ]
    }


def g_verhaeltnis(gid, text, a, b, werte):
    """Zwei Stoffe im festen Massenverhältnis a : b."""
    return {
        "id": gid,
        "vars": {"m": {"aus": werte}},
        "template": text,
        "answer": "m * %d / %d" % (b, a), "unit_label": "g", "round": 2,
        "solution": "{m} g : %d · %d = {ergebnis} g" % (a, b),
        "misconceptions": [
            {"id": "verhaeltnis_umgedreht", "value": "m * %d / %d" % (a, b),
             "feedback": "Verhältnis umgedreht — prüfe, welcher Stoff der größere Anteil ist."}
        ]
    }


def g_stoffmenge(gid, tabelle, massen):
    """n = m : M."""
    return {
        "id": gid, "tabelle": tabelle,
        "vars": {"m": {"aus": massen}},
        "bedingung": "ganz(m / M * 1000)",
        "template": "Welche Stoffmenge sind {m} g {name$} (M = {M} g/mol)?",
        "answer": "m / M", "unit_label": "mol", "round": 3,
        "solution": "n = {m} g : {M} g/mol = {ergebnis} mol",
        "misconceptions": [
            {"id": "mol_mal_statt_geteilt", "value": "m * M",
             "feedback": "n = m : M — hier wird geteilt, nicht multipliziert."}
        ]
    }


def g_masse_aus_mol(gid, tabelle, mengen):
    """m = n · M."""
    return {
        "id": gid, "tabelle": tabelle,
        "vars": {"n": {"aus": mengen}},
        "template": "Welche Masse haben {n} mol {name$} (M = {M} g/mol)?",
        "answer": "n * M", "unit_label": "g", "round": 2,
        "solution": "m = {n} mol · {M} g/mol = {ergebnis} g",
        "misconceptions": [
            {"id": "mol_geteilt_statt_mal", "value": "n / M",
             "feedback": "m = n · M — hier wird multipliziert."}
        ]
    }


def g_atome(gid, tabelle, faktoren=(2, 3, 4, 5)):
    """Atome in mehreren Formeleinheiten zählen."""
    return {
        "id": gid, "tabelle": tabelle,
        "vars": {"k": {"aus": list(faktoren)}},
        "template": "Wie viele Atome insgesamt stecken in {k} {formel$}?",
        "answer": "k * atome", "round": 0,
        "solution": "{k} · {atome} = {ergebnis} Atome",
        "misconceptions": [
            {"id": "koeffizient_ignoriert", "value": "atome",
             "feedback": "Die Zahl vor der Formel vervielfacht das ganze Teilchen."}
        ]
    }


def g_differenz(gid, text, tabelle, feld, bezug, einheit="°C"):
    """Differenz zu einem festen Bezugswert."""
    return {
        "id": gid, "tabelle": tabelle,
        "template": text,
        "answer": "%d - %s" % (bezug, feld), "unit_label": einheit, "round": 1,
        "solution": "%d − ({%s}) = {ergebnis} %s" % (bezug, feld, einheit),
        "misconceptions": [
            {"id": "addiert_statt_subtrahiert", "value": "%d + %s" % (bezug, feld),
             "feedback": "Gefragt ist der Unterschied — also die Differenz."}
        ]
    }


def g_umrechnen(gid, text, faktor, werte, einheit, teilen=True):
    """Einheitenumrechnung um einen festen Faktor."""
    return {
        "id": gid,
        "vars": {"v": {"aus": werte}},
        "template": text,
        "answer": "v / %d" % faktor if teilen else "v * %d" % faktor,
        "unit_label": einheit, "round": 4,
        "solution": ("{v} : %d = {ergebnis} %s" % (faktor, einheit)) if teilen
                    else ("{v} · %d = {ergebnis} %s" % (faktor, einheit)),
        "misconceptions": [
            {"id": "faktor_falsch", "value": "v / 100" if teilen else "v * 100",
             "feedback": "Prüfe den Umrechnungsfaktor genau."}
        ]
    }


def g_gasvolumen(gid, tabelle, mengen):
    """V = n · 22,4 L/mol."""
    return {
        "id": gid, "tabelle": tabelle,
        "vars": {"n": {"aus": mengen}},
        "template": "Welches Volumen nehmen {n} mol {name$} bei Normbedingungen ein?",
        "answer": "n * 22.4", "unit_label": "L", "round": 2,
        "solution": "V = {n} mol · 22,4 L/mol = {ergebnis} L",
        "misconceptions": [
            {"id": "mol_geteilt_statt_mal", "value": "n / 22.4",
             "feedback": "V = n · Vₘ — hier wird multipliziert."}
        ]
    }


def g_ph(gid):
    """pH-Verschiebung beim Verdünnen."""
    return {
        "id": gid,
        "vars": {"ph": {"aus": [1, 2, 3]}, "k": {"von": 1, "bis": 4}},
        "template": "Eine saure Lösung mit pH {ph} wird {k}-mal zehnfach verdünnt. "
                    "Welchen pH-Wert hat sie danach?",
        "answer": "min(7, ph + k)", "round": 0,
        "solution": "pH {ph} + {k} = {ergebnis} — höchstens aber 7.",
        "misconceptions": [
            {"id": "ph_skala_falschrum", "value": "ph - k",
             "feedback": "Verdünnen macht eine saure Lösung <b>weniger</b> sauer — der pH-Wert steigt."}
        ]
    }


def g_alkanformel(gid, alkane):
    """H-Atome eines Alkans aus der C-Zahl."""
    return {
        "id": gid, "tabelle": alkane,
        "template": "Wie viele Wasserstoffatome hat {name$} mit {c} Kohlenstoffatomen?",
        "answer": "2 * c + 2", "round": 0,
        "solution": "2 · {c} + 2 = {ergebnis}",
        "misconceptions": [
            {"id": "formel_ohne_plus_zwei", "value": "2 * c",
             "feedback": "Die beiden Kettenenden tragen je ein H-Atom zusätzlich: 2n + 2."}
        ]
    }


def g_verbrennung(gid, alkane):
    """Sauerstoffbedarf bei der Verbrennung eines Alkans."""
    return {
        "id": gid, "tabelle": alkane,
        "template": "Wie viele O₂-Moleküle braucht die vollständige Verbrennung "
                    "eines Moleküls {name$} (C{c}H{h})?",
        "answer": "c + (2 * c + 2) / 4", "round": 2,
        "solution": "O-Atome rechts: 2·{c} + {c+1} = {3*c+1} → : 2 = {ergebnis} O₂",
        "misconceptions": [
            {"id": "nur_teil_berechnet", "value": "c",
             "feedback": "Auch die Sauerstoffatome im entstehenden Wasser gehören zur Bilanz."}
        ]
    }


# ------------------------------------------------------------- Stofftabellen ----
FORMELN_EINFACH = [
    {"name": "Wasser", "formel": "H₂O", "M": 18, "atome": 3},
    {"name": "Kohlenstoffdioxid", "formel": "CO₂", "M": 44, "atome": 3},
    {"name": "Ammoniak", "formel": "NH₃", "M": 17, "atome": 4},
    {"name": "Methan", "formel": "CH₄", "M": 16, "atome": 5},
]
FORMELN_SALZE = [
    {"name": "Natriumchlorid", "formel": "NaCl", "M": 58.5, "atome": 2},
    {"name": "Magnesiumoxid", "formel": "MgO", "M": 40, "atome": 2},
    {"name": "Calciumcarbonat", "formel": "CaCO₃", "M": 100, "atome": 5},
    {"name": "Aluminiumoxid", "formel": "Al₂O₃", "M": 102, "atome": 5},
]
FORMELN_SAEUREN = [
    {"name": "Schwefelsäure", "formel": "H₂SO₄", "M": 98, "atome": 7},
    {"name": "Salpetersäure", "formel": "HNO₃", "M": 63, "atome": 5},
    {"name": "Salzsäure", "formel": "HCl", "M": 36.5, "atome": 2},
    {"name": "Kohlensäure", "formel": "H₂CO₃", "M": 62, "atome": 6},
]
FORMELN_ORGANIK = [
    {"name": "Methanol", "formel": "CH₃OH", "M": 32, "atome": 6},
    {"name": "Ethanol", "formel": "C₂H₅OH", "M": 46, "atome": 9},
    {"name": "Essigsäure", "formel": "CH₃COOH", "M": 60, "atome": 8},
    {"name": "Glycerin", "formel": "C₃H₈O₃", "M": 92, "atome": 14},
]
GASE = [
    {"name": "Sauerstoff", "formel": "O₂", "M": 32, "atome": 2},
    {"name": "Wasserstoff", "formel": "H₂", "M": 2, "atome": 2},
    {"name": "Stickstoff", "formel": "N₂", "M": 28, "atome": 2},
    {"name": "Kohlenstoffdioxid", "formel": "CO₂", "M": 44, "atome": 3},
]
ELEMENTE = [
    {"name": "Wasserstoff", "formel": "H", "z": 1, "n": 0, "M": 1, "atome": 1},
    {"name": "Kohlenstoff", "formel": "C", "z": 6, "n": 6, "M": 12, "atome": 1},
    {"name": "Sauerstoff", "formel": "O", "z": 8, "n": 8, "M": 16, "atome": 1},
    {"name": "Natrium", "formel": "Na", "z": 11, "n": 12, "M": 23, "atome": 1},
    {"name": "Schwefel", "formel": "S", "z": 16, "n": 16, "M": 32, "atome": 1},
    {"name": "Eisen", "formel": "Fe", "z": 26, "n": 30, "M": 56, "atome": 1},
]
METALLE = [
    {"name": "Aluminium", "formel": "Al", "dichte": 2.7, "M": 27, "atome": 1, "schmelz": 660},
    {"name": "Eisen", "formel": "Fe", "dichte": 7.9, "M": 56, "atome": 1, "schmelz": 1535},
    {"name": "Kupfer", "formel": "Cu", "dichte": 8.9, "M": 64, "atome": 1, "schmelz": 1083},
    {"name": "Blei", "formel": "Pb", "dichte": 11.3, "M": 207, "atome": 1, "schmelz": 327},
]
ALKANE = [
    {"name": "Methan", "c": 1, "h": 4, "sied": -162},
    {"name": "Propan", "c": 3, "h": 8, "sied": -42},
    {"name": "Pentan", "c": 5, "h": 12, "sied": 36},
    {"name": "Heptan", "c": 7, "h": 16, "sied": 98},
]


def g_neutronen(gid, tabelle):
    return {
        "id": gid, "tabelle": tabelle,
        "template": "Ein Atom von {name$} hat die Ordnungszahl {z} und {n} Neutronen. "
                    "Wie groß ist die Massenzahl?",
        "answer": "z + n", "round": 0,
        "solution": "{z} + {n} = {ergebnis}",
        "misconceptions": [
            {"id": "elektronen_mitgezaehlt", "value": "z + n + z",
             "feedback": "Elektronen zählen bei der Massenzahl nicht mit."}
        ]
    }


def g_dichte(gid, tabelle, volumen):
    return {
        "id": gid, "tabelle": tabelle,
        "vars": {"V": {"aus": volumen}},
        "template": "Ein Stück {name$} hat ein Volumen von {V} cm³. "
                    "Welche Masse hat es? (ρ = {dichte} g/cm³)",
        "answer": "dichte * V", "unit_label": "g", "round": 1,
        "solution": "m = {dichte} g/cm³ · {V} cm³ = {ergebnis} g",
        "misconceptions": [
            {"id": "dichte_geteilt_statt_mal", "value": "V / dichte",
             "feedback": "m = ρ · V — hier wird multipliziert."}
        ]
    }


# ------------------------------------------------------- Zuordnung je Einheit ----
# Je Einheit vier Generatoren. Die Muster sind dieselben, die Stoffe passen
# zum Thema der Stunde.
def satz(praefix, *bauer):
    return [b("AB-%s-%d" % (praefix, i + 1)) for i, b in enumerate(bauer)]


PLAN = {}


def eintrag(uid, *bauer):
    PLAN[uid] = satz(uid.upper(), *bauer)


# --- FC (die vier ersten Einheiten haben eigene Blätter, siehe fc.json) ---
eintrag("fc-05",
        lambda i: g_molmasse(i, FORMELN_EINFACH),
        lambda i: g_verhaeltnis(i, "Eisen und Schwefel reagieren im Massenverhältnis 7 : 4. "
                                   "Wie viel Schwefel wird für {m} g Eisen gebraucht?", 7, 4,
                                [7, 14, 28, 35, 56]),
        lambda i: g_anteil(i, "Eisen", 100, 500, 50, [20, 25, 40, 60]),
        lambda i: g_differenz(i, "Eine Probe wird von {schmelz} °C auf 20 °C abgekühlt. "
                                 "Um wie viel Grad sinkt die Temperatur?", METALLE, "schmelz", 20))
eintrag("fc-06",
        lambda i: g_umrechnen(i, "Beim Verdampfen wird 1 L Wasser rund 1700-mal so groß. "
                                 "Welches Dampfvolumen ergeben {v} L?", 1700, [0.1, 0.2, 0.5, 1], "L", False),
        lambda i: g_anteil(i, "brennbaren Anteil", 200, 800, 100, [10, 20, 25, 50]),
        lambda i: g_molmasse(i, FORMELN_EINFACH),
        lambda i: g_differenz(i, "{name$} schmilzt bei {schmelz} °C. Um wie viel Grad liegt das "
                                 "über 20 °C Zimmertemperatur?", METALLE, "schmelz", 20))
eintrag("fc-07",
        lambda i: g_molmasse(i, FORMELN_SALZE),
        lambda i: g_verhaeltnis(i, "Kupfer und Sauerstoff reagieren im Massenverhältnis 4 : 1. "
                                   "Wie viel Sauerstoff wird für {m} g Kupfer gebraucht?", 4, 1,
                                [8, 16, 32, 64, 80]),
        lambda i: g_atome(i, FORMELN_SALZE),
        lambda i: g_anteil(i, "Kupfer", 100, 600, 50, [20, 40, 80]))
eintrag("fc-08",
        lambda i: g_verhaeltnis(i, "Magnesium und Sauerstoff reagieren im Massenverhältnis 3 : 2. "
                                   "Wie viel Sauerstoff wird für {m} g Magnesium gebraucht?", 3, 2,
                                [6, 12, 24, 48]),
        lambda i: g_molmasse(i, FORMELN_SALZE),
        lambda i: g_anteil(i, "Sauerstoff", 100, 500, 50, [20, 25, 40]),
        lambda i: g_atome(i, FORMELN_EINFACH))

# --- PS ---
for u in ["ps-01", "ps-02", "ps-03", "ps-04", "ps-05", "ps-06", "ps-07", "ps-08"]:
    eintrag(u,
            lambda i: g_neutronen(i, ELEMENTE),
            lambda i: g_molmasse(i, FORMELN_EINFACH),
            lambda i: g_atome(i, FORMELN_SALZE),
            lambda i: g_anteil(i, "eines Elements", 100, 500, 50, [12, 25, 40, 75]))

# --- GA ---
for u in ["ga-01", "ga-02", "ga-03", "ga-04", "ga-05"]:
    eintrag(u,
            lambda i: g_anteil(i, "Sauerstoff", 100, 800, 50, [21, 25, 50]),
            lambda i: g_molmasse(i, GASE),
            lambda i: g_atome(i, GASE),
            lambda i: g_umrechnen(i, "Wie viel Liter sind {v} mL Gas?", 1000,
                                  [250, 500, 750, 1500, 2000], "L"))

# --- WA ---
for u in ["wa-01", "wa-02", "wa-03", "wa-04", "wa-05", "wa-06"]:
    eintrag(u,
            lambda i: g_molmasse(i, FORMELN_EINFACH),
            lambda i: g_verhaeltnis(i, "Bei der Elektrolyse entsteht Wasserstoff und Sauerstoff im "
                                       "Volumenverhältnis 2 : 1. Wie viel Sauerstoff entsteht "
                                       "neben {m} mL Wasserstoff?", 2, 1, [20, 30, 48, 60, 90]),
            lambda i: g_dichte(i, METALLE, [10, 20, 25, 50]),
            lambda i: g_anteil(i, "Salz", 100, 500, 50, [4, 5, 10, 20]))

# --- SZ ---
for u in ["sz-01", "sz-02", "sz-03", "sz-04", "sz-05"]:
    eintrag(u,
            lambda i: g_molmasse(i, FORMELN_SALZE),
            lambda i: g_atome(i, FORMELN_SALZE),
            lambda i: g_anteil(i, "Salz", 100, 600, 50, [10, 20, 25, 36]),
            lambda i: g_stoffmenge(i, FORMELN_SALZE, [100, 200, 300, 400]))

# --- ME ---
for u in ["me-01", "me-02", "me-03", "me-04", "me-05", "me-06", "me-07"]:
    eintrag(u,
            lambda i: g_dichte(i, METALLE, [10, 20, 25, 50, 100]),
            lambda i: g_anteil(i, "Kupfer", 100, 800, 50, [58, 60, 63, 70]),
            lambda i: g_molmasse(i, METALLE),
            lambda i: g_verhaeltnis(i, "Ein Erz enthält Eisen und Sauerstoff im Massenverhältnis "
                                       "7 : 3. Wie viel Sauerstoff steckt neben {m} g Eisen darin?",
                                    7, 3, [70, 140, 210, 280]))

# --- QB ---
for u in ["qb-01", "qb-02", "qb-03", "qb-04", "qb-05"]:
    eintrag(u,
            lambda i: g_molmasse(i, FORMELN_SAEUREN),
            lambda i: g_stoffmenge(i, GASE, [32, 44, 64, 88, 96]),
            lambda i: g_masse_aus_mol(i, GASE, [0.5, 1, 2, 3]),
            lambda i: g_gasvolumen(i, GASE, [0.5, 1, 2, 2.5]))

# --- SL ---
for u in ["sl-01", "sl-02", "sl-03", "sl-04", "sl-05", "sl-06", "sl-07"]:
    eintrag(u,
            lambda i: g_ph(i),
            lambda i: g_molmasse(i, FORMELN_SAEUREN),
            lambda i: g_anteil(i, "Säure", 100, 500, 50, [4, 5, 8, 10, 25]),
            lambda i: g_stoffmenge(i, FORMELN_SAEUREN, [98, 196, 63, 126]))

# --- KW ---
for u in ["kw-01", "kw-02", "kw-03", "kw-04", "kw-05", "kw-06", "kw-07"]:
    eintrag(u,
            lambda i: g_alkanformel(i, ALKANE),
            lambda i: g_verbrennung(i, ALKANE),
            lambda i: g_differenz(i, "{name$} siedet bei {sied} °C. Um wie viel Grad liegt der "
                                     "Siedepunkt unter 126 °C (Octan)?", ALKANE, "sied", 126),
            lambda i: g_molmasse(i, FORMELN_ORGANIK))

# --- AL ---
for u in ["al-01", "al-02", "al-03", "al-04", "al-05", "al-06", "al-07"]:
    eintrag(u,
            lambda i: g_molmasse(i, FORMELN_ORGANIK),
            lambda i: g_anteil(i, "Alkohol", 100, 500, 50, [5, 12, 40, 70]),
            lambda i: g_stoffmenge(i, FORMELN_ORGANIK, [32, 46, 92, 64]),
            lambda i: g_atome(i, FORMELN_ORGANIK))

# --- OS ---
for u in ["os-01", "os-02", "os-03", "os-04", "os-05"]:
    eintrag(u,
            lambda i: g_molmasse(i, FORMELN_ORGANIK),
            lambda i: g_stoffmenge(i, FORMELN_ORGANIK, [60, 120, 92, 46]),
            lambda i: g_anteil(i, "Säure", 100, 500, 50, [5, 8, 10, 20]),
            lambda i: g_masse_aus_mol(i, FORMELN_ORGANIK, [0.5, 1, 2]))

# --- ES ---
for u in ["es-01", "es-02", "es-03", "es-04", "es-05", "es-06"]:
    eintrag(u,
            lambda i: g_molmasse(i, FORMELN_ORGANIK),
            lambda i: g_masse_aus_mol(i, FORMELN_ORGANIK, [0.5, 1, 2, 3]),
            lambda i: g_stoffmenge(i, FORMELN_ORGANIK, [60, 92, 46, 32]),
            lambda i: g_anteil(i, "Fett", 100, 600, 50, [10, 20, 25, 40]))


def schreiben():
    idx = json.load(io.open(os.path.join(WURZEL, "units", "index.json"), encoding="utf-8"))
    nach_bereich = {}
    titel = {}
    for b in idx["bereiche"]:
        titel[b["code"]] = b["title"]
        for e in b["einheiten"]:
            if e["id"] in PLAN:
                nach_bereich.setdefault(b["code"], {})[e["id"]] = {
                    "auftrag": AUFTRAG, "aufgaben": PLAN[e["id"]]
                }
    for code, einheiten in sorted(nach_bereich.items()):
        pfad = os.path.join(ZIEL, code + ".json")
        vorhanden = {}
        if os.path.exists(pfad):
            alt = json.load(io.open(pfad, encoding="utf-8"))
            vorhanden = alt.get("einheiten", {})
        # Von Hand geschriebene Blätter nicht überschreiben.
        zusammen = dict(einheiten)
        zusammen.update(vorhanden)
        daten = {
            "_hinweis": "Generatoren fuer die gedruckten Uebungsblaetter. Erzeugt von "
                        "werkzeuge/uebungsblaetter_bauen.py; von Hand ergaenzte Einheiten "
                        "bleiben beim erneuten Lauf erhalten.",
            "bereich": code,
            "title": titel[code],
            "einheiten": {k: zusammen[k] for k in sorted(zusammen)}
        }
        with io.open(pfad, "w", encoding="utf-8", newline="\n") as f:
            json.dump(daten, f, ensure_ascii=False, indent=2)
            f.write("\n")
        print(f"  {code}.json  {len(zusammen)} Einheiten")


if __name__ == "__main__":
    print("Uebungsblatt-Generatoren")
    schreiben()

# -*- coding: utf-8 -*-
"""Erzeugt spiral/plan.json: Kategorien, Leitner-Intervalle, Verzahnung
und die Zuordnung von Denkfehlern zu Wiederholungskategorien."""
import json, io, os

WURZEL = r"C:\Users\Lance2Go\Documents\claude\Chemie\chh_Chemie_7_10"

VERZAHNUNG = {
    # Klasse 7 -- Faszination Chemie
    "fc-01": ["W-EINH"],
    "fc-02": ["W-EINH"],
    "fc-03": ["W-STOF", "W-EINH"],
    "fc-04": ["W-STOF", "W-LOES"],
    "fc-05": ["W-STOF"],
    "fc-06": ["W-STOF"],
    "fc-07": ["W-SYMB", "W-GLEI"],
    "fc-08": ["W-GLEI", "W-SYMB"],
    # Klasse 7 -- Periodensystem
    "ps-01": ["W-TEIL"],
    "ps-02": ["W-TEIL"],
    "ps-03": ["W-TEIL"],
    "ps-04": ["W-TEIL"],
    "ps-05": ["W-TEIL", "W-SYMB"],
    "ps-06": ["W-TEIL", "W-RECH"],
    "ps-07": ["W-TEIL"],
    "ps-08": ["W-TEIL", "W-SYMB"],
    # Klasse 7 -- Gase
    "ga-01": ["W-STOF", "W-EINH"],
    "ga-02": ["W-GLEI", "W-SYMB"],
    "ga-03": ["W-TEIL", "W-SYMB"],
    "ga-04": ["W-LOES", "W-EINH"],
    "ga-05": ["W-SYMB", "W-GLEI"],
    # Klasse 8 -- Wasser
    "wa-01": ["W-STOF", "W-EINH"],
    "wa-02": ["W-GLEI", "W-EINH"],
    "wa-03": ["W-GLEI", "W-SYMB"],
    "wa-04": ["W-TEIL", "W-SYMB"],
    "wa-05": ["W-LOES", "W-STOF"],
    "wa-06": ["W-GLEI", "W-LOES"],
    # Klasse 8 -- Salze
    "sz-01": ["W-TEIL"],
    "sz-02": ["W-TEIL", "W-STOF"],
    "sz-03": ["W-SYMB", "W-TEIL"],
    "sz-04": ["W-LOES", "W-EINH"],
    "sz-05": ["W-SYMB", "W-LOES"],
    # Klasse 8 -- Metalle
    "me-01": ["W-STOF", "W-EINH"],
    "me-02": ["W-TEIL", "W-STOF"],
    "me-03": ["W-GLEI"],
    "me-04": ["W-STOF", "W-LOES"],
    "me-05": ["W-GLEI", "W-TEIL"],
    "me-06": ["W-GLEI", "W-RECH"],
    "me-07": ["W-GLEI", "W-RECH"],
    # Klasse 9 -- Quantitative Betrachtungen
    "qb-01": ["W-SYMB", "W-RECH"],
    "qb-02": ["W-RECH", "W-EINH"],
    "qb-03": ["W-RECH", "W-EINH"],
    "qb-04": ["W-RECH", "W-EINH"],
    "qb-05": ["W-RECH", "W-GLEI"],
    # Klasse 9 -- Saeuren und Laugen
    "sl-01": ["W-LOES", "W-STOF"],
    "sl-02": ["W-LOES"],
    "sl-03": ["W-SYMB", "W-LOES"],
    "sl-04": ["W-SYMB", "W-LOES"],
    "sl-05": ["W-GLEI", "W-SYMB"],
    "sl-06": ["W-GLEI", "W-LOES"],
    "sl-07": ["W-LOES", "W-RECH"],
    # Klasse 9 -- Kohlenwasserstoffe
    "kw-01": ["W-STOF", "W-SYMB"],
    "kw-02": ["W-ORG", "W-SYMB"],
    "kw-03": ["W-ORG", "W-SYMB"],
    "kw-04": ["W-ORG"],
    "kw-05": ["W-ORG", "W-STOF"],
    "kw-06": ["W-ORG", "W-GLEI"],
    "kw-07": ["W-ORG", "W-GLEI"],
    # Klasse 10 -- Alkohole
    "al-01": ["W-ORG", "W-STOF"],
    "al-02": ["W-ORG"],
    "al-03": ["W-ORG", "W-LOES"],
    "al-04": ["W-ORG", "W-LOES"],
    "al-05": ["W-ORG", "W-GLEI"],
    "al-06": ["W-LOES", "W-RECH"],
    "al-07": ["W-ORG", "W-RECH"],
    # Klasse 10 -- Organische Saeuren
    "os-01": ["W-ORG", "W-LOES"],
    "os-02": ["W-ORG"],
    "os-03": ["W-ORG", "W-LOES"],
    "os-04": ["W-ORG", "W-SYMB"],
    "os-05": ["W-ORG", "W-RECH"],
    # Klasse 10 -- Ester
    "es-01": ["W-ORG", "W-GLEI"],
    "es-02": ["W-ORG", "W-STOF"],
    "es-03": ["W-ORG", "W-RECH"],
    "es-04": ["W-ORG", "W-LOES"],
    "es-05": ["W-ORG", "W-SYMB"],
    "es-06": ["W-ORG", "W-GLEI"],
}

# Denkfehler -> Wiederholungskategorie.
# Wer gestern "index_uebersehen" produziert hat, bekommt heute W-SYMB.
FEHLERPROFIL = {
    # Stoffe, Trennverfahren, Groessen
    "dichte_geteilt_statt_mal": "W-STOF",
    "dichte_mal_statt_geteilt": "W-STOF",
    "volumen_als_flaeche": "W-STOF",
    "anteil_umgedreht": "W-STOF",
    "loesungsmittel_als_ganzes": "W-LOES",
    "rest_statt_anteil": "W-STOF",
    "anteil_statt_rest": "W-LOES",
    "anteil_statt_ganzes": "W-RECH",
    "salz_mit_verdampft": "W-LOES",
    "teilchen_traegt_stoffeigenschaft": "W-STOF",
    "reaktion_und_zustandsaenderung_verwechselt": "W-STOF",
    "trennverfahren_verwechselt": "W-STOF",
    "sicherheitsregel_missachtet": "W-STOF",
    # Atombau und PSE
    "elektronen_mitgezaehlt": "W-TEIL",
    "massenzahl_als_neutronen": "W-TEIL",
    "ladung_falsch_herum": "W-TEIL",
    "ordnungszahl_aendert_sich": "W-TEIL",
    "ungewichteter_mittelwert": "W-TEIL",
    "ion_und_atom_verwechselt": "W-TEIL",
    "ladung_unvollstaendig": "W-TEIL",
    "schale_falsch_gefuellt": "W-TEIL",
    "bindungsart_verwechselt": "W-TEIL",
    # Symbole und Formeln
    "index_uebersehen": "W-SYMB",
    "koeffizient_ignoriert": "W-SYMB",
    "koeffizient_addiert": "W-SYMB",
    "klammer_ignoriert": "W-SYMB",
    "kristallwasser_vergessen": "W-SYMB",
    "formel_ohne_plus_zwei": "W-SYMB",
    "summenformel_falsch_gelesen": "W-SYMB",
    "symbol_verwechselt": "W-SYMB",
    # Reaktionsgleichungen
    "masse_verschwindet": "W-GLEI",
    "index_statt_koeffizient": "W-GLEI",
    "edukt_produkt_vertauscht": "W-GLEI",
    "verhaeltnis_umgedreht": "W-GLEI",
    "masse_direkt_uebertragen": "W-RECH",
    "oxidation_reduktion_vertauscht": "W-GLEI",
    "nachweis_verwechselt": "W-GLEI",
    # Chemisches Rechnen
    "mol_geteilt_statt_mal": "W-RECH",
    "mol_mal_statt_geteilt": "W-RECH",
    "groesse_und_einheit_verwechselt": "W-EINH",
    "molare_masse_falsch_bestimmt": "W-RECH",
    "faktor_falsch": "W-EINH",
    "kelvin_subtrahiert": "W-EINH",
    # Loesungen und pH
    "ph_skala_falschrum": "W-LOES",
    "verduennen_falsch_herum": "W-LOES",
    "saeure_lauge_vertauscht": "W-LOES",
    "polar_unpolar_vertauscht": "W-LOES",
    # Organik
    "h_nicht_halbiert": "W-ORG",
    "kohlenstoff_verloren": "W-ORG",
    "isomer_als_gleicher_stoff": "W-ORG",
    "funktionelle_gruppe_verwechselt": "W-ORG",
    "nomenklatur_falsch": "W-ORG",
}

plan = {
    "_hinweis": "Datei steuert das Warm-up. Kein Code muss angefasst werden.",
    "kategorien": ["W-STOF", "W-TEIL", "W-SYMB", "W-GLEI", "W-RECH", "W-EINH", "W-LOES", "W-ORG"],
    "geplant": [],
    "intervalle_tage": [0, 1, 3, 7, 21, 60],
    "verzahnung": VERZAHNUNG,
    "fehlerprofil": FEHLERPROFIL,
}

with io.open(os.path.join(WURZEL, "spiral", "plan.json"), "w", encoding="utf-8", newline="\n") as f:
    json.dump(plan, f, ensure_ascii=False, indent=2)
    f.write("\n")
print("plan.json:", len(VERZAHNUNG), "Einheiten verzahnt,", len(FEHLERPROFIL), "Denkfehler zugeordnet")

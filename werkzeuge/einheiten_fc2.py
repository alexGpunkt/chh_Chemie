# -*- coding: utf-8 -*-
"""Bereich FC · Faszination Chemie — Einheiten FC-03 bis FC-08.

Zweite Datei desselben Bereichs. Getrennt gehalten, weil eine Datei mit
acht vollständigen Einheiten nicht mehr lesbar ist und Änderungen an einer
Einheit dann jedes Mal die ganze Datei anfassen.
"""
import os
from einheiten_fc import karte, fv, aufgabe, WURZEL, BEREICH
import io, json

EINHEITEN = []

# ============================================================
# FC-03 · Stoffe und ihre Eigenschaften
# ============================================================
EINHEITEN.append({
    "unit": "FC-03",
    "title": "Stoffe und ihre Eigenschaften",
    "leitidee": "B1",
    "standards": ["K1", "K2.1", "K2.4"],
    "klasse": 7,
    "wortspeicher": [
        "die Eigenschaft", "die Dichte", "die Schmelztemperatur", "die Siedetemperatur",
        "der Aggregatzustand", "der Reinstoff", "messbar"
    ],
    "worterklaerungen": {
        "Eigenschaft": "Etwas, woran man einen Stoff erkennt. Zum Beispiel die Farbe oder die Dichte.",
        "Dichte": "Die Masse von einem Kubikzentimeter des Stoffes.",
        "Schmelztemperatur": "Die Temperatur, bei der ein fester Stoff flüssig wird.",
        "Aggregatzustand": "Ob ein Stoff fest, flüssig oder gasförmig ist."
    },
    "can_do": {
        "A": "Ich nenne Eigenschaften eines Stoffes und lese Schmelz- und Siedetemperatur aus einer Tabelle ab.",
        "B": "Ich bestimme die Dichte aus Masse und Volumen und ordne Stoffe über ihre Eigenschaften zu.",
        "C": "Ich erkläre Aggregatzustände auf Teilchenebene und begründe damit Messergebnisse."
    },
    "lernkarten": {
        "A": karte(
            "Woran man einen Stoff erkennt",
            "Jeder Stoff hat eigene Eigenschaften.",
            ["Farbe und Geruch kann man sehen und riechen.",
             "Dichte und Schmelztemperatur muss man messen."],
            "Gemessene Eigenschaften sind sicherer als gesehene.",
            visual={"type": "animation", "name": "aggregat", "stufe": "A"},
            beispiel={
                "titel": "Ein Beispiel",
                "aufgabe": "Ein Metall wiegt 27 g. Es hat 10 cm³ Volumen.",
                "schritte": ["Dichte = Masse : Volumen", "27 g : 10 cm³", "= 2,7 g/cm³"],
                "ergebnis": "2,7 g/cm³ — das ist Aluminium.",
                "luecke": {"schritt": 2, "wert": 2.7, "einheit": "g/cm³"}
            }),
        "B": karte(
            "Eigenschaften messen statt schätzen",
            "„Silbrig und schwer“ trifft auf viele Metalle zu. Erst gemessene Werte machen aus einer Vermutung eine Bestimmung.",
            ["Die Dichte berechnet sich aus ρ = m : V. Sie ist für jeden Reinstoff eine feste Zahl.",
             "Schmelz- und Siedetemperatur sind ebenfalls feste Werte. Aus ihnen folgt, in welchem Zustand ein Stoff bei Zimmertemperatur vorliegt.",
             "Liegt 20 °C unter der Schmelztemperatur, ist der Stoff fest; liegt es über der Siedetemperatur, ist er gasförmig."],
            "Ein Reinstoff hat feste Werte für Dichte, Schmelz- und Siedetemperatur.",
            visual={"type": "animation", "name": "aggregat", "stufe": "B"}),
        "C": karte(
            "Eigenschaften und Teilchen",
            "Die messbaren Eigenschaften eines Stoffes lassen sich auf die Anordnung und die Bewegung seiner Teilchen zurückführen — und damit erklären statt nur beschreiben.",
            ["Im festen Zustand sitzen die Teilchen auf festen Plätzen und schwingen dort. Deshalb hat ein Feststoff eine feste Form.",
             "Im flüssigen Zustand liegen sie noch dicht beieinander, können aber aneinander vorbeigleiten. Deshalb ist eine Flüssigkeit formbar, aber kaum zusammendrückbar.",
             "Im gasförmigen Zustand sind die Abstände groß. Deshalb lässt sich ein Gas zusammendrücken und füllt jeden Raum aus.",
             "Wichtig: Die Teilchen selbst ändern sich beim Zustandswechsel nicht. Sie werden nicht größer, nicht heißer und nicht weicher — nur ihre Anordnung ändert sich."],
            "Der Zustand steckt in der Anordnung der Teilchen, nicht in den Teilchen selbst.",
            visual={"type": "animation", "name": "aggregat", "stufe": "C"})
    },
    "formelkarte": {
        "formeln": ["ρ = m : V", "m = ρ · V", "V = m : ρ"],
        "saetze": [
            "1 cm³ = 1 mL, 1 g/cm³ = 1 kg/L.",
            "Wasser: Schmelztemperatur 0 °C, Siedetemperatur 100 °C, Dichte 1,0 g/cm³.",
            "Unter der Schmelztemperatur fest, darüber flüssig, über der Siedetemperatur gasförmig."
        ]
    },
    "tasks": [
        aufgabe("FC03-A1-001", "A", 1, "choice",
                "Welche dieser Eigenschaften muss man messen und kann man nicht einfach sehen?",
                options=["die Dichte", "die Farbe", "der Glanz"], answer=0,
                hints=["Farbe und Glanz erkennt das Auge.",
                       "Für welche Eigenschaft brauchst du eine Waage?",
                       "Die Dichte."],
                solution="Farbe und Glanz sieht man. Für die Dichte braucht man Waage und Messzylinder.",
                tags=["stoffe"], spiral=["W-STOF"]),

        aufgabe("FC03-A2-002", "A", 2, "numeric",
                "Ein Stück Eisen wiegt 79 g und hat ein Volumen von 10 cm³. Wie groß ist die Dichte?",
                answer=7.9, unit_label="g/cm³", tolerance=0.01,
                hints=["Dichte = Masse : Volumen.",
                       "79 : 10.",
                       "7,9 g/cm³."],
                solution="ρ = 79 g : 10 cm³ = 7,9 g/cm³",
                misconceptions=[fv("dichte_mal_statt_geteilt", 790,
                                   "Du hast multipliziert. Die Dichte ist die Masse <b>geteilt</b> durch das Volumen.")],
                tags=["stoffe", "dichte"], spiral=["W-STOF"]),

        aufgabe("FC03-A3-003", "A", 3, "choice",
                "Ethanol schmilzt bei −114 °C und siedet bei 78 °C. In welchem Zustand ist es bei 20 °C?",
                options=["flüssig", "fest", "gasförmig"], answer=0,
                hints=["Liegt 20 °C über oder unter −114 °C?",
                       "Und liegt es über oder unter 78 °C?",
                       "Zwischen Schmelz- und Siedetemperatur ist ein Stoff flüssig."],
                solution="20 °C liegt über der Schmelztemperatur (−114 °C) und unter der Siedetemperatur (78 °C). Ethanol ist also flüssig.",
                misconceptions=[fv("zustand_falsch_abgelesen", 2,
                                   "Gasförmig wäre Ethanol erst über 78 °C. Bei 20 °C ist es flüssig.")],
                tags=["stoffe", "aggregatzustand"], spiral=["W-STOF"]),

        aufgabe("FC03-A4-004", "A", 4, "numeric",
                "Ein Würfel aus Aluminium hat 2 cm Kantenlänge. Die Dichte beträgt 2,7 g/cm³. Wie schwer ist er?",
                answer=21.6, unit_label="g", tolerance=0.05,
                visual={"type": "teilchen", "zustand": "fest", "art": "element",
                        "alt": "Teilchenmodell eines festen Metalls: die Teilchen sitzen auf festen Plätzen."},
                hints=["Erst das Volumen des Würfels: 2 · 2 · 2.",
                       "Das Volumen ist 8 cm³.",
                       "Masse = Dichte · Volumen = 2,7 · 8."],
                solution="V = 2 cm · 2 cm · 2 cm = 8 cm³\nm = 2,7 g/cm³ · 8 cm³ = 21,6 g",
                misconceptions=[fv("volumen_als_flaeche", 10.8,
                                   "Du hast mit 4 cm² gerechnet. Ein Würfel hat das Volumen a · a · a = 8 cm³.")],
                tags=["stoffe", "dichte"], spiral=["W-STOF", "W-EINH"]),

        aufgabe("FC03-B1-005", "B", 1, "assign",
                "Ordne jedem Aggregatzustand die passende Beschreibung auf Teilchenebene zu.",
                slots=["fest", "flüssig", "gasförmig"],
                values=["Teilchen auf festen Plätzen, sie schwingen nur",
                        "Teilchen dicht beieinander, aber gegeneinander verschiebbar",
                        "Teilchen weit auseinander, sie fliegen frei"],
                answer=[0, 1, 2],
                visual={"type": "animation", "name": "aggregat", "stufe": "B"},
                hints=["Denk an den Abstand der Teilchen.",
                       "Fest heißt: kein Platzwechsel.",
                       "Gasförmig heißt: große Abstände."],
                solution="fest → feste Plätze, nur Schwingen.\nflüssig → dicht, aber verschiebbar.\ngasförmig → große Abstände, freie Bewegung.",
                tags=["stoffe", "teilchen"], spiral=["W-STOF"]),

        aufgabe("FC03-B2-006", "B", 2, "numeric",
                "Ein Messzylinder enthält 50 mL Wasser. Nach dem Eintauchen eines Steins zeigt er 68 mL. Der Stein wiegt 45 g. Wie groß ist seine Dichte?",
                answer=2.5, unit_label="g/cm³", tolerance=0.02,
                hints=["Das Volumen ist die Differenz der beiden Stände.",
                       "68 mL − 50 mL = 18 mL = 18 cm³.",
                       "ρ = 45 g : 18 cm³."],
                solution="V = 68 mL − 50 mL = 18 mL = 18 cm³\nρ = 45 g : 18 cm³ = 2,5 g/cm³",
                misconceptions=[fv("gesamtvolumen_genommen", 0.66,
                                   "Du hast durch 68 mL geteilt. Das Volumen des Steins ist nur die <b>Differenz</b> der Stände."),
                                fv("dichte_mal_statt_geteilt", 810,
                                   "Du hast multipliziert. ρ = m : V.")],
                tags=["stoffe", "dichte", "bbr"], spiral=["W-STOF"]),

        aufgabe("FC03-B2-007", "B", 2, "choice",
                "Zwei Proben sehen gleich aus. Probe 1 hat die Dichte 2,7 g/cm³, Probe 2 hat 8,9 g/cm³. Was folgt daraus?",
                options=["Es sind verschiedene Stoffe.",
                         "Es ist derselbe Stoff, nur unterschiedlich groß.",
                         "Daraus lässt sich nichts folgern."],
                answer=0,
                hints=["Ist die Dichte von der Probengröße abhängig?",
                       "Nein — sie ist für jeden Reinstoff fest.",
                       "Verschiedene Dichte heißt verschiedener Stoff."],
                solution="Die Dichte hängt nicht von der Probengröße ab. Verschiedene Dichten bedeuten deshalb verschiedene Stoffe — hier vermutlich Aluminium und Kupfer.",
                misconceptions=[fv("dichte_groessenabhaengig", 1,
                                   "Die Dichte ist unabhängig von der Menge. Ein großes und ein kleines Stück Aluminium haben dieselbe Dichte.",
                                   "teilchen_traegt_stoffeigenschaft", 1)],
                tags=["stoffe", "dichte"], spiral=["W-STOF"]),

        aufgabe("FC03-B3-008", "B", 3, "multi",
                "Ein Metallblock misst 5 cm · 4 cm · 2 cm und wiegt 356 g.",
                fields=[
                    {"label": "Volumen", "answer": 40, "unit_label": "cm³", "tolerance": 0.01},
                    {"label": "Dichte", "answer": 8.9, "unit_label": "g/cm³", "tolerance": 0.05,
                     "misconceptions": [fv("dichte_mal_statt_geteilt", 14240,
                                           "Du hast multipliziert. ρ = m : V.")]}
                ],
                hints=["Volumen eines Quaders: Länge · Breite · Höhe.",
                       "5 · 4 · 2 = 40 cm³.",
                       "ρ = 356 g : 40 cm³."],
                solution="V = 5 · 4 · 2 = 40 cm³\nρ = 356 g : 40 cm³ = 8,9 g/cm³ — das ist Kupfer.",
                tags=["stoffe", "dichte", "bbr"], spiral=["W-STOF", "W-EINH"]),

        aufgabe("FC03-B3-009", "B", 3, "choice",
                "Beim Erwärmen von Eis auf 0 °C bleibt die Temperatur eine Zeit lang stehen, obwohl weiter erhitzt wird. Warum?",
                options=["Die zugeführte Energie löst die Teilchen aus dem Gitter, statt sie schneller zu machen.",
                         "Das Thermometer ist ungenau.",
                         "Eis nimmt bei 0 °C keine Energie mehr auf."],
                answer=0,
                hints=["Was passiert bei 0 °C mit dem Eis?",
                       "Es schmilzt — dafür wird Energie gebraucht.",
                       "Solange geschmolzen wird, steigt die Temperatur nicht."],
                solution="Beim Schmelzen wird die zugeführte Energie gebraucht, um die Teilchen aus ihren festen Plätzen zu lösen. Erst wenn alles Eis geschmolzen ist, steigt die Temperatur weiter.",
                misconceptions=[fv("energie_nicht_aufgenommen", 2,
                                   "Eis nimmt bei 0 °C sehr wohl Energie auf — sie geht ins Schmelzen, nicht ins Erwärmen.",
                                   "reaktion_und_zustandsaenderung_verwechselt", 2)],
                tags=["stoffe", "energie", "msa"], spiral=["W-STOF"]),

        aufgabe("FC03-B4-010", "B", 4, "numeric",
                "Ein Ölfleck von 12 cm³ wiegt 10,2 g. Schwimmt das Öl auf Wasser (1,0 g/cm³)? Gib die Dichte des Öls an.",
                answer=0.85, unit_label="g/cm³", tolerance=0.02,
                hints=["ρ = m : V.",
                       "10,2 : 12.",
                       "0,85 g/cm³ — kleiner als 1,0, also schwimmt es."],
                solution="ρ = 10,2 g : 12 cm³ = 0,85 g/cm³.\nDas ist kleiner als 1,0 g/cm³, also schwimmt das Öl auf dem Wasser.",
                misconceptions=[fv("dichte_umgedreht", 1.18,
                                   "Du hast Volumen durch Masse geteilt. ρ = m : V, also Masse durch Volumen.")],
                tags=["stoffe", "dichte", "bbr"], spiral=["W-STOF"]),

        aufgabe("FC03-C2-011", "C", 2, "choice",
                "Ein Schüler sagt: „Beim Schmelzen werden die Teilchen weicher.“ Was ist daran falsch?",
                options=["Die Teilchen ändern sich gar nicht — nur ihre Anordnung und Beweglichkeit ändert sich.",
                         "Nichts, die Aussage stimmt.",
                         "Die Teilchen werden nicht weicher, sondern größer."],
                answer=0,
                visual={"type": "animation", "name": "aggregat", "stufe": "C"},
                hints=["Was unterscheidet Eis und Wasser auf Teilchenebene?",
                       "Es sind dieselben Teilchen.",
                       "Nur Anordnung und Beweglichkeit sind verschieden."],
                solution="Eigenschaften wie „weich“ oder „hart“ gehören dem Stoff, nicht dem einzelnen Teilchen. Beim Schmelzen bleiben die Teilchen unverändert; sie verlassen nur ihre festen Plätze.",
                misconceptions=[fv("teilchen_wird_groesser", 2,
                                   "Auch das nicht: Die Teilchen werden weder größer noch weicher. Nur ihr Abstand und ihre Beweglichkeit ändern sich.",
                                   "teilchen_traegt_stoffeigenschaft", 3)],
                tags=["stoffe", "teilchen", "msa"], spiral=["W-STOF"]),

        aufgabe("FC03-C3-012", "C", 3, "numeric",
                "Eine Legierung aus 40 cm³ Kupfer (8,9 g/cm³) und 60 cm³ Zink (7,1 g/cm³) wird hergestellt. Welche mittlere Dichte hat sie? (Volumen bleibt erhalten)",
                answer=7.82, unit_label="g/cm³", tolerance=0.02,
                hints=["Erst beide Massen einzeln ausrechnen.",
                       "m(Cu) = 40 · 8,9 = 356 g, m(Zn) = 60 · 7,1 = 426 g.",
                       "Gesamtmasse durch Gesamtvolumen."],
                solution="m(Cu) = 40 cm³ · 8,9 g/cm³ = 356 g\nm(Zn) = 60 cm³ · 7,1 g/cm³ = 426 g\nρ = (356 + 426) g : 100 cm³ = 7,82 g/cm³",
                misconceptions=[fv("ungewichteter_mittelwert", 8,
                                   "Du hast die beiden Dichten einfach gemittelt. Die Volumen sind aber verschieden — es muss gewichtet werden.")],
                tags=["stoffe", "dichte", "msa"], spiral=["W-STOF"]),

        aufgabe("FC03-C3-013", "C", 3, "choice",
                "Wasser hat bei 4 °C seine größte Dichte, Eis eine kleinere als flüssiges Wasser. Welche Folge hat das für einen See im Winter?",
                options=["Das Eis schwimmt oben; darunter bleibt flüssiges Wasser, in dem Fische überleben.",
                         "Der See friert von unten nach oben zu.",
                         "Der See friert vollständig durch."],
                answer=0,
                hints=["Was ist leichter, Eis oder Wasser?",
                       "Eis schwimmt.",
                       "Die Eisschicht liegt oben und isoliert."],
                solution="Weil Eis eine kleinere Dichte hat als flüssiges Wasser, schwimmt es oben. Die Eisdecke wirkt wie eine Isolierschicht — darunter bleibt Wasser flüssig. Diese Dichteanomalie ist der Grund, warum Seen nicht durchfrieren.",
                tags=["stoffe", "anwenden", "msa"], spiral=["W-STOF"]),

        aufgabe("FC03-C4-014", "C", 4, "multi",
                "Eine unbekannte Probe wiegt 47,3 g. Im Messzylinder steigt der Wasserstand von 25,0 mL auf 30,5 mL.",
                fields=[
                    {"label": "Volumen der Probe", "answer": 5.5, "unit_label": "cm³", "tolerance": 0.05},
                    {"label": "Dichte der Probe", "answer": 8.6, "unit_label": "g/cm³", "tolerance": 0.1}
                ],
                hints=["Das Volumen ist die Differenz der Stände.",
                       "30,5 − 25,0 = 5,5 mL.",
                       "ρ = 47,3 : 5,5."],
                solution="V = 30,5 mL − 25,0 mL = 5,5 mL = 5,5 cm³\nρ = 47,3 g : 5,5 cm³ ≈ 8,6 g/cm³\nDas passt zu Messing oder Kupfer — die Farbe entscheidet.",
                tags=["stoffe", "dichte", "msa"], spiral=["W-STOF", "W-EINH"])
    ]
})

# ============================================================
# FC-04 · Reinstoff, Gemisch und Trennverfahren
# ============================================================
EINHEITEN.append({
    "unit": "FC-04",
    "title": "Reinstoff, Gemisch und Trennverfahren",
    "leitidee": "B1",
    "standards": ["K1", "K2.2", "K3.2"],
    "klasse": 7,
    "wortspeicher": [
        "der Reinstoff", "das Gemisch", "die Lösung", "das Filtrieren",
        "das Eindampfen", "die Destillation", "der Rückstand", "das Filtrat"
    ],
    "worterklaerungen": {
        "Reinstoff": "Ein Stoff, der aus nur einer Sorte Teilchen besteht.",
        "Gemisch": "Zwei oder mehr Stoffe liegen nebeneinander vor.",
        "Filtrieren": "Feste Teilchen bleiben im Filter zurück, die Flüssigkeit läuft durch.",
        "Eindampfen": "Die Flüssigkeit verdampft, der gelöste Stoff bleibt zurück.",
        "Destillation": "Trennen über verschiedene Siedetemperaturen. Der Dampf wird aufgefangen und gekühlt."
    },
    "can_do": {
        "A": "Ich unterscheide Reinstoff und Gemisch und nenne zu einem Gemisch ein passendes Trennverfahren.",
        "B": "Ich wähle ein Trennverfahren begründet aus und benenne die Teile des Aufbaus.",
        "C": "Ich begründe die Wahl eines Trennverfahrens über die Stoffeigenschaften und plane eine Trennfolge."
    },
    "lernkarten": {
        "A": karte(
            "Ein Stoff oder mehrere",
            "In einem Gemisch sind mehrere Stoffe.",
            ["Sand im Wasser ist ein Gemisch.", "Man kann die Stoffe wieder trennen."],
            "Gemisch heißt: mehrere Stoffe nebeneinander.",
            visual={"type": "apparatur", "aufbau": "filtration",
                    "alt": "Ein Trichter mit Filterpapier über einem Becherglas."},
            beispiel={
                "titel": "Sand aus Wasser holen",
                "aufgabe": "Sand liegt im Wasser.",
                "schritte": ["Filterpapier in den Trichter.", "Das Gemisch hineingießen.",
                             "Der Sand bleibt im Filter."],
                "ergebnis": "Sand im Filter, klares Wasser darunter."
            }),
        "B": karte(
            "Das passende Verfahren wählen",
            "Jedes Trennverfahren nutzt einen Unterschied zwischen den Stoffen. Welchen Unterschied es nutzt, entscheidet darüber, wann es funktioniert.",
            ["Filtrieren nutzt die Teilchengröße: Ungelöste Feststoffe bleiben zurück, gelöste laufen mit durch.",
             "Eindampfen nutzt die Siedetemperatur: Das Lösungsmittel verdampft, der gelöste Stoff bleibt.",
             "Destillieren nutzt ebenfalls die Siedetemperatur — hier wird aber der Dampf aufgefangen und wieder verflüssigt.",
             "Gelöstes Salz lässt sich deshalb nicht abfiltrieren: Die Ionen sind viel kleiner als die Poren des Filters."],
            "Erst fragen, worin sich die Stoffe unterscheiden. Dann das Verfahren wählen.",
            visual={"type": "apparatur", "aufbau": "destillation",
                    "alt": "Destillationsapparatur mit Kolben, Kühler und Vorlage."}),
        "C": karte(
            "Trennfolgen planen",
            "Reale Gemische enthalten mehr als zwei Bestandteile. Dann wird nicht ein Verfahren gewählt, sondern eine Reihenfolge — und die Reihenfolge ist selten beliebig.",
            ["Zuerst wird abgetrennt, was ungelöst vorliegt: filtrieren. Wer zuerst eindampft, bekommt Salz und Sand gemeinsam als Rückstand und hat nichts gewonnen.",
             "Danach werden die gelösten Bestandteile getrennt: eindampfen, wenn nur der Feststoff interessiert, destillieren, wenn auch das Lösungsmittel gebraucht wird.",
             "Bei zwei mischbaren Flüssigkeiten entscheidet der Abstand der Siedetemperaturen, ob eine einfache Destillation reicht."],
            "Erst das Ungelöste, dann das Gelöste — sonst trennt der zweite Schritt nichts mehr.",
            visual={"type": "apparatur", "aufbau": "destillation",
                    "alt": "Destillationsapparatur mit Kolben, Kühler und Vorlage."})
    },
    "formelkarte": {
        "formeln": [],
        "saetze": [
            "Filtrieren: trennt ungelöste Feststoffe von Flüssigkeit.",
            "Eindampfen: der gelöste Feststoff bleibt zurück, das Lösungsmittel geht verloren.",
            "Destillieren: der Dampf wird gekühlt und aufgefangen — beide Stoffe bleiben erhalten.",
            "Gelöstes lässt sich nicht abfiltrieren.",
            "Reinstoff: feste Schmelz- und Siedetemperatur. Gemisch: Bereiche statt fester Werte."
        ]
    },
    "tasks": [
        aufgabe("FC04-A1-001", "A", 1, "choice",
                "Was ist ein Gemisch?",
                options=["Sand in Wasser", "reines Wasser", "reines Kupfer"], answer=0,
                hints=["In einem Gemisch sind mehrere Stoffe.",
                       "Wo siehst du zwei Stoffe?",
                       "Sand und Wasser sind zwei Stoffe."],
                solution="Sand in Wasser sind zwei Stoffe nebeneinander — ein Gemisch. Reines Wasser und reines Kupfer sind Reinstoffe.",
                tags=["gemische"], spiral=["W-STOF"]),

        aufgabe("FC04-A2-002", "A", 2, "assign",
                "Ordne jedem Gemisch das passende Trennverfahren zu.",
                slots=["Sand in Wasser", "Salz in Wasser", "Alkohol in Wasser"],
                values=["Filtrieren", "Eindampfen", "Destillieren"],
                answer=[0, 1, 2],
                hints=["Sand ist nicht gelöst.",
                       "Salz ist gelöst und bleibt beim Eindampfen zurück.",
                       "Zwei Flüssigkeiten trennt man über die Siedetemperatur."],
                solution="Sand in Wasser → Filtrieren (Sand ist ungelöst).\nSalz in Wasser → Eindampfen.\nAlkohol in Wasser → Destillieren.",
                misconceptions=[fv("trennverfahren_verwechselt", 0,
                                   "Gelöstes Salz geht durch jeden Filter hindurch — es ist in Ionen zerlegt und viel kleiner als die Poren.",
                                   "trennverfahren_verwechselt", 3)],
                tags=["gemische", "trennverfahren"], spiral=["W-STOF"]),

        aufgabe("FC04-A3-003", "A", 3, "choice",
                "Du filtrierst Salzwasser. Was ist im Filterpapier?",
                options=["nichts", "das Salz", "das Wasser"], answer=0,
                hints=["Ist das Salz gelöst oder ungelöst?",
                       "Gelöstes geht durch den Filter.",
                       "Es bleibt nichts zurück."],
                solution="Salz ist im Wasser gelöst. Es läuft mit durch den Filter — im Filterpapier bleibt nichts.",
                misconceptions=[fv("geloestes_filtrierbar", 1,
                                   "Gelöstes Salz lässt sich nicht abfiltrieren. Zum Trennen musst du eindampfen.",
                                   "trennverfahren_verwechselt")],
                tags=["gemische", "trennverfahren"], spiral=["W-STOF"]),

        aufgabe("FC04-A4-004", "A", 4, "numeric",
                "100 g Salzwasser enthalten 8 g Salz. Wie viel Salz bleibt nach dem vollständigen Eindampfen übrig?",
                answer=8, unit_label="g", tolerance=0,
                hints=["Was verdampft und was bleibt?",
                       "Das Wasser verdampft, das Salz bleibt.",
                       "8 g."],
                solution="Beim Eindampfen verdampft nur das Wasser. Das Salz bleibt vollständig zurück: 8 g.",
                misconceptions=[fv("salz_mit_verdampft", 0,
                                   "Salz verdampft nicht. Es bleibt vollständig als Rückstand zurück.",
                                   "trennverfahren_verwechselt")],
                tags=["gemische", "rechnen"], spiral=["W-LOES"]),

        aufgabe("FC04-B1-005", "B", 1, "assign",
                "Ordne den Teilen der Destillationsapparatur ihre Aufgabe zu.",
                slots=["Kolben", "Kühler", "Vorlage"],
                values=["Hier wird das Gemisch erhitzt",
                        "Hier wird der Dampf wieder flüssig",
                        "Hier sammelt sich das Destillat"],
                answer=[0, 1, 2],
                visual={"type": "apparatur", "aufbau": "destillation",
                        "alt": "Destillationsapparatur mit Kolben, Kühler und Vorlage."},
                hints=["Der Weg des Stoffes ist: erhitzen, kühlen, auffangen.",
                       "Der Kühler ist das schräge Rohr mit Mantel.",
                       "Die Vorlage steht am Ende."],
                solution="Kolben → erhitzen.\nKühler → Dampf verflüssigen.\nVorlage → Destillat auffangen.",
                tags=["gemische", "geraete"], spiral=["W-STOF"]),

        aufgabe("FC04-B2-006", "B", 2, "choice",
                "Worin unterscheiden sich Eindampfen und Destillieren?",
                options=["Beim Destillieren wird der Dampf aufgefangen, beim Eindampfen geht er verloren.",
                         "Beim Destillieren wird nicht erhitzt.",
                         "Es ist dasselbe Verfahren mit zwei Namen."],
                answer=0,
                hints=["Was passiert mit dem verdampften Lösungsmittel?",
                       "Beim Eindampfen entweicht es.",
                       "Beim Destillieren wird es gekühlt und aufgefangen."],
                solution="Beide erhitzen. Beim Eindampfen entweicht der Dampf und nur der Rückstand bleibt. Beim Destillieren wird der Dampf gekühlt und als Destillat aufgefangen — man erhält also beide Stoffe.",
                misconceptions=[fv("verfahren_gleichgesetzt", 2,
                                   "Der Unterschied ist wesentlich: Beim Destillieren gewinnst du auch das Lösungsmittel zurück.",
                                   "trennverfahren_verwechselt", 2)],
                tags=["gemische", "trennverfahren", "bbr"], spiral=["W-STOF"]),

        aufgabe("FC04-B2-007", "B", 2, "choice",
                "Ein Reinstoff siedet bei einer festen Temperatur, ein Gemisch über einen Bereich. Wie erkennst du daran, ob eine Flüssigkeit rein ist?",
                options=["Die Temperatur bleibt beim Sieden konstant.",
                         "Die Flüssigkeit ist farblos.",
                         "Sie siedet besonders schnell."],
                answer=0,
                hints=["Miss die Temperatur während des Siedens.",
                       "Bleibt sie stehen oder steigt sie?",
                       "Konstante Siedetemperatur = Reinstoff."],
                solution="Ein Reinstoff siedet bei konstanter Temperatur. Steigt die Temperatur während des Siedens, handelt es sich um ein Gemisch. Farbe und Geschwindigkeit sagen darüber nichts aus.",
                tags=["gemische", "reinstoff", "bbr"], spiral=["W-STOF"]),

        aufgabe("FC04-B3-008", "B", 3, "numeric",
                "Aus 250 g Meerwasser bleiben nach dem Eindampfen 8,75 g Salz. Wie viel Prozent Salz enthält das Meerwasser?",
                answer=3.5, unit_label="%", tolerance=0.05,
                hints=["Anteil = Teil : Ganzes.",
                       "8,75 : 250.",
                       "Ergebnis mal 100."],
                solution="8,75 g : 250 g = 0,035 → 3,5 %",
                misconceptions=[fv("anteil_umgedreht", 2857,
                                   "Du hast das Ganze durch den Teil geteilt. Der Anteil ist Teil : Ganzes.")],
                tags=["gemische", "rechnen", "bbr"], spiral=["W-LOES"]),

        aufgabe("FC04-B3-009", "B", 3, "choice",
                "Ein Gemisch aus Sand, Salz und Wasser soll vollständig getrennt werden. Womit beginnst du?",
                options=["Filtrieren, um den Sand abzutrennen",
                         "Eindampfen, um das Wasser loszuwerden",
                         "Destillieren, um alles auf einmal zu trennen"],
                answer=0,
                hints=["Was passiert, wenn du zuerst eindampfst?",
                       "Dann liegen Sand und Salz gemeinsam als Rückstand vor.",
                       "Erst das Ungelöste abtrennen."],
                solution="Zuerst wird filtriert: Der Sand bleibt im Filter, Salzwasser läuft durch. Danach lässt sich das Salz durch Eindampfen gewinnen. Wer zuerst eindampft, hat Sand und Salz gemeinsam im Rückstand.",
                misconceptions=[fv("reihenfolge_trennung", 1,
                                   "Dann liegen Sand und Salz gemeinsam vor und du musst noch einmal von vorn anfangen. Erst das Ungelöste abtrennen.",
                                   "trennverfahren_verwechselt")],
                tags=["gemische", "planen", "msa"], spiral=["W-STOF"]),

        aufgabe("FC04-B4-010", "B", 4, "choice",
                "Warum lässt sich Alkohol aus Wein durch Destillation abtrennen?",
                options=["Alkohol siedet bei 78 °C, Wasser erst bei 100 °C.",
                         "Alkohol ist leichter als Wasser und schwimmt oben.",
                         "Alkohol ist im Wasser nicht gelöst."],
                answer=0,
                hints=["Welcher Unterschied wird bei der Destillation genutzt?",
                       "Die Siedetemperatur.",
                       "78 °C gegen 100 °C."],
                solution="Die Destillation nutzt den Unterschied der Siedetemperaturen. Alkohol siedet bei 78 °C und geht deshalb zuerst in den Dampf über; im Kühler wird er wieder flüssig.",
                misconceptions=[fv("dichte_als_grund", 1,
                                   "Die Dichte spielt bei der Destillation keine Rolle. Alkohol und Wasser mischen sich vollständig.",
                                   "trennverfahren_verwechselt")],
                tags=["gemische", "trennverfahren", "bbr"], spiral=["W-STOF"]),

        aufgabe("FC04-C2-011", "C", 2, "choice",
                "Warum lässt sich gelöstes Salz nicht abfiltrieren, feiner Sand aber schon?",
                options=["Gelöste Ionen sind viel kleiner als die Poren des Filters, Sandkörner sind größer.",
                         "Salz löst das Filterpapier auf.",
                         "Sand ist schwerer als Salz."],
                answer=0,
                hints=["Was macht der Filter überhaupt?",
                       "Er hält alles zurück, was größer ist als seine Poren.",
                       "Gelöste Teilchen sind winzig."],
                solution="Ein Filter trennt nach Größe. Sandkörner sind größer als die Poren und bleiben liegen. Gelöstes Salz liegt als einzelne Ionen vor — viel kleiner als jede Pore — und läuft mit durch.",
                misconceptions=[fv("masse_als_kriterium", 2,
                                   "Der Filter trennt nach Größe, nicht nach Masse.",
                                   "trennverfahren_verwechselt", 3)],
                tags=["gemische", "erklaeren", "msa"], spiral=["W-STOF"]),

        aufgabe("FC04-C3-012", "C", 3, "multi",
                "400 g eines Gemischs aus Sand und Salzwasser werden getrennt. Im Filter bleiben 55 g feuchter Sand, nach dem Trocknen 48 g. Aus dem Filtrat werden 12 g Salz gewonnen.",
                fields=[
                    {"label": "Masse des trockenen Sandes", "answer": 48, "unit_label": "g", "tolerance": 0.01},
                    {"label": "Masse des Wassers", "answer": 340, "unit_label": "g", "tolerance": 0.01},
                    {"label": "Salzanteil im Salzwasser", "answer": 3.41, "unit_label": "%", "tolerance": 0.05}
                ],
                hints=["Sand trocken: 48 g.",
                       "Wasser = 400 g − 48 g Sand − 12 g Salz.",
                       "Salzanteil = 12 g : (12 g + 340 g) · 100 %."],
                solution="Sand trocken: 48 g\nWasser: 400 − 48 − 12 = 340 g\nSalzwasser: 12 + 340 = 352 g\nAnteil: 12 : 352 = 0,0341 → 3,41 %",
                tags=["gemische", "rechnen", "msa"], spiral=["W-LOES"]),

        aufgabe("FC04-C3-013", "C", 3, "choice",
                "Zwei Flüssigkeiten sieden bei 78 °C und 80 °C. Warum ist eine einfache Destillation hier problematisch?",
                options=["Die Siedetemperaturen liegen zu dicht beieinander; beide Stoffe gehen gemeinsam in den Dampf.",
                         "Bei so niedrigen Temperaturen verdampft gar nichts.",
                         "Zwei Flüssigkeiten lassen sich grundsätzlich nicht destillieren."],
                answer=0,
                hints=["Wie weit liegen 78 °C und 80 °C auseinander?",
                       "Nur 2 °C.",
                       "Dann ist die Trennung unvollständig."],
                solution="Bei nur 2 °C Unterschied enthält der Dampf beide Stoffe in nennenswerter Menge — das Destillat ist wieder ein Gemisch. Für solche Fälle braucht es eine Kolonne, die den Vorgang vielfach wiederholt.",
                tags=["gemische", "bewerten", "msa"], spiral=["W-STOF"]),

        aufgabe("FC04-C4-014", "C", 4, "choice",
                "Aus Meerwasser soll Trinkwasser gewonnen werden. Welches Verfahren ist geeignet und warum?",
                options=["Destillation — sie liefert das Wasser zurück, das Eindampfen verlieren würde.",
                         "Eindampfen — es ist einfacher.",
                         "Filtrieren — der Filter hält das Salz zurück."],
                answer=0,
                hints=["Was ist das gewünschte Produkt: der Rückstand oder die Flüssigkeit?",
                       "Gesucht ist das Wasser, nicht das Salz.",
                       "Nur die Destillation fängt das Wasser auf."],
                solution="Gesucht ist das Wasser. Beim Eindampfen entweicht genau das, was man haben will. Die Destillation kühlt den Dampf und fängt ihn auf — man erhält salzfreies Wasser. Filtrieren scheidet aus, weil gelöstes Salz durch jeden Filter geht.",
                misconceptions=[fv("produkt_verwechselt", 1,
                                   "Beim Eindampfen bleibt das Salz — das Wasser entweicht. Gesucht war aber das Wasser.",
                                   "trennverfahren_verwechselt"),
                                fv("geloestes_filtrierbar", 2,
                                   "Gelöstes Salz lässt sich nicht abfiltrieren.",
                                   "trennverfahren_verwechselt")],
                tags=["gemische", "bewerten", "msa"], spiral=["W-STOF"])
    ]
})


def schreiben():
    for e in EINHEITEN:
        uid = e["unit"].lower()
        ordner = os.path.join(WURZEL, "units", BEREICH, uid)
        os.makedirs(ordner, exist_ok=True)
        with io.open(os.path.join(ordner, "tasks.json"), "w", encoding="utf-8", newline="\n") as f:
            json.dump(e, f, ensure_ascii=False, indent=2)
            f.write("\n")
        v = {}
        for t in e["tasks"]:
            v[t["path"]] = v.get(t["path"], 0) + 1
        print(f"  {e['unit']}  {len(e['tasks'])} Aufgaben  A/B/C = "
              f"{v.get('A', 0)}/{v.get('B', 0)}/{v.get('C', 0)}")


if __name__ == "__main__":
    print("Bereich FC · Einheiten 3 und 4")
    schreiben()

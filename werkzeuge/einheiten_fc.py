# -*- coding: utf-8 -*-
"""Bereich FC · Faszination Chemie (Klasse 7, Themenfeld 3.1)

Acht Einheiten a 60 Minuten. Erzeugt units/fc/fc-XX/tasks.json.

Warum die Einheiten hier als Python-Daten stehen und nicht direkt als JSON:
Der Aufgabenbestand lebt von Wiederholung mit Variation. Ein Gefahrensymbol,
eine Nachweisreaktion, ein Trennverfahren taucht in mehreren Einheiten auf,
und es soll dort dasselbe heißen. Gemeinsame Tabellen an einer Stelle
verhindern, dass in FC-01 „ätzend“ und in FC-06 „korrosiv“ steht.
"""
import io, json, os

WURZEL = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BEREICH = "fc"


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


EINHEITEN = []

# ============================================================
# FC-01 · Sicher im Chemieraum
# ============================================================
EINHEITEN.append({
    "unit": "FC-01",
    "title": "Sicher im Chemieraum",
    "leitidee": "B1",
    "standards": ["K1", "K2.2", "K4.2"],
    "klasse": 7,
    "sicherheit": [
        "Im Chemieraum wird nichts angefasst, gerochen oder geschmeckt, bevor die Lehrkraft es sagt.",
        "Schutzbrille auf, sobald erhitzt wird oder eine Chemikalie offen steht — auch beim Zusehen.",
        "Lange Haare zusammenbinden, Jacken und Taschen weg vom Arbeitsplatz."
    ],
    "wortspeicher": [
        "das Gefahrensymbol", "ätzend", "entzündbar", "gesundheitsschädlich",
        "die Schutzbrille", "die Betriebsanweisung", "der Abzug", "die Augendusche"
    ],
    "worterklaerungen": {
        "Gefahrensymbol": "Ein rot umrandetes Bild auf der Flasche. Es sagt, welche Gefahr von dem Stoff ausgeht.",
        "ätzend": "Der Stoff zerstört Haut und Augen. Er greift auch Metall an.",
        "entzündbar": "Der Stoff fängt leicht Feuer.",
        "Abzug": "Ein Glaskasten mit Absaugung. Darin bleiben giftige Dämpfe.",
        "Betriebsanweisung": "Ein Blatt, das für einen bestimmten Stoff sagt, was zu tun und zu lassen ist."
    },
    "can_do": {
        "A": "Ich erkenne die wichtigsten Gefahrensymbole und weiß, was ich dann tun muss.",
        "B": "Ich ordne Gefahrensymbole den passenden Schutzmaßnahmen zu und begründe sie.",
        "C": "Ich lese eine Betriebsanweisung und leite daraus das Vorgehen für einen Versuch ab."
    },
    "lernkarten": {
        "A": karte(
            "Die Zeichen auf der Flasche",
            "Auf jeder Flasche steht ein Zeichen.",
            ["Das Zeichen sagt dir die Gefahr.", "Lies es, bevor du die Flasche anfasst."],
            "Erst das Zeichen lesen. Dann handeln.",
            beispiel={
                "titel": "Ein Beispiel",
                "aufgabe": "Auf einer Flasche siehst du das Zeichen für „ätzend“.",
                "schritte": ["Der Stoff greift Haut und Augen an.",
                             "Ich setze die Schutzbrille auf.",
                             "Ich ziehe Handschuhe an."],
                "ergebnis": "Schutzbrille und Handschuhe."
            }),
        "B": karte(
            "Gefahrensymbole und was sie verlangen",
            "Die neun GHS-Symbole sind rot umrandete Rauten. Jedes steht für eine bestimmte Art von Gefahr, und jedes verlangt eine bestimmte Vorsichtsmaßnahme.",
            ["Ätzend: Schutzbrille und Handschuhe, niemals ohne Aufsicht umfüllen.",
             "Entzündbar: kein offenes Feuer in der Nähe, Brenner vorher ausschalten.",
             "Gesundheitsschädlich und giftig: nur im Abzug arbeiten, nicht daran riechen."],
            "Das Symbol nennt die Gefahr — die Schutzmaßnahme folgt daraus.",
            beispiel={
                "titel": "Vom Symbol zur Handlung",
                "aufgabe": "Eine Flasche trägt die Symbole „entzündbar“ und „gesundheitsschädlich“.",
                "schritte": ["Entzündbar → Brenner aus, kein offenes Feuer.",
                             "Gesundheitsschädlich → im Abzug arbeiten.",
                             "Beide Maßnahmen gelten gleichzeitig."],
                "ergebnis": "Brenner aus und im Abzug arbeiten."
            }),
        "C": karte(
            "Von der Betriebsanweisung zum Vorgehen",
            "Eine Betriebsanweisung nennt für einen Stoff die Gefahren, die Schutzmaßnahmen, das Verhalten im Gefahrfall und die Entsorgung. Sie ist damit die Anleitung für den ganzen Versuch — nicht nur für den Moment des Umfüllens.",
            ["Vor dem Versuch: Welche Gefahren nennt sie? Welche Schutzausrüstung verlangt sie?",
             "Während des Versuchs: Wo steht die kleinste Menge, mit der der Versuch noch gelingt? Weniger Stoff heißt weniger Gefahr — das ist der Sinn der Ersatzstoffprüfung.",
             "Nach dem Versuch: In welchen Behälter gehört der Rest? Ausguss ist fast nie die Antwort."],
            "Die Betriebsanweisung wird vor dem Versuch gelesen, nicht danach.",
            beispiel={
                "titel": "Eine Anweisung auswerten",
                "aufgabe": "„Natronlauge, ätzend. Schutzbrille. Nicht in den Ausguss. Bei Hautkontakt 10 Minuten spülen.“",
                "schritte": ["Gefahr: ätzend → Brille auf, bevor die Flasche geöffnet wird.",
                             "Gefahrfall: 10 Minuten spülen — nicht 10 Sekunden.",
                             "Entsorgung: Sammelbehälter, nicht Ausguss."],
                "ergebnis": "Brille, Spülzeit, Sammelbehälter."
            })
    },
    "formelkarte": {
        "formeln": [],
        "saetze": [
            "Erst lesen, dann handeln: Symbol → Gefahr → Schutzmaßnahme.",
            "Bei Hautkontakt mit Ätzendem: mindestens 10 Minuten mit Wasser spülen.",
            "Erst das Wasser, dann die Säure — sonst geschieht das Ungeheure.",
            "Reste gehören in den Sammelbehälter, nicht in den Ausguss.",
            "Im Zweifel: nicht anfassen, sondern fragen."
        ]
    },
    "tasks": [
        aufgabe("FC01-A1-001", "A", 1, "choice",
                "Auf einer Flasche siehst du das Gefahrensymbol für „ätzend“. Was tust du zuerst?",
                options=["Schutzbrille aufsetzen", "Kurz daran riechen", "Die Flasche schütteln"],
                answer=0,
                hints=["Ätzende Stoffe greifen Haut und Augen an.",
                       "Was schützt die Augen?",
                       "Die Schutzbrille kommt vor allem anderen."],
                solution="Ätzend heißt: Der Stoff greift Haut und Augen an. Deshalb zuerst die Schutzbrille aufsetzen.",
                misconceptions=[fv("riechen_erlaubt", 1,
                                   "Riechen ist im Chemieraum nie der erste Schritt. Bei ätzenden Stoffen kann schon der Dampf die Atemwege schädigen.",
                                   "sicherheitsregel_missachtet", 0)],
                tags=["sicherheit", "symbole"], spiral=["K-STOF"]),

        aufgabe("FC01-A2-002", "A", 2, "assign",
                "Ordne jedem Gefahrensymbol die richtige Maßnahme zu.",
                slots=["ätzend", "entzündbar", "gesundheitsschädlich"],
                values=["Schutzbrille und Handschuhe", "kein offenes Feuer", "im Abzug arbeiten"],
                answer=[0, 1, 2],
                hints=["Ätzend betrifft Haut und Augen.",
                       "Entzündbar hat mit Feuer zu tun.",
                       "Gesundheitsschädlich betrifft das Einatmen."],
                solution="Ätzend → Brille und Handschuhe.\nEntzündbar → kein offenes Feuer.\nGesundheitsschädlich → im Abzug arbeiten.",
                tags=["sicherheit", "symbole"]),

        aufgabe("FC01-A3-003", "A", 3, "numeric",
                "Du hast eine ätzende Lösung an die Hand bekommen. Wie viele Minuten musst du mindestens mit Wasser spülen?",
                answer=10, unit_label="min", tolerance=0,
                hints=["Die Regel steht in der Betriebsanweisung.",
                       "Es sind deutlich mehr als ein paar Sekunden.",
                       "Zehn Minuten."],
                solution="Bei Hautkontakt mit einem ätzenden Stoff wird mindestens 10 Minuten mit fließendem Wasser gespült.",
                misconceptions=[fv("zu_kurz_gespuelt", 1,
                                   "Eine Minute reicht nicht. Ein ätzender Stoff wirkt weiter, solange Reste auf der Haut sind — deshalb 10 Minuten.",
                                   "sicherheitsregel_missachtet")],
                tags=["sicherheit", "erste_hilfe"]),

        aufgabe("FC01-A4-004", "A", 4, "choice",
                "Im Versuch ist etwas danebengegangen. Auf dem Tisch steht eine geöffnete Flasche mit „entzündbar“, der Gasbrenner brennt noch. Was tust du zuerst?",
                options=["Den Brenner ausschalten", "Die Flasche zumachen", "Die Lehrkraft suchen gehen"],
                answer=0,
                hints=["Was ist die eigentliche Gefahrenquelle?",
                       "Ein entzündbarer Stoff braucht eine Zündquelle.",
                       "Die Flamme muss weg."],
                solution="Ein entzündbarer Stoff wird gefährlich, sobald eine Zündquelle da ist. Zuerst kommt der Brenner aus, danach wird die Flasche geschlossen und die Lehrkraft gerufen.",
                misconceptions=[fv("gefahrenquelle_verkannt", 1,
                                   "Die Flasche zu schließen ist richtig — aber erst als Zweites. Solange die Flamme brennt, bleibt die Zündquelle da.",
                                   "sicherheitsregel_missachtet")],
                tags=["sicherheit", "transfer"]),

        aufgabe("FC01-B1-005", "B", 1, "choice",
                "Welche Aussage über den Abzug ist richtig?",
                options=["Er saugt Dämpfe ab, damit sie nicht in den Raum gelangen.",
                         "Er kühlt Versuche, damit nichts zu heiß wird.",
                         "Er ist ein Schrank, in dem Chemikalien gelagert werden."],
                answer=0,
                hints=["Sieh dir an, wo die Luft im Abzug hingeht.",
                       "Der Abzug hat eine Absaugung nach oben.",
                       "Es geht um Dämpfe, nicht um Temperatur."],
                solution="Der Abzug saugt Dämpfe ab und führt sie nach draußen. Deshalb wird darin gearbeitet, wenn giftige oder stark riechende Stoffe entstehen können.",
                tags=["sicherheit", "geraete"]),

        aufgabe("FC01-B2-006", "B", 2, "assign",
                "Ordne jeder Situation die richtige Sofortmaßnahme zu.",
                slots=["Säure ins Auge", "Kleidung fängt Feuer", "Chemikalie verschluckt"],
                values=["Augendusche, mindestens 10 Minuten spülen",
                        "Löschdecke oder Notdusche, nicht wegrennen",
                        "Lehrkraft sofort informieren, nichts zu trinken geben"],
                answer=[0, 1, 2],
                hints=["Jede Situation hat eine eigene Einrichtung im Raum.",
                       "Beim Brand macht Weglaufen die Flamme größer.",
                       "Bei Verschlucken wird nichts auf eigene Faust gegeben."],
                solution="Auge → Augendusche, mindestens 10 Minuten.\nKleidung brennt → Löschdecke oder Notdusche; Rennen fächelt die Flamme an.\nVerschluckt → sofort die Lehrkraft, nichts eigenmächtig verabreichen.",
                misconceptions=[fv("wasser_bei_verschlucken", 2,
                                   "Etwas zu trinken zu geben kann die Sache verschlimmern. Bei Verschlucken gilt: sofort die Lehrkraft.",
                                   "sicherheitsregel_missachtet")],
                tags=["sicherheit", "erste_hilfe"]),

        aufgabe("FC01-B2-007", "B", 2, "choice",
                "Warum gilt beim Verdünnen von Schwefelsäure „erst das Wasser, dann die Säure“?",
                options=["Beim Mischen wird viel Wärme frei; in wenig Wasser kann die Säure spritzend verdampfen.",
                         "Die Säure würde sonst nicht mit dem Wasser mischen.",
                         "Wasser ist schwerer und muss deshalb unten liegen."],
                answer=0,
                hints=["Beim Verdünnen wird etwas frei — was?",
                       "Es geht um Wärme.",
                       "Wenig Wasser nimmt die Wärme schlecht auf."],
                solution="Beim Verdünnen wird viel Wärme frei. Gibt man Wasser in konzentrierte Säure, erhitzt sich der kleine Wassertropfen schlagartig und spritzt Säure heraus. Umgekehrt verteilt sich die Wärme in der großen Wassermenge.",
                misconceptions=[fv("dichte_als_grund", 2,
                                   "Mit der Dichte hat die Regel nichts zu tun. Entscheidend ist die Wärme, die beim Verdünnen frei wird.",
                                   "sicherheitsregel_missachtet", 1)],
                tags=["sicherheit", "saeuren", "bbr"]),

        aufgabe("FC01-B3-008", "B", 3, "numeric",
                "Ein Versuch verlangt 20 mL einer Lösung. Die Ersatzstoffprüfung ergibt, dass er auch mit einem Viertel der Menge gelingt. Wie viele Milliliter werden dann eingesetzt?",
                answer=5, unit_label="mL", tolerance=0,
                hints=["Ein Viertel von 20 mL.",
                       "20 : 4.",
                       "5 mL."],
                solution="20 mL : 4 = 5 mL. Weniger Stoff heißt weniger Gefahr und weniger Abfall — genau darum geht es bei der Ersatzstoffprüfung.",
                misconceptions=[fv("anteil_umgedreht", 80,
                                   "Du hast mit 4 multipliziert. Ein Viertel bedeutet teilen, nicht malnehmen.")],
                tags=["sicherheit", "rechnen"], spiral=["K-QUANT"]),

        aufgabe("FC01-B3-009", "B", 3, "choice",
                "Ein Schüler will prüfen, wie ein Stoff riecht. Wie geht er richtig vor?",
                options=["Mit der Hand vorsichtig Luft zur Nase fächeln",
                         "Die Öffnung direkt unter die Nase halten und tief einatmen",
                         "Gar nicht riechen — das ist immer verboten"],
                answer=0,
                hints=["Es gibt eine erlaubte Technik dafür.",
                       "Man fächelt sich die Luft zu.",
                       "Direkt einatmen ist zu viel auf einmal."],
                solution="Man fächelt sich mit der Hand vorsichtig etwas Luft zu. So gelangt nur wenig Dampf an die Nase. Direktes Einatmen kann die Atemwege schädigen.",
                misconceptions=[fv("direkt_geschnuppert", 1,
                                   "Direkt einatmen bringt die volle Konzentration in die Atemwege. Gefächelt wird mit der Hand.",
                                   "sicherheitsregel_missachtet")],
                tags=["sicherheit", "arbeitstechnik"]),

        aufgabe("FC01-B4-010", "B", 4, "assign",
                "Ordne jedem Abfall den richtigen Weg zu.",
                slots=["Reste einer Salzlösung", "Schwermetallhaltige Lösung", "Zerbrochenes Reagenzglas"],
                values=["nach Freigabe in den Ausguss", "in den Sammelbehälter", "in den Glasabfall, nicht in den Papierkorb"],
                answer=[0, 1, 2],
                hints=["Nicht alles darf in den Ausguss.",
                       "Schwermetalle gehören nie ins Abwasser.",
                       "Scherben verletzen, wenn sie im normalen Müll landen."],
                solution="Harmlose Salzlösung → nach Freigabe in den Ausguss.\nSchwermetalle → Sammelbehälter, nie ins Abwasser.\nScherben → Glasabfall.",
                misconceptions=[fv("schwermetall_in_ausguss", 0,
                                   "Schwermetallhaltige Lösungen dürfen nie in den Ausguss — sie gelangen sonst in die Kläranlage und in die Umwelt.",
                                   "sicherheitsregel_missachtet")],
                tags=["sicherheit", "entsorgung", "bbr"]),

        aufgabe("FC01-C2-011", "C", 2, "choice",
                "In einer Betriebsanweisung steht: „Nur im Abzug. Bei Freisetzung Raum verlassen.“ Was folgt daraus für die Planung des Versuchs?",
                options=["Der Versuch wird vollständig im Abzug aufgebaut, bevor die Flasche geöffnet wird.",
                         "Der Versuch wird auf dem Tisch aufgebaut und nur zum Öffnen in den Abzug gestellt.",
                         "Es reicht, das Fenster zu öffnen."],
                answer=0,
                hints=["Wann genau kann der Stoff freigesetzt werden?",
                       "Auch beim Umstellen kann etwas entweichen.",
                       "Der Aufbau muss vorher fertig sein."],
                solution="Wird der Aufbau erst nach dem Öffnen umgestellt, entweicht schon dabei etwas. Deshalb steht der gesamte Aufbau im Abzug, bevor die Flasche geöffnet wird.",
                tags=["sicherheit", "planung", "msa"]),

        aufgabe("FC01-C3-012", "C", 3, "multi",
                "Ein Versuch braucht 250 mL Lösung mit 8 % Massenanteil. Aus Gründen der Ersatzstoffprüfung wird auf 50 mL und 2 % heruntergegangen. (Dichte 1 g/mL)",
                fields=[
                    {"label": "ursprünglich eingesetzte Stoffmasse", "answer": 20, "unit_label": "g", "tolerance": 0.01,
                     "misconceptions": [fv("anteil_umgedreht", 3.125,
                                           "Du hast geteilt statt den Anteil zu nehmen. 8 % von 250 g sind 250 · 0,08.")]},
                    {"label": "jetzt eingesetzte Stoffmasse", "answer": 1, "unit_label": "g", "tolerance": 0.01},
                    {"label": "Einsparung in Prozent", "answer": 95, "unit_label": "%", "tolerance": 0.1}
                ],
                hints=["250 mL entsprechen bei Dichte 1 g/mL genau 250 g.",
                       "8 % von 250 g und 2 % von 50 g einzeln ausrechnen.",
                       "Einsparung = (20 − 1) : 20 · 100 %."],
                solution="vorher: 250 g · 0,08 = 20 g\nnachher: 50 g · 0,02 = 1 g\nEinsparung: (20 − 1) : 20 = 0,95 → 95 %",
                tags=["sicherheit", "rechnen", "msa"], spiral=["K-SL", "K-QUANT"]),

        aufgabe("FC01-C3-013", "C", 3, "choice",
                "Ein Schülerversuch soll Chlorgas erzeugen. Welche Begründung spricht am stärksten für die Microscale-Variante mit wenigen Millilitern?",
                options=["Weniger Stoff bedeutet weniger freigesetztes Gas und damit eine kleinere Gefährdung.",
                         "Kleine Geräte sind billiger in der Anschaffung.",
                         "Der Versuch geht schneller."],
                answer=0,
                hints=["Was ist der eigentliche Zweck der Ersatzstoffprüfung?",
                       "Es geht um die Gefährdung, nicht um Kosten oder Zeit.",
                       "Weniger Ausgangsstoff heißt weniger Produkt."],
                solution="Aus weniger Ausgangsstoff entsteht weniger Chlor. Die Gefährdung sinkt unmittelbar mit der eingesetzten Menge — das ist der Kern der Ersatzstoffprüfung. Kosten und Zeit sind willkommene Nebeneffekte, aber nicht der Grund.",
                misconceptions=[fv("nebeneffekt_als_grund", 1,
                                   "Kosten sind ein Nebeneffekt. Begründet wird die Microscale-Technik mit der geringeren Gefährdung.",
                                   "sicherheitsregel_missachtet")],
                tags=["sicherheit", "bewerten", "msa"]),

        aufgabe("FC01-C4-014", "C", 4, "choice",
                "Zwei Gruppen streiten: Gruppe 1 will einen Versuch mit konzentrierter Säure durchführen, weil er „eindrucksvoller“ aussieht. Gruppe 2 will die verdünnte Variante. Welche Begründung ist fachlich tragfähig?",
                options=["Gruppe 2, weil dieselbe Aussage mit geringerer Gefährdung erreichbar ist.",
                         "Gruppe 1, weil ein deutlicher Effekt wichtiger ist als die Sicherheit.",
                         "Gruppe 1, weil verdünnte Säuren gar nicht reagieren."],
                answer=0,
                hints=["Welche Frage soll der Versuch beantworten?",
                       "Wenn beide Varianten dieselbe Frage beantworten, entscheidet die Gefährdung.",
                       "Verdünnte Säuren reagieren durchaus, nur langsamer."],
                solution="Beantworten zwei Varianten dieselbe Frage, ist die mit der geringeren Gefährdung zu wählen. Genau das verlangt die Ersatzstoffprüfung. Ein „eindrucksvollerer“ Effekt ist kein fachliches Argument.",
                misconceptions=[fv("effekt_vor_sicherheit", 1,
                                   "Ein größerer Effekt rechtfertigt keine größere Gefährdung, wenn die Frage auch anders zu beantworten ist.",
                                   "sicherheitsregel_missachtet")],
                tags=["sicherheit", "bewerten", "msa"])
    ]
})

# ============================================================
# FC-02 · Der Gasbrenner
# ============================================================
EINHEITEN.append({
    "unit": "FC-02",
    "title": "Der Gasbrenner",
    "leitidee": "B4",
    "standards": ["K1", "K2.2", "K3.2"],
    "klasse": 7,
    "sicherheit": [
        "Der Brenner wird nur mit aufgesetzter Schutzbrille und zusammengebundenen Haaren betrieben.",
        "Erst das Streichholz brennt, dann wird das Gas aufgedreht — nie umgekehrt.",
        "Beim Verlassen des Platzes wird der Brenner ausgeschaltet, nicht auf Sparflamme gestellt."
    ],
    "wortspeicher": [
        "der Gasbrenner", "die Luftzufuhr", "die leuchtende Flamme", "die rauschende Flamme",
        "die Gaszufuhr", "die Flammenzone", "vollständige Verbrennung"
    ],
    "worterklaerungen": {
        "Luftzufuhr": "Der drehbare Ring unten am Brennerrohr. Er lässt Luft zum Gas.",
        "leuchtende Flamme": "Die gelbe Flamme bei geschlossener Luftzufuhr. Sie rußt und ist kühler.",
        "rauschende Flamme": "Die blaue Flamme bei offener Luftzufuhr. Sie ist heiß und rußt nicht.",
        "vollständige Verbrennung": "Das Gas verbrennt ganz. Es entstehen nur Kohlenstoffdioxid und Wasser."
    },
    "can_do": {
        "A": "Ich zünde den Brenner nach Anweisung an und stelle die blaue Flamme ein.",
        "B": "Ich erkläre den Aufbau des Brenners und begründe, warum die blaue Flamme heißer ist.",
        "C": "Ich erkläre die Flammenzonen und die Farbe der Flamme über die Vollständigkeit der Verbrennung."
    },
    "lernkarten": {
        "A": karte(
            "Gelb oder blau",
            "Der Brenner hat unten einen Ring.",
            ["Ring zu: Die Flamme ist gelb.", "Ring auf: Die Flamme ist blau. Sie ist heißer."],
            "Blau ist heiß. Gelb ist kühl.",
            visual={"type": "animation", "name": "brennerflamme", "stufe": "A"},
            beispiel={
                "titel": "Anzünden",
                "aufgabe": "Du sollst den Brenner anzünden.",
                "schritte": ["Streichholz anzünden.", "Gas aufdrehen.", "Ring öffnen: Die Flamme wird blau."],
                "ergebnis": "Eine blaue Flamme.",
                "luecke": {"schritt": 0, "wert": 1}
            }),
        "B": karte(
            "Der Luftregler entscheidet",
            "Der Brenner mischt Gas und Luft. Wie viel Luft dazukommt, stellst du am Ring unten ein — und damit auch, wie heiß die Flamme wird.",
            ["Geschlossene Luftzufuhr: gelbe, leuchtende Flamme, rund 600 °C. Sie rußt und schwärzt das Glas.",
             "Geöffnete Luftzufuhr: blaue, rauschende Flamme, über 1400 °C. Sie rußt nicht.",
             "Zum Erhitzen wird immer die rauschende Flamme genommen."],
            "Mehr Luft → heißere Flamme, weil das Gas vollständiger verbrennt.",
            visual={"type": "animation", "name": "brennerflamme", "stufe": "B"}),
        "C": karte(
            "Warum die gelbe Flamme leuchtet",
            "Farbe und Temperatur der Flamme hängen an derselben Ursache: daran, wie viel Sauerstoff das Gas beim Verbrennen zur Verfügung hat.",
            ["Bei geschlossener Luftzufuhr fehlt Sauerstoff. Das Gas verbrennt unvollständig, es entstehen glühende Rußteilchen — sie leuchten gelb. Ein Teil der Energie steckt noch im unverbrannten Ruß, deshalb ist die Flamme kühler.",
             "Bei geöffneter Luftzufuhr steht genug Sauerstoff bereit. Das Gas verbrennt vollständig zu Kohlenstoffdioxid und Wasser; die gesamte Energie wird als Wärme frei.",
             "In der Flamme liegen mehrere Zonen: Im inneren blauen Kegel ist das Gemisch noch unverbrannt, direkt über seiner Spitze liegt die heißeste Stelle."],
            "Gelb = unvollständig verbrannt = kühler. Blau = vollständig verbrannt = heißer.",
            visual={"type": "animation", "name": "brennerflamme", "stufe": "C"})
    },
    "formelkarte": {
        "formeln": ["Erdgas (Methan) + Sauerstoff → Kohlenstoffdioxid + Wasser"],
        "saetze": [
            "Reihenfolge beim Anzünden: Streichholz → Gas → Luft.",
            "Leuchtende Flamme: rund 600 °C, rußend.",
            "Rauschende Flamme: über 1400 °C, rußfrei.",
            "Heißeste Stelle: knapp über der Spitze des inneren blauen Kegels."
        ]
    },
    "tasks": [
        aufgabe("FC02-A1-001", "A", 1, "choice",
                "Die Luftzufuhr am Brenner ist geschlossen. Welche Farbe hat die Flamme?",
                options=["gelb", "blau", "grün"], answer=0,
                visual={"type": "animation", "name": "brennerflamme", "stufe": "A"},
                hints=["Sieh dir das Bild bei geschlossenem Ring an.",
                       "Ohne Luft leuchtet die Flamme.",
                       "Sie ist gelb."],
                solution="Ohne Luftzufuhr verbrennt das Gas unvollständig. Die Flamme leuchtet gelb.",
                misconceptions=[fv("farben_vertauscht", 1,
                                   "Blau ist die Flamme bei <b>offener</b> Luftzufuhr. Bei geschlossenem Ring ist sie gelb.")],
                tags=["brenner"]),

        aufgabe("FC02-A2-002", "A", 2, "choice",
                "Womit zündest du den Brenner an? Bringe in die richtige Reihenfolge: Was kommt zuerst?",
                options=["Zuerst das Streichholz anzünden, dann das Gas aufdrehen",
                         "Zuerst das Gas aufdrehen, dann das Streichholz anzünden",
                         "Beides gleichzeitig"],
                answer=0,
                hints=["Überlege, was passiert, wenn Gas ausströmt und noch keine Flamme da ist.",
                       "Ausströmendes Gas sammelt sich.",
                       "Die Flamme muss zuerst da sein."],
                solution="Zuerst brennt das Streichholz, dann wird das Gas aufgedreht. Andersherum sammelt sich Gas an und verpufft beim Zünden schlagartig.",
                misconceptions=[fv("reihenfolge_vertauscht", 1,
                                   "So sammelt sich Gas an, bevor die Flamme da ist. Das kann verpuffen. Erst das Streichholz.",
                                   "sicherheitsregel_missachtet")],
                tags=["brenner", "sicherheit"]),

        aufgabe("FC02-A3-003", "A", 3, "choice",
                "Du willst eine Flüssigkeit schnell erhitzen. Welche Flamme nimmst du?",
                options=["die blaue, rauschende Flamme", "die gelbe, leuchtende Flamme", "beide sind gleich gut"],
                answer=0,
                hints=["Welche Flamme ist heißer?",
                       "Blau ist heißer als gelb.",
                       "Die rauschende Flamme."],
                solution="Die blaue, rauschende Flamme ist über 1400 °C heiß, die gelbe nur etwa 600 °C. Zum Erhitzen wird deshalb die blaue genommen.",
                tags=["brenner"]),

        aufgabe("FC02-A4-004", "A", 4, "numeric",
                "Die rauschende Flamme ist etwa 1400 °C heiß, die leuchtende etwa 600 °C. Um wie viel Grad ist die rauschende heißer?",
                answer=800, unit_label="°C", tolerance=0,
                hints=["Der Unterschied ist eine Differenz.",
                       "1400 minus 600.",
                       "800 °C."],
                solution="1400 °C − 600 °C = 800 °C",
                misconceptions=[fv("addiert_statt_subtrahiert", 2000,
                                   "Du hast addiert. Gefragt ist der Unterschied — also die Differenz.")],
                tags=["brenner", "rechnen"], spiral=["K-QUANT"]),

        aufgabe("FC02-B1-005", "B", 1, "assign",
                "Ordne jedem Bauteil des Brenners seine Aufgabe zu.",
                slots=["Gasregulierung", "Luftregulierung", "Brennerrohr"],
                values=["lässt mehr oder weniger Gas durch",
                        "mischt dem Gas Luft bei",
                        "in ihm mischen sich Gas und Luft vor dem Verbrennen"],
                answer=[0, 1, 2],
                hints=["Zwei Regler, ein Rohr.",
                       "Ein Regler steuert das Gas, einer die Luft.",
                       "Im Rohr geschieht die Mischung."],
                solution="Gasregulierung → Gasmenge.\nLuftregulierung → Luftbeimischung.\nBrennerrohr → Mischraum für Gas und Luft.",
                tags=["brenner", "geraete"]),

        aufgabe("FC02-B2-006", "B", 2, "choice",
                "Warum ist die rauschende Flamme heißer als die leuchtende?",
                options=["Weil das Gas mit mehr Sauerstoff vollständiger verbrennt.",
                         "Weil mehr Gas durch den Brenner strömt.",
                         "Weil blaue Farbe grundsätzlich heißer ist als gelbe."],
                answer=0,
                hints=["Was ändert sich, wenn du den Luftring öffnest?",
                       "Es kommt Sauerstoff dazu.",
                       "Mehr Sauerstoff → vollständigere Verbrennung → mehr Wärme."],
                solution="Mit geöffneter Luftzufuhr steht mehr Sauerstoff bereit. Das Gas verbrennt vollständiger, und die gesamte Energie wird als Wärme frei statt teilweise im Ruß zu bleiben.",
                misconceptions=[fv("gasmenge_als_grund", 1,
                                   "Die Gasmenge ist unverändert — du hast nur den Luftring gedreht. Entscheidend ist der Sauerstoff.",
                                   "reaktion_und_zustandsaenderung_verwechselt", 0),
                                fv("farbe_als_ursache", 2,
                                   "Die Farbe ist die Folge, nicht die Ursache. Gelb leuchtet glühender Ruß — ein Zeichen unvollständiger Verbrennung.")],
                tags=["brenner", "energie", "bbr"]),

        aufgabe("FC02-B2-007", "B", 2, "choice",
                "Beim Erhitzen eines Reagenzglases in der leuchtenden Flamme wird das Glas schwarz. Woran liegt das?",
                options=["An Ruß aus der unvollständigen Verbrennung.",
                         "Das Glas verbrennt selbst.",
                         "Der Inhalt des Reagenzglases färbt das Glas."],
                answer=0,
                hints=["Der schwarze Belag lässt sich abwischen.",
                       "Woher kommt schwarzer Staub in einer Flamme?",
                       "Es ist Ruß."],
                solution="Die leuchtende Flamme verbrennt unvollständig. Der dabei entstehende Ruß schlägt sich auf dem kühleren Glas nieder. In der rauschenden Flamme passiert das nicht.",
                tags=["brenner", "beobachten"]),

        aufgabe("FC02-B3-008", "B", 3, "numeric",
                "Ein Brenner verbraucht 0,6 L Gas je Minute. Wie viele Liter sind das in einer Doppelstunde von 90 Minuten?",
                answer=54, unit_label="L", tolerance=0.01,
                hints=["Verbrauch je Minute mal Zahl der Minuten.",
                       "0,6 · 90.",
                       "54 L."],
                solution="0,6 L/min · 90 min = 54 L",
                misconceptions=[fv("geteilt_statt_mal", 150,
                                   "Du hast geteilt. Aus Verbrauch je Minute und Zeit wird die Gesamtmenge durch Multiplizieren.")],
                tags=["brenner", "rechnen"], spiral=["K-QUANT"]),

        aufgabe("FC02-B3-009", "B", 3, "choice",
                "Der Brenner brennt plötzlich mit kleiner Flamme direkt am Rohrfuß und das Rohr wird heiß. Was ist passiert und was tust du?",
                options=["Die Flamme ist zurückgeschlagen — Gas abstellen und den Brenner abkühlen lassen.",
                         "Der Brenner arbeitet richtig — einfach weitermachen.",
                         "Es fehlt Gas — Gaszufuhr weiter aufdrehen."],
                answer=0,
                hints=["Normalerweise brennt die Flamme oben am Rohr.",
                       "Wenn sie unten brennt, ist etwas schiefgelaufen.",
                       "Das heißt Flammenrückschlag."],
                solution="Brennt die Flamme unten im Rohr, ist sie zurückgeschlagen. Das Rohr wird sehr heiß. Richtig ist: Gas abstellen, Brenner abkühlen lassen, dann neu zünden — mit weniger Luft.",
                misconceptions=[fv("rueckschlag_verkannt", 1,
                                   "Eine Flamme am Rohrfuß ist nicht der Normalfall. Das Rohr wird sehr heiß — Gas abstellen.",
                                   "sicherheitsregel_missachtet")],
                tags=["brenner", "sicherheit", "bbr"]),

        aufgabe("FC02-B4-010", "B", 4, "choice",
                "Ein Schüler stellt fest: „Wenn ich den Luftring öffne, wird die Flamme leiser.“ Stimmt das?",
                options=["Nein — sie wird lauter, deshalb heißt sie rauschende Flamme.",
                         "Ja — mehr Luft dämpft das Geräusch.",
                         "Das hängt vom Brennertyp ab."],
                answer=0,
                hints=["Wie heißt die Flamme bei offener Luftzufuhr?",
                       "Der Name verrät das Geräusch.",
                       "Rauschende Flamme."],
                solution="Bei geöffneter Luftzufuhr strömt das Gas-Luft-Gemisch schneller und die Flamme rauscht hörbar. Genau daher der Name.",
                tags=["brenner", "beobachten"]),

        aufgabe("FC02-C2-011", "C", 2, "choice",
                "Warum leuchtet die gelbe Flamme überhaupt?",
                options=["Glühende Rußteilchen senden das Licht aus.",
                         "Das Gas selbst ist gelb.",
                         "Der Sauerstoff leuchtet beim Verbrennen."],
                answer=0,
                hints=["Was entsteht bei unvollständiger Verbrennung?",
                       "Feste Teilchen, die sehr heiß werden.",
                       "Ruß glüht."],
                solution="Bei Sauerstoffmangel entsteht Ruß. Die festen Rußteilchen werden in der Flamme so heiß, dass sie glühen und gelbes Licht aussenden — wie der Draht in einer alten Glühlampe.",
                misconceptions=[fv("gasfarbe_als_grund", 1,
                                   "Erdgas ist farblos. Das Gelb stammt von glühenden Rußteilchen.",
                                   "teilchen_traegt_stoffeigenschaft", 0)],
                tags=["brenner", "erklaeren", "msa"]),

        aufgabe("FC02-C3-012", "C", 3, "choice",
                "Ein Drahtnetz wird in die rauschende Flamme gehalten. Oberhalb des Netzes brennt es nicht weiter. Wie erklärst du das?",
                options=["Das Metallnetz leitet die Wärme ab; oberhalb wird die Zündtemperatur nicht mehr erreicht.",
                         "Das Netz hält den Sauerstoff zurück.",
                         "Das Netz verbraucht das Gas."],
                answer=0,
                hints=["Metall leitet Wärme sehr gut.",
                       "Was passiert mit der Temperatur oberhalb des Netzes?",
                       "Ohne ausreichende Temperatur keine Verbrennung."],
                solution="Das Drahtnetz leitet Wärme rasch ab. Oberhalb sinkt die Temperatur unter die Zündtemperatur, das Gas strömt zwar hindurch, entzündet sich dort aber nicht. Nach demselben Prinzip arbeitet die Grubenlampe von Davy.",
                misconceptions=[fv("sauerstoff_als_grund", 1,
                                   "Sauerstoff kommt durch das Netz ohne Weiteres hindurch. Entscheidend ist die abgeleitete Wärme.",
                                   "reaktion_und_zustandsaenderung_verwechselt")],
                tags=["brenner", "erklaeren", "msa"]),

        aufgabe("FC02-C3-013", "C", 3, "multi",
                "Ein Brenner verbraucht in der leuchtenden Flamme 0,4 L/min, in der rauschenden 0,9 L/min. Eine Gruppe erhitzt 12 Minuten mit der rauschenden Flamme.",
                fields=[
                    {"label": "Gasverbrauch der Gruppe", "answer": 10.8, "unit_label": "L", "tolerance": 0.01},
                    {"label": "Verbrauch, wenn dieselbe Zeit leuchtend gebrannt würde", "answer": 4.8, "unit_label": "L", "tolerance": 0.01},
                    {"label": "Mehrverbrauch in Prozent", "answer": 125, "unit_label": "%", "tolerance": 0.5}
                ],
                hints=["Verbrauch je Minute mal Minuten.",
                       "Beides einzeln ausrechnen.",
                       "Mehrverbrauch = (10,8 − 4,8) : 4,8 · 100 %."],
                solution="rauschend: 0,9 · 12 = 10,8 L\nleuchtend: 0,4 · 12 = 4,8 L\nMehrverbrauch: (10,8 − 4,8) : 4,8 = 1,25 → 125 %",
                tags=["brenner", "rechnen", "msa"], spiral=["K-QUANT"]),

        aufgabe("FC02-C4-014", "C", 4, "choice",
                "Eine Gruppe erhitzt zehn Minuten mit der leuchtenden Flamme und wundert sich, dass das Wasser nicht siedet. Welche Erklärung trifft zu?",
                options=["Die leuchtende Flamme ist zu kühl; ein Teil der Energie bleibt im unverbrannten Ruß.",
                         "Zehn Minuten sind grundsätzlich zu kurz.",
                         "Wasser siedet in Reagenzgläsern gar nicht."],
                answer=0,
                hints=["Vergleiche die Temperaturen der beiden Flammen.",
                       "600 °C gegenüber 1400 °C.",
                       "Der Ruß trägt noch unverbrauchte Energie."],
                solution="Die leuchtende Flamme erreicht nur etwa 600 °C und gibt weniger Wärme ab, weil ein Teil der Energie im unverbrannten Ruß steckt. Mit geöffneter Luftzufuhr siedet dieselbe Menge deutlich schneller.",
                tags=["brenner", "transfer", "msa"])
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
        verteilung = {}
        for t in e["tasks"]:
            verteilung[t["path"]] = verteilung.get(t["path"], 0) + 1
        print(f"  {e['unit']}  {len(e['tasks'])} Aufgaben  A/B/C = "
              f"{verteilung.get('A', 0)}/{verteilung.get('B', 0)}/{verteilung.get('C', 0)}")


if __name__ == "__main__":
    print("Bereich FC · Faszination Chemie")
    schreiben()

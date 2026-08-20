# -*- coding: utf-8 -*-
"""Erzeugt index.html aus units/index.json.

Die Startseite von Hand zu pflegen hiesse, sie irgendwann zu vergessen.
Hier wird sie erzeugt: Wer eine Einheit in units/index.json eintraegt,
bekommt sie nach einem Lauf dieses Skripts auch auf der Startseite.
"""
import io, json, os, html

WURZEL = r"C:\Users\Lance2Go\Documents\claude\Chemie\chh_Chemie_7_10"
idx = json.load(io.open(os.path.join(WURZEL, "units", "index.json"), encoding="utf-8"))

# Kurzbeschreibungen: was diese Stunde im Kern klaert.
UNTERTITEL = {
    "fc-01": "Gefahrensymbole, Regeln, Verhalten im Notfall",
    "fc-02": "Aufbau, Bedienung, Flammenzonen \u2014 der Brennerf\u00fchrerschein",
    "fc-03": "Messbare Eigenschaften statt \u201esieht so aus\u201c",
    "fc-04": "Filtrieren, Eindampfen, Destillieren \u2014 und wann was passt",
    "fc-05": "Woran man erkennt, dass ein neuer Stoff entstanden ist",
    "fc-06": "Drei Bedingungen \u2014 und was L\u00f6schen wirklich bedeutet",
    "fc-07": "Verbrennungsprodukte benennen und einordnen",
    "fc-08": "Edukt, Produkt, Massenbilanz \u2014 und Pr\u00fcfungstraining",
    "ps-01": "Perioden, Hauptgruppen, Metalle und Nichtmetalle",
    "ps-02": "Was ein Modell leistet \u2014 und wo es aufh\u00f6rt",
    "ps-03": "Vom unteilbaren Teilchen zum Atommodell",
    "ps-04": "Der Streuversuch und was daraus folgt",
    "ps-05": "Ordnungszahl, Massenzahl, Isotope",
    "ps-06": "Relative Atommasse aus dem Periodensystem",
    "ps-07": "Schalen f\u00fcllen, Au\u00dfenelektronen ablesen",
    "ps-08": "Alkalimetalle, Halogene, Edelgase \u2014 und Pr\u00fcfungstraining",
    "ga-01": "Stickstoff, Sauerstoff, Edelgase, Kohlenstoffdioxid",
    "ga-02": "Glimmspan, Knallgas, Kalkwasser",
    "ga-03": "Gemeinsame Elektronenpaare und die Lewis-Formel",
    "ga-04": "Treibhauseffekt, Stickoxide, Katalysator",
    "ga-05": "Gase sicher unterscheiden und beschreiben",
    "wa-01": "Dichteanomalie, Oberfl\u00e4chenspannung, Siedetemperatur",
    "wa-02": "Elektrolyse und Knallgasreaktion als Umkehrung",
    "wa-03": "Ausgleichen \u2014 nur Koeffizienten, nie die Indizes",
    "wa-04": "Warum das gewinkelte Molek\u00fcl ein Dipol ist",
    "wa-05": "Gleiches l\u00f6st sich in Gleichem",
    "wa-06": "Eigenschaften aus der Struktur erkl\u00e4ren",
    "sz-01": "Elektronen abgeben, Elektronen aufnehmen",
    "sz-02": "Warum Salze hart, spr\u00f6de und hochschmelzend sind",
    "sz-03": "Ladungsausgleich \u2014 und was die Formel wirklich sagt",
    "sz-04": "Leitf\u00e4higkeit, Hydrath\u00fclle, Kristallz\u00fcchtung",
    "sz-05": "Salze benennen, Formeln aufstellen, Eigenschaften erkl\u00e4ren",
    "me-01": "Glanz, Leitf\u00e4higkeit, Verformbarkeit",
    "me-02": "Warum Metalle leiten und sich biegen lassen",
    "me-03": "Die Redoxreihe und was sie vorhersagt",
    "me-04": "Messing, Bronze, Stahl \u2014 und wozu sie taugen",
    "me-05": "Elektronen\u00fcbergang: beides zugleich",
    "me-06": "Vom Erz zum Eisen",
    "me-07": "Metalle einordnen, Reaktionen vorhersagen",
    "qb-01": "Von der Atommasse zur molaren Masse",
    "qb-02": "Warum Chemiker in mol z\u00e4hlen",
    "qb-03": "Masse, Stoffmenge, molare Masse ineinander umrechnen",
    "qb-04": "22,4 L/mol \u2014 und was das bedeutet",
    "qb-05": "Vom Ansatz zur Masse des Produkts",
    "sl-01": "Wirkung, Verd\u00fcnnungsregel, Umgang",
    "sl-02": "Farben lesen, Werte einordnen",
    "sl-03": "Was beim L\u00f6sen in Wasser wirklich passiert",
    "sl-04": "Hydroxid-Ionen und die Wirkung von Laugen",
    "sl-05": "Nichtmetalloxide und Metalloxide im Wasser",
    "sl-06": "Aus S\u00e4ure und Lauge werden Wasser und Salz",
    "sl-07": "Titration, pH-Wert, Salzbildung sicher",
    "kw-01": "Kohlenstoff als Element des Lebens",
    "kw-02": "Immer eine CH\u2082-Gruppe mehr",
    "kw-03": "Dieselbe Sache, drei Schreibweisen",
    "kw-04": "Gleiche Summenformel, anderer Bau",
    "kw-05": "Warum lange Ketten sp\u00e4ter sieden",
    "kw-06": "Vollst\u00e4ndig und unvollst\u00e4ndig verbrennen",
    "kw-07": "Formeln, Namen, Gleichungen sicher",
    "al-01": "Die funktionelle Gruppe erkennen",
    "al-02": "Methanol, Ethanol, Propanol \u2026",
    "al-03": "L\u00f6slichkeit und Siedetemperatur begr\u00fcnden",
    "al-04": "Zwei und drei OH-Gruppen \u2014 und was das \u00e4ndert",
    "al-05": "Alkanal, Alkanon, Alkans\u00e4ure",
    "al-06": "Von der Maische zum Destillat \u2014 und zum Promillewert",
    "al-07": "Struktur, Name, Eigenschaft verbinden",
    "os-01": "Essig, Zitrone, Entkalker",
    "os-02": "Methans\u00e4ure, Ethans\u00e4ure, Trivialnamen",
    "os-03": "Warum organische S\u00e4uren sauer reagieren",
    "os-04": "Citronens\u00e4ure, Oxals\u00e4ure, Aminos\u00e4uren",
    "os-05": "Formeln, Salze, Reaktionen sicher",
    "es-01": "Kondensation \u2014 und woher das Wasser kommt",
    "es-02": "Aromastoffe, L\u00f6sungsmittel, ASS",
    "es-03": "Dreifachester des Glycerins",
    "es-04": "Micelle, hydrophil, hydrophob",
    "es-05": "Vom Molek\u00fcl zur Faser",
    "es-06": "Veresterung, Fette, Seifen, Polyester",
}

KLASSEN_TEXT = {
    7: "Klasse 7 \u2014 vom ersten Versuch zum Teilchenbild",
    8: "Klasse 8 \u2014 Bindungen erkl\u00e4ren Eigenschaften",
    9: "Klasse 9 \u2014 rechnen, messen, S\u00e4uren verstehen",
    10: "Klasse 10 \u2014 organische Chemie",
}
FARBE = {7: "var(--a)", 8: "var(--b)", 9: "var(--c)", 10: "var(--a)"}

CSP = ("default-src 'self'; base-uri 'none'; object-src 'none'; "
       "frame-src https://learningapps.org https://*.learningapps.org https://serlo.org https://*.serlo.org "
       "https://h5p.org https://*.h5p.org https://schule-bw.de https://*.schule-bw.de "
       "https://learningsnacks.de https://*.learningsnacks.de https://quizlet.com https://*.quizlet.com "
       "https://zum.de https://*.zum.de; script-src 'self'; "
       "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; "
       "img-src 'self' data: blob:; connect-src 'self' https://*.supabase.co; form-action 'self'; worker-src 'self'")

def e(s):
    return html.escape(s, quote=False)

teile = []
A = teile.append

A('<!DOCTYPE html>')
A('<html lang="de">')
A('<head>')
A('<meta charset="utf-8">')
A('<meta http-equiv="Content-Security-Policy" content="%s">' % CSP)
A('<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">')
A('<meta name="theme-color" content="#15233A">')
A('<title>Chemie 7\u201310 \u00b7 Campus Hannah H\u00f6ch</title>')
A('<link rel="preconnect" href="https://fonts.googleapis.com">')
A('<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>')
A('<link href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Bricolage+Grotesque:opsz,wght@12..96,700;12..96,800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">')
A('<link rel="stylesheet" href="assets/css/app.css">')
A('</head>')
A('<body style="padding-bottom:24px">')
A('')
A('<header class="hero">')
A('  <div class="schule">Campus Hannah H\u00f6ch \u00b7 Jahrg\u00e4nge 7 bis 10</div>')
A('  <h1>Chemie<br>Klasse 7 bis 10</h1>')
A('  <p>Jede Einheit hat drei Lernwege. Du w\u00e4hlst selbst, wo du einsteigst \u2014 und du darfst jederzeit wechseln.</p>')
A('</header>')
A('')
A('<main>')
A('  <div class="abschnitt-titel">Jede Stunde zuerst</div>')
A('  <div class="liste">')
A('    <a class="eintrag" href="warmup.html" style="border-left:4px solid var(--b)">')
A('      <span class="nr">5 min</span>')
A('      <span class="txt"><strong>Warm-up: Altes Wissen</strong><span>F\u00fcnf Aufgaben aus dem, was schon dran war</span></span>')
A('      <span class="pfeil">\u2192</span>')
A('    </a>')
A('  </div>')
A('')

letzte_klasse = None
gesamt = 0
for b in idx["bereiche"]:
    kl = b["klasse"]
    if kl != letzte_klasse:
        A('  <div class="abschnitt-titel" style="margin-top:34px">%s</div>' % e(KLASSEN_TEXT[kl]))
        letzte_klasse = kl
    code = b["code"]
    farbe = FARBE[kl]
    A('  <div class="abschnitt-titel" id="bereich-%s">%s \u00b7 Themenfeld %s</div>'
      % (code, e(b["title"]), b["themenfeld"]))
    A('  <div class="liste">')
    A('    <a class="eintrag" href="animationen.html?bereich=%s" style="border-left:4px solid %s">' % (code.upper(), farbe))
    A('      <span class="nr">\u25b6 Anim</span>')
    A('      <span class="txt"><strong>Animationen: %s</strong><span>Vorg\u00e4nge auf Teilchenebene \u2014 nach Niveaustufe</span></span>' % e(b["title"]))
    A('      <span class="pfeil">\u2192</span>')
    A('    </a>')
    A('    <a class="eintrag" href="uebungen.html#%s" style="border-left:4px solid %s">' % (code, farbe))
    A('      <span class="nr">\u270e \u00dcben</span>')
    A('      <span class="txt"><strong>\u00dcben &amp; Wiederholen: %s</strong><span>Externe \u00dcbungen zum Wiederholen</span></span>' % e(b["title"]))
    A('      <span class="pfeil">\u2192</span>')
    A('    </a>')
    for u in b["einheiten"]:
        gesamt += 1
        unter = UNTERTITEL.get(u["id"], "")
        A('    <a class="eintrag" href="einheit.html?u=%s">' % u["id"])
        A('      <span class="nr">%s</span>' % u["id"].upper())
        A('      <span class="txt"><strong>%s</strong><span>%s</span></span>' % (e(u["title"]), e(unter)))
        A('      <span class="pfeil">\u2192</span>')
        A('    </a>')
    A('  </div>')
    A('')

A('  <div class="abschnitt-titel">Pr\u00fcfen</div>')
A('  <div class="liste">')
A('    <a class="eintrag" href="pruefung.html" style="border-left:4px solid var(--c)">')
A('      <span class="nr">Satz</span>')
A('      <span class="txt"><strong>Pr\u00fcfungstrainer</strong><span>Sockel, BBR/eBBR, MSA \u2014 jedes Mal neu gemischt</span></span>')
A('      <span class="pfeil">\u2192</span>')
A('    </a>')
A('  </div>')
A('')
A('  <div class="abschnitt-titel">F\u00fcr die Lehrkraft</div>')
A('  <div class="liste">')
A('    <a class="eintrag" href="arbeitsblatt.html">')
A('      <span class="nr">Druck</span>')
A('      <span class="txt"><strong>Arbeitsblatt erzeugen</strong><span>Aufgaben und L\u00f6sungen aus demselben Pool</span></span>')
A('      <span class="pfeil">\u2192</span>')
A('    </a>')
A('    <a class="eintrag" href="matrix.html">')
A('      <span class="nr">Matrix</span>')
A('      <span class="txt"><strong>Kompetenzmatrix</strong><span>\u201eIch kann\u201c-S\u00e4tze abhaken, als Text f\u00fcr Zeugnis oder F\u00f6rderplan</span></span>')
A('      <span class="pfeil">\u2192</span>')
A('    </a>')
A('  </div>')
A('')
A('  <p class="hinweis">')
A('    %d Einheiten \u00e0 60 Minuten in zw\u00f6lf Themenfeldern, aufgebaut nach dem' % gesamt)
A('    schulinternen Curriculum und dem Rahmenlehrplan Teil C Chemie. Jede Einheit')
A('    hat drei Lernwege (4 Basis \u00b7 6 Standard \u00b7 4 Vertiefung) mit gestuften Tipps,')
A('    vollst\u00e4ndigem L\u00f6sungsweg und R\u00fcckmeldung zu typischen Denkfehlern.<br><br>')
A('    Das Warm-up zieht seine Aufgaben aus einem eigenen Pool: Was du kannst,')
A('    kommt erst in ein paar Wochen wieder. Was schiefging, schon morgen.<br><br>')
A('    Pr\u00fcfungstrainer und Arbeitsblatt sind <b>Sichten auf denselben Pool</b> \u2014')
A('    kein zweiter Aufgabenbestand, der veraltet.')
A('  </p>')
A('</main>')
A('')
A('<script src="assets/js/store.js"></script>')
A('<script src="assets/js/supabase-config.js"></script>')
A('<script src="assets/js/dev-tools.js"></script>')
A('<script src="assets/js/student-login.js"></script>')
A('<script src="assets/js/tracker.js"></script>')
A('<script src="assets/js/lernmodus.js"></script>')
A('<script src="assets/js/weiterlernen.js"></script>')
A('</body>')
A('</html>')

with io.open(os.path.join(WURZEL, "index.html"), "w", encoding="utf-8", newline="\n") as f:
    f.write("\n".join(teile) + "\n")
print("index.html erzeugt:", gesamt, "Einheiten in", len(idx["bereiche"]), "Bereichen")

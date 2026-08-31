# Einbindung des Chemie-Fragenkatalogs

Quelle ist die vom Auftraggeber bereitgestellte Datei
`chemie-fragenbank-github.zip`. Die unveränderte statische Bank liegt in
`questions.json`; `zuordnung.json` dokumentiert jede tatsächlich in einer
Lerneinheit verwendete Frage mit Lernweg, Katalogschwierigkeit und
Lehrbuchseiten.

## Niveaustufen

- Eine Katalogfrage wird innerhalb einer Einheit nur in einem Lernweg benutzt.
- Lernweg A erhält kurze Grundlagenfragen mit höchstens drei Antworten.
- Lernweg B erhält Anwendungen und Erklärungen.
- Lernweg C erhält Transfer, Begründung oder mehrschrittige Aufgaben.

Die Katalogschwierigkeit ist ein Auswahlmerkmal, aber nicht das einzige:
Die konkrete Kapitelpassung hat Vorrang. Gibt es für einen Lernweg keine
passende Katalogfrage, bleibt seine einheitsspezifische Originalaufgabe erhalten.

## Bewusst nicht erzwungene Zuordnung

98 redaktionell geprüfte Katalogfragen ergänzen 59 Einheiten. Alle übrigen
Aufgaben bleiben erhalten. Fachliche Passung und ein klarer Niveauunterschied
gehen vor einer bloßen Katalogquote.

Die 224 Warm-up-Fragen sind eindeutig: Jede Frage gehört genau einem Niveau
und trägt mit `ab_einheit` die Stelle, nach der sie Wiederholungsstoff ist.

## Reproduzierbarer Import

`node werkzeuge/fragenkatalog_einspielen.js` baut Einheiten, Warm-up-Pools
und Zuordnung neu. Für gezielte Läufe gibt es `--units-only` und
`--warmup-only`.

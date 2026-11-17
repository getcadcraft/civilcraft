---
title: Tegn med fang, valgte hjørner og flytt, kopier og roter
summary: Plasser veglinjer, byggeplater, eiendommer og formlinjer nøyaktig på punkter og hjørner du allerede har, skriv inn eller velg et hjørnes øst- og nordkoordinat, vri en tangent mot to punkter, og flytt, kopier eller roter et objekt med en avstand eller vinkel.
keywords: fang, objektfang, fest til punkt, fest til hjørne, PI, hjørne, hjørnepunkt, velg, kryssmarkør, øst, nord, koordinater, skrevne koordinater, tangent, retning, peiling, flytt, kopier, roter, transformer, kopier og roter, dupliser, alt, fritt punkt, tegning
from: 49864dda
---

Nytt i 0.9: når du tegner, havner markøren på punktene og hjørnene som allerede finnes i planen, og et byggeplate-, eiendoms- eller formlinjehjørne kan skrives inn eller velges. Denne siden går gjennom de tre verktøyene.

## Du skal

- Tegne med fang, slik at en ny veglinje, byggeplate, eiendom eller linje starter og slutter nøyaktig på noe som finnes.
- Sette et hjørnes øst- og nordkoordinat ved å skrive det inn eller velge et sted i planen.
- Vri en veglinjetangent mot to valgte punkter.
- Flytte, kopiere eller rotere et helt objekt.

## Fremgangsmåte

1. Velg et tegneverktøy, for eksempel {{ui:Veglinje}}, {{ui:Byggeplate}}, {{ui:Eiendom}} eller {{ui:Formlinje}}. Flytt pekeren nær et målepunkt, et veglinje-PI, en byggeplate-, eiendoms- eller massehjørne, et formlinjehjørne eller en overvannskum. En markør vises med en etikett (PI, Hjørne, Hjørnepunkt, Kum eller Punkt med nummer) og øst- og nordkoordinaten den vil lande på. Klikk for å plassere punktet der.
2. For å plassere et punkt fritt, hold {{key:Alt}} mens du klikker. Fanget slås av.
3. Velg en byggeplate, eiendom eller formlinje. I egenskapene lister blokken {{ui:Hjørner}} hvert hjørne med en Øst-boks og en Nord-boks. Skriv inn nye tall, eller trykk kryssmarkørknappen ved siden av et hjørne og klikk et sted i planen. Hjørnet tar den østlige og nordlige koordinaten. Trykk {{key:Esc}} for å avbryte et valg. Kryssmarkøren virker bare i planen: lukk 3D-visningen først.
4. For å vri en tangent, velg en veglinje. I egenskapene, under {{ui:Tangent fra to punkter}}, velg tangenten, trykk {{ui:Første punkt}} og klikk i planen, trykk {{ui:Andre punkt}} og klikk igjen, og trykk så {{ui:Angi retning}}. Tangenten vrir seg til å gå fra det første punktet mot det andre, og beholder lengden sin.
5. For å flytte, kopiere eller rotere, velg en veglinje, byggeplate, eiendom eller formlinje. I egenskapene, under {{ui:Flytt, kopier og roter}}, skriv inn {{ui:Flytt øst}} og {{ui:Flytt nord}} (negative tall går vest og sør) og trykk {{ui:Flytt}} eller {{ui:Kopier}}. Eller trykk {{ui:Avstand fra to punkter}} og klikk punktet å flytte fra og punktet å flytte til.
6. For å rotere, skriv vinkelen i {{ui:Roter mot klokken}} (grader), og trykk så {{ui:Roter}} eller {{ui:Kopier og roter}}. Objektet roteres om midten av hjørnene sine, med mindre du velger et punkt å rotere om med kryssmarkøren ved siden av vinkelen.

## Merknader

- En kopi lar originalen stå der den er, og er valgt etterpå.
- Hver flytting, kopiering, rotering, valgt hjørne og vridd tangent er ett angretrinn.
- Fang rekker 10 skjermpiksler fra markøren. En fangmarkør tilbyr bare et sted; ingenting endres før du klikker.
- Den samme kryssmarkøren finnes på en veglinjes PI-rader. Se [Veglinjer](topic:alignment), [Eiendommer](topic:parcels) og [Formlinjer](topic:feature-lines).

---
title: Tegn med fang, valgte hjørner og flyt, kopiér og roter
summary: Placér tracéer, byggeplateauer, matrikler og feature-linjer præcist på punkter og hjørner, du allerede har, skriv eller vælg et hjørnes øst og nord, drej en tangent mod to punkter, og flyt, kopiér eller roter et objekt med en afstand eller en vinkel.
keywords: fang, objektfang, fang til punkt, fang til hjørne, pi, toppunkt, hjørne, sigtekors, øst, nord, koordinater, skrevne koordinater, tangent, retning, pejling, flyt, kopiér, roter, transformér, kopiér roteret, duplikér, alt, frit punkt, tegning
from: 49864dda
---

Nyt i 0.9: når du tegner, lander markøren på de punkter og hjørner, der allerede er i planen, og et hjørne af et byggeplateau, en matrikel eller en feature-linje kan skrives eller vælges. Dette emne gennemgår de tre værktøjer.

## Hvad du skal gøre

- Tegn med fang, så et nyt tracé, byggeplateau, matrikel eller linje starter og slutter præcist på noget, der allerede findes.
- Angiv et hjørnes øst og nord ved at skrive dem eller vælge et sted i planen.
- Drej et tracés tangent mod to valgte punkter.
- Flyt, kopiér eller roter et helt objekt.

## Trin

1. Vælg et tegneværktøj, for eksempel {{ui:Tracé}}, {{ui:Byggeplateau}}, {{ui:Matrikel}} eller {{ui:Feature-linje}}. Flyt markøren tæt på et målepunkt, et tracé-PI, et byggeplateau, en matrikel eller et masse-hjørne, et feature-linjetoppunkt eller et stormbygværk. Et mærke vises med en etiket (PI, Hjørne, Toppunkt, Bygværk eller Punkt og dets nummer) og den øst og nord, det lander på. Klik for at placere punktet der.
2. For at placere et punkt frit skal du holde {{key:Alt}} nede, mens du klikker. Fangen slås fra.
3. Vælg et byggeplateau, en matrikel eller en feature-linje. Under **Egenskaber** viser blokken {{ui:Hjørner}} hvert hjørne med en Øst-boks og en Nord-boks. Skriv nye tal, eller tryk på sigtekorsknappen ved siden af et hjørne og klik et sted i planen. Hjørnet får den øst og nord. Tryk {{key:Esc}} for at annullere et valg. Sigtekorset virker kun i planen: luk 3D-visningen først.
4. For at dreje en tangent skal du vælge et tracé. Under {{ui:Tangent ud fra to punkter}} i **Egenskaber** vælger du tangenten, trykker på {{ui:Første punkt}} og klikker i planen, trykker på {{ui:Andet punkt}} og klikker igen, og trykker derefter på {{ui:Angiv retning}}. Tangenten drejer, så den løber fra det første punkt mod det andet, og beholder sin længde.
5. For at flytte, kopiere eller rotere skal du vælge et tracé, byggeplateau, en matrikel eller en feature-linje. Under **Egenskaber**, under {{ui:Flyt, kopiér og roter}}, skriver du {{ui:Flyt øst}} og {{ui:Flyt nord}} (negative tal går mod vest og syd) og trykker på {{ui:Flyt}} eller {{ui:Kopiér}}. Eller tryk på {{ui:Afstand fra to punkter}} og klik på punktet, der skal flyttes fra, og punktet, der skal flyttes til.
6. For at rotere skriver du vinklen i {{ui:Roter mod uret}} (grader), og trykker derefter på {{ui:Roter}} eller {{ui:Kopiér roteret}}. Den drejer om midten af sine hjørner, medmindre du vælger et punkt at dreje om med sigtekorset ved siden af vinklen.

## Noter

- En kopi lader originalen blive, hvor den er, og kopien er valgt bagefter.
- Hver flytning, kopi, rotation, valgt hjørne og drejet tangent er ét fortrydelsestrin.
- Fangen rækker 10 skærmpixels fra markøren. Et fangemærke tilbyder kun et sted; intet ændres, før du klikker.
- Det samme sigtekors findes i et tracés PI-rækker. Se [Tracéer](topic:alignment), [Matrikler](topic:parcels) og [Feature-linjer](topic:feature-lines).

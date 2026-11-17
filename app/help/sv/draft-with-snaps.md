---
title: Rita med fångst, valda hörn och flytta, kopiera och rotera
summary: Placera linjeföringar, byggplattor, fastigheter och funktionslinjer exakt på punkter och hörn som redan finns, skriv eller välj ett hörns östvärde och nordvärde, vrid en tangent mot två punkter och flytta, kopiera eller rotera ett objekt med ett avstånd eller en vinkel.
keywords: fångst, objektfångst, fånga till punkt, fånga till hörn, PI, hörnpunkt, hörn, välj, korshår, östvärde, nordvärde, koordinater, skrivna koordinater, tangent, riktning, riktningsvinkel, flytta, kopiera, rotera, transformera, kopiera roterad, duplicera, Alt, fri punkt, ritning
from: 49864dda
---

Nytt i 0.9: när du ritar hamnar markören på de punkter och hörn som redan finns i planen, och ett hörn på en byggplatta, fastighet eller funktionslinje kan skrivas eller väljas. Det här ämnet går igenom de tre verktygen.

## Det här gör du

- Rita med fångst, så att en ny linjeföring, byggplatta, fastighet eller linje börjar och slutar exakt på något som finns.
- Ange ett hörns östvärde och nordvärde genom att skriva det eller välja en plats i planen.
- Vrid en linjeföringstangent mot två valda punkter.
- Flytta, kopiera eller rotera ett helt objekt.

## Steg

1. Välj ett ritverktyg, till exempel {{ui:Linjeföring}}, {{ui:Byggplatta}}, {{ui:Fastighet}} eller {{ui:Funktionslinje}}. Flytta pekaren nära en mätpunkt, en linjeföringens PI, en byggplatta, fastighet eller massa-hörn, ett hörn på en funktionslinje eller en dagvattenbrunn. En markör visas med en etikett (PI, Hörn, Hörnpunkt, Brunn eller Punkt och dess nummer) och det östvärde och nordvärde punkten kommer att hamna på. Klicka för att placera punkten där.
2. För att placera en punkt fritt, håll {{key:Alt}} nedtryckt när du klickar. Fångsten stängs av.
3. Markera en byggplatta, fastighet eller funktionslinje. I egenskaperna listar blocket {{ui:Hörn}} varje hörn med en rad för Östvärde och en för Nordvärde. Skriv nya tal, eller tryck på korshårsknappen bredvid ett hörn och klicka på en plats i planen. Hörnet får det östvärdet och nordvärdet. Tryck på {{key:Esc}} för att avbryta ett val. Korshåret fungerar bara i planvyn: stäng 3D-vyn först.
4. För att vrida en tangent, markera en linjeföring. I egenskaperna, under {{ui:Tangent från två punkter}}, väljer du tangenten, trycker på {{ui:Första punkten}} och klickar i planen, trycker på {{ui:Andra punkten}} och klickar igen, och trycker sedan på {{ui:Ange riktning}}. Tangenten vrids så att den går från första punkten mot den andra och behåller sin längd.
5. För att flytta, kopiera eller rotera, markera en linjeföring, byggplatta, fastighet eller funktionslinje. I egenskaperna, under {{ui:Flytta, kopiera och rotera}}, skriver du {{ui:Flytta österut}} och {{ui:Flytta norrut}} (negativa tal går väst och syd) och trycker på {{ui:Flytta}} eller {{ui:Kopiera}}. Eller tryck på {{ui:Avstånd från två punkter}} och klicka på punkten att flytta från och punkten att flytta till.
6. För att rotera, skriv vinkeln i {{ui:Rotera moturs}} (grader), och tryck sedan på {{ui:Rotera}} eller {{ui:Kopiera roterad}}. Den vrids kring mitten av sina hörn, om du inte väljer en punkt att rotera kring med korshåret bredvid vinkeln.

## Anteckningar

- En kopia lämnar originalet kvar där det är och markeras efteråt.
- Varje flytt, kopia, rotation, valt hörn och vriden tangent är ett ångra-steg.
- Fångsten når 10 skärmpixlar från markören. En fångstmarkör erbjuder bara en plats; ingenting ändras förrän du klickar.
- Samma korshår finns på en linjeförings PI-rader. Se [Linjeföringar](topic:alignment), [Fastigheter](topic:parcels) och [Funktionslinjer](topic:feature-lines).

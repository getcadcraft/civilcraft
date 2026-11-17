---
title: Kontroller masser mot soneringsgrensene som skrives inn
summary: Skriv inn en tomts tilbakerykkinger linje for linje, en høydegrense, et frihimmelsplan, en utnyttelsesgrad og en bebygd andel, se det byggbare området i planen, og les hvilke masser som bryter hvilke grenser.
keywords: soning, tilbakerykking, tilbakerykkinger, forkant, side, bakkant, byggbart område, høydegrense, frihimmelsplan, utnyttelsesgrad, FAR, bebygd areal, tomt, eiendom, reguleringsbestemmelse, regelkontroll
from: 3e267b31
---

**CivilCraft har ingen soneringsregler innebygd.** Det kjenner ikke til noen by sine regler og leveres ikke med et bibliotek av dem. Alle tall på denne siden skrives inn fra egen reguleringsbestemmelse, og hvert resultat sier at det er målt mot grensene som er skrevet inn. Det er en måte å se hvordan en tomts grenser former en bygning, ikke en avgjørelse om hvorvidt en prosjektering er tillatt.

## Skriv inn grensene

Under **Egenskaper**, under **Bygningsmasser**, velg en **Eiendom** (eller velg en masse: eiendommens grenser vises under den). Fyll inn det som gjelder; la en boks stå tom for «ingen grense»:

- **Gatelinje**: tomtegrensen mot gaten. **Tilbakerykking foran** gjelder for den, **Tilbakerykking bak** gjelder for linjen som ligger lengst unna den, og **Tilbakerykking på siden** gjelder for resten.
- **Høydegrense**.
- **Frihimmelsplan**: det starter i en høyde ved tomtegrensen og stiger med den mengden som skrives inn for hver 1 innover, målt fra gatelinjen eller fra hver tomtegrense (2 betyr 2 til 1). Høyden som tillates over et punkt, er den laveste av planet og høydegrensen.
- **Utnyttelsesgrad** (bruttoareal for massene på tomten delt på tomtens areal) og **Bebygd areal** (fotavtrykkene deres delt på tomtens areal, skrevet inn i prosent).

## Det byggbare området

Huk av for **Vis det byggbare området i planen** for å tegne det på layeret `A-MASS-ENVL`. Området er tomten trukket inn fra hver tomtegrense med den linjens egen tilbakerykking, og forskyvningslinjene møtes i skrå hjørner. En tomtegrense som er en kurve, tas som korte korder innenfor 0.01 fra kurven. Både konvekse og konkave tomter fungerer. Hvis tilbakerykkingene folder seg over seg selv (en dyp tilbakerykking på en smal eller svært konkav tomt), finnes det ikke noe byggbart område, og Egenskaper sier det; prøv mindre avstander.

## Resultatet

Under boksene får hver masse og hver grense en linje, med en hake eller et kryss:

- **tilbakerykkinger**: arealet av massen som ligger utenfor det byggbare området;
- **høyde**: massens høyde mot det høyeste som tillates over fotavtrykket (en prisme med én høyde begrenses av den laveste tillatte høyden i noen av hjørnene);
- **utnyttelsesgrad** og **bebygd areal**: alle massene på eiendommen lagt sammen.

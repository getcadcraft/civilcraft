---
title: Terreng fra høydekurver
summary: Lag terrengoverflaten fra et høydekurvekart: velg linjelagene, si hvor hver linjes høyde kommer fra, kontroller for kryssinger og duplikater, og bygg. Høydekurvene blir bruddlinjer, med flate trekanter på rygger og i daler rettet opp. Et kart tegnet over fra et bilde eller en PDF kan skaleres og plasseres med to kjente punkter.
keywords: høydekurver, høydekurvelinjer, terreng fra høydekurver, overflate fra høydekurver, topografisk kart, oppmålingskart, uten koordinater, bruddlinjer, flate trekanter, rygg, dal, topp, kryssende høydekurver, dupliserte høydekurver, ekvidistanse, skalere kart, to punkter, plassere kart, DXF, DWG, shapefile
from: e6161653
---

En landmåler sender noen ganger et høydekurvekart: linjer med høyder, men uten punkter. CivilCraft bygger det eksisterende terrenget fra disse linjene.

## Hent inn høydekurvene

Åpne kartet som tegningslinjer: en DXF- eller DWG-tegning, en shapefile eller GeoJSON (**GIS** › {{ui:Importer}}, eller slipp filen på planen). Linjene kommer inn som **kartlag**. Under **Terrengmodell** › {{ui:Mer}} velger du {{ui:Terreng fra høydekurver}}.

## Si hvor hver høyde kommer fra

Kryss av lagene som inneholder høydekurver, og velg deretter **Høyde fra**:

- {{ui:Linjenes egne høyder}}: en linje der alle hjørnepunktene har samme høyde (en 3D-polylinje, eller en polylinje med en høyde). En linje på 0 er plantegningslinjer og har ingen høyde.
- Et **tallfelt** i laget (for eksempel ELEV), når kartet kom med ett.
- {{ui:En start og et intervall, i den rekkefølgen linjene er oppført}}: for linjer uten noen høyde i det hele tatt. Den første oppførte linjen får **Første linjes høyde**, den neste den pluss **Ekvidistanse**, og så videre. List linjene fra den laveste og oppover (eller omorden dem i laget).

## Kontroller, og bygg deretter

{{ui:Kontroller}} lister hva som er feil, med ord, før noe endres:

- en linje **uten høyde** eller med færre enn to punkter;
- en **duplikat** linje (samme form to ganger, selv tegnet motsatt vei);
- to linjer som **krysser hverandre**, i ulike høyder eller i samme høyde (en linje som krysser seg selv også), med stedet;
- en høyde som **ikke ligger på intervallet** (en skrivefeil som 105.5 på et kart med 1 m).

Kryss av {{ui:Utelat linjer som krysser en annen}} for å fjerne linjen som krysser flest andre (så neste, til ingen krysser). En løsrevet linje som skjærer alle høydekurvene er den som går, ikke kurvene. **Forenkle linjer innen** fjerner hjørnepunkter som er nærmere en rett strekning enn den avstanden.

{{ui:Bygg terrenget}} legger linjene til det eksisterende terrenget som bruddlinjer (ett angre-steg), slik at overflaten går nøyaktig gjennom hver høydekurve. Med {{ui:Rett opp flate trekanter på rygger, daler og topper}} krysset av og et intervall gitt, legger CivilCraft også til et punkt inne i hver flate trekant (en trekant der alle hjørnene ligger på én høydekurve), i den høyden skråningen ved siden av fortsetter til, og aldri mer enn en halv ekvidistanse fra høydekurven. Uten det kommer rygg-toppene, dalbunnene og toppene ut som flate plater. På en testhøyde falt feilen mot den virkelige overflaten med en fjerdedel; på en rygg med 40 %.

## Et kart uten koordinater

For et høydekurvekart som er tegnet over fra et bilde eller en PDF, åpne **Skaler og plasser lagene ved to kjente punkter**. Gi to punkter på kartet og hvor de virkelig er; de avkryssede lagene skaleres, roteres og flyttes for å passe (ett angre-steg; høyder endres ikke). De samme to punktene gir skalaen (vist i meldingen) og rotasjonen.

Overflaten er så god som kartet: mellom to høydekurver er den et plan, så det virkelige terrenget mellom dem er ukjent. Kontroller resultatet mot kotehøyder før du stoler på det.

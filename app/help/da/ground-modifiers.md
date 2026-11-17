---
title: Terrænmodifikatorer og løbende koter
summary: Alt, der former det projekterede terræn, i én ordnet liste (den senere vinder, hvor de overlapper), afgravning og opfyldning pr. modifikator, samlingskontrol i panelet Problemer, og koteangivelser og faldpile, der læser terrænet løbende.
keywords: terrænmodifikatorer, stak, rækkefølge, projekteret terræn, eksisterende terræn, overlap, afgravning og opfyldning, samling, støttemur, belægningskant, bundkote, trinrepos, koteangivelse, højdeangivelse, faldpil, hældningsmærkat, fald
from: 3998a5b0
---

Projekteret terræn = eksisterende terræn + modifikatorerne, i rækkefølge. Det eksisterende terræn ændres aldrig.

## Listen

{{ui:Koter}} › {{ui:Terrænmodifikatorer…}} viser alle objekter, der former terrænet: platforme, jordvolde, grøfter, planeringsområder, belægninger og stier, beplantede områder med en færdig kote, samt trin og rampe, hvor feltet **Former terrænet** er markeret (med deres bund- og topkoter). Hvor to overlapper, **vinder den senere**. Træk en række, eller brug pilene, for at ændre rækkefølgen; terrænet genopbygges med det samme. Hver række viser sin afgravning og opfyldning (det, den former efter dem ovenfor), med summen under listen.

## Samlingskontrol

Panelet Problemer viser følgende med **gå til**:

- en mur, hvor højsiden er over dens top (jord over muren), eller hvor lavsiden viser dens fundament;
- et beplantet område, hvis færdige kote er over belægningskanten, det møder, eller mere end de typiske 150 mm under den;
- trin, hvis bund eller top ikke rammer den belægning, de lander på;
- to modifikatorer, der overlapper (den senere vinder der).

En støttemur kan få sin top til at følge højsiden af terrænet: dens højde beregnes igen, hver gang terrænet ændres.

## En støttemur, der former terrænet

Vælg en støttemur, og markér **Former terrænet**. Stripen under muren (lige så bred som muren er tyk) føjes til listen som en modifikator:

- kanten på **højsiden** holdes på terrænet dér, station for station, så murens top følger højsiden (med murkronen på toppen). Skriv en **Top**-kote, og den holder i stedet højsiden på denne kote minus murkronen;
- kanten på **lavsiden** holdes på den kote, du skriver under **Terræn fastholdt på lavsiden**, eller, hvis feltet er tomt, på terrænet dér;
- højsiden er den side, hvis terræn er højest over hele muren, så den aldrig skifter langs muren;
- terrænet ud over stripen ændres ikke, og det eksisterende terræn ændres aldrig.

Som enhver modifikator står den i listen, og en modifikator, der står efter den, vinder, hvor de overlapper. En mur, hvor den fastholdte kote i en ende ligger mere end de typiske 150 mm fra det eksisterende terræn dér, får en advarsel i panelet Problemer (med **gå til**). En frit stående mur former ikke terrænet. Feltet er slået fra i filer fra tidligere versioner, så de åbnes, som de var.

## Koteangivelser og faldpile

{{ui:Koteangivelse}} (ét klik) og {{ui:Fald-pil}} (to klik) læser terrænet, hver gang de tegnes: flytter du eller ændrer koten på et objekt, følger teksterne med. I Egenskaber vælger du, om en tekst læser det projekterede eller det eksisterende terræn; koteangivelser for det eksisterende terræn vises i parentes. Pilene peger nedad ad bakke og viser fx `1:20 (5.0 %)`.

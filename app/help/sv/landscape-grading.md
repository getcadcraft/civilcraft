---
title: Planering för landskap
summary: Plattformar, vallar, svackor och fri planering med punkthöjder och höjdkurvor som du drar, schakt och fyllning live, lutningsanalys, flödespilar och vattensamling, allt i CivilCraft:s planerade yta.
keywords: stödmur, stödmurar, lodrät sida, mur i stället för slänt, slänt per sida, bank, planering, landskapsplanering, plattform, terrass, byggplatta, vall, kulle, svacka, punkthöjd, höjdkurvor, redigera höjdkurvor, schakt och fyllning, jordarbete, lutningsanalys, tillgänglighet, branta slänter, flödespilar, dränering, vattensamling, pölar
from: e1559eb9
---

Allt här planeras in i den **planerade ytan** med samma planering som byggplattor och korridorer. Den **befintliga marken** ändras aldrig, och jordarbetet räknar in allt. Menyn Planera finns i gruppen Landskap.

## Plattformar

{{ui:Planera}} › {{ui:Platå}}, klicka sedan på hörnen och tryck på {{key:Enter}}. Plattformen börjar på markens medelhöjd under den; skriv en **Höjd** för att ange den, eller töm fältet för att följa marken igen. En **Fall** i % och **Fall mot** i grader (0 = öst, 90 = nord) lutar den. Dess sidor planeras ut till marken vid **Schaktslänt** och **Fyllningsslänt** (horisontellt till 1).

## Slänter per sida och stödmurar

Under **Sidor och stödmurar** i egenskaperna för en byggplatta, en platå eller en vall kan varje sida planeras på sitt eget sätt. Sida 1 går från det första hörnet du klickade till det andra, sida 2 från det andra till det tredje, och så vidare.

- **Alla sidor**: **Slänt** använder schakt- och fyllningsslänterna ovan på varje sida; **Lodräta: stödmurar** sätter en mur på varje sida.
- Per sida: **Slänter enligt ovan**, **Egna slänter** (skriv en schakt- och en fyllningsslänt för just den sidan) eller **Lodrät (stödmur)**.
- Skriv en slänt som `3` eller `3:1` (horisontellt till 1 vertikalt), `33%` eller `18.4°`; den visas som H:1. Byggplattans egna **Schaktslänt** och **Fyllningsslänt** tar samma format.
- En lodrät sida har ingen bank: en stödmur går längs kanten, från byggplattan ned till befintlig mark (vid fyllning) eller från marken ned till byggplattan (vid schakt). **Murtjocklek** (0.3 m eller 1 ft till att börja med) är hur långt marken går från byggplattans kant ned till befintlig mark. Schakt- och fyllningsvolymerna utelämnar den bank som sidan inte längre har.
- Där en mur möter en sluttande sida går slänten runt murens ände; två murar möts i en geringsskarv.
- Under fälten: murarnas längd, exponerade yta (höjd × längd), högsta och genomsnittliga höjd.

Planen ritar varje murs yttre sida med korta tvärstreck över den och dess höjd i båda ändarna och vid sin högsta punkt (på lagret för stödmurar, som också går till DXF och DWG). 3D-vyn visar murarna som solider (Visa › Stödmurar), och exporterna GLB, OBJ och USD tar med dem. Sektioner över kanten visar steget.

**Varningar** (i Egenskaper och i Problempanelen): en mur högre än **Varna över en murhöjd på** (1.0 m eller 3.3 ft till att börja med) ”kan behöva en projekterad mur eller ett bygglov; kontrollera lokala regler”, och, när du skriver in den **Brantaste slänt som jorden håller**, varje sida vars schakt- eller fyllningsslänt är brantare än den. De är varningar: planeringen byggs ändå. Varje ändring är ett steg för {{key:Mod+Z}}.

## Vallar

{{ui:Planera}} › {{ui:Vall}}: en kulle vars krön är dess **Höjd** över medelmarken under den, med sidorna planerade ut.

## Svackor

{{ui:Planera}} › {{ui:Svacka}}, klicka sedan längs svackan **i den riktning vattnet rinner** och tryck på {{key:Enter}}. Ställ in dess **Djup**, **Bottenbredd** (0 för ett V) och **Sidslänt**. Utan **Fall** följer dess botten marken, på sitt djup under den, och går aldrig uppför; skriv ett fall för att ge den ett jämnt fall från sin start.

## Punkthöjder och höjdkurvor

1. {{ui:Planera}} › {{ui:Planeringsområde}}: klicka på konturen för området du vill forma.
2. {{ui:Planera}} › {{ui:Höjdkota}}: klicka inne i området. Skriv dess höjd i Egenskaper, eller använd knapparna ▲ ▼.
3. {{ui:Planera}} › {{ui:Redigera en höjdkurva}}: klicka på en höjdkurva inne i området för att ta den som en linje du kan forma om.

Markera en punkthöjd eller höjdkurva och **dra** den (eller dess punkter) på planen: ytan följer när du släpper, ett ångra-steg. Inom området byggs marken om utifrån dess kant (där den möter befintlig mark), punkthöjderna och de redigerade höjdkurvorna.

## Schakt och fyllning, live

Varje planeringsobjekts egenskaper visar dess **Schakt** och **Fyllning** och hela områdets, med rutnätsmetoden som Jordarbete använder, när du ändrar det. Problem (utanför ytan, en kontur som korsar sig själv) listas där.

## Planeringskontroller

I avsnittet **Planeringskontroller** till vänster:

- **Lutningsanalys** färglägger ytan efter lutning: upp till gränsen för flack, däremellan och brantare än gränsen för brant (5 % och 33.3 % till att börja med: det vanliga 1:20 för tillgängliga vägar och 1:3 för gräsklippning). Teckenförklaringen säger hur stor del av området som hamnar i varje. De branta ytorna skrivs också ut på blad.
- **Flödespilar och vattensamling** ritar vilket håll vattnet rinner och ringar in varje ställe där vatten skulle samlas, med dess djup; avsnittet säger hur många ställen det är, det djupaste och hur mycket vatten de rymmer.

Kontrollerna läser den planerade ytan när något är planerat, annars den befintliga marken.

---
title: Plantposter, kultivarer og leverede størrelser
summary: Projektets egen plantesliste som en tabel: kultivarer, leverede størrelser (beholder, rodklump, stammeomkreds, frit stammeparti), tæthed, specifikationsnoter, CSV ind og ud; hver placeret plante angiver en størrelse; plantesymboler efter målestok og dine egne symboler og 3D-modeller.
keywords: planteliste, plantedatabase, kultivar, sort, leveret størrelse, beholder, rodklump, rodbar, stammeomkreds, frit stammeparti, tæthed, planter pr. kvadratmeter, specifikation, specifikationsnoter, plantesymbol, blok, eget symbol, 3D-plante, detaljeniveau, målestok
from: 12251beb
---

Åbn {{ui:Planteliste}} fra menuen {{ui:Mere}} i gruppen Landskab, eller fra afsnittet Planter. Hver række er en plantepost i dette projekts egen liste (en post fra plantelisten kopieres ind, når du tilføjer den). Hver redigering kontrolleres på samme måde som en importeret fil, og er ét fortryd-trin.

## Kolonnerne

- **Botanisk navn**, **Almindeligt navn**, **Type**, **Højde** og **Udbredelse** ved modenhed (meter).
- **Afstand** (centrum til centrum) eller **Tæthed** (planter pr. m²). Et bed af en post med tæthed og uden afstand fyldes med den tæthed, i sit eget mønster (trekantet eller kvadratisk).
- **Leverede størrelser**: én post pr. størrelse, adskilt med `;`. Hver post er et id, en art (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) og derefter et af følgende: et rumfang `10L`, en højde `h0.6`, en udbredelse `s0.4`, en stammeomkreds `g14-16` (cm), et frit stammeparti `st1.8`. Eksempel: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Kultivarer**: navne adskilt med `;`. En kultivar beholder sine egne størrelser og noter, når den importerede fil havde dem.
- **Specifikationsnoter**.

{{ui:Duplikér}} kopierer en række under en ny nøgle. {{ui:Gem som CSV}} og {{ui:Gem som plantefil}} skriver listen ud (CSV-rækker for kultivarer står under deres art, med `cultivar_of`). Import af en CSV- eller plantefil flettes ind i listen.

## Din egen plantesliste i biblioteket

Log ind på din CadCraft-konto (Indstillinger, Dine add-ons, Log ind), så plantetabellen kan bruge den liste, du har i biblioteket:

- {{ui:Fra min biblioteksliste}} henter dine egne biblioteksemner for planter ind (også dem, der stadig venter på gennemsyn). En plante, du allerede har her, opdateres fra biblioteket; de kultivarer, leverede størrelser, tæthed og specifikation, du har tilføjet her, bevares.
- {{ui:Gem som plantelister}} gemmer hver række som dit eget biblioteksemne for planter, ét emne pr. art: en ny plante bliver et nyt emne, en ændret plante en ny version, og en uændret efterlades. Sæt flueben i feltet først: gemning gør planterne offentlige under CC0. En første offentlig upload fra en person, der endnu ikke er betroet, kontrolleres af en person, før den vises, ligesom alle uploads.

Biblioteket gemmer den grundlæggende plantepost. Kultivarer, leverede størrelser, tæthed og specifikationsnoter bliver i projektet og i plantefilen ({{ui:Gem som plantefil}}); dialogen angiver, hvor mange rækker det påvirker, hver gang du gemmer.

## En placeret plante angiver en størrelse

Vælg en plante, en hæk eller en blandingsrække i et bed eller plantet område: når posten har kultivarer eller leverede størrelser, vælger {{ui:Kultivar og størrelse}} en af dem. Planteoversigten tæller så pr. art, kultivar og størrelse, og en etiket kan vise dem: `{botanical} '{cultivar}' {size}` eller `{full}`.

## Plantesymboler efter målestok

{{ui:Plantegrafik}} (Landskab › Mere) angiver, hvordan planter tegnes i plan: **automatisk** (grovere end 1:500 en cirkel med udbredelsen, mellem 1:200 og 1:500 en kontur med centrum, finere det detaljerede symbol; begge målestoksgrænser kan ændres) eller ét niveau for alle målestoksforhold. Dialogboksen Ark har sin egen **Plantedetalje i plan** til det sæt.

På en post i afsnittet Planter læser {{ui:Eget symbol…}} en SVG eller en blok i en DXF/DWG-tegning og tegner den i plantens udbredelse på det detaljerede niveau. {{ui:Egen 3D-model…}} læser en OBJ, STL eller GLB; under Plantegrafik vælges **Hver posts egen model** for at se den i 3D. Filerne har grænser (512 KB SVG, 2000 former, 50 000 trekanter) og gemmes i projektet. SVG-transformationer anvendes ikke (du får besked, når en fil har dem). Se [Plantegrafik, egne symboler og 3D-planter](topic:plant-graphics) for niveauerne, grænserne og hvad en GLB må indeholde.

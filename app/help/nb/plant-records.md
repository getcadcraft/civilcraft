---
title: Plantepost, sorter og oppgitte størrelser
summary: Prosjektets egen planteliste som tabell med sorter, oppgitte størrelser (beholder, rotklump, stammeomkrets, fri stamme), tetthet og spesifikasjonsnotater, CSV inn og ut. Hver plassert plante oppgir en størrelse. Plantesymboler etter målestokk, egne symboler og egne 3D-modeller.
keywords: planteliste, plantedatabase, sort, variant, oppgitt størrelse, beholder, rotklump, bar rot, stammeomkrets, fri stamme, tetthet, planter per kvadratmeter, spesifikasjon, spesifikasjonsnotater, plantesymbol, blokk, eget symbol, 3D-plante, detaljnivå, målestokk
from: 12251beb
---

Åpne {{ui:Planteliste}} fra {{ui:Mer}}-menyen i Landskap-gruppen, eller fra delen Planter. Hver rad er en plantepost i prosjektets egen liste (en post fra planlisten kopieres inn når den legges til). Hver redigering kontrolleres på samme måte som en importert fil, og er ett angre-steg.

## Kolonnene

- **Botanisk navn**, **Vanlig navn**, **Type**, **Høyde** og **Utbredelse** ved modenhet (meter).
- **Avstand** (senter til senter) eller **Tetthet** (planter per m²). Et bed for en post med tetthet og uten avstand fylles med den tettheten, etter sitt eget mønster (trekantet eller kvadratisk).
- **Oppgitte størrelser**: én oppføring per størrelse, skilt med `;`. Hver oppføring er en id, et slag (`container`, `rootball`, `wrapped`, `bareroot`, `plug`, `seed`) og deretter en av disse: et volum `10L`, en høyde `h0.6`, en utbredelse `s0.4`, en stammeomkrets `g14-16` (cm), en fri stamme `st1.8`. Eksempel: `c10 container 10L h0.6; rb rootball h3 g14-16 st1.8`.
- **Sorter**: navn skilt med `;`. En sort beholder sine egne størrelser og notater når den importerte filen hadde dem.
- **Spesifikasjonsnotater**.

{{ui:Dupliser}} kopierer en rad under en ny nøkkel; {{ui:Lagre som CSV}} og {{ui:Lagre som plantefil}} skriver listen ut (CSV-rader for sorter ligger under sin art, med `cultivar_of`). Import av en CSV- eller plantefil slår den inn i listen.

## Din egen planteliste i biblioteket

Logg inn på CadCraft-kontoen (Innstillinger, Dine tillegg, Logg inn), så kan planteliste-tabellen bruke listen som lagres i biblioteket:

- {{ui:Fra min Bibliotek-liste}} henter inn egne planteelementer (også de som fortsatt venter på gjennomgang). En plante som allerede finnes her, oppdateres fra biblioteket; sortene, oppgitte størrelser, tetthet og spesifikasjon som er lagt til her, beholdes.
- {{ui:Lagre som plantelist}} lagrer hver rad som et eget planteelement i biblioteket, ett element per art: en ny plante blir et nytt element, en endret plante blir en ny versjon, og en uendret plante blir liggende urørt. Kryss av i boksen først: lagring gjør plantene offentlige under CC0. Første offentlige opplasting fra en person som ikke er betrodd ennå, kontrolleres av et menneske før den vises, slik alle opplastinger blir.

Biblioteket beholder den grunnleggende plantesposten. Sorter, oppgitte størrelser, tetthet og spesifikasjonsnotater blir værende i prosjektet og i plantefilen ({{ui:Lagre som plantefil}}); dialogboksen sier hvor mange rader som berøres, hver gang det lagres.

## En plassert plante oppgir en størrelse

Velg en plante, en hekk eller en blandingsrad i et bed eller et beplantet område: når posten har sorter eller oppgitte størrelser, velger {{ui:Sort og størrelse}} én. Plantelisten teller da etter art, sort og størrelse, og en etikett kan vise dem: `{botanical} '{cultivar}' {size}` eller `{full}`.

## Plantesymboler etter målestokk

{{ui:Plantegrafikk}} (Landskap › Mer) angir hvordan planter tegnes i plan: **automatisk** (grovere enn 1:500 en sirkel med utbredelsen, mellom 1:200 og 1:500 en kontur med senter, finere det detaljerte symbolet; begge målestokkene kan endres) eller ett nivå for alle målestokker. Dialogboksen Ark har sin egen **Plantedetalj i plan** for dette settet.

På en post i delen Planter leser {{ui:Eget symbol…}} en SVG, eller en blokk fra en DXF/DWG-tegning, og tegner den med plantens utbredelse på detaljert nivå. {{ui:Egen 3D-modell…}} leser en OBJ, STL eller GLB; i Plantegrafikk velges **Egen modell for hver post** for å se den i 3D. Filene har grenser (512 KB SVG, 2000 former, 50 000 trekanter) og lagres i prosjektet. SVG-transformasjoner brukes ikke (det gis beskjed når en fil har dem). Se [Plantegrafikk, egne symboler og 3D-planter](topic:plant-graphics) for nivåene, grensene og hva en GLB kan inneholde.

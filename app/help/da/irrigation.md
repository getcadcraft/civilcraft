---
title: Vandingsdesign
summary: Et beregningshjælpemiddel, ikke en certificeret projektering: sprinklerhoveder, sidegrene, hovedledning, ventiler og dryplinjer på grunden; zoner fundet ud fra rørene; trykfald efter Hazen–Williams, det ugunstigste hoved, flow og tryk over for forsyningen, nedbørshastigheder, køretider, dækning og en stykliste.
keywords: vanding, sprinkler, sprinklere, sprøjte, roterende, rotordyse, boblerdyse, drip, dryplinje, dryper, ventil, zone, station, styreenhed, hovedledning, sidegren, tilslutningspunkt, vandforsyning, tryk, psi, kpa, flow, gpm, friktionstab, hazen williams, nedbørshastighed, køretid, dækning, hoved mod hoved, stykliste
from: 7d6342c1
---

:::warning
Dette er et beregningshjælpemiddel, ikke en certificeret projektering: en vandingsprojekterende kontrollerer hvert resultat, før noget bygges.
:::

## Opstil systemet

1. I sektionen **Vanding** til venstre vælger du **Hoved**, dets **Bue** og hvor buen starter, samt rørdimensionerne for sidegrene og hovedledningen.
2. {{ui:Vanding}} › {{ui:Tilslutningspunkt}}: klik dér, hvor vandforsyningen tilsluttes. Angiv dets **tryk**, det tilgængelige **flow** og måler- og tilbageløbsspærretabet i Egenskaber.
3. {{ui:Vanding}} › {{ui:Ventil}}: klik dér, hvor hver zones ventil skal være. En ventil starter en zone.
4. {{ui:Vanding}} › {{ui:Hoved}}: klik for at placere hoveder; hvert klik placerer ét.
5. {{ui:Vanding}} › {{ui:Sidegren}}: klik fra en ventil gennem dens hoveder og tryk {{key:Enter}}. {{ui:Hovedledning}}: fra tilslutningspunktet til hver ventil.

Rørender fastgør sig til hoveder, ventiler, forsyningen og andre rørender, så netværket hænger sammen. En zone er alt, der nås fra dens ventil langs sidegrene; hovedledningen fører én zone ad gangen.

## Dryp

{{ui:Vanding}} › {{ui:Dryplinje}}: klik langs linjen, startende dér, hvor den får vand (en sidegrens ende eller en ventil). Angiv **dryperflow** og **afstand** i Egenskaber; dens flow er dryperne langs den.

## Kontrollen

{{ui:Vanding}} › {{ui:Kontrollér anlægget…}} viser hver zone:

| Kolonne | Sådan beregnes den |
|---|---|
| Flow | Hovedernes flow (og dryplinjernes) lagt sammen |
| Ved ventilen | Det ugunstigste hoveds arbejdstryk plus rørtabene til det (Hazen–Williams, rørets indvendige diameter, højdeforskellen) og tabet gennem ventilen |
| Ved forsyningen | Det samme plus hovedledningens tab, der fører den zone, og måler- og tilbageløbsspærretabet |
| Nedbør | Hovedernes flow over det areal, de vander ved hoved-til-hoved-afstand |
| Minutter om ugen | Til at udføre indstillingen **Vand om ugen** |
| Problemer | Hastighed over grænsen, et hoved uden for sit trykområde, sprøjter og rotorer på én ventil, for lidt tryk eller flow ved forsyningen, hoveder uden zone, sløjfer |

Vælg en ventil for at se dens zones tal og dens ugunstigste hoved markeret med en ring på planen. Stykkelisten tæller hoveder efter type og bue, rør efter dimension, ventiler, dryplinje og dryper samt styreenhedens stationer. **Gem som CSV** gemmer begge.

Indstillinger i sektionen Vanding: **Hazen–Williams C** (150 for nyt plastrør), den **hurtigste strømning** i et rør (1.5 m/s), **tabet gennem en ventil** og **vand om ugen**. De er mærkede standardværdier.

## Dækning

{{ui:Vanding}} › {{ui:Vis dækning}} viser, hvor meget af arealet hovederne efterlader tørt, hvor meget to eller flere hoveder vander, og hvilke hoveder der ikke når en nabo (afstand hoved-til-hoved).

## Hoveder

De viste hoveder er **generiske** typer, som CadCraft har skrevet ud fra projekterede nedbørshastigheder (faste sprøjter, roterende dyser, tandhjulsrotorer, boblere, mikrosprøjter, dryper), ikke nogen producents produkter. **Tilføj hoveder fra en fil…** læser dine egne hoveder (en JSON-liste med hvert hoveds kastelængde, flow eller nedbørshastighed og trykområde); de gemmes med projektet. En producents offentliggjorte data indgår kun med den producents registrerede tilladelse.

Under de generiske hoveder har listen **typiske hoveder** (deres navne ender på "typiske værdier"): dysestørrelser for faste sprøjter, roterende dyser og tandhjulsrotorer, mikrosprøjter, boblere og dryper, med en radius, et flow og et trykområde. CadCraft har udregnet dem ud fra offentliggjort matematik (orifice-ligningen for flow, skalering af stråleradius) og nominelle flowklasser, kun fra åbne kilder; ingen producents tabel er kopieret. Vælg et, og vælgeren viser dets grundlag og licens. Et projekt, der bruger et, gemmer hovedet og dets kilde i projektfilen. De er til planlægning: kontrollér det rigtige hoveds egne data, før du bygger.

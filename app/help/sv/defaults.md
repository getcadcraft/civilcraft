---
title: Startvärden och platshållare
summary: Varje värde CivilCraft börjar med, för nya projekt, visning, linjeföringar, byggplattor, korridorer, ledningsnät, volymer och plottar, och vilka som är platshållare att ersätta.
keywords: standardvärden, inställningar, startvärden, platshållare, projekteringskriterier, standarder, regler, antaganden
from: fbfc7432
---

CivilCraft har ingen inställningsdialog eller mall. Det här är de värden som saker startar med. Värden markerade som **platshållare** är inte hämtade från någon standard: ersätt dem med ditt projekts kriterier innan du litar på en kontroll eller en kvantitet.

## Nytt projekt

| Inställning | Värde |
|---|---|
| Namn | Namnlös plats (namnet på den första punktfilen ersätter det) |
| Enheter | US-fot |
| Terrängmodellens namn | Befintlig mark |
| Punktgrupper | Varje grupp börjar som {{ui:Punkter}} |
| Längsta yttre kant | 0 (behåll varje triangel) |
| Ångra-steg som sparas | 200 |

## Visning

| Inställning | Värde |
|---|---|
| Terrängmodell | {{ui:Befintlig mark}} |
| Höjdkurvor varje | 1 (ft eller m) |
| Huvudkurvor varje | var 5:e höjdkurva |
| Band | 8 |
| På | Höjdkurvor, höjdkurvetiketter, punkter, brytlinjer, terrängmodellens kant, ledningar |
| Av | Trianglar, höjdband, lutningspilar, punktetiketter |

## Linjeföringar och längdprofiler

| Inställning | Värde |
|---|---|
| Namn | Linjeföring 1, Linjeföring 2 … |
| Startstation | 0+00 |
| Kurvradie vid varje inre PI | 100 ft eller 30 m, mindre om den inte ryms i hälften av varje tangent |
| Projekterad längdprofil | Ingen förrän du startar en; {{ui:Starta från marken}} lägger en PVI på marken vid varje ände |
| Längd på vertikalkurva | 0 (ingen kurva) tills du skriver en |

## Byggplattor

| Inställning | Värde |
|---|---|
| Namn | Byggplatta 1, Byggplatta 2 … |
| Höjd | Marken vid byggplattans mitt, avrundad till 0.1 (0 om mitten ligger utanför terrängmodellen) |
| Skärningsslänt | 2 : 1 (platshållare) |
| Fyllningsslänt | 3 : 1 (platshållare) |

## Korridorens tvärsnitt (platshållare)

| Inställning | US-fot | Meter |
|---|---|---|
| Körfältsbredd | 12 ft | 3.6 m |
| Körfältslutning | 2 % | 2 % |
| Vägrensbredd | 4 ft | 1.2 m |
| Vägrenslutning | 4 % | 4 % |
| Skärningsslänt | 2 : 1 | 2 : 1 |
| Fyllningsslänt | 3 : 1 | 3 : 1 |
| Tvärsektion var | 10 ft | 5 m |

## Ledningsnät

| Inställning | US-fot | Meter |
|---|---|---|
| Namn och typ | Dagvatten, dagvatten | Dagvatten, dagvatten |
| Minsta lutning (platshållare) | 0.50 % | 0.50 % |
| Minsta täckning (platshållare) | 2 ft | 0.6 m |
| Fall i brunnar (platshållare) | 0.10 ft | 0.03 m |
| Diameter på ny brunn | 48 in | 1200 mm |
| Diameter på nytt rör | 12 in | 300 mm |
| Sumpdjup | 0 | 0 |
| Brunnslock | Från terrängmodellen | Från terrängmodellen |

Ett ledningsnät som öppnas från LandXML använder också dessa regler, eftersom LandXML inte bär dem.

## Volymer

| Inställning | Värde |
|---|---|
| Metod | Rutnät, samplat i cellcentrum inom släntkrönslinjerna |
| Cellstorlek | Vald så att det grävda områdets omslutande rektangel rymmer ungefär 250 000 celler (1, 2 eller 5 gånger en tiopotens) |
| Svällning och krympning | Ingen |

## Plotta

| Inställning | Värde |
|---|---|
| Område | {{ui:Allt}} |
| Papper | Tabloid 11 × 17 in (projekt i fot), ISO A3 (projekt i meter); alltid liggande |
| Skala | Den största listade skala som ryms |
| Färg | {{ui:Lagerfärger}} |

DXF-etiketter är anpassade till den skala där allt ryms på Tabloid (fot) eller A3 (meter).

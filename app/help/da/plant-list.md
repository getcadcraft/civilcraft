---
title: Plantelisten
summary: Omkring 420 almindelige tempererede og middelhavsplanter med deres størrelser, hårdførhed, lys og vand, søgbare på ethvert sprog, samt din egen liste, gemt sammen med projektet.
keywords: plantelist, plantedatabase, arter, botanisk navn, almindeligt navn, planteudvalg, planteskoleliste, hårdførhedszone, csv, importér planter, eksportér planter, mine planter, træliste, buskliste, plantas, plantebibliotek
from: 7ed09e7e
---

**Planter**-afsnittet i det venstre panel lister alle de planter, du kan placere. Klik på en for at se dens størrelser og for at gøre den til den plante, som **Plante**, **Bed** og **Hæk** bruger.

## Søg og filtrér

Skriv i **Søg**: ethvert ord i en plantes navn på ethvert sprog (engelsk, spansk, portugisisk), dens botaniske navn, dens type eller et ord i dens noter. Alle ord, du skriver, skal matche, så `quercus evergreen` finder de stedsegrønne eg. Accenter har ingen betydning.

Indsnævr listen med **Type**, **Lys**, **Vand** og **Hårdførhedszone** (den USDA-zone, dit sted ligger i: en plante vises, når zonen ligger inden for dens interval).

## Hvad en plante indeholder

| Felt | Betydning |
|---|---|
| Type | Træ, busk, hæk, græs (inkl. græsplæner), staude, jorddække eller klatreplante |
| Ved modenhed | Højde og udbredelse for planten, når den er vokset i en have eller på en gade, i meter |
| Ved plantning | Den størrelse, den plantes i, og dens beholder |
| Afstand | Centrum til centrum i et bed eller langs en hæk |
| Hårdførhedszone | De USDA-zoner, den normalt er hårdfør i |
| Lys, vand, jord | Hvad den har brug for |
| Noter | Anvendelse og forsigtighed, fx giftige dele eller en plante, der breder sig |

:::note
Den indbyggede liste er skrevet til CadCraft ud fra almindelig havebrugsviden: typiske størrelser, afrundet. Den er ikke nogen planteskoles katalog. Kontrollér størrelser og hårdførhed hos en lokal planteskole. De bedst kendte invasive planter i Iberien og store dele af den tempererede verden er bevidst udeladt, og nogle få, der er invasive et sted, har en note.
:::

## Dine egne planter

- **Føj til projektets liste** kopierer en plante ind i projektets egen liste, hvor den gemmes sammen med projektet. En plante på din liste erstatter den indbyggede med samme nøgle, så du kan ændre dens størrelser for din region.
- **Importér en plantesliste…** læser en CSV (eller en plantefil). CSV'en skal have en kolonne med det botaniske navn og helst type, højde og udbredelse; kolonnenavne i dine egne ord virker (Latin, Common name, Height, Spread, Width, Zone). Komma-, semikolon- eller tabulatorseparerede filer og decimalkommaer læses. Tomme plantestørrelser, afstande og beholdere får fornuftige standardværdier for typen.
- **Eksportér som CSV** gemmer din liste (eller, hvis den er tom, de planter, søgningen viser), så du kan åbne den i et regneark.

En plantesliste læses som enhver fil udefra: det, den ikke kan bruge, udelades og tælles op.

## Planter i andre apps

Plantelisten er ét bibliotek for alle CadCraft-apps: BimCraft og ModelCraft har den samme liste, men deres egen **Placér fra bibliotek** tilbyder endnu ikke planter. I dag når planter en BIM-model gennem CivilCraft's landskabs-IFC (hver plante som en `IfcGeographicElement`). Se [Beplantning](topic:planting#ifc).

---
title: Gennemhæng og spænding
summary: Dine lasttilfælde (temperatur, vind, is) og spændingsgrænser, hvordan CivilCraft beregner hvert afsnits spænding, og optrækningstabellerne.
keywords: gennemhæng, spænding, lasttilfælde, temperatur, vind, is, asymmetrisk is, dimensionsgivende spændvidde, ækvivalent spændvidde, tilstandsskift, tilstandsligning, kædelinje, optrækningstabel, brudstyrke, daglig belastning
from: f8876c35
---

## Lasttilfælde og grænser

{{ui:Mere}} › {{ui:Lasttilfælde og grænser…}} redigerer de regler, hverledning i projektet følger.

- **Lasttilfælde**: en temperatur, et vindtryk på lederen (Pa) og radial is (mm, med dens densitet). Det første tilfælde er referencen.
- **Spændingsgrænser**: en andel af lederens brudstyrke, på den vandrette spænding eller den største spænding ved en mast, i ét lasttilfælde. Eller angiv selv den vandrette spænding.
- **Frihøjder**: den frihøjde, lederen holder over terrænet, en vej, en bygning og så videre. Tilføj, omdøb og fjern dem: de er dine. Under dem vælger du reglerne for **Beplantning under en ledning**, **Havemure under en ledning** og **Underjordiske krydsninger**.
- **Tilfælde kontrollerne bruger**: hvilket tilfælde der giver den største gennemhæng (varm), isolatorens udsving (vind), is og is på den ene side af en mast.
- **Faktorer**: faseafstandsfaktor k, største isolatorudsving, en faktor på belastninger af mast og beslag, drejevinklerne der gør vinkel- og endemaster, den mindste dækning over nedgravede kabler og det største spændingsfald.

## Pakker: regler og et bibliotek for et land

Ingen lands regler er indbygget i CivilCraft. En **pakke** samler et regelsæt og et bibliotek i én fil (`.cclinepack.json`), for et land, en netoperatør eller en virksomhed:

- **Gem som pakke…** i {{ui:Lasttilfælde og grænser…}} skriver det viste regelsæt og dit bibliotek (eller, når dit bibliotek endnu er tomt, de elementer, projektet bruger). Skriv først **Land eller region**.
- **Åbn regelsæt eller pakke…** læser en pakke, en regelfil eller en biblioteksfil. En pakkes regler vises i dialogboksen (klik **Anvend** for at bruge dem), og dens elementer lægges i dit bibliotek.
- Pakker, andre deler, står på add-on-siden under **Kraftledningspakker**. To eksempelpakker viser formatet; de er ikke noget lands regler.

Hver pakke kontrolleres, når den åbnes, ligesom enhver fil. Kontrollér hver værdi mod den gældende standard, før noget bygges.

To eksempelregelsæt ligger klar at starte fra: **Eksempel: koldt klima** og **Eksempel: mildt klima**. Deres tal stammer fra ingen standard: sæt de værdier, din standard giver. {{ui:Gem regler}} og {{ui:Åbn regler…}} deler et regelsæt som en fil.

## Sådan beregnes spændingen

For hvert afsnit mellem endemaster:

1. Den **dimensionsgivende spændvidde** er √(ΣL³ ÷ ΣL) af dets spændvidder.
2. Hver grænse omregnes til en vandret spænding i referencetilfældet gennem **tilstandsligningen** på den dimensionsgivende spændvidde: H₂²·(H₂ − H₁ + EA·w₁²L²/(24H₁²) + EA·α·(t₂ − t₁)) = EA·w₂²L²/24. Den mest begrænsende sætter spændingen.
3. Hvert lasttilfælde's spænding følger af den, og hver spændvidde's form er den nøjagtige **kædelinje** gennem dens to fastgørelsespunkter (også spændvidder på en skråning): gennemhænget fra korden, længden og spændingen i hver ende.

Lasten pr. meter i et tilfælde: vægt plus is (isareal × densitet × g) lodret; vindtryk × den isbelagte diameter vandret.

## Optrækningstabeller

{{ui:Mere}} › {{ui:Optrækningstabeller…}} lister for hvert afsnit den vandrette spænding og hver spændvidde's gennemhæng ved hver temperatur i regelsættet (−5 °C til 40 °C med 5 °C-trin til at starte med), i stille luft. Gem dem, og masteoversigten, som CSV.

Ikke med i beregningen: krybning af lederen over årene og lederens udstrækning, når den er ny. Læg dem ind gennem de temperaturer, du optrækker ved.

---
title: "Kommer fra anden anlægssoftware"
summary: "Hvordan kendte anlægsprojekteringsarbejdsgange svarer til CivilCraft, og forskellene der fanger erfarne brugere i den første time."
keywords: skift, migrér, kendt, forskelle, arbejdsgang, kommandoer, mapping, cogo, korridor, planering, rørnetværk, stilarter, kommandolinje
from: feae37d6
---

Hvis du har brugt Civil 3D, kender du allerede ideerne i CivilCraft: punkter og punktgrupper, TIN-overflader med brudlinjer og afgrænsninger, tracéer efter PI, længdeprofiler efter PVI, samlinger feiet ind i korridorer, planering til dagslys, tyngdekraftsrørnet og LandXML. Det der er anderledes, er næsten alt omkring dem: der er ingen tegnefil, ingen kommandolinje (medmindre du vælger menustilen {{ui:Klassisk tegning}}), ingen stilarter, ingen Prospector og ingen indstillingsdialoger. CivilCraft er et lille, fokuseret værktøj i en browser, og i denne build gør det en brøkdel af hvad en fuld anlægspakke gør. Denne side kobler det du kender til det, der findes her.

:::tip
Hvis du kan lide Civil 3D's bånd, vælg menustilen {{ui:Anlægsbånd}} i {{ui:Indstillinger}} › {{ui:CivilCraft}} › {{ui:Menuer, taster og mus}}: fanerne Hjem, Overflader, Rediger, Geolokation, Vis og Output, midterknappen panorerer, og {{key:Shift}} med midterknappen kredser om 3D-visningen. Hvis du skriver kommandoer, tilføjer {{ui:Klassisk tegning}} en kommandolinje (ALIGNMENT, PAD, PROFILE, ZOOM …). Se [Menuer, taster og mus](topic:menus-keys-and-mouse).
:::

## Arbejdsgangskort

| Hvad du vil gøre | Kendt måde | I CivilCraft |
|---|---|---|
| Hent opmålingspunkter ind | Importér punkter med et punktfilformat | {{ui:Åbn}}, og kontrollér derefter kolonnerækkefølgen i **Importér punkter** ([Importér opmålingspunkter](topic:import-points)) |
| Sortér punkter | Punktgrupper, beskrivelsesnøgler | Automatiske grupper efter beskrivelsens første ord; ingen beskrivelsesnøgler |
| Redigér et punkt | Punkteditor, greb | Klik på det og skriv i Egenskaber, eller træk det ([Redigér et opmålingspunkt](topic:edit-points)) |
| Byg eksisterende terræn | Opret en overflade, tilføj punktgrupper som data | Automatisk: overfladen genopbygges når dens inddata ændrer sig |
| Tilføj brudlinjer | Tilføj brudlinjer fra polylinjer eller feature-linjer | Sæt en punktgruppe til {{ui:Brudlinje}}, eller klik på punkter med værktøjet {{ui:Brudlinje}} ({{key:B}}) |
| Beskær overfladen | Ydre afgrænsning, skjult afgrænsning, maksimal trekantlængde | {{ui:Afgrænsning}} ({{key:O}}, kun ydre) og **Længste ydre kant** |
| Vis højdekurver | Overfladestil | **Visning** i venstre panel: interval, større hver, etiketter, bånd, hældningspile |
| Læg en centerlinje ud | Tracéoprettelsesværktøjer, kurve- og spiralindstillinger | {{ui:Tracé}} ({{key:A}}): klik PI'er, {{key:Enter}}; radier og overgangskurvelængder i PI-tabellen |
| Opret en længdeprofilvisning | Længdeprofil-guide, bånd | {{ui:Længdeprofil}} ({{key:R}}): én længdeprofilvisning under planen, altid tilpasset |
| Planlæg hældningen | Længdeprofil-layoutværktøjer | {{ui:Start fra terrænet}}, {{ui:Tilføj PVI'er}} ({{key:I}}), træk PVI'er, skriv **Kurve L** |
| Byg en vej | Samling, delsamlinger, korridor, mål, regioner | Sæt fluebenet **Før en samling langs den planlagte længdeprofil** under tracéet; en vognbane, skulder og sideskråning på hver side, eller hver side bygget af dele (rendesten, kant, fortov …) |
| Planér et byggeplateau | Feature-linjer, planeringsgrupper, planeringskriterier | {{ui:Byggeplateau}} ({{key:G}}): et fladt byggeplateau med udgravnings- og opfyldsskråninger til dagslys |
| Beregn jordarbejde | Volumenoverflader, volumen-dashboard | **Jordarbejde** i højre panel, gittermetode, opdateres løbende |
| Læg storm- eller spildevand ud | Rørnetværk med en delliste, regler | {{ui:Rør}} ({{key:P}}): klik på konstruktioner nedstrøms; tre regler du sætter; automatiske bundkoter |
| Udveksl med andre | LandXML-import og -eksport | {{ui:Åbn}} en LandXML-fil; {{ui:LandXML}} for at eksportere ([Udveksl LandXML](topic:landxml)) |
| Send linjearbejde til CAD | Eksport til DWG | {{ui:DWG}} (2000 til 2018-format) eller {{ui:DXF}} (R12) |
| Plot | Layouts, viewports, arksæt | {{ui:PDF}}: ét liggende ark af planen i en valgt skala; plan- og længdeprofilark og tværprofilark som PDF |
| Del arbejde mellem filer | Dataforkortelser, referencer | Ikke tilgængeligt: ét projekt pr. fil |
| Fortryd | Fortryd | {{key:Mod+Z}} og {{key:Mod+Y}}, 200 trin; visningsindstillinger er ikke fortrydelsestrin |

## Forskelle der fanger folk

**Der er ingen kommandolinje**, medmindre du vælger menustilen {{ui:Klassisk tegning}}. Værktøjer er værktøjslinjeknapper og enkeltbogstaver: {{key:A}} tracé, {{key:G}} byggeplateau, {{key:P}} rør, {{key:B}} brudlinje, {{key:O}} afgrænsning, {{key:R}} længdeprofil, {{key:I}} tilføj PVI'er, {{key:V}} vælg, {{key:F}} tilpas. I de andre menustile gør det ingenting at skrive et kommandonavn. Se [Taster og mus](topic:keyboard).

**Enter afslutter; dobbeltklik er risikabelt.** Klik på det sidste punkt én gang, og tryk derefter på {{key:Enter}}. I denne build afslutter et dobbeltklik også, men det fjerner det punkt du dobbeltklikkede på. Højreklik afslutter eller gentager ikke; det panorerer kun når du trækker med det.

**Alt er dynamisk, hele tiden.** Ændrer du en punktgruppe, en radius, en PVI eller en byggeplateauskråning, opdateres overfladen, højdekurverne, korridoren, dagslyslinjerne og mængderne med det samme. Der er intet at genopbygge, og intet bliver forældet.

**Intet er et tegningsobjekt.** Planen er en visning af projektet, ikke en tegning du kan redigere med CAD-kommandoer. Du kan ikke tilføje dine egne linjer eller tekst, ændre et lags farve eller eksplodere noget. Eksportér til DXF og færdiggør tegningen i et CAD-program.

**Ingen stilarter.** Farver, linjetykkelser, etiketstørrelser og lagnavne er faste (se [Plan-lag](topic:plan-layers)). Papir og Model i programlinjen skifter mellem en lys og en mørk skærm.

**Én af hver.** Én eksisterende terrænoverflade, ét planlagt resultat, ét rørnetværk pr. projekt. Mange tracéer og byggeplateauer er fint.

**Enheder er etiketter.** At vælge {{ui:Amerikanske fod}} eller {{ui:Meter}} omregner ikke noget. Der er ingen tegningsskala. Et koordinatsystem er valgfrit: sæt et under {{ui:Koordinater}}, og intet flytter sig; det siger kun, hvad tallene betyder (se [Sæt projektets koordinatsystem](topic:coordinate-systems)). Fod behandles som amerikanske landmålingsfod når der skrives til LandXML.

**Brudlinjegrupper forbindes i punktnummerrækkefølge.** En gruppe sat til {{ui:Brudlinje}} bliver til én linje gennem alle sine punkter, i nummerrækkefølge. Delte koder (to flowlinjer begge kodet »FL«) giver én zig-zag-linje; tegn dem i hånden.

**Stationer ligner hinanden, meter er forskellige.** Fod bruger 100 ft-stationer (12+34.56); meter bruger 1000 m-stationer (1+234.567).

**Slet på en Mac.** Tasten mærket delete er i browseren Backspace. Brug Fn og delete, eller knappen {{ui:Slet}}, for at slette et valg.

**Filer er downloads.** {{ui:Gem}} downloader en `.civilcraft.json`-fil hver gang; der er ingen »gem over den åbne fil«. En gendannelseskopi af ikke-gemt arbejde gemmes i denne browser ([Gendan ikke-gemt arbejde](common:recover)). Åbning af en punktfil erstatter punkterne uden at spørge. Se [Filer du kan åbne, gemme og eksportere](topic:files).

**Regler er dine.** Rørnetværksregler og korridorsamlingen starter med pladsholderværdier, der ikke er en standard. Sæt dine egne før du stoler på en kontrol.

**Mængder er gitterbaserede.** Udgravning og opfyld kommer fra et fint gitter mellem de to overflader, inden for dagslyslinjerne, uden svul eller svind. De er tæt på, men ikke det samme som en TIN-til-TIN-mængde.

## Hvad der mangler

Spiraler andre end klothoide, samlinger der ændrer sig langs vejen, skrånende byggeplateauer, indløbskapacitet og tilbageholdelse, delekataloger, rør i længdeprofil, matrikeludlægninger og grundstørrelser, mindste-kvadraters udjævning og opmålingsdatabaser, åbning af DWG og mere. Den fulde liste, med hvad du gør i stedet i dag, står i [Ikke bygget endnu](topic:not-built-yet).

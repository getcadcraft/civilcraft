---
title: Vandspejlsprofiler i åer
summary: Modellér en å ud fra terrænoverfladen og beregn stationære vandspejlsprofiler med standard-skridtmetoden: vandstande, energi, hastigheder, Froude-tal og oversvømmelsesudbredelsen på planen. En eksperimentel funktion; hvert resultat kræver en ingeniørs gennemgang.
keywords: dige, uvirksomt strømningsareal, tværprofileditor, å, hydraulik, vandspejlsprofil, tilbageløb, standard-skridtmetoden, stationær strømning, 1D, tværprofiler, Manning, ruhed, transportevne, kritisk dybde, normal dybde, Froude, energilinje, oversvømmelsesudbredelse, oversvømmelsesslette, oversvømmelse, brinkpunkter, strækningslængder, sammentrækning, udvidelse, subkritisk, superkritisk, blandet regime, vandspring
from: fb8bf425
---

CivilCraft beregner stationære, endimensionelle vandspejlsprofiler langs en å: for hvert flow, du angiver, vandstanden ved hvert tværprofil, ud fra energibalancen mellem nabotværprofiler (standard-skridtmetoden). Funktionen er en eksperimentel funktion, mens den kontrolleres.

**Kun et beregningshjælpemiddel.** Vandstandene kræver en kvalificeret ingeniørs gennemgang, før nogen stoler på dem: en 1D-model er kun så god som sine tværprofiler, ruhedsværdier, strækningslængder og randbetingelser, og den kender ikke broer, rørunderføringer eller vand, der forlader åen.

## Tegn åen

1. Opbyg først den eksisterende terrænoverflade (punkter, brudlinjer eller en TIN, du har åbnet).
2. Under **Overflade** › {{ui:Mere}} vælger du {{ui:Å}}.
3. Klik langs åens midterlinje **fra opstrøms til nedstrøms**, og tryk derefter {{key:Enter}} eller dobbeltklik.

CivilCraft skærer et tværprofil vinkelret på midterlinjen hver 50 m (200 ft), 100 m (300 ft) til hver side, ud fra terrænet. Åens stationering måles fra den nedstrøms ende, så den vokser opstrøms. Brinkerne starter som et gæt 10 m (30 ft) til hver side af hvert tværprofils laveste punkt.

For at tilføje et tværprofil der hvor åen smalner, eller hvor en konstruktion står, vælger du åen, klikker på {{ui:Tilføj et tværprofil}} og tegner en snitlinje tværs over den (uanset retning: den vendes, så den løber fra venstre mod højre set nedstrøms).

## Sæt åen op

Vælg åen for at se den i **Egenskaber**:

- **Strømningsregime**: subkritisk (det sædvanlige: beregnes opstrøms fra den nedstrøms randbetingelse), superkritisk (beregnes nedstrøms fra den opstrøms randbetingelse) eller blandet (begge, derefter det med den største specifikke kraft i hvert tværprofil; en forhåndsvisning).
- **Strømningsprofiler**: et navn og et flow for hver (f.eks. et 10-års- og et 100-års-flow), og randbetingelsen i den nedstrøms ende (og den opstrøms ende, når regimet ikke er subkritisk): **Normal dybde** med en energihældning (bundhældningen er et første gæt), en **Kendt vandspejlskote**, eller **Kritisk dybde**.
- **Tværprofiler fra terrænet**: afstanden, hvor langt til venstre og højre, brinkgættet og de to Manning n-værdier; {{ui:Skær tværprofiler igen}} erstatter tværprofilerne (ét trin i fortryd).
- **Tabellen over tværprofiler**: for hvert tværprofil de venstre og højre brinkforskydninger, n for hovedløbet og n for forlandet, strækningslængderne til næste tværprofil nedstrøms (venstre forland, hovedløb, højre forland; målt i planen fra start) og sammentræknings- og udvidelseskoefficienterne (0.1 og 0.3 til at starte med: jævne overgange). {{ui:Rediger}} åbner tværprofileditoren (næste afsnit); en prik efter den betyder, at tværprofilet har et dige eller et uvirksomt område.

Hver ændring er ét trin i fortryd ({{key:Mod+Z}}).

## Rediger et tværprofil: brinker, diger og uvirksomme områder

{{ui:Rediger}} på et tværprofil tegner dets terræn og lader dig trække det, løseren læser: den **venstre og højre brink** (de deler tværprofilet i venstre forland, hovedløb og højre forland), et **dige** på hver side og **uvirksomme strømningsområder**. Hvert håndtag kan også flyttes med piletasterne, og hvert tal kan skrives ind ved siden af plottet. {{ui:Anvend}} er ét trin i fortryd.

- Et **dige** har en placering (forskydning) og en kronekote. Terrænet bag det, væk fra åen, er afskåret fra åen, mens vandspejlet er under kronen: dets areal, våde omkreds og transportevne tages ikke med. Over kronen tæller hele tværprofilet igen. Et dige står uden for den brink, det beskytter; et dige inden for brinkerne markeres.
- Et **uvirksomt strømningsområde** holder vand, men fører ikke flow (en lomme bag en dæmning, stillestående vand ved en brotilkørsel). Angiv dets to forskydninger og, hvis du vil, en vandstand, under hvilken området er uvirksomt ({{ui:altid}} når feltet er tomt): over den vandstand strømmer det som resten. Et område der dækker en del af hovedløbet markeres.
- Mellem to tværprofiler lader oversvømmelsesudbredelsen tørt det terræn bag et dige, som begge tværprofiler har, mens vandspejlet der er under kronen (linjen mellem de to kroner er ret).

## Beregn og læs resultaterne

Klik på {{ui:Vandspejlsprofiler}}. For den profil, du vælger, får du:

- et **plot** langs åen (flow fra venstre mod højre): bundkote i løbet, brinker, vandspejl, energilinje og kritisk vandspejl; tværprofiler holdt på kritisk dybde er markeret med en cirkel;
- en **tabel** pr. tværprofil: åstationering, flow, bundkote i løbet, vandspejl, kritisk vandspejl, energilinje, dybde, hastighed i løbet og samlet, Froude-tallet for løbet, strømningsareal, topbredde, flowet i hvert forland og i løbet, energihældningen og advarsler;
- **advarsler** med almindelige ord, for eksempel et tværprofil sat til kritisk dybde, vand over et tværprofils ender eller en stor ændring i transportevne mellem to tværprofiler (tilføj tværprofiler imellem).

{{ui:Tabel (CSV)}}, {{ui:Rapport}} (ren tekst med metoden, randbetingelserne og alle tabeller) og {{ui:Plot (SVG)}} gemmes i dine downloads. Hver af dem bærer gennemgangslinjen.

Sæt flueben ved {{ui:Vis oversvømmelsesudbredelsen}} under **Egenskaber** for at skravere det våde område i planen for den valgte profil, med vandlinjen tegnet hvor dybden er nul. Mellem tværprofiler er vandspejlet vandret på tværs af åen og ændrer sig lineært med åstationeringen. Terræn bag et dige er tørt, mens vandet står under dets krone. Andet lavt terræn inden for åens korridor, som vandet ikke kan nå (f.eks. bag en vejdæmning), skraveres stadig: kontrollér det.

## I tegningen og i Problemer

Åens linjer går til planen, PDF og DWG på deres egne lag: **C-WATR-CNTR** (midterlinjen), **C-WATR-SCTN** (hver snitlinje, med dens åstationering) og **C-WATR-FLOD** (oversvømmelsesudbredelsens vandlinje, når {{ui:Vis oversvømmelsesudbredelsen}} er sat for en profil). Åens advarsler (et tværprofil sat til kritisk dybde, vand over tværprofilenderne, en ændring i transportevne der kræver flere tværprofiler, en energibalance der ikke gik op, et dige inden for brinkerne) går også til panelet **Problemer**, om åen og placeret ved det tværprofil, de kommer fra.

## Sådan beregnes det

- Energi mellem to tværprofiler: WS₂ + α₂V₂²/2g = WS₁ + α₁V₁²/2g + L·Sf + C·|α₂V₂²/2g − α₁V₁²/2g|.
- Transportevne ved underinddeling: hvert forland deles, hvor dets n ændrer sig, K = Σ (1/n)·A·R^(2/3) (1.486/n i US-enheder); hovedløbet er ét stykke, med en sammensat n når dets n ændrer sig. α kommer af, hvordan transportevnen deles.
- Friktionshældning med gennemsnitlig transportevne, Sf = ((Q₁ + Q₂)/(K₁ + K₂))², over den flow-vægtede strækningslængde.
- Sammentrækningskoefficient når flowet accelererer nedstrøms, udvidelseskoefficient når det bremser.
- Kritisk dybde = mindste specifikke energi. Hver vandstand løses i et interval, så den aldrig springer til den forkerte side af det kritiske; findes intet svar, sættes den til kritisk dybde og markeres.

Programmet er kontrolleret mod Mannings normale dybde, kritisk dybde i en rektangulær rende og Chows opstuvningseksempel (*Open-Channel Hydraulics*, 1959, kapitel 10), integreret uafhængigt. Den samme metode bruges af de almindelige 1D-åprogrammer, så en håndberegning eller en studerendes noter kan overføres.

## Rørunderføringer og broer

Under åens **Egenskaber**, under **Rørunderføringer og broer**, placerer {{ui:Tilføj en rørunderføring}} eller {{ui:Tilføj en bro}} en konstruktion mellem to tværprofiler (hver strækning har mindst to). Profilet under den er uændret; vandspejlet lige over den kommer fra konstruktionen, og profilet fortsætter opstrøms derfra. **Resultater** tilføjer en tabel for hver konstruktion: halevandet, opstuvningskoten, hvilken styring der er gældende, flowet gennem åbningen og flowet over vejen eller dækket. Kun subkritisk strømning.

- **Rørunderføring** (kasse eller rund, en eller flere lige store rør). Indløbsstyring er overløbsstrømning, mens indløbet er frit, og åbningsstrømning når det er druknet, blandet mellem en opstuvning på én og halvanden gange stighøjden. Udløbsstyring er energibalancen: indløbstab, friktion og udløbshastighedshøjde, over det højeste af halevandet og midthøjden af den kritiske dybde og kronen, minus faldet langs røret. Opstuvningen er den største af de to. Sæt flueben ved **Vand kan gå over vejen**, og vejens overløbsstrøm deler flowet med rørene.
- **Bro.** Åbningen er tværprofilet under broen, skåret ved landfæsterne, med hver pille som et areal, der ikke fører flow. Vandspejlet i åbningen kommer fra tværprofilet under (udvidelseskoefficient), og tværprofilet over fra åbningen (sammentrækningskoefficient). Kan åbningen ikke føre flowet ved det halevand, kører den på kritisk dybde, og broen markeres som kvælning. Når vandet når underkanten af overliggeren, er flowet trykstrømning (sluseltype, mens halevandet er under underkanten, druknet over den), og vand over dækket tilføjer overløbsstrøm; opstrøms vandstand er den, hvor de tilsammen giver flowet.

Koefficienterne (afgang, indløbstab, overløb) er indtastede runde standardværdier. Ændr dem til dit projekt. De er ikke de tilpassede diagrammer, som rørdimensioneringsvejledninger trykker, så behandl opstuvningen ved en rørunderføring tæt på dens grænse som et estimat. Vand over en vej eller et dæk, et druknet indløb, en kvalt åbning og hurtigt flow i et rør vises i **Problemer**.

## Ustationær strømning

{{ui:Ustationær strømning…}} under åens **Egenskaber** sender en flodhydrograf ned gennem tværprofilerne. Skriv tilløbet som timer og flow, et par pr. linje, bundhældningen nedstrøms (normal dybde) og hvor længe der skal køres. Den starter fra det stationære vandspejl ved det første flow og løser de fulde endimensionelle ligninger (det implicitte firepunktsskema, vægtet 0.6 i tid). Du får den højeste vandstand og det højeste flow ved hvert tværprofil med det tidspunkt, hvor hver indtræffer, et plot af flowet i de to ender og volumenkontrollen (ind, ud og den lagrede ændring). Den kontrolleres for, at stationært flow forbliver stationært, at et trin i tilløbet ender ved det stationære profil for det nye flow, at volumen går op, og at flodbølgens hastighed passer med den kinematiske bølge. Kun subkritisk strømning, én strækning, ingen sidetilløb og ingen rørunderføringer eller broer inde i kørslen.

## Sammenløb

Strækninger, der løber sammen i én udløb: flowene lægges sammen, og vandspejlet ved begyndelsen af den nedstrøms strækning føres op til enderne af de strækninger, der løber ind i den (samme vandspejl ved sammenløbet, den enkle metode: ingen vinkel, intet momentum, så den passer til lave Froude-tal). Modellen og testene findes (`river-structures.js`); et panel til at sammenføje to åer i planen er endnu ikke lavet.

## Ikke lavet endnu

Vandløb og sluser som egne konstruktioner, et panel til sammenløb, konstruktioner inde i en ustationær kørsel og ustationær superkritisk strømning. En kørsel med blandet regime markerer et vandspring mellem to tværprofiler, men placerer det ikke.

**Hvor åer løber sammen.** I en ås Egenskaber angiver »Løber ind i« den å, den løber sammen med. Åer, der løber sammen, løses samlet: åen, de løber ind i, bærer summen af deres flow, og hver af dem ender ved vandspejlet ved den åens første tværprofil (metoden med lige vandspejl; den udelader flowenes vinkel og momentum). For at sammenføje en hovedå og et vandløb tegner du en kort å under sammenløbet og lader begge løbe ind i den. Resultaterne viser en sammenløbstabel. Standardværdierne i disse resultater (sammentrækning 0.1, udvidelse 0.3, et stykke løb med en sammensat ruhed, blandet regime efter specifik kraft) står ved, til en ingeniør har gennemgået dem, og resultaterne siger det.

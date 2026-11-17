---
title: Planér et byggeplateau
summary: Tegn et fladt plateau, sæt dets kote og skær- og fyldskråninger, og lad CivilCraft finde skæringen med det eksisterende terræn og føje plateauet til den projekterede overflade.
keywords: støttemur, støttemure, lodret side, mur i stedet for skråning, skråning pr. side, dæmning, planering, plateau, byggeplateau, skæring i terræn, feature-linje, planeringsgruppe, skærskråning, fyldskråning, færdig kote, projekteret overflade, terrænplanering
from: 482319a6
---

Et plateau er et fladt område i én kote. Fra dets kant planerer CivilCraft udad med din skærskråning, hvor terrænet ligger højere end plateauet, og med din fyldskråning, hvor det ligger lavere, indtil skråningen møder det eksisterende terræn. Den linje, hvor de mødes, er skæringslinjen i terrænet. Plateauet og dets skråninger erstatter det eksisterende terræn inden for skæringslinjen og danner den projekterede overflade.

## Tegn plateauet

Du skal have en eksisterende terrænoverflade først.

1. Tryk {{key:G}}, eller klik på {{ui:Byggeplateau}} i **Design**-gruppen.
   Hintet siger »Byggeplateau: klik på dets hjørner. Enter eller dobbeltklik afslutter, Backspace fjerner det sidste, Esc annullerer.«
2. Klik på plateauets hjørner i rækkefølge, med uret eller mod uret. En blå kontur følger markøren.
3. Tryk {{key:Enter}} efter det sidste hjørne (mindst tre).
   Plateauet tegnes og vælges. Det starter i terrænkoten ved dets midte, afrundet til 0.1, med en 2 : 1 skærskråning og en 3 : 1 fyldskråning. Statuslinjen siger for eksempel »Byggeplateau 1 i kote 254.3 (terrænet ved dets midte), skær 2:1, fyld 3:1. Ændr dem i Egenskaber.«

:::warning
Afslut med {{key:Enter}}. Dobbeltklik afslutter også, men i denne version fjerner det hjørnet, du dobbeltklikkede. Klik én gang på det sidste hjørne, og tryk derefter {{key:Enter}}.
:::

Plateauets kontur må ikke krydse sig selv (»Plateauets kontur krydser sig selv.«).

## Sæt kote og skråninger

Med plateauet valgt viser det højre panel **Byggeplateau**:

1. **Navn**.
2. **Kote**: plateauets flade kote.
3. **Skærskråning** og **Fyldskråning**, som H:V (2 betyder 2 : 1). Begge skal være større end 0.
4. **Plateauets areal** og **Hjørner** vises til reference.

Tryk {{key:Enter}} efter hver værdi. Skæringslinjen, den projekterede overflade og mængderne opdateres med det samme.

Under felterne står en linje, for eksempel »Skæringslinje i terræn: 48 skråningslinjer (20 i skæring, 28 i fyld), længst ud 31.20 ft.« Planen viser skæringslinjen og skråningslinjerne i magenta.

## Sådan findes skæringen

- Skråningslinjer går ud fra hver kant vinkelret på den, cirka hver tyvende del af plateauets størrelse.
- Ved udvendige hjørner vifter de ud hvert 10°, så skråningen går rundt om hjørnet.
- Ved indvendige hjørner løber én linje langs halveringslinjen, hvor skråningerne fra de to kanter mødes.
- Hver linje stiger med skærskråningen eller falder med fyldskråningen, indtil den når terrænet.

## Skråninger pr. side og støttemure

Under **Sider og støttemure** i **Egenskaber** for et plateau, en plads eller en vold kan hver side planeres på sin egen måde. Side 1 går fra det første hjørne, du klikkede, til det andet, side 2 fra det andet til det tredje, og så videre.

- **Alle sider**: **Skrånende** bruger skær- og fyldskråningerne ovenfor på hver side; **Lodret: støttemure** sætter en mur på hver side.
- Pr. side: **Skråninger ovenfor**, **Egne skråninger** (skriv en skærskråning og en fyldskråning for den side) eller **Lodret (støttemur)**.
- Skriv en skråning som `3` eller `3:1` (vandret til 1 lodret), `33%` eller `18.4°`; den vises som H:1. Plateauets egen **Skærskråning** og **Fyldskråning** tager det samme.
- En lodret side har ingen dæmning: en støttemur løber langs kanten, fra plateauet ned til det eksisterende terræn (i fyld) eller fra terrænet ned til plateauet (i skæring). **Muretykkelse** (0.3 m eller 1 ft til at starte med) er, hvor langt terrænet trinner fra plateauets kant til det eksisterende terræn. Skær- og fyldmængder udelader den dæmning, som siden ikke længere har.
- Hvor en mur møder en skråning, går skråningen rundt om murens ende; to mure mødes i en gering.
- Under felterne: murenes længde, synlige flade (højde × længde), højeste og gennemsnitlige højde.

Planen tegner hver murs ydre flade med korte streger over den og dens højde i begge ender og ved dens højeste punkt (på laget for støttemure, der også går til DXF og DWG). 3D-visningen viser murene som massive legemer (Vis › Støttemure), og GLB-, OBJ- og USD-eksport medtager dem. Snit på tværs af kanten viser trinnet.

**Advarsler** (i **Egenskaber** og i panelet Problemer): en mur højere end **Advar over en murhøjde på** (1.0 m eller 3.3 ft til at starte med) »kan kræve en ingeniørmur eller en tilladelse; kontrollér lokale regler«, og, når du skriver **Stejleste skråning, jorden holder**, enhver side, hvis skær- eller fyldskråning er stejlere end den. De er advarsler: planeringen bygges stadig. Hver ændring er ét trin for {{key:Mod+Z}}.

## Flyt hjørner

Vælg plateauet, og træk så i et kvadratisk greb ved et hjørne. Hvert træk er ét fortrydelsestrin. Tilføjelse eller fjernelse af et hjørne er ikke tilgængeligt endnu: slet plateauet og tegn det igen.

## Når det ikke planerer

En rød boks under **Jordarbejde** navngiver plateauet og problemet:

| Besked | Hvad du gør |
|---|---|
| »3 skråningslinjer løber ud af overfladen, før de møder den: plateauet er for tæt på overfladens kant eller for højt/lavt.« | Flyt plateauet ind fra overfladens kant, eller bring dets kote nærmere terrænet. |
| »Skæringslinjen krydser sig selv (skråninger fra forskellige sider af plateauet løber ind i hinanden). Ændr formen på plateauet eller skråningerne.« | Typisk for smalle eller L-formede plateauer i dyb skæring eller høj fyld. Gør plateauet bredere, udjævn forskellen, eller gør skråningerne stejlere. |
| »Plateauets kontur krydser sig selv.« | Tegn hjørnerne igen i rækkefølge rundt om plateauet. |

Et plateau med et problem udelades af den projekterede overflade og af mængderne, indtil det er rettet.

## Se resultatet

1. Under **Visning** sættes **Overflade** til {{ui:Projekteret (planeret)}}.
   Højdekurverne løber nu fladt hen over plateauet og følger skråningerne ud til skæringslinjen.
2. Før markøren over plateauet: statuslinjen viser koterne for **Terræn** og **Planeret**.
3. Læs skær og fyld under **Jordarbejde**; se [Jordarbejdsmængder](topic:volumes).

Plateauer planeres efter korridorer, i den rækkefølge de blev tegnet. Et senere plateau erstatter alt tidligere inden for sin egen skæringslinje.

## Slet et plateau

Vælg det, og tryk {{key:Delete}} (på en Mac: Fn og delete), eller klik på {{ui:Slet}}.

## Ikke lavet endnu

Plateauer er flade: skrånende plateauer, feature-linjer med varierende fald, bænke og planering til et afstands- eller kotemål er ikke tilgængelige endnu. Se [Ikke lavet endnu](topic:not-built-yet).

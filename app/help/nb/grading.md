---
title: Forme en byggeplate
summary: Tegn en flat byggeplate, sett høyden og skråningene for skjæring og fylling, og la CivilCraft dagslinjere den mot eksisterende terreng og legge den til den prosjekterte overflaten.
keywords: støttemur, støttemurer, vertikal side, mur i stedet for skråning, skråning per side, fylling, terrengforming, byggeplate, dagslinje, formlinje, terrengforming-gruppe, skjæringsskråning, fyllingsskråning, ferdig terreng, prosjektert overflate, tomteforming
from: 482319a6
---

En byggeplate er et flatt område i én høyde. Fra kanten sin former CivilCraft utover med skjæringsskråningen din der terrenget er høyere enn platen, og med fyllingsskråningen din der det er lavere, til skråningen møter eksisterende terreng. Den linjen er dagslinjen. Platen og skråningene erstatter eksisterende terreng innenfor dagslinjen og gir den prosjekterte overflaten.

## Tegn platen

Du trenger en eksisterende terrengoverflate først.

1. Trykk {{key:G}}, eller klikk {{ui:Byggeplate}} i **Design**-gruppen.
   Hintet sier «Byggeplate: klikk hjørnene. Enter eller dobbeltklikk avslutter, Backspace fjerner det siste, Esc avbryter.»
2. Klikk hjørnene på platen i rekkefølge, begge veier. En blå kontur følger pekeren.
3. Trykk {{key:Enter}} etter siste hjørne (minst tre).
   Platen tegnes og velges. Den starter i terrenghøyden midt i den, avrundet til 0,1, med 2 : 1 skjæringsskråning og 3 : 1 fyllingsskråning. Statuslinjen sier for eksempel «Byggeplate 1 i høyde 254,3 (terrenget midt i den), skjæring 2:1, fylling 3:1. Endre dem i Egenskaper.»

:::warning
Avslutt med {{key:Enter}}. Dobbeltklikk avslutter også, men i denne versjonen fjerner det hjørnet du dobbeltklikket på. Klikk det siste hjørnet én gang, og trykk deretter {{key:Enter}}.
:::

Konturen til platen må ikke krysse seg selv («Konturen til byggeplaten krysser seg selv.»).

## Sett høyde og skråninger

Med platen valgt viser det høyre panelet **Byggeplate**:

1. **Navn**.
2. **Høyde**: platens flate høyde.
3. **Skjæringsskråning** og **Fyllingsskråning**, som H:V (2 betyr 2 : 1). Begge må være større enn 0.
4. **Arealet** og **Hjørner** vises til referanse.

Trykk {{key:Enter}} etter hver verdi. Dagslinjen, den prosjekterte overflaten og volumene oppdateres med en gang.

Under feltene står det for eksempel en linje: «Dagslinje: 48 skråningslinjer (20 i skjæring, 28 i fylling), lengst 31.20 ft ut.» Planen viser dagslinjen og skråningslinjene i magenta.

## Slik finnes dagslinjen

- Skråningslinjer går ut fra hver kant, rett på den, omtrent for hver tjuendedel av platens størrelse.
- Ved ytre hjørner vifter de ut hver 10°, slik at skråningen går rundt hjørnet.
- Ved indre hjørner går én linje langs halveringslinjen, der skråningene fra de to kantene møtes.
- Hver linje stiger med skjæringsskråningen eller faller med fyllingsskråningen til den når terrenget.

## Skråninger per side og støttemurer

Under **Sider og støttemurer** i Egenskaper for en plate, en platting eller en voll kan hver side formes på sin egen måte. Side 1 går fra første hjørne du klikket til det andre, side 2 fra det andre til det tredje, og så videre.

- **Alle sider**: **Skrånende** bruker skjærings- og fyllingsskråningene over på hver side; **Vertikal: støttemurer** setter en mur på hver side.
- Per side: **Skråninger over**, **Egne skråninger** (skriv inn en skjærings- og en fyllingsskråning for den siden) eller **Vertikal (støttemur)**.
- Skriv en skråning som `3` eller `3:1` (horisontalt til 1 vertikalt), `33%` eller `18.4°`; den vises som H:1. Platens egne **Skjæringsskråning** og **Fyllingsskråning** tar det samme.
- En vertikal side har ingen voll: en støttemur går langs kanten, fra platen ned til eksisterende terreng (i fylling), eller fra terrenget ned til platen (i skjæring). **Murtykkelse** (0,3 m eller 1 ft til å begynne med) er hvor langt terrenget trapper seg fra platekanten til eksisterende terreng. Skjærings- og fyllingsvolumene utelater volen den siden ikke lenger har.
- Der en mur møter en skrånende side, går skråningen rundt enden av muren; to murer møtes i en gjæring.
- Under feltene: murenes lengde, eksponert flate (høyde × lengde), og høyeste og gjennomsnittlige høyde.

Planen tegner hver murs ytre flate med korte streker over den og dens høyde i begge ender og på sitt høyeste (på støttemurlaget, som også går til DXF og DWG). 3D-visningen viser murene som volumer (Vis › Støttemurer), og GLB-, OBJ- og USD-eksporter tar dem med. Snitt over kanten viser trinnet.

**Advarsler** (i Egenskaper, og i Problemer-panelet): en mur høyere enn **Advar over en murhøyde på** (1,0 m eller 3,3 ft til å begynne med) «kan trenge en prosjektert mur eller en tillatelse; sjekk lokale regler», og, når du skriver inn **Brattest skråning jorden står i**, en side der skjærings- eller fyllingsskråningen er brattere enn det. Dette er advarsler: formingen bygges likevel. Hver endring er ett steg for {{key:Mod+Z}}.

## Flytt hjørner

Velg platen, dra så et kvadratisk håndtak i et hjørne. Hvert drag er ett steg som kan angres. Å legge til eller fjerne et hjørne er ikke tilgjengelig ennå: slett platen og tegn den på nytt.

## Når den ikke former seg

En rød boks under **Jordarbeid** nevner platen og problemet:

| Melding | Hva du gjør |
|---|---|
| «3 skråningslinjer går utenfor overflaten før de møter den: byggeplaten er for nær overflatens kant, eller for høy/lav.» | Flytt platen innover fra overflatens kant, eller før høyden nærmere terrenget. |
| «Dagslinjen krysser seg selv (skråninger fra ulike sider av platen løper inn i hverandre). Form platen om, eller endre skråningene.» | Vanlig for smale eller L-formede plater i dyp skjæring eller høy fylling. Gjør platen bredere, jevn ut forskjellen, eller gjør skråningene brattere. |
| «Konturen til byggeplaten krysser seg selv.» | Tegn hjørnene på nytt i rekkefølge rundt platen. |

En plate med et problem utelates fra den prosjekterte overflaten og volumene til det er rettet.

## Se resultatet

1. Under **Visning** setter du **Overflate** til {{ui:Prosjektert (formet)}}.
   Koten går nå flatt over platen og følger skråningene ut til dagslinjen.
2. Før pekeren over platen: statuslinjen viser **Terreng**- og **Formet**-høyder.
3. Les skjæring og fylling under **Jordarbeid**; se [Jordarbeidsvolumer](topic:volumes).

Plater formes etter korridorer, i den rekkefølgen de ble tegnet. En senere plate erstatter alt tidligere innenfor sin egen dagslinje.

## Slett en byggeplate

Velg den og trykk {{key:Delete}} (på Mac, Fn og delete), eller klikk {{ui:Slett}}.

## Ikke bygget ennå

Plater er flate: skrånende plater, formlinjer med varierende fall, benker, og forming til en avstand eller et høydemål er ikke tilgjengelig ennå. Se [Ikke bygget ennå](topic:not-built-yet).

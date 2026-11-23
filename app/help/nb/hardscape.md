---
title: Belegning, murer og trapper
summary: Belegning med fall til sluk eller tverrfall, et mønster og oppbygningen; stier som følger terrenget; støttemurer og frittstående murer med trinnvise fundamenter; kantsteiner; ramper og trapper kontrollert mot grensene; IFC ut.
keywords: harde flater, belegning, belegningsstein, uteplass, terrasse, fall, sluk, tverrfall, sildebensmønster, løpeforband, sti, gangvei, støttemur, hagemur, fundament, avdekning, kantstein, kantavslutning, rampe, tilgjengelighet, trapper, opptrinn, trinn, repos
from: d34b4466
---

Harde flater beregnes på nytt fra terrenget hver gang, så de følger terrengformen og oppdateres når terrenget eller linjen endres. Dra hjørnene i planen som en hvilken som helst linje. Åpne den fra {{ui:Harde flater}} i gruppen Landskap.

## Belegning

Klikk hjørnene og trykk {{key:Enter}}. I Egenskaper:

- **Nivå**: tomt = terrengets middel under den.
- **Fall**: flatt, et **tverrfall** (en prosent mot en retning) eller **til et sluk**: CivilCraft ber deg klikke der sluket skal ligge, og deretter stiger hvert hjørne fra sluket med fallet. Piler i planen viser fallene.
- **Mønster** (rutenett, løpeforband, sildebensmønster) med enhetsstørrelse, fuge og vinkel; **Kantavslutning** bredde. På et ark utelates fuger som er nærmere enn én millimeter.
- Belegningen er en del av den prosjekterte terrengmodellen. Lagene (belegningsstein, sengelag, bærelag) går inn i IFC og mengdene.

## Stier

Klikk langs stien og trykk {{key:Enter}}. Den følger terrenget, med sitt **Tverrfall** mot høyre side. En sti brattere enn {{ui:Brattest tillatt}} merkes med `!` i planen der den er, og Egenskaper sier hvor bratt den blir.

Der en sti møter en veg bygget av en korridor, stopper den ved veiens ytterkant, i nivå med gangveien eller skulderen der, i den prosjekterte terrengmodellen og i 3D-visningen. En sti som krysser en veg, formes og vises som to deler, og en ende tegnet opptil to ganger stiens bredde kort av veien føres videre til kanten. Planen viser fortsatt stien slik du tegnet den, og lengden og arealet teller hele linjen. Se [Feie en veikorridor](topic:corridor).

## Murer

Klikk langs muren og trykk {{key:Enter}}. En mur er enten **støttemur** eller **frittstående**. Uten **Topp** står den sin **Høyde** over terrenget hele veien; skriv inn en topp for å holde den i jevn høyde. Fundamentet ligger en fast dybde under terrenget og trapper seg ned i hele trinn, slik at det forblir jevnt mellom trinnene. Egenskaper gir lengden, høydene, flatearealet og fundamenttrinnene; planen merker murtoppen og murbunnen (TW / BW) i hver ende.

:::warning
En støttemur høyere enn 1.2 m (4 ft) flagges: en ingeniør prosjekterer den.
:::

## Kantsteiner

Klikk langs kantsteinen og trykk {{key:Enter}}; angi bredde og oppstikk.

## Ramper

Klikk fra bunnen til toppen og trykk {{key:Enter}}. Nivåene hentes fra terrenget i hver ende, med mindre du skriver dem inn. En rampe får et repos for hver stigning på 750 mm (2.5 ft) og kontrolleres mot {{ui:Brattest tillatt}} (1:12 til å begynne med) og en minimumsbredde; Egenskaper sier hvor lang den må være.

## Trapper

Klikk på forkanten av nederste trinn, deretter der trappen når toppen, og trykk {{key:Enter}}. Antall opptrinn beregnes fra høyden og **Største opptrinn**; inntrinnet fra komfortregelen 2R + G ≈ 630 mm, aldri under **Minste inntrinn**; et repos for hver **Opptrinn per løp, høyst**. Egenskaper sier om de får plass mellom de to punktene, eller hvor mye lengre de må være.

:::note
Grensene for ramper og trapper er merkede standardverdier. Sett dem som byggeforskriften din krever.
:::

## Ut av CivilCraft

- Mer › {{ui:Eksporter landskaps-IFC}}: belegning og stier som `IfcPavement`, murer som `IfcWall` (støttemurer som RETAININGWALL) med sine lag, kantsteiner som `IfcKerb`, ramper som `IfcRamp`, trapper som `IfcStair` med opptrinn og trinn.
- **Send til TakeoffCraft** fra beplantningslisten tar med belegningens arealer og lagvolumer, murenes flateareal og lengder, kantsteinenes lengder og antall trinn.
- Detaljarket tegner hver murs tverrsnitt, oppbygningen av hver belegning og hvert trappeløp. Se [Landskapsark](topic:landscape-sheets).

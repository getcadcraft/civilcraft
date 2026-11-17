---
title: Belegning, murer og trapper
summary: Belegning med fall til sluk eller tverrfall, et mønster og oppbygningen; stier som følger terrenget; støttemurer og frittstående murer med trinnede fundamenter; kantsteiner; ramper og trapper kontrollert mot grensene sine; IFC ut.
keywords: harde flater, belegning, heller, uteplass, terrasse, fall, sluk, tverrfall, sildebensmønster, løpeforband, sti, gangvei, støttemur, hagemur, fundament, avdekning, kantstein, kantlist, rampe, tilgjengelighet, trapp, opptrinn, trinn, repos
from: 51475877
---

Harde flater beregnes på nytt fra terrenget hver gang, så de følger terrenget og oppdateres når terrenget eller linjen flyttes. Dra hjørnene på planen som med en hvilken som helst linje. Åpne den fra {{ui:Harde flater}} i gruppen Landskap.

## Belegning

Klikk hjørnene og trykk {{key:Enter}}. I Egenskaper:

- **Nivå**: tomt = terrengets gjennomsnitt under den.
- **Fall**: nivå, et **tverrfall** (en % mot en retning) eller **mot et sluk**: CivilCraft ber om at det klikkes der sluket skal være, og deretter stiger hvert hjørne fra sluket med fallet. Piler på planen viser fallene.
- **Mønster** (rutenett, løpeforband, sildebensmønster) med enhetsstørrelse, fuge og vinkel; **Kantlist**-bredde. På et ark utelates fuger som er nærmere enn en millimeter.
- Belegningen er en del av ferdig terreng. Lagene (heller, sjikt, underlag) går inn i IFC og mengdene.

## Stier

Klikk langs stien og trykk {{key:Enter}}. Den følger terrenget, med **Tverrfall** til høyre side. En sti brattere enn **Brattest tillatt** merkes med `!` på planen der den er, og Egenskaper sier hvor bratt den blir.

## Murer

Klikk langs muren og trykk {{key:Enter}}. En mur er **støttende** eller **frittstående**. Uten **Topp** står den **Høyde** over terrenget hele veien; skriv inn en topp for å holde den jevnt. Fundamentet sitter en fast dybde under terrenget og trinnes ned i hele trinn, slik at det er jevnt mellom dem. Egenskaper gir lengden, høydene, frontarealet og fundamenttrinnene; planen merker topp og bunn av mur (TW / BW) i hver ende.

:::warning
En støttemur høyere enn 1.2 m (4 ft) merkes: en ingeniør må prosjektere den.
:::

## Kantsteiner

Klikk langs kantsteinen og trykk {{key:Enter}}; sett bredden og oppstikkshøyden.

## Ramper

Klikk fra bunnen til toppen og trykk {{key:Enter}}. Nivåene hentes fra terrenget i hver ende med mindre de skrives inn. En rampe får et repos for hver stigning på 750 mm (2.5 ft) og kontrolleres mot **Brattest tillatt** (1:12 som utgangspunkt) og en minstebredde; Egenskaper sier hvor lang den må være.

## Trapper

Klikk forkanten av nederste trinn, deretter der trappen når toppen, og trykk {{key:Enter}}. Antall opptrinn kommer fra høyden og **Største opptrinn**; inntrinnet fra komfortregelen 2R + G ≈ 630 mm, aldri under **Minste inntrinn**; et repos for hver **Opptrinn per løp, høyst**. Egenskaper sier om trappen passer mellom de to punktene, eller hvor mye lengre den må være.

:::note
Grensene for ramper og trapper er merkede standardverdier. Sett dem som bygningsreglene krever.
:::

## Ut av CivilCraft

- Mer › {{ui:Eksporter landskaps-IFC}}: belegning og stier som `IfcPavement`, murer som `IfcWall` (støttemurer som RETAININGWALL) med lagene sine, kantsteiner som `IfcKerb`, ramper som `IfcRamp`, trapper som `IfcStair` med opptrinn og trinn.
- Plantelisten sin **Send til TakeoffCraft** tar med belegningsarealene og lagvolumene, murenes frontarealer og lengder, kantsteinslengder og antall trinn.
- Detaljarket tegner hver murs snitt, hver belegnings oppbygning og hvert trapeløp. Se [Landskapsark](topic:landscape-sheets).

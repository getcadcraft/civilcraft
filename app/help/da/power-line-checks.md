---
title: Kontroller for elledninger
summary: Hvad CivilCraft kontrollerer på hver linje og hvert kabel, altid opdateret: frihøjder, afstande, udsving, optrækning, understøtningsbelastninger og dimensionering, beslag, stag, fundamenter, manglende data, forbindelser, overbelastninger og spændingsfald.
keywords: kontroller, frihøjde, jordfrihøjde, forhindring, krydsning, fasetafstand, isolatorudsving, optrækning, understøtningslast, nominel last, dimensionering, fundament, stag, barduner, beslag, tværbjælke, spændingsfald, overbelastning, manglende data, ikke forbundet
from: e6a0da47
---

**Kontroller** i afsnittet Elledninger viser alle problemer: rødt for det, der fejler, og gult for advarsler. Klik på en kontrol for at vælge den linje, understøtning, det spænd, kabel eller udstyr, den handler om; fejlende understøtninger og spænd ringes ind med rødt på planen, mens arbejdsområdet er åbent.

:::warning
Et designhjælpemiddel: dette er kontroller af dit design mod dine egne regler, ikke en certificering.
:::

## Frihøjder

Lederens laveste fase følges over hvert spænd ved hvert lasttilfælde. Dens laveste frihøjde over terrænet skal nå linjens **Frihøjderegel**. Hvor et spænd krydser en **forhindring** (tegnet med {{ui:Forhindring}}: et punkt eller en linje med dens højde over terrænet og dens egen frihøjderegel), kontrolleres frihøjden over forhindringens top på samme måde.

**Det, Landskab-arbejdsområdet sætter over terrænet, tæller også.** Enkelte planter (deres krone ved fuld udvikling og højde), hække og plantebede (de højeste arter i dem) og mure (deres top) er forhindringer under en linje uden at blive tegnet igen. De beholder reglerne sat i {{ui:Lasttilfælde og grænser…}}: **Landskabsplanter under en linje** (eksempelsættene bruger *Træer og planter*, 3 m) og **Landskabsmure under en linje** (*Bygning*); vælg **Ikke kontrolleret** for at udelade dem. Frihøjden måles lige op fra toppen af planten eller muren til lederen, hvor spændet krydser den; afstanden i sidelæns retning til en krone ved siden af linjen kontrolleres ikke. Flytning af et træ eller hævning af en mur ændrer kontrollerne med det samme.

Dine frihøjderegler er dine egne: åbn dem med **Regler…** ved siden af enhver **Frihøjderegel** (eller under {{ui:Lasttilfælde og grænser…}}) for at tilføje, omdøbe, ændre eller fjerne dem.

## Afstande og udsving

- **Fasetafstand** nødvendig: k·√(gennemhængning + isolatorlængde) + U/150, med det varme tilfældes gennemhængning og spændingen U i kV (en almindelig form; k følger dit regelsæt). Sammenlignes med tværbjælkens fasetafstand.
- **Isolatorudsving** på ophængningsunderstøtninger under vindtilfældet: atan(tværlast ÷ lodret last), mod regelsættets største udsving.
- **Optrækning**: en ophængningsunderstøtning, der står lavere end sine naboer, kan trækkes op i kulden; den markeres.

## Understøtningsbelastninger og dimensionering

For hver understøtning og hvert lasttilfælde, med alle lederne på linjen:

- **Tværgående**: vind pr. meter × vindspændet (halvdelen af de to spænd), plus 2·H·sin(drejning ÷ 2) ved et hjørne.
- **Langs linjen**: forskellen mellem de to sider's spændinger ved en endeforankring eller vinkel; ved en ophængningsunderstøtning kun under is på den ene side (hvert spænd regnes for sig, hvilket er på den sikre side).
- **Lodret**: lodret last pr. meter × vægtspændet (mellem de laveste punkter på hver side) plus udstyret.

Den vandrette last føres til understøtningens nominelle punkt (ækvivalent last = last × fastgørelseshøjde ÷ højde af det nominelle punkt) og sammenlignes med dens **nominelle last** × regelsættets faktor. Når den er for svag, foreslås den mindste understøtning af samme materiale i dit bibliotek, der kan bære den. En understøtning med et **stag** overfører den vandrette last til stagen, som bærer last ÷ sin(stagvinkel) og kontrolleres mod sin egen mærkelast.

Beslag (klemmer, isolatorer, tværbjælker) kontrolleres mod deres mærkelast: et forankringsbeslag bærer lederens spænding, et ophængningsbeslag sin andel af den lodrette og tværgående last. Det viste **fundament** er understøtningens dybde i jorden og et hul, der er lidt bredere end dens fod.

## Data, forbindelser og strøm

- Et element med et nødvendigt felt tomt, eller en nøgle der ikke findes i biblioteket.
- En kabelrutes ende, eller et udstyr, der ikke er forbundet til noget.
- **Spændingsfald** og **strøm** fra hver kilde (udstyr markeret som kilde) til lasterne (kW og effektfaktor på udstyret), langs luftspænd og kabler: √3·I·L·(R cos φ + X sin φ), med R ved 20 °C. Mere end kablets strømværdi, eller mere fald end regelsættet tillader, markeres.

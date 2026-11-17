---
title: Puntwolke van 'n hommeltuig of skandeerder
summary: Met die Puntwolke-byvoeging maak jy 'n LAS- of LAZ-lêer met miljoene punte oop, kyk na alles, maak dit skoon, sorteer dit in grond, plantegroei en geboue, en bou die grond, kontoerlyne en volumes daaruit.
keywords: puntwolk, las, laz, hommeltuig, fotogrammetrie, recap, lidar, skandeer, grond, klassifiseer, geraas, stapel, volume, afgrawing en opvulling, kontoerlyne, breeklyn, eye-dome, ortho-mosaïek, ortho, bedek, kaartlaag, voer las uit, voer laz uit, komprimeer
from: e4a4901f
---

Die meeste mense het dit nooit nodig nie, daarom is dit 'n byvoeging. Skakel {{ui:Puntwolke}} aan in Instellings › Byvoegings; 'n {{ui:Puntwolke}}-oortjie verskyn in die paneel ter regterkant. Die lêer word in jou blaaier gelees en in teëls gesny wat in jou blaaier se eie berging bewaar word (of in 'n vouer wat jy kies). **Niks word opgelaai nie.**

:::warning
Alles wat hierdie oortjie rapporteer, is 'n getal uit jou data, nie 'n sertifikaat nie. Dit is getoets op 'n versinde terrein, nog nie op 'n werklike hommeltuigopname nie: lees die eerste resultate met omsigtigheid en vertel ons wat jy vind. Die geregistreerde professional besluit wat die grond, kontoerlyne en volumes werd is.
:::

## Maak 'n wolk oop

Onder {{ui:Maak 'n wolk oop}} kies 'n LAS- of LAZ-lêer. Die oortjie sê hoeveel punte dit bevat, sy koördinaatstelsel en eenhede, en hoeveel ruimte 'n bou nodig het; druk {{ui:Bou die wolk}}. 'n Bou kan gestop word en gaan voort met {{ui:Hervat}} (kies dieselfde lêer weer). Die lêer word nooit verander nie. 'n Lêer van 100 miljoen punte bou in minute op 'n werkstasie en ongeveer net soveel ruimte as die lêer self.

Onder {{ui:Wolke op hierdie rekenaar}} maak jy 'n wolk oop of verwyder jy dit. {{ui:Hou wolke in 'n vouer…}} (Chrome, Edge en die Studio-program) hou die teëls in 'n vouer wat jy kies, byvoorbeeld 'n CadCraft-wolkevouer in Dokumente, sodat 'n wolk van 10 GB nie in die blaaier se berging hoef te pas nie; wolke wat vroeër gebou is, bly waar hulle gebou is. Die blaaier vra weer om toestemming ná 'n herbegin: druk {{ui:Gebruik die vouer … weer}}.

## Kyk na dit

{{ui:Kyk na dit in 3D}} teken die wolk uit growwe teëls en verfyn soos jy nader beweeg, en nooit meer as {{ui:Meeste punte getek}} op een slag nie (2.5 miljoen; 500 thousand op 'n foon). Kleur volgens die lêer se eie kleur, hoogte, klas, intensiteit of residu. {{ui:Eye-dome-beligting}} skadueer rande volgens diepte sodat die vorm lees sonder normale (af op 'n foon); {{ui:Punte krimp met afstand}} maak verre punte kleiner en nabye punte groter; {{ui:Puntgrootte}} stel die grootte. Die plan wys die wolk as 'n raster onder jou tekening en **verfyn wanneer jy inzoem** na 'n deel daarvan.

## Maak dit skoon

Onder {{ui:Maak skoon}} teken 'n lasso, 'n boks of 'n veelhoek in die plan (of in 3D vanaf die bo-aansig: in 3D word die omtrek reguit af geneem, so dit is slegs vanaf bo presies). Die oortjie wys hoeveel punte binne is **voordat** jy toepas: {{ui:Skrap hierdie punte}}, {{ui:Verander hul klas}}, {{ui:Herstel geskrapte punte}} of {{ui:Sny by hierdie grens}}. {{ui:Ontdoen}} en {{ui:Herdoen}} beweeg deur die wysigingslog; die lêer self word nooit verander nie. {{ui:Geraasfilter…}} merk verdwaalde punte as lae punte (klas 7) of hoë geraas (klas 18).

## Sorteer dit

{{ui:Vind die grond}} werk stuk vir stuk en merk grond (klas 2) en lae punte; die toleransie is 0.15 m, of 0.08 m met die opnamegraad-skakelaar. Dit rapporteer teëlnate wat nie ooreenstem nie. {{ui:Klassifiseer plantegroei en geboue}} merk daarna lae, medium en hoë plantegroei en geboue uit hoogte bo die grond en hoe plat die omgewing is. Daar is geen masjienleer nie, so 'n plat-dak-skuur onder bome kan verkeerd wees: kyk self.

## Grond, kontoerlyne, breeklyne

{{ui:Bou grond}} maak die bestaande grond uit die grondpunte en voeg dit by die projek op dieselfde manier as 'n LAS-invoer (een ontdoen-stap). Dit vergelyk daarna die punte daarmee: die gemiddelde, RMS, 95ste persentiel, die aandeel binne toleransie, en die tien plekke wat die meeste verskil, elk met {{ui:Gaan daarheen}}. Kleur volgens {{ui:Residu}} wys waar die grond en die wolk nie ooreenstem nie.

'n **Breeklyn** (’n kantsteen, sloot of boonste deel van 'n walkant) word op die wolk gekies: {{ui:Kies 'n breeklyn op die wolk}} in die 3D-aansig neem die naaste getekende punt by elke klik, en {{ui:Kies 'n breeklyn in die plan}} neem die naaste wolkpunt (grond eerste) onder elke klik; dubbelklik of Enter beëindig die lyn. Die volgende {{ui:Bou grond}} gebruik dit. {{ui:Wys kontoerlyne}} teken die kontoerlyne oor die wolk in 'n klein prent en stel die projek se interval.

## Volumes

{{ui:Stapelvolume…}} bereken die volume van die oppervlak bo 'n basis binne 'n grens wat jy teken. Teken die grens op gelyk grond rondom die hoop en kies die basis: die laagste grenspunt, 'n vlak, 'n gladde geboë basis, 'n oppervlak deur die grens, of 'n peil wat jy intik. Op hellende of geboë grond gebruik die vlak of die geboë basis; die laagste punt lees te hoog. Grenspunte wat bo die res uitsteek (’n boom op die lyn) word uit die basis gelaat. {{ui:Vlug na vlug}} gee afgrawing en opvulling tussen twee wolke. Albei kan as CSV gestoor word.

## Ortho-mosaïek

Onder {{ui:Ortho-mosaïek (prent van bo)}} kies die hommeltuig se ortho-mosaïek saam met sy wêreldlêer en `.prj` wanneer dit een het: 'n GeoTIFF, of 'n PNG of JPEG. Dit word 'n **kaartlaag** van die projek, sodat die plan dit onder jou tekening wys, en die 3D-aansig (kleur {{ui:Kaart}}) verf dit op die grond wat jy gebou het, so bou eers {{ui:Bou grond}}. Die oortjie sê hoeveel van die wolk die prent dek, en waarsku wanneer dit niks dek nie: die gewone oorsaak is 'n ander koördinaatstelsel, so gee die `.prj`-lêer saam daarmee. Wanneer daar geen `.prj` is nie, vra die program waar die koördinate is. Die prent word binne die projeklêer bewaar; 'n GeoTIFF groter as 200 MB word geweier en 'n baie groot mosaïek word tot 16 megapixel verklein, so sny vir 'n groot opname eers die mosaïek na die terrein.

## Uitvoer

{{ui:Uitvoer}} skryf die skoongemaakte, geklassifiseerde wolk as 'n nuwe lêer (alle punte, die skoon klasse, of slegs die grond). Onder {{ui:Lêertipe}} kies:

- **LAS 1.4 (nie saamgepers nie)**: puntformaat 6, of 7 met kleur.
- **LAZ (saamgepers)**: dieselfde punte sonder verlies saamgepers, sodat elke punt presies terugkom. Dit word as puntformaat 0, of 2 met kleur, in 'n LAS 1.4-lêer geskryf. Op die versinde terrein van 300 m was die LAZ ongeveer 'n vyfde van die grootte van die LAS 1.4-lêer. LAZ-formate 0 en 2 hou slegs klasse 0 tot 31: 'n punt met 'n hoër klas word met 'n boodskap geweier, so voer daardie wolk as LAS 1.4 uit.

Die LAZ word deur CadCraft se eie kompressor geskryf, gemaak uit die gepubliseerde LAZ-spesifikasie. Ons het nagegaan dat ons eie leser en twee onafhanklike LAZ-lesers (laz-perf, wat die program gebruik om LAZ-lêers oop te maak, en laspy met lazrs) elke punt presies terugle, en dat LAZ-lêers wat deur laspy gemaak is, byte vir byte dieselfde is wanneer ons hul punte weer skryf. Ander programme is nog nie getoets nie, so as een 'n lêer nie sal oopmaak nie, vertel ons watter een.

Waar die blaaier 'n lêer kan skryf soos dit gaan, kies jy die lêer eers en word 'n baie groot wolk stuk vir stuk daarin geskryf in plaas van in geheue versamel; anders word die lêer versamel en afgelaai, wat goed is tot 'n paar honderd megagrepe.

## Wat dit nie doen nie

Dit lees slegs LAS en LAZ (E57, PLY en PCD is nog nie in hierdie oortjie gekoppel nie, en verskeie lêers van een vlug word nie saamgevoeg nie), herprojekteer nie 'n wolk nie (die projek se stelsel en meter word aanvaar), lees nie Autodesk se RCP- of RCS-lêers nie, maak nie 'n oppervlak uit foto's nie, en vind nie pale, kantsteine of pype uit eie beweging nie.

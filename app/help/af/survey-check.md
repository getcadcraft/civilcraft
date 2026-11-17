---
title: Kontroleer 'n opmetingstekening by invoer
summary: Lees hoogtes wat as teks of in blokkenmerke geskryf is as opmetingspunte, en kontroleer 'n DWG of DXF vir verkeerde eenhede, geen koördinaatstelsel nie, 'n ver oorsprong, plat kontoerlyne, vreemde hoogtes en dubbele punte voordat jy grond daaruit bou.
keywords: opmetingskontrole, invoerkontrole, opmetingshoogtes, puntehoogtes, teksthoogtes, hoogtes as teks, kenmerke, eenhede, koördinaatstelsel, ver van oorsprong, kontoerlyne op nul, uitskieters, dubbele punte, probleme, landskapargitek, opmetingstekening
from: d46acd24
---

'n Opmetingstekening kan reg lyk en tog verkeerd wees vir 'n grond: sy eenhede mag geraai wees, sy kontoerlyne mag plat by hoogte 0 lê, of sy hoogtes mag as teks geskryf wees wat glad nie geometrie is nie. Die **Opmetingshoogtes en kontrole**-afdeling van die {{ui:Lynwerk}}-dialoog (sien [Maak 'n DWG of DXF oop as lynwerk](topic:open-dwg-dxf)) lees daardie hoogtes en vertel jou wat verkeerd lyk voordat iets bygevoeg word.

## Hoogtes as teks of in kenmerke

Baie opmetingstekeninge gee 'n puntehoogte as 'n klein teks langs 'n kruisie, soos `104.37` of `EL 104.37`, of as 'n kenmerk van 'n puntblok. Hulle is nie lyne nie, so die lynwerk-leser laat hulle uit. Die afdeling lys hoeveel dit gevind het en laat jou toe om hulle as **opmetingspunte** te neem:

1. Merk **Neem … hoogtes as opmetingspunte**. Hulle begin ongemerk, omdat nie elke getal in 'n tekening 'n hoogte is nie.
2. Teks word gelees wanneer dit op sy eie 'n hoogte is: 'n getal met 'n desimale deel (`104.37`, `+104,37`, `-3.50`), of 'n getal ná `EL`, `ELEV`, `RL`, `FFL`, `GL`, `TW`, `BW`, `INV`, `Z` of `LEVEL`, met 'n opsionele `m`, `ft` of `'` daarná. 'n Heel getal alleen (`12`) word as 'n erf- of bladnommer gelees, nie as 'n hoogte nie; teks soos `GATE 3` of 'n datum word nooit gelees nie. Teksformateringskodes word geïgnoreer.
3. Vir blokkenmerke, kies **Blokkenmerk wat die hoogte bevat**. CivilCraft vind 'n etiket soos ELEV, Z, LEVEL of RL self; kies 'n ander uit die lys as die tekening sy eie gebruik. Die keuse word vir daardie lêernaam op hierdie rekenaar onthou, so oopmaak weer begin by dieselfde etiket. 'n Etiket wat jy kies, neem ook heel getalle as hoogtes.
4. Klik {{ui:Voeg by}}. Die punte word genommer ná die hoogste nommer in die projek, elke punt word beskryf met sy laag (of sy blok), en die hoogtes word na die projek se eenhede omgeskakel soos die res van die tekening. Alles is een stap: {{key:Mod+Z}} haal die punte weg.

Teks sit by sy eie invoegpunt (of sy belyningspunt as hy een het). Teks binne blokke word nie gelees nie, en die tekening word nooit verander nie.

## Die kontrole

Die kontrole loop op wat jy op die punt staan om in te bring, en lys wat dit vind, een lyn vir elke soort probleem:

| Dit sê | Wat dit beteken |
|---|---|
| **Eenhede nie gestel nie** | Die tekening sê nie wat sy eenhede is nie, so sy getalle word as die projek se eenhede gelees. Kontroleer een afstand wat jy ken. |
| **Eenhede omgeskakel** | Die tekening se eenhede verskil van die projek s'n en word geskaal ('n nota, nie 'n fout nie). |
| **Die data strek oor … km** of **… m** | Die omvang is groter as 200 km of kleiner as 'n halwe meter, wat gewoonlik die verkeerde eenheid beteken (millimeter wat as meter gelees word, of andersom). |
| **Geen koördinaatstelsel nie** | Die projek het geen nie. Dit is 'n waarskuwing wanneer die data ver van nul lê, soos staatsvlak- of nasionale roosterkoördinate. Sien [Koördinaatstelsels](topic:coordinate-systems). |
| **Ver van die oorsprong** | Die data lê meer as 100 km van nul. Ver van nul verloor 3D-aansigte en uitvoere presisie en skud. |
| **Kontoerlaag … het geen hoogte nie** | 'n Laag met 'n naam soos kontoere (TOPO, CONT, CNTR, CONTOUR) hou lyne op hoogte 0, so 'n grond wat daaruit gebou word, sou plat wees. |
| **Hoogtes presies 0** | Sommige hoogtes is 0 terwyl die tipiese hoogte ver daarvan af is: waarskynlik ontbrekende hoogtes. |
| **Hoogtes ver van die res** | 'n Paar hoogtes lê ver buite die ander (gemeet teen die middel van alle hoogtes, so 'n steil terrein met 'n wye reeks word nie gemerk nie), of bo 9,000 m of onder -11,000 m. |
| **Punte bo-op 'n ander punt** | Twee punte op dieselfde plek met dieselfde hoogte, of met verskillende hoogtes. |

Nadat jy op {{ui:Voeg by}} klik, gaan dieselfde lyne na **Probleme**, een vir elke soort, met die lêernaam, sodat jy later daarna kan terugkom. Die kontrole oordeel die tekening; dit verander niks daarin nie, en dit verhoed nie dat jy die tekening gebruik nie.

:::tip
Wanneer die kontrole sê kontoere is plat by 0 en daar is hoogtes wat as teks geskryf is, neem die hoogtes as opmetingspunte: hulle dra dikwels die werklike hoogtes wat die kontoerlyne nie het nie.
:::

## Wat nie gekontroleer word nie

Die kontrole vergelyk die tekening nie met 'n tweede opmeting nie, en dit kan nie sê in watter koördinaatstelsel die tekening is nie: dit sê net dat geen gestel is nie.

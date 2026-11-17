---
title: Maak 'n DWG of DXF oop as lynwerk
summary: Maak 'n tekening se lynwerk op die plan oop, laag vir laag, gebruik sy kontoere, 3D-polilyne en geslote omtrekke vir die oppervlak, en draai sy puntblokke in opmetingspunte om.
keywords: opmetingskontrole, teksthoogtes, dwg, dxf, cad, tekening, lynwerk, kontoere, breeklyne, grens, polilyn, 3D-polilyn, lae, basiskaart, topo, opmetingstekening, blokke, blokverwysings, opmetingspunte uit blokke, eienskappe, puntblokke, invoegpunt
from: da0f4c58
---

'n Topografiese opmeting kom dikwels as 'n tekening: kontoere as polilyne op hul hoogte, breeklyne as 3D-polilyne, die terreinomtrek as 'n geslote polilyn. CivilCraft maak die tekening se **modelruimte** oop as lae op die plan, en kan daardie lyne direk in die oppervlak omskep.

## Maak die tekening oop

1. Klik op {{ui:Lynwerk}} in die **Oppervlak**-groep (of {{ui:Maak oop}}, of sleep die lêer op die plan) en kies 'n `.dwg`- of `.dxf`-lêer. Die tekening word op hierdie rekenaar gelees; niks word opgelaai nie. DWG van 2000 tot 2018 en ASCII-DXF word gelees.
2. Die **Lynwerk**-dialoog lys die tekening se lae wat lyne, geslote vorms of punte bevat, en of hulle **hoogtes** het. Lae wat in die tekening af is, begin ongemerk. Teks, arserings, afmetings en ander voorwerpe wat nie lynwerk is nie, word getel en weggelaat (die dialoog sê watter).
3. Kontroleer **Tekeningeenhede**. Wanneer die tekening sy eenhede sê, skakel CivilCraft hulle om na die projek se eenhede (millimeter na meter, meter na voet, duim na voet). 'n Tekening in voet word as VSA-opmetingsvoet gelees sonder skalering: die twee verskil met 2 dele per miljoen, en om staatsvlakkoördinate daarmee te skaleer, sou hulle met voet verskuif. Wanneer die tekening nie sy eenhede sê nie, word sy getalle in die projek se eenhede gelees; kies die regte eenhede in die lys as hulle nie reg is nie.
4. In **Gebruik vir die oppervlak**, kies wat elke laag aan die oppervlak gee (of laat **Wys net dit**). Lae wat na kontoere genoem is (TOPO, CONT, CNTR) en hoogtes het, begin as breeklyne.
5. Klik {{ui:Voeg by}}. Die lae verskyn onder **GIS-lae** in die linkerpaneel; elke gebruik word in die oppervlak geplaas. Elke deel is 'n stap op sy eie: {{key:Mod+Z}} neem hulle een vir een terug.

## Wat elke soort laag kan gee

| Die laag bevat | Gebruik vir die oppervlak |
|---|---|
| Kontoere (polilyne op 'n hoogte) | Breeklyne op die lyne se eie hoogte, of op die ELEV-veld |
| 3D-polilyne | Breeklyne op hul eie hoogtes |
| 'n Geslote omtrek | Die oppervlakgrens (die grootste geslote vorm, of die een wat jy gekies het) |
| Punte met 'n hoogte | Opmetingspunte, beskryf met die laagnaam |
| Lyne op hoogte 0 (plan-lynwerk) | Niks: dit bly op die plan as 'n basistekening |

'n Tekening wat CivilCraft geskryf het, hou sy kenmerklyne as 3D-polilyne wat hul boë onthou. Die dialoog wys dan **Kenmerklyne**: laat dit gemerk om hulle as kenmerklyne met hul boë en gebruike terug te bring (een ontdoenstap), of ontmerk dit om hulle as lynwerk soos enige ander laag te lees.

Later kan jy {{ui:Gebruik vir die oppervlak}} in die laag se kieslys onder **GIS-lae** gebruik om dieselfde te doen vir 'n laag wat jy net gewys het.

## Opmetingspunte uit blokke

Opmetingstekeninge dra dikwels hul punte as blokke: 'n klein simbool by elke skoot, met eienskappe vir die puntnommer, die beskrywing en die hoogte. Wanneer die tekening blokverwysings het, het die dialoog 'n **Opmetingspunte uit blokke**-afdeling:

1. Merk die blokke wat jy wil neem (die tabel sê hoeveel verwysings elk het, op watter lae, en watter eienskappe), of merk lae om elke blokverwysing daarop te neem.
2. Kies waar elke punt se **nommer**, **beskrywing** en **hoogte** vandaan kom: 'n eienskap, die blok se of die laag se naam, die volgende vrye nommers, of die invoegpunt se Z. CivilCraft begin by die waarskynlike eienskappe (PT, DESC, ELEV en soortgelyk), en neem die hoogte uit 'n eienskap slegs wanneer die blokke op nul sit.
3. Ontmerk die lynwerk-lae as jy net die punte wil hê, en klik dan {{ui:Voeg by}}.

Elke verwysing word een opmetingspunt by sy invoegpunt. Slegs verwysings wat in modelruimte geplaas is, tel; blokke wat binne ander blokke genes is, tel nie. Nommers wat reeds in die projek is, of twee keer in die tekening gebruik word, kry nuwe nommers na die hoogste, en 'n hoogte-eienskap wat nie 'n getal is nie, laat daardie punt sonder 'n hoogte; die statusreël tel albei. Die tekening word nooit verander nie, en elke punt onthou sy blok: sy Eienskappe wys **Van blok** met die blok, laag en handvatsel. Die byvoeging van die punte is een stap, so {{key:Mod+Z}} neem almal weg.

## Hoogtes geskryf as teks, en die kontrole

Plekhoogtes wat as teks geskryf is (of in 'n blokeienskap wat nie 'n opmetingspuntblok is nie) is nie lynwerk nie. Die **Opmetingshoogtes en kontrole**-afdeling kan hulle as opmetingspunte neem, en lys wat verkeerd lyk met die tekening: eenhede, koördinaatstelsel, afstand van nul, plat kontoere, vreemde hoogtes, dubbele punte. Sien [Kontroleer 'n opmetingstekening by invoer](topic:survey-check).

## Hoe die tekening gelees word

- Boë, sirkels, ellipse, geboë polilynsegmente en splines word kort reguit stukke (elke 5° op die meeste).
- Blokverwysings word getekend waar hulle geplaas is, genesde blokke ook; wat 'n blok op laag 0 hou, neem die verwysing se laag.
- Voorwerpe wat in 'n ander vlak geteken is ('n ander ekstrusierigting), word in wêreldkoördinate geplaas.
- Elke voorwerp kry drie velde: LAYER, TYPE (die voorwerptipe) en ELEV (sy hoogte wanneer al sy punte een deel).
- Koördinate word soos hulle is geneem: die tekening moet dieselfde koördinate as die projek gebruik (byvoorbeeld dieselfde staatsvlak-sone). Gekoppelde tekeninge (xrefs) word nie oopgemaak nie: maak hulle op hul eie oop.

:::tip
'n Kontoertekening gee die beste oppervlak met 'n paar plekhoogtes op heuwels en in holtes, waar kontoere alleen plat driehoeke laat. Voeg hulle by as opmetingspunte, of uit 'n puntlaag in die tekening.
:::

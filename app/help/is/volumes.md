---
title: Jarðvinnurúmmál
summary: Lestu skurð, fyllingu og nettórúmmál milli núverandi lands og mótaðs yfirborðs, fyrir hvern flöt og vegarbelti og samtals, og skildu rúmnetsaðferðina að baki þeim.
keywords: rúmmál, jarðvinna, skurður, fylling, nettó, skurður og fylling, magntölur, rúmnetsaðferð, samanburður yfirborða, rúmmálsyfirborð, rúmyardar, rúmmetrar
from: 299d7bc7
---

Um leið og flötur eða vegarbelti mótast án vandamála ber CivilCraft saman tillöguyfirborðið við núverandi land og skilar skurði og fyllingu. Tölurnar uppfærast við hverja breytingu.

## Hvar á að lesa þær

- **Jarðvinna** í hægra spjaldinu þegar ekkert er valið (**Verkefni**-sýnin), þegar það er að minnsta kosti einn flötur eða eitt vegarbelti.
- **Jarðvinna** í hægra spjaldinu þegar flötur er valinn (sömu samtölur fyrir allt verkefnið).
- Línan undir stillingum vegarbeltis, með eigin skurði og fyllingu þess.

**Jarðvinnu**-reiturinn sýnir:

- **Skurð**, **Fyllingu** og **Nettó** (með „fylling“ eða „skurður“ á eftir, hvort sem er stærra)
- línu fyrir hvern lið þegar þeir eru fleiri en einn, til dæmis „Flötur 1: skurður 120.4 cu yd, fylling 310.2 cu yd“
- aðferðarlínuna: „Rúmnetsaðferð: núverandi land og mótaða yfirborðið sýnd á 0.5 ft fresti innan dagsljóslínanna (92,891 reitir). Engin þensla né samdráttur reiknuð.“

Rúmmál eru í rúmyardum í fetaverkefni og rúmmetrum í metraverkefni.

## Senda þær í TakeoffCraft

Til að verðleggja jarðvinnuna skaltu velja {{ui:Senda í TakeoffCraft}} neðst í **Jarðvinnu**-reitnum. CivilCraft vistar magnskrá (`<site>.quantities.json`) með tveimur magntölum: skurði og fyllingu, í rúmyardum (fetaverkefni) eða rúmmetrum (metraverkefni), sömu tölum og í reitnum, að hundraðshluta. Opnaðu hana í TakeoffCraft með **Opna magntöku**, eða dragðu hana þangað: þær verða tveir liðir sem þú getur verðlagt ([Skurður og fylling úr CivilCraft](app:takeoffcraft/earthwork#cut-and-fill-from-civilcraft)). Sendu aftur eftir breytingu og opnaðu nýju skrána: sömu liðir taka nýju tölurnar.

Aðeins samtölur eru sendar, þannig að ekkert er talið tvisvar; athugasemd skráarinnar telur upp skurð og fyllingu hvers flatar og vegarbeltis fyrir sig.

## Hvernig þær eru reiknaðar

CivilCraft notar **rúmnetsaðferðina**:

1. Net ferkantaðra reita er lagt yfir svæðið innan allra dagsljóslína.
2. Í miðju hvers reits eru bæði yfirborðin sýnd.
3. Hver reitur telst sem prisma: mismunurinn í hæð sinnum flatarmál reitsins. Þar sem tillöguyfirborðið er lægra er það skurður; hærra, fylling.
4. Reitirnir eru lagðir saman.

Stærð reitanna er valin fyrir þig þannig að rétthyrningurinn utan mótuðu svæðanna hafi um 250,000 reiti, ávalinn að snyrtilegu gildi (1, 2 eða 5 sinnum veldi af tíu). Þú getur ekki stillt hana ennþá. Aðferðarlínan segir þér stærð og fjölda reita. Smærri reitir eru nákvæmari við jaðrana; á heilum reitum milli flatra planna er niðurstaðan nákvæm.

## Atriði til að vita

- Aðeins svæðið innan dagsljóslína er talið. Land utan þeirra er óbreytt.
- Flötur eða vegarbelti með vandamál er ekki mótað inn og bætir engu við. Ef reiturinn segir „Engin rúmmál enn: flötur þarf að mótast án vandamála.“, leitaðu að rauðum reit fyrir ofan hann.
- Þar sem liðir skarast hefur sá síðari komið í stað þess fyrri innan dagsljóslínu sinnar, og skörunin er talin einu sinni.
- Enginn þenslu- eða samdráttarstuðull er notaður. Margfaldaðu niðurstöðurnar handvirkt ef þú þarft rúmmál í jörðu, lausu eða þjöppuðu.
- Yfirborðsjarðvegur, dýpt slitlags og undirlags og TIN-í-TIN prismarúmmál eru ekki tiltæk ennþá.

## Athuga niðurstöðu

- Kveiktu á {{ui:Tillaga (mótuð)}} undir **Birting** og skoðaðu hæðarlínurnar innan dagsljóslínanna.
- Færðu bendilinn yfir mótaða svæðið: stöðustikan sýnir **Land** og **Mótað**. Munurinn er skurðar- eða fyllingardýptin á þeim stað.
- Fyrir vegarbelti sýnir álestur langsniðssýnarinnar skurð eða fyllingu á miðlínunni við hverja stöð.

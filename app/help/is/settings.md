---
title: Stillingar CivilCraft
summary: Veldu dálkaröð fyrir afrituð og límd punktalínur og fyrir getgátur um dálka skráar, hvernig límdir punktar fá númer, hvað merkingar punkta sýna, hornvísinn, lóðrétta ofhækkun í 3D, hvernig breiddar- og lengdargráður birtast og hvort kortalög koma af netinu.
keywords: stillingar, kjörstillingar, dálkaröð, pnezd, penzd, dálkaröð punkta, endurnúmera, punktanúmer, byrjunarnúmer, merkingar punkta, merkimiðar, lýsing, hæð, útsýniskubbur, ásatákn, hornvísir, áttaviti, lóðrétt ofhækkun, 3d, breiddargráða, lengdargráða, gráður mínútur sekúndur, tugabrot gráður, kortalög, net, persónuvernd
from: 64b9cb92
---

Opnaðu {{ui:Stillingar}} með gírtákninu í forritastikunni eða {{key:Mod+,}}. Fyrsti flipinn, {{ui:CivilCraft}}, geymir stillingarnar sem tilheyra þessu forriti; {{ui:Almennt}} geymir þær sem öll CadCraft-forrit deila (þema, verkfærastika, spjöld). Stillingar CivilCraft eru aðeins til í forritinu: þú breytir þeim hér, og þessi vafri man þær. {{ui:Endurstilla stillingar CivilCraft}} setur allar stillingar aftur í upphafsstöðu.

## Punktalínur

**P, N, E, Z, D** (upphafið) eða **P, E, N, Z, D**: punktur, norður, austur, hæð, lýsing, eða austur á undan norðri. Þetta er notað á þremur stöðum:

- **Afrita**: línurnar sem CivilCraft setur á klippiborðið fyrir töflureikni.
- **Líma**: línur límdar úr töflureikni eða textaskrá sem hafa enga hausröð.
- **Flytja inn**: getgátan í glugganum **Flytja inn punkta** þegar skrá hefur enga hausröð (skrá með fjórum dálkum er lesin sem PENZ, þremur sem ENZ). Sjá [Skráarsnið punkta](topic:point-file-formats).

Hausröð sem nefnir dálkana sína hefur alltaf forgang, og það sama gildir um val í **Dálkum** í innflutningsglugganum.

## Númer fyrir límda punkta

- **Halda lausum númerum** (upphafið): límdur punktur heldur númeri sínu þegar enginn punktur hefur það; aðeins punktar sem skarast fá ný númer.
- **Alltaf ný númer**: sérhver límdur punktur fær nýtt númer, jafnvel þótt hans eigið sé laust.

**Ný númer byrja við**: skildu eftir tómt til að telja áfram frá einu hærra en hæsta númer í notkun. Skrifaðu númer, til dæmis 5000, til að gefa nýjum punktum númer frá 5000 og áfram; númer í notkun eru sleppt. Tveir punktar deila aldrei númeri hvort sem er. Sjá [Veldu, afritaðu og límdu mælingarpunkta](topic:copy-paste-points#point-numbers-never-clash).

## Merkingar punkta

Hvað merking punkts sýnir þegar {{ui:Merkingar punkta}} er kveikt undir **Birting**: **Númer**, **Númer og hæð**, eða **Númer, hæð og lýsing** (upphafið). DXF-, DWG- og PDF-útflutningur sýnir sömu merkingar og á skjánum.

## Hornvísir

Það sem situr í horni grunnmyndarinnar og 3D-sýnarinnar: **Útsýniskubbur** (upphafið), **Ásatákn** eða **Ekkert**.

- **Útsýniskubbur** (efst hægra megin). Á grunnmynd sýnir hann efri hlið, með áttavitahringnum: N er rúmnorður (upp á grunnmyndina). Smelltu á aðra hlið, brún eða horn kubbsins, eða dragðu hann, og [3D-sýnin](topic:site-3d) opnast og horfir þaðan. {{ui:Heim}} á kubbi grunnmyndarinnar passar grunnmyndina.
- Í 3D-sýninni snýst kubburinn með sýninni: smelltu á hlið, brún eða horn til að horfa þaðan, dragðu kubbinn til að snúast um hann, dragðu áttavitahringinn til að snúa um lóðrétta ásinn, smelltu á bókstaf til að horfa frá þeirri hlið, og notaðu {{ui:Heim}} fyrir ísó-sýn á allt svæðið. Þegar þú horfir beint á hlið færa litlar örvar þig yfir á næstu hlið og bognar örvar snúa sýninni fjórðung.
- **Ásatákn** (neðst vinstra megin): lítið X (austur) og Y (norður) merki á grunnmyndinni, X, Y og Z (upp) í 3D.

## Lóðrétt ofhækkun í 3D

Hversu mikið 3D-sýnin teygir hæðir: **1×**, **2×** (upphafið), **3×**, **5×** eða **10×**. Listinn á stiku 3D-sýnarinnar er sama stilling, þannig að breyting á öðru breytir báðu. Rúmmál, langsnið og 3D-útflutningur haldast í réttum mælikvarða.

## Breiddar- og lengdargráður

Hvernig stöðustikan sýnir breiddar- og lengdargráðu bendilsins þegar verkefnið hefur hnitakerfi: **gráður, mínútur og sekúndur** (upphafið, til dæmis `30°18′00.00″ N`) eða **tugabrot gráður** (`30.300000° N`). Sjá [Stilltu hnitakerfi verkefnisins](topic:coordinate-systems#latitude-and-longitude-in-the-status-bar).

## Kortalög af netinu

**Slökkt** (upphafið) eða **Kveikt**. Þegar kveikt er biður CivilCraft kortaþjónana sem þú bætir við um myndir af svæðinu á skjánum. Teikningin þín er áfram á þessari tölvu; þjónninn sér svæðið og netfang þitt. Meðan slökkt er er enginn kortaþjónn beðinn um neitt, jafnvel þótt verkefni sem þú opnar nefni einn; georeferenced mynd úr skrá virkar hvort sem er. Sjá [Sýndu kortalög undir grunnmyndinni](topic:map-layers).

## Gervigreindaraðstoðarmenn

**Leyfa gervigreindaraðstoðarmönnum og skriftum að nota CivilCraft** (slökkt í upphafi) leyfir aðstoðarmanni á tölvunni þinni að ná í opna lóðina í gegnum CadCraft Studio: **Lesa** lýsir lóðinni og gefur punkta, yfirborðshæðir, stöðvar, snið, rúmmál og lóðir; **Breyta** leyfir honum að velja og bæta við mælingarpunktum; **Vista** og **Flytja út** leyfa honum að vista verkefnið og skrifa LandXML eða DWG. **Möppur sem það má nota** (í Studio) eru þær þar sem það má vista og flytja út. **Virkni** skráir köll þess. Sjá [Láttu gervigreindaraðstoðarmann vinna með svæðið þitt](topic:assistants).

---
title: Láttu gervigreindaraðstoðarmann vinna með svæðinu þínu
summary: Kveiktu á aðstoðarmönnum í Stillingum svo aðstoðarmaður í tölvunni þinni geti lesið opna svæðið (punkta, yfirborð, rúmmál, langsnið, lóðir), bætt við mælipunktum, vistað og flutt út LandXML eða DWG, í gegnum CadCraft Studio. Slökkt þar til þú kveikir á því.
keywords: gervigreind, aðstoðarmaður, mcp, handrit, sjálfvirkni, studio, punktar, hæð, stöð, frávik, veglína, rúmmál, skurður, fylling, langsnið, lóð, landxml, dwg, usd, möppur, heimildir, aftengja, virkni
from: d0356582
---

## Það sem þú lærir

Hvernig þú getur látið gervigreindaraðstoðarmann (hvaða aðstoðarmann sem talar MCP) vinna með svæðinu sem þú hefur opið, hvað hann getur og getur ekki gert, og hvernig þú stöðvar hann.

## Það sem aðstoðarmaður getur gert í CivilCraft

| Hann biður um | Það sem hann fær | Þarf |
|---|---|---|
| Svæðið | Heiti, einingar, hnitakerfi, punktahópa, veglínur, yfirborð, palla, lóðir og pípur | Lesa |
| Mælipunkta | Númer, austur, norður, hæð og lýsingu, eftir hópi, eftir lýsingu eða innan reits | Lesa |
| Hæðir yfirborðs | Núverandi landið (eða mótaða yfirborðið) á hvaða punktum sem hann nefnir | Lesa |
| Stöðvar og frávik | Stöð og frávik punkta meðfram veglínu, eða hnit og landhæð stöðva | Lesa |
| Langsnið | Land-, hönnunar- og mótaða yfirborðshæð meðfram veglínu, á hverjum fjölda feta eða metra | Lesa |
| Skurð og fyllingu | Rúmmál milli núverandi lands og mótaðs yfirborðs (sömuleiðis hvers palls og vegstæðis), eða milli lands og flatar | Lesa |
| Lóðir | Hornpunkta, flatarmál (með ekrum eða hekturum), ummál og lagalega lýsingu | Lesa |
| Val | Punktarnir sem hann nefnir eru valdir á grunnmyndinni, eins og þú hefðir valið þá | Breyta |
| Nýja mælipunkta | Punkta bætta við með númerunum sem hann gefur, eða þeim næstu lausu. Hvert kall er eitt skref sem þú getur afturkallað | Breyta |
| Vistun | Eigin {{ui:Vista}} CivilCraft | Vista |
| LandXML eða DWG | Sömu skrár og hnapparnir {{ui:LandXML}} og {{ui:DWG}} | Flytja út |
| Svæðið í þrívídd | OpenUSD (.usdz, .usda eða .usdc) af landinu, mótuðu yfirborði, pöllum og pípum, eins og þrívíddarskoðunin flytur það út | Flytja út |
| Gróður og gróðuráætlun | Gróður sem finnst í gróðurlistanum undir hvaða heiti sem er, og fjöldi gróðuráætlunarinnar | Lesa |
| Gróðursetningu og mótun | Gróður, beð eða limgerði sett, eða pallur, jarðbrún, skurður eða mótunarsvæði bætt við, hvert skref sem þú getur afturkallað, með skurði og fyllingu | Breyta |
| Áveituathugun | Flæði hvers svæðis, þrýstingur sem þarf við loka þess og við veituna, hámarksþrýstihæð í versta falli, keyrslutímar, vandamál og efnisskrá, sem reiknihjálp sem áveituhönnuður yfirfer | Lesa |

Hann vinnur með svæðinu sem er opið. Í Studio getur hann einnig vistað og flutt út í möppur sem þú velur (hér fyrir neðan); án möppu fara skrár hans í niðurhal eins og hnappanna.

## Kveiktu á því

Aðstoðarmenn ná til CivilCraft í gegnum CadCraft Studio í tölvunni þinni; venjulegi vafrinn hefur enga leið inn.

1. Opnaðu {{ui:Stillingar}} og veldu flipann **CivilCraft**.
2. Undir **Aðstoðarmenn**, hakaðu í **Leyfa gervigreindaraðstoðarmönnum og handritum að nota CivilCraft**.
3. **Lesa** er hakað fyrir þig. Hakaðu í **Breyta**, **Vista** eða **Flytja út** aðeins þegar aðstoðarmaðurinn þarf þær.
4. Til að leyfa honum að vista og flytja út í möppu, veldu {{ui:Bæta við möppu…}} undir **Möppur sem má nota** og veldu möppuna í valglugga Studio. {{ui:Fjarlægja}} tekur hana til baka strax; önnur slóð er hafnað.
5. Tengdu aðstoðarmanninn í Studio (Studio sýnir slóðina og stillingarnar sem þú límir inn í hann).

## Meðan aðstoðarmaður er tengdur

Athugasemd efst á hægra spjaldinu segir hvaða aðstoðarmaður er tengdur og hvað hann getur. Smelltu á {{ui:Aftengja}} til að ljúka lotu hans strax; hann þarf að tengjast aftur til að halda áfram.

**Virkni**, undir **Aðstoðarmenn** í Stillingum, listar hvert kall sem aðstoðarmaðurinn gerði, nýjast fyrst, með því hvort það heppnaðist.

:::tip
Spurðu með venjulegum orðum, til dæmis „hver er landhæðin á 50 feta fresti eftir Aðalstræti?“, „hversu mikið skurð og fyllingu þurfa pallarnir?“ eða „bættu við stjórnpunkti á þessum hnitum“. Aðstoðarmaðurinn les svæðið og svarar, eða gerir breytinguna sem eitt skref sem þú getur afturkallað.
:::

## Án þess að opna CivilCraft

Skráarþjónninn fyrir aðstoðarmenn CadCraft (`npx @getcadcraft/mcp`) og skipanalínan `cadcraft` opna vistuð CivilCraft-verkefni (`.civilcraft.json`) og punktaskrár með kóða CivilCraft sjálfs, án glugga: sömu lestrarverkfæri, bæta við punktum, vista verkefnið, LandXML og svæðið í þrívídd sem OpenUSD. `cadcraft convert site.civilcraft.json site.xml` skrifar LandXML úr skipanalínunni. Að opna LandXML, DWG-útflutning og verkfæri Landscape-vinnusvæðisins þurfa enn glugga CivilCraft.

## Slökktu á því

Afhakaðu **Leyfa gervigreindaraðstoðarmönnum og handritum að nota CivilCraft**. Sérhver aðstoðarmaður er aftengdur strax, og stillingin er geymd fyrir næst.

## Sjá einnig

- [Uppskriftir fyrir gervigreindaraðstoðarmenn](common:assistants-recipes): dæmi, hvert með þeim verkfærum sem það kallar á.
- [Hanna lárétta veglínu](topic:alignment)
- [Byggja og betrumbæta yfirborðið](topic:build-surface)
- [Velja, afrita og líma mælipunkta](topic:copy-paste-points)
- [Stillingar CivilCraft](topic:settings)

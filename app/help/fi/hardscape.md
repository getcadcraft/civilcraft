---
title: Päällystykset, seinät ja portaat
summary: Päällystys kaltevuuksineen kuivatukseen tai poikittaiskaltevuuteen, kuvio ja rakennekerrokset; maanpinnan mukaan kulkevat polut; tukimuurit ja vapaasti seisovat muurit porrastetuin perustuksin; reunakivet; rampit ja portaat tarkistettuina rajoihinsa; IFC-vienti.
keywords: kovat pinnat, päällystys, laatoitus, patio, terassi, kaltevuus, kuivatuskaivo, poikittaiskaltevuus, silakkakuvio, lohkosidonta, polku, käytävä, tukimuuri, puutarhamuuri, perustus, harjakivi, reunakivi, reunus, ramppi, esteettömyys, portaat, askelmat, nousu, tasanne
from: 51475877
---

Kovat pinnat lasketaan maanpinnasta aina uudelleen, joten ne seuraavat maastoa ja rakentuvat uudelleen, kun maanpinta tai sen linja muuttuu. Vedä kulmia suunnitelmalla kuten mitä tahansa viivaa. Avaa se valinnalla {{ui:Kovat pinnat}} Maisema-ryhmästä.

## Päällystys

Napsauta kulmat ja paina {{key:Enter}}. Ominaisuuksissa:

- **Korkeustaso**: tyhjä = sen alla olevan maanpinnan keskiarvo.
- **Kaltevuudet**: taso, **poikittaiskaltevuus** (prosentti tiettyyn suuntaan) tai **kuivatuskaivoon**: CivilCraft pyytää napsauttamaan, mihin kaivo tulee, minkä jälkeen jokainen kulma nousee kaivosta kaltevuudella. Nuolet suunnitelmalla näyttävät kaltevuudet.
- **Kuvio** (ruudukko, lohkosidonta, silakkakuvio) yksikkökokoineen, saumoineen ja kulmineen; **Reunus**-leveys. Arkilla alle millimetrin päässä toisistaan olevat saumat jätetään pois.
- Päällystys on osa suunniteltua pintaa. Sen kerrokset (laatat, pohjamateriaali, kantava kerros) menevät IFC:hen ja määriin.

## Polut

Napsauta polun varrella ja paina {{key:Enter}}. Polku seuraa maanpintaa, ja sen **Poikittaiskaltevuus** on oikealla puolellaan. Polku, joka on jyrkempi kuin **Suurin sallittu kaltevuus**, merkitään suunnitelmalle `!`-merkillä siinä kohdassa, ja ominaisuudet kertovat, kuinka jyrkäksi se käy.

## Seinät

Napsauta seinän varrella ja paina {{key:Enter}}. Seinä on **tukimuuri** tai **vapaasti seisova**. Ilman **Yläpintaa** se nousee **Korkeus**-matkan verran maanpinnan yläpuolelle koko matkalta; kirjoita yläpinta, jos haluat pitää sen tasaisena. Sen **perustus** on asetetun syvyyden verran maanpinnan alla ja porrastuu kokonaisin askelmin, joten se pysyy tasaisena askelmien välillä. Ominaisuudet kertovat seinän pituuden, korkeudet, seinäpinnan alan ja perustuksen askelmat; suunnitelman merkinnät näyttävät seinän yläpinnan ja alapinnan (TW / BW) kummassakin päässä.

:::warning
Tukimuuri, joka on korkeampi kuin 1.2 m (4 ft), merkitään: insinööri suunnittelee sen.
:::

## Reunakivet

Napsauta reunakiven varrella ja paina {{key:Enter}}; aseta sen leveys ja ulkonevuus.

## Rampit

Napsauta alhaalta ylös ja paina {{key:Enter}}. Tasot tulevat kummankin pään maanpinnasta, ellei kirjoita niitä itse. Ramppiin tulee tasanne joka 750 mm (2.5 ft) nousua, ja sitä tarkistetaan **Suurin sallittu kaltevuus** -arvoa (aluksi 1:12) ja vähimmäisleveyttä vasten; ominaisuudet kertovat, kuinka pitkä sen pitäisi olla.

## Portaat

Napsauta alimman askelman etureunaa, sitten kohtaa, jossa portaat yltävät yläpintaan, ja paina {{key:Enter}}. Nousujen määrä tulee korkeudesta ja **Suurin nousu** -arvosta; astinleveys tulee mukavuussäännöstä 2R + G ≈ 630 mm, eikä se koskaan ole pienempi kuin **Pienin astinleveys**; tasanne tulee aina, kun porrassarjassa on **Nousuja porrassarjassa enintään** -määrä nousuja. Ominaisuudet kertovat, mahtuvatko portaat kahden pisteen väliin vai kuinka paljon pidemmät ne tarvitsevat.

:::note
Rampien ja portaiden rajat ovat nimettyjä oletusarvoja. Aseta ne, joita rakennusmääräyksesi vaatii.
:::

## CivilCraftin ulkopuolelle

- Lisää › {{ui:Vie maisema-IFC}}: päällystykset ja polut `IfcPavement`-elementteinä, seinät `IfcWall`-elementteinä (tukimuurit RETAININGWALL-tyyppisinä) kerroksineen, reunakivet `IfcKerb`-elementteinä, rampit `IfcRamp`-elementteinä ja portaat `IfcStair`-elementteinä nousuineen ja askelmineen.
- Kasvilistan **Lähetä TakeoffCraft** -toiminto vie mukanaan päällystysalat ja kerrostilavuudet, seinäpintojen alat ja pituudet, reunakivien pituudet sekä askelmien määrät.
- Yksityiskohtapiirustus piirtää kunkin seinän poikkileikkauksen, kunkin päällystyksen rakenteen ja kunkin porrassarjan. Katso [Maisemapiirustukset](topic:landscape-sheets).

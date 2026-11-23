---
title: Päällysteet, seinät ja portaat
summary: Päällyste, jossa on kaltevuudet viemäriin tai poikkikaltevuus, kuvio ja sen rakenne; maanpinnan mukaan kulkevat polut; tukimuurit ja vapaasti seisovat muurit portaittaisilla perustuksilla; reunakivet; rampit ja portaat, joita verrataan niiden rajoihin; IFC-vienti.
keywords: kovat pinnat, päällyste, kivetys, patio, terassi, kaltevuudet, viemäri, poikkikaltevuus, silakkaruoto, pitkittäissidos, polku, kulkureitti, tukimuuri, puutarhamuuri, perustus, muurin harja, reunakivi, reunus, ramppi, esteettömyys, portaat, nousut, askelmat, välitaso
from: d34b4466
---

Kovat pinnat lasketaan uudelleen maanpinnasta joka kerta, joten ne seuraavat maastoa ja laskentaan päivittyvät, kun maanpinta tai sen viiva siirtyy. Vedä sen kulmia pohjapiirroksessa kuten mitä tahansa viivaa. Avaa se Maisema-ryhmän {{ui:Kovat pinnat}}-painikkeesta.

## Päällyste

Napsauta kulmat ja paina {{key:Enter}}. Ominaisuuksissa:

- **Taso**: tyhjä = sen alla olevan maanpinnan keskiarvo.
- **Kaltevuudet**: tasainen, **poikkikaltevuus** (prosentti tiettyyn suuntaan) tai **viemäriin**: CivilCraft pyytää napsauttamaan, mihin viemäri menee, ja sen jälkeen jokainen kulma nousee viemäristä kaltevuudella. Pohjapiirroksen nuolet näyttävät kaltevuudet.
- **Kuvio** (ruudukko, pitkittäissidos, silakkaruoto) yksikkökoon, saumojen ja kulman kanssa; **Reunuksen** leveys. Arkilla saumat, jotka ovat lähempänä kuin millimetri, jätetään pois.
- Päällyste on osa suunniteltua maastomallia. Sen kerrokset (kivet, alusta, kantava kerros) menevät IFC-malliin ja määriin.

## Polut

Napsauta polun varrella ja paina {{key:Enter}}. Polku seuraa maanpintaa, ja sen **poikkikaltevuus** on oikealla puolella. Polku, joka on jyrkempi kuin **Suurin sallittu kaltevuus**, merkitään pohjapiirrokseen `!`-merkillä kohdassa, jossa se on, ja Ominaisuudet kertoo, kuinka jyrkäksi se käy.

Kun polku kohtaa käytävän rakentaman tien, se pysähtyy tien ulkoreunaan, samalle tasolle kävelytien tai piennarin kanssa, suunnitellussa maastomallissa ja 3D-näkymässä. Tien ylittävä polku tasataan ja näytetään kahtena osana, ja pääty, joka on piirretty enintään kaksinkertaisen polun leveyden päähän tiestä, jatketaan reunaan asti. Pohjapiirros näyttää edelleen polun niin kuin piirsit sen, ja sen pituus ja pinta-ala lasketaan koko viivasta. Katso [Pyyhkäise tien käytävä](topic:corridor).

## Muurit

Napsauta muurin varrella ja paina {{key:Enter}}. Muuri on **tukimuuri** tai **vapaasti seisova**. Ilman **Yläreunaa** se seisoo koko matkaltaan **Korkeuden** verran maanpinnan yläpuolella; kirjoita yläreuna, jos haluat pitää sen vaakatasossa. Sen **perustus** on asetetun syvyyden verran maanpinnan alapuolella ja laskee kokonaisin askelin, joten se pysyy vaakatasossa askelten välissä. Ominaisuudet kertovat sen pituuden, korkeudet, pinta-alan ja perustuksen askeleet; pohjapiirroksessa muurin yläreuna ja alareuna (TW / BW) on merkitty kummassakin päässä.

:::warning
Yli 1.2 m (4 ft) korkea tukimuuri merkitään: insinööri suunnittelee sen.
:::

## Reunakivet

Napsauta reunakiven varrella ja paina {{key:Enter}}; aseta sen leveys ja pinnan yläpuolelle ulottuva korkeus.

## Rampit

Napsauta alhaalta ylös ja paina {{key:Enter}}. Tasot tulevat maanpinnasta kummastakin päästä, ellet kirjoita niitä itse. Rampille tulee välitaso joka 750 mm (2.5 ft) nousua kohden, ja sitä verrataan **Suurin sallittu kaltevuus** -arvoon (aluksi 1:12) ja vähimmäisleveyteen; Ominaisuudet kertovat, kuinka pitkä sen pitäisi olla.

## Portaat

Napsauta alimman askelman etureunaa, sitten kohtaa, jossa portaat yltävät ylös, ja paina {{key:Enter}}. Nousujen määrä tulee korkeudesta ja **Suurimmasta noususta**; askelman syvyys mukavuussäännöstä 2R + G ≈ 630 mm, ei koskaan alle **Pienimmän askelman syvyyden**; välitaso joka **Enintään nousuja lennossa**. Ominaisuudet kertovat, mahtuvatko ne kahden pisteen väliin vai kuinka paljon pidemmät ne tarvitsevat.

:::note
Rampien ja portaiden rajat ovat nimettyjä oletusarvoja. Aseta ne, joita rakennusmääräykset vaativat.
:::

## CivilCraftin ulkopuolella

- Lisää › {{ui:Vie maisema-IFC}}: päällysteet ja polut `IfcPavement`-tyyppinä, muurit `IfcWall`-tyyppinä (tukimuurit RETAININGWALL-tyyppinä) kerroksineen, reunakivet `IfcKerb`-tyyppinä, rampit `IfcRamp`-tyyppinä, portaat `IfcStair`-tyyppinä nousuineen ja askelmineen.
- Kasviluettelon **Lähetä TakeoffCraft-sovellukseen** siirtää päällysteen pinta-alat ja kerrostilavuudet, muurien pintojen alat ja pituudet, reunakivien pituudet ja portaiden askelmäärät.
- Yksityiskohtien arkki piirtää kunkin muurin poikkileikkauksen, kunkin päällysteen rakenteen ja kunkin porrasosuuden. Katso [Maisemaarkit](topic:landscape-sheets).

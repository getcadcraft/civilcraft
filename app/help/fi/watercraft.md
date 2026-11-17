---
title: WaterCraft: kysynnät, palovirtaama, katkokset ja veden ikä
summary: WaterCraft-lisäosalla voit muuttaa asiakkaat kysynnäksi vesijohdoillesi, tarkistaa jokaisen paloposti saatavilla olevan virtaaman, nähdä mikä päävesijohdon katkos haittaa eniten sekä seurata veden ikää ja klooria vuorokauden aikana.
keywords: watercraft, vedenjakelu, kysynnät, asiakkaat, huippukerroin, kysyntäkuvio, palovirtaama, paloposti, jäännöspaine, kriittisyys, katkos, venttiilillä erotettu osuus, veden ikä, kloori, jäännös, lähteen jäljitys, umpipää, csv, lisäosa
from: 76809f01
---

WaterCraft on lisäosa, joka toimii vesiverkon kanssa, jonka olet jo piirtänyt vesijohtotyökaluilla. Se lisää oikeanpuoleiseen paneeliin välilehden, jossa on neljä osiota.

:::warning
Pelkkä laskenta-apu. Sitä on tarkistettu käsin lasketuilla vastauksilla keksityissä verkoissa, ei todellisessa vesilaitoksen mallissa. Vesihuoltoinsinöörin on tarkistettava jokainen tulos. Paineenkorotusasemia, toisen asteen hajoamista tai skenaarioita ei ole vielä.
:::

## Mitä teet

- Lisää asiakkaat verkkoon kysyntöinä.
- Etsi paloposti, joiden virtaama jää tarvitsemastasi.
- Etsi päävesijohdot, joiden menetys on merkittävin.
- Etsi vanha vesi ja alhainen kloorimäärä.

## Vaiheet

1. Avaa {{ui:Asetukset}} › {{ui:Lisäosat}} ja kytke päälle {{ui:WaterCraft (vedenjakelu)}}. Oikeanpuoleiseen paneeliin ilmestyy {{ui:WaterCraft}}-välilehti.
2. Piirrä ensin vesijohtotyökaluilla altaat, solmut ja putket (katso [Vesijohdot](topic:water-mains)). Ilman verkkoa välilehti kertoo, että se on tehtävä ensin.
3. Kohdassa {{ui:Kysynnät}} liitä yksi asiakas riviä kohti: tunnus, x, y, tyyppi, määrä. Valitse {{ui:Huippukerroin}} ja {{ui:Tuntikuvio}} (asuinpäivä, liikepäivä, tasainen tai säilytä kuvio sellaisenaan). Paina {{ui:Tarkista}} nähdäksesi, mihin kukin asiakas osuu (lähin solmu), ja sen jälkeen {{ui:Vie verkkoon}}. {{ui:Kumoa}} palauttaa kysynnät.
4. Kohdassa {{ui:Palovirtaama}} aseta tarvittava virtaama ja jäännöspaine, valitse, pidetäänkö jäännöspaine {{ui:Vain paloposteissa}} vai {{ui:Kaikkialla järjestelmässä (tiukempi)}}, ja paina {{ui:Vaakamitta}}. Jokainen paloposti on listattu heikoimmasta alkaen, merkittynä joko täyttyy tai jää alle.
5. Kohdassa {{ui:Mikä päävesijohto on tärkein}} valitse {{ui:yksi putki kerrallaan}} tai {{ui:yksi venttiilillä erotettu osuus kerrallaan}} ja paina {{ui:Vaakamitta}}. Jokaisesta katkoksesta näkyy katkaistu kysyntä, katkaistut solmut, solmut, jotka jäävät uudesti alle vähimmäispaineen, ja jäljelle jäävä alin paine.
6. Kohdassa {{ui:Veden ikä ja kloori}} valitse, mitä seurataan (veden ikä, kloori tai lähteen jäljitys), aseta ajettavat tunnit ja haluamasi rajat ja paina {{ui:Vaakamitta}}. Rajojesi ulkopuoliset solmut on listattu.
7. Säilytä mikä tahansa taulukko painamalla sen alla {{ui:Tallenna CSV:nä}}.

## Huomautuksia

- Tarvittava palovirtaama sekä kulutus per talo tai per eekkeri ovat lähtöarvoja, eivät standardeja. Käytä oman vesilaitoksesi lukuja.
- Venttiilin osittain katkaisema putki suljetaan kokonaan, joten näytetty katkos on hieman todellista pahempi.
- Aja vedenlaatuosio riittävän pitkään, jotta vuorokausikuvio toistuu ennen viimeisen päivän lukemista.
- {{ui:Pysäytä}} lopettaa pitkän ajon aikaisin; lista näyttää silloin vain sen, mitä ehdittiin tehdä.
- Verkkosi pysyy tässä projektissa ja tällä tietokoneella. Mitään ei lähetetä minnekään.

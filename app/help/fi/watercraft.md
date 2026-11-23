---
title: WaterCraft: kysyntä, palovirtaama, katkot ja veden ikä
summary: WaterCraft-lisäosalla muutat asiakkaat vesijohtojesi kysynnäksi, tarkistat jokaisen palopostin käytettävissä olevan virtaaman, näet mikä vesijohtokatko haittaa eniten sekä seuraat veden ikää ja klooria vuorokauden aikana.
keywords: watercraft, vesijakelu, kysyntä, asiakkaat, huippukerroin, kysyntäprofiili, palovirtaama, palopostti, jäännöspaine, kriittisyys, katko, venttiilillinen osuus, veden ikä, kloori, jäännös, lähteen jäljitys, umpipää, csv, lisäosa
from: 066fb17a
---

WaterCraft on lisäosa, joka toimii vesiverkolla, jonka olet jo piirtänyt Vesijohdot-työkaluilla. Se lisää oikeanpuoleiseen paneeliin välilehden, jossa on neljä osiota.

:::warning
Vain laskentaapu. Sitä on verrattu käsin laskettuihin vastauksiin keksityillä verkoilla, ei todellisella yhdyskuntamallilla. Vesi-insinöörin on tarkistettava jokainen tulos. Skenaariot, säätösäännöt, venttiilit ja kenttälukemat ovat omissa aiheissaan, ”Skenaariot” ja ”Tutkimukset”, WaterCraft-lisäosan ohjeessa.
:::

## Mitä teet

- Lisää asiakkaat verkkoon kysyntänä.
- Löydä palopostit, joiden virtaama jää tarvittavan alle.
- Löydä vesijohdot, joiden menetys on eniten haitallinen.
- Löydä vanha vesi ja matala kloori.

## Vaiheet

1. Avaa {{ui:Asetukset}} › {{ui:Lisäosat}} ja kytke päälle {{ui:WaterCraft (vesijakelu)}}. Oikeanpuoleiseen paneeliin ilmestyy {{ui:WaterCraft}}-välilehti.
2. Piirrä ensin altaat, liitoskohdat ja putket Vesijohdot-työkaluilla (katso [Vesijohdot](topic:water-mains)). Ilman verkkoa välilehti kehottaa tekemään sen.
3. Kohdassa {{ui:Kysyntä}} liitä yksi asiakas riviä kohden: tunnus, x, y, laji, määrä. Valitse {{ui:Huippukerroin}} ja {{ui:Tuntiprofiili}} (asuinpäivä, liikepäivä, tasainen tai säilytä profiili sellaisenaan). Paina {{ui:Tarkista}} nähdäksesi, mihin kukin asiakas osuu (lähin liitoskohta), ja sen jälkeen {{ui:Vie verkkoon}}. Kumoa poistaa kysynnät.
4. Kohdassa {{ui:Palovirtaama}} aseta tarvittava virtaama ja jäännöspaine, valitse pidetäänkö jäännöspainetta {{ui:Vain palopostissa}} vai {{ui:Koko järjestelmässä (tiukempi)}} ja paina {{ui:Vaakamitta}}. Jokainen palopostti on luettelossa heikoimmasta alkaen, merkittynä joko ”täyttää” tai ”jää alle”.
5. Kohdassa {{ui:Tärkein päävesijohto}} valitse {{ui:yksi putki kerrallaan}} tai {{ui:yksi venttiilein erotettu osuus kerrallaan}} ja paina {{ui:Vaakamitta}}. Jokainen katko näyttää katkaistun kysynnän, katkaistut liitoskohdat, liitoskohdat, jotka putoavat alle vähimmäispaineen, ja jäljelle jäävän alimman paineen.
6. Kohdassa {{ui:Veden ikä ja kloori}} valitse, mitä seurataan (veden ikä, kloori tai lähteen jäljitys), aseta ajettavat tunnit ja haluamasi rajat ja paina {{ui:Vaakamitta}}. Rajojesi ulkopuoliset liitoskohdat luetellaan.
7. Paina {{ui:Tallenna CSV:nä}} minkä tahansa taulukon alla säilyttääksesi sen.

## Huomautuksia

- Tarvittava palovirtaama ja kulutus kotitaloutta tai eekkeriä kohden ovat aloitusarvoja, eivät standardeja. Käytä vesilaitoksesi omia lukuja.
- Venttiilin osittain katkaisema putki suljetaan kokonaan, joten näytetty katko on hieman todellista huonompi.
- Aja vesilaatuosio riittävän pitkään, jotta päivittäinen profiili toistuu ennen kuin luet viimeisen päivän.
- {{ui:Pysäytä}} lopettaa pitkän ajon aikaisin; luettelo näyttää sen jälkeen vain sen, mikä ehdittiin tehdä.
- Verkkosi pysyy tässä projektissa ja tällä tietokoneella. Mitään ei lähetetä minnekään.

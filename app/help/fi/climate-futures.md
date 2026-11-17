---
title: "Ilmastoskenaariot: 2050 ja 2080 tulva, helle ja metsäpalo"
summary: Osoite kohteeksi -työkalussa nosta kohteen tulvataso tulevaa ilmastoa varten, arvioi metsäpalon altistuminen ja muokkaa säätiedosto, ja esitä nykyhetki ja tulevaisuus rinnakkain aineistopaketista (SSP2-4.5 ja SSP5-8.5, 2050 ja 2080).
keywords: ilmasto, ilmastonmuutos, tulevaisuus, 2050, 2080, ssp, cmip6, skenaario, merenpinta, tulva, perustulvakorkeus, bfe, fema, helle, säätiedosto, epw, morfaus, metsäpalo, maastopalo
from: b0d2ee38
---

Ilmastoluvut tulevat **aineistopaketista**, eivät itse sovelluksesta. Kytke {{ui:Climate futures}} (Ilmastoskenaariot) -lisäosa päälle kohdassa Asetukset › Lisäosat, tai lataa oma pakettitiedosto {{ui:Climate future}} (Ilmastoskenaario) -lohkossa.

:::warning
Lisäosan mukana tuleva paketti on **näyte**: kolme paikkaa (Denver, Miami, Johannesburg), yksi ilmastomalli ja viisi vuotta kussakin 20 vuoden jaksossa. Se on olemassa työkalujen kokeilemiseen, **ei suunnitteluun**. Täysi paketti rakennetaan komennolla `tools/climate/build-pack.mjs` NASAn NEX-GDDP-CMIP6-aineistosta.
:::

## Missä se on

Maastomalli › Lisää › Osoite kohteeksi. Aseta piste, lisää tasot (FEMAn tulvataso antaa perustulvakorkeuden) ja paina painiketta, joka lukee kohteen. Kohteen rivien alla on {{ui:Climate future}} -lohko: valitse **Skenaario** (SSP2-4.5 tai SSP5-8.5) ja **Vuosi** (2050 = 2041-2060, 2080 = 2071-2090, molemmat verrattuna vuosiin 1995-2014). Käytetään paketin lähintä paikkaa tai valitsemaasi paikkaa; kaukana kaikista paikoista käytetään maailmanlaajuisia keskimääräisiä muutoksia, ja paneeli kertoo sen.

## Suunnittelun tulvataso

Nykyinen taso on FEMAn perustulvakorkeus, jos tulvatasolla oli sellainen (jalkoina, NAVD 88), muuten kirjoita oma. Valitse tulvatyyppi (rannikko, joki tai rankkasade, tai molemmat), tulvasyvyys kohteessa sadeosaa varten ja halutessasi vapaakorkeus. {{ui:Raise the flood level}} (Nosta tulvatasoa) näyttää nykyisen ja tulevan tason rinnakkain, merenpinnan ja sadeosan sekä oletukset: koko merenpinnan nousu lisätään rannikkotasoon; joen virtaus nousee suhteessa yhdestä yhteen sateisimman päivän sateeseen, ja syvyys seuraa virtausta potenssiin 0.6 (Manning, leveä uoma); osat lisätään yhteen.

:::warning
Muutoksen seulonta, ei tulvatutkimus. Suunnittelun tulvataso on viranomaisen tai insinöörisi päätettävä.
:::

## Metsäpalon altistuminen (vain seulonta)

Lähin kasvillisuus, sen yläpuolinen rinne ja etäisyys antavat vyöhykkeen hyvin matalasta äärimmäiseen, nykyhetkelle ja tulevaisuudelle (tuleva kertoo paketin palosäänindeksin muutoksen). **Vain seulonta:** oma suhteellinen asteikkomme sen selvittämiseksi, tarvitseeko kohde kunnollisen metsäpalotarkastelun; ei virallinen luokitus.

## Helle: tuleva säätiedosto

Valitse nykypäivän `.epw`-tiedosto ja {{ui:Make the future weather file}} (Tee tuleva säätiedosto): se muokataan julkaistulla siirto- ja venytysmenetelmällä (Belcher, Hacker ja Powell 2005), ja helle verrataan (keskilämpötila ja kuumin lämpötila, suunnittelulämpötilat, tunnit yli 30 °C ja 35 °C, lämpöasteluvut). {{ui:Save the future weather file}} (Tallenna tuleva säätiedosto) tallentaa sen Ympäristö-paneelille, BimCraftin energiatarkistukseen tai omiin työkaluihisi.

## Mistä luvut tulevat

NASA NEX-GDDP-CMIP6 (CMIP6-mallien tarkennettu tulos, CC BY 4.0 kullekin mallille) lämpötilalle, kosteudelle, auringonpaisteelle, sateelle ja palosäälle; IPCC AR6:n maailmanlaajuinen keskiarvo merenpinnan noususta, ellei paketti sisällä paikallisia lukuja. Paneeli näyttää paketin lähteen, lisenssin ja päivämäärän.

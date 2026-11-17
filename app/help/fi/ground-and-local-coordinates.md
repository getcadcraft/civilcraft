---
title: Maanpinta- ja paikalliset koordinaatit
summary: Työskentele maanpintakoordinaateissa (pinta), jotka skaalataan ruudukosta yhdistetyllä mittakaavakertoimella, jonka kirjoitat tai lasket pisteessä, tai oletetussa tontin ruudukossa, joka sidotaan järjestelmään kahdella hallintapisteellä.
keywords: maanpintakoordinaatit, pintakoordinaatit, ruudukko maanpinnaksi, yhdistetty mittakaavakerroin, csf, yhdistetty kerroin, ruudukkokerroin, korkeuskerroin, merenpinnan kerroin, lähentyminen, kartoituskulma, mittakaavakerroin, oletetut koordinaatit, paikalliset koordinaatit, tontin ruudukko, 5000 5000, hallintapisteet, paikallistaminen, kalibrointi, kaksi pistettä, umpeutumisvirhe
from: 3d7453de
---

Tasokoordinaatisto ja UTM ovat **ruudukko**koordinaatteja: karttaprojektio venyttää tai kutistaa etäisyyksiä hieman (kymmeniä ppm), ja mitä korkeammalla kohde on, sitä enemmän mitattu maastoetäisyys eroaa ruudukkoetäisyydestä. Monet mittaukset luovuttavat siksi **maanpinta**koordinaatteja, skaalattuina niin, että suunnitelman etäisyydet vastaavat maastossa mitattuja etäisyyksiä, tai **oletetun** tontin ruudukon (5000, 5000 hallintapisteessä). CivilCraft säilyttää lukusi sellaisinaan ja tallentaa, miten ne liittyvät ruudukkoon, joten leveys- ja pituusasteet, GIS-tiedostot ja karttatasot osuvat oikeaan paikkaan.

Avaa {{ui:Koordinaatit}} **{{ui:GIS}}**-ryhmässä, valitse (tai säilytä) järjestelmä ja valitse kohdassa **Ruudukko-, maanpinta- tai paikalliset koordinaatit**:

| Valinta | Koordinaattisi ovat | Miten ne liittyvät ruudukkoon |
|---|---|---|
| {{ui:Ruudukko}} | Järjestelmän omat (alku) | Samat luvut |
| {{ui:Maanpinta}} | Skaalattu maastoetäisyyksiksi | ruudukko = perus + yhdistetty kerroin × (maanpinta − perus) |
| {{ui:Paikallinen}} | Oletettu tontin ruudukko | Siirretty, käännetty ja skaalattu ruudukolle kahdella hallintapisteellä |

Mikä tahansa valinta tallennetaan projektiin ja on yksi kumoamisvaihe; mitään ei siirry.

## Maanpintakoordinaatit

1. Valitse {{ui:Maanpinta}}.
2. Kirjoita mittauksen **Yhdistetty mittakaavakerroin** (esimerkiksi `0.99987`), tai laske se:
   1. Kohdassa **Laske kerroin pisteessä** piste alkaa projektin keskeltä. Valitse {{ui:Valitse piste pohjakuvasta}} ja napsauta kohtaa (lähellä mittauspistettä napsautus ottaa sen pisteen), tai kirjoita E ja N.
   2. Korkeus tulee pinnasta siinä kohdassa; kirjoita toinen, jos tarvitset.
   3. Valitse {{ui:Laske}}. CivilCraft näyttää:
      - **Ruudukon mittakaavakerroin k**: kuinka paljon karttaprojektio venyttää etäisyyksiä siinä.
      - **Korkeuskerroin**: kuinka paljon lyhyemmät etäisyydet ovat ellipsoidilla kuin tuossa korkeudessa.
      - **Yhdistetty kerroin** = k × korkeuskerroin: ruudukkoetäisyys = maastoetäisyys × tämä.
      - **Lähentyminen**: kulma ruudukon pohjoisen ja todellisen pohjoisen välillä siinä (geodeettinen atsimuutti = ruudukon atsimuutti + lähentyminen).
   4. Valitse lukujen alla oleva {{ui:Käyttö}}-painike, jotta yhdistetty kerroin laitetaan ruutuun.
3. Aseta **Peruspiste**, jossa maanpinta- ja ruudukkokoordinaatit ovat samat. Se alkaa arvosta 0, 0: useimmat viranomaiset, jotka julkaisevat maanpintakoordinaatteja, skaalaavat origon ympäri, joten maanpintakoordinaatit pysyvät tunnistettavasti lähellä ruudukon koordinaatteja. Jotkin mittaukset skaalaavat projektin hallintapisteen ympäri: käytä sitä, mitä mittaus sanoo.
4. Valitse {{ui:Käytä}}.

:::warning
Korkeus otetaan ellipsoidin yläpuolelle mitattuna korkeutena. CivilCraftissa ei ole geoidimallia, joten jos geoidi on 30 m (100 ft) ellipsoidin alapuolella tai yläpuolella, korkeuskerroin on noin 5 ppm pielessä. Kun mittaus ilmoittaa yhdistetyn kertoimensa, kirjoita se.
:::

## Paikalliset (oletetut) koordinaatit

1. Valitse {{ui:Paikallinen}}.
2. **Hallintapiste 1**: kirjoita mittauspisteen numero (tai valitse {{ui:Valitse}} ja napsauta sitä pohjakuvassa). Sen paikalliset koordinaatit näkyvät sen vieressä.
3. Kirjoita sen **ruudukko** E ja N, tai sen leveys- ja pituusaste kolmanteen ruutuun (esimerkiksi `30.2672, -97.7431`).
4. Tee sama **Hallintapiste 2:lle**, mahdollisimman kauas ensimmäisestä.
5. CivilCraft näyttää löydetyn **Mittakaavan** ja **Kierron** ja muistuttaa: **Kaksi pistettä sopii aina täsmälleen — tarkista kolmas.**
6. Anna **Tarkistuspiste** samalla tavalla. CivilCraft näyttää, kuinka kaukana sovitus sijoittaa sen kirjoittamistasi ruudukkokoordinaateista (sen umpeutumisvirhe projektin yksiköissä ja ppm:nä). Suuri virhe tarkoittaa väärää pistettä, kirjoitusvirhettä tai koordinaatteja toisessa yksikössä.
7. Valitse {{ui:Käytä}}.

Mittakaava, joka on kaukana yhdestä (0.5–2-alueen ulkopuolella), hylätään: tarkista pisteet ja niiden yksiköt.

## Mitä tarkistettiin

- Mittakaavakerroin ja lähentyminen täsmäävät PROJ:iin (pyproj 3.7.1 ja PROJ 9.5.1), koordinaattikirjastoon, jota useimmat GIS-ohjelmat käyttävät, yhden miljardisosan tarkkuudella yli 300 järjestelmällä, joissa on konforminen projektio (tasokoordinaatisto, UTM, poikittainen Mercator, Lambertin konforminen kartiokuvaus), ja selaimessa pisteessä, joka on valittu pohjakuvasta.
- Maanpinta- ja paikalliset vaiheet muuntuvat edestakaisin yhden miljardisosan tarkkuudella. Kaksi hallintapistettä palauttaa mittakaavan ja kierron, joilla ne tehtiin. Tarkistuspiste, joka on 0.05 ft:n päässä, näyttää 0.05 ft:n umpeutumisvirheen.

---
title: Analysoi GIS-tasot
summary: Puskuri, päällekkäisyys (leikkaus, yhdiste, poisto, sulatus), paikkaliitos, valinta attribuutin mukaan ja GIS-tasojen mittaus projektissa, jokainen tulos uutena tasona, jonka voi kumota.
keywords: gis, analyysi, puskuri, päällekkäisyys, leikkaus, yhdiste, poisto, rajaus, sulatus, paikkaliitos, liitos, valinta attribuutin mukaan, kysely, missä, lauseke, tilastot, pinta-ala, pituus, piiri, mittaus, tontit, servituutti, rakennusraja, shapefile, geopackage, attribuuttitaulukko
from: a6b2d3f9
---

Kun projektissa on GIS-tasoja (ks. [Tuo GIS-tiedot](topic:gis-import)), GIS-ryhmän painike **Analysoi** (kirjoitettuna `GISANALYSIS`, `ANALYZE` tai `BUFFER`) avaa paneelin, jossa on viisi välilehteä. Se pysyy auki piirustuksen vieressä, joten valinnat piirtyvät suunnitelmaan työn aikana.

Jokainen työkalu, joka luo jotakin, **lisää uuden tason** ja jättää lukemansa tasot täsmälleen ennalleen. Jokainen on yksi kumoamisvaihe: paneelin {{ui:Kumoa}} (tai Ctrl+Z) poistaa uuden tason. Vie tulos kuten mikä tahansa taso [Vie as-built-tiedot GIS-käyttöön](topic:gis-export) -toiminnolla shapefile-, GeoJSON- tai GeoPackage-muodossa.

Tason koko taulukko lajittelun, muokkauksen ja kenttälaskurin kanssa on kohdassa [Työskentele tason attribuuttitaulukon kanssa](topic:gis-table). Värittäminen kentän mukaan on kohdassa [Tyylitä taso attribuutin mukaan](topic:gis-symbology).

Kaikki lasketaan suunnitelmassa projektin yksiköissä (feet tai metrit). Projekti on aina projisoidussa tai paikallisessa järjestelmässä, joten 50 tarkoittaa 50 feetiä tai 50 metriä, ei koskaan asteita. Korkeuksia (z) ei säilytetä tuloksissa.

## Puskuri

Piirtää asetetun etäisyyden päähän jokaisesta kohteesta uuden monikulmiotason. Pisteistä tulee ympyröitä, viivoista pyöreäpäisiä käytäviä, monikulmiot kasvavat. **Negatiivinen** etäisyys kutistaa monikulmioita (100 x 100 neliö kutistettuna 5:llä on 90 x 90; 60:llä kutistettuna ei jää mitään, ja paneeli kertoo siitä). Ota etäisyys numerokentästä, jolloin jokaisella kohteella on oma etäisyys, tai valitse **Yhdistä kaikki puskurit yhdeksi muodoksi** niiden sulattamiseksi.

Pyöristetyt osat ovat suoria paloja, jotka piirretään todellisen kaaren sisäpuolelle, joten puskuri on hieman pienempi kuin tarkka ympyrä: pinta-alassa noin 0.6 % normaaliasetuksella ja 0.16 % asetuksella Hieno. Käytä asetusta Hieno kaikelle, mitä aiot mitata.

## Päällekkäisyys

| Työkalu | Mitä saat |
|---|---|
| Leikkaus | Osat, joissa syöttötaso kohtaa päällekkäisyysmonikulmiot, kummankin tason kentät mukana. Viivat ja pisteet rajataan monikulmioihin. |
| Yhdiste | Molemmat monikulmiotasot leikattuna toistensa reunoja pitkin: yhteiset osat kantavat molempien tasojen kentät, muut vain yhden tason kentät (toisen tason kentät ovat tyhjiä). |
| Poisto | Syötemonikulmiot ilman päällekkäisyysmonikulmioita. Kentät säilyvät syötteessä. Kohde, joka poistuu kokonaan, jätetään pois (paneeli laskee ne). |
| Sulatus | Yhdistää toisiinsa koskettavat tai päällekkäiset monikulmiot, kaikki tai yhden muodon kullekin kentän arvolle. Lisää kentät `COUNT` ja `AREA`. |

Kenttänimi, jonka molemmilla tasoilla on, säilytetään ensimmäiselle tasolle, ja toisen tason kenttä kirjoitetaan nimellä `_2`. Yhden tason kohteiden ei pitäisi mennä päällekkäin: jos menevät, yhdisteessä päällekkäisyys lasketaan molempiin.

## Liitos

Paikkaliitos kopioi attribuutit **lähde**-tasolta jokaiseen **kohde**-kohteeseen, johon se koskee, ja antaa uuden tason, jonka muodot ovat kohteen muotoja. Valitse, milloin ne kohtaavat: koskettavat tai menevät päällekkäin, kohde on lähdemonikulmion sisällä, kohde sisältää lähdekohteen, lähin lähdekohde (valinnaisella rajalla) tai mikä tahansa lähdekohde tietyn etäisyyden sisällä.

Kun useita lähdekohteita osuu, otetaan ensimmäisen attribuutit (lähimmän lähin- ja etäisyysliitoksissa; lisätään `DISTANCE`), tai ne lasketaan ja niiden numerokentät lasketaan yhteen: `COUNT`, sekä `SUM_`, `MEAN_`, `MIN_`, `MAX_` kullekin numerokentälle. Poista valinta kohdasta **Säilytä kohdekohteet, joille ei löytynyt osumaa**, jos haluat jättää ne pois. Liitetyt kentät ovat tyhjiä, joissa mikään ei osunut, ja paneeli laskee osumattomat.

## Valinta

Kirjoita kysymys attribuuteista tai muodosta, paina **Valitse**, ja kohteet piirtyvät suunnitelmaan lukumääränsä, taulukon ja kokonaispinta-alan, pituuden tai luvun kanssa. Sen jälkeen niistä voi tehdä oman tason, zoomata niihin tai tyhjentää valinnan.

| Voit kirjoittaa | Esimerkki |
|---|---|
| Kentän nimi; käytä "lainausmerkkejä" tai [hakasulkeita], jos nimessä on välilyöntejä | `VALUE`, `"Lot Number"` |
| Luvut, 'teksti', true, false, null | `Use_ = 'Res'` |
| `=` `!=` `<>` `<` `<=` `>` `>=` | `VALUE >= 250` |
| `contains` `startswith` `endswith` `like` `ilike` (teksti ei erota isoja ja pieniä kirjaimia; `like`-haussa `%` tarkoittaa mitä tahansa merkkijonoa ja `_` yhtä merkkiä) | `Notes contains 'corner'` |
| `is null`, `is not null` (tyhjä arvo lasketaan nulliksi) | `Notes is null` |
| `in (…)`, `not in (…)`, `between … and …` | `Use_ in ('Com', 'Ind')` |
| `+ - * /` ja sulkeet | `VALUE / 2 > 100` |
| `and`, `or`, `not` | `Use_ = 'Res' and VALUE > 200` |
| Muodon arvot `$area` `$perimeter` `$length` `$x` `$y` `$vertices` | `$area > 5000` |

Keskeneräinen kysymys tai kysymys, joka nimeää kentän, jota tasolla ei ole, hylätään lauseella, joka kertoo, missä vika on.

## Mittaus

Näyttää tason kokonaispinta-alan ja kehän, pituuden tai lukumäärän ja **lisää kenttiä** tasoon: `AREA` ja `PERIMETER` monikulmioille, `LENGTH` viivoille (suunnitelman pituus), `X` ja `Y` pisteille. Olemassa olevaa kenttää ei koskaan kirjoiteta yli: uusi nimetään `AREA_2`:ksi. Tämä on yksi kumoamisvaihe. **Tilastot** antavat numerokentän lukumäärän, summan, keskiarvon, pienimmän ja suurimman arvon, valinnaisesti kullekin toisen kentän arvolle.

:::note
Näiden työkalujen taustalla olevat tarkistukset lasketaan käsin testissä (`node bin/test-civilcraft-gisanalysis.mjs`): esimerkiksi 100 x 100 tontit zonen 100 x 80 alla leikkautuvat 3,000 ja 3,000:ksi, ja 100 metrin pituinen viiva puskuroituna 10:llä on 2,000 ja ympyrä.
:::

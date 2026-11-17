---
title: Pistepilvet dronelta tai skannerilta
summary: Pistepilvet-lisäosalla voit avata LAS- tai LAZ-tiedoston, jossa on miljoonia pisteitä, tarkastella kaikkea, siivota sen, lajitella pisteet maanpinnaksi, kasvillisuudeksi ja rakennuksiksi sekä rakentaa siitä maanpinnan, korkeuskäyrät ja tilavuudet.
keywords: pistepilvi, las, laz, drone, fotogrammetria, recap, lidar, skannaus, maanpinta, luokittelu, kohina, kasa, tilavuus, leikkaus ja täyttö, korkeuskäyrät, taitelinja, eye-dome, ortomosaiikki, ortho, verhoa, karttataso, vie las, vie laz, pakkaa
from: e4a4901f
---

Useimmat eivät tarvitse tätä, joten se on lisäosa. Ota lisäosa {{ui:Pistepilvet}} käyttöön kohdassa Asetukset › Lisäosat; oikeanpuoleiseen paneeliin ilmestyy välilehti {{ui:Pistepilvet}}. Tiedosto luetaan selaimessasi ja jaetaan ruuduiksi, jotka tallennetaan selaimesi omaan tallennustilaan (tai valitsemaasi kansioon). **Mitään ei lähetetä palvelimelle.**

:::warning
Kaikki tämä välilehti näyttää on lukuja tiedoistasi, ei todistus. Sitä on testattu kuvitteellisella työmaalla, ei vielä oikealla drone-mittauksella: lue ensimmäiset tulokset huolellisesti ja kerro meille, mitä löydät. Pätevä ammattilainen päättää, mitä maanpinta, korkeuskäyrät ja tilavuudet ovat arvoltaan.
:::

## Avaa pistepilvi

Kohdassa {{ui:Avaa pistepilvi}} valitse LAS- tai LAZ-tiedosto. Välilehdessä kerrotaan, montako pistettä siinä on, sen koordinaatistojärjestelmä ja yksiköt sekä kuinka paljon tilaa rakentaminen vaatii. Paina {{ui:Rakenna pistepilvi}}. Rakentamisen voi keskeyttää ja jatkaa painikkeella {{ui:Jatka}} (valitse sama tiedosto uudelleen). Tiedostoa ei muuteta koskaan. 100 miljoonan pisteen tiedosto rakentuu minuuteissa työasemalla ja vie suunnilleen saman verran tilaa kuin tiedosto itse.

Kohdassa {{ui:Pistepilvet tällä tietokoneella}} voit avata tai poistaa pistepilven. {{ui:Säilytä pistepilvet kansiossa…}} (Chrome, Edge ja Studio-sovellus) säilyttää ruudut valitsemassasi kansiossa, esimerkiksi CadCraft-pistepilvikansiossa Asiakirjoissa, joten 10 GB:n pistepilvi ei tarvitse mahtua selaimen tallennustilaan. Aiemmin rakennetut pistepilvet pysyvät siellä, missä ne rakennettiin. Selain pyytää lupaa uudelleen uudelleenkäynnistyksen jälkeen: paina {{ui:Käytä kansiota … uudelleen}}.

## Tarkastele sitä

{{ui:Tarkastele 3D:nä}} piirtää pistepilven karkeista ruuduista ja tarkentuu, kun lähestyt sitä, eikä koskaan enempää kuin {{ui:Piirretyt pisteet enintään}} kerrallaan (2.5 miljoonaa; 500 tuhatta puhelimella). Väritys: tiedoston oma väri, korkeus, luokka, voimakkuus tai {{ui:Jäännös}}. {{ui:Eye-dome-valaistus}} varjostaa reunat syvyyden mukaan, jolloin muoto erottuu ilman normaaleja (puhelimella pois päältä). {{ui:Pisteet pienenevät etäisyyden mukaan}} tekee kaukaisista pisteistä pienempiä ja läheisistä suurempia; {{ui:Pisteen koko}} määrittää koon. Pohjakuvassa pistepilvi näkyy piirustuksesi alla rasterikuvana, ja **tarkentuu, kun zoomaat** sen osaan.

## Siivoa se

Kohdassa {{ui:Siivoa}} piirrä pohjakuvaan lasso, laatikko tai monikulmio (tai 3D-näkymässä ylänäkymästä: 3D:ssä ääriviiva otetaan suoraan alas, joten se on tarkka vain ylhäältä). Välilehti näyttää, montako pistettä on rajauksen sisällä **ennen** kuin käytät: {{ui:Poista nämä pisteet}}, {{ui:Vaihda niiden luokka}}, {{ui:Palauta poistetut pisteet}} tai {{ui:Rajaa tämän rajan mukaan}}. {{ui:Kumoa}} ja {{ui:Tee uudelleen}} kulkevat muokkaushistorian läpi; tiedostoa itseään ei muuteta koskaan. {{ui:Kohinasuodatin…}} merkitsee irralliset pisteet matalina pisteinä (luokka 7) tai korkeana kohinana (luokka 18).

## Lajittele se

{{ui:Etsi maanpinta}} toimii ruutu kerrallaan ja merkitsee maanpinnan (luokka 2) sekä matalat pisteet; toleranssi on 0.15 m, tai 0.08 m, kun mittausluokan kytkin on päällä. Se ilmoittaa ruutujen saumat, jotka eivät täsmää. {{ui:Luokittele kasvillisuus ja rakennukset}} merkitsee sen jälkeen matalan, keskikorkean ja korkean kasvillisuuden sekä rakennukset maanpinnan yläpuolisen korkeuden ja ympäröivän alueen tasaisuuden perusteella. Koneoppimista ei käytetä, joten puiden alla oleva tasakattoinen varasto voi olla väärin: tarkista.

## Maanpinta, korkeuskäyrät, taitelinjat

{{ui:Rakenna maanpinta}} luo nykyisen maanpinnan maanpinnan pisteistä ja lisää sen projektiin samalla tavalla kuin LAS-tuonti (yksi kumoamisvaihe). Sen jälkeen se vertaa pisteitä siihen: keskiarvo, RMS, 95. prosenttipiste, toleranssin sisälle jäävä osuus sekä kymmenen eniten poikkeavaa kohtaa, jokaisen kohdalla {{ui:Siirry kohtaan}}. Väritys {{ui:Jäännös}} näyttää, missä maanpinta ja pistepilvi eroavat toisistaan.

Taitelinja (reunakivi, oja tai penkereen yläreuna) valitaan pistepilvestä: {{ui:Valitse taitelinja pistepilvestä}} 3D-näkymässä ottaa jokaisella napsautuksella lähimmän piirretyn pisteen, ja {{ui:Valitse taitelinja pohjakuvassa}} ottaa jokaisen napsautuksen alla olevan lähimmän pistepilven pisteen (ensin maanpinta). Kaksoisnapsautus tai Enter päättää viivan. Seuraava {{ui:Rakenna maanpinta}} käyttää sitä. {{ui:Näytä korkeuskäyrät}} piirtää korkeuskäyrät pistepilven päälle pienessä kuvassa ja asettaa projektin välin.

## Tilavuudet

{{ui:Kasan tilavuus…}} laskee pinnan tilavuuden pohjan yläpuolella rajauksen sisällä, jonka piirrät. Piirrä raja kasan ympärille tasaisella maalla ja valitse pohja: rajapisteiden alin kohta, taso, sileä kaareva pohja, rajan kautta kulkeva pinta tai kirjoittamasi korkeustaso. Rinteisillä tai kaarevilla pinnoilla käytä tasoa tai kaarevaa pohjaa; alin piste antaa liian korkean arvon. Rajapisteet, jotka ovat muita korkeammalla (linjalla oleva puu), jätetään pohjan ulkopuolelle. {{ui:Lennolta lennolle}} antaa leikkauksen ja täytön kahden pistepilven välillä. Molemmat voidaan tallentaa CSV-tiedostona.

## Ortomosaiikki

Kohdassa {{ui:Ortomosaiikki (kuva ylhäältä)}} valitse dronen ortomosaiikki maailmatiedostonsa ja `.prj`-tiedostonsa kanssa, jos niitä on: GeoTIFF-, PNG- tai JPEG-tiedosto. Siitä tulee projektin **karttataso**, joten pohjakuvassa se näkyy piirustuksesi alla. 3D-näkymä (väritys {{ui:Kartta}}) maalaa sen rakentamallesi maanpinnalle, joten rakenna ensin {{ui:Rakenna maanpinta}}. Välilehti kertoo, kuinka suuren osan pistepilvestä kuva kattaa, ja varoittaa, jos se ei kata lainkaan: tavallinen syy on eri koordinaatistojärjestelmä, joten anna mukaan `.prj`-tiedosto. Jos `.prj`-tiedostoa ei ole, ohjelma kysyy, missä koordinaatit ovat. Kuva säilytetään projektitiedoston sisällä. Yli 200 MB:n GeoTIFF hylätään, ja hyvin suuri mosaiikki pienennetään 16 megapikseliin, joten suurta kartoitusta varten leikkaa mosaiikki ensin työmaan kokoiseksi.

## Vienti

{{ui:Vie}} kirjoittaa siivotun ja luokitellun pistepilven uutena tiedostona (kaikki pisteet, siivotut luokat tai vain maanpinta). Kohdassa {{ui:Tiedostotyyppi}} valitse:

- **LAS 1.4 (pakkaamaton)**: pistemuoto 6, tai 7 väreillä.
- **LAZ (pakattu)**: samat pisteet pakattuna häviöttömästi, joten jokainen piste palautuu täsmälleen. Se kirjoitetaan pistemuotona 0, tai väreillä 2, LAS 1.4 -tiedostoon. Kuvitteellisella 300 m:n työmaalla LAZ oli noin viidesosa LAS 1.4 -tiedoston koosta. LAZ-muodot 0 ja 2 sisältävät vain luokat 0–31: pisteen, jonka luokka on suurempi, vienti hylätään viestillä, joten vie tällainen pistepilvi LAS 1.4 -muodossa.

LAZ kirjoitetaan CadCraftin omalla pakkaajalla, joka on tehty julkaistusta LAZ-määrityksestä. Olemme tarkistaneet, että oma lukijamme ja kaksi riippumatonta LAZ-lukijaa (laz-perf, jota sovellus käyttää LAZ-tiedostojen avaamiseen, sekä laspy lazrs-kirjaston kanssa) lukevat jokaisen pisteen takaisin täsmälleen. Olemme myös tarkistaneet, että laspyn tekemät LAZ-tiedostot tulevat tavu tavulta samanlaisina, kun kirjoitamme niiden pisteet uudelleen. Muita ohjelmia ei ole vielä kokeiltu, joten jos jokin ei avaa tiedostoa, kerro meille, mikä.

Jos selain voi kirjoittaa tiedoston samalla kun se etenee, valitset ensin tiedoston, ja hyvin suuri pistepilvi kirjoitetaan siihen ruutu kerrallaan sen sijaan, että se kerättäisiin muistiin. Muuten tiedosto kerätään ja ladataan, mikä on hyvä muutaman sadan megatavun asti.

## Mitä se ei tee

Se lukee vain LAS- ja LAZ-tiedostoja (E57, PLY ja PCD eivät ole vielä kytketty tähän välilehteen, eikä useita saman lennon tiedostoja yhdistetä). Se ei projisoi pistepilveä uudelleen (oletetaan projektin järjestelmä ja metrit). Se ei lue Autodeskin RCP- tai RCS-tiedostoja, ei tee pintaa valokuvista eikä löydä itse pylväitä, reunakiviä tai putkia.

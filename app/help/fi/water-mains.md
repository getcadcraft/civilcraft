---
title: Vesijohdot: paineet, virtaamat ja palovirtaama
summary: Piirrä paineverkko liitoskohdista, vesisäiliöistä, altaista, putkista, pumpuista ja paineenalennusventtiileistä suunnitelmalle; CivilCraft laskee paineenkorkeudet, paineet ja virtaamat (Hazen–Williams, silmukoidut verkot), palolle käytettävissä olevan virtaaman ja vuorokauden kulutuksen. Kokeellinen ominaisuus; jokainen tulos vaatii insinöörin tarkistuksen.
keywords: vesi, vesijohto, vesijakelu, paineverkko, paineputki, silmukoitu verkko, hazen-williams, C-kerroin, painehäviö, jäännöspaine, palovirtaama, paloposti, kulutus, liitoskohta, vesisäiliö, allas, pumppu, pumppukäyrä, paineenalennusventtiili, prv, takaiskuventtiili, jaksoittainen tarkastelu, epanet, inp, nopeus
from: df46bf6d
---

Vesijohdot ovat kohteen paineellinen puoli: aina täynnä olevat putket, joissa vesi työnnetään eteenpäin vesisäiliöllä, altaalla tai pumpulla. CivilCraft laskee paineenkorkeuden ja paineen jokaisessa liitoskohdassa ja virtauksen jokaisessa putkessa, myös silmukoiduissa verkoissa, joissa vedellä on useampi reitti. Ominaisuus on kokeellisessa vaiheessa, kunnes sen toimivuus on tarkistettu.

**Vain laskennan apuväline.** Jokainen luku tarvitsee pätevän insinöörin tarkistuksen: tulos on vain yhtä hyvä kuin kulutukset, korkeudet, putkikoot ja karheusarvot, jotka annoit, eikä tasapainotilamalli tiedä vesivasarasta, veden laadusta tai palopumpun todellisesta toiminnasta mitään.

## Piirrä verkko

1. Kohdassa **Maastomalli** › {{ui:Lisää}} valitse {{ui:Vesijohdot…}}. Ikkuna pysyy auki, kun työskentelet suunnitelmalla.
2. Valitse {{ui:Vesisäiliö}} ja napsauta suunnitelmaa kohdasta, jossa syöttö on. Sen paineenkorkeus alkaa 100 ft (30 m) maanpinnan yläpuolelta; muuta sitä ominaisuuksissa.
3. Valitse {{ui:Liitoskohta}} ja napsauta jokaista kohtaa, josta vettä otetaan tai johon putket yhtyvät. Liitoskohta saa korkeutensa maanpinnasta; kirjoita toinen ominaisuuksiin ohittaaksesi sen.
4. Valitse {{ui:Putki}}, napsauta solmua ja sitten solmua, johon se liittyy. Työkalu pysyy päällä seuraavaa putkea varten. {{ui:Pumppu}} ja {{ui:Paineenalennusventtiili}} piirretään samalla tavalla imupuolen (tai ylävirran) solmusta paineen (tai alavirran) solmuun. {{ui:Allas}} sijoitetaan kuten liitoskohta.
5. Valitse liitoskohta ja kirjoita sen {{ui:Kulutus}} (gpm tai L/s metriprojektissa). Valitse putki ja aseta sen {{ui:Halkaisija}} (in tai mm) ja, jos tiedät sen, sen Hazen–Williams C.

Jokainen muutos on yksi kumousaskel. Delete poistaa solmun ja siihen päättyvät putket.

## Mitä kukin osa tarkoittaa

- **Putki.** Pituus mitataan suunnitelmalta, ellet kirjoita sitä itse. C on Hazen–Williams-karheus (aluksi 130, muuta oletusarvo ikkunassa). Pienen häviön kerroin K lisää mutkien ja varusteiden häviöt. Valitse **Takaiskuventtiili** putkelle, jonka ei pidä kuljettaa vettä taaksepäin; **Suljettu** putki ei kuljeta mitään.
- **Vesisäiliö.** Lähde kiinteällä paineenkorkeudella eli vedenpinnan korkeudella, jonka se pitää vertauspinnan yläpuolella. Se antaa tai ottaa sen, mitä verkko tarvitsee.
- **Allas.** Pinta, joka muuttuu vuorokauden aikana. Tasapainotuloksissa se on lähde nykyisellä tasollaan.
- **Pumppu.** Yksi mitoituspiste (virtaama ja paineenkorkeus) antaa sen kautta tavanomaisen käyrän: paineenkorkeus nollavirtaamalla on 133 % mitoituspaineenkorkeudesta, ja paineenkorkeus on nolla kaksinkertaisella mitoitusvirtaamalla. Pumppu ei koskaan työnnä vettä taaksepäin.
- **Paineenalennusventtiili.** Pitää asettamasi paineen alavirran puolella, kun syöttö on korkeampi. Kun syöttö on matalampi, se on auki eikä pidä mitään; jos vesi kulkisi taaksepäin, se sulkeutuu.

## Lue tulokset

Ikkuna näyttää jokaisen solmun paineenkorkeuden ja paineen sekä jokaisen linkin virtaaman, nopeuden ja painehäviön per 1,000 ft (tai per km). Liitoskohdat on väritetty suunnitelmalle: vihreä on alimman ja ylimmän paineesi välillä, punainen alempana ja keltainen ylempänä. Virtausnuolet näyttävät suunnan. Valitse solmu tai putki lukeaksesi sen luvut ominaisuuksista.

Taulukoiden alla on luettelo kohdista, joihin kannattaa kiinnittää huomiota: matala tai korkea paine, putki, joka on nopeampi kuin raja, liitoskohta, joka on katkaistu kaikista lähteistä, tai ratkaisija, joka ei ole vakiintunut. Samat havainnot ovat Ongelmat-paneelissa. Aseta rajat ikkunassa (aluksi 20 psi, 100 psi ja 10 ft/s; metriprojektissa 140 kPa, 700 kPa ja 3 m/s).

## Palovirtaama

{{ui:Palovirtaama…}} piirtää virtaaman yhteen liitoskohtaan ja näyttää siellä olevan paineen sekä verkon alimman paineen missä tahansa. Se löytää myös tuon liitoskohdan käytettävissä olevan virtaaman, kun verkon heikoin solmu säilyttää antamasi jäännöspaineen. Muut kulutukset pysyvät ennallaan.

## Vuorokauden kulutus

{{ui:Vuorokauden kulutus…}} ajaa verkon tunti kerrallaan. Anna kulutuskaava tiedoston asetuksissa (toistuva luettelo kertoimia); altaat täyttyvät ja tyhjenevät sisään- ja ulosvirtauksen mukaan, ja pumppu voi seurata päällä/pois-kaavaa. Allas, joka saavuttaa korkeimman tai alimman tasonsa, mainitaan luettelossa: CivilCraft ei sulje sen tuloa tai lähtöä puolestasi, joten lue se näin: ”tämä allas on liian pieni tai pumppu liian suuri”.

## EPANET-teksti

{{ui:Tallenna EPANET-tekstinä (.inp)}} kirjoittaa verkon yksinkertaisessa tekstimuodossa, jota monet vesiohjelmat lukevat, ja {{ui:Avaa EPANET-teksti (.inp)…}} lukee sellaisen. Mukaan tulee vain se, mitä CivilCraft mallintaa: liitoskohdat, vesisäiliöt, altaat, putket, paineenkorkeuskäyrällä varustetut pumput, paineenalennusventtiilit, kulutuskaavat ja ajat. Muut venttiilityypit, tehon perusteella annetut pumput ja muut painehäviökaavat nimetään ja jätetään pois. Tiedoston on käytettävä samoja yksiköitä kuin projekti.

## Paloposti, venttiilit ja varusteet

Valitse liitoskohta ja valitse **Paloposti** asettaaksesi sellaisen siihen; valitse runkoputki ja paina **Lisää keskelle** asettaaksesi siihen venttiilin, ilmaventtiilin, tyhjennyksen tai mittarin. Ne ovat verkon kohteita: ne liikkuvat sen mukana, ja yksi kumousaskel poistaa ne.

Suunnitelma tarkoittaa myös varusteita, ja CivilCraft luettelee ne pyytämättä: **T-haara** kohdassa, jossa kolme runkoputkea kohtaa, **risti** kohdassa, jossa niitä on neljä, **mutka** (kulmineen) kohdassa, jossa kaksi runkoputkea kääntyy vähintään 5° verran, **supistus** kohdassa, jossa kaksi kokoa kohtaa, ja **tulppa** umpipäässä. {{ui:Varusteluettelo (CSV)}} laskee ne ja runkoputket kokojen mukaan. Tämä on suunnitelman antama määrälaskelma, jonka voi tarkistaa omia yksityiskohtiasi vastaan, ei tilattava luettelo.

Runkoputket asetetaan maanpinnan alapuolelle peitesyvyyden verran (4 ft tai 1.2 m), jotta ne voidaan piirtää ja mallintaa 3D:nä; yllä olevat paineet eivät riipu siitä koskaan.

## Suunnitelmalla ja tiedostoissa

Suunnitelma, PDF ja DWG tai DXF kantavat runkoputket tasolla **C-WATR-MAIN**, niiden koot tasolla **C-WATR-TEXT**, palopostit tasolla **C-WATR-HYDR**, venttiilit tasolla **C-WATR-VALV** ja varusteet tasolla **C-WATR-FITT**. LandXML-vienti kirjoittaa vesiputkiverkon (rakenne jokaiselle solmulle, putki jokaiselle runkoputkelle, palopostit nimettyinä); LandXML-tuonti lukee sen takaisin vesijohtoina ilman kulutuksia, pumppuja tai venttiileitä, joita LandXML ei kanna. IFC-vienti kirjoittaa runkoputket putkisegmentteinä, palopostit, venttiilit ja varusteet yhteen vesijärjestelmään. Nämä tiedostot on tarkistettu omaa lukijaamme ja kirjoittajiamme vastaan; kokeile niitä muissa ohjelmissasi ja kerro meille, mitä ne sanovat.

## Mitä ei vielä ole

Veden laatu ja ikä, ohjaukset ja säännöt pumpun päällä/pois-kaavan ulkopuolella, muut venttiilityypit, paineesta riippuva kulutus, putket, joiden halkaisija muuttuu, ja viemärivirtaamat ajan yli. Katso [Ei vielä toteutettu](topic:not-built-yet). Jätevesien mitoitusvirtaamat, jotka ovat eri laskenta, ovat kohdassa [Jätevesien mitoitusvirtaamat](topic:sanitary-design).

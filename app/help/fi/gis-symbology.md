---
title: Tyylitä taso attribuutin mukaan
summary: Väritä GIS-tason kohteet kentän arvojen mukaan (yksi väri arvoa kohden tai lukualueittain), kokoile pisteitä luvun mukaan, sävytä monikulmioita ja näytä selite suunnitelmassa.
keywords: symbologia, tyyli, väri, värit, luokiteltu, portaittainen, yksilölliset arvot, yhtä suuri väli, kvantiili, luonnolliset katkaisut, jenks, liukuväri, värisokeus, selite, koko, pisteet, aluevärikartta, luokat, gis
from: a3a69add
---

Avaa tason **kolmen pisteen** valikko GIS-tasojen luettelossa ja valitse {{ui:Tyyli attribuutin mukaan…}}.

## Kolme tyyliä

- **Yksi symboli:** tason väri, kuten ennen.
- **Luokiteltu:** yksi väri kullekin erilliselle arvolle mistä tahansa kentästä. Enintään kahdeksan arvoa saa kahdeksan Okabe-Ito-väriä (valittu niin, että ne pysyvät erillään yleisimmissä värisokeuden muodoissa). Useammilla arvoilla seitsemän yleisintä saa kukin värin ja loput jakavat harmaan luokan **Muu**. Kohteet ilman arvoa ovat harmaita.
- **Portaittainen:** numerokenttä jaetaan 2–9 alueeseen, joilla kullakin on väri liukuväristä. Katkaisukohdan arvo kuuluu alempaan alueeseen.

## Miten alueet katkaistaan

| Menetelmä | Katkaisut |
|---|---|
| Yhtä suuri väli | Pienimmästä suurimpaan ulottuva alue jaetaan yhtä leveisiin osiin. Arvot 0–30 kolmessa alueessa: 0, 10, 20, 30. |
| Kvantiili | Suunnilleen sama määrä kohteita kussakin alueessa. Katkaisut luetaan lajitelluista arvoista tavallisella suoraviivaisella interpoloinnilla: arvoille 1–10 kahdessa alueessa katkaisu on 5.5. |
| Luonnolliset katkaisut (Jenks) | Katkaisut, jotka jättävät vähiten hajontaa kunkin alueen sisälle, jolloin samankaltaiset arvot pysyvät yhdessä. Yli 1,500 arvon kohdalla se toimii 1,500 tasavälein valitulla arvolla ja kertoo tämän. |

## Värit

Viridis ja Cividis kulkevat tummasta vaaleaan tasaisella vaaleuden muutoksella, joten alueiden järjestys näkyy myös harmaana tai värisokeana. Blues kulkee vaaleasta tummaan. Punaisesta siniseen on kaksisuuntainen liukuväri arvoille keskiarvon ympärillä. **Käännä värit** kääntää minkä tahansa niistä. Valintaikkuna luettelee alueet ja kunkin alueen kohteiden määrän ennen käyttöönottoa.

## Koko, täyttö ja selite

- **Pistekoko kentän mukaan** numerokentällä tekee kunkin pisteen neliöstä sitä suuremman, mitä suurempi arvo on, kahden antamasi koon välillä (puolet sivusta, millimetreinä paperilla).
- **Sävytä monikulmioiden sisus** täyttää kunkin monikulmion luokkansa värillä (reiät jäävät tyhjiksi). Sävy näkyy näytöllä; tulosteissa sekä DXF- ja DWG-tiedostoissa näkyvät värilliset reunat.
- **Näytä selite suunnitelmassa** piirtää luokat, niiden määrät ja kokoalueen suunnitelman vasempaan alakulmaan. Selite on näytöllä, eikä se ole tulosteessa.
- Kohteiden nimiöinti kentän mukaan onnistuu samasta valikosta kohdalla **Nimiöi kentällä**.

Tyyli tallennetaan projektitiedostoon. Versio, joka ei tunne tyylejä, avaa tiedoston tason värillä. Tulosteet, DXF ja DWG kantavat luokat erillisinä tasoina, jotka on nimetty tason ja luokan mukaan, lähimmässä yhdeksästä CAD-perusväristä. Yli 200,000 kohteen taso piirretään yhdellä värillä.

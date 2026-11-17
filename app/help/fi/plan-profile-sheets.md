---
title: Pohjakuva- ja pituusleikkausarkit
summary: Plottaa linjaus sarjana pohjakuva- ja pituusleikkausarkkeja yhteen PDF-tiedostoon, jossa arkkien välillä on jatkolinjat.
keywords: pohjakuva ja pituusleikkaus, arkit, plottaus, jatkolinja, PDF, tiesuunnitelmat, pituusleikkauksen plottaus, pystysuuntainen liioittelu, arkkisarja
from: 34b4ec78
---

Pohjakuva- ja pituusleikkausarkit ovat tavallinen tapa piirtää tiesuunnitelmat. Jokaisella arkilla näkyy yksi tieosuus kahdesti: pohjakuvana yläpuolella ja pituusleikkauksena alapuolella, samassa vaakamittakaavassa, joten paalu on molemmissa samalla kohdalla.

## Tee arkit

1. Valitse linjaus. Klikkaa **Ominaisuudet**-kohdassa {{ui:Pohjakuva- ja pituusleikkausarkit}}.
2. Valitse **Paperi**, **Pohjakuvan mittakaava** ja **Pituusleikkauksen liioittelu** (kuinka monta kertaa pituusleikkaus piirretään korkeammaksi kuin se on pitkä; aluksi 10×). Valintaikkuna kertoo, montako arkkia siitä tulee ja kuinka suuren osan linjauksesta kukin näyttää.
3. Jos haluat plottaa osan linjauksesta, muuta **Alkupaalu** ja **Loppupaalu**.
4. Klikkaa {{ui:Lataa PDF}}. PDF-tiedostossa on yksi sivu per arkki.

## Mitä arkilla on

| Osa | Mitä se näyttää |
|---|---|
| Pohjakuva | Kaikki suunnitelmassa (korkeuskäyrät, mittauspisteet, linjaus paaluvälityksineen, käytävät, tasanteet, taitelinjat, putket, poikkileikkauslinjat), käännettynä niin, että tämä tieosuus kulkee arkin poikki, ja pohjoisnuoli käännettynä vastaavasti |
| Jatkolinjat | Pistekatkoviiva, joka on linjaukseen nähden suorassa kulmassa kummassakin päässä, jossa osuus jatkuu toisella arkilla. Tekstinä "Jatkolinja paalu 5+50.00, katso arkki 2" |
| Pituusleikkaus | Maanpinta (katkoviiva), suunniteltu pituusprofiili (punainen), jokaisen tangentin kaltevuus ja jokaisen pystykaaren PVI, korkeus, L ja K. Paalut alareunassa, korkeudet molemmilla sivuilla |
| Otsikkokaista | Projektin nimi, linjaus ja sen paalualue, "Arkki 1 / 3", vaaka- ja pystymittakaavat sekä liioittelu |

Arkin tieosuus on yhtä pitkä kuin pohjakuvaikkuna sallii mittakaavassa. Se pyöristetään alaspäin kokonaiseen 50 ft (20 m) pituuteen pitkillä osuuksilla tai kokonaiseen 10 ft (5 m) pituuteen lyhyillä.

:::note
Kun pituusleikkauksen korkeudet eivät mahdu valitsemallasi liioittelulla, CivilCraft piirtää jokaisen arkin suurimmalla kertoimella 10×, 5×, 4×, 2× ja 1×, joka mahtuu, ja tilarivi kertoo siitä. Kaarevaa linjausta käännetään kunkin osuuden alun ja lopun välisen suunnan mukaan, joten tie voi näkyä arkilla hieman nousevana tai laskevana.
:::

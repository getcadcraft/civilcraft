---
title: Laske sadevesivirtaamat, putkikoot ja hydraulinen energialinja
summary: Piirrä jokaiseen kaivoon valuvat valuma-alueet, laske virtaamat verkossa rationaalimenetelmällä, mitoita putket Manningin kaavalla ja katso, missä hydraulinen energialinja on täynnä tai nousee pintaan.
keywords: sadevesi, valuma-alue, rationaalimenetelmä, valuntakerroin, keskittymisaika, sateen voimakkuus, idf, manning, putkimitoitus, hydraulinen energialinja, hgl, energialinja, egl, padotus, tulva, paineellinen virtaus, alapuolen vedenpinta
from: e44872ec
---

Sadevesilaskenta toimii [putkiverkon](topic:pipe-network) päällä: piirrä verkko ensin, sitten alueet, jotka valuvat siihen. Kaikki näkyy **Sadevesi**-kohdassa oikeassa paneelissa, kun mitään ei ole valittuna.

## Piirrä valuma-alue

1. Napsauta **Piirrä valuma-alue** kohdassa **Sadevesi**.
2. Napsauta sen alueen kulmat, joka valuu yhteen kaivoon. {{key:Enter}} tai kaksoisnapsautus päättää; {{key:Backspace}} peruu viimeisen kulman, {{key:Esc}} lopettaa.
3. Valuma-alue valuu sen sisällä olevaan kaivoon, muuten lähimpään. Sen **Ominaisuudet** avautuvat: aseta nimi, **Valuntakerroin C** (osuus sateesta, joka valuu pois, 0–1), **Keskittymisaika** minuutteina ja se, mihin kaivoon se **Valuu**.

**Piirrä toinen valuma-alue** valuma-alueen Ominaisuuksissa aloittaa seuraavan. Valitse valuma-alue napsauttamalla sen sisällä suunnitelmassa; {{key:Delete}} poistaa sen. Jokainen muutos on yksi askel: {{key:Mod+Z}} kumoaa sen.

## Aseta mitoitussade

Sateen voimakkuus on i = a ÷ (tc + b) potenssiin c, tuumaa tunnissa jalkaprojektissa ja millimetriä tunnissa metriprojektissa. Sovita **Voimakkuus a**, **b** ja **c** omaan intensiteetti–kesto–taajuus (IDF) -käyrääsi sille toistoajalle, jota mitoitat.

:::warning
Lähtövoimakkuuskäyrä, Manning n (0.013) ja solmukohdan häviö (0.5) ovat paikanpitäjiä, eivät standardi. Aseta ne omien sadedatasi ja mitoitusperusteidesi mukaan.
:::

- **Lyhin keskittymisaika**: mitään putkea ei lasketa lyhyemmällä ajalla (aluksi 10 minuuttia).
- **Manning n**: putkien karheus.
- **Solmukohdan häviö**: kussakin kaivossa menetetty paine osuutena lähtevän putken nopeuskorkeudesta V²/2g.
- **Veden taso lähtöaukossa**: alapuolen vedenpinta, johon viimeinen putki tyhjenee. Jätä tyhjäksi, kun lähtö purkautuu vapaasti.

## Virtaamien kertyminen

Jokainen putki kuljettaa kaikki sen yläpuolella olevat valuma-alueet. Q = C × i × A, missä C × A lasketaan yhteen verkossa alaspäin ja i on sen pisimmän keskittymisajan voimakkuus, jonka vesi saavuttaa: valuma-alueen oma aika tai ylävirran aika lisättynä putkien läpi kulkemisen ajalla (pituus ÷ täyden putken virtausnopeus). Q on kuutiojalkaa sekunnissa (A eekkereinä) tai kuutiometriä sekunnissa (A hehtaareina).

## Mitoita putket

Taulukko **Virtaamat ja energialinjat** näyttää kullekin putkelle virtaaman, sen, mitä se kuljettaa täynnä virratessaan omassa kaltevuudessaan, nopeuden, hydrauliset korkeuslinjat yläpäässä ja alapäässä sekä sen, kuinka syvällä vesi virtaa.

**Mitoita putket näille virtaamille** antaa kullekin putkelle pienimmän vakiokoon, joka kuljettaa sen virtaaman omassa kaltevuudessaan (12–72 tuumaa tai 300–1800 mm). Se on yksi askel. Pohjan korot pysyvät paikoillaan: jos koot muuttuvat, käytä {{ui:Aseta kaikki pohjan korot säännöistä}} säilyttääksesi peitesyvyyden ja tarkista taulukko uudelleen.

## Lue energialinjat

Hydraulinen energialinja (HGL) lasketaan lähtöaukosta ylävirtaan:

- Osittain täynnä virtaavan putken HGL on vedenpinnassa: pohjan korko plus normaali syvyys.
- Kun alapuolen vesi on putken katon yläpuolella tai putki kuljettaa enemmän kuin täynnä virratessaan, se virtaa täynnä (paineellisesti), ja sen HGL nousee kitkakaltevuuden verran sen pituudella.
- Kussakin kaivossa HGL on lähtevän putken yläpään HGL plus solmukohdan häviö.
- Energialinja (EGL) on HGL plus nopeuskorkeus.

Putki, joka virtaa täynnä, on listattu, samoin jokainen kaivo, jossa HGL on yli kaivon kannen: vesi nousee siellä pintaan, ja kaivo on ympyröity punaisella suunnitelmassa. Valitse putki tai kaivo nähdäksesi sen virtaaman, syvyyden, nopeuden ja molemmat energialinjat sen Ominaisuuksissa.

## Reititä sade

Rationaalimenetelmä antaa yhden huipun kullekin putkelle. {{ui:Reititä sadevesi}} (tulosten alla, verkon Ominaisuuksissa) laskee koko sateen: kunkin valuma-alueen valunnan ajan yli, kuljetettuna putkia pitkin niiden kulkuaikoineen ja varastoineen, ja yhdistettynä, kun ne kohtaavat.

1. Jätä {{ui:Sade kestää}} ja {{ui:Sateen voimakkuus}} tyhjiksi, jolloin käytetään pisintä keskittymisaikaa ja yllä olevaa sadekäyrää, tai kirjoita omat arvosi.
2. Paina {{ui:Reititä sadevesi}}. Taulukko listaa kullekin putkelle suurimman sisään- ja ulosvirtaaman, sen, kuinka paljon alempi lähtevä huippu on, kuinka suuren osan putken täydestä kapasiteetista se käyttää ja minuutin, jolloin huippu saavutetaan.
3. Jokaisesta lähtöaukosta saa pienen virtaama–aikakuvaajan ja {{ui:Lataa hydrografi (CSV)}}.

Valuma-alue lähettää ulos sateen keskiarvoistettuna sen keskittymisajalle, joten lyhyempi sade kuin tuo tuottaa alemman huipun kuin C × i × A. Jokainen putki reititetään Muskingum–Cunge-menetelmällä käyttäen virtaussyvyyttä, jonka rationaalimenetelmä jo löysi. Kaksi haaraa, joilla on eri keskittymisajat, eivät saavuta huippuaan samaan aikaan, joten niiden summa on pienempi kuin huippujen summa.

Tämä ei mallinna paineellista virtausta, padotusta, varastointia kaivoissa eikä tulvimista. Putki, jonka reititetty huippu ylittää sen täyden kapasiteetin, on listattu, ja sen vesi välitetään ikään kuin se mahtuisi. Käytä sitä ajoituksen ja tasoittumisen tarkasteluun, ei putken mitoittamiseen. Se on laskennan apuväline: insinööri tarkistaa sen.

## Tallennus projektiin

Valuma-alueet ja sadeasetukset tallennetaan projektitiedostoon. Niitä ei vielä ole PDF-piirroksessa, DWG:ssä, DXF:ssä eikä LandXML:ssä: katso [Ei vielä toteutettu](topic:not-built-yet).

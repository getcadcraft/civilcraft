---
title: Rakenna ja tarkenna maastomalli
summary: Miten CivilCraft kolmioi nykyisen maanpinnan ja miten maastomallia muotoillaan taitelinjaryhmillä, piirretyillä taitelinjoilla, ulkorajalla ja pisimmän ulkoreunan asetuksella.
keywords: tin, maastomalli, kolmiointi, taitelinja, raja, nykyinen maanpinta, eg, luo maastomalli, delaunay, kolmiot, enimmäisreuna, ulkoraja
from: b9eea3f3
---

CivilCraftissa on yksi nykyinen maastomalli projektia kohden. Se on TIN (kolmioitu epäsäännöllinen verkko) pisteistäsi, ja se rakentuu uudelleen automaattisesti aina, kun jokin syöte muuttuu. Uudelleenrakennuskomentoa tai vanhentunutta maastomallia ei ole.

## Mitä maastomalliin menee

- Jokainen korkeudellinen piste ryhmässä, joka on asetettu {{ui:Points}} (Pisteet) -tilaan.
- Jokainen ryhmä, joka on asetettu {{ui:Breakline}} (Taitelinja) -tilaan, yhdistettynä pistenumerojärjestyksessä.
- Jokainen taitelinja, jonka piirrät {{ui:Breakline}}-työkalulla.
- Ulkoraja, jos piirrät sellaisen.
- **Pisin ulkoreuna** -asetus.

Kolmiot eivät ylitä taitelinjaa: maastomalli pakotetaan seuraamaan sitä ja tasataan mahdollisimman tasaiseksi sen ympärillä (muualla Delaunay).

## Tee koodatuista viivoista taitelinjoja

1. Vasemman paneelin **Pisteet**-kohdassa etsi ryhmä (esimerkiksi FL).
2. Aseta sen **Maastomalli**-valinnaksi {{ui:Breakline}}.
   Maastomalli rakentuu uudelleen, viiva piirtyy oranssina (kun **Taitelinjat** on päällä kohdassa **Näyttö**), ja maastomallin tiedoissa **Taitelinjat**-luku kasvaa yhdellä.
3. Tarkista viiva suunnitelmalta. Sen täytyy kulkea pisteestä pisteeseen siinä järjestyksessä, jossa viiva mitattiin. Jos se siksaka, ryhmässä on enemmän kuin yksi viiva tai pisteet eivät ole numeroitu järjestyksessä: aseta ryhmä takaisin {{ui:Points}}-tilaan ja piirrä viivat käsin (seuraava osio).

## Piirrä taitelinja pisteiden kautta

1. Paina {{key:B}} tai napsauta {{ui:Breakline}}-painiketta **Maastomalli**-ryhmässä.
   Vihje kuuluu: ”Taitelinja: napsauta mittauspisteitä järjestyksessä (se ottaa niiden korkeudet). Enter lopettaa.”
2. Vie osoitin pisteen lähelle. Pieni oranssi neliö merkitsee pisteen, jonka viiva ottaa.
3. Napsauta linjan pisteitä peräkkäin. Jokainen napsautus nimeää pisteen ja sen korkeuden tilarivillä.
4. Lopeta painamalla {{key:Enter}}.
   Tilarivi kertoo: ”Taitelinja 1 lisätty; maastomalli rakennettiin uudelleen.”

Napsautusten täytyy osua mittauspisteeseen, jolla on korkeus. Muualle tehty napsautus hylätään viestillä ”Napsauta mittauspistettä, jolla on korkeus: taitelinja ottaa pisteiden korkeudet.” {{key:Backspace}} poistaa viimeisen pisteen; {{key:Esc}} peruuttaa koko viivan.

:::warning
Lopeta {{key:Enter}}-näppäimellä. Kaksoisnapsautus lopettaa myös, mutta tässä versiossa se pudottaa kaksoisnapsautetun pisteen. Napsauta viimeistä pistettä kerran ja paina sitten {{key:Enter}}.
:::

Poistaaksesi kaikki piirretyt taitelinjat kerralla, napsauta {{ui:Remove drawn breaklines}} (Poista piirretyt taitelinjat) **Maastomalli**-osiosta. Poistaaksesi vain viimeisen, käytä {{key:Mod+Z}}. Piirrettyjä taitelinjoja ei vielä voi valita tai muokata yksitellen.

## Piirrä ulkoraja

Raja rajaa maastomallin alueelle, johon luotat, esimerkiksi mittausrajoihin, jolloin pitkät kolmiot mittaamattomien kulmien yli häviävät.

1. Paina {{key:O}} tai napsauta {{ui:Boundary}} (Raja).
2. Napsauta kulmia järjestyksessä alueen ympäri. Katkoviiva näyttää muodon.
3. Paina {{key:Enter}}.
   Tilarivi kertoo: ”Raja asetettu; sen ulkopuoliset kolmiot ovat poistuneet.” **Raja**-kohta maastomallin tiedoissa sanoo ”Kyllä” ja kertoo kulmien määrän.

Huomioitavaa:

- Rajoja on yksi. Uusi piirto korvaa vanhan. {{ui:Remove the boundary}} (Poista raja) poistaa sen.
- Raja voi vain vähentää: raja, joka ulottuu pisteiden ulkopuolelle, leikataan takaisin niiden ulkoreunaan huomautuksella ”Raja ulottuu pisteiden ulkopuolelle; se leikattiin takaisin niiden ulkoreunaan.”
- Sen kulmat saavat korkeutensa maastomallista, joten reuna seuraa maanpintaa tarkasti.
- Sisäisiä (piilotettavia) rajoja ei ole vielä käytettävissä.

## Typistä pitkät ulkokolmiot

Ilman rajaa maastomalli täyttää pisteiden koko ääriviivan, mukaan lukien pitkät ohuet kolmiot koveria reunoja pitkin.

1. Kirjoita **Pisin ulkoreuna** -kenttään pituus ja paina {{key:Enter}}. Aloita noin kahdesta tai kolmesta kertaa tyypillinen mittausvälisi.
2. Ulkokolmiot, joiden ulkoreuna on tätä pidempi, poistetaan, ja työ jatkuu sisäänpäin, kunnes jokainen ulkoreuna on tarpeeksi lyhyt. Taitelinjan reunaa ei koskaan kuoriteta.
3. Kirjoita 0 palauttaaksesi kaikki kolmiot.

## Lue maastomallin raportti

Maastomallin tietojen alla oleva laatikko luettelee, mitä rakentaja teki. Kun vasemmalla on oranssi palkki, kyse on tiedosta; punainen palkki tarkoittaa virhettä, eikä maastomallia ole.

| Viesti | Merkitys |
|---|---|
| ”3 pistettä oli samassa paikassa kuin toinen ja liittyi siihen.” | Pisteet, jotka ovat suunnitelmalla lähempänä kuin 0.0001, yhdistyivät yhdeksi kärkipisteeksi (ensimmäinen säilyi). |
| ”2 kohdassa on kaksi eri korkeutta …” | Päällekkäiset pisteet tai toisiaan leikkaavat taitelinjat ovat eri korkeuksilla. Taitelinjan korkeus voittaa, sen jälkeen ensimmäinen. |
| ”1 taitelinjan osaa ei voitu pakottaa maastomalliin.” | Hyvin lyhyt tai lähes päällekkäinen taitelinjan osa ei mahtunut; tarkista tämä kohta. |
| ”Maastomalli tarvitsee vähintään kolme pistettä, joilla on korkeus.” | Liian vähän pisteitä: tarkista sarakkeiden järjestys ja ryhmät. |
| ”Pisteet ovat kaikki samalla suoralla: ei kolmioita.” | Pisteillä ei ole leveyttä, esimerkiksi yksi mittajono. |
| ”Raja ei mene päällekkäin pisteiden kanssa.” | Raja on jossain muualla, usein yksikkö- tai koordinaattisekaannus. |
| ”Rajan sisään ei jää yhtään kolmiota.” | Raja on liian pieni tai väärässä kohdassa. |

## Maastomalli LandXML:stä

Kun avaat LandXML-tiedoston, sen ensimmäistä TIN-maastomallia käytetään sellaisenaan: **Maastomalli**-otsikko kertoo ”Maastomalli (LandXML:stä)” ja **Pisin ulkoreuna** on harmaana. Kun tuo maastomalli on käytössä, taitelinjaryhmät, piirretyt taitelinjat ja uusi raja eivät muuta sitä. Rakentaaksesi maastomallin tiedoston pisteistä napsauta {{ui:Rebuild the surface from the points}} (Rakenna maastomalli uudelleen pisteistä). {{key:Mod+Z}} palauttaa LandXML-maastomallin.

## Liittyvää

- [Lue korkeuskäyrät, korkeudet ja kaltevuudet](topic:contours).
- [Tuo mittauspisteet](topic:import-points).

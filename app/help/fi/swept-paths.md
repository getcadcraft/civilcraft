---
title: Ajoneuvon ajoradan pyyhkäisy
summary: Aja ajoneuvoa, jossa on enintään kolme perävaunua, pitkin piirrelinjaa tai linjausta, eteenpäin tai peruuttaen, ja katso alue, jonka se pyyhkäisee, sen pyörien radat, ohjaus sekä kohta, jossa se kääntyy poikittain.
keywords: ajoradan pyyhkäisy, kääntörata, ajoneuvon seuranta, kääntömalli, suunnitteluajoneuvo, kuorma-auto, linja-auto, perävaunu, puoliperävaunu, peruuttaminen, poikittain kääntyminen, nivelöinti, ohjauksen raja, sivuunajo, pyöräradat, lastauslaituri, kääntösäde
from: 8caafb8a
---

Ajoradan pyyhkäisy ajaa ajoneuvoa pitkin viivaa ja näyttää maan, jonka sen runko ylittää. Käytä sitä tarkistamaan, että kuorma-auto pystyy kääntymään mutkassa, pääsee lastauslaiturille tai peruuttaa perävaunun paikalleen ilman, että se poistuu päällysteeltä.

## Aja ajoneuvoa viivaa pitkin

1. Piirrä viiva, jota ajoneuvo seuraa, ajosuuntaan: piirrelinja (kaaret käyvät, paina piirtäessä {{key:C}}, katso [Piirrelinjat](topic:feature-lines)) tai linjaus.
2. Valitse se ja napsauta **Ominaisuuksissa** {{ui:Ajoradan pyyhkäisy…}}.
3. Kohdassa **Lähtö** valitse ajoneuvo ja aseta sen koot omasta suunnitteluajoneuvostasi: leveys, etuylänkö, akseliväli, takaylänkö, raideleveys ja **Ohjauksen raja**. Lisää enintään kolme perävaunua, kullekin kohta, johon se on kytketty, sen pituus kytkennästä akseliin, ylänkö ja **Suurin nivelkulma**.
4. Valitse **Ajo**: eteenpäin tai peruuttaen. Napsauta {{ui:Aja se}}.

:::warning
Lähtöajoneuvot ovat paikanpitäjiä, eivät standardi. Aseta koot projektisi käyttämästä suunnitteluajoneuvosta.
:::

## Eteenpäin ja peruuttaen

| Ajo | Mitä seuraa viivaa | Mitä CivilCraft laskee |
|---|---|---|
| **Eteenpäin** | Etuakselin keskikohta | Missä takaakseli ja jokainen perävaunu ovat, ohjauskulma ja nivelkulma |
| **Peruuttaen** | Viimeisen akselin keskikohta (perävaunun takaosa) | Missä kukin edessä oleva yksikkö on, ja ohjaus, jonka ohjaamo tarvitsee sijoittaakseen perävaunun siihen |

Peruuttaminen on tapa tarkistaa peruutusliike: sano, minne perävaunun pitäisi mennä, ja CivilCraft kertoo, pystyykö ohjaamo siihen.

## Lue tulos

Ajoradan pyyhkäisy piirtyy suunnitelmaan oranssina: sen ääriviiva ja katkoviivalla uloimpien pyörien radat. Valitse se (napsauta sen sisällä) nähdäksesi sen **Ominaisuuksissa**:

- **Ajettu pituus**, suurin **Ohjaus**-kulma ja **Nivelkulma** niiden rajoja vasten sekä **Pyyhkäisty ala**.
- Mikä tahansa ongelma linjan varrella etäisyyksineen: ohjaus lukon yli tai perävaunu, joka kääntyy nivelrajansa yli (se kääntyy poikittain).
- **Ajoneuvo linjalla**: siirrä liukusäädintä nähdäksesi ajoneuvon mihin tahansa kohtaan, sen ohjauksen ja nivelkulman siinä.

Muuta viivaa, ja ajoradan pyyhkäisy seuraa. {{ui:Muokkaa ajoneuvoa…}} muuttaa kokoja, ja **Ajo** vaihtaa eteenpäin ja peruuttaen välillä. Jokainen muutos on yksi askel: {{key:Mod+Z}} kumoaa sen. {{key:Delete}} poistaa valitun ajoradan pyyhkäisyn (viiva jää).

Ääriviiva ja pyöräradat menevät PDF-, DXF- ja DWG-tiedostoihin tasolle C-ROAD-SWPT.

## Miten se lasketaan

Jokainen yksikkö kääntyy takaakselinsa viivan ympäri, ja sitä vetää sen edessä oleva piste (etuakseli tai kytkentä). Malli on hitaan nopeuden, luistamattoman mallin mukainen, jota pyyhkäisyradan tarkistukset käyttävät. Pyyhkäisyalue on kaikkien asentojen rungon ääriviivat yhdistettyinä. Se ei mallinna nopeutta, renkaiden luistoa, ohjauksen kääntymisaikaa, ohjattavia perävaunuja eikä vapaata tilaa rungon alla.

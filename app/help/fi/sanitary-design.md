---
title: Jätevesien mitoitusvirtaamien laskenta ja viemärin tarkistus
summary: Anna jätevesiverkon kaivo kerrallaan ihmiset ja ala, jotka siihen tulevat; CivilCraft laskee ne yhteen verkossa alaspäin, laskee huippuvirtaaman huippukertoimella ja vuotovedellä ja tarkistaa jokaisen putken kapasiteetin ja virtausnopeuden.
keywords: jätevesi, viemäri, jätevesiviemäri, jätevesi, mitoitusvirtaama, huippuvirtaama, huippukerroin, Harmon, Babbitt, vuotovesi, asukasmäärä, asukasta kohden, täyttöaste, itsepuhdistuva, virtausnopeus, putkikoon mitoitus, mitoituslaskelma
from: 73ba197a
---

Jätevesien mitoitusvirtaamat toimivat [putkiverkolle](topic:pipe-network), kun sen {{ui:Tyyppi}} on {{ui:Jätevesi}}. Kun mitään ei ole valittu, oikea paneeli näyttää **Jätevesien mitoitusvirtaamat** -kohdan, jossa hulevesiverkko näyttää hulevesien ojituksen.

## Anna tulevat virtaamat

1. Valitse kaivo. Kohdassa **Jätevesien mitoitusvirtaamat** kirjoita {{ui:Tähän tulevat ihmiset}} ja {{ui:Tähän tuleva ala}} (hehtaareina metrijärjestelmäprojektissa, eekkereinä jalkaprojektissa).
2. Kaupoille, toimistoille tai teollisuudelle kirjoita vastaavat ihmiset: ala kerrottuna sen asukasmäärällä hehtaaria (tai eekkeriä) kohden, jota virastosi käyttää. Ala lasketaan vuotoveteen kummassakin tapauksessa.
3. Toista jokaiselle kaivolle, johon katu tai tontti liittyy. Kaivo, johon ei liity mitään, pitää molemmat arvot 0:ssa.

Jokainen putki kuljettaa kaiken, mikä tulee sen ylemmässä kaivossa ja sen yläpuolella. Valitse kaivo nähdäksesi, mikä siitä kulkee läpi.

## Asetukset

| Asetus | Mitä se tarkoittaa |
|---|---|
| {{ui:Virtaama henkeä kohden}} | yhden ihmisen keskimääräinen päivävirtaama: litraa (metrijärjestelmäprojekti) tai USA:n gallonaa (jalkaprojekti) |
| {{ui:Vuotovesi}} | pohjavesi, joka vuotaa sisään: litraa sekunnissa hehtaaria kohden tai gallonaa päivässä eekkeriä kohden |
| {{ui:Huippukerroin}} | Harmon, 1 + 14 / (4 + √P), tai Babbitt, 5 / P^0.2, missä P on asukasmäärä tuhansina |
| {{ui:Huippukerroin vähintään}} / {{ui:Huippukerroin enintään}} | kerroin pidetään näiden kahden välissä |
| {{ui:Manningin n}} | kapasiteetille ja virtausnopeudelle |
| {{ui:Vähimmäisnopeus}} / {{ui:Enimmäisnopeus}} | huippuvirtaaman oman syvyyden mukaan putkessa |
| {{ui:Enintään täyden kapasiteetin}} | kuinka täynnä putki saa olla huipussa, prosentteina siitä, mitä se kuljettaa täytenä |

Lähtöarvot ovat paikkamerkkejä, eivät standardi. Käytä arvoja, jotka virastosi julkaisee.

## Mitä se laskee

Jokaiselle putkelle virtausjärjestyksessä:

- huippuvirtaama = ihmiset × virtaama henkeä kohden × huippukerroin + ala × vuotovesi
- kapasiteetti täytenä (Manningin yhtälö putken kaltevuudella) ja kuinka täynnä huippu sen tekee
- huippuvirtaaman normaali syvyys ja siinä oleva virtausnopeus

Taulukko **Jätevesien tulokset** listaa kunkin putken ihmiset, huippukertoimen, huippuvirtaaman (l/s tai gpm ja kuutiojalkaa sekunnissa), täyttöasteen prosentteina ja virtausnopeuden. Ongelmat luetellaan sen alla: putki, joka on täyttä yli rajan, hitaampi kuin vähimmäisnopeus (se ei ehkä puhdistu itsestään), nopeampi kuin enimmäisnopeus tai ilman kaltevuutta. {{ui:Mitoita putket näille virtaamille}} valitsee kullekin putkelle pienimmän vakiokoon (200 mm tai 8 tuumaa ja suuremmat), joka kuljettaa huippunsa rajan sisällä; yksi {{key:Mod+Z}} kumoaa sen.

:::note
Tämä on vakaa huippuvirtaama, jonka mitoituslaskelma laskee, tarkistettuna julkaistuun mitoituslaskelmaan sen painettuun pyöristykseen asti. Se ei ole malli viemäristä ajan kuluessa: ei hydrografeja, varastointia, pumppuja eikä ylivuotoja. Katso [Ei vielä toteutettu](topic:not-built-yet).
:::

Virtausnopeudet käyttävät Manningin yhtälöä samalla n-arvolla jokaisessa syvyydessä. Jotkin virastot antavat n:n vaihdella syvyyden mukaan, mikä antaa hieman pienemmän virtausnopeuden putkessa, joka on 60–70 prosenttia täynnä (noin 3 prosenttia vähemmän).

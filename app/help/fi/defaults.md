---
title: Lähtöarvot ja paikkamerkit
summary: Jokainen arvo, jolla CivilCraft aloittaa uusille projekteille, näytöille, linjauksille, alustoille, käytäville, putkiverkoille, tilavuuksille ja piirroksille, ja mitkä niistä ovat paikkamerkkejä, jotka täytyy korvata.
keywords: oletukset, asetukset, lähtöarvot, paikkamerkit, suunnitteluperusteet, standardit, säännöt, olettamukset
from: fbfc7432
---

CivilCraft ei sisällä asetusikkunaa eikä mallipohjaa. Nämä ovat arvoja, joista asiat lähtevät liikkeelle. Arvot, jotka on merkitty **paikkamerkiksi**, eivät ole peräisin mistään standardista: korvaa ne projektisi perusteilla, ennen kuin luotat tarkistukseen tai määrään.

## Uusi projekti

| Asetus | Arvo |
|---|---|
| Nimi | Nimetön kohde (ensimmäisen pistetiedoston nimi korvaa sen) |
| Yksiköt | US feet |
| Maastomallin nimi | Nykyinen maanpinta |
| Pisteryhmät | Jokainen ryhmä alkaa tilasta {{ui:Pisteet}} |
| Pisin ulkoreuna | 0 (säilytä jokainen kolmio) |
| Säilytettyjä kumoamisvaiheita | 200 |

## Näyttö

| Asetus | Arvo |
|---|---|
| Maastomalli | {{ui:Nykyinen maanpinta}} |
| Korkeuskäyrät välein | 1 (ft tai m) |
| Pääkäyrät välein | 5. käyrä |
| Vyöhykkeitä | 8 |
| Päällä | Korkeuskäyrät, korkeuskäyrien tunnisteet, pisteet, taitelinjat, maastomallin reuna, putket |
| Pois | Kolmiot, korkeusvyöhykkeet, kaltevuusnuolet, pistetunnisteet |

## Linjaukset ja pituusleikkaukset

| Asetus | Arvo |
|---|---|
| Nimi | Linjaus 1, Linjaus 2 … |
| Alkupaalu | 0+00 |
| Kaaren säde kussakin sisäisessä PI:ssä | 100 ft tai 30 m, pienempi, jos se ei mahdu puoleen kumpaankin tangenttiin |
| Suunnitelman pituusleikkaus | Ei mitään, ennen kuin aloitat; {{ui:Aloita maanpinnasta}} asettaa PVI:n maanpinnalle kumpaankin päähän |
| Pystykaaren pituus | 0 (ei kaarta), kunnes kirjoitat arvon |

## Alustat

| Asetus | Arvo |
|---|---|
| Nimi | Alusta 1, Alusta 2 … |
| Korkeus | Maanpinta alustan keskikohdassa, pyöristettynä 0.1:een (0, jos keskikohta on maastomallin ulkopuolella) |
| Leikkausluiska | 2 : 1 (paikkamerkki) |
| Penkereen luiska | 3 : 1 (paikkamerkki) |

## Käytävän kokoonpano (paikkamerkit)

| Asetus | US feet | Metrit |
|---|---|---|
| Kaistan leveys | 12 ft | 3.6 m |
| Kaistaluiska | 2% | 2% |
| Piennarin leveys | 4 ft | 1.2 m |
| Piennarluiska | 4% | 4% |
| Leikkausluiska | 2 : 1 | 2 : 1 |
| Penkereen luiska | 3 : 1 | 3 : 1 |
| Poikkileikkaus joka | 10 ft | 5 m |

## Putkiverkko

| Asetus | US feet | Metrit |
|---|---|---|
| Nimi ja tyyppi | Hulevesi, hulevesi | Hulevesi, hulevesi |
| Pienin kaltevuus (paikkamerkki) | 0.50 % | 0.50 % |
| Pienin peitesyvyys (paikkamerkki) | 2 ft | 0.6 m |
| Pudotus rakenteissa (paikkamerkki) | 0.10 ft | 0.03 m |
| Uuden rakenteen halkaisija | 48 in | 1200 mm |
| Uuden putken halkaisija | 12 in | 300 mm |
| Lietekuopan syvyys | 0 | 0 |
| Kansi | Maastomallista | Maastomallista |

Myös LandXML-tiedostosta avattu putkiverkko käyttää näitä sääntöjä, koska LandXML ei sisällä niitä.

## Tilavuudet

| Asetus | Arvo |
|---|---|
| Menetelmä | Ruudukko, näytteet solukeskuksissa maanvarausviivojen sisällä |
| Solun koko | Valitaan niin, että tasatun alueen rajaava suorakulmio sisältää noin 250,000 solua (1, 2 tai 5 kertaa kymmenen potenssi) |
| Paisuminen ja kutistuminen | Ei mitään |

## Tulostus

| Asetus | Arvo |
|---|---|
| Alue | {{ui:Kaikki}} |
| Paperi | Tabloid 11 × 17 in (jalkaprojektit), ISO A3 (metriprojektit); aina vaaka |
| Mittakaava | Suurin luetelluista mittakaavoista, joka mahtuu |
| Muste | {{ui:Tasojen värit}} |

DXF-tunnisteet mitoitetaan mittakaavaan, jossa kaikki mahtuu Tabloid-paperille (jalat) tai A3-paperille (metrit).

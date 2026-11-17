---
title: Kuvausavaimet ja viivakoodit
summary: Muuta kenttäkoodit pistekuvauksilla varustetuiksi pisteryhmiksi ja yhdistä koodatut pisteet viivoiksi (alku, loppu, sulkeminen), jotka muuttuvat taitelinjoiksi.
keywords: kuvausavaimet, kenttäkoodit, viivakoodit, kuviot, viivat, alku, loppu, sulje, pisteryhmät, koodit, mittauskoodit, tiedonkeruulaite, taitelinjat, reunakivi, päällysteen reuna
from: b3d1af8d
---

Mittausryhmät koodaavat jokaisen mittauksen kentällä: `EP` päällysteen reunalle, `TC` reunakiven yläreunalle, `BLDG` rakennuksen kulmalle. Koodi on pisteen kuvauksen ensimmäinen sana. CivilCraft ryhmittelee pisteet sen mukaan ja muuttaa sen jälkeen tulevat viivakoodit viivoiksi.

## Viivakoodit

Viivakoodi on sana heti kenttäkoodin jälkeen:

| Kuvaus | Merkitys |
|---|---|
| `EP B` | Aloita uusi päällysteen reunaviiva tästä pisteestä |
| `EP` | Jatka nykyistä EP-viivaa |
| `EP E` | Lopeta nykyinen EP-viiva tähän pisteeseen |
| `BLDG C` | Sulje rakennus: yhdistä tämä piste viivan ensimmäiseen pisteeseen |

Samalla koodilla varustetut pisteet yhdistetään pistenumerojärjestyksessä. Eri koodit ovat eri viivoja, vaikka ne jakavat ryhmän, joten `EP1` ja `EP2` antavat kaksi reunaa yhtä aikaa. Koodi, jolla ei koskaan ole viivakoodia, yhdistetään kaikkien pisteidensä läpi, kuten aiemmissa versioissa.

Ryhmän viivat, joita käytetään **Taitelinjana**, muuttuvat taitelinjoiksi, yksi kutakin viivaa kohden, joten reunakivi, jossa on aukko, ei venyy aukon yli. Muiden ryhmien viivat piirretään suunnitelmalle (taso V-NODE-LINE) ja viedään DXF-, DWG- ja PDF-muotoon.

Alun, lopun ja sulkemisen sanat ovat `B`, `BEG`, `START`; `E`, `END`; ja `C`, `CLO`, `CLOSE`. Voit muuttaa niitä tai kytkeä viivakoodit pois alla olevassa valintaikkunassa.

## Kuvausavaimet

Kuvausavain muuttaa koodin pisteryhmäksi, käyttötavaksi ja pitkäksi kuvaukseksi.

1. Kohdassa **Pisteet** napsauta {{ui:Kuvausavaimet ja viivakoodit}}.
2. Napsauta {{ui:Lisää avain}} ja täytä rivi:
   - **Koodi**: vastaava kenttäkoodi. `*` tarkoittaa mitä tahansa merkkejä ja `?` yhtä merkkiä, joten `EP*` tavoittaa EP, EP1 ja EP12.
   - **Ryhmä**: pisteryhmä, johon nämä pisteet liittyvät (tyhjä = koodi itse). `EP*`, jonka ryhmä on `EP`, sijoittaa EP1:n ja EP2:n samaan ryhmään, vaikka ne pysyvät erillisinä viivoina.
   - **Käyttö**: Pisteet, Taitelinja tai Jätä pois, sille hetkelle, kun ryhmä ensimmäisen kerran ilmestyy (tai jätä se **Pisteet**-taulukon hoidettavaksi).
   - **Kuvaus**: pitkä nimi, joka näkyy pisteen **Ominaisuudet**-kohdassa.
3. Sarake **Pisteet** laskee, kuinka monta pistettä kukin avain tavoittaa, kun kirjoitat. Ensimmäinen koodiin osuva avain voittaa.
4. Napsauta {{ui:Käytä}}. Ryhmät, maastomalli ja suunnitelma seuraavat yhdellä vaiheella: {{key:Mod+Z}} kumoaa sen.

Ryhmä säilyttää käyttötavan, jonka annoit **Pisteet**-taulukossa; avaimen käyttötapa asettaa sen vain uudelle ryhmälle. Avaimet ja viivakoodit tallennetaan projektitiedostoon.

---
title: Syötä jonomittaus ja tasoita se kompassisäännöllä
summary: Kirjoita kenttäkulmat tai suuntakulmat ja etäisyydet, tarkista kulmien ja pituuden umpeutumisvirhe sekä tarkkuus, tasoita kompassisäännöllä ja lisää asemapisteet pisteiksi tai silmukka tontiksi.
keywords: jonomittaus, suljettu jonomittaus, silmukka, kulmat oikealle, takatähtäys, suuntakulmat, etäisyydet, umpeutuminen, umpeutumisvirhe, tarkkuus, kompassisääntö, bowditch, tasoitus, mittaus
from: 56ce5a8c
---

Jonomittaus on sarja mitattuja osuuksia: jokaisella asemapisteellä on kulma (tai suuntakulma) ja etäisyys seuraavaan. Napsauta **Syötä jonomittaus** kohdassa **Jonomittaus** oikeassa paneelissa, kun mitään ei ole valittu.

## Mistä se alkaa ja loppuu

1. **Aloita pisteestä**: sen numero. Tai kirjoita pohjoinen ja itä.
2. **Osuudet muodossa**: **Kulmat oikealle ja etäisyydet**, tai **Suuntakulmat ja etäisyydet**.
3. Kulmilla kerrotaan, mistä ne alkavat: **takatähtäyspiste**, tai **sen atsimuutti** (ensimmäiseltä asemapisteeltä takatähtäykseen, myötäpäivään pohjoisesta).
4. **Päättyy**: **takaisin lähtöpisteeseen (silmukka)**, tai **pisteeseen** ja sen numeroon (avoin jonomittaus tunnettujen pisteiden välillä).

## Kirjoita osuudet

Yksi osuus on yksi rivi: ensin kulma, sitten etäisyys ja halutessasi sen asemapisteen nimi, johon osuus päättyy:

- Kulmat oikealle, myötäpäivään osuuden lähtöasemalla, takana olevasta asemasta seuraavaan: `270°00'10" 125.50 B`. Myös `270-00-10`, `270 00 10` ja `270.0028` käyvät.
- Suuntakulmat: `N 45°30'15" E 125.50 B`, tai atsimuutti yhtenä sanana: `AZ 45-30-15 125.50 B`.
- Silmukassa kulmilla lopeta rivillä `close` ja lähtöaseman kulma uudelleen, kierrettynä viimeiseltä asemalta toiseen: `close 270°00'05"`. Sillä kulmat tarkistetaan.

Lukemattomat rivit luetellaan rivinumeroineen. ”feet”, pilkut ja `#`-kommenttirivit käyvät.

## Lue umpeutuminen

Kirjoittaessa valintaikkuna näyttää:

- **Kulmien umpeutumisvirhe**: kuinka paljon kulmat ovat umpeutumasta, ja kunkin kulman osuus. Ilman sulkukulmaa kulmia ei tarkisteta, ja niiden virhe näkyy pituuden umpeutumisvirheessä.
- **Pituuden umpeutumisvirhe**: kuinka kaukana jonomittaus päättyy siitä, missä sen pitäisi päättyä, ja mihin suuntaan.
- **Tarkkuus**: jonomittauksen pituus jaettuna pituuden umpeutumisvirheellä: 1 : 10,000 tarkoittaa 1 ft 10 000 ft:n matkalla.
- Asemapisteet tasoituksen jälkeen ja kuinka paljon kukin siirtyi.

## Tasoitus

Ensin kulmien umpeutumisvirhe jaetaan tasan kulmien kesken. Sitten pituuden umpeutumisvirhe jaetaan osuuksille kompassisäännöllä (Bowditch): kukin asemapiste siirtyy umpeutumisvirhettä vastaan suhteessa siihen matkaan, joka on kuljettu sinne, joten jonomittaus päättyy täsmälleen oikeaan kohtaan.

:::note
Kompassisääntö on vakiotasoitus, ei pienimmän neliösumman tasoitus, eikä se punnitse kulmia ja etäisyyksiä keskenään. Riittääkö tarkkuus, on oman ohjeistuksesi ja lainkäyttöalueesi ratkaistava.
:::

## Tulosten käyttö

- **Lisää pisteiksi**: tasoitetuista asemapisteistä tulee pisteitä, joilla on antamasi nimet (muuten seuraavat vapaat numerot), kuvaus `TRAV` eikä korkeutta. Silmukan viimeinen asemapiste on sen lähtöpiste, joten sitä ei lisätä kahdesti. Yksi askel: {{key:Mod+Z}} kumoaa sen.
- **Lisää tonttina** (silmukat): tasoitetuista asemapisteistä tulee [tontti](topic:parcels), jolla on omat tunnisteensa ja kiinteistökuvauksensa.
- **Raportti (CSV)**: umpeutumisrivit, sitten kunkin aseman suunta, etäisyys, tasoittamattomat ja tasoitetut koordinaatit sekä korjaukset.

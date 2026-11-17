---
title: Maanpinnan muokkaajat ja elävät korkeudet
summary: Kaikki, mikä muovaa suunniteltua maanpintaa yhdessä järjestetyssä luettelossa (myöhempi voittaa, jos kohdat menevät päällekkäin), leikkaus ja penger muokkaajittain, liitoskohtien tarkistukset Ongelmat-paneelissa sekä korkeuspisteet ja kaltevuusnuolet, jotka lukevat maanpinnan elävästi.
keywords: maanpinnan muokkaajat, pino, järjestys, suunniteltu maanpinta, nykyinen maanpinta, päällekkäisyys, leikkaus ja penger, liitos, tukimuuri, päällystyksen reuna, pohjan korkeus, askelporras, korkeuspiste, korkeuspisteen merkintä, kaltevuusnuoli, luiskan merkintä, kaltevuus
from: 3998a5b0
---

Suunniteltu maanpinta = nykyinen maanpinta + muokkaajat järjestyksessä. Nykyistä maanpintaa ei koskaan muuteta.

## Luettelo

{{ui:Korkeudet}} › {{ui:Maanpinnan muokkaajat…}} listaa kaikki kohteet, jotka muovaavat maanpintaa: tasanteet, maavallit, laskuojat, tasausalueet, päällystykset ja polut, valmiin korkeuden kanssa olevat istutusalueet sekä portaat ja rampit, joiden **Muovaa maanpintaa** -ruutu on rastitettu (pohjan ja pinnan korkeuksineen). Kun kaksi kohdetta menee päällekkäin, **myöhempi** voittaa. Vedä rivi tai käytä nuolia järjestyksen muuttamiseen; maanpinta rakentuu heti uudelleen. Jokainen rivi näyttää oman leikkauksensa ja pengerryksensä (mitä se muovaa edellä olevien jälkeen), ja luettelon alla on yhteissumma.

## Liitoskohtien tarkistukset

Ongelmat-paneeli listaa seuraavat kohdat, joissa on **Siirry**-linkki:

- seinä, jonka korkea puoli on sen yläpinnan yläpuolella (maa seinän päällä), tai jonka matala puoli näyttää sen perustuksen;
- istutusalue, jonka valmis korkeus on päällystyksen reunan yläpuolella, tai joka on tyypillisesti yli 150 mm alempana kuin se;
- portaat, joiden pohja tai yläpinta ei kohtaa päällystystä, jolle ne laskeutuvat;
- kaksi päällekkäistä muokkaajaa (myöhempi voittaa siinä kohdassa).

Tukimuurin yläpinta voi seurata maanpinnan korkeaa puolta: sen korkeus lasketaan uudelleen aina, kun maanpinta muuttuu.

## Tukimuuri, joka muovaa maanpintaa

Valitse tukimuuri ja rastita **Muovaa maanpintaa**. Seinän alla oleva kaista (yhtä leveä kuin seinä on paksu) liittyy luetteloon muokkaajana:

- **korkean puolen** reuna pidetään maanpinnassa siellä, paalu paalulta, joten seinän yläpinta seuraa korkeaa puolta (harjakiven kera sen päällä). Kirjoita **Yläpinta**-taso, niin korkea puoli pidetään siinä tasossa miinus harjakivi;
- **matalan puolen** reuna pidetään **Matalalla puolella pidettävä maanpinta** -kentässä kirjoittamassasi tasossa, tai jos kenttä on tyhjä, siinä kohdassa olevassa maanpinnassa;
- korkea puoli on se puoli, jonka maanpinta on koko seinän matkalla korkeampi, joten se ei koskaan vaihdu seinän varrella;
- kaistan ulkopuolista maanpintaa ei muuteta, eikä nykyistä maanpintaa koskaan.

Kuten mikä tahansa muokkaaja, se on luettelossa, ja sen jälkeen luettelossa oleva muokkaaja voittaa siinä, missä ne menevät päällekkäin. Seinä, jonka pidetty taso jossakin päässä on yli tyypillisen 150 mm:n etäisyydellä nykyisestä maanpinnasta, saa varoituksen Ongelmat-paneeliin (**Siirry**-linkillä). Vapaasti seisova seinä ei muovaa maanpintaa. Ruutu on pois päältä aiemmilla versioilla tehdyissä tiedostoissa, joten ne avautuvat entisellään.

## Korkeuspisteet ja kaltevuusnuolet

{{ui:Korkeuspiste}} (yksi napsautus) ja {{ui:Kaltevuusnuoli}} (kaksi napsautusta) lukevat maanpinnan joka kerta, kun ne piirretään: kun siirrät tai tasaat kohdetta uudelleen, merkinnät seuraavat mukana. Ominaisuuksissa valitse, lukeeko merkintä suunniteltua vai nykyistä maanpintaa; nykyisen maanpinnan merkinnät näytetään sulkeissa. Nuolet osoittavat alamäkeen ja kertovat esimerkiksi `1:20 (5.0 %)`.

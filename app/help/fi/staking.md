---
title: Tee maastoon merkintäraportti
summary: Listaa paalut linjauksen varrella paaluluvuilla ja poikkeamilla tai linjauksen lähellä olevat pisteet, joissa on paaluluku, poikkeama, pohjoiskoordinaatti, itäkoordinaatti, suunnitelman ja maanpinnan korkeudet sekä leikkaus tai täyttö. Tallenna raportti CSV- tai PDF-tiedostona.
keywords: maastoon merkintä, paalutus, merkintäraportti, leikkausarkki, tasausarkki, paaluluku, paalu, poikkeama, leikkaus, täyttö, asettelu, rakennusaikainen merkintä, toteutunut
from: d8a4e9f1
---

Valitse linjaus ja napsauta sen **Ominaisuuksissa** **Maastoon merkintäraportti**.

## Paalut paaluluvuilla ja poikkeamilla

1. **Alkaen** ja **päättyen**: merkittävät paaluluvut (1+50 tai 150).
2. **Välein**: väli. Paalut sijoitetaan jokaisen sen kerrannaisen kohdalle molempiin päihin ja (kun ruutu on rastitettu) kohtiin, joissa linjauksen kaaret alkavat ja päättyvät.
3. **Poikkeamat**: linjauksen vasemmalle ja oikealle puolelle, katsoen paaluluvun suuntaan: `12 L, 0, 12 R`, `L12 CL R12` tai `-12, 0, 12` (vasen on miinus). Linjauksessa, jolla on käytävä, alkuina ovat päällysteen ja pientareiden reunat.
4. **Numeroi alkaen** ja **etuliitteellä** nimeävät paalut: 1, 2, 3 tai S101, S102.

## Linjauksen lähellä olevat pisteet

Valitse **Linjauksen lähellä olevat pisteet** ja kuinka lähellä. Jokainen tuon etäisyyden sisällä oleva piste saa paalulukunsa ja poikkeamansa, suunnitelman korkeuden siinä kohdassa ja oman korkeutensa maanpinnaksi. Tämä on tarkistus pisteille, jotka on merkitty tai mitattu toteutuneina.

## Mitä raportti kertoo

| Sarake | Mitä se on |
|---|---|
| Piste | Paalun nimi tai mittauspisteen numero |
| Paaluluku, Poikkeama | Missä se on linjauksen varrella: L vasen, R oikea |
| Pohjoinen, Itä | Sen koordinaatit |
| Suunnitelman korkeus | Tasatun käytävän pinta siinä kohdassa (luiskaviivalta luiskaviivalle), muuten suunnitelman pituusleikkaus keskilinjalla |
| Maanpinnan korkeus | Olemassa oleva pinta siinä kohdassa, tai pisteen oma korkeus |
| Cut/fill | C kun maanpinta on suunnitelman yläpuolella (leikkaa alas), F kun alapuolella (täytä ylös), sadasosaan asti |

Paalulla, jolla ei ole suunnitelman korkeutta (käytävän ulkopuolella, tai linjauksella, jolla sitä ei ole keskilinjan ulkopuolella), ei ole leikkausta eikä täyttöä. Ikkuna kertoo, montako niitä on.

## Tallenna se

- **CSV**: otsikkorivi, yllä olevat sarakkeet sekä leikkaus tai täyttö etumerkillisenä lukuna (maanpinta miinus suunnitelma) taulukkolaskentaan ja tiedonkeruulaitteisiin.
- **PDF**: taulukkosivut valitsemallasi paperilla, yksi paalu riviä kohti, leikkaukset oranssilla ja täytöt vihreällä, muiden arkkien otsikkokaistalla.

:::note
Paalut lasketaan projektin suunnitelmasta. Tarkista ne hyväksyttyjä suunnitelmia vasten ennen kuin mitään rakennetaan.
:::

---
title: Sijoita aurinkopaneelirivit maahan
summary: Sijoita maahan asennettavat aurinkopöydät tonttiin tai alustaan niin, että rivit ovat välein maaston mukaan, johon kukin todella seisoo. Jyrkkä maasto jätetään tyhjäksi, vuoden energia lasketaan ja pöydät näytetään suunnitelmassa ja 3D:ssä.
keywords: aurinkopaneeli, pv, aurinkosähkö, rivi, maa-asennus, pöydät, rivit, riviväli, varjo, maasto, rinne, paalut, tuotto, kWp, energia, horisontti
from: 95593fd6
---

## Mitä opit

Miten aurinkopöytäkenttä sijoitetaan epätasaiselle kohteelle ja mitä luvut tarkoittavat. Avaa se valinnalla Maastomalli › Lisää › Aurinkopaneelirivit.

## Pöytien sijoittaminen

1. Valitse **Missä**: projektin tontti tai alusta, tai kirjoita alueen kulmat. Rastita mahdolliset alustat tai tontit, jotka on pidettävä **tyhjinä** (rakennus, lampi).
2. Kirjoita kohteen **leveyspiiri ja pituuspiiri**. Aurinko riippuu niistä, eikä mitään arvata. Jos projektilla on koordinaattijärjestelmä, **Täytä koordinaattijärjestelmästä** täyttää ne.
3. Aseta kallistus, suuntaus (tyhjä tarkoittaa päiväntasaajaan päin), montako moduulia yhdessä pöydässä on sekä moduulin teho ja koko. Moduulilukujen alkuarvot ovat yleisiä ja merkitty niin; kirjoita omat.
4. Paina **Sijoita pöydät**. Ikkuna näyttää pöytien ja moduulien määrän, koon kWp-yksikössä ja rivien välisen etäisyyden.

Jokainen pöytä on alueen pylväs, joka sijoitetaan edestä ja kuljetaan takaisin päin. Pöytä sijoitetaan vain kohtaan, jossa maan rinne sen alla on rajan sisällä, pöytä on alueen ja rakennusrajan sisällä, ja sen tarvitsemat paalut eivät ylitä asetettua rajaa. Epäonnistuneet paikat jätetään tyhjiksi, ja ikkuna kertoo, montako ja miksi.

## Rivit ovat sijoitettu maaston mukaan

Tasaisella maalla rivit ovat etäisyyden päässä tavanomaisen varjosäännön mukaan: rivin varjo keskipäivällä talvipäivän seisauksena ei saa ulottua seuraavan rivin alareunaan. Rinteellä CivilCraft soveltaa samaa sääntöä maahan, jolle seuraava rivi todella seisoo. Missä maa nousee pöydän takana, rivit voivat olla lähempänä toisiaan; missä maa laskee pois, ne ovat kauempana. Ikkuna näyttää lähimmän, kaukaisimman ja keskimääräisen välin tasaisen maan välin rinnalla, jotta näet, mitä maasto teki.

Pöydän taso nostetaan paaluille, kunnes jokainen sen alla oleva näytepiste on asetetun vapaan korkeuden päässä maasta. Korkein paalu näkyy tuloksessa.

## Vuoden energia

**Vuoden energia** laskee valon kallistetulle tasolle kunkin kuukauden edustavana päivänä, kennon lämpötilan, kirjoitetut häviöt, pöytien keskinäisen varjostuksen ja kukkuloiden horisontin, joka ottaa auringon, jonka ne peittävät. Taivas on selkeä taivas, joten tulos on ylärajan arvio; todellinen sää antaa vähemmän. Kyseessä on alustavan suunnittelun arvio, ei tuottoraportti.

## Tallenna se

**Tallenna projektiin** säilyttää lähtötiedot ja luvut projektitiedostossa. Pöydät lasketaan maastosta uudelleen, kun tiedosto avataan, joten muutettu pinta siirtää niitä. Ne näkyvät suunnitelmassa ja 3D:ssä (Näytä › Aurinkopaneelirivit). Pöytäluettelo ladataan CSV-tiedostona. Yksi kumoamisaskel poistaa rivin tai palauttaa sen.

## Ei vielä toteutettu

Säädata selkeän taivaan tilalle, pöydät, jotka seuraavat maastoa itä–länsi-suunnassa, seurantajärjestelmät ja sähkösuunnittelu (jonot, johdot, invertterit) CivilCraftissa. BimCraftin Solar PV -paneelissa on jonot ja yksiviivakaavio katoille.

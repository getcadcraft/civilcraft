---
title: Kastelusuunnittelu
summary: Laskenta-apu, ei leimattua suunnitelmaa: suuttimet, haaraputket, runkolinja, venttiilit ja tippukastelulinjat kohteella; vyöhykkeet putkista; painehäviö Hazen–Williams-kaavalla, pahimman tapauksen suutin, virtaus ja paine syötön suhteen, sadantanopeudet, käyttöajat, kattavuus ja osaluettelo.
keywords: kastelu, sprinkleri, sprinklerit, suihku, roottori, pyörivä suutin, kuplakastelu, tippukastelu, tippukastelulinja, tiputin, venttiili, vyöhyke, asema, ohjain, runkolinja, haaraputki, liityntäpiste, vesisyöttö, paine, psi, kpa, virtaus, gpm, kitkahäviö, Hazen Williams, sadantanopeus, käyttöaika, kattavuus, suutin suuttimeen, osaluettelo
from: 7d6342c1
---

:::warning
Tämä on laskenta-apu, ei leimattu suunnitelma: kastelusuunnittelija tarkistaa jokaisen tuloksen ennen kuin mitään rakennetaan.
:::

## Järjestä järjestelmä

1. **Kastelu**-osiossa vasemmalla valitse **Suutin**, sen **Sektori** ja mistä sektori alkaa, sekä haaraputkien ja runkolinjan putkikoot.
2. {{ui:Kastelu}} › {{ui:Liityntäpiste}}: napsauta kohtaa, jossa vesisyöttö liittyy. Aseta sen **paine**, käytettävissä oleva **virtaus** sekä mittarin ja takaisinvirtauksen eston häviö Ominaisuuksissa.
3. {{ui:Kastelu}} › {{ui:Venttiili}}: napsauta kohtaa, johon kunkin vyöhykkeen venttiili menee. Venttiili aloittaa vyöhykkeen.
4. {{ui:Kastelu}} › {{ui:Suutin}}: napsauta sijoittaaksesi suuttimia; jokainen napsautus sijoittaa yhden.
5. {{ui:Kastelu}} › {{ui:Haaraputki}}: napsauta venttiilistä sen suuttimien kautta ja paina {{key:Enter}}. {{ui:Runkolinja}}: liityntäpisteestä jokaiseen venttiiliin.

Putkien päät tarttuvat suuttimiin, venttiileihin, syöttöön ja muiden putkien päihin, joten verkko liittyy yhteen. Vyöhyke on kaikki, mihin päästään sen venttiilistä haaraputkia pitkin; runkolinja kuljettaa kerrallaan yhtä vyöhykettä.

## Tippukastelu

{{ui:Kastelu}} › {{ui:Tippukastelulinja}}: napsauta linjaa pitkin alkaen kohdasta, josta se syötetään (haaraputken pää tai venttiili). Aseta **tiputtimen virtaus** ja **väli** Ominaisuuksissa; sen virtaus on linjan varrella olevien tiputtimien virtaus.

## Tarkistus

{{ui:Kastelu}} › {{ui:Tarkista järjestelmä…}} luettelee jokaisen vyöhykkeen:

| Sarake | Miten se lasketaan |
|---|---|
| Virtaus | Suuttimien (ja tippukastelulinjojen) virtaukset yhteen laskettuina |
| Venttiilillä | Pahimman tapauksen suuttimen työpaine plus putkihäviöt siihen (Hazen–Williams, putken sisähalkaisija, korkeusero) ja häviö venttiilin läpi |
| Syötössä | Sama plus sen vyöhykkeen kuljettavan runkolinjan häviö sekä mittarin ja takaisinvirtauksen eston häviö |
| Sadanta | Suuttimien virtaus jaettuna alalla, jota ne kastelevat suutinetäisyydellä suutin suuttimeen |
| Minuutit viikossa | Käytetään **Vettä viikossa** -asetusta |
| Ongelmat | Nopeus rajan yli, suutin painealueensa ulkopuolella, sumusuuttimia ja roottoreita samalla venttiilillä, liian vähän painetta tai virtausta syötössä, suuttimia ilman vyöhykettä, silmukat |

Valitse venttiili nähdäksesi sen vyöhykkeen luvut ja sen pahimman tapauksen suuttimen rengastettuna suunnitelmalla. Osaluettelo laskee suuttimet lajin ja sektorin mukaan, putket koon mukaan, venttiilit, tippukastelulinjan ja tiputtimet sekä ohjaimen asemat. **Tallenna CSV:nä** säilyttää molemmat.

Asetukset Kastelu-osiossa: **Hazen–Williams C** (150 uudelle muoviputkelle), putken **nopein virtaus** (1.5 m/s), **häviö venttiilin läpi** ja **Vettä viikossa**. Ne on merkitty oletusarvoiksi.

## Kattavuus

{{ui:Kastelu}} › {{ui:Näytä kattavuus}} kertoo, kuinka suuren osan alueesta suuttimet jättävät kuivaksi, kuinka suurta osaa kastelee kaksi tai useampi suutin ja mitkä suuttimet eivät ylety naapuriinsa (suutinetäisyys suutin suuttimeen).

## Suuttimet

Luetellut suuttimet ovat CadCraftin tuottamia **yleisiä** lajeja suunnittelun sadantanopeuksista (kiinteät suihkut, pyörivät suuttimet, hammasrattaisroottorit, kuplakastelijat, mikrosuihkut, tiputtimet), eivät minkään valmistajan tuotteita. **Lisää suuttimia tiedostosta…** lukee omia suuttimiasi (JSON-lista, jossa on kunkin suuttimen heitto, virtaus tai sadantanopeus sekä paineväli); ne tallennetaan projektin mukana. Valmistajan julkaistut tiedot tulevat mukaan vain sen valmistajan luvalla, jonka se on kirjannut.

Yleisten suuttimien alla luettelossa on **tyypilliset suuttimet** (niiden nimet päättyvät ”typical values”): kiinteiden suihkujen, pyörivien suuttimien ja hammasrattaisroottorien suutinkoot, mikrosuihkut, kuplakastelijat ja tiputtimet säteen, virtauksen ja paineväliltä. CadCraft laskee ne julkaistuista kaavoista (aukkoyhtälö virtaukselle, suihkun heiton skaalaus säteelle) ja nimellisistä virtausluokista, vain avoimista lähteistä; mitään valmistajan taulukkoa ei kopioida. Valitse yksi, niin valitsin näyttää sen perusteen ja lisenssin. Projekti, joka käyttää sitä, säilyttää suuttimen ja sen lähteen projektitiedostossa. Ne ovat suunnittelua varten: tarkista todellisen suuttimen omat tiedot ennen rakentamista.

---
title: Oma voimalinjakirjasto
summary: Tee omat johtimet, maakaapelit, tuet, laitteet ja kaivantotyypit nimeämissäsi kategorioissa ja jaa ne tiedostoina.
keywords: kirjasto, johdin, kaapeli, pylväs, tuki, poikkipalkki, eriste, kiinnike, ankkuri, vetoköysi, muuntaja, kaappi, liitos, kaivanto, kategoria, csv, tuo, vie
from: 88733744
---

Voimalinjatyötilan **Kirjasto**-osio sisältää kaikki kohteet, joita linja tai kaapeli voi käyttää. Mikään siinä ei ole sidottu maahan tai valmistajaan: tee itse ne kohteet, joita käytät.

## Kolme kohdetyyppiä

| Tyyppi | Missä se on | Voitko muuttaa sitä? |
|---|---|---|
| **Esimerkit** | Toimitetaan CivilCraftin mukana, yleisillä luvuilla, jotka laskimme materiaaliominaisuuksista | Ei: ensin {{ui:Kopioi omaan kirjastooni}} |
| **Projektissa** | Tuli avaamasi projektitiedoston mukana | Ei: ensin {{ui:Kopioi omaan kirjastooni}} |
| **Omat** | Omat kohteesi, tallennettuna tähän selaimeen | Kyllä, ja muutokset tallentuvat heti |

Jokainen projekti säilyttää kopion jokaisesta käyttämästään kohteesta, joten projekti aukeaa millä tahansa tietokoneella omine johtimineen ja pylväineen.

:::warning
Esimerkkikohteet ovat esimerkkejä: tarkista jokainen luku toimittajasi tiedoista. Maakaapeleilla ei ole virrankestoa tarkoituksella, koska se riippuu siitä, miten kaapeli on asennettu.
:::

## Tee kohde

1. **Kirjastossa** valitse **Tyyppi** (ilmajohtimet, maakaapelit, tuet, laitteet tai kaivantotyypit).
2. Napsauta {{ui:Uusi kohde}}, tai valitse esimerkki ja napsauta {{ui:Kopioi omaan kirjastooni}} tai {{ui:Monista}}.
3. Täytä sen kentät. Kentät, joissa on merkki `*`, ovat niitä, joita tarkistukset tarvitsevat. Kohde, josta puuttuu jokin, on merkitty `!` ja luetellaan kohdassa **Tarkistukset**, kun linja käyttää sitä.
4. Anna sille **Kategoria**, tasot erotettuina merkillä `/`: `Overhead/LV/Bundled`, `Supports/Concrete/12 m`. Puu seuraa omia kategorioitasi.

Kunkin tyypin tarvitsemat tiedot:

| Tyyppi | Tarkistuksiin tarvittava |
|---|---|
| Ilmajohdin | poikkipinta, halkaisija, massa metriä kohti, murtolujuus, kimmokerroin, lämpölaajeneminen |
| Maakaapeli | johtimet, poikkipinta, jännite, halkaisija, resistanssi, virrankesto |
| Tuki | kokonaispituus, nimelliskuorma (otettuna pisteestä yläpään alapuolella), syvyys maassa |
| Laite | sen tyyppi; poikkipalkkien, kiinnikkeiden ja ankkureiden nimelliskuorma; poikkipalkkien vaihevälys ja pudotus; eristimien pituus; ankkureiden kulma |
| Kaivantotyyppi | syvyys, leveys, peitto kaapelien päällä |

## Jaa se

- {{ui:Tallenna oma kirjastoni}} tallentaa kaikki omat kohteesi yhteen `.cclines.json`-tiedostoon. {{ui:Avaa kirjasto…}} lukee sen takaisin (samalla avaimella olevat kohteet korvataan).
- {{ui:Tallenna CSV:nä}} tallentaa katsomasi tyypin taulukkolaskentatiedostona. {{ui:Avaa kirjasto…}} lukee takaisin tällaisen CSV-tiedoston. Sarakkeet voivat olla missä tahansa järjestyksessä; puolipisteellä erotetussa tiedostossa voi olla desimaalipilkku.

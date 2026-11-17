---
title: Piirrä tontit ja kirjoita niiden oikeudelliset kuvaukset
summary: Piirrä tontti kulmapisteittäin tai syötä kauppakirjan linjat, tarkista, kuinka hyvin linjat sulkeutuvat, merkitse suuntakulmat ja etäisyydet suunnitelmaan, tee mistä tahansa linjasta kaari ja kopioi luonnos oikeudellisesta kuvauksesta.
keywords: tontit, tontti, kiinteistörajat, raja, kauppakirja, kiinteistötoimitus, mittaus, suuntakulma, etäisyys, sulkuvirhe, tarkkuus, oikeudellinen kuvaus, lähtöpiste, kaari, säde, pinta-ala, eekkeri
from: 6793d6ce
---

Tontit sijaitsevat suunnitelmalla. Jokaisella suoralla linjalla näkyy suuntakulma ja etäisyys (kaari näyttää säteensä, pituutensa ja keskuskulmansa), ja tontin nimi ja pinta-ala ovat keskellä. Ne menevät PDF-tulostukseen sekä DWG- ja DXF-vientiin tasoille `V-PROP` (viivat) ja `V-PROP-TEXT` (tekstit). Kaikki on kohdassa **Tontit** oikeassa paneelissa, kun mitään ei ole valittuna.

## Piirrä tontti

1. Napsauta **Piirrä tontti**.
2. Napsauta kulmapisteitä alkaen lähtöpisteestä. Napsautus lähellä mittauspistettä ottaa tuon pisteen tarkan paikan.
3. Napsauta ensimmäistä kulmapistettä uudelleen tai paina {{key:Enter}}, niin lopetat. {{key:Backspace}} poistaa viimeisen kulmapisteen; {{key:Esc}} hylkää tähän asti lisätyt kulmapisteet, ja sen painaminen uudelleen poistuu työkalusta.

## Syötä linjat kauppakirjasta

1. Napsauta **Syötä kauppakirjan linjat**.
2. Kerro, mistä linjat alkavat: mittauspisteen numero tai pohjoiskoordinaatti ja itäkoordinaatti.
3. Kirjoita tai liitä linjat, yksi per rivi:
   - suora: suuntakulma ja etäisyys, esimerkiksi `N 45°30'15" E 125.50`. Myös `N45-30-15E`, `N 45 30 15 E`, `N 45.5 E` ja atsimuutit (`AZ 45°30'15"`) toimivat, ja sanat ”thence”, pilkut ja ”feet” jätetään huomioimatta.
   - kaari: `C R 300 L 52.36 right` (säde ja kaaren pituus) tai `C R 300 D 10°00'00" left` (säde ja keskuskulma). Kaari jatkuu edellisestä linjasta; jos ei jatku, lisää sen jänteen suuntakulma: `C R 300 L 52.36 right CB N 50 00 00 E`.
   - `#` aloittaa kommenttirivin.
4. Kirjoittaessasi valintaikkuna näyttää linjojen pituuden, **sulkuvirheen** (kuinka kaukana alusta linjat päättyvät ja mihin suuntaan), **tarkkuuden** (pituus jaettuna sulkuvirheellä, 1 : 10,000 ja niin edelleen) sekä pinta-alan. Rivit, joita se ei pysty lukemaan, luetellaan rivinumeroineen.
5. Napsauta **Lisää tontti**. Kun linjat eivät sulkeudu, tontti sulkeutuu suoralla linjalla yli aukon: tarkista linjat kauppakirjaa vasten. Jos haluat jakaa kenttämittauksen virheen linjojen kesken, säädä sitä ensin.

## Kaaret

Tontin **Ominaisuudet**-kohdassa jokaisella linjalla on **Säde**. Kirjoita säde, niin linjasta tulee kaari samojen kahden kulmapisteen välille (liian pieni säde, alle puolet kulmapisteiden etäisyydestä, ei yllä perille, joten se hylätään). Valitse **Kaaret**-kohdassa **Oikea** tai **Vasen**: oikealle kaartuva kaari on keskipisteensä kulkusuunnan oikealla puolella, kuten kauppakirjassa. Tyhjennä säde, niin linja on taas suora. Jokainen muutos on yksi vaihe: {{key:Mod+Z}} kumoaa sen.

## Oikeudellinen kuvaus

Tontin **Ominaisuudet** päättyvät sen oikeudelliseen kuvaukseen, joka kirjoitetaan piirustuksen perusteella:

- ”Alkaa kohdasta” kirjoittamasi **Lähtöpiste** (esimerkiksi ”tontin 4 koillisnurkka”), muuten ensimmäisen kulmapisteen pohjoiskoordinaatti ja itäkoordinaatti tai mittauspiste, josta linjat alkoivat.
- ”sitten” jokainen linja: suuntakulma ja etäisyys, tai kaari säteineen, kaaren pituuksineen, keskuskulmineen sekä jänteen suuntakulmineen ja etäisyyksineen.
- ”Käsittää” pinta-alan neliöjalkoina ja eekkereinä (neliömetreinä ja hehtaareina metriprojektissa).

**Kopioi** laittaa kuvauksen leikepöydälle; **Lataa tekstinä** tallentaa sen `.txt`-tiedostona.

:::warning
Oikeudellinen kuvaus on luonnos piirustuksesta, ei mittausasiakirja. Valtuutetun mittausinsinöörin on tarkistettava se rekisteriä vasten ja allekirjoitettava ennen kuin kukaan luottaa siihen.
:::

Napsauta tonttia suunnitelmalla valitaksesi sen; {{key:Delete}} poistaa sen. Tontit tallentuvat projektitiedostoon.

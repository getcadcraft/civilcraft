---
title: Muokkaa mittauspistettä
summary: Muuta yhden pisteen numeroa, koordinaatteja, korkeutta tai kuvausta, tai vedä se uuteen paikkaan pohjakuvassa.
keywords: muokkaa pistettä, siirrä piste, muuta korkeutta, numeroi uudelleen, pisteen numero, kuvaus, vedä, pohjoinen, itä, korjaa piste, epäonnistunut mittaus
from: 375ae2e9
---

Epäonnistunut mittaus, väärä tähtäyskorkeus tai väärin kirjoitettu kuvaus: korjaa yksi piste, ja maastomalli seuraa perässä.

## Muuta pisteen arvoja

1. Valitse {{ui:Valitse}}-työkalulla piste pohjakuvasta. **Ominaisuudet** näyttää pisteen numeron, itä- ja pohjoiskoordinaatin, korkeuden ja kuvauksen omissa kentissään.
2. Kirjoita uusi arvo ja paina {{key:Enter}} (tai napsauta muualle). Jätä **Korkeus** tyhjäksi pisteelle, jolla ei ole korkeutta.
3. Maastomalli, korkeuskäyrät ja kaikki niiden varaan rakennettu päivittyvät heti.

Jokainen muutos on yksi vaihe: {{key:Mod+Z}} kumoaa sen ja {{key:Mod+Y}} tekee sen uudelleen. Arvo, jota CivilCraft ei voi käyttää (numero, jonka toinen piste jo käyttää, kirjaimet koordinaatissa), hylätään: ruutu korostetaan ja tilarivi kertoo syyn.

Uusi kuvauskoodi luo uuden pisteryhmän, kuten tuonti tekee (katso [Rakenna maastomalli](topic:build-surface)).

## Siirrä piste pohjakuvassa

1. Valitse piste (siihen tulee rengas).
2. Vedä rengasta. Tilarivi näyttää itä- ja pohjoiskoordinaatit, joihin piste on menossa.
3. Päästä irti siirtääksesi pisteen; sen korkeus säilyy. Paina {{key:Esc}} ennen irrottamista palauttaaksesi pisteen.

## Taitelinjat seuraavat pistettä

{{ui:Taitelinja}}-työkalulla piirretty taitelinja kopioi pisteet, joiden kautta se kulkee. Kun siirrät pistettä tai muutat sen korkeutta, taitelinjan kulmapisteet siirtyvät mukana samassa vaiheessa. Kuvauksista tehdyt taitelinjaryhmät rakennetaan aina uudelleen pisteistä.

:::note
LandXML-tiedostosta luettu maastomalli säilyttää omat kolmionsa: pistemuokkaukset muuttavat sitä vasta, kun käytät {{ui:Rakenna maastomalli uudelleen pisteistä}}.
:::
